import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';

type StudentRow = {
  student: User;
  code: string;
  progressLabel: string;
};

type StudentOption = {
  id: string;
  label: string;
  searchText: string;
  student: User;
  code: string;
};

const STUDENT_PAGE_SIZE = 40;
const ASSIGN_STUDENT_LIMIT = 40;

@Component({
  selector: 'app-teacher-students-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Red neural de aprendices</p>
        <h2>Estudiantes</h2>
        <p>Crea credenciales, gestiona acceso y asigna estudiantes a grupos.</p>
      </div>
    </header>

    <section class="workspace-grid">
      <article class="panel editor-panel">
        <h3>{{ editingStudentId() ? 'Editar estudiante' : 'Crear estudiante' }}</h3>
        <form class="stack-form" (ngSubmit)="saveStudent()">
          <label>Nombre <input [(ngModel)]="studentName" name="studentName" required /></label>
          <label>Correo <input type="email" [(ngModel)]="studentEmail" name="studentEmail" required /></label>
          @if (!editingStudentId()) {
            <label>Contraseña <input [(ngModel)]="studentPassword" name="studentPassword" required /></label>
          }
          <label>Identificador / Código <input [(ngModel)]="studentCodeInput" name="studentCode" /></label>
          <div class="button-row">
            <button class="primary-button" type="submit">{{ editingStudentId() ? 'Guardar cambios' : 'Crear estudiante' }}</button>
            @if (editingStudentId()) {
              <button class="ghost-button" type="button" (click)="cancelEdit()">Cancelar</button>
            }
          </div>
        </form>
      </article>

      <article class="panel">
        <h3>Asignar a grupo</h3>
        <form class="stack-form" (ngSubmit)="assignToGroup()">
          <label>Grupo
            <select [(ngModel)]="assignGroupId" name="assignGroup" required>
              @for (group of groups(); track group.id) {
                <option [value]="group.id">{{ group.name }}</option>
              }
            </select>
          </label>
          <label>Estudiante
            <input
              type="search"
              [ngModel]="assignSearchTerm()"
              (ngModelChange)="assignSearchTerm.set($event)"
              name="assignSearch"
              placeholder="Buscar por nombre, correo o código"
            />
            <select [(ngModel)]="assignStudentId" name="assignStudent" required>
              @for (option of assignStudentOptions(); track option.id) {
                <option [value]="option.id">{{ option.label }}</option>
              }
            </select>
            @if (hasMoreAssignOptions()) {
              <small class="muted">Refina la búsqueda para ver más resultados.</small>
            }
          </label>
          <button class="primary-button" type="submit">Asignar estudiante</button>
        </form>
      </article>
    </section>

    <article class="panel">
      <div class="students-panel-head">
        <div>
          <h3>Estudiantes registrados</h3>
          <p class="muted">Mostrando {{ visibleStudentRows().length }} de {{ filteredStudentCount() }} estudiantes.</p>
        </div>
        <label class="compact-search">
          Buscar
          <input
            type="search"
            [ngModel]="studentSearchTerm()"
            (ngModelChange)="updateStudentSearch($event)"
            name="studentSearch"
            placeholder="Nombre, correo o código"
          />
        </label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Código</th>
              <th>Estado</th>
              <th>Progreso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (row of visibleStudentRows(); track row.student.id) {
              <tr>
                <td>{{ row.student.name }}</td>
                <td>{{ row.student.email }}</td>
                <td>{{ row.code }}</td>
                <td>
                  <span class="game-badge" [class.game-badge-success]="row.student.status === 'ACTIVE'">
                    {{ row.student.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ row.progressLabel }}</td>
                <td class="row-actions">
                  <button class="ghost-button" type="button" (click)="editStudent(row.student)">Editar</button>
                  <button class="ghost-button danger" type="button" (click)="deactivateStudent(row.student.id)">Desactivar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6">No hay estudiantes registrados.</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (canShowMoreStudents()) {
        <div class="load-more-row">
          <button class="ghost-button" type="button" (click)="showMoreStudents()">Mostrar más estudiantes</button>
        </div>
      }
    </article>

    @if (message()) {
      <p class="game-badge game-badge-gold">{{ message() }}</p>
    }
  `,
  styles: [
    `
      .row-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .students-panel-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .students-panel-head h3,
      .students-panel-head p {
        margin: 0;
      }

      .compact-search {
        width: min(320px, 100%);
      }

      .load-more-row {
        display: flex;
        justify-content: center;
        padding-top: 1rem;
      }

      .ghost-button.danger {
        border-color: rgba(255, 68, 102, 0.45);
        color: var(--psy-danger);
      }

      @media (max-width: 760px) {
        .students-panel-head {
          display: grid;
        }
      }
    `,
  ],
})
export class TeacherStudentsPage {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);

  readonly message = signal('');
  readonly editingStudentId = signal<string | null>(null);

  studentName = '';
  studentEmail = '';
  studentPassword = 'demo123';
  studentCodeInput = '';
  assignGroupId = '';
  assignStudentId = '';

  readonly studentSearchTerm = signal('');
  readonly assignSearchTerm = signal('');
  readonly visibleStudentCount = signal(STUDENT_PAGE_SIZE);

  readonly groups = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.groupsByTeacher(teacher.id) : [];
  });

  readonly studentOptions = computed<StudentOption[]>(() => {
    const store = this.data.store();
    const activeStudents = store.users.filter((student) => student.role === 'STUDENT' && student.status === 'ACTIVE');
    const profileCodeByStudentId = new Map(store.studentProfiles.map((profile) => [profile.userId, profile.code]));

    return activeStudents.map((student) => {
      const code = profileCodeByStudentId.get(student.id) ?? '—';
      return {
        id: student.id,
        student,
        code,
        label: `${student.name} — ${student.email}`,
        searchText: `${student.name} ${student.email} ${code}`.toLowerCase(),
      };
    });
  });

  readonly filteredStudentOptions = computed(() => {
    const term = this.studentSearchTerm().trim().toLowerCase();
    if (!term) return this.studentOptions();
    return this.studentOptions().filter((option) => option.searchText.includes(term));
  });

  readonly filteredStudentCount = computed(() => this.filteredStudentOptions().length);

  readonly progressIndex = computed(() => {
    const store = this.data.store();
    const groupIdsByStudentId = new Map<string, Set<string>>();
    const tasksByGroupId = new Map<string, typeof store.groupTasks>();
    const progressByStudentTask = new Map(
      store.studentProgress.map((progress) => [`${progress.studentId}:${progress.taskId}`, progress.progressPercentage]),
    );

    for (const membership of store.groupStudents) {
      const groupIds = groupIdsByStudentId.get(membership.studentId) ?? new Set<string>();
      groupIds.add(membership.groupId);
      groupIdsByStudentId.set(membership.studentId, groupIds);
    }

    for (const task of store.groupTasks) {
      const tasks = tasksByGroupId.get(task.groupId) ?? [];
      tasks.push(task);
      tasksByGroupId.set(task.groupId, tasks);
    }

    return { groupIdsByStudentId, tasksByGroupId, progressByStudentTask };
  });

  readonly visibleStudentRows = computed<StudentRow[]>(() => {
    const index = this.progressIndex();
    return this.filteredStudentOptions()
      .slice(0, this.visibleStudentCount())
      .map((option) => {
        const groupIds = index.groupIdsByStudentId.get(option.id) ?? new Set<string>();
        let taskCount = 0;
        let progressTotal = 0;

        for (const groupId of groupIds) {
          for (const task of index.tasksByGroupId.get(groupId) ?? []) {
            taskCount += 1;
            progressTotal += index.progressByStudentTask.get(`${option.id}:${task.id}`) ?? 0;
          }
        }

        return {
          student: option.student,
          code: option.code,
          progressLabel: taskCount ? `${Math.round(progressTotal / taskCount)}% promedio` : 'Sin tareas',
        };
      });
  });

  readonly filteredAssignStudentOptions = computed(() => {
    const term = this.assignSearchTerm().trim().toLowerCase();
    if (!term) return this.studentOptions();
    return this.studentOptions().filter((option) => option.searchText.includes(term));
  });

  readonly assignStudentOptions = computed(() => this.filteredAssignStudentOptions().slice(0, ASSIGN_STUDENT_LIMIT));

  readonly hasMoreAssignOptions = computed(() => this.filteredAssignStudentOptions().length > ASSIGN_STUDENT_LIMIT);

  readonly canShowMoreStudents = computed(() => this.visibleStudentRows().length < this.filteredStudentCount());

  updateStudentSearch(term: string): void {
    this.studentSearchTerm.set(term);
    this.visibleStudentCount.set(STUDENT_PAGE_SIZE);
  }

  showMoreStudents(): void {
    this.visibleStudentCount.update((count) => count + STUDENT_PAGE_SIZE);
  }

  saveStudent(): void {
    if (!this.studentName.trim() || !this.studentEmail.trim()) return;

    if (this.editingStudentId()) {
      this.data.updateStudent(this.editingStudentId()!, this.studentName, this.studentEmail, this.studentCodeInput);
      this.message.set('Estudiante actualizado.');
      this.cancelEdit();
      return;
    }

    if (!this.studentPassword.trim()) return;
    const created = this.data.createStudent(this.studentName, this.studentEmail, this.studentPassword, this.studentCodeInput);
    this.assignStudentId = created.id;
    this.studentName = '';
    this.studentEmail = '';
    this.studentPassword = 'demo123';
    this.studentCodeInput = '';
    this.message.set('Estudiante creado.');
  }

  editStudent(student: User): void {
    this.editingStudentId.set(student.id);
    this.studentName = student.name;
    this.studentEmail = student.email;
    this.studentCodeInput = this.data.studentProfileFor(student.id)?.code ?? '';
  }

  cancelEdit(): void {
    this.editingStudentId.set(null);
    this.studentName = '';
    this.studentEmail = '';
    this.studentPassword = 'demo123';
    this.studentCodeInput = '';
  }

  assignToGroup(): void {
    if (this.assignGroupId && this.assignStudentId) {
      this.data.addStudentToGroup(this.assignGroupId, this.assignStudentId);
      this.message.set('Estudiante asignado al grupo.');
    }
  }

  deactivateStudent(userId: string): void {
    this.data.deleteStudent(userId);
    this.message.set('Estudiante desactivado.');
  }
}
