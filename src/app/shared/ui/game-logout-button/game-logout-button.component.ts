import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { GameSfxService } from '../../services/game-sfx.service';

@Component({
  selector: 'app-game-logout-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="game-logout-btn"
      [class.compact]="compact()"
      [class.block]="block()"
      (click)="onLogout()"
      (mouseenter)="sfx.playHover()"
      aria-label="Cerrar sesión"
    >
      <span class="game-logout-glow" aria-hidden="true"></span>
      <span class="material-symbols-outlined" aria-hidden="true">logout</span>
      <span class="game-logout-label">{{ label() }}</span>
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      :host(.block) {
        display: block;
        width: 100%;
      }

      .game-logout-btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        overflow: hidden;
        border: 2px solid rgba(248, 113, 113, 0.45);
        border-radius: var(--psy-radius-sm, 12px);
        background: linear-gradient(180deg, rgba(248, 113, 113, 0.18), rgba(220, 38, 38, 0.12));
        color: #fca5a5;
        padding: 0.65rem 1rem;
        font-family: var(--psy-font-display, 'Fredoka', sans-serif);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        box-shadow: 0 3px 0 rgba(127, 29, 29, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }

      .game-logout-btn.compact {
        padding: 0.5rem 0.75rem;
        font-size: 0.72rem;
      }

      .game-logout-btn.block {
        width: 100%;
      }

      .game-logout-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 0%, rgba(248, 113, 113, 0.25), transparent 70%);
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }

      .game-logout-btn:hover {
        transform: translateY(-2px);
        border-color: rgba(248, 113, 113, 0.75);
        color: #fff;
        box-shadow:
          0 5px 0 rgba(127, 29, 29, 0.5),
          0 0 24px rgba(248, 113, 113, 0.35),
          inset 0 1px 0 rgba(255, 255, 255, 0.12);
      }

      .game-logout-btn:hover .game-logout-glow {
        opacity: 1;
      }

      .game-logout-btn:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 rgba(127, 29, 29, 0.5);
      }

      .game-logout-btn .material-symbols-outlined {
        font-size: 1.1rem;
      }
    `,
  ],
})
export class GameLogoutButtonComponent {
  private readonly auth = inject(AuthService);
  protected readonly sfx = inject(GameSfxService);

  readonly label = input('Cerrar sesión');
  readonly compact = input(false);
  readonly block = input(false);

  onLogout(): void {
    this.sfx.playClick();
    this.auth.logout();
  }
}
