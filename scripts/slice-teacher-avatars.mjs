import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../public/assets/avatars/teachers/select-sheet.png');
const outDir = path.join(__dirname, '../public/assets/avatars/teachers');
const cleanDir = path.join(outDir, 'clean');

fs.mkdirSync(cleanDir, { recursive: true });

const gallery = [
  ['teach-camila', 0],
  ['teach-andres', 1],
  ['teach-isabella', 2],
  ['teach-sebastian', 3],
  ['teach-maria', 4],
  ['teach-tomas', 5],
];

const meta = await sharp(src).metadata();
const W = meta.width;
const H = meta.height;

const featured = {
  left: Math.round(W * 0.055),
  top: Math.round(H * 0.195),
  width: Math.round(W * 0.28),
  height: Math.round(H * 0.4),
};

const featuredBuffer = await sharp(src).extract(featured).png().toBuffer();
await sharp(featuredBuffer).toFile(path.join(outDir, 'teach-valentina.png'));
await sharp(featuredBuffer).toFile(path.join(cleanDir, 'teach-valentina.png'));
console.log('Wrote teach-valentina.png', featured);

const rowTop = Math.round(H * 0.72);
const rowBottom = Math.round(H * 0.94);
const rowH = rowBottom - rowTop;
const portraitH = Math.floor(rowH * 0.74);
const left = Math.round(W * 0.04);
const right = Math.round(W * 0.96);
const gridW = right - left;
const cellW = Math.floor(gridW / 6);

for (const [id, col] of gallery) {
  const x = left + col * cellW;
  const region = { left: x, top: rowTop, width: cellW, height: portraitH };
  const buffer = await sharp(src).extract(region).png().toBuffer();
  await sharp(buffer).toFile(path.join(outDir, `${id}.png`));
  await sharp(buffer).toFile(path.join(cleanDir, `${id}.png`));
  console.log(`Wrote ${id}.png (${cellW}x${portraitH})`);
}
