/**
 * Assets del mapa — Kenney Tiny Town (solo tiles validados, sin armas ni recortes rotos).
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sheet = path.join(root, 'public/assets/tilemaps/_dl/tiny-town/Tilemap/tilemap_packed.png');
const out = path.join(root, 'public/assets/game');

await mkdir(out, { recursive: true });

const TILE = 16;
const COLS = 12;
const SCALE = 4;

async function save(buf, name) {
  await sharp(buf).png({ compressionLevel: 9 }).toFile(path.join(out, name));
  console.log(`✓ game/${name}`);
}

function tile(index) {
  const tx = (index % COLS) * TILE;
  const ty = Math.floor(index / COLS) * TILE;
  return sharp(sheet).extract({ left: tx, top: ty, width: TILE, height: TILE });
}

async function composeGrid(rows, scale = SCALE) {
  const cell = TILE * scale;
  const composites = [];
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const idx = rows[y][x];
      if (idx == null || idx < 0) continue;
      const input = await tile(idx).resize(cell, cell, { kernel: 'nearest' }).toBuffer();
      composites.push({ input, left: x * cell, top: y * cell });
    }
  }
  const w = Math.max(...rows.map((r) => r.length)) * cell;
  const h = rows.length * cell;
  return sharp({
    create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

/** Solo muros / techos / puertas Kenney (índices < 96, nunca armas 100+) */
const BUILDINGS = {
  'building-hospital': [
    [48, 49, 50, 51],
    [96, 97, 98, 99],
    [108, 109, 110, 111],
    [120, 121, 122, 123],
  ],
  'building-police': [
    [48, 49, 50, 51],
    [76, 77, 78, 79],
    [88, 89, 90, 91],
    [76, 77, 78, 79],
  ],
  'building-clinic': [
    [52, 53, 54, 55],
    [72, 73, 74, 75],
    [84, 85, 86, 87],
    [72, 73, 74, 75],
  ],
  'building-university': [
    [52, 53, 54, 55],
    [80, 81, 82, 83],
    [92, 93, 94, 95],
    [108, 109, 110, 111],
  ],
  'building-school': [
    [52, 53, 54, 55],
    [72, 73, 74, 75],
    [84, 85, 86, 87],
    [72, 73, 74, 75],
  ],
};

for (const [name, grid] of Object.entries(BUILDINGS)) {
  await save(await composeGrid(grid), `${name}.png`);
}

async function compositeTiles(indices, gridW, gridH, scale, name) {
  const cell = TILE * scale;
  const composites = [];
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] < 0) continue;
    const input = await tile(indices[i]).resize(cell, cell, { kernel: 'nearest' }).toBuffer();
    composites.push({ input, left: (i % gridW) * cell, top: Math.floor(i / gridW) * cell });
  }
  await save(
    await sharp({
      create: { width: gridW * cell, height: gridH * cell, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite(composites)
      .png()
      .toBuffer(),
    name,
  );
}

await compositeTiles([28, 29, 40, 41], 2, 2, 3, 'prop-tree.png');
await compositeTiles([30, 31, 42, 43], 2, 2, 4, 'prop-tree-lg.png');
await compositeTiles([32, 33, 44, 45], 2, 2, 3, 'prop-pine.png');

const singleTiles = [
  ['prop-bush', 59, 3],
  ['prop-flower', 20, 4],
  ['prop-bloom', 21, 4],
  ['prop-fence', 40, 3],
  ['prop-fountain', 97, 3],
  ['prop-signpost', 92, 3],
  ['prop-plant', 19, 3],
  ['prop-bench', 89, 3],
  ['prop-entrance', 120, 3],
  ['prop-crosswalk', 14, 3],
  ['prop-lamp', 88, 3],
  ['prop-books', 93, 3],
  ['prop-statue', 96, 3],
  ['prop-mapBoard', 92, 3],
  ['prop-medSign', 92, 3],
  ['prop-ambulance', 87, 3],
  ['prop-policeCar', 80, 3],
  ['prop-busStop', 87, 3],
];

for (const [name, idx, scale] of singleTiles) {
  await save(await tile(idx).resize(TILE * scale, TILE * scale, { kernel: 'nearest' }).png().toBuffer(), `${name}.png`);
}

for (const [name, idx] of [
  ['tile-grass-0', 6],
  ['tile-grass-1', 7],
  ['tile-grass-2', 5],
  ['tile-grass-3', 8],
]) {
  await save(await tile(idx).resize(24, 24, { kernel: 'nearest' }).png().toBuffer(), `${name}.png`);
}
await save(await tile(14).resize(24, 24, { kernel: 'nearest' }).png().toBuffer(), 'tile-path.png');
await save(await tile(15).resize(24, 24, { kernel: 'nearest' }).png().toBuffer(), 'tile-road.png');
await save(await tile(51).resize(24, 24, { kernel: 'nearest' }).png().toBuffer(), 'tile-water.png');

console.log('Done → public/assets/game/ (Kenney tiles validados)');
