/**
 * Sprites institucionales MIND-SPHERE v5 — edificios premium (referencia city builder).
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buf, px, rect, roundRect, ellipse, outline, shadow, line, gradientRect, facadeTexture, brickTexture,
  label, buildingShell, windowGrid, doorFrame, awning, steps, shade, highlight,
  signPlaque, integratedSign, gableRoof, columns, chimney, flowerBox, flatRoof, shingleRoof,
  medicalCross, shieldBadge, flagPole, clockFace, hedgeRow, balcony, archedDoor, roofOverhang,
  castShadowDir, terracottaRoof, metalRoof, stoneTexture, facadeBanner, storyWindows,
  recessedEntry, stripeAwning, storefront, cornice, wingBlock, patioSet, sideDepth, PAL,
} from './edu-city-art.mjs';

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
  const wall = [248, 252, 255, 255];
  const roof = [62, 108, 178, 255];
  const accent = [228, 58, 58, 255];
  const b = buildingShell(228, 248, wall, roof, accent, {
    facadeY: 58, facadeH: 138, roofType: 'metal', skipDefault: true,
  });
  facadeBanner(b, 58, 28, 112, 22, 'HOSPITAL', accent, (buf, cx, cy) => medicalCross(buf, cx, cy, 16));
  wingBlock(b, 18, 72, 52, 88, wall, roof, accent, { roofType: 'metal' });
  wingBlock(b, 158, 72, 52, 88, wall, roof, accent, { roofType: 'metal' });
  storyWindows(b, 28, 78, 172, 3, 5, 10, 12, 7, [198, 228, 252, 255]);
  recessedEntry(b, 78, 148, 72, 52, wall, [168, 208, 242, 255]);
  windowGrid(b, 84, 154, 3, 1, 12, 14, 8, [210, 238, 255, 255]);
  rect(b, 108, 158, 12, 22, [138, 178, 218, 255]);
  line(b, 114, 162, 114, 176, [255, 255, 255, 230], 2);
  archedDoor(b, 96, 168, 36, 32, [148, 188, 228, 255], [98, 148, 198, 255]);
  steps(b, 78, 218, 72);
  integratedSign(b, 62, 200, 104, 18, 'HOSPITAL', accent);
  outline(b, 16, 52, 196, 152, PAL.outline, 2);
  return b;
}

function comisaria() {
  const wall = [58, 98, 168, 255];
  const roof = [38, 68, 128, 255];
  const accent = [248, 210, 58, 255];
  const b = buildingShell(218, 238, wall, roof, accent, {
    facadeY: 56, facadeH: 128, roofType: 'shingle', skipDefault: true,
  });
  cornice(b, 24, 48, 170, accent);
  facadeBanner(b, 48, 30, 122, 22, 'COMISARIA', accent, (buf, cx, cy) => shieldBadge(buf, cx, cy, 9, 8, wall, accent));
  columns(b, 38, 58, 7, 16, 48, PAL.white);
  roundRect(b, 36, 96, 146, 42, 5, PAL.white);
  gradientRect(b, 44, 102, 130, 30, [188, 208, 238, 255], [158, 178, 208, 255]);
  shieldBadge(b, 109, 88, 16, 12, wall, accent);
  flagPole(b, 182, 42, 42, accent);
  rect(b, 186, 48, 6, 6, [228, 58, 58, 255]);
  rect(b, 187, 49, 4, 4, accent);
  windowGrid(b, 46, 64, 5, 1, 10, 11, 7);
  archedDoor(b, 92, 152, 34, 40, shade(wall, 0.72), [148, 168, 208, 255]);
  steps(b, 80, 208, 58);
  integratedSign(b, 52, 188, 114, 18, 'COMISARIA', accent);
  outline(b, 14, 50, 190, 142, PAL.outline, 2);
  return b;
}

function fiscalia() {
  const wall = [118, 128, 158, 255];
  const roof = [48, 58, 88, 255];
  const accent = [248, 210, 58, 255];
  const b = buildingShell(208, 228, wall, roof, accent, {
    facadeY: 54, facadeH: 122, roofType: 'metal', skipDefault: true,
  });
  stoneTexture(b, 20, 56, 168, 118, wall);
  cornice(b, 22, 50, 164, accent);
  facadeBanner(b, 44, 28, 108, 20, 'FISCALIA', accent, (buf, cx, cy) => shieldBadge(buf, cx, cy, 8, 7, wall, accent));
  columns(b, 46, 60, 8, 12, 42, PAL.white);
  storyWindows(b, 38, 68, 132, 2, 4, 9, 11, 8);
  archedDoor(b, 88, 148, 32, 38, shade(wall, 0.7), [88, 98, 128, 255]);
  steps(b, 76, 204, 56);
  integratedSign(b, 38, 184, 108, 18, 'FISCALIA', accent);
  outline(b, 18, 52, 172, 128, PAL.outline, 2);
  return b;
}

function school() {
  const wall = [188, 78, 58, 255];
  const roof = [148, 48, 38, 255];
  const accent = [248, 218, 88, 255];
  const b = buildingShell(228, 248, wall, roof, accent, {
    facadeY: 62, facadeH: 128, brick: true, roofType: 'terracotta', skipDefault: true,
  });
  wingBlock(b, 16, 78, 48, 82, wall, roof, accent, { brick: true, roofType: 'terracotta' });
  wingBlock(b, 164, 78, 48, 82, wall, roof, accent, { brick: true, roofType: 'terracotta' });
  rect(b, 82, 0, 32, 52, accent);
  rect(b, 86, 0, 24, 14, PAL.white);
  clockFace(b, 98, 26, 9);
  rect(b, 92, 48, 12, 8, shade(accent, 0.82));
  flagPole(b, 188, 8, 38, accent);
  facadeBanner(b, 62, 34, 104, 20, 'ESCUELA', accent, (buf, cx, cy) => {
    rect(buf, cx - 5, cy - 4, 10, 8, accent);
    label(buf, cx - 4, cy - 3, 'ABC', [38, 46, 62, 255]);
  });
  storyWindows(b, 72, 72, 84, 2, 4, 9, 12, 6);
  balcony(b, 34, 118, 36);
  balcony(b, 158, 118, 36);
  archedDoor(b, 96, 152, 36, 40, [138, 58, 42, 255], [108, 42, 32, 255]);
  steps(b, 84, 218, 60);
  integratedSign(b, 48, 198, 108, 18, 'ESCUELA', accent);
  outline(b, 14, 56, 200, 148, PAL.outline, 2);
  return b;
}

function police() {
  const wall = [252, 254, 255, 255];
  const roof = [218, 222, 228, 255];
  const accent = [48, 138, 78, 255];
  const b = buildingShell(212, 232, wall, roof, accent, {
    facadeY: 54, facadeH: 124, roofType: 'flat', skipDefault: true,
  });
  rect(b, 52, 52, 108, 10, accent);
  rect(b, 52, 62, 10, 58, accent);
  rect(b, 150, 62, 10, 58, accent);
  facadeBanner(b, 46, 28, 120, 20, 'POLICIA', accent, (buf, cx, cy) => shieldBadge(buf, cx, cy, 9, 8, accent, [248, 210, 58, 255]));
  roundRect(b, 58, 70, 96, 44, 5, PAL.white);
  shieldBadge(b, 106, 62, 14, 11, accent, [248, 210, 58, 255]);
  for (let i = 0; i < 3; i++) rect(b, 68 + i * 18, 78, 14, 16, PAL.glass);
  storyWindows(b, 24, 76, 164, 2, 2, 10, 11, 10);
  doorFrame(b, 90, 148, 32, 38, accent, wall);
  steps(b, 78, 208, 56);
  integratedSign(b, 44, 188, 108, 18, 'POLICIA', accent);
  outline(b, 14, 50, 184, 138, PAL.outline, 2);
  return b;
}

function library() {
  const wall = [168, 138, 98, 255];
  const roof = [128, 98, 58, 255];
  const accent = [248, 218, 88, 255];
  const b = buildingShell(218, 238, wall, roof, accent, {
    facadeY: 56, facadeH: 126, roofType: 'terracotta', skipDefault: true,
  });
  stoneTexture(b, 22, 58, 174, 120, [178, 148, 108, 255]);
  columns(b, 18, 54, 1, 1, 62, PAL.white);
  columns(b, 186, 54, 1, 1, 62, PAL.white);
  columns(b, 48, 58, 6, 16, 52, PAL.white);
  facadeBanner(b, 44, 28, 130, 20, 'BIBLIOTECA', accent, (buf, cx, cy) => {
    rect(buf, cx - 6, cy - 5, 4, 10, [138, 98, 58, 255]);
    rect(buf, cx - 1, cy - 5, 4, 10, [158, 118, 68, 255]);
    rect(buf, cx + 4, cy - 5, 4, 10, [178, 138, 78, 255]);
  });
  roundRect(b, 44, 66, 130, 52, 4, PAL.white);
  rect(b, 50, 72, 118, 8, accent);
  for (let i = 0; i < 7; i++) rect(b, 52 + i * 14, 82, 11, 28, [128 + i * 6, 92, 52, 255]);
  archedDoor(b, 92, 144, 34, 42, [128, 98, 58, 255], [98, 68, 38, 255]);
  steps(b, 80, 208, 58);
  integratedSign(b, 36, 188, 122, 18, 'BIBLIOTECA', accent);
  outline(b, 14, 52, 190, 142, PAL.outline, 2);
  return b;
}

function mentalHealth() {
  const wall = [142, 98, 172, 255];
  const roof = [112, 72, 142, 255];
  const accent = [248, 168, 208, 255];
  const b = buildingShell(218, 238, wall, roof, accent, {
    facadeY: 56, facadeH: 124, roofType: 'flat', skipDefault: true,
  });
  hedgeRow(b, 16, 178, 186, 14);
  facadeBanner(b, 48, 28, 122, 20, 'SALUD', accent, (buf, cx, cy) => {
    ellipse(buf, cx - 4, cy, 5, 4, accent);
    ellipse(buf, cx + 4, cy, 5, 4, [228, 128, 168, 255]);
  });
  ellipse(b, 109, 58, 24, 20, accent);
  ellipse(b, 109, 58, 15, 12, [228, 128, 168, 255]);
  rect(b, 103, 66, 12, 10, [228, 128, 168, 255]);
  storyWindows(b, 34, 76, 150, 2, 4, 10, 11, 8, [218, 178, 238, 255]);
  roundRect(b, 88, 144, 42, 40, 6, [238, 208, 248, 255]);
  doorFrame(b, 96, 150, 26, 30, wall, [198, 158, 218, 255]);
  for (let i = 0; i < 6; i++) flowerBox(b, 28 + i * 22, 128, 14);
  steps(b, 82, 208, 54);
  integratedSign(b, 36, 188, 78, 16, 'SALUD', accent);
  signPlaque(b, 36, 204, 'MENTAL', 78, [228, 128, 168, 255]);
  outline(b, 14, 52, 190, 138, PAL.outline, 2);
  return b;
}

function icbf() {
  const wall = [198, 232, 212, 255];
  const roof = [128, 178, 128, 255];
  const accent = [72, 148, 88, 255];
  const b = buildingShell(208, 228, wall, roof, accent, {
    facadeY: 54, facadeH: 122, roofType: 'flat', skipDefault: true,
  });
  facadeBanner(b, 52, 28, 104, 20, 'ICBF', accent, (buf, cx, cy) => {
    ellipse(buf, cx, cy - 2, 6, 5, PAL.white);
    ellipse(buf, cx - 4, cy + 2, 3, 3, accent);
    ellipse(buf, cx + 4, cy + 2, 3, 3, accent);
  });
  roundRect(b, 44, 58, 120, 48, 6, PAL.white);
  rect(b, 52, 66, 104, 32, accent);
  for (let i = 0; i < 5; i++) ellipse(b, 58 + i * 16, 82, 7, 6, [168, 212, 168, 255]);
  windowGrid(b, 40, 68, 3, 1, 11, 12, 9);
  doorFrame(b, 90, 144, 28, 34, accent, PAL.white);
  flowerBox(b, 48, 124, 18);
  flowerBox(b, 142, 124, 18);
  steps(b, 78, 204, 52);
  integratedSign(b, 52, 184, 84, 18, 'ICBF', accent);
  outline(b, 14, 52, 180, 136, PAL.outline, 2);
  return b;
}

function bienestar() {
  const wall = [232, 192, 58, 255];
  const roof = [198, 128, 38, 255];
  const accent = [252, 254, 255, 255];
  const b = buildingShell(208, 228, wall, roof, accent, {
    facadeY: 54, facadeH: 122, roofType: 'terracotta', skipDefault: true,
  });
  facadeBanner(b, 38, 28, 132, 20, 'BIENESTAR', [208, 158, 38, 255], (buf, cx, cy) => {
    ellipse(buf, cx, cy, 6, 5, [228, 88, 88, 255]);
    rect(buf, cx - 3, cy + 2, 6, 4, [228, 88, 88, 255]);
  });
  storyWindows(b, 36, 68, 136, 2, 3, 10, 11, 9);
  balcony(b, 48, 116, 112);
  flowerBox(b, 34, 128, 20);
  flowerBox(b, 154, 128, 20);
  doorFrame(b, 88, 144, 32, 36, [208, 158, 38, 255], PAL.white);
  steps(b, 76, 204, 56);
  integratedSign(b, 28, 184, 132, 18, 'BIENESTAR', [208, 158, 38, 255]);
  outline(b, 14, 52, 180, 136, PAL.outline, 2);
  return b;
}

function salonComunal() {
  const wall = [52, 118, 178, 255];
  const roof = [38, 88, 148, 255];
  const accent = [252, 254, 255, 255];
  const b = buildingShell(210, 230, wall, roof, accent, {
    facadeY: 56, facadeH: 122, roofType: 'shingle', skipDefault: true,
  });
  gableRoof(b, 34, 24, 142, wall, roof);
  shingleRoof(b, 38, 26, 134, 6, roof);
  facadeBanner(b, 40, 30, 72, 18, 'SALON', [178, 198, 228, 255], (buf, cx, cy) => {
    for (let i = 0; i < 3; i++) rect(buf, cx - 6 + i * 5, cy - 4, 3, 8, PAL.glass);
  });
  roundRect(b, 38, 58, 134, 44, 5, PAL.white);
  for (let i = 0; i < 6; i++) rect(b, 46 + i * 18, 66, 13, 18, PAL.glass);
  windowGrid(b, 28, 72, 2, 1, 11, 12, 9);
  archedDoor(b, 88, 142, 34, 40, wall, [188, 208, 238, 255]);
  steps(b, 78, 206, 56);
  integratedSign(b, 24, 186, 68, 16, 'SALON', [178, 198, 228, 255]);
  signPlaque(b, 20, 202, 'COMUNAL', 84, wall);
  outline(b, 14, 52, 182, 138, PAL.outline, 2);
  return b;
}

function farmacia() {
  const wall = [42, 138, 82, 255];
  const roof = [28, 108, 62, 255];
  const accent = [252, 254, 255, 255];
  const b = buildingShell(196, 218, wall, roof, accent, {
    facadeY: 52, facadeH: 112, roofType: 'tile', skipDefault: true,
  });
  facadeBanner(b, 36, 26, 108, 20, 'FARMACIA', wall, (buf, cx, cy) => medicalCross(buf, cx, cy, 12, accent, wall));
  stripeAwning(b, 32, 118, 132, wall, accent);
  storefront(b, 40, 128, 116, 26, wall);
  windowGrid(b, 48, 134, 2, 1, 16, 12, 18, PAL.glass);
  doorFrame(b, 84, 148, 28, 32, wall, accent);
  steps(b, 72, 198, 52);
  integratedSign(b, 32, 178, 108, 18, 'FARMACIA', wall);
  outline(b, 14, 48, 168, 128, PAL.outline, 2);
  return b;
}

function tienda() {
  const wall = [198, 118, 68, 255];
  const roof = [168, 88, 42, 255];
  const accent = [252, 254, 255, 255];
  const b = buildingShell(196, 216, wall, roof, accent, {
    facadeY: 50, facadeH: 110, roofType: 'tile', skipDefault: true,
  });
  for (let i = 0; i < 10; i++) {
    rect(b, 12 + i * 14, 44, 12, 10, i % 2 === 0 ? [228, 58, 58, 255] : accent);
  }
  facadeBanner(b, 40, 24, 96, 20, 'TIENDA', wall, (buf, cx, cy) => {
    rect(buf, cx - 5, cy - 2, 10, 6, accent);
    rect(buf, cx - 3, cy + 4, 6, 3, [248, 210, 58, 255]);
  });
  stripeAwning(b, 24, 114, 148, wall, accent);
  storefront(b, 32, 122, 132, 24, wall);
  rect(b, 36, 126, 56, 14, [252, 254, 255, 210]);
  doorFrame(b, 84, 144, 28, 32, roof, accent);
  steps(b, 72, 196, 54);
  integratedSign(b, 40, 176, 88, 18, 'TIENDA', wall);
  outline(b, 14, 46, 168, 126, PAL.outline, 2);
  return b;
}

function cafeteria() {
  const wall = [138, 88, 48, 255];
  const roof = [108, 62, 28, 255];
  const accent = [252, 254, 255, 255];
  const b = buildingShell(196, 216, wall, roof, accent, {
    facadeY: 50, facadeH: 110, roofType: 'terracotta', skipDefault: true,
  });
  facadeBanner(b, 44, 24, 88, 20, 'CAFE', wall, (buf, cx, cy) => {
    ellipse(buf, cx, cy - 2, 7, 6, accent);
    rect(buf, cx - 4, cy + 2, 8, 4, roof);
  });
  stripeAwning(b, 28, 112, 140, wall, accent);
  patioSet(b, 24, 118);
  patioSet(b, 118, 118);
  windowGrid(b, 46, 68, 2, 1, 13, 12, 16);
  doorFrame(b, 84, 142, 28, 32, wall, accent);
  steps(b, 72, 196, 52);
  integratedSign(b, 38, 176, 80, 18, 'CAFE', wall);
  outline(b, 14, 46, 168, 126, PAL.outline, 2);
  return b;
}

function casa() {
  const wall = [228, 192, 148, 255];
  const roof = [188, 58, 42, 255];
  const b = buf(196, 228);
  castShadowDir(b, 16, 200, 164, 18, 0.42);
  gableRoof(b, 24, 22, 148, wall, roof);
  terracottaRoof(b, 28, 24, 140, 7, roof);
  chimney(b, 132, 12, 24);
  roundRect(b, 26, 76, 144, 88, 6, wall);
  facadeTexture(b, 28, 78, 140, 84, wall);
  cornice(b, 28, 80, 140, [248, 218, 88, 255]);
  windowGrid(b, 36, 96, 2, 1, 16, 15, 24);
  flowerBox(b, 34, 128, 22);
  flowerBox(b, 120, 128, 22);
  roundRect(b, 58, 122, 80, 12, 4, shade(wall, 0.9));
  archedDoor(b, 82, 128, 32, 38, [178, 138, 98, 255], [118, 78, 48, 255]);
  rect(b, 18, 130, 14, 36, shade(wall, 0.78));
  sideDepth(b, 8, 82, 12, wall, 28);
  hedgeRow(b, 16, 178, 164, 10);
  steps(b, 54, 178, 88);
  integratedSign(b, 44, 156, 72, 16, 'CASA', [248, 218, 88, 255]);
  outline(b, 26, 76, 144, 88, PAL.outline, 1);
  return b;
}

function cancha() {
  const b = buf(200, 188);
  castShadowDir(b, 14, 168, 172, 16, 0.36);
  gradientRect(b, 10, 38, 180, 98, [58, 148, 64, 255], [36, 112, 42, 255]);
  outline(b, 10, 38, 180, 98, PAL.white, 2);
  rect(b, 10, 86, 180, 4, PAL.white);
  ellipse(b, 100, 88, 28, 28, PAL.white);
  rect(b, 10, 38, 8, 98, [228, 148, 58, 255]);
  rect(b, 182, 38, 8, 98, [228, 148, 58, 255]);
  gradientRect(b, 10, 34, 180, 6, [248, 178, 68, 255], [228, 148, 58, 255]);
  rect(b, 10, 132, 180, 4, shade([228, 148, 58, 255], 0.88));
  for (let i = 0; i < 5; i++) line(b, 10 + i * 36, 38, 10 + i * 36, 136, shade([228, 148, 58, 255], 0.75), 1);
  integratedSign(b, 44, 122, 88, 18, 'CANCHA', [228, 148, 58, 255]);
  return b;
}

function terminal() {
  const wall = [52, 108, 178, 255];
  const roof = [38, 78, 148, 255];
  const accent = [248, 210, 58, 255];
  const b = buildingShell(214, 234, wall, roof, accent, {
    facadeY: 54, facadeH: 124, roofType: 'metal', skipDefault: true,
  });
  facadeBanner(b, 40, 26, 134, 20, 'TERMINAL', accent, (buf, cx, cy) => {
    roundRect(buf, cx - 8, cy - 4, 16, 8, 2, PAL.white);
    rect(buf, cx - 6, cy - 2, 12, 4, wall);
  });
  roundRect(b, 26, 54, 162, 46, 6, PAL.white);
  rect(b, 30, 58, 154, 6, accent);
  for (let i = 0; i < 8; i++) {
    roundRect(b, 34 + i * 18, 66, 14, 26, 2, PAL.glass);
    line(b, 34 + i * 18, 78, 48 + i * 18, 78, [148, 198, 238, 180], 1);
  }
  rect(b, 32, 100, 150, 4, shade(PAL.stone, 0.88));
  windowGrid(b, 40, 68, 3, 1, 13, 11, 11);
  doorFrame(b, 92, 144, 30, 36, wall, PAL.white);
  steps(b, 80, 208, 56);
  integratedSign(b, 38, 188, 118, 18, 'TERMINAL', accent);
  outline(b, 14, 50, 186, 142, PAL.outline, 2);
  return b;
}

function ambulance() {
  const b = buf(96, 56);
  shadow(b, 8, 48, 80, 8, 0.32);
  roundRect(b, 8, 18, 80, 26, 5, [248, 248, 252, 255]);
  gradientRect(b, 8, 18, 30, 26, [238, 68, 68, 255], [198, 38, 38, 255]);
  rect(b, 20, 24, 10, 14, [248, 248, 252, 255]);
  rect(b, 23, 27, 2, 8, [228, 58, 58, 255]);
  rect(b, 20, 30, 8, 2, [228, 58, 58, 255]);
  for (let i = 0; i < 2; i++) {
    ellipse(b, 24 + i * 44, 44, 8, 8, [38, 42, 48, 255]);
    ellipse(b, 24 + i * 44, 44, 5, 5, [68, 72, 78, 255]);
  }
  rect(b, 38, 22, 42, 14, PAL.glass);
  line(b, 8, 31, 88, 31, [198, 38, 38, 255], 1);
  return b;
}

function policeCar() {
  const b = buf(92, 52);
  shadow(b, 8, 44, 76, 8, 0.3);
  roundRect(b, 10, 20, 72, 20, 4, [248, 248, 252, 255]);
  gradientRect(b, 10, 20, 24, 20, [58, 128, 78, 255], [38, 98, 58, 255]);
  gradientRect(b, 38, 16, 14, 7, [248, 210, 58, 255], [218, 168, 38, 255]);
  rect(b, 42, 18, 6, 3, [248, 68, 68, 255]);
  for (let i = 0; i < 2; i++) {
    ellipse(b, 26 + i * 38, 42, 7, 7, [38, 42, 48, 255]);
    ellipse(b, 26 + i * 38, 42, 4, 4, [78, 82, 88, 255]);
  }
  rect(b, 36, 24, 38, 10, PAL.glass);
  return b;
}

function bus() {
  const b = buf(108, 58);
  shadow(b, 8, 48, 92, 8, 0.32);
  gradientRect(b, 6, 16, 96, 28, [98, 148, 218, 255], [68, 118, 188, 255]);
  roundRect(b, 6, 16, 96, 28, 5, [88, 138, 208, 255]);
  for (let i = 0; i < 5; i++) {
    roundRect(b, 18 + i * 15, 22, 11, 13, 2, PAL.glass);
    line(b, 18 + i * 15, 28, 29 + i * 15, 28, [148, 198, 238, 160], 1);
  }
  rect(b, 6, 38, 96, 3, shade(PAL.roadDark, 0.9));
  for (let i = 0; i < 3; i++) ellipse(b, 28 + i * 24, 46, 7, 7, [38, 42, 48, 255]);
  return b;
}

function fountain() {
  const b = buf(96, 84);
  shadow(b, 10, 72, 76, 12, 0.34);
  ellipse(b, 48, 62, 36, 14, shade(PAL.water, 0.88));
  ellipse(b, 48, 60, 32, 12, PAL.water);
  ellipse(b, 48, 58, 30, 10, PAL.waterHi);
  gradientRect(b, 40, 30, 16, 30, PAL.stone, shade(PAL.stone, 0.82));
  roundRect(b, 36, 24, 24, 14, 4, [198, 228, 248, 255]);
  ellipse(b, 48, 26, 18, 12, [218, 238, 252, 255]);
  outline(b, 28, 52, 40, 18, shade(PAL.stone, 0.85), 1);
  return b;
}

function bench() {
  const b = buf(56, 36);
  shadow(b, 4, 28, 48, 8, 0.26);
  gradientRect(b, 6, 16, 44, 6, PAL.woodHi, PAL.wood);
  gradientRect(b, 6, 22, 44, 4, shade(PAL.wood, 0.92), shade(PAL.wood, 0.78));
  rect(b, 8, 26, 5, 10, shade(PAL.wood, 0.82));
  rect(b, 43, 26, 5, 10, shade(PAL.wood, 0.82));
  line(b, 8, 14, 50, 14, highlight(PAL.woodHi, 1.05), 2);
  return b;
}

function lamp() {
  const b = buf(32, 72);
  shadow(b, 4, 64, 24, 8, 0.28);
  gradientRect(b, 13, 30, 6, 34, [108, 112, 118, 255], [78, 82, 88, 255]);
  roundRect(b, 5, 12, 22, 18, 4, [248, 238, 180, 255]);
  ellipse(b, 16, 18, 12, 10, [255, 248, 210, 255]);
  ellipse(b, 16, 16, 8, 6, [255, 252, 228, 255]);
  rect(b, 8, 62, 16, 4, PAL.curb);
  return b;
}

function tree() {
  const b = buf(52, 64);
  shadow(b, 6, 54, 40, 10, 0.3);
  ellipse(b, 26, 24, 20, 17, PAL.foliage);
  ellipse(b, 22, 20, 14, 12, PAL.foliageHi);
  ellipse(b, 30, 22, 12, 10, highlight(PAL.foliageHi, 1.06));
  gradientRect(b, 22, 38, 8, 22, PAL.woodHi, PAL.wood);
  ellipse(b, 26, 58, 12, 4, shade(PAL.grassDark, 0.85));
  return b;
}

function treeLg() {
  const b = buf(68, 84);
  shadow(b, 8, 74, 52, 12, 0.34);
  ellipse(b, 34, 32, 28, 24, PAL.foliage);
  ellipse(b, 28, 26, 18, 15, PAL.foliageHi);
  ellipse(b, 38, 28, 16, 14, highlight(PAL.foliageHi, 1.08));
  gradientRect(b, 28, 50, 12, 28, PAL.woodHi, shade(PAL.wood, 0.88));
  ellipse(b, 34, 78, 16, 5, shade(PAL.grassDark, 0.82));
  return b;
}

function flower() {
  const b = buf(28, 28);
  line(b, 14, 14, 14, 24, [58, 138, 58, 255], 2);
  px(b, 14, 12, [240, 210, 60, 255]);
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
    px(b, 14 + Math.round(Math.cos(ang) * 3), 12 + Math.round(Math.sin(ang) * 3), [248, 120, 140, 255]);
  }
  return b;
}

function bush() {
  const b = buf(40, 32);
  shadow(b, 4, 26, 32, 6, 0.22);
  ellipse(b, 20, 18, 18, 14, PAL.foliage);
  ellipse(b, 16, 16, 12, 10, PAL.foliageHi);
  return b;
}

function books() {
  const b = buf(36, 32);
  shadow(b, 4, 26, 28, 6, 0.22);
  gradientRect(b, 4, 8, 9, 18, [238, 68, 68, 255], [198, 38, 38, 255]);
  gradientRect(b, 13, 6, 9, 20, [58, 118, 178, 255], [38, 88, 148, 255]);
  gradientRect(b, 22, 10, 9, 16, [248, 218, 88, 255], [218, 178, 48, 255]);
  return b;
}

function signpost() {
  const b = buf(40, 56);
  shadow(b, 6, 48, 28, 8, 0.26);
  gradientRect(b, 18, 22, 4, 28, PAL.woodHi, shade(PAL.wood, 0.82));
  roundRect(b, 4, 6, 32, 16, 3, [248, 218, 88, 255]);
  label(b, 8, 9, 'INFO', [38, 46, 62, 255]);
  return b;
}

function fence() {
  const b = buf(60, 36);
  shadow(b, 4, 28, 52, 8, 0.2);
  for (let x = 4; x < 56; x += 8) {
    gradientRect(b, x, 8, 4, 20, PAL.woodHi, shade(PAL.wood, 0.82));
  }
  rect(b, 4, 12, 52, 3, PAL.wood);
  rect(b, 4, 22, 52, 3, shade(PAL.wood, 0.88));
  return b;
}

function citizen(variant) {
  const b = buf(32, 44);
  shadow(b, 4, 38, 24, 6, 0.22);
  const colors = [[88, 138, 208, 255], [228, 148, 98, 255], [168, 128, 198, 255]];
  ellipse(b, 16, 11, 7, 7, [242, 198, 158, 255]);
  gradientRect(b, 10, 18, 12, 16, highlight(colors[variant % 3], 1.05), colors[variant % 3]);
  rect(b, 10, 34, 5, 8, [58, 62, 72, 255]);
  rect(b, 17, 34, 5, 8, [58, 62, 72, 255]);
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
