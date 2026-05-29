import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="metric-card game-animate-in">
      <span>{{ label() }}</span>
      <strong>{{ value() }}</strong>
      @if (badge()) {
        <span class="game-badge game-badge-gold">{{ badge() }}</span>
      }
    </article>
  `,
  styles: [
    `
      .metric-card {
        position: relative;
      }

      .game-badge {
        justify-self: start;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class MetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly badge = input<string>('');
}
