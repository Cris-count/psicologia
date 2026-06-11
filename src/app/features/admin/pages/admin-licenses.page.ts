import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminPlatformService } from '../services/admin-platform.service';

@Component({
  selector: 'app-admin-licenses-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="admin-page-title">
      <p class="eyebrow">Plataforma</p>
      <h2>Control de licencias</h2>
    </header>
    <article class="admin-card">
      <p class="admin-badge critical">{{ platform.licenseSummary().expiringLabel }}</p>
      <p style="color:var(--admin-muted);margin:1rem 0">Usuarios registrados: <strong>{{ platform.licenseSummary().totalIssued }}</strong></p>
      <p style="color:var(--admin-muted)">Este panel usa el estado real de usuarios activos e inactivos del sistema.</p>
    </article>
  `,
})
export class AdminLicensesPage {
  protected readonly platform = inject(AdminPlatformService);
}
