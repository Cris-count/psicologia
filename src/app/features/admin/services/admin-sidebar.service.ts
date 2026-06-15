import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminSidebarService {
  readonly sidebarOpen = signal(false);

  toggle(): void {
    this.sidebarOpen.update((v) => !v);
  }

  close(): void {
    this.sidebarOpen.set(false);
  }
}
