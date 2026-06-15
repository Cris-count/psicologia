import Phaser from 'phaser';
import type { InteriorMapConfig } from './interior.assets';
import type { HallwayLayout } from './hallway-layout';
import { addHallwayProps } from './hallway-props';

function ceilingLamp(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x888880, 1);
  g.fillRect(x - 2, y, 4, 8);
  g.fillStyle(0xfff8e8, 1);
  g.fillRoundedRect(x - 20, y + 8, 40, 10, 3);
}

/** Pasillo hospitalario — mapa completo con piso hasta abajo. */
export function buildCompactRoom(
  scene: Phaser.Scene,
  interior: InteriorMapConfig,
  layout: HallwayLayout,
): Phaser.GameObjects.GameObject[] {
  const { playX, playY, playW, playH, worldW, worldH, floorTopY, floorBottomY, playableTop } = layout;
  const accent = interior.accent;
  const decor: Phaser.GameObjects.GameObject[] = [];
  const corridorX = playX + 24;
  const corridorW = playW - 48;

  const backdrop = scene.add.graphics().setDepth(1);
  backdrop.fillGradientStyle(0x2e3848, 0x2e3848, 0x1e2430, 0x1e2430, 1);
  backdrop.fillRect(0, 0, worldW, worldH);
  decor.push(backdrop);

  const sideWalls = scene.add.graphics().setDepth(8);
  sideWalls.fillGradientStyle(0xd0c0ac, 0xb0a090, 0xc8b8a8, 0x988878, 1);
  sideWalls.fillRect(playX, playableTop, 24, playH);
  sideWalls.fillRect(playX + playW - 24, playableTop, 24, playH);
  decor.push(sideWalls);

  const ceiling = scene.add.graphics().setDepth(10);
  ceiling.fillStyle(0xeee8dc, 1);
  ceiling.fillRect(corridorX, playableTop, corridorW, 22);
  decor.push(ceiling);

  for (let i = 0; i < 5; i++) {
    const lx = corridorX + (corridorW / 6) * (i + 1);
    const lampG = scene.add.graphics().setDepth(11);
    ceilingLamp(lampG, lx, playableTop + 2);
    decor.push(lampG);
  }

  const alcove = scene.add.graphics().setDepth(12);
  alcove.fillStyle(0x7a8898, 1);
  alcove.fillRect(corridorX, playableTop + 22, corridorW, floorTopY - playableTop - 14);
  alcove.fillStyle(0x687888, 1);
  alcove.fillRect(corridorX, floorTopY - 5, corridorW, 6);
  alcove.lineStyle(2, accent, 0.28);
  alcove.strokeRect(corridorX + 2, playableTop + 24, corridorW - 4, floorTopY - playableTop - 18);

  for (let i = 0; i < 3; i++) {
    const px = corridorX + corridorW * (0.2 + i * 0.3);
    alcove.fillStyle(0x8898a8, 0.25);
    alcove.fillRoundedRect(px - 18, playableTop + 36, 36, 48, 3);
  }
  decor.push(alcove);

  const floor = scene.add.graphics().setDepth(15);
  const floorH = floorBottomY - floorTopY;

  floor.fillGradientStyle(0xece8e0, 0xece8e0, 0xd6d2ca, 0xd6d2ca, 1);
  floor.fillRect(corridorX, floorTopY, corridorW, floorH);

  floor.fillStyle(0xf2efe8, 0.45);
  floor.fillRect(corridorX + corridorW * 0.18, floorTopY, corridorW * 0.64, floorH);

  for (let y = floorTopY; y < floorBottomY; y += 56) {
    floor.lineStyle(1, 0xc4beb4, 0.22);
    floor.lineBetween(corridorX + 4, y, corridorX + corridorW - 4, y);
  }

  for (let x = corridorX + 40; x < corridorX + corridorW - 20; x += 64) {
    floor.lineStyle(1, 0xd0cbc3, 0.15);
    floor.lineBetween(x, floorTopY + 4, x, floorBottomY - 4);
  }

  for (let i = 1; i <= 4; i++) {
    const lx = corridorX + (corridorW / 5) * i;
    floor.fillStyle(0xffffff, 0.05);
    floor.fillTriangle(lx - 36, floorTopY, lx + 36, floorTopY, lx, floorTopY + floorH * 0.45);
  }

  floor.fillStyle(0xb8b0a6, 0.35);
  floor.fillRect(corridorX, floorTopY, 5, floorH);
  floor.fillRect(corridorX + corridorW - 5, floorTopY, 5, floorH);

  floor.lineStyle(2, 0xa09890, 0.4);
  floor.lineBetween(corridorX, floorTopY, corridorX + corridorW, floorTopY);
  decor.push(floor);

  const warmLight = scene.add.graphics().setDepth(16);
  for (let i = 1; i <= 4; i++) {
    const lx = corridorX + (corridorW / 5) * i;
    warmLight.fillStyle(0xffe8c0, 0.08);
    warmLight.fillTriangle(lx - 50, playableTop + 22, lx + 50, playableTop + 22, lx, floorBottomY);
  }
  decor.push(warmLight);

  const baseboards = scene.add.graphics().setDepth(19);
  baseboards.fillStyle(0x605848, 1);
  baseboards.fillRect(corridorX, floorBottomY - 6, corridorW, 6);
  baseboards.fillRect(corridorX, floorTopY - 2, corridorW, 3);
  decor.push(baseboards);

  addHallwayProps(scene, interior, layout, corridorX, corridorW, playableTop, playX, playW, decor);

  return decor;
}

export function applyPlayAreaBounds(scene: Phaser.Scene, layout: HallwayLayout): void {
  scene.physics.world.setBounds(
    layout.playX + 16,
    layout.playableTop,
    layout.playW - 32,
    layout.playableBottom - layout.playableTop,
  );
}
