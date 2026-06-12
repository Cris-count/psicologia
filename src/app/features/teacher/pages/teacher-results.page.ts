import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';import { FormsModule } from '@angular/forms';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';
import { ExportResultsService } from '../../../services/export-results.service';
import { NotificationService } from '../../../services/notification.service';
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
      <div class="results-toolbar">
        <label class="compact-label">
          Grupo
          <select [(ngModel)]="selectedGroupId" name="resultsGroup">
            @for (group of groups(); track group.id) {
              <option [value]="group.id">{{ group.name }}</option>
            }
          </select>
        </label>
        <button type="button" class="ghost-button" (click)="exportCsv()">Exportar CSV (REQ-13)</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Caso / Tarea</th>
              <th>Avance</th>
              <th>Correctas</th>
              <th>Incorrectas</th>
              <th>Nota</th>
              <th>Pendientes</th>
              <th>Feedback docente</th>
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
                <td>
                  @if (row.notaFinal != null) {
                    <span class="grade-pill">{{ row.notaFinal.toFixed(1) }}</span>
                  } @else {
                    <span class="muted">—</span>
                  }
                </td>
                <td>{{ row.pending }}</td>
                <td>
                  @if (row.intentoId) {
                    <textarea
                      rows="2"
                      [ngModel]="feedbackDraft(row.intentoId)"
                      (ngModelChange)="setFeedbackDraft(row.intentoId, $event)"
                      name="fb-{{ row.intentoId }}"
                    ></textarea>
                    <button type="button" class="ghost-button" (click)="saveFeedback(row)">Guardar</button>
                  } @else {
                    <span class="muted">Sin intento final</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8">Sin resultados para el grupo seleccionado.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </article>

    @if (saveMessage()) {
      <p class="form-hint muted">{{ saveMessage() }}</p>
    }
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

      .grade-pill {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
        font-family: var(--psy-font-hud);
        font-size: 0.78rem;
        background: rgba(244, 197, 66, 0.15);
        color: var(--psy-gold);
        border: 1px solid rgba(244, 197, 66, 0.35);
      }

      .results-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      td textarea {
        width: 100%;
        min-width: 160px;
      }
    `,
  ],
})
export class TeacherResultsPage {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);
  private readonly exportResults = inject(ExportResultsService);
  private readonly notify = inject(NotificationService);

  selectedGroupId = '';
  private readonly feedbackDrafts = new Map<string, string>();
  readonly saveMessage = signal('');

  readonly groups = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.groupsByTeacher(teacher.id) : [];
  });

  readonly activeGroupId = computed(() => this.selectedGroupId || this.groups()[0]?.id || '');

  readonly resultRows = computed(() =>
    this.activeGroupId() ? this.data.resultRowsForGroup(this.activeGroupId()) : [],
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

  feedbackDraft(intentoId: string): string {
    if (this.feedbackDrafts.has(intentoId)) {
      return this.feedbackDrafts.get(intentoId)!;
    }
    const attempt = (this.data.store().intentosEstudiante ?? []).find((i) => i.id === intentoId);
    return attempt?.comentarioDocente ?? '';
  }

  setFeedbackDraft(intentoId: string, value: string): void {
    this.feedbackDrafts.set(intentoId, value);
  }

  saveFeedback(row: {
    student: { email: string };
    intentoId?: string;
    situation: { title: string };
  }): void {
    const teacher = this.auth.currentUser();
    if (!teacher || !row.intentoId) return;
    const comment = this.feedbackDraft(row.intentoId);
    if (comment.trim().length < 2) {
      this.saveMessage.set('Escribe al menos 2 caracteres de feedback.');
      return;
    }
    this.data.setAttemptTeacherFeedback(row.intentoId, teacher.id, comment);
    void this.notify.notifyTeacherFeedback(row.student.email, row.situation.title, comment.trim());
    this.saveMessage.set('Feedback guardado. Se notificó al estudiante por correo.');
  }

  exportCsv(): void {
    const rows = this.resultRows();
    const group = this.groups().find((g) => g.id === this.activeGroupId());
    if (!rows.length || !group) return;
    this.exportResults.downloadCsv(rows, group.name);
  }
}
