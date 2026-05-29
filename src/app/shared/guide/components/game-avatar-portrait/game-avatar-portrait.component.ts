import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarId } from '../../../../models/academy.models';

@Component({
  selector: 'app-game-avatar-portrait',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="hero-portrait"
      [class.size-sm]="size() === 'sm'"
      [class.size-lg]="size() === 'lg'"
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      [attr.aria-label]="'Avatar ' + avatarId()"
    >
      <defs>
        <linearGradient [attr.id]="'bg-' + avatarId()" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" [attr.stop-color]="palette().bg1" />
          <stop offset="100%" [attr.stop-color]="palette().bg2" />
        </linearGradient>
        <linearGradient [attr.id]="'rim-' + avatarId()" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </linearGradient>
        <filter [attr.id]="'glow-' + avatarId()">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="200" height="240" [attr.fill]="'url(#bg-' + avatarId() + ')'" rx="16" />
      <rect x="8" y="8" width="184" height="224" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" rx="12" />
      <ellipse cx="100" cy="200" rx="70" ry="18" fill="rgba(0,0,0,0.35)" />

      @switch (avatarId()) {
        @case ('neural-01') {
          <g class="hero-body">
            <path d="M55 95 Q100 70 145 95 L150 210 Q100 225 50 210 Z" fill="#1e3a6e" />
            <path d="M65 100 Q100 82 135 100 L138 185 Q100 198 62 185 Z" fill="#3d6fd4" />
            <circle cx="100" cy="88" r="38" fill="#c68642" />
            <path d="M68 55 Q100 28 132 55 L128 78 Q100 62 72 78 Z" fill="#2a1f1a" />
            <rect x="78" y="72" width="44" height="8" rx="4" fill="#111" opacity="0.7" />
            <circle cx="88" cy="88" r="4" fill="#f4c542" />
            <circle cx="112" cy="88" r="4" fill="#f4c542" />
            <path d="M92 102 Q100 108 108 102" stroke="#8b4513" stroke-width="2" fill="none" />
            <path d="M70 130 L130 130 L125 200 Q100 210 75 200 Z" fill="#6b8cff" opacity="0.9" />
            <circle cx="145" cy="160" r="12" fill="#6b8cff" filter="url(#glow-neural-01)" opacity="0.8" />
          </g>
        }
        @case ('psyche-02') {
          <g class="hero-body">
            <path d="M55 95 Q100 70 145 95 L150 210 Q100 225 50 210 Z" fill="#0f3d3d" />
            <ellipse cx="100" cy="90" rx="36" ry="40" fill="#d4a574" />
            <path d="M72 48 Q100 22 128 48 L120 85 Q100 68 80 85 Z" fill="#1a1a1a" />
            <path d="M72 48 Q85 60 78 90" fill="#1a1a1a" />
            <path d="M128 48 Q115 60 122 90" fill="#1a1a1a" />
            <ellipse cx="88" cy="92" rx="5" ry="6" fill="#2d1f14" />
            <ellipse cx="112" cy="92" rx="5" ry="6" fill="#2d1f14" />
            <path d="M94 108 Q100 114 106 108" stroke="#a0522d" stroke-width="2" fill="none" />
            <path d="M68 125 L132 125 L128 205 Q100 218 72 205 Z" fill="#52c9a8" />
            <path d="M85 145 L115 145 L110 175 L90 175 Z" fill="#fff" opacity="0.15" />
          </g>
        }
        @case ('cortex-03') {
          <g class="hero-body">
            <path d="M52 98 Q100 68 148 98 L152 212 Q100 228 48 212 Z" fill="#2d1f4a" />
            <circle cx="100" cy="86" r="37" fill="#e0ac69" />
            <path d="M70 50 Q100 25 130 50 L125 75 Q100 58 75 75 Z" fill="#4a3728" />
            <rect x="72" y="78" width="56" height="14" rx="7" fill="none" stroke="#9b8fd9" stroke-width="2" />
            <circle cx="86" cy="85" r="5" fill="#7b5cbf" />
            <circle cx="114" cy="85" r="5" fill="#7b5cbf" />
            <path d="M90 105 Q100 112 110 105" stroke="#8b6914" stroke-width="2" fill="none" />
            <path d="M65 128 L135 128 L130 208 Q100 220 70 208 Z" fill="#7b5cbf" />
            <circle cx="100" cy="155" r="8" fill="#d65db1" opacity="0.6" />
          </g>
        }
        @case ('mind-04') {
          <g class="hero-body">
            <path d="M54 96 Q100 68 146 96 L150 210 Q100 226 50 210 Z" fill="#3a1535" />
            <ellipse cx="100" cy="88" rx="35" ry="38" fill="#6b4423" />
            <path d="M68 45 Q100 18 132 45 L135 80 Q100 55 65 80 Z" fill="#0a0a0a" />
            <path d="M68 45 Q75 70 70 95" fill="#0a0a0a" />
            <ellipse cx="87" cy="90" rx="5" ry="6" fill="#f4c542" />
            <ellipse cx="113" cy="90" rx="5" ry="6" fill="#f4c542" />
            <path d="M93 107 Q100 115 107 107" stroke="#4a3018" stroke-width="2" fill="none" />
            <path d="M62 124 L138 124 L133 206 Q100 219 67 206 Z" fill="#d65db1" />
            <path d="M75 130 L125 130 L120 160 L80 160 Z" fill="#ff00aa" opacity="0.25" />
          </g>
        }
        @case ('synapse-05') {
          <g class="hero-body">
            <path d="M50 94 Q100 62 150 94 L155 215 Q100 232 45 215 Z" fill="#3d2a00" />
            <circle cx="100" cy="84" r="40" fill="#f1c27d" />
            <path d="M65 42 Q100 12 135 42 L130 72 Q100 48 70 72 Z" fill="#ffd700" />
            <rect x="74" y="74" width="52" height="12" rx="3" fill="#111" opacity="0.5" />
            <circle cx="86" cy="86" r="5" fill="#fff" />
            <circle cx="114" cy="86" r="5" fill="#fff" />
            <path d="M91 104 Q100 112 109 104" stroke="#c68642" stroke-width="2" fill="none" />
            <path d="M58 122 L142 122 L136 210 Q100 225 64 210 Z" fill="#f4c542" opacity="0.35" />
            <path d="M70 135 L130 135 L125 190 L75 190 Z" fill="#f4c542" opacity="0.4" />
            <polygon points="100,55 108,75 92,75" fill="#f4c542" />
          </g>
        }
        @default {
          <g class="hero-body">
            <path d="M52 96 Q100 66 148 96 L152 212 Q100 228 48 212 Z" fill="#1a2a5e" />
            <circle cx="100" cy="86" r="38" fill="#d4a574" />
            <path d="M68 44 Q100 16 132 44 L128 78 Q100 58 72 78 Z" fill="#2c1810" />
            <path d="M72 44 Q80 65 76 88" fill="#2c1810" />
            <path d="M128 44 Q120 65 124 88" fill="#2c1810" />
            <circle cx="87" cy="90" r="5" fill="#6b8cff" />
            <circle cx="113" cy="90" r="5" fill="#6b8cff" />
            <path d="M92 106 Q100 114 108 106" stroke="#8b4513" stroke-width="2" fill="none" />
            <path d="M60 126 L140 126 L135 208 Q100 222 65 208 Z" fill="#4a6fd4" />
            <path d="M55 130 L70 200 L85 130" fill="#f4c542" opacity="0.5" />
            <path d="M115 130 L130 200 L145 130" fill="#f4c542" opacity="0.5" />
          </g>
        }
      }

      <rect x="8" y="8" width="184" height="80" [attr.fill]="'url(#rim-' + avatarId() + ')'" opacity="0.5" style="pointer-events:none" />
    </svg>
  `,
  styles: [
    `
      .hero-portrait {
        width: 100%;
        height: auto;
        display: block;
        border-radius: var(--psy-radius-sm);
        filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.45));
      }

      .hero-portrait.size-sm {
        max-width: 72px;
      }

      .hero-portrait.size-lg {
        max-width: 220px;
      }

      .hero-body {
        animation: hero-idle 4.5s ease-in-out infinite;
        transform-origin: 100px 200px;
      }

      @keyframes hero-idle {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-3px) scale(1.01); }
      }
    `,
  ],
})
export class GameAvatarPortraitComponent {
  readonly avatarId = input<AvatarId>('neural-01');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  palette(): { bg1: string; bg2: string } {
    const palettes: Record<AvatarId, { bg1: string; bg2: string }> = {
      'neural-01': { bg1: '#1a3a6e', bg2: '#0d1528' },
      'psyche-02': { bg1: '#0f4a4a', bg2: '#0a1f1f' },
      'cortex-03': { bg1: '#3d2663', bg2: '#1a1535' },
      'mind-04': { bg1: '#4a1942', bg2: '#1a0a18' },
      'synapse-05': { bg1: '#5c3d00', bg2: '#2a1a00' },
      'pulse-06': { bg1: '#1e3a8a', bg2: '#13102a' },
    };
    return palettes[this.avatarId()] ?? palettes['neural-01'];
  }
}
