import { Question, Scenario } from '../../../models/academy.models';

export type MissionPhase =
  | 'briefing'
  | 'map'
  | 'zone-intro'
  | 'decision'
  | 'feedback'
  | 'mission-complete';

export type ZoneTheme = 'neural-lab' | 'mind-city' | 'psyche-garden' | 'crisis-core' | 'ethics-vault';

export interface MissionZone {
  id: string;
  index: number;
  scenario: Scenario;
  theme: ZoneTheme;
  /** Posición en el mapa (0–100) */
  mapX: number;
  mapY: number;
  questions: Question[];
}

export interface MissionBlueprint {
  briefingTitle: string;
  briefingContext: string;
  objective: string;
  difficulty: string;
  zones: MissionZone[];
  totalQuestions: number;
}

export const ZONE_THEMES: Record<
  ZoneTheme,
  { label: string; icon: string; accent: string; description: string }
> = {
  'neural-lab': {
    label: 'Laboratorio Neural',
    icon: 'science',
    accent: '#4fc3ff',
    description: 'Análisis clínico y evaluación técnica',
  },
  'mind-city': {
    label: 'Ciudad Mental',
    icon: 'location_city',
    accent: '#9b8fd9',
    description: 'Factores psicosociales y contexto comunitario',
  },
  'psyche-garden': {
    label: 'Jardín Psíquico',
    icon: 'park',
    accent: '#52c9a8',
    description: 'Desarrollo, recursos y factores protectores',
  },
  'crisis-core': {
    label: 'Núcleo de Crisis',
    icon: 'crisis_alert',
    accent: '#ff6b8a',
    description: 'Urgencia, riesgo y rutas de atención',
  },
  'ethics-vault': {
    label: 'Bóveda Ética',
    icon: 'gavel',
    accent: '#f4c542',
    description: 'Deontología y decisiones profesionales',
  },
};

export const ZONE_THEME_ORDER: ZoneTheme[] = [
  'neural-lab',
  'mind-city',
  'psyche-garden',
  'crisis-core',
  'ethics-vault',
];
