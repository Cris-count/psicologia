import { Injectable, inject } from '@angular/core';
import { User } from '../models/academy.models';
import { AcademyDataService } from './academy-data.service';

export interface VerificationRequestResult {
  ok: boolean;
  message?: string;
  error?: string;
}

export interface VerificationConfirmResult {
  user: User | null;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthVerificationService {
  private readonly data = inject(AcademyDataService);

  async requestCode(email: string, credential: string): Promise<VerificationRequestResult> {
    const response = await fetch('/api/auth/request-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), credential: credential.trim() }),
    });
    const payload = (await response.json().catch(() => ({}))) as VerificationRequestResult;
    if (!response.ok) {
      return { ok: false, error: payload.error ?? payload.message ?? 'No se pudo enviar el código.' };
    }
    return { ok: true, message: payload.message ?? 'Revisa tu correo e ingresa el código de verificación.' };
  }

  async verifyCode(email: string, code: string): Promise<VerificationConfirmResult> {
    const response = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), code: code.trim() }),
    });
    const payload = (await response.json().catch(() => ({}))) as { userId?: string; error?: string };
    if (!response.ok || !payload.userId) {
      return { user: null, error: payload.error ?? 'Código de verificación inválido.' };
    }
    const user = this.data.store().users.find((u) => u.id === payload.userId && u.status === 'ACTIVE') ?? null;
    if (!user) {
      return { user: null, error: 'Usuario no encontrado tras la verificación.' };
    }
    return { user };
  }
}
