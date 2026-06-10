import Phaser from 'phaser';
import { BuildingType, MapLandmark } from './map.types';
import { WorldZoneMarker } from './map.types';
import { tileToWorld } from './map.registry';
import { MapEnvironmentDef } from './map.types';

interface AmbienceProp {
  texture: string;
  dx: number;
  dy: number;
  originY?: number;
  glow?: number;
}

const ZONE_PROPS: Record<BuildingType, AmbienceProp[]> = {
  hospital: [
    { texture: 'prop-ambulance', dx: -44, dy: 18 },
    { texture: 'prop-medSign', dx: 38, dy: -8 },
    { texture: 'prop-flower', dx: -28, dy: 24 },
    { texture: 'prop-lamp', dx: 42, dy: 22, glow: 0xfff8e8 },
  ],
  police: [
    { texture: 'prop-policeCar', dx: -40, dy: 20 },
    { texture: 'prop-signpost', dx: 36, dy: -6 },
    { texture: 'prop-fence', dx: -52, dy: 14 },
    { texture: 'prop-lamp', dx: 44, dy: 18, glow: 0xd0e0ff },
  ],
  university: [
    { texture: 'prop-books', dx: -32, dy: 20 },
    { texture: 'prop-bush', dx: 40, dy: 16 },
    { texture: 'prop-flower', dx: -20, dy: 26 },
    { texture: 'prop-bench', dx: 48, dy: 22 },
  ],
  clinic: [
    { texture: 'prop-plant', dx: -36, dy: 18 },
    { texture: 'prop-flower', dx: 34, dy: 20 },
    { texture: 'prop-bush', dx: -18, dy: 24 },
    { texture: 'prop-lamp', dx: 40, dy: 16, glow: 0xe8fff4 },
  ],
  school: [
    { texture: 'prop-books', dx: -38, dy: 18 },
    { texture: 'prop-signpost', dx: 34, dy: -4 },
    { texture: 'prop-bench', dx: -48, dy: 20 },
    { texture: 'prop-flower', dx: 42, dy: 22 },
  ],
  generic: [
    { texture: 'prop-bush', dx: -24, dy: 18 },
    { texture: 'prop-flower', dx: 28, dy: 20 },
  ],
};

export function placeZoneAmbience(
  scene: Phaser.Scene,
  zone: WorldZoneMarker,
  layer: Phaser.GameObjects.Group,
  lampLights: Phaser.GameObjects.Arc[],
): void {
  const props = ZONE_PROPS[zone.buildingType] ?? ZONE_PROPS.generic;
  const baseY = zone.worldY;
  const depth = baseY;

  for (const prop of props) {
    const x = zone.worldX + prop.dx;
    const y = zone.worldY + prop.dy;
    const img = scene.add.image(x, y, prop.texture).setOrigin(0.5, prop.originY ?? 0.9);
    img.setDepth(depth + prop.dy * 0.01);
    layer.add(img);

    const sh = scene.add.image(x, y + 4, 'tex-soft-shadow').setScale(0.6, 0.5).setAlpha(0.35);
    sh.setDepth(depth - 1);
    layer.add(sh);

    if (prop.glow) {
      const glow = scene.add.circle(x, y - 12, 22, prop.glow, 0.14).setDepth(depth - 0.5);
      lampLights.push(glow);
      scene.tweens.add({ targets: glow, alpha: 0.26, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  const winGlow = scene.add.circle(zone.worldX, zone.worldY - 18, 30, zoneWindowTint(zone.buildingType), 0.1);
  winGlow.setDepth(depth + 0.5);
  scene.tweens.add({ targets: winGlow, alpha: 0.18, duration: 3000, yoyo: true, repeat: -1 });
  layer.add(winGlow);
}

function zoneWindowTint(type: BuildingType): number {
  switch (type) {
    case 'hospital': return 0xffffff;
    case 'police': return 0xa8c8ff;
    case 'university': return 0xffe0a0;
    case 'clinic': return 0xc8f0e0;
    default: return 0xffe8c0;
  }
}

export function placeStaticLandmarkAmbience(
  scene: Phaser.Scene,
  env: MapEnvironmentDef,
  landmark: MapLandmark,
  layer: Phaser.GameObjects.Group,
  lampLights: Phaser.GameObjects.Arc[],
): void {
  const world = tileToWorld(env, landmark.tileX, landmark.tileY);
  const zone: WorldZoneMarker = {
    index: landmark.zoneIndex,
    tileX: landmark.tileX,
    tileY: landmark.tileY,
    worldX: world.x,
    worldY: world.y,
    doorX: world.x,
    doorY: world.y + 14,
    accent: '#6a8a9a',
    label: landmark.label,
    interactable: 'door',
    buildingType: landmark.buildingType,
    unlocked: false,
    active: false,
    complete: false,
  };
  placeZoneAmbience(scene, zone, layer, lampLights);

  scene.add
    .text(world.x, world.y - 54, landmark.label, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '9px',
      color: '#e8f0f8',
      backgroundColor: '#1a2838aa',
      padding: { x: 6, y: 2 },
    })
    .setOrigin(0.5)
    .setDepth(world.y + 2)
    .setAlpha(0.72);
}
