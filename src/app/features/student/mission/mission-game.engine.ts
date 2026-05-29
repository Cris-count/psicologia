import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SoftVignetteShader } from '../../../shared/engines/game-scene.postfx';
import { ChromaticAberrationShader, FilmGrainShader } from './mission-game.postfx';
import {
  animateWorldProps,
  buildMissionWorld,
  lerpAngle,
  setupMissionLighting,
  WORLD,
} from './mission-game.world';
import {
  GARY_COMPANION_CUTOUT,
  PlayerAnimState,
  STUDENT_HERO_CUTOUTS,
} from './student-hero.assets';
import { MissionGameEvents, MissionGameInput, MissionGameState, MissionSceneZone } from './mission-scene.types';

const PALETTE = { deep: 0x06050f, cyan: 0x4fc3ff, purple: 0xa855f7 };

function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function mapToWorld(x: number, y: number): THREE.Vector3 {
  return new THREE.Vector3((x / 100 - 0.5) * WORLD.w, 0, -(y / 100 - 0.5) * WORLD.d);
}

export function worldToMap(x: number, z: number): { x: number; y: number } {
  return { x: ((x / WORLD.w) + 0.5) * 100, y: ((-z / WORLD.d) + 0.5) * 100 };
}

/** Motor AAA — locomotion, cámara third-person, mundo denso, post-FX cinematográfico. */
export class MissionGameEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly composer: EffectComposer;
  private readonly grainPass: ShaderPass;
  private readonly particleField: THREE.Points;
  private readonly zoneGroup: THREE.Group;
  private readonly holoBrain: THREE.Group;
  private readonly pathLines: THREE.LineSegments;
  private readonly playerRig: THREE.Group;
  private readonly playerSpriteA: THREE.Sprite;
  private readonly playerSpriteB: THREE.Sprite;
  private readonly playerShadow: THREE.Mesh;
  private readonly garySprite: THREE.Sprite;
  private readonly interactRing: THREE.Mesh;
  private readonly floorPlane: THREE.Mesh;
  private readonly raycaster = new THREE.Raycaster();
  private readonly textures: Partial<Record<PlayerAnimState, THREE.Texture>> = {};
  private readonly cameraPos = new THREE.Vector3();
  private readonly cameraLook = new THREE.Vector3();
  private readonly desiredCamPos = new THREE.Vector3();
  private readonly desiredLookAt = new THREE.Vector3();
  private readonly moveTarget = new THREE.Vector3();
  private readonly playerPos = new THREE.Vector3();
  private readonly velocity = new THREE.Vector3();
  private readonly keys: MissionGameInput = {
    forward: false, backward: false, left: false, right: false, sprint: false, interact: false,
  };
  private state: MissionGameState = {
    phase: 'briefing', playerX: 12, playerY: 72, accent: '#4fc3ff', zones: [],
    playerAnim: 'idle', controlsEnabled: false, showDecisionHolo: false, paused: false,
  };
  private events: MissionGameEvents = {};
  private animationId = 0;
  private disposed = false;
  private clock = new THREE.Clock();
  private time = 0;
  private hasMoveTarget = false;
  private currentAnim: PlayerAnimState = 'idle';
  private targetAnim: PlayerAnimState = 'idle';
  private animBlend = 1;
  private activeSpriteIsA = true;
  private nearZoneIndex = -1;
  private nearInteract = false;
  private interactCooldown = 0;
  private loaded = false;
  private facingAngle = 0;
  private targetFacing = 0;
  private footPhase = 0;
  private cameraShake = 0;

  private readonly maxWalk = 6.5;
  private readonly maxRun = 11.5;
  private readonly accel = 32;
  private readonly decel = 24;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(PALETTE.deep, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(PALETTE.deep);
    this.scene.fog = new THREE.FogExp2(PALETTE.deep, 0.018);

    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);

    this.floorPlane = buildMissionWorld(this.scene);
    setupMissionLighting(this.scene);

    this.particleField = this.createParticles();
    this.zoneGroup = new THREE.Group();
    this.holoBrain = this.createHoloBrain();
    this.pathLines = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.35, depthWrite: false }),
    );

    this.playerRig = new THREE.Group();
    const spriteMat = () =>
      new THREE.SpriteMaterial({ transparent: true, depthWrite: false, alphaTest: 0.05, depthTest: true });
    this.playerSpriteA = new THREE.Sprite(spriteMat());
    this.playerSpriteB = new THREE.Sprite(spriteMat());
    this.playerSpriteB.material.opacity = 0;
    this.garySprite = new THREE.Sprite(spriteMat());
    this.playerShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false }),
    );
    this.playerShadow.rotation.x = -Math.PI / 2;
    this.playerShadow.position.y = 0.03;
    this.interactRing = new THREE.Mesh(
      new THREE.RingGeometry(1, 1.35, 48),
      new THREE.MeshBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    this.interactRing.rotation.x = -Math.PI / 2;
    this.interactRing.position.y = 0.05;

    this.playerRig.add(this.playerShadow, this.playerSpriteA, this.playerSpriteB, this.interactRing);
    this.scene.add(this.particleField, this.pathLines, this.zoneGroup, this.holoBrain, this.playerRig, this.garySprite);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.48, 0.45));
    this.composer.addPass(new ShaderPass(ChromaticAberrationShader));
    const vignette = new ShaderPass(SoftVignetteShader);
    vignette.uniforms['uVignette'].value = 0.32;
    vignette.uniforms['uWarmth'].value = 0.025;
    this.composer.addPass(vignette);
    this.grainPass = new ShaderPass(FilmGrainShader);
    this.composer.addPass(this.grainPass);
    this.composer.addPass(new OutputPass());

    void this.loadSprites();
    this.syncPlayerFromMap();
    this.updateCameraTargets();
  }

  init(w: number, h: number): void {
    this.resize(w, h);
    this.animate();
  }

  setEvents(e: MissionGameEvents): void { this.events = e; }

  setState(state: MissionGameState): void {
    const prev = this.state.phase;
    this.state = state;
    this.syncZones(state.zones);
    this.syncPathLines(state.zones);
    if ((state.phase !== 'map' || prev !== state.phase) && !state.controlsEnabled) {
      this.syncPlayerFromMap();
    }
    if (state.phase === 'zone-intro' || (state.phase === 'decision' && state.playerAnim === 'interact')) {
      this.hasMoveTarget = false;
      this.velocity.set(0, 0, 0);
    }
    if (state.playerAnim !== this.targetAnim && ['interact', 'think', 'celebrate', 'idle'].includes(state.playerAnim)) {
      this.blendToAnim(state.playerAnim);
    }
    this.holoBrain.visible = state.showDecisionHolo;
    if (state.showDecisionHolo) {
      this.holoBrain.position.set(this.playerPos.x, 2.8, this.playerPos.z - 2.2);
    }
    this.updateCameraTargets();
  }

  setInput(input: Partial<MissionGameInput>): void {
    Object.assign(this.keys, input);
  }

  handlePointerClick(cx: number, cy: number, rect: DOMRect): void {
    if (!this.state.controlsEnabled || this.state.paused) return;
    const ndc = new THREE.Vector2(((cx - rect.left) / rect.width) * 2 - 1, -((cy - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = this.raycaster.intersectObject(this.floorPlane)[0];
    if (hit) {
      this.moveTarget.copy(hit.point);
      this.moveTarget.y = 0;
      this.hasMoveTarget = true;
    }
  }

  getNearZoneIndex(): number { return this.nearZoneIndex; }
  getCanInteract(): boolean { return this.nearInteract; }

  resize(w: number, h: number): void {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    Object.values(this.textures).forEach((t) => t?.dispose());
    this.composer.dispose();
    this.renderer.dispose();
  }

  private async loadSprites(): Promise<void> {
    const loader = new THREE.TextureLoader();
    await Promise.all(
      (Object.entries(STUDENT_HERO_CUTOUTS) as [PlayerAnimState, string][]).map(
        ([pose, url]) =>
          new Promise<void>((res) =>
            loader.load(url, (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
              this.textures[pose] = tex;
              res();
            }),
          ),
      ),
    );
    loader.load(GARY_COMPANION_CUTOUT, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      (this.garySprite.material as THREE.SpriteMaterial).map = tex;
      this.fitSprite(this.garySprite, tex, 1.15, 1.85);
    });
    this.loaded = true;
    this.applyAnimTexture(this.playerSpriteA, 'idle');
    this.applyAnimTexture(this.playerSpriteB, 'idle');
  }

  private fitSprite(sprite: THREE.Sprite, tex: THREE.Texture, w: number, h: number): void {
    const img = tex.image as { width?: number; height?: number } | undefined;
    const aspect = img?.width && img?.height ? img.width / img.height : 0.5;
    sprite.scale.set(w, h || w / aspect, 1);
    sprite.center.set(0.5, 0);
  }

  private applyAnimTexture(sprite: THREE.Sprite, anim: PlayerAnimState): void {
    const tex = this.textures[anim] ?? this.textures.idle;
    if (!tex) return;
    (sprite.material as THREE.SpriteMaterial).map = tex;
    this.fitSprite(sprite, tex, 1.55, 3.05);
  }

  private blendToAnim(anim: PlayerAnimState): void {
    if (anim === this.targetAnim && this.animBlend >= 0.99) return;
    this.targetAnim = anim;
    const incoming = this.activeSpriteIsA ? this.playerSpriteB : this.playerSpriteA;
    const outgoing = this.activeSpriteIsA ? this.playerSpriteA : this.playerSpriteB;
    this.applyAnimTexture(incoming, anim);
    incoming.material.opacity = 0;
    outgoing.material.opacity = 1;
    this.animBlend = 0;
    this.currentAnim = anim;
  }

  private updateAnimBlend(dt: number): void {
    if (this.animBlend >= 1) return;
    this.animBlend = Math.min(1, this.animBlend + dt * 8);
    const inc = this.activeSpriteIsA ? this.playerSpriteB : this.playerSpriteA;
    const out = this.activeSpriteIsA ? this.playerSpriteA : this.playerSpriteB;
    inc.material.opacity = this.animBlend;
    out.material.opacity = 1 - this.animBlend;
    if (this.animBlend >= 1) {
      this.activeSpriteIsA = !this.activeSpriteIsA;
      out.material.opacity = 0;
      inc.material.opacity = 1;
    }
  }

  private syncPlayerFromMap(): void {
    const pos = mapToWorld(this.state.playerX, this.state.playerY);
    this.playerPos.copy(pos);
    this.playerRig.position.copy(pos);
  }

  private createParticles(): THREE.Points {
    const count = 680;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color(PALETTE.cyan);
    const c2 = new THREE.Color(PALETTE.purple);
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * WORLD.w;
      pos[i * 3 + 1] = Math.random() * 12 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * WORLD.d;
      const c = i % 3 === 0 ? c2 : c1;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.055,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
  }

  private createHoloBrain(): THREE.Group {
    const g = new THREE.Group();
    g.visible = false;
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.2, 2),
      new THREE.MeshStandardMaterial({
        color: PALETTE.cyan,
        emissive: PALETTE.cyan,
        emissiveIntensity: 0.55,
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      }),
    );
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 24, 24),
      new THREE.MeshStandardMaterial({
        color: PALETTE.purple,
        emissive: PALETTE.purple,
        emissiveIntensity: 0.65,
        transparent: true,
        opacity: 0.55,
      }),
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.04, 8, 64),
      new THREE.MeshStandardMaterial({ color: PALETTE.cyan, emissive: PALETTE.cyan, emissiveIntensity: 0.8 }),
    );
    ring.rotation.x = Math.PI / 2;
    g.add(shell, inner, ring);
    return g;
  }

  private syncPathLines(zones: MissionSceneZone[]): void {
    const pts: number[] = [];
    for (let i = 0; i < zones.length - 1; i += 1) {
      const a = mapToWorld(zones[i].mapX, zones[i].mapY);
      const b = mapToWorld(zones[i + 1].mapX, zones[i + 1].mapY);
      pts.push(a.x, 0.1, a.z, b.x, 0.1, b.z);
    }
    this.pathLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    (this.pathLines.material as THREE.LineBasicMaterial).opacity = zones.some((z) => z.complete) ? 0.65 : 0.3;
  }

  private syncZones(zones: MissionSceneZone[]): void {
    while (this.zoneGroup.children.length < zones.length) this.zoneGroup.add(this.createZoneNode());
    while (this.zoneGroup.children.length > zones.length) {
      this.zoneGroup.remove(this.zoneGroup.children[this.zoneGroup.children.length - 1]);
    }
    zones.forEach((zone, i) => {
      const node = this.zoneGroup.children[i] as THREE.Group;
      node.position.copy(mapToWorld(zone.mapX, zone.mapY));
      const accent = hexToNum(zone.accent);
      const platform = node.children[0] as THREE.Mesh;
      const pillar = node.children[1] as THREE.Mesh;
      const holo = node.children[2] as THREE.Mesh;
      const light = node.children[3] as THREE.PointLight;
      const ring = node.children[4] as THREE.Mesh;
      (platform.material as THREE.MeshStandardMaterial).emissive.setHex(zone.unlocked ? accent : 0x181625);
      (platform.material as THREE.MeshStandardMaterial).emissiveIntensity = zone.active ? 0.55 : zone.unlocked ? 0.28 : 0.06;
      (pillar.material as THREE.MeshStandardMaterial).emissive.setHex(accent);
      (pillar.material as THREE.MeshStandardMaterial).emissiveIntensity = zone.active ? 0.95 : zone.complete ? 0.55 : 0.18;
      (holo.material as THREE.MeshBasicMaterial).opacity = zone.active ? 0.55 : zone.unlocked ? 0.28 : 0.06;
      light.color.setHex(accent);
      light.intensity = zone.active ? 2 : zone.unlocked ? 1 : 0.12;
      (ring.material as THREE.MeshBasicMaterial).opacity = zone.active ? 0.85 : zone.unlocked ? 0.4 : 0.06;
    });
  }

  private createZoneNode(): THREE.Group {
    const g = new THREE.Group();
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.6, 0.25, 32),
      new THREE.MeshStandardMaterial({ color: 0x12101f, emissive: PALETTE.cyan, emissiveIntensity: 0.2, metalness: 0.75, roughness: 0.25 }),
    );
    platform.position.y = 0.12;
    platform.receiveShadow = true;
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.45, 3.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a1535, emissive: PALETTE.cyan, emissiveIntensity: 0.35, metalness: 0.8, roughness: 0.2 }),
    );
    pillar.position.y = 2;
    pillar.castShadow = true;
    const holo = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 0.02, 32),
      new THREE.MeshBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }),
    );
    holo.position.y = 0.5;
    const light = new THREE.PointLight(PALETTE.cyan, 0.8, 14);
    light.position.y = 3;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.3, 2.7, 48),
      new THREE.MeshBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.14;
    g.add(platform, pillar, holo, light, ring);
    return g;
  }

  private updateCameraTargets(): void {
    const p = this.playerPos;
    const explore = this.state.phase === 'map' || (this.state.phase === 'decision' && this.state.controlsEnabled);
    if (explore) {
      const dist = 12;
      const h = 5.8;
      this.desiredCamPos.set(
        p.x - Math.sin(this.facingAngle) * dist,
        h,
        p.z - Math.cos(this.facingAngle) * dist,
      );
      this.desiredLookAt.set(p.x, 1.75, p.z);
    } else {
      switch (this.state.phase) {
        case 'briefing':
          this.desiredCamPos.set(p.x - Math.sin(this.facingAngle) * 10, 6.5, p.z - Math.cos(this.facingAngle) * 10);
          this.desiredLookAt.set(p.x, 1.6, p.z);
          break;
        case 'zone-intro':
          this.desiredCamPos.set(p.x + 5, 5.5, p.z + 9);
          this.desiredLookAt.set(p.x, 2.2, p.z - 2);
          break;
        case 'decision':
          this.desiredCamPos.set(p.x + 4.5, 5, p.z + 7);
          this.desiredLookAt.set(p.x, 2.5, p.z - 2);
          break;
        default:
          this.desiredCamPos.set(p.x, 11, p.z + 16);
          this.desiredLookAt.set(p.x, 1.5, p.z);
      }
    }
  }

  private updateMovement(dt: number): void {
    if (!this.state.controlsEnabled || this.state.paused) {
      this.velocity.multiplyScalar(Math.max(0, 1 - this.decel * dt));
      return;
    }

    let ix = 0;
    let iz = 0;
    if (this.keys.forward) iz -= 1;
    if (this.keys.backward) iz += 1;
    if (this.keys.left) ix -= 1;
    if (this.keys.right) ix += 1;

    const keyActive = ix !== 0 || iz !== 0;
    const maxSpeed = this.keys.sprint ? this.maxRun : this.maxWalk;

    if (keyActive) {
      this.hasMoveTarget = false;
      const len = Math.hypot(ix, iz) || 1;
      const wishX = (ix / len) * maxSpeed;
      const wishZ = (iz / len) * maxSpeed;
      this.velocity.x += (wishX - this.velocity.x) * Math.min(1, this.accel * dt);
      this.velocity.z += (wishZ - this.velocity.z) * Math.min(1, this.accel * dt);
      this.targetFacing = Math.atan2(ix, iz);
    } else if (this.hasMoveTarget) {
      const dir = this.moveTarget.clone().sub(this.playerPos);
      dir.y = 0;
      const dist = dir.length();
      if (dist < 0.2) {
        this.hasMoveTarget = false;
      } else {
        dir.normalize();
        this.velocity.x += (dir.x * this.maxWalk - this.velocity.x) * Math.min(1, this.accel * dt);
        this.velocity.z += (dir.z * this.maxWalk - this.velocity.z) * Math.min(1, this.accel * dt);
        this.targetFacing = Math.atan2(dir.x, dir.z);
      }
    } else {
      this.velocity.x *= Math.max(0, 1 - this.decel * dt);
      this.velocity.z *= Math.max(0, 1 - this.decel * dt);
      if (Math.hypot(this.velocity.x, this.velocity.z) < 0.08) this.velocity.set(0, 0, 0);
    }

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > maxSpeed) {
      this.velocity.multiplyScalar(maxSpeed / speed);
    }

    this.playerPos.x += this.velocity.x * dt;
    this.playerPos.z += this.velocity.z * dt;
    this.clampPlayer();

    this.facingAngle = lerpAngle(this.facingAngle, this.targetFacing, 1 - Math.exp(-14 * dt));
    this.playerRig.rotation.y = this.facingAngle;

    if (speed > 8) {
      this.blendToAnim('run');
      this.cameraShake = 0.035;
      this.footPhase += dt * 14;
    } else if (speed > 0.25) {
      this.blendToAnim('walk');
      this.cameraShake = 0.012;
      this.footPhase += dt * 10;
    } else if (['walk', 'run'].includes(this.targetAnim)) {
      this.blendToAnim('idle');
      this.cameraShake = 0;
    }

    this.playerRig.position.copy(this.playerPos);
    const map = worldToMap(this.playerPos.x, this.playerPos.z);
    this.state.playerX = map.x;
    this.state.playerY = map.y;
    this.updateCameraTargets();
  }

  private clampPlayer(): void {
    const hw = WORLD.w / 2 - 1.5;
    const hd = WORLD.d / 2 - 1.5;
    this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -hw, hw);
    this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -hd, hd);
  }

  private updateProximity(): void {
    this.nearZoneIndex = -1;
    this.nearInteract = false;
    this.state.zones.forEach((zone, i) => {
      if (!zone.unlocked) return;
      const d = this.playerPos.distanceTo(mapToWorld(zone.mapX, zone.mapY));
      if (d < 3.5 && this.state.phase === 'map') this.nearZoneIndex = i;
    });
    if (this.state.showDecisionHolo) {
      this.nearInteract = this.playerPos.distanceTo(this.holoBrain.position) < 3;
      (this.interactRing.material as THREE.MeshBasicMaterial).opacity = this.nearInteract ? 0.9 : 0.25;
    } else if (this.nearZoneIndex >= 0 && this.state.phase === 'map') {
      (this.interactRing.material as THREE.MeshBasicMaterial).opacity = 0.55;
    } else {
      (this.interactRing.material as THREE.MeshBasicMaterial).opacity = 0;
    }
  }

  private updateGary(dt: number): void {
    const behind = new THREE.Vector3(-Math.sin(this.facingAngle), 0, -Math.cos(this.facingAngle)).multiplyScalar(2.2);
    const side = new THREE.Vector3(Math.cos(this.facingAngle), 0, -Math.sin(this.facingAngle)).multiplyScalar(1.4);
    const target = this.playerPos.clone().add(behind).add(side);
    this.garySprite.position.lerp(target, 1 - Math.exp(-6 * dt));
    this.garySprite.position.y = 1.55 + Math.sin(this.time * 2.2) * 0.04;
    this.garySprite.material.rotation = Math.sin(this.time * 1.5) * 0.04;
  }

  private handleInteractions(): void {
    if (this.interactCooldown > 0) {
      this.interactCooldown -= 0.016;
      return;
    }
    if (!this.keys.interact || this.state.paused) return;
    if (this.state.phase === 'map' && this.nearZoneIndex >= 0) {
      const zp = mapToWorld(this.state.zones[this.nearZoneIndex].mapX, this.state.zones[this.nearZoneIndex].mapY);
      if (this.playerPos.distanceTo(zp) < 4) {
        this.interactCooldown = 0.55;
        this.velocity.set(0, 0, 0);
        this.events.onZoneReach?.(this.nearZoneIndex);
      }
    } else if (this.state.showDecisionHolo && this.nearInteract) {
      this.interactCooldown = 0.55;
      this.velocity.set(0, 0, 0);
      this.events.onInteractNode?.();
    }
  }

  private animate = (): void => {
    if (this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.time += dt;

    if (!this.state.paused) {
      this.updateMovement(dt);
      this.updateProximity();
      this.updateGary(dt);
      this.handleInteractions();
      this.updateAnimBlend(dt);
    }

    const smooth = 1 - Math.exp(-5 * dt);
    this.cameraPos.lerp(this.desiredCamPos, smooth);
    this.cameraLook.lerp(this.desiredLookAt, smooth);
    if (this.cameraShake > 0) {
      this.camera.position.set(
        this.cameraPos.x + (Math.random() - 0.5) * this.cameraShake,
        this.cameraPos.y + (Math.random() - 0.5) * this.cameraShake * 0.5,
        this.cameraPos.z + (Math.random() - 0.5) * this.cameraShake,
      );
      this.cameraShake *= 0.9;
    } else {
      this.camera.position.copy(this.cameraPos);
    }
    this.camera.lookAt(this.cameraLook);

    const bob = Math.sin(this.footPhase) * (this.targetAnim === 'run' ? 0.08 : this.targetAnim === 'walk' ? 0.05 : 0.015);
    const active = this.activeSpriteIsA ? this.playerSpriteA : this.playerSpriteB;
    active.position.y = 1.55 + bob;
    this.playerShadow.scale.setScalar(0.85 + (this.targetAnim === 'run' ? 0.15 : 0));
    (this.playerShadow.material as THREE.MeshBasicMaterial).opacity = 0.35 + (this.targetAnim === 'idle' ? 0.1 : 0);

    this.holoBrain.rotation.y = this.time * 0.9;
    this.holoBrain.position.y = 2.8 + Math.sin(this.time * 1.6) * 0.18;
    this.interactRing.rotation.z = this.time * 1.2;

    animateWorldProps(this.scene, this.time);
    this.particleField.rotation.y = this.time * 0.012;
    const positions = this.particleField.geometry.attributes['position'] as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i += 1) {
      let y = positions.getY(i) + 0.018 + (i % 7) * 0.002;
      if (y > 14) y = 0.3;
      positions.setY(i, y);
    }
    positions.needsUpdate = true;

    this.grainPass.uniforms['uTime'].value = this.time;
    this.composer.render();
    this.animationId = requestAnimationFrame(this.animate);
  };
}
