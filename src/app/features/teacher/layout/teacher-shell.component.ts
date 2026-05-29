import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { APP_LOGO_PATH, APP_NAME } from '../../../core/branding.constants';
import { GameAnimateDirective } from '../../../shared/directives/game-animate.directive';
import { GameHudComponent } from '../../../shared/ui/game-hud/game-hud.component';
import { GameLogoutButtonComponent } from '../../../shared/ui/game-logout-button/game-logout-button.component';
import { ThreeBackgroundComponent } from '../../../shared/ui/three-background/three-background.component';

@Component({
  selector: 'app-teacher-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ThreeBackgroundComponent,
    GameHudComponent,
    GameLogoutButtonComponent,
    GameAnimateDirective,
  ],
  template: `
    <app-three-background intensity="ambient" />
    <div class="teacher-app">
      <aside class="teacher-sidebar">
        <div class="teacher-brand">
          <img class="app-logo" [src]="appLogo" alt="" aria-hidden="true" />
          <div>
            <p class="eyebrow">Neural Lab · Profesor</p>
            <h1>{{ appName }}</h1>
          </div>
        </div>

        <nav class="teacher-nav" aria-label="Módulo profesor">
          <a routerLink="/teacher/resumen" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <span class="material-symbols-outlined" aria-hidden="true">dashboard</span>
            Resumen
          </a>
          <a routerLink="/teacher/casos" routerLinkActive="active">
            <span class="material-symbols-outlined" aria-hidden="true">psychology</span>
            Casos psicológicos
          </a>
          <a routerLink="/teacher/grupos" routerLinkActive="active">
            <span class="material-symbols-outlined" aria-hidden="true">groups</span>
            Grupos
          </a>
          <a routerLink="/teacher/estudiantes" routerLinkActive="active">
            <span class="material-symbols-outlined" aria-hidden="true">school</span>
            Estudiantes
          </a>
          <a routerLink="/teacher/tareas" routerLinkActive="active">
            <span class="material-symbols-outlined" aria-hidden="true">assignment</span>
            Tareas
          </a>
          <a routerLink="/teacher/resultados" routerLinkActive="active">
            <span class="material-symbols-outlined" aria-hidden="true">monitoring</span>
            Resultados
          </a>
        </nav>

        <app-game-logout-button label="Cerrar sesión" [block]="true" />
      </aside>

      <main class="teacher-main">
        <app-game-hud
          [eyebrow]="'Profesor · ' + appName"
          [title]="auth.currentUser()?.name ?? 'Instructor'"
          subtitle="Diseña casos, gestiona estudiantes y monitorea progreso"
          [level]="12"
          [xpPercent]="72"
        >
          <app-game-logout-button hudActions label="Salir" [compact]="true" />
        </app-game-hud>
        <div class="teacher-content" appGameAnimate="fade-up">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styleUrl: './teacher-shell.component.css',
})
export class TeacherShellComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly appName = APP_NAME;
  protected readonly appLogo = APP_LOGO_PATH;

  ngOnInit(): void {
    this.auth.ensureAuthenticatedOrRedirect();
  }
}
