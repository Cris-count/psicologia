/** Tipografía unificada del mapa 2D — legible en canvas Phaser */
export const MAP_FONT_TITLE = 'Orbitron, "Segoe UI", system-ui, sans-serif';
export const MAP_FONT_PLACE = 'Rajdhani, Nunito, "Segoe UI", system-ui, sans-serif';
export const MAP_TEXT_RESOLUTION = 2;

export interface MapSignStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  stroke: string;
  strokeThickness: number;
}

export function mapBuildingSignStyle(scale: number, highlight: boolean): MapSignStyle {
  return {
    fontFamily: MAP_FONT_TITLE,
    fontSize: Math.max(14, Math.round(17 * scale)),
    color: highlight ? '#fff8e8' : '#f8fafc',
    stroke: '#040810',
    strokeThickness: highlight ? 4 : 3,
  };
}

export function mapObjectiveLabelStyle(): MapSignStyle {
  return {
    fontFamily: MAP_FONT_PLACE,
    fontSize: 13,
    color: '#fff8e8',
    stroke: '#040810',
    strokeThickness: 4,
  };
}

/** Parte textos largos en hasta 2 líneas para rótulos sobre edificios */
export function wrapMapLabel(text: string, maxChars = 14): string {
  const t = text.trim();
  if (t.length <= maxChars || !t.includes(' ')) return t;
  const words = t.split(/\s+/);
  let line1 = '';
  let i = 0;
  while (i < words.length) {
    const next = line1 ? `${line1} ${words[i]}` : words[i];
    if (next.length > maxChars && line1) break;
    line1 = next;
    i++;
  }
  const line2 = words.slice(i).join(' ');
  return line2 ? `${line1}\n${line2}` : line1;
}

/** Títulos de escenario: título en línea 1, subtítulo entre paréntesis en línea 2 */
export function wrapScenarioTitle(text: string, maxChars = 26): string {
  const t = text.trim();
  const paren = t.match(/^(.+?)\s*(\([^)]+\))\s*$/);
  if (paren) return `${paren[1].trim()}\n${paren[2].trim()}`;
  return wrapMapLabel(t, maxChars);
}

/** Prompt de entrada al edificio — siempre legible y en varias líneas si hace falta */
export function formatEnterPrompt(label: string): string {
  const title = wrapScenarioTitle(label);
  return title.includes('\n') ? `Entrar\n${title}` : `Entrar · ${title}`;
}

export const MAP_LABEL_PAD_X = 18;
export const MAP_LABEL_PAD_Y = 14;
