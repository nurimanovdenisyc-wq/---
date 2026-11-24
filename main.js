import * as THREE from 'three';
import { state, updateHUD, setWorld } from './state.js';
import { buildCity } from './city.js';
import { buildCircus } from './circus.js';
import { buildMinecraft, removeBlock, placeBlock, getMCGroup } from './minecraft.js';
import { buildRoblox } from './roblox.js';
import { createHuman, animateHuman } from './human.js';
import { audio } from './audio.js';
import { initUI } from './ui.js';

// ===== СЦЕНА =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a8c4);
scene.fog = new THREE.Fog(0x87a8c4, 50, 200);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference:'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('game').appendChild(renderer.domElement);

// Свет
scene.add(new THREE.HemisphereLight(0xbfd4e8, 0x555544, 0.7));
const sun = new THREE.DirectionalLight(0xfff2d6, 2.2);
sun.position.set(30, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
sun.shadow.bias = -0.0005;
scene.add(sun);
const fillLight = new THREE.DirectionalLight(0x99bbdd, 0.3);
fillLight.position.set(-20, 30, -20);
scene.add(fillLight);

// Миры
const cityGroup = buildCity();
const circusGroup = buildCircus();
const minecraftGroup = buildMinecraft();
const robloxGroup = buildRoblox();
scene.add(cityGroup, circusGroup, minecraftGroup, robloxGroup);

// Игрок
const player = createHuman({
  skinColor: 0xe8b796,
  shirtColor: 0x4a90e2,
  pantsColor: 0x2c3e50,
  hairColor: 0x3b2219,
  isFemale: false
});
scene.add(player);

// ===== УПРАВЛЕНИЕ =====
const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

const joyEl = document.getElementById('joystick');
const stickEl = document.getElementById('stick');
let joyActive = false, joyVec = { x:0, y:0 };

function joyStart(e) { joyActive = true; audio.init(); joyMove(e); }
function joyMove(e) {
  if (!joyActive) return;
  e.preventDefault?.();
  const rect = joyEl.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  const pt = e.touches ? e.touches[0] : e;
  let dx = pt.clientX - cx;
  let dy = pt.clientY - cy;
  const max = 45;
  const len = Math.hypot(dx, dy);
  if (len > max) { dx = dx/len*max; dy = dy/len*max; }
  stickEl.style.transform = `translate(${dx}px, ${dy}px)`;
  joyVec.x = dx / max;
  joyVec.y = dy / max;
}
function joyEnd() {
  joyActive = false;
  stickEl.style.transform = 'translate(0,0)';
  joyVec = { x:0, y:0 };
}
joyEl.addEventListener('pointerdown', joyStart);
joyEl.addEventListener('pointermove', joyMove);
joyEl.addEventListener('pointerup', joyEnd);
joyEl.addEventListener('pointercancel', joyEnd);
joyEl.addEventListener('pointerleave', joyEnd);

// ===== ПЕРЕКЛЮЧЕНИЕ МИРОВ =====
window.goToWorld = (world) => {
  cityGroup.visible = false;
  circusGroup.visible = false;
  minecraftGroup.visible = false;
  robloxGroup.visible = false;

  if (player.parent) player.parent.remove(player);
  state.pos.set(0, 0, 8);
  setWorld(world);

  if (world === 'city') {
    cityGroup.visible = true;
    cityGroup.add(player);
    scene.background.set(0x87a8c4);
    scene.fog.color.set(0x87a8c4);
    document.getElementById('btnBack').classList.remove('show');
    audio.startAmbient();
  } else if (world === 'circus') {
    circusGroup.visible = true;
    circusGroup.add(player);
    scene.background.set(0x1a0a2e);
    scene.fog.color.set(0x1a0a2e);
    document.getElementById('btnBack').classList.add('show');
    window.toast('🎪 Добро пожаловать в Цифровой Цирк!');
  } else if (world === 'minecraft') {
    minecraftGroup.visible = true;
    minecraftGroup.add(player);
    scene.background.set(0x87ceeb);
    scene.fog.color.set(0x87ceeb);
    state.pos.set(0, 0, 0);
    document.getElementById('btnBack').classList.add('show');
    window.toast('🟩 Майнкрафт — ломай и строй!');
  } else if (world === 'roblox') {
    robloxGroup.visible = true;
    robloxGroup.add(player);
    scene.background.set(0x1a1a2a);
    scene.fog.color.set(0x1a1a2a);
    document.getElementById('btnBack').classList.add('show');
    window.toast('🟥 Хаб Roblox');
  }
};

document.getElementById('btnBack').onclick = () => {
  if (state.inWorld !== 'city') window.goToWorld('city');
};

// ===== ИГРОВОЙ ЦИКЛ =====
const clock = new THREE.Clock();
let lastCheck = 0;
let footstepTimer = 0;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  const speed = 5;
  let mx = 0, mz = 0;
  if (keys['w']||keys['arrowup']) mz -= 1;
  if (keys['s']||keys['arrowdown']) mz += 1;
  if (keys['a']||keys['arrowleft']) mx -= 1;
  if (keys['d']||keys['arrowright']) mx += 1;
  mx += joyVec.x;
  mz += joyVec.y;
  const len = Math.hypot(mx, mz);
  let walkSpeed = 0;

  if (len > 0.1) {
    mx /= len; mz /= len;
    state.pos.x += mx * speed * dt;
    state.pos.z += mz * speed * dt;
    player.rotation.y = Math.atan2(mx, mz);
    walkSpeed = 1;

    // Шаги
    footstepTimer -= dt;
    if (footstepTimer <= 0) {
      audio.footstep();
      footstepTimer = 0.4;
    }
  }

  // Ограничения
  if (state.inWorld === 'city') {
    state.pos.x = Math.max(-120, Math.min(120, state.pos.x));
    state.pos.z = Math.max(-120, Math.min(120, state.pos.z));
  } else if (state.inWorld === 'circus') {
    const r = Math.hypot(state.pos.x, state.pos.z);
    if (r > 32) { state.pos.x *= 32/r; state.pos.z *= 32/r; }
  } else if (state.inWorld === 'minecraft') {
    state.pos.x = Math.max(-11, Math.min(11, state.pos.x));
    state.pos.z = Math.max(-11, Math.min(11, state.pos.z));
  } else if (state.inWorld === 'roblox') {
    state.pos.x = Math.max(-25, Math.min(25, state.pos.x));
    state.pos.z = Math.max(-25, Math.min(25, state.pos.z));
  }

  player.position.x = state.pos.x;
  player.position.z = state.pos.z;
  animateHuman(player, walkSpeed, dt);

  // NPC
  const allNPCs = [];
  [cityGroup, circusGroup].forEach(g => {
    g.children.forEach(c => { if (c.userData.npcName) allNPCs.push(c); });
  });

  allNPCs.forEach(npc => {
    npc.userData.wanderTimer -= dt;
    if (npc.userData.wanderTimer <= 0) {
      npc.userData.wanderTimer = 2 + Math.random() * 4;
      npc.userData.wanderTarget.copy(npc.userData.homePos);
      npc.userData.wanderTarget.x += (Math.random()-0.5) * 6;
      npc.userData.wanderTarget.z += (Math.random()-0.5) * 6;
    }
    const dx = npc.userData.wanderTarget.x - npc.position.x;
    const dz = npc.userData.wanderTarget.z - npc.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.5) {
      npc.position.x += (dx/dist) * 1.2 * dt;
      npc.position.z += (dz/dist) * 1.2 * dt;
      npc.rotation.y = Math.atan2(dx, dz);
      animateHuman(npc, 1, dt);
    } else {
      animateHuman(npc, 0, dt);
    }
  });

  // VR знак
  const vrSign = cityGroup.userData.vrSign;
  if (vrSign) {
    vrSign.position.y = 11 + Math.sin(performance.now()/500) * 0.5;
    vrSign.rotation.y += dt;
  }

  // Цирк: шары
  if (circusGroup.visible) {
    circusGroup.children.forEach(c => {
      if (c.userData.float !== undefined) {
        c.position.y += Math.sin(performance.now()/1000 + c.userData.float) * dt * 0.5;
      }
    });
  }

  // Камера
  const camTarget = new THREE.Vector3(state.pos.x, 1.6, state.pos.z);
  const camOffset = new THREE.Vector3(0, 3, 6);
  camera.position.lerp(camTarget.clone().add(camOffset), 0.1);
  camera.lookAt(camTarget);

  // Роблокс: плиты
  if (state.inWorld === 'roblox' && performance.now() - lastCheck > 500) {
    lastCheck = performance.now();
    robloxGroup.children.forEach(c => {
      if (c.userData.gameId) {
        const d = Math.hypot(state.pos.x - c.position.x, state.pos.z - c.position.z);
        if (d < 2.5 && !document.getElementById('modalRoblox').classList.contains('open') && !document.getElementById('modalMinigame').classList.contains('open')) {
          window.startRobloxGame(c.userData.gameId);
        }
      }
    });
  }

  renderer.render(scene, camera);
}

// ===== МАЙНКРАФТ =====
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0, 0);
renderer.domElement.addEventListener('click', () => {
  if (state.inWorld !== 'minecraft') return;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(getMCGroup().children);
  if (hits.length > 0) {
    const b = hits[0].object;
    if (b.userData.type) {
      removeBlock(b.userData.x, b.userData.y, b.userData.z);
      audio.blockBreak();
      window.toast('⛏️ Блок сломан');
    }
  }
});
renderer.domElement.addEventListener('contextmenu', e => {
  e.preventDefault();
  if (state.inWorld !== 'minecraft') return;
  const front = new THREE.Vector3(0,0,-1).applyQuaternion(player.quaternion);
  const nx = Math.round(player.position.x + front.x * 2);
  const nz = Math.round(player.position.z + front.z * 2);
  placeBlock(nx, 0, nz, 'stone');
  audio.blockPlace();
  window.toast('🧱 Блок поставлен');
});

// ===== СТАРТ =====
initUI();
updateHUD();
window.goToWorld('city');
animate();
window.toast('👋 Добро пожаловать в Песочницу 3D!');

setInterval(() => {
  if (state.energy < 100) { state.energy++; updateHUD(); }
}, 3000);
setInterval(() => {
  if (state.age < 90) { state.age++; updateHUD(); }
}, 60000);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
