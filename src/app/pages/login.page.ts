import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_LOGO_PATH, APP_NAME, APP_SHORT_TAGLINE } from '../core/branding.constants';
import { User } from '../models/academy.models';
import { AuthService } from '../services/auth.service';
import { AuthVerificationService } from '../services/auth-verification.service';
import { GuideCharacterComponent } from '../shared/guide/components/guide-character/guide-character.component';
import { GuideService } from '../shared/guide/services/guide.service';
import { StudentProfileService } from '../shared/guide/services/student-profile.service';
import { TeacherProfileService } from '../shared/guide/services/teacher-profile.service';
import { PresenceService } from '../services/presence.service';
import { GameLoaderService } from '../shared/services/game-loader.service';
import { GameSfxService } from '../shared/services/game-sfx.service';
import { ThreeBackgroundComponent } from '../shared/ui/three-background/three-background.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ThreeBackgroundComponent, GuideCharacterComponent],
  styleUrl: './login-lobby.css',
  template: `
    <app-three-background intensity="login" />

    <!-- Capa de personaje: integrada al entorno, sin marco -->
    <div
      class="lobby-character-layer"
      [style.--char-parallax-x]="parallaxX()"
      [style.--char-parallax-y]="parallaxY()"
      aria-hidden="true"
    >
      <div class="lobby-character-glow"></div>
      <app-guide-character presentation="stage" [mood]="guide.displayMood()" />
    </div>

    <main class="lobby-shell">
      <header class="lobby-topbar">
        <a class="lobby-brand" href="/login" [attr.aria-label]="appName">
          <img [src]="appLogo" alt="" aria-hidden="true" />
          <div>
            <span class="brand-title">{{ appName }}</span>
            <span class="brand-sub">Neural Mind Engine</span>
          </div>
        </a>
        <div class="lobby-top-actions">
          <button type="button" class="icon-chip" (click)="sfx.toggle()" [attr.aria-pressed]="sfx.enabled()">
            <span class="material-symbols-outlined" aria-hidden="true">
              {{ sfx.enabled() ? 'volume_up' : 'volume_off' }}
            </span>
            <span>SFX</span>
          </button>
          <button type="button" class="icon-chip" aria-label="Idioma espanol">
            <span class="material-symbols-outlined" aria-hidden="true">language</span>
            <span>ES</span>
          </button>
        </div>
      </header>

      <section class="lobby-stage" [attr.aria-label]="'Pantalla de inicio de ' + appName">
        <div class="lobby-content">
          <div class="lobby-copy">
            <p class="lobby-eyebrow">{{ appTagline }}</p>
            <h1 class="lobby-title">
              <span class="title-line">ENTRA A</span>
              <span class="title-line title-accent">{{ appName }}</span>
            </h1>
            <p class="lobby-tagline">Casos clínicos · Retroalimentación · Progreso gamificado</p>
          </div>
        </div>

        <div class="login-portal" [class.is-loading]="submitting()">
          <div class="portal-glow" aria-hidden="true"></div>
          <div class="portal-frame">
            <div class="portal-header">
              <span class="portal-badge">ONLINE</span>
              <h2>{{ loginStep() === 'verify' ? 'Verificación' : 'Iniciar sesión' }}</h2>
              <p>
                @if (loginStep() === 'verify') {
                  Ingresa el código de 6 dígitos que enviamos a {{ email }}.
                } @else {
                  Un solo acceso. El sistema detecta tu rol automáticamente.
                }
              </p>
            </div>

            @if (loginStep() === 'credentials') {
            <form class="portal-form" (ngSubmit)="submitLogin()">
              <label class="portal-field" for="login-email">
                Correo institucional
                <span class="field-shell">
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    [(ngModel)]="email"
                    autocomplete="email"
                    placeholder="nombre@institucion.edu"
                    required
                    [disabled]="submitting()"
                    (focus)="sfx.playHover()"
                  />
                  <span class="material-symbols-outlined" aria-hidden="true">badge</span>
                </span>
              </label>

              <label class="portal-field" for="login-credential">
                <span class="field-label-row">
                  Contraseña
                </span>
                <span class="field-shell">
                  <input
                    id="login-credential"
                    name="credential"
                    type="text"
                    [(ngModel)]="credential"
                    autocomplete="current-password"
                    placeholder="Ingrese contraseña"
                    required
                    [disabled]="submitting()"
                  />
                  <span class="material-symbols-outlined" aria-hidden="true">badge</span>
                </span>
              </label>

              <button class="portal-submit" type="submit" [disabled]="submitting()" (mouseenter)="sfx.playHover()">
                <span class="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                {{ submitting() ? 'Conectando...' : 'INGRESAR' }}
              </button>
            </form>
            } @else {
            <form class="portal-form" (ngSubmit)="confirmVerification()">
              <label class="portal-field" for="login-verification-code">
                Código de verificación
                <span class="field-shell">
                  <input
                    id="login-verification-code"
                    name="verificationCode"
                    type="text"
                    inputmode="numeric"
                    maxlength="6"
                    [(ngModel)]="verificationCode"
                    autocomplete="one-time-code"
                    placeholder="000000"
                    required
                    [disabled]="submitting()"
                  />
                  <span class="material-symbols-outlined" aria-hidden="true">pin</span>
                </span>
              </label>

              @if (infoMessage()) {
                <p class="form-hint muted">{{ infoMessage() }}</p>
              }

              @if (error()) {
                <p class="portal-error" role="alert">{{ error() }}</p>
              }

              <button class="portal-submit" type="submit" [disabled]="submitting()" (mouseenter)="sfx.playHover()">
                <span class="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                {{ submitting() ? 'Verificando...' : 'VERIFICAR E INGRESAR' }}
              </button>
              <button class="ghost-button" type="button" (click)="backToCredentials()" [disabled]="submitting()">
                Volver
              </button>
            </form>
            }

            @if (loginStep() === 'credentials' && error()) {
              <p class="portal-error" role="alert">{{ error() }}</p>
            }


          </div>
        </div>

      </section>

      <footer class="lobby-footer">
        <div class="lobby-footer-spacer" aria-hidden="true"></div>
        <aside class="lobby-active-users" aria-label="Usuarios conectados en tiempo real">
          <div class="active-users-card" [class.is-live]="presence.connected()">
            <span class="material-symbols-outlined" aria-hidden="true">groups</span>
            <div class="active-users-data">
              <strong>{{ presence.activeCount() }}</strong>
              <small>{{ presence.connected() ? 'Conectados ahora' : 'Reconectando…' }}</small>
            </div>
            <span class="live-indicator" [attr.aria-label]="presence.connected() ? 'En vivo' : 'Sin conexión'"></span>
          </div>
        </aside>
        <div class="lobby-footer-meta">
          <span class="footer-status">System Status: Optimal</span>
          <span class="footer-copy">2026 NEURAL LABS INC.</span>
        </div>
      </footer>
    </main>
  `,
})
export class LoginPage implements OnInit {
  protected readonly appName = APP_NAME;
  protected readonly appTagline = APP_SHORT_TAGLINE;
  protected readonly appLogo = APP_LOGO_PATH;
  private readonly auth = inject(AuthService);
  private readonly verification = inject(AuthVerificationService);
  private readonly router = inject(Router);
  private readonly loader = inject(GameLoaderService);
  protected readonly guide = inject(GuideService);
  private readonly studentProfile = inject(StudentProfileService);
  private readonly teacherProfile = inject(TeacherProfileService);
  protected readonly sfx = inject(GameSfxService);
  protected readonly presence = inject(PresenceService);

  email = '';
  credential = '';
  verificationCode = '';
  readonly loginStep = signal<'credentials' | 'verify'>('credentials');
  readonly infoMessage = signal('');
  readonly error = signal('');
  readonly submitting = signal(false);
  readonly parallaxX = signal(0);
  readonly parallaxY = signal(0);

  ngOnInit(): void {
    this.guide.setVisible(true);
    this.guide.setContext('login_welcome');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    this.parallaxX.set(x);
    this.parallaxY.set(y);
  }

  async submitLogin(): Promise<void> {
    if (this.submitting()) return;

    this.error.set('');
    this.infoMessage.set('');
    this.submitting.set(true);
    this.sfx.playClick();

    const preview = this.auth.authenticateLogin(this.email.trim(), this.credential);
    if (!preview.user) {
      this.submitting.set(false);
      this.sfx.playError();
      this.error.set(preview.error ?? 'Credenciales inválidas.');
      return;
    }

    if (this.auth.requiresVerificationCode(preview.user.role)) {
      const result = await this.verification.requestCode(this.email, this.credential);
      this.submitting.set(false);

      if (!result.ok) {
        this.sfx.playError();
        this.error.set(result.error ?? 'No se pudo enviar el código de verificación.');
        return;
      }

      this.sfx.playSuccess();
      this.infoMessage.set(result.message ?? 'Revisa tu correo.');
      this.verificationCode = '';
      this.loginStep.set('verify');
      return;
    }

    await this.completeLogin(preview.user);
  }

  backToCredentials(): void {
    this.loginStep.set('credentials');
    this.verificationCode = '';
    this.error.set('');
    this.infoMessage.set('');
  }

  async confirmVerification(): Promise<void> {
    if (this.submitting()) return;

    this.error.set('');
    this.submitting.set(true);
    this.sfx.playClick();

    const result = await this.verification.verifyCode(this.email, this.verificationCode);
    if (!result.user) {
      this.submitting.set(false);
      this.sfx.playError();
      this.error.set(result.error ?? 'Código inválido.');
      return;
    }

    await this.completeLogin(result.user);
  }

  private async completeLogin(user: User): Promise<void> {

    this.guide.setContext('loader');

    await this.loader.runSequence([
      { progress: 15, message: 'Verificando credenciales...', delayMs: 380 },
      { progress: 40, message: 'Autenticando en el servidor neural...', delayMs: 450 },
      { progress: 65, message: `Rol detectado: ${this.auth.roleLabel(user.role)}`, delayMs: 500 },
      { progress: 85, message: `Preparando ${APP_NAME}...`, delayMs: 420 },
      { progress: 100, message: '¡Entrando al juego!', delayMs: 350 },
    ]);

    this.auth.establishSession(user);
    this.sfx.playSuccess();

    let route = this.auth.homeRouteFor(user.role);
    if (user.role === 'STUDENT' && this.studentProfile.needsOnboarding()) {
      route = '/student/onboarding';
    }
    if (user.role === 'TEACHER' && this.teacherProfile.needsProfileSetup()) {
      route = '/teacher/perfil';
    }

    await this.router.navigateByUrl(route);
    this.loader.hide();
    this.submitting.set(false);
  }
}
