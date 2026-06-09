import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { toDisplayGlbUrl } from '../ready-player-me/rpm.utils';

const IDLE_ANIMATION =
  'https://readyplayerme.github.io/visage/animations/emote-idle.glb';

/** Renderiza avatares GLB de Ready Player Me con iluminación estilo Bitmoji. */
export class RpmAvatarEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly root = new THREE.Group();
  private readonly loader: GLTFLoader;
  private readonly draco: DRACOLoader;
  private mixer: THREE.AnimationMixer | null = null;
  private animationId = 0;
  private disposed = false;
  private time = 0;
  private loadingToken = 0;
  private currentUrl = '';

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe4e4ea);

    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    this.camera.position.set(0, 1.05, 2.85);

    this.draco = new DRACOLoader();
    this.draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.draco);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xc8ccd8, 1.05);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(2.5, 4, 3);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xe8eeff, 0.65);
    fill.position.set(-2.5, 2, 2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.4);
    rim.position.set(0, 2.5, -3);
    this.scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.09 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);

    this.scene.add(this.root);
  }

  init(width: number, height: number): void {
    this.resize(width, height);
    this.tick();
  }

  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  loadAvatar(url: string): void {
    const displayUrl = toDisplayGlbUrl(url);
    if (!displayUrl || displayUrl === this.currentUrl) return;
    this.currentUrl = displayUrl;
    const token = ++this.loadingToken;

    void this.loadModel(displayUrl, token);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    this.clearRoot();
    this.mixer = null;
    this.draco.dispose();
    this.renderer.dispose();
  }

  private async loadModel(url: string, token: number): Promise<void> {
    try {
      const gltf = await this.loader.loadAsync(url);
      if (token !== this.loadingToken || this.disposed) return;

      this.clearRoot();
      this.mixer = null;

      const model = gltf.scene;
      model.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      this.frameModel(model);
      this.root.add(model);

      if (gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(model);
        this.mixer.clipAction(gltf.animations[0]).play();
      } else {
        await this.tryIdleAnimation(model, token);
      }
    } catch {
      if (token !== this.loadingToken) return;
      this.currentUrl = '';
    }
  }

  private async tryIdleAnimation(model: THREE.Object3D, token: number): Promise<void> {
    try {
      const animGltf = await this.loader.loadAsync(IDLE_ANIMATION);
      if (token !== this.loadingToken || this.disposed || !animGltf.animations.length) return;
      this.mixer = new THREE.AnimationMixer(model);
      this.mixer.clipAction(animGltf.animations[0]).play();
    } catch {
      /* sin animación */
    }
  }

  private frameModel(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box.min.y;

    const targetHeight = 1.75;
    const scale = targetHeight / Math.max(size.y, 0.01);
    model.scale.setScalar(scale);

    const headY = size.y * scale * 0.82;
    this.camera.position.set(0, headY * 0.55, 2.85);
    this.camera.lookAt(0, headY * 0.45, 0);
  }

  private clearRoot(): void {
    while (this.root.children.length) {
      const child = this.root.children[0];
      this.root.remove(child);
      child.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = obj.material;
          if (Array.isArray(mats)) mats.forEach((m) => m.dispose());
          else mats.dispose();
        }
      });
    }
  }

  private tick = (): void => {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(this.tick);
    const dt = 0.016;
    this.time += dt;
    this.mixer?.update(dt);
    this.root.rotation.y = Math.sin(this.time * 0.2) * 0.04;
    this.renderer.render(this.scene, this.camera);
  };
}
