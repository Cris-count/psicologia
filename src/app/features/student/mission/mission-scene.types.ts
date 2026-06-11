import { WorldMapConfig } from './game2d/map.types';
import { MissionPhase } from './mission.types';
import { PlayerAnimState } from './student-hero.assets';

export interface MissionSceneZone {
  mapX: number;
  mapY: number;
  accent: string;
  unlocked: boolean;
  active: boolean;
  complete: boolean;
  label?: string;
}

export interface MissionGameState {
  phase: MissionPhase;
  playerX: number;
  playerY: number;
  accent: string;
  zones: MissionSceneZone[];
  world: WorldMapConfig | null;
  playerAnim: PlayerAnimState;
  controlsEnabled: boolean;
  showDecisionHolo: boolean;
  paused: boolean;
  guideMessage?: string;
  /** Índice del edificio objetivo actual (solo E aquí en fase mapa). */
  objectiveZoneIndex?: number;
  /** Incrementar para reposicionar al jugador en el spawn. */
  missionResetToken?: number;
}

export interface MissionGameInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  interact: boolean;
}

export interface MissionGameEvents {
  onZoneReach?: (zoneIndex: number) => void;
  onInteractNode?: () => void;
}

/** @deprecated Use MissionGameState */
export type MissionSceneState = MissionGameState;
