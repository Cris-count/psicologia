import { Injectable } from '@angular/core';
import { GroupTask, Situation, StudentProgress, User } from '../models/academy.models';

export interface ResultExportRow {
  student: User;
  task: GroupTask;
  situation: Situation;
  progress: StudentProgress;
  correct: number;
  incorrect: number;
  pending: number;
  notaFinal?: number;
}

@Injectable({ providedIn: 'root' })
export class ExportResultsService {
  /** REQ-13 — exporta resultados del grupo a CSV descargable. */
  downloadCsv(rows: ResultExportRow[], groupName: string): void {
    const header = [
      'Estudiante',
      'Email',
      'Caso',
      'Avance %',
      'Correctas',
      'Incorrectas',
      'Pendientes',
      'Nota',
      'Completado',
    ];
    const lines = rows.map((row) =>
      [
        this.escape(row.student.name),
        this.escape(row.student.email),
        this.escape(row.situation.title),
        String(row.progress.progressPercentage),
        String(row.correct),
        String(row.incorrect),
        String(row.pending),
        row.notaFinal != null ? row.notaFinal.toFixed(1) : '',
        row.progress.completed ? 'Si' : 'No',
      ].join(','),
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `resultados-${this.slug(groupName)}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private escape(value: string): string {
    const v = value.replace(/"/g, '""');
    return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v}"` : v;
  }

  private slug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
  }
}
