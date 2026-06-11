/** Utilidades de dibujo — ciudad educativa 2D premium (city builder) */
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

export function line(b, x0, y0, x1, y1, c, thickness = 1) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  const half = Math.floor(thickness / 2);
  while (true) {
    for (let oy = -half; oy <= half; oy++) {
      for (let ox = -half; ox <= half; ox++) {
        if (ox * ox + oy * oy <= half * half + 0.5) px(b, x + ox, y + oy, c);
      }
    }
    if (x === x1 && y === y1) break;
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
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

export function gradientRect(b, x, y, w, h, top, bottom) {
  for (let dy = 0; dy < h; dy++) {
    const t = h <= 1 ? 0 : dy / (h - 1);
    const c = [
      Math.round(top[0] + (bottom[0] - top[0]) * t),
      Math.round(top[1] + (bottom[1] - top[1]) * t),
      Math.round(top[2] + (bottom[2] - top[2]) * t),
      Math.round(top[3] + ((bottom[3] ?? 255) - (top[3] ?? 255)) * t),
    ];
    rect(b, x, y + dy, w, 1, c);
  }
}

export function shadow(b, x, y, w, _h, a = 0.25) {
  ellipse(b, x + w / 2, y - 1, w * 0.46, 7, [12, 18, 28, Math.round(a * 255)]);
  ellipse(b, x + w / 2, y + 1, w * 0.34, 4, [8, 12, 18, Math.round(a * 0.55 * 255)]);
}

export function facadeTexture(b, x, y, w, h, base) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const stripe = dy % 5 === 0 ? 0.96 : 1;
      const grain = ((dx * 17 + dy * 31) % 7 === 0 ? 1.04 : 1) * stripe;
      const edge = dx < 2 ? 0.9 : dx >= w - 2 ? 0.86 : 1;
      px(b, x + dx, y + dy, shade(base, grain * edge));
    }
  }
  rect(b, x, y, 2, h, highlight(base, 1.06));
  rect(b, x + w - 2, y, 2, h, shade(base, 0.82));
}

export function roofTiles(b, x, y, w, rows, roof, accent) {
  for (let row = 0; row < rows; row++) {
    const inset = Math.floor(row * 0.38);
    const rw = w - inset * 2;
    const rx = x + inset;
    const tileH = 3;
    for (let tx = 0; tx < rw; tx += 6) {
      const c = (tx / 6 + row) % 2 === 0 ? roof : shade(roof, 0.92);
      rect(b, rx + tx, y + row * tileH, Math.min(6, rw - tx), tileH, c);
    }
    if (row % 3 === 0) rect(b, rx, y + row * tileH, rw, 1, highlight(accent, 1.02));
  }
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
    V: [[1, 0, 1], [1, 0, 1], [1, 0, 1], [0, 1, 0], [0, 1, 0]],
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
      roundRect(b, wx - 1, wy - 1, ww + 2, wh + 2, 1, [58, 68, 82, 255]);
      rect(b, wx, wy, ww, wh, [72, 82, 98, 255]);
      gradientRect(b, wx + 1, wy + 1, ww - 2, wh - 2, highlight(glass, 1.08), shade(glass, 0.88));
      rect(b, wx + Math.floor(ww / 2), wy + 1, 1, wh - 2, [140, 178, 218, 200]);
      rect(b, wx + 1, wy + Math.floor(wh / 2), ww - 2, 1, [130, 168, 208, 180]);
      rect(b, wx, wy + wh, ww, 2, [148, 152, 158, 255]);
    }
  }
}

export function doorFrame(b, x, y, w, h, frame, door) {
  roundRect(b, x - 3, y - 3, w + 6, h + 6, 3, frame);
  gradientRect(b, x, y, w, h, highlight(door, 1.05), shade(door, 0.88));
  rect(b, x + 2, y + 2, w - 4, Math.floor(h * 0.35), highlight(door, 1.12));
  roundRect(b, x + w - 7, y + Math.floor(h / 2) - 2, 4, 4, 2, [248, 210, 58, 255]);
  rect(b, x, y + h, w, 2, shade(frame, 0.85));
}

export function awning(b, x, y, w, color) {
  for (let i = 0; i < 6; i++) {
    const aw = Math.ceil(w / 6) + 1;
    const ax = x + i * Math.floor(w / 6);
    rect(b, ax, y, aw, 9, i % 2 === 0 ? color : highlight(color, 1.1));
  }
  rect(b, x, y + 8, w, 3, shade(color, 0.72));
  for (let i = 0; i < 5; i++) line(b, x + i * Math.floor(w / 4), y + 9, x + i * Math.floor(w / 4) + 3, y + 12, shade(color, 0.65), 1);
}

export function steps(b, x, y, w) {
  gradientRect(b, x, y, w, 4, [168, 172, 178, 255], [138, 142, 148, 255]);
  gradientRect(b, x + 2, y + 4, w - 4, 3, [178, 182, 188, 255], [148, 152, 158, 255]);
  gradientRect(b, x + 4, y + 7, w - 8, 3, [188, 192, 198, 255], [158, 162, 168, 255]);
  outline(b, x, y, w, 10, shade(PAL.outline, 0.9), 1);
}

export function integratedSign(b, x, y, w, h, text, accent = [248, 210, 58, 255]) {
  shadow(b, x + 4, y + h + 2, w - 8, 4, 0.28);
  roundRect(b, x - 2, y - 2, w + 4, h + 4, 4, shade(PAL.outline, 0.9));
  gradientRect(b, x, y, w, h, [22, 28, 44, 255], [8, 12, 24, 255]);
  gradientRect(b, x + 2, y + 2, w - 4, Math.max(5, Math.floor(h * 0.28)), highlight(accent, 1.1), accent);
  rect(b, x + 2, y + Math.floor(h * 0.28) + 2, w - 4, 1, highlight(accent, 1.25));
  const labelY = y + Math.floor(h * 0.32);
  label(b, x + 6, labelY, text, [248, 252, 255, 255]);
  rect(b, x + Math.floor(w / 2) - 2, y + h, 4, 4, shade(PAL.stone, 0.88));
}

export function gableRoof(b, x, y, w, wallColor, roofColor) {
  for (let row = 0; row < Math.floor(w / 2); row++) {
    const rw = w - row * 2;
    const c = row % 3 === 0 ? highlight(roofColor, 1.04) : roofColor;
    rect(b, x + row, y + row, rw, 2, c);
  }
}

export function columns(b, x, y, count, spacing, height, color = PAL.white) {
  for (let i = 0; i < count; i++) {
    const cx = x + i * spacing;
    gradientRect(b, cx, y, 6, height, highlight(color, 1.05), shade(color, 0.88));
    rect(b, cx - 1, y - 3, 8, 3, highlight(color, 1.08));
    rect(b, cx - 1, y + height, 8, 3, shade(color, 0.82));
  }
}

export function chimney(b, x, y, h = 18) {
  gradientRect(b, x, y, 8, h, [148, 98, 78, 255], [118, 78, 58, 255]);
  rect(b, x - 1, y - 2, 10, 3, [98, 68, 48, 255]);
  px(b, x + 3, y + 4, [88, 58, 38, 200]);
}

export function flatRoof(b, x, y, w, d, color, accent) {
  gradientRect(b, x, y, w, d, highlight(color, 1.06), shade(color, 0.86));
  rect(b, x, y, w, 3, shade(color, 0.92));
  rect(b, x + 3, y + 3, w - 6, 2, highlight(accent, 1.08));
  rect(b, x + w - 14, y + 5, 10, 6, shade(PAL.stone, 0.88));
  rect(b, x, y + d - 2, w, 2, shade(color, 0.72));
}

export function shingleRoof(b, x, y, w, rows, color) {
  for (let row = 0; row < rows; row++) {
    const inset = Math.floor(row * 0.35);
    const rw = w - inset * 2;
    const rx = x + inset;
    for (let col = 0; col < rw; col += 5) {
      const c = (row + col) % 2 === 0 ? color : shade(color, 0.9);
      rect(b, rx + col, y + row * 2, Math.min(5, rw - col), 2, c);
    }
  }
}

export function brickTexture(b, x, y, w, h, base) {
  for (let dy = 0; dy < h; dy++) {
    const off = dy % 4 === 0 ? 0 : 3;
    for (let dx = 0; dx < w; dx++) {
      const bx = (dx + off) % 8;
      const c = bx < 7 ? shade(base, 0.94 + (dy % 3) * 0.02) : shade(base, 0.82);
      px(b, x + dx, y + dy, c);
    }
  }
  rect(b, x, y, 2, h, highlight(base, 1.05));
}

export function medicalCross(b, cx, cy, size, red = [228, 58, 58, 255], white = [255, 255, 255, 255]) {
  gradientRect(b, cx - Math.floor(size / 6), cy - Math.floor(size / 2), Math.floor(size / 3), size, red, shade(red, 0.82));
  gradientRect(b, cx - Math.floor(size / 2), cy - Math.floor(size / 6), size, Math.floor(size / 3), red, shade(red, 0.82));
  rect(b, cx - Math.floor(size / 8), cy - Math.floor(size / 3), Math.floor(size / 4), Math.floor((size * 2) / 3), white);
  rect(b, cx - Math.floor(size / 3), cy - Math.floor(size / 8), Math.floor((size * 2) / 3), Math.floor(size / 4), white);
}

export function shieldBadge(b, cx, cy, rx, ry, fill, border = [248, 210, 58, 255]) {
  ellipse(b, cx, cy, rx + 1, ry + 1, border);
  ellipse(b, cx, cy, rx, ry, fill);
}

export function flagPole(b, x, y, h, flag = [248, 210, 58, 255]) {
  gradientRect(b, x, y, 3, h, PAL.stone, shade(PAL.stone, 0.82));
  rect(b, x + 3, y + 4, 16, 9, flag);
  rect(b, x + 3, y + 4, 16, 3, highlight(flag, 1.12));
  line(b, x + 3, y + 8, x + 19, y + 8, shade(flag, 0.75), 1);
}

export function clockFace(b, cx, cy, r) {
  ellipse(b, cx, cy, r, r, PAL.white);
  ellipse(b, cx, cy, r - 2, r - 2, [248, 248, 252, 255]);
  line(b, cx, cy, cx, cy - r + 3, PAL.outline, 1);
  line(b, cx, cy, cx + r - 4, cy, PAL.outline, 1);
}

export function hedgeRow(b, x, y, w, h = 10) {
  for (let i = 0; i < w; i += 6) {
    ellipse(b, x + i + 3, y + h / 2, 5, h / 2 + 1, PAL.foliage);
    ellipse(b, x + i + 2, y + h / 2 - 1, 3, h / 2, PAL.foliageHi);
  }
}

export function balcony(b, x, y, w) {
  rect(b, x, y, w, 3, shade(PAL.stone, 0.9));
  for (let i = 0; i < w; i += 5) line(b, x + i, y + 3, x + i, y + 11, PAL.stone, 1);
  rect(b, x, y + 11, w, 2, shade(PAL.stone, 0.82));
}

export function archedDoor(b, x, y, w, h, frame, door) {
  roundRect(b, x - 2, y + Math.floor(h * 0.25), w + 4, h - Math.floor(h * 0.25) + 2, 2, frame);
  for (let row = 0; row < Math.floor(w / 2); row++) {
    rect(b, x + row, y + row, w - row * 2, 1, frame);
  }
  gradientRect(b, x, y + Math.floor(h * 0.3), w, h - Math.floor(h * 0.3), highlight(door, 1.05), shade(door, 0.88));
}

export function sideDepth(b, x, y, depth, wall, rows) {
  for (let row = 0; row < rows; row++) {
    rect(b, x, y + row, depth, 1, shade(wall, 0.7 + (row % 4) * 0.018));
    if (row % 8 === 0) px(b, x + depth - 1, y + row, highlight(wall, 1.04));
  }
}

export function roofOverhang(b, x, y, w, color) {
  gradientRect(b, x, y, w, 4, highlight(color, 1.08), shade(color, 0.88));
  rect(b, x, y + 3, w, 1, shade(color, 0.72));
}

export function flowerBox(b, x, y, w) {
  rect(b, x, y + 6, w, 5, PAL.wood);
  for (let i = 0; i < w - 2; i += 3) {
    px(b, x + 1 + i, y + 4, [248, 120, 140, 255]);
    px(b, x + 2 + i, y + 3, [240, 210, 60, 255]);
  }
}

export function castShadowDir(b, x, y, w, h, a = 0.38) {
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    ellipse(
      b,
      x + w * 0.58 + i * 1.2,
      y + h - 2 + i * 0.35,
      w * (0.48 - t * 0.06),
      8 - i * 0.45,
      [10, 14, 22, Math.round(a * (1 - t * 0.55) * 255)],
    );
  }
}

export function terracottaRoof(b, x, y, w, rows, color = [198, 68, 48, 255]) {
  for (let row = 0; row < rows; row++) {
    const inset = Math.floor(row * 0.42);
    const rw = w - inset * 2;
    const rx = x + inset;
    for (let col = 0; col < rw; col += 7) {
      const c = (row + Math.floor(col / 7)) % 2 === 0 ? color : shade(color, 0.88);
      roundRect(b, rx + col, y + row * 3, Math.min(7, rw - col), 3, 1, c);
      rect(b, rx + col, y + row * 3 + 2, Math.min(7, rw - col), 1, shade(color, 0.72));
    }
  }
  roofOverhang(b, x - 2, y + rows * 3 - 2, w + 4, shade(color, 0.9));
}

export function metalRoof(b, x, y, w, d, color = [72, 118, 188, 255]) {
  gradientRect(b, x, y, w, d, highlight(color, 1.08), shade(color, 0.82));
  for (let i = 0; i < w; i += 14) {
    line(b, x + i, y, x + i, y + d, shade(color, 0.78), 1);
    rect(b, x + i + 1, y + 1, 12, 2, highlight(color, 1.14));
  }
  rect(b, x + w - 18, y + 4, 14, 8, shade(PAL.stone, 0.86));
  rect(b, x + 8, y + 4, 10, 6, shade(PAL.stone, 0.9));
  rect(b, x, y + d - 2, w, 2, shade(color, 0.68));
}

export function stoneTexture(b, x, y, w, h, base) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const bx = (dx + (dy % 5) * 3) % 10;
      const by = Math.floor((dy + dx) / 10) % 2;
      const c = bx < 9 ? shade(base, 0.92 + by * 0.04 + ((dx * dy) % 5) * 0.01) : shade(base, 0.78);
      px(b, x + dx, y + dy, c);
    }
  }
  rect(b, x, y, 2, h, highlight(base, 1.06));
  rect(b, x + w - 2, y, 2, h, shade(base, 0.8));
}

export function facadeBanner(b, x, y, w, h, text, accent, iconDraw) {
  castShadowDir(b, x + 4, y + h - 2, w - 8, 6, 0.22);
  roundRect(b, x - 2, y - 2, w + 4, h + 4, 4, shade(PAL.outline, 0.9));
  gradientRect(b, x, y, w, h, [20, 28, 46, 255], [10, 14, 28, 255]);
  gradientRect(b, x + 2, y + 2, w - 4, Math.max(4, Math.floor(h * 0.22)), highlight(accent, 1.12), accent);
  roundRect(b, x + 4, y + 4, 24, h - 8, 3, accent);
  if (iconDraw) iconDraw(b, x + 16, y + Math.floor(h / 2));
  label(b, x + 32, y + Math.floor(h * 0.36), text, PAL.white);
  rect(b, x + Math.floor(w / 2) - 1, y + h + 1, 2, 4, shade(PAL.stone, 0.85));
}

export function storyWindows(b, x, y, w, floors, cols, ww, wh, gap, glass = PAL.glass) {
  const floorH = wh + gap + 6;
  for (let f = 0; f < floors; f++) {
    const fy = y + f * floorH;
    rect(b, x - 2, fy + wh + 2, w + 4, 2, shade(PAL.stone, 0.88));
    const totalW = cols * ww + (cols - 1) * gap;
    const ox = x + Math.floor((w - totalW) / 2);
    windowGrid(b, ox, fy, cols, 1, ww, wh, gap, glass);
  }
}

export function recessedEntry(b, x, y, w, h, wall, inner = [188, 198, 208, 255]) {
  roundRect(b, x, y, w, h, 4, shade(wall, 0.72));
  gradientRect(b, x + 4, y + 4, w - 8, h - 8, inner, shade(inner, 0.86));
  rect(b, x + 2, y + 2, w - 4, 2, highlight(wall, 1.08));
}

export function stripeAwning(b, x, y, w, c1, c2) {
  const stripes = 8;
  const sw = Math.ceil(w / stripes);
  for (let i = 0; i < stripes; i++) {
    rect(b, x + i * sw, y, sw + 1, 10, i % 2 === 0 ? c1 : c2);
  }
  rect(b, x, y + 9, w, 3, shade(c1, 0.72));
  for (let i = 0; i < 6; i++) {
    line(b, x + i * Math.floor(w / 5), y + 10, x + i * Math.floor(w / 5) + 4, y + 13, shade(c1, 0.62), 1);
  }
}

export function storefront(b, x, y, w, h, frame, tint = PAL.glass) {
  roundRect(b, x - 2, y - 2, w + 4, h + 4, 3, frame);
  gradientRect(b, x, y, w, h, highlight(tint, 1.06), shade(tint, 0.82));
  line(b, x + 4, y + 4, x + w - 6, y + h - 6, [220, 238, 252, 140], 1);
  rect(b, x, y + h, w, 2, shade(frame, 0.85));
}

export function cornice(b, x, y, w, accent) {
  gradientRect(b, x, y, w, 5, highlight(accent, 1.14), accent);
  rect(b, x, y + 4, w, 2, shade(accent, 0.78));
  for (let i = 0; i < w; i += 8) rect(b, x + i, y + 5, 5, 2, shade(accent, 0.68));
}

export function wingBlock(b, x, y, w, h, wall, roof, accent, opts = {}) {
  const roofType = opts.roofType ?? 'tile';
  if (roofType === 'terracotta') terracottaRoof(b, x + 2, y - 14, w - 4, 6, roof);
  else if (roofType === 'flat') flatRoof(b, x + 2, y - 12, w - 4, 10, roof, accent);
  else roofTiles(b, x + 2, y - 12, w - 4, 5, roof, accent);
  roundRect(b, x, y, w, h, 4, wall);
  if (opts.brick) brickTexture(b, x + 2, y + 2, w - 4, h - 4, wall);
  else facadeTexture(b, x + 2, y + 2, w - 4, h - 4, wall);
  outline(b, x, y, w, h, PAL.outline, 1);
}

export function patioSet(b, x, y) {
  rect(b, x, y + 8, 18, 10, PAL.wood);
  ellipse(b, x + 9, y + 4, 10, 7, [252, 254, 255, 255]);
  rect(b, x + 7, y + 10, 3, 8, PAL.wood);
  rect(b, x + 28, y + 10, 16, 8, PAL.wood);
  ellipse(b, x + 36, y + 6, 9, 6, [248, 188, 148, 255]);
  rect(b, x + 34, y + 12, 3, 7, PAL.wood);
}

export function buildingShell(w, h, wall, roof, accent, opts = {}) {
  const b = buf(w, h);
  const facadeY = opts.facadeY ?? 46;
  const facadeH = opts.facadeH ?? h - 64;
  const facadeX = opts.facadeX ?? 16;
  const facadeW = opts.facadeW ?? w - 32;
  const roofType = opts.roofType ?? 'tile';
  const skipDefault = opts.skipDefault ?? false;

  shadow(b, 14, h - 12, w - 28, 14, 0.4);
  castShadowDir(b, 18, h - 18, w - 36, 16, 0.32);
  sideDepth(b, 4, facadeY - 12, 11, wall, Math.min(facadeH + 14, 34));

  if (roofType === 'flat') {
    flatRoof(b, 10, 10, w - 20, 14, roof, accent);
  } else if (roofType === 'metal') {
    metalRoof(b, 10, 8, w - 20, 16, roof);
  } else if (roofType === 'terracotta') {
    terracottaRoof(b, 10, 8, w - 20, 8, roof);
  } else if (roofType === 'shingle') {
    shingleRoof(b, 10, 8, w - 20, 9, roof);
    roofOverhang(b, facadeX - 4, facadeY - 8, facadeW + 8, shade(roof, 0.92));
  } else {
    roofTiles(b, 10, 10, w - 20, 9, roof, accent);
    roofOverhang(b, facadeX - 4, facadeY - 8, facadeW + 8, shade(roof, 0.92));
  }

  gradientRect(b, facadeX - 4, facadeY - 7, facadeW + 8, 6, highlight(accent, 1.1), accent);
  roundRect(b, facadeX, facadeY, facadeW, facadeH, 6, wall);

  if (opts.brick) brickTexture(b, facadeX + 2, facadeY + 2, facadeW - 4, facadeH - 4, wall);
  else facadeTexture(b, facadeX + 2, facadeY + 2, facadeW - 4, facadeH - 4, wall);

  gradientRect(b, facadeX + 6, facadeY + 6, facadeW - 12, 10, highlight(accent, 1.08), shade(accent, 0.86));
  rect(b, facadeX + 6, facadeY + 15, facadeW - 12, 1, highlight(accent, 1.18));

  if (!skipDefault) {
    windowGrid(b, facadeX + 12, facadeY + 24, 3, 2, 12, 13, 8);
    const doorW = 26;
    const doorH = 34;
    const doorX = Math.floor(w / 2 - doorW / 2);
    const doorY = facadeY + facadeH - doorH - 10;
    awning(b, doorX - 8, doorY - 11, doorW + 16, accent);
    doorFrame(b, doorX, doorY, doorW, doorH, shade(wall, 0.65), [102, 82, 62, 255]);
    steps(b, doorX - 12, h - 26, doorW + 24);
  }

  gradientRect(b, facadeX - 6, h - 30, facadeW + 12, 7, shade(wall, 0.68), shade(wall, 0.55));
  rect(b, facadeX - 4, h - 24, facadeW + 8, 2, highlight(accent, 0.9));
  outline(b, facadeX, facadeY, facadeW, facadeH, PAL.outline, 1);
  return b;
}

export const PAL = {
  outline: [38, 46, 62, 255],
  grass: [72, 158, 68, 255],
  grassHi: [92, 178, 82, 255],
  grassDark: [58, 132, 54, 255],
  road: [88, 94, 102, 255],
  roadDark: [68, 74, 82, 255],
  roadWear: [78, 82, 88, 255],
  roadLine: [248, 250, 252, 255],
  curb: [178, 182, 188, 255],
  curbDark: [148, 152, 158, 255],
  rail: [82, 88, 98, 255],
  wood: [158, 108, 62, 255],
  woodHi: [188, 138, 82, 255],
  white: [248, 250, 252, 255],
  glass: [148, 198, 238, 255],
  water: [72, 158, 218, 255],
  waterHi: [118, 198, 248, 255],
  foliage: [48, 128, 58, 255],
  foliageHi: [78, 168, 72, 255],
  stone: [168, 172, 178, 255],
};

export function signPlaque(b, x, y, text, w, accent = [248, 210, 58, 255]) {
  shadow(b, x + 2, y + 16, w - 4, 4, 0.35);
  roundRect(b, x - 1, y - 1, w + 2, 18, 4, shade(PAL.outline, 0.85));
  gradientRect(b, x, y, w, 16, [18, 24, 38, 255], [8, 12, 22, 255]);
  gradientRect(b, x + 1, y + 1, w - 2, 4, highlight(accent, 1.08), accent);
  rect(b, x + 1, y + 5, w - 2, 1, highlight(accent, 1.2));
  label(b, x + 5, y + 6, text, [248, 252, 255, 255]);
  rect(b, x + Math.floor(w / 2) - 1, y + 16, 2, 3, shade(PAL.stone, 0.85));
}
