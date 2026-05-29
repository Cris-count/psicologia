import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import {
  buildMissionBlueprint,
  isZoneUnlocked,
  missionProgressPercent,
  nextUnansweredQuestion,
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
    <div class="game-root">
      <app-mission-game
        [state]="gameState()"
        (zoneReach)="onZoneReach($event)"
        (interactNode)="openDecision()"
        (pauseToggle)="togglePause()"
      />

      <!-- HUD gaming -->
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
          <button type="button" class="game-btn danger" (click)="exitMission.emit()">Abortar</button>
        </div>
      </header>

      @if (phase() === 'map' && controlsEnabled() && !paused()) {
        <div class="game-controls-hint">
          <kbd>W A S D</kbd> mover · <kbd>Shift</kbd> correr · <kbd>Space</kbd>/<kbd>E</kbd> interactuar · <kbd>Esc</kbd> pausa
        </div>
      }

      @if (paused()) {
        <div class="game-overlay pause-menu">
          <div class="cutscene-card pause-card">
            <h2>Pausa</h2>
            <p>Mundo mental en suspensión.</p>
            <div class="pause-actions">
              <button type="button" class="game-btn primary" (click)="togglePause()">Continuar</button>
              <button type="button" class="game-btn danger" (click)="exitMission.emit()">Abortar misión</button>
            </div>
          </div>
        </div>
      }

      @if (nearZoneHint() && !paused()) {
        <div class="game-prompt">Zona cercana: {{ nearZoneHint() }} — <kbd>Space</kbd> o <kbd>E</kbd></div>
      }

      <!-- Briefing cinematográfico -->
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
              Entrar al mundo mental
            </button>
          </div>
        </div>
      }

      <!-- Entrada a zona -->
      @if (phase() === 'zone-intro' && currentZone(); as zone) {
        <div class="game-overlay cutscene">
          <div class="cutscene-card zone-card">
            <span class="game-tag">{{ zoneTheme(zone).label }}</span>
            <h2>{{ zone.scenario.title }}</h2>
            <p>{{ zone.scenario.context }}</p>
            <p class="zone-brief">{{ zone.scenario.instructions }}</p>
            <button type="button" class="game-btn primary" (click)="startZoneDecisions()">
              Iniciar evento mental
            </button>
          </div>
        </div>
      }

      <!-- Rueda de decisiones (NO formulario) -->
      @if (phase() === 'decision' && decisionOpen() && currentQuestion(); as question) {
        <div class="game-decision-layer">
          <div class="decision-holo-bar">
            <span class="material-symbols-outlined">psychology</span>
            <div>
              <small>{{ currentZone() ? zoneTheme(currentZone()!).label : '' }} · +{{ question.points }} XP</small>
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

      @if (phase() === 'decision' && !decisionOpen() && !paused()) {
        <div class="game-prompt center">Acércate al holograma mental — <kbd>Space</kbd> o <kbd>E</kbd></div>
      }

      <!-- Feedback -->
      @if (phase() === 'feedback' && lastFeedback(); as fb) {
        <div class="game-overlay" [class.win]="fb.correct" [class.learn]="!fb.correct">
          <div class="cutscene-card feedback-card">
            <h2>{{ fb.correct ? '¡Análisis acertado!' : 'Ruta alternativa' }}</h2>
            <p>{{ fb.text }}</p>
            <button type="button" class="game-btn primary" (click)="continueAfterFeedback()">Avanzar</button>
          </div>
        </div>
      }

      <!-- Completado -->
      @if (phase() === 'mission-complete') {
        <div class="game-overlay win">
          <div class="cutscene-card">
            <span class="material-symbols-outlined trophy">emoji_events</span>
            <h2>Misión completada</h2>
            <p>Has recorrido todas las zonas mentales. GARY registra tu progreso.</p>
            <app-game-progress [value]="100" [showLabel]="true" />
            <button type="button" class="game-btn primary" (click)="exitMission.emit()">Volver al hangar</button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ClinicalMissionComponent {
  readonly task = input.required<GroupTask>();
  readonly groupName = input('');
  readonly exitMission = output<void>();

  protected readonly appName = APP_NAME;

  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);
  private readonly guide = inject(GuideService);
  protected readonly sfx = inject(GameSfxService);

  readonly phase = signal<MissionPhase>('briefing');
  readonly activeZoneIndex = signal(0);
  readonly decisionOpen = signal(false);
  readonly paused = signal(false);
  readonly lastFeedback = signal<{ correct: boolean; text: string } | null>(null);
  readonly mapPlayerPos = signal({ x: 12, y: 72 });

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
  readonly currentZone = computed(() => this.blueprint().zones[this.activeZoneIndex()] ?? null);
  readonly currentQuestion = computed(() => {
    const zone = this.currentZone();
    return zone ? nextUnansweredQuestion(zone, this.answeredIds()) : null;
  });

  readonly controlsEnabled = computed(() => {
    const p = this.phase();
    if (p === 'map') return true;
    if (p === 'decision' && !this.decisionOpen()) return true;
    return false;
  });

  readonly playerAnim = computed((): PlayerAnimState => {
    switch (this.phase()) {
      case 'decision':
        return this.decisionOpen() ? 'interact' : 'walk';
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
    const pos = this.mapPlayerPos();
    return {
      phase,
      playerX: pos.x,
      playerY: pos.y,
      accent: current ? ZONE_THEMES[current.theme].accent : '#4fc3ff',
      playerAnim: this.playerAnim(),
      controlsEnabled: this.controlsEnabled(),
      showDecisionHolo: phase === 'decision' || phase === 'zone-intro',
      paused: this.paused(),
      zones: zones.map((z) => ({
        mapX: z.mapX,
        mapY: z.mapY,
        accent: ZONE_THEMES[z.theme].accent,
        label: ZONE_THEMES[z.theme].label,
        unlocked: isZoneUnlocked(zones, z.index, answered),
        active: z.index === activeIdx && (phase === 'zone-intro' || phase === 'decision'),
        complete: zoneProgress(z, answered).complete,
      })),
    };
  });

  readonly nearZoneHint = computed(() => {
    if (this.phase() !== 'map') return null;
    const next = this.nextPlayableZone();
    return next ? ZONE_THEMES[next.theme].label : null;
  });

  readonly nextPlayableZone = computed(() => {
    const zones = this.blueprint().zones;
    const answered = this.answeredIds();
    return zones.find((z) => isZoneUnlocked(zones, z.index, answered) && !zoneProgress(z, answered).complete) ?? null;
  });

  constructor() {
    effect(() => {
      const phase = this.phase();
      if (phase === 'decision') {
        const q = this.currentQuestion();
        const zone = this.currentZone();
        if (q && zone) this.guide.setQuestionContext(q, zone.scenario);
      } else if (phase === 'map') {
        this.guide.setContext('student_task');
      } else if (phase === 'briefing') {
        this.guide.setContext('student_task', 'Briefing activo. GARY te acompaña en el mundo mental.');
      }
    });
  }

  zoneTheme(zone: MissionZone) {
    return ZONE_THEMES[zone.theme];
  }

  optionsFor(questionId: string) {
    return this.data.optionsForQuestion(questionId);
  }

  choiceLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  enterWorld(): void {
    this.sfx.playClick();
    const start = this.nextPlayableZone() ?? this.blueprint().zones[0];
    if (start) {
      this.mapPlayerPos.set({ x: start.mapX - 4, y: start.mapY + 8 });
      this.activeZoneIndex.set(start.index);
    }
    this.phase.set('map');
    this.guide.show('Explora el mundo mental. Camina hasta una zona y pulsa E para entrar.', 'encourage');
  }

  onZoneReach(index: number): void {
    if (!this.isZoneOpen(index)) return;
    this.sfx.playClick();
    this.activeZoneIndex.set(index);
    const zone = this.blueprint().zones[index];
    if (!zone) return;
    if (zoneProgress(zone, this.answeredIds()).complete) return;
    this.mapPlayerPos.set({ x: zone.mapX - 4, y: zone.mapY + 8 });
    this.phase.set('zone-intro');
    this.guide.show(`Entrando a ${ZONE_THEMES[zone.theme].label}.`, 'thinking');
  }

  isZoneOpen(index: number): boolean {
    return isZoneUnlocked(this.blueprint().zones, index, this.answeredIds());
  }

  startZoneDecisions(): void {
    this.sfx.playClick();
    this.decisionOpen.set(false);
    if (this.currentQuestion()) {
      this.phase.set('decision');
    } else {
      this.phase.set('map');
    }
  }

  openDecision(): void {
    if (this.phase() !== 'decision' || this.decisionOpen()) return;
    this.sfx.playClick();
    this.decisionOpen.set(true);
  }

  pickOption(question: Question, optionId: string): void {
    const student = this.auth.currentUser();
    const task = this.task();
    if (!student) return;

    this.sfx.playClick();
    this.data.answerQuestion(student.id, task.id, question.id, optionId);
    const ans = this.data.answerForQuestion(student.id, question.id);
    if (ans?.isCorrect) this.sfx.playSuccess();
    else this.sfx.playError();

    this.guide.show(ans?.isCorrect ? '¡Buen análisis!' : 'Otra ruta posible — revisa la retroalimentación.', ans?.isCorrect ? 'happy' : 'encourage');
    this.lastFeedback.set({ correct: ans?.isCorrect ?? false, text: question.feedback });
    this.decisionOpen.set(false);
    this.phase.set('feedback');
  }

  continueAfterFeedback(): void {
    this.sfx.playClick();
    const zone = this.currentZone();
    if (!zone) {
      this.phase.set('map');
      return;
    }
    if (nextUnansweredQuestion(zone, this.answeredIds())) {
      this.decisionOpen.set(false);
      this.phase.set('decision');
      return;
    }
    this.guide.show(`Zona ${ZONE_THEMES[zone.theme].label} completada.`, 'happy');
    const allDone = this.progressPercent() >= 100;
    if (allDone) {
      this.phase.set('mission-complete');
      this.guide.show('¡Misión completada!', 'happy');
    } else {
      this.phase.set('map');
    }
  }

  requestQuestionHint(question: Question): void {
    const zone = this.currentZone();
    if (zone) this.guide.setQuestionContext(question, zone.scenario);
    this.guide.requestHint();
  }

  requestSituationHint(): void {
    const situation = this.data.situationForTask(this.task());
    if (situation) this.guide.situationHint(situation.context);
  }

  togglePause(): void {
    this.paused.update((p) => !p);
    this.sfx.playClick();
  }
}
