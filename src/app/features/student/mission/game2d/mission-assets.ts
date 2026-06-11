/** Recursos del simulador — mapa institucional MIND-SPHERE */

export const MISSION_ASSET_MANIFEST = {

  tilemap: { key: 'mind-sphere-campus', url: '/assets/tilemaps/mind-sphere-campus.json' },

  tileset: { key: 'edu-city', url: '/assets/tilemaps/edu-city-tileset.png' },

  player: { key: 'player-sheet', url: '/assets/iso/characters/student-sheet.png', fw: 112, fh: 144 },

  buildings: [

    'building-hospital',

    'building-comisaria',

    'building-fiscalia',

    'building-school',

    'building-police',

    'building-library',

    'building-mental-health',

    'building-icbf',

    'building-bienestar',

    'building-salon-comunal',

    'building-farmacia',

    'building-tienda',

    'building-cafeteria',

    'building-casa',

    'building-cancha',

    'building-terminal',

  ] as const,

  props: [

    'prop-ambulance',

    'prop-police-car',

    'prop-bus',

    'prop-fountain',

    'prop-tree',

    'prop-tree-lg',

    'prop-flower',

    'prop-bench',

    'prop-lamp',

    'prop-bush',

    'prop-books',

    'prop-signpost',
    'prop-fence',
    'prop-citizen-0',

    'prop-citizen-1',

    'prop-citizen-2',

  ] as const,

} as const;



export type LoadProgressFn = (percent: number, label: string) => void;



export function missionAssetUrls(): { key: string; url: string; type: 'image' | 'spritesheet' | 'tilemap' }[] {

  const m = MISSION_ASSET_MANIFEST;

  const list: { key: string; url: string; type: 'image' | 'spritesheet' | 'tilemap' }[] = [

    { key: m.tilemap.key, url: m.tilemap.url, type: 'tilemap' },

    { key: m.tileset.key, url: m.tileset.url, type: 'image' },

    { key: m.player.key, url: m.player.url, type: 'spritesheet' },

  ];

  for (const b of m.buildings) list.push({ key: b, url: `/assets/game/${b}.png`, type: 'image' });

  for (const p of m.props) list.push({ key: p, url: `/assets/game/${p}.png`, type: 'image' });

  return list;

}

