import Phaser from 'phaser';
import type { MissionPhaserBridge } from './mission-phaser.bridge';

/** Holograma clínico sobre el edificio activo durante decisión / intro de zona. */
export class MissionDecisionHolo {
  private container: Phaser.GameObjects.Container | null = null;
  private ringOuter: Phaser.GameObjects.Arc | null = null;
  private ringInner: Phaser.GameObjects.Arc | null = null;
  private pillar: Phaser.GameObjects.Graphics | null = null;
  private label: Phaser.GameObjects.Text | null = null;
  private icon: Phaser.GameObjects.Text | null = null;
  private lastZoneKey = '';

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bridge: MissionPhaserBridge,
  ) {}

  create(): void {
    this.container = this.scene.add.container(0, 0).setDepth(5100).setVisible(false);
    this.pillar = this.scene.add.graphics();
    this.ringOuter = this.scene.add.circle(0, 0, 36, 0x4fc3ff, 0).setStrokeStyle(2, 0x4fc3ff, 0.55);
    this.ringInner = this.scene.add.circle(0, 0, 22, 0xf4c542, 0).setStrokeStyle(2, 0xf4c542, 0.75);
    this.icon = this.scene.add
      .text(0, -48, '◈', { fontSize: '28px', color: '#4fc3ff' })
      .setOrigin(0.5);
    this.label = this.scene.add
      .text(0, -72, '', {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#e8f4ff',
        backgroundColor: '#0e0c1e',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5);

    this.container.add([this.pillar, this.ringOuter, this.ringInner, this.icon, this.label]);

    this.scene.tweens.add({
      targets: this.ringOuter,
      scale: { from: 0.9, to: 1.15 },
      alpha: { from: 0.4, to: 0.85 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });
    this.scene.tweens.add({
      targets: this.ringInner,
      angle: 360,
      duration: 4000,
      repeat: -1,
    });
    this.scene.tweens.add({
      targets: this.icon,
      y: '-=6',
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(): void {
    const state = this.bridge.state;
    const world = this.bridge.world;
    const show =
      !state.paused &&
      state.showDecisionHolo &&
      (state.phase === 'decision' || state.phase === 'zone-intro') &&
      !!world;

    if (!show || !this.container) {
      this.container?.setVisible(false);
      return;
    }

    const zone = world!.zones.find((z) => z.active && z.unlocked) ?? world!.zones.find((z) => z.unlocked && !z.complete);
    if (!zone) {
      this.container.setVisible(false);
      return;
    }

    const zoneKey = `${zone.index}-${zone.doorX}-${zone.doorY}`;
    if (zoneKey !== this.lastZoneKey) {
      this.lastZoneKey = zoneKey;
      this.container.setPosition(zone.doorX, zone.doorY - 12);
      this.container.setDepth(5100 + zone.doorY * 0.01);
      this.label?.setText(zone.label);
      this.drawPillar(zone.accent);
    }

    this.container.setVisible(true);
  }

  destroy(): void {
    this.container?.destroy();
  }

  private drawPillar(accent: string): void {
    if (!this.pillar) return;
    const color = Phaser.Display.Color.HexStringToColor(accent);
    this.pillar.clear();
    this.pillar.fillGradientStyle(color.color, color.color, 0x4fc3ff, 0x4fc3ff, 0.35, 0.35, 0.05, 0.05);
    this.pillar.fillRect(-14, -56, 28, 56);
    this.pillar.lineStyle(2, 0x4fc3ff, 0.6);
    this.pillar.strokeRect(-14, -56, 28, 56);
    this.pillar.fillStyle(0xf4c542, 0.25);
    this.pillar.fillEllipse(0, 4, 40, 12);
  }
}
