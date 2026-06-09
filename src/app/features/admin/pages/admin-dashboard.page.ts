import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminPlatformService } from '../services/admin-platform.service';

@Component({
  selector: 'app-admin-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink],
  template: `
    <header class="admin-page-title">
      <p class="eyebrow">Métricas de plataforma</p>
      <h2>Panel administrativo</h2>
      <p class="admin-page-subtitle">Monitoreo del estado actual guardado en la base de datos.</p>
    </header>

    <section class="admin-metrics" aria-label="Indicadores">
      <article class="admin-card admin-metric">
        <span>Módulos activos</span>
        <strong>{{ platform.metrics().activeNodes }}</strong>
        <div class="admin-metric-foot">
          <span
            class="admin-badge"
            [class.stable]="platform.metrics().activeNodesStatus === 'stable'"
            [class.warn]="platform.metrics().activeNodesStatus === 'warning'"
            [class.critical]="platform.metrics().activeNodesStatus === 'critical'"
          >
            {{ platform.metrics().activeNodesStatus === 'stable' ? 'Estable' : 'Alerta' }}
          </span>
        </div>
      </article>
      <article class="admin-card admin-metric">
        <span>Gestión de usuarios</span>
        <strong>{{ platform.metrics().managedUsers | number }}</strong>
        <div class="admin-metric-foot">
          <span class="admin-badge stable">{{ platform.metrics().userGrowthPercent }}% avance promedio</span>
        </div>
      </article>
      <article class="admin-card admin-metric">
        <span>Alertas de sincronía</span>
        <strong>{{ platform.metrics().syncAlerts }}</strong>
        @if (platform.metrics().syncAlerts > 0) {
          <div class="admin-metric-foot">
            <span class="material-symbols-outlined admin-badge critical" aria-hidden="true">warning</span>
          </div>
        }
      </article>
    </section>

    <section class="admin-grid-2">
      <article class="admin-card">
        <h3>Estado de los módulos del sistema</h3>
        @for (node of platform.serverNodes(); track node.id) {
          <div class="admin-node-row">
            <div class="admin-node-head">
              <strong>{{ node.name }}</strong>
              <span
                class="admin-badge"
                [class.stable]="node.status === 'online'"
                [class.warn]="node.status === 'maintenance'"
              >
                {{ node.status }}
              </span>
            </div>
            <p class="admin-node-meta">{{ node.location }} · {{ node.latencyMs }}ms · Carga {{ node.loadPercent }}%</p>
            <div class="admin-progress" aria-hidden="true"><span [style.width.%]="node.loadPercent"></span></div>
          </div>
        }
      </article>

      <article class="admin-card">
        <h3>Reportes de uso institucional</h3>
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
                  <td>
                    <span
                      class="admin-badge"
                      [class.critical]="row.statusTone === 'premium'"
                      [class.stable]="row.statusTone === 'full'"
                      [class.warn]="row.statusTone === 'trial'"
                    >
                      {{ row.statusLabel }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <a class="admin-fab" routerLink="/admin/usuarios" aria-label="Crear usuario">+</a>
  `,
})
export class AdminDashboardPage {
  protected readonly platform = inject(AdminPlatformService);
}
