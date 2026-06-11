import Phaser from 'phaser';
import { GAME_ASSETS } from '../student-hero.assets';
import { BuildingType, MapDecoration, MapEnvironmentDef, TerrainCell } from './map.types';

const TILE = 24;

export function loadWorldAssets(scene: Phaser.Scene): void {
  if (scene.textures.exists('tile-grass-0')) return;

  GAME_ASSETS.tiles.grass.forEach((url, i) => scene.load.image(`tile-grass-${i}`, url));
  scene.load.image('tile-path', GAME_ASSETS.tiles.path);
  scene.load.image('tile-road', GAME_ASSETS.tiles.road);
  scene.load.image('tile-water', GAME_ASSETS.tiles.water);

  for (const [key, url] of Object.entries(GAME_ASSETS.props)) {
    scene.load.image(`prop-${key}`, url);
  }
  for (const [key, url] of Object.entries(GAME_ASSETS.buildings)) {
    scene.load.image(`building-${key}`, url);
  }

  const shadow = scene.make.graphics({ x: 0, y: 0 });
  shadow.fillStyle(0x0a1420, 0.55);
  shadow.fillEllipse(20, 6, 40, 12);
  shadow.generateTexture('tex-soft-shadow', 40, 12);
}

function grassVariant(x: number, y: number): number {
  return ((x * 17 + y * 31) >>> 0) % 4;
}

function shouldScatterFlower(x: number, y: number): boolean {
  return ((x * 13 + y * 7) >>> 0) % 11 === 0;
}

export function paintTerrain(scene: Phaser.Scene, env: MapEnvironmentDef, layer: Phaser.GameObjects.Group): Phaser.GameObjects.Image[] {
  const ts = env.tileSize;
  const waterTiles: Phaser.GameObjects.Image[] = [];

  for (let y = 0; y < env.tileHeight; y++) {
    for (let x = 0; x < env.tileWidth; x++) {
      const cell = env.terrainGrid[y]?.[x] ?? 'grass';
      const px = x * ts + ts / 2;
      const py = y * ts + ts / 2;
      let key = `tile-grass-${grassVariant(x, y)}`;
      if (cell === 'path') key = y >= env.tileHeight - 4 ? 'tile-road' : 'tile-path';
      else if (cell === 'water') key = 'tile-water';

      const tile = scene.add.image(px, py, key).setDisplaySize(ts, ts).setDepth(py - 1);
      layer.add(tile);

      if (cell === 'water') waterTiles.push(tile);
      else if (cell === 'grass' && shouldScatterFlower(x, y)) {
        const fl = scene.add.image(px + 4, py + 2, 'prop-flower').setOrigin(0.5, 0.9).setScale(0.7);
        fl.setDepth(py + 0.1);
        layer.add(fl);
      }
    }
  }
  return waterTiles;
}

export function drawSkyBackdrop(scene: Phaser.Scene, env: MapEnvironmentDef): void {
  const w = env.tileWidth * env.tileSize;
  const h = env.tileHeight * env.tileSize;
  const sky = scene.add.graphics().setDepth(-20);
  sky.fillGradientStyle(0x3a4a78, 0x5a6a98, 0x8a7a68, 0x4a6a52, 1, 1, 0.7, 0.25);
  sky.fillRect(0, 0, w, h);

  for (let i = 0; i < 4; i++) {
    const cx = (w / 5) * (i + 1);
    sky.fillStyle(0xffd8a0, 0.12 + i * 0.02);
    sky.fillEllipse(cx, h * 0.35, 120, 40);
  }
}

export function addAtmosphere(scene: Phaser.Scene, env: MapEnvironmentDef): void {
  const w = env.tileWidth * env.tileSize;
  const h = env.tileHeight * env.tileSize;

  const dusk = scene.add.graphics().setDepth(4800).setBlendMode(Phaser.BlendModes.MULTIPLY);
  dusk.fillGradientStyle(0x1a2040, 0x1a2040, 0x2a3048, 0x3a4838, 0.35, 0.35, 0.2, 0.1);
  dusk.fillRect(0, 0, w, h);

  const warm = scene.add.graphics().setDepth(4801).setBlendMode(Phaser.BlendModes.ADD);
  warm.fillStyle(0xffa040, 0.04);
  warm.fillRect(0, h * 0.5, w, h * 0.5);

  const vignette = scene.add.graphics().setDepth(5001).setBlendMode(Phaser.BlendModes.MULTIPLY);
  vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.2, 0.2, 0.5, 0.5);
  vignette.fillRect(0, 0, w, h);
}

export function animateWaterTiles(scene: Phaser.Scene, tiles: Phaser.GameObjects.Image[]): void {
  for (const tile of tiles) {
    scene.tweens.add({
      targets: tile,
      alpha: 0.82,
      duration: 1400 + Phaser.Math.Between(0, 400),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

export function placeDecoration(
  scene: Phaser.Scene,
  dec: MapDecoration,
  env: MapEnvironmentDef,
  layer: Phaser.GameObjects.Group,
  lampLights: Phaser.GameObjects.Arc[],
): void {
  const ts = env.tileSize;
  const px = dec.tileX * ts + ts / 2;
  const py = dec.tileY * ts + ts / 2;
  const depth = py;

  const addShadow = (x: number, y: number, scale = 0.7) => {
    const sh = scene.add.image(x, y + 3, 'tex-soft-shadow').setScale(scale, 0.45).setAlpha(0.4);
    sh.setDepth(depth - 0.5);
    layer.add(sh);
  };

  switch (dec.kind) {
    case 'tree': {
      const key = dec.size === 'lg' ? 'prop-treeLg' : 'prop-tree';
      const img = scene.add.image(px, py, key).setOrigin(0.5, 0.92);
      img.setDepth(depth);
      addShadow(px, py, dec.size === 'lg' ? 1.1 : 0.8);
      layer.add(img);
      break;
    }
    case 'pine': {
      const img = scene.add.image(px, py, 'prop-pine').setOrigin(0.5, 0.92);
      img.setDepth(depth);
      addShadow(px, py, 0.75);
      layer.add(img);
      break;
    }
    case 'bloom': {
      const img = scene.add.image(px, py, 'prop-bloom').setOrigin(0.5, 0.92);
      img.setDepth(depth);
      addShadow(px, py, 0.85);
      layer.add(img);
      break;
    }
    case 'bush': {
      const img = scene.add.image(px, py, 'prop-bush').setOrigin(0.5, 0.85);
      img.setDepth(depth);
      addShadow(px, py, 0.5);
      layer.add(img);
      break;
    }
    case 'flower': {
      const img = scene.add.image(px, py, 'prop-flower').setOrigin(0.5, 0.9);
      img.setDepth(depth);
      layer.add(img);
      break;
    }
    case 'fountain': {
      const img = scene.add.image(px, py, 'prop-fountain').setOrigin(0.5, 0.9);
      img.setDepth(depth);
      addShadow(px, py, 0.9);
      layer.add(img);
      scene.tweens.add({ targets: img, y: py - 1, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      break;
    }
    case 'lamp': {
      const img = scene.add.image(px, py, 'prop-lamp').setOrigin(0.5, 0.95);
      img.setDepth(depth);
      addShadow(px, py, 0.4);
      const glow = scene.add.circle(px, py - 18, 32, 0xffd080, 0.16).setDepth(depth - 0.3);
      lampLights.push(glow);
      scene.tweens.add({ targets: glow, alpha: 0.28, scale: 1.08, duration: 2000, yoyo: true, repeat: -1 });
      layer.add(img);
      break;
    }
    case 'bench': {
      const img = scene.add.image(px, py, 'prop-bench').setOrigin(0.5, 0.85);
      img.setDepth(depth);
      addShadow(px, py, 0.65);
      layer.add(img);
      break;
    }
    case 'fence': {
      const img = scene.add.image(px, py, 'prop-fence').setOrigin(0.5, 0.8);
      img.setDepth(depth);
      layer.add(img);
      break;
    }
    case 'signpost': {
      const img = scene.add.image(px, py, 'prop-signpost').setOrigin(0.5, 0.92);
      img.setDepth(depth);
      addShadow(px, py, 0.45);
      layer.add(img);
      break;
    }
    case 'sign':
      scene.add
        .text(px, py, dec.text ?? '', {
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '8px',
          color: '#f8f4e8',
          backgroundColor: '#1a2838cc',
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(depth + 1);
      break;
    case 'entrance': {
      const img = scene.add.image(px, py, 'prop-entrance').setOrigin(0.5, 0.92);
      img.setDepth(depth);
      addShadow(px, py, 1.4);
      layer.add(img);
      break;
    }
    case 'mapBoard': {
      const img = scene.add.image(px, py, 'prop-mapBoard').setOrigin(0.5, 0.9);
      img.setDepth(depth);
      addShadow(px, py, 0.7);
      layer.add(img);
      break;
    }
    case 'busStop': {
      const img = scene.add.image(px, py, 'prop-busStop').setOrigin(0.5, 0.9);
      img.setDepth(depth);
      addShadow(px, py, 0.85);
      layer.add(img);
      const glow = scene.add.circle(px - 8, py - 14, 18, 0xffd080, 0.12).setDepth(depth - 0.3);
      lampLights.push(glow);
      scene.tweens.add({ targets: glow, alpha: 0.22, duration: 2400, yoyo: true, repeat: -1 });
      break;
    }
    case 'statue': {
      const img = scene.add.image(px, py, 'prop-statue').setOrigin(0.5, 0.92);
      img.setDepth(depth);
      addShadow(px, py, 0.75);
      layer.add(img);
      break;
    }
    case 'crosswalk': {
      const img = scene.add.image(px, py, 'prop-crosswalk').setOrigin(0.5, 0.5);
      img.setDepth(depth - 2);
      layer.add(img);
      break;
    }
  }
}

function isNearLandmark(env: MapEnvironmentDef, x: number, y: number, radius = 3): boolean {
  const landmarks = env.landmarks ?? env.zoneSlots;
  for (const lm of landmarks) {
    if (Math.abs(lm.tileX - x) <= radius && Math.abs(lm.tileY - y) <= radius) return true;
  }
  if (Math.abs(env.spawn.tileX - x) <= 2 && Math.abs(env.spawn.tileY - y) <= 2) return true;
  return false;
}

function isAdjacentToPath(env: MapEnvironmentDef, x: number, y: number): boolean {
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const [dx, dy] of dirs) {
    const cell = env.terrainGrid[y + dy]?.[x + dx];
    if (cell === 'path' || cell === 'water') return true;
  }
  return false;
}

export function scatterAmbientDecor(
  scene: Phaser.Scene,
  env: MapEnvironmentDef,
  layer: Phaser.GameObjects.Group,
): void {
  for (let y = 1; y < env.tileHeight - 1; y++) {
    for (let x = 1; x < env.tileWidth - 1; x++) {
      const cell = env.terrainGrid[y]?.[x] ?? 'grass';
      if (cell !== 'grass' || isNearLandmark(env, x, y)) continue;

      const hash = ((x * 17 + y * 31) >>> 0) % 100;
      const ts = env.tileSize;
      const px = x * ts + ts / 2;
      const py = y * ts + ts / 2;
      const depth = py;

      if (isAdjacentToPath(env, x, y) && hash < 22) {
        const bush = scene.add.image(px, py, 'prop-bush').setOrigin(0.5, 0.85).setScale(0.85);
        bush.setDepth(depth);
        const sh = scene.add.image(px, py + 2, 'tex-soft-shadow').setScale(0.45, 0.35).setAlpha(0.3);
        sh.setDepth(depth - 0.5);
        layer.add(sh);
        layer.add(bush);
      } else if (hash < 6) {
        const fl = scene.add.image(px + 2, py, 'prop-flower').setOrigin(0.5, 0.9).setScale(0.75);
        fl.setDepth(depth + 0.1);
        layer.add(fl);
      } else if (hash === 7 && x % 5 === 0) {
        const pine = scene.add.image(px, py, 'prop-pine').setOrigin(0.5, 0.92).setScale(0.65);
        pine.setDepth(depth);
        layer.add(pine);
      }
    }
  }
}

export function placeBuilding(
  scene: Phaser.Scene,
  x: number,
  y: number,
  type: BuildingType,
  depth: number,
): { sprite: Phaser.GameObjects.Image; doorX: number; doorY: number; doorGlow: Phaser.GameObjects.Rectangle } {
  const key = `building-${type in GAME_ASSETS.buildings ? type : 'generic'}`;
  const shadow = scene.add.image(x, y + 6, 'tex-soft-shadow').setOrigin(0.5, 0.5).setScale(2.4, 1.1);
  shadow.setDepth(depth - 2);
  shadow.setAlpha(0.6);

  const sprite = scene.add.image(x, y, key).setOrigin(0.5, 0.88);
  sprite.setDepth(depth);

  const doorY = y + 14;
  const doorGlow = scene.add.rectangle(x, doorY, 18, 22, 0x000000, 0);
  doorGlow.setStrokeStyle(0);
  doorGlow.setDepth(depth + 1);

  return { sprite, doorX: x, doorY, doorGlow };
}

export function inferBuildingType(title: string, fallback: BuildingType): BuildingType {
  const t = title.toLowerCase();
  if (t.includes('hospital') || t.includes('urgenc')) return 'hospital';
  if (t.includes('comisar') || t.includes('familia') || t.includes('polic')) return 'police';
  if (t.includes('univers') || t.includes('campus')) return 'university';
  if (t.includes('colegio') || t.includes('escolar') || t.includes('escuela')) return 'school';
  if (t.includes('consult') || t.includes('psicol') || t.includes('clínic')) return 'clinic';
  return fallback;
}

export function terrainBlocksMovement(cell: TerrainCell): boolean {
  return cell === 'water' || cell === 'tree';
}

export function startAmbientParticles(scene: Phaser.Scene, env: MapEnvironmentDef): void {
  const w = env.tileWidth * TILE;
  const h = env.tileHeight * TILE;

  scene.add.particles(0, 0, 'prop-flower', {
    x: { min: 24, max: w - 24 },
    y: { min: 24, max: h - 24 },
    speedX: { min: -4, max: 4 },
    speedY: { min: 6, max: 14 },
    scale: { start: 0.12, end: 0 },
    alpha: { start: 0.4, end: 0 },
    lifespan: 7000,
    frequency: 380,
    quantity: 1,
  }).setDepth(4000);

  scene.add.particles(0, 0, 'prop-pine', {
    x: { min: 0, max: w },
    y: -10,
    speedY: { min: 12, max: 28 },
    speedX: { min: -10, max: 10 },
    scale: { start: 0.06, end: 0.02 },
    alpha: { start: 0.25, end: 0 },
    rotate: { min: -40, max: 40 },
    lifespan: 5000,
    frequency: 600,
    quantity: 1,
  }).setDepth(4001);
}
