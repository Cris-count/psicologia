/**
 * Spritesheet HD del protagonista — 4 direcciones × 9 frames (64px).
 * Salida: public/assets/game/player-hd.png
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const missionDir = path.join(__dirname, '..', 'public/assets/mission');
const gameDir = path.join(__dirname, '..', 'public/assets/game');

const FRAME = 64;
const BODY_MAX_H = 50;
const BASELINE = 58;
const FRAMES_PER_DIR = 9;
const DIRS = ['down', 'up', 'left', 'right'];

const FRAME_SOURCES = [
  { file: 'student-pose_idle-cutout.png', breathe: false },
  { file: 'student-pose_idle-cutout.png', breathe: true },
  { file: 'student-pose_idle-cutout.png', breathe: false },
  { file: 'student-pose_walk-cutout.png', bob: 2 },
  { file: 'student-pose_walk-cutout.png', bob: 4 },
  { file: 'student-pose_walk-cutout.png', bob: 2 },
  { file: 'student-pose_interact-cutout.png' },
  { file: 'student-pose_think-cutout.png' },
  { file: 'student-pose_celebrate-cutout.png' },
];

function alphaBounds(data, w, h, channels) {
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * channels + 3];
      if (a > 24) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function defringe(data, w, h, channels) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * channels;
      const a = data[i + 3] / 255;
      if (a > 0.02 && a < 0.98) {
        data[i] = Math.round(data[i] * a);
        data[i + 1] = Math.round(data[i + 1] * a);
        data[i + 2] = Math.round(data[i + 2] * a);
      }
      if (a < 0.06) data[i + 3] = 0;
    }
  }
}

async function renderFrame(source) {
  const input = path.join(missionDir, source.file);
  let pipeline = sharp(input).ensureAlpha();
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  defringe(data, info.width, info.height, info.channels);
  const bounds = alphaBounds(data, info.width, info.height, info.channels);

  const cropped = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .extract({
      left: bounds.minX,
      top: bounds.minY,
      width: bounds.width,
      height: bounds.height,
    })
    .png()
    .toBuffer();

  const scale = BODY_MAX_H / bounds.height;
  let targetW = Math.round(bounds.width * scale);
  let targetH = Math.round(bounds.height * scale);

  if (source.breathe) {
    targetW = Math.round(targetW * 1.02);
    targetH = Math.round(targetH * 1.04);
  }

  const resized = await sharp(cropped)
    .resize(targetW, targetH, { fit: 'fill', kernel: 'lanczos3' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  defringe(resized.data, resized.info.width, resized.info.height, resized.info.channels);

  const rw = resized.info.width;
  const rh = resized.info.height;
  const bob = source.bob ?? 0;
  const canvas = Buffer.alloc(FRAME * FRAME * 4, 0);
  const left = Math.round((FRAME - rw) / 2);
  const top = BASELINE - rh - bob;

  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const dx = left + x;
      const dy = top + y;
      if (dx < 0 || dy < 0 || dx >= FRAME || dy >= FRAME) continue;
      const si = (y * rw + x) * 4;
      const di = (dy * FRAME + dx) * 4;
      canvas[di] = resized.data[si];
      canvas[di + 1] = resized.data[si + 1];
      canvas[di + 2] = resized.data[si + 2];
      canvas[di + 3] = resized.data[si + 3];
    }
  }

  return sharp(canvas, { raw: { width: FRAME, height: FRAME, channels: 4 } }).png().toBuffer();
}

const rowFrames = [];
for (const src of FRAME_SOURCES) {
  rowFrames.push(await renderFrame(src));
  console.log(`✓ frame ${src.file}`);
}

const composites = [];
for (let dir = 0; dir < DIRS.length; dir++) {
  for (let f = 0; f < FRAMES_PER_DIR; f++) {
    composites.push({
      input: rowFrames[f],
      left: f * FRAME,
      top: dir * FRAME,
    });
  }
}

const outPath = path.join(gameDir, 'player-hd.png');
await sharp({
  create: {
    width: FRAME * FRAMES_PER_DIR,
    height: FRAME * DIRS.length,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(outPath);

const meta = {
  frameWidth: FRAME,
  frameHeight: FRAME,
  dirs: DIRS,
  framesPerDir: FRAMES_PER_DIR,
  idle: [0, 1, 2],
  walk: [3, 4, 5],
  interact: 6,
  think: 7,
  celebrate: 8,
};

await writeFile(path.join(gameDir, 'player-hd.json'), JSON.stringify(meta, null, 2));
console.log(`Spritesheet HD → ${outPath} (${FRAMES_PER_DIR}×${DIRS.length} @ ${FRAME}px)`);
