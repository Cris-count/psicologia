import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameGroup, GroupTask, Question, Scenario, Situation, User } from '../models/academy.models';
import { AcademyDataService } from '../services/academy-data.service';
import { AuthService } from '../services/auth.service';
import { GameAnimateDirective } from '../shared/directives/game-animate.directive';
import { GameHudComponent } from '../shared/ui/game-hud/game-hud.component';
import { GameLogoutButtonComponent } from '../shared/ui/game-logout-button/game-logout-button.component';
import { ThreeBackgroundComponent } from '../shared/ui/three-background/three-background.component';

@Component({
  selector: 'app-teacher-dashboard-page',
  imports: [CommonModule, FormsModule, ThreeBackgroundComponent, GameHudComponent, GameLogoutButtonComponent, GameAnimateDirective],
  template: `
    <app-three-background intensity="ambient" />
    <div class="app-shell">
      <aside class="sidebar">
        <div>
          <div class="sidebar-brand">
            <img class="app-logo" src="/mind-sphere-logo.svg" alt="" aria-hidden="true" />
            <div>
              <p class="eyebrow">Maestro · Nivel Instructor</p>
              <h1>Arena de Simulación</h1>
            </div>
          </div>
          <p class="muted">Grupos, estudiantes, tareas y resultados.</p>
        </div>
        <nav>
          <button type="button" [class.active-nav]="activeSection === 'resumen'" (click)="showSection('resumen')">Resumen</button>
          <button type="button" [class.active-nav]="activeSection === 'grupos'" (click)="showSection('grupos')">Grupos</button>
          <button type="button" [class.active-nav]="activeSection === 'estudiantes'" (click)="showSection('estudiantes')">Estudiantes</button>
          <button type="button" [class.active-nav]="activeSection === 'tareas'" (click)="showSection('tareas')">Tareas</button>
          <button type="button" [class.active-nav]="activeSection === 'resultados'" (click)="showSection('resultados')">Resultados</button>
        </nav>
        <app-game-logout-button label="Cerrar sesión" [block]="true" />
      </aside>

      <main class="content" appGameAnimate="fade-up">
        <app-game-hud
          eyebrow="Maestro · Arena Instructor"
          [title]="teacher()?.name ?? 'Instructor'"
          subtitle="Gestiona grupos, tareas y resultados"
          [level]="12"
          [xpPercent]="78"
        >
          <app-game-logout-button hudActions label="Salir" [compact]="true" />
        </app-game-hud>

        <section class="page-header">
          <div>
            <p class="eyebrow">Gestión pedagógica</p>
            <h2>Panel del Maestro</h2>
            <p>
              Crea grupos y estudiantes. Luego vincula situaciones, escenarios y preguntas del catalogo mediante checklist.
            </p>
          </div>
        </section>

        @if (activeSection === 'resumen') {
          <section class="metric-grid">
            <article class="metric-card">
              <span>Grupos</span>
              <strong>{{ groups().length }}</strong>
            </article>
            <article class="metric-card">
              <span>Estudiantes vinculados</span>
              <strong>{{ students().length }}</strong>
            </article>
            <article class="metric-card">
              <span>Situaciones en catalogo</span>
              <strong>{{ catalog().length }}</strong>
            </article>
            <article class="metric-card">
              <span>Tareas asignadas</span>
              <strong>{{ assignedTasksCount() }}</strong>
            </article>
          </section>
        }

        @if (activeSection === 'grupos') {
          <section class="workspace-grid">
            <article class="panel">
              <h3>Crear grupo</h3>
              <form class="stack-form" (ngSubmit)="createGroup()">
                <label>Nombre <input name="groupName" [(ngModel)]="groupName" required /></label>
                <label>Descripcion <textarea name="groupDescription" [(ngModel)]="groupDescription"></textarea></label>
                <button class="primary-button" type="submit">Crear grupo</button>
              </form>
            </article>

            <article class="panel">
              <h3>Mis grupos</h3>
              <div class="list">
                @for (group of groups(); track group.id) {
                  <button class="list-item" type="button" (click)="selectedGroupId = group.id">
                    <span>
                      <strong>{{ group.name }}</strong>
                      <small>{{ group.description }}</small>
                    </span>
                    <b>{{ groupStudents(group.id).length }}</b>
                  </button>
                } @empty {
                  <p class="muted">Aun no hay grupos creados.</p>
                }
              </div>
            </article>
          </section>
        }

        @if (activeSection === 'estudiantes') {
          <section class="section-heading">
            <div>
              <p class="eyebrow">Estudiantes</p>
              <h2>Crear y vincular</h2>
            </div>
            <p>Crea credenciales de estudiante y agregalos a tus grupos.</p>
          </section>

          <section class="workspace-grid">
            <article class="panel">
              <h3>Crear estudiante</h3>
              <form class="stack-form" (ngSubmit)="createStudent()">
                <label>Nombre <input name="studentName" [(ngModel)]="studentName" required /></label>
                <label>Correo <input name="studentEmail" type="email" [(ngModel)]="studentEmail" required /></label>
                <label>Contrasena <input name="studentPassword" [(ngModel)]="studentPassword" required /></label>
                <label>Codigo <input name="studentCode" [(ngModel)]="studentCode" /></label>
                <button class="primary-button" type="submit">Crear estudiante</button>
              </form>
            </article>

            <article class="panel">
              <h3>Agregar estudiante a grupo</h3>
              <form class="stack-form" (ngSubmit)="addStudentToGroup()">
                <label>
                  Grupo
                  <select name="selectedGroup" [(ngModel)]="selectedGroupId" required>
                    @for (group of groups(); track group.id) {
                      <option [value]="group.id">{{ group.name }}</option>
                    }
                  </select>
                </label>
                <label>
                  Estudiante
                  <select name="selectedStudent" [(ngModel)]="selectedStudentId" required>
                    @for (student of allStudents(); track student.id) {
                      <option [value]="student.id">{{ student.name }} - {{ student.email }}</option>
                    }
                  </select>
                </label>
                <button class="primary-button" type="submit">Asignar estudiante</button>
              </form>
            </article>
          </section>
        }

        @if (activeSection === 'tareas') {
          <section class="panel">
            <h3>Armar tarea con checklist</h3>
            <p class="form-hint">
              El superadmin genera el contenido. Tu decides que situacion, escenarios y preguntas apareceran para el grupo.
            </p>

            <form class="stack-form" (ngSubmit)="assignTask()">
              <label>
                Grupo destino
                <select name="assignGroup" [(ngModel)]="selectedGroupId" required>
                  @for (group of groups(); track group.id) {
                    <option [value]="group.id">{{ group.name }}</option>
                  }
                </select>
              </label>

              <div class="checklist-group">
                <h4>1. Situacion</h4>
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
                  <p class="muted">No hay situaciones publicadas en el catalogo.</p>
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
                      <input
                        type="checkbox"
                        [checked]="isScenarioSelected(scenario.id)"
                        (change)="toggleScenario(scenario.id)"
                      />
                      <span>
                        <strong>{{ scenario.title }}</strong>
                        <small>{{ scenario.context }}</small>
                      </span>
                    </label>
                  } @empty {
                    <p class="muted">Esta situacion no tiene escenarios publicados.</p>
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
                      <input
                        type="checkbox"
                        [checked]="isQuestionSelected(question.id)"
                        (change)="toggleQuestion(question.id)"
                      />
                      <span>
                        <strong>{{ question.statement }}</strong>
                        <small>{{ questionCategoryLabel(question) }}</small>
                      </span>
                    </label>
                  } @empty {
                    <p class="muted">Selecciona escenarios para ver sus preguntas.</p>
                  }
                </div>
              }

              @if (taskError) {
                <p class="form-error">{{ taskError }}</p>
              }

              <button class="primary-button" type="submit">Asignar tarea al grupo</button>
            </form>
          </section>

          <section class="panel">
            <h3>Tareas asignadas al grupo seleccionado</h3>
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
        }

        @if (activeSection === 'resultados') {
          <section class="panel">
            <h3>Resultados por grupo</h3>
            <label class="compact-label">
              Grupo
              <select name="resultsGroup" [(ngModel)]="selectedGroupId">
                @for (group of groups(); track group.id) {
                  <option [value]="group.id">{{ group.name }}</option>
                }
              </select>
            </label>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Tarea</th>
                    <th>Avance</th>
                    <th>Correctas</th>
                    <th>Pendientes</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of resultRows(); track row.student.id + row.task.id) {
                    <tr>
                      <td>{{ row.student.name }}</td>
                      <td>{{ row.situation.title }}</td>
                      <td>{{ row.progress.progressPercentage }}%</td>
                      <td>{{ row.correct }}</td>
                      <td>{{ row.pending }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5">Sin resultados para mostrar.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }
      </main>
    </div>
  `,
})
export class TeacherDashboardPage {
  activeSection: 'resumen' | 'grupos' | 'estudiantes' | 'tareas' | 'resultados' = 'resumen';
  groupName = '';
  groupDescription = '';
  studentName = '';
  studentEmail = '';
  studentPassword = 'demo123';
  studentCode = '';
  selectedGroupId = 'grp-demo';
  selectedStudentId = 'usr-student-demo';
  selectedSituationId = 'sit-demo';
  selectedScenarioIds = new Set<string>(['sce-hospital', 'sce-comisaria']);
  selectedQuestionIds = new Set<string>(['que-hospital-1', 'que-comisaria-1']);
  taskError = '';

  constructor(
    public readonly data: AcademyDataService,
    public readonly auth: AuthService,
  ) {}

  teacher(): User | null {
    return this.auth.currentUser();
  }

  groups(): GameGroup[] {
    const teacher = this.teacher();
    return teacher ? this.data.groupsByTeacher(teacher.id) : [];
  }

  students(): User[] {
    const teacher = this.teacher();
    return teacher ? this.data.studentsByTeacher(teacher.id) : [];
  }

  allStudents(): User[] {
    return this.data.allStudents();
  }

  catalog(): Situation[] {
    return this.data.catalogSituations();
  }

  scenariosForSelection(): Scenario[] {
    return this.data.scenariosForSituation(this.selectedSituationId);
  }

  questionsForSelection(): Question[] {
    const scenarioIds = this.selectedScenarioIds;
    return this.data
      .questionsForSituation(this.selectedSituationId)
      .filter((question) => scenarioIds.has(question.scenarioId));
  }

  tasksForSelectedGroup(): GroupTask[] {
    return this.selectedGroupId ? this.data.tasksForGroup(this.selectedGroupId) : [];
  }

  assignedTasksCount(): number {
    const groupIds = new Set(this.groups().map((group) => group.id));
    return this.data.store().groupTasks.filter((task) => groupIds.has(task.groupId)).length;
  }

  groupStudents(groupId: string): User[] {
    const studentIds = new Set(
      this.data
        .store()
        .groupStudents.filter((membership) => membership.groupId === groupId)
        .map((membership) => membership.studentId),
    );
    return this.data.allStudents().filter((student) => studentIds.has(student.id));
  }

  resultRows() {
    return this.selectedGroupId ? this.data.resultRowsForGroup(this.selectedGroupId) : [];
  }

  situationTitle(task: GroupTask): string {
    return this.data.situationForTask(task)?.title ?? 'Tarea sin titulo';
  }

  questionCategoryLabel(question: Question): string {
    const scenario = this.data.store().scenarios.find((item) => item.id === question.scenarioId);
    return `${question.category}${scenario ? ' — ' + scenario.title : ''}`;
  }

  isScenarioSelected(scenarioId: string): boolean {
    return this.selectedScenarioIds.has(scenarioId);
  }

  isQuestionSelected(questionId: string): boolean {
    return this.selectedQuestionIds.has(questionId);
  }

  onSituationChange(situationId: string): void {
    this.selectedSituationId = situationId;
    this.selectedScenarioIds = new Set(this.scenariosForSelection().map((scenario) => scenario.id));
    this.selectedQuestionIds = new Set(this.questionsForSelection().map((question) => question.id));
  }

  toggleScenario(scenarioId: string): void {
    const next = new Set(this.selectedScenarioIds);
    if (next.has(scenarioId)) {
      next.delete(scenarioId);
    } else {
      next.add(scenarioId);
    }
    this.selectedScenarioIds = next;
    const allowedQuestionIds = new Set(this.questionsForSelection().map((question) => question.id));
    this.selectedQuestionIds = new Set([...this.selectedQuestionIds].filter((id) => allowedQuestionIds.has(id)));
  }

  toggleQuestion(questionId: string): void {
    const next = new Set(this.selectedQuestionIds);
    if (next.has(questionId)) {
      next.delete(questionId);
    } else {
      next.add(questionId);
    }
    this.selectedQuestionIds = next;
  }

  selectAllScenarios(): void {
    this.selectedScenarioIds = new Set(this.scenariosForSelection().map((scenario) => scenario.id));
    this.selectedQuestionIds = new Set(this.questionsForSelection().map((question) => question.id));
  }

  clearScenarios(): void {
    this.selectedScenarioIds = new Set();
    this.selectedQuestionIds = new Set();
  }

  selectAllQuestions(): void {
    this.selectedQuestionIds = new Set(this.questionsForSelection().map((question) => question.id));
  }

  clearQuestions(): void {
    this.selectedQuestionIds = new Set();
  }

  showSection(sectionId: typeof this.activeSection): void {
    this.activeSection = sectionId;
    document.querySelector('.content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createGroup(): void {
    const teacher = this.teacher();
    if (!teacher || !this.groupName.trim()) {
      return;
    }
    this.data.createGroup(teacher.id, this.groupName, this.groupDescription);
    this.groupName = '';
    this.groupDescription = '';
    this.selectedGroupId = this.groups()[0]?.id ?? '';
  }

  createStudent(): void {
    if (!this.studentName.trim() || !this.studentEmail.trim() || !this.studentPassword.trim()) {
      return;
    }
    const student = this.data.createStudent(this.studentName, this.studentEmail, this.studentPassword, this.studentCode);
    this.selectedStudentId = student.id;
    this.studentName = '';
    this.studentEmail = '';
    this.studentPassword = 'demo123';
    this.studentCode = '';
  }

  addStudentToGroup(): void {
    if (this.selectedGroupId && this.selectedStudentId) {
      this.data.addStudentToGroup(this.selectedGroupId, this.selectedStudentId);
    }
  }

  assignTask(): void {
    this.taskError = '';
    if (!this.selectedGroupId || !this.selectedSituationId) {
      this.taskError = 'Selecciona un grupo y una situacion.';
      return;
    }
    if (!this.selectedScenarioIds.size || !this.selectedQuestionIds.size) {
      this.taskError = 'Marca al menos un escenario y una pregunta.';
      return;
    }

    const task = this.data.assignTaskToGroup({
      groupId: this.selectedGroupId,
      situationId: this.selectedSituationId,
      scenarioIds: [...this.selectedScenarioIds],
      questionIds: [...this.selectedQuestionIds],
    });

    if (!task) {
      this.taskError = 'No se pudo crear la tarea. Verifica las selecciones del checklist.';
    }
  }
}
