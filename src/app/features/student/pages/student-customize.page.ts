import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AvatarId } from '../../../models/academy.models';
import { AuthService } from '../../../services/auth.service';
import { GameAnimateDirective } from '../../../shared/directives/game-animate.directive';
import { AvatarStudioComponent } from '../../../shared/guide/components/avatar-studio/avatar-studio.component';
import { GuideService } from '../../../shared/guide/services/guide.service';
import { StudentProfileService } from '../../../shared/guide/services/student-profile.service';

@Component({
  selector: 'app-student-customize-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './student-onboarding.css',
  host: { class: 'onboarding-page-host' },
  imports: [RouterLink, AvatarStudioComponent, GameAnimateDirective],
  template: `
    <div class="onboarding-cinema customize-page" appGameAnimate="fade-up">
      <header class="onboarding-hud">
        <p class="eyebrow">Perfil de jugador</p>
        <h1>Tu personaje</h1>
      </header>

      <article class="onboarding-stage-panel">
        <app-avatar-studio
          [(draftAvatarId)]="draftAvatarId"
          [(characterName)]="characterName"
          confirmLabel="Guardar personaje"
          (confirmed)="onSave($event)"
        />

        @if (message()) {
          <p class="nickname-status ok">{{ message() }}</p>
        }
        @if (error()) {
          <p class="form-error">{{ error() }}</p>
        }

        <div class="button-row">
          <a class="ghost-button" routerLink="/student">Volver al hub</a>
        </div>
      </article>
    </div>
  `,
  styles: [
    `
      .customize-page {
        min-height: 100vh;
        padding: clamp(1rem, 3vw, 2rem);
        max-width: var(--psy-content-max);
        margin: 0 auto;
      }
      a.ghost-button {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
      }
    `,
  ],
})
export class StudentCustomizePage implements OnInit {
  protected readonly profile = inject(StudentProfileService);
  protected readonly guide = inject(GuideService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal('');
  readonly message = signal('');

  draftAvatarId: AvatarId = 'psych-alejandro';
  characterName = '';

  ngOnInit(): void {
    this.auth.ensureAuthenticatedOrRedirect();
    this.draftAvatarId = this.profile.avatarId();
    this.characterName = this.profile.characterName();
    this.guide.setVisible(true);
    this.guide.setContext('student_groups');
  }

  onSave(selection: { avatarId: AvatarId; characterName: string }): void {
    this.error.set('');
    this.message.set('');
    const ok = this.profile.saveCustomization(selection.avatarId, selection.characterName);
    if (!ok) {
      this.error.set('No se pudo guardar.');
      return;
    }
    this.message.set('¡Personaje guardado!');
    void this.router.navigateByUrl('/student');
  }
}
