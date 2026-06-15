import { GroupTask, Question, Scenario, Situation } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { MissionBlueprint, MissionZone, ZONE_THEME_ORDER, ZoneTheme } from './mission.types';

/** Mapeo escenario → slot de edificio en CAMPUS_META (hospital=0, comisaría=1) */
const SCENARIO_BUILDING_SLOT: Record<string, number> = {
  'sce-hospital': 0,
  'sce-comisaria': 1,
};

function themeForScenario(scenario: Scenario, index: number): ZoneTheme {
  if (scenario.title.toLowerCase().includes('hospital')) return 'crisis-core';
  if (scenario.title.toLowerCase().includes('comisar')) return 'ethics-vault';
  return ZONE_THEME_ORDER[index % ZONE_THEME_ORDER.length];
}

function buildingSlotFor(scenario: Scenario, index: number): number {
  if (scenario.id in SCENARIO_BUILDING_SLOT) return SCENARIO_BUILDING_SLOT[scenario.id];
  if (scenario.title.toLowerCase().includes('hospital')) return 0;
  if (scenario.title.toLowerCase().includes('comisar')) return 1;
  return index;
}

export function buildMissionBlueprint(
  task: GroupTask,
  situation: Situation,
  data: AcademyDataService,
): MissionBlueprint {
  const scenarios = data.scenariosForTask(task);

  const zones: MissionZone[] = scenarios.map((scenario, index) => ({
    id: scenario.id,
    index: buildingSlotFor(scenario, index),
    scenario,
    theme: themeForScenario(scenario, index),
    mapX: 0,
    mapY: 0,
    questions: data.questionsForTask(task, scenario.id),
  }));

  const totalQuestions = zones.reduce((sum, zone) => sum + zone.questions.length, 0);

  return {
    introTitle: situation.generalContextTitle ?? situation.title,
    introContext: situation.generalContextBody ?? situation.context,
    objective: situation.learningObjective,
    difficulty: situation.difficulty,
    zones,
    totalQuestions,
  };
}

export function zoneProgress(
  zone: MissionZone,
  answeredIds: Set<string>,
): { done: number; total: number; percent: number; complete: boolean } {
  const total = zone.questions.length;
  const done = zone.questions.filter((q) => answeredIds.has(q.id)).length;
  return {
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 100,
    complete: total === 0 || done >= total,
  };
}

export function nextUnansweredQuestion(zone: MissionZone, answeredIds: Set<string>): Question | null {
  return zone.questions.find((q) => !answeredIds.has(q.id)) ?? null;
}

export function questionAtIndex(zone: MissionZone, index: number): Question | null {
  if (index < 0 || index >= zone.questions.length) return null;
  return zone.questions[index] ?? null;
}

export function firstUnansweredIndex(zone: MissionZone, answeredIds: Set<string>): number {
  const idx = zone.questions.findIndex((q) => !answeredIds.has(q.id));
  return idx >= 0 ? idx : 0;
}

export function missionProgressPercent(zones: MissionZone[], answeredIds: Set<string>): number {
  const total = zones.reduce((sum, z) => sum + z.questions.length, 0);
  if (!total) return 100;
  const done = zones.reduce(
    (sum, z) => sum + z.questions.filter((q) => answeredIds.has(q.id)).length,
    0,
  );
  return Math.round((done / total) * 100);
}

export function isZoneUnlocked(
  zones: MissionZone[],
  zoneIndex: number,
  answeredIds: Set<string>,
): boolean {
  const zone = zones.find((z) => z.index === zoneIndex);
  if (!zone) return false;
  if (zoneIndex === 0) return true;
  const prevZones = zones.filter((z) => z.index < zoneIndex).sort((a, b) => b.index - a.index);
  const prev = prevZones[0];
  if (!prev) return true;
  return zoneProgress(prev, answeredIds).complete;
}

export function zoneLabel(zone: MissionZone): string {
  return zone.scenario.title;
}

export function scenarioContextTitle(zone: MissionZone): string {
  return zone.scenario.contextPanelTitle ?? zone.scenario.title;
}

/** Contexto específico del escenario (no incluye el contexto general del caso). */
export function scenarioContextBody(zone: MissionZone): string {
  return zone.scenario.contextPanelBody ?? zone.scenario.context;
}

export function zonePlayState(
  zones: MissionZone[],
  zone: MissionZone,
  answeredIds: Set<string>,
  activeZoneIndex: number,
  phase: string,
): import('../../../models/evaluation.models').ScenarioPlayState {
  const prog = zoneProgress(zone, answeredIds);
  if (prog.complete) return 'completed';
  if (!isZoneUnlocked(zones, zone.index, answeredIds)) return 'locked';
  if (zone.index === activeZoneIndex) {
    if (phase === 'scenario-context') return 'context';
    if (phase === 'decision') return 'questions';
  }
  return 'available';
}
