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
import { GARY_PREMIUM_ASSETS } from '../../data/guide-character.assets';
import { applyGaryMood, setupGaryAnimations } from './guide-character.animations';
import { APP_NAME, GUIDE_NAME } from '../../../../core/branding.constants';
import { GuideCharacterMood, GuideCharacterPresentation } from './guide-character.types';

export type { GuideCharacterMood, GuideCharacterPresentation };

@Component({
  selector: 'app-guide-character',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './guide-character.component.css',
  template: `
    <div
      #root
      class="nexa-anchor"
      [class]="'nexa-anchor presentation-' + resolvedPresentation()"
      [class.mood-happy]="mood() === 'happy'"
      [class.mood-thinking]="mood() === 'thinking'"
      [class.mood-encourage]="mood() === 'encourage'"
      role="img"
      [attr.aria-label]="guideName + ', guía mental de ' + appName"
    >
      @if (resolvedPresentation() === 'stage' || resolvedPresentation() === 'assistant') {
        <div class="nexa-atmosphere" [class.nexa-atmosphere-compact]="resolvedPresentation() === 'assistant'" aria-hidden="true">
          <div class="nexa-fog nexa-fog-low"></div>
          <div class="nexa-fog nexa-fog-mid"></div>
          <div class="nexa-neural-ring ring-1"></div>
          <div class="nexa-neural-ring ring-2"></div>
          <span class="nexa-particle p1" style="top:18%;left:12%"></span>
          <span class="nexa-particle p2" style="top:35%;left:78%"></span>
          <span class="nexa-particle p3" style="top:55%;left:8%"></span>
          <span class="nexa-particle p4" style="top:70%;left:65%"></span>
          <span class="nexa-particle p5" style="top:42%;left:45%"></span>
          <span class="nexa-particle p6" style="top:28%;left:88%"></span>
        </div>
      }

      <div class="nexa-rig">
        <div class="nexa-contact-shadow" aria-hidden="true"></div>

        <div class="nexa-rig-body">
          <img class="nexa-sprite" [src]="assetSrc()" alt="" width="768" height="1024" decoding="async" fetchpriority="high" />
          <div class="nexa-rig-hair" aria-hidden="true"></div>
          <div class="nexa-blink-lids" aria-hidden="true">
            <span class="nexa-blink-lid lid-left"></span>
            <span class="nexa-blink-lid lid-right"></span>
          </div>
        </div>

        @if (resolvedPresentation() === 'stage' || resolvedPresentation() === 'assistant') {
          <div class="nexa-holo-orb" aria-hidden="true">
            <div class="nexa-holo-core"></div>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M50 18 C38 18 30 28 30 38 C26 40 24 44 24 50 C24 58 30 64 36 66 C34 72 38 80 44 84 C48 88 54 88 58 86 C64 88 70 84 74 78 C78 72 80 64 78 58 C84 56 90 50 90 42 C90 36 88 32 84 30 C84 22 76 18 66 18 C62 12 56 10 50 10 C44 10 38 12 34 18 Z"
                fill="none"
                stroke="rgba(79,195,255,0.7)"
                stroke-width="2"
              />
            </svg>
          </div>
        }
      </div>
    </div>
  `,
})
export class GuideCharacterComponent implements AfterViewInit, OnDestroy {
  readonly mood = input<GuideCharacterMood>('idle');
  readonly presentation = input<GuideCharacterPresentation>('stage');
  readonly compact = input(false);
  readonly hero = input(false);

  private readonly rootRef = viewChild<ElementRef<HTMLElement>>('root');
  private teardown?: () => void;

  readonly resolvedPresentation = computed<GuideCharacterPresentation>(() => {
    if (this.presentation() !== 'stage') return this.presentation();
    if (this.compact()) return 'chip';
    if (this.hero()) return 'stage';
    return this.presentation();
  });

  readonly assetSrc = computed(() => GARY_PREMIUM_ASSETS[this.resolvedPresentation()]);
  protected readonly guideName = GUIDE_NAME;
  protected readonly appName = APP_NAME;

  constructor() {
    effect(() => {
      const mood = this.mood();
      const root = this.rootRef()?.nativeElement;
      if (root) applyGaryMood(root, mood);
    });
  }

  ngAfterViewInit(): void {
    const root = this.rootRef()?.nativeElement;
    if (!root) return;
    this.teardown = setupGaryAnimations(root);
    applyGaryMood(root, this.mood());
  }

  ngOnDestroy(): void {
    this.teardown?.();
  }
}
