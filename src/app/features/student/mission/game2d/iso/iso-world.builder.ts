import Phaser from 'phaser';
import { ISO_CONFIG, ISO_COLLISION_LAYER, ISO_TILE_LAYERS, ISO_ATLAS_KEYS } from './iso.config';
import type { IsoCampusMeta } from './iso.types';
import { tileCenterWorld } from './iso.math';
import { depthFromY, ISO_DEPTH } from './iso.depth';
import { resolveSpriteTexture } from './iso-asset-loader';

export interface IsoWorldBuildResult {
  map: Phaser.Tilemaps.Tilemap;
  collisionLayer: Phaser.Tilemaps.TilemapLayer | null;
  buildingWalls: Phaser.Physics.Arcade.StaticGroup;
  worldW: number;
  worldH: number;
  deferredSprites: { sprite: string; x: number; y: number; depth: number }[];
}

export function buildIsoWorld(scene: Phaser.Scene, meta: IsoCampusMeta, propsReady: boolean): IsoWorldBuildResult {
  const map = scene.make.tilemap({ key: ISO_CONFIG.mapKey });
  const tileset = map.addTilesetImage(
    ISO_CONFIG.tilesetKey,
    ISO_CONFIG.tilesetKey,
    ISO_CONFIG.tileWidth,
    ISO_CONFIG.tileHeight,
  );
  if (!tileset) throw new Error('Tileset isométrico no cargado');

  const depthByLayer: Record<string, number> = {
    Ground: ISO_DEPTH.ground,
    Paths: ISO_DEPTH.paths,
    Nature: ISO_DEPTH.nature,
  };

  for (const name of ISO_TILE_LAYERS) {
    const layer = map.createLayer(name, tileset, 0, 0);
    if (layer) layer.setDepth(depthByLayer[name] ?? 0);
  }

  const collisionLayer = map.createLayer(ISO_COLLISION_LAYER, tileset, 0, 0);
  if (collisionLayer) {
    collisionLayer.setVisible(false);
    collisionLayer.setCollisionByExclusion([0]);
  }

  const buildingWalls = scene.physics.add.staticGroup();
  ensureShadowTexture(scene);
  placeBuildings(scene, meta, buildingWalls);

  const deferredSprites: IsoWorldBuildResult['deferredSprites'] = [];
  for (const d of meta.decor) {
    if (d.kind === 'lamp') continue;
    const p = tileCenterWorld(d.tileX, d.tileY);
    const depth = depthFromY(p.y, ISO_DEPTH.decor);
    if (!propsReady && !isCriticalProp(d.sprite)) {
      deferredSprites.push({ sprite: d.sprite, x: p.x, y: p.y, depth });
      continue;
    }
    placeDecorSprite(scene, d.sprite, p.x, p.y, depth);
  }

  if (propsReady) placeNpcs(scene, meta);

  return { map, collisionLayer, buildingWalls, worldW: map.widthInPixels, worldH: map.heightInPixels, deferredSprites };
}

export function spawnDeferredSprites(
  scene: Phaser.Scene,
  items: IsoWorldBuildResult['deferredSprites'],
): void {
  for (const item of items) {
    placeDecorSprite(scene, item.sprite, item.x, item.y, item.depth);
  }
}

function isCriticalProp(sprite: string): boolean {
  return sprite.includes('fountain') || sprite.includes('entrance') || sprite.includes('bench');
}

function ensureShadowTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists('iso-soft-shadow')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x0a1420, 0.55);
  g.fillEllipse(32, 10, 64, 20);
  g.generateTexture('iso-soft-shadow', 64, 20);
  g.destroy();
}

function addSprite(scene: Phaser.Scene, spriteKey: string, x: number, y: number, depth: number, originY = 0.9): Phaser.GameObjects.Image {
  const ref = resolveSpriteTexture(scene, spriteKey);
  const img = scene.add.image(x, y, ref.texture, ref.frame).setOrigin(0.5, originY).setDepth(depth);
  return img;
}

function placeDecorSprite(scene: Phaser.Scene, spriteKey: string, x: number, y: number, depth: number): void {
  scene.add.image(x, y + 6, 'iso-soft-shadow').setOrigin(0.5, 0.5).setScale(0.9, 0.45).setAlpha(0.38).setDepth(depth - 1);
  addSprite(scene, spriteKey, x, y, depth);
}

function placeBuildings(
  scene: Phaser.Scene,
  meta: IsoCampusMeta,
  walls: Phaser.Physics.Arcade.StaticGroup,
): void {
  for (const b of meta.buildings) {
    const anchor = tileCenterWorld(b.tileX, b.tileY);
    const depth = depthFromY(anchor.y, ISO_DEPTH.buildingBase);

    scene.add
      .image(anchor.x, anchor.y + 10, 'iso-soft-shadow')
      .setOrigin(0.5, 0.5)
      .setScale(2.8, 0.75)
      .setAlpha(0.5)
      .setDepth(depth - 2);

    const sprite = addSprite(scene, b.sprite, anchor.x, anchor.y, depth, 0.92);
    const bw = sprite.displayWidth * 0.72;
    const bh = sprite.displayHeight * 0.38;
    const body = scene.add.rectangle(anchor.x, anchor.y - bh * 0.2, bw, bh, 0, 0);
    body.setVisible(false);
    walls.add(body);

    for (const prop of b.props ?? []) {
      const p = tileCenterWorld(b.tileX + prop.offsetTx, b.tileY + prop.offsetTy);
      addSprite(scene, prop.sprite, p.x, p.y, depthFromY(p.y, ISO_DEPTH.decor));
    }
  }
}

function placeNpcs(scene: Phaser.Scene, meta: IsoCampusMeta): void {
  for (const n of meta.npcs) {
    if (n.role === 'guide') continue;
    const p = tileCenterWorld(n.tileX, n.tileY);
    const depth = depthFromY(p.y, ISO_DEPTH.npc);
    scene.add.ellipse(p.x, p.y + 4, 18, 6, 0x0a1420, 0.42).setDepth(depth - 1);
    scene.add.sprite(p.x, p.y, 'iso-npc-sheet', meta.npcs.indexOf(n) % 4).setOrigin(0.5, 0.88).setDepth(depth);
  }
}
