const base = '/assets/game';

export const PLAYER_PIXEL = {
  url: `${base}/player-pixel.png`,
  frameWidth: 32,
  frameHeight: 48,
  framesPerDir: 7,
  idleFrames: [0, 1, 2],
  walkFrames: [3, 4, 5],
  interactFrame: 6,
  dirs: ['down', 'up', 'left', 'right'] as const,
} as const;

export type PlayerDirection = (typeof PLAYER_PIXEL.dirs)[number];

export type PlayerAnimState = 'idle' | 'walk' | 'run' | 'interact' | 'think' | 'celebrate';

export const GAME_ASSETS = {
  tiles: {
    grass: [0, 1, 2, 3].map((i) => `${base}/tile-grass-${i}.png`),
    path: `${base}/tile-path.png`,
    road: `${base}/tile-road.png`,
    water: `${base}/tile-water.png`,
  },
  props: {
    tree: `${base}/prop-tree.png`,
    treeLg: `${base}/prop-tree-lg.png`,
    pine: `${base}/prop-pine.png`,
    bloom: `${base}/prop-bloom.png`,
    bush: `${base}/prop-bush.png`,
    flower: `${base}/prop-flower.png`,
    lamp: `${base}/prop-lamp.png`,
    bench: `${base}/prop-bench.png`,
    fence: `${base}/prop-fence.png`,
    fountain: `${base}/prop-fountain.png`,
    signpost: `${base}/prop-signpost.png`,
    ambulance: `${base}/prop-ambulance.png`,
    policeCar: `${base}/prop-policeCar.png`,
    medSign: `${base}/prop-medSign.png`,
    books: `${base}/prop-books.png`,
    plant: `${base}/prop-plant.png`,
    entrance: `${base}/prop-entrance.png`,
    mapBoard: `${base}/prop-mapBoard.png`,
    busStop: `${base}/prop-busStop.png`,
    statue: `${base}/prop-statue.png`,
    crosswalk: `${base}/prop-crosswalk.png`,
  },
  buildings: {
    hospital: `${base}/building-hospital.png`,
    police: `${base}/building-police.png`,
    university: `${base}/building-university.png`,
    clinic: `${base}/building-clinic.png`,
    school: `${base}/building-school.png`,
    generic: `${base}/building-clinic.png`,
  },
} as const;

export const GARY_COMPANION_CUTOUT = '/assets/guide/nexa-bust-premium-cutout.png';
