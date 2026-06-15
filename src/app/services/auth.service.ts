import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/academy.models';
import { GameLoaderService } from '../shared/services/game-loader.service';
import { AcademyDataService } from './academy-data.service';
import { PresenceService } from './presence.service';

const SESSION_KEY = 'academic-case-simulator-session-v2';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly data = inject(AcademyDataService);
  private readonly router = inject(Router);
  private readonly loader = inject(GameLoaderService);
  private readonly presence = inject(PresenceService);
  private readonly userState = signal<User | null>(null);
  private readonly initializedState = signal(false);
  readonly currentUser = this.userState.asReadonly();
  readonly initialized = this.initializedState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.currentUser()));
  readonly ready: Promise<void>;

  constructor() {
    this.userState.set(this.restoreSession());
    this.ready = this.data.ready.finally(() => {
      const restored = this.restoreSession();
      this.userState.set(restored);
      if (restored && this.isBrowser()) {
        this.presence.setUser(restored.id);
      }
      this.initializedState.set(true);
    });
  }

  authenticateCredentials(email: string, password: string): User | null {
    return this.data.authenticate(email, password) ?? null;
  }

  /** Estudiante: correo + tarjeta de identidad. Docente/admin: correo + contraseña. */
  authenticateLogin(
    email: string,
    credential: string,
    expectedRole?: UserRole,
  ): { user: User | null; error?: string } {
    const trimmedEmail = email.trim();
    const trimmedCredential = credential.trim();
    if (!trimmedEmail || !trimmedCredential) {
      return { user: null, error: 'Ingresa correo y tarjeta de identidad o contraseña.' };
    }

    const candidate = this.data.userByEmail(trimmedEmail);
    if (candidate?.role === 'STUDENT') {
      const user = this.data.authenticateStudentWithDocument(trimmedEmail, trimmedCredential);
      if (!user) {
        return { user: null, error: 'Correo universitario o tarjeta de identidad incorrectos.' };
      }
      if (expectedRole && user.role !== expectedRole) {
        return { user: null, error: this.roleMismatchError(expectedRole) };
      }
      return { user };
    }

    const staff = this.authenticateCredentials(trimmedEmail, trimmedCredential);
    if (!staff) {
      return { user: null, error: 'Correo o contraseña incorrectos.' };
    }
    if (expectedRole && staff.role !== expectedRole) {
      return { user: null, error: this.roleMismatchError(expectedRole) };
    }
    return { user: staff };
  }

  requiresVerificationCode(role: UserRole): boolean {
    return role === 'STUDENT';
  }

  private roleMismatchError(expectedRole: UserRole): string {
    return `Las credenciales no corresponden al rol ${this.roleLabel(expectedRole).toLowerCase()}.`;
  }

  establishSession(user: User): void {
    this.userState.set(user);
    if (this.isBrowser()) {
      localStorage.setItem(SESSION_KEY, user.id);
      this.presence.setUser(user.id);
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
    if (!this.initialized()) {
      return true;
    }

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

    this.presence.leave();
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('mind-sphere-presence-session');
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
