import type { IsoCampusMeta } from './iso.types';

/** Generado por scripts/build-iso-campus-map.mjs — NO editar a mano */
export const ISO_CAMPUS_META: IsoCampusMeta = {
  "mapId": "mind-sphere-campus-iso",
  "orientation": "isometric",
  "tileWidth": 128,
  "tileHeight": 64,
  "width": 48,
  "height": 48,
  "zones": [
    {
      "zoneIndex": 0,
      "zoneId": "hospital",
      "buildingType": "hospital",
      "label": "HOSPITAL",
      "tileX": 24,
      "tileY": 12,
      "doorX": 768,
      "doorY": 1152,
      "sprite": "iso-building-hospital",
      "footprint": {
        "w": 5,
        "h": 4
      }
    },
    {
      "zoneIndex": 1,
      "zoneId": "police",
      "buildingType": "police",
      "label": "COMISARÍA",
      "tileX": 36,
      "tileY": 14,
      "doorX": 1408,
      "doorY": 1600,
      "sprite": "iso-building-police",
      "footprint": {
        "w": 5,
        "h": 4
      }
    },
    {
      "zoneIndex": 2,
      "zoneId": "clinic",
      "buildingType": "clinic",
      "label": "CONSULTORIO",
      "tileX": 9,
      "tileY": 24,
      "doorX": -960,
      "doorY": 1056,
      "sprite": "iso-building-clinic",
      "footprint": {
        "w": 4,
        "h": 3
      }
    },
    {
      "zoneIndex": 3,
      "zoneId": "university",
      "buildingType": "university",
      "label": "UNIVERSIDAD",
      "tileX": 36,
      "tileY": 35,
      "doorX": 64,
      "doorY": 2272,
      "sprite": "iso-building-university",
      "footprint": {
        "w": 6,
        "h": 5
      }
    },
    {
      "zoneIndex": 4,
      "zoneId": "care-center",
      "buildingType": "school",
      "label": "CENTRO DE ATENCIÓN",
      "tileX": 9,
      "tileY": 37,
      "doorX": -1792,
      "doorY": 1472,
      "sprite": "iso-building-care-center",
      "footprint": {
        "w": 5,
        "h": 4
      }
    }
  ],
  "buildings": [
    {
      "zoneIndex": 0,
      "zoneId": "hospital",
      "id": "hospital",
      "label": "HOSPITAL",
      "buildingType": "hospital",
      "sprite": "iso-building-hospital",
      "tileX": 24,
      "tileY": 9,
      "footprint": {
        "w": 5,
        "h": 4
      },
      "props": [
        {
          "sprite": "iso-prop-ambulance",
          "offsetTx": -3,
          "offsetTy": 3
        },
        {
          "sprite": "iso-prop-sign-hospital",
          "offsetTx": 3,
          "offsetTy": 2
        },
        {
          "sprite": "iso-prop-emergency-sign",
          "offsetTx": -1,
          "offsetTy": 4
        }
      ]
    },
    {
      "zoneIndex": 1,
      "zoneId": "police",
      "id": "police",
      "label": "COMISARÍA",
      "buildingType": "police",
      "sprite": "iso-building-police",
      "tileX": 36,
      "tileY": 11,
      "footprint": {
        "w": 5,
        "h": 4
      },
      "props": [
        {
          "sprite": "iso-prop-police-car",
          "offsetTx": -3,
          "offsetTy": 3
        },
        {
          "sprite": "iso-prop-sign-police",
          "offsetTx": 2,
          "offsetTy": 2
        }
      ]
    },
    {
      "zoneIndex": 2,
      "zoneId": "clinic",
      "id": "clinic",
      "label": "CONSULTORIO",
      "buildingType": "clinic",
      "sprite": "iso-building-clinic",
      "tileX": 9,
      "tileY": 22,
      "footprint": {
        "w": 4,
        "h": 3
      },
      "props": [
        {
          "sprite": "iso-prop-psi-banner",
          "offsetTx": 0,
          "offsetTy": -1
        },
        {
          "sprite": "iso-prop-plant",
          "offsetTx": -2,
          "offsetTy": 2
        },
        {
          "sprite": "iso-prop-plant",
          "offsetTx": 2,
          "offsetTy": 2
        }
      ]
    },
    {
      "zoneIndex": 3,
      "zoneId": "university",
      "id": "university",
      "label": "UNIVERSIDAD",
      "buildingType": "university",
      "sprite": "iso-building-university",
      "tileX": 36,
      "tileY": 32,
      "footprint": {
        "w": 6,
        "h": 5
      },
      "props": [
        {
          "sprite": "iso-prop-statue",
          "offsetTx": -3,
          "offsetTy": 4
        },
        {
          "sprite": "iso-prop-books",
          "offsetTx": 3,
          "offsetTy": 3
        },
        {
          "sprite": "iso-prop-flag-pole",
          "offsetTx": -1,
          "offsetTy": 2
        }
      ]
    },
    {
      "zoneIndex": 4,
      "zoneId": "care-center",
      "id": "care-center",
      "label": "CENTRO DE ATENCIÓN",
      "buildingType": "school",
      "sprite": "iso-building-care-center",
      "tileX": 9,
      "tileY": 34,
      "footprint": {
        "w": 5,
        "h": 4
      },
      "props": [
        {
          "sprite": "iso-prop-bench",
          "offsetTx": 3,
          "offsetTy": 3
        },
        {
          "sprite": "iso-prop-signpost",
          "offsetTx": -2,
          "offsetTy": 2
        }
      ]
    }
  ],
  "decor": [
    {
      "sprite": "iso-prop-fountain",
      "layer": "props",
      "tileX": 24,
      "tileY": 26,
      "kind": "fountain"
    },
    {
      "sprite": "iso-prop-bench",
      "layer": "props",
      "tileX": 21,
      "tileY": 26,
      "kind": "bench"
    },
    {
      "sprite": "iso-prop-bench",
      "layer": "props",
      "tileX": 27,
      "tileY": 26,
      "kind": "bench"
    },
    {
      "sprite": "iso-prop-map-board",
      "layer": "props",
      "tileX": 29,
      "tileY": 29,
      "kind": "sign"
    },
    {
      "sprite": "iso-prop-entrance-gate",
      "layer": "props",
      "tileX": 24,
      "tileY": 44,
      "kind": "entrance"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 8,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 9,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 12,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 16,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 17,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 21,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 29,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 32,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 36,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 37,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 40,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 27,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 44,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 4,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 8,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 11,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 12,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 16,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 19,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 20,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 27,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 28,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 31,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 32,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 36,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 39,
      "tileY": 25,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 40,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 9,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 12,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 16,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 17,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 21,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 29,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 32,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 36,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 37,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 40,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 19,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 8,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 11,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 12,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 16,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 19,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 20,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 27,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 28,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 31,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 32,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 36,
      "tileY": 18,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 39,
      "tileY": 17,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 9,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 12,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 16,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 17,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 21,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 29,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 32,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 36,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 37,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 40,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 35,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 8,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 11,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 12,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 16,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 19,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 20,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 27,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 28,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 31,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 32,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 36,
      "tileY": 34,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 39,
      "tileY": 33,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 12,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 13,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 16,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 17,
      "tileY": 13,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 21,
      "tileY": 13,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 13,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 29,
      "tileY": 13,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 32,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 13,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 36,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 37,
      "tileY": 13,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 40,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 8,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 11,
      "tileY": 11,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 12,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 11,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 16,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 19,
      "tileY": 11,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 20,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 11,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 27,
      "tileY": 11,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 28,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 31,
      "tileY": 11,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 32,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 11,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 36,
      "tileY": 12,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 12,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 41,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 16,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 17,
      "tileY": 41,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 21,
      "tileY": 41,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 41,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 29,
      "tileY": 41,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 32,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 41,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 36,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 37,
      "tileY": 41,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 40,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 8,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 11,
      "tileY": 39,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 12,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 39,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 16,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 19,
      "tileY": 39,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 20,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 39,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 27,
      "tileY": 39,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 28,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 31,
      "tileY": 39,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 32,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 39,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 36,
      "tileY": 40,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 7,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 8,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 15,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 19,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 35,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 39,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 40,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 43,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 5,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 8,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 9,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 13,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 17,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 37,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 40,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 41,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 14,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 14,
      "tileY": 15,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 14,
      "tileY": 19,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 14,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 14,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 14,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 14,
      "tileY": 35,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 14,
      "tileY": 39,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 14,
      "tileY": 9,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 14,
      "tileY": 13,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 14,
      "tileY": 17,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 14,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 14,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 14,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 14,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 13,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 14,
      "tileY": 37,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 34,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 34,
      "tileY": 15,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 34,
      "tileY": 19,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 34,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 34,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 34,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 34,
      "tileY": 35,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 35,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 34,
      "tileY": 39,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 34,
      "tileY": 9,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 34,
      "tileY": 13,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 34,
      "tileY": 17,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 34,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 34,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 34,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 34,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 34,
      "tileY": 37,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 6,
      "tileY": 15,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 6,
      "tileY": 19,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 6,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 6,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 6,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 6,
      "tileY": 35,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 7,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 5,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 6,
      "tileY": 13,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 5,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 6,
      "tileY": 17,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 5,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 6,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 5,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 6,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 5,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 6,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 5,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 6,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 5,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 43,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 42,
      "tileY": 15,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 43,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 42,
      "tileY": 19,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 43,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 42,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 43,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 42,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 43,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 42,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 43,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 42,
      "tileY": 35,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 43,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 42,
      "tileY": 13,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 16,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 42,
      "tileY": 17,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 20,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 42,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 24,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 42,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 28,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 42,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 42,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 41,
      "tileY": 36,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 16,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 17,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 21,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 29,
      "tileY": 12,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 32,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 36,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 12,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 15,
      "tileY": 10,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 16,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 19,
      "tileY": 10,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 20,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 23,
      "tileY": 10,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 27,
      "tileY": 10,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 28,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 31,
      "tileY": 10,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 32,
      "tileY": 11,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 16,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 17,
      "tileY": 34,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 21,
      "tileY": 34,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 25,
      "tileY": 34,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 29,
      "tileY": 34,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 32,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 33,
      "tileY": 34,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 36,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 12,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 16,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 19,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 20,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 27,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 28,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak",
      "layer": "nature",
      "tileX": 31,
      "tileY": 32,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 32,
      "tileY": 33,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 24,
      "tileY": 5,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 23,
      "tileY": 6,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 25,
      "tileY": 6,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 22,
      "tileY": 7,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 26,
      "tileY": 7,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 21,
      "tileY": 8,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 27,
      "tileY": 8,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 20,
      "tileY": 9,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 28,
      "tileY": 9,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 21,
      "tileY": 10,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 27,
      "tileY": 10,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 22,
      "tileY": 11,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 26,
      "tileY": 11,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 23,
      "tileY": 12,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 25,
      "tileY": 12,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 24,
      "tileY": 13,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 36,
      "tileY": 7,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 35,
      "tileY": 8,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 37,
      "tileY": 8,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 34,
      "tileY": 9,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 38,
      "tileY": 9,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 33,
      "tileY": 10,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 39,
      "tileY": 10,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 32,
      "tileY": 11,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 40,
      "tileY": 11,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 33,
      "tileY": 12,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 39,
      "tileY": 12,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 34,
      "tileY": 13,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 38,
      "tileY": 13,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 35,
      "tileY": 14,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 37,
      "tileY": 14,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 36,
      "tileY": 15,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 9,
      "tileY": 19,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 8,
      "tileY": 20,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 10,
      "tileY": 20,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 7,
      "tileY": 21,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 11,
      "tileY": 21,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 6,
      "tileY": 22,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 12,
      "tileY": 22,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 7,
      "tileY": 23,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 11,
      "tileY": 23,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 8,
      "tileY": 24,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 10,
      "tileY": 24,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 9,
      "tileY": 25,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 36,
      "tileY": 28,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 35,
      "tileY": 29,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 37,
      "tileY": 29,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 34,
      "tileY": 30,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 38,
      "tileY": 30,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 33,
      "tileY": 31,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 39,
      "tileY": 31,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 32,
      "tileY": 32,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 40,
      "tileY": 32,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 33,
      "tileY": 33,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 39,
      "tileY": 33,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 34,
      "tileY": 34,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 38,
      "tileY": 34,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 35,
      "tileY": 35,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 37,
      "tileY": 35,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 36,
      "tileY": 36,
      "kind": "outer-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 9,
      "tileY": 31,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 8,
      "tileY": 32,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 10,
      "tileY": 32,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 7,
      "tileY": 33,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 11,
      "tileY": 33,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 6,
      "tileY": 34,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 12,
      "tileY": 34,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 7,
      "tileY": 35,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 11,
      "tileY": 35,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 8,
      "tileY": 36,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 10,
      "tileY": 36,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 9,
      "tileY": 37,
      "kind": "building-ring"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 22,
      "tileY": 20,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 23,
      "tileY": 20,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 20,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 25,
      "tileY": 20,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 26,
      "tileY": 20,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 20,
      "tileY": 21,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 21,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 22,
      "tileY": 21,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 23,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 24,
      "tileY": 21,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 25,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 26,
      "tileY": 21,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 27,
      "tileY": 21,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 28,
      "tileY": 21,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 19,
      "tileY": 22,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 22,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 21,
      "tileY": 22,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 22,
      "tileY": 22,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 23,
      "tileY": 22,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 22,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 25,
      "tileY": 22,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 26,
      "tileY": 22,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 27,
      "tileY": 22,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 22,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 29,
      "tileY": 22,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 19,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 20,
      "tileY": 23,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 21,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 22,
      "tileY": 23,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 23,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 24,
      "tileY": 23,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 25,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 26,
      "tileY": 23,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 27,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 28,
      "tileY": 23,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 29,
      "tileY": 23,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 18,
      "tileY": 24,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 19,
      "tileY": 24,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 20,
      "tileY": 24,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 21,
      "tileY": 24,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 27,
      "tileY": 24,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 28,
      "tileY": 24,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 29,
      "tileY": 24,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 30,
      "tileY": 24,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 18,
      "tileY": 25,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 19,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 20,
      "tileY": 25,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 21,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 27,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 28,
      "tileY": 25,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 29,
      "tileY": 25,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 30,
      "tileY": 25,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 18,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 19,
      "tileY": 26,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 21,
      "tileY": 26,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 27,
      "tileY": 26,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 29,
      "tileY": 26,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 30,
      "tileY": 26,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 18,
      "tileY": 27,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 19,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 20,
      "tileY": 27,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 21,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 27,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 28,
      "tileY": 27,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 29,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 30,
      "tileY": 27,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 18,
      "tileY": 28,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 19,
      "tileY": 28,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 20,
      "tileY": 28,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 21,
      "tileY": 28,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 27,
      "tileY": 28,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 28,
      "tileY": 28,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 29,
      "tileY": 28,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 30,
      "tileY": 28,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 19,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 20,
      "tileY": 29,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 21,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 22,
      "tileY": 29,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 23,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 24,
      "tileY": 29,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 25,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 26,
      "tileY": 29,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 27,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 28,
      "tileY": 29,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 29,
      "tileY": 29,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 19,
      "tileY": 30,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 20,
      "tileY": 30,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 21,
      "tileY": 30,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 22,
      "tileY": 30,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 23,
      "tileY": 30,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 24,
      "tileY": 30,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 25,
      "tileY": 30,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 26,
      "tileY": 30,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 27,
      "tileY": 30,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 28,
      "tileY": 30,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 29,
      "tileY": 30,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 20,
      "tileY": 31,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 21,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 22,
      "tileY": 31,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 23,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 24,
      "tileY": 31,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 25,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 26,
      "tileY": 31,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 27,
      "tileY": 31,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-lamp",
      "layer": "lighting",
      "tileX": 28,
      "tileY": 31,
      "kind": "lamp"
    },
    {
      "sprite": "iso-prop-flowers-yellow",
      "layer": "nature",
      "tileX": 22,
      "tileY": 32,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-hedge",
      "layer": "nature",
      "tileX": 23,
      "tileY": 32,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 24,
      "tileY": 32,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 25,
      "tileY": 32,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 26,
      "tileY": 32,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak-lg",
      "layer": "nature",
      "tileX": 4,
      "tileY": 4,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 5,
      "tileY": 4,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 4,
      "tileY": 5,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak-lg",
      "layer": "nature",
      "tileX": 43,
      "tileY": 4,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 44,
      "tileY": 4,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 43,
      "tileY": 5,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak-lg",
      "layer": "nature",
      "tileX": 4,
      "tileY": 43,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 5,
      "tileY": 43,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 4,
      "tileY": 44,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak-lg",
      "layer": "nature",
      "tileX": 43,
      "tileY": 43,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 44,
      "tileY": 43,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 43,
      "tileY": 44,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak-lg",
      "layer": "nature",
      "tileX": 24,
      "tileY": 4,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 25,
      "tileY": 4,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 5,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak-lg",
      "layer": "nature",
      "tileX": 24,
      "tileY": 43,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-bush",
      "layer": "nature",
      "tileX": 25,
      "tileY": 43,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 24,
      "tileY": 44,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak-lg",
      "layer": "nature",
      "tileX": 4,
      "tileY": 26,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 5,
      "tileY": 26,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 4,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-tree-oak-lg",
      "layer": "nature",
      "tileX": 43,
      "tileY": 26,
      "kind": "tree"
    },
    {
      "sprite": "iso-prop-bush-round",
      "layer": "nature",
      "tileX": 44,
      "tileY": 26,
      "kind": "bush"
    },
    {
      "sprite": "iso-prop-flowers",
      "layer": "nature",
      "tileX": 43,
      "tileY": 27,
      "kind": "flowers"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 30,
      "tileY": 16,
      "kind": "scatter"
    },
    {
      "sprite": "iso-prop-flowers-purple",
      "layer": "nature",
      "tileX": 30,
      "tileY": 22,
      "kind": "scatter"
    }
  ],
  "npcs": [
    {
      "id": "gary",
      "sprite": "iso-gary-sheet",
      "tileX": 22,
      "tileY": 30,
      "role": "guide"
    },
    {
      "id": "npc-student-a",
      "sprite": "iso-npc-sheet",
      "tileX": 27,
      "tileY": 28,
      "role": "ambient"
    },
    {
      "id": "npc-student-b",
      "sprite": "iso-npc-sheet",
      "tileX": 18,
      "tileY": 24,
      "role": "ambient"
    },
    {
      "id": "npc-student-c",
      "sprite": "iso-npc-sheet",
      "tileX": 30,
      "tileY": 20,
      "role": "ambient"
    },
    {
      "id": "npc-student-d",
      "sprite": "iso-npc-sheet",
      "tileX": 20,
      "tileY": 34,
      "role": "ambient"
    }
  ],
  "spawn": {
    "tileX": 24,
    "tileY": 32,
    "x": -512,
    "y": 1792
  },
  "tileset": "campus-premium",
  "mapUrl": "/assets/iso/tiled/mind-sphere-campus.iso.json",
  "tilesetUrl": "/assets/iso/tilesets/campus-premium.png",
  "credit": "MIND-SPHERE · Campus isométrico HD"
} as IsoCampusMeta;
