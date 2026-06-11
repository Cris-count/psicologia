import { MapDecoration, MapEnvironmentDef, MapLandmark, TerrainCell } from '../map.types';

const W = 52;
const H = 38;
const CX = 26;

function buildHubTerrain(width: number, height: number): TerrainCell[][] {
  const grid: TerrainCell[][] = Array.from({ length: height }, () => Array(width).fill('grass'));

  for (let x = 0; x < width; x++) {
    grid[0][x] = 'tree';
    grid[height - 1][x] = 'tree';
  }
  for (let y = 0; y < height; y++) {
    grid[y][0] = 'tree';
    grid[y][width - 1] = 'tree';
  }

  const pathRows = [2, 10, 18, 26, 34];
  for (const ry of pathRows) {
    for (let x = 1; x < width - 1; x++) grid[ry][x] = 'path';
  }

  for (let y = 1; y < height - 1; y++) grid[y][CX] = 'path';

  const wingCols = [10, 42];
  for (const col of wingCols) {
    for (let y = 10; y <= 26; y++) grid[y][col] = 'path';
  }

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 2) grid[24 + dy][CX + dx] = 'water';
    }
  }

  for (let x = 20; x <= 32; x++) grid[35][x] = 'path';

  return grid;
}

const LANDMARKS: MapLandmark[] = [
  { zoneIndex: 0, tileX: 26, tileY: 8, buildingType: 'hospital', label: 'HOSPITAL' },
  { zoneIndex: 1, tileX: 42, tileY: 8, buildingType: 'police', label: 'COMISARÍA' },
  { zoneIndex: 2, tileX: 10, tileY: 17, buildingType: 'clinic', label: 'CONSULTORIO' },
  { zoneIndex: 3, tileX: 42, tileY: 25, buildingType: 'university', label: 'UNIVERSIDAD' },
  { zoneIndex: 4, tileX: 10, tileY: 25, buildingType: 'school', label: 'CENTRO DE ATENCIÓN' },
];

const DECORATIONS: MapDecoration[] = [
  { kind: 'entrance', tileX: 26, tileY: 35 },
  { kind: 'fountain', tileX: 26, tileY: 24 },
  { kind: 'mapBoard', tileX: 32, tileY: 33 },
  { kind: 'busStop', tileX: 6, tileY: 33 },
  { kind: 'crosswalk', tileX: 26, tileY: 36 },
  { kind: 'statue', tileX: 46, tileY: 22 },

  { kind: 'pine', tileX: 4, tileY: 6 },
  { kind: 'pine', tileX: 48, tileY: 6 },
  { kind: 'bloom', tileX: 4, tileY: 30 },
  { kind: 'bloom', tileX: 48, tileY: 30 },
  { kind: 'tree', tileX: 3, tileY: 14, size: 'lg' },
  { kind: 'tree', tileX: 49, tileY: 14, size: 'lg' },
  { kind: 'tree', tileX: 3, tileY: 22, size: 'lg' },
  { kind: 'tree', tileX: 49, tileY: 22, size: 'lg' },

  { kind: 'signpost', tileX: 18, tileY: 10 },
  { kind: 'signpost', tileX: 34, tileY: 10 },
  { kind: 'signpost', tileX: 6, tileY: 18 },
  { kind: 'signpost', tileX: 46, tileY: 18 },
  { kind: 'sign', tileX: 18, tileY: 9, text: '→ Hospital' },
  { kind: 'sign', tileX: 34, tileY: 9, text: '→ Comisaría' },
  { kind: 'sign', tileX: 6, tileY: 17, text: '→ Consultorio' },
  { kind: 'sign', tileX: 46, tileY: 17, text: '→ Universidad' },

  { kind: 'lamp', tileX: 20, tileY: 10 },
  { kind: 'lamp', tileX: 32, tileY: 10 },
  { kind: 'lamp', tileX: 20, tileY: 18 },
  { kind: 'lamp', tileX: 32, tileY: 18 },
  { kind: 'lamp', tileX: 20, tileY: 26 },
  { kind: 'lamp', tileX: 32, tileY: 26 },
  { kind: 'lamp', tileX: 26, tileY: 30 },
  { kind: 'lamp', tileX: 14, tileY: 34 },
  { kind: 'lamp', tileX: 38, tileY: 34 },

  { kind: 'bench', tileX: 22, tileY: 28 },
  { kind: 'bench', tileX: 30, tileY: 28 },
  { kind: 'bench', tileX: 24, tileY: 31 },
  { kind: 'bench', tileX: 28, tileY: 31 },
  { kind: 'bench', tileX: 8, tileY: 32 },

  { kind: 'fence', tileX: 7, tileY: 12 },
  { kind: 'fence', tileX: 13, tileY: 12 },
  { kind: 'fence', tileX: 39, tileY: 12 },
  { kind: 'fence', tileX: 45, tileY: 12 },
  { kind: 'fence', tileX: 7, tileY: 20 },
  { kind: 'fence', tileX: 45, tileY: 20 },
  { kind: 'fence', tileX: 7, tileY: 28 },
  { kind: 'fence', tileX: 45, tileY: 28 },

  { kind: 'bush', tileX: 14, tileY: 7 },
  { kind: 'bush', tileX: 38, tileY: 7 },
  { kind: 'bush', tileX: 6, tileY: 15 },
  { kind: 'bush', tileX: 46, tileY: 15 },
  { kind: 'bush', tileX: 6, tileY: 23 },
  { kind: 'bush', tileX: 46, tileY: 23 },
  { kind: 'bush', tileX: 14, tileY: 29 },
  { kind: 'bush', tileX: 38, tileY: 29 },
  { kind: 'bush', tileX: 22, tileY: 22 },
  { kind: 'bush', tileX: 30, tileY: 22 },
  { kind: 'bush', tileX: 23, tileY: 25 },
  { kind: 'bush', tileX: 29, tileY: 25 },

  { kind: 'flower', tileX: 21, tileY: 27 },
  { kind: 'flower', tileX: 31, tileY: 27 },
  { kind: 'flower', tileX: 24, tileY: 29 },
  { kind: 'flower', tileX: 28, tileY: 29 },
  { kind: 'flower', tileX: 12, tileY: 19 },
  { kind: 'flower', tileX: 40, tileY: 19 },
  { kind: 'flower', tileX: 12, tileY: 27 },
  { kind: 'flower', tileX: 40, tileY: 27 },
  { kind: 'flower', tileX: 17, tileY: 31 },
  { kind: 'flower', tileX: 35, tileY: 31 },

  { kind: 'sign', tileX: 26, tileY: 27, text: 'PLAZA CENTRAL' },
  { kind: 'sign', tileX: 26, tileY: 34, text: 'MIND-SPHERE · Simulador Clínico' },
];

export const ATTENTION_ROUTES_MAP: MapEnvironmentDef = {
  id: 'attention-routes',
  label: 'Campus MIND-SPHERE',
  description: 'Ciudad educativa de atención psicológica al atardecer',
  tileWidth: W,
  tileHeight: H,
  tileSize: 24,
  terrainGrid: buildHubTerrain(W, H),
  collisionGrid: [],
  spawn: { tileX: 26, tileY: 32 },
  landmarks: LANDMARKS,
  zoneSlots: LANDMARKS.map((lm) => ({
    tileX: lm.tileX,
    tileY: lm.tileY,
    interactable:
      lm.buildingType === 'hospital'
        ? 'patient'
        : lm.buildingType === 'police'
          ? 'npc'
          : lm.buildingType === 'clinic'
            ? 'terminal'
            : lm.buildingType === 'university'
              ? 'desk'
              : 'portal',
    label: lm.label,
    buildingType: lm.buildingType,
  })),
  decorations: DECORATIONS,
  palette: {
    floor: 0x3d6b35,
    floorAlt: 0x4a7d42,
    wall: 0x5d4037,
    wallEdge: 0x4fc3ff,
    accent: 0x4fc3ff,
    ambient: 0x1b5e20,
    grassTint: 0xffffff,
  },
};
