import Phaser from 'phaser';
import type { MissionPhaserBridge } from './mission-phaser.bridge';

/** Gary integrado al mundo Phaser — guía visible, opaco, con burbuja de diálogo. */
export class MissionGaryNpc {
  private sprite: Phaser.GameObjects.Image | null = null;
  private shadow: Phaser.GameObjects.Ellipse | null = null;
  private bubble: Phaser.GameObjects.Container | null = null;
  private bubbleText: Phaser.GameObjects.Text | null = null;
  private targetX = 0;
  private targetY = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bridge: MissionPhaserBridge,
  ) {}

  preloadKey(): { key: string; url: string } {
    return { key: 'gary-npc', url: '/assets/guide/nexa-bust-premium-cutout.png' };
  }

  create(spawnX: number, spawnY: number): void {
    this.shadow = this.scene.add
      .ellipse(spawnX, spawnY + 6, 28, 10, 0x0a1420, 0.5)
      .setDepth(9998);
    this.sprite = this.scene.add
      .image(spawnX, spawnY, 'gary-npc')
      .setOrigin(0.5, 1)
      .setScale(0.22)
      .setDepth(10001);
    this.sprite.setAlpha(1);

    this.bubble = this.scene.add.container(spawnX - 90, spawnY - 95).setDepth(10050);
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x0e0c1e, 1);
    panel.fillRoundedRect(-110, -8, 220, 52, 10);
    panel.lineStyle(2, 0x4fc3ff, 0.55);
    panel.strokeRoundedRect(-110, -8, 220, 52, 10);
    this.bubbleText = this.scene.add
      .text(0, 8, '', {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '11px',
        color: '#e8f4ff',
        wordWrap: { width: 200 },
        align: 'center',
      })
      .setOrigin(0.5, 0);
    this.bubble.add([panel, this.bubbleText]);
    this.bubble.setVisible(false);

    this.scene.tweens.add({
      targets: this.sprite,
      y: spawnY - 4,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(playerX: number, playerY: number, objectiveX: number, objectiveY: number): void {
    const state = this.bridge.state;
    const show =
      !state.paused &&
      state.phase === 'map' &&
      state.controlsEnabled &&
      !!state.guideMessage;

    if (!this.sprite || !show) {
      this.sprite?.setVisible(false);
      this.shadow?.setVisible(false);
      this.bubble?.setVisible(false);
      return;
    }

    const dx = objectiveX - playerX;
    const dy = objectiveY - playerY;
    const len = Math.hypot(dx, dy) || 1;
    const lead = Math.min(72, len * 0.35);
    this.targetX = playerX + (dx / len) * lead - (dy / len) * 28;
    this.targetY = playerY + (dy / len) * lead + (dx / len) * 28;

    const lerp = 0.08;
    this.sprite.x += (this.targetX - this.sprite.x) * lerp;
    this.sprite.y += (this.targetY - this.sprite.y) * lerp;
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1);
    this.sprite.setDepth(10000 + this.sprite.y * 0.01);

    this.shadow?.setPosition(this.sprite.x, this.sprite.y + 4);
    this.shadow?.setDepth(9999 + this.sprite.y * 0.01);
    this.shadow?.setVisible(true);

    const msg = state.guideMessage ?? '';
    if (msg && this.bubble && this.bubbleText) {
      this.bubbleText.setText(msg.length > 90 ? `${msg.slice(0, 87)}…` : msg);
      this.bubble.setPosition(this.sprite.x - 20, this.sprite.y - 88);
      this.bubble.setDepth(10050 + this.sprite.y * 0.01);
      this.bubble.setVisible(true);
    } else {
      this.bubble?.setVisible(false);
    }
  }

  destroy(): void {
    this.sprite?.destroy();
    this.shadow?.destroy();
    this.bubble?.destroy();
  }
}
