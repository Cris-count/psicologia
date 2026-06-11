import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RpmAvatarEngine } from '../../../engines/rpm-avatar.engine';

@Component({
  selector: 'app-character-3d-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="preview-wrap"
      [class.size-sm]="size() === 'sm'"
      [class.size-lg]="size() === 'lg'"
      [class.has-avatar]="!!rpmAvatarUrl()"
    >
      @if (rpmAvatarUrl()) {
        <canvas #canvas class="preview-canvas" aria-hidden="true"></canvas>
      } @else {
        <div class="preview-placeholder" aria-hidden="true">
          <div class="silhouette"></div>
          <p class="placeholder-text">{{ placeholderText() }}</p>
        </div>
      }
      @if (characterName()?.trim() && rpmAvatarUrl()) {
        <p class="name-tag">{{ characterName() }}</p>
      }
    </div>
  `,
  styles: [
    `
      .preview-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 3 / 4;
        max-width: 220px;
        border-radius: var(--psy-radius);
        overflow: hidden;
        background: linear-gradient(165deg, #f6f6f8 0%, #dddde6 55%, #cbcbd6 100%);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow:
          0 16px 40px rgba(0, 0, 0, 0.28),
          inset 0 1px 0 rgba(255, 255, 255, 0.5);
      }

      .preview-wrap.size-sm {
        max-width: 52px;
        border-radius: var(--psy-radius-sm);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }

      .preview-wrap.size-lg {
        max-width: 300px;
      }

      .preview-wrap.has-avatar {
        background: #e8e8ec;
      }

      .preview-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }

      .preview-placeholder {
        inset: 0;
        position: absolute;
        display: grid;
        place-content: center;
        gap: 0.75rem;
        padding: 1rem;
        text-align: center;
      }

      .silhouette {
        width: 56%;
        aspect-ratio: 3 / 5;
        margin: 0 auto;
        border-radius: 40% 40% 45% 45%;
        background: linear-gradient(180deg, rgba(107, 140, 255, 0.15) 0%, rgba(107, 140, 255, 0.05) 100%);
        border: 2px dashed rgba(107, 140, 255, 0.35);
        position: relative;
      }

      .silhouette::before {
        content: '';
        position: absolute;
        top: 8%;
        left: 50%;
        transform: translateX(-50%);
        width: 42%;
        aspect-ratio: 1;
        border-radius: 50%;
        border: 2px dashed rgba(107, 140, 255, 0.35);
        background: rgba(107, 140, 255, 0.08);
      }

      .placeholder-text {
        margin: 0;
        font-size: 0.72rem;
        color: rgba(255, 255, 255, 0.55);
        line-height: 1.4;
        max-width: 12rem;
      }

      .size-sm .preview-placeholder,
      .size-sm .placeholder-text {
        display: none;
      }

      .size-sm .silhouette {
        width: 70%;
      }

      .name-tag {
        position: absolute;
        bottom: 0.55rem;
        left: 50%;
        transform: translateX(-50%);
        margin: 0;
        padding: 0.28rem 0.7rem;
        border-radius: var(--psy-radius-pill);
        background: rgba(255, 255, 255, 0.94);
        border: 1px solid rgba(0, 0, 0, 0.06);
        font-family: var(--psy-font-display);
        font-size: 0.76rem;
        color: #333;
        white-space: nowrap;
        max-width: 92%;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .size-sm .name-tag {
        display: none;
      }
    `,
  ],
})
export class Character3DPreviewComponent implements AfterViewInit, OnDestroy {
  readonly rpmAvatarUrl = input<string | null>(null);
  readonly characterName = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly placeholderText = input('Tu avatar 3D aparecerá aquí');

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly viewReady = signal(false);
  private engine: RpmAvatarEngine | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      if (!this.viewReady()) return;
      const url = this.rpmAvatarUrl();
      if (!url) {
        this.disposeEngine();
        return;
      }
      requestAnimationFrame(() => this.setupEngine());
    });
  }

  ngAfterViewInit(): void {
    this.viewReady.set(true);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.disposeEngine();
  }

  private setupEngine(): void {
    const url = this.rpmAvatarUrl();
    if (!url) return;
    const canvas = this.canvasRef()?.nativeElement;
    const wrap = canvas?.parentElement;
    if (!canvas || !wrap) return;

    if (!this.engine) {
      this.engine = new RpmAvatarEngine(canvas);
      this.engine.init(wrap.clientWidth, wrap.clientHeight);
      this.resizeObserver = new ResizeObserver(() => {
        this.engine?.resize(wrap.clientWidth, wrap.clientHeight);
      });
      this.resizeObserver.observe(wrap);
    }

    this.engine.loadAvatar(url);
    this.engine.resize(wrap.clientWidth, wrap.clientHeight);
  }

  private disposeEngine(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.engine?.dispose();
    this.engine = null;
  }
}
