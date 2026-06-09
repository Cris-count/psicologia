import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { AccessoryId, AccessorySlot, AvatarAccessories } from '../../../../models/academy.models';
import {
  ACCESSORY_SLOT_LABELS,
  accessoriesForSlot,
  DEFAULT_AVATAR_ACCESSORIES,
  setAccessoryForSlot,
  slotThumbUrl,
} from '../../data/accessory.catalog';

const SLOTS: AccessorySlot[] = ['headwear', 'eyewear', 'badge', 'effect'];

@Component({
  selector: 'app-accessory-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="accessory-picker">
      <nav class="slot-tabs" role="tablist" aria-label="Categorías de accesorios">
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
            <img [src]="slotIcon(slot)" [alt]="slotLabel(slot)" width="32" height="32" />
          </button>
        }
      </nav>

      <div class="slot-panel" role="tabpanel">
        <div class="accessory-grid" role="listbox" [attr.aria-label]="'Accesorios de ' + slotLabel(activeSlot())">
          @for (item of itemsForActiveSlot(); track item.id) {
            <button
              type="button"
              class="accessory-chip"
              role="option"
              [class.selected]="selectedForSlot(activeSlot()) === item.id"
              [style.--chip-accent]="item.accent"
              [attr.aria-selected]="selectedForSlot(activeSlot()) === item.id"
              [attr.aria-label]="item.label"
              [title]="item.label"
              (click)="pick(item.id)"
            >
              <img class="chip-thumb" [src]="item.thumbUrl" [alt]="item.label" width="64" height="64" />
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .accessory-picker {
        display: grid;
        gap: 1rem;
      }

      .slot-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .slot-tab {
        width: 52px;
        height: 52px;
        padding: 0.35rem;
        border-radius: var(--psy-radius-sm);
        border: 2px solid var(--psy-line);
        background: rgba(18, 14, 36, 0.6);
        cursor: pointer;
        transition: all 0.2s ease;
        display: grid;
        place-items: center;
      }

      .slot-tab img {
        display: block;
        width: 32px;
        height: 32px;
        object-fit: contain;
      }

      .slot-tab.active {
        border-color: var(--psy-gold);
        background: rgba(244, 197, 66, 0.12);
        box-shadow: 0 0 14px rgba(244, 197, 66, 0.12);
      }

      .accessory-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
        gap: 0.65rem;
      }

      .accessory-chip {
        aspect-ratio: 1;
        padding: 0.35rem;
        border-radius: var(--psy-radius-sm);
        border: 2px solid rgba(255, 255, 255, 0.08);
        background: linear-gradient(165deg, rgba(34, 28, 66, 0.75), rgba(18, 14, 36, 0.92));
        cursor: pointer;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .accessory-chip:hover {
        transform: translateY(-2px) scale(1.03);
      }

      .accessory-chip.selected {
        border-color: var(--chip-accent);
        box-shadow: 0 0 20px color-mix(in srgb, var(--chip-accent) 35%, transparent);
      }

      .chip-thumb {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        border-radius: 6px;
      }
    `,
  ],
})
export class AccessoryPickerComponent {
  readonly accessories = model<AvatarAccessories>({ ...DEFAULT_AVATAR_ACCESSORIES });

  readonly activeSlot = model<AccessorySlot>('headwear');
  readonly slots = SLOTS;

  slotLabel(slot: AccessorySlot): string {
    return ACCESSORY_SLOT_LABELS[slot];
  }

  slotIcon(slot: AccessorySlot): string {
    return slotThumbUrl(slot);
  }

  itemsForActiveSlot() {
    return accessoriesForSlot(this.activeSlot());
  }

  selectedForSlot(slot: AccessorySlot): AccessoryId {
    const acc = this.accessories();
    switch (slot) {
      case 'headwear':
        return acc.headwear;
      case 'eyewear':
        return acc.eyewear;
      case 'badge':
        return acc.badge;
      case 'effect':
        return acc.effect;
    }
  }

  pick(id: AccessoryId): void {
    this.accessories.set(setAccessoryForSlot(this.accessories(), this.activeSlot(), id));
  }
}
