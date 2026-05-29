import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SituationCategory } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-cases-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Laboratorio de casos</p>
        <h2>Casos psicológicos</h2>
        <p>Crea, edita y habilita simulaciones para tus estudiantes.</p>
      </div>
      @if (canCreate()) {
        <a class="primary-button" routerLink="/teacher/casos/nuevo">+ Crear caso</a>
      }
    </header>

    @if (!canCreate()) {
      <article class="panel warn-panel">
        <p>Tu perfil no tiene permiso de creador de casos. Contacta al administrador para activar el flag REQ-01.</p>
      </article>
    }

    <section class="cases-grid">
      @for (situation of cases(); track situation.id) {
        <article class="panel case-card" [class.is-active]="situation.status === 'PUBLISHED'">
          <div class="case-card-head">
            <span class="game-badge" [class.game-badge-success]="situation.status === 'PUBLISHED'">
              {{ situation.status === 'PUBLISHED' ? 'Habilitado' : 'Borrador' }}
            </span>
            <span class="case-category">{{ categoryLabel(situation.category) }}</span>
          </div>
          <h3>{{ situation.title }}</h3>
          <p class="muted">{{ situation.description }}</p>
          <div class="case-meta">
            <span>{{ scenarioCount(situation.id) }} escenarios</span>
            <span>{{ questionCount(situation.id) }} preguntas</span>
            <span>{{ situation.difficulty }}</span>
          </div>
          <div class="case-actions">
            <a class="ghost-button" [routerLink]="['/teacher/casos', situation.id]">Editar</a>
            @if (canCreate()) {
              <button class="ghost-button" type="button" (click)="toggleEnabled(situation.id, situation.status !== 'PUBLISHED')">
                {{ situation.status === 'PUBLISHED' ? 'Deshabilitar' : 'Habilitar' }}
              </button>
              <button class="ghost-button danger" type="button" (click)="removeCase(situation.id)">Eliminar</button>
            }
          </div>
        </article>
      } @empty {
        <article class="panel empty-case">
          <span class="material-symbols-outlined" aria-hidden="true">psychology</span>
          <p>No hay casos creados aún.</p>
          @if (canCreate()) {
            <a class="primary-button" routerLink="/teacher/casos/nuevo">Crear primer caso</a>
          }
        </article>
      }
    </section>

    @if (feedback()) {
      <p class="game-badge game-badge-gold">{{ feedback() }}</p>
    }
  `,
  styles: [
    `
      .cases-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      .case-card {
        display: grid;
        gap: 0.65rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .case-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--psy-shadow-glow-cyan);
      }

      .case-card.is-active {
        border-color: var(--psy-border-neural);
      }

      .case-card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }

      .case-category {
        font-family: var(--psy-font-hud);
        font-size: 0.62rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--psy-accent);
      }

      .case-card h3 {
        margin: 0;
        font-family: var(--psy-font-display);
        color: var(--psy-primary);
        font-size: 1.05rem;
      }

      .case-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: 0.78rem;
        color: var(--psy-muted);
        font-family: var(--psy-font-hud);
      }

      .case-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.35rem;
      }

      .case-actions a,
      .case-actions button {
        flex: 1;
        min-width: 90px;
      }

      .ghost-button.danger {
        border-color: rgba(255, 68, 102, 0.45);
        color: var(--psy-danger);
      }

      .empty-case {
        grid-column: 1 / -1;
        text-align: center;
        padding: 2.5rem;
        display: grid;
        gap: 0.75rem;
        justify-items: center;
      }

      .empty-case .material-symbols-outlined {
        font-size: 3rem;
        color: var(--psy-accent);
      }

      .warn-panel {
        border-color: var(--psy-warning);
        color: var(--psy-warning);
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class TeacherCasesPage {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly feedback = signal('');

  readonly cases = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.situationsByTeacher(teacher.id) : [];
  });

  readonly canCreate = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.canTeacherCreateCases(teacher.id) : false;
  });

  categoryLabel(cat: SituationCategory): string {
    const labels: Record<SituationCategory, string> = {
      CLINICAL: 'Clínico',
      PSYCHOSOCIAL: 'Psicosocial',
      ETHICS: 'Ética',
      CRISIS: 'Crisis',
      DEVELOPMENT: 'Desarrollo',
      ORGANIZATIONAL: 'Organizacional',
    };
    return labels[cat] ?? cat;
  }

  scenarioCount(situationId: string): number {
    return this.data.scenariosForSituation(situationId).length;
  }

  questionCount(situationId: string): number {
    return this.data.questionsForSituation(situationId).length;
  }

  toggleEnabled(situationId: string, enable: boolean): void {
    this.data.setSituationEnabled(situationId, enable);
    this.feedback.set(enable ? 'Caso habilitado — visible para estudiantes vía tareas.' : 'Caso deshabilitado.');
  }

  removeCase(situationId: string): void {
    if (!this.data.deleteSituation(situationId)) {
      this.feedback.set('No se puede eliminar: el caso tiene tareas asignadas.');
      return;
    }
    this.feedback.set('Caso eliminado.');
  }
}
