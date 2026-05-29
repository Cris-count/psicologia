import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { STUDENT_HERO_CUTOUTS, StudentHeroPose } from './student-hero.assets';
import {
  applyMissionPlayerPose,
  pulseMissionPlayer,
  setupMissionPlayerAnimations,
} from './mission-player.animations';

export type MissionPlayerState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'interact'
  | 'think'
  | 'celebrate';

@Component({
  selector: 'app-mission-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './mission-player.component.css',
  template: `
    <div
      #root
      class="mp-anchor"
      [class.size-xs]="size() === 'xs'"
      [class.size-sm]="size() === 'sm'"
      [class.size-md]="size() === 'md'"
      [class.size-lg]="size() === 'lg'"
      [class.state-walk]="state() === 'walk'"
      [class.state-run]="state() === 'run'"
      [class.state-interact]="state() === 'interact'"
      [class.state-think]="state() === 'think'"
      [class.state-celebrate]="state() === 'celebrate'"
      role="img"
      aria-label="Tu personaje en la misión MIND-SPHERE"
    >
      <div class="mp-atmosphere" aria-hidden="true">
        <div class="mp-rim-glow"></div>
        <span class="mp-spark s1"></span>
        <span class="mp-spark s2"></span>
        <span class="mp-spark s3"></span>
      </div>

      <div class="mp-rig">
        <div class="mp-contact-shadow" aria-hidden="true"></div>
        <div class="mp-rig-body">
          <img
            class="mp-sprite"
            [src]="spriteSrc()"
            alt=""
            width="512"
            height="768"
            decoding="async"
            [attr.fetchpriority]="size() === 'lg' ? 'high' : 'auto'"
          />
        </div>
      </div>
    </div>
  `,
})
export class MissionPlayerComponent implements AfterViewInit, OnDestroy {
  readonly state = input<MissionPlayerState>('idle');
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('md');

  private readonly rootRef = viewChild<ElementRef<HTMLElement>>('root');
  private cleanup?: () => void;

  readonly spriteSrc = computed(() => {
    const map: Record<MissionPlayerState, StudentHeroPose> = {
      idle: 'idle',
      walk: 'walk',
      run: 'run',
      interact: 'interact',
      think: 'think',
      celebrate: 'celebrate',
    };
    return STUDENT_HERO_CUTOUTS[map[this.state()]];
  });

  constructor() {
    effect(() => {
      const el = this.rootRef()?.nativeElement;
      const pose = this.state();
      if (!el) return;
      const map: Record<MissionPlayerState, StudentHeroPose> = {
        idle: 'idle',
        walk: 'walk',
        run: 'run',
        interact: 'interact',
        think: 'think',
        celebrate: 'celebrate',
      };
      applyMissionPlayerPose(el, map[pose]);
    });
  }

  ngAfterViewInit(): void {
    const el = this.rootRef()?.nativeElement;
    if (el) this.cleanup = setupMissionPlayerAnimations(el);
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }

  pulse(): void {
    const el = this.rootRef()?.nativeElement;
    if (el) pulseMissionPlayer(el);
  }
}
