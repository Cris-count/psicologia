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
import { MissionGameEvents, MissionGameState } from './mission-scene.types';

const GAME_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'ShiftLeft', 'ShiftRight', 'Space', 'KeyE', 'Escape',
]);

@Component({
  selector: 'app-mission-game',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #host
      class="mission-game-host"
      [class.mission-game-ready]="ready()"
      aria-label="Campus MIND-SPHERE"
      tabindex="0"
    ></div>
    @if (!ready()) {
      <div class="mission-boot" aria-live="polite">
        <div class="mission-boot-bg" aria-hidden="true"></div>
        <div class="mission-boot-card">
          <div class="mission-boot-brand">
            <span class="mission-boot-logo">MIND</span>
            <span class="mission-boot-logo accent">SPHERE</span>
          </div>
          <p class="mission-boot-sub">Simulador clínico · Campus mental</p>
          <p class="mission-boot-label">{{ loadLabel() }}</p>
          <div class="mission-boot-bar">
            <div class="mission-boot-fill" [style.width.%]="loadPercent()"></div>
            <div class="mission-boot-shine" [style.left.%]="loadPercent()"></div>
          </div>
          <div class="mission-boot-meta">
            <span class="mission-boot-pct">{{ loadPercent() }}%</span>
            <span class="mission-boot-tip">{{ loadTip() }}</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        z-index: 0;
        display: block;
        border-radius: inherit;
        overflow: hidden;
        background: linear-gradient(165deg, #0c0a18 0%, #1a2840 40%, #0e0c1e 100%);
      }
      .mission-game-host {
        width: 100%;
        height: 100%;
        outline: none;
        cursor: crosshair;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .mission-game-host.mission-game-ready {
        opacity: 1;
      }
      .mission-boot {
        position: absolute;
        inset: 0;
        z-index: 2;
        display: grid;
        place-items: center;
        overflow: hidden;
        background: linear-gradient(165deg, #0c0a18 0%, #13102a 50%, #0e0c1e 100%);
      }
      .mission-boot-bg {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse 80% 50% at 50% 20%, rgba(79, 195, 255, 0.12), transparent),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(244, 197, 66, 0.08), transparent),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 48px,
            rgba(79, 195, 255, 0.03) 48px,
            rgba(79, 195, 255, 0.03) 49px
          );
        animation: boot-grid-pan 12s linear infinite;
      }
      @keyframes boot-grid-pan {
        from { transform: translateX(0); }
        to { transform: translateX(-49px); }
      }
      .mission-boot-card {
        position: relative;
        width: min(380px, 90vw);
        padding: 1.6rem 1.75rem 1.4rem;
        border: 2px solid rgba(79, 195, 255, 0.4);
        border-radius: 16px;
        background: #0e0c1e;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
        text-align: center;
      }
      .mission-boot-brand {
        display: flex;
        justify-content: center;
        gap: 0.35rem;
        margin-bottom: 0.35rem;
      }
      .mission-boot-logo {
        font-family: var(--psy-font-display);
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        color: var(--psy-ink);
      }
      .mission-boot-logo.accent {
        color: var(--psy-accent);
        text-shadow: 0 0 24px rgba(79, 195, 255, 0.35);
      }
      .mission-boot-sub {
        margin: 0 0 1.1rem;
        font-family: var(--psy-font-hud);
        font-size: 0.55rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--psy-muted);
      }
      .mission-boot-label {
        margin: 0 0 0.85rem;
        font-family: var(--psy-font-body);
        font-size: 0.86rem;
        color: var(--psy-ink);
      }
      .mission-boot-bar {
        position: relative;
        height: 10px;
        border-radius: 5px;
        background: #1a1630;
        border: 1px solid rgba(79, 195, 255, 0.25);
        overflow: hidden;
      }
      .mission-boot-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #3a9fd4, var(--psy-accent), var(--psy-gold));
        transition: width 0.25s ease;
        box-shadow: 0 0 12px rgba(79, 195, 255, 0.35);
      }
      .mission-boot-shine {
        position: absolute;
        top: 0;
        width: 24px;
        height: 100%;
        margin-left: -12px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
        transition: left 0.25s ease;
        pointer-events: none;
      }
      .mission-boot-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.55rem;
        gap: 0.5rem;
      }
      .mission-boot-pct {
        font-family: var(--psy-font-hud);
        font-size: 0.62rem;
        color: var(--psy-gold);
        letter-spacing: 0.08em;
      }
      .mission-boot-tip {
        font-family: var(--psy-font-hud);
        font-size: 0.52rem;
        color: var(--psy-muted);
        text-align: right;
        flex: 1;
      }
      :host ::ng-deep canvas {
        display: block;
        width: 100% !important;
        height: 100% !important;
      }
    `,
  ],
})
export class MissionGameComponent implements AfterViewInit, OnDestroy {
  readonly state = input.required<MissionGameState>();

  readonly zoneReach = output<number>();
  readonly interactNode = output<void>();
  readonly pauseToggle = output<void>();
  protected readonly ready = signal(false);
  protected readonly loadLabel = signal('Iniciando motor…');
  protected readonly loadPercent = signal(0);
  protected readonly loadTip = signal('Preparando entorno…');

  private readonly bootTips = [
    'Preparando entorno…',
    'Cargando campus mental…',
    'Sincronizando rutas clínicas…',
    'Activando iluminación ambiental…',
    'Listo para explorar',
  ];

  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private engine: import('./game2d/mission-phaser.engine').MissionPhaserEngine | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private keys = { forward: false, backward: false, left: false, right: false, sprint: false };
  private interactHeld = false;

  constructor() {
    effect(() => {
      const s = this.state();
      this.engine?.setState(s);
      this.engine?.setWorld(s.world);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const host = this.hostRef().nativeElement;
    this.loadPercent.set(2);
    this.loadLabel.set('Iniciando simulador…');

    try {
      const { MissionPhaserEngine } = await import('./game2d/mission-phaser.engine');
      this.engine = new MissionPhaserEngine(host, (pct, label) => {
        this.loadPercent.set(pct);
        this.loadLabel.set(label);
        const tipIdx = Math.min(this.bootTips.length - 1, Math.floor(pct / 22));
        this.loadTip.set(this.bootTips[tipIdx]);
      });

      const events: MissionGameEvents = {
        onZoneReach: (i) => this.zoneReach.emit(i),
        onInteractNode: () => this.interactNode.emit(),
      };
      this.engine.setEvents(events);

      const { width, height } = host.getBoundingClientRect();
      await this.engine.init(width, height);
      this.engine.setState(this.state());
      this.engine.setWorld(this.state().world);
      this.ready.set(true);
      console.log('Game scene initialized');
      host.focus();

      this.resizeObserver = new ResizeObserver((entries) => {
        const r = entries[0]?.contentRect;
        if (r) this.engine?.resize(r.width, r.height);
      });
      this.resizeObserver.observe(host);
    } catch (err) {
      console.error('Game scene failed to initialize', err);
      this.loadLabel.set('Error al cargar el simulador');
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.engine?.dispose();
    this.engine = null;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (!this.ready()) return;
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
    if (!this.ready()) return;
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
    if (!this.ready()) return;
    const host = this.hostRef().nativeElement;
    host.focus();
    this.engine?.handlePointerClick(e.clientX, e.clientY, host.getBoundingClientRect());
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
