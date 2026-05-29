import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { AvatarId } from '../../../../models/academy.models';
import { AVATAR_CATALOG, RARITY_LABELS } from '../../data/avatar.catalog';
import { GameAvatarPortraitComponent } from '../game-avatar-portrait/game-avatar-portrait.component';

@Component({
  selector: 'app-avatar-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameAvatarPortraitComponent],
  template: `
    <div class="hero-select-grid" role="listbox" [attr.aria-label]="label()">
      @for (avatar of avatars; track avatar.id) {
        <button
          type="button"
          class="hero-card"
          [class.selected]="selectedId() === avatar.id"
          [class.rarity-rare]="avatar.rarity === 'RARE'"
          [class.rarity-epic]="avatar.rarity === 'EPIC'"
          role="option"
          [attr.aria-selected]="selectedId() === avatar.id"
          [style.--hero-accent]="avatar.accent"
          [style.--hero-glow]="avatar.glow"
          (click)="select(avatar.id)"
        >
          <div class="hero-card-frame">
            <div class="hero-card-glow" aria-hidden="true"></div>
            <app-game-avatar-portrait [avatarId]="avatar.id" size="md" />
            <span class="hero-rarity">{{ rarityLabel(avatar.rarity) }}</span>
          </div>
          <div class="hero-card-meta">
            <strong class="hero-name">{{ avatar.label }}</strong>
            <span class="hero-class">{{ avatar.className }}</span>
            <small class="hero-theme">{{ avatar.theme }}</small>
          </div>
        </button>
      }
    </div>
  `,
  styles: [
    `
      .hero-select-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
        gap: 1rem;
      }

      .hero-card {
        display: grid;
        gap: 0.65rem;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        text-align: left;
        transition: transform 0.25s ease;
      }

      .hero-card:hover {
        transform: translateY(-4px) scale(1.02);
      }

      .hero-card-frame {
        position: relative;
        border-radius: var(--psy-radius-sm);
        border: 2px solid rgba(255, 255, 255, 0.1);
        background: linear-gradient(165deg, rgba(34, 28, 66, 0.85), rgba(18, 14, 36, 0.95));
        overflow: hidden;
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      }

      .hero-card-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 20%, var(--hero-glow), transparent 65%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .hero-card:hover .hero-card-glow,
      .hero-card.selected .hero-card-glow {
        opacity: 1;
      }

      .hero-card.selected .hero-card-frame {
        border-color: var(--psy-gold);
        box-shadow: 0 0 28px var(--hero-glow), inset 0 0 20px rgba(244, 197, 66, 0.08);
      }

      .hero-card.rarity-rare.selected .hero-card-frame {
        border-color: var(--hero-accent);
      }

      .hero-card.rarity-epic.selected .hero-card-frame {
        border-color: var(--psy-gold);
        background: linear-gradient(165deg, rgba(244, 197, 66, 0.12), rgba(214, 93, 177, 0.1));
      }

      .hero-rarity {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.2rem 0.5rem;
        border-radius: var(--psy-radius-pill);
        font-family: var(--psy-font-hud);
        font-size: 0.52rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        background: rgba(0, 0, 0, 0.55);
        color: var(--hero-accent);
        border: 1px solid var(--hero-accent);
      }

      .hero-card-meta {
        display: grid;
        gap: 0.15rem;
        padding: 0 0.25rem;
      }

      .hero-name {
        font-family: var(--psy-font-display);
        font-size: 0.95rem;
        color: var(--psy-ink);
      }

      .hero-class {
        font-family: var(--psy-font-hud);
        font-size: 0.58rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--hero-accent);
      }

      .hero-theme {
        color: var(--psy-muted);
        font-size: 0.72rem;
        line-height: 1.35;
      }
    `,
  ],
})
export class AvatarPickerComponent {
  readonly label = input('Selecciona tu héroe');
  readonly selectedId = model<AvatarId>('neural-01');
  readonly avatars = AVATAR_CATALOG;

  rarityLabel(rarity: keyof typeof RARITY_LABELS): string {
    return RARITY_LABELS[rarity];
  }

  select(id: AvatarId): void {
    this.selectedId.set(id);
  }
}
