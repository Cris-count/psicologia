import { TeacherAvatarId } from '../../../models/academy.models';

/** Imagen fija del perfil docente (sin selector de personaje). */
export const TEACHER_PROFILE_PORTRAIT = '/assets/avatars/teachers/teacher-profile.png';

export interface TeacherTrait {
  label: string;
  description: string;
  color: string;
}

export interface TeacherAvatarOption {
  id: TeacherAvatarId;
  /** Solo uso interno / accesibilidad; el docente define el nombre visible. */
  label: string;
  slot: number;
  gender: 'F' | 'M';
  roleTitle: string;
  bio: string;
  quote: string;
  accent: string;
  cardBg: string;
  thumbUrl: string;
  portraitUrl: string;
  traits: TeacherTrait[];
  gallery: boolean;
}

export const TEACHER_AVATAR_CATALOG: TeacherAvatarOption[] = [
  {
    id: 'teach-valentina',
    label: 'Estilo 1',
    slot: 1,
    gender: 'F',
    roleTitle: 'Profesora de Psicología Social',
    bio: 'Acompaña a sus estudiantes con empatía y rigor, conectando teoría y práctica en contextos reales.',
    quote: 'Las personas no solo somos individuos, somos parte de algo más grande: la sociedad.',
    accent: '#9b6fd9',
    cardBg: '#4a2a7a',
    thumbUrl: '/assets/avatars/teachers/clean/teach-valentina.png',
    portraitUrl: '/assets/avatars/teachers/clean/teach-valentina.png',
    gallery: false,
    traits: [
      { label: 'Empática', description: 'Comprende y valora a cada estudiante.', color: '#9b6fd9' },
      { label: 'Comunicativa', description: 'Explica con claridad y escucha activa.', color: '#3ab8a8' },
      { label: 'Motivadora', description: 'Impulsa tu curiosidad y crecimiento.', color: '#5aaa5a' },
      { label: 'Guía', description: 'Te acompaña en tu aprendizaje con respeto y confianza.', color: '#e8c832' },
    ],
  },
  {
    id: 'teach-camila',
    label: 'Estilo 2',
    slot: 2,
    gender: 'F',
    roleTitle: 'Profesora de Psicología Social',
    bio: 'Integra herramientas digitales y metodologías participativas en el aula.',
    quote: 'Aprender en comunidad transforma la manera en que entendemos al otro.',
    accent: '#6b8cff',
    cardBg: '#2a4a8a',
    thumbUrl: '/assets/avatars/teachers/clean/teach-camila.png',
    portraitUrl: '/assets/avatars/teachers/clean/teach-camila.png',
    gallery: true,
    traits: [
      { label: 'Organizada', description: 'Estructura el aprendizaje paso a paso.', color: '#6b8cff' },
      { label: 'Cercana', description: 'Facilita espacios de diálogo seguro.', color: '#3ab8a8' },
      { label: 'Innovadora', description: 'Usa recursos actuales y accesibles.', color: '#9b6fd9' },
      { label: 'Guía', description: 'Orienta con paciencia y claridad.', color: '#e8c832' },
    ],
  },
  {
    id: 'teach-andres',
    label: 'Estilo 3',
    slot: 3,
    gender: 'M',
    roleTitle: 'Profesor de Psicología Social',
    bio: 'Promueve el pensamiento crítico sobre dinámicas grupales y cultura organizacional.',
    quote: 'Cada grupo cuenta una historia que merece ser escuchada con atención.',
    accent: '#4ab84a',
    cardBg: '#2a5a2a',
    thumbUrl: '/assets/avatars/teachers/clean/teach-andres.png',
    portraitUrl: '/assets/avatars/teachers/clean/teach-andres.png',
    gallery: true,
    traits: [
      { label: 'Analítico', description: 'Descompone fenómenos sociales con precisión.', color: '#4ab84a' },
      { label: 'Paciente', description: 'Da tiempo para reflexionar y debatir.', color: '#6b8cff' },
      { label: 'Motivador', description: 'Desafía con respeto y altas expectativas.', color: '#e89040' },
      { label: 'Guía', description: 'Acompaña el proceso de aprendizaje.', color: '#e8c832' },
    ],
  },
  {
    id: 'teach-isabella',
    label: 'Estilo 4',
    slot: 4,
    gender: 'F',
    roleTitle: 'Profesora de Psicología Social',
    bio: 'Conecta la evidencia científica con situaciones cotidianas de convivencia.',
    quote: 'La empatía es una habilidad que se entrena en el día a día.',
    accent: '#e86aa8',
    cardBg: '#6e2a5a',
    thumbUrl: '/assets/avatars/teachers/clean/teach-isabella.png',
    portraitUrl: '/assets/avatars/teachers/clean/teach-isabella.png',
    gallery: true,
    traits: [
      { label: 'Empática', description: 'Valida experiencias diversas en el aula.', color: '#e86aa8' },
      { label: 'Clara', description: 'Traduce conceptos complejos a ejemplos vivos.', color: '#3ab8a8' },
      { label: 'Cuidadosa', description: 'Prioriza el bienestar del grupo.', color: '#9b6fd9' },
      { label: 'Guía', description: 'Sostiene un ambiente de confianza.', color: '#e8c832' },
    ],
  },
  {
    id: 'teach-sebastian',
    label: 'Estilo 5',
    slot: 5,
    gender: 'M',
    roleTitle: 'Profesor de Psicología Social',
    bio: 'Fomenta el debate ético y la observación de interacciones en contextos reales.',
    quote: 'Observar sin juzgar es el primer paso para intervenir con sentido.',
    accent: '#e89040',
    cardBg: '#6e4a20',
    thumbUrl: '/assets/avatars/teachers/clean/teach-sebastian.png',
    portraitUrl: '/assets/avatars/teachers/clean/teach-sebastian.png',
    gallery: true,
    traits: [
      { label: 'Reflexivo', description: 'Invita a cuestionar supuestos comunes.', color: '#e89040' },
      { label: 'Cercano', description: 'Mantiene un trato humano y accesible.', color: '#6b8cff' },
      { label: 'Riguroso', description: 'Exige argumentos bien fundamentados.', color: '#4ab84a' },
      { label: 'Guía', description: 'Modela escucha y respeto mutuo.', color: '#e8c832' },
    ],
  },
  {
    id: 'teach-maria',
    label: 'Estilo 6',
    slot: 6,
    gender: 'F',
    roleTitle: 'Profesora de Psicología Social',
    bio: 'Diseña experiencias de aprendizaje colaborativo con foco en inclusión.',
    quote: 'Diversidad de voces enriquece cada análisis que hacemos juntos.',
    accent: '#d05090',
    cardBg: '#5a2a4a',
    thumbUrl: '/assets/avatars/teachers/clean/teach-maria.png',
    portraitUrl: '/assets/avatars/teachers/clean/teach-maria.png',
    gallery: true,
    traits: [
      { label: 'Inclusiva', description: 'Asegura participación de todos los perfiles.', color: '#d05090' },
      { label: 'Comunicativa', description: 'Facilita acuerdos y síntesis grupales.', color: '#3ab8a8' },
      { label: 'Motivadora', description: 'Celebra avances y aprendizajes.', color: '#5aaa5a' },
      { label: 'Guía', description: 'Acompaña con calidez profesional.', color: '#e8c832' },
    ],
  },
  {
    id: 'teach-tomas',
    label: 'Estilo 7',
    slot: 7,
    gender: 'M',
    roleTitle: 'Profesor de Psicología Social',
    bio: 'Vincula la psicología social con retos comunitarios y proyectos aplicados.',
    quote: 'Lo social se aprende mejor cuando lo vivimos y lo analizamos.',
    accent: '#4a6fd4',
    cardBg: '#2a3a7a',
    thumbUrl: '/assets/avatars/teachers/clean/teach-tomas.png',
    portraitUrl: '/assets/avatars/teachers/clean/teach-tomas.png',
    gallery: true,
    traits: [
      { label: 'Práctico', description: 'Lleva la teoría a ejercicios concretos.', color: '#4a6fd4' },
      { label: 'Cercano', description: 'Genera vínculo con cercanía profesional.', color: '#3ab8a8' },
      { label: 'Motivador', description: 'Impulsa proyectos con impacto real.', color: '#e89040' },
      { label: 'Guía', description: 'Orienta con experiencia y humildad.', color: '#e8c832' },
    ],
  },
];

export const DEFAULT_TEACHER_AVATAR_ID: TeacherAvatarId = 'teach-valentina';

export const TEACHER_GALLERY = TEACHER_AVATAR_CATALOG;

export function normalizeTeacherAvatarId(id: string | undefined): TeacherAvatarId {
  if (!id) return DEFAULT_TEACHER_AVATAR_ID;
  if (TEACHER_AVATAR_CATALOG.some((a) => a.id === id)) return id as TeacherAvatarId;
  return DEFAULT_TEACHER_AVATAR_ID;
}

export function teacherAvatarById(id: TeacherAvatarId | string | undefined): TeacherAvatarOption {
  const normalized = normalizeTeacherAvatarId(id);
  return TEACHER_AVATAR_CATALOG.find((a) => a.id === normalized) ?? TEACHER_AVATAR_CATALOG[0];
}
