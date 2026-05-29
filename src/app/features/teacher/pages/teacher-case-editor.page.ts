import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  Difficulty,
  QuestionCategory,
  QuestionType,
  Situation,
  SituationCategory,
} from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-case-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Constructor de simulación</p>
        <h2>{{ isNew() ? 'Nuevo caso psicológico' : 'Editar caso' }}</h2>
      </div>
      <a class="ghost-button" routerLink="/teacher/casos">← Volver a casos</a>
    </header>

    <nav class="editor-tabs" aria-label="Secciones del editor">
      @for (tab of tabs; track tab.id) {
        <button type="button" [class.active]="activeTab() === tab.id" (click)="activeTab.set(tab.id)">
          {{ tab.label }}
        </button>
      }
    </nav>

    @if (activeTab() === 'info') {
      <article class="panel editor-panel">
        <h3>Información del caso</h3>
        <form class="stack-form" (ngSubmit)="saveInfo()">
          <label>Título <input [(ngModel)]="title" name="title" required /></label>
          <label>Descripción <textarea [(ngModel)]="description" name="description"></textarea></label>
          <label>Contexto psicológico <textarea [(ngModel)]="context" name="context"></textarea></label>
          <label>Objetivo de aprendizaje <textarea [(ngModel)]="learningObjective" name="objective"></textarea></label>
          <label>Recursos adicionales <textarea [(ngModel)]="resources" name="resources"></textarea></label>
          <div class="form-row">
            <label>Categoría
              <select [(ngModel)]="category" name="category">
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </label>
            <label>Dificultad
              <select [(ngModel)]="difficulty" name="difficulty">
                <option value="BASIC">Básica</option>
                <option value="INTERMEDIATE">Intermedia</option>
                <option value="ADVANCED">Avanzada</option>
              </select>
            </label>
          </div>
          <div class="button-row">
            <button class="primary-button" type="submit">Guardar borrador</button>
            @if (situationId()) {
              <button class="ghost-button" type="button" (click)="publishCase()">Publicar / Habilitar</button>
            }
          </div>
        </form>
      </article>
    }

    @if (activeTab() === 'scenarios' && situationId()) {
      <section class="workspace-grid">
        <article class="panel editor-panel">
          <h3>Agregar escenario</h3>
          <form class="stack-form" (ngSubmit)="addScenario()">
            <label>Título <input [(ngModel)]="scenarioTitle" name="scTitle" required /></label>
            <label>Contexto / Situación <textarea [(ngModel)]="scenarioContext" name="scContext"></textarea></label>
            <label>Diálogos / Interacciones <textarea [(ngModel)]="scenarioDialogues" name="scDialogues" placeholder="Opcional: diálogos del caso"></textarea></label>
            <label>Instrucciones <textarea [(ngModel)]="scenarioInstructions" name="scInstr"></textarea></label>
            <button class="primary-button" type="submit">Agregar escenario</button>
          </form>
        </article>
        <article class="panel">
          <h3>Escenarios del caso</h3>
          <div class="list">
            @for (sc of scenarios(); track sc.id) {
              <div class="list-item scenario-item">
                <span>
                  <strong>{{ sc.orderIndex }}. {{ sc.title }}</strong>
                  <small>{{ sc.context }}</small>
                </span>
                <button class="ghost-button danger" type="button" (click)="removeScenario(sc.id)">×</button>
              </div>
            } @empty {
              <p class="muted">Agrega escenarios para estructurar el caso.</p>
            }
          </div>
        </article>
      </section>
    }

    @if (activeTab() === 'questions' && situationId()) {
      <section class="workspace-grid">
        <article class="panel editor-panel">
          <h3>Agregar pregunta</h3>
          <form class="stack-form" (ngSubmit)="addQuestion()">
            <label>Escenario
              <select [(ngModel)]="questionScenarioId" name="qScenario" required>
                @for (sc of scenarios(); track sc.id) {
                  <option [value]="sc.id">{{ sc.title }}</option>
                }
              </select>
            </label>
            <label>Enunciado <textarea [(ngModel)]="questionStatement" name="qStatement" required></textarea></label>
            <div class="form-row">
              <label>Tipo
                <select [(ngModel)]="questionType" name="qType">
                  @for (t of questionTypes; track t.value) {
                    <option [value]="t.value">{{ t.label }}</option>
                  }
                </select>
              </label>
              <label>Categoría
                <select [(ngModel)]="questionCategory" name="qCat">
                  <option value="TECHNICAL">Técnica</option>
                  <option value="ETHICAL">Ética</option>
                  <option value="NORMATIVE">Normativa</option>
                  <option value="PSYCHOSOCIAL">Psicosocial</option>
                  <option value="CARE_ROUTE">Ruta de atención</option>
                </select>
              </label>
              <label>Puntos <input type="number" [(ngModel)]="questionPoints" name="qPoints" min="1" max="100" /></label>
            </div>
            @if (questionType !== 'OPEN') {
              <label>Opción A <input [(ngModel)]="optionA" name="optA" /></label>
              <label>Opción B <input [(ngModel)]="optionB" name="optB" /></label>
              <label>Opción C <input [(ngModel)]="optionC" name="optC" /></label>
              <label>Índice correcto (0=A, 1=B, 2=C)
                <input type="number" [(ngModel)]="correctIndex" name="correct" min="0" max="2" />
              </label>
            }
            <label>Retroalimentación <textarea [(ngModel)]="questionFeedback" name="qFeedback"></textarea></label>
            <button class="primary-button" type="submit">Agregar pregunta</button>
          </form>
        </article>
        <article class="panel">
          <h3>Preguntas configuradas</h3>
          <div class="list">
            @for (q of allQuestions(); track q.id) {
              <div class="list-item">
                <span>
                  <strong>{{ q.statement }}</strong>
                  <small>{{ q.questionType }} · {{ q.points }} pts · {{ q.category }}</small>
                </span>
                <button class="ghost-button danger" type="button" (click)="removeQuestion(q.id)">×</button>
              </div>
            } @empty {
              <p class="muted">Agrega preguntas a los escenarios.</p>
            }
          </div>
        </article>
      </section>
    }

    @if (!situationId() && activeTab() !== 'info') {
      <article class="panel warn-panel">
        <p>Guarda primero la información del caso para agregar escenarios y preguntas.</p>
      </article>
    }

    @if (message()) {
      <p class="game-badge game-badge-gold">{{ message() }}</p>
    }
  `,
  styles: [
    `
      .editor-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.35rem;
        border-radius: var(--psy-radius-sm);
        background: rgba(10, 6, 20, 0.5);
        border: 1px solid var(--psy-line);
      }

      .editor-tabs button {
        border: 2px solid transparent;
        border-radius: var(--psy-radius-sm);
        background: transparent;
        color: var(--psy-muted);
        padding: 0.65rem 1rem;
        font-family: var(--psy-font-display);
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s ease;
      }

      .editor-tabs button.active {
        border-color: var(--psy-accent);
        background: rgba(214, 93, 177, 0.08);
        color: var(--psy-accent);
        box-shadow: var(--psy-shadow-glow-cyan);
      }

      .editor-panel {
        border-color: var(--psy-border-neural);
      }

      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 0.75rem;
      }

      .scenario-item {
        cursor: default;
      }

      .ghost-button.danger {
        border-color: rgba(255, 68, 102, 0.45);
        color: var(--psy-danger);
        min-width: 44px;
      }

      .warn-panel {
        border-color: var(--psy-warning);
        color: var(--psy-warning);
      }
    `,
  ],
})
export class TeacherCaseEditorPage implements OnInit {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly situationId = signal<string | null>(null);
  readonly isNew = signal(true);
  readonly activeTab = signal<'info' | 'scenarios' | 'questions'>('info');
  readonly message = signal('');

  title = '';
  description = '';
  context = '';
  learningObjective = '';
  resources = '';
  category: SituationCategory = 'CLINICAL';
  difficulty: Difficulty = 'INTERMEDIATE';

  scenarioTitle = '';
  scenarioContext = '';
  scenarioDialogues = '';
  scenarioInstructions = '';

  questionScenarioId = '';
  questionStatement = '';
  questionType: QuestionType = 'MULTIPLE_CHOICE';
  questionCategory: QuestionCategory = 'PSYCHOSOCIAL';
  questionPoints = 10;
  questionFeedback = '';
  optionA = '';
  optionB = '';
  optionC = '';
  correctIndex = 0;

  readonly tabs = [
    { id: 'info' as const, label: '1. Caso' },
    { id: 'scenarios' as const, label: '2. Escenarios' },
    { id: 'questions' as const, label: '3. Preguntas' },
  ];

  readonly categories = [
    { value: 'CLINICAL' as SituationCategory, label: 'Clínico' },
    { value: 'PSYCHOSOCIAL' as SituationCategory, label: 'Psicosocial' },
    { value: 'ETHICS' as SituationCategory, label: 'Ética' },
    { value: 'CRISIS' as SituationCategory, label: 'Crisis' },
    { value: 'DEVELOPMENT' as SituationCategory, label: 'Desarrollo' },
    { value: 'ORGANIZATIONAL' as SituationCategory, label: 'Organizacional' },
  ];

  readonly questionTypes = [
    { value: 'MULTIPLE_CHOICE' as QuestionType, label: 'Selección múltiple' },
    { value: 'TRUE_FALSE' as QuestionType, label: 'Verdadero / Falso' },
    { value: 'OPEN' as QuestionType, label: 'Respuesta abierta' },
    { value: 'PSYCH_ANALYSIS' as QuestionType, label: 'Análisis psicológico' },
    { value: 'DECISION' as QuestionType, label: 'Toma de decisiones' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.loadCase(id);
    }
  }

  scenarios() {
    const id = this.situationId();
    return id ? this.data.scenariosForSituation(id) : [];
  }

  allQuestions() {
    const id = this.situationId();
    return id ? this.data.questionsForSituation(id) : [];
  }

  saveInfo(): void {
    const teacher = this.auth.currentUser();
    if (!teacher || !this.title.trim()) return;

    if (this.situationId()) {
      this.data.updateSituation(this.situationId()!, {
        title: this.title,
        description: this.description,
        context: this.context,
        learningObjective: this.learningObjective,
        resources: this.resources,
        category: this.category,
        difficulty: this.difficulty,
      });
      this.message.set('Caso actualizado.');
      return;
    }

    const created = this.data.createSituationForTeacher(teacher.id, {
      title: this.title,
      description: this.description,
      context: this.context,
      learningObjective: this.learningObjective,
      resources: this.resources,
      category: this.category,
      difficulty: this.difficulty,
    });

    if (created) {
      this.situationId.set(created.id);
      this.isNew.set(false);
      void this.router.navigate(['/teacher/casos', created.id], { replaceUrl: true });
      this.message.set('Borrador creado. Ahora agrega escenarios.');
    }
  }

  publishCase(): void {
    const id = this.situationId();
    if (id) {
      this.data.setSituationEnabled(id, true);
      this.message.set('Caso publicado y habilitado para estudiantes.');
    }
  }

  addScenario(): void {
    const id = this.situationId();
    if (!id || !this.scenarioTitle.trim()) return;
    const ctx = [this.scenarioContext, this.scenarioDialogues].filter(Boolean).join('\n\n');
    this.data.createScenario(id, this.scenarioTitle, ctx, this.scenarioInstructions);
    this.scenarioTitle = '';
    this.scenarioContext = '';
    this.scenarioDialogues = '';
    this.scenarioInstructions = '';
    this.message.set('Escenario agregado.');
    const scs = this.scenarios();
    if (scs.length && !this.questionScenarioId) {
      this.questionScenarioId = scs[0].id;
    }
  }

  removeScenario(scenarioId: string): void {
    this.data.deleteScenario(scenarioId);
    this.message.set('Escenario eliminado.');
  }

  addQuestion(): void {
    if (!this.questionScenarioId || !this.questionStatement.trim()) return;
    const options =
      this.questionType === 'TRUE_FALSE'
        ? ['Verdadero', 'Falso']
        : this.questionType === 'OPEN'
          ? ['Respuesta abierta']
          : [this.optionA, this.optionB, this.optionC].filter(Boolean);

    if (options.length < 1) return;

    this.data.createQuestion(this.questionScenarioId, {
      statement: this.questionStatement,
      category: this.questionCategory,
      questionType: this.questionType,
      points: this.questionPoints,
      feedback: this.questionFeedback,
      options,
      correctIndex: Math.min(this.correctIndex, options.length - 1),
    });
    this.questionStatement = '';
    this.questionFeedback = '';
    this.message.set('Pregunta agregada.');
  }

  removeQuestion(questionId: string): void {
    this.data.deleteQuestion(questionId);
    this.message.set('Pregunta eliminada.');
  }

  private loadCase(id: string): void {
    const situation = this.data.getSituation(id);
    if (!situation) {
      void this.router.navigate(['/teacher/casos']);
      return;
    }
    this.situationId.set(id);
    this.isNew.set(false);
    this.title = situation.title;
    this.description = situation.description;
    this.context = situation.context;
    this.learningObjective = situation.learningObjective;
    this.resources = situation.resources ?? '';
    this.category = situation.category;
    this.difficulty = situation.difficulty;
    const scs = this.scenarios();
    if (scs.length) this.questionScenarioId = scs[0].id;
  }
}
