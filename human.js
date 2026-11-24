import * as THREE from 'three';
import { skinTexture } from './textures.js';

export function createHuman(options = {}) {
  const {
    skinColor = 0xe8b796,
    shirtColor = 0x4a90e2,
    pantsColor = 0x2c3e50,
    hairColor = 0x3b2219,
    shoeColor = 0x1a1a1a,
    isFemale = false
  } = options;

  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.85 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.6 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.5 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const eyeDarkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2 });
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x8b3a3a, roughness: 0.4 });

  // ГОЛОВА
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.75;

  const headGeo = new THREE.SphereGeometry(0.18, 24, 24);
  headGeo.scale(1, 1.15, 0.95);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.castShadow = true;
  headGroup.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.12, 16), skinMat);
  neck.position.y = -0.22;
  neck.castShadow = true;
  headGroup.add(neck);

  const hairGeo = new THREE.SphereGeometry(0.19, 24, 16, 0, Math.PI*2, 0, Math.PI/2);
  hairGeo.scale(1, 1.2, 1);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 0.02;
  hair.castShadow = true;
  headGroup.add(hair);

  if (isFemale) {
    const longHair = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.20, 0.3, 16, 1, true), hairMat);
    longHair.position.set(0, -0.15, -0.05);
    headGroup.add(longHair);
  }

  // Глаза
  const eyeLGeo = new THREE.SphereGeometry(0.025, 12, 12);
  eyeLGeo.scale(1, 1.2, 0.5);
  const eyeL = new THREE.Mesh(eyeLGeo, eyeWhiteMat);
  eyeL.position.set(-0.06, 0.02, 0.16);
  headGroup.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.06;
  headGroup.add(eyeR);

  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), eyeDarkMat);
  pupilL.position.set(-0.06, 0.02, 0.18);
  headGroup.add(pupilL);
  const pupilR = pupilL.clone();
  pupilR.position.x = 0.06;
  headGroup.add(pupilR);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 8), skinMat);
  nose.rotation.x = -Math.PI/2;
  nose.position.set(0, -0.03, 0.17);
  headGroup.add(nose);

  const mouthGeo = new THREE.SphereGeometry(0.03, 12, 8);
  mouthGeo.scale(1, 0.4, 0.3);
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, -0.09, 0.16);
  headGroup.add(mouth);

  const earGeo = new THREE.SphereGeometry(0.035, 12, 12);
  earGeo.scale(0.6, 1, 0.4);
  const earL = new THREE.Mesh(earGeo, skinMat);
  earL.position.set(-0.17, 0, 0);
  headGroup.add(earL);
  const earR = earL.clone();
  earR.position.x = 0.17;
  headGroup.add(earR);

  group.add(headGroup);

  // ТОРС
  const chestGeo = new THREE.CapsuleGeometry(0.22, 0.35, 8, 16);
  chestGeo.scale(1, 1, isFemale ? 0.85 : 0.9);
  const chest = new THREE.Mesh(chestGeo, shirtMat);
  chest.position.y = 1.15;
  chest.castShadow = true;
  chest.receiveShadow = true;
  group.add(chest);

  const hipsGeo = new THREE.CapsuleGeometry(0.20, 0.15, 8, 16);
  hipsGeo.scale(1, 1, 0.9);
  const hips = new THREE.Mesh(hipsGeo, pantsMat);
  hips.position.y = 0.82;
  hips.castShadow = true;
  group.add(hips);

  // РУКИ
  function createArm(side) {
    const armGroup = new THREE.Group();
    const sign = side === 'L' ? -1 : 1;
    armGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), shirtMat));
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.25, 6, 12), shirtMat);
    upper.position.y = -0.15;
    upper.castShadow = true;
    armGroup.add(upper);
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.25, 6, 12), skinMat);
    forearm.position.y = -0.45;
    forearm.castShadow = true;
    armGroup.add(forearm);
    const handGeo = new THREE.SphereGeometry(0.065, 12, 12);
    handGeo.scale(1, 1.2, 0.7);
    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.y = -0.63;
    armGroup.add(hand);
    armGroup.position.set(sign * 0.28, 1.3, 0);
    return armGroup;
  }
  const armL = createArm('L');
  const armR = createArm('R');
  group.add(armL, armR);

  // НОГИ
  function createLeg(side) {
    const legGroup = new THREE.Group();
    const sign = side === 'L' ? -1 : 1;
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.35, 6, 12), pantsMat);
    thigh.position.y = -0.2;
    thigh.castShadow = true;
    legGroup.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.35, 6, 12), pantsMat);
    shin.position.y = -0.62;
    shin.castShadow = true;
    legGroup.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.25), shoeMat);
    foot.position.set(0, -0.86, 0.05);
    foot.castShadow = true;
    legGroup.add(foot);
    legGroup.position.set(sign * 0.11, 0.75, 0);
    return legGroup;
  }
  const legL = createLeg('L');
  const legR = createLeg('R');
  group.add(legL, legR);

  group.userData = { armL, armR, legL, legR, headGroup, _phase: 0 };
  return group;
}

export function animateHuman(human, walkSpeed, dt) {
  const { armL, armR, legL, legR } = human.userData;
  if (!armL) return;
  if (walkSpeed > 0.1) {
    human.userData._phase += dt * 8;
    const swing = Math.sin(human.userData._phase) * 0.6 * Math.min(walkSpeed, 1);
    armL.rotation.x = swing;
    armR.rotation.x = -swing;
    legL.rotation.x = -swing * 0.8;
    legR.rotation.x = swing * 0.8;
    human.position.y = Math.abs(Math.sin(human.userData._phase * 2)) * 0.03;
  } else {
    armL.rotation.x *= 0.9;
    armR.rotation.x *= 0.9;
    legL.rotation.x *= 0.9;
    legR.rotation.x *= 0.9;
    human.position.y *= 0.9;
  }
}

export function spawnNPCs(parentGroup, positions, names) {
  const skinTones = [0xe8b796, 0xc68642, 0x8d5524, 0xf1c27d, 0xffdbac, 0xd4a574];
  const shirtColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0x9b59b6, 0xf39c12, 0x1abc9c, 0xe91e63];
  const pantsColors = [0x2c3e50, 0x34495e, 0x1a1a1a, 0x5d4037, 0x37474f];
  const hairColors = [0x3b2219, 0x1a1a1a, 0x8b4513, 0xc19a6b, 0xffd700];

  return positions.map((pos, i) => {
    const npc = createHuman({
      skinColor: skinTones[i % skinTones.length],
      shirtColor: shirtColors[i % shirtColors.length],
      pantsColor: pantsColors[i % pantsColors.length],
      hairColor: hairColors[i % hairColors.length],
      isFemale: i % 2 === 0
    });
    npc.position.set(pos[0], 0, pos[1]);
    npc.rotation.y = Math.random() * Math.PI * 2;
    npc.userData.npcName = names[i % names.length];
    npc.userData.wanderTimer = Math.random() * 3;
    npc.userData.homePos = npc.position.clone();
    npc.userData.wanderTarget = npc.position.clone();
    parentGroup.add(npc);
    return npc;
  });
}
