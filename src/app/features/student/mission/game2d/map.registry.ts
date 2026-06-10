import { ATTENTION_ROUTES_MAP } from './maps/attention-routes.map';
import { MapEnvironmentDef, MapEnvironmentId } from './map.types';

export function tileToWorld(env: MapEnvironmentDef, tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: tileX * env.tileSize + env.tileSize / 2,
    y: tileY * env.tileSize + env.tileSize / 2,
  };
}

export const MAP_ENVIRONMENTS: Record<MapEnvironmentId, MapEnvironmentDef> = {
  'mind-sphere-campus': ATTENTION_ROUTES_MAP,
  'attention-routes': ATTENTION_ROUTES_MAP,
  'clinical-office': ATTENTION_ROUTES_MAP,
  'university-campus': ATTENTION_ROUTES_MAP,
  hospital: ATTENTION_ROUTES_MAP,
  'research-lab': ATTENTION_ROUTES_MAP,
  'mind-campus': ATTENTION_ROUTES_MAP,
};

export function getEnvironment(id: MapEnvironmentId): MapEnvironmentDef {
  return MAP_ENVIRONMENTS[id] ?? ATTENTION_ROUTES_MAP;
}
