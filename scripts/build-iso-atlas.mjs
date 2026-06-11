/**
 * Texture atlases Phaser — buildings, props, characters
 */
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILDINGS, DECOR } from './iso/iso-layout-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const isoRoot = path.join(root, 'public/assets/iso');
const atlasDir = path.join(isoRoot, 'atlases');
const metaTs = path.join(root, 'src/app/features/student/mission/game2d/iso/iso.atlas.ts');

await mkdir(atlasDir, { recursive: true });

async function packAtlas(name, keys, subdirs) {
  const images = [];
  for (const key of keys) {
    let found = null;
    for (const sub of subdirs) {
      const p = path.join(isoRoot, sub, `${key}.png`);
      try {
        const meta = await sharp(p).metadata();
        images.push({ key, path: p, w: meta.width, h: meta.height });
        found = true;
        break;
      } catch { /* try next */ }
    }
    if (!found) console.warn(`⚠ atlas ${name}: missing ${key}`);
  }
  if (!images.length) return;

  const cols = Math.ceil(Math.sqrt(images.length));
  const cellW = Math.max(...images.map((i) => i.w));
  const cellH = Math.max(...images.map((i) => i.h));
  const rows = Math.ceil(images.length / cols);
  const sheetW = cols * cellW;
  const sheetH = rows * cellH;

  const composites = [];
  const frames = {};
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellW;
    const y = row * cellH;
    composites.push({ input: img.path, left: x, top: y });
    frames[img.key] = {
      frame: { x, y, w: img.w, h: img.h },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: img.w, h: img.h },
      sourceSize: { w: img.w, h: img.h },
    };
  }

  const pngPath = path.join(atlasDir, `${name}.png`);
  await sharp({
    create: { width: sheetW, height: sheetH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(pngPath);

  const json = {
    frames,
    meta: {
      app: 'MIND-SPHERE',
      version: '1.0',
      image: `${name}.png`,
      format: 'RGBA8888',
      size: { w: sheetW, h: sheetH },
      scale: '1',
    },
  };
  await writeFile(path.join(atlasDir, `${name}.json`), JSON.stringify(json, null, 2));
  console.log(`✓ atlas ${name} (${images.length} sprites, ${sheetW}×${sheetH})`);
  return { key: name, url: `/assets/iso/atlases/${name}.png`, jsonUrl: `/assets/iso/atlases/${name}.json`, frames: images.map((i) => i.key) };
}

const buildingKeys = [...new Set(BUILDINGS.map((b) => b.sprite))];
const propKeys = [
  ...new Set([
    ...BUILDINGS.flatMap((b) => (b.props ?? []).map((p) => p.sprite)),
    ...DECOR.map((d) => d.sprite),
  ]),
];

const atlases = [];
const bAtlas = await packAtlas('atlas-buildings', buildingKeys, ['buildings']);
if (bAtlas) atlases.push({ ...bAtlas, phase: 1, lazy: false });

const pAtlas = await packAtlas('atlas-props', propKeys, ['props']);
if (pAtlas) atlases.push({ ...pAtlas, phase: 2, lazy: true });

const bootPreview = path.join(isoRoot, 'tilesets/campus-premium.png');
const previewPath = path.join(isoRoot, 'boot-preview.png');
try {
  await sharp(bootPreview).resize(640, 320, { fit: 'cover' }).png().toFile(previewPath);
  console.log('✓ boot-preview.png');
} catch (e) {
  console.warn('⚠ boot preview skipped');
}

const ts = `import type { IsoAtlasDef } from './iso.types';

/** Generado por scripts/build-iso-atlas.mjs */
export const ISO_ATLASES: IsoAtlasDef[] = ${JSON.stringify(atlases, null, 2)} as IsoAtlasDef[];

export const ISO_BOOT_PREVIEW = '/assets/iso/boot-preview.png';
`;
await writeFile(metaTs, ts);
