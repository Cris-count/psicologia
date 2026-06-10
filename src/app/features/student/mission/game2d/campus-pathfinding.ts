import Phaser from 'phaser';

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

/** A* sobre grilla del campus — evita tiles de colisión. */
export class CampusPathfinder {
  private readonly walkable: boolean[][];

  constructor(
    private readonly mapWidth: number,
    private readonly mapHeight: number,
    private readonly tileSize: number,
    private readonly displayScale: number,
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

    const tiles = this.findPathTiles(snappedStart.tx, snappedStart.ty, snappedGoal.tx, snappedGoal.ty);
    if (tiles.length < 2) {
      return [
        { x: fromX, y: fromY },
        { x: toX, y: toY },
      ];
    }

    const world = tiles.map((t) => this.tileToWorld(t.tx, t.ty));
    world[0] = { x: fromX, y: fromY };
    world[world.length - 1] = { x: toX, y: toY };
    return this.simplify(world);
  }

  private worldToTile(wx: number, wy: number): { tx: number; ty: number } {
    const ts = this.tileSize * this.displayScale;
    return {
      tx: Phaser.Math.Clamp(Math.floor(wx / ts), 0, this.mapWidth - 1),
      ty: Phaser.Math.Clamp(Math.floor(wy / ts), 0, this.mapHeight - 1),
    };
  }

  private tileToWorld(tx: number, ty: number): PathPoint {
    const ts = this.tileSize * this.displayScale;
    return { x: tx * ts + ts / 2, y: ty * ts + ts / 2 };
  }

  private nearestWalkable(tx: number, ty: number): { tx: number; ty: number } | null {
    if (this.isWalkable(tx, ty)) return { tx, ty };
    for (let r = 1; r <= 6; r++) {
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
    const key = (tx: number, ty: number) => `${tx},${ty}`;
    const open: Node[] = [{ tx: sx, ty: sy, g: 0, f: this.heuristic(sx, sy, gx, gy) }];
    const openSet = new Set([key(sx, sy)]);
    const closed = new Set<string>();
    const records = new Map<string, Node>([[key(sx, sy), open[0]]]);

    while (open.length) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;
      openSet.delete(key(current.tx, current.ty));

      if (current.tx === gx && current.ty === gy) {
        const path: { tx: number; ty: number }[] = [];
        let node: Node | undefined = current;
        while (node) {
          path.unshift({ tx: node.tx, ty: node.ty });
          node = node.parent;
        }
        return path;
      }

      closed.add(key(current.tx, current.ty));

      for (const [dx, dy] of [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ]) {
        const nx = current.tx + dx;
        const ny = current.ty + dy;
        const nk = key(nx, ny);
        if (!this.isWalkable(nx, ny) || closed.has(nk)) continue;

        const g = current.g + 1;
        const existing = records.get(nk);
        if (!existing || g < existing.g) {
          const node: Node = { tx: nx, ty: ny, g, f: g + this.heuristic(nx, ny, gx, gy), parent: current };
          records.set(nk, node);
          if (!openSet.has(nk)) {
            open.push(node);
            openSet.add(nk);
          }
        }
      }
    }

    return [{ tx: sx, ty: sy }, { tx: gx, ty: gy }];
  }

  private heuristic(tx: number, ty: number, gx: number, gy: number): number {
    return Math.abs(tx - gx) + Math.abs(ty - gy);
  }

  private simplify(points: PathPoint[]): PathPoint[] {
    if (points.length <= 2) return points;
    const out: PathPoint[] = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
      const prev = out[out.length - 1];
      const next = points[i + 1];
      const cur = points[i];
      const cross = (cur.x - prev.x) * (next.y - prev.y) - (cur.y - prev.y) * (next.x - prev.x);
      if (Math.abs(cross) > 4) out.push(cur);
    }
    out.push(points[points.length - 1]);
    return out;
  }
}
