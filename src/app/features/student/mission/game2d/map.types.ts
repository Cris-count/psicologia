import { SituationCategory } from '../../../../models/academy.models';
import { ZoneTheme } from '../mission.types';

export type MapEnvironmentId =
  | 'mind-sphere-campus'
  | 'attention-routes'
  | 'clinical-office'
  | 'university-campus'
  | 'hospital'
  | 'research-lab'
  | 'mind-campus';

export type TerrainCell = 'grass' | 'path' | 'water' | 'flower' | 'tree';

export type BuildingType = 'hospital' | 'police' | 'university' | 'school' | 'clinic' | 'generic';

export type InteractableKind = 'npc' | 'terminal' | 'patient' | 'desk' | 'portal' | 'door';

export interface MapTilePoint {
  tileX: number;
  tileY: number;
}

export interface MapZoneSlot extends MapTilePoint {
  interactable: InteractableKind;
  label: string;
  buildingType: BuildingType;
}

export interface MapDecoration {
  kind:
    | 'tree'
    | 'lamp'
    | 'bench'
    | 'sign'
    | 'flower'
    | 'bush'
    | 'fence'
    | 'fountain'
    | 'signpost'
    | 'pine'
    | 'bloom'
    | 'entrance'
    | 'mapBoard'
    | 'busStop'
    | 'statue'
    | 'crosswalk';
  tileX: number;
  tileY: number;
  text?: string;
  size?: 'lg';
}

export interface MapLandmark {
  zoneIndex: number;
  tileX: number;
  tileY: number;
  buildingType: BuildingType;
  label: string;
}

export interface MapEnvironmentDef {
  id: MapEnvironmentId;
  label: string;
  description: string;
  tileWidth: number;
  tileHeight: number;
  tileSize: number;
  /** Terreno visual — sin cuadrícula */
  terrainGrid: TerrainCell[][];
  /** @deprecated Usar terrainGrid + colisiones de edificios/árboles */
  collisionGrid: number[][];
  spawn: MapTilePoint;
  zoneSlots: MapZoneSlot[];
  /** Edificios fijos del campus — siempre visibles aunque no haya escenario activo */
  landmarks?: MapLandmark[];
  decorations?: MapDecoration[];
  palette: {
    floor: number;
    floorAlt: number;
    wall: number;
    wallEdge: number;
    accent: number;
    ambient: number;
    grassTint?: number;
  };
}

export interface WorldMapConfig {
  environmentId: MapEnvironmentId;
  environment: MapEnvironmentDef;
  zones: WorldZoneMarker[];
}

export interface WorldZoneMarker {
  index: number;
  tileX: number;
  tileY: number;
  worldX: number;
  worldY: number;
  doorX: number;
  doorY: number;
  accent: string;
  label: string;
  interactable: InteractableKind;
  buildingType: BuildingType;
  unlocked: boolean;
  active: boolean;
  complete: boolean;
}

export const CATEGORY_ENVIRONMENT: Record<SituationCategory, MapEnvironmentId> = {
  CLINICAL: 'mind-sphere-campus',
  PSYCHOSOCIAL: 'mind-sphere-campus',
  CRISIS: 'mind-sphere-campus',
  ETHICS: 'mind-sphere-campus',
  DEVELOPMENT: 'mind-sphere-campus',
  ORGANIZATIONAL: 'mind-sphere-campus',
};

export const THEME_INTERACTABLE: Record<ZoneTheme, InteractableKind> = {
  'neural-lab': 'terminal',
  'mind-city': 'npc',
  'psyche-garden': 'desk',
  'crisis-core': 'patient',
  'ethics-vault': 'portal',
};

export const THEME_BUILDING: Record<ZoneTheme, BuildingType> = {
  'neural-lab': 'clinic',
  'mind-city': 'university',
  'psyche-garden': 'school',
  'crisis-core': 'hospital',
  'ethics-vault': 'police',
};
