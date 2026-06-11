/** Configuración del campus isométrico MIND-SPHERE */
export const ISO_CONFIG = {
  tileWidth: 128,
  tileHeight: 64,
  walkSpeed: 140,
  runSpeed: 230,
  interactRadius: 72,
  displayScale: 1,
  mapKey: 'mind-sphere-campus-iso',
  tilesetKey: 'campus-premium',
  tilesetImage: '/assets/iso/tilesets/campus-premium.png',
  mapUrl: '/assets/iso/tiled/mind-sphere-campus.iso.json',
  sceneKey: 'MissionWorld',
  characterFrameW: 72,
  characterFrameH: 96,
  garyFramesPerState: 4,
  garyStates: ['idle', 'point', 'talk', 'encourage'] as const,
} as const;

export const ISO_TILE_LAYERS = ['Ground', 'Paths', 'Nature'] as const;
export const ISO_COLLISION_LAYER = 'Collision';

export const ISO_ATLAS_KEYS = {
  buildings: 'atlas-buildings',
  props: 'atlas-props',
} as const;
