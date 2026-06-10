import Phaser from 'phaser';
import { ISO_CONFIG } from './iso.config';
import { isoToWorld, worldToIso } from './iso.math';

export interface PathPoint {
  x: number;
  y: number;
}

interface Node {
  tx: number;
  ty: number;
  g: number;
  f: number;
  parent?: Node;
}

/** A* sobre grilla isométrica — colisión desde capa Tiled. */
export class IsoPathfinder {
  private readonly walkable: boolean[][];

  constructor(
    private readonly mapWidth: number,
    private readonly mapHeight: number,
    collisionLayer: Phaser.Tilemaps.TilemapLayer | null,
  ) {
    this.walkable = [];
    for (let ty = 0; ty < mapHeight; ty++) {
      const row: boolean[] = [];
      for (let tx = 0; tx < mapWidth; tx++) {
        const blocked = collisionLayer?.getTileAt(tx, ty)?.index ?? 0;
        row.push(blocked === 0);
      }
      this.walkable.push(row);
    }
  }

  findPathWorld(fromX: number, fromY: number, toX: number, toY: number): PathPoint[] {
    const start = this.worldToTile(fromX, fromY);
    const goal = this.worldToTile(toX, toY);
    const snappedGoal = this.nearestWalkable(goal.tx, goal.ty) ?? goal;
    const snappedStart = this.nearestWalkable(start.tx, start.ty) ?? start;

    const tiles = this.findPathTiles(
      Math.floor(snappedStart.tx),
      Math.floor(snappedStart.ty),
      Math.floor(snappedGoal.tx),
      Math.floor(snappedGoal.ty),
    );
    if (tiles.length < 2) return [{ x: fromX, y: fromY }, { x: toX, y: toY }];

    const world = tiles.map((t) => this.tileToWorld(t.tx, t.ty));
    world[0] = { x: fromX, y: fromY };
    world[world.length - 1] = { x: toX, y: toY };
    return this.simplify(world);
  }

  private worldToTile(wx: number, wy: number): { tx: number; ty: number } {
    const { tx, ty } = worldToIso(wx, wy, ISO_CONFIG.tileWidth, ISO_CONFIG.tileHeight);
    return {
      tx: Phaser.Math.Clamp(Math.floor(tx), 0, this.mapWidth - 1),
      ty: Phaser.Math.Clamp(Math.floor(ty), 0, this.mapHeight - 1),
    };
  }

  private tileToWorld(tx: number, ty: number): PathPoint {
    const p = isoToWorld(tx + 0.5, ty + 0.5, ISO_CONFIG.tileWidth, ISO_CONFIG.tileHeight);
    return { x: p.x, y: p.y };
  }

  private nearestWalkable(tx: number, ty: number): { tx: number; ty: number } | null {
    if (this.isWalkable(tx, ty)) return { tx, ty };
    for (let r = 1; r <= 8; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (this.isWalkable(nx, ny)) return { tx: nx, ty: ny };
        }
      }
    }
    return null;
  }

  private isWalkable(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.mapWidth || ty >= this.mapHeight) return false;
    return this.walkable[ty][tx];
  }

  private findPathTiles(sx: number, sy: number, gx: number, gy: number): { tx: number; ty: number }[] {
    const open: Node[] = [{ tx: sx, ty: sy, g: 0, f: this.heuristic(sx, sy, gx, gy) }];
    const closed = new Set<string>();
    const came = new Map<string, Node>();

    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const cur = open.shift()!;
      const key = `${cur.tx},${cur.ty}`;
      if (cur.tx === gx && cur.ty === gy) {
        const path: { tx: number; ty: number }[] = [];
        let n: Node | undefined = cur;
        while (n) {
          path.unshift({ tx: n.tx, ty: n.ty });
          n = n.parent;
        }
        return path;
      }
      closed.add(key);

      for (const [nx, ny] of this.neighbors(cur.tx, cur.ty)) {
        const nk = `${nx},${ny}`;
        if (closed.has(nk) || !this.isWalkable(nx, ny)) continue;
        const g = cur.g + 1;
        const node: Node = { tx: nx, ty: ny, g, f: g + this.heuristic(nx, ny, gx, gy), parent: cur };
        const existing = open.find((o) => o.tx === nx && o.ty === ny);
        if (!existing || g < existing.g) {
          if (existing) open.splice(open.indexOf(existing), 1);
          open.push(node);
          came.set(nk, node);
        }
      }
    }
    return [{ tx: sx, ty: sy }, { tx: gx, ty: gy }];
  }

  private neighbors(tx: number, ty: number): [number, number][] {
    return [
      [tx + 1, ty],
      [tx - 1, ty],
      [tx, ty + 1],
      [tx, ty - 1],
      [tx + 1, ty - 1],
      [tx - 1, ty + 1],
      [tx + 1, ty + 1],
      [tx - 1, ty - 1],
    ];
  }

  private heuristic(ax: number, ay: number, bx: number, by: number): number {
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  private simplify(path: PathPoint[]): PathPoint[] {
    if (path.length <= 2) return path;
    const out: PathPoint[] = [path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      const a = out[out.length - 1];
      const b = path[i];
      const c = path[i + 1];
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
      if (Math.abs(cross) > 0.5) out.push(b);
    }
    out.push(path[path.length - 1]);
    return out;
  }
}
