import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { AvatarId } from '../../../../models/academy.models';
import { AVATAR_CATALOG } from '../../data/avatar.catalog';

@Component({
  selector: 'app-avatar-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="psych-select-grid" role="listbox" [attr.aria-label]="label()">
      @for (avatar of avatars; track avatar.id) {
        <button
          type="button"
          class="psych-card"
          [class.selected]="selectedId() === avatar.id"
          role="option"
          [attr.aria-selected]="selectedId() === avatar.id"
          [attr.aria-label]="'Personaje ' + avatar.slot"
          [style.--card-bg]="avatar.cardBg"
          [style.--card-accent]="avatar.accent"
          [style.--card-glow]="avatar.glow"
          (click)="pick(avatar.id)"
        >
          <div class="psych-card-inner">
            <img
              class="psych-thumb"
              [src]="avatar.thumbUrl"
              alt=""
              width="193"
              height="217"
            />
          </div>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .psych-select-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.65rem;
      }

      @media (max-width: 900px) {
        .psych-select-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (max-width: 520px) {
        .psych-select-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .psych-card {
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .psych-card:hover {
        transform: translateY(-3px) scale(1.02);
      }

      .psych-card-inner {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: var(--card-bg);
        border: 2px solid rgba(255, 255, 255, 0.12);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .psych-thumb {
        width: 100%;
        height: auto;
        display: block;
        object-fit: cover;
        object-position: center top;
      }

      .psych-card.selected .psych-card-inner {
        border-color: var(--psy-gold);
        box-shadow: 0 0 24px var(--card-glow), 0 4px 16px rgba(0, 0, 0, 0.4);
      }
    `,
  ],
})
export class AvatarPickerComponent {
  readonly label = input('Selecciona tu avatar');
  readonly selectedId = model<AvatarId>('psych-alejandro');
  readonly picked = output<AvatarId>();
  readonly avatars = AVATAR_CATALOG;

  pick(id: AvatarId): void {
    this.selectedId.set(id);
    this.picked.emit(id);
  }
}
