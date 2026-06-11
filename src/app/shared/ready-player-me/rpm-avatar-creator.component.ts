import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  RpmAvatarExportedPayload,
  RpmFrameMessage,
  RpmUserAuthorizedPayload,
} from './rpm.types';
import { buildRpmCreatorUrl, isRpmMessage, parseRpmMessage } from './rpm.utils';
import { RPM_CREATOR_ORIGIN } from './rpm.config';

@Component({
  selector: 'app-rpm-avatar-creator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rpm-creator">
      @if (loading()) {
        <div class="rpm-loading">
          <div class="rpm-spinner" aria-hidden="true"></div>
          <p>Abriendo editor 3D…</p>
        </div>
      }
      @if (loadError()) {
        <div class="rpm-error">
          <p>No se pudo cargar el editor.</p>
          <button type="button" class="ghost-button" (click)="reload()">Reintentar</button>
        </div>
      }
      <iframe
        #frame
        class="rpm-frame"
        [class.ready]="!loading()"
        [src]="iframeSrc()"
        title="Creador de avatar 3D"
        allow="camera *; microphone *; clipboard-write"
        (load)="onIframeLoad()"
      ></iframe>
    </div>
  `,
  styles: [
    `
      .rpm-creator {
        position: relative;
        border-radius: var(--psy-radius);
        overflow: hidden;
        border: 1px solid rgba(107, 140, 255, 0.25);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
        background: #ececf0;
      }

      .rpm-frame {
        display: block;
        width: 100%;
        min-height: min(78vh, 720px);
        height: min(78vh, 720px);
        border: none;
        opacity: 0;
        transition: opacity 0.35s ease;
      }

      .rpm-frame.ready {
        opacity: 1;
      }

      .rpm-loading,
      .rpm-error {
        position: absolute;
        inset: 0;
        display: grid;
        place-content: center;
        gap: 1rem;
        text-align: center;
        background: linear-gradient(160deg, #ececf0 0%, #d8dae4 100%);
        z-index: 2;
      }

      .rpm-loading p,
      .rpm-error p {
        margin: 0;
        color: #555;
        font-size: 0.95rem;
      }

      .rpm-spinner {
        width: 44px;
        height: 44px;
        margin: 0 auto;
        border: 3px solid rgba(107, 140, 255, 0.2);
        border-top-color: var(--psy-accent);
        border-radius: 50%;
        animation: spin 0.85s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class RpmAvatarCreatorComponent implements AfterViewInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  /** URL inicial para re-editar (no cambiar durante la sesión). */
  readonly initialAvatarUrl = input<string | null>(null);

  readonly avatarExported = output<string>();
  readonly avatarPreview = output<string>();

  readonly loading = signal(true);
  readonly loadError = signal(false);

  private readonly frameRef = viewChild<ElementRef<HTMLIFrameElement>>('frame');
  private loadTimeout: ReturnType<typeof setTimeout> | null = null;
  private iframeKey = 0;

  readonly iframeSrc = signal<SafeResourceUrl>(
    this.sanitizer.bypassSecurityTrustResourceUrl(buildRpmCreatorUrl()),
  );

  constructor() {
    const onMessage = (event: MessageEvent): void => {
      if (!event.origin.includes('readyplayer.me') && event.origin !== RPM_CREATOR_ORIGIN) return;
      const msg = parseRpmMessage(event.data);
      if (!isRpmMessage(msg) || !msg) return;
      this.handleEvent(msg);
    };

    window.addEventListener('message', onMessage);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('message', onMessage);
      if (this.loadTimeout) clearTimeout(this.loadTimeout);
    });
  }

  ngAfterViewInit(): void {
    const seed = this.initialAvatarUrl();
    if (seed) {
      this.iframeSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(buildRpmCreatorUrl(seed)));
    }
    this.armLoadTimeout();
  }

  onIframeLoad(): void {
    /* v1.frame.ready apaga el loading */
  }

  reload(): void {
    this.loadError.set(false);
    this.loading.set(true);
    this.iframeKey += 1;
    const seed = this.initialAvatarUrl();
    this.iframeSrc.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `${buildRpmCreatorUrl(seed)}&_=${this.iframeKey}`,
      ),
    );
    this.armLoadTimeout();
  }

  private armLoadTimeout(): void {
    if (this.loadTimeout) clearTimeout(this.loadTimeout);
    this.loadTimeout = setTimeout(() => {
      if (this.loading()) {
        this.loading.set(false);
        this.loadError.set(true);
      }
    }, 20000);
  }

  private handleEvent(msg: RpmFrameMessage): void {
    switch (msg.eventName) {
      case 'v1.frame.ready':
        this.loading.set(false);
        this.loadError.set(false);
        if (this.loadTimeout) clearTimeout(this.loadTimeout);
        queueMicrotask(() => this.subscribeToEvents());
        break;
      case 'v1.avatar.exported': {
        const url = (msg.data as RpmAvatarExportedPayload | undefined)?.url;
        if (url) {
          this.avatarExported.emit(url);
          this.avatarPreview.emit(url);
        }
        break;
      }
      case 'v1.user.authorized': {
        const url = (msg.data as RpmUserAuthorizedPayload | undefined)?.url;
        if (url) this.avatarPreview.emit(url);
        break;
      }
    }
  }

  private subscribeToEvents(): void {
    const iframe = this.frameRef()?.nativeElement;
    iframe?.contentWindow?.postMessage(
      JSON.stringify({
        target: 'readyplayerme',
        type: 'subscribe',
        eventName: 'v1.**',
      }),
      '*',
    );
  }
}
