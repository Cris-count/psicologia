/**
 * Extrae sprites del character sheet de NEXA para animación web.
 * Ejecutar: node scripts/crop-nexa-assets.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'public/assets/guide/nexa-reference-sheet.png');
const outDir = path.join(root, 'public/assets/guide');

await mkdir(outDir, { recursive: true });

const meta = await sharp(src).metadata();
const W = meta.width ?? 1536;
const H = meta.height ?? 1024;

console.log(`Sheet: ${W}x${H}`);

/** Regiones aproximadas del character sheet (porcentajes del original). */
const regions = {
  hero: { left: 0.05, top: 0.2, width: 0.34, height: 0.78 },
  bust: { left: 0.08, top: 0.2, width: 0.28, height: 0.42 },
  portrait: { left: 0.72, top: 0.62, width: 0.12, height: 0.22 },
  expr_idle: { left: 0.515, top: 0.095, width: 0.095, height: 0.19 },
  expr_thinking: { left: 0.615, top: 0.095, width: 0.095, height: 0.19 },
  expr_happy: { left: 0.715, top: 0.095, width: 0.095, height: 0.19 },
  expr_encourage: { left: 0.815, top: 0.095, width: 0.095, height: 0.19 },
  pose_point: { left: 0.515, top: 0.33, width: 0.13, height: 0.42 },
};

function toPx(region) {
  return {
    left: Math.round(region.left * W),
    top: Math.round(region.top * H),
    width: Math.round(region.width * W),
    height: Math.round(region.height * H),
  };
}

for (const [name, region] of Object.entries(regions)) {
  const r = toPx(region);
  const dest = path.join(outDir, `nexa-${name}.webp`);
  await sharp(src)
    .extract(r)
    .webp({ quality: 92 })
    .toFile(dest);
  console.log(`✓ nexa-${name}.webp (${r.width}x${r.height})`);
}

console.log('Done.');
