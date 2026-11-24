class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientNode = null;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Короткий клик
  click() {
    if (!this.enabled || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.frequency.setValueAtTime(800, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
    g.gain.setValueAtTime(0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    o.start(); o.stop(this.ctx.currentTime + 0.1);
  }

  // Монетка — приятный звук
  coin() {
    if (!this.enabled || !this.ctx) return;
    [880, 1320, 1760].forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g); g.connect(this.ctx.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.05);
      g.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + i * 0.05 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.2);
      o.start(this.ctx.currentTime + i * 0.05);
      o.stop(this.ctx.currentTime + i * 0.05 + 0.25);
    });
  }

  // Шаг — короткий шум
  footstep() {
    if (!this.enabled || !this.ctx) return;
    const buffer = this.ctx.createBuffer(1, 2048, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 400);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = 0.08;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    src.connect(filter); filter.connect(g); g.connect(this.ctx.destination);
    src.start();
  }

  // Вход в VR — "вуш" 
  vrEnter() {
    if (!this.enabled || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(200, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.6);
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
    o.start(); o.stop(this.ctx.currentTime + 0.7);
  }

  // Успех (работа/мини-игра)
  success() {
    if (!this.enabled || !this.ctx) return;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g); g.connect(this.ctx.destination);
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.08);
      g.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + i * 0.08 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.3);
      o.start(this.ctx.currentTime + i * 0.08);
      o.stop(this.ctx.currentTime + i * 0.08 + 0.35);
    });
  }

  // Ошибка
  error() {
    if (!this.enabled || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    g.gain.setValueAtTime(0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    o.start(); o.stop(this.ctx.currentTime + 0.3);
  }

  // Ломание блока (майнкрафт)
  blockBreak() {
    if (!this.enabled || !this.ctx) return;
    const buffer = this.ctx.createBuffer(1, 4096, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 800);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = 0.2;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    src.connect(filter); filter.connect(g); g.connect(this.ctx.destination);
    src.start();
  }

  // Постановка блока
  blockPlace() {
    if (!this.enabled || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(200, this.ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.15, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    o.start(); o.stop(this.ctx.currentTime + 0.15);
  }

  // Фоновый эмбиент города
  startAmbient() {
    if (!this.enabled || !this.ctx || this.ambientNode) return;
    // Низкий гул + шум
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.value = 60;
    osc2.frequency.value = 90;
    osc.type = 'sine';
    osc2.type = 'sine';
    g.gain.value = 0.03;
    osc.connect(g); osc2.connect(g); g.connect(this.ctx.destination);
    osc.start(); osc2.start();
    this.ambientNode = { osc, osc2, g };
  }

  stopAmbient() {
    if (this.ambientNode) {
      this.ambientNode.osc.stop();
      this.ambientNode.osc2.stop();
      this.ambientNode = null;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stopAmbient();
    return this.enabled;
  }
}

export const audio = new AudioManager();
