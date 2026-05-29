import { AvatarId } from '../../../models/academy.models';

export interface AvatarOption {
  id: AvatarId;
  label: string;
  className: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC';
  theme: string;
  gradient: string;
  glow: string;
  accent: string;
}

export const AVATAR_CATALOG: AvatarOption[] = [
  {
    id: 'neural-01',
    label: 'Dr. Kael',
    className: 'Analista Neural',
    rarity: 'COMMON',
    theme: 'Especialista en evaluación clínica',
    gradient: 'linear-gradient(165deg, #1a3a6e 0%, #6b8cff 55%, #221c42 100%)',
    glow: 'rgba(107, 140, 255, 0.45)',
    accent: '#6b8cff',
  },
  {
    id: 'psyche-02',
    label: 'Maya Chen',
    className: 'Psicóloga de Campo',
    rarity: 'COMMON',
    theme: 'Intervención psicosocial',
    gradient: 'linear-gradient(165deg, #0f4a4a 0%, #52c9a8 50%, #1a1535 100%)',
    glow: 'rgba(82, 201, 168, 0.42)',
    accent: '#52c9a8',
  },
  {
    id: 'cortex-03',
    label: 'Prof. Rivera',
    className: 'Neurocientífica',
    rarity: 'RARE',
    theme: 'Corteza y procesos cognitivos',
    gradient: 'linear-gradient(165deg, #3d2663 0%, #9b8fd9 50%, #1a1535 100%)',
    glow: 'rgba(155, 143, 217, 0.48)',
    accent: '#9b8fd9',
  },
  {
    id: 'mind-04',
    label: 'Zara Okonkwo',
    className: 'Estratega Clínica',
    rarity: 'RARE',
    theme: 'Toma de decisiones complejas',
    gradient: 'linear-gradient(165deg, #4a1942 0%, #d65db1 48%, #221c42 100%)',
    glow: 'rgba(214, 93, 177, 0.45)',
    accent: '#d65db1',
  },
  {
    id: 'synapse-05',
    label: 'Captain Voss',
    className: 'Operador Élite',
    rarity: 'EPIC',
    theme: 'Crisis y respuesta inmediata',
    gradient: 'linear-gradient(165deg, #5c3d00 0%, #f4c542 40%, #d65db1 100%)',
    glow: 'rgba(244, 197, 66, 0.55)',
    accent: '#f4c542',
  },
  {
    id: 'pulse-06',
    label: 'Nova Reyes',
    className: 'Comandante Psi',
    rarity: 'EPIC',
    theme: 'Liderazgo en simulaciones avanzadas',
    gradient: 'linear-gradient(165deg, #1e3a8a 0%, #6b8cff 45%, #f4c542 100%)',
    glow: 'rgba(107, 140, 255, 0.5)',
    accent: '#8aa4ff',
  },
];

export function avatarById(id: AvatarId | undefined): AvatarOption {
  return AVATAR_CATALOG.find((a) => a.id === id) ?? AVATAR_CATALOG[0];
}

export const RARITY_LABELS: Record<AvatarOption['rarity'], string> = {
  COMMON: 'Común',
  RARE: 'Raro',
  EPIC: 'Épico',
};
