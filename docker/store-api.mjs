import express from 'express';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const dataDir = process.env.DATA_DIR ?? '/data';
const storePath = join(dataDir, 'academy-store.json');
const geminiApiKey = process.env.GEMINI_API_KEY ?? '';
const geminiModel = process.env.GEMINI_MODEL ?? 'gemini-flash-lite-latest';
const aiAllowedRoles = new Set(['SUPERADMIN', 'TEACHER']);

const PSYCHOLOGY_AI_SYSTEM_PROMPT = `
Eres el asistente academico de MIND-SPHERE para profesores de psicologia.
Solo puedes ayudar a crear, mejorar o evaluar casos, escenarios, preguntas, feedback,
rubricas y rutas de analisis para formacion en psicologia.
No respondas preguntas medicas diagnosticas personalizadas, crisis reales, recetas,
codigo, politica, finanzas, entretenimiento ni temas fuera de la creacion educativa
de casos psicologicos. Si el usuario pide algo fuera del alcance, responde con una
negativa breve y redirige a crear un caso o escenario de psicologia.
Entrega contenido en espanol, con estructura clara y util para docentes.
`.trim();

const allowedTopicTerms = [
  'psicologia',
  'psicologico',
  'psicologica',
  'caso',
  'escenario',
  'situacion',
  'pregunta',
  'feedback',
  'rubrica',
  'evaluacion',
  'aprendizaje',
  'estudiante',
  'docente',
  'profesor',
  'maestro',
  'ansiedad',
  'depresion',
  'duelo',
  'crisis',
  'familia',
  'conducta',
  'emocion',
  'cognitivo',
  'clinico',
  'psicosocial',
  'etica',
  'intervencion',
  'terapia',
  'diagnostico',
  'salud mental',
  'bienestar',
];

const blockedTopicTerms = [
  'codigo',
  'programa',
  'hack',
  'receta',
  'cocina',
  'trading',
  'bitcoin',
  'apuesta',
  'politica',
  'marketing',
  'contrato',
  'demanda',
  'medicamento',
  'dosis',
];

app.use(express.json({ limit: '10mb' }));

async function readStore() {
  const raw = await readFile(storePath, 'utf8').catch((error) => {
    if (error?.code === 'ENOENT') return '';
    throw error;
  });
  return raw ? JSON.parse(raw) : null;
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isPsychologyAssistantRequest(message) {
  const normalized = normalizeText(message);
  const hasAllowedTopic = allowedTopicTerms.some((term) => normalized.includes(normalizeText(term)));
  const hasBlockedTopic = blockedTopicTerms.some((term) => normalized.includes(normalizeText(term)));
  return hasAllowedTopic && !hasBlockedTopic;
}

function buildGeminiPrompt({ message, context, user }) {
  return `
Usuario autorizado: ${user.name} (${user.role})
Contexto de pantalla: ${context || 'profesor'}

Solicitud:
${message}

Instrucciones de salida:
- Si crea un caso, incluye titulo, objetivo de aprendizaje, contexto, escenario, preguntas y feedback.
- Si crea preguntas, incluye categoria, tipo, opciones cuando aplique, respuesta esperada y retroalimentacion.
- Mantente dentro de casos y escenarios educativos de psicologia.
`.trim();
}

async function askGemini({ message, context, user }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    geminiModel,
  )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: PSYCHOLOGY_AI_SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildGeminiPrompt({ message, context, user }) }],
        },
      ],
      generationConfig: {
        temperature: 0.55,
        topP: 0.9,
        maxOutputTokens: 1600,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = payload?.error?.message ? `: ${payload.error.message}` : '';
    const error = new Error(`Gemini request failed${detail}`);
    error.statusCode = response.status === 429 ? 429 : 502;
    error.publicMessage =
      response.status === 429
        ? 'Gemini no tiene cuota disponible para este modelo o proyecto. Revisa el plan, facturacion o limites de la API.'
        : 'Gemini no pudo responder con la configuracion actual. Revisa el modelo y la llave configurada.';
    throw error;
  }

  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() || ''
  );
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/store', async (_req, res, next) => {
  try {
    res.json(await readStore());
  } catch (error) {
    next(error);
  }
});

app.post('/api/ai/teacher-assistant', async (req, res, next) => {
  try {
    const { userId, message, context } = req.body ?? {};

    if (typeof userId !== 'string' || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Invalid AI assistant payload' });
      return;
    }

    const store = await readStore();
    const user = store?.users?.find((candidate) => candidate.id === userId && candidate.status === 'ACTIVE');

    if (!user || !aiAllowedRoles.has(user.role)) {
      res.status(403).json({ error: 'AI assistant is available only for super admin and teachers' });
      return;
    }

    if (!isPsychologyAssistantRequest(message)) {
      res.status(400).json({
        blocked: true,
        message:
          'Solo puedo ayudarte a crear casos, escenarios, preguntas o feedback para psicologia academica.',
      });
      return;
    }

    if (!geminiApiKey) {
      res.status(503).json({
        error: 'Gemini API key is not configured',
        message: 'Configura GEMINI_API_KEY en el archivo .env y reinicia el backend.',
      });
      return;
    }

    const text = await askGemini({
      message: message.trim(),
      context: typeof context === 'string' ? context : '',
      user,
    });

    res.json({ text });
  } catch (error) {
    next(error);
  }
});

app.put('/api/store', async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'Invalid store payload' });
      return;
    }

    await mkdir(dirname(storePath), { recursive: true });
    const tmpPath = `${storePath}.${Date.now()}.tmp`;
    await writeFile(tmpPath, `${JSON.stringify(req.body, null, 2)}\n`, 'utf8');
    await rename(tmpPath, storePath);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error?.statusCode ?? 500).json({
    error: error?.publicMessage ?? 'Store API error',
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Store API listening on port ${port}, data file: ${storePath}`);
});
