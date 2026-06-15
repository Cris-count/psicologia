import Phaser from 'phaser';
import type { InteriorMapConfig } from './interior.assets';
import type { HallwayLayout } from './hallway-layout';
import { MAP_FONT_PLACE, MAP_FONT_TITLE, MAP_TEXT_RESOLUTION } from './map-typography';

interface PropCtx {
  scene: Phaser.Scene;
  layout: HallwayLayout;
  interior: InteriorMapConfig;
  corridorX: number;
  corridorW: number;
  floorTopY: number;
  floorBottomY: number;
  floorH: number;
  playableTop: number;
  playX: number;
  playW: number;
  /** Escala relativa a la altura de puerta/personaje. */
  s: number;
}

function depthY(y: number, base = 20): number {
  return base + y * 0.01;
}

function addGraphics(ctx: PropCtx, decor: Phaser.GameObjects.GameObject[], draw: (g: Phaser.GameObjects.Graphics) => void, y: number, d = 20): void {
  const g = ctx.scene.add.graphics().setDepth(depthY(y, d));
  draw(g);
  decor.push(g);
}

function drawSideDoor(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  const w = h * 0.42;
  g.fillStyle(0x5c4030, 1);
  g.fillRoundedRect(x, y, w, h, 3);
  g.fillStyle(0x7a5840, 1);
  g.fillRoundedRect(x + w * 0.15, y + h * 0.12, w * 0.7, h * 0.76, 2);
  g.fillStyle(0xb8924a, 1);
  g.fillCircle(x + w * 0.78, y + h * 0.52, h * 0.05);
}

function drawBench(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color = 0x3a7898): void {
  g.fillStyle(color, 1);
  g.fillRoundedRect(x, y - h, w, h * 0.45, 4);
  g.fillStyle(0x2a5870, 1);
  g.fillRect(x + w * 0.04, y - h * 0.55, w * 0.92, h * 0.55);
  g.fillStyle(0x888880, 1);
  g.fillRect(x + w * 0.08, y - h * 0.55, w * 0.06, h * 0.55);
  g.fillRect(x + w * 0.86, y - h * 0.55, w * 0.06, h * 0.55);
}

function drawPlant(g: Phaser.GameObjects.Graphics, x: number, y: number, potW: number, potH: number): void {
  g.fillStyle(0x6a5040, 1);
  g.fillRoundedRect(x - potW / 2, y - potH, potW, potH, 3);
  g.fillStyle(0x2d6a3a, 1);
  g.fillCircle(x - potW * 0.2, y - potH - potH * 0.35, potW * 0.35);
  g.fillCircle(x + potW * 0.15, y - potH - potH * 0.45, potW * 0.4);
  g.fillCircle(x, y - potH - potH * 0.55, potW * 0.32);
  g.fillStyle(0x3d8a48, 1);
  g.fillCircle(x - potW * 0.05, y - potH - potH * 0.7, potW * 0.28);
}

function drawWheelchair(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  const w = size;
  const h = size * 0.85;
  g.fillStyle(0x888890, 1);
  g.fillCircle(x - w * 0.28, y - h * 0.08, h * 0.22);
  g.fillCircle(x + w * 0.28, y - h * 0.08, h * 0.22);
  g.lineStyle(size * 0.04, 0x666670, 1);
  g.strokeCircle(x - w * 0.28, y - h * 0.08, h * 0.22);
  g.strokeCircle(x + w * 0.28, y - h * 0.08, h * 0.22);
  g.fillStyle(0x3a90b8, 1);
  g.fillRoundedRect(x - w * 0.35, y - h * 0.95, w * 0.7, h * 0.55, 3);
  g.fillStyle(0x2a7088, 1);
  g.fillRect(x - w * 0.38, y - h, w * 0.12, h * 0.35);
  g.fillStyle(0x555560, 1);
  g.fillRect(x - w * 0.05, y - h * 0.55, w * 0.1, h * 0.5);
}

function drawIvStand(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  g.lineStyle(h * 0.025, 0x909098, 1);
  g.lineBetween(x, y - h, x, y);
  g.lineBetween(x - h * 0.12, y - h * 0.92, x + h * 0.12, y - h * 0.92);
  g.fillStyle(0xd8ecff, 0.85);
  g.fillRoundedRect(x - h * 0.08, y - h, h * 0.16, h * 0.22, 2);
  g.lineStyle(1, 0x88a8c8, 0.6);
  g.strokeRoundedRect(x - h * 0.08, y - h, h * 0.16, h * 0.22, 2);
  g.fillStyle(0x666670, 1);
  g.fillCircle(x, y - h * 0.02, h * 0.06);
}

function drawWaterCooler(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  g.fillStyle(0xe8e8ec, 1);
  g.fillRoundedRect(x - h * 0.22, y - h, h * 0.44, h * 0.72, 4);
  g.fillStyle(0x4a9ad8, 0.7);
  g.fillRoundedRect(x - h * 0.16, y - h * 0.88, h * 0.32, h * 0.35, 3);
  g.fillStyle(0xc83828, 1);
  g.fillCircle(x, y - h * 0.38, h * 0.07);
  g.fillStyle(0x888890, 1);
  g.fillRect(x - h * 0.18, y - h * 0.28, h * 0.36, h * 0.28);
}

function drawMedicalCart(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  g.fillStyle(0xd0d4dc, 1);
  g.fillRoundedRect(x - w / 2, y - h * 0.55, w, h * 0.28, 3);
  g.fillRoundedRect(x - w / 2, y - h * 0.82, w * 0.85, h * 0.22, 3);
  g.fillStyle(0xc0392b, 1);
  g.fillRect(x - w * 0.08, y - h * 0.72, w * 0.16, h * 0.06);
  g.fillStyle(0x909098, 1);
  g.fillCircle(x - w * 0.32, y - h * 0.1, h * 0.08);
  g.fillCircle(x + w * 0.32, y - h * 0.1, h * 0.08);
  g.lineStyle(2, 0x707078, 1);
  g.lineBetween(x - w * 0.32, y - h * 0.55, x - w * 0.32, y - h * 0.1);
  g.lineBetween(x + w * 0.32, y - h * 0.55, x + w * 0.32, y - h * 0.1);
}

function drawTrashBin(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  g.fillStyle(0x586068, 1);
  g.fillRoundedRect(x - h * 0.18, y - h * 0.65, h * 0.36, h * 0.65, 2);
  g.fillStyle(0x788088, 1);
  g.fillRect(x - h * 0.2, y - h * 0.72, h * 0.4, h * 0.1);
}

function drawFireExtinguisher(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  g.fillStyle(0x888890, 1);
  g.fillRect(x - h * 0.04, y - h, h * 0.08, h);
  g.fillStyle(0xc83828, 1);
  g.fillRoundedRect(x - h * 0.14, y - h * 0.88, h * 0.28, h * 0.72, 3);
  g.fillStyle(0xf0ece4, 1);
  g.fillRect(x - h * 0.1, y - h * 0.55, h * 0.2, h * 0.08);
  g.fillStyle(0x333340, 1);
  g.fillRect(x - h * 0.06, y - h * 0.95, h * 0.12, h * 0.1);
}

function drawSanitizer(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  g.fillStyle(0xd0d4dc, 1);
  g.fillRoundedRect(x - h * 0.22, y - h, h * 0.44, h * 0.55, 3);
  g.fillStyle(0x4a9ad8, 1);
  g.fillRect(x - h * 0.14, y - h * 0.88, h * 0.28, h * 0.18);
  g.fillStyle(0x38a858, 1);
  g.fillCircle(x, y - h * 0.62, h * 0.08);
}

function drawWallClock(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
  g.fillStyle(0xf0ece4, 1);
  g.fillCircle(x, y, r);
  g.lineStyle(2, 0x888890, 1);
  g.strokeCircle(x, y, r);
  g.lineStyle(2, 0x333340, 1);
  g.lineBetween(x, y, x, y - r * 0.55);
  g.lineBetween(x, y, x + r * 0.35, y + r * 0.15);
  g.fillStyle(0xc83828, 1);
  g.fillCircle(x, y, r * 0.08);
}

function drawBulletinBoard(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, accent: number): void {
  g.fillStyle(0x6a5040, 1);
  g.fillRoundedRect(x - w / 2 - 4, y - h / 2 - 4, w + 8, h + 8, 4);
  g.fillStyle(0xc8a878, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 3);
  g.fillStyle(0xf5ecd8, 1);
  g.fillRect(x - w * 0.38, y - h * 0.32, w * 0.32, h * 0.22);
  g.fillRect(x + w * 0.06, y - h * 0.32, w * 0.32, h * 0.22);
  g.fillStyle(accent, 0.35);
  g.fillRect(x - w * 0.38, y + h * 0.02, w * 0.72, h * 0.18);
  g.fillStyle(0xd0d4dc, 1);
  g.fillCircle(x - w * 0.28, y - h * 0.38, 3);
  g.fillCircle(x + w * 0.16, y - h * 0.38, 3);
}

function drawExitSign(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  g.fillStyle(0x28a858, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 3);
  g.fillStyle(0xf0f8f0, 1);
  g.fillTriangle(x - w * 0.15, y, x + w * 0.05, y - h * 0.18, x + w * 0.05, y + h * 0.18);
  g.fillRect(x + w * 0.08, y - h * 0.22, w * 0.22, h * 0.44);
}

function drawPoster(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, accent: number): void {
  g.fillStyle(0xf0ece4, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 2);
  g.lineStyle(1, 0x888890, 0.5);
  g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 2);
  g.fillStyle(accent, 0.25);
  g.fillCircle(x, y - h * 0.08, w * 0.22);
  g.fillStyle(0x4a5060, 0.6);
  g.fillRect(x - w * 0.3, y + h * 0.12, w * 0.6, h * 0.06);
  g.fillRect(x - w * 0.22, y + h * 0.24, w * 0.44, h * 0.05);
}

function drawMagazineRack(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  g.fillStyle(0x8a7060, 1);
  g.fillRect(x - w / 2, y - h, w, h);
  g.fillStyle(0xc83828, 1);
  g.fillRect(x - w * 0.38, y - h * 0.88, w * 0.22, h * 0.72);
  g.fillStyle(0x4a9ad8, 1);
  g.fillRect(x - w * 0.12, y - h * 0.85, w * 0.2, h * 0.68);
  g.fillStyle(0x38a858, 1);
  g.fillRect(x + w * 0.12, y - h * 0.9, w * 0.22, h * 0.75);
}

function drawCoatRack(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  g.fillStyle(0x6a5040, 1);
  g.fillRect(x - h * 0.04, y - h, h * 0.08, h);
  g.fillStyle(0x888890, 1);
  g.fillCircle(x, y - h * 0.92, h * 0.12);
  g.lineStyle(h * 0.03, 0x888890, 1);
  g.lineBetween(x - h * 0.2, y - h * 0.78, x + h * 0.2, y - h * 0.78);
  g.fillStyle(0x3a7898, 1);
  g.fillRoundedRect(x - h * 0.22, y - h * 0.72, h * 0.18, h * 0.28, 2);
  g.fillStyle(0xc83828, 1);
  g.fillRoundedRect(x + h * 0.06, y - h * 0.68, h * 0.16, h * 0.24, 2);
}

function drawFirstAid(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number): void {
  g.fillStyle(0xf0ece4, 1);
  g.fillRoundedRect(x - size / 2, y - size / 2, size, size, 3);
  g.lineStyle(2, 0xc83828, 1);
  g.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 3);
  g.fillStyle(0xc83828, 1);
  g.fillRect(x - size * 0.06, y - size * 0.28, size * 0.12, size * 0.56);
  g.fillRect(x - size * 0.28, y - size * 0.06, size * 0.56, size * 0.12);
}

function drawFloorMat(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, accent: number): void {
  g.fillStyle(accent, 0.12);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 6);
  g.lineStyle(1, accent, 0.25);
  g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 6);
}

function drawHandrail(g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, thickness: number): void {
  g.lineStyle(thickness, 0xb0a898, 0.85);
  g.lineBetween(x1, y1, x2, y2);
  g.fillStyle(0x888880, 1);
  g.fillCircle(x1, y1, thickness * 0.9);
  g.fillCircle(x2, y2, thickness * 0.9);
}

function drawWallSconce(g: Phaser.GameObjects.Graphics, x: number, y: number, h: number): void {
  g.fillStyle(0x888880, 1);
  g.fillRect(x - h * 0.04, y - h * 0.3, h * 0.08, h * 0.3);
  g.fillStyle(0xfff8e8, 0.9);
  g.fillRoundedRect(x - h * 0.18, y - h * 0.35, h * 0.36, h * 0.22, 3);
}

function drawMentalHealthSign(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, accent: number): void {
  g.fillStyle(0xf0ece4, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
  g.lineStyle(2, accent, 0.5);
  g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
  g.fillStyle(accent, 0.35);
  g.fillCircle(x - w * 0.18, y, w * 0.14);
  g.fillCircle(x + w * 0.18, y, w * 0.14);
  g.lineStyle(2, accent, 0.6);
  g.lineBetween(x - w * 0.04, y - h * 0.08, x + w * 0.04, y - h * 0.08);
}

function addLabel(
  ctx: PropCtx,
  decor: Phaser.GameObjects.GameObject[],
  x: number,
  y: number,
  text: string,
  size: number,
  color = '#2a3040',
): void {
  const t = ctx.scene.add
    .text(x, y, text, {
      fontFamily: MAP_FONT_PLACE,
      fontSize: `${Math.max(8, Math.round(size))}px`,
      color,
      resolution: MAP_TEXT_RESOLUTION,
      align: 'center',
    })
    .setOrigin(0.5)
    .setDepth(depthY(y, 26));
  decor.push(t);
}

/** Props de sala de espera / pasillo clínico, escalados a puertas y personaje. */
export function addHallwayProps(
  scene: Phaser.Scene,
  interior: InteriorMapConfig,
  layout: HallwayLayout,
  corridorX: number,
  corridorW: number,
  playableTop: number,
  playX: number,
  playW: number,
  decor: Phaser.GameObjects.GameObject[],
): void {
  const { floorTopY, floorBottomY, doorHeight } = layout;
  const floorH = floorBottomY - floorTopY;
  const s = doorHeight / 130;
  const accent = interior.accent;

  const ctx: PropCtx = {
    scene,
    layout,
    interior,
    corridorX,
    corridorW,
    floorTopY,
    floorBottomY,
    floorH,
    playableTop,
    playX,
    playW,
    s,
  };

  const leftX = corridorX + 28 * s;
  const rightX = corridorX + corridorW - 28 * s;
  const midY = floorTopY + floorH * 0.55;
  const lowY = floorTopY + floorH * 0.82;

  /* —— Pared trasera (alcoba) —— */
  const alcoveY = playableTop + 38 * s;
  addGraphics(ctx, decor, (g) => drawWallClock(g, corridorX + corridorW / 2, alcoveY, 14 * s), alcoveY, 18);
  addGraphics(ctx, decor, (g) => drawBulletinBoard(g, corridorX + 52 * s, alcoveY + 18 * s, 56 * s, 42 * s, accent), alcoveY, 18);
  addGraphics(ctx, decor, (g) => drawPoster(g, corridorX + corridorW - 48 * s, alcoveY + 14 * s, 38 * s, 48 * s, accent), alcoveY, 18);
  addGraphics(ctx, decor, (g) => drawExitSign(g, corridorX + corridorW - 18 * s, playableTop + 30 * s, 34 * s, 16 * s), playableTop, 19);
  addGraphics(ctx, decor, (g) => drawMentalHealthSign(g, corridorX + 18 * s, playableTop + 30 * s, 44 * s, 28 * s, accent), playableTop, 19);
  addLabel(ctx, decor, corridorX + 18 * s, playableTop + 38 * s, 'SALUD\nMENTAL', 7 * s);

  /* —— Paredes laterales —— */
  const sideDoorH = doorHeight * 0.55;
  addGraphics(ctx, decor, (g) => {
    drawSideDoor(g, playX + 4, floorTopY + floorH * 0.08, sideDoorH);
    drawSideDoor(g, playX + playW - sideDoorH * 0.42 - 4, floorTopY + floorH * 0.08, sideDoorH);
    drawFireExtinguisher(g, playX + 10, floorTopY + floorH * 0.42, 36 * s);
    drawSanitizer(g, playX + playW - 14, floorTopY + floorH * 0.38, 28 * s);
    drawFirstAid(g, playX + playW - 12, playableTop + 52 * s, 22 * s);
    drawWallSconce(g, playX + 8, playableTop + 48 * s, 22 * s);
    drawWallSconce(g, playX + playW - 8, playableTop + 48 * s, 22 * s);
  }, floorTopY, 19);

  addGraphics(ctx, decor, (g) => {
    drawHandrail(g, playX + 14, floorTopY + 8, playX + 14, floorBottomY - 10, 3 * s);
    drawHandrail(g, playX + playW - 14, floorTopY + 8, playX + playW - 14, floorBottomY - 10, 3 * s);
  }, floorTopY, 17);

  /* —— Suelo: zona de espera —— */
  addGraphics(ctx, decor, (g) => {
    drawBench(g, leftX - 8 * s, lowY, 72 * s, 32 * s, 0x3a7898);
    drawBench(g, leftX - 8 * s, lowY - 38 * s, 72 * s, 32 * s, 0x3a7898);
    drawBench(g, rightX - 28 * s, lowY, 68 * s, 32 * s, 0x487898);
  }, lowY, 22);

  addGraphics(ctx, decor, (g) => {
    drawWheelchair(g, leftX + 18 * s, midY + 12 * s, 52 * s);
    drawMedicalCart(g, leftX + 8 * s, midY - 28 * s, 48 * s, 58 * s);
    drawIvStand(g, rightX - 4 * s, midY - 10 * s, 62 * s);
    drawWaterCooler(g, rightX - 6 * s, midY + 30 * s, 52 * s);
    drawMagazineRack(g, rightX - 10 * s, midY - 42 * s, 36 * s, 48 * s);
    drawTrashBin(g, leftX - 20 * s, midY + 38 * s, 34 * s);
    drawCoatRack(g, rightX + 2 * s, lowY - 52 * s, 58 * s);
  }, midY, 23);

  addGraphics(ctx, decor, (g) => {
    drawPlant(g, corridorX + 22 * s, floorBottomY - 8, 28 * s, 18 * s);
    drawPlant(g, corridorX + corridorW - 22 * s, floorBottomY - 8, 28 * s, 18 * s);
    drawPlant(g, leftX - 24 * s, floorTopY + floorH * 0.22, 24 * s, 16 * s);
    drawPlant(g, rightX + 20 * s, floorTopY + floorH * 0.18, 24 * s, 16 * s);
  }, floorBottomY, 24);

  addGraphics(ctx, decor, (g) => {
    drawFloorMat(g, layout.spawnX, layout.spawnY + 12 * s, 90 * s, 28 * s, accent);
    drawFloorMat(g, corridorX + corridorW * 0.25, floorTopY + floorH * 0.92, 64 * s, 22 * s, accent);
    drawFloorMat(g, corridorX + corridorW * 0.75, floorTopY + floorH * 0.92, 64 * s, 22 * s, accent);
  }, layout.spawnY, 16);

  /* —— Cartel direccional en pared —— */
  addGraphics(ctx, decor, (g) => {
    g.fillStyle(0xf0ece4, 1);
    g.fillRoundedRect(corridorX + corridorW / 2 - 38 * s, playableTop + 52 * s, 76 * s, 22 * s, 4);
    g.fillStyle(accent, 0.4);
    g.fillTriangle(corridorX + corridorW / 2 - 8 * s, playableTop + 58 * s, corridorX + corridorW / 2 + 8 * s, playableTop + 54 * s, corridorX + corridorW / 2 + 8 * s, playableTop + 62 * s);
  }, playableTop, 18);
  addLabel(ctx, decor, corridorX + corridorW / 2 + 10 * s, playableTop + 58 * s, 'Consultorios', 8 * s, '#3a4050');

  /* —— Detalle wainscoting en paredes laterales —— */
  addGraphics(ctx, decor, (g) => {
    const wainH = floorH * 0.35;
    g.fillStyle(0xc8b8a8, 0.35);
    g.fillRect(playX, floorTopY + floorH - wainH, 24, wainH);
    g.fillRect(playX + playW - 24, floorTopY + floorH - wainH, 24, wainH);
    g.lineStyle(1, 0xa89888, 0.4);
    for (let y = floorTopY + floorH - wainH; y < floorBottomY; y += 18 * s) {
      g.lineBetween(playX + 2, y, playX + 22, y);
      g.lineBetween(playX + playW - 22, y, playX + playW - 2, y);
    }
  }, floorTopY, 9);
}
