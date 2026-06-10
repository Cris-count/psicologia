/**
 * Genera mapa Tiled — ciudad educativa MIND-SPHERE (tileset propio).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BLOCKING_DECOR,
  BUILDINGS,
  CROSSWALK_GID,
  DECOR,
  FOREST_BORDER,
  GARDEN,
  GRASS_VARIANTS,
  GRID_H_STREETS,
  GRID_V_STREETS,
  H,
  MISSION_BUILDINGS,
  PATH_ALT_GID,
  PATH_GID,
  PLAZA_WATER,
  SCALE,
  SIDEWALK_GID,
  SPAWN,
  TILE,
  TREE_GID,
  TREES,
  W,
  WATER_GID,
  WALKABLE_ROAD_GIDS,
  doorTileFor,
  zonesMeta,
  tileToPx,
} from './campus-layout-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public/assets/tilemaps');

await mkdir(outDir, { recursive: true });

const ground = Array.from({ length: H }, (_, y) =>
  Array.from({ length: W }, (_, x) => GRASS_VARIANTS[(x * 3 + y * 7 + x * y) % GRASS_VARIANTS.length]),
);
const road = Array.from({ length: H }, () => Array(W).fill(0));
const nature = Array.from({ length: H }, () => Array(W).fill(0));
const collision = Array.from({ length: H }, () => Array(W).fill(0));

function inBounds(x, y) {
  return x >= 0 && y >= 0 && x < W && y < H;
}

function setRoad(x, y, gid = PATH_GID) {
  if (!inBounds(x, y)) return;
  road[y][x] = gid;
}

function paintLine(x0, y0, x1, y1, width = 1) {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  for (;;) {
    for (let ox = -width; ox <= width; ox++) {
      for (let oy = -Math.floor(width / 2); oy <= Math.floor(width / 2); oy++) {
        setRoad(x + ox, y + oy);
      }
    }
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

for (const y of GRID_H_STREETS) {
  for (let x = FOREST_BORDER; x < W - FOREST_BORDER; x++) {
    setRoad(x, y, PATH_GID);
    if (x % 4 === 0) setRoad(x, y, PATH_ALT_GID);
    if (y > 0 && inBounds(x, y - 1) && !GRID_H_STREETS.includes(y - 1) && !GRID_V_STREETS.includes(x)) {
      setRoad(x, y - 1, SIDEWALK_GID);
    }
    if (y < H - 1 && inBounds(x, y + 1) && !GRID_H_STREETS.includes(y + 1) && !GRID_V_STREETS.includes(x)) {
      setRoad(x, y + 1, SIDEWALK_GID);
    }
  }
}

for (const x of GRID_V_STREETS) {
  for (let y = FOREST_BORDER; y < H - FOREST_BORDER; y++) {
    setRoad(x, y, PATH_GID);
    if (y % 4 === 0) setRoad(x, y, PATH_ALT_GID);
    if (x > 0 && inBounds(x - 1, y) && !GRID_V_STREETS.includes(x - 1) && !GRID_H_STREETS.includes(y)) {
      setRoad(x - 1, y, SIDEWALK_GID);
    }
    if (x < W - 1 && inBounds(x + 1, y) && !GRID_V_STREETS.includes(x + 1) && !GRID_H_STREETS.includes(y)) {
      setRoad(x + 1, y, SIDEWALK_GID);
    }
  }
}

for (const y of GRID_H_STREETS) {
  for (const x of GRID_V_STREETS) {
    if (inBounds(x, y)) setRoad(x, y, CROSSWALK_GID);
    if (inBounds(x - 1, y)) setRoad(x - 1, y, CROSSWALK_GID);
    if (inBounds(x + 1, y)) setRoad(x + 1, y, CROSSWALK_GID);
    if (inBounds(x, y - 1)) setRoad(x, y - 1, CROSSWALK_GID);
    if (inBounds(x, y + 1)) setRoad(x, y + 1, CROSSWALK_GID);
  }
}

if (PLAZA_WATER.x1 >= PLAZA_WATER.x0) {
  for (let y = PLAZA_WATER.y0; y <= PLAZA_WATER.y1; y++)
    for (let x = PLAZA_WATER.x0; x <= PLAZA_WATER.x1; x++) nature[y][x] = WATER_GID;
}

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const border = x < FOREST_BORDER || x >= W - FOREST_BORDER || y < FOREST_BORDER || y >= H - FOREST_BORDER;
    if (!border) continue;
    nature[y][x] = TREE_GID;
    collision[y][x] = 1;
  }
}

for (const { x, y, gid } of TREES) {
  if (road[y][x]) continue;
  nature[y][x] = gid;
}
for (const { x, y, gid } of GARDEN) {
  if (!road[y][x] && !nature[y][x]) nature[y][x] = gid;
}

for (const b of BUILDINGS) {
  for (let dy = -2; dy <= 4; dy++)
    for (let dx = -4; dx <= 4; dx++) {
      const px = b.x + dx;
      const py = b.y + dy;
      if (inBounds(px, py)) collision[py][px] = 1;
    }
}

/** Solo calles/andenes son transitables; todo lo demás bloquea */
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (WALKABLE_ROAD_GIDS.has(road[y][x])) {
      collision[y][x] = 0;
    } else if (collision[y][x] === 0) {
      collision[y][x] = 1;
    }
  }
}

/** Asegurar puertas de misión en calle transitables */
for (const b of MISSION_BUILDINGS) {
  const dt = doorTileFor(b);
  if (inBounds(dt.x, dt.y)) collision[dt.y][dt.x] = 0;
}

for (const { x, y } of TREES) {
  collision[y][x] = 1;
}

for (const d of DECOR) {
  if (!BLOCKING_DECOR.has(d.sprite)) continue;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const px = d.x + dx;
      const py = d.y + dy;
      if (inBounds(px, py)) collision[py][px] = 1;
    }
}

function layer(name, data, id) {
  return { id, name, type: 'tilelayer', x: 0, y: 0, width: W, height: H, opacity: 1, visible: true, data: data.flat() };
}

const spawnPx = tileToPx(SPAWN.tileX, SPAWN.tileY);
const meta = {
  mapId: 'mind-sphere-campus',
  tileSize: TILE,
  displayScale: SCALE,
  width: W,
  height: H,
  zones: zonesMeta(),
  buildings: BUILDINGS,
  decor: DECOR,
  spawn: { tileX: SPAWN.tileX, tileY: SPAWN.tileY, x: spawnPx.x, y: spawnPx.y },
  tileset: 'edu-city',
  credit: 'Mapa institucional MIND-SPHERE v3 — límites y colisiones',
  bounds: { minX: 0, minY: 0, maxX: W * TILE, maxY: H * TILE },
};

const interactionObjects = MISSION_BUILDINGS.map((b, i) => {
  const dt = doorTileFor(b);
  const door = tileToPx(dt.x, dt.y);
  return {
    id: i + 1,
    name: b.id,
    type: 'zone',
    x: (b.x - 3) * TILE,
    y: (b.y - 1) * TILE,
    width: 6 * TILE,
    height: 6 * TILE,
    properties: [
      { name: 'zoneIndex', type: 'int', value: b.zoneIndex },
      { name: 'buildingType', type: 'string', value: b.buildingType },
      { name: 'label', type: 'string', value: b.label },
      { name: 'doorX', type: 'float', value: door.x },
      { name: 'doorY', type: 'float', value: door.y },
    ],
  };
});

interactionObjects.push({
  id: 99,
  name: 'spawn',
  type: 'spawn',
  x: spawnPx.x - TILE / 2,
  y: spawnPx.y - TILE / 2,
  width: TILE,
  height: TILE,
  properties: [{ name: 'spawn', type: 'bool', value: true }],
});

const lampPositions = DECOR.filter((d) => d.sprite === 'prop-lamp');
const lightObjects = lampPositions.map((l, i) => ({
  id: 100 + i,
  name: `lamp_${i}`,
  type: 'light',
  x: l.x * TILE + TILE / 2,
  y: l.y * TILE + TILE / 2,
  width: 0,
  height: 0,
  point: true,
  properties: [{ name: 'radius', type: 'int', value: 100 }],
}));

const TILESET_COLS = 8;
const TILESET_ROWS = 2;
const TILESET_COUNT = 12;

const tiled = {
  compressionlevel: -1,
  height: H,
  width: W,
  tiledversion: '1.10.2',
  tileheight: TILE,
  tilewidth: TILE,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  infinite: false,
  nextlayerid: 10,
  nextobjectid: 200,
  properties: [{ name: 'scale', type: 'int', value: SCALE }],
  tilesets: [
    {
      columns: TILESET_COLS,
      firstgid: 1,
      image: 'edu-city-tileset.png',
      imageheight: TILESET_ROWS * TILE,
      imagewidth: TILESET_COLS * TILE,
      margin: 0,
      name: 'edu-city',
      spacing: 0,
      tilecount: TILESET_COUNT,
      tileheight: TILE,
      tilewidth: TILE,
    },
  ],
  layers: [
    layer('Ground', ground, 1),
    layer('Road', road, 2),
    layer('Nature', nature, 3),
    layer('Collision', collision, 4),
    { id: 5, name: 'Interaction', type: 'objectgroup', draworder: 'topdown', objects: interactionObjects },
    { id: 6, name: 'Lighting', type: 'objectgroup', draworder: 'topdown', objects: lightObjects },
  ],
};

await writeFile(path.join(outDir, 'mind-sphere-campus.json'), JSON.stringify(tiled));
await writeFile(path.join(outDir, 'mind-sphere-campus.meta.json'), JSON.stringify(meta, null, 2));

const tsMeta = `import { CampusMeta } from './campus.types';

/** Generado por scripts/build-tiled-campus-map.mjs — ciudad educativa */
export const CAMPUS_META: CampusMeta = ${JSON.stringify(meta, null, 2)};
`;
await writeFile(path.join(root, 'src/app/features/student/mission/game2d/campus/campus.meta.ts'), tsMeta);

console.log('✓ Mapa institucional', W, '×', H, '·', BUILDINGS.length, 'edificios ·', TREES.length, 'árboles');
