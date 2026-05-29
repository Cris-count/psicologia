/**
 * Elimina fondo de paneles del concept sheet → cutouts con alpha limpio.
 * node scripts/remove-student-bg.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const missionDir = path.join(__dirname, '..', 'public/assets/mission');

function keyPanelBackground(data, channels) {
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

    if (lum < 32) {
      data[i + 3] = 0;
    } else if (lum < 62 && maxC < 90) {
      data[i + 3] = Math.round(((lum - 32) / 30) * 200);
    } else if (lum < 95 && b >= r && b >= g && sat < 0.45) {
      data[i + 3] = Math.min(data[i + 3], Math.round(((lum - 45) / 50) * 220));
    } else if (lum < 110 && r > 60 && b > 80 && g < 70) {
      data[i + 3] = Math.min(data[i + 3], Math.round(((lum - 50) / 60) * 180));
    }
  }
}

async function processCutout(inputPath, outputPath) {
  const img = sharp(inputPath);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  keyPanelBackground(data, info.channels);

  await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .trim({ threshold: 12 })
    .png({ quality: 95, effort: 10 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`✓ ${path.basename(outputPath)} (${meta.width}x${meta.height})`);
}

const rawFiles = (await readdir(missionDir)).filter(
  (f) => f.startsWith('student-') && f.endsWith('-raw.png'),
);

for (const file of rawFiles) {
  await processCutout(path.join(missionDir, file), path.join(missionDir, file.replace('-raw.png', '-cutout.png')));
}

console.log('Done.');
