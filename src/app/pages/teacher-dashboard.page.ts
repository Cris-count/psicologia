import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Difficulty, GameGroup, QuestionCategory, Situation, User } from '../models/academy.models';
import { AcademyDataService } from '../services/academy-data.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-teacher-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div>
          <p class="eyebrow">Docente</p>
          <h1>Aula de simulacion</h1>
          <p class="muted">Gestion pedagogica de grupos, casos y resultados.</p>
        </div>
        <nav>
          <button type="button" [class.active-nav]="activeSection === 'resumen'" (click)="showSection('resumen')">Resumen</button>
          <button type="button" [class.active-nav]="activeSection === 'grupos'" (click)="showSection('grupos')">Grupos de juego</button>
          <button type="button" [class.active-nav]="activeSection === 'estudiantes'" (click)="showSection('estudiantes')">Estudiantes</button>
          <button type="button" [class.active-nav]="activeSection === 'situaciones'" (click)="showSection('situaciones')">Situaciones</button>
          <button type="button" [class.active-nav]="activeSection === 'resultados'" (click)="showSection('resultados')">Resultados</button>
        </nav>
        <button class="ghost-button" type="button" (click)="auth.logout()">Cerrar sesion</button>
      </aside>

      <main class="content">
        <section id="resumen" class="page-header">
          <div>
            <p class="eyebrow">MVP academico</p>
            <h2>Panel del profesor</h2>
            <p>
              Estructura inicial para crear casos situacionales, asignarlos a grupos y revisar avances sin
              presentarlo como herramienta real de intervencion.
            </p>
          </div>
          <div class="status-note">Usuario: {{ teacher()?.name }}</div>
        </section>

        <section class="metric-grid" [hidden]="activeSection !== 'resumen'">
          <article class="metric-card">
            <span>Total grupos</span>
            <strong>{{ groups().length }}</strong>
          </article>
          <article class="metric-card">
            <span>Estudiantes vinculados</span>
            <strong>{{ students().length }}</strong>
          </article>
          <article class="metric-card">
            <span>Situaciones creadas</span>
            <strong>{{ situations().length }}</strong>
          </article>
          <article class="metric-card">
            <span>Publicadas</span>
            <strong>{{ publishedSituations().length }}</strong>
          </article>
        </section>

        <section id="grupos" class="workspace-grid" [hidden]="activeSection !== 'grupos'">
          <article class="panel">
            <h3>Crear grupo de juego</h3>
            <form class="stack-form" (ngSubmit)="createGroup()">
              <label>Nombre <input name="groupName" [(ngModel)]="groupName" required /></label>
              <label>Descripcion <textarea name="groupDescription" [(ngModel)]="groupDescription"></textarea></label>
              <button class="primary-button" type="submit">Crear grupo</button>
            </form>
          </article>

          <article class="panel">
            <h3>Grupos activos</h3>
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

        <section id="estudiantes" class="section-heading" [hidden]="activeSection !== 'estudiantes'">
          <div>
            <p class="eyebrow">Gestion academica</p>
            <h2>Estudiantes</h2>
          </div>
          <p>Crear credenciales, vincular estudiantes a grupos y revisar su participacion.</p>
        </section>

        <section class="workspace-grid" [hidden]="activeSection !== 'estudiantes'">
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

        <section id="situaciones" class="workspace-grid wide-left" [hidden]="activeSection !== 'situaciones'">
          <article class="panel">
            <h3>Crear situacion</h3>
            <form class="stack-form" (ngSubmit)="createSituation()">
              <label>Titulo <input name="situationTitle" [(ngModel)]="situationTitle" required /></label>
              <label>Descripcion <textarea name="situationDescription" [(ngModel)]="situationDescription"></textarea></label>
              <label>Contexto narrativo <textarea name="situationContext" [(ngModel)]="situationContext"></textarea></label>
              <label>Objetivo de aprendizaje <textarea name="learningObjective" [(ngModel)]="learningObjective"></textarea></label>
              <label>
                Dificultad
                <select name="difficulty" [(ngModel)]="difficulty">
                  <option value="BASIC">Basica</option>
                  <option value="INTERMEDIATE">Intermedia</option>
                  <option value="ADVANCED">Avanzada</option>
                </select>
              </label>
              <button class="primary-button" type="submit">Crear situacion</button>
            </form>
          </article>

          <article class="panel">
            <h3>Situaciones</h3>
            <div class="list">
              @for (situation of situations(); track situation.id) {
                <div class="case-item">
                  <button class="plain-select" type="button" (click)="selectedSituationId = situation.id">
                    <strong>{{ situation.title }}</strong>
                    <small>{{ situation.status }} - {{ situation.difficulty }}</small>
                  </button>
                  <select [ngModel]="situation.status" (ngModelChange)="changeStatus(situation, $event)" [name]="'status-' + situation.id">
                    <option value="DRAFT">Borrador</option>
                    <option value="PUBLISHED">Publicada</option>
                    <option value="ARCHIVED">Archivada</option>
                  </select>
                </div>
              }
            </div>
          </article>
        </section>

        <section class="workspace-grid" [hidden]="activeSection !== 'situaciones'">
          <article class="panel">
            <h3>Crear escenario</h3>
            <form class="stack-form" (ngSubmit)="createScenario()">
              <label>
                Situacion
                <select name="scenarioSituation" [(ngModel)]="selectedSituationId" required>
                  @for (situation of situations(); track situation.id) {
                    <option [value]="situation.id">{{ situation.title }}</option>
                  }
                </select>
              </label>
              <label>Titulo <input name="scenarioTitle" [(ngModel)]="scenarioTitle" required /></label>
              <label>Contexto <textarea name="scenarioContext" [(ngModel)]="scenarioContext"></textarea></label>
              <label>Instrucciones <textarea name="scenarioInstructions" [(ngModel)]="scenarioInstructions"></textarea></label>
              <button class="primary-button" type="submit">Agregar escenario</button>
            </form>
          </article>

          <article class="panel">
            <h3>Crear pregunta</h3>
            <form class="stack-form" (ngSubmit)="createQuestion()">
              <label>
                Escenario
                <select name="questionScenario" [(ngModel)]="selectedScenarioId" required>
                  @for (scenario of scenariosForSelectedSituation(); track scenario.id) {
                    <option [value]="scenario.id">{{ scenario.title }}</option>
                  }
                </select>
              </label>
              <label>Enunciado <textarea name="questionStatement" [(ngModel)]="questionStatement" required></textarea></label>
              <label>
                Categoria
                <select name="questionCategory" [(ngModel)]="questionCategory">
                  <option value="TECHNICAL">Tecnica</option>
                  <option value="ETHICAL">Etica</option>
                  <option value="NORMATIVE">Normativa</option>
                  <option value="PSYCHOSOCIAL">Psicosocial</option>
                  <option value="CARE_ROUTE">Ruta de atencion</option>
                </select>
              </label>
              <label>Retroalimentacion <textarea name="questionFeedback" [(ngModel)]="questionFeedback"></textarea></label>
              @for (option of questionOptions; track $index) {
                <label>
                  Opcion {{ $index + 1 }}
                  <input [name]="'option-' + $index" [(ngModel)]="questionOptions[$index]" required />
                </label>
              }
              <label>
                Opcion mas adecuada
                <select name="correctIndex" [(ngModel)]="correctIndex">
                  @for (option of questionOptions; track $index) {
                    <option [ngValue]="$index">Opcion {{ $index + 1 }}</option>
                  }
                </select>
              </label>
              <div class="button-row">
                <button class="ghost-button" type="button" (click)="addOption()">Agregar opcion</button>
                <button class="primary-button" type="submit">Guardar pregunta</button>
              </div>
            </form>
          </article>
        </section>

        <section class="workspace-grid" [hidden]="activeSection !== 'situaciones' && activeSection !== 'resultados'">
          <article class="panel" [hidden]="activeSection !== 'situaciones'">
            <h3>Asignar situacion a grupo</h3>
            <form class="stack-form" (ngSubmit)="assignSituation()">
              <label>
                Grupo
                <select name="assignGroup" [(ngModel)]="selectedGroupId" required>
                  @for (group of groups(); track group.id) {
                    <option [value]="group.id">{{ group.name }}</option>
                  }
                </select>
              </label>
              <label>
                Situacion
                <select name="assignSituation" [(ngModel)]="selectedSituationId" required>
                  @for (situation of situations(); track situation.id) {
                    <option [value]="situation.id">{{ situation.title }}</option>
                  }
                </select>
              </label>
              <button class="primary-button" type="submit">Asignar al grupo</button>
            </form>
          </article>

          <article id="resultados" class="panel" [hidden]="activeSection !== 'resultados'">
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
                    <th>Situacion</th>
                    <th>Avance</th>
                    <th>Correctas</th>
                    <th>Pendientes</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of resultRows(); track row.student.id + row.situation.id) {
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
          </article>
        </section>
      </main>
    </div>
  `,
})
export class TeacherDashboardPage {
  activeSection: 'resumen' | 'grupos' | 'estudiantes' | 'situaciones' | 'resultados' = 'resumen';
  groupName = '';
  groupDescription = '';
  studentName = '';
  studentEmail = '';
  studentPassword = 'demo123';
  studentCode = '';
  selectedGroupId = 'grp-demo';
  selectedStudentId = 'usr-student-demo';
  selectedSituationId = 'sit-demo';
  selectedScenarioId = 'sce-hospital';
  situationTitle = '';
  situationDescription = '';
  situationContext = '';
  learningObjective = '';
  difficulty: Difficulty = 'INTERMEDIATE';
  scenarioTitle = '';
  scenarioContext = '';
  scenarioInstructions = '';
  questionStatement = '';
  questionCategory: QuestionCategory = 'TECHNICAL';
  questionFeedback = '';
  questionOptions = ['', ''];
  correctIndex = 0;

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

  situations(): Situation[] {
    const teacher = this.teacher();
    return teacher ? this.data.situationsByTeacher(teacher.id) : [];
  }

  publishedSituations(): Situation[] {
    return this.situations().filter((situation) => situation.status === 'PUBLISHED');
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

  scenariosForSelectedSituation() {
    return this.data.scenariosForSituation(this.selectedSituationId);
  }

  resultRows() {
    return this.selectedGroupId ? this.data.resultRowsForGroup(this.selectedGroupId) : [];
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

  createSituation(): void {
    const teacher = this.teacher();
    if (!teacher || !this.situationTitle.trim()) {
      return;
    }
    this.data.createSituation(
      teacher.id,
      this.situationTitle,
      this.situationDescription,
      this.situationContext,
      this.learningObjective,
      this.difficulty,
    );
    this.situationTitle = '';
    this.situationDescription = '';
    this.situationContext = '';
    this.learningObjective = '';
    this.selectedSituationId = this.situations()[0]?.id ?? '';
  }

  changeStatus(situation: Situation, status: Situation['status']): void {
    this.data.updateSituationStatus(situation.id, status);
  }

  createScenario(): void {
    if (!this.selectedSituationId || !this.scenarioTitle.trim()) {
      return;
    }
    this.data.createScenario(this.selectedSituationId, this.scenarioTitle, this.scenarioContext, this.scenarioInstructions);
    this.scenarioTitle = '';
    this.scenarioContext = '';
    this.scenarioInstructions = '';
    this.selectedScenarioId = this.scenariosForSelectedSituation().at(-1)?.id ?? this.selectedScenarioId;
  }

  addOption(): void {
    this.questionOptions = [...this.questionOptions, ''];
  }

  createQuestion(): void {
    if (!this.selectedScenarioId || !this.questionStatement.trim()) {
      return;
    }
    this.data.createQuestion(this.selectedScenarioId, {
      statement: this.questionStatement,
      category: this.questionCategory,
      feedback: this.questionFeedback,
      options: this.questionOptions,
      correctIndex: this.correctIndex,
    });
    this.questionStatement = '';
    this.questionFeedback = '';
    this.questionOptions = ['', ''];
    this.correctIndex = 0;
  }

  assignSituation(): void {
    if (this.selectedGroupId && this.selectedSituationId) {
      this.data.assignSituationToGroup(this.selectedGroupId, this.selectedSituationId);
    }
  }
}
