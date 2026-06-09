import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { TeacherAvatarId } from '../../../../models/academy.models';
import { TEACHER_GALLERY } from '../../data/teacher-avatar.catalog';

@Component({
  selector: 'app-teacher-avatar-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="teacher-gallery" role="listbox" [attr.aria-label]="label()">
      <div class="gallery-row">
        @for (avatar of avatars; track avatar.id) {
          <button
            type="button"
            class="gallery-card"
            [class.selected]="selectedId() === avatar.id"
            role="option"
            [attr.aria-selected]="selectedId() === avatar.id"
            [attr.aria-label]="'Estilo ' + avatar.slot"
            [style.--card-bg]="avatar.cardBg"
            (click)="pick(avatar.id)"
          >
            <span class="gender-icon" aria-hidden="true">{{ avatar.gender === 'F' ? '♀' : '♂' }}</span>
            <div class="gallery-card-inner">
              <img class="gallery-thumb" [src]="avatar.thumbUrl" alt="" width="157" height="226" />
            </div>
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .gallery-row {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 0.55rem;
      }

      @media (max-width: 1100px) {
        .gallery-row {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      @media (max-width: 600px) {
        .gallery-row {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .gallery-card {
        position: relative;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .gallery-card:hover {
        transform: translateY(-3px);
      }

      .gallery-card-inner {
        border-radius: 10px;
        overflow: hidden;
        background: var(--card-bg);
        border: 2px solid rgba(255, 255, 255, 0.1);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .gallery-card.selected .gallery-card-inner {
        border-color: var(--psy-gold);
        box-shadow: 0 0 20px rgba(244, 197, 66, 0.35);
      }

      .gender-icon {
        position: absolute;
        top: 0.35rem;
        left: 0.4rem;
        z-index: 2;
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.85);
        background: rgba(0, 0, 0, 0.45);
        border-radius: 4px;
        padding: 0.1rem 0.3rem;
        line-height: 1.2;
      }

      .gallery-thumb {
        width: 100%;
        height: auto;
        display: block;
        object-fit: cover;
        object-position: center top;
      }
    `,
  ],
})
export class TeacherAvatarPickerComponent {
  readonly label = input('Estilos de profesores');
  readonly selectedId = model<TeacherAvatarId>('teach-valentina');
  readonly picked = output<TeacherAvatarId>();
  readonly avatars = TEACHER_GALLERY;

  pick(id: TeacherAvatarId): void {
    this.selectedId.set(id);
    this.picked.emit(id);
  }
}
