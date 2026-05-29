/**
 * Elimina fondo oscuro del arte NEXA para integración sin marco rectangular.
 * node scripts/remove-nexa-bg.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const guideDir = path.join(root, 'public/assets/guide');

const files = ['nexa-hero-premium.png', 'nexa-bust-premium.png'];

/** Convierte píxeles oscuros en transparentes para fusionar con el fondo del simulador. */
async function keyDarkBackground(inputPath, outputPath) {
  const img = sharp(inputPath);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const maxC = Math.max(r, g, b);

    // Fondo oscuro morado/negro → transparente gradual
    if (lum < 28) {
      data[i + 3] = 0;
    } else if (lum < 55 && maxC < 80) {
      data[i + 3] = Math.round(((lum - 28) / 27) * 180);
    } else if (lum < 75 && b > r && b > g) {
      // residuo azul/morado de fondo
      data[i + 3] = Math.min(data[i + 3], Math.round(((lum - 40) / 35) * 255));
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png({ quality: 95 }).toFile(outputPath);
  console.log(`✓ ${path.basename(outputPath)}`);
}

for (const file of files) {
  const input = path.join(guideDir, file);
  const output = path.join(guideDir, file.replace('.png', '-cutout.png'));
  await keyDarkBackground(input, output);
}

console.log('Done.');
