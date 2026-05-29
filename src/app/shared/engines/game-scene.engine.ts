import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { POSTFX_PRESETS, PostFxPreset, SoftVignetteShader } from './game-scene.postfx';

export type SceneIntensity = 'login' | 'ambient';

/**
 * Motor WebGL — laboratorio psicológico elegante.
 * Partículas suaves, red neural mínima, sin sobrecarga visual.
 */
export class GameSceneEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly composer: EffectComposer | null;
  private readonly bloomPass: UnrealBloomPass | null;
  private readonly vignettePass: ShaderPass | null;
  private readonly postFx: PostFxPreset;
  private readonly particleField: THREE.Points;
  private readonly neuralMesh: THREE.LineSegments;
  private readonly mindOrb: THREE.Group;
  private readonly waveRing: THREE.Mesh;
  private readonly floatNodes: THREE.Group;
  private animationId = 0;
  private disposed = false;
  private mouseX = 0;
  private mouseY = 0;
  private time = 0;

  /** Paleta Match Villains — joyas sobre violeta profundo */
  private static readonly PALETTE = {
    sapphire: 0x6b8cff,
    amethyst: 0x7b5cbf,
    rose: 0xd65db1,
    gold: 0xf4c542,
    lavender: 0x9b8fd9,
    deep: 0x13102a,
  };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly intensity: SceneIntensity = 'ambient',
  ) {
    this.postFx = { ...POSTFX_PRESETS[intensity] };

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, intensity === 'login' ? 1.5 : 1.25));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.postFx.exposure;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(GameSceneEngine.PALETTE.deep, intensity === 'login' ? 0.022 : 0.028);

    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
    this.camera.position.set(0, 0.3, 14);

    const count = intensity === 'login' ? 720 : 420;
    this.particleField = this.createParticleField(count);
    this.neuralMesh = this.createNeuralMesh(count);
    this.mindOrb = this.createMindOrb();
    this.waveRing = this.createWaveRing();
    this.floatNodes = this.createFloatNodes();

    this.scene.add(this.particleField, this.neuralMesh, this.mindOrb, this.waveRing, this.floatNodes);
    this.createLights();

    if (this.postFx.enabled) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));

      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        this.postFx.bloomStrength,
        this.postFx.bloomRadius,
        this.postFx.bloomThreshold,
      );
      this.composer.addPass(this.bloomPass);

      this.vignettePass = new ShaderPass(SoftVignetteShader);
      this.vignettePass.uniforms['uVignette'].value = this.postFx.vignette;
      this.vignettePass.uniforms['uWarmth'].value = this.postFx.warmth;
      this.composer.addPass(this.vignettePass);
      this.composer.addPass(new OutputPass());
    } else {
      this.composer = null;
      this.bloomPass = null;
      this.vignettePass = null;
    }
  }

  init(width: number, height: number): void {
    this.resize(width, height);
    this.animate();
  }

  setMouse(normalizedX: number, normalizedY: number): void {
    this.mouseX = normalizedX;
    this.mouseY = normalizedY;
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);

    if (this.bloomPass) {
      const scale = POSTFX_PRESETS[this.intensity].bloomResolutionScale;
      this.bloomPass.resolution.set(
        Math.max(256, Math.floor(width * scale)),
        Math.max(256, Math.floor(height * scale)),
      );
    }
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    this.particleField.geometry.dispose();
    (this.particleField.material as THREE.Material).dispose();
    this.neuralMesh.geometry.dispose();
    (this.neuralMesh.material as THREE.Material).dispose();
    this.waveRing.geometry.dispose();
    (this.waveRing.material as THREE.Material).dispose();
    this.disposeGroup(this.mindOrb);
    this.disposeGroup(this.floatNodes);
    this.composer?.dispose();
    this.renderer.dispose();
  }

  private disposeGroup(group: THREE.Group): void {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mat = obj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
  }

  private createParticleField(count: number): THREE.Points {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color(GameSceneEngine.PALETTE.sapphire),
      new THREE.Color(GameSceneEngine.PALETTE.lavender),
      new THREE.Color(GameSceneEngine.PALETTE.amethyst),
    ];

    for (let i = 0; i < count; i += 1) {
      const radius = 14 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.45;
      positions[i * 3 + 2] = radius * Math.cos(phi) - 10;

      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: this.intensity === 'login' ? 0.07 : 0.055,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
  }

  private createNeuralMesh(particleCount: number): THREE.LineSegments {
    const positions = this.particleField.geometry.attributes['position'] as THREE.BufferAttribute;
    const maxLines = this.intensity === 'login' ? 55 : 32;
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const color = new THREE.Color(GameSceneEngine.PALETTE.lavender);

    for (let i = 0; i < maxLines; i += 1) {
      const a = Math.floor(Math.random() * particleCount);
      let b = Math.floor(Math.random() * particleCount);
      if (b === a) b = (b + 1) % particleCount;

      const ax = positions.getX(a);
      const ay = positions.getY(a);
      const az = positions.getZ(a);
      const bx = positions.getX(b);
      const by = positions.getY(b);
      const bz = positions.getZ(b);
      const dist = Math.hypot(ax - bx, ay - by, az - bz);
      if (dist > 9) continue;

      linePositions.push(ax, ay, az, bx, by, bz);
      lineColors.push(color.r, color.g, color.b, color.r * 0.5, color.g * 0.5, color.b * 0.5);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    return new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
      }),
    );
  }

  private createMindOrb(): THREE.Group {
    const group = new THREE.Group();
    const scale = this.intensity === 'login' ? 1.0 : 0.75;

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4 * scale, 1),
      new THREE.MeshStandardMaterial({
        color: GameSceneEngine.PALETTE.amethyst,
        emissive: GameSceneEngine.PALETTE.amethyst,
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0.18,
        wireframe: true,
      }),
    );
    shell.position.set(0, 0.15, -6);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.35 * scale, 16, 16),
      new THREE.MeshStandardMaterial({
        color: GameSceneEngine.PALETTE.sapphire,
        emissive: GameSceneEngine.PALETTE.sapphire,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.35,
      }),
    );
    core.position.set(0, 0.15, -6);

    group.add(shell, core);
    return group;
  }

  private createWaveRing(): THREE.Mesh {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(this.intensity === 'login' ? 2.8 : 2.2, 0.018, 6, 96),
      new THREE.MeshBasicMaterial({
        color: GameSceneEngine.PALETTE.gold,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    );
    ring.position.set(0, -1.2, -7);
    ring.rotation.x = Math.PI * 0.42;
    return ring;
  }

  private createFloatNodes(): THREE.Group {
    const group = new THREE.Group();
    const count = this.intensity === 'login' ? 6 : 4;
    const palette = [GameSceneEngine.PALETTE.sapphire, GameSceneEngine.PALETTE.rose, GameSceneEngine.PALETTE.gold];

    for (let i = 0; i < count; i += 1) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({
          color: palette[i % palette.length],
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
        }),
      );
      const angle = (i / count) * Math.PI * 2;
      node.position.set(Math.cos(angle) * (6 + i * 0.5), (Math.random() - 0.5) * 3, Math.sin(angle) * 4 - 9);
      node.userData['phase'] = Math.random() * Math.PI * 2;
      group.add(node);
    }

    return group;
  }

  private createLights(): void {
    this.scene.add(new THREE.AmbientLight(0x2a2048, 0.65));
    const key = new THREE.PointLight(GameSceneEngine.PALETTE.sapphire, 0.9, 50);
    key.position.set(4, 3, 6);
    this.scene.add(key);

    const fill = new THREE.PointLight(GameSceneEngine.PALETTE.amethyst, 0.5, 40);
    fill.position.set(-5, -2, 4);
    this.scene.add(fill);
  }

  private animate = (): void => {
    if (this.disposed) return;

    this.time += 0.0018;

    this.particleField.rotation.y = this.time * 0.018;
    this.neuralMesh.rotation.y = this.time * 0.012;
    this.mindOrb.rotation.y = Math.sin(this.time * 0.35) * 0.06;
    this.mindOrb.position.y = Math.sin(this.time * 0.5) * 0.06;
    this.waveRing.rotation.z = this.time * 0.12;
    this.waveRing.scale.setScalar(1 + Math.sin(this.time * 0.8) * 0.015);

    this.floatNodes.children.forEach((node, i) => {
      const phase = (node.userData['phase'] as number) ?? 0;
      node.position.y += Math.sin(this.time * 0.6 + phase) * 0.0008;
      const mat = (node as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(this.time * 0.7 + i) * 0.08;
    });

    const targetX = this.mouseX * 0.9;
    const targetY = this.mouseY * 0.6;
    this.camera.position.x += (targetX - this.camera.position.x) * 0.018;
    this.camera.position.y += (0.3 - targetY - this.camera.position.y) * 0.018;
    this.camera.lookAt(0, 0, -4);

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.animationId = requestAnimationFrame(this.animate);
  };
}
