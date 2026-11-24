import * as THREE from 'three';
import { createHuman } from './human.js';

export function buildCircus() {
  const group = new THREE.Group();
  group.name = 'circus';
  group.visible = false;

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(35, 64),
    new THREE.MeshStandardMaterial({ color: 0x3a1a5e, roughness: 0.2, metalness: 0.5 })
  );
  floor.rotation.x = -Math.PI/2;
  floor.receiveShadow = true;
  group.add(floor);

  // Кольца
  for (let r = 5; r <= 32; r += 4.5) {
    const colors = [0xff69b4, 0x00bfff, 0xffd700, 0xff1493];
    const c = colors[Math.floor(r/4.5) % 4];
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.08, 8, 96),
      new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.5 })
    );
    ring.rotation.x = Math.PI/2;
    ring.position.y = 0.03;
    group.add(ring);
  }

  // Шатры
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const x = Math.cos(angle) * 40;
    const z = Math.sin(angle) * 40;
    const tentColor = [0xff1493, 0x00bfff, 0xffd700, 0xff6600][i%4];

    const tent = new THREE.Mesh(
      new THREE.ConeGeometry(5, 14, 16),
      new THREE.MeshStandardMaterial({ color: tentColor, roughness: 0.4, metalness: 0.3, emissive: tentColor, emissiveIntensity: 0.15 })
    );
    tent.position.set(x, 7, z);
    tent.castShadow = true;
    group.add(tent);

    for (let s = 0; s < 8; s++) {
      const sa = (s / 8) * Math.PI * 2;
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 14, 4),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 })
      );
      stripe.position.set(x + Math.cos(sa)*2.5, 7, z + Math.sin(sa)*2.5);
      group.add(stripe);
    }
  }

  // Персонажи
  const chars = [
    { name:'Помни', pos:[10, 0, 8], shirt:0xff69b4, pants:0xff1493, hair:0xff69b4, skin:0xffdbac, female:true },
    { name:'Джингл', pos:[-10, 0, 8], shirt:0x00bfff, pants:0x1e90ff, hair:0x00bfff, skin:0xf1c27d, female:false },
    { name:'Кейн', pos:[0, 0, -15], shirt:0xffffff, pants:0x222222, hair:0x1a1a1a, skin:0xe8b796, female:false },
    { name:'Рэгс', pos:[14, 0, -6], shirt:0x9b59b6, pants:0x6c3483, hair:0x8b4513, skin:0xc68642, female:false },
    { name:'Джейкс', pos:[-14, 0, -6], shirt:0xff4500, pants:0x222222, hair:0x1a1a1a, skin:0xd4a574, female:false }
  ];

  chars.forEach(c => {
    const npc = createHuman({
      skinColor: c.skin, shirtColor: c.shirt, pantsColor: c.pants,
      hairColor: c.hair, isFemale: c.female
    });
    npc.position.set(c.pos[0], 0, c.pos[2]);
    npc.userData.npcName = c.name;
    npc.userData.wanderTimer = Math.random() * 3;
    npc.userData.homePos = npc.position.clone();
    npc.userData.wanderTarget = npc.position.clone();
    group.add(npc);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.05, 8, 32),
      new THREE.MeshStandardMaterial({ color: c.shirt, emissive: c.shirt, emissiveIntensity: 2 })
    );
    halo.rotation.x = Math.PI/2;
    halo.position.set(c.pos[0], 0.05, c.pos[2]);
    group.add(halo);
  });

  // Парящие шары
  for (let i = 0; i < 40; i++) {
    const c = [0xff69b4, 0x00bfff, 0xffd700, 0xffffff][i%4];
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.5, roughness: 0.2 })
    );
    ball.position.set((Math.random()-0.5)*70, Math.random()*25+3, (Math.random()-0.5)*70);
    ball.userData.float = Math.random() * Math.PI * 2;
    group.add(ball);
  }

  // Свет
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const light = new THREE.PointLight([0xff69b4, 0x00bfff, 0xffd700][i%3], 2, 30);
    light.position.set(Math.cos(angle)*20, 10, Math.sin(angle)*20);
    group.add(light);
  }

  return group;
}
