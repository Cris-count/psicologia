import {
  AppearanceOptionId,
  AppearanceSlot,
  AvatarAppearance,
  EyeColorId,
  HairColorId,
  HairStyleId,
  OutfitColorId,
  SkinToneId,
} from '../../../models/academy.models';

export interface AppearanceOption {
  id: AppearanceOptionId;
  slot: AppearanceSlot;
  label: string;
  hex?: string;
  thumbUrl?: string;
}

export const DEFAULT_AVATAR_APPEARANCE: AvatarAppearance = {
  skinTone: 'skin-4',
  hairColor: 'hair-2',
  hairStyle: 'style-medium',
  eyeColor: 'eye-1',
  outfitColor: 'cloth-1',
};

export const APPEARANCE_CATALOG: AppearanceOption[] = [
  { id: 'skin-1', slot: 'skin', label: 'Muy clara', hex: '#fde6d8' },
  { id: 'skin-2', slot: 'skin', label: 'Clara', hex: '#f5cba7' },
  { id: 'skin-3', slot: 'skin', label: 'Clara media', hex: '#e0ac69' },
  { id: 'skin-4', slot: 'skin', label: 'Media', hex: '#c68642' },
  { id: 'skin-5', slot: 'skin', label: 'Morena', hex: '#a57249' },
  { id: 'skin-6', slot: 'skin', label: 'Morena oscura', hex: '#8d5524' },
  { id: 'skin-7', slot: 'skin', label: 'Oscura', hex: '#6b4423' },
  { id: 'skin-8', slot: 'skin', label: 'Muy oscura', hex: '#4a2c17' },
  { id: 'hair-1', slot: 'hairColor', label: 'Negro', hex: '#1a1a1a' },
  { id: 'hair-2', slot: 'hairColor', label: 'Castaño oscuro', hex: '#3d2314' },
  { id: 'hair-3', slot: 'hairColor', label: 'Castaño', hex: '#6b4423' },
  { id: 'hair-4', slot: 'hairColor', label: 'Rubio', hex: '#c68642' },
  { id: 'hair-5', slot: 'hairColor', label: 'Rubio claro', hex: '#d4a574' },
  { id: 'hair-6', slot: 'hairColor', label: 'Pelirrojo', hex: '#c0392b' },
  { id: 'hair-7', slot: 'hairColor', label: 'Violeta', hex: '#7b5cbf' },
  { id: 'hair-8', slot: 'hairColor', label: 'Azul', hex: '#6b8cff' },
  { id: 'hair-9', slot: 'hairColor', label: 'Verde azulado', hex: '#52c9a8' },
  { id: 'hair-10', slot: 'hairColor', label: 'Dorado', hex: '#f4c542' },
  { id: 'style-short', slot: 'hairStyle', label: 'Corto', thumbUrl: '/assets/avatars/appearance/style-short.svg' },
  { id: 'style-medium', slot: 'hairStyle', label: 'Medio', thumbUrl: '/assets/avatars/appearance/style-medium.svg' },
  { id: 'style-long', slot: 'hairStyle', label: 'Largo', thumbUrl: '/assets/avatars/appearance/style-long.svg' },
  { id: 'style-bun', slot: 'hairStyle', label: 'Moño', thumbUrl: '/assets/avatars/appearance/style-bun.svg' },
  { id: 'style-curly', slot: 'hairStyle', label: 'Rizado', thumbUrl: '/assets/avatars/appearance/style-curly.svg' },
  { id: 'style-fade', slot: 'hairStyle', label: 'Fade', thumbUrl: '/assets/avatars/appearance/style-fade.svg' },
  { id: 'eye-1', slot: 'eyes', label: 'Café', hex: '#3d2314' },
  { id: 'eye-2', slot: 'eyes', label: 'Azul', hex: '#2e6b8a' },
  { id: 'eye-3', slot: 'eyes', label: 'Verde', hex: '#3a8a4a' },
  { id: 'eye-4', slot: 'eyes', label: 'Violeta', hex: '#7b5cbf' },
  { id: 'eye-5', slot: 'eyes', label: 'Gris', hex: '#6a7580' },
  { id: 'eye-6', slot: 'eyes', label: 'Ámbar', hex: '#c68620' },
  { id: 'cloth-1', slot: 'outfit', label: 'Azul clínico', hex: '#2a4a8a' },
  { id: 'cloth-2', slot: 'outfit', label: 'Verde campo', hex: '#1a6b58' },
  { id: 'cloth-3', slot: 'outfit', label: 'Violeta neural', hex: '#5a3d8a' },
  { id: 'cloth-4', slot: 'outfit', label: 'Magenta', hex: '#8a2868' },
  { id: 'cloth-5', slot: 'outfit', label: 'Dorado élite', hex: '#8a6800' },
  { id: 'cloth-6', slot: 'outfit', label: 'Rojo alerta', hex: '#8a2838' },
  { id: 'cloth-7', slot: 'outfit', label: 'Cian futuro', hex: '#1a6b8a' },
  { id: 'cloth-8', slot: 'outfit', label: 'Negro táctico', hex: '#2a2a38' },
];

export const APPEARANCE_SLOT_LABELS: Record<AppearanceSlot, string> = {
  skin: 'Piel',
  hairColor: 'Color cabello',
  hairStyle: 'Peinado',
  eyes: 'Ojos',
  outfit: 'Ropa',
};

export function appearanceSlotIcon(slot: AppearanceSlot): string {
  return `/assets/avatars/slots/${slot}.svg`;
}

export function optionsForAppearanceSlot(slot: AppearanceSlot): AppearanceOption[] {
  return APPEARANCE_CATALOG.filter((o) => o.slot === slot);
}

export function normalizeAppearance(partial?: Partial<AvatarAppearance> | null): AvatarAppearance {
  return {
    skinTone: partial?.skinTone ?? DEFAULT_AVATAR_APPEARANCE.skinTone,
    hairColor: partial?.hairColor ?? DEFAULT_AVATAR_APPEARANCE.hairColor,
    hairStyle: partial?.hairStyle ?? DEFAULT_AVATAR_APPEARANCE.hairStyle,
    eyeColor: partial?.eyeColor ?? DEFAULT_AVATAR_APPEARANCE.eyeColor,
    outfitColor: partial?.outfitColor ?? DEFAULT_AVATAR_APPEARANCE.outfitColor,
  };
}

export function appearanceHex(id: AppearanceOptionId): number {
  const opt = APPEARANCE_CATALOG.find((o) => o.id === id);
  if (!opt?.hex) return 0xffffff;
  return parseInt(opt.hex.replace('#', ''), 16);
}

export function setAppearanceForSlot(
  current: AvatarAppearance,
  slot: AppearanceSlot,
  id: AppearanceOptionId,
): AvatarAppearance {
  switch (slot) {
    case 'skin':
      return { ...current, skinTone: id as SkinToneId };
    case 'hairColor':
      return { ...current, hairColor: id as HairColorId };
    case 'hairStyle':
      return { ...current, hairStyle: id as HairStyleId };
    case 'eyes':
      return { ...current, eyeColor: id as EyeColorId };
    case 'outfit':
      return { ...current, outfitColor: id as OutfitColorId };
  }
}

export function selectedForAppearanceSlot(current: AvatarAppearance, slot: AppearanceSlot): AppearanceOptionId {
  switch (slot) {
    case 'skin':
      return current.skinTone;
    case 'hairColor':
      return current.hairColor;
    case 'hairStyle':
      return current.hairStyle;
    case 'eyes':
      return current.eyeColor;
    case 'outfit':
      return current.outfitColor;
  }
}
