import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroupTask, Question, Scenario, User } from '../../../models/academy.models';
import { TaskSession } from '../../../models/session.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { SchedulingService } from '../../../services/scheduling.service';

@Component({
  selector: 'app-teacher-tasks-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Misiones de simulación</p>
        <h2>Agendar simulación</h2>
        <p>Programa un caso, autoriza estudiantes y modifica la lista después del agendamiento (REQ-04 / REQ-05).</p>
      </div>
    </header>

    <section class="panel editor-panel">
      <h3>Agendar simulación — checklist</h3>
      <p class="form-hint muted">
        Solo casos publicados/habilitados aparecen aquí. Tus casos y el catálogo global del administrador.
      </p>

      <form class="stack-form" (ngSubmit)="scheduleSimulation()">
        <label>
          Grupo / espacio académico
          <select [(ngModel)]="selectedGroupId" name="assignGroup" required (ngModelChange)="onGroupChange($event)">
            @for (group of groups(); track group.id) {
              <option [value]="group.id">{{ group.name }}</option>
            }
          </select>
        </label>

        <label>
          Nombre del espacio académico
          <input [(ngModel)]="academicSpace" name="academicSpace" required />
        </label>

        <label>
          Ubicación
          <input [(ngModel)]="location" name="location" placeholder="Aula, campus virtual, sede…" />
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

        <div class="checklist-group">
          <h4>4. Agenda (REQ-04)</h4>
          <label>
            Inicio oficial
            <input type="datetime-local" [(ngModel)]="scheduledStartLocal" name="schedStart" required />
          </label>
          <label>
            Fin programado
            <input type="datetime-local" [(ngModel)]="scheduledEndLocal" name="schedEnd" required />
          </label>
          <label>
            Tiempo estimado del caso (minutos)
            <input type="number" min="15" max="480" [(ngModel)]="estimatedMinutes" name="estMin" required />
          </label>
          <label>
            Tiempo máximo de participación (minutos)
            <input type="number" min="15" max="480" [(ngModel)]="maxDurationMinutes" name="maxDur" required />
          </label>
          <small class="muted">El tiempo máximo no puede superar el estimado del caso.</small>
          <label>
            Mensaje para estudiantes (opcional)
            <textarea rows="2" [(ngModel)]="customMessage" name="customMsg"></textarea>
          </label>
        </div>

        @if (selectedGroupId) {
          <div class="checklist-group">
            <h4>5. Estudiantes autorizados</h4>
            @for (student of studentsInSelectedGroup(); track student.id) {
              <label class="checklist-item">
                <input
                  type="checkbox"
                  [checked]="isStudentAuthorized(student.id)"
                  (change)="toggleAuthorizedStudent(student.id)"
                />
                <span>
                  <strong>{{ student.name }}</strong>
                  <small>{{ student.email }}</small>
                </span>
              </label>
            } @empty {
              <p class="muted">No hay estudiantes en este grupo. Invita uno abajo.</p>
            }
            <label>Nombre invitado <input [(ngModel)]="inviteName" name="inviteName" /></label>
            <label>Correo universitario <input type="email" [(ngModel)]="inviteEmail" name="inviteEmail" /></label>
            <label>Tarjeta de identidad <input [(ngModel)]="inviteDocumentId" name="inviteDoc" /></label>
            <button class="ghost-button" type="button" (click)="addInvitee()">Agregar invitado</button>
            @for (inv of pendingInvitees; track inv.email) {
              <small class="muted">Invitado: {{ inv.name }} — {{ inv.email }}</small>
            }
          </div>
        }

        @if (taskError()) {
          <p class="form-error">{{ taskError() }}</p>
        }

        <button class="primary-button" type="submit" [disabled]="schedulingInProgress()">
          {{ schedulingInProgress() ? 'Agendando…' : 'Agendar y notificar por correo' }}
        </button>
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
              @if (sessionFor(task); as session) {
                <small>Sesión: {{ sessionStatusLabel(session) }} · {{ session.maxDurationMinutes }} min máx.</small>
              }
            </span>
            @if (sessionFor(task); as session) {
              <div class="session-actions">
                @if (session.status !== 'IN_PROGRESS' && session.status !== 'FINISHED') {
                  <button class="primary-button" type="button" (click)="startSession(task, session)">Iniciar sesión</button>
                }
                @if (session.status === 'IN_PROGRESS') {
                  <button class="ghost-button" type="button" (click)="finishSession(task)">Finalizar sesión</button>
                }
                <label class="checklist-item">
                  <input type="checkbox" [checked]="session.allowRetries" (change)="toggleRetries(task.id, session)" />
                  <span>Permitir reintentos (REQ-12)</span>
                </label>
                @if (session.status !== 'FINISHED') {
                  @if (editingAuthorizedTaskId === task.id) {
                    <div class="authorized-editor">
                      <h5>Modificar autorizados (REQ-05)</h5>
                      <p class="muted form-hint">Los cambios envían correo solo a quienes se agreguen o retiren.</p>
                      @for (student of studentsForGroup(task.groupId); track student.id) {
                        <label class="checklist-item">
                          <input
                            type="checkbox"
                            [checked]="isEditAuthorized(student.id)"
                            (change)="toggleEditAuthorized(student.id)"
                          />
                          <span>
                            <strong>{{ student.name }}</strong>
                            <small>{{ student.email }}</small>
                          </span>
                        </label>
                      }
                      <label>Nuevo invitado — nombre <input [(ngModel)]="editInviteName" [ngModelOptions]="{ standalone: true }" /></label>
                      <label>Correo <input type="email" [(ngModel)]="editInviteEmail" [ngModelOptions]="{ standalone: true }" /></label>
                      <label>Tarjeta <input [(ngModel)]="editInviteDocumentId" [ngModelOptions]="{ standalone: true }" /></label>
                      <button class="ghost-button" type="button" (click)="addEditInvitee()">Agregar invitado</button>
                      @for (inv of editInvitees; track inv.email) {
                        <small class="muted">Invitado: {{ inv.name }} — {{ inv.email }}</small>
                      }
                      <div class="checklist-actions">
                        <button class="primary-button" type="button" [disabled]="updatingAuthorized()" (click)="saveAuthorizedList(task)">
                          {{ updatingAuthorized() ? 'Guardando…' : 'Guardar y notificar' }}
                        </button>
                        <button class="ghost-button" type="button" (click)="cancelEditAuthorized()">Cancelar</button>
                      </div>
                    </div>
                  } @else {
                    <button class="ghost-button" type="button" (click)="startEditAuthorized(task)">
                      Editar lista de autorizados
                    </button>
                  }
                }
              </div>
            }
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

      .session-actions {
        display: grid;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .authorized-editor {
        display: grid;
        gap: 0.5rem;
        padding: 0.75rem;
        border: 1px dashed var(--psy-line);
        border-radius: var(--psy-radius-sm);
        background: rgba(8, 4, 26, 0.35);
      }

      .authorized-editor h5 {
        margin: 0;
        font-family: var(--psy-font-hud);
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--psy-accent);
      }
    `,
  ],
})
export class TeacherTasksPage {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);
  private readonly notify = inject(NotificationService);
  private readonly scheduler = inject(SchedulingService);

  readonly message = signal('');
  readonly taskError = signal('');
  readonly schedulingInProgress = signal(false);
  readonly updatingAuthorized = signal(false);

  editingAuthorizedTaskId = '';
  editAuthorizedIds = new Set<string>();
  editInvitees: { name: string; email: string; documentId: string }[] = [];
  editInviteName = '';
  editInviteEmail = '';
  editInviteDocumentId = '';

  selectedGroupId = '';
  selectedSituationId = '';
  selectedScenarioIds = new Set<string>();
  selectedQuestionIds = new Set<string>();
  selectedAuthorizedIds = new Set<string>();
  pendingInvitees: { name: string; email: string; documentId: string }[] = [];
  inviteName = '';
  inviteEmail = '';
  inviteDocumentId = '';
  academicSpace = '';
  location = 'Campus virtual MIND-SPHERE';
  scheduledStartLocal = toDatetimeLocalValue(new Date());
  scheduledEndLocal = toDatetimeLocalValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  maxDurationMinutes = 90;
  estimatedMinutes = 90;
  customMessage = '';

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

  sessionFor(task: GroupTask): TaskSession | undefined {
    return this.data.sessionForTask(task.id);
  }

  sessionStatusLabel(session: TaskSession): string {
    switch (session.status) {
      case 'IN_PROGRESS':
        return 'En curso';
      case 'FINISHED':
        return 'Finalizada';
      case 'SCHEDULED':
        return 'Agendada';
      default:
        return 'Sin iniciar';
    }
  }

  startSession(task: GroupTask, session: TaskSession): void {
    this.data.startTaskSession(task.id);
    const situation = this.data.situationForTask(task);
    const students = this.data.studentsByTeacher(this.auth.currentUser()!.id).filter((s) =>
      this.data.store().groupStudents.some((m) => m.groupId === task.groupId && m.studentId === s.id),
    );
    for (const student of students) {
      void this.notify.notifySessionStarted(student.email, situation?.title ?? 'Caso', session.customMessage);
    }
    this.message.set('Sesión iniciada. Los estudiantes ya pueden ingresar.');
  }

  finishSession(task: GroupTask): void {
    this.data.finishTaskSession(task.id);
    this.message.set('Sesión finalizada. Se procesaron notas parciales si aplica.');
  }

  toggleRetries(taskId: string, session: TaskSession): void {
    const next = !session.allowRetries;
    this.data.updateTaskSession(taskId, { allowRetries: next });
    this.message.set(next ? 'Reintentos habilitados.' : 'Reintentos deshabilitados.');
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
    void this.scheduleSimulation();
  }

  onGroupChange(groupId: string): void {
    const group = this.groups().find((g) => g.id === groupId);
    this.academicSpace = group?.name ?? '';
    this.selectedAuthorizedIds = new Set(this.studentsInSelectedGroup().map((s) => s.id));
  }

  studentsInSelectedGroup(): User[] {
    return this.studentsForGroup(this.selectedGroupId);
  }

  studentsForGroup(groupId: string): User[] {
    if (!groupId) return [];
    const ids = new Set(
      this.data.store().groupStudents.filter((m) => m.groupId === groupId).map((m) => m.studentId),
    );
    return this.data.store().users.filter((u) => u.role === 'STUDENT' && ids.has(u.id));
  }

  startEditAuthorized(task: GroupTask): void {
    const session = this.sessionFor(task);
    if (!session) return;
    this.taskError.set('');
    this.editingAuthorizedTaskId = task.id;
    this.editAuthorizedIds = new Set(session.authorizedStudentIds ?? []);
    this.editInvitees = [];
    this.editInviteName = '';
    this.editInviteEmail = '';
    this.editInviteDocumentId = '';
  }

  cancelEditAuthorized(): void {
    this.editingAuthorizedTaskId = '';
    this.editAuthorizedIds = new Set();
    this.editInvitees = [];
  }

  isEditAuthorized(studentId: string): boolean {
    return this.editAuthorizedIds.has(studentId);
  }

  toggleEditAuthorized(studentId: string): void {
    const next = new Set(this.editAuthorizedIds);
    next.has(studentId) ? next.delete(studentId) : next.add(studentId);
    this.editAuthorizedIds = next;
  }

  addEditInvitee(): void {
    const name = this.editInviteName.trim();
    const email = this.editInviteEmail.trim().toLowerCase();
    const documentId = this.editInviteDocumentId.trim();
    if (!name || !email.includes('@') || !documentId) {
      this.taskError.set('Completa nombre, correo y tarjeta del invitado.');
      return;
    }
    this.taskError.set('');
    if (!this.editInvitees.some((i) => i.email === email)) {
      this.editInvitees = [...this.editInvitees, { name, email, documentId }];
    }
    this.editInviteName = '';
    this.editInviteEmail = '';
    this.editInviteDocumentId = '';
  }

  async saveAuthorizedList(task: GroupTask): Promise<void> {
    this.taskError.set('');
    if (!this.editAuthorizedIds.size && !this.editInvitees.length) {
      this.taskError.set('Selecciona al menos un estudiante autorizado.');
      return;
    }

    this.updatingAuthorized.set(true);
    const result = await this.scheduler.updateAuthorizedAndNotify(task.id, {
      authorizedStudentIds: [...this.editAuthorizedIds],
      invitees: [...this.editInvitees],
    });
    this.updatingAuthorized.set(false);

    if (!result.ok) {
      this.taskError.set(result.error);
      return;
    }

    const added = result.addedStudentIds.length;
    const removed = result.removedStudentIds.length;
    this.message.set(
      added || removed
        ? `Lista actualizada (REQ-05). Correos enviados: ${added} agregado(s), ${removed} retirado(s).`
        : 'Lista guardada sin cambios en los autorizados.',
    );
    this.cancelEditAuthorized();
  }

  isStudentAuthorized(studentId: string): boolean {
    return this.selectedAuthorizedIds.has(studentId);
  }

  toggleAuthorizedStudent(studentId: string): void {
    const next = new Set(this.selectedAuthorizedIds);
    next.has(studentId) ? next.delete(studentId) : next.add(studentId);
    this.selectedAuthorizedIds = next;
  }

  addInvitee(): void {
    const name = this.inviteName.trim();
    const email = this.inviteEmail.trim().toLowerCase();
    const documentId = this.inviteDocumentId.trim();
    if (!name || !email.includes('@') || !documentId) {
      this.taskError.set('Ingresa nombre, correo universitario y tarjeta de identidad del invitado.');
      return;
    }
    this.taskError.set('');
    if (!this.pendingInvitees.some((i) => i.email === email)) {
      this.pendingInvitees = [...this.pendingInvitees, { name, email, documentId }];
    }
    this.inviteName = '';
    this.inviteEmail = '';
    this.inviteDocumentId = '';
  }

  async scheduleSimulation(): Promise<void> {
    this.taskError.set('');
    if (!this.selectedGroupId || !this.selectedSituationId) {
      this.taskError.set('Selecciona un grupo y un caso.');
      return;
    }
    if (!this.selectedScenarioIds.size || !this.selectedQuestionIds.size) {
      this.taskError.set('Marca al menos un escenario y una pregunta.');
      return;
    }
    if (this.maxDurationMinutes > this.estimatedMinutes) {
      this.taskError.set('El tiempo máximo no puede superar el tiempo estimado del caso.');
      return;
    }
    if (!this.selectedAuthorizedIds.size && !this.pendingInvitees.length) {
      this.taskError.set('Selecciona o registra al menos un estudiante autorizado.');
      return;
    }

    this.schedulingInProgress.set(true);
    const result = await this.scheduler.scheduleAndNotify({
      groupId: this.selectedGroupId,
      situationId: this.selectedSituationId,
      scenarioIds: [...this.selectedScenarioIds],
      questionIds: [...this.selectedQuestionIds],
      scheduledStartAt: fromDatetimeLocalValue(this.scheduledStartLocal),
      scheduledEndAt: fromDatetimeLocalValue(this.scheduledEndLocal),
      maxDurationMinutes: this.maxDurationMinutes,
      estimatedMinutes: this.estimatedMinutes,
      customMessage: this.customMessage,
      academicSpace: this.academicSpace,
      location: this.location,
      authorizedStudentIds: [...this.selectedAuthorizedIds],
      invitees: [...this.pendingInvitees],
    });
    this.schedulingInProgress.set(false);

    if (!result.ok) {
      this.taskError.set(result.error);
      return;
    }

    this.message.set('Simulación agendada (Sin iniciar). Credenciales enviadas por correo a los autorizados.');
    this.pendingInvitees = [];
  }
}

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
