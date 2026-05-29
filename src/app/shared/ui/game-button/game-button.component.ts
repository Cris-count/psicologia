import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type GameButtonVariant = 'primary' | 'ghost' | 'gold';

@Component({
  selector: 'app-game-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [class]="buttonClass()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || null"
    >
      <ng-content />
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      button {
        width: 100%;
      }
    `,
  ],
})
export class GameButtonComponent {
  readonly variant = input<GameButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly ariaLabel = input('');

  buttonClass(): string {
    const base = 'game-btn';
    const variants: Record<GameButtonVariant, string> = {
      primary: 'game-btn-primary',
      ghost: 'game-btn-ghost',
      gold: 'game-btn-gold',
    };
    return `${base} ${variants[this.variant()]}`;
  }
}
