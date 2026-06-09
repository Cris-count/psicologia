import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AcademyDataService } from '../../../services/academy-data.service';
import { CreateStudentDto, CreateTeacherDto } from '../data/admin-api.contracts';
import { AdminUsersService } from '../services/admin-users.service';

type ManagedUserRole = 'TEACHER' | 'STUDENT';

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <header class="admin-page-title">
      <p class="eyebrow">REQ-01</p>
      <h2>Gestion de usuarios y permisos</h2>
      <p class="admin-page-subtitle">Crea perfiles y asigna el flag de creador de casos a profesores autorizados.</p>
    </header>

    <article class="admin-card admin-create-user-card">
      <h3>Crear usuario</h3>
      <form class="admin-form-grid admin-user-form" [formGroup]="userForm" (ngSubmit)="createUser()">
        <label>
          Tipo de usuario
          <select formControlName="role">
            <option value="TEACHER">Profesor</option>
            <option value="STUDENT">Estudiante</option>
          </select>
        </label>

        <div class="admin-form-fields">
          <label>Nombre <input formControlName="name" required /></label>
          <label>Correo <input formControlName="email" type="email" required /></label>
          <label>Contrasena <input formControlName="password" type="password" required /></label>

          @if (selectedRole() === 'TEACHER') {
            <label>Institucion <input formControlName="institution" required /></label>
            <label>Area <input formControlName="area" required /></label>
            <label class="admin-checkbox-label">
              <input formControlName="canCreateCases" type="checkbox" />
              Autorizado como creador de casos
            </label>
          } @else {
            <label>Codigo academico <input formControlName="code" required /></label>
          }
        </div>

        <button class="admin-btn primary" type="submit" [disabled]="userForm.invalid">
          Registrar {{ selectedRole() === 'TEACHER' ? 'profesor' : 'estudiante' }}
        </button>
      </form>
    </article>

    @if (feedback()) {
      <p class="admin-badge stable" style="margin-bottom: 1rem">{{ feedback() }}</p>
    }

    <section class="admin-users-lists">
      <article class="admin-card">
        <h3>Profesores registrados</h3>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Institucion</th>
                <th>Area</th>
                <th>Estado</th>
                <th>Creador de casos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (row of teachers(); track row.user.id) {
                <tr>
                  <td>{{ row.user.name }}</td>
                  <td>{{ row.user.email }}</td>
                  <td>{{ row.institution }}</td>
                  <td>{{ row.area }}</td>
                  <td>
                    <span class="admin-badge" [class.stable]="row.status === 'ACTIVE'" [class.warn]="row.status === 'INACTIVE'">
                      {{ row.status }}
                    </span>
                  </td>
                  <td>
                    <button class="admin-btn ghost" type="button" (click)="toggleCreator(row.user.id, !row.canCreateCases)">
                      {{ row.canCreateCases ? 'Revocar' : 'Autorizar' }}
                    </button>
                  </td>
                  <td>
                    <button class="admin-btn ghost" type="button" (click)="toggleStatus(row.user.id, row.status)">
                      {{ row.status === 'ACTIVE' ? 'Desactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7">No hay profesores registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>

      <article class="admin-card">
        <h3>Estudiantes registrados</h3>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Codigo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (row of students(); track row.user.id) {
                <tr>
                  <td>{{ row.user.name }}</td>
                  <td>{{ row.user.email }}</td>
                  <td>{{ row.studentCode }}</td>
                  <td>
                    <span class="admin-badge" [class.stable]="row.status === 'ACTIVE'" [class.warn]="row.status === 'INACTIVE'">
                      {{ row.status }}
                    </span>
                  </td>
                  <td>
                    <button class="admin-btn ghost" type="button" (click)="toggleStatus(row.user.id, row.status)">
                      {{ row.status === 'ACTIVE' ? 'Desactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">No hay estudiantes registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .admin-create-user-card {
        margin-bottom: 1.25rem;
      }

      .admin-user-form {
        max-width: 920px;
      }

      .admin-form-fields {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .admin-users-lists {
        display: grid;
        gap: 1.25rem;
      }

      .admin-checkbox-label {
        display: flex !important;
        align-items: center;
        gap: 0.55rem;
        color: var(--admin-text) !important;
      }

      .admin-checkbox-label input {
        width: auto !important;
      }

      @media (max-width: 920px) {
        .admin-form-fields {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminUsersPage {
  private readonly usersService = inject(AdminUsersService);
  private readonly data = inject(AcademyDataService);
  private readonly fb = inject(FormBuilder);
  readonly feedback = signal('');
  readonly selectedRole = signal<ManagedUserRole>('TEACHER');

  readonly userForm = this.fb.nonNullable.group({
    role: ['TEACHER' as ManagedUserRole, Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    institution: ['', Validators.required],
    area: ['', Validators.required],
    canCreateCases: [false],
    code: ['', Validators.required],
  });

  readonly users = computed(() => {
    this.data.store();
    return this.usersService.listUsers();
  });

  readonly teachers = computed(() => this.users().filter((row) => row.role === 'TEACHER'));
  readonly students = computed(() => this.users().filter((row) => row.role === 'STUDENT'));

  constructor() {
    this.setRoleSpecificFields('TEACHER');
    this.userForm.controls.role.valueChanges.subscribe((role) => {
      this.selectedRole.set(role);
      this.setRoleSpecificFields(role);
    });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      return;
    }

    const value = this.userForm.getRawValue();

    if (value.role === 'TEACHER') {
      const dto: CreateTeacherDto = {
        name: value.name,
        email: value.email,
        password: value.password,
        institution: value.institution,
        area: value.area,
        canCreateCases: value.canCreateCases,
      };
      this.usersService.createTeacher(dto);
      this.feedback.set(`Profesor ${dto.email} creado correctamente.`);
    } else {
      const dto: CreateStudentDto = {
        name: value.name,
        email: value.email,
        password: value.password,
        code: value.code,
      };
      this.usersService.createStudent(dto);
      this.feedback.set(`Estudiante ${dto.email} creado correctamente.`);
    }

    this.resetForm(value.role);
  }

  toggleStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): void {
    this.usersService.setStatus(userId, status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
    this.feedback.set('Estado de usuario actualizado.');
  }

  toggleCreator(userId: string, enabled: boolean): void {
    this.usersService.setCanCreateCases(userId, enabled);
    this.feedback.set(enabled ? 'Profesor autorizado para crear casos.' : 'Permiso de creador revocado.');
  }

  private resetForm(role: ManagedUserRole): void {
    this.userForm.reset({
      role,
      name: '',
      email: '',
      password: '',
      institution: '',
      area: '',
      canCreateCases: false,
      code: '',
    });
    this.selectedRole.set(role);
    this.setRoleSpecificFields(role);
  }

  private setRoleSpecificFields(role: ManagedUserRole): void {
    const teacherControls = [
      this.userForm.controls.institution,
      this.userForm.controls.area,
      this.userForm.controls.canCreateCases,
    ];
    const studentControls = [this.userForm.controls.code];

    if (role === 'TEACHER') {
      teacherControls.forEach((control) => control.enable({ emitEvent: false }));
      studentControls.forEach((control) => control.disable({ emitEvent: false }));
      return;
    }

    teacherControls.forEach((control) => control.disable({ emitEvent: false }));
    studentControls.forEach((control) => control.enable({ emitEvent: false }));
  }
}
