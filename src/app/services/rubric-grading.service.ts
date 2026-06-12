import { Injectable, inject } from '@angular/core';
import { Situation } from '../models/academy.models';
import { IntentoEstudiante, RubricCriterion } from '../models/evaluation.models';
import { AcademyDataService } from './academy-data.service';
import { EvaluationService } from './evaluation.service';
import { RubricApiService } from './rubric-api.service';

@Injectable({ providedIn: 'root' })
export class RubricGradingService {
  private readonly data = inject(AcademyDataService);
  private readonly evaluation = inject(EvaluationService);
  private readonly rubricApi = inject(RubricApiService);

  async applyRubricGrade(intento: IntentoEstudiante, situation: Situation): Promise<IntentoEstudiante> {
    const rubric = this.data.globalRubric();
    const criterios = rubric?.criterios;
    if (!criterios?.length) {
      return {
        ...intento,
        evaluacionRubrica: { metodo: 'aciertos' },
      };
    }

    const respuestas = intento.respuestas.map((answer) => {
      const question = this.data.store().questions.find((q) => q.id === answer.preguntaId);
      const scenario = this.data.store().scenarios.find((s) => s.id === answer.escenarioId);
      return {
        escenario: scenario?.title ?? answer.escenarioId,
        pregunta: question?.statement ?? answer.preguntaId,
        respuestaSeleccionada: answer.respuestaSeleccionada,
        respuestaCorrecta: answer.respuestaCorrecta,
        esCorrecta: answer.esCorrecta,
        retroalimentacion: question?.feedback,
      };
    });

    const graded = await this.rubricApi.gradeAttempt({
      casoTitulo: situation.title,
      casoContexto: `${situation.context}\n\nObjetivo: ${situation.learningObjective}`,
      criterios,
      respuestas,
    });

    if ('error' in graded) {
      return {
        ...intento,
        evaluacionRubrica: { metodo: 'aciertos' },
        retroalimentacion: `${intento.retroalimentacion} (Rúbrica IA no disponible: ${graded.error})`,
      };
    }

    return {
      ...intento,
      notaFinal: graded.notaFinal,
      retroalimentacion: graded.retroalimentacion || this.evaluation.retroalimentacionPorNota(graded.notaFinal),
      evaluacionRubrica: {
        metodo: 'rubrica',
        criterios: graded.criterios,
      },
    };
  }

  criteriaSummary(): RubricCriterion[] {
    return this.data.globalRubric()?.criterios ?? [];
  }
}
