import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_LOGO_PATH, APP_NAME } from '../../../core/branding.constants';
import { GuideCharacterComponent } from '../../guide/components/guide-character/guide-character.component';
import { GuideService } from '../../guide/services/guide.service';
import { GameLoaderService } from '../../services/game-loader.service';
import { GameProgressComponent } from '../game-progress/game-progress.component';

@Component({
  selector: 'app-game-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameProgressComponent, GuideCharacterComponent],
  template: `
    @if (loader.visible()) {
      <div class="game-loader-overlay" role="alertdialog" aria-live="assertive" aria-label="Cargando">
        <div class="loader-vortex" aria-hidden="true"></div>
        <div class="loader-ring loader-ring-outer" aria-hidden="true"></div>
        <div class="loader-ring loader-ring-inner" aria-hidden="true"></div>

        <div class="loader-panel">
          <app-guide-character presentation="chip" mood="thinking" />
          <div class="loader-logo">
            <img [src]="appLogo" alt="" aria-hidden="true" />
            <span>{{ appName }}</span>
          </div>
          <p class="loader-message">{{ loader.message() }}</p>
          <p class="loader-guide-line">{{ guide.message() }}</p>
          <app-game-progress [value]="loader.progress()" [showLabel]="true" />
          <div class="loader-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .game-loader-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: grid;
        place-items: center;
        background: radial-gradient(ellipse at center, rgba(34, 28, 66, 0.94), rgba(19, 16, 42, 0.98));
        backdrop-filter: blur(12px);
        animation: loader-fade-in 0.35s ease-out both;
      }

      .loader-vortex {
        position: absolute;
        width: min(90vw, 520px);
        height: min(90vw, 520px);
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          transparent,
          rgba(107, 140, 255, 0.22),
          rgba(214, 93, 177, 0.15),
          rgba(244, 197, 66, 0.12),
          transparent
        );
        animation: vortex-spin 5s linear infinite;
        filter: blur(2px);
      }

      .loader-ring {
        position: absolute;
        border-radius: 50%;
        border: 2px solid transparent;
      }

      .loader-ring-outer {
        width: min(70vw, 380px);
        height: min(70vw, 380px);
        border-top-color: var(--psy-accent);
        border-right-color: rgba(107, 140, 255, 0.28);
        animation: ring-spin 2s linear infinite;
      }

      .loader-ring-inner {
        width: min(55vw, 280px);
        height: min(55vw, 280px);
        border-bottom-color: var(--psy-gold);
        border-left-color: rgba(123, 92, 191, 0.28);
        animation: ring-spin 1.6s linear infinite reverse;
      }

      .loader-panel {
        position: relative;
        z-index: 2;
        width: min(420px, calc(100% - 2rem));
        display: grid;
        gap: 1rem;
        padding: 2rem;
        border: 2px solid var(--psy-border-gold);
        border-radius: var(--psy-radius-lg);
        background: linear-gradient(160deg, rgba(42, 36, 78, 0.95), rgba(34, 28, 66, 0.92));
        box-shadow: var(--psy-shadow), 0 0 32px rgba(107, 140, 255, 0.1);
        text-align: center;
        animation: loader-panel-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .loader-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.65rem;
        font-family: var(--psy-font-display);
        font-size: 1.1rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: var(--psy-gold);
        text-shadow: 0 0 20px rgba(255, 201, 71, 0.35);
      }

      .loader-logo img {
        width: 40px;
        height: 40px;
        filter: drop-shadow(0 0 12px rgba(255, 201, 71, 0.4));
      }

      .loader-message {
        margin: 0;
        font-family: var(--psy-font-hud);
        font-size: 0.72rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--psy-accent);
      }

      .loader-guide-line {
        margin: 0;
        font-size: 0.85rem;
        color: var(--psy-muted);
        line-height: 1.45;
      }

      .loader-panel app-guide-character {
        margin: 0 auto;
      }

      .loader-dots {
        display: flex;
        justify-content: center;
        gap: 0.4rem;
      }

      .loader-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--psy-primary);
        animation: dot-bounce 1.2s ease-in-out infinite;
      }

      .loader-dots span:nth-child(2) {
        animation-delay: 0.15s;
      }

      .loader-dots span:nth-child(3) {
        animation-delay: 0.3s;
      }

      @keyframes loader-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes loader-panel-pop {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @keyframes vortex-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes ring-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes dot-bounce {
        0%,
        80%,
        100% {
          transform: scale(0.6);
          opacity: 0.4;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `,
  ],
})
export class GameLoaderComponent {
  protected readonly loader = inject(GameLoaderService);
  protected readonly guide = inject(GuideService);
  protected readonly appName = APP_NAME;
  protected readonly appLogo = APP_LOGO_PATH;
}
