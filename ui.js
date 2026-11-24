import { state, addMoney, updateHUD } from './state.js';
import { audio } from './audio.js';
import { robloxGames } from './roblox.js';

export function initUI() {
  // Toast
  window.toast = (msg) => {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2000);
  };

  // Модалки
  window.closeModal = (id) => document.getElementById(id).classList.remove('open');
  window.openModal = (id) => {
    audio.click();
    document.getElementById(id).classList.add('open');
  };

  // Кнопки
  document.getElementById('btnWork').onclick = () => window.openModal('modalWork');
  document.getElementById('btnPhone').onclick = () => window.openModal('modalPhone');
  document.getElementById('btnVR').onclick = () => {
    if (state.inWorld === 'city') window.openModal('modalVR');
  };
  document.getElementById('btnMute').onclick = (e) => {
    const on = audio.toggle();
    e.target.textContent = on ? '🔊' : '🔇';
  };

  // VR выбор
  document.querySelectorAll('[data-vr]').forEach(el => {
    el.onclick = () => {
      window.closeModal('modalVR');
      audio.vrEnter();
      const u = el.dataset.vr;
      if (u === 'circus') window.goToWorld('circus');
      else if (u === 'minecraft') window.goToWorld('minecraft');
      else if (u === 'roblox') {
        window.goToWorld('roblox');
        setTimeout(() => window.openModal('modalRoblox'), 400);
      }
    };
  });

  // Работа
  window.doJob = (pay, name) => {
    if (state.energy < 10) {
      audio.error();
      return window.toast('😴 Мало энергии!');
    }
    addMoney(pay);
    state.energy = Math.max(0, state.energy - Math.ceil(pay/10));
    updateHUD();
    audio.coin();
    window.toast(`💼 ${name}: +${pay} ₽`);
    window.closeModal('modalWork');
  };

  // Роблокс мини-игры
  window.startRobloxGame = (gameId) => {
    window.closeModal('modalRoblox');
    const g = robloxGames[gameId];
    document.getElementById('minigameContent').innerHTML = `
      <h2>${g.title}</h2>
      <p>${g.desc}</p>
      <p><b>${g.q}</b></p>
      ${g.answers.map((a,i)=>`<div class="phone-app" onclick="answerRoblox(${i}, ${g.correct}, ${g.reward})"><div class="icon">${['🅰️','🅱️','🅲️'][i]}</div><div class="info"><h4>${a}</h4></div></div>`).join('')}
      <button class="btn-close" onclick="closeModal('modalMinigame')">Закрыть</button>
    `;
    window.openModal('modalMinigame');
  };

  window.answerRoblox = (idx, correct, reward) => {
    if (idx === correct) {
      addMoney(reward);
      audio.success();
      window.toast(`✅ Верно! +${reward} ₽`);
    } else {
      audio.error();
      window.toast('❌ Неверно, попробуй ещё');
    }
    window.closeModal('modalMinigame');
  };
}
