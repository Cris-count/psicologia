import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { APP_LOGO_PATH, APP_NAME } from '../../../core/branding.constants';
import { AcademyDataService } from '../../../services/academy-data.service';
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
      <aside class="teacher-sidebar">
        <div class="teacher-brand">
          <img class="app-logo" [src]="appLogo" alt="" aria-hidden="true" />
          <div>
            <p class="eyebrow">Neural Lab · Profesor</p>
            <h1>{{ appName }}</h1>
          </div>
        </div>

        <nav class="teacher-nav" aria-label="Módulo profesor">
          @for (item of navItems; track item.id) {
            <a
              class="teacher-nav-btn"
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
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
        <app-game-hud
          [eyebrow]="'Profesor · ' + appName"
          [title]="teacherProfile.characterName()"
          subtitle="Diseña casos, gestiona estudiantes y monitorea progreso"
          [teacherMode]="true"
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
  protected readonly teacherProfile = inject(TeacherProfileService);
  protected readonly appName = APP_NAME;
  protected readonly appLogo = APP_LOGO_PATH;
  protected readonly navItems = TEACHER_NAV_ITEMS;

  readonly teacherStats = computed(() => {
    const teacher = this.auth.currentUser();
    return teacher ? this.data.teacherStats(teacher.id) : undefined;
  });

  readonly teacherLevel = computed(() => {
    const stats = this.teacherStats();
    if (!stats) return 1;
    return Math.max(1, stats.publishedCases + stats.groups + stats.tasks);
  });

  readonly teacherXpPercent = computed(() => {
    const teacher = this.auth.currentUser();
    if (!teacher) return 0;
    const groupIds = new Set(this.data.groupsByTeacher(teacher.id).map((group) => group.id));
    const taskIds = new Set(this.data.store().groupTasks.filter((task) => groupIds.has(task.groupId)).map((task) => task.id));
    const progressRows = this.data.store().studentProgress.filter((progress) => taskIds.has(progress.taskId));
    if (!progressRows.length) return 0;
    return Math.round(progressRows.reduce((sum, progress) => sum + progress.progressPercentage, 0) / progressRows.length);
  });

  ngOnInit(): void {
    this.auth.ensureAuthenticatedOrRedirect();
  }
}
