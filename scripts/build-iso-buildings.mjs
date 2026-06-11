/**
 * Edificios y props isométricos HD — estilo referencia GARY
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILDINGS, DECOR } from './iso/iso-layout-data.mjs';
import { buf, px, rect, groundShadow, noise, lerp, fillDiamond } from './iso/iso-art-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'public/assets/iso');

async function save(b, sub, name) {
  const dir = path.join(root, sub);
  await mkdir(dir, { recursive: true });
  await sharp(b.data, { raw: { width: b.w, height: b.h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(path.join(dir, `${name}.png`));
  console.log(`✓ ${sub}/${name}.png`);
}

function hospital() {
  const w = 320, h = 380;
  const b = buf(w, h);
  const baseY = h - 30;
  groundShadow(b, w, h, 70);
  for (let y = baseY - 160; y < baseY; y++) {
    const t = (baseY - y) / 160;
    const lw = 50 + t * 110;
    for (let x = w / 2 - lw; x < w / 2 + lw; x++) {
      const side = x < w / 2 ? [228, 232, 240] : [208, 212, 222];
      px(b, Math.round(x), y, side);
    }
  }
  for (let y = baseY - 200; y < baseY - 160; y++) {
    const t = (baseY - 160 - y) / 40;
    const rw = 60 + t * 100;
    for (let x = w / 2 - rw; x < w / 2 + rw; x++) px(b, Math.round(x), y, [88, 148, 200]);
  }
  rect(b, w / 2 - 28, baseY - 90, 56, 64, [220, 230, 245]);
  rect(b, w / 2 - 24, baseY - 86, 48, 56, [180, 210, 240, 200]);
  rect(b, w / 2 - 40, baseY - 175, 80, 16, [210, 70, 70]);
  for (let i = 0; i < 8; i++) rect(b, w / 2 - 36 + i * 9, baseY - 173, 6, 10, [255, 255, 255]);
  rect(b, w / 2 - 8, baseY - 168, 16, 16, [255, 255, 255]);
  rect(b, w / 2 - 4, baseY - 164, 8, 8, [220, 60, 60]);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      rect(b, w / 2 - 70 + col * 36, baseY - 140 + row * 28, 22, 18, [200, 220, 240, 220]);
    }
  }
  for (let i = 0; i < 30; i++) {
    const x = 40 + (i * 9) % 240;
    const y = baseY - 20 + (i % 3);
    px(b, x, y, [58, 120, 58, 200]);
  }
  return b;
}

function university() {
  const w = 340, h = 400;
  const b = buf(w, h);
  const baseY = h - 28;
  groundShadow(b, w, h, 75);
  for (let y = baseY - 180; y < baseY; y++) {
    const t = (baseY - y) / 180;
    const lw = 55 + t * 120;
    for (let x = w / 2 - lw; x < w / 2 + lw; x++) {
      px(b, Math.round(x), y, x < w / 2 ? [198, 182, 158] : [178, 162, 140]);
    }
  }
  for (let y = baseY - 220; y < baseY - 180; y++) {
    const rw = 70 + ((baseY - 180 - y) / 40) * 110;
    for (let x = w / 2 - rw; x < w / 2 + rw; x++) px(b, Math.round(x), y, [148, 128, 108]);
  }
  rect(b, w / 2 - 50, baseY - 100, 100, 80, [220, 210, 190]);
  rect(b, w / 2 - 42, baseY - 92, 84, 68, [60, 40, 20, 80]);
  rect(b, w / 2 - 8, baseY - 88, 16, 60, [240, 230, 210]);
  rect(b, w / 2 - 60, baseY - 195, 120, 18, [160, 130, 100]);
  for (let i = 0; i < 10; i++) rect(b, w / 2 - 50 + i * 10, baseY - 193, 7, 11, [255, 248, 230]);
  rect(b, w / 2 - 70, baseY - 120, 12, 50, [170, 150, 125]);
  rect(b, w / 2 + 58, baseY - 120, 12, 50, [170, 150, 125]);
  rect(b, w / 2 - 55, baseY - 130, 24, 40, [120, 60, 160]);
  rect(b, w / 2 + 31, baseY - 130, 24, 40, [120, 60, 160]);
  for (let i = 0; i < 50; i++) {
    const x = 30 + (i * 7) % 280;
    const y = baseY - 18 + (i % 4);
    const c = i % 2 ? [220, 180, 80, 220] : [180, 90, 180, 220];
    px(b, x, y, c);
  }
  return b;
}

function genericBuilding(w, h, wall, roof, signColor, signText) {
  const b = buf(w, h);
  const baseY = h - 26;
  groundShadow(b, w, h, 60);
  for (let y = baseY - 130; y < baseY; y++) {
    const t = (baseY - y) / 130;
    const lw = 40 + t * (w * 0.38);
    for (let x = w / 2 - lw; x < w / 2 + lw; x++) {
      px(b, Math.round(x), y, x < w / 2 ? wall : [wall[0] - 18, wall[1] - 18, wall[2] - 18]);
    }
  }
  for (let y = baseY - 165; y < baseY - 130; y++) {
    const rw = 45 + ((baseY - 130 - y) / 35) * (w * 0.35);
    for (let x = w / 2 - rw; x < w / 2 + rw; x++) px(b, Math.round(x), y, roof);
  }
  rect(b, w / 2 - 22, baseY - 70, 44, 52, [230, 235, 245]);
  rect(b, w / 2 - 35, baseY - 155, 70, 14, signColor);
  for (let i = 0; i < Math.min(signText.length, 12); i++) {
    rect(b, w / 2 - 30 + i * 5, baseY - 153, 4, 9, [255, 255, 255]);
  }
  return b;
}

const buildingFns = {
  'iso-building-hospital': hospital,
  'iso-building-university': university,
  'iso-building-police': () => genericBuilding(280, 320, [168, 138, 108], [100, 120, 170], [60, 90, 160], 'POLICIA'),
  'iso-building-clinic': () => genericBuilding(260, 300, [188, 168, 148], [140, 90, 150], [150, 70, 140], 'PSI'),
  'iso-building-care-center': () => genericBuilding(270, 310, [210, 180, 150], [168, 120, 90], [200, 140, 80], 'BIENESTAR'),
};

for (const bld of BUILDINGS) {
  const fn = buildingFns[bld.sprite];
  if (fn) await save(fn(), 'buildings', bld.sprite);
}

function prop(w, h, draw) {
  const b = buf(w, h);
  draw(b);
  return b;
}

const propFns = {
  'iso-prop-fountain': () => prop(140, 160, (b) => {
    groundShadow(b, 140, 160, 40);
    rect(b, 45, 100, 50, 28, [150, 150, 162]);
    rect(b, 32, 78, 76, 28, [172, 172, 182]);
    rect(b, 50, 52, 40, 36, [90, 190, 230]);
    for (let i = 0; i < 8; i++) px(b, 58 + i * 2, 44 - i, [200, 240, 255, 200]);
  }),
  'iso-prop-lamp': () => prop(56, 108, (b) => {
    groundShadow(b, 56, 108, 30);
    rect(b, 22, 48, 10, 52, [55, 55, 65]);
    rect(b, 10, 18, 36, 32, [255, 220, 130]);
    rect(b, 14, 22, 28, 24, [255, 240, 180]);
  }),
  'iso-prop-bench': () => prop(96, 56, (b) => {
    groundShadow(b, 96, 56, 35);
    rect(b, 10, 24, 76, 14, [130, 88, 55]);
    rect(b, 14, 38, 10, 14, [95, 65, 40]);
    rect(b, 72, 38, 10, 14, [95, 65, 40]);
  }),
  'iso-prop-tree-oak': () => prop(112, 148, (b) => {
    groundShadow(b, 112, 148, 45);
    rect(b, 48, 95, 16, 44, [95, 65, 42]);
    for (let i = 0; i < 120; i++) {
      const x = 28 + (i * 5) % 56;
      const y = 18 + (i * 3) % 72;
      px(b, x, y, [42 + (i % 3) * 8, 110 + (i % 4) * 6, 48, 255]);
    }
  }),
  'iso-prop-tree-oak-lg': () => prop(140, 180, (b) => {
    groundShadow(b, 140, 180, 55);
    rect(b, 62, 115, 18, 52, [88, 58, 38]);
    for (let i = 0; i < 200; i++) {
      const x = 20 + (i * 4) % 100;
      const y = 10 + (i * 2) % 100;
      px(b, x, y, [38 + (i % 4) * 10, 100 + (i % 5) * 8, 42, 255]);
    }
  }),
  'iso-prop-tree-pine': () => prop(96, 140, (b) => {
    groundShadow(b, 96, 140, 40);
    rect(b, 42, 82, 12, 44, [78, 52, 34]);
    for (let y = 12; y < 88; y++) {
      const rw = Math.round((88 - y) * 0.55);
      for (let x = 48 - rw; x < 48 + rw; x++) px(b, x, y, [32 + (y % 5) * 4, 92 + (y % 3) * 6, 48, 255]);
    }
  }),
  'iso-prop-tree-lush': () => prop(104, 152, (b) => {
    groundShadow(b, 104, 152, 48);
    rect(b, 46, 90, 14, 48, [82, 55, 36]);
    for (let i = 0; i < 150; i++) {
      px(b, 22 + (i * 4) % 60, 14 + (i * 2) % 76, [48, 128, 58, 255]);
      px(b, 24 + (i * 3) % 56, 16 + (i * 2) % 70, [68, 148, 72, 220]);
    }
  }),
  'iso-prop-bush': () => prop(72, 56, (b) => {
    groundShadow(b, 72, 56, 30);
    for (let i = 0; i < 50; i++) px(b, 14 + (i * 2) % 44, 10 + (i % 28), [48, 118, 55, 255]);
  }),
  'iso-prop-bush-round': () => prop(64, 52, (b) => {
    groundShadow(b, 64, 52, 28);
    for (let y = 8; y < 40; y++)
      for (let x = 12; x < 52; x++)
        if (Math.hypot(x - 32, y - 24) < 18) px(b, x, y, [52, 125, 58, 255]);
  }),
  'iso-prop-hedge': () => prop(80, 44, (b) => {
    groundShadow(b, 80, 44, 25);
    for (let i = 0; i < 60; i++) px(b, 8 + (i * 2) % 64, 8 + (i % 24), [40, 105, 48, 255]);
  }),
  'iso-prop-flowers': () => prop(64, 48, (b) => {
    groundShadow(b, 64, 48, 25);
    for (let i = 0; i < 24; i++) px(b, 10 + i * 2, 20, [210, 90, 140, 255]);
  }),
  'iso-prop-flowers-yellow': () => prop(64, 48, (b) => {
    groundShadow(b, 64, 48, 25);
    for (let i = 0; i < 24; i++) px(b, 10 + i * 2, 20, [240, 210, 80, 255]);
  }),
  'iso-prop-flowers-purple': () => prop(64, 48, (b) => {
    groundShadow(b, 64, 48, 25);
    for (let i = 0; i < 24; i++) px(b, 10 + i * 2, 20, [170, 90, 200, 255]);
  }),
  'iso-prop-fence': () => prop(88, 48, (b) => {
    rect(b, 6, 14, 76, 8, [145, 115, 85]);
    for (let i = 0; i < 7; i++) rect(b, 10 + i * 10, 10, 5, 28, [120, 92, 68]);
  }),
  'iso-prop-ambulance': () => prop(120, 68, (b) => {
    groundShadow(b, 120, 68, 40);
    rect(b, 12, 24, 96, 32, [245, 245, 250]);
    rect(b, 58, 28, 22, 20, [220, 55, 55]);
    rect(b, 64, 32, 10, 10, [255, 255, 255]);
    rect(b, 14, 20, 18, 10, [220, 50, 50]);
  }),
  'iso-prop-police-car': () => prop(120, 68, (b) => {
    groundShadow(b, 120, 68, 40);
    rect(b, 12, 26, 96, 30, [55, 75, 165]);
    rect(b, 36, 18, 24, 10, [220, 50, 50]);
  }),
  'iso-prop-emergency-sign': () => prop(48, 72, (b) => {
    rect(b, 18, 38, 10, 30, [90, 70, 50]);
    rect(b, 8, 14, 32, 26, [220, 55, 55]);
    rect(b, 16, 22, 16, 10, [255, 255, 255]);
  }),
  'iso-prop-statue': () => prop(72, 108, (b) => {
    groundShadow(b, 72, 108, 35);
    rect(b, 28, 68, 18, 32, [165, 155, 142]);
    rect(b, 22, 32, 28, 38, [185, 175, 160]);
  }),
  'iso-prop-entrance-gate': () => prop(220, 132, (b) => {
    groundShadow(b, 220, 132, 50);
    rect(b, 22, 44, 14, 76, [105, 82, 62]);
    rect(b, 184, 44, 14, 76, [105, 82, 62]);
    rect(b, 22, 38, 176, 12, [125, 98, 72]);
    rect(b, 65, 52, 90, 28, [75, 125, 185, 220]);
  }),
  'iso-prop-map-board': () => prop(80, 96, (b) => {
    groundShadow(b, 80, 96, 30);
    rect(b, 34, 54, 10, 36, [82, 62, 48]);
    rect(b, 12, 18, 56, 44, [55, 95, 165]);
  }),
  'iso-prop-psi-banner': () => prop(52, 88, (b) => {
    rect(b, 10, 12, 32, 52, [125, 58, 145]);
    rect(b, 16, 28, 20, 20, [255, 255, 255]);
  }),
  'iso-prop-plant': () => prop(48, 64, (b) => {
    groundShadow(b, 48, 64, 28);
    rect(b, 18, 40, 10, 18, [102, 72, 50]);
    for (let i = 0; i < 18; i++) px(b, 12 + i * 2, 12 + (i % 5), [55, 145, 68, 255]);
  }),
  'iso-prop-sign-hospital': () => prop(44, 72, (b) => {
    rect(b, 10, 22, 24, 36, [220, 60, 60]);
    rect(b, 18, 34, 8, 16, [255, 255, 255]);
    rect(b, 14, 38, 16, 8, [255, 255, 255]);
  }),
  'iso-prop-sign-police': () => prop(44, 72, (b) => {
    rect(b, 10, 22, 24, 36, [60, 90, 165]);
  }),
  'iso-prop-signpost': () => prop(52, 80, (b) => {
    groundShadow(b, 52, 80, 28);
    rect(b, 22, 44, 8, 30, [92, 72, 52]);
    rect(b, 8, 20, 36, 18, [205, 185, 85]);
  }),
  'iso-prop-books': () => prop(52, 44, (b) => {
    rect(b, 10, 18, 32, 18, [185, 125, 82]);
  }),
  'iso-prop-flag-pole': () => prop(48, 100, (b) => {
    rect(b, 20, 30, 6, 62, [90, 70, 50]);
    rect(b, 24, 18, 22, 16, [120, 58, 160]);
  }),
};

const allSprites = new Set([
  ...BUILDINGS.map((b) => b.sprite),
  ...BUILDINGS.flatMap((b) => (b.props ?? []).map((p) => p.sprite)),
  ...DECOR.map((d) => d.sprite),
]);

for (const key of allSprites) {
  if (propFns[key]) await save(propFns[key](), key.includes('building') ? 'buildings' : 'props', key);
}

console.log(`✓ iso buildings & props (${allSprites.size} sprites referenced)`);
