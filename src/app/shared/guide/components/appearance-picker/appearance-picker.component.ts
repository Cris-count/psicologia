import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { AppearanceOptionId, AppearanceSlot, AvatarAppearance } from '../../../../models/academy.models';
import {
  APPEARANCE_SLOT_LABELS,
  DEFAULT_AVATAR_APPEARANCE,
  appearanceSlotIcon,
  optionsForAppearanceSlot,
  selectedForAppearanceSlot,
  setAppearanceForSlot,
} from '../../data/appearance.catalog';

const SLOTS: AppearanceSlot[] = ['skin', 'hairColor', 'hairStyle', 'eyes', 'outfit'];

@Component({
  selector: 'app-appearance-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="appearance-picker">
      <nav class="slot-tabs" role="tablist" aria-label="Personalización de apariencia">
        @for (slot of slots; track slot) {
          <button
            type="button"
            role="tab"
            class="slot-tab"
            [class.active]="activeSlot() === slot"
            [attr.aria-selected]="activeSlot() === slot"
            [attr.aria-label]="slotLabel(slot)"
            [title]="slotLabel(slot)"
            (click)="activeSlot.set(slot)"
          >
            <img [src]="slotIcon(slot)" [alt]="slotLabel(slot)" width="28" height="28" />
          </button>
        }
      </nav>

      <div class="slot-panel" role="tabpanel">
        <div class="swatch-grid" role="listbox" [attr.aria-label]="slotLabel(activeSlot())">
          @for (item of itemsForSlot(); track item.id) {
            <button
              type="button"
              class="swatch-btn"
              role="option"
              [class.selected]="selectedId() === item.id"
              [class.is-style]="item.slot === 'hairStyle'"
              [attr.aria-selected]="selectedId() === item.id"
              [attr.aria-label]="item.label"
              [title]="item.label"
              (click)="pick(item.id)"
            >
              @if (item.hex) {
                <span class="color-swatch" [style.background]="item.hex"></span>
              } @else if (item.thumbUrl) {
                <img class="style-thumb" [src]="item.thumbUrl" [alt]="item.label" width="48" height="48" />
              }
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .appearance-picker {
        display: grid;
        gap: 1rem;
      }

      .slot-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .slot-tab {
        width: 48px;
        height: 48px;
        padding: 0.3rem;
        border-radius: var(--psy-radius-sm);
        border: 2px solid var(--psy-line);
        background: rgba(18, 14, 36, 0.6);
        cursor: pointer;
        transition: all 0.2s ease;
        display: grid;
        place-items: center;
      }

      .slot-tab img {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }

      .slot-tab.active {
        border-color: var(--psy-gold);
        background: rgba(244, 197, 66, 0.12);
        box-shadow: 0 0 14px rgba(244, 197, 66, 0.15);
      }

      .swatch-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
        gap: 0.55rem;
      }

      .swatch-btn {
        aspect-ratio: 1;
        padding: 0.3rem;
        border-radius: 50%;
        border: 3px solid transparent;
        background: rgba(18, 14, 36, 0.5);
        cursor: pointer;
        transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        display: grid;
        place-items: center;
      }

      .swatch-btn.is-style {
        border-radius: var(--psy-radius-sm);
        aspect-ratio: auto;
        min-height: 56px;
      }

      .swatch-btn:hover {
        transform: scale(1.08);
      }

      .swatch-btn.selected {
        border-color: var(--psy-gold);
        box-shadow: 0 0 16px rgba(244, 197, 66, 0.35);
      }

      .color-swatch {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: block;
        box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.2);
      }

      .style-thumb {
        width: 44px;
        height: 44px;
        object-fit: contain;
      }
    `,
  ],
})
export class AppearancePickerComponent {
  readonly appearance = model<AvatarAppearance>({ ...DEFAULT_AVATAR_APPEARANCE });
  readonly activeSlot = model<AppearanceSlot>('skin');
  readonly slots = SLOTS;

  slotLabel(slot: AppearanceSlot): string {
    return APPEARANCE_SLOT_LABELS[slot];
  }

  slotIcon(slot: AppearanceSlot): string {
    return appearanceSlotIcon(slot);
  }

  itemsForSlot() {
    return optionsForAppearanceSlot(this.activeSlot());
  }

  selectedId(): AppearanceOptionId {
    return selectedForAppearanceSlot(this.appearance(), this.activeSlot());
  }

  pick(id: AppearanceOptionId): void {
    this.appearance.set(setAppearanceForSlot(this.appearance(), this.activeSlot(), id));
  }
}
