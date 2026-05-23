import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/academy.models';
import { AcademyDataService } from './academy-data.service';

const SESSION_KEY = 'academic-case-simulator-session-v2';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly data = inject(AcademyDataService);
  private readonly router = inject(Router);
  private readonly userState = signal<User | null>(null);
  readonly currentUser = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.currentUser()));

  constructor() {
    this.userState.set(this.restoreSession());
  }

  login(email: string, password: string): boolean {
    const user = this.data.authenticate(email, password);
    if (!user) {
      return false;
    }
    this.userState.set(user);
    if (this.isBrowser()) {
      localStorage.setItem(SESSION_KEY, user.id);
    }
    void this.router.navigateByUrl(this.homeRouteFor(user.role));
    return true;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(SESSION_KEY);
    }
    this.userState.set(null);
    void this.router.navigateByUrl('/login');
  }

  homeRouteFor(role: UserRole): string {
    switch (role) {
      case 'SUPERADMIN':
        return '/superadmin';
      case 'TEACHER':
        return '/teacher';
      default:
        return '/student';
    }
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
