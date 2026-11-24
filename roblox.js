import * as THREE from 'three';
import { createHuman } from './human.js';

export function buildRoblox() {
  const group = new THREE.Group();
  group.name = 'roblox';
  group.visible = false;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.5, metalness: 0.4 })
  );
  floor.rotation.x = -Math.PI/2;
  floor.receiveShadow = true;
  group.add(floor);

  const games = [
    { id:'disaster', name:'🌪️ Disaster', color:0x3498db, pos:[-12, 0, -10] },
    { id:'adopt', name:'🐶 Adopt Me', color:0xe91e63, pos:[-4, 0, -10] },
    { id:'tower', name:'🗼 Tower of Hell', color:0xff9800, pos:[4, 0, -10] },
    { id:'brookhaven', name:'🏡 Brookhaven', color:0x4caf50, pos:[12, 0, -10] },
    { id:'piggy', name:'🐷 Piggy', color:0xf44336, pos:[0, 0, 10] }
  ];

  games.forEach(g => {
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 0.4, 32),
      new THREE.MeshStandardMaterial({ color: g.color, roughness: 0.3, metalness: 0.5, emissive: g.color, emissiveIntensity: 0.3 })
    );
    pad.position.set(g.pos[0], 0.2, g.pos[2]);
    pad.userData.gameId = g.id;
    group.add(pad);

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 10, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: g.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
    );
    beam.position.set(g.pos[0], 5, g.pos[2]);
    group.add(beam);

    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 96;
    const cx = cv.getContext('2d');
    cx.fillStyle = 'rgba(0,0,0,0.8)'; cx.fillRect(0,0,512,96);
    cx.font = 'bold 36px sans-serif'; cx.fillStyle = '#fff'; cx.textAlign='center'; cx.textBaseline='middle';
    cx.fillText(g.name, 256, 48);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }));
    sp.scale.set(6, 1.1, 1);
    sp.position.set(g.pos[0], 4, g.pos[2]);
    group.add(sp);

    const npc = createHuman({ shirtColor: g.color, pantsColor: 0x333333, hairColor: 0x1a1a1a });
    npc.position.set(g.pos[0] + 3, 0, g.pos[2] + 2);
    npc.rotation.y = Math.PI;
    group.add(npc);
  });

  const logo = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x550000, metalness: 0.6, roughness: 0.3 })
  );
  logo.position.set(0, 6, -22);
  group.add(logo);

  return group;
}

export const robloxGames = {
  disaster: { title:'🌪️ Natural Disaster Survival', desc:'Выживи в катастрофе!', q:'Что делать при землетрясении?', answers:['Спрятаться под стол','Бежать в центр','Стоять на месте'], correct:0, reward:80 },
  adopt: { title:'🐶 Adopt Me', desc:'Покорми питомца!', q:'Чем кормить собаку?', answers:['Шоколад','Корм для собак','Чипсы'], correct:1, reward:60 },
  tower: { title:'🗼 Tower of Hell', desc:'Поднимись на башню!', q:'Как пройти сложный участок?', answers:['Прыгать наугад','Идти медленно и точно','Сдаться'], correct:1, reward:100 },
  brookhaven: { title:'🏡 Brookhaven RP', desc:'Жизнь в городке', q:'Что купить в первую очередь?', answers:['Дом','Луну','Танк'], correct:0, reward:70 },
  piggy: { title:'🐷 Piggy', desc:'Сбеги от Пингви!', q:'Где найти ключ?', answers:['В шкафу','На полу в комнате','У Пингви'], correct:1, reward:120 }
};
