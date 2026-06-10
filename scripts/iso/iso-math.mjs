/** Utilidades isométricas compartidas (build + runtime). */

export const ISO_TILE_W = 128;
export const ISO_TILE_H = 64;

export function isoToWorld(tx, ty, tw = ISO_TILE_W, th = ISO_TILE_H) {
  return {
    x: (tx - ty) * (tw / 2),
    y: (tx + ty) * (th / 2),
  };
}

export function worldToIso(wx, wy, tw = ISO_TILE_W, th = ISO_TILE_H) {
  const tx = (wx / (tw / 2) + wy / (th / 2)) / 2;
  const ty = (wy / (th / 2) - wx / (tw / 2)) / 2;
  return { tx, ty };
}
