/**
 * Mapa Tiled isométrico + meta TypeScript + plantilla .tmx
 */
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  W,
  H,
  TILE,
  PATH_SEGMENTS,
  PLAZA_RING,
  BUILDINGS,
  DECOR,
  NPCS,
  SPAWN,
  zonesMeta,
  spawnWorld,
} from './iso/iso-layout-data.mjs';
import { ISO_TILE_W, ISO_TILE_H } from './iso/iso-math.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const tiledDir = path.join(root, 'public/assets/iso/tiled');
const metaTs = path.join(root, 'src/app/features/student/mission/game2d/iso/iso.meta.ts');

await mkdir(tiledDir, { recursive: true });
await mkdir(path.dirname(metaTs), { recursive: true });

const ground = Array.from({ length: H }, (_, y) =>
  Array.from({ length: W }, (_, x) => {
    const v = (x * 3 + y * 7) % 3;
    return v === 0 ? TILE.grassA : v === 1 ? TILE.grassB : TILE.grassC;
  }),
);
const paths = Array.from({ length: H }, () => Array(W).fill(0));
const nature = Array.from({ length: H }, () => Array(W).fill(0));
const collision = Array.from({ length: H }, () => Array(W).fill(0));

for (const seg of PATH_SEGMENTS) {
  if (seg[0] === 'v') {
    const [, x, y0, y1] = seg;
    for (let y = y0; y <= y1; y++) paths[y][x] = TILE.pathStone;
  } else {
    const [y, x0, x1] = seg;
    for (let x = x0; x <= x1; x++) paths[y][x] = TILE.pathStone;
  }
}

for (let dy = -PLAZA_RING.outer; dy <= PLAZA_RING.outer; dy++) {
  for (let dx = -PLAZA_RING.outer; dx <= PLAZA_RING.outer; dx++) {
    const tx = PLAZA_RING.cx + dx;
    const ty = PLAZA_RING.cy + dy;
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
    const dist = Math.hypot(dx, dy);
    if (dist >= PLAZA_RING.inner + 0.5 && dist <= PLAZA_RING.outer + 0.3) {
      paths[ty][tx] = Math.abs(dx) === Math.abs(dy) ? TILE.pathEdge : TILE.plazaStone;
    }
    if (dist <= PLAZA_RING.inner - 0.3 && dist > 0.4) {
      nature[ty][tx] = (dx + dy) % 2 === 0 ? TILE.gardenYellow : TILE.gardenPurple;
    }
  }
}

for (const seg of PATH_SEGMENTS) {
  if (seg[0] === 'v') {
    const [, x, y0, y1] = seg;
    for (let y = y0; y <= y1; y++) {
      if (x - 2 >= 0 && paths[y][x - 2] === 0) nature[y][x - 2] = y % 3 === 0 ? TILE.gardenYellow : TILE.hedge;
      if (x + 2 < W && paths[y][x + 2] === 0) nature[y][x + 2] = y % 3 === 1 ? TILE.gardenPurple : TILE.hedge;
    }
  } else {
    const [y, x0, x1] = seg;
    for (let x = x0; x <= x1; x++) {
      if (y - 2 >= 0 && paths[y - 2][x] === 0) nature[y - 2][x] = x % 3 === 0 ? TILE.gardenPurple : TILE.flowersMix;
      if (y + 2 < H && paths[y + 2][x] === 0) nature[y + 2][x] = x % 3 === 1 ? TILE.gardenYellow : TILE.hedge;
    }
  }
}

for (const b of BUILDINGS) {
  const fw = b.footprint.w;
  const fh = b.footprint.h;
  for (let dy = -1; dy <= fh; dy++)
    for (let dx = -Math.floor(fw / 2); dx <= Math.floor(fw / 2); dx++) {
      const px = b.tileX + dx;
      const py = b.tileY + dy;
      if (px >= 0 && px < W && py >= 0 && py < H) collision[py][px] = TILE.collision;
    }
}

function layer(name, data, id) {
  return { id, name, type: 'tilelayer', x: 0, y: 0, width: W, height: H, opacity: 1, visible: name !== 'Collision', data: data.flat() };
}

function objLayer(name, id, objects) {
  return { id, name, type: 'objectgroup', x: 0, y: 0, opacity: 1, visible: true, draworder: 'topdown', objects };
}

const tileObjects = [];
let oid = 1;

for (const b of BUILDINGS) {
  tileObjects.push({
    id: oid++,
    name: b.id,
    type: 'building',
    x: b.tileX * ISO_TILE_W,
    y: b.tileY * ISO_TILE_H,
    width: 0,
    height: 0,
    properties: [
      { name: 'sprite', type: 'string', value: b.sprite },
      { name: 'zoneIndex', type: 'int', value: b.zoneIndex },
      { name: 'label', type: 'string', value: b.label },
      { name: 'tileX', type: 'int', value: b.tileX },
      { name: 'tileY', type: 'int', value: b.tileY },
    ],
  });
  for (const p of b.props ?? []) {
    tileObjects.push({
      id: oid++,
      name: p.sprite,
      type: 'prop',
      x: (b.tileX + p.offsetTx) * ISO_TILE_W,
      y: (b.tileY + p.offsetTy) * ISO_TILE_H,
      width: 0,
      height: 0,
      properties: [{ name: 'sprite', type: 'string', value: p.sprite }],
    });
  }
}

const decorObjects = DECOR.map((d) => ({
  id: oid++,
  name: d.sprite,
  type: d.layer === 'lighting' ? 'light' : 'decor',
  x: d.tileX * ISO_TILE_W,
  y: d.tileY * ISO_TILE_H,
  width: 0,
  height: 0,
  properties: [
    { name: 'sprite', type: 'string', value: d.sprite },
    { name: 'kind', type: 'string', value: d.kind },
    { name: 'tileX', type: 'int', value: d.tileX },
    { name: 'tileY', type: 'int', value: d.tileY },
  ],
}));

const npcObjects = NPCS.map((n) => ({
  id: oid++,
  name: n.id,
  type: 'npc',
  x: n.tileX * ISO_TILE_W,
  y: n.tileY * ISO_TILE_H,
  width: 0,
  height: 0,
  properties: [
    { name: 'sprite', type: 'string', value: n.sprite },
    { name: 'role', type: 'string', value: n.role },
    { name: 'tileX', type: 'int', value: n.tileX },
    { name: 'tileY', type: 'int', value: n.tileY },
  ],
}));

const interactionObjects = zonesMeta().map((z, i) => ({
  id: oid++,
  name: `zone-${z.zoneIndex}`,
  type: 'interaction',
  x: z.doorX - 40,
  y: z.doorY - 20,
  width: 80,
  height: 60,
  properties: [
    { name: 'zoneIndex', type: 'int', value: z.zoneIndex },
    { name: 'doorX', type: 'float', value: z.doorX },
    { name: 'doorY', type: 'float', value: z.doorY },
    { name: 'label', type: 'string', value: z.label },
  ],
}));

const TILE_COUNT = 15;
const mapJson = {
  compressionlevel: -1,
  height: H,
  width: W,
  infinite: false,
  orientation: 'isometric',
  renderorder: 'right-down',
  tiledversion: '1.10.2',
  tileheight: ISO_TILE_H,
  tilewidth: ISO_TILE_W,
  type: 'map',
  version: '1.10',
  tilesets: [
    {
      firstgid: 1,
      name: 'campus-premium',
      image: '../tilesets/campus-premium.png',
      imagewidth: ISO_TILE_W * TILE_COUNT,
      imageheight: ISO_TILE_H,
      tilewidth: ISO_TILE_W,
      tileheight: ISO_TILE_H,
      tilecount: TILE_COUNT,
      columns: TILE_COUNT,
      margin: 0,
      spacing: 0,
    },
  ],
  layers: [
    layer('Ground', ground, 1),
    layer('Paths', paths, 2),
    layer('Nature', nature, 3),
    layer('Collision', collision, 4),
    objLayer('Buildings', 5, tileObjects.filter((o) => o.type === 'building')),
    objLayer('Props', 6, [...tileObjects.filter((o) => o.type === 'prop'), ...decorObjects.filter((o) => o.type !== 'light')]),
    objLayer('Lighting', 7, decorObjects.filter((o) => o.type === 'light')),
    objLayer('NPCs', 8, npcObjects),
    objLayer('Interaction', 9, interactionObjects),
  ],
};

const jsonPath = path.join(tiledDir, 'mind-sphere-campus.iso.json');
await writeFile(jsonPath, JSON.stringify(mapJson, null, 2));

const spawn = spawnWorld();
const meta = {
  mapId: 'mind-sphere-campus-iso',
  orientation: 'isometric',
  tileWidth: ISO_TILE_W,
  tileHeight: ISO_TILE_H,
  width: W,
  height: H,
  zones: zonesMeta(),
  buildings: BUILDINGS,
  decor: DECOR,
  npcs: NPCS,
  spawn,
  tileset: 'campus-premium',
  mapUrl: '/assets/iso/tiled/mind-sphere-campus.iso.json',
  tilesetUrl: '/assets/iso/tilesets/campus-premium.png',
  credit: 'MIND-SPHERE · Campus isométrico HD',
};

const tsContent = `import type { IsoCampusMeta } from './iso.types';

/** Generado por scripts/build-iso-campus-map.mjs — NO editar a mano */
export const ISO_CAMPUS_META: IsoCampusMeta = ${JSON.stringify(meta, null, 2)} as IsoCampusMeta;
`;
await writeFile(metaTs, tsContent);

const tmx = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.10" tiledversion="1.10.2" orientation="isometric" renderorder="right-down" width="${W}" height="${H}" tilewidth="${ISO_TILE_W}" tileheight="${ISO_TILE_H}" infinite="0">
 <tileset source="../tilesets/campus-premium.tsj"/>
 <layer id="1" name="Ground" width="${W}" height="${H}"/>
 <layer id="2" name="Paths" width="${W}" height="${H}"/>
 <layer id="3" name="Nature" width="${W}" height="${H}"/>
 <layer id="4" name="Collision" width="${W}" height="${H}"/>
 <objectgroup id="5" name="Buildings"/>
 <objectgroup id="6" name="Props"/>
 <objectgroup id="7" name="Lighting"/>
 <objectgroup id="8" name="NPCs"/>
 <objectgroup id="9" name="Interaction"/>
</map>`;
await writeFile(path.join(tiledDir, 'mind-sphere-campus.iso.tmx'), tmx);

console.log(`✓ iso map ${W}×${H} → ${jsonPath}`);
console.log(`✓ iso.meta.ts regenerado`);
