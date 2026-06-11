import Phaser from 'phaser';
import type { MissionPhaserBridge } from '../mission-phaser.bridge';
import { ISO_CONFIG } from './iso.config';
import { depthFromY, ISO_DEPTH } from './iso.depth';

const SHEET = 'iso-gary-sheet';
const FPS = 5;

export function registerGaryAnimations(scene: Phaser.Scene): void {
  if (scene.anims.exists('gary-idle')) return;
  const f = ISO_CONFIG.garyFramesPerState;
  ISO_CONFIG.garyStates.forEach((state, si) => {
    const base = si * f;
    scene.anims.create({
      key: `gary-${state}`,
      frames: Array.from({ length: f }, (_, i) => ({ key: SHEET, frame: base + i })),
      frameRate: FPS,
      repeat: -1,
    });
  });
}

/** Gary en el mundo — 4 estados animados, burbuja opaca */
export class IsoGaryNpc {
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private shadow: Phaser.GameObjects.Ellipse | null = null;
  private bubble: Phaser.GameObjects.Container | null = null;
  private bubbleText: Phaser.GameObjects.Text | null = null;
  private lastAnim = 'gary-idle';

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bridge: MissionPhaserBridge,
  ) {}

  create(spawnX: number, spawnY: number): void {
    registerGaryAnimations(this.scene);
    this.shadow = this.scene.add
      .ellipse(spawnX, spawnY + 8, 28, 9, 0x0a1420, 0.48)
      .setDepth(depthFromY(spawnY, ISO_DEPTH.gary - 1));
    this.sprite = this.scene.add
      .sprite(spawnX, spawnY, SHEET, 0)
      .setOrigin(0.5, 0.88)
      .setDepth(depthFromY(spawnY, ISO_DEPTH.gary));
    this.sprite.play('gary-idle');

    this.bubble = this.scene.add.container(spawnX - 80, spawnY - 78).setDepth(depthFromY(spawnY, ISO_DEPTH.gary + 10));
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x0e0c1e, 1);
    panel.fillRoundedRect(-100, -6, 200, 50, 10);
    panel.lineStyle(2, 0x4fc3ff, 1);
    panel.strokeRoundedRect(-100, -6, 200, 50, 10);
    this.bubbleText = this.scene.add
      .text(0, 6, '', {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '11px',
        color: '#e8f4ff',
        wordWrap: { width: 180 },
        align: 'center',
      })
      .setOrigin(0.5, 0);
    this.bubble.add([panel, this.bubbleText]);
    this.bubble.setVisible(false);
  }

  update(playerX: number, playerY: number, objectiveX: number, objectiveY: number): void {
    const state = this.bridge.state;
    const show = !state.paused && state.phase === 'map' && state.controlsEnabled && !!state.guideMessage;

    if (!this.sprite || !show) {
      this.sprite?.setVisible(false);
      this.shadow?.setVisible(false);
      this.bubble?.setVisible(false);
      return;
    }

    const dx = objectiveX - playerX;
    const dy = objectiveY - playerY;
    const len = Math.hypot(dx, dy) || 1;
    const lead = Math.min(72, len * 0.32);
    const tx = playerX + (dx / len) * lead - (dy / len) * 28;
    const ty = playerY + (dy / len) * lead + (dx / len) * 14;

    this.sprite.setPosition(tx, ty).setVisible(true);
    this.shadow?.setPosition(tx, ty + 8).setVisible(true);
    const d = depthFromY(ty, ISO_DEPTH.gary);
    this.sprite.setDepth(d);
    this.shadow?.setDepth(d - 1);

    const anim = this.pickAnim(len);
    if (this.lastAnim !== anim) {
      this.sprite.play(anim);
      this.lastAnim = anim;
    }

    const msg = state.guideMessage ?? '';
    this.bubble?.setPosition(tx - 72, ty - 74).setDepth(d + 10).setVisible(msg.length > 0);
    this.bubbleText?.setText(msg);
  }

  private pickAnim(distToGoal: number): string {
    const msg = this.bridge.state.guideMessage?.toLowerCase() ?? '';
    if (msg.includes('¡') || msg.includes('excelente') || msg.includes('bien')) return 'gary-encourage';
    if (distToGoal > 120) return 'gary-point';
    if (msg.length > 60) return 'gary-talk';
    return 'gary-idle';
  }
}
