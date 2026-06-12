import { Injectable } from '@angular/core';
import { GroupTask, Question, StudentAnswer } from '../models/academy.models';
import { IntentoEstudiante, RespuestaEstudiante } from '../models/evaluation.models';
import { AcademyDataService } from './academy-data.service';
import { MissionZone } from '../features/student/mission/mission.types';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  /** nota = 1 + (correctas / total) * 4, redondeo a 1 decimal. */
  calcularNota(respuestasCorrectas: number, totalPreguntas: number): number {
    if (totalPreguntas <= 0) return 1;
    const nota = 1 + (respuestasCorrectas / totalPreguntas) * 4;
    return Math.round(nota * 10) / 10;
  }

  calcularPorcentaje(correctas: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((correctas / total) * 100);
  }

  retroalimentacionPorNota(nota: number): string {
    if (nota >= 4.5) {
      return 'Excelente desempeño. Reconoces adecuadamente las rutas de atención, los principios éticos y la normativa aplicable.';
    }
    if (nota >= 3.5) {
      return 'Buen desempeño. Comprendes los elementos principales del caso, aunque puedes fortalecer algunos aspectos normativos y técnicos.';
    }
    if (nota >= 3.0) {
      return 'Desempeño básico. Es necesario reforzar la identificación de prioridades de intervención y rutas de atención.';
    }
    return 'Desempeño insuficiente. Se recomienda revisar nuevamente el caso, la normativa y las acciones éticas esperadas.';
  }

  construirIntento(params: {
    studentId: string;
    studentName?: string;
    task: GroupTask;
    casoId: string;
    casoTitulo: string;
    zones: MissionZone[];
    answers: StudentAnswer[];
    data: AcademyDataService;
  }): IntentoEstudiante {
    const { studentId, studentName, task, casoId, casoTitulo, zones, answers, data } = params;
    const questions = zones.flatMap((z) => z.questions);
    const total = questions.length;
    const respuestas: RespuestaEstudiante[] = [];

    for (const q of questions) {
      const ans = answers.find((a) => a.questionId === q.id);
      const zone = zones.find((z) => z.questions.some((qq) => qq.id === q.id));
      const correctOpt = data.optionsForQuestion(q.id).find((o) => o.isCorrect);
      const selectedOpt = ans ? data.optionsForQuestion(q.id).find((o) => o.id === ans.selectedOptionId) : undefined;
      respuestas.push({
        escenarioId: zone?.scenario.id ?? q.scenarioId,
        preguntaId: q.id,
        respuestaSeleccionada: selectedOpt?.text ?? '—',
        respuestaCorrecta: correctOpt?.text ?? '—',
        esCorrecta: ans?.isCorrect ?? false,
      });
    }

    const correctas = respuestas.filter((r) => r.esCorrecta).length;
    const incorrectas = total - correctas;
    const porcentaje = this.calcularPorcentaje(correctas, total);
    const notaFinal = this.calcularNota(correctas, total);

    return {
      id: `int-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      studentId,
      nombreEstudiante: studentName,
      taskId: task.id,
      casoId,
      casoTitulo,
      escenariosCompletados: zones.filter((z) =>
        z.questions.every((q) => answers.some((a) => a.questionId === q.id)),
      ).map((z) => z.scenario.title),
      totalPreguntas: total,
      respuestasCorrectas: correctas,
      respuestasIncorrectas: incorrectas,
      porcentaje,
      notaFinal,
      retroalimentacion: this.retroalimentacionPorNota(notaFinal),
      fechaFinalizacion: new Date().toISOString(),
      respuestas,
    };
  }
}
