import { MissionGameEvents, MissionGameInput, MissionGameState } from '../mission-scene.types';
import { WorldMapConfig } from './map.types';

/** Puente mutable entre Angular y la escena Phaser (sin RxJS en el game loop). */
export interface MissionPhaserBridge {
  state: MissionGameState;
  input: MissionGameInput;
  world: WorldMapConfig | null;
  events: MissionGameEvents;
  interactPulse: boolean;
  resetPlayerToSpawn: boolean;
}

export function createBridge(): MissionPhaserBridge {
  return {
    state: {
      phase: 'briefing',
      playerX: 0,
      playerY: 0,
      accent: '#4fc3ff',
      zones: [],
      playerAnim: 'idle',
      controlsEnabled: false,
      showDecisionHolo: false,
      paused: false,
      world: null,
    },
    input: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      interact: false,
    },
    world: null,
    events: {},
    interactPulse: false,
    resetPlayerToSpawn: false,
  };
}
