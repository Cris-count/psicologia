import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { AvatarId } from '../../../../models/academy.models';
import { avatarById } from '../../data/avatar.catalog';
import { AvatarNamePanelComponent } from '../avatar-name-panel/avatar-name-panel.component';
import { AvatarPickerComponent } from '../avatar-picker/avatar-picker.component';

type StudioPhase = 'pick' | 'name';

@Component({
  selector: 'app-avatar-studio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarPickerComponent, AvatarNamePanelComponent],
  template: `
    <div class="avatar-studio">
      @if (phase() === 'pick') {
        <header class="studio-header">
          <h2 class="studio-title">SELECCIONA TU AVATAR</h2>
          <p class="studio-subtitle">Elige tu personaje y comienza la aventura</p>
        </header>

        <app-avatar-picker
          label="Personajes disponibles"
          [(selectedId)]="draftAvatarId"
          (picked)="onAvatarPicked($event)"
        />

        <footer class="studio-footer">
          <span class="psi-symbol" aria-hidden="true">Ψ</span>
          <p>
            Cada avatar tiene su propia perspectiva. ¡Elige el que más te represente y transforma tu entorno!
          </p>
        </footer>
      } @else {
        <app-avatar-name-panel
          [portraitUrl]="hero().thumbUrl"
          title="Ponle nombre a tu personaje"
          subtitle="Este nombre aparecerá en MIND-SPHERE."
          fieldLabel="Nombre o alias"
          placeholder="Ej: Luna Vega"
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
      .avatar-studio {
        display: grid;
        gap: 1.25rem;
      }

      .studio-header {
        text-align: center;
      }

      .studio-title {
        margin: 0;
        font-family: var(--psy-font-display);
        font-size: clamp(1.2rem, 3vw, 1.65rem);
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #fff;
      }

      .studio-subtitle {
        margin: 0.35rem 0 0;
        color: #7ec8e8;
        font-size: 0.9rem;
      }

      .studio-footer {
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--psy-line);
      }

      .psi-symbol {
        flex-shrink: 0;
        font-size: 1.4rem;
        color: #4a8fd4;
        line-height: 1;
      }

      .studio-footer p {
        margin: 0;
        font-size: 0.82rem;
        color: var(--psy-muted);
        line-height: 1.5;
      }
    `,
  ],
})
export class AvatarStudioComponent {
  readonly draftAvatarId = model<AvatarId>('psych-alejandro');
  readonly characterName = model('');
  readonly confirmLabel = input('Confirmar personaje');

  readonly confirmed = output<{ avatarId: AvatarId; characterName: string }>();

  readonly phase = signal<StudioPhase>('pick');
  readonly hero = computed(() => avatarById(this.draftAvatarId()));

  onAvatarPicked(id: AvatarId): void {
    this.draftAvatarId.set(id);
    if (!this.characterName().trim()) {
      this.characterName.set('');
    }
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
