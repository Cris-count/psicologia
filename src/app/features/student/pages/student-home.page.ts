import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameGroup, GroupTask } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';
import { GameAnimateDirective } from '../../../shared/directives/game-animate.directive';
import { GuideService } from '../../../shared/guide/services/guide.service';
import { StudentProfileService } from '../../../shared/guide/services/student-profile.service';
import { GameHudComponent } from '../../../shared/ui/game-hud/game-hud.component';
import { GameLogoutButtonComponent } from '../../../shared/ui/game-logout-button/game-logout-button.component';
import { GameProgressComponent } from '../../../shared/ui/game-progress/game-progress.component';
import { ThreeBackgroundComponent } from '../../../shared/ui/three-background/three-background.component';
import { ClinicalMissionComponent } from '../mission/clinical-mission.component';

@Component({
  selector: 'app-student-home-page',
  imports: [
    CommonModule,
    FormsModule,
    ThreeBackgroundComponent,
    GameProgressComponent,
    GameHudComponent,
    GameLogoutButtonComponent,
    GameAnimateDirective,
    ClinicalMissionComponent,
  ],
  template: `
    <app-three-background [intensity]="view === 'task' ? 'login' : 'ambient'" />
    <div class="student-shell student-with-guide" [class.mission-mode]="view === 'task'">
      @if (view !== 'task') {
        <app-game-hud
          [eyebrow]="'Estudiante · ' + pageTitle()"
          [title]="profile.displayName()"
          [subtitle]="pageIntro()"
          [level]="7"
          [xpPercent]="progressPercent()"
          [avatarId]="profile.profile()?.avatarId ?? null"
        >
          <app-game-logout-button hudActions label="Salir" [compact]="true" />
        </app-game-hud>

        <nav class="student-flow" aria-label="Navegacion del estudiante">
          <button type="button" class="active-nav" (click)="goBackInFlow()">{{ currentMenuLabel() }}</button>
        </nav>
      }

      @if (view === 'groups') {
        <section class="student-view" appGameAnimate="fade-up">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Menu de grupos</p>
              <h2>Grupos inscritos</h2>
            </div>
            <p>Selecciona un grupo para ver las tareas que tu profesor asigno.</p>
          </div>

          <div class="student-card-grid">
            @for (group of groups(); track group.id) {
              <button class="classroom-card group-entry-card" type="button" (click)="openGroup(group.id)">
                <span class="entry-topline">
                  <strong>{{ group.name }}</strong>
                  <small>{{ pendingTasksForGroup(group.id) }} pendientes</small>
                </span>
                <span>{{ group.description }}</span>
                <small>{{ tasksForGroup(group.id).length }} tareas asignadas</small>
              </button>
            } @empty {
              <article class="panel">
                <p class="muted">Aun no perteneces a ningun grupo.</p>
              </article>
            }
          </div>
        </section>
      }

      @if (view === 'tasks') {
        <section class="student-view">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Grupo seleccionado</p>
              <h2>{{ selectedGroup()?.name ?? 'Tareas' }}</h2>
            </div>
            <button class="ghost-button" type="button" (click)="showGroups()">Volver a grupos</button>
          </div>

          <section class="panel">
            <h2>Misiones del grupo</h2>
            <div class="task-list">
              @for (task of tasks(); track task.id) {
                <button class="task-row" type="button" (click)="openTask(task.id)">
                  <span>
                    <strong>{{ taskTitle(task) }}</strong>
                    <small>{{ task.scenarioIds.length }} zonas · {{ task.questionIds.length }} decisiones</small>
                  </span>
                  <span class="task-progress">
                    <app-game-progress [value]="progress(task.id).progressPercentage" />
                    <small>{{ taskState(task.id) }}</small>
                  </span>
                </button>
              } @empty {
                <p class="muted">Este grupo aun no tiene tareas asignadas.</p>
              }
            </div>
          </section>
        </section>
      }

      @if (view === 'task') {
        @if (selectedTask(); as task) {
          <app-clinical-mission
            [task]="task"
            [groupName]="selectedGroup()?.name ?? 'Misión'"
            (exitMission)="showTasks()"
          />
        }
      }
    </div>
  `,
  styles: [
    `
      .student-with-guide {
        width: 100%;
        max-width: var(--psy-content-max);
        margin-inline: auto;
        padding-bottom: clamp(0.5rem, 4vh, 2rem);
      }

      .student-with-guide.mission-mode {
        max-width: 100%;
        padding: 0;
        min-height: 92vh;
      }

      @media (min-width: 901px) {
        .student-with-guide {
          padding-right: clamp(1rem, 3vw, 2rem);
          padding-left: clamp(1rem, 3vw, 2rem);
        }
      }

      @media (max-width: 900px) {
        .student-with-guide {
          padding-bottom: clamp(0.5rem, 4vh, 2rem);
        }
      }
    `,
  ],
})
export class StudentHomePage implements OnInit {
  view: 'groups' | 'tasks' | 'task' = 'groups';
  selectedGroupId = '';
  selectedTaskId = '';

  constructor(
    public readonly data: AcademyDataService,
    public readonly auth: AuthService,
    public readonly profile: StudentProfileService,
    private readonly guide: GuideService,
  ) {}

  ngOnInit(): void {
    this.auth.ensureAuthenticatedOrRedirect();
    this.guide.setVisible(true);
    this.syncGuideContext();
  }

  pageTitle(): string {
    if (this.view === 'task') return 'Misión clínica';
    if (this.view === 'tasks') return 'Tareas del grupo';
    return 'Mis grupos';
  }

  pageIntro(): string {
    if (this.view === 'task') return 'Modo misión activo — GARY te acompaña en el mundo mental.';
    if (this.view === 'tasks') return 'Elige una misión pendiente para entrar al simulador.';
    return `Hola ${this.profile.displayName()}, selecciona tu grupo de entrenamiento.`;
  }

  currentMenuLabel(): string {
    if (this.view === 'task' && this.selectedTask()) return this.taskTitle(this.selectedTask()!);
    if ((this.view === 'tasks' || this.view === 'task') && this.selectedGroup()) return this.selectedGroup()!.name;
    return 'Grupos';
  }

  student() {
    return this.auth.currentUser();
  }

  groups(): GameGroup[] {
    const student = this.student();
    return student ? this.data.groupsForStudent(student.id) : [];
  }

  tasksForGroup(groupId: string): GroupTask[] {
    const student = this.student();
    return student ? this.data.tasksForStudentInGroup(student.id, groupId) : [];
  }

  openGroup(groupId: string): void {
    this.selectedGroupId = groupId;
    this.selectedTaskId = '';
    this.view = 'tasks';
    this.scrollContentTop();
    this.syncGuideContext();
  }

  openTask(taskId: string): void {
    this.selectedTaskId = taskId;
    this.view = 'task';
    this.scrollContentTop();
    this.syncGuideContext();
    this.guide.setVisible(true);
    this.guide.show('Misión clínica iniciada. Explora el mapa mental y toma decisiones en cada zona.', 'encourage');
  }

  showGroups(): void {
    this.view = 'groups';
    this.scrollContentTop();
    this.syncGuideContext();
  }

  showTasks(): void {
    if (this.selectedGroupId) {
      this.view = 'tasks';
      this.scrollContentTop();
      this.syncGuideContext();
    }
  }

  goBackInFlow(): void {
    if (this.view === 'task') {
      this.showTasks();
      return;
    }
    if (this.view === 'tasks') this.showGroups();
  }

  tasks(): GroupTask[] {
    return this.selectedGroupId ? this.tasksForGroup(this.selectedGroupId) : [];
  }

  selectedGroup(): GameGroup | undefined {
    return this.groups().find((group) => group.id === this.selectedGroupId);
  }

  selectedTask(): GroupTask | undefined {
    return this.tasks().find((task) => task.id === this.selectedTaskId);
  }

  taskTitle(task: GroupTask): string {
    return this.data.situationForTask(task)?.title ?? 'Tarea';
  }

  progress(taskId: string) {
    const student = this.student();
    return student
      ? this.data.progressFor(student.id, taskId)
      : { progressPercentage: 0, completed: false, id: '', studentId: '', taskId, updatedAt: '' };
  }

  taskState(taskId: string): string {
    const p = this.progress(taskId);
    return p.completed ? 'Completada' : `Pendiente ${p.progressPercentage}%`;
  }

  pendingTasksForGroup(groupId: string): number {
    return this.tasksForGroup(groupId).filter((task) => !this.progress(task.id).completed).length;
  }

  progressPercent(): number {
    const tasks = this.groups().flatMap((group) => this.tasksForGroup(group.id));
    if (!tasks.length) return 0;
    const total = tasks.reduce((sum, task) => sum + this.progress(task.id).progressPercentage, 0);
    return Math.round(total / tasks.length);
  }

  private syncGuideContext(): void {
    if (this.view === 'groups') this.guide.setContext('student_groups');
    else if (this.view === 'tasks') this.guide.setContext('student_tasks');
    else if (this.view === 'task') this.guide.setContext('student_task');
  }

  private scrollContentTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
