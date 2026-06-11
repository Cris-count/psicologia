import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AvatarId } from '../../../../models/academy.models';
import { avatarById } from '../../data/avatar.catalog';

@Component({
  selector: 'app-avatar-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="avatar-composer" [class.size-sm]="size() === 'sm'" [class.size-lg]="size() === 'lg'">
      <img
        class="avatar-portrait"
        [src]="hero().thumbUrl"
        [alt]="hero().label"
        width="193"
        height="217"
      />
    </figure>
  `,
  styles: [
    `
      .avatar-composer {
        margin: 0;
        display: block;
      }

      .avatar-portrait {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 12px;
        object-fit: cover;
        filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.45));
      }

      .avatar-composer.size-sm .avatar-portrait {
        max-width: 56px;
        border-radius: 8px;
      }

      .avatar-composer.size-lg .avatar-portrait {
        max-width: 220px;
      }
    `,
  ],
})
export class AvatarComposerComponent {
  readonly avatarId = input<AvatarId>('psych-alejandro');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly hero = computed(() => avatarById(this.avatarId()));
}
