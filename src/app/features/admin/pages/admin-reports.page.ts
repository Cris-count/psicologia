import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminPlatformService } from '../services/admin-platform.service';

@Component({
  selector: 'app-admin-reports-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="admin-page-title">
      <p class="eyebrow">Instituciones</p>
      <h2>Reportes de uso institucional</h2>
    </header>
    <article class="admin-card">
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Institución</th>
              <th>Sesiones</th>
              <th>Eficiencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            @for (row of platform.institutionalReports(); track row.institution) {
              <tr>
                <td>{{ row.institution }}</td>
                <td>{{ row.sessions }}</td>
                <td>{{ row.efficiencyPercent }}%</td>
                <td>{{ row.statusLabel }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </article>
  `,
})
export class AdminReportsPage {
  protected readonly platform = inject(AdminPlatformService);
}
