import * as THREE from 'three';
import { AvatarLook } from '../guide/data/avatar-look.types';
import { hexForLook, normalizeAvatarLook, studioOption } from '../guide/data/avatar-studio.catalog';

export interface Bitmoji3DConfig {
  look: AvatarLook;
}

function hexToNum(hex: string): number {
  const h = hex.replace('#', '');
  return parseInt(h.length === 6 ? h : '888888', 16);
}

function darken(hex: number, factor: number): number {
  const c = new THREE.Color(hex);
  c.multiplyScalar(factor);
  return c.getHex();
}

function clayMat(color: number, roughness = 0.82, metalness = 0.04): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

/** Personaje 3D estilo Bitmoji / Snapchat con capas de ropa y género. */
export class Bitmoji3DEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly clothes = new THREE.Group();
  private readonly hairGroup = new THREE.Group();
  private readonly accessories = new THREE.Group();
  private animationId = 0;
  private disposed = false;
  private time = 0;
  private config: Bitmoji3DConfig = { look: normalizeAvatarLook() };

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
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe6e6ea);

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    this.camera.position.set(0, 0.92, 3.15);
    this.camera.lookAt(0, 0.88, 0);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xd8dce8, 0.95);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(1.5, 3.5, 2.5);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xf0f4ff, 0.55);
    fill.position.set(-2.2, 1.8, 1.2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(0, 1.5, -2.5);
    this.scene.add(rim);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    this.scene.add(shadow);

    this.root.add(this.body, this.clothes, this.hairGroup, this.accessories);
    this.scene.add(this.root);
    this.rebuildCharacter();
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

  updateConfig(config: Bitmoji3DConfig): void {
    const next = { look: normalizeAvatarLook(config.look) };
    if (JSON.stringify(this.config) === JSON.stringify(next)) return;
    this.config = next;
    this.rebuildCharacter();
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    this.disposeGroup(this.root);
    this.renderer.dispose();
  }

  private tick = (): void => {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(this.tick);
    this.time += 0.016;
    this.body.position.y = Math.sin(this.time * 1.6) * 0.012;
    this.renderer.render(this.scene, this.camera);
  };

  private disposeGroup(group: THREE.Object3D): void {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const m = obj.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m.dispose();
      }
    });
    group.clear();
  }

  private rebuildCharacter(): void {
    this.disposeGroup(this.body);
    this.disposeGroup(this.clothes);
    this.disposeGroup(this.hairGroup);
    this.disposeGroup(this.accessories);
    this.body.clear();
    this.clothes.clear();
    this.hairGroup.clear();
    this.accessories.clear();

    const look = this.config.look;
    const fem = look.gender === 'feminine';
    const shoulder = fem ? 0.31 : 0.36;
    const hip = fem ? 0.27 : 0.23;
    const headScale = fem ? 1.12 : 1.05;

    const skin = hexToNum(hexForLook(look, 'skin'));
    const hairColor = hexToNum(studioOption(look.hairColor).hex ?? '#3d2314');
    const eyeColor = hexToNum(hexForLook(look, 'eyes'));
    const topColor = hexToNum(hexForLook(look, 'top'));
    const bottomColor = hexToNum(hexForLook(look, 'bottom'));
    const shoeColor = hexToNum(hexForLook(look, 'shoes'));
    const jacketColor = look.jacket !== 'jacket-none' ? hexToNum(hexForLook(look, 'jacket')) : topColor;

    const skinM = clayMat(skin, 0.88, 0.02);
    const topM = clayMat(topColor, 0.78, 0.03);
    const bottomM = clayMat(bottomColor, 0.8, 0.04);
    const shoeM = clayMat(shoeColor, 0.65, 0.08);
    const hairM = clayMat(hairColor, 0.9, 0.02);
    const jacketM = clayMat(jacketColor, 0.85, 0.03);

    this.buildLegs(look, bottomM, shoeM, skinM, fem);
    this.buildTorso(look, topM, skinM, fem, shoulder, hip);
    this.buildArmsPresenting(topM, skinM, jacketM, look, shoulder);
    this.buildHead(skinM, headScale);
    this.buildFace(eyeColor, skin, fem, headScale);
    this.buildHair(look.hairStyle, hairM, fem, headScale);
    this.buildJacket(look, jacketM, shoulder);
    this.buildAccessories(look, headScale);
    this.buildFacialHair(look, hairM, headScale);
  }

  private buildLegs(
    look: AvatarLook,
    bottomM: THREE.MeshStandardMaterial,
    shoeM: THREE.MeshStandardMaterial,
    skinM: THREE.MeshStandardMaterial,
    fem: boolean,
  ): void {
    const wide = look.bottom.includes('wide');
    const skirt = look.bottom.includes('skirt');
    const shorts = look.bottom.includes('shorts');
    const leggings = look.bottom.includes('leggings');
    const gap = fem ? 0.1 : 0.08;
    const legTop = 0.52;
    const legH = 0.62;

    if (skirt) {
      const skirtMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.24, 0.28, 24, 1, true),
        bottomM,
      );
      skirtMesh.position.set(0, legTop + 0.12, 0);
      this.clothes.add(skirtMesh);
      for (const x of [-gap / 2, gap / 2]) {
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, legH, 6, 12), skinM);
        leg.position.set(x, legTop - legH / 2 + 0.02, 0);
        this.body.add(leg);
      }
    } else {
      for (const x of [-gap / 2, gap / 2]) {
        const rTop = leggings ? 0.07 : wide ? 0.09 : 0.08;
        const rBot = wide ? 0.11 : leggings ? 0.075 : 0.085;
        const legGeo = new THREE.CapsuleGeometry(rTop, legH, 8, 14);
        const leg = new THREE.Mesh(legGeo, bottomM);
        leg.position.set(x, legTop - legH / 2 + 0.02, 0);
        leg.scale.set(rBot / rTop, 1, rBot / rTop);
        this.clothes.add(leg);

        if (shorts) {
          const skinLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, legH * 0.55, 6, 10), skinM);
          skinLeg.position.set(x, legTop - legH * 0.72, 0);
          this.body.add(skinLeg);
        }
      }
    }

    for (const x of [-gap / 2, gap / 2]) {
      const heel = look.shoes.includes('heel');
      const shoe = new THREE.Mesh(
        heel
          ? new THREE.BoxGeometry(0.1, 0.06, 0.2)
          : new THREE.BoxGeometry(0.13, 0.07, 0.24),
        shoeM,
      );
      shoe.position.set(x, 0.06, 0.02);
      this.clothes.add(shoe);
      if (heel) {
        const heelBlock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.06), shoeM);
        heelBlock.position.set(x + (x < 0 ? -0.03 : 0.03), 0.03, -0.06);
        this.clothes.add(heelBlock);
      }
    }
  }

  private buildTorso(
    look: AvatarLook,
    topM: THREE.MeshStandardMaterial,
    skinM: THREE.MeshStandardMaterial,
    fem: boolean,
    shoulder: number,
    hip: number,
  ): void {
    const crop = look.top.includes('crop') || (fem && look.top.includes('formal-white') && look.jacket !== 'jacket-none');
    const torsoH = crop ? 0.22 : 0.32;
    const torsoY = crop ? 0.88 : 0.82;

    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(fem ? 0.19 : 0.22, torsoH, 10, 16),
      topM,
    );
    torso.position.set(0, torsoY, 0);
    this.clothes.add(torso);

    if (crop) {
      const midriff = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.1, 16), skinM);
      midriff.position.set(0, 0.72, 0);
      this.body.add(midriff);
    }

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 12), skinM);
    neck.position.set(0, 1.02, 0);
    this.body.add(neck);

    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(hip, hip + 0.02, 0.14, 16),
      look.bottom.includes('skirt') ? skinM : clayMat(hexToNum(hexForLook(look, 'bottom')), 0.82, 0.03),
    );
    pelvis.position.set(0, 0.58, 0);
    this.clothes.add(pelvis);
  }

  private buildArmsPresenting(
    topM: THREE.MeshStandardMaterial,
    skinM: THREE.MeshStandardMaterial,
    jacketM: THREE.MeshStandardMaterial,
    look: AvatarLook,
    shoulder: number,
  ): void {
    const hasJacket = look.jacket !== 'jacket-none';
    const armM = hasJacket ? jacketM : topM;

    for (const side of [-1, 1] as const) {
      const armRoot = new THREE.Group();
      armRoot.position.set(side * shoulder, 0.98, 0);

      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 6, 10), armM);
      upper.position.set(0, -0.08, 0);
      armRoot.add(upper);

      const foreGroup = new THREE.Group();
      foreGroup.position.set(0, -0.2, 0);
      const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.2, 6, 10), armM);
      fore.position.set(0, -0.1, 0);
      foreGroup.add(fore);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), skinM);
      hand.position.set(0, -0.22, 0);
      hand.scale.set(1, 0.85, 0.9);
      foreGroup.add(hand);

      foreGroup.rotation.x = -0.35;
      foreGroup.rotation.z = side * 0.15;
      armRoot.add(foreGroup);

      armRoot.rotation.z = side * -0.55;
      armRoot.rotation.x = -1.05;

      this.body.add(armRoot);
    }
  }

  private buildHead(skinM: THREE.MeshStandardMaterial, headScale: number): void {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), skinM);
    head.position.set(0, 1.28, 0);
    head.scale.set(0.95 * headScale, 1.05 * headScale, 0.92 * headScale);
    this.body.add(head);
  }

  private buildFace(eyeColor: number, skin: number, fem: boolean, headScale: number): void {
    const y = 1.3;
    const z = 0.2 * headScale;

    for (const x of [-0.075, 0.075]) {
      const white = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 16, 16),
        clayMat(0xffffff, 0.35, 0),
      );
      white.position.set(x, y, z);
      white.scale.set(1.1, 1.15, 0.45);
      this.body.add(white);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), clayMat(eyeColor, 0.4, 0.05));
      iris.position.set(x, y - 0.005, z + 0.018);
      this.body.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), clayMat(0x1a1a22, 0.3, 0));
      pupil.position.set(x + 0.004, y - 0.008, z + 0.028);
      this.body.add(pupil);

      const highlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 6, 6),
        clayMat(0xffffff, 0.2, 0),
      );
      highlight.position.set(x + 0.012, y + 0.012, z + 0.032);
      this.body.add(highlight);

      if (fem) {
        for (const lx of [-0.022, 0, 0.022]) {
          const lash = new THREE.Mesh(
            new THREE.BoxGeometry(0.004, 0.018, 0.004),
            clayMat(0x1a1a1a, 0.7, 0),
          );
          lash.position.set(x + lx, y + 0.038, z + 0.01);
          lash.rotation.z = lx * 2;
          this.body.add(lash);
        }
      }
    }

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), clayMat(darken(skin, 0.92), 0.9, 0));
    nose.position.set(0, y - 0.06, z + 0.02);
    nose.scale.set(0.8, 0.6, 0.7);
    this.body.add(nose);

    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.006, 6, 16, Math.PI),
      clayMat(fem ? 0xd87888 : darken(skin, 0.85), 0.75, 0),
    );
    smile.position.set(0, y - 0.12, z + 0.015);
    smile.rotation.x = Math.PI * 0.95;
    this.body.add(smile);

    for (const x of [-0.11, 0.11]) {
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.012), clayMat(0x2a2018, 0.85, 0));
      brow.position.set(x, y + 0.055, z + 0.005);
      brow.rotation.z = x < 0 ? 0.12 : -0.12;
      this.body.add(brow);
    }
  }

  private buildHair(style: AvatarLook['hairStyle'], hairM: THREE.MeshStandardMaterial, fem: boolean, headScale: number): void {
    const y = 1.32;
    const cap = (h: number, r = 0.245) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(r * headScale, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.52),
        hairM,
      );
      mesh.position.set(0, y + 0.04, -0.02);
      mesh.scale.set(1.02, h, 1);
      this.hairGroup.add(mesh);
    };

    switch (style) {
      case 'hs-buzz':
        cap(0.35, 0.238);
        break;
      case 'hs-short':
        cap(0.42);
        break;
      case 'hs-bob':
        cap(0.55);
        for (const x of [-0.14, 0.14]) {
          const side = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.12, 4, 8), hairM);
          side.position.set(x, y - 0.08, 0.04);
          this.hairGroup.add(side);
        }
        break;
      case 'hs-long':
      case 'hs-wavy':
        cap(0.48);
        for (const x of [-0.13, 0.13]) {
          const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.42, 6, 10), hairM);
          strand.position.set(x, y - 0.28, 0.03);
          this.hairGroup.add(strand);
        }
        break;
      case 'hs-ponytail':
        cap(0.45);
        const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.28, 6, 10), hairM);
        tail.position.set(0, y + 0.12, -0.12);
        tail.rotation.x = -0.4;
        this.hairGroup.add(tail);
        break;
      case 'hs-bun':
        cap(0.42);
        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), hairM);
        bun.position.set(0, y + 0.22, -0.06);
        this.hairGroup.add(bun);
        break;
      case 'hs-curly':
        cap(0.5);
        for (const [x, yy, z] of [
          [-0.12, y + 0.02, 0.06],
          [0.12, y + 0.02, 0.06],
          [0, y + 0.12, -0.04],
          [-0.08, y - 0.02, 0.1],
          [0.08, y - 0.02, 0.1],
        ] as const) {
          const curl = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), hairM);
          curl.position.set(x, yy, z);
          this.hairGroup.add(curl);
        }
        break;
      case 'hs-braids':
        cap(0.44);
        for (const x of [-0.14, 0.14]) {
          const braid = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.38, 4, 8), hairM);
          braid.position.set(x, y - 0.22, 0.04);
          this.hairGroup.add(braid);
        }
        break;
      default:
        cap(fem ? 0.5 : 0.45);
        if (fem || style === 'hs-medium') {
          for (const x of [-0.12, 0.12]) {
            const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.18, 4, 8), hairM);
            strand.position.set(x, y - 0.12, 0.04);
            this.hairGroup.add(strand);
          }
        }
    }
  }

  private buildJacket(look: AvatarLook, jacketM: THREE.MeshStandardMaterial, shoulder: number): void {
    if (look.jacket === 'jacket-none') return;

    const open = look.jacket.includes('cardigan') || look.jacket.includes('blazer') || look.jacket.includes('coat');

    if (open) {
      for (const side of [-1, 1] as const) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.38, 0.06), jacketM);
        panel.position.set(side * 0.14, 0.86, 0.04);
        panel.rotation.y = side * 0.25;
        this.clothes.add(panel);
        const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.34, 6, 10), jacketM);
        sleeve.position.set(side * (shoulder + 0.04), 0.88, 0);
        sleeve.rotation.z = side * -0.5;
        sleeve.rotation.x = -0.9;
        this.clothes.add(sleeve);
      }
    } else {
      const jacket = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.4, 0.22), jacketM);
      jacket.position.set(0, 0.86, 0);
      this.clothes.add(jacket);
    }
  }

  private buildFacialHair(look: AvatarLook, hairM: THREE.MeshStandardMaterial, headScale: number): void {
    if (look.gender !== 'masculine' || look.facialHair === 'fh-none') return;
    const y = 1.22;
    const z = 0.18 * headScale;

    switch (look.facialHair) {
      case 'fh-stubble':
        const stubble = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), hairM);
        stubble.position.set(0, y - 0.08, z);
        stubble.scale.set(1.2, 0.7, 0.5);
        stubble.material = hairM.clone();
        (stubble.material as THREE.MeshStandardMaterial).transparent = true;
        (stubble.material as THREE.MeshStandardMaterial).opacity = 0.35;
        this.accessories.add(stubble);
        break;
      case 'fh-beard-full':
      case 'fh-beard-short': {
        const h = look.facialHair === 'fh-beard-full' ? 0.18 : 0.12;
        const beard = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairM);
        beard.position.set(0, y - 0.1, z - 0.02);
        beard.scale.set(1.1, h / 0.14, 0.85);
        this.accessories.add(beard);
        break;
      }
      case 'fh-goatee': {
        const goatee = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.1, 4, 8), hairM);
        goatee.position.set(0, y - 0.14, z + 0.02);
        this.accessories.add(goatee);
        break;
      }
      case 'fh-mustache':
      case 'fh-mustache-handlebar': {
        const stache = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI), hairM);
        stache.position.set(0, y - 0.04, z + 0.02);
        stache.rotation.x = Math.PI / 2;
        this.accessories.add(stache);
        break;
      }
    }
  }

  private buildAccessories(look: AvatarLook, headScale: number): void {
    const y = 1.28;
    const z = 0.22 * headScale;

    if (look.headwear === 'hat-cap-black' || look.headwear === 'hat-cap-red') {
      const color = hexToNum(hexForLook(look, 'headwear'));
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 24), clayMat(color, 0.7, 0.05));
      brim.position.set(0, y + 0.18, 0.06);
      this.accessories.add(brim);
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
        clayMat(color, 0.7, 0.05),
      );
      dome.position.set(0, y + 0.16, -0.02);
      this.accessories.add(dome);
    }
    if (look.headwear === 'hat-beanie-navy' || look.headwear === 'hat-beanie-orange') {
      const color = hexToNum(hexForLook(look, 'headwear'));
      const beanie = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
        clayMat(color, 0.85, 0.03),
      );
      beanie.position.set(0, y + 0.2, -0.02);
      this.accessories.add(beanie);
    }
    if (look.headwear === 'hat-headband-sport') {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 8, 24), clayMat(0xc0392b, 0.7, 0.05));
      band.position.set(0, y + 0.08, 0);
      band.rotation.x = Math.PI / 2;
      this.accessories.add(band);
    }

    if (look.eyewear.startsWith('glasses-round') || look.eyewear.startsWith('glasses-reading')) {
      const frameColor = look.eyewear.includes('tortoise') ? 0x6a4030 : 0x222222;
      for (const x of [-0.075, 0.075]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.006, 8, 20), clayMat(frameColor, 0.5, 0.1));
        ring.position.set(x, y, z + 0.01);
        this.accessories.add(ring);
      }
    }
    if (look.eyewear.startsWith('glasses-shade')) {
      for (const x of [-0.075, 0.075]) {
        const lens = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.045, 0.02),
          clayMat(look.eyewear.includes('mirror') ? 0x6b8cff : 0x111111, 0.3, 0.2),
        );
        lens.position.set(x, y, z + 0.02);
        this.accessories.add(lens);
      }
    }

    if (look.earrings !== 'ear-none') {
      const gold = 0xf4c542;
      for (const x of [-0.26, 0.26]) {
        if (look.earrings.includes('hoops')) {
          const hoop = new THREE.Mesh(
            new THREE.TorusGeometry(look.earrings.includes('large') ? 0.035 : 0.025, 0.004, 6, 16),
            clayMat(gold, 0.6, 0.3),
          );
          hoop.position.set(x * headScale, y - 0.02, 0);
          this.accessories.add(hoop);
        } else {
          const stud = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), clayMat(gold, 0.5, 0.3));
          stud.position.set(x * headScale, y - 0.02, 0.02);
          this.accessories.add(stud);
        }
      }
    }

    if (look.necklace !== 'neck-none') {
      const chainColor = look.necklace.includes('silver') ? 0xc0c0c0 : 0xf4c542;
      const chain = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.004, 6, 24, Math.PI),
        clayMat(chainColor, 0.45, 0.35),
      );
      chain.position.set(0, 1.06, 0.06);
      chain.rotation.x = Math.PI * 0.85;
      this.accessories.add(chain);
    }
  }
}

/** @deprecated Usar Bitmoji3DEngine — alias de compatibilidad. */
export class Avatar3DEngine extends Bitmoji3DEngine {
  updateConfigLegacy(config: {
    avatarId?: string;
    accessories?: unknown;
    appearance?: unknown;
    look?: AvatarLook;
  }): void {
    if (config.look) {
      this.updateConfig({ look: config.look });
    }
  }
}
