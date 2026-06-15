import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { BuildingType } from './game2d/map.types';
import type { HallwayBridge } from './game2d/mission-hallway.scene';

const MOVE_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyE', 'ShiftLeft', 'ShiftRight',
]);

@Component({
  selector: 'app-mission-hallway',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #host class="hallway-host" tabindex="0" aria-label="Interior clínico interactivo"></div>`,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        z-index: 5;
        display: block;
        background: #0a0e18;
      }
      .hallway-host {
        width: 100%;
        height: 100%;
        outline: none;
      }
      :host ::ng-deep canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class MissionHallwayComponent implements AfterViewInit, OnDestroy {
  readonly statement = input.required<string>();
  readonly accent = input('#4fc3ff');
  readonly doors = input.required<HallwayBridge['doors']>();
  readonly buildingType = input<BuildingType>('hospital');
  readonly buildingLabel = input('');
  readonly questionIndex = input(1);
  readonly questionTotal = input(1);
  readonly resetToken = input(0);

  readonly doorSelected = output<string>();

  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private game: import('phaser').Game | null = null;
  private scene: import('./game2d/mission-hallway.scene').MissionHallwayScene | null = null;
  private readonly bridge: HallwayBridge = {
    accent: '#4fc3ff',
    statement: '',
    doors: [],
    buildingType: 'hospital',
    buildingLabel: '',
    questionIndex: 1,
    questionTotal: 1,
    contentRevision: 0,
    input: { forward: false, backward: false, left: false, right: false, interact: false, sprint: false },
    onSelect: (id) => this.doorSelected.emit(id),
  };
  protected readonly ready = signal(false);
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      this.bridge.statement = this.statement();
      this.bridge.accent = this.accent();
      this.bridge.doors = this.doors();
      this.bridge.buildingType = this.buildingType();
      this.bridge.buildingLabel = this.buildingLabel();
      this.bridge.questionIndex = this.questionIndex();
      this.bridge.questionTotal = this.questionTotal();
      this.bridge.contentRevision = this.resetToken();
      this.scene?.refreshDoors();
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const host = this.hostRef().nativeElement;
    const { width, height } = host.getBoundingClientRect();
    const phaserMod = await import('phaser');
    const Phaser = (phaserMod as { default?: typeof import('phaser') }).default ?? phaserMod;
    const { MissionHallwayScene } = await import('./game2d/mission-hallway.scene');

    this.syncBridge();

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: Math.max(480, width),
      height: Math.max(360, height),
      backgroundColor: '#2a3240',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      input: { keyboard: true },
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true, roundPixels: false },
      scene: [MissionHallwayScene],
      audio: { noAudio: true },
      banner: false,
      callbacks: {
        preBoot: (game) => {
          game.registry.set('hallwayBridge', this.bridge);
        },
      },
    });

    await new Promise<void>((resolve) => {
      const check = () => {
        const scene = this.game?.scene.getScene('MissionHallway') as
          | import('./game2d/mission-hallway.scene').MissionHallwayScene
          | undefined;
        if (scene?.scene.isActive()) {
          this.scene = scene;
          this.ready.set(true);
          const canvas = host.querySelector('canvas');
          if (canvas instanceof HTMLCanvasElement) {
            canvas.setAttribute('tabindex', '0');
            canvas.focus();
          }
          host.focus();
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });

    this.resizeObserver = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && this.game) this.game.scale.resize(r.width, r.height);
    });
    this.resizeObserver.observe(host);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.game?.destroy(true);
    this.game = null;
    this.scene = null;
  }

  @HostListener('click')
  onHostClick(): void {
    this.hostRef().nativeElement.focus();
    const canvas = this.hostRef().nativeElement.querySelector('canvas');
    if (canvas instanceof HTMLCanvasElement) canvas.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (!this.ready()) return;
    if (!MOVE_KEYS.has(e.code)) return;
    e.preventDefault();
    if (e.code === 'KeyE') {
      this.bridge.input.interact = true;
      return;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.bridge.input.sprint = true;
      return;
    }
    this.applyKey(e.code, true);
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (!this.ready()) return;
    if (e.code === 'KeyE') {
      this.bridge.input.interact = false;
      return;
    }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      this.bridge.input.sprint = false;
      return;
    }
    this.applyKey(e.code, false);
  }

  private syncBridge(): void {
    this.bridge.statement = this.statement();
    this.bridge.accent = this.accent();
    this.bridge.doors = this.doors();
    this.bridge.buildingType = this.buildingType();
    this.bridge.buildingLabel = this.buildingLabel();
    this.bridge.questionIndex = this.questionIndex();
    this.bridge.questionTotal = this.questionTotal();
    this.bridge.contentRevision = this.resetToken();
  }

  private applyKey(code: string, down: boolean): void {
    const map: Record<string, keyof HallwayBridge['input']> = {
      KeyW: 'forward',
      ArrowUp: 'forward',
      KeyS: 'backward',
      ArrowDown: 'backward',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
    };
    const k = map[code];
    if (k && k !== 'interact' && k !== 'sprint') this.bridge.input[k] = down;
  }
}
