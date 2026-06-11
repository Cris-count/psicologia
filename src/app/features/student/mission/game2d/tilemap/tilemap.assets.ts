const base = '/assets/tilemaps';

export const TILEMAP_ASSETS = {
  mapKey: 'mind-sphere-campus',
  mapUrl: `${base}/mind-sphere-campus.json`,
  metaUrl: `${base}/mind-sphere-campus.meta.json`,
    tilesetKey: 'edu-city',
    tilesetUrl: `${base}/edu-city-tileset.png`,
  tileSize: 16,
  displayScale: 2,
} as const;

export const TILEMAP_LAYERS = [
  'Ground',
  'Road',
  'Nature',
  'Buildings',
  'Decoration',
  'Shadow',
  'Collision',
] as const;

export const PLAYER_SPRITE = {
  key: 'player-sheet',
  url: '/assets/iso/characters/student-sheet.png',
  frameWidth: 112,
  frameHeight: 144,
  displayHeight: 44,
  framesPerDir: 7,
  dirs: ['down', 'up', 'left', 'right'] as const,
  idle: [0, 1, 2],
  walk: [3, 4, 5],
  interact: 6,
} as const;

export type TilemapZoneMeta = {
  zoneIndex: number;
  buildingType: string;
  label: string;
  tileX: number;
  tileY: number;
  doorX: number;
  doorY: number;
};

export type TilemapCampusMeta = {
  mapId: string;
  tileSize: number;
  displayScale: number;
  width: number;
  height: number;
  zones: TilemapZoneMeta[];
  spawn: { tileX: number; tileY: number; x: number; y: number };
  tileset: string;
  credit: string;
};
