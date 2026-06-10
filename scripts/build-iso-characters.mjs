/**
 * Sprite sheets isométricos HD — estudiante, Gary (4 estados), NPCs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buf, px, rect, groundShadow, noise, lerp } from './iso/iso-art-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'public/assets/iso/characters');
const FW = 56;
const FH = 72;
const WALK_FRAMES = 7;
const DIRS = 4;
const GARY_STATES = 4;
const GARY_FRAMES = 4;

function drawStudentBackWalk(step) {
  const b = buf(FW, FH);
  const ox = 28;
  const oy = 66;
  const bob = step === 0 ? 0 : step % 2 === 1 ? -1 : 1;
  const legL = step % 3 === 1 ? 3 : step % 3 === 2 ? -2 : 0;
  const legR = -legL;

  groundShadow(b, FW, FH, 55);
  rect(b, ox - 10, oy - 38 + bob, 20, 22, [72, 138, 88]);
  rect(b, ox - 8, oy - 42 + bob, 16, 6, [58, 118, 72]);
  rect(b, ox - 12, oy - 48 + bob, 24, 14, [68, 128, 82]);
  rect(b, ox - 14, oy - 52 + bob, 8, 18, [52, 98, 68]);
  rect(b, ox + 6, oy - 52 + bob, 8, 18, [48, 92, 64]);
  rect(b, ox - 6, oy - 58 + bob, 12, 10, [218, 178, 140]);
  for (let i = 0; i < 8; i++) px(b, ox - 8 + i, oy - 66 + bob, [58, 120, 220, 255]);
  rect(b, ox - 5, oy - 22 + legL, 5, 12, [48, 72, 140]);
  rect(b, ox + 1, oy - 22 + legR, 5, 12, [42, 68, 130]);
  rect(b, ox - 6, oy - 10 + legL, 6, 8, [38, 42, 52]);
  rect(b, ox + 1, oy - 10 + legR, 6, 8, [38, 42, 52]);
  return b;
}

function drawStudentDir(dir, step) {
  if (dir === 0) return drawStudentBackWalk(step);
  const b = drawStudentBackWalk(step);
  return b;
}

function drawGaryState(state, frame) {
  const b = buf(FW, FH);
  const ox = 28;
  const oy = 66;
  const bob = frame % 2 === 0 ? 0 : -1;
  groundShadow(b, FW, FH, 50);

  const jacket = [68, 148, 92];
  const hair = [58, 130, 210];
  const skin = [232, 192, 158];

  rect(b, ox - 11, oy - 40 + bob, 22, 24, jacket);
  rect(b, ox - 9, oy - 44 + bob, 18, 6, [58, 128, 82]);
  rect(b, ox - 9, oy - 54 + bob, 18, 12, skin);
  for (let i = 0; i < 10; i++) px(b, ox - 10 + i, oy - 62 + bob, [...hair, 255]);
  rect(b, ox - 8, oy - 60 + bob, 16, 6, hair);
  rect(b, ox - 7, oy - 48 + bob, 5, 4, [40, 40, 55]);
  rect(b, ox + 2, oy - 48 + bob, 5, 4, [40, 40, 55]);
  rect(b, ox - 6, oy - 46 + bob, 12, 3, [50, 50, 60]);
  rect(b, ox - 4, oy - 44 + bob, 3, 2, [255, 255, 255]);
  rect(b, ox + 1, oy - 44 + bob, 3, 2, [255, 255, 255]);
  rect(b, ox - 13, oy - 36 + bob, 6, 6, [120, 60, 160]);

  if (state === 1) rect(b, ox + 10, oy - 42 + bob, 8, 4, skin);
  if (state === 2) {
    rect(b, ox - 3, oy - 40 + bob, 6, 3, [180, 120, 120]);
    rect(b, ox - 12, oy - 38 + bob, 6, 4, skin);
  }
  if (state === 3) {
    rect(b, ox + 8, oy - 50 + bob, 6, 8, skin);
    rect(b, ox + 10, oy - 52 + bob, 4, 4, skin);
  }
  return b;
}

function drawNpc(seed) {
  const b = buf(FW, FH);
  const ox = 28;
  const oy = 66;
  groundShadow(b, FW, FH, 45);
  const outfits = [[180, 90, 110], [90, 150, 120], [200, 160, 80], [100, 130, 200]];
  const c = outfits[seed % outfits.length];
  rect(b, ox - 9, oy - 36, 18, 20, c);
  rect(b, ox - 7, oy - 48, 14, 12, [232, 192, 158]);
  rect(b, ox - 8, oy - 54, 16, 8, [60 + seed * 20, 80, 120]);
  rect(b, ox - 5, oy - 22, 4, 10, [50, 60, 90]);
  rect(b, ox + 1, oy - 22, 4, 10, [50, 60, 90]);
  return b;
}

async function buildSheet(name, frames, cols) {
  await mkdir(out, { recursive: true });
  const composites = [];
  for (let i = 0; i < frames.length; i++) {
    const input = await sharp(frames[i].data, { raw: { width: FW, height: FH, channels: 4 } }).png().toBuffer();
    composites.push({ input, left: (i % cols) * FW, top: Math.floor(i / cols) * FH });
  }
  const rows = Math.ceil(frames.length / cols);
  const pathOut = path.join(out, `${name}.png`);
  await sharp({
    create: { width: cols * FW, height: rows * FH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(pathOut);
  await writeFile(path.join(out, `${name}.json`), JSON.stringify({ frameWidth: FW, frameHeight: FH, cols, frames: frames.length, name }, null, 2));
  console.log(`✓ characters/${name}.png (${frames.length} frames @ ${FW}×${FH})`);
}

// student-sheet.png → scripts/build-student-rpg-sheet.mjs (pnpm assets:player)

const garyFrames = [];
for (let s = 0; s < GARY_STATES; s++) {
  for (let f = 0; f < GARY_FRAMES; f++) garyFrames.push(drawGaryState(s, f));
}
await buildSheet('gary-sheet', garyFrames, GARY_FRAMES);

const npcFrames = [0, 1, 2, 3, 0, 1].map((s) => drawNpc(s));
await buildSheet('npc-sheet', npcFrames, 4);
