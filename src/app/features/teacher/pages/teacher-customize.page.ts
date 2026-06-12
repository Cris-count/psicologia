import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GameAnimateDirective } from '../../../shared/directives/game-animate.directive';
import { AvatarNamePanelComponent } from '../../../shared/guide/components/avatar-name-panel/avatar-name-panel.component';
import { TEACHER_PROFILE_PORTRAIT } from '../../../shared/guide/data/teacher-avatar.catalog';
import { TeacherProfileService } from '../../../shared/guide/services/teacher-profile.service';

@Component({
  selector: 'app-teacher-customize-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'teacher-profile-host' },
  imports: [RouterLink, AvatarNamePanelComponent, GameAnimateDirective],
  template: `
    <div class="teacher-profile-page" appGameAnimate="fade-up">
      <header class="profile-header">
        <h2>TU PERFIL DE PROFESOR/A</h2>
        <p>Tu guía en psicología social</p>
      </header>

      <app-avatar-name-panel
        [portraitUrl]="portraitUrl"
        title="Ponle nombre a tu perfil"
        subtitle="Así te verán tus estudiantes en MIND-SPHERE."
        fieldLabel="Nombre o alias profesional"
        placeholder="Ej: Dra. García"
        [maxLength]="40"
        [confirmLabel]="isSetup() ? 'Guardar y continuar' : 'Guardar perfil'"
        [backLabel]="isSetup() ? 'Salir' : 'Volver al panel'"
        [(characterName)]="characterName"
        (confirmed)="onSave($event)"
        (back)="onBack()"
      />

      @if (message()) {
        <p class="status-ok">{{ message() }}</p>
      }
      @if (error()) {
        <p class="status-error">{{ error() }}</p>
      }

      @if (!isSetup()) {
        <div class="actions">
          <a class="ghost-button" routerLink="/teacher/resumen">Volver al panel</a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .teacher-profile-page {
        max-width: 720px;
        margin: 0 auto;
        padding: clamp(0.5rem, 2vw, 1rem) 0 2rem;
      }

      .profile-header {
        text-align: center;
        margin-bottom: 1.25rem;
      }

      .profile-header h2 {
        margin: 0;
        font-family: var(--psy-font-display);
        font-size: clamp(1.1rem, 3vw, 1.45rem);
        letter-spacing: 0.05em;
        color: #fff;
      }

      .profile-header p {
        margin: 0.35rem 0 0;
        color: #9b8fd9;
        font-size: 0.9rem;
      }

      .status-ok {
        margin: 1rem 0 0;
        color: #52c9a8;
        font-size: 0.9rem;
      }

      .status-error {
        margin: 1rem 0 0;
        color: #e86a6a;
        font-size: 0.9rem;
      }

      .actions {
        margin-top: 1.25rem;
      }

      a.ghost-button {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
      }
    `,
  ],
})
export class TeacherCustomizePage implements OnInit {
  private readonly profile = inject(TeacherProfileService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly portraitUrl = TEACHER_PROFILE_PORTRAIT;
  readonly error = signal('');
  readonly message = signal('');
  readonly isSetup = signal(false);

  characterName = '';

  ngOnInit(): void {
    this.auth.ensureAuthenticatedOrRedirect();
    this.isSetup.set(this.profile.needsProfileSetup());
    this.characterName = this.profile.characterName();
    if (this.characterName === this.auth.currentUser()?.name) {
      this.characterName = '';
    }
  }

  onSave(name: string): void {
    this.error.set('');
    this.message.set('');
    const ok = this.profile.saveProfile(name);
    if (!ok) {
      this.error.set('No se pudo guardar. El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (this.isSetup()) {
      void this.router.navigateByUrl('/teacher/resumen');
      return;
    }
    this.message.set('¡Perfil guardado!');
    void this.router.navigateByUrl('/teacher/resumen');
  }

  onBack(): void {
    if (this.isSetup()) {
      this.auth.logout();
      return;
    }
    void this.router.navigateByUrl('/teacher/resumen');
  }
}
