/** Rúbrica global de evaluación (PDF) — criterios extraídos para calificación automática. */
export interface RubricCriterion {
  id: string;
  nombre: string;
  descripcion: string;
  /** Peso relativo 0–100; la suma de criterios debe ser 100. */
  peso: number;
  niveles?: { nivel: string; puntaje: number; descriptor: string }[];
}

export interface RubricGradeDetail {
  criterioId: string;
  nombre: string;
  puntaje: number;
  maxPuntaje: number;
  comentario: string;
}

export interface RubricEvaluationMeta {
  metodo: 'rubrica' | 'aciertos';
  criterios?: RubricGradeDetail[];
}

export interface RubricaEvaluacion {
  id: string;
  nombreArchivo: string;
  tipo: 'application/pdf';
  tamanio: number;
  fechaCarga: string;
  /** Data URL base64 del PDF en prototipo local. */
  urlArchivo?: string;
  /** Criterios extraídos del PDF (Gemini). */
  criterios?: RubricCriterion[];
  parsedAt?: string;
  parseError?: string;
}

export interface RespuestaEstudiante {
  escenarioId: string;
  preguntaId: string;
  respuestaSeleccionada: string;
  respuestaCorrecta: string;
  esCorrecta: boolean;
}

export interface IntentoEstudiante {
  id: string;
  nombreEstudiante?: string;
  studentId: string;
  taskId: string;
  casoId: string;
  casoTitulo: string;
  escenariosCompletados: string[];
  totalPreguntas: number;
  respuestasCorrectas: number;
  respuestasIncorrectas: number;
  porcentaje: number;
  notaFinal: number;
  retroalimentacion: string;
  fechaFinalizacion: string;
  respuestas: RespuestaEstudiante[];
  /** Detalle de calificación según rúbrica (REQ-09). */
  evaluacionRubrica?: RubricEvaluationMeta;
  /** REQ-11 — retroalimentación cualitativa del docente. */
  comentarioDocente?: string;
  comentarioDocenteAt?: string;
}

export type ScenarioPlayState = 'locked' | 'available' | 'context' | 'questions' | 'completed';

export const GLOBAL_RUBRIC_ID = 'rubric-global';
