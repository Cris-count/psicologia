import type { BuildingType } from './map.types';
import { PLAYER_SPRITE } from './tilemap/tilemap.assets';

const base = '/assets/tilemaps/interiors';

export interface InteriorMapConfig {
  mapKey: string;
  mapUrl: string;
  tilesetKey: string;
  tilesetUrl: string;
  tilesetName: string;
  label: string;
  ambient: number;
  accent: number;
}

const INTERIOR_BY_BUILDING: Record<BuildingType, InteriorMapConfig> = {
  hospital: {
    mapKey: 'interior-hospital',
    mapUrl: `${base}/interior-hospital.json`,
    tilesetKey: 'interior-hospital-tileset',
    tilesetUrl: `${base}/interior-hospital-tileset.png`,
    tilesetName: 'interior-premium',
    label: 'Hospital',
    ambient: 0x5a6070,
    accent: 0xffb86a,
  },
  police: {
    mapKey: 'interior-police',
    mapUrl: `${base}/interior-police.json`,
    tilesetKey: 'interior-police-tileset',
    tilesetUrl: `${base}/interior-police-tileset.png`,
    tilesetName: 'interior-premium',
    label: 'Comisaría',
    ambient: 0x505868,
    accent: 0x6eb5ff,
  },
  clinic: {
    mapKey: 'interior-clinic',
    mapUrl: `${base}/interior-clinic.json`,
    tilesetKey: 'interior-clinic-tileset',
    tilesetUrl: `${base}/interior-clinic-tileset.png`,
    tilesetName: 'interior-premium',
    label: 'Consultorio',
    ambient: 0x586058,
    accent: 0x8fd4a8,
  },
  university: {
    mapKey: 'interior-university',
    mapUrl: `${base}/interior-university.json`,
    tilesetKey: 'interior-university-tileset',
    tilesetUrl: `${base}/interior-university-tileset.png`,
    tilesetName: 'interior-premium',
    label: 'Universidad',
    ambient: 0x605858,
    accent: 0xc9a0ff,
  },
  school: {
    mapKey: 'interior-clinic',
    mapUrl: `${base}/interior-clinic.json`,
    tilesetKey: 'interior-clinic-tileset',
    tilesetUrl: `${base}/interior-clinic-tileset.png`,
    tilesetName: 'interior-premium',
    label: 'Centro de atención',
    ambient: 0x586058,
    accent: 0x7ec8e8,
  },
  generic: {
    mapKey: 'interior-clinic',
    mapUrl: `${base}/interior-clinic.json`,
    tilesetKey: 'interior-clinic-tileset',
    tilesetUrl: `${base}/interior-clinic-tileset.png`,
    tilesetName: 'interior-premium',
    label: 'Edificio',
    ambient: 0x585860,
    accent: 0x9eb8ff,
  },
};

/** Índice de zona del campus → tipo de interior (alineado con attention-routes). */
export const ZONE_INDEX_BUILDING: BuildingType[] = ['hospital', 'police', 'clinic', 'university', 'school'];

export function interiorForBuilding(type: BuildingType): InteriorMapConfig {
  return INTERIOR_BY_BUILDING[type] ?? INTERIOR_BY_BUILDING.generic;
}

export function interiorForZoneIndex(index: number): InteriorMapConfig {
  const type = ZONE_INDEX_BUILDING[index] ?? 'generic';
  return interiorForBuilding(type);
}

export const HALLWAY_PLAYER = PLAYER_SPRITE;

export const HALLWAY_WALK = 185;
export const HALLWAY_RUN = 280;
export const HALLWAY_INTERACT_RADIUS = 72;
