import * as THREE from 'three';
import { grassTexture, asphaltTexture, brickTexture, concreteTexture } from './textures.js';
import { spawnNPCs } from './human.js';

export function buildCity() {
  const cityGroup = new THREE.Group();
  cityGroup.name = 'city';

  // Земля с текстурой
  const groundGeo = new THREE.PlaneGeometry(300, 300);
  const groundMat = new THREE.MeshStandardMaterial({
    map: grassTexture(),
    roughness: 0.95
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  cityGroup.add(ground);

  // Дороги
  const roadMat = new THREE.MeshStandardMaterial({ map: asphaltTexture(), roughness: 0.9 });
  const road1 = new THREE.Mesh(new THREE.PlaneGeometry(300, 10), roadMat);
  road1.rotation.x = -Math.PI/2;
  road1.position.y = 0.02;
  road1.receiveShadow = true;
  cityGroup.add(road1);
  const road2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 300), roadMat);
  road2.rotation.x = -Math.PI/2;
  road2.position.y = 0.02;
  road2.receiveShadow = true;
  cityGroup.add(road2);

  // Разметка
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffee88, roughness: 0.6, emissive: 0x443300, emissiveIntensity: 0.2 });
  for (let i = -30; i <= 30; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 2), lineMat);
    line.position.set(i * 4, 0.04, 0);
    cityGroup.add(line);
    const line2 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.02, 0.3), lineMat);
    line2.position.set(0, 0.04, i * 4);
    cityGroup.add(line2);
  }

  // Здания
  const brickTex = brickTexture('#c9b89c');
  const concreteTex = concreteTexture();
  const buildingSpecs = [
    { x:-25, z:-20, w:8, h:12, d:8, mat: brickTex },
    { x:-15, z:-22, w:7, h:18, d:7, mat: concreteTex },
    { x:12, z:-20, w:9, h:15, d:8, mat: brickTex },
    { x:25, z:-18, w:7, h:22, d:7, mat: concreteTex },
    { x:32, z:8, w:8, h:10, d:8, mat: brickTex },
    { x:-30, z:10, w:9, h:14, d:9, mat: brickTex },
    { x:-20, z:22, w:8, h:20, d:8, mat: concreteTex },
    { x:15, z:25, w:10, h:12, d:9, mat: brickTex },
    { x:28, z:28, w:7, h:16, d:7, mat: concreteTex },
    { x:-40, z:-30, w:10, h:25, d:10, mat: concreteTex },
    { x:42, z:-30, w:9, h:18, d:9, mat: brickTex },
    { x:-42, z:32, w:9, h:14, d:9, mat: brickTex },
    { x:42, z:32, w:11, h:20, d:10, mat: concreteTex }
  ];

  buildingSpecs.forEach(b => {
    const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
    const mat = new THREE.MeshStandardMaterial({ map: b.mat, roughness: 0.7, metalness: 0.1 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(b.x, b.h/2, b.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    cityGroup.add(mesh);

    // Крыша
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(b.w + 0.3, 0.4, b.d + 0.3),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6 })
    );
    roof.position.set(b.x, b.h + 0.2, b.z);
    roof.castShadow = true;
    cityGroup.add(roof);

    // Окна
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x6a90b0, roughness: 0.1, metalness: 0.8,
      transparent: true, opacity: 0.85
    });
    const rows = Math.floor(b.h / 2.2);
    const cols = Math.floor(b.w / 1.8);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.1), glassMat);
        win.position.set(b.x - b.w/2 + 1.3 + c*1.8, 1.5 + r*2.2, b.z + b.d/2 + 0.06);
        cityGroup.add(win);
        const winB = win.clone();
        winB.position.z = b.z - b.d/2 - 0.06;
        cityGroup.add(winB);
      }
    }
  });

  // Деревья
  for (let i = 0; i < 25; i++) {
    const x = (Math.random()-0.5) * 180;
    const z = (Math.random()-0.5) * 180;
    if (Math.abs(x) < 8 || Math.abs(z) < 8) continue;
    createTree(cityGroup, x, z);
  }

  // VR-Салон
  buildVRSalon(cityGroup);

  // NPC
  const npcPositions = [
    [5, 5], [-5, 3], [10, -5], [-10, -3], [3, 15], [-3, 18],
    [8, -15], [-8, -18], [15, 8], [-15, 5], [20, -10], [-20, -8]
  ];
  const npcNames = ['Анна','Михаил','София','Давид','Елена','Олег','Мария','Иван','Ольга','Артём','Ксения','Дмитрий'];
  cityGroup.userData.npcs = spawnNPCs(cityGroup, npcPositions, npcNames);

  // Машины
  createCar(cityGroup, -18, 0, 0xe74c3c);
  createCar(cityGroup, 20, 0, 0x3498db);
  createCar(cityGroup, 0, -18, 0x2ecc71);
  createCar(cityGroup, 0, 22, 0xf39c12);

  return cityGroup;
}

function createTree(parent, x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 1 })
  );
  trunk.position.set(x, 1.5, z);
  trunk.castShadow = true;
  parent.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6e1f, roughness: 0.9 });
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.2 + Math.random()*0.4, 8, 6), leafMat);
    leaf.position.set(x + (Math.random()-0.5)*1.5, 3 + Math.random()*1.2, z + (Math.random()-0.5)*1.5);
    leaf.castShadow = true;
    parent.add(leaf);
  }
}

function createCar(parent, x, z, color) {
  const carGroup = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.8, 4.2),
    new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.7 })
  );
  body.position.y = 0.7;
  body.castShadow = true;
  carGroup.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.7, 2),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.9 })
  );
  cabin.position.set(0, 1.35, -0.2);
  cabin.castShadow = true;
  carGroup.add(cabin);

  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
  [[-0.9, -1.3], [0.9, -1.3], [-0.9, 1.3], [0.9, 1.3]].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI/2;
    wheel.position.set(wx, 0.35, wz);
    wheel.castShadow = true;
    carGroup.add(wheel);
  });

  const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 2 });
  const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.1), hlMat);
  hl1.position.set(-0.6, 0.75, 2.1);
  carGroup.add(hl1);
  const hl2 = hl1.clone();
  hl2.position.x = 0.6;
  carGroup.add(hl2);

  carGroup.position.set(x, 0, z);
  parent.add(carGroup);
}

function buildVRSalon(parent) {
  const vrX = 0, vrZ = -25;
  const vrBase = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6, 7, 32),
    new THREE.MeshStandardMaterial({ color: 0x1a1a3a, roughness: 0.15, metalness: 0.9 })
  );
  vrBase.position.set(vrX, 3.5, vrZ);
  vrBase.castShadow = true;
  vrBase.receiveShadow = true;
  parent.add(vrBase);

  const vrDome = new THREE.Mesh(
    new THREE.SphereGeometry(6, 32, 16, 0, Math.PI*2, 0, Math.PI/2),
    new THREE.MeshStandardMaterial({ color: 0x2a2a5a, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.9 })
  );
  vrDome.position.set(vrX, 7, vrZ);
  vrDome.castShadow = true;
  parent.add(vrDome);

  const neonRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.1, 0.15, 16, 48),
    new THREE.MeshStandardMaterial({ color: 0xa55eea, emissive: 0xa55eea, emissiveIntensity: 3 })
  );
  neonRing.rotation.x = Math.PI/2;
  neonRing.position.set(vrX, 7, vrZ);
  parent.add(neonRing);

  const vrSign = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xffd93d, emissive: 0xffd93d, emissiveIntensity: 2 })
  );
  vrSign.position.set(vrX, 11, vrZ);
  parent.add(vrSign);
  parent.userData.vrSign = vrSign;

  const vrLight = new THREE.PointLight(0xa55eea, 3, 25);
  vrLight.position.set(vrX, 8, vrZ);
  parent.add(vrLight);
     }
