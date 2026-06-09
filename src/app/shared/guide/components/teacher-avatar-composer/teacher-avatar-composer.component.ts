import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TEACHER_PROFILE_PORTRAIT } from '../../data/teacher-avatar.catalog';

@Component({
  selector: 'app-teacher-avatar-composer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="teacher-composer" [class.size-sm]="size() === 'sm'" [class.size-lg]="size() === 'lg'">
      <img
        class="teacher-portrait"
        [src]="portraitUrl"
        alt="Perfil de profesor/a"
        width="320"
        height="200"
      />
    </figure>
  `,
  styles: [
    `
      .teacher-composer {
        margin: 0;
        display: block;
      }

      .teacher-portrait {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 10px;
        object-fit: cover;
        object-position: center;
        filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4));
      }

      .teacher-composer.size-sm .teacher-portrait {
        width: 80px;
        max-width: 80px;
        height: 52px;
        border-radius: 8px;
      }

      .teacher-composer.size-lg .teacher-portrait {
        max-width: 320px;
      }
    `,
  ],
})
export class TeacherAvatarComposerComponent {
  readonly portraitUrl = TEACHER_PROFILE_PORTRAIT;
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
