/**
 * Campus isométrico MIND-SPHERE — layout denso (referencia GARY)
 * Regenerar: pnpm assets:iso
 */
import { isoToWorld, ISO_TILE_W, ISO_TILE_H } from './iso-math.mjs';

export const W = 48;
export const H = 48;
export const CX = 24;
export const CY = 26;

export const ZONES = {
  plaza: { id: 'plaza', label: 'Plaza Central', tileX: CX, tileY: CY },
  hospital: { id: 'hospital', label: 'Hospital', tileX: CX, tileY: 9 },
  police: { id: 'police', label: 'Comisaría', tileX: 36, tileY: 11 },
  clinic: { id: 'clinic', label: 'Consultorio Psicológico', tileX: 9, tileY: 22 },
  university: { id: 'university', label: 'Universidad', tileX: 36, tileY: 32 },
  careCenter: { id: 'care-center', label: 'Centro de Atención', tileX: 9, tileY: 34 },
};

export const TILE = {
  grassA: 1,
  grassB: 2,
  grassC: 3,
  grassWarm: 4,
  pathStone: 5,
  pathEdge: 6,
  pathBorder: 7,
  plazaStone: 8,
  water: 9,
  gardenYellow: 10,
  gardenPurple: 11,
  hedge: 12,
  dirt: 13,
  flowersMix: 14,
  collision: 15,
};

/** Ejes principales + avenidas perimetrales */
export const PATH_SEGMENTS = [
  [CY, 6, 42],
  [CY - 8, 8, 40],
  [CY + 8, 8, 40],
  [CY - 14, 10, 38],
  [CY + 14, 10, 38],
  ['v', CX, 6, 42],
  ['v', CX - 10, 10, 38],
  ['v', CX + 10, 10, 38],
  ['v', CX - 18, 12, 36],
  ['v', CX + 18, 12, 36],
  [11, 14, 34],
  [33, 14, 34],
  [11, 36, 34],
  [33, 36, 34],
];

export const PLAZA_RING = { cx: CX, cy: CY, inner: 3, outer: 6 };

export const BUILDINGS = [
  {
    zoneIndex: 0,
    zoneId: 'hospital',
    id: 'hospital',
    label: 'HOSPITAL',
    buildingType: 'hospital',
    sprite: 'iso-building-hospital',
    tileX: ZONES.hospital.tileX,
    tileY: ZONES.hospital.tileY,
    footprint: { w: 5, h: 4 },
    props: [
      { sprite: 'iso-prop-ambulance', offsetTx: -3, offsetTy: 3 },
      { sprite: 'iso-prop-sign-hospital', offsetTx: 3, offsetTy: 2 },
      { sprite: 'iso-prop-emergency-sign', offsetTx: -1, offsetTy: 4 },
    ],
  },
  {
    zoneIndex: 1,
    zoneId: 'police',
    id: 'police',
    label: 'COMISARÍA',
    buildingType: 'police',
    sprite: 'iso-building-police',
    tileX: ZONES.police.tileX,
    tileY: ZONES.police.tileY,
    footprint: { w: 5, h: 4 },
    props: [
      { sprite: 'iso-prop-police-car', offsetTx: -3, offsetTy: 3 },
      { sprite: 'iso-prop-sign-police', offsetTx: 2, offsetTy: 2 },
    ],
  },
  {
    zoneIndex: 2,
    zoneId: 'clinic',
    id: 'clinic',
    label: 'CONSULTORIO',
    buildingType: 'clinic',
    sprite: 'iso-building-clinic',
    tileX: ZONES.clinic.tileX,
    tileY: ZONES.clinic.tileY,
    footprint: { w: 4, h: 3 },
    props: [
      { sprite: 'iso-prop-psi-banner', offsetTx: 0, offsetTy: -1 },
      { sprite: 'iso-prop-plant', offsetTx: -2, offsetTy: 2 },
      { sprite: 'iso-prop-plant', offsetTx: 2, offsetTy: 2 },
    ],
  },
  {
    zoneIndex: 3,
    zoneId: 'university',
    id: 'university',
    label: 'UNIVERSIDAD',
    buildingType: 'university',
    sprite: 'iso-building-university',
    tileX: ZONES.university.tileX,
    tileY: ZONES.university.tileY,
    footprint: { w: 6, h: 5 },
    props: [
      { sprite: 'iso-prop-statue', offsetTx: -3, offsetTy: 4 },
      { sprite: 'iso-prop-books', offsetTx: 3, offsetTy: 3 },
      { sprite: 'iso-prop-flag-pole', offsetTx: -1, offsetTy: 2 },
    ],
  },
  {
    zoneIndex: 4,
    zoneId: 'care-center',
    id: 'care-center',
    label: 'CENTRO DE ATENCIÓN',
    buildingType: 'school',
    sprite: 'iso-building-care-center',
    tileX: ZONES.careCenter.tileX,
    tileY: ZONES.careCenter.tileY,
    footprint: { w: 5, h: 4 },
    props: [
      { sprite: 'iso-prop-bench', offsetTx: 3, offsetTy: 3 },
      { sprite: 'iso-prop-signpost', offsetTx: -2, offsetTy: 2 },
    ],
  },
];

const TREE_SPRITES = ['iso-prop-tree-oak', 'iso-prop-tree-oak-lg', 'iso-prop-tree-pine', 'iso-prop-tree-lush'];
const BUSH_SPRITES = ['iso-prop-bush', 'iso-prop-bush-round', 'iso-prop-hedge'];
const FLOWER_SPRITES = ['iso-prop-flowers-yellow', 'iso-prop-flowers-purple', 'iso-prop-flowers'];

function pick(arr, i) {
  return arr[i % arr.length];
}

function ringAround(tx, ty, r, kind, layer = 'nature') {
  const out = [];
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) + Math.abs(dy) !== r) continue;
      if ((dx + dy + tx) % 2 !== 0) continue;
      out.push({ sprite: pick(BUSH_SPRITES, dx + dy + tx), layer, tileX: tx + dx, tileY: ty + dy, kind });
    }
  }
  return out;
}

function corridorNature(y, x0, x1, side) {
  const out = [];
  for (let x = x0; x <= x1; x += 2) {
    if (x % 4 === 0) {
      out.push({ sprite: pick(TREE_SPRITES, x), layer: 'nature', tileX: x + side, tileY: y + (side > 0 ? 1 : -1), kind: 'tree' });
    } else if (x % 4 === 2) {
      out.push({ sprite: pick(FLOWER_SPRITES, x), layer: 'nature', tileX: x + side * 2, tileY: y, kind: 'flowers' });
    } else {
      out.push({ sprite: pick(BUSH_SPRITES, x + y), layer: 'nature', tileX: x + side, tileY: y, kind: 'bush' });
    }
  }
  return out;
}

function corridorNatureV(x, y0, y1, side) {
  const out = [];
  for (let y = y0; y <= y1; y += 2) {
    if (y % 4 === 0) {
      out.push({ sprite: pick(TREE_SPRITES, y), layer: 'nature', tileX: x + (side > 0 ? 1 : -1), tileY: y, kind: 'tree' });
    } else if (y % 4 === 2) {
      out.push({ sprite: pick(FLOWER_SPRITES, y), layer: 'nature', tileX: x, tileY: y + side, kind: 'flowers' });
    } else if (y % 8 === 1) {
      out.push({ sprite: 'iso-prop-lamp', layer: 'lighting', tileX: x + side * 2, tileY: y, kind: 'lamp' });
    }
  }
  return out;
}

/** Genera decoración densa — ~5× vs layout anterior */
function buildDenseDecor() {
  const decor = [
    { sprite: 'iso-prop-fountain', layer: 'props', tileX: CX, tileY: CY, kind: 'fountain' },
    { sprite: 'iso-prop-bench', layer: 'props', tileX: CX - 3, tileY: CY, kind: 'bench' },
    { sprite: 'iso-prop-bench', layer: 'props', tileX: CX + 3, tileY: CY, kind: 'bench' },
    { sprite: 'iso-prop-map-board', layer: 'props', tileX: CX + 5, tileY: CY + 3, kind: 'sign' },
    { sprite: 'iso-prop-entrance-gate', layer: 'props', tileX: CX, tileY: 44, kind: 'entrance' },
  ];

  for (const seg of PATH_SEGMENTS) {
    if (seg[0] === 'v') {
      const [, x, y0, y1] = seg;
      decor.push(...corridorNatureV(x, y0, y1, 1));
      decor.push(...corridorNatureV(x, y0, y1, -1));
    } else {
      const [y, x0, x1] = seg;
      decor.push(...corridorNature(y, x0, x1, 1));
      decor.push(...corridorNature(y, x0, x1, -1));
    }
  }

  for (const b of BUILDINGS) {
    decor.push(...ringAround(b.tileX, b.tileY, 3, 'building-ring'));
    decor.push(...ringAround(b.tileX, b.tileY, 4, 'outer-ring'));
  }

  for (let dy = -PLAZA_RING.outer; dy <= PLAZA_RING.outer; dy++) {
    for (let dx = -PLAZA_RING.outer; dx <= PLAZA_RING.outer; dx++) {
      const tx = CX + dx;
      const ty = CY + dy;
      const dist = Math.hypot(dx, dy);
      if (dist >= PLAZA_RING.inner && dist <= PLAZA_RING.outer + 0.5) {
        if ((dx + dy) % 2 === 0) {
          decor.push({ sprite: pick(FLOWER_SPRITES, tx + ty), layer: 'nature', tileX: tx, tileY: ty, kind: 'flowers' });
        } else if ((dx + dy) % 3 === 0) {
          decor.push({ sprite: 'iso-prop-lamp', layer: 'lighting', tileX: tx, tileY: ty, kind: 'lamp' });
        } else {
          decor.push({ sprite: pick(BUSH_SPRITES, tx), layer: 'nature', tileX: tx, tileY: ty, kind: 'bush' });
        }
      }
    }
  }

  const corners = [
    [4, 4], [W - 5, 4], [4, H - 5], [W - 5, H - 5],
    [CX, 4], [CX, H - 5], [4, CY], [W - 5, CY],
  ];
  for (const [tx, ty] of corners) {
    decor.push({ sprite: 'iso-prop-tree-oak-lg', layer: 'nature', tileX: tx, tileY: ty, kind: 'tree' });
    decor.push({ sprite: pick(BUSH_SPRITES, tx), layer: 'nature', tileX: tx + 1, tileY: ty, kind: 'bush' });
    decor.push({ sprite: pick(FLOWER_SPRITES, ty), layer: 'nature', tileX: tx, tileY: ty + 1, kind: 'flowers' });
  }

  for (let x = 10; x < W - 10; x += 5) {
    for (let y = 10; y < H - 10; y += 6) {
      if ((x * 7 + y * 13) % 13 > 4) continue;
      const onPath = PATH_SEGMENTS.some((seg) => {
        if (seg[0] === 'v') return Math.abs(x - seg[1]) <= 1 && y >= seg[2] && y <= seg[3];
        return Math.abs(y - seg[0]) <= 1 && x >= seg[1] && x <= seg[2];
      });
      if (onPath) continue;
      const nearBuilding = BUILDINGS.some((b) => Math.abs(x - b.tileX) + Math.abs(y - b.tileY) < 3);
      if (nearBuilding) continue;
      decor.push({
        sprite: pick([...BUSH_SPRITES, ...FLOWER_SPRITES], x + y),
        layer: 'nature',
        tileX: x,
        tileY: y,
        kind: 'scatter',
      });
    }
  }

  const seen = new Set();
  return decor.filter((d) => {
    const k = `${d.tileX},${d.tileY},${d.sprite}`;
    if (seen.has(k)) return false;
    if (d.tileX < 1 || d.tileY < 1 || d.tileX >= W - 1 || d.tileY >= H - 1) return false;
    seen.add(k);
    return true;
  });
}

export const DECOR = buildDenseDecor();

export const NPCS = [
  { id: 'gary', sprite: 'iso-gary-sheet', tileX: CX - 2, tileY: CY + 4, role: 'guide' },
  { id: 'npc-student-a', sprite: 'iso-npc-sheet', tileX: CX + 3, tileY: CY + 2, role: 'ambient' },
  { id: 'npc-student-b', sprite: 'iso-npc-sheet', tileX: 18, tileY: 24, role: 'ambient' },
  { id: 'npc-student-c', sprite: 'iso-npc-sheet', tileX: 30, tileY: 20, role: 'ambient' },
  { id: 'npc-student-d', sprite: 'iso-npc-sheet', tileX: 20, tileY: 34, role: 'ambient' },
];

export const SPAWN = { tileX: CX, tileY: CY + 6 };

export function doorWorld(building) {
  const doorTx = building.tileX;
  const doorTy = building.tileY + Math.floor(building.footprint.h / 2) + 1;
  const p = isoToWorld(doorTx, doorTy, ISO_TILE_W, ISO_TILE_H);
  return { doorX: p.x, doorY: p.y, tileX: doorTx, tileY: doorTy };
}

export function zonesMeta() {
  return BUILDINGS.map((b) => {
    const door = doorWorld(b);
    return {
      zoneIndex: b.zoneIndex,
      zoneId: b.zoneId,
      buildingType: b.buildingType,
      label: b.label,
      tileX: door.tileX,
      tileY: door.tileY,
      doorX: door.doorX,
      doorY: door.doorY,
      sprite: b.sprite,
      footprint: b.footprint,
    };
  });
}

export function spawnWorld() {
  const p = isoToWorld(SPAWN.tileX, SPAWN.tileY, ISO_TILE_W, ISO_TILE_H);
  return { tileX: SPAWN.tileX, tileY: SPAWN.tileY, x: p.x, y: p.y };
}
