import { ISO_CONFIG } from './iso.config';

export function isoToWorld(
  tx: number,
  ty: number,
  tw = ISO_CONFIG.tileWidth,
  th = ISO_CONFIG.tileHeight,
): { x: number; y: number } {
  return {
    x: (tx - ty) * (tw / 2),
    y: (tx + ty) * (th / 2),
  };
}

export function worldToIso(
  wx: number,
  wy: number,
  tw = ISO_CONFIG.tileWidth,
  th = ISO_CONFIG.tileHeight,
): { tx: number; ty: number } {
  const tx = (wx / (tw / 2) + wy / (th / 2)) / 2;
  const ty = (wy / (th / 2) - wx / (tw / 2)) / 2;
  return { tx, ty };
}

export function isoMapWorldSize(
  mapW: number,
  mapH: number,
  tw = ISO_CONFIG.tileWidth,
  th = ISO_CONFIG.tileHeight,
): { width: number; height: number } {
  return {
    width: (mapW + mapH) * (tw / 2),
    height: (mapW + mapH) * (th / 2),
  };
}

export function tileCenterWorld(tx: number, ty: number): { x: number; y: number } {
  return isoToWorld(tx + 0.5, ty + 0.5);
}
