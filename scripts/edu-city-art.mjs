/** Utilidades de dibujo — ciudad educativa 2D estilo city builder */
export function buf(w, h) {
  return { data: Buffer.alloc(w * h * 4, 0), w, h };
}

export function px(b, x, y, c) {
  if (x < 0 || y < 0 || x >= b.w || y >= b.h) return;
  const i = (y * b.w + x) * 4;
  const [r, g, bl, a = 255] = c;
  if (a === 0) return;
  const oa = b.data[i + 3] / 255;
  const na = a / 255;
  const t = na + oa * (1 - na);
  if (t <= 0) return;
  b.data[i] = Math.round((r * na + b.data[i] * oa * (1 - na)) / t);
  b.data[i + 1] = Math.round((g * na + b.data[i + 1] * oa * (1 - na)) / t);
  b.data[i + 2] = Math.round((bl * na + b.data[i + 2] * oa * (1 - na)) / t);
  b.data[i + 3] = Math.round(t * 255);
}

export function rect(b, x, y, w, h, c) {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) px(b, x + dx, y + dy, c);
}

export function outline(b, x, y, w, h, c, t = 1) {
  for (let i = 0; i < t; i++) {
    for (let dx = 0; dx < w; dx++) {
      px(b, x + dx, y + i, c);
      px(b, x + dx, y + h - 1 - i, c);
    }
    for (let dy = 0; dy < h; dy++) {
      px(b, x + i, y + dy, c);
      px(b, x + w - 1 - i, y + dy, c);
    }
  }
}

export function ellipse(b, cx, cy, rx, ry, c) {
  for (let y = -ry; y <= ry; y++)
    for (let x = -rx; x <= rx; x++)
      if ((x * x) / (rx * rx + 0.01) + (y * y) / (ry * ry + 0.01) <= 1) px(b, Math.round(cx + x), Math.round(cy + y), c);
}

export function roundRect(b, x, y, w, h, r, c) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++) {
      const nx = dx < r ? r - dx : dx >= w - r ? dx - (w - r - 1) : 0;
      const ny = dy < r ? r - dy : dy >= h - r ? dy - (h - r - 1) : 0;
      if (nx * nx + ny * ny <= r * r + 0.5 || (dx >= r && dx < w - r) || (dy >= r && dy < h - r)) px(b, x + dx, y + dy, c);
    }
}

export function shadow(b, x, y, w, _h, a = 0.25) {
  ellipse(b, x + w / 2, y - 2, w * 0.42, 6, [20, 30, 40, Math.round(a * 255)]);
}

export function label(b, x, y, text, color = [255, 255, 255, 255]) {
  const gw = 5;
  const gh = 7;
  const font = {
    H: [[1, 0, 1], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
    O: [[0, 1, 0], [1, 0, 1], [1, 0, 1], [1, 0, 1], [0, 1, 0]],
    S: [[1, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1]],
    P: [[1, 1, 0], [1, 0, 1], [1, 1, 0], [1, 0, 0], [1, 0, 0]],
    I: [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
    T: [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
    A: [[0, 1, 0], [1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
    L: [[1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 1]],
    R: [[1, 1, 0], [1, 0, 1], [1, 1, 0], [1, 0, 1], [1, 0, 1]],
    E: [[1, 1, 1], [1, 0, 0], [1, 1, 0], [1, 0, 0], [1, 1, 1]],
    N: [[1, 0, 1], [1, 1, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1]],
    C: [[0, 1, 1], [1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 1, 1]],
    M: [[1, 0, 1], [1, 1, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1]],
    U: [[1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 0, 1], [0, 1, 0]],
    B: [[1, 1, 0], [1, 0, 1], [1, 1, 0], [1, 0, 1], [1, 1, 0]],
    K: [[1, 0, 1], [1, 1, 0], [1, 0, 0], [1, 1, 0], [1, 0, 1]],
    D: [[1, 1, 0], [1, 0, 1], [1, 0, 1], [1, 0, 1], [1, 1, 0]],
    G: [[0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 0, 1], [0, 1, 1]],
    F: [[1, 1, 1], [1, 0, 0], [1, 1, 0], [1, 0, 0], [1, 0, 0]],
    Y: [[1, 0, 1], [1, 0, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0]],
    ' ': [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  };
  let ox = x;
  for (const ch of text.toUpperCase()) {
    const g = font[ch] ?? font[' '];
    for (let row = 0; row < gh; row++)
      for (let col = 0; col < gw; col++) if (g[row]?.[col]) px(b, ox + col, y + row, color);
    ox += gw + 1;
  }
}

export function shade(c, f = 0.85) {
  return [Math.round(c[0] * f), Math.round(c[1] * f), Math.round(c[2] * f), c[3] ?? 255];
}

export function highlight(c, f = 1.12) {
  return [Math.min(255, Math.round(c[0] * f)), Math.min(255, Math.round(c[1] * f)), Math.min(255, Math.round(c[2] * f)), c[3] ?? 255];
}

export function windowGrid(b, x, y, cols, rows, ww, wh, gap, glass = PAL.glass) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const wx = x + col * (ww + gap);
      const wy = y + row * (wh + gap);
      rect(b, wx, wy, ww, wh, [68, 78, 92, 255]);
      rect(b, wx + 1, wy + 1, ww - 2, wh - 2, glass);
      rect(b, wx + Math.floor(ww / 2), wy + 1, 1, wh - 2, [120, 150, 188, 180]);
      rect(b, wx + 1, wy + Math.floor(wh / 2), ww - 2, 1, [120, 150, 188, 160]);
    }
  }
}

export function doorFrame(b, x, y, w, h, frame, door) {
  roundRect(b, x - 2, y - 2, w + 4, h + 4, 2, frame);
  rect(b, x, y, w, h, door);
  rect(b, x + w - 6, y + Math.floor(h / 2), 3, 3, [248, 210, 58, 255]);
}

export function awning(b, x, y, w, color) {
  for (let i = 0; i < 5; i++) {
    rect(b, x + i * Math.floor(w / 5), y, Math.ceil(w / 5) + 1, 8, i % 2 === 0 ? color : highlight(color, 1.08));
  }
  rect(b, x, y + 7, w, 2, shade(color, 0.75));
}

export function steps(b, x, y, w) {
  rect(b, x, y, w, 4, [148, 152, 158, 255]);
  rect(b, x + 2, y + 4, w - 4, 3, [168, 172, 178, 255]);
  rect(b, x + 4, y + 7, w - 8, 2, [188, 192, 198, 255]);
}

export function buildingShell(w, h, wall, roof, accent, opts = {}) {
  const b = buf(w, h);
  const facadeY = opts.facadeY ?? 40;
  const facadeH = opts.facadeH ?? h - 58;
  const facadeX = opts.facadeX ?? 14;
  const facadeW = opts.facadeW ?? w - 28;

  shadow(b, 18, h - 16, w - 36, 12, 0.32);

  // Muro lateral (profundidad)
  for (let row = 0; row < 26; row++) {
    const ry = facadeY - 8 + row;
    rect(b, 8, ry, 7, 1, shade(wall, 0.78 + (row % 3) * 0.02));
  }

  // Techo escalonado
  for (let row = 0; row < 24; row++) {
    const inset = Math.floor(row * 0.42);
    const rw = w - 18 - inset * 2;
    const rx = 9 + inset;
    const c = row < 3 ? highlight(roof, 1.06) : row % 4 === 0 ? accent : roof;
    rect(b, rx, 14 + row, rw, 1, c);
  }

  // Cornisa
  rect(b, facadeX - 2, facadeY - 4, facadeW + 4, 4, accent);
  roundRect(b, facadeX, facadeY, facadeW, facadeH, 5, wall);

  // Banda de letrero
  rect(b, facadeX + 4, facadeY + 4, facadeW - 8, 11, shade(accent, 0.92));

  // Ventanas
  const winY = facadeY + 18;
  windowGrid(b, facadeX + 8, winY, 3, 2, 10, 11, 10);

  // Puerta central
  const doorW = 22;
  const doorH = 30;
  const doorX = Math.floor(w / 2 - doorW / 2);
  const doorY = facadeY + facadeH - doorH - 6;
  awning(b, doorX - 5, doorY - 9, doorW + 10, accent);
  doorFrame(b, doorX, doorY, doorW, doorH, shade(wall, 0.7), [118, 98, 78, 255]);
  steps(b, doorX - 8, h - 22, doorW + 16);

  // Zócalo / base
  rect(b, facadeX - 4, h - 26, facadeW + 8, 5, shade(wall, 0.72));
  rect(b, facadeX - 2, h - 22, facadeW + 4, 2, highlight(accent, 0.95));

  outline(b, facadeX, facadeY, facadeW, facadeH, PAL.outline, 1);
  return b;
}

export const PAL = {
  outline: [45, 52, 68, 255],
  grass: [88, 172, 78, 255],
  grassHi: [108, 192, 92, 255],
  road: [98, 104, 112, 255],
  roadDark: [78, 84, 92, 255],
  roadLine: [248, 250, 252, 255],
  curb: [168, 172, 178, 255],
  rail: [90, 96, 108, 255],
  wood: [168, 118, 72, 255],
  white: [248, 250, 252, 255],
  glass: [160, 210, 238, 255],
};

export function signPlaque(b, x, y, text, w, accent = [248, 210, 58, 255]) {
  roundRect(b, x, y, w, 14, 3, [12, 18, 32, 255]);
  rect(b, x + 1, y + 1, w - 2, 3, accent);
  label(b, x + 4, y + 4, text, [248, 250, 252, 255]);
}
