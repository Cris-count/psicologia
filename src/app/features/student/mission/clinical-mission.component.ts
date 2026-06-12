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
import { IntentoEstudiante } from '../../../models/evaluation.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { EvaluationService } from '../../../services/evaluation.service';
import { NotificationService } from '../../../services/notification.service';
import { RubricGradingService } from '../../../services/rubric-grading.service';
import { SessionService } from '../../../services/session.service';
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
  scenarioContextTitle,
  scenarioContextBody,
} from './mission.builder';
import { MissionPhase, MissionZone, ZONE_THEMES } from './mission.types';
import { PlayerAnimState } from './student-hero.assets';

@Component({
  selector: 'app-clinical-mission',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MissionGameComponent, GameProgressComponent],
  styleUrl: './clinical-mission.component.css',
  template: `
    <div class="game-root" [class.game-root--in-scenario]="scenarioPanelOpen() || phase() === 'scenario-context'">
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
              @if (sessionTimer()) {
                <span class="map-objective-hud-progress">Tiempo: {{ sessionTimer() }}</span>
              }
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

          @if (phase() === 'intro') {
            <div class="game-overlay cutscene">
              <div class="cutscene-card case-intro-card">
                <span class="game-tag">Contexto del caso</span>
                <h2>{{ blueprint().introTitle }}</h2>
                <p class="case-intro-body">{{ blueprint().introContext }}</p>
                <button type="button" class="game-btn primary" (click)="enterWorld()">
                  Entrar al simulador
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

          @if (gradingInProgress()) {
            <div class="game-overlay">
              <div class="cutscene-card">
                <h2>Evaluando desempeño</h2>
                <p>Calificando según la rúbrica del docente…</p>
              </div>
            </div>
          }

          @if (phase() === 'mission-complete' && finalAttempt(); as attempt) {
            <div class="game-overlay win">
              <div class="cutscene-card final-result-card">
                <span class="material-symbols-outlined trophy">emoji_events</span>
                <h2>Resultado final</h2>
                <p class="final-case-name">{{ attempt.casoTitulo }}</p>
                <div class="final-grade">
                  <span class="final-grade-label">Nota</span>
                  <strong class="final-grade-value">{{ attempt.notaFinal.toFixed(1) }}</strong>
                  <span class="final-grade-scale">/ 5.0</span>
                </div>
                <dl class="final-stats">
                  <div><dt>Escenarios</dt><dd>{{ attempt.escenariosCompletados.join(' · ') }}</dd></div>
                  <div><dt>Preguntas</dt><dd>{{ attempt.totalPreguntas }}</dd></div>
                  <div><dt>Correctas</dt><dd class="ok">{{ attempt.respuestasCorrectas }}</dd></div>
                  <div><dt>Incorrectas</dt><dd class="bad">{{ attempt.respuestasIncorrectas }}</dd></div>
                  <div><dt>Acierto</dt><dd>{{ attempt.porcentaje }}%</dd></div>
                </dl>
                <p class="final-feedback">{{ attempt.retroalimentacion }}</p>
                @if (attempt.evaluacionRubrica?.metodo === 'rubrica' && attempt.evaluacionRubrica?.criterios?.length) {
                  <dl class="final-stats">
                    @for (c of attempt.evaluacionRubrica!.criterios!; track c.criterioId) {
                      <div>
                        <dt>{{ c.nombre }}</dt>
                        <dd>{{ c.puntaje.toFixed(1) }} / {{ c.maxPuntaje }} — {{ c.comentario }}</dd>
                      </div>
                    }
                  </dl>
                }
                @if (attempt.comentarioDocente) {
                  <p class="final-feedback">Comentario del docente: {{ attempt.comentarioDocente }}</p>
                }
                <button type="button" class="game-btn primary" (click)="abortMission()">Volver al hangar</button>
              </div>
            </div>
          } @else if (phase() === 'mission-complete') {
            <div class="game-overlay win">
              <div class="cutscene-card">
                <span class="material-symbols-outlined trophy">emoji_events</span>
                <h2>Misión completada</h2>
                <p>Has recorrido todas las zonas mentales.</p>
                <button type="button" class="game-btn primary" (click)="abortMission()">Volver al hangar</button>
              </div>
            </div>
          }
        </div>

        @if (scenarioPanelZone(); as zone) {
          <aside
            class="scenario-panel"
            [class.scenario-panel--open]="scenarioPanelOpen() || phase() === 'scenario-context'"
            aria-live="polite"
            [attr.aria-hidden]="!(scenarioPanelOpen() || phase() === 'scenario-context')"
          >
            <div class="scenario-panel-inner">
              <header class="scenario-panel-head">
                <span class="case-panel-tag">Escenario activo</span>
                <span class="scenario-panel-step">{{ zoneProgressFor(zone).done + 1 }}/{{ zoneProgressFor(zone).total || 1 }}</span>
              </header>
              <h3 class="case-panel-title">{{ scenarioContextTitle(zone) }}</h3>

              @if (phase() === 'scenario-context') {
                <p class="case-panel-context case-panel-context--intro">{{ scenarioContextBody(zone) }}</p>
                <div class="case-context-actions">
                  <button type="button" class="game-btn primary" (click)="startScenarioQuestions()">
                    Iniciar preguntas
                  </button>
                  <button type="button" class="game-btn ghost" (click)="closeScenarioContext()">
                    Volver al mapa
                  </button>
                </div>
              } @else if (panelFeedback(); as fb) {
                <div class="case-inline-feedback" [class.win]="fb.correct" [class.learn]="!fb.correct">
                  <span class="material-symbols-outlined" aria-hidden="true">{{ fb.correct ? 'check_circle' : 'info' }}</span>
                  <p>{{ fb.text }}</p>
                  @if (fb.correct) {
                    <span class="case-inline-next">Siguiente pregunta…</span>
                  } @else {
                    <button type="button" class="game-btn ghost case-continue-btn" (click)="continueAfterWrongAnswer()">
                      Continuar
                    </button>
                  }
                </div>
              } @else if (decisionOpen() && currentQuestion(); as question) {
                <p class="case-panel-context case-panel-context--compact">{{ zone.scenario.instructions }}</p>
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
  private readonly evaluation = inject(EvaluationService);
  private readonly sessions = inject(SessionService);
  private readonly rubricGrading = inject(RubricGradingService);
  private readonly notify = inject(NotificationService);
  protected readonly guide = inject(GuideService);
  protected readonly sfx = inject(GameSfxService);

  readonly phase = signal<MissionPhase>('intro');
  readonly activeZoneIndex = signal(-1);
  readonly decisionOpen = signal(false);
  readonly paused = signal(false);
  readonly lastFeedback = signal<{ correct: boolean; text: string } | null>(null);
  readonly missionResetToken = signal(0);

  readonly panelFeedback = signal<{ correct: boolean; text: string } | null>(null);
  readonly finalAttempt = signal<IntentoEstudiante | null>(null);
  readonly gradingInProgress = signal(false);
  /** Zona mostrada en el panel lateral; persiste brevemente al cerrar para la transición CSS. */
  readonly scenarioPanelZone = signal<MissionZone | null>(null);

  private advanceTimer: ReturnType<typeof setTimeout> | null = null;
  private panelCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private sessionTimerInterval: ReturnType<typeof setInterval> | null = null;
  private readonly timerTick = signal(0);

  readonly blueprint = computed(() => {
    const task = this.task();
    const situation = this.data.situationForTask(task);
    if (!situation) {
      return { introTitle: 'Misión', introContext: '', objective: '', difficulty: '', zones: [] as MissionZone[], totalQuestions: 0 };
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

  readonly sessionTimer = computed(() => {
    this.timerTick();
    return this.sessions.timerLabel(this.sessions.sessionForTask(this.task().id));
  });

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

  /** Panel lateral: contexto del escenario o preguntas activas. */
  readonly scenarioPanelOpen = computed(
    () => (this.phase() === 'decision' || this.phase() === 'scenario-context') && this.scenarioPanelZone() !== null,
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
    const activePhase = phase === 'decision' || phase === 'scenario-context';

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
    const resumeWithProgress = this.answeredIds().size > 0;
    if (resumeWithProgress) {
      this.phase.set('map');
      const next = this.nextPlayableZone();
      const dest = next ? zoneLabel(next) : 'el siguiente escenario';
      this.guide.show(`Continúa el recorrido. Ve a ${dest} y pulsa E en la puerta.`, 'encourage');
    } else {
      this.guide.show('Lee el contexto general del caso y pulsa «Entrar al simulador».', 'thinking');
    }
    this.sessionTimerInterval = setInterval(() => this.timerTick.update((n) => n + 1), 30_000);
  }

  ngOnDestroy(): void {
    this.clearAdvanceTimer();
    this.clearPanelCloseTimer();
    if (this.sessionTimerInterval) {
      clearInterval(this.sessionTimerInterval);
      this.sessionTimerInterval = null;
    }
    this.guide.setMissionActive(false);
    this.guide.setCasePanelActive(false);
  }

  constructor() {
    effect(() => {
      const phase = this.phase();
      const panelOpen = this.scenarioPanelOpen();
      this.guide.setCasePanelActive(panelOpen);

      if (phase === 'decision' || phase === 'scenario-context') {
        const q = this.currentQuestion();
        const zone = this.currentZone();
        if (q && zone && phase === 'decision') this.guide.setQuestionContext(q, zone.scenario);
      } else if (phase === 'map') {
        this.guide.setContext('student_task');
        this.guide.closeHintBubble();
      } else if (phase === 'intro') {
        this.guide.setContext('student_task', 'Lee el contexto general del caso antes de entrar al mapa.');
      }
    });
  }

  protected zoneLabel = zoneLabel;
  protected scenarioContextTitle = scenarioContextTitle;
  protected scenarioContextBody = scenarioContextBody;

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
    const student = this.auth.currentUser();
    const task = this.task();
    if (student) {
      const access = this.sessions.canStudentAccessTask(student.id, task.id);
      if (!access.allowed) {
        this.guide.show(access.reason ?? 'No puedes entrar al simulador.', 'encourage');
        return;
      }
    }
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
    this.decisionOpen.set(false);
    this.phase.set('scenario-context');
    this.guide.show(`Lee el contexto de ${zone.scenario.title} y pulsa «Iniciar preguntas».`, 'thinking');
  }

  startScenarioQuestions(): void {
    this.sfx.playClick();
    this.panelFeedback.set(null);
    this.decisionOpen.set(true);
    this.phase.set('decision');
    const zone = this.currentZone();
    const q = this.currentQuestion();
    if (q && zone) this.guide.setQuestionContext(q, zone.scenario);
    this.guide.show('Responde las preguntas del panel. No necesitas pulsar E.', 'encourage');
  }

  closeScenarioContext(): void {
    this.sfx.playClick();
    this.schedulePanelDismiss(() => {
      this.activeZoneIndex.set(-1);
      this.returnToMap();
    });
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
    this.guide.show('Respuesta registrada. Revisa la retroalimentación y continúa.', 'encourage');
    this.panelFeedback.set({ correct: false, text: question.feedback });
    this.decisionOpen.set(false);
  }

  continueAfterWrongAnswer(): void {
    this.sfx.playClick();
    this.panelFeedback.set(null);
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
      void this.finalizeMissionAttempt().then(() => {
        this.schedulePanelDismiss(() => {
          this.activeZoneIndex.set(-1);
          this.phase.set('mission-complete');
          this.guide.show('¡Misión completada! Revisa tu nota final.', 'happy');
        });
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

  private async finalizeMissionAttempt(): Promise<void> {
    const student = this.auth.currentUser();
    const task = this.task();
    const situation = this.data.situationForTask(task);
    if (!student || !situation) return;

    this.gradingInProgress.set(true);
    const answers = this.data.answersForStudentTask(student.id, task);
    let intento = this.evaluation.construirIntento({
      studentId: student.id,
      studentName: student.name,
      task,
      casoId: situation.id,
      casoTitulo: situation.title,
      zones: this.blueprint().zones,
      answers,
      data: this.data,
    });
    intento = await this.rubricGrading.applyRubricGrade(intento, situation);
    this.gradingInProgress.set(false);
    this.data.saveStudentAttempt(intento);
    this.finalAttempt.set(intento);
    void this.notify.notifyResultsReady(student.email, intento.casoTitulo, intento.notaFinal);
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

    if (!this.sessions.canStudentRetry(student.id, task.id)) {
      this.guide.show('El docente no autorizó reintentos para esta misión.', 'encourage');
      return;
    }

    this.clearAdvanceTimer();
    this.clearPanelCloseTimer();
    this.data.resetStudentTaskProgress(student.id, task.id);
    this.phase.set('intro');
    this.activeZoneIndex.set(-1);
    this.scenarioPanelZone.set(null);
    this.decisionOpen.set(false);
    this.paused.set(false);
    this.panelFeedback.set(null);
    this.lastFeedback.set(null);
    this.finalAttempt.set(null);
    this.guide.closeHintBubble();
    this.guide.setMissionActive(true);
    this.missionResetToken.update((n) => n + 1);
    this.guide.show('Simulador reiniciado. Lee el contexto del caso y pulsa «Entrar al simulador».', 'encourage');
    this.sfx.playClick();
  }
}
