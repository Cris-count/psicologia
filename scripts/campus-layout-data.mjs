/**
 * Mapa institucional MIND-SPHERE v3 — compacto, acotado, navegable.
 * Todos los edificios dentro del área jugable; calles conectadas.
 */
export const TILE = 16;
export const SCALE = 2;
export const W = 40;
export const H = 28;
export const CX = 20;
export const CY = 14;

export const GRASS_VARIANTS = [1, 2, 3];
export const PATH_GID = 4;
export const PATH_ALT_GID = 5;
export const SIDEWALK_GID = 11;
export const CROSSWALK_GID = 12;
export const RAIL_H_GID = 6;
export const RAIL_V_GID = 7;
export const BUSH_GID = 8;
export const TREE_GID = 9;
export const POOL_GID = 10;
export const WATER_GID = POOL_GID;

/** Borde sólido de 2 tiles — límite real del mapa */
export const FOREST_BORDER = 2;

/** Cuadrícula urbana compacta */
export const GRID_H_STREETS = [5, 11, 17, 23];
export const GRID_V_STREETS = [5, 13, 21, 29];

export const CENTRAL_PARK = { x0: 14, y0: 7, x1: 20, y1: 10 };
export const PLAZA_WATER = { x0: 16, y0: 8, x1: 18, y1: 9 };

/** Edificios de misión — bien visibles en fila superior */
export const MISSION_BUILDINGS = [
  {
    zoneIndex: 0,
    id: 'hospital',
    label: 'HOSPITAL',
    buildingType: 'hospital',
    sprite: 'building-hospital',
    x: 4,
    y: 3,
    scale: 0.68,
    doorOffset: { dx: 0, dy: 2 },
    missionHighlight: true,
    props: [
      { sprite: 'prop-ambulance', dx: 38, dy: 22, blocking: true },
      { sprite: 'prop-flower', dx: -28, dy: 18 },
    ],
  },
  {
    zoneIndex: 1,
    id: 'comisaria',
    label: 'COMISARÍA',
    buildingType: 'comisaria',
    sprite: 'building-comisaria',
    x: 32,
    y: 3,
    scale: 0.68,
    doorOffset: { dx: 0, dy: 2 },
    missionHighlight: true,
    props: [{ sprite: 'prop-flower', dx: -30, dy: 18 }],
  },
];

export const CITY_BUILDINGS = [
  { id: 'fiscalia', label: 'FISCALÍA', sprite: 'building-fiscalia', x: 10, y: 3, scale: 0.64, doorOffset: { dx: 0, dy: 2 }, props: [] },
  { id: 'escuela', label: 'ESCUELA', sprite: 'building-school', x: 16, y: 3, scale: 0.66, doorOffset: { dx: 0, dy: 2 }, props: [{ sprite: 'prop-books', dx: 34, dy: 20 }] },
  { id: 'police', label: 'POLICÍA', sprite: 'building-police', x: 24, y: 3, scale: 0.64, doorOffset: { dx: 0, dy: 2 }, props: [{ sprite: 'prop-police-car', dx: 36, dy: 20, blocking: true }] },
  { id: 'biblioteca', label: 'BIBLIOTECA', sprite: 'building-library', x: 4, y: 9, scale: 0.64, doorOffset: { dx: 0, dy: 2 }, props: [{ sprite: 'prop-books', dx: 32, dy: 18 }] },
  { id: 'mental-health', label: 'SALUD MENTAL', sprite: 'building-mental-health', x: 10, y: 9, scale: 0.64, doorOffset: { dx: 0, dy: 2 }, props: [] },
  { id: 'icbf', label: 'ICBF', sprite: 'building-icbf', x: 28, y: 9, scale: 0.64, doorOffset: { dx: 0, dy: 2 }, props: [] },
  { id: 'bienestar', label: 'BIENESTAR', sprite: 'building-bienestar', x: 32, y: 9, scale: 0.64, doorOffset: { dx: 0, dy: 2 }, props: [] },
  { id: 'salon-comunal', label: 'SALÓN COMUNAL', sprite: 'building-salon-comunal', x: 16, y: 15, scale: 0.64, doorOffset: { dx: 0, dy: 2 }, props: [{ sprite: 'prop-bench', dx: 34, dy: 18 }] },
  { id: 'farmacia', label: 'FARMACIA', sprite: 'building-farmacia', x: 4, y: 15, scale: 0.62, doorOffset: { dx: 0, dy: 2 }, props: [] },
  { id: 'tienda', label: 'TIENDA', sprite: 'building-tienda', x: 10, y: 15, scale: 0.62, doorOffset: { dx: 0, dy: 2 }, props: [] },
  { id: 'cafeteria', label: 'CAFETERÍA', sprite: 'building-cafeteria', x: 22, y: 15, scale: 0.62, doorOffset: { dx: 0, dy: 2 }, props: [{ sprite: 'prop-bench', dx: 30, dy: 16 }] },
  { id: 'casa-1', label: 'CASA', sprite: 'building-casa', x: 28, y: 15, scale: 0.6, doorOffset: { dx: 0, dy: 2 }, props: [] },
  { id: 'cancha', label: 'CANCHA', sprite: 'building-cancha', x: 10, y: 21, scale: 0.66, doorOffset: { dx: 0, dy: 2 }, props: [] },
  { id: 'terminal', label: 'TERMINAL', sprite: 'building-terminal', x: 28, y: 21, scale: 0.64, doorOffset: { dx: 0, dy: 2 }, props: [{ sprite: 'prop-bus', dx: 38, dy: 18, blocking: true }] },
  { id: 'casa-2', label: 'CASA', sprite: 'building-casa', x: 32, y: 21, scale: 0.6, doorOffset: { dx: 0, dy: 2 }, props: [{ sprite: 'prop-flower', dx: 28, dy: 14 }] },
];

export const BUILDINGS = [
  ...MISSION_BUILDINGS,
  ...CITY_BUILDINGS.map((b) => ({ ...b, zoneIndex: -1, buildingType: 'generic', missionHighlight: false })),
];

export const TREES = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const border = x < FOREST_BORDER || x >= W - FOREST_BORDER || y < FOREST_BORDER || y >= H - FOREST_BORDER;
    if (!border) continue;
    TREES.push({ x, y, gid: TREE_GID });
  }
}

export const GARDEN = [];
for (const b of BUILDINGS) {
  for (const [dx, dy] of [[-1, 1], [1, 1], [0, 2]]) {
    const gx = b.x + dx;
    const gy = b.y + dy;
    if (GRID_H_STREETS.includes(gy) || GRID_V_STREETS.includes(gx)) continue;
    GARDEN.push({ x: gx, y: gy, gid: BUSH_GID });
  }
}
for (let y = CENTRAL_PARK.y0; y <= CENTRAL_PARK.y1; y++) {
  for (let x = CENTRAL_PARK.x0; x <= CENTRAL_PARK.x1; x++) {
    if ((x + y) % 2 === 0) GARDEN.push({ x, y, gid: GRASS_VARIANTS[2] });
    if ((x + y) % 4 === 0) GARDEN.push({ x, y, gid: BUSH_GID });
  }
}

const decorBase = [
  { sprite: 'prop-fountain', x: 17, y: 9, scale: 0.68 },
  { sprite: 'prop-bench', x: 15, y: 10, scale: 0.82 },
  { sprite: 'prop-bench', x: 19, y: 10, scale: 0.82 },
  { sprite: 'prop-tree-lg', x: 14, y: 7, scale: 0.9 },
  { sprite: 'prop-tree-lg', x: 20, y: 7, scale: 0.9 },
  { sprite: 'prop-tree-lg', x: 14, y: 10, scale: 0.88 },
  { sprite: 'prop-tree-lg', x: 20, y: 10, scale: 0.88 },
  { sprite: 'prop-lamp', x: 5, y: 5, scale: 0.85 },
  { sprite: 'prop-lamp', x: 13, y: 5, scale: 0.85 },
  { sprite: 'prop-lamp', x: 21, y: 5, scale: 0.85 },
  { sprite: 'prop-lamp', x: 29, y: 5, scale: 0.85 },
  { sprite: 'prop-lamp', x: 5, y: 11, scale: 0.85 },
  { sprite: 'prop-lamp', x: 29, y: 11, scale: 0.85 },
  { sprite: 'prop-lamp', x: 5, y: 17, scale: 0.85 },
  { sprite: 'prop-lamp', x: 29, y: 17, scale: 0.85 },
  { sprite: 'prop-lamp', x: 13, y: 23, scale: 0.85 },
  { sprite: 'prop-lamp', x: 21, y: 23, scale: 0.85 },
  { sprite: 'prop-lamp', x: 13, y: 17, scale: 0.85 },
  { sprite: 'prop-lamp', x: 21, y: 17, scale: 0.85 },
  { sprite: 'prop-lamp', x: 7, y: 11, scale: 0.82 },
  { sprite: 'prop-lamp', x: 33, y: 11, scale: 0.82 },
  { sprite: 'prop-flower', x: 6, y: 8, scale: 0.8 },
  { sprite: 'prop-flower', x: 34, y: 8, scale: 0.8 },
  { sprite: 'prop-bush', x: 6, y: 14, scale: 0.82 },
  { sprite: 'prop-bush', x: 34, y: 14, scale: 0.82 },
  { sprite: 'prop-signpost', x: CX, y: 22, scale: 0.88 },
  { sprite: 'prop-fence', x: 3, y: 2, scale: 0.75 },
  { sprite: 'prop-fence', x: 36, y: 2, scale: 0.75 },
  { sprite: 'prop-flower', x: 7, y: 6, scale: 0.75 },
  { sprite: 'prop-flower', x: 33, y: 6, scale: 0.75 },
  { sprite: 'prop-bush', x: 8, y: 12, scale: 0.78 },
  { sprite: 'prop-bush', x: 24, y: 12, scale: 0.78 },
  { sprite: 'prop-bench', x: 12, y: 18, scale: 0.78 },
  { sprite: 'prop-bench', x: 24, y: 18, scale: 0.78 },
];

export const DECOR = [...decorBase];
for (let i = 0; i < 24; i++) {
  const x = 4 + ((i * 11) % 32);
  const y = 4 + ((i * 7) % 20);
  if (GRID_H_STREETS.includes(y) || GRID_V_STREETS.includes(x)) continue;
  if (x >= CENTRAL_PARK.x0 && x <= CENTRAL_PARK.x1 && y >= CENTRAL_PARK.y0 && y <= CENTRAL_PARK.y1) continue;
  DECOR.push({
    sprite: i % 3 === 0 ? 'prop-flower' : i % 3 === 1 ? 'prop-bush' : 'prop-tree',
    x,
    y,
    scale: 0.7 + (i % 3) * 0.06,
  });
}
for (const [x, y] of [
  [12, 12], [18, 8], [26, 16], [18, 22],
]) {
  DECOR.push({ sprite: `prop-citizen-${(x + y) % 3}`, x, y, scale: 0.74 });
}

export const BLOCKING_DECOR = new Set([
  'prop-fountain',
  'prop-tree',
  'prop-tree-lg',
  'prop-bench',
  'prop-signpost',
  'prop-bus',
  'prop-police-car',
  'prop-fence',
  'prop-ambulance',
]);

/** Spawn en cruce central inferior — siempre transitables */
export const SPAWN = { tileX: 17, tileY: 23 };

export const WALKABLE_ROAD_GIDS = new Set([PATH_GID, PATH_ALT_GID, SIDEWALK_GID, CROSSWALK_GID]);

export function tileToPx(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

export function doorTileFor(b) {
  const off = b.doorOffset ?? { dx: 0, dy: 2 };
  return { x: b.x + off.dx, y: b.y + off.dy };
}

export function zonesMeta() {
  return MISSION_BUILDINGS.map((b) => {
    const dt = doorTileFor(b);
    const door = tileToPx(dt.x, dt.y);
    return {
      zoneIndex: b.zoneIndex,
      buildingType: b.buildingType,
      label: b.label,
      tileX: b.x,
      tileY: dt.y,
      doorX: door.x,
      doorY: door.y,
      sprite: b.sprite,
      scale: b.scale,
    };
  });
}

export const ROAD_LOOPS = [];
export const ROAD_SPOKES = [];
export const ROAD_ARCS = [];
export const RAIL_LINE = { x: -1, y0: 0, y1: 0 };
export const RAIL_CROSS = { y: -1, x0: 0, x1: 0 };
