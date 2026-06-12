import express from 'express';
import nodemailer from 'nodemailer';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const dataDir = process.env.DATA_DIR ?? '/data';
const storePath = join(dataDir, 'academy-store.json');
const geminiApiKey = process.env.GEMINI_API_KEY ?? '';
const geminiModel = process.env.GEMINI_MODEL ?? 'gemini-flash-lite-latest';
const appPublicUrl = process.env.APP_PUBLIC_URL ?? 'http://localhost:4200';
const smtpHost = process.env.SMTP_HOST ?? '';
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER ?? '';
const smtpPass = process.env.SMTP_PASS ?? '';
const smtpFrom = process.env.SMTP_FROM ?? smtpUser;
const aiAllowedRoles = new Set(['SUPERADMIN', 'TEACHER']);
const gradeAllowedRoles = new Set(['SUPERADMIN', 'TEACHER', 'STUDENT']);

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
  if (!raw) return null;
  const store = JSON.parse(raw);
  return processExpiredSessionsInStore(store);
}

/** REQ-14 — cierra sesiones 24 h después del plazo. */
function processExpiredSessionsInStore(store) {
  if (!store?.taskSessions?.length) return store;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let changed = false;
  const taskSessions = store.taskSessions.map((session) => {
    if (session.status === 'FINISHED') return session;
    const end = new Date(session.scheduledEndAt).getTime();
    if (Number.isFinite(end) && now > end + dayMs) {
      changed = true;
      return {
        ...session,
        status: 'FINISHED',
        finishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return session;
  });
  return changed ? { ...store, taskSessions } : store;
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

function extractJsonFromText(text) {
  if (!text) return null;
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? text.trim();
  const start = candidate.search(/[\[{]/);
  if (start < 0) return null;
  const slice = candidate.slice(start);
  const endBrace = slice.lastIndexOf('}');
  const endBracket = slice.lastIndexOf(']');
  const end = Math.max(endBrace, endBracket);
  if (end < 0) return null;
  try {
    return JSON.parse(slice.slice(0, end + 1));
  } catch {
    return null;
  }
}

function pdfBase64FromDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return '';
  const comma = dataUrl.indexOf(',');
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

async function askGeminiParts({ systemPrompt, parts, temperature = 0.35, maxOutputTokens = 2400 }) {
  if (!geminiApiKey) {
    const error = new Error('Gemini API key is not configured');
    error.statusCode = 503;
    error.publicMessage = 'Configura GEMINI_API_KEY en el archivo .env y reinicia el backend.';
    throw error;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    geminiModel,
  )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature, topP: 0.9, maxOutputTokens },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message ? `: ${payload.error.message}` : '';
    const error = new Error(`Gemini request failed${detail}`);
    error.statusCode = response.status === 429 ? 429 : 502;
    error.publicMessage =
      response.status === 429
        ? 'Gemini no tiene cuota disponible para este modelo o proyecto.'
        : 'Gemini no pudo procesar la solicitud. Revisa el modelo y la llave configurada.';
    throw error;
  }

  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() || ''
  );
}

const RUBRIC_PARSE_PROMPT = `
Analiza el PDF de rúbrica de evaluación psicológica/académica adjunto.
Extrae los criterios de evaluación con nombre, descripción y peso porcentual.
Responde SOLO con JSON válido (sin markdown) con esta forma:
{
  "criterios": [
    {
      "id": "c1",
      "nombre": "Identificación del problema",
      "descripcion": "Reconoce señales y prioridades de intervención",
      "peso": 25,
      "niveles": [
        { "nivel": "Insuficiente", "puntaje": 1, "descriptor": "..." },
        { "nivel": "Aceptable", "puntaje": 3, "descriptor": "..." },
        { "nivel": "Excelente", "puntaje": 5, "descriptor": "..." }
      ]
    }
  ]
}
Los pesos deben sumar 100. Mínimo 3 criterios. Todo en español.
`.trim();

const RUBRIC_GRADE_PROMPT = `
Eres evaluador académico de MIND-SPHERE (psicología).
Califica al estudiante usando EXCLUSIVAMENTE los criterios de la rúbrica provista.
La nota final debe estar entre 1.0 y 5.0 (un decimal).
Responde SOLO con JSON válido (sin markdown):
{
  "notaFinal": 4.2,
  "retroalimentacion": "Resumen general en 2-4 oraciones",
  "criterios": [
    {
      "criterioId": "c1",
      "nombre": "Nombre del criterio",
      "puntaje": 4.0,
      "maxPuntaje": 5,
      "comentario": "Justificación breve"
    }
  ]
}
Fundamenta cada criterio según las respuestas del estudiante y la rúbrica.
`.trim();

let mailTransportPromise;

async function getMailTransport() {
  if (!smtpHost) return null;
  if (!smtpUser || !smtpPass) {
    const error = new Error('SMTP credentials are not configured');
    error.statusCode = 503;
    error.publicMessage =
      'Completa SMTP_USER y SMTP_PASS en .env (Gmail: contraseña de aplicación, no la clave normal).';
    throw error;
  }
  if (!mailTransportPromise) {
    mailTransportPromise = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }
  return mailTransportPromise;
}

function buildEmailHtml(subject, body, type) {
  const safeBody = String(body ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 12px;line-height:1.5;">${line.replace(/</g, '&lt;')}</p>`)
    .join('');
  return `<!DOCTYPE html><html><body style="font-family:Segoe UI,Arial,sans-serif;background:#0b0618;color:#e8e4ff;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#12082a;border:1px solid #3d2a7a;border-radius:12px;padding:24px;">
<h1 style="margin:0 0 8px;font-size:18px;color:#9b5cff;">MIND-SPHERE</h1>
<p style="margin:0 0 16px;font-size:13px;color:#a89fd4;text-transform:uppercase;letter-spacing:0.08em;">${type ?? 'Notificación'}</p>
<h2 style="margin:0 0 16px;font-size:20px;color:#fff;">${subject.replace(/</g, '&lt;')}</h2>
${safeBody}
<p style="margin:24px 0 0;"><a href="${appPublicUrl}/login" style="color:#4fc3ff;">Ingresar a MIND-SPHERE</a></p>
</div></body></html>`;
}

async function sendNotificationEmail({ to, subject, body, type }) {
  const transport = await getMailTransport();
  if (!transport) {
    const error = new Error('SMTP is not configured');
    error.statusCode = 503;
    error.publicMessage =
      'SMTP no configurado. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y SMTP_FROM en .env';
    throw error;
  }
  await transport.sendMail({
    from: smtpFrom || smtpUser,
    to,
    subject: `[MIND-SPHERE] ${subject}`,
    text: `${subject}\n\n${body}\n\nIngresa: ${appPublicUrl}/login`,
    html: buildEmailHtml(subject, body, type),
  });
}

function normalizeDocumentId(value) {
  return String(value ?? '')
    .trim()
    .replace(/[\s.\-]/g, '')
    .toLowerCase();
}

function resolveUserFromCredentials(store, email, credential) {
  if (!store?.users?.length) return null;
  const normalizedEmail = String(email ?? '')
    .trim()
    .toLowerCase();
  const trimmedCredential = String(credential ?? '').trim();
  if (!normalizedEmail || !trimmedCredential) return null;

  const user = store.users.find(
    (candidate) => candidate.email?.toLowerCase() === normalizedEmail && candidate.status === 'ACTIVE',
  );
  if (!user) return null;

  if (user.role === 'STUDENT') {
    const profile = store.studentProfiles?.find((item) => item.userId === user.id);
    if (!profile || normalizeDocumentId(profile.code) !== normalizeDocumentId(trimmedCredential)) {
      return null;
    }
    return user;
  }

  return user.password === trimmedCredential ? user : null;
}

const loginOtpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;

function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function purgeExpiredOtps() {
  const now = Date.now();
  for (const [key, entry] of loginOtpStore.entries()) {
    if (entry.expiresAt <= now) loginOtpStore.delete(key);
  }
}

app.post('/api/auth/request-verification', async (req, res, next) => {
  try {
    const { email, credential } = req.body ?? {};
    if (typeof email !== 'string' || typeof credential !== 'string' || !email.trim() || !credential.trim()) {
      res.status(400).json({ error: 'Correo y credencial son obligatorios.' });
      return;
    }

    const store = await readStore();
    const user = resolveUserFromCredentials(store, email, credential);
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    purgeExpiredOtps();
    const code = createOtpCode();
    const key = email.trim().toLowerCase();
    loginOtpStore.set(key, {
      code,
      userId: user.id,
      expiresAt: Date.now() + OTP_TTL_MS,
    });

    await sendNotificationEmail({
      to: user.email,
      subject: 'Código de verificación de acceso',
      body: `Hola ${user.name},\n\nTu código de verificación para ingresar a MIND-SPHERE es:\n\n${code}\n\nVálido por 10 minutos.\n\nSi no solicitaste este acceso, ignora este mensaje.`,
      type: 'Verificación de acceso',
    });

    res.json({
      ok: true,
      message: `Enviamos un código de verificación a ${user.email}.`,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/verify-code', async (req, res, next) => {
  try {
    const { email, code } = req.body ?? {};
    if (typeof email !== 'string' || typeof code !== 'string' || !email.trim() || !code.trim()) {
      res.status(400).json({ error: 'Correo y código son obligatorios.' });
      return;
    }

    purgeExpiredOtps();
    const key = email.trim().toLowerCase();
    const entry = loginOtpStore.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      loginOtpStore.delete(key);
      res.status(401).json({ error: 'El código expiró. Solicita uno nuevo.' });
      return;
    }

    if (entry.code !== String(code).trim()) {
      res.status(401).json({ error: 'Código de verificación incorrecto.' });
      return;
    }

    loginOtpStore.delete(key);
    res.json({ ok: true, userId: entry.userId });
  } catch (error) {
    next(error);
  }
});

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

app.post('/api/notifications/send', async (req, res, next) => {
  try {
    const { to, subject, body, type } = req.body ?? {};
    if (typeof to !== 'string' || !to.includes('@') || typeof subject !== 'string' || !subject.trim()) {
      res.status(400).json({ error: 'Invalid notification payload' });
      return;
    }
    await sendNotificationEmail({
      to: to.trim().toLowerCase(),
      subject: subject.trim(),
      body: typeof body === 'string' ? body : '',
      type: typeof type === 'string' ? type : 'Notificación',
    });
    res.json({ ok: true, sentAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/rubric/parse', async (req, res, next) => {
  try {
    const { userId, pdfDataUrl } = req.body ?? {};
    if (typeof userId !== 'string' || typeof pdfDataUrl !== 'string' || !pdfDataUrl.startsWith('data:')) {
      res.status(400).json({ error: 'Invalid rubric parse payload' });
      return;
    }

    const store = await readStore();
    const user = store?.users?.find((candidate) => candidate.id === userId && candidate.status === 'ACTIVE');
    if (!user || !aiAllowedRoles.has(user.role)) {
      res.status(403).json({ error: 'Solo docentes pueden procesar rúbricas' });
      return;
    }

    const base64 = pdfBase64FromDataUrl(pdfDataUrl);
    if (!base64) {
      res.status(400).json({ error: 'PDF inválido' });
      return;
    }

    const text = await askGeminiParts({
      systemPrompt: PSYCHOLOGY_AI_SYSTEM_PROMPT,
      parts: [
        { inline_data: { mime_type: 'application/pdf', data: base64 } },
        { text: RUBRIC_PARSE_PROMPT },
      ],
      maxOutputTokens: 3200,
    });

    const parsed = extractJsonFromText(text);
    const criterios = Array.isArray(parsed?.criterios) ? parsed.criterios : Array.isArray(parsed) ? parsed : null;
    if (!criterios?.length) {
      res.status(422).json({
        error: 'No se pudieron extraer criterios del PDF',
        raw: text.slice(0, 500),
      });
      return;
    }

    const normalized = criterios.map((item, index) => ({
      id: String(item.id ?? `c${index + 1}`),
      nombre: String(item.nombre ?? item.name ?? `Criterio ${index + 1}`).trim(),
      descripcion: String(item.descripcion ?? item.description ?? '').trim(),
      peso: Number(item.peso ?? item.weight ?? 0) || Math.round(100 / criterios.length),
      niveles: Array.isArray(item.niveles)
        ? item.niveles.map((n) => ({
            nivel: String(n.nivel ?? n.level ?? ''),
            puntaje: Number(n.puntaje ?? n.score ?? 0),
            descriptor: String(n.descriptor ?? n.description ?? ''),
          }))
        : undefined,
    }));

    res.json({ criterios: normalized, parsedAt: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/rubric/grade', async (req, res, next) => {
  try {
    const { userId, casoTitulo, casoContexto, criterios, respuestas } = req.body ?? {};
    if (
      typeof userId !== 'string' ||
      !Array.isArray(criterios) ||
      !criterios.length ||
      !Array.isArray(respuestas)
    ) {
      res.status(400).json({ error: 'Invalid rubric grade payload' });
      return;
    }

    const store = await readStore();
    const user = store?.users?.find((candidate) => candidate.id === userId && candidate.status === 'ACTIVE');
    if (!user || !gradeAllowedRoles.has(user.role)) {
      res.status(403).json({ error: 'Usuario no autorizado para calificar' });
      return;
    }

    const prompt = `${RUBRIC_GRADE_PROMPT}

Caso: ${casoTitulo ?? 'Sin título'}
Contexto: ${casoContexto ?? 'Sin contexto'}

Criterios de rúbrica:
${JSON.stringify(criterios, null, 2)}

Respuestas del estudiante:
${JSON.stringify(respuestas, null, 2)}
`;

    const text = await askGeminiParts({
      systemPrompt: PSYCHOLOGY_AI_SYSTEM_PROMPT,
      parts: [{ text: prompt }],
      temperature: 0.25,
      maxOutputTokens: 2800,
    });

    const parsed = extractJsonFromText(text);
    const notaFinal = Number(parsed?.notaFinal);
    if (!Number.isFinite(notaFinal) || notaFinal < 1 || notaFinal > 5) {
      res.status(422).json({ error: 'Calificación inválida devuelta por IA', raw: text.slice(0, 500) });
      return;
    }

    res.json({
      notaFinal: Math.round(notaFinal * 10) / 10,
      retroalimentacion: String(parsed.retroalimentacion ?? '').trim() || 'Evaluación completada según la rúbrica.',
      criterios: Array.isArray(parsed.criterios) ? parsed.criterios : [],
      metodo: 'rubrica',
    });
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

    const normalized = processExpiredSessionsInStore(req.body);
    await mkdir(dirname(storePath), { recursive: true });
    const tmpPath = `${storePath}.${Date.now()}.tmp`;
    await writeFile(tmpPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
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
  if (!smtpHost) {
    console.warn('SMTP not configured — email notifications will fail until SMTP_* env vars are set');
  } else {
    console.log(`SMTP configured: ${smtpHost}:${smtpPort}`);
  }
});
