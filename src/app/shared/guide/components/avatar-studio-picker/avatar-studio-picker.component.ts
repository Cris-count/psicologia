import { ChangeDetectionStrategy, Component, computed, effect, model } from '@angular/core';
import { AvatarLook, AvatarStudioSlot, StudioOptionId } from '../../data/avatar-look.types';
import {
  DEFAULT_AVATAR_LOOK,
  STUDIO_SLOT_LABELS,
  optionsForStudioSlot,
  selectedForLookSlot,
  setLookSlot,
  slotsForGender,
  studioSlotIcon,
} from '../../data/avatar-studio.catalog';

@Component({
  selector: 'app-avatar-studio-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="studio-picker">
      <nav class="slot-tabs" role="tablist">
        @for (slot of visibleSlots(); track slot) {
          <button
            type="button"
            role="tab"
            class="slot-tab"
            [class.active]="activeSlot() === slot"
            [attr.aria-label]="slotLabel(slot)"
            [title]="slotLabel(slot)"
            (click)="activeSlot.set(slot)"
          >
            <img [src]="slotIcon(slot)" [alt]="slotLabel(slot)" width="24" height="24" />
          </button>
        }
      </nav>

      <p class="slot-title">{{ slotLabel(activeSlot()) }}</p>

      <div class="option-grid" role="listbox">
        @for (item of items(); track item.id) {
          <button
            type="button"
            class="option-btn"
            role="option"
            [class.selected]="selected() === item.id"
            [class.color-opt]="!!item.hex && activeSlot() !== 'top' && activeSlot() !== 'bottom' && activeSlot() !== 'shoes' && activeSlot() !== 'jacket'"
            [class.cloth-opt]="!!item.hex && (activeSlot() === 'top' || activeSlot() === 'bottom' || activeSlot() === 'shoes' || activeSlot() === 'jacket')"
            [attr.aria-label]="item.label"
            [title]="item.label"
            (click)="pick(item.id)"
          >
            @if (item.hex && activeSlot() !== 'hairStyle' && activeSlot() !== 'eyebrows' && activeSlot() !== 'headwear' && activeSlot() !== 'eyewear' && activeSlot() !== 'earrings' && activeSlot() !== 'necklace' && activeSlot() !== 'facialHair') {
              <span class="swatch" [style.background]="item.hex2 ? 'linear-gradient(135deg,' + item.hex + ',' + item.hex2 + ')' : item.hex"></span>
            } @else {
              <span class="style-icon">{{ iconFor(item.id) }}</span>
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .studio-picker { display: grid; gap: 0.75rem; }
      .slot-tabs { display: flex; flex-wrap: wrap; gap: 0.35rem; }
      .slot-tab {
        width: 44px; height: 44px; padding: 0.25rem;
        border-radius: var(--psy-radius-sm);
        border: 2px solid var(--psy-line);
        background: rgba(18, 14, 36, 0.65);
        cursor: pointer; display: grid; place-items: center;
        transition: border-color 0.15s, transform 0.15s;
      }
      .slot-tab:hover { transform: scale(1.05); }
      .slot-tab.active {
        border-color: var(--psy-gold);
        background: rgba(244, 197, 66, 0.12);
        box-shadow: 0 0 12px rgba(244, 197, 66, 0.2);
      }
      .slot-tab img { width: 24px; height: 24px; object-fit: contain; }
      .slot-title {
        margin: 0;
        font-family: var(--psy-font-hud);
        font-size: 0.62rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--psy-accent);
      }
      .option-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
        gap: 0.5rem;
        max-height: 220px;
        overflow-y: auto;
        padding-right: 0.25rem;
      }
      .option-btn {
        aspect-ratio: 1;
        padding: 0.25rem;
        border-radius: 50%;
        border: 3px solid transparent;
        background: rgba(18, 14, 36, 0.45);
        cursor: pointer;
        transition: transform 0.12s, border-color 0.12s, box-shadow 0.12s;
        display: grid; place-items: center;
      }
      .option-btn.cloth-opt { border-radius: var(--psy-radius-sm); aspect-ratio: auto; min-height: 48px; }
      .option-btn:hover { transform: scale(1.08); }
      .option-btn.selected {
        border-color: var(--psy-gold);
        box-shadow: 0 0 14px rgba(244, 197, 66, 0.35);
      }
      .swatch {
        width: 100%; height: 100%; min-height: 36px;
        border-radius: inherit; display: block;
        box-shadow: inset 0 -3px 6px rgba(0,0,0,0.2);
      }
      .style-icon { font-size: 1.2rem; line-height: 1; }
    `,
  ],
})
export class AvatarStudioPickerComponent {
  readonly look = model<AvatarLook>({ ...DEFAULT_AVATAR_LOOK });
  readonly activeSlot = model<AvatarStudioSlot>('skin');

  readonly visibleSlots = computed(() => slotsForGender(this.look().gender));

  readonly items = computed(() => optionsForStudioSlot(this.activeSlot(), this.look().gender));

  constructor() {
    effect(() => {
      const slots = this.visibleSlots();
      if (!slots.includes(this.activeSlot())) {
        this.activeSlot.set(slots[0] ?? 'skin');
      }
    });
  }

  slotLabel(slot: AvatarStudioSlot): string {
    return STUDIO_SLOT_LABELS[slot];
  }

  slotIcon(slot: AvatarStudioSlot): string {
    return studioSlotIcon(slot);
  }

  selected(): StudioOptionId {
    return selectedForLookSlot(this.look(), this.activeSlot());
  }

  pick(id: StudioOptionId): void {
    this.look.set(setLookSlot(this.look(), this.activeSlot(), id));
  }

  iconFor(id: StudioOptionId): string {
    if (String(id).includes('none')) return '—';
    if (String(id).startsWith('hs-')) return '💇';
    if (String(id).startsWith('hat-')) return '🧢';
    if (String(id).startsWith('glasses-')) return '👓';
    if (String(id).startsWith('ear-')) return '✦';
    if (String(id).startsWith('neck-')) return '📿';
    if (String(id).startsWith('fh-')) return '🧔';
    if (String(id).startsWith('eb-')) return '⌒';
    return '•';
  }
}
