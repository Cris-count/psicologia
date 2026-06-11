import type { IsoAtlasDef } from './iso.types';

/** Generado por scripts/build-iso-atlas.mjs */
export const ISO_ATLASES: IsoAtlasDef[] = [
  {
    "key": "atlas-buildings",
    "url": "/assets/iso/atlases/atlas-buildings.png",
    "jsonUrl": "/assets/iso/atlases/atlas-buildings.json",
    "frames": [
      "iso-building-hospital",
      "iso-building-police",
      "iso-building-clinic",
      "iso-building-university",
      "iso-building-care-center"
    ],
    "phase": 1,
    "lazy": false
  },
  {
    "key": "atlas-props",
    "url": "/assets/iso/atlases/atlas-props.png",
    "jsonUrl": "/assets/iso/atlases/atlas-props.json",
    "frames": [
      "iso-prop-ambulance",
      "iso-prop-sign-hospital",
      "iso-prop-emergency-sign",
      "iso-prop-police-car",
      "iso-prop-sign-police",
      "iso-prop-psi-banner",
      "iso-prop-plant",
      "iso-prop-statue",
      "iso-prop-books",
      "iso-prop-flag-pole",
      "iso-prop-bench",
      "iso-prop-signpost",
      "iso-prop-fountain",
      "iso-prop-map-board",
      "iso-prop-entrance-gate",
      "iso-prop-flowers-yellow",
      "iso-prop-tree-oak",
      "iso-prop-flowers-purple",
      "iso-prop-flowers",
      "iso-prop-hedge",
      "iso-prop-bush-round",
      "iso-prop-bush",
      "iso-prop-lamp",
      "iso-prop-tree-oak-lg"
    ],
    "phase": 2,
    "lazy": true
  }
] as IsoAtlasDef[];

export const ISO_BOOT_PREVIEW = '/assets/iso/boot-preview.png';
