/**
 * Genera spritesheet unificado del protagonista — pies alineados, alpha limpio, frames de animación.
 * Ejecutar: node scripts/build-player-spritesheet.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const missionDir = path.join(__dirname, '..', 'public/assets/mission');

const FRAME = 64;
const BODY_MAX_H = 46;
const BASELINE = 58;

const POSES = [
  { name: 'idle_a', file: 'student-pose_idle-cutout.png' },
  { name: 'idle_b', file: 'student-pose_idle-cutout.png', breathe: true },
  { name: 'walk_a', file: 'student-pose_walk-cutout.png' },
  { name: 'walk_b', file: 'student-pose_walk-cutout.png', bob: 3 },
  { name: 'run_a', file: 'student-pose_run-cutout.png' },
  { name: 'run_b', file: 'student-pose_run-cutout.png', bob: 2, lean: 2 },
  { name: 'interact', file: 'student-pose_interact-cutout.png' },
  { name: 'think', file: 'student-pose_think-cutout.png' },
  { name: 'celebrate', file: 'student-pose_celebrate-cutout.png' },
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

async function loadNormalizedFrame(pose) {
  const input = path.join(missionDir, pose.file);
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
  const targetW = Math.round(bounds.width * scale);
  const targetH = Math.round(bounds.height * scale);

  let processed = sharp(cropped).resize(targetW, targetH, { fit: 'fill', kernel: 'lanczos3' });

  if (pose.breathe) {
    processed = processed.resize(Math.round(targetW * 1.02), Math.round(targetH * 1.04), { fit: 'fill' });
  }

  const resized = await processed.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  defringe(resized.data, resized.info.width, resized.info.height, resized.info.channels);

  const rw = resized.info.width;
  const rh = resized.info.height;
  const bob = pose.bob ?? 0;
  const lean = pose.lean ?? 0;

  const canvas = Buffer.alloc(FRAME * FRAME * 4, 0);
  const left = Math.round((FRAME - rw) / 2 + lean);
  const top = BASELINE - rh - bob;

  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const sx = x;
      const sy = y;
      const dx = left + x;
      const dy = top + y;
      if (dx < 0 || dy < 0 || dx >= FRAME || dy >= FRAME) continue;
      const si = (sy * rw + sx) * 4;
      const di = (dy * FRAME + dx) * 4;
      canvas[di] = resized.data[si];
      canvas[di + 1] = resized.data[si + 1];
      canvas[di + 2] = resized.data[si + 2];
      canvas[di + 3] = resized.data[si + 3];
    }
  }

  return sharp(canvas, { raw: { width: FRAME, height: FRAME, channels: 4 } }).png().toBuffer();
}

const frames = [];
for (const pose of POSES) {
  const buf = await loadNormalizedFrame(pose);
  frames.push(buf);
  console.log(`✓ frame ${pose.name}`);
}

const cols = frames.length;
const sheet = await sharp({
  create: { width: FRAME * cols, height: FRAME, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(frames.map((buf, i) => ({ input: buf, left: i * FRAME, top: 0 })))
  .png({ compressionLevel: 9 })
  .toFile(path.join(missionDir, 'player-spritesheet.png'));

const atlas = {
  frames: POSES.map((p, i) => ({
    key: p.name,
    frame: { x: i * FRAME, y: 0, w: FRAME, h: FRAME },
  })),
  meta: { frameW: FRAME, frameH: FRAME, count: POSES.length },
};

await import('node:fs/promises').then((fs) =>
  fs.writeFile(path.join(missionDir, 'player-atlas.json'), JSON.stringify(atlas, null, 2)),
);

console.log(`Spritesheet ${cols}x1 @ ${FRAME}px → player-spritesheet.png`);
