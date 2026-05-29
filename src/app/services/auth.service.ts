import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/academy.models';
import { GameLoaderService } from '../shared/services/game-loader.service';
import { AcademyDataService } from './academy-data.service';

const SESSION_KEY = 'academic-case-simulator-session-v2';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly data = inject(AcademyDataService);
  private readonly router = inject(Router);
  private readonly loader = inject(GameLoaderService);
  private readonly userState = signal<User | null>(null);
  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.currentUser()));

  constructor() {
    this.userState.set(this.restoreSession());
  }

  authenticateCredentials(email: string, password: string): User | null {
    return this.data.authenticate(email, password) ?? null;
  }

  establishSession(user: User): void {
    this.userState.set(user);
    if (this.isBrowser()) {
      localStorage.setItem(SESSION_KEY, user.id);
    }
  }

  login(email: string, password: string): boolean {
    const user = this.authenticateCredentials(email, password);
    if (!user) {
      return false;
    }
    this.establishSession(user);
    void this.router.navigateByUrl(this.homeRouteFor(user.role));
    return true;
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  ensureAuthenticatedOrRedirect(): boolean {
    if (this.isAuthenticated()) {
      return true;
    }
    void this.router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }

  homeRouteFor(role: UserRole): string {
    switch (role) {
      case 'SUPERADMIN':
        return '/admin';
      case 'TEACHER':
        return '/teacher';
      default:
        return '/student';
    }
  }

  roleLabel(role: UserRole): string {
    switch (role) {
      case 'SUPERADMIN':
        return 'Administrador';
      case 'TEACHER':
        return 'Profesor';
      default:
        return 'Estudiante';
    }
  }

  private clearSession(): void {
    this.userState.set(null);
    this.loader.hide();

    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem(SESSION_KEY);
    sessionStorage.clear();
  }

  private restoreSession(): User | null {
    if (!this.isBrowser()) {
      return null;
    }
    const userId = localStorage.getItem(SESSION_KEY);
    return userId ? this.data.users.find((user) => user.id === userId) ?? null : null;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
