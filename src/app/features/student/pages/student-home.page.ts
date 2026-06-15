import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ThreeBackgroundComponent } from '../../../shared/ui/three-background/three-background.component';
import { GameGroup, GroupTask } from '../../../models/academy.models';
import { AcademyDataService, DEMO_STUDENT_ID } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { GuideService } from '../../../shared/guide/services/guide.service';
import { StudentProfileService } from '../../../shared/guide/services/student-profile.service';
import { GameHudComponent } from '../../../shared/ui/game-hud/game-hud.component';
import { GameLogoutButtonComponent } from '../../../shared/ui/game-logout-button/game-logout-button.component';
import { GameProgressComponent } from '../../../shared/ui/game-progress/game-progress.component';

@Component({
  selector: 'app-student-home-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ThreeBackgroundComponent,
    GameProgressComponent,
    GameHudComponent,
    GameLogoutButtonComponent,
  ],
  template: `
    <app-three-background [intensity]="view === 'tasks' ? 'login' : 'ambient'" />
    <div class="student-shell student-with-guide" [class.mission-mode]="view === 'tasks'">
      @if (view !== 'tasks') {
        <app-game-hud
          [eyebrow]="'Estudiante · ' + pageTitle()"
          [title]="profile.characterName()"
          [subtitle]="'@' + profile.displayName()"
          [avatarId]="profile.avatarId()"
        >
          <a class="ghost-button hud-customize" routerLink="/student/perfil" hudActions>Personalizar</a>
          <app-game-logout-button hudActions label="Salir" [compact]="true" />
        </app-game-hud>

        <nav class="student-flow" aria-label="Navegacion del estudiante">
          <button type="button" class="active-nav" (click)="goBackInFlow()">{{ currentMenuLabel() }}</button>
          @if (unreadNotifications() > 0) {
            <button type="button" class="ghost-button" (click)="toggleNotifications()">
              Notificaciones ({{ unreadNotifications() }})
            </button>
          } @else {
            <button type="button" class="ghost-button" (click)="toggleNotifications()">Notificaciones</button>
          }
        </nav>

        @if (showNotifications()) {
          <section class="panel">
            <h3>Notificaciones</h3>
            <div class="task-list">
              @for (note of notifications(); track note.id) {
                <article class="task-row" [class.muted]="note.readAt">
                  <span>
                    <strong>{{ note.subject }}</strong>
                    <small>{{ note.body }}</small>
                    <small>{{ note.createdAt | date: 'short' }}</small>
                    @if (note.status === 'FAILED') {
                      <small class="form-error">Correo no enviado: {{ note.deliveryError }}</small>
                    }
                  </span>
                  @if (!note.readAt) {
                    <button type="button" class="ghost-button" (click)="markNotificationRead(note.id)">Marcar leída</button>
                  }
                </article>
              } @empty {
                <p class="muted">No tienes notificaciones.</p>
              }
            </div>
          </section>
        }
      }

      @if (view === 'groups') {
        <section class="student-view student-quick-enter">
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
        <section class="student-view student-quick-enter">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Grupo seleccionado</p>
              <h2>{{ selectedGroup()?.name ?? 'Tareas' }}</h2>
            </div>
            <button class="ghost-button" type="button" (click)="showGroups()">Volver a grupos</button>
          </div>

          <section class="panel">
            <div class="tasks-panel-head">
              <h2>Misiones del grupo</h2>
              @if (isDemoStudent()) {
                <button type="button" class="ghost-button reset-demo-btn" (click)="resetDemoSimulator()">
                  Reiniciar simulador demo
                </button>
              }
            </div>
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

    </div>
  `,
  styles: [
    `
      .student-with-guide {
        position: relative;
        width: 100%;
        max-width: var(--psy-content-max);
        margin-inline: auto;
        padding-bottom: clamp(0.5rem, 4vh, 2rem);
      }

      .student-bg-orb {
        position: fixed;
        z-index: -1;
        width: 42vw;
        max-width: 540px;
        aspect-ratio: 1;
        border-radius: 999px;
        filter: blur(90px);
        opacity: 0.18;
        pointer-events: none;
      }

      .orb-a {
        top: -12%;
        left: -12%;
        background: #4fc3ff;
      }

      .orb-b {
        right: -14%;
        bottom: -18%;
        background: #9b5cff;
      }

      .student-quick-enter {
        animation: student-quick-enter 260ms ease-out both;
      }

      @keyframes student-quick-enter {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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

      .hud-customize {
        font-size: 0.78rem;
        padding: 0.45rem 0.75rem;
        white-space: nowrap;
      }

      .tasks-panel-head {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 0.85rem;
      }

      .tasks-panel-head h2 {
        margin: 0;
      }

      .reset-demo-btn {
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--psy-gold);
        border-color: rgba(244, 197, 66, 0.45);
      }
    `,
  ],
})
export class StudentHomePage implements OnInit {
  view: 'groups' | 'tasks' = 'groups';
  selectedGroupId = '';

  readonly missionSession = signal(0);

  constructor(
    public readonly data: AcademyDataService,
    public readonly auth: AuthService,
    public readonly profile: StudentProfileService,
    private readonly notify: NotificationService,
    private readonly guide: GuideService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  readonly showNotifications = signal(false);

  ngOnInit(): void {
    console.log('Student module loaded');
    this.auth.ensureAuthenticatedOrRedirect();
    const initialGroupId = this.route.snapshot.queryParamMap.get('groupId');
    if (initialGroupId && this.groups().some((group) => group.id === initialGroupId)) {
      this.selectedGroupId = initialGroupId;
      this.view = 'tasks';
    }
    this.guide.setVisible(true);
    this.syncGuideContext();
    console.log('Student home ready · view:', this.view, '· groups:', this.groups().length);
  }

  pageTitle(): string {
    if (this.view === 'tasks') return 'Tareas del grupo';
    return 'Mis grupos';
  }

  pageIntro(): string {
    if (this.view === 'tasks') return 'Elige una mision pendiente para entrar al simulador.';
    return `Hola ${this.profile.displayName()}, selecciona tu grupo de entrenamiento.`;
  }

  currentMenuLabel(): string {
    if (this.view === 'tasks' && this.selectedGroup()) return this.selectedGroup()!.name;
    return 'Grupos';
  }

  student() {
    return this.auth.currentUser();
  }

  notifications() {
    const student = this.student();
    return student ? this.notify.notificationsForEmail(student.email) : [];
  }

  unreadNotifications(): number {
    const student = this.student();
    return student ? this.notify.unreadCount(student.email) : 0;
  }

  toggleNotifications(): void {
    this.showNotifications.update((v) => !v);
  }

  markNotificationRead(id: string): void {
    this.notify.markRead(id);
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
    this.view = 'tasks';
    this.scrollContentTop();
    this.syncGuideContext();
  }

  openTask(taskId: string): void {
    void this.router.navigate(['/student/mission', this.selectedGroupId, taskId]);
    this.guide.setVisible(true);
    this.guide.show('Mision clinica iniciada. Explora el campus y toma decisiones en cada zona.', 'encourage');
    console.log('Student opening task', taskId);
  }

  showGroups(): void {
    this.view = 'groups';
    this.scrollContentTop();
    this.syncGuideContext();
  }

  goBackInFlow(): void {
    if (this.view === 'tasks') this.showGroups();
  }

  tasks(): GroupTask[] {
    return this.selectedGroupId ? this.tasksForGroup(this.selectedGroupId) : [];
  }

  selectedGroup(): GameGroup | undefined {
    return this.groups().find((group) => group.id === this.selectedGroupId);
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

  isDemoStudent(): boolean {
    return this.student()?.id === DEMO_STUDENT_ID;
  }

  resetDemoSimulator(): void {
    this.data.resetDemoStudentProgress();
    this.missionSession.update((n) => n + 1);
    this.guide.show('Simulador demo reiniciado. Abre la mision para jugar desde cero.', 'encourage');
  }
  private syncGuideContext(): void {
    if (this.view === 'groups') this.guide.setContext('student_groups');
    else if (this.view === 'tasks') this.guide.setContext('student_tasks');
  }

  private scrollContentTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
