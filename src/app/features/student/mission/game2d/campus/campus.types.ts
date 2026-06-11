export interface CampusZoneMeta {
  zoneIndex: number;
  buildingType: string;
  label: string;
  tileX: number;
  tileY: number;
  doorX: number;
  doorY: number;
  sprite: string;
  scale: number;
}

export interface CampusBuildingDef {
  zoneIndex: number;
  id: string;
  label: string;
  buildingType: string;
  sprite: string;
  x: number;
  y: number;
  scale: number;
  doorOffset?: { dx: number; dy: number };
  props?: { sprite: string; dx: number; dy: number; blocking?: boolean }[];
  missionHighlight?: boolean;
}

export interface CampusDecorDef {
  sprite: string;
  x: number;
  y: number;
  scale: number;
}

export interface CampusMeta {
  mapId: string;
  tileSize: number;
  displayScale: number;
  width: number;
  height: number;
  zones: CampusZoneMeta[];
  buildings: CampusBuildingDef[];
  decor: CampusDecorDef[];
  spawn: { tileX: number; tileY: number; x: number; y: number };
  tileset: string;
  credit: string;
  bounds?: { minX: number; minY: number; maxX: number; maxY: number };
}
