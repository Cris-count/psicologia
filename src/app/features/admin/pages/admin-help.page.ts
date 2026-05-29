import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-help-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="admin-page-title">
      <p class="eyebrow">Soporte</p>
      <h2>Help Center</h2>
    </header>
    <article class="admin-card">
      <h3>Documentación del proyecto</h3>
      <ul style="color:var(--admin-muted);line-height:1.7">
        <li><code>docs/admin/FASE-1-ESPECIFICACION.md</code> — requisitos y arquitectura admin</li>
        <li><code>docs/notion/export/Requisitos Funcionales csv *.csv</code> — matriz REQ-01…15</li>
        <li><code>docs/figma/admin-dashboard-neo.png</code> — referencia visual</li>
      </ul>
      <p style="color:var(--admin-muted);margin-top:1rem">
        REQ-01: solo administradores gestionan roles; solo docentes con flag <em>creador de casos</em> pueden formular casos (REQ-02).
      </p>
    </article>
  `,
})
export class AdminHelpPage {}
