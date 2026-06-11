/**
 * Tileset isométrico premium HD (128×64) — 15 tiles con textura orgánica
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { grassTexture, stonePath, flowerBed, fillDiamond, buf, px } from './iso/iso-art-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public/assets/iso/tilesets');
const TW = 128;
const TH = 64;

await mkdir(outDir, { recursive: true });

function waterTile() {
  const b = buf(TW, TH);
  fillDiamond(b, TW / 2, TH / 2 - 4, TW / 2 - 2, TH / 2 - 2, [88, 168, 210], [62, 138, 188], [108, 188, 228], [42, 98, 148], 3);
  for (let i = 0; i < 18; i++) {
    px(b, 28 + i * 5, 24 + (i % 4) * 2, [160, 220, 245, 180]);
  }
  return b;
}

function hedgeTile() {
  const b = grassTexture(1, TW, TH);
  for (let i = 0; i < 60; i++) {
    const x = 20 + (i * 5) % 88;
    const y = 16 + (i * 3) % 36;
    px(b, x, y, [42, 108, 48, 255]);
    px(b, x, y - 1, [58, 128, 58, 255]);
    px(b, x + 1, y, [38, 98, 42, 255]);
  }
  return b;
}

function dirtTile() {
  const b = buf(TW, TH);
  fillDiamond(b, TW / 2, TH / 2 - 4, TW / 2 - 2, TH / 2 - 2, [148, 118, 88], [118, 92, 68], [168, 138, 102], [88, 68, 48], 5);
  return b;
}

function collisionTile() {
  const b = buf(TW, TH);
  fillDiamond(b, TW / 2, TH / 2 - 4, TW / 2 - 2, TH / 2 - 2, [40, 0, 40], [30, 0, 30], [50, 0, 50], [20, 0, 20]);
  return b;
}

const tiles = [
  grassTexture(0, TW, TH),
  grassTexture(1, TW, TH),
  grassTexture(2, TW, TH),
  grassTexture(3, TW, TH),
  stonePath(0, TW, TH),
  stonePath(1, TW, TH, true),
  stonePath(2, TW, TH),
  stonePath(3, TW, TH, true),
  waterTile(),
  flowerBed([[240, 210, 80], [230, 190, 70], [250, 220, 90]], TW, TH),
  flowerBed([[180, 100, 200], [160, 80, 180], [200, 120, 210]], TW, TH),
  hedgeTile(),
  dirtTile(),
  flowerBed([[240, 210, 80], [180, 100, 200], [230, 190, 70]], TW, TH),
  collisionTile(),
];

const composites = [];
for (let i = 0; i < tiles.length; i++) {
  const input = await sharp(tiles[i].data, { raw: { width: TW, height: TH, channels: 4 } }).png().toBuffer();
  composites.push({ input, left: i * TW, top: 0 });
}

const sheetPath = path.join(outDir, 'campus-premium.png');
await sharp({
  create: { width: TW * tiles.length, height: TH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(sheetPath);

const tsj = {
  columns: tiles.length,
  image: 'campus-premium.png',
  imageheight: TH,
  imagewidth: TW * tiles.length,
  margin: 0,
  name: 'campus-premium',
  spacing: 0,
  tilecount: tiles.length,
  tiledversion: '1.10.2',
  tileheight: TH,
  tilewidth: TW,
  type: 'tileset',
  version: '1.10',
};

await writeFile(path.join(outDir, 'campus-premium.tsj'), JSON.stringify(tsj, null, 2));
console.log(`✓ iso tileset → ${sheetPath} (${tiles.length} tiles @ ${TW}×${TH})`);
