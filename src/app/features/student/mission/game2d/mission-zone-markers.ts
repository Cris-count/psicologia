import Phaser from 'phaser';
import type { MissionPhaserBridge } from './mission-phaser.bridge';

/** Marcadores de estado en cada edificio (bloqueado, completado, activo). */
export class MissionZoneMarkers {
  private readonly markers = new Map<number, Phaser.GameObjects.Container>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bridge: MissionPhaserBridge,
  ) {}

  create(): void {
    const world = this.bridge.world;
    if (!world) return;

    for (const zone of world.zones) {
      const c = this.scene.add.container(zone.doorX, zone.doorY - 40).setDepth(4700 + zone.doorY * 0.01);
      const badge = this.scene.add.circle(0, 0, 10, 0x0e0c1e, 1).setStrokeStyle(2, 0x4fc3ff, 0.5);
      const glyph = this.scene.add
        .text(0, 0, '•', { fontSize: '14px', color: '#4fc3ff' })
        .setOrigin(0.5);
      c.add([badge, glyph]);
      c.setVisible(false);
      this.markers.set(zone.index, c);
    }
  }

  update(): void {
    const world = this.bridge.world;
    if (!world) return;

    for (const zone of world.zones) {
      const c = this.markers.get(zone.index);
      if (!c) continue;

      if (zone.complete) {
        c.setVisible(true);
        c.setAlpha(1);
        const glyph = c.getAt(1) as Phaser.GameObjects.Text;
        const badge = c.getAt(0) as Phaser.GameObjects.Arc;
        glyph.setText('✓');
        glyph.setColor('#52c9a8');
        badge.setStrokeStyle(2, 0x52c9a8, 0.9);
      } else if (!zone.unlocked) {
        c.setVisible(true);
        c.setAlpha(0.65);
        const glyph = c.getAt(1) as Phaser.GameObjects.Text;
        const badge = c.getAt(0) as Phaser.GameObjects.Arc;
        glyph.setText('×');
        glyph.setColor('#8899aa');
        glyph.setFontSize('16px');
        badge.setStrokeStyle(2, 0x556677, 0.6);
      } else {
        const next = world.zones.find((z) => z.unlocked && !z.complete);
        const isTarget = next?.index === zone.index && this.bridge.state.phase === 'map';
        if (isTarget) {
          c.setVisible(true);
          c.setAlpha(1);
          const glyph = c.getAt(1) as Phaser.GameObjects.Text;
          const badge = c.getAt(0) as Phaser.GameObjects.GameObject & { setStrokeStyle: (w: number, c: number, a: number) => void };
          glyph.setText('★');
          glyph.setColor('#f4c542');
          badge.setStrokeStyle(2, 0xf4c542, 0.9);
        } else {
          c.setVisible(false);
        }
      }
    }
  }

  destroy(): void {
    this.markers.forEach((m) => m.destroy());
    this.markers.clear();
  }
}
