import { GroupTask, Question, Scenario, Situation } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { MissionBlueprint, MissionZone, ZONE_THEME_ORDER, ZoneTheme } from './mission.types';

const MAP_LAYOUT: Array<{ x: number; y: number }> = [
  { x: 12, y: 72 },
  { x: 32, y: 48 },
  { x: 52, y: 62 },
  { x: 72, y: 38 },
  { x: 88, y: 55 },
];

function themeForIndex(index: number): ZoneTheme {
  return ZONE_THEME_ORDER[index % ZONE_THEME_ORDER.length];
}

export function buildMissionBlueprint(
  task: GroupTask,
  situation: Situation,
  data: AcademyDataService,
): MissionBlueprint {
  const scenarios = data.scenariosForTask(task);

  const zones: MissionZone[] = scenarios.map((scenario, index) => ({
    id: scenario.id,
    index,
    scenario,
    theme: themeForIndex(index),
    mapX: MAP_LAYOUT[index]?.x ?? 50,
    mapY: MAP_LAYOUT[index]?.y ?? 50,
    questions: data.questionsForTask(task, scenario.id),
  }));

  const totalQuestions = zones.reduce((sum, zone) => sum + zone.questions.length, 0);

  return {
    briefingTitle: situation.title,
    briefingContext: situation.context,
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
  if (zoneIndex === 0) return true;
  const prev = zones[zoneIndex - 1];
  if (!prev) return true;
  return zoneProgress(prev, answeredIds).complete;
}
