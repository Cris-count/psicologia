import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RubricService } from '../../../services/rubric.service';

@Component({
  selector: 'app-teacher-rubric-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Módulo del profesor</p>
        <h2>Rúbrica de evaluación</h2>
        <p>Sube, visualiza y administra la rúbrica PDF que orienta la evaluación del simulador.</p>
      </div>
    </header>

    @if (rubric.statusMessage(); as msg) {
      <div class="status-banner" [class.success]="rubric.statusKind() === 'success'" [class.error]="rubric.statusKind() === 'error'" [class.info]="rubric.statusKind() === 'info'">
        {{ msg }}
      </div>
    }

    <section class="panel rubric-panel">
      <h3>Rúbrica de evaluación (PDF)</h3>
      <p class="muted form-hint">Solo archivos PDF. Tamaño máximo 5 MB. La rúbrica es global para todos los casos del simulador.</p>

      <div
        class="upload-zone"
        [class.upload-zone--active]="dragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="dragOver.set(false)"
        (drop)="onDrop($event)"
      >
        <span class="material-symbols-outlined upload-icon">upload_file</span>
        <p>Arrastra aquí el PDF o selecciona un archivo</p>
        <label class="upload-btn">
          Subir rúbrica
          <input type="file" accept="application/pdf,.pdf" hidden (change)="onFileSelected($event)" />
        </label>
      </div>

      @if (rubricInfo(); as info) {
        <article class="rubric-card">
          <div class="rubric-card-head">
            <span class="material-symbols-outlined">picture_as_pdf</span>
            <div>
              <strong>{{ info.nombreArchivo }}</strong>
              <small class="muted">Cargado {{ info.fechaCarga | date: 'medium' }}</small>
            </div>
          </div>
          <dl class="rubric-meta">
            <div><dt>Tamaño</dt><dd>{{ rubric.formatFileSize(info.tamanio) }}</dd></div>
            <div><dt>Formato</dt><dd>PDF</dd></div>
            @if (info.criterios?.length) {
              <div><dt>Criterios IA</dt><dd>{{ info.criterios!.length }} criterios activos</dd></div>
            } @else if (info.parseError) {
              <div><dt>Análisis</dt><dd class="muted">{{ info.parseError }}</dd></div>
            }
          </dl>
          @if (rubric.parsing()) {
            <p class="muted form-hint">Analizando criterios del PDF…</p>
          }
          <div class="rubric-actions">
            <button type="button" class="primary-button" (click)="rubric.openRubric()">Ver rúbrica</button>
            <button type="button" class="ghost-button" (click)="rubric.downloadRubric()">Descargar</button>
            <label class="ghost-button replace-btn">
              Reemplazar
              <input type="file" accept="application/pdf,.pdf" hidden (change)="onReplace($event)" />
            </label>
            <button type="button" class="danger-button" (click)="onDelete()">Eliminar</button>
          </div>
        </article>
      } @else {
        <div class="empty-rubric">
          <span class="material-symbols-outlined">description</span>
          <p>No hay rúbrica cargada.</p>
          <small class="muted">Sube un PDF para que quede disponible como referencia de evaluación.</small>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .rubric-panel { display: grid; gap: 1.25rem; }
      .status-banner {
        padding: 0.75rem 1rem;
        border-radius: var(--psy-radius-sm);
        border: 1px solid var(--psy-line);
        background: rgba(107, 140, 255, 0.08);
        margin-bottom: 1rem;
      }
      .status-banner.success { border-color: rgba(57, 255, 20, 0.35); background: rgba(57, 255, 20, 0.08); color: #1a5c12; }
      .status-banner.error { border-color: rgba(255, 77, 109, 0.35); background: rgba(255, 77, 109, 0.08); color: #8b1a2a; }
      .status-banner.info { color: var(--psy-muted); }
      .upload-zone {
        border: 2px dashed var(--psy-line);
        border-radius: var(--psy-radius);
        padding: 2rem 1.5rem;
        text-align: center;
        display: grid;
        gap: 0.75rem;
        justify-items: center;
        transition: border-color 0.2s, background 0.2s;
      }
      .upload-zone--active { border-color: var(--psy-primary); background: rgba(107, 140, 255, 0.06); }
      .upload-icon { font-size: 2.5rem; color: var(--psy-primary); opacity: 0.85; }
      .upload-btn {
        display: inline-flex;
        align-items: center;
        padding: 0.55rem 1.1rem;
        border-radius: var(--psy-radius-pill);
        background: var(--psy-primary);
        color: #fff;
        font-weight: 600;
        cursor: pointer;
      }
      .rubric-card {
        border: 1px solid var(--psy-line);
        border-radius: var(--psy-radius);
        padding: 1.25rem;
        background: rgba(255, 255, 255, 0.02);
        display: grid;
        gap: 1rem;
      }
      .rubric-card-head { display: flex; gap: 0.85rem; align-items: flex-start; }
      .rubric-card-head .material-symbols-outlined { font-size: 2rem; color: #c62828; }
      .rubric-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin: 0; }
      .rubric-meta dt { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--psy-muted); }
      .rubric-meta dd { margin: 0.15rem 0 0; font-weight: 600; }
      .rubric-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .replace-btn { cursor: pointer; margin: 0; }
      .empty-rubric {
        text-align: center;
        padding: 2rem 1rem;
        border-radius: var(--psy-radius);
        border: 1px solid var(--psy-line);
        background: rgba(0, 0, 0, 0.15);
      }
      .empty-rubric .material-symbols-outlined { font-size: 2.5rem; opacity: 0.45; }
    `,
  ],
})
export class TeacherRubricPage {
  protected readonly rubric = inject(RubricService);
  readonly dragOver = signal(false);

  readonly rubricInfo = computed(() => this.rubric.globalRubric());

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) void this.rubric.uploadPdf(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void this.rubric.uploadPdf(file);
    input.value = '';
  }

  onReplace(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void this.rubric.replacePdf(file);
    input.value = '';
  }

  onDelete(): void {
    if (confirm('¿Eliminar la rúbrica cargada?')) {
      this.rubric.deleteRubric();
    }
  }
}
