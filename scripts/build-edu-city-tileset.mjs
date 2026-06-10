/**
 * Tileset propio — ciudad educativa (césped, caminos, flores, vías).
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buf, px, rect, ellipse, PAL, shade, highlight } from './edu-city-art.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public/assets/tilemaps');
await mkdir(outDir, { recursive: true });

const T = 16;
const COLS = 8;
const TILES = [];

function grass(v = 0) {
  const t = buf(T, T);
  const base = v % 2 === 0 ? PAL.grass : PAL.grassHi;
  rect(t, 0, 0, T, T, base);
  for (let i = 0; i < 8; i++) {
    px(t, 1 + ((v + i * 3) % 14), 1 + ((v + i * 5) % 14), shade(PAL.grass, 0.88));
    px(t, 2 + ((v + i * 7) % 12), 3 + ((v + i * 2) % 11), highlight(PAL.grassHi, 1.05));
  }
  return t;
}

function grassFlower() {
  const t = grass(1);
  px(t, 8, 8, [240, 210, 60, 255]);
  px(t, 7, 8, [248, 120, 140, 255]);
  px(t, 9, 8, [248, 120, 140, 255]);
  px(t, 8, 7, [248, 120, 140, 255]);
  px(t, 8, 9, [248, 120, 140, 255]);
  return t;
}

function road(dash = false) {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, PAL.road);
  rect(t, 0, 0, 3, T, PAL.curb);
  rect(t, T - 3, 0, 3, T, shade(PAL.curb, 0.88));
  rect(t, 3, 0, 1, T, PAL.roadDark);
  rect(t, T - 4, 0, 1, T, shade(PAL.roadDark, 0.9));
  for (let y = 1; y < T - 1; y += 2) px(t, 5, y, shade(PAL.road, 0.92));
  for (let y = 1; y < T - 1; y += 2) px(t, T - 6, y, shade(PAL.road, 0.92));
  if (dash) {
    rect(t, 7, 2, 2, 11, PAL.roadLine);
  } else {
    for (let y = 1; y < T - 1; y += 4) rect(t, 7, y, 2, 2, PAL.roadLine);
  }
  return t;
}

function rail(h = true) {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, [78, 84, 92, 255]);
  if (h) {
    rect(t, 2, 6, 12, 2, PAL.rail);
    rect(t, 2, 10, 12, 2, PAL.rail);
    for (let x = 1; x < 15; x += 4) rect(t, x, 5, 1, 6, [60, 64, 72, 255]);
  } else {
    rect(t, 6, 2, 2, 12, PAL.rail);
    rect(t, 10, 2, 2, 12, PAL.rail);
  }
  return t;
}

function bush() {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, PAL.grass);
  ellipse(t, 8, 10, 6, 5, [58, 138, 62, 255]);
  ellipse(t, 8, 9, 4, 3, [88, 168, 72, 255]);
  return t;
}

function treeTop() {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, [0, 0, 0, 0]);
  ellipse(t, 8, 8, 7, 6, [48, 128, 58, 255]);
  ellipse(t, 8, 7, 5, 4, [78, 168, 72, 255]);
  rect(t, 7, 12, 2, 4, PAL.wood);
  return t;
}

function poolTile() {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, [72, 168, 228, 255]);
  rect(t, 2, 2, 12, 12, [98, 188, 238, 255]);
  return t;
}

function sidewalk() {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, [178, 182, 188, 255]);
  rect(t, 0, 0, T, 2, [158, 162, 168, 255]);
  for (let y = 2; y < T; y += 4) {
    for (let x = 1; x < T - 1; x += 4) px(t, x, y, [168, 172, 178, 255]);
  }
  rect(t, 0, T - 1, T, 1, [138, 142, 148, 255]);
  return t;
}

function crosswalk() {
  const t = road(false);
  for (let i = 0; i < 5; i++) {
    rect(t, 1 + i * 3, 2, 2, 11, PAL.roadLine);
    rect(t, T - 3 - i * 3, 2, 2, 11, PAL.roadLine);
  }
  return t;
}

TILES.push(grass(0), grass(1), grassFlower(), road(false), road(true), rail(true), rail(false), bush(), treeTop(), poolTile(), sidewalk(), crosswalk());

/** Export GID constants (1-based) */
export const EDU_GIDS = {
  GRASS: [1, 2, 3],
  ROAD: 4,
  ROAD_DASH: 5,
  RAIL_H: 6,
  RAIL_V: 7,
  BUSH: 8,
  TREE: 9,
  POOL: 10,
  SIDEWALK: 11,
  CROSSWALK: 12,
};

const composites = [];
for (let i = 0; i < TILES.length; i++) {
  composites.push({
    input: await sharp(TILES[i].data, { raw: { width: T, height: T, channels: 4 } }).png().toBuffer(),
    left: (i % COLS) * T,
    top: Math.floor(i / COLS) * T,
  });
}

const sheetW = COLS * T;
const sheetH = Math.ceil(TILES.length / COLS) * T;
await sharp({
  create: { width: sheetW, height: sheetH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(path.join(outDir, 'edu-city-tileset.png'));

console.log(`✓ edu-city-tileset.png (${sheetW}×${sheetH}, ${TILES.length} tiles)`);
