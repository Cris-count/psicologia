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
  viewChild,
} from '@angular/core';
import { MissionGameEngine } from './mission-game.engine';
import { MissionGameEvents, MissionGameState } from './mission-scene.types';

const GAME_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'ShiftLeft', 'ShiftRight', 'Space', 'KeyE', 'Escape',
]);

@Component({
  selector: 'app-mission-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="mission-game-canvas" aria-label="Mundo interactivo MIND-SPHERE" tabindex="0"></canvas>`,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        z-index: 0;
        display: block;
        border-radius: inherit;
      }
      .mission-game-canvas {
        width: 100%;
        height: 100%;
        display: block;
        cursor: crosshair;
        outline: none;
      }
      .mission-game-canvas:focus {
        outline: none;
      }
    `,
  ],
})
export class MissionGameComponent implements AfterViewInit, OnDestroy {
  readonly state = input.required<MissionGameState>();

  readonly zoneReach = output<number>();
  readonly interactNode = output<void>();
  readonly pauseToggle = output<void>();

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private engine: MissionGameEngine | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private keys = { forward: false, backward: false, left: false, right: false, sprint: false };
  private interactHeld = false;

  constructor() {
    effect(() => this.engine?.setState(this.state()));
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    const host = canvas.parentElement;
    if (!host) return;

    canvas.focus();

    this.engine = new MissionGameEngine(canvas);
    const events: MissionGameEvents = {
      onZoneReach: (i) => this.zoneReach.emit(i),
      onInteractNode: () => this.interactNode.emit(),
    };
    this.engine.setEvents(events);
    this.engine.setState(this.state());

    const { width, height } = host.getBoundingClientRect();
    this.engine.init(width, height);

    this.resizeObserver = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) this.engine?.resize(r.width, r.height);
    });
    this.resizeObserver.observe(host);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.engine?.dispose();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (!GAME_KEYS.has(e.code)) return;
    if (e.code === 'Escape') {
      e.preventDefault();
      this.pauseToggle.emit();
      return;
    }
    if (this.state().paused && e.code !== 'Escape') return;

    e.preventDefault();
    if (e.code === 'Space' || e.code === 'KeyE') {
      if (!e.repeat) {
        this.interactHeld = true;
        this.engine?.setInput({ interact: true });
      }
      return;
    }
    this.applyKey(e.code, true);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Escape') return;
    if (e.code === 'Space' || e.code === 'KeyE') {
      this.interactHeld = false;
      this.engine?.setInput({ interact: false });
      return;
    }
    this.applyKey(e.code, false);
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent): void {
    this.canvasRef().nativeElement.focus();
    const canvas = this.canvasRef().nativeElement;
    this.engine?.handlePointerClick(e.clientX, e.clientY, canvas.getBoundingClientRect());
  }

  private applyKey(code: string, down: boolean): void {
    const map: Record<string, keyof typeof this.keys> = {
      KeyW: 'forward', ArrowUp: 'forward',
      KeyS: 'backward', ArrowDown: 'backward',
      KeyA: 'left', ArrowLeft: 'left',
      KeyD: 'right', ArrowRight: 'right',
      ShiftLeft: 'sprint', ShiftRight: 'sprint',
    };
    const k = map[code];
    if (k) {
      this.keys[k] = down;
      this.engine?.setInput({ ...this.keys, interact: this.interactHeld });
    }
  }
}
