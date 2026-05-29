import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_LOGO_PATH, APP_NAME, APP_SHORT_TAGLINE, GUIDE_NAME, GUIDE_TITLE } from '../core/branding.constants';
import { AuthService } from '../services/auth.service';
import { GuideCharacterComponent } from '../shared/guide/components/guide-character/guide-character.component';
import { GuideService } from '../shared/guide/services/guide.service';
import { StudentProfileService } from '../shared/guide/services/student-profile.service';
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

          <div class="lobby-npc-dialogue" role="region" [attr.aria-label]="'Diálogo de ' + guideName">
            <div class="npc-dialogue-inner">
              <span class="npc-badge">{{ guideTitle }}</span>
              <p class="npc-message">{{ guide.message() }}</p>
            </div>
          </div>
        </div>

        <div class="login-portal" [class.is-loading]="submitting()">
          <div class="portal-glow" aria-hidden="true"></div>
          <div class="portal-frame">
            <div class="portal-header">
              <span class="portal-badge">ONLINE</span>
              <h2>Iniciar sesión</h2>
              <p>Un solo acceso. El sistema detecta tu rol automáticamente.</p>
            </div>

            <form class="portal-form" (ngSubmit)="login()">
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

              <label class="portal-field" for="login-password">
                <span class="field-label-row">
                  Contraseña
                  <a href="#" (click)="$event.preventDefault()">¿Olvidaste tu clave?</a>
                </span>
                <span class="field-shell">
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    [(ngModel)]="password"
                    autocomplete="current-password"
                    placeholder="••••••••"
                    required
                    [disabled]="submitting()"
                  />
                  <span class="material-symbols-outlined" aria-hidden="true">lock</span>
                </span>
              </label>

              @if (error()) {
                <p class="portal-error" role="alert">{{ error() }}</p>
              }

              <button class="portal-submit" type="submit" [disabled]="submitting()" (mouseenter)="sfx.playHover()">
                <span class="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                {{ submitting() ? 'Conectando...' : 'JUGAR AHORA' }}
              </button>
            </form>

            <div class="demo-panel" aria-label="Credenciales demo">
              <strong>Demo — usa cualquier rol</strong>
              <span>superadmin&#64;demo.edu · maestro&#64;demo.edu · estudiante&#64;demo.edu</span>
              <span>Contraseña: demo123</span>
            </div>
          </div>
        </div>

        <aside class="lobby-stats" aria-label="Estadísticas del servidor">
          <div class="stat-chip">
            <span class="material-symbols-outlined" aria-hidden="true">groups</span>
            <div>
              <strong>1,284</strong>
              <small>Jugadores activos</small>
            </div>
          </div>
          <div class="stat-chip">
            <span class="material-symbols-outlined" aria-hidden="true">bolt</span>
            <div>
              <strong>99.9%</strong>
              <small>Uptime neural</small>
            </div>
          </div>
          <div class="stat-chip">
            <span class="material-symbols-outlined" aria-hidden="true">verified</span>
            <div>
              <strong>v4.0.2</strong>
              <small>Build estable</small>
            </div>
          </div>
        </aside>
      </section>

      <footer class="lobby-footer">
        <span>System Status: Optimal</span>
        <span>2026 NEURAL LABS INC.</span>
      </footer>
    </main>
  `,
})
export class LoginPage implements OnInit {
  protected readonly appName = APP_NAME;
  protected readonly appTagline = APP_SHORT_TAGLINE;
  protected readonly appLogo = APP_LOGO_PATH;
  protected readonly guideName = GUIDE_NAME;
  protected readonly guideTitle = GUIDE_TITLE;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loader = inject(GameLoaderService);
  protected readonly guide = inject(GuideService);
  private readonly studentProfile = inject(StudentProfileService);
  protected readonly sfx = inject(GameSfxService);

  email = '';
  password = '';
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

  async login(): Promise<void> {
    if (this.submitting()) return;

    this.error.set('');
    this.submitting.set(true);
    this.sfx.playClick();

    const user = this.auth.authenticateCredentials(this.email.trim(), this.password);
    if (!user) {
      this.submitting.set(false);
      this.sfx.playError();
      this.error.set('Credenciales inválidas o usuario inactivo.');
      return;
    }

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

    await this.router.navigateByUrl(route);
    this.loader.hide();
    this.submitting.set(false);
  }
}
