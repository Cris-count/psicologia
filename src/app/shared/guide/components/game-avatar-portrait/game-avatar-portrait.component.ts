import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AvatarAccessories, AvatarId } from '../../../../models/academy.models';
import { avatarById, DEFAULT_AVATAR_ID } from '../../data/avatar.catalog';

@Component({
  selector: 'app-game-avatar-portrait',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img
      class="hero-portrait"
      [class.size-sm]="size() === 'sm'"
      [class.size-lg]="size() === 'lg'"
      [src]="hero().thumbUrl"
      [alt]="hero().label"
      width="193"
      height="217"
      role="img"
      [attr.aria-label]="'Avatar ' + hero().label"
    />
  `,
  styles: [
    `
      .hero-portrait {
        width: 100%;
        height: auto;
        display: block;
        border-radius: var(--psy-radius-sm);
        object-fit: cover;
        filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.45));
      }

      .hero-portrait.size-sm {
        max-width: 72px;
      }

      .hero-portrait.size-lg {
        max-width: 220px;
      }
    `,
  ],
})
export class GameAvatarPortraitComponent {
  readonly avatarId = input<AvatarId>(DEFAULT_AVATAR_ID);
  readonly accessories = input<AvatarAccessories | null>(null);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly hero = computed(() => avatarById(this.avatarId()));
}
