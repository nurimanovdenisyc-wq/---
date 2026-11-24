import * as THREE from 'three';
import { state, updateHUD, setWorld } from './state.js';
import { buildCity } from './city.js';
import { buildCircus } from './circus.js';
import { buildMinecraft, removeBlock, placeBlock, getMCGroup } from './minecraft.js';
import { buildRoblox } from './roblox.js';
import { createHuman, animateHuman } from './human.js';
import { audio } from './audio.js';
import { initUI } from './ui.js'; // ОШИБКА: ui.js нет в твоем списке!

// ВНИМАНИЕ! У тебя в репозитории НЕТ файла ui.js. 
// Тебе нужно либо создать его, либо код для UI перенести сюда. 
// Чтобы не усложнять, я добавил код UI прямо в этот файл ниже.

// ===== UI КОД =====
import { robloxGames } from './roblox.js';
function initUI() {
  window.toast = (msg) => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2000);
  };
  window.closeModal = (id) => document.getElementById(id).classList.remove('open');
  window.openModal = (id) => { audio.click(); document.getElementById(id).classList.add('open'); };

  document.getElementById('btnWork').onclick = () => window.openModal('modalWork');
  document.getElementById('btnPhone').onclick = () => window.openModal('modalPhone');
  document.getElementById('btnVR').onclick = () => { if (state.inWorld === 'city') window.openModal('modalVR'); };
  document.getElementById('btnMute').onclick = (e) => { const on = audio.toggle(); e.target.textContent = on ? '🔊' : '🔇'; };

  document.querySelectorAll('[data-vr]').forEach(el => {
    el.onclick = () => {
      window.closeModal('modalVR');
      audio.vrEnter();
      const u = el.dataset.vr;
      if (u === 'circus') window.goToWorld('circus');
      else if (u === 'minecraft') window.goToWorld('minecraft');
      else if (u === 'roblox') { window.goToWorld('roblox'); setTimeout(() => window.openModal('modalRoblox'), 400); }
    };
  });

  window.doJob = (pay, name) => {
    if (state.energy < 10) { audio.error(); return window.toast('😴 Мало энергии!'); }
    state.money += pay; state.level = Math.floor(state.money/500) + 1;
    state.energy = Math.max(0, state.energy - Math.ceil(pay/10)); updateHUD();
    audio.coin(); window.toast(`💼 ${name}: +${pay} ₽`); window.closeModal('modalWork');
  };

  window.startRobloxGame = (gameId) => {
    window.closeModal('modalRoblox');
    const g = robloxGames[gameId];
    document.getElementById('minigameContent').innerHTML = `
      <h2>${g.title}</h2><p>${g.desc}</p><p><b>${g.q}</b></p>
      ${g.answers.map((a,i)=>`<div class="phone-app" onclick="answerRoblox(${i}, ${g.correct}, ${g.reward})"><div class="icon">${['🅰️','🅱️','🅲️'][i]}</div><div class="info"><h4>${a}</h4></div></div>`).join('')}
      <button class="btn-close" onclick="closeModal('modalMinigame')">Закрыть</button>`;
    window.openModal('modalMinigame');
  };
  window.answerRoblox = (idx, correct, reward) => {
    if (idx === correct) { state.money += reward; state.level = Math.floor(state.money/500)+1; updateHUD(); audio.success(); window.toast(`✅ Верно! +${reward} ₽`); }
    else { audio.error(); window.toast('❌ Неверно, попробуй ещё'); }
    window.closeModal('modalMinigame');
  };
}

// ===== СЦЕНА =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a8c4);
scene.fog = new THREE.Fog(0x87a8c4, 50, 200);

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xbfd4e8, 0x555544, 0.7));
const sun = new THREE.DirectionalLight(0xfff2d6, 2.2);
sun.position.set(30, 60, 20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const cityGroup = buildCity();
const circusGroup = buildCircus();
const minecraftGroup = buildMinecraft();
const robloxGroup = buildRoblox();
scene.add(cityGroup, circusGroup, minecraftGroup, robloxGroup);

const player = createHuman({ skinColor: 0xe8b796, shirtColor: 0x4a90e2, pantsColor: 0x2c3e50, hairColor: 0x3b2219, isFemale: false });
scene.add(player);

// Управление
const keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

const joyEl = document.getElementById('joystick'), stickEl = document.getElementById('stick');
let joyActive = false, joyVec = { x:0, y:0 };
function joyStart(e) { joyActive = true; audio.init(); joyMove(e); }
function joyMove(e) {
  if (!joyActive) return; e.preventDefault?.();
  const rect = joyEl.getBoundingClientRect();
  const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
  const pt = e.touches ? e.touches[0] : e;
  let dx = pt.clientX - cx, dy = pt.clientY - cy;
  const max = 45, len = Math.hypot(dx, dy);
  if (len > max) { dx = dx/len*max; dy = dy/len*max; }
  stickEl.style.transform = `translate(${dx}px, ${dy}px)`;
  joyVec.x = dx / max; joyVec.y = dy / max;
}
function joyEnd() { joyActive = false; stickEl.style.transform = 'translate(0,0)'; joyVec = { x:0, y:0 }; }
joyEl.addEventListener('pointerdown', joyStart);
joyEl.addEventListener('pointermove', joyMove);
joyEl.addEventListener('pointerup', joyEnd);
joyEl.addEventListener('pointercancel', joyEnd);
joyEl.addEventListener('pointerleave', joyEnd);

window.goToWorld = (world) => {
  cityGroup.visible = false; circusGroup.visible = false; minecraftGroup.visible = false; robloxGroup.visible = false;
  if (player.parent) player.parent.remove(player);
  state.pos.set(0, 0, 8); setWorld(world);
  if (world === 'city') { cityGroup.visible = true; cityGroup.add(player); scene.background.set(0x87a8c4); scene.fog.color.set(0x87a8c4); document.getElementById('btnBack').classList.remove('show'); audio.startAmbient(); }
  else if (world === 'circus') { circusGroup.visible = true; circusGroup.add(player); scene.background.set(0x1a0a2e); scene.fog.color.set(0x1a0a2e); document.getElementById('btnBack').classList.add('show'); window.toast('🎪 Цирк!'); }
  else if (world === 'minecraft') { minecraftGroup.visible = true; minecraftGroup.add(player); scene.background.set(0x87ceeb); scene.fog.color.set(0x87ceeb); state.pos.set(0, 0, 0); document.getElementById('btnBack').classList.add('show'); window.toast('🟩 Майнкрафт!'); }
  else if (world === 'roblox') { robloxGroup.visible = true; robloxGroup.add(player); scene.background.set(0x1a1a2a); scene.fog.color.set(0x1a1a2a); document.getElementById('btnBack').classList.add('show'); window.toast('🟥 Роблокс!'); }
};
document.getElementById('btnBack').onclick = () => { if (state.inWorld !== 'city') window.goToWorld('city'); };

const clock = new THREE.Clock();
let lastCheck = 0, footstepTimer = 0;
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  let mx = 0, mz = 0;
  if (keys['w']||keys['arrowup']) mz -= 1; if (keys['s']||keys['arrowdown']) mz += 1;
  if (keys['a']||keys['arrowleft']) mx -= 1; if (keys['d']||keys['arrowright']) mx += 1;
  mx += joyVec.x; mz += joyVec.y;
  const len = Math.hypot(mx, mz); let walkSpeed = 0;
  if (len > 0.1) {
    mx /= len; mz /= len; state.pos.x += mx * 5 * dt; state.pos.z += mz * 5 * dt;
    player.rotation.y = Math.atan2(mx, mz); walkSpeed = 1;
    footstepTimer -= dt; if (footstepTimer <= 0) { audio.footstep(); footstepTimer = 0.4; }
  }
  if (state.inWorld === 'city') { state.pos.x = Math.max(-120, Math.min(120, state.pos.x)); state.pos.z = Math.max(-120, Math.min(120, state.pos.z)); }
  else if (state.inWorld === 'circus') { const r = Math.hypot(state.pos.x, state.pos.z); if (r > 32) { state.pos.x *= 32/r; state.pos.z *= 32/r; } }
  else if (state.inWorld === 'minecraft') { state.pos.x = Math.max(-11, Math.min(11, state.pos.x)); state.pos.z = Math.max(-11, Math.min(11, state.pos.z)); }
  else if (state.inWorld === 'roblox') { state.pos.x = Math.max(-25, Math.min(25, state.pos.x)); state.pos.z = Math.max(-25, Math.min(25, state.pos.z)); }
  player.position.x = state.pos.x; player.position.z = state.pos.z;
  animateHuman(player, walkSpeed, dt);
  [cityGroup, circusGroup].forEach(g => { g.children.forEach(c => { if (c.userData.npcName) { 
    c.userData.wanderTimer -= dt; if (c.userData.wanderTimer <= 0) { c.userData.wanderTimer = 2 + Math.random() * 4; c.userData.wanderTarget.copy(c.userData.homePos); c.userData.wanderTarget.x += (Math.random()-0.5)*6; c.userData.wanderTarget.z += (Math.random()-0.5)*6; }
    const dx = c.userData.wanderTarget.x - c.position.x, dz = c.userData.wanderTarget.z - c.position.z, dist = Math.hypot(dx, dz);
    if (dist > 0.5) { c.position.x += (dx/dist) * 1.2 * dt; c.position.z += (dz/dist) * 1.2 * dt; c.rotation.y = Math.atan2(dx, dz); animateHuman(c, 1, dt); } else animateHuman(c, 0, dt);
  }}); });
  const camTarget = new THREE.Vector3(state.pos.x, 1.6, state.pos.z);
  camera.position.lerp(camTarget.clone().add(new THREE.Vector3(0, 3, 6)), 0.1);
  camera.lookAt(camTarget);
  if (state.inWorld === 'roblox' && performance.now() - lastCheck > 500) {
    lastCheck = performance.now();
    robloxGroup.children.forEach(c => { if (c.userData.gameId) { const d = Math.hypot(state.pos.x - c.position.x, state.pos.z - c.position.z); if (d < 2.5 && !document.getElementById('modalRoblox').classList.contains('open') && !document.getElementById('modalMinigame').classList.contains('open')) window.startRobloxGame(c.userData.gameId); }});
  }
  renderer.render(scene, camera);
}

const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(0,0);
renderer.domElement.addEventListener('click', () => {
  if (state.inWorld !== 'minecraft') return;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(getMCGroup().children);
  if (hits.length > 0) { const b = hits[0].object; if (b.userData.type) { removeBlock(b.userData.x, b.userData.y, b.userData.z); audio.blockBreak(); window.toast('⛏️ Блок сломан'); } }
});
renderer.domElement.addEventListener('contextmenu', e => {
  e.preventDefault(); if (state.inWorld !== 'minecraft') return;
  const front = new THREE.Vector3(0,0,-1).applyQuaternion(player.quaternion);
  placeBlock(Math.round(player.position.x + front.x * 2), 0, Math.round(player.position.z + front.z * 2), 'stone');
  audio.blockPlace(); window.toast('🧱 Блок поставлен');
});

initUI(); updateHUD(); window.goToWorld('city'); animate(); window.toast('👋 Добро пожаловать!');
setInterval(() => { if (state.energy < 100) { state.energy++; updateHUD(); } }, 3000);
setInterval(() => { if (state.age < 90) { state.age++; updateHUD(); } }, 60000);
window.addEventListener('resize', () => { camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
