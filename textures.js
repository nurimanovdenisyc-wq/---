import * as THREE from 'three';

function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Трава — зелёная с шумом
export function grassTexture() {
  const c = createCanvas(256, 256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#5a8f3e';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const shade = 80 + Math.random() * 80;
    ctx.fillStyle = `rgb(${shade * 0.4}, ${shade}, ${shade * 0.3})`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(20, 20);
  return tex;
}

// Асфальт — тёмно-серый с зерном
export function asphaltTexture() {
  const c = createCanvas(256, 256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) {
    const v = Math.random() * 60 + 20;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(Math.random()*256, Math.random()*256, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return tex;
}

// Кирпич — для стен зданий
export function brickTexture(baseColor = '#c9b89c') {
  const c = createCanvas(256, 256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);
  // Швы
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 2;
  const brickH = 32, brickW = 64;
  for (let y = 0; y < 256; y += brickH) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(256, y);
    ctx.stroke();
    const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
    for (let x = offset; x < 256; x += brickW) {
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x, y + brickH);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  return tex;
}

// Бетон — серый с трещинами
export function concreteTexture() {
  const c = createCanvas(256, 256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8e8e8e';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1000; i++) {
    const v = 120 + Math.random() * 60;
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.fillRect(Math.random()*256, Math.random()*256, 2, 2);
  }
  // Трещины
  ctx.strokeStyle = 'rgba(40,40,40,0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    let x = Math.random() * 256, y = Math.random() * 256;
    ctx.moveTo(x, y);
    for (let j = 0; j < 10; j++) {
      x += (Math.random() - 0.5) * 30;
      y += (Math.random() - 0.5) * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// Кожа — для лица (лёгкий шум)
export function skinTexture() {
  const c = createCanvas(128, 128);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8b796';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2000; i++) {
    const v = Math.random() * 30 - 15;
    ctx.fillStyle = `rgba(${232+v},${183+v},${150+v},0.3)`;
    ctx.fillRect(Math.random()*128, Math.random()*128, 1, 1);
  }
  return new THREE.CanvasTexture(c);
}

// Дерево — для майнкрафта
export function woodTexture() {
  const c = createCanvas(64, 64);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6b4f2f';
  ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (let y = 0; y < 64; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < 64; x += 8) {
      ctx.lineTo(x, y + (Math.random() - 0.5) * 3);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// Трава (майнкрафт) — верхняя часть блока
export function mcGrassTexture() {
  const c = createCanvas(64, 64);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6ab04c';
  ctx.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 400; i++) {
    const shade = 80 + Math.random() * 80;
    ctx.fillStyle = `rgb(${shade * 0.4}, ${shade}, ${shade * 0.3})`;
    ctx.fillRect(Math.random()*64, Math.random()*64, 2, 2);
  }
  return new THREE.CanvasTexture(c);
}

// Земля
export function mcDirtTexture() {
  const c = createCanvas(64, 64);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 500; i++) {
    const shade = 80 + Math.random() * 60;
    ctx.fillStyle = `rgb(${shade}, ${shade * 0.6}, ${shade * 0.3})`;
    ctx.fillRect(Math.random()*64, Math.random()*64, 2, 2);
  }
  return new THREE.CanvasTexture(c);
}

// Камень
export function mcStoneTexture() {
  const c = createCanvas(64, 64);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 800; i++) {
    const v = 100 + Math.random() * 80;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(Math.random()*64, Math.random()*64, 1, 1);
  }
  return new THREE.CanvasTexture(c);
}
