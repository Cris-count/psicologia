import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { TeacherAvatarId } from '../../../../models/academy.models';
import { teacherAvatarById } from '../../data/teacher-avatar.catalog';
import { AvatarNamePanelComponent } from '../avatar-name-panel/avatar-name-panel.component';
import { TeacherAvatarPickerComponent } from '../teacher-avatar-picker/teacher-avatar-picker.component';

type StudioPhase = 'pick' | 'name';

@Component({
  selector: 'app-teacher-avatar-studio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TeacherAvatarPickerComponent, AvatarNamePanelComponent],
  template: `
    <div class="teacher-studio">
      @if (phase() === 'pick') {
        <header class="studio-header">
          <h2 class="studio-title">ELIGE TU PROFESOR/A</h2>
          <p class="studio-subtitle">Tu guía en psicología social</p>
        </header>

        <p class="pick-hint">Selecciona el estilo de personaje que te represente en el aula.</p>

        <app-teacher-avatar-picker
          label="Estilos disponibles"
          [(selectedId)]="draftAvatarId"
          (picked)="onAvatarPicked($event)"
        />
      } @else {
        <app-avatar-name-panel
          [portraitUrl]="hero().portraitUrl"
          title="Ponle nombre a tu personaje"
          subtitle="Así te verán tus estudiantes en MIND-SPHERE."
          fieldLabel="Nombre o alias profesional"
          placeholder="Ej: Dra. García"
          [maxLength]="40"
          [confirmLabel]="confirmLabel()"
          [(characterName)]="characterName"
          (confirmed)="onNameConfirmed($event)"
          (back)="goToPick()"
        />
      }
    </div>
  `,
  styles: [
    `
      .teacher-studio {
        display: grid;
        gap: 1.25rem;
      }

      .studio-header {
        text-align: center;
      }

      .studio-title {
        margin: 0;
        font-family: var(--psy-font-display);
        font-size: clamp(1.15rem, 3vw, 1.55rem);
        font-weight: 700;
        letter-spacing: 0.05em;
        color: #fff;
      }

      .studio-subtitle {
        margin: 0.35rem 0 0;
        color: #9b8fd9;
        font-size: 0.9rem;
      }

      .pick-hint {
        margin: 0;
        text-align: center;
        color: var(--psy-muted);
        font-size: 0.88rem;
      }
    `,
  ],
})
export class TeacherAvatarStudioComponent {
  readonly draftAvatarId = model<TeacherAvatarId>('teach-valentina');
  readonly characterName = model('');
  readonly confirmLabel = input('Seleccionar profesor/a');

  readonly confirmed = output<{ avatarId: TeacherAvatarId; characterName: string }>();

  readonly phase = signal<StudioPhase>('pick');
  readonly hero = computed(() => teacherAvatarById(this.draftAvatarId()));

  onAvatarPicked(id: TeacherAvatarId): void {
    this.draftAvatarId.set(id);
    this.phase.set('name');
  }

  goToPick(): void {
    this.phase.set('pick');
  }

  onNameConfirmed(name: string): void {
    this.confirmed.emit({
      avatarId: this.draftAvatarId(),
      characterName: name,
    });
  }
}
