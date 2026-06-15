import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, OnDestroy, PLATFORM_ID, signal } from '@angular/core';

const SESSION_KEY = 'mind-sphere-presence-session';
const HEARTBEAT_MS = 25_000;
const POLL_MS = 15_000;
const API = '/api/presence';

@Injectable({ providedIn: 'root' })
export class PresenceService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private sessionId = '';
  private userId: string | null = null;
  private path = '/login';
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private eventSource: EventSource | null = null;
  private started = false;

  readonly activeCount = signal(0);
  readonly connected = signal(false);

  start(path = '/login'): void {
    if (!this.isBrowser() || this.started) return;
    this.started = true;
    this.path = path;
    this.sessionId = this.ensureSessionId();
    this.connectStream();
    void this.sendHeartbeat();
    void this.fetchCount();
    this.heartbeatTimer = setInterval(() => void this.sendHeartbeat(), HEARTBEAT_MS);
    this.pollTimer = setInterval(() => void this.fetchCount(), POLL_MS);
    window.addEventListener('beforeunload', this.onUnload);
  }

  setPath(path: string): void {
    this.path = path;
    void this.sendHeartbeat();
  }

  setUser(userId: string | null): void {
    this.userId = userId;
    void this.sendHeartbeat();
  }

  leave(): void {
    if (!this.isBrowser() || !this.sessionId) return;
    const payload = JSON.stringify({ sessionId: this.sessionId });
    navigator.sendBeacon(`${API}/leave`, new Blob([payload], { type: 'application/json' }));
    this.userId = null;
  }

  ngOnDestroy(): void {
    this.teardown(false);
  }

  private connectStream(): void {
    this.eventSource?.close();
    this.eventSource = new EventSource(`${API}/stream`);
    this.eventSource.onopen = () => this.connected.set(true);
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { count?: number };
        if (typeof data.count === 'number') {
          this.activeCount.set(data.count);
          this.connected.set(true);
        }
      } catch {
        /* ignore */
      }
    };
    this.eventSource.onerror = () => {
      this.connected.set(false);
      this.eventSource?.close();
      void this.fetchCount();
      setTimeout(() => {
        if (this.started) this.connectStream();
      }, 4000);
    };
  }

  private async fetchCount(): Promise<void> {
    try {
      const res = await fetch(`${API}/count`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      if (typeof data.count === 'number') {
        this.activeCount.set(data.count);
        this.connected.set(true);
      }
    } catch {
      this.connected.set(false);
    }
  }

  private async sendHeartbeat(): Promise<void> {
    if (!this.sessionId) return;
    try {
      const res = await fetch(`${API}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          path: this.path,
        }),
        keepalive: true,
      });
      if (res.ok) {
        const data = (await res.json()) as { count?: number };
        if (typeof data.count === 'number') this.activeCount.set(data.count);
        this.connected.set(true);
      }
    } catch {
      this.connected.set(false);
    }
  }

  private teardown(sendLeave: boolean): void {
    if (sendLeave) this.leave();
    this.started = false;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;
    this.eventSource?.close();
    this.eventSource = null;
    window.removeEventListener('beforeunload', this.onUnload);
  }

  private onUnload = (): void => {
    this.leave();
  };

  private ensureSessionId(): string {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
