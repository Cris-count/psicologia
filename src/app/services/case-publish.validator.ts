import { AcademyDataService } from './academy-data.service';

export interface CasePublishValidation {
  ok: boolean;
  errors: string[];
}

/** REQ-02 — valida jerarquía Caso → Escenario → Pregunta → Opciones antes de publicar. */
export function validateSituationForPublish(
  data: AcademyDataService,
  situationId: string,
): CasePublishValidation {
  const errors: string[] = [];
  const situation = data.getSituation(situationId);
  if (!situation) {
    return { ok: false, errors: ['El caso no existe.'] };
  }
  if (!situation.title.trim()) errors.push('Falta el título del caso.');
  if (!situation.description.trim()) errors.push('Falta la descripción del caso.');
  if (!situation.context.trim() && !situation.generalContextBody?.trim()) {
    errors.push('Falta el contexto o historia del caso.');
  }
  if (!situation.learningObjective.trim()) errors.push('Falta el objetivo de aprendizaje.');

  const scenarios = data.scenariosForSituation(situationId);
  if (!scenarios.length) {
    errors.push('Agrega al menos un escenario.');
  }

  for (const scenario of scenarios) {
    if (!scenario.title.trim()) errors.push(`Escenario sin título (orden ${scenario.orderIndex}).`);
    if (!scenario.context.trim() && !scenario.contextPanelBody?.trim()) {
      errors.push(`Escenario «${scenario.title || scenario.id}» sin contexto.`);
    }
    const questions = data.questionsForScenario(scenario.id);
    if (!questions.length) {
      errors.push(`Escenario «${scenario.title}» sin preguntas.`);
      continue;
    }
    for (const question of questions) {
      if (!question.statement.trim()) errors.push(`Pregunta sin enunciado en «${scenario.title}».`);
      if (!question.feedback.trim()) errors.push(`Pregunta sin retroalimentación en «${scenario.title}».`);
      const options = data.optionsForQuestion(question.id);
      if (options.length < 2 && question.questionType !== 'OPEN') {
        errors.push(`Pregunta con opciones insuficientes en «${scenario.title}».`);
      }
      if (!options.some((o) => o.isCorrect)) {
        errors.push(`Pregunta sin respuesta correcta marcada en «${scenario.title}».`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
