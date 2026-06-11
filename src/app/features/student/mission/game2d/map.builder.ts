import { Situation } from '../../../../models/academy.models';

import { MissionZone, ZONE_THEMES } from '../mission.types';

import {

  CATEGORY_ENVIRONMENT,

  MapEnvironmentId,

  THEME_BUILDING,

  THEME_INTERACTABLE,

  WorldMapConfig,

  WorldZoneMarker,

} from './map.types';

import { getEnvironment, MAP_ENVIRONMENTS } from './map.registry';

import { inferBuildingType } from './world-art';

import { CAMPUS_META } from './campus/campus.meta';



export function resolveEnvironmentId(situation: Situation): MapEnvironmentId {

  if (situation.mapEnvironment && isMapEnvironmentId(situation.mapEnvironment)) {

    return situation.mapEnvironment;

  }

  return CATEGORY_ENVIRONMENT[situation.category] ?? 'attention-routes';

}



export function isMapEnvironmentId(value: string): value is MapEnvironmentId {

  return value in MAP_ENVIRONMENTS;

}



function isInteractableKind(value: string): value is import('./map.types').InteractableKind {

  return ['npc', 'terminal', 'patient', 'desk', 'portal', 'door'].includes(value);

}



export function buildWorldMap(

  situation: Situation,

  zones: MissionZone[],

  unlockedFn: (index: number) => boolean,

  completeFn: (index: number) => boolean,

  activeIndex: number,

  activePhase: boolean,

): WorldMapConfig {

  const envId = resolveEnvironmentId(situation);

  const environment = getEnvironment(envId);

  const scale = CAMPUS_META.displayScale;

  const markers: WorldZoneMarker[] = zones.map((zone) => {
    const slot =
      CAMPUS_META.zones.find((z) => z.zoneIndex === zone.index) ??
      CAMPUS_META.zones[zone.index] ??
      CAMPUS_META.zones[0];

    const theme = ZONE_THEMES[zone.theme];

    const buildingType =

      (slot.buildingType as import('./map.types').BuildingType) ??

      inferBuildingType(zone.scenario.title, THEME_BUILDING[zone.theme]);



    const doorX = slot.doorX * scale;
    const doorY = slot.doorY * scale;



    return {

      index: zone.index,

      tileX: slot.tileX,

      tileY: slot.tileY,

      worldX: doorX,

      worldY: doorY - 20 * scale,

      doorX,

      doorY,

      accent: theme.accent,

      label: zone.scenario.title || slot.label,

      interactable:

        zone.scenario.interactableKind && isInteractableKind(zone.scenario.interactableKind)

          ? zone.scenario.interactableKind

          : THEME_INTERACTABLE[zone.theme],

      buildingType,

      unlocked: unlockedFn(zone.index),

      active: zone.index === activeIndex && activePhase,

      complete: completeFn(zone.index),

    };

  });



  return {

    environmentId: 'mind-sphere-campus',

    environment: { ...environment, id: 'mind-sphere-campus' },

    zones: markers,

  };

}

