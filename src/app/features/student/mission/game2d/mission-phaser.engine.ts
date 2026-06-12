import type { MissionGameEvents, MissionGameInput, MissionGameState } from '../mission-scene.types';
import type { WorldMapConfig } from './map.types';
import { createBridge, type MissionPhaserBridge } from './mission-phaser.bridge';
import type { LoadProgressFn } from './mission-assets';

type PhaserGame = import('phaser').Game;
type MissionWorldScene = import('./mission-phaser.scene').MissionWorldScene;

let phaserBoot: Promise<typeof import('phaser')> | null = null;
let sceneBoot: Promise<typeof import('./mission-phaser.scene')> | null = null;

function resolvePhaserModule(mod: typeof import('phaser')): typeof import('phaser') {
  const candidate = mod as typeof import('phaser') & { default?: typeof import('phaser') };
  return (candidate.default ?? mod) as typeof import('phaser');
}

function loadPhaser(onProgress?: LoadProgressFn): Promise<typeof import('phaser')> {
  if (!phaserBoot) {
    onProgress?.(5, 'Motor Phaser');
    phaserBoot = import('phaser').then(resolvePhaserModule);
  }
  return phaserBoot;
}

function loadScene(onProgress?: LoadProgressFn): Promise<typeof import('./mission-phaser.scene')> {
  if (!sceneBoot) {
    onProgress?.(12, 'Escena del campus');
    sceneBoot = import('./mission-phaser.scene');
  }
  return sceneBoot;
}

/** Motor 2D — Phaser se carga solo al iniciar una misión */
export class MissionPhaserEngine {
  private game: PhaserGame | null = null;
  private readonly bridge: MissionPhaserBridge;
  private disposed = false;
  private sceneRef: MissionWorldScene | null = null;
  private lastResetToken = 0;

  constructor(
    private readonly parent: HTMLElement,
    private readonly onProgress?: LoadProgressFn,
  ) {
    this.bridge = createBridge();
  }

  async init(width: number, height: number): Promise<void> {
    if (this.disposed || this.game) return;

    const Phaser = await loadPhaser(this.onProgress);
    const sceneMod = await loadScene(this.onProgress);
    const SceneClass = sceneMod.MissionWorldScene;

    this.onProgress?.(18, 'Inicializando canvas');

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this.parent,
      width,
      height,
      backgroundColor: '#6a7a94',
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
        powerPreference: 'high-performance',
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [SceneClass],
      audio: { noAudio: true },
      banner: false,
      callbacks: {
        preBoot: (game) => {
          game.registry.set('missionBridge', this.bridge);
          game.registry.set('missionProgress', this.onProgress ?? null);
        },
      },
    });

    await new Promise<void>((resolve) => {
      const check = () => {
        const scene = this.game?.scene.getScene('MissionWorld') as MissionWorldScene | undefined;
        if (scene?.isReady?.()) {
          this.sceneRef = scene;
          this.onProgress?.(100, 'Listo');
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
  }

  resize(width: number, height: number): void {
    if (!this.game || this.disposed) return;
    this.game.scale.resize(width, height);
  }

  setState(state: MissionGameState): void {
    const token = state.missionResetToken ?? 0;
    if (token !== this.lastResetToken) {
      this.lastResetToken = token;
      this.bridge.resetPlayerToSpawn = true;
    }
    this.bridge.state = state;
  }

  setWorld(world: WorldMapConfig | null): void {
    if (!world) {
      this.bridge.world = null;
      return;
    }
    const prevId = this.bridge.world?.environmentId;
    this.bridge.world = world;
    if (world.environmentId !== prevId) this.bridge.resetPlayerToSpawn = true;
  }

  setInput(input: Partial<MissionGameInput>): void {
    Object.assign(this.bridge.input, input);
  }

  setEvents(events: MissionGameEvents): void {
    this.bridge.events = events;
  }

  handlePointerClick(clientX: number, clientY: number, rect: DOMRect): void {
    const player = this.sceneRef?.getPlayerSprite();
    if (!this.game || this.disposed || !player) return;

    const canvas = this.parent.querySelector('canvas');
    if (!canvas) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const cam = this.game.scene.getScene('MissionWorld').cameras.main;
    const worldX = cam.scrollX + x / cam.zoom;
    const worldY = cam.scrollY + y / cam.zoom;

    this.sceneRef?.setClickDestination(worldX, worldY);
  }

  dispose(): void {
    this.disposed = true;
    this.sceneRef = null;
    this.game?.destroy(true);
    this.game = null;
  }
}
