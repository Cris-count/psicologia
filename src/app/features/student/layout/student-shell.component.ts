import { ChangeDetectionStrategy, Component, ElementRef, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GuideAssistantComponent } from '../../../shared/guide/components/guide-assistant/guide-assistant.component';
import { GuideService } from '../../../shared/guide/services/guide.service';
import { GUIDE_SCROLL_ROOT } from '../../../shared/guide/components/guide-assistant/guide-scroll-context';

@Component({
  selector: 'app-student-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'student-module-host' },
  providers: [
    {
      provide: GUIDE_SCROLL_ROOT,
      useFactory: () => {
        const host = inject(ElementRef<HTMLElement>);
        return () =>
          (host.nativeElement.querySelector('.student-module-scroll-root') as HTMLElement | null) ??
          host.nativeElement;
      },
    },
  ],
  imports: [RouterOutlet, GuideAssistantComponent],
  template: `
    <div class="student-module-scroll-root">
      <router-outlet />
    </div>
    <app-guide-assistant
      presence="student"
      dock="right"
      [showFab]="showFab()"
      [showHintButton]="showHintButton()"
    />
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        min-height: 100vh;
      }

      .student-module-scroll-root {
        position: relative;
        z-index: 1;
        min-height: 100vh;
      }
    `,
  ],
})
export class StudentShellComponent {
  private readonly guide = inject(GuideService);

  readonly showHintButton = computed(() => this.guide.context() === 'student_task');
  readonly showFab = computed(() => !this.guide.context().startsWith('onboarding'));
}
