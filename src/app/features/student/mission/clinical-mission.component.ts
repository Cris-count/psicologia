import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { GroupTask, Question } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';
import { APP_NAME } from '../../../core/branding.constants';
import { GuideService } from '../../../shared/guide/services/guide.service';
import { GameSfxService } from '../../../shared/services/game-sfx.service';
import { GameProgressComponent } from '../../../shared/ui/game-progress/game-progress.component';
import { MissionGameComponent } from './mission-game.component';
import { MissionGameState } from './mission-scene.types';
import { buildWorldMap } from './game2d/map.builder';
import {
  buildMissionBlueprint,
  isZoneUnlocked,
  missionProgressPercent,
  nextUnansweredQuestion,
  zoneLabel,
  zoneProgress,
} from './mission.builder';
import { MissionPhase, MissionZone, ZONE_THEMES } from './mission.types';
import { PlayerAnimState } from './student-hero.assets';

@Component({
  selector: 'app-clinical-mission',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MissionGameComponent, GameProgressComponent],
  styleUrl: './clinical-mission.component.css',
  template: `
    <div class="game-root" [class.game-root--in-scenario]="scenarioPanelOpen()">
      <header class="game-hud">
        <div class="game-hud-block">
          <span class="game-hud-tag">{{ appName }}</span>
          <strong>{{ groupName() }}</strong>
        </div>
        <div class="game-hud-block center">
          <span class="game-hud-label">Energía mental</span>
          <app-game-progress [value]="progressPercent()" [showLabel]="true" />
        </div>
        <div class="game-hud-block actions">
          <button type="button" class="game-btn" (click)="requestSituationHint()">Pista</button>
          <button type="button" class="game-btn" (click)="resetSimulator()">Reiniciar</button>
          <button type="button" class="game-btn danger" (click)="abortMission()">Abortar</button>
        </div>
      </header>

      <div class="game-body">
        <div class="game-stage" [class.game-stage--frozen]="!controlsEnabled()">
          <app-mission-game
            [state]="gameState()"
            (zoneReach)="onZoneReach($event)"
            (pauseToggle)="togglePause()"
          />

          @if (phase() === 'map' && !paused()) {
            <div class="map-objective-hud">
              <span class="map-objective-hud-tag">Caso activo</span>
              @if (nextPlayableZone(); as next) {
                <span class="map-objective-hud-dest">
                  <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
                  {{ zoneLabel(next) }}
                </span>
              } @else {
                <span class="map-objective-hud-dest">Explorando campus</span>
              }
              <span class="map-objective-hud-progress">{{ progressPercent() }}%</span>
            </div>
          }

          @if (phase() === 'map' && controlsEnabled() && !paused()) {
            <footer class="game-footer-hint">
              <span><kbd>← ↑ ↓ →</kbd> / <kbd>W A S D</kbd> mover</span>
              <span><kbd>E</kbd> entrar al edificio</span>
              <span><kbd>Esc</kbd> pausa</span>
            </footer>
          }

          @if (nearZoneHint() && !paused() && phase() === 'map') {
            <div class="game-prompt">Objetivo: {{ nearZoneHint() }} — acércate a la puerta y pulsa <kbd>E</kbd> para entrar</div>
          }

          @if (paused()) {
            <div class="game-overlay pause-menu">
              <div class="cutscene-card pause-card">
                <h2>Pausa</h2>
                <p>Mundo mental en suspensión.</p>
                <div class="pause-actions">
                  <button type="button" class="game-btn primary" (click)="togglePause()">Continuar</button>
                  <button type="button" class="game-btn danger" (click)="abortMission()">Abortar misión</button>
                </div>
              </div>
            </div>
          }

          @if (phase() === 'briefing') {
            <div class="game-overlay cutscene">
              <div class="cutscene-card">
                <span class="game-tag">Misión · {{ blueprint().difficulty }}</span>
                <h2>{{ blueprint().briefingTitle }}</h2>
                <p>{{ blueprint().briefingContext }}</p>
                <div class="objective-chip">
                  <span class="material-symbols-outlined">flag</span>
                  {{ blueprint().objective }}
                </div>
                <button type="button" class="game-btn primary" (click)="enterWorld()">
                  Entrar al mapa
                </button>
              </div>
            </div>
          }

          @if (phase() === 'decision' && decisionOpen() && currentQuestion(); as question) {
            <div class="game-decision-layer mobile-only">
              <div class="decision-holo-bar">
                <span class="material-symbols-outlined">psychology</span>
                <div>
                  <small>{{ currentZone() ? zoneLabel(currentZone()!) : '' }} · +{{ question.points }} pts</small>
                  <p>{{ question.statement }}</p>
                </div>
              </div>
              <div class="action-wheel">
                @for (option of optionsFor(question.id); track option.id; let i = $index) {
                  <button
                    type="button"
                    class="action-slot"
                    [style.--slot-i]="i"
                    (mouseenter)="sfx.playHover()"
                    (click)="pickOption(question, option.id)"
                  >
                    <span class="action-key">{{ choiceLabel(i) }}</span>
                    <span class="action-label">{{ option.text }}</span>
                  </button>
                }
              </div>
              <button type="button" class="game-btn ghost" (click)="requestQuestionHint(question)">
                Consultar a GARY
              </button>
            </div>
          }

          @if (phase() === 'feedback' && lastFeedback(); as fb) {
            <div class="game-overlay" [class.win]="fb.correct" [class.learn]="!fb.correct">
              <div class="cutscene-card feedback-card">
                <h2>{{ fb.correct ? '¡Análisis acertado!' : 'Ruta alternativa' }}</h2>
                <p>{{ fb.text }}</p>
                <button type="button" class="game-btn primary" (click)="continueAfterFeedback()">Avanzar</button>
              </div>
            </div>
          }

          @if (phase() === 'mission-complete') {
            <div class="game-overlay win">
              <div class="cutscene-card">
                <span class="material-symbols-outlined trophy">emoji_events</span>
                <h2>Misión completada</h2>
                <p>Has recorrido todas las zonas mentales. GARY registra tu progreso.</p>
                <app-game-progress [value]="100" [showLabel]="true" />
                <button type="button" class="game-btn primary" (click)="abortMission()">Volver al hangar</button>
              </div>
            </div>
          }
        </div>

        @if (scenarioPanelZone(); as zone) {
          <aside
            class="scenario-panel"
            [class.scenario-panel--open]="scenarioPanelOpen()"
            aria-live="polite"
            [attr.aria-hidden]="!scenarioPanelOpen()"
          >
            <div class="scenario-panel-inner">
              <header class="scenario-panel-head">
                <span class="case-panel-tag">Escenario activo</span>
                <span class="scenario-panel-step">{{ zoneProgressFor(zone).done + 1 }}/{{ zoneProgressFor(zone).total || 1 }}</span>
              </header>
              <h3 class="case-panel-title">{{ zone.scenario.title }}</h3>
              <p class="case-panel-context">{{ zone.scenario.context }}</p>

              @if (panelFeedback(); as fb) {
                <div class="case-inline-feedback" [class.win]="fb.correct" [class.learn]="!fb.correct">
                  <span class="material-symbols-outlined" aria-hidden="true">{{ fb.correct ? 'check_circle' : 'info' }}</span>
                  <p>{{ fb.text }}</p>
                  @if (fb.correct) {
                    <span class="case-inline-next">Siguiente pregunta…</span>
                  }
                </div>
              } @else if (decisionOpen() && currentQuestion(); as question) {
                <div class="case-question">
                  <span class="case-label">Pregunta {{ zoneProgressFor(zone).done + 1 }} de {{ zoneProgressFor(zone).total }}</span>
                  <p>{{ question.statement }}</p>
                  <div class="case-options">
                    @for (option of optionsFor(question.id); track option.id; let i = $index) {
                      <button
                        type="button"
                        class="case-option"
                        (mouseenter)="sfx.playHover()"
                        (click)="pickOption(question, option.id)"
                      >
                        <span class="case-option-key">{{ choiceLabel(i) }}</span>
                        <span>{{ option.text }}</span>
                      </button>
                    }
                  </div>
                  <button type="button" class="game-btn ghost case-hint" (click)="requestQuestionHint(question)">
                    Consultar pista
                  </button>
                  @if (guide.hintBubbleOpen() && guide.message()) {
                    <div class="case-gary-hint" role="note">
                      <div class="case-gary-hint-head">
                        <span class="case-gary-hint-label">Consejo de Gary</span>
                        <button type="button" class="case-gary-hint-close" (click)="guide.closeHintBubble()" aria-label="Cerrar consejo">×</button>
                      </div>
                      <p>{{ guide.message() }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </aside>
        }
      </div>
    </div>
  `,
})
export class ClinicalMissionComponent implements OnInit, OnDestroy {
  readonly task = input.required<GroupTask>();
  readonly groupName = input('');
  readonly exitMission = output<void>();
  /** Callback para carga dinámica del componente */
  readonly onExit = input<(() => void) | undefined>();

  protected readonly appName = APP_NAME;

  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);
  protected readonly guide = inject(GuideService);
  protected readonly sfx = inject(GameSfxService);

  readonly phase = signal<MissionPhase>('briefing');
  readonly activeZoneIndex = signal(-1);
  readonly decisionOpen = signal(false);
  readonly paused = signal(false);
  readonly lastFeedback = signal<{ correct: boolean; text: string } | null>(null);
  readonly missionResetToken = signal(0);

  readonly panelFeedback = signal<{ correct: boolean; text: string } | null>(null);
  /** Zona mostrada en el panel lateral; persiste brevemente al cerrar para la transición CSS. */
  readonly scenarioPanelZone = signal<MissionZone | null>(null);

  private advanceTimer: ReturnType<typeof setTimeout> | null = null;
  private panelCloseTimer: ReturnType<typeof setTimeout> | null = null;

  readonly blueprint = computed(() => {
    const task = this.task();
    const situation = this.data.situationForTask(task);
    if (!situation) {
      return { briefingTitle: 'Misión', briefingContext: '', objective: '', difficulty: '', zones: [] as MissionZone[], totalQuestions: 0 };
    }
    return buildMissionBlueprint(task, situation, this.data);
  });

  readonly answeredIds = computed(() => {
    this.data.store();
    const student = this.auth.currentUser();
    if (!student) return new Set<string>();
    const ids = new Set<string>();
    for (const zone of this.blueprint().zones) {
      for (const q of zone.questions) {
        if (this.data.answerForQuestion(student.id, q.id)) ids.add(q.id);
      }
    }
    return ids;
  });

  readonly progressPercent = computed(() => missionProgressPercent(this.blueprint().zones, this.answeredIds()));
  readonly currentZone = computed(() => {
    const idx = this.activeZoneIndex();
    if (idx < 0) return null;
    return this.blueprint().zones.find((z) => z.index === idx) ?? null;
  });
  readonly currentQuestion = computed(() => {
    const zone = this.currentZone();
    return zone ? nextUnansweredQuestion(zone, this.answeredIds()) : null;
  });

  readonly controlsEnabled = computed(() => this.phase() === 'map');

  /** Panel de preguntas solo dentro de un escenario activo (Hospital, Comisaría, etc.). */
  readonly scenarioPanelOpen = computed(
    () => this.phase() === 'decision' && this.scenarioPanelZone() !== null,
  );

  readonly playerAnim = computed((): PlayerAnimState => {
    switch (this.phase()) {
      case 'decision':
        return 'think';
      case 'feedback':
        return this.lastFeedback()?.correct ? 'celebrate' : 'think';
      case 'mission-complete':
        return 'celebrate';
      default:
        return 'idle';
    }
  });

  readonly gameState = computed((): MissionGameState => {
    const phase = this.phase();
    const zones = this.blueprint().zones;
    const answered = this.answeredIds();
    const activeIdx = this.activeZoneIndex();
    const current = this.currentZone();
    const situation = this.data.situationForTask(this.task());
    const activePhase = phase === 'decision';

    const world = situation
      ? buildWorldMap(
          situation,
          zones,
          (i) => isZoneUnlocked(zones, i, answered),
          (i) => zoneProgress(zones[i], answered).complete,
          activeIdx,
          activePhase,
        )
      : null;

    return {
      phase,
      playerX: 0,
      playerY: 0,
      accent: current ? ZONE_THEMES[current.theme].accent : '#4fc3ff',
      playerAnim: this.playerAnim(),
      controlsEnabled: this.controlsEnabled(),
      showDecisionHolo: false,
      paused: this.paused(),
      world,
      objectiveZoneIndex: this.nextPlayableZone()?.index ?? -1,
      missionResetToken: this.missionResetToken(),
      zones: zones.map((z) => ({
        mapX: z.mapX,
        mapY: z.mapY,
        accent: ZONE_THEMES[z.theme].accent,
        label: ZONE_THEMES[z.theme].label,
        unlocked: isZoneUnlocked(zones, z.index, answered),
        active: z.index === activeIdx && activePhase,
        complete: zoneProgress(z, answered).complete,
      })),
    };
  });

  readonly zonesCompleted = computed(() => {
    const zones = this.blueprint().zones;
    const answered = this.answeredIds();
    return zones.filter((z) => zoneProgress(z, answered).complete).length;
  });

  readonly zoneProgressPercent = computed(() => {
    const total = this.blueprint().zones.length;
    if (!total) return 0;
    return Math.round((this.zonesCompleted() / total) * 100);
  });

  readonly nearZoneHint = computed(() => {
    if (this.phase() !== 'map') return null;
    const next = this.nextPlayableZone();
    return next ? next.scenario.title : null;
  });

  readonly nextPlayableZone = computed(() => {
    const zones = this.blueprint().zones;
    const answered = this.answeredIds();
    return zones.find((z) => isZoneUnlocked(zones, z.index, answered) && !zoneProgress(z, answered).complete) ?? null;
  });

  ngOnInit(): void {
    this.guide.setMissionActive(true);
    console.log('Clinical mission component loaded · task:', this.task().id);
  }

  ngOnDestroy(): void {
    this.clearAdvanceTimer();
    this.clearPanelCloseTimer();
    this.guide.setMissionActive(false);
    this.guide.setCasePanelActive(false);
  }

  constructor() {
    effect(() => {
      const phase = this.phase();
      const panelOpen = this.scenarioPanelOpen();
      this.guide.setCasePanelActive(panelOpen);

      if (phase === 'decision') {
        const q = this.currentQuestion();
        const zone = this.currentZone();
        if (q && zone) this.guide.setQuestionContext(q, zone.scenario);
      } else if (phase === 'map') {
        this.guide.setContext('student_task');
        this.guide.closeHintBubble();
      } else if (phase === 'briefing') {
        this.guide.setContext('student_task', 'Briefing activo. Usa el mapa para recorrer la ciudad.');
      }
    });
  }

  protected zoneLabel = zoneLabel;

  protected zoneProgressFor(zone: MissionZone) {
    return zoneProgress(zone, this.answeredIds());
  }

  optionsFor(questionId: string) {
    return this.data.optionsForQuestion(questionId);
  }

  choiceLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  enterWorld(): void {
    this.sfx.playClick();
    this.activeZoneIndex.set(-1);
    this.scenarioPanelZone.set(null);
    this.phase.set('map');
    this.decisionOpen.set(false);
    const next = this.nextPlayableZone();
    const dest = next ? zoneLabel(next) : 'el hospital';
    this.guide.show(`Recorre el mapa hasta ${dest}. Pulsa E en la puerta para entrar al escenario.`, 'encourage');
  }

  onZoneReach(index: number): void {
    if (this.phase() !== 'map') return;
    const next = this.nextPlayableZone();
    if (!next || next.index !== index) return;
    const zone = this.blueprint().zones.find((z) => z.index === index);
    if (!zone || zoneProgress(zone, this.answeredIds()).complete) return;

    this.sfx.playClick();
    this.clearPanelCloseTimer();
    this.activeZoneIndex.set(index);
    this.scenarioPanelZone.set(zone);
    this.panelFeedback.set(null);
    this.lastFeedback.set(null);
    this.guide.closeHintBubble();
    this.decisionOpen.set(true);
    this.phase.set('decision');
    this.guide.show(`Escenario: ${zone.scenario.title}. Responde las preguntas del panel.`, 'thinking');
  }

  isZoneOpen(index: number): boolean {
    return isZoneUnlocked(this.blueprint().zones, index, this.answeredIds());
  }

  requestQuestionHint(question: Question): void {
    this.guide.setVisible(true);
    const zone = this.currentZone();
    if (zone) this.guide.setQuestionContext(question, zone.scenario);
    this.guide.requestHint();
  }

  pickOption(question: Question, optionId: string): void {
    const student = this.auth.currentUser();
    const task = this.task();
    if (!student) return;

    this.sfx.playClick();
    this.data.answerQuestion(student.id, task.id, question.id, optionId);
    const ans = this.data.answerForQuestion(student.id, question.id);
    const zone = this.currentZone();
    this.guide.closeHintBubble();

    if (ans?.isCorrect) {
      this.sfx.playSuccess();
      this.decisionOpen.set(false);
      this.panelFeedback.set({ correct: true, text: question.feedback });
      this.guide.show('¡Buen análisis! Siguiente pregunta…', 'happy');

      const next = zone ? nextUnansweredQuestion(zone, this.answeredIds()) : null;
      this.clearAdvanceTimer();
      this.advanceTimer = setTimeout(() => {
        this.panelFeedback.set(null);
        if (next) {
          this.decisionOpen.set(true);
          this.phase.set('decision');
        } else {
          this.completeCurrentZone();
        }
      }, 1500);
      return;
    }

    this.sfx.playError();
    this.guide.show('Otra ruta posible — revisa la retroalimentación.', 'encourage');
    this.lastFeedback.set({ correct: false, text: question.feedback });
    this.decisionOpen.set(false);
    this.phase.set('feedback');
  }

  continueAfterFeedback(): void {
    this.sfx.playClick();
    this.lastFeedback.set(null);
    const zone = this.currentZone();
    if (!zone) {
      this.returnToMap();
      return;
    }
    const next = nextUnansweredQuestion(zone, this.answeredIds());
    if (next) {
      this.decisionOpen.set(true);
      this.phase.set('decision');
      return;
    }
    this.completeCurrentZone();
  }

  private completeCurrentZone(): void {
    const zone = this.currentZone();
    this.panelFeedback.set(null);
    this.returnToMap();

    if (this.progressPercent() >= 100) {
      this.schedulePanelDismiss(() => {
        this.activeZoneIndex.set(-1);
        this.phase.set('mission-complete');
        this.guide.show('¡Misión completada!', 'happy');
      });
      return;
    }

    const next = this.nextPlayableZone();
    this.schedulePanelDismiss(() => this.activeZoneIndex.set(-1));
    if (zone) {
      this.guide.show(
        next
          ? `Escenario completado: ${zone.scenario.title}. Ve a ${zoneLabel(next)}.`
          : `Escenario completado: ${zone.scenario.title}.`,
        'happy',
      );
    }
  }

  private schedulePanelDismiss(after?: () => void): void {
    this.clearPanelCloseTimer();
    this.panelCloseTimer = setTimeout(() => {
      this.scenarioPanelZone.set(null);
      this.panelCloseTimer = null;
      after?.();
    }, 440);
  }

  private clearPanelCloseTimer(): void {
    if (this.panelCloseTimer) {
      clearTimeout(this.panelCloseTimer);
      this.panelCloseTimer = null;
    }
  }

  private returnToMap(): void {
    this.phase.set('map');
    this.decisionOpen.set(false);
    this.panelFeedback.set(null);
    this.lastFeedback.set(null);
    this.guide.closeHintBubble();
  }

  private clearAdvanceTimer(): void {
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
  }

  requestSituationHint(): void {
    const situation = this.data.situationForTask(this.task());
    if (situation) this.guide.situationHint(situation.context);
  }

  togglePause(): void {
    this.paused.update((p) => !p);
    this.sfx.playClick();
  }

  abortMission(): void {
    const handler = this.onExit();
    if (handler) handler();
    else this.exitMission.emit();
  }

  resetSimulator(): void {
    const student = this.auth.currentUser();
    const task = this.task();
    if (!student) return;

    this.clearAdvanceTimer();
    this.clearPanelCloseTimer();
    this.data.resetStudentTaskProgress(student.id, task.id);
    this.phase.set('briefing');
    this.activeZoneIndex.set(-1);
    this.scenarioPanelZone.set(null);
    this.decisionOpen.set(false);
    this.paused.set(false);
    this.panelFeedback.set(null);
    this.lastFeedback.set(null);
    this.guide.closeHintBubble();
    this.guide.setMissionActive(true);
    this.missionResetToken.update((n) => n + 1);
    this.guide.show('Simulador reiniciado. Pulsa «Entrar al mapa» para empezar de nuevo.', 'encourage');
    this.sfx.playClick();
  }
}
