/** Layout completo — puertas centradas según cantidad activa (3 o 4). */

export interface HallwayLayout {
  worldW: number;
  worldH: number;
  activeDoorCount: number;
  playerScale: number;
  playerDisplayHeight: number;
  doorScale: number;
  doorPixelW: number;
  doorHeight: number;
  signWidth: number;
  slotWidth: number;
  cardHeight: number;
  cardTopY: number;
  cardBottomY: number;
  responsesTopY: number;
  playableTop: number;
  playableBottom: number;
  spawnX: number;
  spawnY: number;
  doorPositions: { x: number; y: number }[];
  interactRadius: number;
  playX: number;
  playY: number;
  playW: number;
  playH: number;
  floorLineY: number;
  floorTopY: number;
  floorBottomY: number;
}

const DOOR_TEX_H = 64;
const DOOR_TEX_W = 48;
const HUD_H = 52;
const CONTROLS_H = 28;
const SIGN_GAP = 10;
const WALK_GAP = 48;

export function computeHallwayLayout(
  viewW: number,
  viewH: number,
  activeDoorCount = 4,
): HallwayLayout {
  const worldW = viewW;
  const worldH = viewH;
  const doorCount = Math.max(1, Math.min(4, activeDoorCount));

  const playableTop = HUD_H;
  const playableBottom = viewH - CONTROLS_H;
  const playableH = playableBottom - playableTop;

  const playX = Math.max(8, worldW * 0.02);
  const playY = playableTop;
  const playW = worldW - playX * 2;
  const playH = playableBottom - playY;

  /** Puerta y personaje misma altura visual. */
  const doorHeight = Math.max(100, Math.min(165, playableH * 0.28));
  const playerDisplayHeight = doorHeight;
  const playerScale = doorHeight / 44;
  const doorScale = doorHeight / DOOR_TEX_H;
  const doorPixelW = DOOR_TEX_W * doorScale;

  const spacing = Math.max(12, Math.min(22, playW * 0.016));
  const slotWidth = (playW - spacing * (doorCount - 1)) / doorCount;
  const signWidth = Math.max(72, Math.min(140, slotWidth - doorPixelW - SIGN_GAP - 14));
  const cardHeight = Math.max(72, doorHeight * 0.85);

  /** Centrar solo las puertas activas (3 centradas, 4 repartidas). */
  const totalWidth = doorCount * slotWidth + spacing * (doorCount - 1);
  const startX = (worldW - totalWidth) / 2 + slotWidth / 2;

  const floorLineY = playableTop + playableH * 0.44;

  const doorPositions = Array.from({ length: doorCount }, (_, i) => ({
    x: startX + i * (slotWidth + spacing),
    y: floorLineY,
  }));

  const signTopY = floorLineY - doorHeight - 8;
  const cardTopY = signTopY;
  const cardBottomY = signTopY + cardHeight;
  const responsesTopY = signTopY;

  const spawnX = worldW * 0.5;
  const spawnY = floorLineY + WALK_GAP + playerDisplayHeight * 0.1;

  const floorTopY = floorLineY;
  const floorBottomY = playableBottom;

  const maxDist = Math.max(...doorPositions.map((d) => Math.hypot(d.x - spawnX, d.y - spawnY)));

  return {
    worldW,
    worldH,
    activeDoorCount: doorCount,
    playerScale,
    playerDisplayHeight,
    doorScale,
    doorPixelW,
    doorHeight,
    signWidth,
    slotWidth,
    cardHeight,
    cardTopY,
    cardBottomY,
    responsesTopY,
    playableTop,
    playableBottom,
    spawnX,
    spawnY,
    doorPositions,
    interactRadius: Math.max(200, maxDist * 1.05),
    playX,
    playY,
    playW,
    playH,
    floorLineY,
    floorTopY,
    floorBottomY,
  };
}
