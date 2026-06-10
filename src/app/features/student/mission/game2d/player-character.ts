import Phaser from 'phaser';
import { PLAYER_PIXEL, PlayerAnimState, PlayerDirection } from '../student-hero.assets';

export const PLAYER_DISPLAY_HEIGHT = 40;

const IDLE_MS = 380;
const WALK_MS = 130;
const RUN_MS = 85;

export function registerPlayerAssets(scene: Phaser.Scene): void {
  if (scene.textures.exists('player-pixel')) return;
  scene.load.spritesheet('player-pixel', PLAYER_PIXEL.url, {
    frameWidth: PLAYER_PIXEL.frameWidth,
    frameHeight: PLAYER_PIXEL.frameHeight,
  });
}

function dirIndex(dir: PlayerDirection): number {
  return PLAYER_PIXEL.dirs.indexOf(dir);
}

function frameFor(dir: PlayerDirection, localFrame: number): number {
  return dirIndex(dir) * PLAYER_PIXEL.framesPerDir + localFrame;
}

export class PlayerCharacter {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly shadow: Phaser.GameObjects.Ellipse;
  private direction: PlayerDirection = 'down';
  private idleIndex = 0;
  private walkIndex = 0;
  private animTimer = 0;
  private currentPose: PlayerAnimState = 'idle';
  private breatheTween: Phaser.Tweens.Tween | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly walls: Phaser.Physics.Arcade.StaticGroup,
  ) {
    this.sprite = scene.physics.add.sprite(x, y, 'player-pixel', 0);
    scene.textures.get('player-pixel').setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.applyDisplayMetrics(1);
    this.sprite.setOrigin(0.5, 0.92);
    this.sprite.setCollideWorldBounds(true);
    this.fitPhysicsBody();
    scene.physics.add.collider(this.sprite, walls);

    this.shadow = scene.add.ellipse(x, y + 2, 16, 5, 0x0a1420, 0.42);
    this.showFrame('down', PLAYER_PIXEL.idleFrames[0]);
    this.startIdleBreathing();
  }

  private applyDisplayMetrics(runBoost = 1): void {
    const ratio = PLAYER_PIXEL.frameWidth / PLAYER_PIXEL.frameHeight;
    const h = Math.round(PLAYER_DISPLAY_HEIGHT * runBoost);
    this.sprite.setDisplaySize(Math.round(h * ratio), h);
    this.fitPhysicsBody();
  }

  private fitPhysicsBody(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(10, 6);
    const dw = this.sprite.displayWidth;
    const dh = this.sprite.displayHeight;
    body.setOffset(dw / 2 - 5, dh * 0.92 - 6);
  }

  private showFrame(dir: PlayerDirection, localFrame: number): void {
    if (dir === 'right') {
      this.sprite.setFlipX(true);
      this.sprite.setFrame(frameFor('left', localFrame));
    } else {
      this.sprite.setFlipX(false);
      this.sprite.setFrame(frameFor(dir, localFrame));
    }
  }

  private startIdleBreathing(): void {
    this.breatheTween?.remove();
    this.breatheTween = this.scene.tweens.add({
      targets: this.sprite,
      scaleY: this.sprite.scaleY * 1.03,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopBreathing(): void {
    this.breatheTween?.remove();
    this.breatheTween = null;
    this.sprite.setScale(this.sprite.scaleX, Math.abs(this.sprite.scaleX));
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.syncVisuals();
  }

  setVelocity(vx: number, vy: number): void {
    this.sprite.setVelocity(vx, vy);
  }

  updateFromInput(
    dirX: number,
    dirY: number,
    sprint: boolean,
    forcedPose?: PlayerAnimState,
    delta = 16,
  ): void {
    if (forcedPose === 'interact' || forcedPose === 'think' || forcedPose === 'celebrate') {
      this.stopBreathing();
      this.currentPose = forcedPose;
      const d = this.direction === 'up' ? 'up' : 'down';
      this.showFrame(d === 'up' ? 'up' : 'down', PLAYER_PIXEL.interactFrame);
      this.syncVisuals();
      return;
    }

    const moving = Math.hypot(dirX, dirY) > 0.1;
    this.animTimer += delta;

    if (moving) {
      this.stopBreathing();
      if (Math.abs(dirY) >= Math.abs(dirX)) {
        this.direction = dirY < 0 ? 'up' : 'down';
      } else {
        this.direction = dirX < 0 ? 'left' : 'right';
      }
      const interval = sprint ? RUN_MS : WALK_MS;
      if (this.animTimer >= interval) {
        this.animTimer = 0;
        this.walkIndex = (this.walkIndex + 1) % PLAYER_PIXEL.walkFrames.length;
      }
      this.showFrame(this.direction, PLAYER_PIXEL.walkFrames[this.walkIndex]);
      this.currentPose = sprint ? 'run' : 'walk';
      this.applyDisplayMetrics(sprint ? 1.06 : 1);
    } else {
      if (!this.breatheTween) this.startIdleBreathing();
      this.applyDisplayMetrics(1);
      if (this.animTimer >= IDLE_MS) {
        this.animTimer = 0;
        this.idleIndex = (this.idleIndex + 1) % PLAYER_PIXEL.idleFrames.length;
      }
      this.showFrame(this.direction, PLAYER_PIXEL.idleFrames[this.idleIndex]);
      this.currentPose = 'idle';
    }
    this.syncVisuals();
  }

  private syncVisuals(): void {
    const footY = this.sprite.y;
    const moving = this.currentPose === 'walk' || this.currentPose === 'run';
    this.shadow.setPosition(this.sprite.x, footY + 2);
    this.shadow.setScale(moving ? 1.1 : 1, moving ? 0.78 : 1);
    this.shadow.setAlpha(moving ? 0.48 : 0.38);
    const d = 100 + footY;
    this.sprite.setDepth(d);
    this.shadow.setDepth(d - 1);
  }

  playEnterPulse(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 2,
      duration: 120,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }
}
