/**
 * Sprite sheet profesional del protagonista — Phaser 3 compatible.
 * 4 direcciones × 7 frames (idle×3, walk×3, interact).
 * Salidas:
 *   public/assets/iso/characters/student-sheet.png  (56×72, grid 7×4)
 *   public/assets/game/player-pixel.png             (32×48, fila única 28 cols)
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FW, FH, FRAMES_PER_DIR, DIRS, buildStudentFrames } from './iso/student-rpg-art.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isoDir = path.join(__dirname, '..', 'public/assets/iso/characters');
const gameDir = path.join(__dirname, '..', 'public/assets/game');

const COLS = FRAMES_PER_DIR;
const ROWS = DIRS.length;

async function composeGrid(frames, fw, fh, cols, rows) {
  const composites = [];
  for (let i = 0; i < frames.length; i++) {
    const input = await sharp(frames[i].data, { raw: { width: fw, height: fh, channels: 4 } })
      .png()
      .toBuffer();
    composites.push({ input, left: (i % cols) * fw, top: Math.floor(i / cols) * fh });
  }
  return sharp({
    create: {
      width: cols * fw,
      height: rows * fh,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 });
}

async function downscaleSheet(inputPath, outW, outH, fw, fh, cols, rows) {
  const meta = await sharp(inputPath).metadata();
  const scaleX = outW / meta.width;
  const scaleY = outH / meta.height;
  const outFw = Math.round(fw * scaleX);
  const outFh = Math.round(fh * scaleY);

  const resized = await sharp(inputPath)
    .resize(Math.round(cols * outFw), Math.round(rows * outFh), { kernel: 'nearest' })
    .png()
    .toBuffer();

  return { buffer: resized, fw: outFw, fh: outFh };
}

await mkdir(isoDir, { recursive: true });
await mkdir(gameDir, { recursive: true });

const frames = buildStudentFrames();
console.log(`Generando ${frames.length} frames (${FRAMES_PER_DIR}×${DIRS.length}) @ ${FW}×${FH}px`);

const isoPath = path.join(isoDir, 'student-sheet.png');
await (await composeGrid(frames, FW, FH, COLS, ROWS)).toFile(isoPath);

const isoMeta = {
  frameWidth: FW,
  frameHeight: FH,
  cols: COLS,
  rows: ROWS,
  frames: frames.length,
  dirs: DIRS,
  framesPerDir: FRAMES_PER_DIR,
  idle: [0, 1, 2],
  walk: [3, 4, 5],
  run: [3, 4, 5],
  interact: 6,
  layout: 'grid 7×4 — filas: down, up, left, right',
};
await writeFile(path.join(isoDir, 'student-sheet.json'), JSON.stringify(isoMeta, null, 2));
console.log(`✓ iso/characters/student-sheet.png (${COLS}×${ROWS} @ ${FW}×${FH})`);

const pixelFw = 32;
const pixelFh = 48;
const { buffer: pixelBuf, fw: pfw, fh: pfh } = await downscaleSheet(
  isoPath,
  COLS * pixelFw,
  ROWS * pixelFh,
  FW,
  FH,
  COLS,
  ROWS,
);

const flatComposites = [];
for (let dir = 0; dir < ROWS; dir++) {
  for (let f = 0; f < COLS; f++) {
    const slice = await sharp(pixelBuf)
      .extract({ left: f * pfw, top: dir * pfh, width: pfw, height: pfh })
      .png()
      .toBuffer();
    flatComposites.push({ input: slice, left: (dir * COLS + f) * pfw, top: 0 });
  }
}

const pixelPath = path.join(gameDir, 'player-pixel.png');
await sharp({
  create: {
    width: COLS * ROWS * pfw,
    height: pfh,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(flatComposites)
  .png({ compressionLevel: 9 })
  .toFile(pixelPath);

const pixelMeta = {
  frameWidth: pfw,
  frameHeight: pfh,
  dirs: DIRS,
  framesPerDir: FRAMES_PER_DIR,
  idle: [0, 1, 2],
  walk: [3, 4, 5],
  run: [3, 4, 5],
  interact: 6,
  layout: 'fila única — por dir: idle0-2, walk3-5, interact(6)',
};
await writeFile(path.join(gameDir, 'player-pixel.json'), JSON.stringify(pixelMeta, null, 2));
console.log(`✓ game/player-pixel.png (${COLS * ROWS} frames @ ${pfw}×${pfh})`);
