import Phaser from 'phaser';
import type { PlayerAnimState } from '../../student-hero.assets';
import { ISO_CONFIG } from './iso.config';
import { depthFromY, ISO_DEPTH } from './iso.depth';

const DIRS = ['down', 'up', 'left', 'right'] as const;
const FRAMES_PER_DIR = 7;

export function registerIsoPlayerAnimations(scene: Phaser.Scene, key: string): void {
  if (scene.anims.exists('iso-player-idle-down')) return;
  for (const dir of DIRS) {
    const base = DIRS.indexOf(dir) * FRAMES_PER_DIR;
    scene.anims.create({
      key: `iso-player-idle-${dir}`,
      frames: [0, 1, 2].map((f) => ({ key, frame: base + f })),
      frameRate: 5,
      repeat: -1,
    });
    scene.anims.create({
      key: `iso-player-walk-${dir}`,
      frames: [3, 4, 5, 4].map((f) => ({ key, frame: base + f })),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: `iso-player-run-${dir}`,
      frames: [3, 4, 5, 4, 3].map((f) => ({ key, frame: base + f })),
      frameRate: 14,
      repeat: -1,
    });
    scene.anims.create({
      key: `iso-player-interact-${dir}`,
      frames: [{ key, frame: base + 6 }],
      frameRate: 1,
      repeat: 0,
    });
  }
}

export class IsoPlayer {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private shadow: Phaser.GameObjects.Ellipse;
  private facing: (typeof DIRS)[number] = 'down';

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    collisionLayer: Phaser.Tilemaps.TilemapLayer,
    sheetKey: string,
  ) {
    this.sprite = scene.physics.add.sprite(x, y, sheetKey, 0);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(ISO_DEPTH.player);
    this.sprite.setOrigin(0.5, 0.88);
    this.sprite.setScale(1.05);
    scene.physics.add.collider(this.sprite, collisionLayer);

    this.shadow = scene.add.ellipse(x, y + 6, 26, 9, 0x0a1420, 0.42).setDepth(ISO_DEPTH.playerShadow);

    const tex = scene.textures.get(sheetKey);
    if (tex) tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.syncShadow();
  }

  setVelocity(vx: number, vy: number): void {
    this.sprite.setVelocity(vx, vy);
  }

  updateFromInput(
    dirX: number,
    dirY: number,
    sprint: boolean,
    forcedPose: PlayerAnimState | undefined,
    _delta: number,
  ): void {
    const moving = Math.hypot(dirX, dirY) > 0.05;
    if (moving) this.facing = this.dirFromVector(dirX, dirY);

    let anim: string;
    if (forcedPose && forcedPose !== 'idle' && forcedPose !== 'walk' && forcedPose !== 'run') {
      anim = `iso-player-interact-${this.facing}`;
    } else if (!moving) {
      anim = `iso-player-idle-${this.facing}`;
    } else if (sprint) {
      anim = `iso-player-run-${this.facing}`;
    } else {
      anim = `iso-player-walk-${this.facing}`;
    }

    if (this.sprite.anims.currentAnim?.key !== anim) this.sprite.play(anim, true);
    this.sprite.setDepth(depthFromY(this.sprite.y, ISO_DEPTH.player));
    this.syncShadow();
  }

  playEnterPulse(): void {
    this.scene.tweens.add({ targets: this.sprite, scaleX: 1.12, scaleY: 1.12, duration: 160, yoyo: true });
  }

  private syncShadow(): void {
    this.shadow.setPosition(this.sprite.x, this.sprite.y + 8);
    this.shadow.setDepth(depthFromY(this.sprite.y, ISO_DEPTH.playerShadow));
  }

  private dirFromVector(dx: number, dy: number): (typeof DIRS)[number] {
    if (Math.abs(dx) > Math.abs(dy) * 1.2) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }
}
