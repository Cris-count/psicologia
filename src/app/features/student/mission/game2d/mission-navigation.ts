import Phaser from 'phaser';
import type { CampusPathfinder, PathPoint } from './campus-pathfinding';
import type { MissionPhaserBridge } from './mission-phaser.bridge';
import { CAMPUS_META } from './campus/campus.meta';

interface ObjectiveTarget {
  x: number;
  y: number;
  accent: string;
  label: string;
}

export class MissionNavigation {
  private pathGfx: Phaser.GameObjects.Graphics | null = null;
  private arrowMarkers: Phaser.GameObjects.Triangle[] = [];
  private objectiveRing: Phaser.GameObjects.Arc | null = null;
  private objectiveBeam: Phaser.GameObjects.Graphics | null = null;
  private objectiveLabel: Phaser.GameObjects.Text | null = null;
  private buildingPin: Phaser.GameObjects.Container | null = null;
  private minimap: Phaser.GameObjects.Container | null = null;
  private minimapDots: Phaser.GameObjects.Arc[] = [];
  private playerDot: Phaser.GameObjects.Arc | null = null;
  private pathPhase = 0;
  private cachedPath: PathPoint[] = [];
  private pathCacheKey = '';
  private readonly worldW: number;
  private readonly worldH: number;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bridge: MissionPhaserBridge,
    private readonly mapScale: number,
    private readonly pathfinder: CampusPathfinder | null = null,
  ) {
    this.worldW = CAMPUS_META.width * CAMPUS_META.tileSize * mapScale;
    this.worldH = CAMPUS_META.height * CAMPUS_META.tileSize * mapScale;
  }

  create(): void {
    this.pathGfx = this.scene.add.graphics().setDepth(4800).setBlendMode(Phaser.BlendModes.ADD);
    this.objectiveBeam = this.scene.add.graphics().setDepth(4900);
    this.objectiveRing = this.scene.add
      .circle(0, 0, 28, 0x4fc3ff, 0)
      .setStrokeStyle(3, 0x4fc3ff, 0.85)
      .setDepth(4950);
    this.objectiveLabel = this.scene.add
      .text(0, 0, '', {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f4c542',
        stroke: '#0a1420',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(4960);

    this.buildingPin = this.scene.add.container(0, 0).setDepth(4970);
    const pinBody = this.scene.add.triangle(0, 0, 0, -14, -10, 6, 10, 6, 0xf4c542, 1);
    const pinGlow = this.scene.add.circle(0, 8, 12, 0xf4c542, 0.35);
    this.buildingPin.add([pinGlow, pinBody]);
    this.scene.tweens.add({
      targets: this.buildingPin,
      y: '-=8',
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    for (let i = 0; i < 5; i++) {
      const tri = this.scene.add.triangle(0, 0, 0, -6, -5, 4, 5, 4, 0x4fc3ff, 0.9).setDepth(4850);
      this.arrowMarkers.push(tri);
      this.scene.tweens.add({
        targets: tri,
        alpha: { from: 0.35, to: 0.95 },
        duration: 600 + i * 80,
        yoyo: true,
        repeat: -1,
      });
    }

    this.createMinimap();
    this.scene.scale.on('resize', this.repositionMinimap, this);
  }

  update(playerX: number, playerY: number, delta: number): void {
    this.pathPhase += delta * 0.004;
    const target = this.resolveObjective();
    const show = target && !this.bridge.state.paused && this.bridge.state.phase === 'map';

    if (!show || !this.pathGfx) {
      this.pathGfx?.clear();
      this.objectiveBeam?.clear();
      this.objectiveRing?.setVisible(false);
      this.objectiveLabel?.setVisible(false);
      this.buildingPin?.setVisible(false);
      this.arrowMarkers.forEach((a) => a.setVisible(false));
      return;
    }

    this.drawGuidedPath(playerX, playerY, target);
    this.updateObjectiveMarker(target);
    this.updateMinimap(playerX, playerY, target);
  }

  destroy(): void {
    this.scene.scale.off('resize', this.repositionMinimap, this);
    this.pathGfx?.destroy();
    this.objectiveBeam?.destroy();
    this.objectiveRing?.destroy();
    this.objectiveLabel?.destroy();
    this.buildingPin?.destroy();
    this.arrowMarkers.forEach((a) => a.destroy());
    this.minimap?.destroy();
  }

  getObjectivePosition(): { x: number; y: number } | null {
    const t = this.resolveObjective();
    return t ? { x: t.x, y: t.y } : null;
  }

  private resolveObjective(): ObjectiveTarget | null {
    const world = this.bridge.world;
    if (!world?.zones.length) return null;
    const zone =
      world.zones.find((z) => z.unlocked && !z.complete && z.active) ??
      world.zones.find((z) => z.unlocked && !z.complete);
    if (!zone) return null;
    return { x: zone.doorX, y: zone.doorY, accent: zone.accent, label: zone.label };
  }

  private resolvePath(px: number, py: number, target: ObjectiveTarget): PathPoint[] {
    const key = `${Math.round(px)}-${Math.round(py)}-${target.x}-${target.y}`;
    if (key === this.pathCacheKey && this.cachedPath.length) return this.cachedPath;
    this.pathCacheKey = key;
    this.cachedPath = this.pathfinder?.findPathWorld(px, py, target.x, target.y) ?? [
      { x: px, y: py },
      { x: target.x, y: target.y },
    ];
    return this.cachedPath;
  }

  private drawGuidedPath(px: number, py: number, target: ObjectiveTarget): void {
    const g = this.pathGfx!;
    g.clear();
    const path = this.resolvePath(px, py, target);
    if (path.length < 2) return;

    const accent = Phaser.Display.Color.HexStringToColor(target.accent);
    let totalLen = 0;
    const segLens: number[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const len = Phaser.Math.Distance.Between(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
      segLens.push(len);
      totalLen += len;
    }
    if (totalLen < 20) return;

    // Ruta base sólida (sendero iluminado)
    g.lineStyle(14, accent.color, 0.22);
    for (let i = 0; i < path.length - 1; i++) {
      g.lineBetween(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
    }
    g.lineStyle(6, 0xf4c542, 0.55);
    for (let i = 0; i < path.length - 1; i++) {
      g.lineBetween(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
    }

    let traveled = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const segLen = segLens[i];
      const dashCount = Math.max(4, Math.floor(segLen / 12));
      for (let d = 0; d < dashCount; d++) {
        const t0 = d / dashCount;
        const t1 = Math.min(1, t0 + 0.55 / dashCount);
        const pulse = 0.45 + 0.55 * Math.sin(this.pathPhase * 3 + (traveled / totalLen + t0) * 12);
        const x0 = a.x + (b.x - a.x) * t0;
        const y0 = a.y + (b.y - a.y) * t0;
        const x1 = a.x + (b.x - a.x) * t1;
        const y1 = a.y + (b.y - a.y) * t1;
        g.lineStyle(10, accent.color, 0.28 * pulse);
        g.lineBetween(x0, y0, x1, y1);
        g.lineStyle(4, 0xffffff, 0.35 * pulse);
        g.lineBetween(x0, y0, x1, y1);
      }
      traveled += segLen;
    }

    this.arrowMarkers.forEach((arrow, i) => {
      const t = ((this.pathPhase * 0.12 + i * 0.17) % 1) * totalLen;
      let acc = 0;
      let ax = path[0].x;
      let ay = path[0].y;
      let angle = 0;
      for (let s = 0; s < path.length - 1; s++) {
        const seg = segLens[s];
        if (acc + seg >= t) {
          const local = (t - acc) / seg;
          ax = path[s].x + (path[s + 1].x - path[s].x) * local;
          ay = path[s].y + (path[s + 1].y - path[s].y) * local;
          angle = Math.atan2(path[s + 1].y - path[s].y, path[s + 1].x - path[s].x);
          break;
        }
        acc += seg;
      }
      arrow.setPosition(ax, ay);
      arrow.setRotation(angle + Math.PI / 2);
      arrow.setVisible(t > 8 && t < totalLen - 8);
      arrow.setDepth(4850 + ay * 0.01);
    });
  }

  private updateObjectiveMarker(target: ObjectiveTarget): void {
    const color = Phaser.Display.Color.HexStringToColor(target.accent);
    this.objectiveRing?.setPosition(target.x, target.y + 6);
    this.objectiveRing?.setStrokeStyle(3, color.color, 0.7 + 0.3 * Math.sin(this.pathPhase * 2));
    this.objectiveRing?.setVisible(true);
    this.objectiveRing?.setDepth(4950 + target.y * 0.01);

    this.objectiveBeam?.clear();
    this.objectiveBeam?.fillStyle(color.color, 0.08);
    this.objectiveBeam?.fillTriangle(target.x, target.y - 80, target.x - 18, target.y, target.x + 18, target.y);
    this.objectiveBeam?.setDepth(4920 + target.y * 0.01);

    this.objectiveLabel?.setText(`▲ ${target.label}`);
    this.objectiveLabel?.setPosition(target.x, target.y - 52);
    this.objectiveLabel?.setVisible(true);
    this.objectiveLabel?.setDepth(4960 + target.y * 0.01);

    this.buildingPin?.setPosition(target.x, target.y - 36);
    this.buildingPin?.setVisible(true);
    this.buildingPin?.setDepth(4970 + target.y * 0.01);
  }

  private createMinimap(): void {
    const cam = this.scene.cameras.main;
    const size = 96;
    const margin = 14;
    const cx = margin + size / 2;
    const cy = cam.height - margin - size / 2;

    this.minimap = this.scene.add.container(cx, cy).setScrollFactor(0).setDepth(26000);

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x0a1420, 0.96);
    panel.fillRoundedRect(-size / 2, -size / 2, size, size, 10);
    panel.lineStyle(2, 0x4fc3ff, 0.75);
    panel.strokeRoundedRect(-size / 2, -size / 2, size, size, 10);
    panel.lineStyle(1, 0xf4c542, 0.35);
    panel.strokeCircle(0, 0, size / 2 - 6);

    const title = this.scene.add
      .text(0, -size / 2 + 10, 'MAPA', {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '8px',
        color: '#4fc3ff',
      })
      .setOrigin(0.5);

    this.playerDot = this.scene.add.circle(0, 0, 3, 0x52c9a8, 1);
    this.minimap.add([panel, title, this.playerDot]);

    for (const zone of CAMPUS_META.zones) {
      const dot = this.scene.add.circle(0, 0, 2.5, 0x4fc3ff, 0.5);
      this.minimapDots.push(dot);
      this.minimap.add(dot);
    }

    this.repositionMinimap();
  }

  private repositionMinimap = (): void => {
    if (!this.minimap) return;
    const cam = this.scene.cameras.main;
    const size = 96;
    const margin = 14;
    this.minimap.setPosition(margin + size / 2, cam.height - margin - size / 2);
  };

  private updateMinimap(playerX: number, playerY: number, target: ObjectiveTarget): void {
    if (!this.minimap || !this.playerDot) return;
    const size = 72;
    const scale = size / Math.max(this.worldW, this.worldH);

    const toLocal = (wx: number, wy: number) => ({
      x: (wx / this.worldW - 0.5) * size,
      y: (wy / this.worldH - 0.5) * size,
    });

    const p = toLocal(playerX, playerY);
    this.playerDot.setPosition(p.x, p.y);

    const world = this.bridge.world;
    CAMPUS_META.zones.forEach((z, i) => {
      const dot = this.minimapDots[i];
      if (!dot) return;
      const pos = toLocal(z.doorX, z.doorY);
      dot.setPosition(pos.x, pos.y);
      const wz = world?.zones.find((w) => w.index === z.zoneIndex);
      if (wz?.complete) dot.setFillStyle(0x52c9a8, 1);
      else if (wz?.active) dot.setFillStyle(0xf4c542, 1);
      else if (wz?.unlocked) dot.setFillStyle(0x4fc3ff, 0.85);
      else dot.setFillStyle(0x556677, 0.4);
    });

    const t = toLocal(target.x, target.y);
    this.playerDot.setStrokeStyle(2, 0xf4c542, target.x === playerX ? 0 : 0.6);
  }
}
