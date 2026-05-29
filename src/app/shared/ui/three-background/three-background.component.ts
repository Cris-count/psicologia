import {

  AfterViewInit,

  ChangeDetectionStrategy,

  Component,

  ElementRef,

  HostListener,

  OnDestroy,

  input,

  viewChild,

} from '@angular/core';

import { GameSceneEngine, SceneIntensity } from '../../engines/game-scene.engine';



@Component({

  selector: 'app-three-background',

  changeDetection: ChangeDetectionStrategy.OnPush,

  template: `

    <canvas #canvas class="three-canvas" aria-hidden="true"></canvas>

    <div class="three-vignette" aria-hidden="true"></div>

    <div class="three-glow three-glow-a" aria-hidden="true"></div>

    <div class="three-glow three-glow-b" aria-hidden="true"></div>

  `,

  styles: [

    `

      :host {

        position: fixed;

        inset: 0;

        z-index: 0;

        pointer-events: none;

        overflow: hidden;

      }



      .three-canvas {

        width: 100%;

        height: 100%;

        display: block;

        opacity: 0.92;

      }



      .three-vignette {

        position: absolute;

        inset: 0;

        background:

          radial-gradient(ellipse 75% 65% at 50% 48%, transparent 42%, rgba(19, 16, 42, 0.5) 100%),

          linear-gradient(180deg, rgba(19, 16, 42, 0.15) 0%, transparent 35%, rgba(19, 16, 42, 0.2) 100%);

        pointer-events: none;

      }



      .three-glow {

        position: absolute;

        border-radius: 50%;

        filter: blur(100px);

        opacity: 0.2;

        animation: glow-drift 22s ease-in-out infinite;

      }



      .three-glow-a {

        width: 520px;

        height: 520px;

        top: -12%;

        left: -10%;

        background: rgba(107, 140, 255, 0.22);

      }



      .three-glow-b {

        width: 460px;

        height: 460px;

        bottom: -14%;

        right: -10%;

        background: rgba(123, 92, 191, 0.18);

        animation-delay: -11s;

      }



      @keyframes glow-drift {

        0%,

        100% {

          transform: translate(0, 0) scale(1);

        }

        50% {

          transform: translate(16px, -12px) scale(1.03);

        }

      }



      @media (prefers-reduced-motion: reduce) {

        .three-glow {

          animation: none;

        }

      }

    `,

  ],

})

export class ThreeBackgroundComponent implements AfterViewInit, OnDestroy {

  readonly intensity = input<SceneIntensity>('ambient');

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private engine: GameSceneEngine | null = null;



  ngAfterViewInit(): void {

    const canvas = this.canvasRef().nativeElement;

    this.engine = new GameSceneEngine(canvas, this.intensity());

    this.engine.init(window.innerWidth, window.innerHeight);

  }



  ngOnDestroy(): void {

    this.engine?.dispose();

  }



  @HostListener('window:resize')

  onResize(): void {

    this.engine?.resize(window.innerWidth, window.innerHeight);

  }



  @HostListener('document:mousemove', ['$event'])

  onMouseMove(event: MouseEvent): void {

    const x = (event.clientX / window.innerWidth) * 2 - 1;

    const y = (event.clientY / window.innerHeight) * 2 - 1;

    this.engine?.setMouse(x, y);

  }

}


