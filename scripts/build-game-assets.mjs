/**
 * Genera tileset pixel-art, edificios, props y spritesheet del protagonista.
 * Ejecutar: node scripts/build-game-assets.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'public/assets/game');

await mkdir(out, { recursive: true });

function buf(w, h) {
  return { data: Buffer.alloc(w * h * 4, 0), w, h };
}

function px(b, x, y, color) {
  if (x < 0 || y < 0 || x >= b.w || y >= b.h) return;
  const i = (y * b.w + x) * 4;
  const [r, g, bl, a = 255] = color;
  b.data[i] = r;
  b.data[i + 1] = g;
  b.data[i + 2] = bl;
  b.data[i + 3] = a;
}

function rect(b, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++) px(b, x + dx, y + dy, color);
}

function outline(b, x, y, w, h, color) {
  for (let dx = 0; dx < w; dx++) {
    px(b, x + dx, y, color);
    px(b, x + dx, y + h - 1, color);
  }
  for (let dy = 0; dy < h; dy++) {
    px(b, x, y + dy, color);
    px(b, x + w - 1, y + dy, color);
  }
}

async function save(b, name) {
  await sharp(b.data, { raw: { width: b.w, height: b.h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(out, name));
  console.log(`✓ ${name} (${b.w}x${b.h})`);
}

const C = {
  outline: [28, 42, 58, 255],
  grass1: [72, 132, 62, 255],
  grass2: [58, 118, 52, 255],
  grass3: [86, 148, 72, 255],
  grassDark: [42, 88, 38, 255],
  path: [158, 128, 92, 255],
  pathDark: [122, 98, 68, 255],
  pathLight: [186, 158, 118, 255],
  water: [62, 142, 198, 255],
  waterHi: [120, 188, 228, 255],
  wood: [110, 74, 48, 255],
  woodDark: [78, 52, 34, 255],
  leaf: [48, 118, 52, 255],
  leafHi: [72, 158, 72, 255],
  leafDark: [32, 82, 38, 255],
  lamp: [240, 210, 90, 255],
  skin: [232, 184, 150, 255],
  skinSh: [200, 148, 118, 255],
  hair: [28, 32, 48, 255],
  suit: [36, 58, 98, 255],
  suitHi: [52, 82, 138, 255],
  suitDark: [22, 38, 68, 255],
  backpack: [48, 88, 168, 255],
  backpackHi: [72, 118, 198, 255],
  shoe: [42, 38, 52, 255],
  white: [245, 248, 252, 255],
  red: [198, 58, 58, 255],
  redHi: [228, 88, 88, 255],
  blue: [58, 98, 158, 255],
  cream: [238, 228, 208, 255],
  brick: [148, 98, 72, 255],
  teal: [48, 128, 118, 255],
};

// ── Tiles 24×24 ──
for (let v = 0; v < 4; v++) {
  const t = buf(24, 24);
  const base = v % 2 === 0 ? C.grass1 : C.grass2;
  rect(t, 0, 0, 24, 24, base);
  for (let i = 0; i < 14; i++) {
    const gx = (v * 5 + i * 7) % 22 + 1;
    const gy = (v * 3 + i * 5) % 22 + 1;
    px(t, gx, gy, i % 3 === 0 ? C.grass3 : C.grassDark);
    if (i % 4 === 0) px(t, gx + 1, gy, C.grass3);
  }
  await save(t, `tile-grass-${v}.png`);
}

const pathTile = buf(24, 24);
rect(pathTile, 0, 0, 24, 24, C.path);
for (let y = 0; y < 24; y += 4)
  for (let x = 0; x < 24; x += 4)
    rect(pathTile, x + 1, y + 1, 2, 2, (x + y) % 8 === 0 ? C.pathLight : C.pathDark);
outline(pathTile, 0, 0, 24, 24, [C.pathDark[0], C.pathDark[1], C.pathDark[2], 80]);
await save(pathTile, 'tile-path.png');

const waterTile = buf(24, 24);
rect(waterTile, 0, 0, 24, 24, C.water);
for (let i = 0; i < 8; i++) rect(waterTile, 2 + i * 3, 4 + (i % 3) * 5, 6, 2, C.waterHi);
await save(waterTile, 'tile-water.png');

const roadTile = buf(24, 24);
rect(roadTile, 0, 0, 24, 24, [72, 76, 82, 255]);
for (let y = 0; y < 24; y += 3)
  for (let x = 0; x < 24; x += 3)
    px(roadTile, x + 1, y + 1, [58, 62, 68, 255]);
await save(roadTile, 'tile-road.png');

// ── Props ──
function tree(w, h) {
  const t = buf(w, h);
  rect(t, w / 2 - 2, h - 14, 4, 12, C.woodDark);
  for (let layer = 0; layer < 3; layer++) {
    const rw = 28 - layer * 6;
    const rh = 12;
    const ry = h - 28 - layer * 10;
    for (let dy = 0; dy < rh; dy++) {
      const rw2 = Math.floor(rw * (1 - Math.abs(dy - rh / 2) / (rh / 2 + 1)));
      rect(t, Math.floor(w / 2 - rw2 / 2), ry + dy, rw2, 1, layer === 0 ? C.leafHi : layer === 1 ? C.leaf : C.leafDark);
    }
  }
  outline(t, 2, 2, w - 4, h - 4, [0, 0, 0, 0]);
  return t;
}
await save(tree(40, 52), 'prop-tree.png');
await save(tree(52, 68), 'prop-tree-lg.png');

const bush = buf(28, 20);
for (let dy = 0; dy < 16; dy++) {
  const rw = 24 - Math.abs(dy - 8);
  rect(bush, 14 - Math.floor(rw / 2), 4 + dy, rw, 1, dy < 6 ? C.leafHi : C.leaf);
}
await save(bush, 'prop-bush.png');

const flower = buf(12, 12);
px(flower, 6, 10, C.grassDark);
px(flower, 6, 9, C.leaf);
px(flower, 6, 6, [240, 200, 60, 255]);
px(flower, 5, 5, [240, 120, 140, 255]);
px(flower, 7, 5, [240, 120, 140, 255]);
px(flower, 6, 4, [240, 120, 140, 255]);
await save(flower, 'prop-flower.png');

const lamp = buf(20, 44);
rect(lamp, 9, 16, 2, 24, C.woodDark);
rect(lamp, 5, 8, 10, 10, C.lamp);
rect(lamp, 6, 9, 8, 8, [255, 240, 180, 255]);
px(lamp, 10, 6, C.lamp);
await save(lamp, 'prop-lamp.png');

const bench = buf(36, 20);
rect(bench, 2, 6, 32, 4, C.wood);
rect(bench, 4, 10, 3, 8, C.woodDark);
rect(bench, 29, 10, 3, 8, C.woodDark);
rect(bench, 2, 4, 32, 2, C.woodDark);
await save(bench, 'prop-bench.png');

const fence = buf(24, 16);
rect(fence, 0, 4, 24, 2, C.wood);
for (let x = 2; x < 24; x += 6) rect(fence, x, 6, 2, 8, C.woodDark);
await save(fence, 'prop-fence.png');

const fountain = buf(32, 36);
rect(fountain, 14, 20, 4, 10, [120, 130, 140, 255]);
for (let dy = 0; dy < 14; dy++) {
  const rw = 26 - Math.abs(dy - 7);
  rect(fountain, 16 - Math.floor(rw / 2), 8 + dy, rw, 1, dy < 4 ? C.waterHi : C.water);
}
rect(fountain, 10, 28, 12, 4, [100, 110, 120, 255]);
await save(fountain, 'prop-fountain.png');

const signpost = buf(28, 40);
rect(signpost, 13, 14, 2, 22, C.woodDark);
rect(signpost, 4, 8, 20, 10, C.cream);
outline(signpost, 4, 8, 20, 10, C.outline);
rect(signpost, 6, 11, 16, 4, C.pathDark);
await save(signpost, 'prop-signpost.png');

function pineTree(w, h) {
  const t = buf(w, h);
  rect(t, w / 2 - 2, h - 12, 4, 10, C.woodDark);
  for (let layer = 0; layer < 4; layer++) {
    const rw = 22 - layer * 4;
    const ry = h - 22 - layer * 8;
    for (let dy = 0; dy < 10; dy++) {
      const rw2 = Math.max(2, rw - Math.abs(dy - 5));
      rect(t, Math.floor(w / 2 - rw2 / 2), ry + dy, rw2, 1, layer < 2 ? C.leafDark : C.leaf);
    }
  }
  return t;
}
await save(pineTree(36, 56), 'prop-pine.png');

const bloom = buf(40, 52);
rect(bloom, 18, 38, 4, 12, C.woodDark);
for (let dy = 0; dy < 22; dy++) {
  const rw = 34 - Math.abs(dy - 11);
  const col = dy < 8 ? [240, 140, 170, 255] : dy < 14 ? [255, 180, 200, 255] : [220, 100, 140, 255];
  rect(bloom, 20 - Math.floor(rw / 2), 10 + dy, rw, 1, col);
}
await save(bloom, 'prop-bloom.png');

const ambulance = buf(48, 28);
rect(ambulance, 4, 10, 40, 14, C.white);
outline(ambulance, 4, 10, 40, 14, C.outline);
rect(ambulance, 6, 12, 12, 8, [200, 220, 240, 255]);
rect(ambulance, 32, 14, 4, 8, C.red);
rect(ambulance, 30, 16, 8, 4, C.red);
rect(ambulance, 8, 22, 6, 4, [40, 40, 48, 255]);
rect(ambulance, 34, 22, 6, 4, [40, 40, 48, 255]);
await save(ambulance, 'prop-ambulance.png');

const policeCar = buf(48, 28);
rect(policeCar, 4, 10, 40, 14, C.blue);
outline(policeCar, 4, 10, 40, 14, C.outline);
rect(policeCar, 20, 8, 8, 4, [80, 120, 200, 255]);
rect(policeCar, 8, 22, 6, 4, [20, 20, 28, 255]);
rect(policeCar, 34, 22, 6, 4, [20, 20, 28, 255]);
await save(policeCar, 'prop-policeCar.png');

const medSign = buf(20, 28);
rect(medSign, 2, 4, 16, 20, C.white);
rect(medSign, 8, 8, 4, 12, C.red);
rect(medSign, 4, 12, 12, 4, C.red);
outline(medSign, 2, 4, 16, 20, C.redHi);
await save(medSign, 'prop-medSign.png');

const books = buf(24, 20);
rect(books, 4, 8, 6, 10, [180, 60, 60, 255]);
rect(books, 10, 6, 6, 12, [60, 100, 180, 255]);
rect(books, 16, 9, 6, 9, [60, 140, 80, 255]);
await save(books, 'prop-books.png');

const plant = buf(20, 28);
rect(plant, 8, 18, 4, 8, [120, 90, 60, 255]);
for (let dy = 0; dy < 14; dy++) {
  const rw = 16 - Math.abs(dy - 7);
  rect(plant, 10 - Math.floor(rw / 2), 4 + dy, rw, 1, [60, 140, 90, 255]);
}
await save(plant, 'prop-plant.png');

const entrance = buf(72, 64);
rect(entrance, 8, 28, 56, 32, C.brick);
outline(entrance, 8, 28, 56, 32, C.outline);
for (let ry = 0; ry < 22; ry++) {
  const rw = 68 - Math.abs(ry - 11);
  rect(entrance, 36 - Math.floor(rw / 2), 6 + ry, rw, 1, ry < 4 ? [168, 118, 88, 255] : C.brick);
}
rect(entrance, 30, 44, 12, 16, [40, 32, 28, 255]);
outline(entrance, 30, 44, 12, 16, C.outline);
for (let i = 0; i < 10; i++) rect(entrance, 14 + i * 4, 18, 3, 4, C.cream);
rect(entrance, 10, 56, 52, 4, [0, 0, 0, 40]);
await save(entrance, 'prop-entrance.png');

const mapBoard = buf(36, 44);
rect(mapBoard, 4, 8, 28, 22, C.cream);
outline(mapBoard, 4, 8, 28, 22, C.outline);
rect(mapBoard, 6, 10, 24, 16, [80, 120, 160, 255]);
rect(mapBoard, 16, 30, 4, 12, C.woodDark);
for (let i = 0; i < 6; i++) rect(mapBoard, 8 + i * 3, 12, 2, 2, [200, 220, 240, 255]);
await save(mapBoard, 'prop-mapBoard.png');

const busStop = buf(52, 40);
rect(busStop, 4, 18, 44, 4, C.wood);
rect(busStop, 6, 6, 40, 14, [60, 90, 130, 255]);
outline(busStop, 6, 6, 40, 14, C.outline);
rect(busStop, 10, 22, 14, 6, C.woodDark);
rect(busStop, 28, 22, 14, 6, C.woodDark);
rect(busStop, 44, 10, 4, 26, C.woodDark);
rect(busStop, 45, 8, 6, 6, C.lamp);
await save(busStop, 'prop-busStop.png');

const statue = buf(28, 48);
rect(statue, 6, 36, 16, 8, [140, 130, 120, 255]);
rect(statue, 10, 14, 8, 24, [180, 175, 168, 255]);
rect(statue, 8, 8, 12, 8, [200, 195, 188, 255]);
outline(statue, 8, 8, 12, 8, C.outline);
await save(statue, 'prop-statue.png');

const crosswalk = buf(48, 16);
rect(crosswalk, 0, 0, 48, 16, [72, 76, 82, 255]);
for (let i = 0; i < 5; i++) rect(crosswalk, 4 + i * 9, 2, 5, 12, C.white);
await save(crosswalk, 'prop-crosswalk.png');

// ── Buildings 104×88 ──
function building(type, sign) {
  const b = buf(104, 88);
  const wall = type === 'hospital' ? C.white : type === 'police' ? C.blue : type === 'university' ? C.brick : type === 'clinic' ? C.cream : C.cream;
  const roof = type === 'hospital' ? C.red : type === 'police' ? [38, 58, 88, 255] : type === 'university' ? [98, 68, 48, 255] : type === 'clinic' ? C.teal : [200, 140, 48, 255];

  rect(b, 10, 30, 84, 52, wall);
  outline(b, 10, 30, 84, 52, C.outline);
  for (let i = 0; i < 48; i++) rect(b, 12 + (i % 24) * 4, 32 + Math.floor(i / 24) * 3, 2, 2, [0, 0, 0, 14]);

  for (let ry = 0; ry < 20; ry++) {
    const rw = 92 - Math.abs(ry - 10) * 2;
    rect(b, 52 - Math.floor(rw / 2), 10 + ry, rw, 1, ry < 4 ? [roof[0] + 20, roof[1] + 20, roof[2] + 20, 255] : roof);
  }
  outline(b, 22, 10, 60, 22, C.outline);

  const wins =
    type === 'university'
      ? [[24, 40], [44, 40], [64, 40], [24, 56], [44, 56], [64, 56]]
      : [[26, 40], [56, 40], [26, 56], [56, 56]];
  for (const [wx, wy] of wins) {
    const lit = type === 'hospital' ? [255, 255, 240, 255] : type === 'clinic' ? [220, 245, 235, 255] : [255, 230, 170, 255];
    rect(b, wx, wy, 14, 12, lit);
    outline(b, wx, wy, 14, 12, C.outline);
    rect(b, wx + 6, wy, 2, 12, C.outline);
    rect(b, wx, wy + 5, 14, 2, C.outline);
    rect(b, wx + 2, wy + 2, 4, 3, [255, 255, 255, 100]);
  }

  rect(b, 44, 62, 16, 20, C.woodDark);
  outline(b, 44, 62, 16, 20, C.outline);
  px(b, 52, 70, C.lamp);

  rect(b, 16, 14, 72, 14, roof);
  rect(b, 18, 16, 68, 10, [0, 0, 0, 45]);
  for (let i = 0; i < sign.length && i < 14; i++) {
    const sx = 22 + i * 5;
    rect(b, sx, 18, 3, 6, C.white);
  }

  if (type === 'hospital') {
    rect(b, 78, 34, 4, 18, C.white);
    rect(b, 72, 40, 16, 4, C.white);
    rect(b, 71, 39, 18, 6, C.redHi);
    rect(b, 77, 33, 6, 20, C.redHi);
    rect(b, 14, 68, 20, 8, [220, 225, 230, 255]);
  }
  if (type === 'police') {
    rect(b, 76, 36, 14, 14, C.white);
    rect(b, 79, 39, 8, 8, C.blue);
    rect(b, 12, 66, 18, 10, [200, 210, 230, 255]);
  }
  if (type === 'clinic') {
    rect(b, 14, 66, 16, 10, [200, 235, 220, 255]);
    for (let i = 0; i < 3; i++) rect(b, 80 + i * 4, 66, 3, 8, [160, 90, 140, 255]);
  }
  if (type === 'university') {
    rect(b, 46, 24, 12, 8, [200, 180, 140, 255]);
    rect(b, 12, 66, 22, 10, [210, 200, 180, 255]);
  }

  rect(b, 12, 80, 80, 6, [0, 0, 0, 40]);
  return b;
}

for (const [type, sign] of [
  ['hospital', 'HOSPITAL'],
  ['police', 'COMISARIA'],
  ['university', 'UNIV'],
  ['clinic', 'CONSULT'],
  ['school', 'COLEGIO'],
]) {
  await save(building(type, sign), `building-${type}.png`);
}

// ── Player: generado por scripts/build-student-rpg-sheet.mjs (pnpm assets:player) ──
console.log('Player spritesheet → ejecutar pnpm assets:player');
console.log('Done → public/assets/game/');
