import { Injectable, inject, signal } from '@angular/core';
import { RubricaEvaluacion, GLOBAL_RUBRIC_ID } from '../models/evaluation.models';
import { AcademyDataService } from './academy-data.service';
import { AuthService } from './auth.service';
import { RubricApiService } from './rubric-api.service';

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export type RubricUploadResult =
  | { ok: true; rubric: RubricaEvaluacion }
  | { ok: false; error: string };

@Injectable({ providedIn: 'root' })
export class RubricService {
  private readonly data = inject(AcademyDataService);
  private readonly auth = inject(AuthService);
  private readonly rubricApi = inject(RubricApiService);

  readonly statusMessage = signal<string | null>(null);
  readonly statusKind = signal<'success' | 'error' | 'info' | null>(null);
  readonly parsing = signal(false);

  globalRubric(): RubricaEvaluacion | undefined {
    return this.data.globalRubric();
  }

  hasRubric(): boolean {
    return Boolean(this.globalRubric()?.urlArchivo);
  }

  clearStatus(): void {
    this.statusMessage.set(null);
    this.statusKind.set(null);
  }

  private setStatus(kind: 'success' | 'error' | 'info', message: string): void {
    this.statusKind.set(kind);
    this.statusMessage.set(message);
  }

  async uploadPdf(file: File): Promise<RubricUploadResult> {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      const msg = 'Solo se permiten archivos PDF (.pdf).';
      this.setStatus('error', msg);
      return { ok: false, error: msg };
    }
    if (file.type && file.type !== 'application/pdf') {
      const msg = 'El archivo seleccionado no es un PDF válido.';
      this.setStatus('error', msg);
      return { ok: false, error: msg };
    }
    if (file.size > MAX_PDF_BYTES) {
      const msg = 'El PDF supera el límite de 5 MB.';
      this.setStatus('error', msg);
      return { ok: false, error: msg };
    }

    try {
      const dataUrl = await this.readAsDataUrl(file);
      const rubric: RubricaEvaluacion = {
        id: GLOBAL_RUBRIC_ID,
        nombreArchivo: file.name,
        tipo: 'application/pdf',
        tamanio: file.size,
        fechaCarga: new Date().toISOString(),
        urlArchivo: dataUrl,
      };
      this.data.saveGlobalRubric(rubric);
      this.parsing.set(true);
      this.setStatus('info', 'PDF cargado. Analizando criterios de la rúbrica…');

      const parsed = await this.rubricApi.parsePdf(dataUrl);
      this.parsing.set(false);

      if (parsed.criterios?.length) {
        const enriched: RubricaEvaluacion = {
          ...rubric,
          criterios: parsed.criterios,
          parsedAt: parsed.parsedAt ?? new Date().toISOString(),
          parseError: undefined,
        };
        this.data.saveGlobalRubric(enriched);
        this.setStatus(
          'success',
          `Rúbrica cargada. ${parsed.criterios.length} criterios listos para calificar el simulador.`,
        );
        return { ok: true, rubric: enriched };
      }

      const parseError = parsed.error ?? 'No se extrajeron criterios del PDF.';
      this.data.saveGlobalRubric({ ...rubric, parseError });
      this.setStatus('error', `${parseError} La calificación usará aciertos hasta corregir la rúbrica.`);
      return { ok: true, rubric: { ...rubric, parseError } };
    } catch {
      const msg = 'No se pudo leer el archivo. Intenta de nuevo.';
      this.setStatus('error', msg);
      return { ok: false, error: msg };
    }
  }

  replacePdf(file: File): Promise<RubricUploadResult> {
    return this.uploadPdf(file);
  }

  deleteRubric(): void {
    this.data.deleteGlobalRubric();
    this.setStatus('info', 'Rúbrica eliminada.');
  }

  openRubric(): void {
    const rubric = this.globalRubric();
    if (!rubric?.urlArchivo) {
      this.setStatus('info', 'No hay rúbrica cargada.');
      return;
    }
    window.open(rubric.urlArchivo, '_blank', 'noopener,noreferrer');
  }

  downloadRubric(): void {
    const rubric = this.globalRubric();
    if (!rubric?.urlArchivo) {
      this.setStatus('info', 'No hay rúbrica cargada.');
      return;
    }
    const link = document.createElement('a');
    link.href = rubric.urlArchivo;
    link.download = rubric.nombreArchivo || 'rubrica-evaluacion.pdf';
    link.click();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
