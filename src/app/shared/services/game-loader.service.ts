import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameLoaderService {
  readonly visible = signal(false);
  readonly progress = signal(0);
  readonly message = signal('Inicializando MIND-SPHERE...');

  show(message = 'Cargando...'): void {
    this.message.set(message);
    this.progress.set(0);
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
    this.progress.set(0);
  }

  setProgress(value: number, message?: string): void {
    this.progress.set(Math.min(100, Math.max(0, value)));
    if (message) {
      this.message.set(message);
    }
  }

  async runSequence(steps: Array<{ progress: number; message: string; delayMs?: number }>): Promise<void> {
    this.show(steps[0]?.message ?? 'Cargando...');
    for (const step of steps) {
      this.setProgress(step.progress, step.message);
      await this.wait(step.delayMs ?? 420);
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
