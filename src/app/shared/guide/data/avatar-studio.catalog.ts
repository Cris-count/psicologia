import {
  AvatarGender,
  AvatarLook,
  AvatarStudioSlot,
  StudioOptionId,
} from './avatar-look.types';

export interface StudioOption {
  id: StudioOptionId;
  slot: AvatarStudioSlot;
  label: string;
  hex?: string;
  hex2?: string;
}

export const DEFAULT_AVATAR_LOOK: AvatarLook = {
  gender: 'feminine',
  skinTone: 'skin-2',
  hairColor: 'hc-2',
  hairStyle: 'hs-long',
  eyeColor: 'ec-4',
  eyebrows: 'eb-arched',
  top: 'top-formal-white',
  jacket: 'jacket-cardigan-brown',
  bottom: 'bot-wide-cream',
  shoes: 'shoe-sneaker-white',
  headwear: 'hat-none',
  eyewear: 'glasses-none',
  earrings: 'ear-none',
  necklace: 'neck-none',
  facialHair: 'fh-none',
};

const FEMININE_ONLY_BOTTOMS = new Set<string>(['bot-skirt-black', 'bot-skirt-plaid', 'bot-leggings-black']);
const FEMININE_ONLY_TOPS = new Set<string>(['top-blouse-cream', 'top-crop-lavender']);
const FEMININE_ONLY_SHOES = new Set<string>(['shoe-heel-black']);

export const GENDER_LABELS: Record<AvatarGender, string> = {
  feminine: 'Femenino',
  masculine: 'Masculino',
};

export const STUDIO_CATALOG: StudioOption[] = [
  ...(['skin-1', 'skin-2', 'skin-3', 'skin-4', 'skin-5', 'skin-6', 'skin-7', 'skin-8', 'skin-9', 'skin-10'] as const).map(
    (id, i) => ({
      id,
      slot: 'skin' as const,
      label: `Tono ${i + 1}`,
      hex: ['#fde8dc', '#f5d0b5', '#e8b88a', '#d4a574', '#c68642', '#a57249', '#8d5524', '#6b4423', '#4a2c17', '#3d2314'][i],
    }),
  ),
  ...(
    [
      ['hc-1', 'Negro', '#1a1a1a'],
      ['hc-2', 'Castaño oscuro', '#3d2314'],
      ['hc-3', 'Castaño', '#6b4423'],
      ['hc-4', 'Castaño claro', '#8b6914'],
      ['hc-5', 'Rubio', '#c68642'],
      ['hc-6', 'Rubio claro', '#e8c872'],
      ['hc-7', 'Pelirrojo', '#b3392c'],
      ['hc-8', 'Violeta', '#7b5cbf'],
      ['hc-9', 'Azul', '#3d6fd4'],
      ['hc-10', 'Verde azulado', '#2a8a6a'],
      ['hc-11', 'Rosa', '#d65db1'],
      ['hc-12', 'Platino', '#e8e0d0'],
    ] as const
  ).map(([id, label, hex]) => ({ id, slot: 'hairColor' as const, label, hex })),
  ...(
    [
      ['hs-buzz', 'Rapado'],
      ['hs-short', 'Corto'],
      ['hs-medium', 'Medio'],
      ['hs-long', 'Largo'],
      ['hs-bob', 'Bob'],
      ['hs-bun', 'Moño'],
      ['hs-ponytail', 'Cola'],
      ['hs-curly', 'Rizado'],
      ['hs-wavy', 'Ondulado'],
      ['hs-braids', 'Trenzas'],
    ] as const
  ).map(([id, label]) => ({ id, slot: 'hairStyle' as const, label })),
  ...(
    [
      ['ec-1', 'Café', '#4a3018'],
      ['ec-2', 'Avellana', '#6b5030'],
      ['ec-3', 'Verde', '#3a7a4a'],
      ['ec-4', 'Azul', '#2e6b9a'],
      ['ec-5', 'Gris', '#6a7580'],
      ['ec-6', 'Ámbar', '#b8860b'],
      ['ec-7', 'Violeta', '#6b4a9a'],
      ['ec-8', 'Negro', '#1a1a22'],
    ] as const
  ).map(([id, label, hex]) => ({ id, slot: 'eyes' as const, label, hex })),
  ...(
    [
      ['eb-natural', 'Natural'],
      ['eb-thick', 'Gruesas'],
      ['eb-thin', 'Finas'],
      ['eb-arched', 'Arqueadas'],
      ['eb-straight', 'Rectas'],
    ] as const
  ).map(([id, label]) => ({ id, slot: 'eyebrows' as const, label })),
  ...(
    [
      ['top-tee-white', 'Camiseta blanca', '#f0f0f0'],
      ['top-tee-black', 'Camiseta negra', '#222222'],
      ['top-tee-red', 'Camiseta roja', '#c0392b'],
      ['top-tee-blue', 'Camiseta azul', '#2a4a8a'],
      ['top-tee-green', 'Camiseta verde', '#2a7a4a'],
      ['top-polo-navy', 'Polo marino', '#1a3058'],
      ['top-polo-pink', 'Polo rosa', '#d65db1'],
      ['top-hoodie-gray', 'Hoodie gris', '#6a7080'],
      ['top-hoodie-purple', 'Hoodie morado', '#5a3d8a'],
      ['top-blouse-cream', 'Blusa crema', '#f5e6d0'],
      ['top-tank-black', 'Tank top', '#1a1a1a'],
      ['top-cardigan-beige', 'Cardigan', '#c8b090'],
      ['top-vneck-blue', 'V-neck azul', '#3a5a9a'],
      ['top-stripes', 'Rayas', '#f0f0f0', '#2a4a8a'],
      ['top-formal-white', 'Camisa formal', '#ffffff'],
      ['top-crop-lavender', 'Crop top', '#b8a0d8'],
      ['top-turtleneck-black', 'Turtleneck', '#1a1a22'],
      ['top-graphic-teal', 'Gráfica teal', '#1a8a8a'],
    ] as const
  ).map(([id, label, hex, hex2]) => ({
    id,
    slot: 'top' as const,
    label,
    hex,
    hex2: hex2 ?? undefined,
  })),
  ...(
    [
      ['jacket-none', 'Sin chaqueta', '#00000000'],
      ['jacket-denim', 'Mezclilla', '#4a6a9a'],
      ['jacket-leather-black', 'Cuero negro', '#1a1a1a'],
      ['jacket-blazer-navy', 'Blazer', '#1a3058'],
      ['jacket-bomber-olive', 'Bomber', '#4a5a30'],
      ['jacket-windbreaker-cyan', 'Cortavientos', '#1a9aaa'],
      ['jacket-coat-tan', 'Abrigo', '#a08060'],
      ['jacket-vest-orange', 'Chaleco', '#d07020'],
      ['jacket-cardigan-brown', 'Cardigan abierto', '#6a5040'],
      ['jacket-puffer-red', 'Pluma roja', '#a03030'],
    ] as const
  ).map(([id, label, hex]) => ({ id, slot: 'jacket' as const, label, hex })),
  ...(
    [
      ['bot-jeans-blue', 'Jeans azul', '#3a5080'],
      ['bot-jeans-black', 'Jeans negro', '#1a1a28'],
      ['bot-chinos-khaki', 'Chinos caqui', '#a09070'],
      ['bot-chinos-navy', 'Chinos marino', '#1a3058'],
      ['bot-shorts-denim', 'Shorts mezclilla', '#4a6a9a'],
      ['bot-shorts-black', 'Shorts negro', '#222222'],
      ['bot-skirt-black', 'Falda negra', '#1a1a1a'],
      ['bot-skirt-plaid', 'Falda cuadros', '#8a3030', '#1a1a1a'],
      ['bot-joggers-gray', 'Joggers', '#5a5a60'],
      ['bot-cargo-green', 'Cargo verde', '#3a5a30'],
      ['bot-formal-gray', 'Formal gris', '#4a4a50'],
      ['bot-leggings-black', 'Leggings', '#1a1a1a'],
      ['bot-wide-cream', 'Pantalón ancho', '#e8dcc8'],
      ['bot-plaid-red', 'Cuadros rojo', '#8a2828', '#1a1a1a'],
    ] as const
  ).map(([id, label, hex, hex2]) => ({
    id,
    slot: 'bottom' as const,
    label,
    hex,
    hex2: hex2 ?? undefined,
  })),
  ...(
    [
      ['shoe-sneaker-white', 'Sneaker blanco', '#f0f0f0', '#e0e0e0'],
      ['shoe-sneaker-black', 'Sneaker negro', '#222222'],
      ['shoe-boot-brown', 'Bota marrón', '#5a4030'],
      ['shoe-boot-black', 'Bota negra', '#1a1a1a'],
      ['shoe-loafer-brown', 'Mocasín', '#6a5040'],
      ['shoe-heel-black', 'Tacón negro', '#1a1a1a'],
      ['shoe-sandal-tan', 'Sandalia', '#c8a878'],
      ['shoe-hightop-red', 'High-top rojo', '#a03030'],
      ['shoe-runner-blue', 'Running azul', '#2a5a9a'],
      ['shoe-formal-black', 'Formal negro', '#1a1a22'],
      ['shoe-slide-gray', 'Slide gris', '#8a8a90'],
      ['shoe-combat-black', 'Combat boot', '#2a2a30'],
    ] as const
  ).map(([id, label, hex, hex2]) => ({
    id,
    slot: 'shoes' as const,
    label,
    hex,
    hex2: hex2 ?? undefined,
  })),
  ...(
    [
      ['hat-none', 'Sin sombrero'],
      ['hat-cap-black', 'Gorra negra'],
      ['hat-cap-red', 'Gorra roja'],
      ['hat-beanie-navy', 'Beanie marino'],
      ['hat-beanie-orange', 'Beanie naranja'],
      ['hat-bucket-khaki', 'Bucket hat'],
      ['hat-beret-black', 'Boina'],
      ['hat-headband-sport', 'Cinta deportiva'],
      ['hat-crown-gold', 'Corona'],
      ['hat-visor-teal', 'Visera'],
      ['hat-flower-crown', 'Corona floral'],
    ] as const
  ).map(([id, label]) => ({ id, slot: 'headwear' as const, label })),
  ...(
    [
      ['glasses-none', 'Sin lentes'],
      ['glasses-round-black', 'Redondos'],
      ['glasses-square-navy', 'Cuadrados'],
      ['glasses-aviator-gold', 'Aviador'],
      ['glasses-cat-pink', 'Cat eye'],
      ['glasses-sport-red', 'Deportivos'],
      ['glasses-shade-black', 'Oscuros'],
      ['glasses-shade-mirror', 'Espejo'],
      ['glasses-reading-tortoise', 'Lectura'],
    ] as const
  ).map(([id, label]) => ({ id, slot: 'eyewear' as const, label })),
  ...(
    [
      ['ear-none', 'Sin aretes'],
      ['ear-studs-gold', 'Studs dorados'],
      ['ear-studs-silver', 'Studs plata'],
      ['ear-hoops-gold', 'Aros dorados'],
      ['ear-hoops-large', 'Aros grandes'],
      ['ear-drops-pearl', 'Perlas'],
      ['ear-drops-diamond', 'Diamante'],
    ] as const
  ).map(([id, label]) => ({ id, slot: 'earrings' as const, label })),
  ...(
    [
      ['neck-none', 'Sin collar'],
      ['neck-chain-gold', 'Cadena oro'],
      ['neck-chain-silver', 'Cadena plata'],
      ['neck-pendant-star', 'Dije estrella'],
      ['neck-choker-black', 'Choker'],
      ['neck-beads', 'Cuentas'],
    ] as const
  ).map(([id, label]) => ({ id, slot: 'necklace' as const, label })),
  ...(
    [
      ['fh-none', 'Sin barba'],
      ['fh-stubble', 'Barba de 3 días'],
      ['fh-beard-full', 'Barba completa'],
      ['fh-beard-short', 'Barba corta'],
      ['fh-goatee', 'Candado'],
      ['fh-mustache', 'Bigote'],
      ['fh-mustache-handlebar', 'Bigote handlebar'],
    ] as const
  ).map(([id, label]) => ({ id, slot: 'facialHair' as const, label })),
];

export const STUDIO_SLOT_LABELS: Record<AvatarStudioSlot, string> = {
  skin: 'Piel',
  hairColor: 'Color pelo',
  hairStyle: 'Peinado',
  eyes: 'Ojos',
  eyebrows: 'Cejas',
  top: 'Camisa / Top',
  jacket: 'Chaqueta',
  bottom: 'Pantalón',
  shoes: 'Zapatos',
  headwear: 'Sombrero',
  eyewear: 'Lentes',
  earrings: 'Aretes',
  necklace: 'Collar',
  facialHair: 'Barba',
};

export const STUDIO_SLOT_ORDER: AvatarStudioSlot[] = [
  'skin', 'hairColor', 'hairStyle', 'eyes', 'eyebrows', 'facialHair',
  'top', 'jacket', 'bottom', 'shoes', 'headwear', 'eyewear', 'earrings', 'necklace',
];

export function studioSlotIcon(slot: AvatarStudioSlot): string {
  return `/assets/avatars/studio/slot-${slot}.svg`;
}

export function optionsForStudioSlot(slot: AvatarStudioSlot, gender: AvatarGender = 'feminine'): StudioOption[] {
  return STUDIO_CATALOG.filter((o) => {
    if (o.slot !== slot) return false;
    if (gender === 'masculine') {
      if (FEMININE_ONLY_BOTTOMS.has(o.id)) return false;
      if (FEMININE_ONLY_TOPS.has(o.id)) return false;
      if (FEMININE_ONLY_SHOES.has(o.id)) return false;
    }
    if (gender === 'feminine' && slot === 'facialHair' && o.id !== 'fh-none') return false;
    return true;
  });
}

export function slotsForGender(gender: AvatarGender): AvatarStudioSlot[] {
  if (gender === 'masculine') return STUDIO_SLOT_ORDER;
  return STUDIO_SLOT_ORDER.filter((s) => s !== 'facialHair');
}

export function applyGenderChange(look: AvatarLook, gender: AvatarGender): AvatarLook {
  const next = { ...look, gender };
  if (gender === 'feminine') {
    next.facialHair = 'fh-none';
  } else {
    if (FEMININE_ONLY_BOTTOMS.has(next.bottom)) next.bottom = 'bot-jeans-blue';
    if (FEMININE_ONLY_TOPS.has(next.top)) next.top = 'top-tee-blue';
    if (FEMININE_ONLY_SHOES.has(next.shoes)) next.shoes = 'shoe-sneaker-white';
  }
  return normalizeAvatarLook(next);
}

export function studioOption(id: StudioOptionId): StudioOption {
  return STUDIO_CATALOG.find((o) => o.id === id) ?? STUDIO_CATALOG[0];
}

export function hexForLook(look: AvatarLook, slot: AvatarStudioSlot): string {
  return studioOption(selectedForLookSlot(look, slot)).hex ?? '#888888';
}

export function normalizeAvatarLook(partial?: Partial<AvatarLook> | null): AvatarLook {
  return {
    gender: partial?.gender ?? DEFAULT_AVATAR_LOOK.gender,
    skinTone: partial?.skinTone ?? DEFAULT_AVATAR_LOOK.skinTone,
    hairColor: partial?.hairColor ?? DEFAULT_AVATAR_LOOK.hairColor,
    hairStyle: partial?.hairStyle ?? DEFAULT_AVATAR_LOOK.hairStyle,
    eyeColor: partial?.eyeColor ?? DEFAULT_AVATAR_LOOK.eyeColor,
    eyebrows: partial?.eyebrows ?? DEFAULT_AVATAR_LOOK.eyebrows,
    top: partial?.top ?? DEFAULT_AVATAR_LOOK.top,
    jacket: partial?.jacket ?? DEFAULT_AVATAR_LOOK.jacket,
    bottom: partial?.bottom ?? DEFAULT_AVATAR_LOOK.bottom,
    shoes: partial?.shoes ?? DEFAULT_AVATAR_LOOK.shoes,
    headwear: partial?.headwear ?? DEFAULT_AVATAR_LOOK.headwear,
    eyewear: partial?.eyewear ?? DEFAULT_AVATAR_LOOK.eyewear,
    earrings: partial?.earrings ?? DEFAULT_AVATAR_LOOK.earrings,
    necklace: partial?.necklace ?? DEFAULT_AVATAR_LOOK.necklace,
    facialHair: partial?.facialHair ?? DEFAULT_AVATAR_LOOK.facialHair,
  };
}

export function setLookSlot(look: AvatarLook, slot: AvatarStudioSlot, id: StudioOptionId): AvatarLook {
  const next = { ...look };
  switch (slot) {
    case 'skin': next.skinTone = id as AvatarLook['skinTone']; break;
    case 'hairColor': next.hairColor = id as AvatarLook['hairColor']; break;
    case 'hairStyle': next.hairStyle = id as AvatarLook['hairStyle']; break;
    case 'eyes': next.eyeColor = id as AvatarLook['eyeColor']; break;
    case 'eyebrows': next.eyebrows = id as AvatarLook['eyebrows']; break;
    case 'top': next.top = id as AvatarLook['top']; break;
    case 'jacket': next.jacket = id as AvatarLook['jacket']; break;
    case 'bottom': next.bottom = id as AvatarLook['bottom']; break;
    case 'shoes': next.shoes = id as AvatarLook['shoes']; break;
    case 'headwear': next.headwear = id as AvatarLook['headwear']; break;
    case 'eyewear': next.eyewear = id as AvatarLook['eyewear']; break;
    case 'earrings': next.earrings = id as AvatarLook['earrings']; break;
    case 'necklace': next.necklace = id as AvatarLook['necklace']; break;
    case 'facialHair': next.facialHair = id as AvatarLook['facialHair']; break;
  }
  return next;
}

export function selectedForLookSlot(look: AvatarLook, slot: AvatarStudioSlot): StudioOptionId {
  switch (slot) {
    case 'skin': return look.skinTone;
    case 'hairColor': return look.hairColor;
    case 'hairStyle': return look.hairStyle;
    case 'eyes': return look.eyeColor;
    case 'eyebrows': return look.eyebrows;
    case 'top': return look.top;
    case 'jacket': return look.jacket;
    case 'bottom': return look.bottom;
    case 'shoes': return look.shoes;
    case 'headwear': return look.headwear;
    case 'eyewear': return look.eyewear;
    case 'earrings': return look.earrings;
    case 'necklace': return look.necklace;
    case 'facialHair': return look.facialHair;
  }
}

export function migrateLegacyLook(legacy?: {
  avatarLook?: Partial<AvatarLook> | null;
  appearance?: import('../../../models/academy.models').AvatarAppearance | null;
  accessories?: import('../../../models/academy.models').AvatarAccessories | null;
}): AvatarLook {
  if (legacy?.avatarLook) return normalizeAvatarLook(legacy.avatarLook);
  const base = normalizeAvatarLook();
  if (!legacy) return base;
  return base;
}
