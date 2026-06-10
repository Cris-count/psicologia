/**
 * Protagonista desde prototipo del usuario (hoodie, jeans, zapatos rojos).
 * Salida: public/assets/iso/characters/student-sheet.png (96×128, 7×4)
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const refPath = path.join(__dirname, '..', 'public/assets/mission/student-prototype-ref.png');
const outDir = path.join(__dirname, '..', 'public/assets/iso/characters');

const FW = 96;
const FH = 128;
const COLS = 7;
const ROWS = 4;
const DIRS = ['down', 'up', 'left', 'right'];
const BODY_H = 100;
const BASELINE = 118;

const FRAME_DEFS = [
  { bob: 0, scale: 1, lean: 0 },
  { bob: -2, scale: 1.02, lean: 0 },
  { bob: 0, scale: 1, lean: 0 },
  { bob: 0, scale: 1, lean: -2 },
  { bob: -3, scale: 1.03, lean: -3 },
  { bob: 2, scale: 1, lean: 2 },
  { bob: 0, scale: 1.04, lean: 0 },
];

function alphaBounds(data, w, h, ch) {
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * ch + 3] > 24) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function keyGreyBackground(data, w, h, ch) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      const lum = (r + g + b) / 3;
      if (spread < 18 && lum > 165 && lum < 230) data[i + 3] = 0;
      if (spread < 12 && lum > 140 && lum < 250) data[i + 3] = Math.min(data[i + 3], 40);
    }
  }
}

let baseCharacter;
async function loadBaseCharacter() {
  if (baseCharacter) return baseCharacter;
  const { data, info } = await sharp(refPath)
    .extract({ left: 20, top: 10, width: 290, height: 550 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  keyGreyBackground(data, info.width, info.height, info.channels);
  const b = alphaBounds(data, info.width, info.height, info.channels);
  baseCharacter = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .extract({ left: b.minX, top: b.minY, width: b.width, height: b.height })
    .png()
    .toBuffer();
  return baseCharacter;
}

async function renderFrame(def, { flipX = false, darken = 0 } = {}) {
  const input = await loadBaseCharacter();
  let pipe = sharp(input);
  const meta = await sharp(input).metadata();
  const targetH = Math.round(BODY_H * def.scale);
  const targetW = Math.round((meta.width / meta.height) * targetH);
  pipe = pipe.resize(targetW, targetH, { kernel: 'lanczos3', fit: 'fill' });
  if (flipX) pipe = pipe.flop();
  if (darken > 0) pipe = pipe.modulate({ brightness: 1 - darken });
  if (def.lean) pipe = pipe.rotate(def.lean, { background: { r: 0, g: 0, b: 0, alpha: 0 } });

  const { data: px, info: pi } = await pipe.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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
        ? { darken: 0.14 }
        : dirName === 'left' || dirName === 'right'
          ? { flipX: true }
          : {};
    const buf = await renderFrame(FRAME_DEFS[f], opts);
    composites.push({ input: buf, left: f * FW, top: dir * FH });
  }
}

await sharp({
  create: { width: COLS * FW, height: ROWS * FH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(composites)
  .png({ compressionLevel: 9 })
  .toFile(path.join(outDir, 'student-sheet.png'));

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
      source: 'student-prototype-ref.png',
    },
    null,
    2,
  ),
);

console.log(`✓ Protagonista prototipo ${COLS}×${ROWS} @ ${FW}×${FH}`);
