import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { APP_NAME, GUIDE_NAME, GUIDE_TITLE } from '../../../../core/branding.constants';
import { GuideCharacterComponent } from '../guide-character/guide-character.component';
import { GuideCharacterPresentation } from '../guide-character/guide-character.types';
import { GuideService } from '../../services/guide.service';
import { GUIDE_SCROLL_ROOT } from './guide-scroll-context';
import {
  attachGuideScrollCompanion,
  nudgeGuideScrollCompanion,
  setGuideScrollSpeaking,
} from './guide-scroll-companion';

@Component({
  selector: 'app-guide-assistant',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './guide-assistant.component.css',
  host: {
    '[class.guide-dock-right]': 'dock() === "right"',
    '[class.guide-dock-left]': 'dock() === "left"',
    '[class.guide-presence-student]': 'presence() === "student"',
  },
  imports: [GuideCharacterComponent],
  template: `
    @if (guide.visible()) {
      <aside
        #scene
        class="guide-npc-scene"
        [class.dock-right]="dock() === 'right'"
        [class.guide-inline]="inline()"
        [class.guide-hero-scene]="hero()"
        [class.guide-scroll-companion]="scrollCompanionActive()"
        role="complementary"
        [attr.aria-label]="guideName + ', guía de ' + appName"
      >
        <!-- Personaje libre en la escena (sin caja) -->
        <div class="guide-npc-presence" aria-hidden="false">
          <div class="guide-npc-floor-glow" aria-hidden="true"></div>
          <app-guide-character [mood]="guide.displayMood()" [presentation]="presentation()" />
        </div>

        <!-- Burbuja de diálogo separada -->
        @if (displayedText() || isTyping()) {
          <div
            class="guide-speech-bubble"
            [class.bubble-speaking]="isTyping() || speakingPulse()"
            role="region"
            aria-live="polite"
          >
            @if (!inline()) {
              <button type="button" class="bubble-dismiss" (click)="guide.setVisible(false)" aria-label="Ocultar guía">×</button>
            }

            <div class="bubble-inner">
              <span class="bubble-label">{{ guideName }}</span>
              <p class="bubble-text">
                {{ displayedText() }}@if (isTyping()) {<span class="bubble-cursor" aria-hidden="true"></span>}
              </p>
              @if (showHintButton() && !isTyping()) {
                <button type="button" class="bubble-hint" (click)="onHint()">
                  <span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>
                  Pista
                </button>
              }
              <ng-content />
            </div>
            <span class="bubble-tail" aria-hidden="true"></span>
          </div>
        }
      </aside>
    } @else if (showFab()) {
      <button type="button" class="guide-fab" (click)="guide.setVisible(true)" [attr.aria-label]="'Mostrar guía ' + guideName">
        <span class="material-symbols-outlined" aria-hidden="true">smart_toy</span>
      </button>
    }
  `,
})
export class GuideAssistantComponent implements OnDestroy {
  protected readonly guide = inject(GuideService);
  protected readonly appName = APP_NAME;
  protected readonly guideName = GUIDE_NAME;
  protected readonly guideTitle = GUIDE_TITLE;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly resolveScrollRoot = inject(GUIDE_SCROLL_ROOT, { optional: true });
  private readonly sceneRef = viewChild<ElementRef<HTMLElement>>('scene');

  readonly dock = input<'left' | 'right'>('right');
  /** `student` = escala compacta + movimiento dinámico con scroll */
  readonly presence = input<'standard' | 'student'>('standard');
  readonly inline = input(false);
  readonly compact = input(false);
  readonly hero = input(false);
  readonly showHintButton = input(false);
  readonly showFab = input(true);

  readonly presentation = computed<GuideCharacterPresentation>(() => {
    if (this.hero()) return 'stage';
    if (this.compact()) return 'chip';
    return 'assistant';
  });

  readonly scrollCompanionActive = computed(
    () => this.presence() === 'student' && !this.inline() && isPlatformBrowser(this.platformId),
  );

  readonly hintRequested = output<void>();

  readonly displayedText = signal('');
  readonly isTyping = signal(false);
  readonly speakingPulse = signal(false);

  private typingTimer: ReturnType<typeof setInterval> | null = null;
  private pulseTimer: ReturnType<typeof setTimeout> | null = null;
  private detachScrollCompanion?: () => void;
  /** DOM node with active scroll companion — plain ref to avoid effect feedback loops. */
  private companionSceneEl: HTMLElement | null = null;

  constructor() {
    effect(() => {
      this.startTyping(this.guide.message());
    });

    effect(() => {
      const speaking = this.isTyping() || this.speakingPulse();
      setGuideScrollSpeaking(this.companionSceneEl ?? undefined, speaking);
    });

    effect(() => {
      const context = this.guide.context();
      if (this.companionSceneEl) nudgeGuideScrollCompanion(this.companionSceneEl);
      void context;
    });

    effect(() => {
      const message = this.guide.message();
      if (this.companionSceneEl && message) nudgeGuideScrollCompanion(this.companionSceneEl);
      void message;
    });

    effect((onCleanup) => {
      const active = this.scrollCompanionActive() && this.guide.visible();
      const scene = this.sceneRef()?.nativeElement ?? null;

      if (!active || !scene) {
        this.destroyScrollCompanion();
        onCleanup(() => this.destroyScrollCompanion());
        return;
      }

      if (this.companionSceneEl === scene && this.detachScrollCompanion) return;

      this.destroyScrollCompanion();
      this.companionSceneEl = scene;
      this.detachScrollCompanion = attachGuideScrollCompanion(scene, {
        maxLift: this.hero() ? 140 : 168,
        parallaxRatio: 0.22,
        smoothness: 0.085,
        scrollRoot: this.resolveScrollRoot?.() ?? document.body,
      });

      onCleanup(() => this.destroyScrollCompanion());
    });
  }

  private destroyScrollCompanion(): void {
    this.detachScrollCompanion?.();
    this.detachScrollCompanion = undefined;
    this.companionSceneEl = null;
  }

  ngOnDestroy(): void {
    this.destroyScrollCompanion();
    this.clearTyping();
    if (this.pulseTimer) clearTimeout(this.pulseTimer);
  }

  onHint(): void {
    this.guide.requestHint();
    this.hintRequested.emit();
  }

  private startTyping(full: string): void {
    this.clearTyping();
    if (!full) {
      this.displayedText.set('');
      return;
    }

    this.isTyping.set(true);
    this.speakingPulse.set(true);
    this.displayedText.set('');

    let index = 0;
    const speed = full.length > 120 ? 12 : 22;

    this.typingTimer = setInterval(() => {
      index += 1;
      this.displayedText.set(full.slice(0, index));
      if (index >= full.length) {
        this.clearTyping();
        this.isTyping.set(false);
        if (this.pulseTimer) clearTimeout(this.pulseTimer);
        this.pulseTimer = setTimeout(() => this.speakingPulse.set(false), 1000);
      }
    }, speed);
  }

  private clearTyping(): void {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  }
}
