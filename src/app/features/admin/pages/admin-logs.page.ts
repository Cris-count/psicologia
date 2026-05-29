import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AdminPlatformService } from '../services/admin-platform.service';

@Component({
  selector: 'app-admin-logs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <header class="admin-page-title">
      <p class="eyebrow">Auditoría</p>
      <h2>System Logs v4.0</h2>
    </header>
    <article class="admin-card admin-logs" style="max-height:none;min-height:360px" role="log">
      @for (entry of platform.logs(); track entry.timestamp + entry.message) {
        <div [class]="entry.level">[{{ entry.timestamp | date: 'yyyy-MM-dd HH:mm:ss' }}] {{ entry.message }}</div>
      }
    </article>
  `,
})
export class AdminLogsPage {
  protected readonly platform = inject(AdminPlatformService);
}
