import {
  AccessoryId,
  AccessorySlot,
  AvatarAccessories,
  BadgeAccessoryId,
  EffectId,
  EyewearId,
  HeadwearId,
} from '../../../models/academy.models';

export interface AccessoryOption {
  id: AccessoryId;
  slot: AccessorySlot;
  label: string;
  description: string;
  accent: string;
  thumbUrl: string;
}

export const DEFAULT_AVATAR_ACCESSORIES: AvatarAccessories = {
  headwear: 'head-none',
  eyewear: 'eyes-none',
  badge: 'badge-none',
  effect: 'effect-none',
};

export const ACCESSORY_CATALOG: AccessoryOption[] = [
  { id: 'head-none', slot: 'headwear', label: 'Sin sombrero', description: 'Look limpio', accent: '#8899bb', thumbUrl: '/assets/avatars/accessories/head-none.svg' },
  { id: 'visor-cyber', slot: 'headwear', label: 'Visor neural', description: 'HUD de análisis clínico', accent: '#6b8cff', thumbUrl: '/assets/avatars/accessories/visor-cyber.svg' },
  { id: 'cap-field', slot: 'headwear', label: 'Gorra de campo', description: 'Intervención en terreno', accent: '#52c9a8', thumbUrl: '/assets/avatars/accessories/cap-field.svg' },
  { id: 'crown-elite', slot: 'headwear', label: 'Corona élite', description: 'Rango máximo en simulaciones', accent: '#f4c542', thumbUrl: '/assets/avatars/accessories/crown-elite.svg' },
  { id: 'eyes-none', slot: 'eyewear', label: 'Sin lentes', description: 'Visión natural', accent: '#8899bb', thumbUrl: '/assets/avatars/accessories/eyes-none.svg' },
  { id: 'lens-lab', slot: 'eyewear', label: 'Lentes de laboratorio', description: 'Lectura de protocolos', accent: '#9b8fd9', thumbUrl: '/assets/avatars/accessories/lens-lab.svg' },
  { id: 'shade-cool', slot: 'eyewear', label: 'Gafas oscuras', description: 'Enfoque bajo presión', accent: '#d65db1', thumbUrl: '/assets/avatars/accessories/shade-cool.svg' },
  { id: 'badge-none', slot: 'badge', label: 'Sin insignia', description: 'Uniforme básico', accent: '#8899bb', thumbUrl: '/assets/avatars/accessories/badge-none.svg' },
  { id: 'badge-psi', slot: 'badge', label: 'Insignia Psi', description: 'Psicología aplicada', accent: '#52c9a8', thumbUrl: '/assets/avatars/accessories/badge-psi.svg' },
  { id: 'badge-neural', slot: 'badge', label: 'Emblema neural', description: 'Neurociencia cognitiva', accent: '#6b8cff', thumbUrl: '/assets/avatars/accessories/badge-neural.svg' },
  { id: 'effect-none', slot: 'effect', label: 'Sin aura', description: 'Presencia discreta', accent: '#8899bb', thumbUrl: '/assets/avatars/accessories/effect-none.svg' },
  { id: 'aura-soft', slot: 'effect', label: 'Aura suave', description: 'Calma en sesión', accent: '#9b8fd9', thumbUrl: '/assets/avatars/accessories/aura-soft.svg' },
  { id: 'aura-flare', slot: 'effect', label: 'Aura flare', description: 'Energía de misión', accent: '#f4c542', thumbUrl: '/assets/avatars/accessories/aura-flare.svg' },
];

export const ACCESSORY_SLOT_LABELS: Record<AccessorySlot, string> = {
  headwear: 'Cabeza',
  eyewear: 'Ojos',
  badge: 'Insignia',
  effect: 'Aura',
};

export function slotThumbUrl(slot: AccessorySlot): string {
  return `/assets/avatars/slots/${slot}.svg`;
}

export function accessoriesForSlot(slot: AccessorySlot): AccessoryOption[] {
  return ACCESSORY_CATALOG.filter((item) => item.slot === slot);
}

export function normalizeAccessories(
  partial?: Partial<AvatarAccessories> | null,
): AvatarAccessories {
  return {
    headwear: partial?.headwear ?? DEFAULT_AVATAR_ACCESSORIES.headwear,
    eyewear: partial?.eyewear ?? DEFAULT_AVATAR_ACCESSORIES.eyewear,
    badge: partial?.badge ?? DEFAULT_AVATAR_ACCESSORIES.badge,
    effect: partial?.effect ?? DEFAULT_AVATAR_ACCESSORIES.effect,
  };
}

export function accessoryById(id: AccessoryId): AccessoryOption {
  return ACCESSORY_CATALOG.find((item) => item.id === id) ?? ACCESSORY_CATALOG[0];
}

export function isNoneAccessory(id: AccessoryId): boolean {
  return id.endsWith('-none');
}

export function setAccessoryForSlot(
  current: AvatarAccessories,
  slot: AccessorySlot,
  id: AccessoryId,
): AvatarAccessories {
  switch (slot) {
    case 'headwear':
      return { ...current, headwear: id as HeadwearId };
    case 'eyewear':
      return { ...current, eyewear: id as EyewearId };
    case 'badge':
      return { ...current, badge: id as BadgeAccessoryId };
    case 'effect':
      return { ...current, effect: id as EffectId };
  }
}
