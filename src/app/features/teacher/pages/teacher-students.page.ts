import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';

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
            <select [(ngModel)]="assignStudentId" name="assignStudent" required>
              @for (student of activeStudents(); track student.id) {
                <option [value]="student.id">{{ student.name }} — {{ student.email }}</option>
              }
            </select>
          </label>
          <button class="primary-button" type="submit">Asignar estudiante</button>
        </form>
      </article>
    </section>

    <article class="panel">
      <h3>Estudiantes registrados</h3>
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
            @for (student of activeStudents(); track student.id) {
              <tr>
                <td>{{ student.name }}</td>
                <td>{{ student.email }}</td>
                <td>{{ studentCode(student.id) }}</td>
                <td>
                  <span class="game-badge" [class.game-badge-success]="student.status === 'ACTIVE'">
                    {{ student.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ progressLabel(student.id) }}</td>
                <td class="row-actions">
                  <button class="ghost-button" type="button" (click)="editStudent(student)">Editar</button>
                  <button class="ghost-button danger" type="button" (click)="deactivateStudent(student.id)">Desactivar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6">No hay estudiantes registrados.</td></tr>
            }
          </tbody>
        </table>
      </div>
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

      .ghost-button.danger {
        border-color: rgba(255, 68, 102, 0.45);
        color: var(--psy-danger);
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

  readonly groups = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.groupsByTeacher(teacher.id) : [];
  });

  readonly activeStudents = computed(() => this.data.allStudents().filter((s) => s.status === 'ACTIVE'));

  studentCode(userId: string): string {
    return this.data.studentProfileFor(userId)?.code ?? '—';
  }

  progressLabel(studentId: string): string {
    const tasks = this.data.store().groupTasks.filter((task) => {
      const inGroup = this.data.store().groupStudents.some(
        (m) => m.groupId === task.groupId && m.studentId === studentId,
      );
      return inGroup;
    });
    if (!tasks.length) return 'Sin tareas';
    const avg =
      tasks.reduce((sum, task) => sum + this.data.progressFor(studentId, task.id).progressPercentage, 0) / tasks.length;
    return `${Math.round(avg)}% promedio`;
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
