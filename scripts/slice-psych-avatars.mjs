import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../public/assets/avatars/psych/select-sheet.png');
const outDir = path.join(__dirname, '../public/assets/avatars/psych');
const cleanDir = path.join(outDir, 'clean');

fs.mkdirSync(cleanDir, { recursive: true });

const avatars = [
  ['psych-alejandro', 0, 0],
  ['psych-valeria', 1, 0],
  ['psych-mateo', 2, 0],
  ['psych-sofia', 3, 0],
  ['psych-daniel', 4, 0],
  ['psych-isabella', 0, 1],
  ['psych-simon', 1, 1],
  ['psych-camila', 2, 1],
  ['psych-sebastian', 3, 1],
  ['psych-laura', 4, 1],
];

const meta = await sharp(src).metadata();
const W = meta.width;
const H = meta.height;

const left = Math.round(W * 0.028);
const top = Math.round(H * 0.225);
const right = Math.round(W * 0.972);
const bottom = Math.round(H * 0.86);
const gridW = right - left;
const gridH = bottom - top;
const cellW = Math.floor(gridW / 5);
const cellH = Math.floor(gridH / 2);
const portraitH = Math.floor(cellH * 0.8);

for (const [id, col, row] of avatars) {
  const x = left + col * cellW;
  const y = top + row * cellH;
  const region = { left: x, top: y, width: cellW, height: portraitH };
  const buffer = await sharp(src).extract(region).png().toBuffer();
  await sharp(buffer).toFile(path.join(outDir, `${id}.png`));
  await sharp(buffer).toFile(path.join(cleanDir, `${id}.png`));
  console.log(`Wrote ${id}.png (portrait only ${cellW}x${portraitH})`);
}
