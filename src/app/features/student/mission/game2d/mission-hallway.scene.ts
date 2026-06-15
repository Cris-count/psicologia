import Phaser from 'phaser';
import type { BuildingType } from './map.types';
import { applyPlayAreaBounds, buildCompactRoom } from './hallway-compact-room';
import {
  createDoorVisual,
  repositionDoorVisual,
  setDoorActive,
  updateDoorOptionText,
  type HallwayDoorVisual,
} from './hallway-doors';
import { HallwayInputController } from './hallway-input';
import { computeHallwayLayout, type HallwayLayout } from './hallway-layout';
import {
  HALLWAY_PLAYER,
  HALLWAY_RUN,
  HALLWAY_WALK,
  interiorForBuilding,
  type InteriorMapConfig,
} from './interior.assets';
import { MAP_FONT_PLACE, MAP_FONT_TITLE, MAP_TEXT_RESOLUTION } from './map-typography';
import { registerPlayerAnimations, TilemapPlayer } from './tilemap/tilemap-player';

export interface HallwayDoorOption {
  id: string;
  label: string;
  text: string;
}

export interface HallwayBridge {
  accent: string;
  statement: string;
  doors: HallwayDoorOption[];
  buildingType: BuildingType;
  buildingLabel: string;
  questionIndex: number;
  questionTotal: number;
  contentRevision: number;
  input: { forward: boolean; backward: boolean; left: boolean; right: boolean; interact: boolean; sprint: boolean };
  onSelect?: (optionId: string) => void;
}

const REGISTRY_KEY = 'hallwayBridge';
const DOOR_COUNT = 4;

export class MissionHallwayScene extends Phaser.Scene {
  private bridge!: HallwayBridge;
  private interior!: InteriorMapConfig;
  private layout!: HallwayLayout;
  private hero: TilemapPlayer | null = null;
  private doorVisuals: HallwayDoorVisual[] = [];
  private decor: Phaser.GameObjects.GameObject[] = [];
  private nearDoor = -1;
  private interactHeld = false;
  private hud!: Phaser.GameObjects.Container;
  private hudProgress!: Phaser.GameObjects.Text;
  private hudLocation!: Phaser.GameObjects.Text;
  private hudControls!: Phaser.GameObjects.Text;
  private selecting = false;
  private lastContentRevision = -1;
  private readonly inputCtrl = new HallwayInputController();

  constructor() {
    super({ key: 'MissionHallway' });
  }

  init(): void {
    this.bridge = this.game.registry.get(REGISTRY_KEY) as HallwayBridge;
    this.interior = interiorForBuilding(this.bridge.buildingType);
  }

  preload(): void {
    this.load.image(this.interior.tilesetKey, this.interior.tilesetUrl);
    this.load.spritesheet(HALLWAY_PLAYER.key, HALLWAY_PLAYER.url, {
      frameWidth: HALLWAY_PLAYER.frameWidth,
      frameHeight: HALLWAY_PLAYER.frameHeight,
    });
  }

  private getActiveDoorCount(): number {
    return Math.min(DOOR_COUNT, Math.max(1, this.bridge.doors.length));
  }

  private recomputeLayout(): void {
    this.layout = computeHallwayLayout(this.scale.width, this.scale.height, this.getActiveDoorCount());
  }

  create(): void {
    this.selecting = false;
    registerPlayerAnimations(this);
    this.textures.get(HALLWAY_PLAYER.key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.physics.resume();

    this.recomputeLayout();
    this.inputCtrl.bind(this);
    this.bindFocusAndResize();
    this.buildPlayfield();
    this.buildDoorsCompact();
    this.spawnPlayer();
    this.buildHud();
    this.applyFixedCamera();
    this.refreshScenario();
  }

  private bindFocusAndResize(): void {
    const canvas = this.game.canvas;
    if (canvas) {
      canvas.setAttribute('tabindex', '0');
      this.input.on('pointerdown', () => canvas.focus());
    }
    this.scale.on('resize', (size: Phaser.Structs.Size) => this.onViewResize(size.width, size.height));
  }

  private onViewResize(w: number, h: number): void {
    if (!this.scene.isActive()) return;
    this.recomputeLayout();
    this.buildPlayfield();
    applyPlayAreaBounds(this, this.layout);
    this.buildDoorsCompact();
    this.respawnPlayer();
    this.applyFixedCamera();
    this.updateHud();
    this.refreshScenario();
  }

  private respawnPlayer(): void {
    if (this.hero) {
      this.hero.sprite.destroy();
      this.hero.shadow.destroy();
      this.hero = null;
    }
    this.spawnPlayer();
  }

  refreshDoors(): void {
    if (!this.scene.isActive()) return;
    this.refreshScenario();
  }

  refreshScenario(): void {
    this.selecting = false;
    this.nearDoor = -1;
    this.interactHeld = false;

    const prevCount = this.layout?.activeDoorCount ?? 0;
    this.recomputeLayout();
    if (prevCount !== this.layout.activeDoorCount) {
      this.buildPlayfield();
      applyPlayAreaBounds(this, this.layout);
      this.buildDoorsCompact();
    }

    const doors = this.bridge.doors.slice(0, DOOR_COUNT);
    this.doorVisuals.forEach((dv, i) => {
      const opt = doors[i];
      const pos = this.layout.doorPositions[i];
      if (!pos || !opt) {
        dv.root.setVisible(false);
        dv.zone.setActive(false);
        setDoorActive(dv, false);
        return;
      }

      repositionDoorVisual(dv, pos.x, pos.y, this.layout);
      updateDoorOptionText(dv, opt.text);
      dv.root.setVisible(true);
      dv.zone.setActive(true);
      setDoorActive(dv, false);
    });

    if (this.hero) {
      const teleport = this.bridge.contentRevision !== this.lastContentRevision;
      this.lastContentRevision = this.bridge.contentRevision;
      if (teleport) {
        this.hero.setPosition(this.layout.spawnX, this.layout.spawnY);
        this.hero.applyDisplayScale(this.layout.playerScale);
        this.hero.setVelocity(0, 0);
        this.hero.updateFromInput(0, 0, false, 'idle');
      }
    }
    this.updateHud();
  }

  private buildPlayfield(): void {
    this.decor.forEach((d) => d.destroy());
    this.decor = buildCompactRoom(this, this.interior, this.layout);
    applyPlayAreaBounds(this, this.layout);
  }

  private buildDoorsCompact(): void {
    this.doorVisuals.forEach((d) => {
      d.root.destroy();
      d.zone.destroy();
    });
    this.doorVisuals = [];

    for (let i = 0; i < DOOR_COUNT; i++) {
      const pos = this.layout.doorPositions[i] ?? { x: -9999, y: this.layout.floorLineY };
      const door = this.bridge.doors[i];
      const label = door?.label ?? String.fromCharCode(65 + i);
      const visual = createDoorVisual(
        this,
        pos.x,
        pos.y,
        label,
        door?.text ?? '—',
        door?.id ?? `door-${i}`,
        this.layout,
      );
      this.doorVisuals.push(visual);
    }
  }

  private spawnPlayer(): void {
    if (this.hero) {
      this.hero.sprite.destroy();
      this.hero.shadow.destroy();
      this.hero = null;
    }

    const noCollider = this.physics.add.staticGroup();
    this.hero = new TilemapPlayer(
      this,
      this.layout.spawnX,
      this.layout.spawnY,
      noCollider,
      this.layout.playerScale,
    );
    this.hero.applyDisplayScale(this.layout.playerScale);
    this.hero.sprite.setDepth(10000);
    this.hero.sprite.play('player-idle-down', true);

    const body = this.hero.sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(HALLWAY_RUN, HALLWAY_RUN);
  }

  private applyFixedCamera(): void {
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.setBounds(0, 0, this.layout.worldW, this.layout.worldH);
    cam.setScroll(0, 0);
    cam.setZoom(1);
  }

  private buildHud(): void {
    if (this.hud) this.hud.destroy();

    this.hud = this.add.container(0, 0).setScrollFactor(0).setDepth(20000);
    const w = this.scale.width;

    const bar = this.add.graphics();
    bar.fillStyle(0x0a0e18, 0.94);
    bar.fillRoundedRect(10, 8, w - 20, 40, 8);

    this.hudLocation = this.add.text(22, 18, '', {
      fontFamily: MAP_FONT_TITLE,
      fontSize: '12px',
      color: '#8ec8ff',
      resolution: MAP_TEXT_RESOLUTION,
    });

    this.hudProgress = this.add.text(w - 22, 18, '', {
      fontFamily: MAP_FONT_TITLE,
      fontSize: '13px',
      color: '#f8fafc',
      resolution: MAP_TEXT_RESOLUTION,
    }).setOrigin(1, 0);

    this.hudControls = this.add.text(w / 2, this.scale.height - 16, 'WASD / Flechas mover  ·  E entrar', {
      fontFamily: MAP_FONT_PLACE,
      fontSize: '13px',
      color: '#c8d8f0',
      resolution: MAP_TEXT_RESOLUTION,
    }).setOrigin(0.5, 1);

    this.hud.add([bar, this.hudLocation, this.hudProgress, this.hudControls]);
  }

  private updateHud(): void {
    const w = this.scale.width;
    this.hudLocation.setText(`Escenario · ${this.bridge.buildingLabel || this.interior.label}`);
    this.hudProgress.setText(`Pregunta ${this.bridge.questionIndex} / ${this.bridge.questionTotal}`);
    this.hudProgress.setX(w - 22);
    this.hudControls.setPosition(w / 2, this.scale.height - 16);
  }

  override update(_time: number, delta: number): void {
    if (!this.hero || this.selecting) return;

    const input = this.inputCtrl.read(this.bridge.input);

    let dirX = 0;
    let dirY = 0;
    if (input.left) dirX -= 1;
    if (input.right) dirX += 1;
    if (input.forward) dirY -= 1;
    if (input.backward) dirY += 1;

    const len = Math.hypot(dirX, dirY);
    const sprint = input.sprint && len > 0;
    const speed = sprint ? HALLWAY_RUN : HALLWAY_WALK;

    if (len > 0) {
      const vx = (dirX / len) * speed;
      const vy = (dirY / len) * speed;
      this.hero.setVelocity(vx, vy);
      this.hero.updateFromInput(dirX / len, dirY / len, sprint, undefined, delta);
    } else {
      this.hero.setVelocity(0, 0);
      this.hero.updateFromInput(0, 0, false, undefined, delta);
    }

    this.updateDoorProximity();

    const pressed = input.interact && !this.interactHeld;
    this.interactHeld = input.interact;
    if (pressed && this.nearDoor >= 0) {
      this.confirmDoor(this.nearDoor);
    }
  }

  private updateDoorProximity(): void {
    if (!this.hero) return;
    let nearest = -1;
    let minDist = this.layout.interactRadius;

    this.doorVisuals.forEach((dv, i) => {
      if (!dv.root.visible) return;
      const dist = Phaser.Math.Distance.Between(
        this.hero!.sprite.x,
        this.hero!.sprite.y,
        dv.root.x,
        dv.root.y - dv.doorH * 0.5,
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });

    if (nearest !== this.nearDoor) {
      if (this.nearDoor >= 0) setDoorActive(this.doorVisuals[this.nearDoor], false);
      this.nearDoor = nearest;
    }
    if (nearest >= 0) setDoorActive(this.doorVisuals[nearest], true);
  }

  private confirmDoor(index: number): void {
    const dv = this.doorVisuals[index];
    const opt = this.bridge.doors[index];
    if (!dv || !opt || this.selecting || !this.hero) return;

    this.selecting = true;
    this.hero.setVelocity(0, 0);
    this.hero.updateFromInput(0, 0, false, 'interact');

    this.tweens.add({
      targets: dv.root,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 160,
      yoyo: true,
      onComplete: () => this.bridge.onSelect?.(opt.id),
    });
    dv.glow.setVisible(true);
  }
}
