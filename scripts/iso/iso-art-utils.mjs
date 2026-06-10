/** Utilidades de pintura isométrica — iluminación cálida, textura orgánica */

export function buf(w, h) {
  return { data: Buffer.alloc(w * h * 4, 0), w, h };
}

export function px(b, x, y, c) {
  if (x < 0 || y < 0 || x >= b.w || y >= b.h) return;
  const i = (y * b.w + x) * 4;
  const [r, g, bl, a = 255] = c;
  b.data[i] = r;
  b.data[i + 1] = g;
  b.data[i + 2] = bl;
  b.data[i + 3] = a;
}

export function rect(b, x, y, w, h, c) {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) px(b, x + dx, y + dy, c);
}

export function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

export function blend(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t), lerp(c1[3] ?? 255, c2[3] ?? 255, t)];
}

/** Ruido determinista para textura */
export function noise(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.758) * 43758.5453;
  return n - Math.floor(n);
}

export function fillDiamond(b, cx, cy, hw, hh, top, left, right, bottom, seed = 0) {
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      const nx = (x - cx) / hw;
      const ny = (y - cy) / hh;
      if (Math.abs(nx) + Math.abs(ny) > 1) continue;
      const t = Math.max(0, ny);
      const side = nx < 0 ? left : right;
      const n = noise(x, y, seed) * 0.12;
      let col = blend(top, side, t * 0.55 + n);
      if (ny > 0.72) col = blend(col, bottom, (ny - 0.72) / 0.28);
      px(b, x, y, col);
    }
  }
}

export function grassTexture(seed, TW, TH) {
  const b = buf(TW, TH);
  const palettes = [
    [[98, 162, 78], [72, 132, 62], [118, 182, 92], [52, 98, 48]],
    [[88, 148, 72], [64, 118, 56], [108, 172, 86], [44, 88, 42]],
    [[108, 172, 88], [82, 142, 72], [128, 192, 98], [58, 108, 52]],
    [[78, 138, 68], [58, 108, 50], [98, 162, 80], [40, 82, 38]],
  ];
  const p = palettes[seed % palettes.length];
  fillDiamond(b, TW / 2, TH / 2 - 4, TW / 2 - 2, TH / 2 - 2, p[0], p[1], p[2], p[3], seed);
  for (let i = 0; i < 80 + seed * 12; i++) {
    const x = 16 + ((i * 19 + seed * 11) % (TW - 32));
    const y = 14 + ((i * 13 + seed * 5) % (TH - 28));
    const g = noise(x, y, seed + i);
    px(b, x, y, [lerp(100, 160, g), lerp(150, 200, g), lerp(70, 110, g), 200]);
  }
  for (let i = 0; i < 20; i++) {
    const x = 20 + ((i * 23) % 88);
    const y = 18 + ((i * 17) % 30);
    px(b, x, y, [140, 200, 100, 160]);
    px(b, x + 1, y, [120, 180, 90, 120]);
  }
  return b;
}

export function stonePath(seed, TW, TH, warm = false) {
  const b = buf(TW, TH);
  const top = warm ? [168, 148, 118] : [150, 132, 108];
  const left = [118, 98, 78];
  const right = [172, 152, 122];
  const bottom = [92, 76, 58];
  fillDiamond(b, TW / 2, TH / 2 - 4, TW / 2 - 2, TH / 2 - 2, top, left, right, bottom, seed);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const x = 22 + col * 18 + (row % 2) * 8;
      const y = 20 + row * 10;
      const c = noise(col, row, seed) > 0.5 ? [178, 158, 128] : [138, 118, 92];
      for (let dy = 0; dy < 8; dy++)
        for (let dx = 0; dx < 14; dx++) {
          if (noise(x + dx, y + dy, seed) > 0.3) px(b, x + dx, y + dy, [...c, 230]);
        }
    }
  }
  return b;
}

export function flowerBed(colors, TW, TH) {
  const b = grassTexture(0, TW, TH);
  for (let i = 0; i < 45; i++) {
    const x = 24 + (i * 7) % 80;
    const y = 18 + (i * 5) % 32;
    const c = colors[i % colors.length];
    px(b, x, y, c);
    px(b, x + 1, y - 1, [58, 130, 58, 255]);
    px(b, x - 1, y, [48, 118, 52, 200]);
  }
  return b;
}

export function groundShadow(b, w, h, intensity = 50) {
  for (let x = 0; x < w; x++) {
    for (let d = 0; d < 8; d++) {
      px(b, x, h - 8 + d, [20, 15, 10, Math.round(intensity * (1 - d / 8))]);
    }
  }
}
