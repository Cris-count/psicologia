/**
 * Protagonista simulador educativo — 4 dirs × 7 frames @ 112×144 HD.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FW, FH, FRAMES_PER_DIR, DIRS, buildEduPlayerFrames } from './edu-player-art.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public/assets/iso/characters');
await mkdir(outDir, { recursive: true });

const COLS = FRAMES_PER_DIR;
const ROWS = DIRS.length;
const frames = buildEduPlayerFrames();

const composites = [];
for (let i = 0; i < frames.length; i++) {
  const input = await sharp(frames[i].data, { raw: { width: FW, height: FH, channels: 4 } }).png().toBuffer();
  composites.push({ input, left: (i % COLS) * FW, top: Math.floor(i / COLS) * FH });
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
      dirs: DIRS,
      framesPerDir: COLS,
      idle: [0, 1, 2],
      walk: [3, 4, 5],
      run: [3, 4, 5],
      interact: 6,
      source: 'edu-player-art HD 4-dir',
    },
    null,
    2,
  ),
);

console.log(`✓ Protagonista HD ${COLS}×${ROWS} @ ${FW}×${FH} (4 dirs, expresiones)`);
