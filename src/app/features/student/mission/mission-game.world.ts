import * as THREE from 'three';

export const WORLD = { w: 62, d: 42 };

const PALETTE = { deep: 0x06050f, floor: 0x0e0c1a, cyan: 0x4fc3ff, purple: 0xa855f7, magenta: 0xd65db1, gold: 0xf4c542 };

/** Construye el mundo mental futurista — arquitectura, props, neón, hologramas. */
export function buildMissionWorld(scene: THREE.Scene): THREE.Mesh {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD.w + 8, WORLD.d + 8, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: PALETTE.floor,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.8,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'floor';
  scene.add(floor);

  const grid = new THREE.GridHelper(WORLD.w + 2, 48, PALETTE.purple, 0x2a2550);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  grid.position.y = 0.015;
  scene.add(grid);

  addPerimeterArchitecture(scene);
  addNeonCorridors(scene);
  addFloatingProps(scene);
  addHoloMonoliths(scene);
  addGroundMist(scene);

  return floor;
}

function addPerimeterArchitecture(scene: THREE.Scene): void {
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x12101f,
    emissive: PALETTE.purple,
    emissiveIntensity: 0.06,
    metalness: 0.5,
    roughness: 0.55,
  });

  const segments = [
    { pos: [0, 6, -WORLD.d / 2 - 3], rot: [0, 0, 0], size: [WORLD.w + 10, 12, 1] },
    { pos: [0, 6, WORLD.d / 2 + 3], rot: [0, Math.PI, 0], size: [WORLD.w + 10, 12, 1] },
    { pos: [-WORLD.w / 2 - 3, 6, 0], rot: [0, Math.PI / 2, 0], size: [WORLD.d + 6, 12, 1] },
    { pos: [WORLD.w / 2 + 3, 6, 0], rot: [0, -Math.PI / 2, 0], size: [WORLD.d + 6, 12, 1] },
  ] as const;

  for (const s of segments) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(s.size[0], s.size[1], s.size[2]), wallMat);
    wall.position.set(s.pos[0], s.pos[1], s.pos[2]);
    wall.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
    wall.receiveShadow = true;
    scene.add(wall);
    addWindowGrid(scene, wall.position, s.rot[1]);
  }

  for (let i = 0; i < 14; i += 1) {
    const x = (Math.random() - 0.5) * WORLD.w * 0.85;
    const z = (Math.random() - 0.5) * WORLD.d * 0.85;
    if (Math.abs(x) < 4 && Math.abs(z) < 4) continue;
    const h = 4 + Math.random() * 8;
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(1.2 + Math.random(), h, 1.2 + Math.random()),
      new THREE.MeshStandardMaterial({
        color: 0x15122a,
        emissive: i % 3 === 0 ? PALETTE.cyan : PALETTE.purple,
        emissiveIntensity: 0.12,
        metalness: 0.65,
        roughness: 0.35,
      }),
    );
    tower.position.set(x, h / 2, z);
    tower.castShadow = true;
    tower.receiveShadow = true;
    scene.add(tower);

    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(tower.scale.x * 1.05, 0.08, tower.scale.z * 1.05),
      new THREE.MeshStandardMaterial({
        color: PALETTE.cyan,
        emissive: PALETTE.cyan,
        emissiveIntensity: 1.2,
      }),
    );
    neon.position.set(x, 0.5 + Math.random() * (h - 1), z);
    scene.add(neon);
  }
}

function addWindowGrid(scene: THREE.Scene, base: THREE.Vector3, rotY: number): void {
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 10; c += 1) {
      if (Math.random() > 0.55) continue;
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 1.2),
        new THREE.MeshStandardMaterial({
          color: PALETTE.cyan,
          emissive: Math.random() > 0.5 ? PALETTE.cyan : PALETTE.magenta,
          emissiveIntensity: 0.4 + Math.random() * 0.5,
          transparent: true,
          opacity: 0.75,
        }),
      );
      const ox = (c - 4.5) * 2.2;
      const oy = 2 + r * 2.2;
      win.position.set(base.x + ox * Math.cos(rotY), oy, base.z + ox * Math.sin(rotY));
      win.rotation.y = rotY;
      scene.add(win);
    }
  }
}

function addNeonCorridors(scene: THREE.Scene): void {
  for (let i = -3; i <= 3; i += 1) {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.06, 8, 32, Math.PI),
      new THREE.MeshStandardMaterial({
        color: PALETTE.purple,
        emissive: PALETTE.purple,
        emissiveIntensity: 0.9,
        metalness: 0.8,
        roughness: 0.2,
      }),
    );
    arch.position.set(i * 8, 3.2, -WORLD.d / 2 + 6);
    arch.rotation.z = Math.PI;
    scene.add(arch);

    const pl = new THREE.PointLight(PALETTE.purple, 0.5, 10);
    pl.position.copy(arch.position);
    scene.add(pl);
  }
}

function addFloatingProps(scene: THREE.Scene): void {
  for (let i = 0; i < 20; i += 1) {
    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.15 + Math.random() * 0.2, 0),
      new THREE.MeshStandardMaterial({
        color: PALETTE.cyan,
        emissive: PALETTE.cyan,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.7,
      }),
    );
    orb.position.set(
      (Math.random() - 0.5) * WORLD.w * 0.9,
      2 + Math.random() * 6,
      (Math.random() - 0.5) * WORLD.d * 0.9,
    );
    orb.userData['phase'] = Math.random() * Math.PI * 2;
    orb.userData['baseY'] = orb.position.y;
    scene.add(orb);
  }
}

function addHoloMonoliths(scene: THREE.Scene): void {
  const positions = [
    [-WORLD.w * 0.35, -WORLD.d * 0.3],
    [WORLD.w * 0.3, -WORLD.d * 0.15],
    [-WORLD.w * 0.25, WORLD.d * 0.25],
    [WORLD.w * 0.35, WORLD.d * 0.32],
  ];
  for (const [x, z] of positions) {
    const mono = new THREE.Group();
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 4.5, 0.35),
      new THREE.MeshStandardMaterial({
        color: 0x111028,
        emissive: PALETTE.cyan,
        emissiveIntensity: 0.15,
        metalness: 0.9,
        roughness: 0.15,
      }),
    );
    slab.position.y = 2.25;
    const holo = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.1, 32),
      new THREE.MeshBasicMaterial({
        color: PALETTE.magenta,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    holo.rotation.x = -Math.PI / 2;
    holo.position.y = 3.5;
    mono.add(slab, holo);
    mono.position.set(x, 0, z);
    scene.add(mono);
  }
}

function addGroundMist(scene: THREE.Scene): void {
  const mist = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD.w, WORLD.d),
    new THREE.MeshBasicMaterial({
      color: PALETTE.purple,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    }),
  );
  mist.rotation.x = -Math.PI / 2;
  mist.position.y = 0.4;
  scene.add(mist);
}

export function setupMissionLighting(scene: THREE.Scene): THREE.DirectionalLight {
  scene.add(new THREE.HemisphereLight(0x6b8cff, 0x0a0818, 0.45));
  scene.add(new THREE.AmbientLight(0x2a2048, 0.25));

  const sun = new THREE.DirectionalLight(PALETTE.cyan, 1.35);
  sun.position.set(18, 28, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  sun.shadow.bias = -0.0002;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(PALETTE.magenta, 0.55);
  rim.position.set(-20, 12, -10);
  scene.add(rim);

  const gold = new THREE.DirectionalLight(PALETTE.gold, 0.25);
  gold.position.set(0, 8, -20);
  scene.add(gold);

  return sun;
}

export function animateWorldProps(scene: THREE.Scene, time: number): void {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.userData['phase'] !== undefined) {
      const phase = obj.userData['phase'] as number;
      const baseY = obj.userData['baseY'] as number;
      obj.position.y = baseY + Math.sin(time * 0.8 + phase) * 0.35;
      obj.rotation.y = time * 0.4 + phase;
    }
  });
}

export function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
