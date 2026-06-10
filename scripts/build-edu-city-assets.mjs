/**
 * Sprites institucionales MIND-SPHERE — edificios reconocibles con letreros.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buf, px, rect, roundRect, ellipse, outline, shadow, label, buildingShell, windowGrid, doorFrame, awning, steps, shade, highlight, signPlaque, PAL } from './edu-city-art.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'public/assets/game');
await mkdir(out, { recursive: true });

async function save(b, name) {
  await sharp(b.data, { raw: { width: b.w, height: b.h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(out, name));
  console.log(`✓ game/${name}`);
}

function hospital() {
  const b = buildingShell(168, 184, [242, 248, 255, 255], [205, 222, 248, 255], [175, 205, 238, 255]);
  roundRect(b, 62, 16, 44, 16, 4, [248, 250, 252, 255]);
  rect(b, 78, 12, 12, 28, [228, 58, 58, 255]);
  rect(b, 68, 24, 32, 10, [228, 58, 58, 255]);
  rect(b, 82, 14, 4, 24, [255, 255, 255, 255]);
  rect(b, 72, 26, 24, 4, [255, 255, 255, 255]);
  rect(b, 58, 118, 52, 38, [195, 220, 248, 255]);
  windowGrid(b, 62, 122, 2, 1, 14, 16, 18, [210, 232, 255, 255]);
  rect(b, 74, 132, 20, 22, [148, 188, 228, 255]);
  signPlaque(b, 44, 158, 'HOSPITAL', 80, [228, 58, 58, 255]);
  outline(b, 14, 38, 140, 118, PAL.outline, 2);
  return b;
}

function comisaria() {
  const b = buildingShell(166, 180, [82, 132, 212, 255], [62, 102, 182, 255], [248, 210, 58, 255]);
  roundRect(b, 48, 44, 70, 38, 6, [248, 250, 252, 255]);
  rect(b, 62, 50, 42, 26, [82, 132, 212, 255]);
  ellipse(b, 83, 44, 14, 11, [248, 210, 58, 255]);
  rect(b, 44, 40, 78, 8, [248, 210, 58, 255]);
  rect(b, 54, 46, 6, 32, [248, 210, 58, 255]);
  rect(b, 106, 46, 6, 32, [248, 210, 58, 255]);
  rect(b, 70, 54, 26, 18, [248, 250, 252, 255]);
  signPlaque(b, 36, 152, 'COMISARIA', 94, [248, 210, 58, 255]);
  outline(b, 14, 38, 138, 116, PAL.outline, 2);
  return b;
}

function fiscalia() {
  const b = buildingShell(150, 166, [148, 162, 198, 255], [118, 132, 168, 255], [248, 210, 58, 255]);
  rect(b, 54, 46, 42, 10, [248, 210, 58, 255]);
  for (let i = 0; i < 6; i++) rect(b, 50 + i * 8, 58, 5, 32, PAL.glass);
  rect(b, 48, 54, 54, 4, [248, 210, 58, 255]);
  ellipse(b, 75, 50, 8, 6, [248, 248, 252, 255]);
  signPlaque(b, 32, 136, 'FISCALIA', 88, [248, 210, 58, 255]);
  outline(b, 14, 42, 124, 98, PAL.outline, 2);
  return b;
}

function school() {
  const b = buildingShell(154, 170, [212, 98, 78, 255], [182, 72, 58, 255], [248, 218, 88, 255]);
  rect(b, 44, 4, 66, 10, [248, 218, 88, 255]);
  rect(b, 48, 0, 58, 8, [248, 248, 252, 255]);
  rect(b, 118, 0, 8, 36, [248, 218, 60, 255]);
  rect(b, 114, 34, 6, 8, [248, 140, 40, 255]);
  ellipse(b, 122, 8, 6, 6, [248, 248, 252, 255]);
  windowGrid(b, 28, 62, 4, 1, 8, 10, 8);
  signPlaque(b, 40, 138, 'ESCUELA', 72, [248, 218, 88, 255]);
  outline(b, 14, 40, 126, 102, PAL.outline, 2);
  return b;
}

function police() {
  const b = buildingShell(150, 166, [72, 142, 92, 255], [52, 112, 72, 255], [248, 210, 58, 255]);
  roundRect(b, 54, 50, 42, 32, 4, [248, 248, 252, 255]);
  ellipse(b, 75, 46, 11, 9, [248, 210, 58, 255]);
  rect(b, 68, 58, 14, 18, [72, 142, 92, 255]);
  rect(b, 48, 46, 54, 5, [248, 210, 58, 255]);
  rect(b, 52, 52, 8, 24, [248, 248, 252, 255]);
  signPlaque(b, 34, 136, 'POLICIA', 82, [248, 210, 58, 255]);
  outline(b, 14, 42, 124, 98, PAL.outline, 2);
  return b;
}

function library() {
  const b = buildingShell(148, 162, [202, 172, 132, 255], [172, 138, 98, 255], [148, 118, 78, 255]);
  rect(b, 26, 50, 12, 56, PAL.white);
  rect(b, 110, 50, 12, 56, PAL.white);
  roundRect(b, 42, 58, 64, 42, 3, [248, 248, 252, 255]);
  rect(b, 48, 64, 52, 6, [248, 218, 88, 255]);
  for (let i = 0; i < 4; i++) rect(b, 50 + i * 13, 72, 10, 22, [168 + i * 8, 118, 78, 255]);
  signPlaque(b, 28, 132, 'BIBLIOTECA', 92, [248, 218, 88, 255]);
  outline(b, 14, 42, 122, 94, PAL.outline, 2);
  return b;
}

function mentalHealth() {
  const b = buildingShell(150, 166, [172, 128, 202, 255], [142, 98, 172, 255], [248, 188, 218, 255]);
  ellipse(b, 75, 54, 16, 14, [248, 188, 218, 255]);
  ellipse(b, 75, 54, 10, 8, [228, 128, 168, 255]);
  rect(b, 70, 62, 10, 6, [228, 128, 168, 255]);
  for (let i = 0; i < 3; i++) ellipse(b, 38 + i * 18, 78, 5, 4, [248, 188, 218, 200]);
  signPlaque(b, 18, 136, 'SALUD', 56, [248, 188, 218, 255]);
  signPlaque(b, 18, 150, 'MENTAL', 56, [228, 128, 168, 255]);
  outline(b, 14, 42, 124, 98, PAL.outline, 2);
  return b;
}

function icbf() {
  const b = buildingShell(148, 162, [228, 248, 238, 255], [168, 208, 168, 255], [128, 178, 128, 255]);
  roundRect(b, 50, 52, 48, 32, 4, [248, 248, 252, 255]);
  rect(b, 56, 58, 36, 20, [128, 178, 128, 255]);
  ellipse(b, 74, 56, 10, 8, [248, 248, 252, 255]);
  rect(b, 68, 64, 12, 10, [98, 148, 98, 255]);
  signPlaque(b, 44, 132, 'ICBF', 56, [128, 178, 128, 255]);
  outline(b, 14, 42, 122, 94, PAL.outline, 2);
  return b;
}

function bienestar() {
  const b = buildingShell(146, 160, [248, 218, 88, 255], [228, 188, 58, 255], [248, 248, 252, 255]);
  ellipse(b, 73, 56, 14, 12, [228, 88, 88, 255]);
  rect(b, 69, 62, 8, 8, [228, 88, 88, 255]);
  rect(b, 66, 66, 14, 4, [228, 88, 88, 255]);
  signPlaque(b, 18, 130, 'BIENESTAR', 96, [228, 188, 58, 255]);
  outline(b, 14, 42, 120, 92, PAL.outline, 2);
  return b;
}

function salonComunal() {
  const b = buildingShell(150, 164, [82, 148, 212, 255], [62, 118, 178, 255], [248, 248, 252, 255]);
  roundRect(b, 46, 52, 58, 34, 4, [248, 248, 252, 255]);
  rect(b, 52, 58, 46, 22, [188, 208, 238, 255]);
  for (let i = 0; i < 3; i++) rect(b, 58 + i * 14, 64, 10, 12, PAL.glass);
  signPlaque(b, 22, 132, 'SALON', 58, [188, 208, 238, 255]);
  signPlaque(b, 16, 146, 'COMUNAL', 72, [82, 148, 212, 255]);
  outline(b, 14, 42, 124, 94, PAL.outline, 2);
  return b;
}

function farmacia() {
  const b = buildingShell(136, 150, [72, 168, 108, 255], [52, 138, 88, 255], [248, 248, 252, 255]);
  rect(b, 56, 48, 14, 14, [248, 248, 252, 255]);
  rect(b, 61, 53, 4, 4, [228, 58, 58, 255]);
  rect(b, 59, 55, 8, 1, [228, 58, 58, 255]);
  rect(b, 62, 52, 1, 8, [228, 58, 58, 255]);
  awning(b, 44, 108, 48, [72, 168, 108, 255]);
  signPlaque(b, 26, 122, 'FARMACIA', 88, [72, 168, 108, 255]);
  outline(b, 14, 42, 110, 84, PAL.outline, 2);
  return b;
}

function tienda() {
  const b = buildingShell(136, 148, [228, 148, 98, 255], [198, 118, 68, 255], [248, 248, 252, 255]);
  for (let i = 0; i < 7; i++) {
    rect(b, 18 + i * 14, 48, 11, 7, i % 2 === 0 ? [228, 58, 58, 255] : [248, 248, 252, 255]);
  }
  awning(b, 16, 106, 104, [228, 148, 98, 255]);
  rect(b, 24, 112, 88, 18, PAL.glass);
  signPlaque(b, 38, 120, 'TIENDA', 68, [228, 148, 98, 255]);
  outline(b, 14, 42, 110, 82, PAL.outline, 2);
  return b;
}

function cafeteria() {
  const b = buildingShell(136, 148, [168, 118, 78, 255], [138, 88, 48, 255], [248, 248, 252, 255]);
  ellipse(b, 68, 50, 12, 10, [248, 248, 252, 255]);
  rect(b, 62, 56, 12, 5, [138, 88, 48, 255]);
  rect(b, 58, 60, 20, 3, [118, 78, 38, 255]);
  for (let i = 0; i < 2; i++) {
    rect(b, 28 + i * 52, 112, 18, 10, PAL.wood);
    ellipse(b, 37 + i * 52, 108, 6, 4, [248, 248, 252, 255]);
  }
  signPlaque(b, 28, 120, 'CAFE', 56, [168, 118, 78, 255]);
  outline(b, 14, 42, 110, 82, PAL.outline, 2);
  return b;
}

function casa() {
  const b = buf(128, 140);
  shadow(b, 18, 128, 92, 10, 0.3);
  for (let row = 0; row < 18; row++) {
    const inset = Math.floor(row * 0.55);
    rect(b, 16 + inset, 24 + row, 96 - inset * 2, 1, [208, 78, 58, 255]);
  }
  rect(b, 22, 58, 84, 58, [232, 192, 152, 255]);
  rect(b, 26, 62, 76, 8, [248, 218, 88, 255]);
  windowGrid(b, 30, 74, 2, 1, 12, 12, 24);
  doorFrame(b, 54, 96, 20, 28, [188, 148, 108, 255], [138, 98, 58, 255]);
  steps(b, 46, 128, 36);
  rect(b, 18, 112, 8, 22, shade([232, 192, 152, 255], 0.82));
  signPlaque(b, 38, 116, 'CASA', 52, [248, 218, 88, 255]);
  outline(b, 22, 58, 84, 58, PAL.outline, 1);
  return b;
}

function cancha() {
  const b = buf(152, 138);
  shadow(b, 18, 126, 118, 10, 0.28);
  rect(b, 14, 40, 124, 76, [68, 148, 74, 255]);
  outline(b, 14, 40, 124, 76, [248, 248, 252, 255], 2);
  rect(b, 14, 76, 124, 3, [248, 248, 252, 255]);
  ellipse(b, 76, 78, 20, 20, [248, 248, 252, 255]);
  rect(b, 14, 40, 4, 76, [228, 148, 58, 255]);
  rect(b, 134, 40, 4, 76, [228, 148, 58, 255]);
  rect(b, 14, 36, 124, 4, [228, 148, 58, 255]);
  rect(b, 14, 116, 124, 4, [228, 148, 58, 255]);
  signPlaque(b, 38, 104, 'CANCHA', 76, [228, 148, 58, 255]);
  return b;
}

function terminal() {
  const b = buildingShell(144, 156, [82, 138, 212, 255], [62, 108, 178, 255], [248, 248, 252, 255]);
  roundRect(b, 34, 52, 76, 32, 4, [248, 248, 252, 255]);
  for (let i = 0; i < 5; i++) rect(b, 40 + i * 14, 58, 10, 18, PAL.glass);
  rect(b, 38, 54, 68, 4, [248, 210, 58, 255]);
  signPlaque(b, 24, 126, 'TERMINAL', 88, [248, 210, 58, 255]);
  outline(b, 14, 42, 118, 88, PAL.outline, 2);
  return b;
}

function ambulance() {
  const b = buf(90, 52);
  shadow(b, 8, 44, 74, 6);
  roundRect(b, 8, 18, 74, 24, 4, [248, 248, 252, 255]);
  rect(b, 8, 18, 28, 24, [228, 58, 58, 255]);
  rect(b, 18, 24, 8, 12, [248, 248, 252, 255]);
  rect(b, 21, 27, 2, 6, [228, 58, 58, 255]);
  rect(b, 18, 29, 8, 2, [228, 58, 58, 255]);
  return b;
}

function policeCar() {
  const b = buf(88, 48);
  shadow(b, 8, 40, 72, 6);
  roundRect(b, 10, 20, 68, 18, 3, [248, 248, 252, 255]);
  rect(b, 10, 20, 22, 18, [58, 118, 78, 255]);
  rect(b, 38, 16, 12, 6, [248, 210, 58, 255]);
  return b;
}

function bus() {
  const b = buf(100, 52);
  shadow(b, 8, 44, 84, 6);
  roundRect(b, 6, 16, 88, 26, 4, [88, 138, 208, 255]);
  for (let i = 0; i < 5; i++) rect(b, 18 + i * 14, 22, 10, 12, PAL.glass);
  return b;
}

function fountain() {
  const b = buf(88, 78);
  shadow(b, 10, 68, 68, 10, 0.3);
  ellipse(b, 44, 58, 32, 12, [58, 128, 198, 255]);
  ellipse(b, 44, 56, 28, 10, [88, 168, 228, 255]);
  rect(b, 38, 32, 12, 26, [168, 172, 178, 255]);
  ellipse(b, 44, 28, 16, 10, [198, 228, 248, 255]);
  for (let i = 0; i < 4; i++) {
    px(b, 44 + (i % 2 ? 8 : -8), 24 + i * 2, [198, 228, 248, 200]);
  }
  return b;
}

function bench() {
  const b = buf(52, 32);
  shadow(b, 4, 26, 44, 6, 0.2);
  rect(b, 6, 16, 40, 5, PAL.wood);
  rect(b, 8, 21, 4, 9, shade(PAL.wood, 0.85));
  rect(b, 40, 21, 4, 9, shade(PAL.wood, 0.85));
  rect(b, 6, 14, 40, 2, highlight(PAL.wood, 1.08));
  return b;
}

function lamp() {
  const b = buf(28, 64);
  shadow(b, 4, 58, 20, 6, 0.22);
  rect(b, 12, 28, 4, 32, [98, 102, 108, 255]);
  rect(b, 10, 26, 8, 3, [118, 122, 128, 255]);
  roundRect(b, 6, 14, 16, 14, 3, [248, 238, 180, 255]);
  ellipse(b, 14, 16, 10, 8, [255, 248, 210, 255]);
  rect(b, 8, 58, 12, 3, [138, 142, 148, 255]);
  return b;
}

function tree() {
  const b = buf(48, 58);
  shadow(b, 6, 50, 36, 8, 0.25);
  ellipse(b, 24, 22, 18, 15, [42, 118, 52, 255]);
  ellipse(b, 20, 18, 12, 10, [62, 148, 62, 255]);
  ellipse(b, 28, 20, 10, 9, [78, 168, 72, 255]);
  rect(b, 21, 34, 6, 20, PAL.wood);
  rect(b, 19, 52, 10, 3, shade(PAL.wood, 0.8));
  return b;
}

function treeLg() {
  const b = buf(60, 76);
  shadow(b, 8, 66, 44, 10, 0.28);
  ellipse(b, 30, 28, 24, 20, [38, 108, 48, 255]);
  ellipse(b, 26, 24, 16, 13, [58, 138, 58, 255]);
  ellipse(b, 34, 26, 14, 12, [78, 168, 72, 255]);
  rect(b, 26, 44, 8, 26, PAL.wood);
  rect(b, 22, 68, 16, 4, shade(PAL.wood, 0.78));
  return b;
}

function flower() {
  const b = buf(24, 24);
  px(b, 12, 12, [240, 210, 60, 255]);
  px(b, 11, 12, [248, 120, 140, 255]);
  px(b, 13, 12, [248, 120, 140, 255]);
  px(b, 12, 11, [248, 120, 140, 255]);
  px(b, 12, 13, [248, 120, 140, 255]);
  return b;
}

function bush() {
  const b = buf(36, 28);
  ellipse(b, 18, 16, 16, 12, [42, 118, 52, 255]);
  ellipse(b, 14, 14, 10, 8, [62, 148, 62, 255]);
  ellipse(b, 22, 15, 9, 7, [78, 168, 72, 255]);
  return b;
}

function books() {
  const b = buf(32, 28);
  rect(b, 4, 8, 8, 16, [228, 58, 58, 255]);
  rect(b, 12, 6, 8, 18, [58, 118, 178, 255]);
  rect(b, 20, 10, 8, 14, [248, 218, 88, 255]);
  return b;
}

function signpost() {
  const b = buf(36, 48);
  rect(b, 16, 20, 4, 24, PAL.wood);
  rect(b, 6, 8, 24, 12, [248, 218, 88, 255]);
  return b;
}

function fence() {
  const b = buf(56, 32);
  for (let x = 4; x < 52; x += 8) {
    rect(b, x, 8, 3, 18, PAL.wood);
    rect(b, x + 1, 6, 1, 22, [138, 98, 58, 255]);
  }
  rect(b, 4, 12, 48, 2, PAL.wood);
  rect(b, 4, 22, 48, 2, PAL.wood);
  return b;
}

function citizen(variant) {
  const b = buf(28, 40);
  const colors = [
    [88, 138, 208, 255],
    [228, 148, 98, 255],
    [168, 128, 198, 255],
  ];
  ellipse(b, 14, 10, 6, 6, [242, 198, 158, 255]);
  rect(b, 8, 16, 12, 14, colors[variant % 3]);
  rect(b, 9, 30, 4, 8, [68, 72, 82, 255]);
  rect(b, 15, 30, 4, 8, [68, 72, 82, 255]);
  return b;
}

const buildings = [
  ['building-hospital', hospital],
  ['building-comisaria', comisaria],
  ['building-fiscalia', fiscalia],
  ['building-school', school],
  ['building-police', police],
  ['building-library', library],
  ['building-mental-health', mentalHealth],
  ['building-icbf', icbf],
  ['building-bienestar', bienestar],
  ['building-salon-comunal', salonComunal],
  ['building-farmacia', farmacia],
  ['building-tienda', tienda],
  ['building-cafeteria', cafeteria],
  ['building-casa', casa],
  ['building-cancha', cancha],
  ['building-terminal', terminal],
];

const props = [
  ['prop-ambulance', ambulance],
  ['prop-police-car', policeCar],
  ['prop-bus', bus],
  ['prop-fountain', fountain],
  ['prop-bench', bench],
  ['prop-lamp', lamp],
  ['prop-tree', tree],
  ['prop-tree-lg', treeLg],
  ['prop-flower', flower],
  ['prop-bush', bush],
  ['prop-books', books],
  ['prop-signpost', signpost],
  ['prop-fence', fence],
  ['prop-citizen-0', () => citizen(0)],
  ['prop-citizen-1', () => citizen(1)],
  ['prop-citizen-2', () => citizen(2)],
];

for (const [name, fn] of buildings) await save(fn(), `${name}.png`);
for (const [name, fn] of props) await save(fn(), `${name}.png`);

console.log(`Done → ${buildings.length} edificios, ${props.length} props`);
