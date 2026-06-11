/**
 * Tileset premium — ciudad educativa (césped, calles, aceras, naturaleza).
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buf, px, rect, ellipse, line, PAL, shade, highlight, gradientRect } from './edu-city-art.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public/assets/tilemaps');
await mkdir(outDir, { recursive: true });

const T = 16;
const COLS = 8;
const TILES = [];

function grass(v = 0) {
  const t = buf(T, T);
  const base = v % 2 === 0 ? PAL.grass : PAL.grassHi;
  gradientRect(t, 0, 0, T, T, highlight(base, 1.03), shade(base, 0.94));
  for (let i = 0; i < 14; i++) {
    const sx = 1 + ((v * 3 + i * 5) % 14);
    const sy = 1 + ((v * 2 + i * 7) % 14);
    px(t, sx, sy, shade(PAL.grassDark, 0.9 + (i % 3) * 0.03));
  }
  for (let i = 0; i < 6; i++) {
    px(t, 2 + ((v + i * 4) % 12), 2 + ((v + i * 6) % 12), highlight(PAL.grassHi, 1.08));
  }
  return t;
}

function grassFlower() {
  const t = grass(1);
  for (let i = 0; i < 3; i++) {
    const fx = 4 + i * 4;
    const fy = 5 + (i % 2) * 5;
    px(t, fx, fy, [240, 210, 60, 255]);
    px(t, fx - 1, fy, [248, 120, 140, 255]);
    px(t, fx + 1, fy, [248, 120, 140, 255]);
    px(t, fx, fy - 1, [248, 120, 140, 255]);
    px(t, fx, fy + 1, [248, 120, 140, 255]);
    line(t, fx, fy + 1, fx, fy + 3, [58, 138, 58, 255], 1);
  }
  return t;
}

function road(dash = false) {
  const t = buf(T, T);
  gradientRect(t, 0, 0, T, T, PAL.road, shade(PAL.road, 0.92));
  gradientRect(t, 0, 0, 4, T, PAL.curb, PAL.curbDark);
  gradientRect(t, T - 4, 0, 4, T, shade(PAL.curb, 0.9), shade(PAL.curbDark, 0.95));
  rect(t, 4, 0, 1, T, PAL.roadDark);
  rect(t, T - 5, 0, 1, T, shade(PAL.roadDark, 0.88));
  for (let y = 1; y < T - 1; y += 2) {
    px(t, 5, y, PAL.roadWear);
    px(t, T - 6, y, PAL.roadWear);
  }
  if (dash) {
    gradientRect(t, 7, 2, 2, 11, PAL.roadLine, shade(PAL.roadLine, 0.85));
  } else {
    for (let y = 1; y < T - 1; y += 4) rect(t, 7, y, 2, 2, PAL.roadLine);
  }
  for (let y = 0; y < T; y += 3) px(t, 8, y, [68, 72, 78, 120]);
  return t;
}

function rail(h = true) {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, [72, 78, 86, 255]);
  if (h) {
    rect(t, 1, 6, 14, 2, PAL.rail);
    rect(t, 1, 10, 14, 2, PAL.rail);
    for (let x = 1; x < 15; x += 4) rect(t, x, 5, 1, 6, [52, 56, 64, 255]);
    rect(t, 0, 8, T, 1, [58, 62, 70, 255]);
  } else {
    rect(t, 6, 1, 2, 14, PAL.rail);
    rect(t, 10, 1, 2, 14, PAL.rail);
    for (let y = 1; y < 15; y += 4) rect(t, 5, y, 6, 1, [52, 56, 64, 255]);
  }
  return t;
}

function bush() {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, PAL.grass);
  px(t, 3, 14, shade(PAL.grassDark, 0.9));
  px(t, 12, 14, shade(PAL.grassDark, 0.9));
  ellipse(t, 8, 11, 7, 6, PAL.foliage);
  ellipse(t, 7, 9, 5, 4, PAL.foliageHi);
  ellipse(t, 10, 10, 4, 3, highlight(PAL.foliageHi, 1.06));
  return t;
}

function treeTop() {
  const t = buf(T, T);
  rect(t, 0, 0, T, T, [0, 0, 0, 0]);
  ellipse(t, 8, 9, 8, 7, PAL.foliage);
  ellipse(t, 7, 7, 5, 4, PAL.foliageHi);
  ellipse(t, 10, 8, 4, 3, highlight(PAL.foliageHi, 1.08));
  gradientRect(t, 7, 12, 2, 4, PAL.woodHi, PAL.wood);
  return t;
}

function poolTile() {
  const t = buf(T, T);
  gradientRect(t, 0, 0, T, T, PAL.water, shade(PAL.water, 0.88));
  gradientRect(t, 2, 2, 12, 12, PAL.waterHi, PAL.water);
  line(t, 3, 5, 12, 6, [168, 218, 248, 180], 1);
  line(t, 4, 9, 11, 10, [148, 198, 238, 140], 1);
  rect(t, 2, 2, 12, 1, highlight(PAL.waterHi, 1.05));
  return t;
}

function sidewalk() {
  const t = buf(T, T);
  gradientRect(t, 0, 0, T, T, [188, 192, 198, 255], [168, 172, 178, 255]);
  rect(t, 0, 0, T, 2, [158, 162, 168, 255]);
  for (let y = 2; y < T; y += 4) {
    for (let x = 1; x < T - 1; x += 4) px(t, x, y, [178, 182, 188, 255]);
  }
  rect(t, 0, T - 1, T, 1, [128, 132, 138, 255]);
  line(t, 0, 0, T, 0, highlight(PAL.white, 0.95), 1);
  return t;
}

function crosswalk() {
  const t = road(false);
  for (let i = 0; i < 5; i++) {
    const ox = 1 + i * 3;
    gradientRect(t, ox, 2, 2, 11, PAL.roadLine, shade(PAL.roadLine, 0.88));
    gradientRect(t, T - 3 - i * 3, 2, 2, 11, PAL.roadLine, shade(PAL.roadLine, 0.88));
  }
  return t;
}

TILES.push(grass(0), grass(1), grassFlower(), road(false), road(true), rail(true), rail(false), bush(), treeTop(), poolTile(), sidewalk(), crosswalk());

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
