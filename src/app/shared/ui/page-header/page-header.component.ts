import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      <div>
        @if (eyebrow()) {
          <p class="eyebrow">{{ eyebrow() }}</p>
        }
        <h2>{{ title() }}</h2>
        @if (description()) {
          <p class="muted">{{ description() }}</p>
        }
      </div>
      @if (statusLabel()) {
        <div class="status-note game-badge-gold">{{ statusLabel() }}</div>
      }
    </header>
  `,
})
export class PageHeaderComponent {
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly statusLabel = input<string>('');
}
