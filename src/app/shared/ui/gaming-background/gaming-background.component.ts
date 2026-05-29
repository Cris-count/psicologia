import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-gaming-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="game-bg-layer" aria-hidden="true">
      @for (p of particles; track p.id) {
        <span
          class="game-particle"
          [style.left.%]="p.left"
          [style.width.px]="p.size"
          [style.height.px]="p.size"
          [style.animation-duration.s]="p.duration"
          [style.animation-delay.s]="p.delay"
        ></span>
      }
    </div>
  `,
})
export class GamingBackgroundComponent {
  readonly intensity = input<'low' | 'medium' | 'high'>('medium');

  readonly particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 12 + Math.random() * 18,
    delay: Math.random() * 10,
  }));
}
