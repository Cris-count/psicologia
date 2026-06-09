import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const navDir = path.join(__dirname, '../public/assets/ui/teacher-nav');
const gridSrc = path.join(navDir, 'icons-grid.png');
const resultadosSvg = path.join(navDir, 'resultados.svg');

const OUTPUT_SIZE = 256;
const BLACK_KEY_THRESHOLD = 38;

const gridItems = [
  { name: 'resumen', col: 0, row: 0 },
  { name: 'casos', col: 1, row: 0 },
  { name: 'grupos', col: 2, row: 0 },
  { name: 'estudiantes', col: 0, row: 1 },
  { name: 'tareas', col: 1, row: 1 },
  { name: 'perfil', col: 2, row: 1 },
];

async function measureReferenceMaxDim() {
  const ref = await sharp(resultadosSvg, { density: 144 })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const trimmed = await sharp(ref).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  return Math.max(trimmed.info.width, trimmed.info.height);
}

async function removeDarkBackground(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const maxChannel = Math.max(data[i], data[i + 1], data[i + 2]);
    if (maxChannel <= BLACK_KEY_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function normalizeIcon(inputBuffer, targetMaxDim) {
  let working = await removeDarkBackground(inputBuffer);

  try {
    working = await sharp(working).trim({ threshold: 8 }).png().toBuffer();
  } catch {
    // keep crop if trim finds no border
  }

  const info = await sharp(working).metadata();
  const maxDim = Math.max(info.width ?? targetMaxDim, info.height ?? targetMaxDim);
  const scale = targetMaxDim / maxDim;
  const targetW = Math.max(1, Math.round(info.width * scale));
  const targetH = Math.max(1, Math.round(info.height * scale));

  const scaled = await sharp(working).resize(targetW, targetH, { fit: 'fill' }).png().toBuffer();

  return sharp({
    create: {
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: scaled,
        left: Math.round((OUTPUT_SIZE - targetW) / 2),
        top: Math.round((OUTPUT_SIZE - targetH) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function sliceGridIcon(src, col, row, cols, rows) {
  const meta = await sharp(src).metadata();
  const cellW = Math.floor(meta.width / cols);
  const cellH = Math.floor(meta.height / rows);
  const inset = Math.round(Math.min(cellW, cellH) * 0.05);

  return sharp(src)
    .extract({
      left: col * cellW + inset,
      top: row * cellH + inset,
      width: cellW - inset * 2,
      height: cellH - inset * 2,
    })
    .png()
    .toBuffer();
}

async function countBlackOpaquePng(filePath) {
  const { data } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 200 && data[i] < 20 && data[i + 1] < 20 && data[i + 2] < 20) {
      count++;
    }
  }
  return count;
}

const referenceMaxDim = await measureReferenceMaxDim();
console.log(`Reference max dimension: ${referenceMaxDim}px`);

const gridMeta = await sharp(gridSrc).metadata();
const cols = 3;
const rows = 2;

for (const item of gridItems) {
  const raw = await sliceGridIcon(gridSrc, item.col, item.row, cols, rows);
  const normalized = await normalizeIcon(raw, referenceMaxDim);
  const outPath = path.join(navDir, `${item.name}.png`);
  await sharp(normalized).png({ compressionLevel: 9 }).toFile(outPath);
  const blackLeft = await countBlackOpaquePng(outPath);
  console.log(`Wrote ${item.name}.png (${blackLeft} black opaque px)`);
}

console.log(`Grid source: ${gridMeta.width}x${gridMeta.height}`);
