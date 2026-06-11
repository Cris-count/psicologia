/**
 * Protagonista HD — cutouts ilustrados (mission/) → spritesheet Phaser 7×4 dirs.
 * Salida: public/assets/iso/characters/student-sheet.png (96×128, grid 7×4)
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const missionDir = path.join(__dirname, '..', 'public/assets/mission');
const outDir = path.join(__dirname, '..', 'public/assets/iso/characters');

const FW = 96;
const FH = 128;
const COLS = 7;
const ROWS = 4;
const DIRS = ['down', 'up', 'left', 'right'];
const BODY_H = 98;
const BASELINE = 120;

const FRAME_DEFS = [
  { file: 'student-pose_idle-cutout.png', bob: 0, scale: 1 },
  { file: 'student-pose_idle-cutout.png', bob: -2, scale: 1.025 },
  { file: 'student-pose_idle-cutout.png', bob: 0, scale: 1 },
  { file: 'student-pose_walk-cutout.png', bob: 0, scale: 1 },
  { file: 'student-pose_run-cutout.png', bob: -3, scale: 1.04 },
  { file: 'student-pose_walk-cutout.png', bob: 2, scale: 1 },
  { file: 'student-pose_interact-cutout.png', bob: 0, scale: 1 },
];

function alphaBounds(data, w, h, ch) {
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * ch + 3] > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function defringe(data, w, h, ch) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const a = data[i + 3] / 255;
      if (a > 0.02 && a < 0.98) {
        data[i] = Math.round(data[i] * a);
        data[i + 1] = Math.round(data[i + 1] * a);
        data[i + 2] = Math.round(data[i + 2] * a);
      }
      if (a < 0.05) data[i + 3] = 0;
    }
  }
}

async function renderFrame(def, { flipX = false, flipY = false, darken = 0 } = {}) {
  const input = path.join(missionDir, def.file);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  defringe(data, info.width, info.height, info.channels);
  const b = alphaBounds(data, info.width, info.height, info.channels);

  let pipe = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .extract({ left: b.minX, top: b.minY, width: b.width, height: b.height });

  const targetH = Math.round(BODY_H * def.scale);
  const targetW = Math.round((b.width / b.height) * targetH);
  pipe = pipe.resize(targetW, targetH, { kernel: 'lanczos3', fit: 'fill' });

  if (flipX) pipe = pipe.flop();
  if (flipY) pipe = pipe.flip();
  if (darken > 0) pipe = pipe.modulate({ brightness: 1 - darken });

  const { data: px, info: pi } = await pipe.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  defringe(px, pi.width, pi.height, pi.channels);

  const canvas = Buffer.alloc(FW * FH * 4, 0);
  const left = Math.round((FW - pi.width) / 2);
  const top = BASELINE - pi.height - (def.bob ?? 0);

  for (let y = 0; y < pi.height; y++) {
    for (let x = 0; x < pi.width; x++) {
      const dx = left + x;
      const dy = top + y;
      if (dx < 0 || dy < 0 || dx >= FW || dy >= FH) continue;
      const si = (y * pi.width + x) * 4;
      const di = (dy * FW + dx) * 4;
      canvas[di] = px[si];
      canvas[di + 1] = px[si + 1];
      canvas[di + 2] = px[si + 2];
      canvas[di + 3] = px[si + 3];
    }
  }

  return sharp(canvas, { raw: { width: FW, height: FH, channels: 4 } }).png().toBuffer();
}

await mkdir(outDir, { recursive: true });

const composites = [];
for (let dir = 0; dir < ROWS; dir++) {
  const dirName = DIRS[dir];
  for (let f = 0; f < COLS; f++) {
    const opts =
      dirName === 'up'
        ? { darken: 0.1 }
        : dirName === 'left' || dirName === 'right'
          ? { flipX: true }
          : {};
    const buf = await renderFrame(FRAME_DEFS[f], opts);
    composites.push({ input: buf, left: f * FW, top: dir * FH });
  }
}

const outPath = path.join(outDir, 'student-sheet.png');
await sharp({
  create: { width: COLS * FW, height: ROWS * FH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(outPath);

await writeFile(
  path.join(outDir, 'student-sheet.json'),
  JSON.stringify(
    {
      frameWidth: FW,
      frameHeight: FH,
      cols: COLS,
      rows: ROWS,
      frames: COLS * ROWS,
      dirs: DIRS,
      framesPerDir: COLS,
      idle: [0, 1, 2],
      walk: [3, 4, 5],
      run: [3, 4, 5],
      interact: 6,
      source: 'mission cutouts HD',
    },
    null,
    2,
  ),
);

console.log(`✓ HD player ${COLS}×${ROWS} @ ${FW}×${FH} → student-sheet.png`);
