import * as THREE from 'three';

export const state = {
  money: 500,
  level: 1,
  age: 7,
  energy: 100,
  pos: new THREE.Vector3(0, 0, 5),
  inWorld: 'city',
  soundOn: true
};

export function updateHUD() {
  document.getElementById('money').textContent = state.money;
  document.getElementById('level').textContent = state.level;
  document.getElementById('age').textContent = state.age;
  document.getElementById('energy').textContent = state.energy;
}

export function addMoney(amount) {
  state.money += amount;
  state.level = Math.floor(state.money / 500) + 1;
  updateHUD();
}

export function spendEnergy(amount) {
  state.energy = Math.max(0, state.energy - amount);
  updateHUD();
}

export function setWorld(world) {
  state.inWorld = world;
}
