import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface AiAssistantResponse {
  text?: string;
  message?: string;
  error?: string;
  blocked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  private readonly auth = inject(AuthService);

  async ask(message: string, context: string): Promise<AiAssistantResponse> {
    const user = this.auth.currentUser();

    if (!user) {
      return { error: 'Debes iniciar sesion para usar el asistente.' };
    }

    const response = await fetch('/api/ai/teacher-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        message,
        context,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as AiAssistantResponse;

    if (!response.ok) {
      return {
        ...payload,
        error: payload.message ?? payload.error ?? 'No se pudo contactar el asistente.',
      };
    }

    return payload;
  }
}
