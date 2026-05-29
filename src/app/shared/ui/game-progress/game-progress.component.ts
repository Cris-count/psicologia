import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-game-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="game-progress"
      role="progressbar"
      [attr.aria-valuenow]="value()"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-label]="label() || 'Progreso'"
    >
      <div class="game-progress-fill" [style.width.%]="clamped()"></div>
    </div>
    @if (showLabel()) {
      <small class="game-progress-label">{{ clamped() }}%</small>
    }
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: 0.35rem;
        width: 100%;
      }

      .game-progress-label {
        color: var(--psy-accent);
        font-family: var(--psy-font-hud);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
    `,
  ],
})
export class GameProgressComponent {
  readonly value = input(0);
  readonly label = input('');
  readonly showLabel = input(false);

  readonly clamped = computed(() => Math.min(100, Math.max(0, this.value())));
}
