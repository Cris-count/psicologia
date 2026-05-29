import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-results-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Telemetría neural</p>
        <h2>Resultados</h2>
        <p>Monitorea avance, respuestas correctas y pendientes por estudiante.</p>
      </div>
    </header>

    <section class="metric-grid">
      <article class="metric-card neural-card">
        <span>Estudiantes evaluados</span>
        <strong>{{ summary().students }}</strong>
      </article>
      <article class="metric-card">
        <span>Avance promedio</span>
        <strong>{{ summary().avgProgress }}%</strong>
      </article>
      <article class="metric-card">
        <span>Respuestas correctas</span>
        <strong>{{ summary().correct }}</strong>
      </article>
      <article class="metric-card">
        <span>Pendientes</span>
        <strong>{{ summary().pending }}</strong>
      </article>
    </section>

    <article class="panel">
      <label class="compact-label">
        Grupo
        <select [(ngModel)]="selectedGroupId" name="resultsGroup">
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
              <th>Caso / Tarea</th>
              <th>Avance</th>
              <th>Correctas</th>
              <th>Incorrectas</th>
              <th>Pendientes</th>
            </tr>
          </thead>
          <tbody>
            @for (row of resultRows(); track row.student.id + row.task.id) {
              <tr>
                <td>
                  <strong>{{ row.student.name }}</strong>
                  <small class="muted">{{ row.student.email }}</small>
                </td>
                <td>{{ row.situation.title }}</td>
                <td>
                  <span class="progress-pill" [class.complete]="row.progress.progressPercentage === 100">
                    {{ row.progress.progressPercentage }}%
                  </span>
                </td>
                <td class="ok">{{ row.correct }}</td>
                <td class="bad">{{ row.incorrect }}</td>
                <td>{{ row.pending }}</td>
              </tr>
            } @empty {
              <tr><td colspan="6">Sin resultados para el grupo seleccionado.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `,
  styles: [
    `
      .neural-card {
        border-color: var(--psy-border-neural);
        box-shadow: var(--psy-shadow-glow-neural);
      }

      .progress-pill {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
        font-family: var(--psy-font-hud);
        font-size: 0.75rem;
        background: rgba(107, 140, 255, 0.1);
        color: var(--psy-primary);
        border: 1px solid var(--psy-line);
      }

      .progress-pill.complete {
        background: rgba(57, 255, 20, 0.12);
        color: var(--psy-neural);
        border-color: var(--psy-border-neural);
      }

      td small {
        display: block;
        font-size: 0.72rem;
      }

      .ok {
        color: var(--psy-neural);
        font-weight: 700;
      }

      .bad {
        color: var(--psy-danger);
        font-weight: 700;
      }
    `,
  ],
})
export class TeacherResultsPage {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);

  selectedGroupId = '';

  readonly groups = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.groupsByTeacher(teacher.id) : [];
  });

  readonly resultRows = computed(() =>
    this.selectedGroupId ? this.data.resultRowsForGroup(this.selectedGroupId) : [],
  );

  readonly summary = computed(() => {
    const rows = this.resultRows();
    if (!rows.length) {
      return { students: 0, avgProgress: 0, correct: 0, pending: 0 };
    }
    const uniqueStudents = new Set(rows.map((r) => r.student.id));
    return {
      students: uniqueStudents.size,
      avgProgress: Math.round(rows.reduce((s, r) => s + r.progress.progressPercentage, 0) / rows.length),
      correct: rows.reduce((s, r) => s + r.correct, 0),
      pending: rows.reduce((s, r) => s + r.pending, 0),
    };
  });
}
