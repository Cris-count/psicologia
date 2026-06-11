/** Orden de profundidad isométrico — todo en el mundo Phaser, sin HTML overlay. */
export function depthFromY(worldY: number, offset = 0): number {
  return Math.round(worldY + offset);
}

export const ISO_DEPTH = {
  sky: -100,
  ground: 0,
  paths: 1,
  nature: 2,
  decor: 10,
  buildingBase: 50,
  npc: 200,
  player: 300,
  playerShadow: 299,
  lighting: 400,
  fx: 500,
  navigation: 600,
  prompt: 700,
  gary: 750,
} as const;
