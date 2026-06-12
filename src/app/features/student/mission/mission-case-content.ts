/** Textos canónicos del caso demo — contexto general (intro) vs. escenarios. */
export const DEMO_CASE_INTRO = {
  generalContextTitle: 'CASO 1. VIOLENCIA FAMILIAR Y TENTATIVA DE FEMINICIDIO',
  generalContextBody: `Son las 11 de la noche en un barrio con altas condiciones de vulnerabilidad como: pobreza, violencias urbanas (robos, expendio de drogas, presencia de grupos armados ilegales, riñas callejeras entre vecinos) un hombre de aproximadamente 28 años de edad, entra a su domicilio donde reside con su actual pareja que tiene 22 años de edad, ella tiene una hija de 3 años de edad.

Este hombre en horas de la tarde había tenido un altercado verbal con su pareja en el cual hubo presencia de groserías, maltrato psicológico de él hacia ella y chantaje emocional, donde usó expresiones relativas a que ella sin él no era nadie, que era una mujer mantenida y que adicionalmente él estaba seguro que ella era le infiel.

En ese momento de la noche, a la entrada del hombre en la residencia, la mujer le hace el reclamo de llegar tarde y de haberse perdido toda la tarde, el hombre sin mediar palabra saca una navaja y hiere a la menor de edad propinándole la muerte de manera inmediata y luego procede a herir (un total de 28 heridas con armas cortopunzantes) a la mujer quien queda muy mal herida.`,
} as const;

export const DEMO_SCENARIO_CONTEXT: Record<
  string,
  { contextPanelTitle: string; contextPanelBody: string; context: string }
> = {
  'sce-hospital': {
    contextPanelTitle: 'Escenario 1: Atención en Hospital (Urgencia Vital y Crisis)',
    contextPanelBody:
      'La sobreviviente está en shock hipovolémico y emocional. La familia (madre y hermanos) llega al hospital en estado de alteración, exigiendo ver a la niña (quien ha fallecido, pero ellos aún no lo saben con certeza).',
    context:
      'La sobreviviente está en shock hipovolémico y emocional. La familia (madre y hermanos) llega al hospital en estado de alteración, exigiendo ver a la niña (quien ha fallecido, pero ellos aún no lo saben con certeza).',
  },
  'sce-comisaria': {
    contextPanelTitle: 'Escenario 2: Comisaría de Familia (Restablecimiento de Derechos)',
    contextPanelBody:
      'Han pasado 15 días. La mujer ha sido dada de alta, pero tiene secuelas físicas y trauma complejo. Se debe definir la medida de protección y el apoyo psicológico a largo plazo.',
    context:
      'Han pasado 15 días. La mujer ha sido dada de alta, pero tiene secuelas físicas y trauma complejo. Se debe definir la medida de protección y el apoyo psicológico a largo plazo.',
  },
};
