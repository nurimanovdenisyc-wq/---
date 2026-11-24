import * as THREE from 'three';

// Ловим ошибки и показываем их на экране
window.onerror = function(msg, url, line) {
  const el = document.getElementById('toast');
  if(el) {
    el.textContent = "ОШИБКА: " + msg;
    el.style.background = "red";
    el.style.color = "white";
    el.classList.add('show');
    el.style.opacity = 1;
  }
  return false;
};

import { state, updateHUD, setWorld } from './state.js';
import { buildCity } from './city.js';
import { buildCircus } from './circus.js';
import { buildMinecraft, removeBlock, placeBlock, getMCGroup } from './minecraft.js';
import { buildRoblox, robloxGames } from './roblox.js';
import { createHuman, animateHuman } from './human.js';
import { audio } from './audio.js';

// Встроенный UI
function initUI() {
  window.toast = (msg) => {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2000);
  };
  window.closeModal = (id) => document.getElementById(id).classList.remove('open');
  window.openModal = (id) => { if(audio) audio.click(); document.getElementById(id).classList.add('open'); };
  document.getElementById('btnWork').onclick = () => window.openModal('modalWork');
  document.getElementById('btnPhone').onclick = () => window.openModal('modalPhone');
  document.getElementById('btnVR').onclick = () => { if (state.inWorld === 'city') window.openModal('modalVR'); };
  document.getElementById('btnMute').onclick = (e) => { 
    if(audio) { const on = audio.toggle(); e.target.textContent = on ? '🔊' : '🔇'; }
  };
  document.querySelectorAll('[data-vr]').forEach(el => {
    el.onclick = () => {
      window.closeModal('modalVR');
      if(audio) audio.vrEnter();
      const u = el.dataset.vr;
      if (u === 'circus') window.goToWorld('circus');
      else if (u === 'minecraft') window.goToWorld('minecraft');
      else if (u === 'roblox') { window.goToWorld('roblox'); setTimeout(() => window.openModal('modalRoblox'), 400); }
    };
  });
  window.doJob = (pay, name) => {
    if (state.energy < 10) return window.toast('😴 Мало энергии!');
    state.money += pay; state.level = Math.floor(state.money/500) + 1;
    state.energy = Math.max(0, state.energy - Math.ceil(pay/10)); updateHUD();
    if(audio) audio.coin();
    window.toast(`💼 ${name}: +${pay} ₽`); window.closeModal('modalWork');
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
    if (idx === correct) { state.money += reward; updateHUD(); if(audio) audio.success(); window.toast(`✅ Верно! +${reward} ₽`); }
    else { if(audio) audio.error(); window.toast('❌ Неверно'); }
    window.closeModal('modalMinigame');
  };
}

// Инициализация 3D
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a8c4);
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(30, 60, 20); sun.castShadow = true;
scene.add(sun);

// Строим миры (если тут ошибка — она вылезет в тост)
try {
  const cityGroup = buildCity();
  const circusGroup = buildCircus();
  const minecraftGroup = buildMinecraft();
  const robloxGroup = buildRoblox();
  scene.add(cityGroup, circusGroup, minecraftGroup, robloxGroup);

  const player = createHuman({ skinColor: 0xe8b796, shirtColor: 0x4a90e2, pantsColor: 0x2c3e50, hairColor: 0x3b2219 });
  scene.add(player);

  // Управление и логика
  const keys = {};
  document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
  
  const joyEl = document.getElementById('joystick'), stickEl = document.getElementById('stick');
  let joyActive = false, joyVec = { x:0, y:0 };
  joyEl.addEventListener('pointerdown', (e) => { joyActive = true; if(audio) audio.init(); });
  joyEl.addEventListener('pointermove', (e) => {
    if (!joyActive) return; e.preventDefault();
    const rect = joyEl.getBoundingClientRect();
    let dx = (e.touches ? e.touches[0].clientX : e.clientX) - (rect.left + rect.width/2);
    let dy = (e.touches ? e.touches[0].clientY : e.clientY) - (rect.top + rect.height/2);
    const max = 45, len = Math.hypot(dx, dy);
    if (len > max) { dx = dx/len*max; dy = dy/len*max; }
    stickEl.style.transform = `translate(${dx}px, ${dy}px)`;
    joyVec.x = dx / max; joyVec.y = dy / max;
  });
  joyEl.addEventListener('pointerup', () => { joyActive = false; stickEl.style.transform = 'translate(0,0)'; joyVec = { x:0, y:0 }; });
  joyEl.addEventListener('pointercancel', () => { joyActive = false; stickEl.style.transform = 'translate(0,0)'; joyVec = { x:0, y:0 }; });

  window.goToWorld = (world) => {
    cityGroup.visible = false; circusGroup.visible = false; minecraftGroup.visible = false; robloxGroup.visible = false;
    if (player.parent) player.parent.remove(player);
    state.pos.set(0, 0, 8); setWorld(world);
    if (world === 'city') { cityGroup.visible = true; cityGroup.add(player); scene.background.set(0x87a8c4); document.getElementById('btnBack').classList.remove('show'); }
    else if (world === 'circus') { circusGroup.visible = true; circusGroup.add(player); scene.background.set(0x1a0a2e); document.getElementById('btnBack').classList.add('show'); }
    else if (world === 'minecraft') { minecraftGroup.visible = true; minecraftGroup.add(player); scene.background.set(0x87ceeb); state.pos.set(0, 0, 0); document.getElementById('btnBack').classList.add('show'); }
    else if (world === 'roblox') { robloxGroup.visible = true; robloxGroup.add(player); scene.background.set(0x1a1a2a); document.getElementById('btnBack').classList.add('show'); }
  };
  document.getElementById('btnBack').onclick = () => { if (state.inWorld !== 'city') window.goToWorld('city'); };

  const clock = new THREE.Clock();
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
    }
    player.position.x = state.pos.x; player.position.z = state.pos.z;
    animateHuman(player, walkSpeed, dt);
    const camTarget = new THREE.Vector3(state.pos.x, 1.6, state.pos.z);
    camera.position.lerp(camTarget.clone().add(new THREE.Vector3(0, 3, 6)), 0.1);
    camera.lookAt(camTarget);
    renderer.render(scene, camera);
  }

  initUI(); updateHUD(); window.goToWorld('city'); animate(); window.toast('👋 Игра запущена!');
  window.addEventListener('resize', () => { camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

} catch (error) {
  // Если игра упала при загрузке — показываем текст ошибки прямо на экране
  window.toast("ОШИБКА ЗАГРУЗКИ: " + error.message);
  const el = document.getElementById('toast');
  el.style.background = "red"; el.style.opacity = 1; el.style.transform = "translateX(-50%) translateY(0)";
    }
