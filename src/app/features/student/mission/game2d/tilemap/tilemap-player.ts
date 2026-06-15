import Phaser from 'phaser';

import { PlayerAnimState } from '../../student-hero.assets';

import { PLAYER_SPRITE } from './tilemap.assets';



export function registerPlayerAnimations(scene: Phaser.Scene): void {

  if (scene.anims.exists('player-idle-down')) return;



  for (const dir of PLAYER_SPRITE.dirs) {

    scene.anims.create({

      key: `player-idle-${dir}`,

      frames: PLAYER_SPRITE.idle.map((f) => ({

        key: PLAYER_SPRITE.key,

        frame: frameIndex(dir, f),

      })),

      frameRate: 5,

      repeat: -1,

    });



    scene.anims.create({

      key: `player-walk-${dir}`,

      frames: PLAYER_SPRITE.walk.map((f) => ({

        key: PLAYER_SPRITE.key,

        frame: frameIndex(dir, f),

      })),

      frameRate: 10,

      repeat: -1,

    });



    scene.anims.create({

      key: `player-run-${dir}`,

      frames: PLAYER_SPRITE.walk.map((f) => ({

        key: PLAYER_SPRITE.key,

        frame: frameIndex(dir, f),

      })),

      frameRate: 14,

      repeat: -1,

    });



    scene.anims.create({

      key: `player-interact-${dir}`,

      frames: [{ key: PLAYER_SPRITE.key, frame: frameIndex(dir, PLAYER_SPRITE.interact) }],

      frameRate: 1,

      repeat: 0,

    });

  }

}



function frameIndex(dir: (typeof PLAYER_SPRITE.dirs)[number], local: number): number {

  const di = PLAYER_SPRITE.dirs.indexOf(dir);

  return di * PLAYER_SPRITE.framesPerDir + local;

}



export class TilemapPlayer {

  readonly sprite: Phaser.Physics.Arcade.Sprite;

  readonly shadow: Phaser.GameObjects.Ellipse;

  private direction: (typeof PLAYER_SPRITE.dirs)[number] = 'down';

  private pose: PlayerAnimState = 'idle';



  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly collider: Phaser.Tilemaps.TilemapLayer | Phaser.Physics.Arcade.StaticGroup,
    scale: number,
  ) {

    this.sprite = scene.physics.add.sprite(x, y, PLAYER_SPRITE.key, 0);

    scene.textures.get(PLAYER_SPRITE.key).setFilter(Phaser.Textures.FilterMode.LINEAR);

    this.applyDisplayScale(scale);

    this.sprite.setOrigin(0.5, 0.92);

    this.sprite.setDepth(10000);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    body.enable = true;
    body.setCollideWorldBounds(true);

    this.fitBody();



    scene.physics.add.collider(this.sprite, collider);



    this.shadow = scene.add.ellipse(x, y + 4 * scale, 16 * scale, 5 * scale, 0x0a1420, 0.55);

    this.shadow.setDepth(9999);

    this.playAnim('idle', 'down');

  }



  private fitBody(): void {

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    body.setSize(this.sprite.displayWidth * 0.3, this.sprite.displayHeight * 0.14);

    body.setOffset(

      this.sprite.displayWidth * 0.35,

      this.sprite.displayHeight * 0.88 - this.sprite.displayHeight * 0.14,

    );

  }



  setPosition(x: number, y: number): void {

    this.sprite.setPosition(x, y);

    this.syncShadow();

  }



  applyDisplayScale(scale: number): void {
    const ratio = PLAYER_SPRITE.frameWidth / PLAYER_SPRITE.frameHeight;
    const h = PLAYER_SPRITE.displayHeight * scale;
    this.sprite.setDisplaySize(Math.round(h * ratio), h);
    this.fitBody();
  }

  getDisplayHeight(): number {
    return this.sprite.displayHeight;
  }

  setVelocity(vx: number, vy: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = true;
    this.sprite.setVelocity(vx, vy);
  }



  updateFromInput(

    dirX: number,

    dirY: number,

    sprint: boolean,

    forcedPose?: PlayerAnimState,

    _delta = 16,

  ): void {

    if (forcedPose === 'interact' || forcedPose === 'think' || forcedPose === 'celebrate') {

      const d = this.direction === 'up' ? 'up' : 'down';

      this.pose = forcedPose;

      this.playAnim('interact', d);

      this.syncShadow();

      return;

    }



    const moving = Math.hypot(dirX, dirY) > 0.1;

    if (moving) {

      if (Math.abs(dirY) >= Math.abs(dirX)) this.direction = dirY < 0 ? 'up' : 'down';

      else this.direction = dirX < 0 ? 'left' : 'right';



      this.pose = sprint ? 'run' : 'walk';

      this.playAnim(sprint ? 'run' : 'walk', this.direction);

    } else {

      this.pose = 'idle';

      this.playAnim('idle', this.direction);

    }

    this.syncShadow();

  }



  private playAnim(kind: 'idle' | 'walk' | 'run' | 'interact', dir: (typeof PLAYER_SPRITE.dirs)[number]): void {

    const animDir = dir === 'right' ? 'left' : dir;

    const key = `player-${kind}-${animDir}`;

    if (this.sprite.anims.currentAnim?.key === key) return;

    this.sprite.setFlipX(dir === 'right');

    this.sprite.play(key, true);

  }



  private syncShadow(): void {

    const moving = this.pose === 'walk' || this.pose === 'run';

    this.shadow.setPosition(this.sprite.x, this.sprite.y + 4);

    this.shadow.setScale(moving ? 1.18 : 1, moving ? 0.72 : 1);

    this.shadow.setAlpha(moving ? 0.52 : 0.42);

    this.sprite.setDepth(10000 + this.sprite.y * 0.01);

    this.shadow.setDepth(9999 + this.sprite.y * 0.01);

  }



  playEnterPulse(): void {

    this.scene.tweens.add({

      targets: this.sprite,

      y: this.sprite.y - 4,

      duration: 140,

      yoyo: true,

      ease: 'Quad.easeOut',

    });

  }

}


