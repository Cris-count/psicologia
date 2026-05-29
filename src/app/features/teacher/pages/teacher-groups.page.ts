import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameGroup } from '../../../models/academy.models';
import { AcademyDataService } from '../../../services/academy-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-groups-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Células de aprendizaje</p>
        <h2>Grupos</h2>
        <p>Organiza estudiantes en grupos para asignar simulaciones.</p>
      </div>
    </header>

    <section class="workspace-grid">
      <article class="panel editor-panel">
        <h3>{{ editingGroupId() ? 'Editar grupo' : 'Crear grupo' }}</h3>
        <form class="stack-form" (ngSubmit)="saveGroup()">
          <label>Nombre <input [(ngModel)]="groupName" name="groupName" required /></label>
          <label>Descripción <textarea [(ngModel)]="groupDescription" name="groupDescription"></textarea></label>
          @if (editingGroupId()) {
            <label>Estado
              <select [(ngModel)]="groupStatus" name="groupStatus">
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </label>
          }
          <div class="button-row">
            <button class="primary-button" type="submit">{{ editingGroupId() ? 'Guardar cambios' : 'Crear grupo' }}</button>
            @if (editingGroupId()) {
              <button class="ghost-button" type="button" (click)="cancelEdit()">Cancelar</button>
            }
          </div>
        </form>
      </article>

      <article class="panel">
        <h3>Mis grupos</h3>
        <div class="list">
          @for (group of groups(); track group.id) {
            <div class="list-item group-item" [class.selected]="selectedGroupId() === group.id">
              <button type="button" class="group-select" (click)="selectedGroupId.set(group.id)">
                <span>
                  <strong>{{ group.name }}</strong>
                  <small>{{ group.description || 'Sin descripción' }}</small>
                </span>
                <b>{{ memberCount(group.id) }}</b>
              </button>
              <button class="ghost-button" type="button" (click)="editGroup(group)">Editar</button>
            </div>
          } @empty {
            <p class="muted">Aún no hay grupos creados.</p>
          }
        </div>
      </article>
    </section>

    @if (selectedGroupId()) {
      <article class="panel">
        <h3>Estudiantes en {{ selectedGroupName() }}</h3>
        <div class="list">
          @for (student of groupMembers(); track student.id) {
            <div class="list-item">
              <span>
                <strong>{{ student.name }}</strong>
                <small>{{ student.email }}</small>
              </span>
              <button class="ghost-button danger" type="button" (click)="removeMember(student.id)">Quitar</button>
            </div>
          } @empty {
            <p class="muted">Este grupo no tiene estudiantes. Asígnalos desde Estudiantes.</p>
          }
        </div>
      </article>
    }

    @if (message()) {
      <p class="game-badge game-badge-gold">{{ message() }}</p>
    }
  `,
  styles: [
    `
      .group-item {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.5rem;
        align-items: center;
      }

      .group-item.selected {
        border-color: var(--psy-border-neural);
        box-shadow: var(--psy-shadow-glow-cyan);
      }

      .group-select {
        all: unset;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        flex: 1;
      }

      .ghost-button.danger {
        border-color: rgba(255, 68, 102, 0.45);
        color: var(--psy-danger);
      }
    `,
  ],
})
export class TeacherGroupsPage {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);

  readonly message = signal('');
  readonly selectedGroupId = signal('');
  readonly editingGroupId = signal<string | null>(null);

  groupName = '';
  groupDescription = '';
  groupStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';

  readonly groups = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.groupsByTeacher(teacher.id) : [];
  });

  readonly groupMembers = computed(() => {
    const groupId = this.selectedGroupId();
    if (!groupId) return [];
    const studentIds = new Set(
      this.data
        .store()
        .groupStudents.filter((m) => m.groupId === groupId)
        .map((m) => m.studentId),
    );
    return this.data.allStudents().filter((s) => studentIds.has(s.id) && s.status === 'ACTIVE');
  });

  readonly selectedGroupName = computed(() => {
    const group = this.groups().find((g) => g.id === this.selectedGroupId());
    return group?.name ?? 'grupo';
  });

  memberCount(groupId: string): number {
    return this.data.store().groupStudents.filter((m) => m.groupId === groupId).length;
  }

  saveGroup(): void {
    const teacher = this.auth.currentUser();
    if (!teacher || !this.groupName.trim()) return;

    if (this.editingGroupId()) {
      this.data.updateGroup(this.editingGroupId()!, this.groupName, this.groupDescription, this.groupStatus);
      this.message.set('Grupo actualizado.');
      this.cancelEdit();
      return;
    }

    this.data.createGroup(teacher.id, this.groupName, this.groupDescription);
    this.groupName = '';
    this.groupDescription = '';
    const created = this.groups()[0];
    if (created) this.selectedGroupId.set(created.id);
    this.message.set('Grupo creado.');
  }

  editGroup(group: GameGroup): void {
    this.editingGroupId.set(group.id);
    this.groupName = group.name;
    this.groupDescription = group.description;
    this.groupStatus = group.status;
    this.selectedGroupId.set(group.id);
  }

  cancelEdit(): void {
    this.editingGroupId.set(null);
    this.groupName = '';
    this.groupDescription = '';
    this.groupStatus = 'ACTIVE';
  }

  removeMember(studentId: string): void {
    const groupId = this.selectedGroupId();
    if (groupId) {
      this.data.removeStudentFromGroup(groupId, studentId);
      this.message.set('Estudiante removido del grupo.');
    }
  }
}
