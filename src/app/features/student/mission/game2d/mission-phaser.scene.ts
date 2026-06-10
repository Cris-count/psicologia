import Phaser from 'phaser';
import { MissionPhaserBridge } from './mission-phaser.bridge';
import { WorldZoneMarker } from './map.types';
import { CAMPUS_META } from './campus/campus.meta';
import { CampusBuildingDef } from './campus/campus.types';
import { MISSION_ASSET_MANIFEST, missionAssetUrls, type LoadProgressFn } from './mission-assets';
import { CampusPathfinder, type PathPoint } from './campus-pathfinding';
import { MissionDecisionHolo } from './mission-decision-holo';
import { MissionNavigation } from './mission-navigation';
import { MissionZoneMarkers } from './mission-zone-markers';
import { registerPlayerAnimations, TilemapPlayer } from './tilemap/tilemap-player';

const WALK_SPEED = 150;
const RUN_SPEED = 250;
const INTERACT_RADIUS = 80;

const TILE_LAYERS = ['Ground', 'Road', 'Nature'] as const;

export class MissionWorldScene extends Phaser.Scene {
  private bridge!: MissionPhaserBridge;
  private onProgress: LoadProgressFn | null = null;
  private hero: TilemapPlayer | null = null;
  private collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private buildingWalls!: Phaser.Physics.Arcade.StaticGroup;
  private decorWalls!: Phaser.Physics.Arcade.StaticGroup;
  private promptGlow: Phaser.GameObjects.Ellipse | null = null;
  private promptLabel: Phaser.GameObjects.Text | null = null;
  private nearZoneIndex = -1;
  private nearInteract = false;
  private interactCooldown = 0;
  private lastInteract = false;
  private ready = false;
  private navigation: MissionNavigation | null = null;
  private pathfinder: CampusPathfinder | null = null;
  private decisionHolo: MissionDecisionHolo | null = null;
  private zoneMarkers: MissionZoneMarkers | null = null;
  private clickPath: PathPoint[] = [];
  private clickPathIndex = 0;
  private autoMoving = false;
  private readonly mapScale = CAMPUS_META.displayScale;

  constructor() {
    super({ key: 'MissionWorld' });
  }

  init(): void {
    this.bridge = this.game.registry.get('missionBridge') as MissionPhaserBridge;
    this.onProgress = this.game.registry.get('missionProgress') as LoadProgressFn | null;
  }

  preload(): void {
    console.log('Phaser preload started');
    const assets = missionAssetUrls();
    let loaded = 0;
    const total = assets.length;
    const bump = (label: string) => {
      loaded++;
      const pct = 20 + Math.round((loaded / total) * 75);
      this.onProgress?.(pct, label);
    };

    this.load.on('progress', (value: number) => {
      this.onProgress?.(20 + Math.round(value * 70), 'Cargando campus…');
    });
    this.load.on('filecomplete', (_key: string, _t: string, data: { url?: string }) => {
      const name = data?.url?.split('/').pop() ?? 'recurso';
      bump(name);
    });

    for (const a of assets) {
      if (a.type === 'tilemap') this.load.tilemapTiledJSON(a.key, a.url);
      else if (a.type === 'spritesheet') {
        const p = MISSION_ASSET_MANIFEST.player;
        this.load.spritesheet(a.key, a.url, { frameWidth: p.fw, frameHeight: p.fh });
      } else this.load.image(a.key, a.url);
    }
  }

  create(): void {
    console.log('Game scene initialized');
    this.applyPixelArtFilters();
    registerPlayerAnimations(this);
    this.buildingWalls = this.physics.add.staticGroup();
    this.decorWalls = this.physics.add.staticGroup();
    this.buildWorld();
    this.cameras.main.setBackgroundColor(0x7ec8e8);
    this.scale.on('resize', this.onResize, this);
    this.ready = true;
    this.onProgress?.(98, 'Campus listo');
    console.log('Assets loaded');
    console.log('Map rendered');
    console.log('Player rendered');
  }

  isReady(): boolean {
    return this.ready;
  }

  getPlayerSprite(): Phaser.Physics.Arcade.Sprite | null {
    return this.hero?.sprite ?? null;
  }

  setClickDestination(worldX: number, worldY: number): void {
    if (!this.pathfinder || !this.hero || this.bridge.state.paused) return;
    const sprite = this.hero.sprite;
    this.clickPath = this.pathfinder.findPathWorld(sprite.x, sprite.y, worldX, worldY);
    this.clickPathIndex = 1;
    this.autoMoving = this.clickPath.length > 1;
  }

  override update(_time: number, delta: number): void {
    if (!this.hero || !this.ready) return;
    if (this.interactCooldown > 0) this.interactCooldown -= delta;

    const bridge = this.bridge;
    const state = bridge.state;

    if (bridge.resetPlayerToSpawn) {
      bridge.resetPlayerToSpawn = false;
      this.teleportToSpawn();
    }

    const paused = state.paused || !state.controlsEnabled;
    const input = bridge.input;

    if (paused) {
      this.hero.setVelocity(0, 0);
      this.hero.updateFromInput(0, 0, false, state.playerAnim, delta);
      return;
    }

    let dirX = 0;
    let dirY = 0;
    if (input.left) dirX -= 1;
    if (input.right) dirX += 1;
    if (input.forward) dirY -= 1;
    if (input.backward) dirY += 1;

    const keyboardLen = Math.hypot(dirX, dirY);
    if (keyboardLen > 0) {
      this.autoMoving = false;
      this.clickPath = [];
    } else if (this.autoMoving && this.clickPath.length > 0) {
      const sprite = this.hero.sprite;
      const idx = Math.min(this.clickPathIndex, this.clickPath.length - 1);
      const wp = this.clickPath[idx];
      const dx = wp.x - sprite.x;
      const dy = wp.y - sprite.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 14) {
        this.clickPathIndex += 1;
        if (this.clickPathIndex >= this.clickPath.length) {
          this.autoMoving = false;
        }
      } else {
        dirX = dx / dist;
        dirY = dy / dist;
      }
    }

    const len = Math.hypot(dirX, dirY);
    const sprint = input.sprint && len > 0 && keyboardLen > 0;
    const speed = sprint ? RUN_SPEED : WALK_SPEED;
    let vx = 0;
    let vy = 0;
    if (len > 0) {
      vx = (dirX / len) * speed;
      vy = (dirY / len) * speed;
    }

    const forcedPose =
      len === 0 && state.playerAnim !== 'idle' && state.playerAnim !== 'walk' && state.playerAnim !== 'run'
        ? state.playerAnim
        : undefined;

    this.hero.setVelocity(vx, vy);
    this.hero.updateFromInput(dirX, dirY, sprint, forcedPose, delta);
    this.updateCamera();
    this.updateZoneProximity();
    this.handleInteraction();
    this.updateWorldPrompt();
    const sprite = this.hero.sprite;
    this.navigation?.update(sprite.x, sprite.y, delta);
    this.decisionHolo?.update();
    if (!this.zoneMarkers && this.bridge.world) {
      this.zoneMarkers = new MissionZoneMarkers(this, this.bridge);
      this.zoneMarkers.create();
    }
    this.zoneMarkers?.update();
    this.bridge.state.playerX = sprite.x;
    this.bridge.state.playerY = sprite.y;
  }

  private buildWorld(): void {
    const map = this.make.tilemap({ key: MISSION_ASSET_MANIFEST.tilemap.key });
    const tileset = map.addTilesetImage(
      MISSION_ASSET_MANIFEST.tileset.key,
      MISSION_ASSET_MANIFEST.tileset.key,
      CAMPUS_META.tileSize,
      CAMPUS_META.tileSize,
      0,
      0,
    );
    if (!tileset) return;

    for (const name of TILE_LAYERS) {
      const layer = map.createLayer(name, tileset, 0, 0);
      if (!layer) continue;
      layer.setScale(this.mapScale);
      layer.setDepth(name === 'Ground' ? 0 : name === 'Road' ? 1 : 2);
    }

    const collLayer = map.createLayer('Collision', tileset, 0, 0);
    if (collLayer) {
      collLayer.setVisible(false);
      collLayer.setScale(this.mapScale);
      collLayer.setCollisionByExclusion([0]);
      this.collisionLayer = collLayer;
    }

    this.addAtmosphere(map.widthInPixels * this.mapScale, map.heightInPixels * this.mapScale);
    this.placeCampusSprites();
    this.spawnAmbientCitizens();
    this.time.delayedCall(400, () => {
      this.spawnSoftParticles();
      this.spawnDustParticles();
    });
    this.pathfinder = new CampusPathfinder(
      CAMPUS_META.width,
      CAMPUS_META.height,
      CAMPUS_META.tileSize,
      this.mapScale,
      this.collisionLayer,
    );
    this.createPlayer();
    this.navigation = new MissionNavigation(this, this.bridge, this.mapScale, this.pathfinder);
    this.navigation.create();
    this.decisionHolo = new MissionDecisionHolo(this, this.bridge);
    this.decisionHolo.create();
    const worldW = map.widthInPixels * this.mapScale;
    const worldH = map.heightInPixels * this.mapScale;
    this.physics.world.setBounds(0, 0, worldW, worldH, true, true, true, true);
    this.drawWorldBorder(worldW, worldH);
    this.teleportToSpawn();
    this.updateCamera(true);
  }

  private drawWorldBorder(worldW: number, worldH: number): void {
    const border = this.add.graphics().setDepth(8000);
    border.lineStyle(4, 0x2a3a28, 1);
    border.strokeRect(2, 2, worldW - 4, worldH - 4);
    border.lineStyle(2, 0x4a6a48, 0.6);
    border.strokeRect(6, 6, worldW - 12, worldH - 12);
    border.fillStyle(0x1a2818, 0.15);
    border.fillRect(0, 0, worldW, 4);
    border.fillRect(0, worldH - 4, worldW, 4);
    border.fillRect(0, 0, 4, worldH);
    border.fillRect(worldW - 4, 0, 4, worldH);
  }

  private px(tx: number, ty: number): { x: number; y: number } {
    const t = CAMPUS_META.tileSize;
    return { x: (tx * t + t / 2) * this.mapScale, y: (ty * t + t / 2) * this.mapScale };
  }

  private static readonly BLOCKING_PROPS = new Set([
    'prop-fountain',
    'prop-tree',
    'prop-tree-lg',
    'prop-carousel',
    'prop-train',
    'prop-entrance',
    'prop-fence',
    'prop-bench',
    'prop-signpost',
    'prop-bus',
    'prop-police-car',
    'prop-ambulance',
  ]);

  private placeCampusSprites(): void {
    const shadowTex = 'tex-soft-shadow';
    if (!this.textures.exists(shadowTex)) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0a1420, 0.5);
      g.fillEllipse(20, 6, 40, 12);
      g.generateTexture(shadowTex, 40, 12);
      g.destroy();
    }

    for (const dec of CAMPUS_META.decor) {
      const p = this.px(dec.x, dec.y);
      const sh = this.add.image(p.x, p.y + 4, shadowTex).setScale(dec.scale * 0.9, 0.4).setAlpha(0.35);
      sh.setDepth(p.y - 1);
      const img = this.add.image(p.x, p.y, dec.sprite).setOrigin(0.5, 0.9).setScale(dec.scale);
      img.setDepth(p.y);

      if (MissionWorldScene.BLOCKING_PROPS.has(dec.sprite)) {
        const bw = Math.max(20, img.displayWidth * 0.55);
        const bh = Math.max(14, img.displayHeight * 0.35);
        const block = this.add.rectangle(p.x, p.y - bh * 0.25, bw, bh, 0, 0);
        block.setVisible(false);
        this.decorWalls.add(block);
      }
    }

    for (const b of CAMPUS_META.buildings) {
      this.placeBuilding(b);
    }
  }

  private createBuildingSign(
    x: number,
    y: number,
    label: string,
    depth: number,
    scale: number,
    highlight = false,
  ): void {
    const fontSize = Math.max(12, Math.round(14 * scale));
    const padX = 12;
    const textW = Math.max(label.length * (fontSize * 0.55) + padX * 2, 64);
    const textH = fontSize + 10;
    const accent = highlight ? 0xf4c542 : 0x4fc3ff;

    const g = this.add.graphics();
    g.fillStyle(0x0c1220, 0.92);
    g.fillRoundedRect(x - textW / 2, y - textH / 2, textW, textH, 5);
    g.lineStyle(1.5, accent, highlight ? 0.85 : 0.55);
    g.strokeRoundedRect(x - textW / 2, y - textH / 2, textW, textH, 5);
    g.fillStyle(accent, 0.15);
    g.fillRoundedRect(x - textW / 2 + 1, y - textH / 2 + 1, textW - 2, 3, 4);
    g.setDepth(depth);

    this.add
      .text(x, y, label, {
        fontFamily: 'Rajdhani, "Segoe UI", Arial, sans-serif',
        fontSize: `${fontSize}px`,
        fontStyle: 'bold',
        color: '#f8fafc',
        align: 'center',
        stroke: '#0a0e18',
        strokeThickness: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(depth + 1);
  }

  private placeBuilding(b: CampusBuildingDef): void {
    const p = this.px(b.x, b.y);
    const depth = p.y;

    const sh = this.add.image(p.x, p.y + 8, 'tex-soft-shadow').setScale(b.scale * 1.8, 0.55).setAlpha(0.5);
    sh.setDepth(depth - 2);

    const sprite = this.add.image(p.x, p.y, b.sprite).setOrigin(0.5, 0.88).setScale(b.scale);
    sprite.setDepth(depth);

    if (b.label) {
      this.createBuildingSign(p.x, p.y - sprite.displayHeight * 0.62, b.label, depth + 5, b.scale, b.missionHighlight);
    }

    if (b.missionHighlight) {
      const ring = this.add.circle(p.x, p.y - sprite.displayHeight * 0.2, sprite.displayWidth * 0.55, 0xf4c542, 0);
      ring.setStrokeStyle(2, 0xf4c542, 0.85);
      ring.setDepth(depth - 1);
      this.tweens.add({ targets: ring, alpha: { from: 0.4, to: 0.95 }, duration: 900, yoyo: true, repeat: -1 });
    }

    const bw = sprite.displayWidth * 0.92;
    const bh = sprite.displayHeight * 0.5;
    const body = this.add.rectangle(p.x, p.y - bh * 0.2, bw, bh, 0, 0);
    body.setVisible(false);
    this.buildingWalls.add(body);

    for (const prop of b.props ?? []) {
      const propX = p.x + prop.dx * this.mapScale * 0.45;
      const propY = p.y + prop.dy * this.mapScale * 0.45;
      const img = this.add
        .image(propX, propY, prop.sprite)
        .setOrigin(0.5, 0.9)
        .setScale(1.35 * this.mapScale * 0.55);
      img.setDepth(depth + 1);

      if (prop.blocking || MissionWorldScene.BLOCKING_PROPS.has(prop.sprite)) {
        const pbw = Math.max(18, img.displayWidth * 0.7);
        const pbh = Math.max(12, img.displayHeight * 0.45);
        const block = this.add.rectangle(propX, propY - pbh * 0.2, pbw, pbh, 0, 0);
        block.setVisible(false);
        this.decorWalls.add(block);
      }
    }
  }

  private spawnAmbientCitizens(): void {
    const citizens = CAMPUS_META.decor.filter((d) => d.sprite.startsWith('prop-citizen'));
    for (const dec of citizens) {
      const p = this.px(dec.x, dec.y);
      const img = this.add.image(p.x, p.y, dec.sprite).setOrigin(0.5, 0.92).setScale(dec.scale);
      img.setDepth(p.y);
      const dx = ((dec.x * 7) % 5) - 2;
      const dy = ((dec.y * 5) % 5) - 2;
      this.tweens.add({
        targets: img,
        x: p.x + dx * this.mapScale * 8,
        y: p.y + dy * this.mapScale * 6,
        duration: 2200 + (dec.x + dec.y) * 40,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private addAtmosphere(worldW: number, worldH: number): void {
    const sky = this.add.graphics().setDepth(-5);
    sky.fillGradientStyle(0x7ec8e8, 0xa8d8f0, 0xc8e8a0, 0x6a9a52, 1, 1, 0.92, 0.88);
    sky.fillRect(0, 0, worldW, worldH);

    const warm = this.add.graphics().setDepth(7000).setBlendMode(Phaser.BlendModes.MULTIPLY);
    warm.fillStyle(0x3a5028, 0.12);
    warm.fillRect(0, 0, worldW, worldH);

    for (const dec of CAMPUS_META.decor.filter((d) => d.sprite === 'prop-lamp')) {
      const p = this.px(dec.x, dec.y);
      const glow = this.add.circle(p.x, p.y - 20, 40, 0xffd080, 0.12).setDepth(6);
      this.tweens.add({ targets: glow, alpha: 0.22, duration: 2200, yoyo: true, repeat: -1 });
    }
  }

  private spawnDustParticles(): void {
    if (!this.textures.exists('particle-dust')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xfff4d0, 1);
      g.fillCircle(2, 2, 2);
      g.generateTexture('particle-dust', 4, 4);
      g.destroy();
    }
    const w = CAMPUS_META.width * CAMPUS_META.tileSize * this.mapScale;
    const h = CAMPUS_META.height * CAMPUS_META.tileSize * this.mapScale;
    this.add
      .particles(0, 0, 'particle-dust', {
        x: { min: 40, max: w - 40 },
        y: { min: h * 0.3, max: h - 40 },
        speedX: { min: -2, max: 2 },
        speedY: { min: -6, max: -2 },
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.15, end: 0 },
        lifespan: 3000,
        frequency: 800,
        quantity: 1,
      })
      .setDepth(6400);
  }

  private spawnSoftParticles(): void {
    if (!this.textures.exists('particle-petal')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xf0b0c8, 1);
      g.fillCircle(3, 3, 3);
      g.generateTexture('particle-petal', 6, 6);
      g.destroy();
    }
    const w = CAMPUS_META.width * CAMPUS_META.tileSize * this.mapScale;
    this.add.particles(0, 0, 'particle-petal', {
      x: { min: 80, max: w - 80 },
      y: { min: 120, max: 320 },
      speedX: { min: -4, max: 4 },
      speedY: { min: 2, max: 8 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.2, end: 0 },
      lifespan: 4500,
      frequency: 1200,
      quantity: 1,
    }).setDepth(6500);
  }

  private createPlayer(): void {
    if (!this.collisionLayer) return;
    const spawn = CAMPUS_META.spawn;
    const x = spawn.x * this.mapScale;
    const y = spawn.y * this.mapScale;
    this.hero = new TilemapPlayer(this, x, y, this.collisionLayer, this.mapScale);
    this.physics.add.collider(this.hero.sprite, this.buildingWalls);
    this.physics.add.collider(this.hero.sprite, this.decorWalls);
  }

  private teleportToSpawn(): void {
    if (!this.hero) return;
    const s = CAMPUS_META.spawn;
    this.hero.setPosition(s.x * this.mapScale, s.y * this.mapScale);
    this.hero.setVelocity(0, 0);
  }

  private updateCamera(immediate = false): void {
    if (!this.hero) return;
    const player = this.hero.sprite;
    const cam = this.cameras.main;
    const worldW = CAMPUS_META.width * CAMPUS_META.tileSize * this.mapScale;
    const worldH = CAMPUS_META.height * CAMPUS_META.tileSize * this.mapScale;
    cam.setBounds(0, 0, worldW, worldH);
    cam.setZoom(1.18);
    cam.roundPixels = true;
    if (immediate) cam.centerOn(player.x, player.y);
    else cam.startFollow(player, true, 0.12, 0.12);
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    this.cameras.main.setSize(gameSize.width, gameSize.height);
    this.updateCamera(true);
  }

  private zoneDoor(zone: WorldZoneMarker): { x: number; y: number } {
    return { x: zone.doorX, y: zone.doorY };
  }

  private updateZoneProximity(): void {
    if (!this.hero || !this.bridge.world) return;
    const player = this.hero.sprite;
    const state = this.bridge.state;
    let nearest = -1;
    let nearestDist = INTERACT_RADIUS * this.mapScale;

    for (const zone of this.bridge.world.zones) {
      if (!zone.unlocked || zone.complete) continue;
      if (state.objectiveZoneIndex != null && state.objectiveZoneIndex >= 0 && zone.index !== state.objectiveZoneIndex) {
        continue;
      }
      const door = this.zoneDoor(zone);
      const dist = Phaser.Math.Distance.Between(player.x, player.y, door.x, door.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = zone.index;
      }
    }

    this.nearZoneIndex = state.phase === 'map' ? nearest : -1;

    let nearHolo = false;
    if (state.phase === 'decision' && !state.paused) {
      const active = this.bridge.world.zones.find((z) => z.active && z.unlocked);
      if (active) {
        const door = this.zoneDoor(active);
        nearHolo =
          Phaser.Math.Distance.Between(player.x, player.y, door.x, door.y) < INTERACT_RADIUS * this.mapScale;
      }
    }
    this.nearInteract = nearHolo;
  }

  private handleInteraction(): void {
    const input = this.bridge.input;
    const state = this.bridge.state;
    const pressed = input.interact && !this.lastInteract;
    this.lastInteract = input.interact;
    if (this.interactCooldown > 0) return;

    if (pressed && state.phase === 'map' && this.nearZoneIndex >= 0) {
      this.interactCooldown = 500;
      this.hero?.playEnterPulse();
      this.time.delayedCall(320, () => this.bridge.events.onZoneReach?.(this.nearZoneIndex));
    }
  }

  private updateWorldPrompt(): void {
    const state = this.bridge.state;
    const show = !state.paused && state.phase === 'map' && this.nearZoneIndex >= 0;

    if (!show || !this.bridge.world) {
      this.promptGlow?.setVisible(false);
      this.promptLabel?.setVisible(false);
      return;
    }

    const zone = this.bridge.world.zones.find((z) => z.index === this.nearZoneIndex);
    if (!zone) return;

    const door = this.zoneDoor(zone);
    const text = `Entrar · ${zone.label}`;

    if (!this.promptGlow) {
      this.promptGlow = this.add.ellipse(door.x, door.y + 8, 48, 16, 0x4fc3ff, 0.25);
      this.promptLabel = this.add
        .text(door.x, door.y - 22, text, {
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '12px',
          color: '#e8f4ff',
          backgroundColor: '#0a1420cc',
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5);
    }

    this.promptGlow.setPosition(door.x, door.y + 8);
    this.promptGlow.setDepth(9000 + door.y);
    this.promptLabel?.setPosition(door.x, door.y - 22);
    this.promptLabel?.setText(text);
    this.promptLabel?.setDepth(9001 + door.y);
    this.promptGlow.setVisible(true);
    this.promptLabel?.setVisible(true);
    this.promptGlow.setFillStyle(Phaser.Display.Color.HexStringToColor(zone.accent).color, 0.3);
  }

  private applyPixelArtFilters(): void {
    const m = MISSION_ASSET_MANIFEST;
    this.textures.get(m.tileset.key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    for (const key of [...m.buildings, ...m.props]) {
      if (this.textures.exists(key)) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }
}
