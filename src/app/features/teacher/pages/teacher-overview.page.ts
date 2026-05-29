import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_NAME } from '../../../core/branding.constants';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Centro de comando neural</p>
        <h2>Dashboard del Profesor</h2>
        <p>Gestiona casos clínicos, estudiantes y monitorea la actividad de {{ appName }}.</p>
      </div>
      @if (canCreate()) {
        <a class="primary-button" routerLink="/teacher/casos/nuevo">+ Nuevo caso</a>
      }
    </header>

    <section class="metric-grid">
      <article class="metric-card neural-card">
        <span>Casos activos</span>
        <strong>{{ stats().activeCases }}</strong>
        <small>{{ stats().draftCases }} borradores</small>
      </article>
      <article class="metric-card">
        <span>Estudiantes</span>
        <strong>{{ stats().students }}</strong>
      </article>
      <article class="metric-card">
        <span>Grupos</span>
        <strong>{{ stats().groups }}</strong>
      </article>
      <article class="metric-card">
        <span>Tareas asignadas</span>
        <strong>{{ stats().tasks }}</strong>
      </article>
    </section>

    <section class="workspace-grid">
      <article class="panel">
        <h3>Actividad reciente</h3>
        <div class="activity-list">
          @for (situation of recentCases(); track situation.id) {
            <a class="list-item" [routerLink]="['/teacher/casos', situation.id]">
              <span>
                <strong>{{ situation.title }}</strong>
                <small>{{ situation.category }} · {{ situation.difficulty }}</small>
              </span>
              <span class="game-badge" [class.game-badge-success]="situation.status === 'PUBLISHED'">
                {{ situation.status === 'PUBLISHED' ? 'Activo' : 'Borrador' }}
              </span>
            </a>
          } @empty {
            <p class="muted">Aún no has creado casos.</p>
            @if (canCreate()) {
              <a class="primary-button" routerLink="/teacher/casos/nuevo">Crea el primero</a>
            }
          }
        </div>
      </article>

      <article class="panel">
        <h3>Accesos rápidos</h3>
        <div class="quick-actions">
          <a class="ghost-button" routerLink="/teacher/casos">Ver casos</a>
          <a class="ghost-button" routerLink="/teacher/estudiantes">Estudiantes</a>
          <a class="ghost-button" routerLink="/teacher/tareas">Asignar tareas</a>
          <a class="ghost-button" routerLink="/teacher/resultados">Resultados</a>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .neural-card {
        border-color: var(--psy-border-neural);
        box-shadow: var(--psy-shadow-glow-neural);
      }

      .neural-card strong {
        color: var(--psy-neural);
      }

      .metric-card small {
        color: var(--psy-muted);
        font-size: 0.78rem;
      }

      .activity-list,
      .quick-actions {
        display: grid;
        gap: 0.65rem;
      }

      .quick-actions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .quick-actions a {
        text-align: center;
        text-decoration: none;
      }

      .list-item {
        text-decoration: none;
        color: inherit;
      }
    `,
  ],
})
export class TeacherOverviewPage {
  protected readonly appName = APP_NAME;
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);

  readonly stats = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.teacherStats(teacher.id) : { activeCases: 0, draftCases: 0, students: 0, groups: 0, tasks: 0, totalCases: 0, publishedCases: 0 };
  });

  readonly recentCases = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.situationsByTeacher(teacher.id).slice(0, 5) : [];
  });

  readonly canCreate = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.canTeacherCreateCases(teacher.id) : false;
  });
}
