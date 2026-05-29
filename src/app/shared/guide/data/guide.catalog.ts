import { Question, QuestionCategory, QuestionType, Scenario } from '../../../models/academy.models';

export type GuideContext =
  | 'login_welcome'
  | 'loader'
  | 'onboarding_welcome'
  | 'onboarding_avatar'
  | 'onboarding_nickname'
  | 'onboarding_complete'
  | 'student_groups'
  | 'student_tasks'
  | 'student_task'
  | 'student_question'
  | 'student_hint';

export type GuideMood = 'idle' | 'happy' | 'thinking' | 'encourage';

export interface GuideMessage {
  text: string;
  mood?: GuideMood;
}

export const GUIDE_MESSAGES: Record<GuideContext, GuideMessage> = {
  login_welcome: {
    text: 'Soy GARY, tu guía mental. Inicia sesión y te acompañaré en cada misión de MIND-SPHERE.',
    mood: 'happy',
  },
  loader: {
    text: 'Conectando con el servidor neural...',
    mood: 'thinking',
  },
  onboarding_welcome: {
    text: '¡Acceso confirmado! Ahora crea tu personaje: elige héroe y nickname antes de entrar a las misiones.',
    mood: 'happy',
  },
  onboarding_avatar: {
    text: 'Elige tu héroe. Cada personaje tiene un estilo clínico distinto — como en un roster de videojuego.',
    mood: 'encourage',
  },
  onboarding_nickname: {
    text: 'Tu nickname aparecerá en misiones, progreso y rankings. Elige algo memorable.',
    mood: 'encourage',
  },
  onboarding_complete: {
    text: '¡Perfil listo! Tu aventura psicológica comienza ahora. Te acompañaré en cada caso.',
    mood: 'happy',
  },
  student_groups: {
    text: 'Selecciona un grupo para ver las misiones que tu profesor activó para ti.',
    mood: 'idle',
  },
  student_tasks: {
    text: 'Cada tarea es un caso clínico simulado. Empieza por la que tenga mayor prioridad.',
    mood: 'thinking',
  },
  student_task: {
    text: 'Estás en una misión clínica. Explora el mapa mental y avanza zona por zona.',
    mood: 'encourage',
  },
  student_question: {
    text: 'Analiza la pregunta antes de responder. Si necesitas orientación, pide una pista — nunca te daré la respuesta directa.',
    mood: 'thinking',
  },
  student_hint: {
    text: 'Recuerda: piensa en el enfoque psicológico, no solo en la opción más obvia.',
    mood: 'encourage',
  },
};

const CATEGORY_HINTS: Record<QuestionCategory, string[]> = {
  TECHNICAL: [
    'Revisa conceptos técnicos del caso: evaluación, diagnóstico diferencial o instrumentos válidos.',
    'Pregúntate qué evidencia clínica respalda cada alternativa antes de elegir.',
  ],
  ETHICAL: [
    'Prioriza autonomía, confidencialidad y no maleficencia en tu razonamiento.',
    'Piensa en el deber profesional y los límites de tu rol en este escenario.',
  ],
  NORMATIVE: [
    'Considera marcos legales, protocolos institucionales y rutas de derivación.',
    '¿Qué normativa o guía clínica aplica a este tipo de situación?',
  ],
  PSYCHOSOCIAL: [
    'Observa factores familiares, comunitarios y de apoyo en el contexto del caso.',
    'Evalúa recursos psicosociales disponibles y barreras de acceso.',
  ],
  CARE_ROUTE: [
    'Identifica el nivel de urgencia y la ruta de atención más segura para la persona.',
    'Piensa en coordinación interinstitucional: salud, protección, justicia.',
  ],
};

const TYPE_HINTS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Descarta opciones que ignoren el contexto completo del caso.',
  TRUE_FALSE: 'Verifica si la afirmación es absoluta; en clínica, raramente todo es blanco o negro.',
  OPEN: 'Organiza tu respuesta: observación, hipótesis, intervención y seguimiento.',
  PSYCH_ANALYSIS: 'Integra biopsicosocial: síntomas, contexto, factores protectores y de riesgo.',
  DECISION: 'Imagina las consecuencias de cada decisión para la persona y el equipo.',
};

export function hintsForQuestion(question: Question, scenario?: Scenario): string[] {
  const base = CATEGORY_HINTS[question.category] ?? [];
  const typeHint = TYPE_HINTS[question.questionType];
  const scenarioHint = scenario
    ? [`Escenario «${scenario.title}»: ${scenario.instructions || 'relaciona tu respuesta con el contexto presentado.'}`]
    : [];
  return [...base, typeHint, ...scenarioHint].filter(Boolean);
}

export function hintsForSituation(context: string): string {
  return context.length > 120 ? 'Resume mentalmente: ¿cuál es el riesgo principal y quién necesita protección?' : 'Lee el contexto dos veces: hechos, emociones y recursos disponibles.';
}
