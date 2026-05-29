/**
 * Extrae SOLO el personaje de cada pose (sin paneles, textos ni fondo del sheet).
 * Ejecutar: node scripts/crop-student-hero.mjs && node scripts/remove-student-bg.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'public/assets/mission/student-hero-sheet.png');
const outDir = path.join(root, 'public/assets/mission');

await mkdir(outDir, { recursive: true });

const meta = await sharp(src).metadata();
const W = meta.width ?? 1536;
const H = meta.height ?? 1024;

console.log(`Sheet: ${W}x${H}`);

/** Recorte APRETADO al cuerpo del personaje dentro de cada panel de acción. */
const regions = {
  pose_idle: { left: 0.048, top: 0.668, width: 0.098, height: 0.3 },
  pose_walk: { left: 0.198, top: 0.668, width: 0.098, height: 0.3 },
  pose_run: { left: 0.348, top: 0.668, width: 0.098, height: 0.3 },
  pose_interact: { left: 0.498, top: 0.668, width: 0.098, height: 0.3 },
  pose_celebrate: { left: 0.648, top: 0.668, width: 0.098, height: 0.3 },
  pose_think: { left: 0.798, top: 0.668, width: 0.098, height: 0.3 },
  hero_front: { left: 0.062, top: 0.108, width: 0.145, height: 0.295 },
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
  const dest = path.join(outDir, `student-${name}-raw.png`);
  await sharp(src).extract(r).png().toFile(dest);
  console.log(`✓ student-${name}-raw.png (${r.width}x${r.height})`);
}

console.log('Raw crops done. Run: node scripts/remove-student-bg.mjs');
