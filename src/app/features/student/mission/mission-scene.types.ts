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
  playerAnim: PlayerAnimState;
  controlsEnabled: boolean;
  showDecisionHolo: boolean;
  paused: boolean;
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
