import Phaser from 'phaser';
import type { IsoDecorDef } from './iso.types';
import { tileCenterWorld } from './iso.math';
import { ISO_DEPTH } from './iso.depth';

/** Iluminación cálida golden-hour + faroles */
export class IsoLighting {
  private readonly lamps: Phaser.GameObjects.Arc[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  create(worldW: number, worldH: number, decor: IsoDecorDef[]): void {
    const sky = this.scene.add.graphics().setDepth(ISO_DEPTH.sky);
    sky.fillGradientStyle(0x7a98c8, 0xa8c0d8, 0xe8c090, 0x88b070, 1, 1, 0.95, 0.9);
    sky.fillRect(-worldW * 0.25, -worldH * 0.25, worldW * 1.5, worldH * 1.5);

    const warmWash = this.scene.add.graphics().setDepth(ISO_DEPTH.lighting + 30).setBlendMode(Phaser.BlendModes.ADD);
    warmWash.fillStyle(0xffd080, 0.06);
    warmWash.fillEllipse(worldW * 0.65, worldH * 0.2, worldW * 0.55, worldH * 0.4);

    const vignette = this.scene.add.graphics().setDepth(ISO_DEPTH.lighting + 50).setBlendMode(Phaser.BlendModes.MULTIPLY);
    vignette.fillStyle(0x2a1830, 0.1);
    vignette.fillRect(0, 0, worldW, worldH);

    for (const d of decor.filter((x) => x.kind === 'lamp')) {
      const p = tileCenterWorld(d.tileX, d.tileY);
      const glow = this.scene.add.circle(p.x, p.y - 32, 58, 0xffc860, 0.14).setDepth(ISO_DEPTH.lighting);
      const core = this.scene.add.circle(p.x, p.y - 34, 18, 0xfff0c0, 0.2).setDepth(ISO_DEPTH.lighting + 1);
      this.lamps.push(glow);
      this.scene.tweens.add({ targets: [glow, core], alpha: 0.28, duration: 1800 + Math.random() * 900, yoyo: true, repeat: -1 });
    }
  }

  dispose(): void {
    for (const l of this.lamps) l.destroy();
    this.lamps.length = 0;
  }
}
