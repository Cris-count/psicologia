import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThreeBackgroundComponent } from '../../../shared/ui/three-background/three-background.component';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '../components/admin-sidebar/admin-sidebar.component';
import { AdminSidebarService } from '../services/admin-sidebar.service';

@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminSidebarComponent, AdminHeaderComponent, RouterOutlet, ThreeBackgroundComponent],
  host: { class: 'admin-root' },
  template: `
    <app-three-background intensity="ambient" />
    <div
      class="admin-sidebar-overlay"
      [class.open]="sidebarService.sidebarOpen()"
      (click)="sidebarService.close()"
    ></div>
    <div class="admin-app">
      <app-admin-sidebar />
      <div class="admin-main">
        <app-admin-header />
        <div class="admin-content-area">
          <router-outlet />
        </div>
        <footer class="admin-footer">
          <span>⚡ MIND-SPHERE SYSTEMS</span>
          <span>SIMULATION VER 4.0.2 · 2026 NEURAL LABS INC.</span>
        </footer>
      </div>
    </div>
  `,
})
export class AdminShellComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  protected readonly sidebarService = inject(AdminSidebarService);

  ngOnInit(): void {
    document.body.classList.add('admin-mode');
    this.auth.ensureAuthenticatedOrRedirect();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('admin-mode');
  }
}
