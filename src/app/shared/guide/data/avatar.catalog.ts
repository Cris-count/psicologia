import { AvatarId } from '../../../models/academy.models';

export interface AvatarOption {
  id: AvatarId;
  /** Solo uso interno / accesibilidad; el jugador define el nombre visible. */
  label: string;
  slot: number;
  className: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC';
  theme: string;
  gradient: string;
  glow: string;
  accent: string;
  cardBg: string;
  thumbUrl: string;
}

export const AVATAR_CATALOG: AvatarOption[] = [
  {
    id: 'psych-alejandro',
    label: 'Personaje 1',
    slot: 1,
    className: 'Psicólogo clínico',
    rarity: 'COMMON',
    theme: 'Evaluación y diagnóstico',
    gradient: 'linear-gradient(165deg, #1a4a8a 0%, #3b6fd4 55%, #0d1f3d 100%)',
    glow: 'rgba(59, 111, 212, 0.45)',
    accent: '#3b6fd4',
    cardBg: '#2a5cb8',
    thumbUrl: '/assets/avatars/psych/clean/psych-alejandro.png',
  },
  {
    id: 'psych-valeria',
    label: 'Personaje 2',
    slot: 2,
    className: 'Psicóloga de campo',
    rarity: 'COMMON',
    theme: 'Intervención psicosocial',
    gradient: 'linear-gradient(165deg, #4a1f6e 0%, #9b5fd9 50%, #1a1535 100%)',
    glow: 'rgba(155, 95, 217, 0.42)',
    accent: '#9b5fd9',
    cardBg: '#7b3fbf',
    thumbUrl: '/assets/avatars/psych/clean/psych-valeria.png',
  },
  {
    id: 'psych-mateo',
    label: 'Personaje 3',
    slot: 3,
    className: 'Analista cognitivo',
    rarity: 'COMMON',
    theme: 'Procesos mentales y reflexión',
    gradient: 'linear-gradient(165deg, #6e1a1a 0%, #c94a4a 50%, #2a1010 100%)',
    glow: 'rgba(201, 74, 74, 0.42)',
    accent: '#c94a4a',
    cardBg: '#b83838',
    thumbUrl: '/assets/avatars/psych/clean/psych-mateo.png',
  },
  {
    id: 'psych-sofia',
    label: 'Personaje 4',
    slot: 4,
    className: 'Estratega clínica',
    rarity: 'COMMON',
    theme: 'Toma de decisiones complejas',
    gradient: 'linear-gradient(165deg, #6e5a00 0%, #e8c832 50%, #2a2200 100%)',
    glow: 'rgba(232, 200, 50, 0.45)',
    accent: '#e8c832',
    cardBg: '#d4b020',
    thumbUrl: '/assets/avatars/psych/clean/psych-sofia.png',
  },
  {
    id: 'psych-daniel',
    label: 'Personaje 5',
    slot: 5,
    className: 'Registrador clínico',
    rarity: 'COMMON',
    theme: 'Documentación y seguimiento',
    gradient: 'linear-gradient(165deg, #0f4a4a 0%, #3ab8a8 50%, #0a1f1f 100%)',
    glow: 'rgba(58, 184, 168, 0.42)',
    accent: '#3ab8a8',
    cardBg: '#2a9890',
    thumbUrl: '/assets/avatars/psych/clean/psych-daniel.png',
  },
  {
    id: 'psych-isabella',
    label: 'Personaje 6',
    slot: 6,
    className: 'Psicóloga digital',
    rarity: 'COMMON',
    theme: 'Herramientas y tecnología',
    gradient: 'linear-gradient(165deg, #6e1a4a 0%, #e86aa8 50%, #2a1020 100%)',
    glow: 'rgba(232, 106, 168, 0.42)',
    accent: '#e86aa8',
    cardBg: '#d05090',
    thumbUrl: '/assets/avatars/psych/clean/psych-isabella.png',
  },
  {
    id: 'psych-simon',
    label: 'Personaje 7',
    slot: 7,
    className: 'Psicólogo social',
    rarity: 'COMMON',
    theme: 'Dinámicas grupales',
    gradient: 'linear-gradient(165deg, #1a4a1a 0%, #4ab84a 50%, #0a1f0a 100%)',
    glow: 'rgba(74, 184, 74, 0.42)',
    accent: '#4ab84a',
    cardBg: '#389838',
    thumbUrl: '/assets/avatars/psych/clean/psych-simon.png',
  },
  {
    id: 'psych-camila',
    label: 'Personaje 8',
    slot: 8,
    className: 'Coordinadora de casos',
    rarity: 'COMMON',
    theme: 'Organización y protocolos',
    gradient: 'linear-gradient(165deg, #1a2a6e 0%, #4a6fd4 50%, #0d1535 100%)',
    glow: 'rgba(74, 111, 212, 0.42)',
    accent: '#4a6fd4',
    cardBg: '#3a5fc0',
    thumbUrl: '/assets/avatars/psych/clean/psych-camila.png',
  },
  {
    id: 'psych-sebastian',
    label: 'Personaje 9',
    slot: 9,
    className: 'Neuropsicólogo',
    rarity: 'COMMON',
    theme: 'Cerebro y cognición',
    gradient: 'linear-gradient(165deg, #6e3a00 0%, #e89040 50%, #2a1800 100%)',
    glow: 'rgba(232, 144, 64, 0.45)',
    accent: '#e89040',
    cardBg: '#d07830',
    thumbUrl: '/assets/avatars/psych/clean/psych-sebastian.png',
  },
  {
    id: 'psych-laura',
    label: 'Personaje 10',
    slot: 10,
    className: 'Investigadora clínica',
    rarity: 'COMMON',
    theme: 'Evidencia y psicología social',
    gradient: 'linear-gradient(165deg, #2a5a2a 0%, #7bc87b 50%, #102010 100%)',
    glow: 'rgba(123, 200, 123, 0.42)',
    accent: '#7bc87b',
    cardBg: '#5aaa5a',
    thumbUrl: '/assets/avatars/psych/clean/psych-laura.png',
  },
];

const LEGACY_AVATAR_MAP: Record<string, AvatarId> = {
  'neural-01': 'psych-alejandro',
  'psyche-02': 'psych-valeria',
  'cortex-03': 'psych-mateo',
  'mind-04': 'psych-sofia',
  'synapse-05': 'psych-daniel',
  'pulse-06': 'psych-isabella',
};

export const DEFAULT_AVATAR_ID: AvatarId = 'psych-alejandro';

export function normalizeAvatarId(id: string | undefined): AvatarId {
  if (!id) return DEFAULT_AVATAR_ID;
  if (AVATAR_CATALOG.some((a) => a.id === id)) return id as AvatarId;
  return LEGACY_AVATAR_MAP[id] ?? DEFAULT_AVATAR_ID;
}

export function avatarById(id: AvatarId | string | undefined): AvatarOption {
  const normalized = normalizeAvatarId(id);
  return AVATAR_CATALOG.find((a) => a.id === normalized) ?? AVATAR_CATALOG[0];
}

export const RARITY_LABELS: Record<AvatarOption['rarity'], string> = {
  COMMON: 'Común',
  RARE: 'Raro',
  EPIC: 'Épico',
};
