import { Injectable, inject } from '@angular/core';
import { RubricCriterion, RubricEvaluationMeta } from '../models/evaluation.models';
import { AuthService } from './auth.service';

export interface RubricParseResponse {
  criterios?: RubricCriterion[];
  parsedAt?: string;
  error?: string;
  message?: string;
}

export interface RubricGradePayload {
  casoTitulo: string;
  casoContexto: string;
  criterios: RubricCriterion[];
  respuestas: {
    escenario: string;
    pregunta: string;
    respuestaSeleccionada: string;
    respuestaCorrecta: string;
    esCorrecta: boolean;
    retroalimentacion?: string;
  }[];
}

export interface RubricGradeResponse {
  notaFinal: number;
  retroalimentacion: string;
  criterios?: RubricEvaluationMeta['criterios'];
  metodo: 'rubrica';
  error?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class RubricApiService {
  private readonly auth = inject(AuthService);

  async parsePdf(pdfDataUrl: string): Promise<RubricParseResponse> {
    const user = this.auth.currentUser();
    if (!user) {
      return { error: 'Debes iniciar sesión.' };
    }

    const response = await fetch('/api/rubric/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, pdfDataUrl }),
    });

    const payload = (await response.json().catch(() => ({}))) as RubricParseResponse;
    if (!response.ok) {
      return {
        error: payload.error ?? payload.message ?? 'No se pudo analizar la rúbrica PDF.',
      };
    }
    return payload;
  }

  async gradeAttempt(payload: RubricGradePayload): Promise<RubricGradeResponse | { error: string }> {
    const user = this.auth.currentUser();
    if (!user) {
      return { error: 'Debes iniciar sesión.' };
    }

    const response = await fetch('/api/rubric/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        casoTitulo: payload.casoTitulo,
        casoContexto: payload.casoContexto,
        criterios: payload.criterios,
        respuestas: payload.respuestas,
      }),
    });

    const body = (await response.json().catch(() => ({}))) as RubricGradeResponse & { error?: string; message?: string };
    if (!response.ok) {
      return { error: body.error ?? body.message ?? 'No se pudo calificar con la rúbrica.' };
    }
    return body;
  }
}
