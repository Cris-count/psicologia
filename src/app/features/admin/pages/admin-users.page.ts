import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AcademyDataService } from '../../../services/academy-data.service';
import { CreateStudentDto, CreateTeacherDto } from '../data/admin-api.contracts';
import { AdminUsersService } from '../services/admin-users.service';

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <header class="admin-page-title">
      <p class="eyebrow">REQ-01</p>
      <h2>Gestión de usuarios y permisos</h2>
      <p class="admin-page-subtitle">Crea perfiles y asigna el flag de creador de casos a docentes autorizados.</p>
    </header>

    <section class="admin-grid-2" style="align-items: start">
      <article class="admin-card">
        <h3>Crear docente</h3>
        <form class="admin-form-grid" [formGroup]="teacherForm" (ngSubmit)="createTeacher()">
          <label>Nombre <input formControlName="name" required /></label>
          <label>Correo <input formControlName="email" type="email" required /></label>
          <label>Contraseña <input formControlName="password" type="password" required /></label>
          <label>Institución <input formControlName="institution" required /></label>
          <label>Área <input formControlName="area" required /></label>
          <label class="admin-checkbox-label">
            <input formControlName="canCreateCases" type="checkbox" />
            Autorizado como creador de casos
          </label>
          <button class="admin-btn primary" type="submit" [disabled]="teacherForm.invalid">Registrar docente</button>
        </form>
      </article>

      <article class="admin-card">
        <h3>Crear estudiante</h3>
        <form class="admin-form-grid" [formGroup]="studentForm" (ngSubmit)="createStudent()">
          <label>Nombre <input formControlName="name" required /></label>
          <label>Correo <input formControlName="email" type="email" required /></label>
          <label>Contraseña <input formControlName="password" type="password" required /></label>
          <label>Código académico <input formControlName="code" required /></label>
          <button class="admin-btn primary" type="submit" [disabled]="studentForm.invalid">Registrar estudiante</button>
        </form>
      </article>
    </section>

    @if (feedback()) {
      <p class="admin-badge stable" style="margin-bottom: 1rem">{{ feedback() }}</p>
    }

    <article class="admin-card">
      <h3>Usuarios registrados</h3>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Creador de casos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (row of users(); track row.user.id) {
              <tr>
                <td>{{ row.user.name }}</td>
                <td>{{ row.user.email }}</td>
                <td>{{ row.role === 'TEACHER' ? 'Docente' : 'Estudiante' }}</td>
                <td>
                  <span class="admin-badge" [class.stable]="row.status === 'ACTIVE'" [class.warn]="row.status === 'INACTIVE'">
                    {{ row.status }}
                  </span>
                </td>
                <td>
                  @if (row.role === 'TEACHER') {
                    <button class="admin-btn ghost" type="button" (click)="toggleCreator(row.user.id, !row.canCreateCases)">
                      {{ row.canCreateCases ? 'Revocar' : 'Autorizar' }}
                    </button>
                  } @else {
                    —
                  }
                </td>
                <td>
                  <button class="admin-btn ghost" type="button" (click)="toggleStatus(row.user.id, row.status)">
                    {{ row.status === 'ACTIVE' ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">No hay usuarios registrados.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `,
  styles: [
    `
      .admin-checkbox-label {
        display: flex !important;
        align-items: center;
        gap: 0.55rem;
        color: var(--admin-text) !important;
      }

      .admin-checkbox-label input {
        width: auto !important;
      }
    `,
  ],
})
export class AdminUsersPage {
  private readonly usersService = inject(AdminUsersService);
  private readonly data = inject(AcademyDataService);
  private readonly fb = inject(FormBuilder);
  readonly feedback = signal('');

  readonly teacherForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    institution: ['', Validators.required],
    area: ['', Validators.required],
    canCreateCases: [false],
  });

  readonly studentForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    code: ['', Validators.required],
  });

  readonly users = computed(() => {
    this.data.store();
    return this.usersService.listUsers();
  });

  createTeacher(): void {
    if (this.teacherForm.invalid) {
      return;
    }
    const dto = this.teacherForm.getRawValue() as CreateTeacherDto;
    this.usersService.createTeacher(dto);
    this.teacherForm.reset({ name: '', email: '', password: '', institution: '', area: '', canCreateCases: false });
    this.feedback.set(`Docente ${dto.email} creado correctamente.`);
  }

  createStudent(): void {
    if (this.studentForm.invalid) {
      return;
    }
    const dto = this.studentForm.getRawValue() as CreateStudentDto;
    this.usersService.createStudent(dto);
    this.studentForm.reset({ name: '', email: '', password: '', code: '' });
    this.feedback.set(`Estudiante ${dto.email} creado correctamente.`);
  }

  toggleStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): void {
    this.usersService.setStatus(userId, status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
    this.feedback.set('Estado de usuario actualizado.');
  }

  toggleCreator(userId: string, enabled: boolean): void {
    this.usersService.setCanCreateCases(userId, enabled);
    this.feedback.set(enabled ? 'Docente autorizado para crear casos.' : 'Permiso de creador revocado.');
  }
}
