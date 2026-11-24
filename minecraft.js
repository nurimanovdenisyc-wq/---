import * as THREE from 'three';
import { mcGrassTexture, mcDirtTexture, mcStoneTexture, woodTexture } from './textures.js';

const BLOCK = 1;
let mcGroup, mcBlocks;

export function buildMinecraft() {
  mcGroup = new THREE.Group();
  mcGroup.name = 'minecraft';
  mcGroup.visible = false;
  mcBlocks = {};

  for (let x = -12; x <= 12; x++) {
    for (let z = -12; z <= 12; z++) {
      addBlock(x, -1, z, 'grass');
      addBlock(x, -2, z, 'dirt');
      addBlock(x, -3, z, 'stone');
    }
  }

  addBlock(3, 0, 3, 'wood');
  addBlock(3, 1, 3, 'wood');
  addBlock(3, 2, 3, 'wood');
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = 3; dy <= 4; dy++) {
        if (dx === 0 && dz === 0 && dy === 3) continue;
        addBlock(3+dx, dy, 3+dz, 'leaves');
      }
    }
  }

  return mcGroup;
}

function addBlock(x, y, z, type) {
  const key = `${x},${y},${z}`;
  if (mcBlocks[key]) return;
  const textures = {
    grass: mcGrassTexture(),
    dirt: mcDirtTexture(),
    stone: mcStoneTexture(),
    wood: woodTexture(),
    leaves: mcGrassTexture()
  };
  const colors = { grass: 0x6ab04c, dirt: 0x8b5a2b, stone: 0x888888, wood: 0x6b4f2f, leaves: 0x2ecc71 };
  const geo = new THREE.BoxGeometry(BLOCK, BLOCK, BLOCK);
  const mat = new THREE.MeshStandardMaterial({ map: textures[type], color: colors[type] || 0xffffff, roughness: 0.9 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { type, x, y, z };
  mcGroup.add(mesh);
  mcBlocks[key] = mesh;
}

export function removeBlock(x, y, z) {
  const key = `${x},${y},${z}`;
  if (mcBlocks[key]) {
    mcGroup.remove(mcBlocks[key]);
    delete mcBlocks[key];
  }
}

export function placeBlock(x, y, z, type = 'stone') {
  addBlock(x, y, z, type);
}

export function getMCGroup() { return mcGroup; }
export function getMCBlocks() { return mcBlocks; }
