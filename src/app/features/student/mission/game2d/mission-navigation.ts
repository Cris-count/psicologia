import Phaser from 'phaser';
import type { CampusPathfinder, PathPoint } from './campus-pathfinding';
import type { MissionPhaserBridge } from './mission-phaser.bridge';
import { CAMPUS_META } from './campus/campus.meta';
import {
  MAP_LABEL_PAD_X,
  MAP_LABEL_PAD_Y,
  MAP_TEXT_RESOLUTION,
  mapObjectiveLabelStyle,
  wrapScenarioTitle,
} from './map-typography';

interface ObjectiveTarget {
  x: number;
  y: number;
  accent: string;
  label: string;
}

export class MissionNavigation {
  private pathShadowGfx: Phaser.GameObjects.Graphics | null = null;
  private pathGfx: Phaser.GameObjects.Graphics | null = null;
  private arrowMarkers: Phaser.GameObjects.Graphics[] = [];
  private objectiveRing: Phaser.GameObjects.Arc | null = null;
  private objectiveBeam: Phaser.GameObjects.Graphics | null = null;
  private objectiveLabel: Phaser.GameObjects.Container | null = null;
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
    this.pathShadowGfx = this.scene.add.graphics().setDepth(4785);
    this.pathGfx = this.scene.add.graphics().setDepth(4800).setBlendMode(Phaser.BlendModes.ADD);
    this.objectiveBeam = this.scene.add.graphics().setDepth(4900);
    this.objectiveRing = this.scene.add
      .circle(0, 0, 30, 0x4fc3ff, 0)
      .setStrokeStyle(4, 0x4fc3ff, 0.85)
      .setDepth(4950);
    this.objectiveLabel = this.createObjectiveLabel();
    this.buildingPin = this.createBuildingPin();

    for (let i = 0; i < 6; i++) {
      const chevron = this.scene.add.graphics().setDepth(4850 + i * 0.01);
      this.arrowMarkers.push(chevron);
    }

    this.createMinimap();
    this.scene.scale.on('resize', this.repositionMinimap, this);
  }

  update(playerX: number, playerY: number, delta: number): void {
    this.pathPhase += delta * 0.0035;
    const target = this.resolveObjective();
    const show = target && !this.bridge.state.paused && this.bridge.state.phase === 'map';

    if (!show || !this.pathGfx) {
      this.pathShadowGfx?.clear();
      this.pathGfx?.clear();
      this.objectiveBeam?.clear();
      this.objectiveRing?.setVisible(false);
      this.objectiveLabel?.setVisible(false);
      this.buildingPin?.setVisible(false);
      this.arrowMarkers.forEach((a) => a.clear());
      return;
    }

    this.drawGuidedPath(playerX, playerY, target);
    this.updateObjectiveMarker(target);
    this.updateMinimap(playerX, playerY, target);
  }

  destroy(): void {
    this.scene.scale.off('resize', this.repositionMinimap, this);
    this.pathShadowGfx?.destroy();
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

  private createObjectiveLabel(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0).setDepth(4960);
    const bg = this.scene.add.graphics();
    const style = mapObjectiveLabelStyle();
    const text = this.scene.add.text(0, 0, '', {
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      fontStyle: 'bold',
      color: style.color,
      stroke: style.stroke,
      strokeThickness: style.strokeThickness,
      align: 'center',
      lineSpacing: 4,
      shadow: { offsetX: 0, offsetY: 2, color: '#000', blur: 5, fill: true },
    }).setOrigin(0.5, 0.5).setResolution(MAP_TEXT_RESOLUTION);
    container.add([bg, text]);
    container.setData('bg', bg);
    container.setData('text', text);
    return container;
  }

  private createBuildingPin(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0).setDepth(4970);
    const glow = this.scene.add.circle(0, 10, 16, 0xf4c542, 0.28);
    const ring = this.scene.add.circle(0, 10, 10, 0x000000, 0);
    ring.setStrokeStyle(2, 0xf4c542, 0.75);
    const pinBody = this.scene.add.triangle(0, 0, 0, -16, -11, 8, 11, 8, 0xf4c542, 1);
    pinBody.setStrokeStyle(2, 0xfff8e8, 0.85);
    container.add([glow, ring, pinBody]);
    this.scene.tweens.add({
      targets: container,
      y: '-=10',
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return container;
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

  private drawChevron(g: Phaser.GameObjects.Graphics, x: number, y: number, angle: number, color: number, alpha: number): void {
    g.clear();
    g.fillStyle(color, alpha);
    g.beginPath();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const pts = [
      { x: 0, y: -8 },
      { x: -6, y: 4 },
      { x: 6, y: 4 },
    ];
    g.moveTo(x + pts[0].x * cos - pts[0].y * sin, y + pts[0].x * sin + pts[0].y * cos);
    g.lineTo(x + pts[1].x * cos - pts[1].y * sin, y + pts[1].x * sin + pts[1].y * cos);
    g.lineTo(x + pts[2].x * cos - pts[2].y * sin, y + pts[2].x * sin + pts[2].y * cos);
    g.closePath();
    g.fillPath();
    g.lineStyle(1.5, 0xffffff, alpha * 0.55);
    g.strokePath();
  }

  private drawGuidedPath(px: number, py: number, target: ObjectiveTarget): void {
    const shadow = this.pathShadowGfx!;
    const g = this.pathGfx!;
    shadow.clear();
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

    const drawSegments = (gfx: Phaser.GameObjects.Graphics, width: number, color: number, alpha: number, offsetY = 0) => {
      gfx.lineStyle(width, color, alpha);
      for (let i = 0; i < path.length - 1; i++) {
        gfx.lineBetween(path[i].x, path[i].y + offsetY, path[i + 1].x, path[i + 1].y + offsetY);
      }
    };

    drawSegments(shadow, 18, 0x0a1420, 0.42, 2);
    drawSegments(shadow, 12, accent.color, 0.18);
    drawSegments(g, 16, accent.color, 0.22);
    drawSegments(g, 8, 0xf4c542, 0.62);
    drawSegments(g, 3, 0xffffff, 0.48);

    const dashOffset = (this.pathPhase * 120) % 24;
    let traveled = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const segLen = segLens[i];
      const dashCount = Math.max(5, Math.floor(segLen / 10));
      for (let d = 0; d < dashCount; d++) {
        const t0 = (d / dashCount + dashOffset / (dashCount * 24)) % 1;
        const t1 = Math.min(1, t0 + 0.42 / dashCount);
        const pulse = 0.5 + 0.5 * Math.sin(this.pathPhase * 4 + (traveled / totalLen + t0) * 14);
        const x0 = a.x + (b.x - a.x) * t0;
        const y0 = a.y + (b.y - a.y) * t0;
        const x1 = a.x + (b.x - a.x) * t1;
        const y1 = a.y + (b.y - a.y) * t1;
        g.lineStyle(6, accent.color, 0.34 * pulse);
        g.lineBetween(x0, y0, x1, y1);
        g.lineStyle(2, 0xffffff, 0.42 * pulse);
        g.lineBetween(x0, y0, x1, y1);
      }
      traveled += segLen;
    }

    this.arrowMarkers.forEach((arrow, i) => {
      const t = ((this.pathPhase * 0.15 + i * 0.14) % 1) * totalLen;
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
          angle = Math.atan2(path[s + 1].y - path[s].y, path[s + 1].x - path[s].x) + Math.PI / 2;
          break;
        }
        acc += seg;
      }
      const visible = t > 10 && t < totalLen - 10;
      if (visible) {
        this.drawChevron(arrow, ax, ay, angle, 0xf4c542, 0.75 + 0.25 * Math.sin(this.pathPhase * 3 + i));
        arrow.setDepth(4850 + ay * 0.01);
      } else {
        arrow.clear();
      }
    });
  }

  private updateObjectiveMarker(target: ObjectiveTarget): void {
    const color = Phaser.Display.Color.HexStringToColor(target.accent);
    this.objectiveRing?.setPosition(target.x, target.y + 8);
    this.objectiveRing?.setStrokeStyle(4, color.color, 0.72 + 0.28 * Math.sin(this.pathPhase * 2));
    this.objectiveRing?.setVisible(true);
    this.objectiveRing?.setDepth(4950 + target.y * 0.01);

    this.objectiveBeam?.clear();
    this.objectiveBeam?.fillStyle(color.color, 0.1);
    this.objectiveBeam?.fillTriangle(target.x, target.y - 88, target.x - 22, target.y, target.x + 22, target.y);
    this.objectiveBeam?.lineStyle(1, color.color, 0.25);
    this.objectiveBeam?.strokeTriangle(target.x, target.y - 88, target.x - 22, target.y, target.x + 22, target.y);
    this.objectiveBeam?.setDepth(4920 + target.y * 0.01);

    const labelText = this.objectiveLabel?.getData('text') as Phaser.GameObjects.Text | undefined;
    const labelBg = this.objectiveLabel?.getData('bg') as Phaser.GameObjects.Graphics | undefined;
    if (labelText && labelBg && this.objectiveLabel) {
      const wrapped = wrapScenarioTitle(target.label);
      const parts = wrapped.split('\n');
      const display = parts.length > 1 ? `▲ ${parts[0]}\n${parts[1]}` : `▲ ${wrapped}`;
      labelText.setText(display);
      labelText.setAlign('center');
      labelText.setOrigin(0.5, 0.5);
      labelText.setPosition(0, 0);

      const w = Math.max(labelText.width + MAP_LABEL_PAD_X * 2, 110);
      const h = Math.max(labelText.height + MAP_LABEL_PAD_Y * 2, 44);

      labelBg.clear();
      labelBg.fillStyle(0x0a1020, 0.94);
      labelBg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      labelBg.lineStyle(2, color.color, 0.8);
      labelBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      labelBg.fillStyle(color.color, 0.16);
      labelBg.fillRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, 5, 5);

      this.objectiveLabel.setPosition(target.x, target.y - 62);
      this.objectiveLabel.setVisible(true);
      this.objectiveLabel.setDepth(4960 + target.y * 0.01);
    }

    this.buildingPin?.setPosition(target.x, target.y - 38);
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

    this.playerDot.setStrokeStyle(2, 0xf4c542, target.x === playerX ? 0 : 0.6);
  }
}
