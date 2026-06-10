export interface IsoWorldPoint {
  x: number;
  y: number;
}

export interface IsoTilePoint {
  tileX: number;
  tileY: number;
}

export interface IsoZoneMeta {
  zoneIndex: number;
  zoneId: string;
  buildingType: string;
  label: string;
  tileX: number;
  tileY: number;
  doorX: number;
  doorY: number;
  sprite: string;
  footprint: { w: number; h: number };
}

export interface IsoBuildingDef {
  zoneIndex: number;
  zoneId: string;
  id: string;
  label: string;
  buildingType: string;
  sprite: string;
  tileX: number;
  tileY: number;
  footprint: { w: number; h: number };
  props?: { sprite: string; offsetTx: number; offsetTy: number }[];
}

export interface IsoDecorDef {
  sprite: string;
  layer: string;
  tileX: number;
  tileY: number;
  kind: string;
}

export interface IsoNpcDef {
  id: string;
  sprite: string;
  tileX: number;
  tileY: number;
  role: string;
}

export interface IsoAtlasDef {
  key: string;
  url: string;
  jsonUrl: string;
  frames: string[];
  phase?: number;
  lazy?: boolean;
}

export interface IsoCampusMeta {
  mapId: string;
  orientation: 'isometric';
  tileWidth: number;
  tileHeight: number;
  width: number;
  height: number;
  zones: IsoZoneMeta[];
  buildings: IsoBuildingDef[];
  decor: IsoDecorDef[];
  npcs: IsoNpcDef[];
  spawn: IsoTilePoint & IsoWorldPoint;
  tileset: string;
  mapUrl: string;
  tilesetUrl: string;
  credit: string;
}
