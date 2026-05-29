import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroupTask, Question, Scenario } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-tasks-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Misiones de simulación</p>
        <h2>Asignar tareas</h2>
        <p>Selecciona casos habilitados, escenarios y preguntas para cada grupo.</p>
      </div>
    </header>

    <section class="panel editor-panel">
      <h3>Constructor de tarea — checklist</h3>
      <p class="form-hint muted">
        Solo casos publicados/habilitados aparecen aquí. Tus casos y el catálogo global del administrador.
      </p>

      <form class="stack-form" (ngSubmit)="assignTask()">
        <label>
          Grupo destino
          <select [(ngModel)]="selectedGroupId" name="assignGroup" required>
            @for (group of groups(); track group.id) {
              <option [value]="group.id">{{ group.name }}</option>
            }
          </select>
        </label>

        <div class="checklist-group">
          <h4>1. Caso psicológico</h4>
          @for (situation of catalog(); track situation.id) {
            <label class="checklist-item">
              <input
                type="radio"
                name="taskSituation"
                [value]="situation.id"
                [(ngModel)]="selectedSituationId"
                (ngModelChange)="onSituationChange($event)"
              />
              <span>
                <strong>{{ situation.title }}</strong>
                <small>{{ situation.difficulty }} — {{ situation.description }}</small>
              </span>
            </label>
          } @empty {
            <p class="muted">No hay casos habilitados. Publica un caso desde Casos psicológicos.</p>
          }
        </div>

        @if (selectedSituationId) {
          <div class="checklist-group">
            <h4>2. Escenarios</h4>
            <div class="checklist-actions">
              <button class="ghost-button" type="button" (click)="selectAllScenarios()">Marcar todos</button>
              <button class="ghost-button" type="button" (click)="clearScenarios()">Limpiar</button>
            </div>
            @for (scenario of scenariosForSelection(); track scenario.id) {
              <label class="checklist-item">
                <input type="checkbox" [checked]="isScenarioSelected(scenario.id)" (change)="toggleScenario(scenario.id)" />
                <span>
                  <strong>{{ scenario.title }}</strong>
                  <small>{{ scenario.context }}</small>
                </span>
              </label>
            } @empty {
              <p class="muted">Este caso no tiene escenarios.</p>
            }
          </div>

          <div class="checklist-group">
            <h4>3. Preguntas</h4>
            <div class="checklist-actions">
              <button class="ghost-button" type="button" (click)="selectAllQuestions()">Marcar todas</button>
              <button class="ghost-button" type="button" (click)="clearQuestions()">Limpiar</button>
            </div>
            @for (question of questionsForSelection(); track question.id) {
              <label class="checklist-item">
                <input type="checkbox" [checked]="isQuestionSelected(question.id)" (change)="toggleQuestion(question.id)" />
                <span>
                  <strong>{{ question.statement }}</strong>
                  <small>{{ questionLabel(question) }}</small>
                </span>
              </label>
            } @empty {
              <p class="muted">Selecciona escenarios para ver preguntas.</p>
            }
          </div>
        }

        @if (taskError()) {
          <p class="form-error">{{ taskError() }}</p>
        }

        <button class="primary-button" type="submit">Asignar tarea al grupo</button>
      </form>
    </section>

    <section class="panel">
      <h3>Tareas del grupo seleccionado</h3>
      <div class="list">
        @for (task of tasksForSelectedGroup(); track task.id) {
          <div class="list-item">
            <span class="task-summary">
              <strong>{{ situationTitle(task) }}</strong>
              <small>
                {{ task.scenarioIds.length }} escenarios · {{ task.questionIds.length }} preguntas ·
                {{ task.assignedAt | date: 'short' }}
              </small>
            </span>
          </div>
        } @empty {
          <p class="muted">Este grupo no tiene tareas asignadas.</p>
        }
      </div>
    </section>

    @if (message()) {
      <p class="game-badge game-badge-gold">{{ message() }}</p>
    }
  `,
  styles: [
    `
      .checklist-group {
        display: grid;
        gap: 0.5rem;
        padding: 0.85rem;
        border: 1px solid var(--psy-line);
        border-radius: var(--psy-radius-sm);
        background: rgba(8, 4, 26, 0.45);
      }

      .checklist-group h4 {
        margin: 0;
        font-family: var(--psy-font-hud);
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--psy-accent);
      }

      .checklist-item {
        display: flex;
        gap: 0.65rem;
        align-items: flex-start;
        cursor: pointer;
      }

      .checklist-actions {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
})
export class TeacherTasksPage {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);

  readonly message = signal('');
  readonly taskError = signal('');

  selectedGroupId = '';
  selectedSituationId = '';
  selectedScenarioIds = new Set<string>();
  selectedQuestionIds = new Set<string>();

  readonly groups = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.groupsByTeacher(teacher.id) : [];
  });

  readonly catalog = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.catalogSituationsForTeacher(teacher.id) : [];
  });

  scenariosForSelection(): Scenario[] {
    return this.selectedSituationId ? this.data.scenariosForSituation(this.selectedSituationId) : [];
  }

  questionsForSelection(): Question[] {
    const scenarioIds = this.selectedScenarioIds;
    return this.selectedSituationId
      ? this.data.questionsForSituation(this.selectedSituationId).filter((q) => scenarioIds.has(q.scenarioId))
      : [];
  }

  tasksForSelectedGroup(): GroupTask[] {
    return this.selectedGroupId ? this.data.tasksForGroup(this.selectedGroupId) : [];
  }

  situationTitle(task: GroupTask): string {
    return this.data.situationForTask(task)?.title ?? 'Tarea sin título';
  }

  questionLabel(question: Question): string {
    const scenario = this.data.store().scenarios.find((s) => s.id === question.scenarioId);
    return `${question.questionType} · ${question.points} pts${scenario ? ' — ' + scenario.title : ''}`;
  }

  isScenarioSelected(id: string): boolean {
    return this.selectedScenarioIds.has(id);
  }

  isQuestionSelected(id: string): boolean {
    return this.selectedQuestionIds.has(id);
  }

  onSituationChange(situationId: string): void {
    this.selectedSituationId = situationId;
    this.selectedScenarioIds = new Set(this.scenariosForSelection().map((s) => s.id));
    this.selectedQuestionIds = new Set(this.questionsForSelection().map((q) => q.id));
  }

  toggleScenario(scenarioId: string): void {
    const next = new Set(this.selectedScenarioIds);
    next.has(scenarioId) ? next.delete(scenarioId) : next.add(scenarioId);
    this.selectedScenarioIds = next;
    const allowed = new Set(this.questionsForSelection().map((q) => q.id));
    this.selectedQuestionIds = new Set([...this.selectedQuestionIds].filter((id) => allowed.has(id)));
  }

  toggleQuestion(questionId: string): void {
    const next = new Set(this.selectedQuestionIds);
    next.has(questionId) ? next.delete(questionId) : next.add(questionId);
    this.selectedQuestionIds = next;
  }

  selectAllScenarios(): void {
    this.selectedScenarioIds = new Set(this.scenariosForSelection().map((s) => s.id));
    this.selectedQuestionIds = new Set(this.questionsForSelection().map((q) => q.id));
  }

  clearScenarios(): void {
    this.selectedScenarioIds = new Set();
    this.selectedQuestionIds = new Set();
  }

  selectAllQuestions(): void {
    this.selectedQuestionIds = new Set(this.questionsForSelection().map((q) => q.id));
  }

  clearQuestions(): void {
    this.selectedQuestionIds = new Set();
  }

  assignTask(): void {
    this.taskError.set('');
    if (!this.selectedGroupId || !this.selectedSituationId) {
      this.taskError.set('Selecciona un grupo y un caso.');
      return;
    }
    if (!this.selectedScenarioIds.size || !this.selectedQuestionIds.size) {
      this.taskError.set('Marca al menos un escenario y una pregunta.');
      return;
    }

    const task = this.data.assignTaskToGroup({
      groupId: this.selectedGroupId,
      situationId: this.selectedSituationId,
      scenarioIds: [...this.selectedScenarioIds],
      questionIds: [...this.selectedQuestionIds],
    });

    if (!task) {
      this.taskError.set('No se pudo crear la tarea. Verifica las selecciones.');
      return;
    }
    this.message.set('Tarea asignada al grupo.');
  }
}
