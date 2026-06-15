import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { APP_LOGO_PATH, APP_NAME } from '../../../core/branding.constants';
import { GameAnimateDirective } from '../../../shared/directives/game-animate.directive';
import { TeacherProfileService } from '../../../shared/guide/services/teacher-profile.service';
import { GameHudComponent } from '../../../shared/ui/game-hud/game-hud.component';
import { GameLogoutButtonComponent } from '../../../shared/ui/game-logout-button/game-logout-button.component';
import { ThreeBackgroundComponent } from '../../../shared/ui/three-background/three-background.component';
import { TEACHER_NAV_ITEMS } from '../data/teacher-nav.catalog';

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
      <div
        class="sidebar-overlay"
        [class.open]="sidebarOpen()"
        (click)="sidebarOpen.set(false)"
      ></div>

      <aside class="teacher-sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header-row">
          <div class="teacher-brand">
            <img class="app-logo" [src]="appLogo" alt="" aria-hidden="true" />
            <div>
              <p class="eyebrow">Neural Lab · Profesor</p>
              <h1>{{ appName }}</h1>
            </div>
          </div>
          <button
            class="sidebar-close-btn"
            type="button"
            aria-label="Cerrar menú"
            (click)="sidebarOpen.set(false)"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav class="teacher-nav" aria-label="Módulo profesor">
          @for (item of navItems; track item.id) {
            <a
              class="teacher-nav-btn"
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
              (click)="sidebarOpen.set(false)"
            >
              <span class="nav-icon-frame">
                <img class="nav-icon" [src]="item.iconUrl" [alt]="''" width="40" height="40" />
              </span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <app-game-logout-button label="Cerrar sesión" [block]="true" />
      </aside>

      <main class="teacher-main">
        <div class="teacher-mobile-bar">
          <button
            class="hamburger-btn"
            type="button"
            aria-label="Abrir menú"
            (click)="sidebarOpen.set(!sidebarOpen())"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
          <span class="mobile-bar-title">{{ appName }}</span>
        </div>
        <app-game-hud
          [eyebrow]="'Profesor · ' + appName"
          [title]="teacherProfile.characterName()"
          subtitle="Diseña casos, gestiona estudiantes y monitorea progreso"
          [teacherMode]="true"
        >
          <button
            class="hamburger-btn-inline"
            type="button"
            hudActions
            aria-label="Abrir menú"
            (click)="sidebarOpen.set(!sidebarOpen())"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
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
  protected readonly teacherProfile = inject(TeacherProfileService);
  protected readonly appName = APP_NAME;
  protected readonly appLogo = APP_LOGO_PATH;
  protected readonly navItems = TEACHER_NAV_ITEMS;
  protected readonly sidebarOpen = signal(false);

  constructor() {
    effect(() => {
      if (this.sidebarOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  ngOnInit(): void {
    this.auth.ensureAuthenticatedOrRedirect();
  }
}
