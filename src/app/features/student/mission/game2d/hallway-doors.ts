import Phaser from 'phaser';
import { MAP_FONT_PLACE, MAP_FONT_TITLE, MAP_TEXT_RESOLUTION } from './map-typography';
import type { HallwayLayout } from './hallway-layout';

const WOOD = { frame: 0x5c3d28, panel: 0x6e4a32, trim: 0xc8a878, handle: 0xb8924a };
const SIGN_WOOD = { face: 0xf5ecd8, frame: 0x5c4030, nail: 0x888880 };
const MIN_FONT_PX = 14;
const SIGN_PAD = 16;
const SIGN_GAP = 10;

export interface HallwayDoorVisual {
  optionId: string;
  label: string;
  doorScale: number;
  signW: number;
  signH: number;
  doorH: number;
  layout: HallwayLayout;
  root: Phaser.GameObjects.Container;
  doorImg: Phaser.GameObjects.Image;
  zone: Phaser.GameObjects.Zone;
  glow: Phaser.GameObjects.Graphics;
  prompt: Phaser.GameObjects.Text;
  optionText: Phaser.GameObjects.Text;
  signBg: Phaser.GameObjects.Graphics;
}

function slotPositions(layout: HallwayLayout, signW: number): { doorX: number; signX: number; groupW: number } {
  const groupW = layout.doorPixelW + SIGN_GAP + signW;
  const doorX = -groupW / 2 + layout.doorPixelW / 2;
  const signX = -groupW / 2 + layout.doorPixelW + SIGN_GAP + signW / 2;
  return { doorX, signX, groupW };
}

export function ensureDoorTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('hallway-door-wood')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(WOOD.frame, 1);
  g.fillRoundedRect(0, 0, 48, 64, 5);
  g.fillStyle(WOOD.panel, 1);
  g.fillRoundedRect(5, 14, 38, 38, 4);
  g.fillStyle(WOOD.handle, 1);
  g.fillCircle(37, 34, 4);
  g.generateTexture('hallway-door-wood', 48, 64);
  g.destroy();
}

function measureSignHeight(textObj: Phaser.GameObjects.Text, raw: string, signW: number, minH: number): number {
  textObj.setText(raw.trim());
  textObj.setStyle({
    fontSize: `${MIN_FONT_PX}px`,
    wordWrap: { width: signW - 18 },
    align: 'center',
    lineSpacing: 3,
  });
  return Math.max(minH, textObj.height + SIGN_PAD);
}

function drawSign(visual: HallwayDoorVisual, optionText: string): void {
  const { signBg, optionText: textObj, signW, doorH, layout, doorImg } = visual;
  const signH = measureSignHeight(textObj, optionText, signW, layout.cardHeight);
  visual.signH = signH;

  const { doorX, signX, groupW } = slotPositions(layout, signW);
  const signY = -doorH / 2;

  doorImg.setX(doorX);

  signBg.clear();
  signBg.fillStyle(SIGN_WOOD.frame, 1);
  signBg.fillRoundedRect(signX - signW / 2 - 3, signY - signH / 2 - 3, signW + 6, signH + 6, 5);
  signBg.fillStyle(SIGN_WOOD.face, 1);
  signBg.fillRoundedRect(signX - signW / 2, signY - signH / 2, signW, signH, 4);
  signBg.lineStyle(1, SIGN_WOOD.frame, 0.6);
  signBg.strokeRoundedRect(signX - signW / 2, signY - signH / 2, signW, signH, 4);
  signBg.fillStyle(SIGN_WOOD.nail, 1);
  signBg.fillCircle(signX - signW / 2 + 8, signY - signH / 2 + 6, 2);
  signBg.fillCircle(signX + signW / 2 - 8, signY - signH / 2 + 6, 2);

  textObj.setPosition(signX, signY);
  textObj.setOrigin(0.5, 0.5);

  visual.glow.clear();
  visual.glow.fillStyle(0xffe8a0, 0.22);
  visual.glow.fillEllipse((doorX + signX) / 2, -doorH * 0.45, groupW + 8, doorH * 0.95);

  visual.zone.setSize(Math.min(layout.slotWidth, groupW + 8), doorH + 24);
  visual.zone.setPosition(visual.root.x, visual.root.y - doorH * 0.5);
}

export function createDoorVisual(
  scene: Phaser.Scene,
  x: number,
  doorFeetY: number,
  _label: string,
  optionText: string,
  optionId: string,
  layout: HallwayLayout,
): HallwayDoorVisual {
  ensureDoorTextures(scene);
  const doorH = layout.doorHeight;
  const signW = layout.signWidth;
  const s = layout.doorScale;

  const root = scene.add.container(x, doorFeetY).setDepth(8500 + doorFeetY);

  const glow = scene.add.graphics();
  glow.setVisible(false);

  const signBg = scene.add.graphics();
  const optionLabel = scene.add.text(0, 0, optionText.trim(), {
    fontFamily: MAP_FONT_PLACE,
    fontSize: `${MIN_FONT_PX}px`,
    color: '#2a1810',
    align: 'center',
    resolution: MAP_TEXT_RESOLUTION,
    wordWrap: { width: signW - 18 },
    lineSpacing: 3,
  }).setOrigin(0.5, 0.5);

  const doorImg = scene.add.image(0, 0, 'hallway-door-wood');
  doorImg.setScale(s);
  doorImg.setOrigin(0.5, 1);

  const prompt = scene.add.text(0, 12, '', {
    fontFamily: MAP_FONT_TITLE,
    fontSize: '15px',
    color: '#fff8e0',
    stroke: '#1a1008',
    strokeThickness: 4,
    resolution: MAP_TEXT_RESOLUTION,
    backgroundColor: '#2a1810dd',
    padding: { x: 8, y: 4 },
  }).setOrigin(0.5, 0).setVisible(false);

  root.add([glow, signBg, optionLabel, doorImg, prompt]);

  const zone = scene.add.zone(x, doorFeetY - doorH * 0.5, layout.slotWidth, doorH + 80).setOrigin(0.5);

  const visual: HallwayDoorVisual = {
    optionId,
    label: _label,
    doorScale: s,
    signW,
    signH: layout.cardHeight,
    doorH,
    layout,
    root,
    doorImg,
    zone,
    glow,
    prompt,
    optionText: optionLabel,
    signBg,
  };

  drawSign(visual, optionText);
  return visual;
}

export function setDoorActive(visual: HallwayDoorVisual, active: boolean): void {
  visual.glow.setVisible(active);
  visual.prompt.setVisible(active);
  visual.root.setScale(active ? 1.03 : 1);
  if (active) {
    visual.prompt.setText('[E] Entrar');
    const { doorX } = slotPositions(visual.layout, visual.signW);
    visual.prompt.setPosition(doorX, 12);
  }
}

export function updateDoorOptionText(visual: HallwayDoorVisual, text: string): void {
  drawSign(visual, text);
}

export function repositionDoorVisual(
  visual: HallwayDoorVisual,
  x: number,
  y: number,
  layout: HallwayLayout,
): void {
  visual.layout = layout;
  visual.signW = layout.signWidth;
  visual.doorH = layout.doorHeight;
  visual.root.setPosition(x, y);
  visual.zone.setPosition(x, y - visual.doorH * 0.5);
  drawSign(visual, visual.optionText.text);
}
