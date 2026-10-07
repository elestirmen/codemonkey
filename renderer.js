// World renderer. The engine in game.js owns the rules and the state; this
// module only reads that state and turns it into pixels, so the art can change
// without touching a single puzzle rule.
//
// The board is drawn as a small island in a 3/4 top-down view: every island
// (chapter) has its own palette, but all of them share the same shapes,
// lighting and animation vocabulary.

const TAU = Math.PI * 2;

export const WORLD_THEMES = {
  1: {
    name: 'forest',
    backdrop: { kind: 'sea', top: '#135c52', bottom: '#082f2f', wave: 'rgba(190, 255, 230, 0.13)', glow: 'rgba(150, 240, 190, 0.16)' },
    ground: { kind: 'grass', a: '#86c95c', b: '#7dc055', blade: '#5f9f3f', deco: ['#fff3a3', '#ffb3c6', '#ffffff'], pebble: '#b7c79f' },
    wall: { kind: 'canopy', top: '#2f8a46', light: '#4fb15f', glint: '#8fdc7c', side: '#1b5c31', outline: '#123f22', accent: '#ff8fa3' },
    water: { base: '#2ea5b5', deep: '#1f8199', light: '#9ce8ef', foam: '#effffb' },
    bank: '#6e4a2a',
    cliff: { top: '#7f5733', bottom: '#442c18', line: 'rgba(0, 0, 0, 0.16)', lip: '#5e9f3f' },
    path: '#fff7c7'
  },
  2: {
    name: 'archipelago',
    backdrop: { kind: 'sea', top: '#1d86bd', bottom: '#0b4675', wave: 'rgba(220, 248, 255, 0.18)', glow: 'rgba(200, 245, 255, 0.18)' },
    ground: { kind: 'grass', a: '#a3d86f', b: '#98cf66', blade: '#78b04f', deco: ['#fff1a8', '#ffb4c8', '#ffffff'], pebble: '#d2c8a6' },
    wall: { kind: 'rock', top: '#cbb691', light: '#e4d5b4', dark: '#a38b67', side: '#806a4b', outline: '#5c4a33', moss: '#8cc25b' },
    water: { base: '#37bbd9', deep: '#2294ba', light: '#b2f1fa', foam: '#ffffff' },
    bank: '#9d7648',
    cliff: { top: '#c9a26d', bottom: '#86633d', line: 'rgba(90, 60, 30, 0.2)', lip: '#7ab653' },
    path: '#fffbe0'
  },
  3: {
    name: 'temple',
    backdrop: { kind: 'lagoon', top: '#43337a', bottom: '#1a1438', wave: 'rgba(230, 210, 255, 0.12)', glow: 'rgba(220, 190, 255, 0.18)' },
    ground: { kind: 'stone', a: '#c3bdd2', b: '#b8b1c8', mortar: '#8f87a6', moss: '#8cc06f', deco: ['#f6e7ff', '#ffc6de', '#fff3b0'] },
    wall: { kind: 'block', top: '#9088b0', light: '#b2aacd', dark: '#6c6490', side: '#524a74', outline: '#3a3358', rune: '#e3d4ff', moss: '#7fba64' },
    water: { base: '#34a7a0', deep: '#217f80', light: '#9aeadb', foam: '#ecfffa' },
    bank: '#5e5680',
    cliff: { top: '#7b7299', bottom: '#433c62', line: 'rgba(20, 10, 50, 0.22)', lip: '#9a92b3' },
    path: '#fff1ff'
  },
  4: {
    name: 'coast',
    backdrop: { kind: 'sunset', top: '#f3a45e', mid: '#c46a6f', bottom: '#1a4c7c', wave: 'rgba(255, 236, 214, 0.2)', glow: 'rgba(255, 200, 150, 0.2)' },
    ground: { kind: 'sand', a: '#f2d9a4', b: '#edd29a', ripple: 'rgba(190, 140, 80, 0.2)', deco: ['#ffffff', '#f7a9a0', '#e7b96a'] },
    wall: { kind: 'rock', top: '#d8955f', light: '#ecb382', dark: '#ae6d40', side: '#8a5130', outline: '#62391f', moss: '#6cae7c' },
    water: { base: '#31a4d4', deep: '#1f80b2', light: '#a8e7fc', foam: '#ffffff' },
    bank: '#c49457',
    cliff: { top: '#d9b176', bottom: '#976f43', line: 'rgba(110, 70, 30, 0.2)', lip: '#e2c083' },
    path: '#fff4dd'
  },
  5: {
    name: 'summit',
    backdrop: { kind: 'sky', top: '#23346b', bottom: '#0c1330', wave: 'rgba(255, 255, 255, 0.5)', glow: 'rgba(160, 190, 255, 0.18)' },
    ground: { kind: 'grass', a: '#aedba9', b: '#a4d2a0', blade: '#84b98a', deco: ['#ffffff', '#c7d7ff', '#ffe9a8'], pebble: '#c9d2dd' },
    wall: { kind: 'rock', top: '#909db6', light: '#b0bbd0', dark: '#6d7a96', side: '#56627e', outline: '#3c4660', snow: '#f5f9ff' },
    water: { base: '#5bbce2', deep: '#3b98c6', light: '#cdf3ff', foam: '#ffffff' },
    bank: '#6d7a96',
    cliff: { top: '#7f8ba2', bottom: '#454f66', line: 'rgba(10, 20, 40, 0.22)', lip: '#9cc79f' },
    path: '#ffffff'
  }
};

// ── Small numeric and colour helpers ────────────────────────────────────────

function hash(x, y, seed = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOutSine = t => -(Math.cos(Math.PI * clamp(t, 0, 1)) - 1) / 2;
const easeOutBack = t => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = clamp(t, 0, 1) - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
};

function parseHex(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map(c => c + c).join('') : value;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
}

function mixColor(a, b, t) {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const out = ca.map((channel, i) => Math.round(lerp(channel, cb[i], t)));
  return `rgb(${out[0]}, ${out[1]}, ${out[2]})`;
}

function alpha(hex, a) {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function shade(hex, amount) {
  return amount >= 0 ? mixColor(hex, '#ffffff', amount) : mixColor(hex, '#000000', -amount);
}

// Rounded rectangle path with per-corner radii [tl, tr, br, bl].
function roundRectPath(ctx, x, y, w, h, r) {
  const radii = Array.isArray(r) ? r : [r, r, r, r];
  const [tl, tr, br, bl] = radii.map(value => Math.max(0, Math.min(value, w / 2, h / 2)));
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr) ctx.arcTo(x + w, y, x + w, y + tr, tr); else ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - br);
  if (br) ctx.arcTo(x + w, y + h, x + w - br, y + h, br); else ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + bl, y + h);
  if (bl) ctx.arcTo(x, y + h, x, y + h - bl, bl); else ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + tl);
  if (tl) ctx.arcTo(x, y, x + tl, y, tl); else ctx.lineTo(x, y);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rotation, 0, TAU);
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.01, r), 0, TAU);
}

function starPath(ctx, x, y, outer, inner, points = 5, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = rotation + (i * Math.PI) / points;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

const WATER_TILES = new Set(['~', '=', 'L', 'T']);

// ── Mojo ────────────────────────────────────────────────────────────────────
// Drawn in a 100-unit box whose origin is the point between Mojo's feet. The
// same function paints the in-game hero, the welcome card and the victory
// portrait, so the character is identical everywhere it appears.

const MOJO = {
  fur: '#8f5a2c',
  furDark: '#6c4120',
  furLight: '#b0773f',
  face: '#f7d6a8',
  faceShade: '#e6b77f',
  belly: '#f1c690',
  eye: '#2b1a0f',
  blush: 'rgba(255, 128, 110, 0.38)',
  scarf: '#ff7a45',
  scarfDark: '#d9542a'
};

export function mojoPoseFromAngle(angle) {
  const normalized = ((angle % TAU) + TAU) % TAU;
  const index = Math.round(normalized / (Math.PI / 2)) % 4;
  return ['right', 'down', 'left', 'up'][index];
}

export function drawMojo(ctx, x, y, size, options = {}) {
  const {
    pose = 'down',
    time = 0,
    hop = 0,
    squash = 0,
    walk = 0,
    mood = 'normal',
    armsUp = false,
    blink = null,
    shadow = true,
    sink = 0
  } = options;
  const s = size / 100;
  const blinking = blink ?? ((time % 3.7) < 0.12);

  ctx.save();
  ctx.translate(x, y);

  if (shadow && sink <= 0) {
    const lift = clamp(hop / (size * 0.25), 0, 1);
    ctx.fillStyle = `rgba(20, 12, 4, ${0.28 - lift * 0.12})`;
    ellipse(ctx, 0, 0, 25 * s * (1 - lift * 0.3), 7.5 * s * (1 - lift * 0.3));
    ctx.fill();
  }

  ctx.translate(0, -hop);
  ctx.scale(s * (1 + squash), s * (1 - squash));

  if (pose === 'left') ctx.scale(-1, 1);
  const side = pose === 'left' || pose === 'right';

  const stroke = () => {
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = 'rgba(58, 32, 12, 0.55)';
    ctx.stroke();
  };

  // Tail — behind the body except in the back view.
  const tail = () => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = MOJO.furDark;
    ctx.lineWidth = 7;
    const sway = Math.sin(time * 3.1) * 3;
    ctx.beginPath();
    if (side) {
      ctx.moveTo(-12, -18);
      ctx.bezierCurveTo(-34, -16, -40 + sway, -40, -28 + sway, -52);
      ctx.bezierCurveTo(-20 + sway, -60, -12 + sway, -52, -18 + sway, -46);
    } else if (pose === 'up') {
      ctx.moveTo(0, -18);
      ctx.bezierCurveTo(2, -36, 22 + sway, -38, 20 + sway, -52);
      ctx.bezierCurveTo(18 + sway, -62, 8 + sway, -58, 11 + sway, -50);
    } else {
      ctx.moveTo(10, -16);
      ctx.bezierCurveTo(34, -14, 38 + sway, -38, 28 + sway, -50);
      ctx.bezierCurveTo(22 + sway, -58, 14 + sway, -52, 19 + sway, -46);
    }
    ctx.stroke();
    ctx.restore();
  };

  if (pose !== 'up') tail();

  // Feet
  const stepA = Math.sin(walk) * 3;
  const stepB = -stepA;
  ctx.fillStyle = MOJO.furDark;
  if (side) {
    ellipse(ctx, -5 + stepB, -3 - Math.max(0, stepB), 10, 5);
    ctx.fill();
    ctx.fillStyle = shade(MOJO.furDark, -0.12);
    ellipse(ctx, 7 + stepA, -3 - Math.max(0, stepA), 11, 5.5);
    ctx.fill();
  } else {
    ellipse(ctx, -10, -3 - Math.max(0, stepA), 9, 5.5);
    ctx.fill();
    ellipse(ctx, 10, -3 - Math.max(0, stepB), 9, 5.5);
    ctx.fill();
  }

  // Body
  ctx.fillStyle = MOJO.fur;
  ellipse(ctx, 0, -24, side ? 18 : 20.5, 21.5);
  ctx.fill();
  stroke();
  if (pose === 'down') {
    ctx.fillStyle = MOJO.belly;
    ellipse(ctx, 0, -20, 12.5, 14);
    ctx.fill();
  } else if (side) {
    ctx.fillStyle = MOJO.belly;
    ellipse(ctx, 7, -20, 8.5, 13);
    ctx.fill();
  }

  // Arms
  const swing = Math.sin(walk) * 0.5;
  const arm = (ax, ay, rot) => {
    ctx.fillStyle = MOJO.fur;
    ellipse(ctx, ax, ay, 5.8, 11, rot);
    ctx.fill();
    stroke();
    ctx.fillStyle = MOJO.face;
    circle(ctx, ax + Math.sin(-rot) * 9, ay + Math.cos(rot) * 9, 4.2);
    ctx.fill();
  };
  if (armsUp) {
    if (side) {
      arm(4, -44, -2.5);
    } else {
      arm(-22, -44, 2.6);
      arm(22, -44, -2.6);
    }
  } else if (side) {
    arm(3, -25, -0.25 + swing);
  } else {
    arm(-20, -25, 0.35 + swing * 0.4);
    arm(20, -25, -0.35 - swing * 0.4);
  }

  if (pose === 'up') tail();

  // Scarf — Mojo's signature, the one colour that never changes per island.
  ctx.fillStyle = MOJO.scarf;
  roundRectPath(ctx, side ? -15 : -17, -46, side ? 30 : 34, 9, 4.5);
  ctx.fill();
  ctx.fillStyle = MOJO.scarfDark;
  if (side) {
    const flutter = Math.sin(time * 5) * 2;
    ctx.beginPath();
    ctx.moveTo(-12, -44);
    ctx.quadraticCurveTo(-24, -40 + flutter, -30, -34 + flutter);
    ctx.lineTo(-24, -32 + flutter);
    ctx.quadraticCurveTo(-18, -38, -8, -40);
    ctx.closePath();
    ctx.fill();
  } else if (pose === 'down') {
    roundRectPath(ctx, 6, -41, 7, 12, 3);
    ctx.fill();
  } else {
    roundRectPath(ctx, -4, -40, 8, 11, 3);
    ctx.fill();
  }

  // Head
  const headX = side ? 2 : 0;
  const headY = -64;
  const ear = (ex, ey, inner = true) => {
    ctx.fillStyle = MOJO.fur;
    circle(ctx, ex, ey, 10.5);
    ctx.fill();
    stroke();
    if (inner) {
      ctx.fillStyle = MOJO.faceShade;
      circle(ctx, ex, ey, 5.8);
      ctx.fill();
    }
  };
  if (side) ear(-17, headY - 2);
  else ear(-28, headY - 1, pose !== 'up');
  if (!side) ear(28, headY - 1, pose !== 'up');

  const headGradient = ctx.createRadialGradient(headX - 8, headY - 12, 4, headX, headY, 30);
  headGradient.addColorStop(0, MOJO.furLight);
  headGradient.addColorStop(1, MOJO.fur);
  ctx.fillStyle = headGradient;
  circle(ctx, headX, headY, 27);
  ctx.fill();
  stroke();

  if (pose === 'up') {
    ctx.strokeStyle = MOJO.furDark;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, headY - 6, 7, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Face mask
  ctx.fillStyle = MOJO.face;
  ctx.beginPath();
  if (side) {
    ctx.arc(13, headY, 13.5, 0, TAU);
    ctx.ellipse(23, headY + 10, 12.5, 9.5, 0, 0, TAU);
  } else {
    ctx.arc(-9.5, headY - 1, 12.5, 0, TAU);
    ctx.arc(9.5, headY - 1, 12.5, 0, TAU);
    ctx.ellipse(0, headY + 11, 17, 11.5, 0, 0, TAU);
  }
  ctx.fill();

  // Eyes
  const eye = (ex, ey) => {
    if (mood === 'dizzy') {
      ctx.strokeStyle = MOJO.eye;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ex - 3.5, ey - 3.5); ctx.lineTo(ex + 3.5, ey + 3.5);
      ctx.moveTo(ex + 3.5, ey - 3.5); ctx.lineTo(ex - 3.5, ey + 3.5);
      ctx.stroke();
      return;
    }
    if (mood === 'happy') {
      ctx.strokeStyle = MOJO.eye;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex, ey + 1.5, 4, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      return;
    }
    if (blinking) {
      ctx.strokeStyle = MOJO.eye;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ex - 3.8, ey); ctx.lineTo(ex + 3.8, ey);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = MOJO.eye;
    ellipse(ctx, ex, ey, 3.7, 5.1);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    circle(ctx, ex + 1.1, ey - 1.9, 1.4);
    ctx.fill();
    if (mood === 'worried') {
      ctx.strokeStyle = MOJO.furDark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ex - 4, ey - 9); ctx.lineTo(ex + 3, ey - 7.5);
      ctx.stroke();
    }
  };
  if (side) eye(16, headY - 2);
  else {
    eye(-9.5, headY - 2);
    eye(9.5, headY - 2);
  }

  // Blush, nose and mouth
  ctx.fillStyle = MOJO.blush;
  if (side) {
    ellipse(ctx, 10, headY + 8, 4.5, 2.8);
    ctx.fill();
  } else {
    ellipse(ctx, -17, headY + 8, 4.5, 2.8);
    ctx.fill();
    ellipse(ctx, 17, headY + 8, 4.5, 2.8);
    ctx.fill();
  }
  ctx.fillStyle = shade(MOJO.faceShade, -0.35);
  if (side) {
    ellipse(ctx, 33, headY + 6, 2.4, 1.8);
  } else {
    ellipse(ctx, 0, headY + 6, 3.2, 2.1);
  }
  ctx.fill();

  ctx.strokeStyle = shade(MOJO.faceShade, -0.45);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const mouthX = side ? 25 : 0;
  const mouthY = headY + 13;
  if (mood === 'happy') {
    ctx.fillStyle = '#a4453a';
    ctx.moveTo(mouthX - 6, mouthY - 1);
    ctx.quadraticCurveTo(mouthX, mouthY + 8, mouthX + 6, mouthY - 1);
    ctx.closePath();
    ctx.fill();
  } else if (mood === 'dizzy') {
    ctx.moveTo(mouthX - 5, mouthY);
    ctx.quadraticCurveTo(mouthX - 2.5, mouthY - 3, mouthX, mouthY);
    ctx.quadraticCurveTo(mouthX + 2.5, mouthY + 3, mouthX + 5, mouthY);
    ctx.stroke();
  } else if (mood === 'worried') {
    ctx.arc(mouthX, mouthY + 4, 4, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else {
    ctx.arc(mouthX, mouthY - 2, 4.5, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Renderer ────────────────────────────────────────────────────────────────

export class WorldRenderer {
  constructor(game) {
    this.game = game;
    this.T = 64;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = 1;
    this.layoutKey = '';
    this.staticCanvas = null;
    this.staticDirty = true;
    this.lastFrameAt = 0;
    this.reducedMotion = false;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = query.matches;
      query.addEventListener?.('change', event => { this.reducedMotion = event.matches; });
    }
    this.reset();
  }

  get theme() {
    return WORLD_THEMES[this.game.worldId] || WORLD_THEMES[1];
  }

  // Everything transient belongs to one attempt on one board.
  reset() {
    this.particles = [];
    this.rings = [];
    this.floaters = [];
    this.sinks = [];
    this.flyingKey = null;
    this.gateOpenedAt = null;
    this.victoryAt = null;
    this.crash = null;
    this.stuckAt = null;
    this.pendingSplash = null;
    this.turtleSink = [];
    this.staticDirty = true;
    this.layoutKey = '';
  }

  // ── Camera ────────────────────────────────────────────────────────────────

  layout() {
    const g = this.game;
    const canvas = g.canvas;
    const area = g.playArea;
    if (!canvas || !area) return;

    let cssW = canvas.clientWidth || 0;
    let cssH = canvas.clientHeight || 0;
    let dpr = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;
    if (!cssW || !cssH) {
      cssW = g.gridWidth * 64;
      cssH = g.gridHeight * 64;
      dpr = 1;
    }
    dpr = Math.min(2.5, Math.max(1, dpr));
    const W = Math.max(1, Math.round(cssW * dpr));
    const H = Math.max(1, Math.round(cssH * dpr));
    const key = `${W}x${H}|${area.x},${area.y},${area.width},${area.height}|${g.worldId}`;
    if (key === this.layoutKey) return;
    this.layoutKey = key;
    this.dpr = dpr;
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    // Leave room for the HUD chips that float over the top and bottom edges.
    const compact = cssW < 520;
    const padTop = (compact ? 44 : 58) * dpr;
    const padBottom = (compact ? 40 : 56) * dpr;
    const padX = (compact ? 10 : 28) * dpr;
    const margin = 0.35;
    const cliff = 0.55;
    const cols = area.width + margin * 2;
    const rows = area.height + margin * 2 + cliff;
    const availW = Math.max(40, W - padX * 2);
    const availH = Math.max(40, H - padTop - padBottom);
    let T = Math.min(availW / cols, availH / rows, 118 * dpr);
    T = Math.max(6, Math.floor(T));
    this.T = T;
    this.cliffHeight = cliff * T;
    const boardW = area.width * T;
    const boardH = area.height * T + this.cliffHeight;
    this.offsetX = Math.round((W - boardW) / 2);
    this.offsetY = Math.round(padTop + (availH - boardH) / 2);
    g.tileSize = T;
    this.staticDirty = true;
  }

  px(x) {
    return this.offsetX + (x - this.game.playArea.x) * this.T;
  }

  py(y) {
    return this.offsetY + (y - this.game.playArea.y) * this.T;
  }

  cellFromClient(clientX, clientY) {
    const g = this.game;
    const canvas = g.canvas;
    if (!canvas || !canvas.getBoundingClientRect || !g.playArea) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const sx = (clientX - rect.left) * (canvas.width / rect.width);
    const sy = (clientY - rect.top) * (canvas.height / rect.height);
    const area = g.playArea;
    const x = Math.floor((sx - this.offsetX) / this.T) + area.x;
    const y = Math.floor((sy - this.offsetY) / this.T) + area.y;
    if (x < area.x || y < area.y || x >= area.x + area.width || y >= area.y + area.height) return null;
    return { x, y };
  }

  inArea(x, y) {
    const a = this.game.playArea;
    return x >= a.x && y >= a.y && x < a.x + a.width && y < a.y + a.height;
  }

  baseCell(x, y) {
    if (!this.inArea(x, y)) return null;
    const grid = this.game.baseGridData || this.game.gridData;
    return grid[y] ? grid[y][x] : null;
  }

  isWall(x, y) {
    return this.baseCell(x, y) === '#';
  }

  isWaterBase(x, y) {
    const cell = this.baseCell(x, y);
    return cell !== null && WATER_TILES.has(cell);
  }

  isLand(x, y) {
    const cell = this.baseCell(x, y);
    return cell !== null && !WATER_TILES.has(cell);
  }

  // ── Frame ─────────────────────────────────────────────────────────────────

  render(now = (typeof performance !== 'undefined' ? performance.now() : 0)) {
    const g = this.game;
    const ctx = g.ctx;
    if (!ctx || !g.level || !g.playArea || !g.gridData.length) return;
    this.layout();
    const dt = this.lastFrameAt ? clamp((now - this.lastFrameAt) / 1000, 0, 0.05) : 1 / 60;
    this.lastFrameAt = now;
    const t = now / 1000;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    this.drawBackdrop(ctx, t);
    if (this.staticDirty || !this.staticCanvas) this.buildStatic();
    if (this.staticCanvas && !this.staticDirty) ctx.drawImage(this.staticCanvas, 0, 0);
    else this.drawStaticLayer(ctx);
    this.drawWaterMotion(ctx, t);
    this.drawTrail(ctx);
    this.drawGroundMarkers(ctx, t);
    this.drawEntities(ctx, t, dt);
    this.drawEffects(ctx, t, dt);
    this.drawRuler(ctx);
  }

  buildStatic() {
    const g = this.game;
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return;
    if (!this.staticCanvas) this.staticCanvas = document.createElement('canvas');
    this.staticCanvas.width = g.canvas.width;
    this.staticCanvas.height = g.canvas.height;
    const ctx = this.staticCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);
    this.drawStaticLayer(ctx);
    this.staticDirty = false;
  }

  // ── Backdrop ──────────────────────────────────────────────────────────────

  drawBackdrop(ctx, t) {
    const { canvas } = this.game;
    const W = canvas.width;
    const H = canvas.height;
    const b = this.theme.backdrop;
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, b.top);
    if (b.mid) gradient.addColorStop(0.42, b.mid);
    gradient.addColorStop(1, b.bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // A soft pool of light behind the island.
    const cx = this.offsetX + (this.game.playArea.width * this.T) / 2;
    const cy = this.offsetY + (this.game.playArea.height * this.T) / 2;
    const glow = ctx.createRadialGradient(cx, cy, this.T, cx, cy, Math.max(W, H) * 0.7);
    glow.addColorStop(0, b.glow);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const motion = this.reducedMotion ? 0 : t;
    const unit = Math.max(14, this.T * 0.5);

    if (b.kind === 'sky') {
      // Stars above, clouds drifting beneath the summit.
      for (let i = 0; i < 46; i++) {
        const x = hash(i, 3, 11) * W;
        const y = hash(i, 7, 11) * H * 0.55;
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(motion * (0.6 + hash(i, 1, 4)) + i));
        ctx.fillStyle = `rgba(255, 255, 255, ${0.18 + twinkle * 0.45})`;
        circle(ctx, x, y, (0.6 + hash(i, 9, 2) * 1.3) * this.dpr);
        ctx.fill();
      }
      for (let i = 0; i < 9; i++) {
        const speed = 6 + hash(i, 2, 5) * 10;
        const span = W + unit * 8;
        const x = ((hash(i, 4, 5) * span + motion * speed * this.dpr) % span) - unit * 4;
        const y = H * (0.55 + hash(i, 6, 5) * 0.45);
        const r = unit * (1.2 + hash(i, 8, 5) * 1.4);
        ctx.fillStyle = 'rgba(210, 225, 255, 0.07)';
        for (let k = 0; k < 4; k++) {
          circle(ctx, x + (k - 1.5) * r * 0.8, y + Math.sin(k * 1.7) * r * 0.25, r * (0.7 + (k % 2) * 0.3));
          ctx.fill();
        }
      }
      return;
    }

    if (b.kind === 'lagoon') {
      for (let i = 0; i < 14; i++) {
        const x = hash(i, 1, 21) * W;
        const y = (hash(i, 2, 21) * H + motion * (4 + hash(i, 3, 21) * 6) * this.dpr) % H;
        ctx.fillStyle = `rgba(255, 190, 230, ${0.1 + hash(i, 4, 21) * 0.12})`;
        ellipse(ctx, x + Math.sin(motion + i) * unit * 0.3, y, unit * 0.16, unit * 0.09, motion * 0.5 + i);
        ctx.fill();
      }
    }

    // Gentle drifting wave marks on open water.
    ctx.strokeStyle = b.wave;
    ctx.lineWidth = Math.max(1, this.T * 0.035);
    ctx.lineCap = 'round';
    const count = Math.round(clamp((W * H) / (unit * unit * 6), 12, 60));
    for (let i = 0; i < count; i++) {
      const speed = 5 + hash(i, 1, 31) * 9;
      const span = W + unit * 2;
      const x = ((hash(i, 2, 31) * span + motion * speed * this.dpr) % span) - unit;
      const y = hash(i, 3, 31) * H;
      const w = unit * (0.5 + hash(i, 4, 31) * 0.7);
      const phase = Math.sin(motion * 1.3 + i);
      ctx.globalAlpha = 0.5 + phase * 0.35;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y);
      ctx.quadraticCurveTo(x, y - unit * 0.12, x + w / 2, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ── Static island ─────────────────────────────────────────────────────────

  drawStaticLayer(ctx) {
    const g = this.game;
    const area = g.playArea;
    const T = this.T;
    const X = this.px(area.x);
    const Y = this.py(area.y);
    const W = area.width * T;
    const H = area.height * T;
    const radius = T * 0.42;
    const theme = this.theme;

    // Drop shadow onto the sea, then the island's cliff face.
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = T * 0.9;
    ctx.shadowOffsetY = T * 0.35;
    ctx.fillStyle = theme.cliff.bottom;
    roundRectPath(ctx, X, Y, W, H + this.cliffHeight, radius);
    ctx.fill();
    ctx.restore();

    const cliff = ctx.createLinearGradient(0, Y + H - radius, 0, Y + H + this.cliffHeight);
    cliff.addColorStop(0, theme.cliff.top);
    cliff.addColorStop(1, theme.cliff.bottom);
    ctx.fillStyle = cliff;
    roundRectPath(ctx, X, Y + H - radius, W, radius + this.cliffHeight, [0, 0, radius, radius]);
    ctx.fill();
    // Strata lines and a few pebbles give the cliff some weight.
    ctx.save();
    roundRectPath(ctx, X, Y + H - radius, W, radius + this.cliffHeight, [0, 0, radius, radius]);
    ctx.clip();
    ctx.strokeStyle = theme.cliff.line;
    ctx.lineWidth = Math.max(1, T * 0.04);
    for (let i = 1; i <= 2; i++) {
      const ly = Y + H + (this.cliffHeight * i) / 3;
      ctx.beginPath();
      for (let x = 0; x <= W; x += T / 2) {
        const wobble = (hash(x | 0, i, 41) - 0.5) * T * 0.08;
        if (x === 0) ctx.moveTo(X + x, ly + wobble); else ctx.lineTo(X + x, ly + wobble);
      }
      ctx.stroke();
    }
    for (let i = 0; i < area.width * 2; i++) {
      const px = X + hash(i, 5, 43) * W;
      const py = Y + H + this.cliffHeight * (0.2 + hash(i, 6, 43) * 0.65);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ellipse(ctx, px, py, T * (0.05 + hash(i, 7, 43) * 0.06), T * 0.035);
      ctx.fill();
    }
    ctx.restore();

    // Waterfalls where island water meets the southern edge.
    for (let x = area.x; x < area.x + area.width; x++) {
      const y = area.y + area.height - 1;
      if (!this.isWaterBase(x, y)) continue;
      const fx = this.px(x);
      const fall = ctx.createLinearGradient(0, Y + H, 0, Y + H + this.cliffHeight);
      fall.addColorStop(0, theme.water.light);
      fall.addColorStop(1, alpha(theme.water.base, 0.4));
      ctx.fillStyle = fall;
      ctx.fillRect(fx + T * 0.08, Y + H, T * 0.84, this.cliffHeight);
    }

    // Island surface, clipped to its rounded outline.
    ctx.save();
    roundRectPath(ctx, X, Y, W, H, radius);
    ctx.clip();
    ctx.fillStyle = theme.ground.a;
    ctx.fillRect(X, Y, W, H);

    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        if (this.isWaterBase(x, y)) this.drawWaterTile(ctx, x, y);
        else this.drawGroundTile(ctx, x, y);
      }
    }
    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        if (this.isWaterBase(x, y)) this.drawShore(ctx, x, y);
      }
    }
    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        if (this.baseCell(x, y) === '=') this.drawBridge(ctx, x, y);
      }
    }
    this.drawStartPad(ctx);
    this.drawGoalPad(ctx);
    ctx.restore();

    // A light rim along the island edge separates it from the water. It goes
    // under the obstacles: a hedge or wall on the border rises in front of it.
    ctx.save();
    roundRectPath(ctx, X, Y, W, H, radius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = Math.max(1, T * 0.03);
    ctx.stroke();
    ctx.restore();

    // Obstacles rise above the ground, so they are painted after it (row by
    // row, top to bottom, so a southern block overlaps the one behind it).
    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        if (this.isWall(x, y)) this.drawWallBase(ctx, x, y);
      }
    }
    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        if (this.isWall(x, y)) this.drawWallDetail(ctx, x, y);
      }
    }
  }

  drawGroundTile(ctx, x, y) {
    const T = this.T;
    const X = this.px(x);
    const Y = this.py(y);
    const ground = this.theme.ground;
    const checker = (x + y) % 2 === 0;
    const variation = (hash(x, y, 1) - 0.5) * 0.06;
    const base = checker ? ground.a : ground.b;
    ctx.fillStyle = shade(base, variation);
    ctx.fillRect(X, Y, T + 0.5, T + 0.5);

    const cell = this.baseCell(x, y);
    const busy = cell !== '.';

    if (ground.kind === 'stone') {
      ctx.strokeStyle = alpha(ground.mortar, 0.55);
      ctx.lineWidth = Math.max(1, T * 0.03);
      ctx.strokeRect(X + T * 0.02, Y + T * 0.02, T * 0.96, T * 0.96);
      ctx.beginPath();
      if (hash(x, y, 2) > 0.5) {
        ctx.moveTo(X + T * 0.02, Y + T * 0.5); ctx.lineTo(X + T * 0.98, Y + T * 0.5);
        const split = hash(x, y, 3) > 0.5 ? 0.35 : 0.62;
        ctx.moveTo(X + T * split, Y + T * 0.02); ctx.lineTo(X + T * split, Y + T * 0.5);
      } else {
        ctx.moveTo(X + T * 0.5, Y + T * 0.02); ctx.lineTo(X + T * 0.5, Y + T * 0.98);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(X + T * 0.04, Y + T * 0.04, T * 0.92, T * 0.05);
      if (!busy && hash(x, y, 4) < 0.28) {
        ctx.fillStyle = alpha(ground.moss, 0.8);
        const mx = X + T * (0.15 + hash(x, y, 5) * 0.7);
        const my = Y + T * (0.2 + hash(x, y, 6) * 0.6);
        for (let k = 0; k < 4; k++) {
          circle(ctx, mx + (hash(x, y, 10 + k) - 0.5) * T * 0.16, my + (hash(x, y, 20 + k) - 0.5) * T * 0.1, T * 0.035);
          ctx.fill();
        }
      }
      return;
    }

    if (ground.kind === 'sand') {
      ctx.strokeStyle = ground.ripple;
      ctx.lineWidth = Math.max(1, T * 0.025);
      for (let k = 0; k < 2; k++) {
        const ry = Y + T * (0.3 + k * 0.38 + (hash(x, y, 7 + k) - 0.5) * 0.1);
        ctx.beginPath();
        ctx.moveTo(X + T * 0.12, ry);
        ctx.quadraticCurveTo(X + T * 0.5, ry - T * 0.06, X + T * 0.88, ry);
        ctx.stroke();
      }
      if (!busy && hash(x, y, 8) < 0.12) {
        const sx = X + T * (0.25 + hash(x, y, 9) * 0.5);
        const sy = Y + T * (0.25 + hash(x, y, 10) * 0.5);
        ctx.fillStyle = ground.deco[Math.floor(hash(x, y, 11) * ground.deco.length)];
        if (hash(x, y, 12) > 0.5) {
          starPath(ctx, sx, sy, T * 0.09, T * 0.04, 5, hash(x, y, 13) * TAU);
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, T * 0.07, Math.PI, 0);
          ctx.closePath();
        }
        ctx.fill();
      }
      return;
    }

    // Grass: a few blades and, now and then, a tiny flower or pebble.
    if (busy) return;
    const tufts = hash(x, y, 14);
    if (tufts < 0.55) {
      ctx.strokeStyle = alpha(ground.blade, 0.75);
      ctx.lineWidth = Math.max(1, T * 0.028);
      ctx.lineCap = 'round';
      const count = tufts < 0.22 ? 2 : 1;
      for (let k = 0; k < count; k++) {
        const bx = X + T * (0.18 + hash(x, y, 15 + k) * 0.64);
        const by = Y + T * (0.3 + hash(x, y, 17 + k) * 0.55);
        const hgt = T * 0.09;
        ctx.beginPath();
        ctx.moveTo(bx - T * 0.04, by); ctx.lineTo(bx - T * 0.06, by - hgt * 0.8);
        ctx.moveTo(bx, by); ctx.lineTo(bx, by - hgt);
        ctx.moveTo(bx + T * 0.04, by); ctx.lineTo(bx + T * 0.065, by - hgt * 0.75);
        ctx.stroke();
      }
    }
    const extra = hash(x, y, 19);
    if (extra < 0.1) {
      const fx = X + T * (0.2 + hash(x, y, 21) * 0.6);
      const fy = Y + T * (0.2 + hash(x, y, 22) * 0.6);
      const color = ground.deco[Math.floor(hash(x, y, 23) * ground.deco.length)];
      ctx.fillStyle = color;
      for (let k = 0; k < 5; k++) {
        const angle = (k / 5) * TAU;
        circle(ctx, fx + Math.cos(angle) * T * 0.035, fy + Math.sin(angle) * T * 0.035, T * 0.028);
        ctx.fill();
      }
      ctx.fillStyle = '#f5b73b';
      circle(ctx, fx, fy, T * 0.022);
      ctx.fill();
    } else if (extra < 0.16 && ground.pebble) {
      ctx.fillStyle = ground.pebble;
      ellipse(ctx, X + T * (0.2 + hash(x, y, 24) * 0.6), Y + T * (0.25 + hash(x, y, 25) * 0.6), T * 0.05, T * 0.035);
      ctx.fill();
    }
  }

  drawWaterTile(ctx, x, y) {
    const T = this.T;
    const X = this.px(x);
    const Y = this.py(y);
    const water = this.theme.water;
    const gradient = ctx.createLinearGradient(0, Y, 0, Y + T);
    gradient.addColorStop(0, water.deep);
    gradient.addColorStop(0.35, water.base);
    gradient.addColorStop(1, water.base);
    ctx.fillStyle = gradient;
    ctx.fillRect(X, Y, T + 0.5, T + 0.5);

    // Land to the north shows its bank: water sits lower than the ground.
    if (this.isLand(x, y - 1)) {
      const bankH = T * 0.16;
      ctx.fillStyle = this.theme.bank;
      ctx.fillRect(X, Y, T + 0.5, bankH);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(X, Y + bankH, T + 0.5, T * 0.05);
    }
  }

  drawShore(ctx, x, y) {
    const T = this.T;
    const X = this.px(x);
    const Y = this.py(y);
    const foam = this.theme.water.foam;
    ctx.save();
    ctx.strokeStyle = alpha(foam, 0.55);
    ctx.lineWidth = Math.max(1, T * 0.045);
    ctx.lineCap = 'round';
    const inset = T * 0.07;
    const bankH = this.isLand(x, y - 1) ? T * 0.2 : 0;
    ctx.beginPath();
    if (this.isLand(x, y - 1)) { ctx.moveTo(X + inset, Y + bankH + inset * 0.5); ctx.lineTo(X + T - inset, Y + bankH + inset * 0.5); }
    if (this.isLand(x, y + 1)) { ctx.moveTo(X + inset, Y + T - inset); ctx.lineTo(X + T - inset, Y + T - inset); }
    if (this.isLand(x - 1, y)) { ctx.moveTo(X + inset, Y + bankH + inset); ctx.lineTo(X + inset, Y + T - inset); }
    if (this.isLand(x + 1, y)) { ctx.moveTo(X + T - inset, Y + bankH + inset); ctx.lineTo(X + T - inset, Y + T - inset); }
    ctx.stroke();
    ctx.restore();
  }

  drawBridge(ctx, x, y) {
    const T = this.T;
    const X = this.px(x);
    const Y = this.py(y);
    const waterish = (cx, cy) => this.isWaterBase(cx, cy) && this.baseCell(cx, cy) !== '=';
    const vertical = waterish(x - 1, y) && waterish(x + 1, y) && !(waterish(x, y - 1) && waterish(x, y + 1));
    const plank = '#b87a43';
    const plankDark = '#8a5528';
    const rope = '#6b4222';

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    if (vertical) ctx.fillRect(X + T * 0.16, Y, T * 0.72, T + 0.5);
    else ctx.fillRect(X, Y + T * 0.2, T + 0.5, T * 0.68);

    const count = 4;
    for (let i = 0; i < count; i++) {
      const tone = shade(plank, (hash(x * 7 + i, y, 51) - 0.5) * 0.14);
      ctx.fillStyle = tone;
      if (vertical) {
        const py = Y + (i * T) / count;
        roundRectPath(ctx, X + T * 0.14, py + T * 0.02, T * 0.72, T / count - T * 0.05, T * 0.03);
      } else {
        const px = X + (i * T) / count;
        roundRectPath(ctx, px + T * 0.02, Y + T * 0.16, T / count - T * 0.05, T * 0.66, T * 0.03);
      }
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      if (vertical) ctx.fillRect(X + T * 0.14, Y + (i * T) / count + T * 0.02, T * 0.72, T * 0.03);
      else ctx.fillRect(X + (i * T) / count + T * 0.02, Y + T * 0.16, T * 0.03, T * 0.66);
    }
    ctx.strokeStyle = plankDark;
    ctx.lineWidth = Math.max(1, T * 0.02);
    ctx.fillStyle = rope;
    const post = (px, py) => {
      roundRectPath(ctx, px - T * 0.05, py - T * 0.1, T * 0.1, T * 0.16, T * 0.03);
      ctx.fill();
    };
    ctx.strokeStyle = rope;
    ctx.lineWidth = Math.max(1, T * 0.035);
    ctx.beginPath();
    if (vertical) {
      ctx.moveTo(X + T * 0.12, Y); ctx.lineTo(X + T * 0.12, Y + T);
      ctx.moveTo(X + T * 0.88, Y); ctx.lineTo(X + T * 0.88, Y + T);
    } else {
      ctx.moveTo(X, Y + T * 0.14); ctx.lineTo(X + T, Y + T * 0.14);
      ctx.moveTo(X, Y + T * 0.84); ctx.lineTo(X + T, Y + T * 0.84);
    }
    ctx.stroke();
    if (vertical) {
      post(X + T * 0.12, Y + T * 0.5);
      post(X + T * 0.88, Y + T * 0.5);
    } else {
      post(X + T * 0.5, Y + T * 0.16);
      post(X + T * 0.5, Y + T * 0.86);
    }
    ctx.restore();
  }

  drawStartPad(ctx) {
    const start = this.game.baseStart;
    if (!start) return;
    const T = this.T;
    const cx = this.px(start.x) + T / 2;
    const cy = this.py(start.y) + T / 2 + T * 0.08;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ellipse(ctx, cx, cy + T * 0.04, T * 0.36, T * 0.2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ellipse(ctx, cx, cy, T * 0.34, T * 0.18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = Math.max(1, T * 0.02);
    ctx.setLineDash([T * 0.05, T * 0.04]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawGoalPad(ctx) {
    const goal = this.game.starTile;
    const T = this.T;
    const cx = this.px(goal.x) + T / 2;
    const cy = this.py(goal.y) + T / 2 + T * 0.14;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ellipse(ctx, cx, cy + T * 0.04, T * 0.4, T * 0.21);
    ctx.fill();
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, T * 0.4);
    gradient.addColorStop(0, 'rgba(255, 236, 160, 0.75)');
    gradient.addColorStop(1, 'rgba(255, 196, 90, 0.2)');
    ctx.fillStyle = gradient;
    ellipse(ctx, cx, cy, T * 0.38, T * 0.2);
    ctx.fill();
  }

  // Obstacles: one silhouette per island, shared autotiling rules. A block's
  // top face is raised by `h`; its front face shows only when the cell to the
  // south is open, so neighbouring blocks merge into hedges, walls and cliffs.
  wallNeighbours(x, y) {
    return {
      n: this.isWall(x, y - 1),
      s: this.isWall(x, y + 1),
      e: this.isWall(x + 1, y),
      w: this.isWall(x - 1, y)
    };
  }

  wallHeight() {
    const kind = this.theme.wall.kind;
    return this.T * (kind === 'canopy' ? 0.3 : kind === 'block' ? 0.26 : 0.24);
  }

  drawWallBase(ctx, x, y) {
    const T = this.T;
    const X = this.px(x);
    const Y = this.py(y);
    const wall = this.theme.wall;
    const h = this.wallHeight();
    const n = this.wallNeighbours(x, y);
    const r = T * (wall.kind === 'block' ? 0.1 : 0.34);
    const radii = [
      !n.n && !n.w ? r : 0,
      !n.n && !n.e ? r : 0,
      !n.s && !n.e ? r : 0,
      !n.s && !n.w ? r : 0
    ];

    // Contact shadow on the ground in front of the block.
    if (!n.s) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      roundRectPath(ctx, X + (n.w ? 0 : T * 0.04), Y + T - h * 0.2, T - (n.w ? 0 : T * 0.04) - (n.e ? 0 : T * 0.04), h * 0.55, [0, 0, radii[2], radii[3]]);
      ctx.fill();
    }

    // Front face.
    if (!n.s) {
      const face = ctx.createLinearGradient(0, Y + T - h, 0, Y + T);
      face.addColorStop(0, wall.side);
      face.addColorStop(1, shade(wall.side, -0.25));
      ctx.fillStyle = face;
      roundRectPath(ctx, X, Y + T - h - r, T, h + r, [0, 0, radii[2], radii[3]]);
      ctx.fill();
    }

    // Top face.
    ctx.fillStyle = wall.top;
    roundRectPath(ctx, X, Y - h, T, T, radii);
    ctx.fill();

    if (wall.kind === 'canopy') {
      // Leafy bumps along the open edges make hedges read as foliage.
      const bump = T * 0.17;
      ctx.fillStyle = wall.top;
      const edgeBumps = (points) => {
        for (const [bx, by] of points) {
          circle(ctx, bx, by, bump);
          ctx.fill();
        }
      };
      if (!n.n) edgeBumps([[X + T * 0.3, Y - h + T * 0.1], [X + T * 0.7, Y - h + T * 0.08]]);
      if (!n.w) edgeBumps([[X + T * 0.1, Y - h + T * 0.35], [X + T * 0.1, Y - h + T * 0.68]]);
      if (!n.e) edgeBumps([[X + T * 0.9, Y - h + T * 0.32], [X + T * 0.9, Y - h + T * 0.66]]);
      if (!n.s) {
        ctx.fillStyle = shade(wall.side, 0.05);
        for (const bx of [0.22, 0.52, 0.8]) {
          circle(ctx, X + T * bx, Y + T - h * 0.15, T * 0.11);
          ctx.fill();
        }
      }
    }
  }

  drawWallDetail(ctx, x, y) {
    const T = this.T;
    const X = this.px(x);
    const Y = this.py(y);
    const wall = this.theme.wall;
    const h = this.wallHeight();
    const n = this.wallNeighbours(x, y);
    const top = Y - h;

    if (wall.kind === 'canopy') {
      // Clusters of lighter leaves plus a sunny glint in the upper left.
      const clusters = 3;
      for (let k = 0; k < clusters; k++) {
        const cx = X + T * (0.22 + hash(x, y, 60 + k) * 0.56);
        const cy = top + T * (0.2 + hash(x, y, 70 + k) * 0.55);
        const rad = T * (0.13 + hash(x, y, 80 + k) * 0.08);
        ctx.fillStyle = wall.light;
        circle(ctx, cx, cy, rad);
        ctx.fill();
        ctx.fillStyle = alpha(wall.glint, 0.55);
        circle(ctx, cx - rad * 0.3, cy - rad * 0.35, rad * 0.45);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(0, 40, 10, 0.18)';
      for (let k = 0; k < 3; k++) {
        circle(ctx, X + T * (0.2 + hash(x, y, 90 + k) * 0.6), top + T * (0.35 + hash(x, y, 95 + k) * 0.5), T * 0.05);
        ctx.fill();
      }
      if (hash(x, y, 99) < 0.14) {
        const fx = X + T * (0.3 + hash(x, y, 101) * 0.4);
        const fy = top + T * (0.3 + hash(x, y, 102) * 0.4);
        ctx.fillStyle = wall.accent;
        for (let k = 0; k < 3; k++) {
          circle(ctx, fx + (k - 1) * T * 0.07, fy + (k % 2) * T * 0.05, T * 0.035);
          ctx.fill();
        }
      }
      return;
    }

    if (wall.kind === 'block') {
      const inset = T * 0.07;
      ctx.fillStyle = alpha(wall.light, 0.9);
      ctx.fillRect(X + (n.w ? 0 : inset * 0.5), top + (n.n ? 0 : inset * 0.5), T - (n.w ? 0 : inset * 0.5) - (n.e ? 0 : inset * 0.5), inset * 0.6);
      ctx.fillStyle = alpha(wall.dark, 0.6);
      ctx.fillRect(X, top + T - inset * 0.7, T, inset * 0.7);
      ctx.strokeStyle = alpha(wall.outline, 0.35);
      ctx.lineWidth = Math.max(1, T * 0.022);
      ctx.strokeRect(X + inset, top + inset, T - inset * 2, T - inset * 2);
      if (hash(x, y, 111) < 0.2) {
        const cx = X + T / 2;
        const cy = top + T / 2;
        ctx.strokeStyle = alpha(wall.rune, 0.75);
        ctx.lineWidth = Math.max(1, T * 0.035);
        ctx.beginPath();
        if (hash(x, y, 112) > 0.5) {
          ctx.moveTo(cx, cy - T * 0.16); ctx.lineTo(cx + T * 0.14, cy); ctx.lineTo(cx, cy + T * 0.16); ctx.lineTo(cx - T * 0.14, cy); ctx.closePath();
          ctx.moveTo(cx, cy - T * 0.06); ctx.lineTo(cx, cy + T * 0.06);
        } else {
          for (let a = 0; a < TAU * 1.6; a += 0.3) {
            const rr = T * 0.02 + a * T * 0.018;
            const px = cx + Math.cos(a) * rr;
            const py = cy + Math.sin(a) * rr;
            if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }
      if (!n.s) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.lineWidth = Math.max(1, T * 0.02);
        ctx.beginPath();
        ctx.moveTo(X, Y + T - h / 2); ctx.lineTo(X + T, Y + T - h / 2);
        const seam = hash(x, y, 113) > 0.5 ? 0.35 : 0.65;
        ctx.moveTo(X + T * seam, Y + T - h); ctx.lineTo(X + T * seam, Y + T - h / 2);
        ctx.stroke();
      }
      if (wall.moss && hash(x, y, 114) < 0.3) {
        ctx.fillStyle = alpha(wall.moss, 0.85);
        const mx = X + T * (hash(x, y, 115) > 0.5 ? 0.18 : 0.72);
        for (let k = 0; k < 4; k++) {
          circle(ctx, mx + (hash(x, y, 116 + k) - 0.5) * T * 0.18, top + T * 0.12 + hash(x, y, 120 + k) * T * 0.12, T * 0.045);
          ctx.fill();
        }
      }
      return;
    }

    // Natural rock: a lit upper facet, a shaded lower one and a crack or two.
    const r = T * 0.3;
    ctx.save();
    roundRectPath(ctx, X, top, T, T, [!n.n && !n.w ? r : 0, !n.n && !n.e ? r : 0, !n.s && !n.e ? r : 0, !n.s && !n.w ? r : 0]);
    ctx.clip();
    ctx.fillStyle = alpha(wall.light, 0.85);
    ctx.beginPath();
    ctx.moveTo(X, top);
    ctx.lineTo(X + T * (0.55 + hash(x, y, 130) * 0.3), top);
    ctx.lineTo(X + T * (0.3 + hash(x, y, 131) * 0.2), top + T * (0.45 + hash(x, y, 132) * 0.15));
    ctx.lineTo(X, top + T * (0.5 + hash(x, y, 133) * 0.2));
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = alpha(wall.dark, 0.45);
    ctx.beginPath();
    ctx.moveTo(X + T, top + T * 0.4);
    ctx.lineTo(X + T, top + T);
    ctx.lineTo(X + T * 0.35, top + T);
    ctx.closePath();
    ctx.fill();
    if (hash(x, y, 134) < 0.45) {
      ctx.strokeStyle = alpha(wall.outline, 0.4);
      ctx.lineWidth = Math.max(1, T * 0.022);
      ctx.beginPath();
      const sx = X + T * (0.3 + hash(x, y, 135) * 0.4);
      ctx.moveTo(sx, top + T * 0.25);
      ctx.lineTo(sx + T * 0.08, top + T * 0.45);
      ctx.lineTo(sx - T * 0.02, top + T * 0.62);
      ctx.stroke();
    }
    if (wall.snow && (!n.n || hash(x, y, 136) < 0.35)) {
      ctx.fillStyle = wall.snow;
      ctx.beginPath();
      ctx.moveTo(X, top);
      ctx.lineTo(X + T, top);
      ctx.lineTo(X + T, top + T * 0.18);
      for (let k = 4; k >= 0; k--) {
        const px = X + (k / 4) * T;
        const py = top + T * (0.16 + hash(x * 5 + k, y, 137) * 0.16);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    if (wall.moss && hash(x, y, 138) < 0.25) {
      ctx.fillStyle = alpha(wall.moss, 0.9);
      const mx = X + T * (0.25 + hash(x, y, 139) * 0.5);
      for (let k = 0; k < 4; k++) {
        circle(ctx, mx + (k - 1.5) * T * 0.06, top + T * 0.08 + (k % 2) * T * 0.04, T * 0.05);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ── Animated water ────────────────────────────────────────────────────────

  drawWaterMotion(ctx, t) {
    if (this.reducedMotion) return;
    const g = this.game;
    const area = g.playArea;
    const T = this.T;
    const water = this.theme.water;
    const h = this.wallHeight();
    ctx.save();
    ctx.lineCap = 'round';
    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        const cell = this.baseCell(x, y);
        if (!cell || !WATER_TILES.has(cell) || cell === '=') continue;
        const X = this.px(x);
        const Y = this.py(y);
        const top = Y + (this.isLand(x, y - 1) ? T * 0.22 : T * 0.04);
        const bottom = Y + T - (this.isWall(x, y + 1) ? h : 0) - T * 0.04;
        if (bottom <= top) continue;
        ctx.save();
        ctx.beginPath();
        ctx.rect(X, top, T, bottom - top);
        ctx.clip();
        for (let k = 0; k < 2; k++) {
          const seed = hash(x, y, 150 + k);
          const phase = t * (0.6 + seed * 0.5) + seed * TAU;
          const wx = X + T * (0.2 + ((seed * 0.6 + t * 0.05 * (k ? 1 : -1)) % 0.6 + 0.6) % 0.6);
          const wy = top + (bottom - top) * (0.3 + k * 0.4);
          const w = T * 0.26;
          ctx.strokeStyle = alpha(water.light, 0.28 + Math.sin(phase) * 0.18);
          ctx.lineWidth = Math.max(1, T * 0.03);
          ctx.beginPath();
          ctx.moveTo(wx - w / 2, wy);
          ctx.quadraticCurveTo(wx, wy - T * 0.06, wx + w / 2, wy);
          ctx.stroke();
        }
        if (hash(x, y, 160) < 0.35) {
          const sparkle = Math.max(0, Math.sin(t * 2.3 + hash(x, y, 161) * 20));
          if (sparkle > 0.75) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(sparkle - 0.75) * 3})`;
            starPath(ctx, X + T * (0.25 + hash(x, y, 162) * 0.5), top + (bottom - top) * hash(x, y, 163), T * 0.05, T * 0.015, 4, 0);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ── Ground-level markers ──────────────────────────────────────────────────

  drawTrail(ctx) {
    const trail = this.game.trail;
    if (!trail || trail.length < 2) return;
    const T = this.T;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = alpha(this.theme.path, 0.75);
    ctx.lineWidth = Math.max(2, T * 0.07);
    ctx.setLineDash([0.1, T * 0.2]);
    ctx.beginPath();
    trail.forEach((cell, index) => {
      const px = this.px(cell.x) + T / 2;
      const py = this.py(cell.y) + T / 2 + T * 0.18;
      if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
  }

  drawGroundMarkers(ctx, t) {
    const g = this.game;
    if (g.isRunning || this.crash || this.victoryAt) return;
    // A soft chevron shows where the next ilerle() would take Mojo.
    const T = this.T;
    const { dx, dy } = { UP: { dx: 0, dy: -1 }, RIGHT: { dx: 1, dy: 0 }, DOWN: { dx: 0, dy: 1 }, LEFT: { dx: -1, dy: 0 } }[g.player.dir] || { dx: 1, dy: 0 };
    const cx = this.px(g.player.x) + T / 2 + dx * T * 0.62;
    const cy = this.py(g.player.y) + T / 2 + T * 0.16 + dy * T * 0.55;
    const pulse = this.reducedMotion ? 0.8 : 0.55 + Math.sin(t * 4) * 0.3;
    const nudge = this.reducedMotion ? 0 : Math.sin(t * 4) * T * 0.03;
    ctx.save();
    ctx.translate(cx + dx * nudge, cy + dy * nudge);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = Math.max(1, T * 0.02);
    ctx.beginPath();
    ctx.moveTo(T * 0.1, 0);
    ctx.lineTo(-T * 0.06, -T * 0.1);
    ctx.lineTo(-T * 0.02, 0);
    ctx.lineTo(-T * 0.06, T * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ── Entities ──────────────────────────────────────────────────────────────

  drawEntities(ctx, t, dt) {
    const g = this.game;
    const list = [];
    const area = g.playArea;

    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        const cell = g.gridData[y][x];
        if (cell === 'L') list.push({ y, order: 0, draw: () => this.drawLily(ctx, x, y, t) });
        else if (cell === 'G') list.push({ y, order: 2, draw: () => this.drawGate(ctx, x, y, t) });
      }
    }
    (g.turtles || []).forEach((turtle, index) => {
      list.push({ y: turtle.animY, order: 1, draw: () => this.drawTurtle(ctx, turtle, index, t, dt) });
    });
    for (const banana of g.bananas) {
      if (!banana.collected) list.push({ y: banana.y, order: 3, draw: () => this.drawBanana(ctx, banana.x, banana.y, t) });
    }
    for (const key of g.keys) {
      if (!key.collected) list.push({ y: key.y, order: 3, draw: () => this.drawKey(ctx, key.x, key.y, t) });
    }
    list.push({ y: g.starTile.y - 0.01, order: 3, draw: () => this.drawChest(ctx, t) });
    list.push({ y: this.mojoSortY(), order: 4, draw: () => this.drawHero(ctx, t) });

    list.sort((a, b) => (a.y - b.y) || (a.order - b.order));
    for (const item of list) item.draw();
  }

  mojoSortY() {
    const crash = this.crash;
    if (crash && crash.type === 'water') return crash.to.y;
    return this.game.player.animY;
  }

  drawBanana(ctx, x, y, t) {
    const T = this.T;
    const cx = this.px(x) + T / 2;
    const cy = this.py(y) + T / 2;
    const bob = this.reducedMotion ? 0 : Math.sin(t * 2.4 + x * 1.3 + y * 0.7) * T * 0.035;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ellipse(ctx, cx, cy + T * 0.24, T * (0.2 - bob / T), T * 0.06);
    ctx.fill();
    drawBananaShape(ctx, cx, cy - T * 0.02 + bob, T * 0.58, -0.35);
  }

  drawKey(ctx, x, y, t) {
    const T = this.T;
    const cx = this.px(x) + T / 2;
    const cy = this.py(y) + T / 2;
    const bob = this.reducedMotion ? 0 : Math.sin(t * 2.2 + x) * T * 0.04;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ellipse(ctx, cx, cy + T * 0.24, T * 0.18, T * 0.055);
    ctx.fill();
    const glow = ctx.createRadialGradient(cx, cy + bob, 0, cx, cy + bob, T * 0.42);
    glow.addColorStop(0, 'rgba(255, 220, 110, 0.45)');
    glow.addColorStop(1, 'rgba(255, 220, 110, 0)');
    ctx.fillStyle = glow;
    circle(ctx, cx, cy + bob, T * 0.42);
    ctx.fill();
    drawKeyShape(ctx, cx, cy - T * 0.02 + bob, T * 0.5, this.reducedMotion ? -0.5 : -0.5 + Math.sin(t * 1.6) * 0.12);
    const glint = (t * 0.7 + x * 0.13) % 2.4;
    if (!this.reducedMotion && glint < 0.35) {
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - glint / 0.35})`;
      starPath(ctx, cx + T * 0.14, cy - T * 0.14 + bob, T * 0.08, T * 0.02, 4, 0);
      ctx.fill();
    }
  }

  drawChest(ctx, t) {
    const g = this.game;
    const T = this.T;
    const cx = this.px(g.starTile.x) + T / 2;
    const base = this.py(g.starTile.y) + T / 2 + T * 0.16;
    const ready = g.bananas.every(b => b.collected) && g.keys.every(k => k.collected);
    const openT = this.victoryAt ? easeOutBack((t * 1000 - this.victoryAt) / 450) : 0;
    drawChestShape(ctx, cx, base, T * 0.66, { ready, open: openT, time: this.reducedMotion ? 0 : t });
  }

  drawGate(ctx, x, y, t) {
    const g = this.game;
    const T = this.T;
    const open = g.hasKeyCollected();
    let progress = open ? 1 : 0;
    if (open && this.gateOpenedAt !== null) progress = easeOutCubic((t * 1000 - this.gateOpenedAt) / 500);
    drawGateShape(ctx, this.px(x) + T / 2, this.py(y) + T / 2, T, progress);
  }

  drawLily(ctx, x, y, t) {
    const T = this.T;
    const cx = this.px(x) + T / 2;
    const cy = this.py(y) + T / 2 + T * 0.05;
    const bob = this.reducedMotion ? 0 : Math.sin(t * 1.8 + x * 2.1 + y) * 0.05;
    drawLilyShape(ctx, cx, cy, T * 0.8, bob, hash(x, y, 170) < 0.5);
  }

  drawTurtle(ctx, turtle, index, t, dt) {
    const g = this.game;
    const T = this.T;
    const pilot = Boolean(g.level && g.level.pilotTurtles);
    const phase = ((g.executionStepCount + (turtle.phase || 0)) % 4 + 4) % 4;
    const target = pilot ? 0 : (phase < 2 ? 0 : 1);
    const current = this.turtleSink[index] ?? target;
    const next = this.reducedMotion ? target : current + (target - current) * Math.min(1, dt * 9);
    this.turtleSink[index] = next;
    const cx = this.px(turtle.animX) + T / 2;
    const cy = this.py(turtle.animY) + T / 2 + T * 0.04;
    drawTurtleShape(ctx, cx, cy, T * 0.82, turtle.animRotation || 0, next, this.reducedMotion ? 0 : t);

    if (!pilot) {
      // Four-beat dial: two beats above water, two below. The lit segment is now.
      const radius = T * 0.43;
      ctx.save();
      ctx.lineWidth = Math.max(1.5, T * 0.045);
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const start = -Math.PI / 2 + i * (Math.PI / 2) + 0.18;
        const end = start + Math.PI / 2 - 0.36;
        const up = i < 2;
        const active = i === phase;
        ctx.strokeStyle = active
          ? (up ? 'rgba(160, 255, 190, 0.95)' : 'rgba(255, 150, 150, 0.95)')
          : (up ? 'rgba(160, 255, 190, 0.28)' : 'rgba(255, 170, 170, 0.22)');
        ctx.beginPath();
        ctx.arc(cx, cy, radius, start, end);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawHero(ctx, t) {
    const g = this.game;
    const T = this.T;
    const p = g.player;
    let pose = mojoPoseFromAngle(p.animRotation || 0);
    let x = this.px(p.animX) + T / 2;
    let y = this.py(p.animY) + T / 2 + T * 0.3;
    const size = T * 0.98;
    const state = { pose, time: this.reducedMotion ? 0 : t, hop: 0, squash: 0, walk: 0, mood: 'normal', armsUp: false };
    const now = t * 1000;

    const action = g.currentAction ? g.currentAction.name : null;
    const moving = g.isRunning && g.animationProgress < 1;
    const progress = clamp(g.animationProgress, 0, 1);

    if (this.victoryAt) {
      const since = (now - this.victoryAt) / 1000;
      state.mood = 'happy';
      state.armsUp = since < 2.2 || Math.floor(since * 2) % 4 === 0;
      state.pose = since < 2.4 ? 'down' : pose;
      const hops = since < 1.8 ? Math.abs(Math.sin(since * Math.PI * 2.2)) * (1 - since / 2) : 0;
      state.hop = hops * T * 0.32;
    } else if (this.crash) {
      const c = this.crash;
      const since = (now - c.t0) / 1000;
      if (c.type === 'water') {
        const fromX = this.px(c.from.x) + T / 2;
        const fromY = this.py(c.from.y) + T / 2 + T * 0.3;
        const toX = this.px(c.to.x) + T / 2;
        const toY = this.py(c.to.y) + T / 2 + T * 0.3;
        const travel = easeInOutSine(since / 0.32);
        x = lerp(fromX, toX, travel);
        y = lerp(fromY, toY, travel);
        state.hop = since < 0.32 ? Math.sin(Math.PI * travel) * T * 0.2 : 0;
        if (since > 0.28) {
          this.drawHeroInWater(ctx, toX, toY, size, t, since - 0.28, state.pose);
          return;
        }
      } else {
        const toward = c.to ? { x: c.to.x - c.from.x, y: c.to.y - c.from.y } : { x: 0, y: 0 };
        const bump = since < 0.3 ? Math.sin((since / 0.3) * Math.PI) * 0.22 : 0;
        x += toward.x * bump * T;
        y += toward.y * bump * T;
        state.mood = since > 0.2 ? 'dizzy' : 'worried';
        state.squash = since < 0.3 ? -Math.sin((since / 0.3) * Math.PI) * 0.08 : 0;
      }
    } else if (moving && (action === 'ilerle' || action === 'geriGit')) {
      state.hop = Math.sin(Math.PI * progress) * T * 0.14;
      state.squash = Math.sin(Math.PI * 2 * progress) * 0.045;
      state.walk = progress * Math.PI * 2;
    } else if (moving && (action === 'sagaDon' || action === 'solaDon')) {
      state.hop = Math.sin(Math.PI * progress) * T * 0.06;
    } else if (moving && action === 'bekle') {
      state.squash = Math.sin(Math.PI * 2 * progress) * 0.05;
    } else if (!this.reducedMotion) {
      state.squash = Math.sin(t * 2.4) * 0.018;
    }
    if (this.stuckAt && !g.isRunning) state.mood = 'worried';

    drawMojo(ctx, x, y, size, state);
    if (this.stuckAt && !g.isRunning && !this.crash) this.drawQuestion(ctx, x + T * 0.3, y - size * 0.98, T, t);

    if (moving && action === 'bekle') this.drawThoughtClock(ctx, x + T * 0.3, y - size * 0.95, T, progress);
    if (this.crash && this.crash.type !== 'water') {
      const since = (now - this.crash.t0) / 1000;
      if (since > 0.15) this.drawDizzy(ctx, x, y - size * 0.92, T, t);
    }
  }

  drawHeroInWater(ctx, x, y, size, t, since, pose) {
    const T = this.T;
    const sink = easeOutCubic(since / 0.35);
    const bob = this.reducedMotion ? 0 : Math.sin(t * 3) * T * 0.03;
    const waterLine = y - size * 0.18 + bob;
    ctx.save();
    // Ripples around the swimmer.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = Math.max(1, T * 0.03);
    for (let i = 0; i < 2; i++) {
      const k = ((t * 0.8 + i * 0.5) % 1);
      ctx.globalAlpha = 1 - k;
      ellipse(ctx, x, waterLine, T * (0.3 + k * 0.25), T * (0.1 + k * 0.08));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.rect(x - T, waterLine - T * 2, T * 2, T * 2);
    ctx.clip();
    drawMojo(ctx, x, y + size * 0.3 * sink + bob, size, { pose: pose === 'up' ? 'down' : pose, time: t, mood: 'worried', shadow: false });
    ctx.restore();
    // A swim ring keeps the failure friendly: Mojo is fine, the plan needs a fix.
    const ringY = waterLine;
    ctx.save();
    ctx.lineWidth = T * 0.1;
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = i % 2 === 0 ? '#ff5a4f' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, ringY, T * 0.3, T * 0.11, 0, (i / 8) * TAU, ((i + 1) / 8) * TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawThoughtClock(ctx, x, y, T, progress) {
    ctx.save();
    ctx.globalAlpha = Math.sin(Math.PI * clamp(progress, 0, 1));
    ctx.fillStyle = '#ffffff';
    circle(ctx, x, y, T * 0.17);
    ctx.fill();
    circle(ctx, x - T * 0.14, y + T * 0.16, T * 0.04);
    ctx.fill();
    ctx.strokeStyle = '#2d3a4a';
    ctx.lineWidth = Math.max(1, T * 0.03);
    circle(ctx, x, y, T * 0.11);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(progress * TAU - Math.PI / 2) * T * 0.08, y + Math.sin(progress * TAU - Math.PI / 2) * T * 0.08);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - T * 0.06);
    ctx.stroke();
    ctx.restore();
  }

  drawQuestion(ctx, x, y, T, t) {
    const bob = this.reducedMotion ? 0 : Math.sin(t * 3) * T * 0.03;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    circle(ctx, x, y + bob, T * 0.17);
    ctx.fill();
    circle(ctx, x - T * 0.14, y + T * 0.16 + bob, T * 0.04);
    ctx.fill();
    ctx.fillStyle = '#2d3a4a';
    ctx.font = `800 ${Math.round(T * 0.26)}px Fredoka, Nunito, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', x, y + bob + T * 0.01);
    ctx.restore();
  }

  drawDizzy(ctx, x, y, T, t) {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const angle = t * 4 + (i * TAU) / 3;
      const sx = x + Math.cos(angle) * T * 0.22;
      const sy = y + Math.sin(angle) * T * 0.07;
      ctx.fillStyle = '#ffd84a';
      starPath(ctx, sx, sy, T * 0.07, T * 0.03, 5, angle);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Effects ───────────────────────────────────────────────────────────────

  now() {
    return typeof performance !== 'undefined' ? performance.now() : 0;
  }

  burst(kind, x, y) {
    const now = this.now();
    const cx = x + 0.5;
    const cy = y + 0.5;
    if (this.reducedMotion) {
      if (kind === 'banana') this.floaters.push({ x: cx, y: cy - 0.2, t0: now, text: '+1', color: '#ffe066' });
      return;
    }
    const add = (count, options) => {
      for (let i = 0; i < count; i++) {
        const angle = options.angle !== undefined ? options.angle + (Math.random() - 0.5) * options.spread : Math.random() * TAU;
        const speed = options.speed[0] + Math.random() * (options.speed[1] - options.speed[0]);
        this.particles.push({
          x: cx + (Math.random() - 0.5) * (options.jitter || 0),
          y: cy + (options.yOffset || 0),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + (options.lift || 0),
          gravity: options.gravity ?? 3,
          life: 0,
          maxLife: options.life[0] + Math.random() * (options.life[1] - options.life[0]),
          size: options.size[0] + Math.random() * (options.size[1] - options.size[0]),
          color: options.colors[Math.floor(Math.random() * options.colors.length)],
          shape: options.shape || 'circle',
          rot: Math.random() * TAU,
          vr: (Math.random() - 0.5) * 8
        });
      }
    };
    if (kind === 'banana') {
      add(14, { speed: [1.2, 2.6], lift: -1.4, life: [0.45, 0.8], size: [0.035, 0.07], colors: ['#ffe066', '#fff6c2', '#ffc93c'], shape: 'star', yOffset: -0.1 });
      this.rings.push({ x: cx, y: cy + 0.05, t0: now, dur: 450, color: '255, 224, 102', max: 0.45 });
      this.floaters.push({ x: cx, y: cy - 0.25, t0: now, text: '+1', color: '#ffe066' });
    } else if (kind === 'key') {
      add(16, { speed: [1, 2.4], lift: -1.2, life: [0.5, 0.9], size: [0.03, 0.06], colors: ['#ffd86b', '#fff3c4'], shape: 'star' });
      this.rings.push({ x: cx, y: cy, t0: now, dur: 500, color: '255, 216, 107', max: 0.55 });
    } else if (kind === 'leaf') {
      add(9, { speed: [0.5, 1.4], lift: -0.6, gravity: 1.2, life: [0.5, 0.9], size: [0.04, 0.07], colors: ['#6fcf6b', '#9be27f', '#3f9d4f'], shape: 'leaf' });
      this.rings.push({ x: cx, y: cy + 0.05, t0: now, dur: 700, color: '255, 255, 255', max: 0.5 });
      this.sinks.push({ x, y, t0: now });
    } else if (kind === 'splash') {
      add(18, { angle: -Math.PI / 2, spread: 1.8, speed: [1.6, 3.2], gravity: 7, life: [0.4, 0.7], size: [0.03, 0.06], colors: ['#ffffff', '#bff2ff', '#7fdcf5'] });
      for (let i = 0; i < 3; i++) this.rings.push({ x: cx, y: cy + 0.1, t0: now + i * 140, dur: 700, color: '255, 255, 255', max: 0.6 });
    } else if (kind === 'bump') {
      add(8, { speed: [0.8, 1.6], lift: -0.8, life: [0.3, 0.5], size: [0.03, 0.05], colors: ['#ffffff', '#ffe3a0'], shape: 'star' });
    } else if (kind === 'dust') {
      add(4, { speed: [0.25, 0.6], lift: -0.2, gravity: 0.3, life: [0.3, 0.5], size: [0.04, 0.07], colors: ['rgba(255,255,255,0.5)'], yOffset: 0.28 });
    } else if (kind === 'gate' || kind === 'ready') {
      add(14, { speed: [0.8, 2], lift: -1, life: [0.5, 0.9], size: [0.03, 0.06], colors: ['#ffd86b', '#ffffff'], shape: 'star' });
      this.rings.push({ x: cx, y: cy, t0: now, dur: 600, color: '255, 216, 107', max: 0.7 });
    }
  }

  flyKey(from, to, duration = 650) {
    this.flyingKey = { from, to, t0: this.now(), dur: duration };
  }

  gateOpened(delay = 0) {
    this.gateOpenedAt = this.now() + delay;
  }

  // The program ended short of the goal: Mojo looks puzzled where he stands.
  markStuck() {
    this.stuckAt = this.now();
  }

  startCrash(type, from, to) {
    this.crash = { type, from, to: to || from, t0: this.now() };
    if (type === 'water') {
      const target = to || from;
      this.pendingSplash = { x: target.x, y: target.y, at: this.crash.t0 + 280 };
    } else {
      this.burst('bump', (to || from).x, (to || from).y);
    }
  }

  startVictory() {
    this.victoryAt = this.now();
    const goal = this.game.starTile;
    if (this.reducedMotion) return;
    const cx = goal.x + 0.5;
    const cy = goal.y + 0.4;
    const colors = ['#ffd84a', '#ff7a45', '#72d9a5', '#74cce8', '#c5a2ef', '#ffffff'];
    for (let i = 0; i < 70; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = 2.5 + Math.random() * 4.5;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        gravity: 5.5, life: 0, maxLife: 1.2 + Math.random() * 0.9,
        size: 0.05 + Math.random() * 0.05,
        color: colors[i % colors.length], shape: 'confetti',
        rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 14
      });
    }
    this.rings.push({ x: cx, y: cy, t0: this.victoryAt, dur: 800, color: '255, 230, 140', max: 1.4 });
  }

  isAnimatingEffects() {
    return this.particles.length > 0 || this.rings.length > 0 || this.floaters.length > 0 || this.sinks.length > 0 || Boolean(this.flyingKey) || Boolean(this.pendingSplash);
  }

  drawEffects(ctx, t, dt) {
    const T = this.T;
    const now = t * 1000;

    if (this.pendingSplash && now >= this.pendingSplash.at) {
      const splash = this.pendingSplash;
      this.pendingSplash = null;
      this.burst('splash', splash.x, splash.y);
    }

    // Victory light rays behind everything else in the effect layer.
    if (this.victoryAt && !this.reducedMotion) {
      const since = (now - this.victoryAt) / 1000;
      if (since < 3.5) {
        const goal = this.game.starTile;
        const cx = this.px(goal.x) + T / 2;
        const cy = this.py(goal.y) + T * 0.45;
        const fade = since < 0.4 ? since / 0.4 : since > 2.8 ? Math.max(0, 1 - (since - 2.8) / 0.7) : 1;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(since * 0.6);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 10; i++) {
          ctx.rotate(TAU / 10);
          const gradient = ctx.createLinearGradient(0, 0, T * 1.8, 0);
          gradient.addColorStop(0, `rgba(255, 226, 130, ${0.35 * fade})`);
          gradient.addColorStop(1, 'rgba(255, 226, 130, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(T * 1.8, -T * 0.18);
          ctx.lineTo(T * 1.8, T * 0.18);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Sinking lily pads.
    this.sinks = this.sinks.filter(sink => {
      const k = (now - sink.t0) / 600;
      if (k >= 1) return false;
      const cx = this.px(sink.x) + T / 2;
      const cy = this.py(sink.y) + T / 2 + T * 0.05;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      drawLilyShape(ctx, cx, cy + k * T * 0.05, T * 0.8 * (1 - k * 0.6), 0, false);
      ctx.restore();
      return true;
    });

    // Expanding rings.
    this.rings = this.rings.filter(ring => {
      const k = (now - ring.t0) / ring.dur;
      if (k < 0) return true;
      if (k >= 1) return false;
      ctx.strokeStyle = `rgba(${ring.color}, ${(1 - k) * 0.8})`;
      ctx.lineWidth = Math.max(1, T * 0.04 * (1 - k));
      ellipse(ctx, this.px(ring.x - 0.5) + T / 2, this.py(ring.y - 0.5) + T / 2, ring.max * T * easeOutCubic(k), ring.max * T * 0.45 * easeOutCubic(k));
      ctx.stroke();
      return true;
    });

    // Key flying to its gate.
    if (this.flyingKey) {
      const f = this.flyingKey;
      const k = (now - f.t0) / f.dur;
      if (k >= 1) {
        this.flyingKey = null;
      } else {
        const e = easeInOutSine(k);
        const x = lerp(f.from.x, f.to.x, e);
        const y = lerp(f.from.y, f.to.y, e) - Math.sin(Math.PI * e) * 1.2;
        drawKeyShape(ctx, this.px(x) + T / 2, this.py(y) + T / 2, T * 0.45 * (1 - k * 0.3), -0.5 + k * TAU);
      }
    }

    // Particles.
    this.particles = this.particles.filter(p => {
      p.life += dt;
      if (p.life >= p.maxLife) return false;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const k = p.life / p.maxLife;
      const x = this.px(p.x - 0.5) + T / 2;
      const y = this.py(p.y - 0.5) + T / 2;
      const size = p.size * T;
      ctx.save();
      ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      ctx.fillStyle = p.color;
      ctx.translate(x, y);
      ctx.rotate(p.rot);
      if (p.shape === 'star') {
        starPath(ctx, 0, 0, size * 1.6, size * 0.65, 4, 0);
        ctx.fill();
      } else if (p.shape === 'confetti') {
        ctx.fillRect(-size, -size * 0.45, size * 2, size * 0.9 * Math.abs(Math.cos(p.rot * 1.3)) + size * 0.2);
      } else if (p.shape === 'leaf') {
        ellipse(ctx, 0, 0, size * 1.4, size * 0.7);
        ctx.fill();
      } else {
        circle(ctx, 0, 0, size);
        ctx.fill();
      }
      ctx.restore();
      return true;
    });

    // Floating "+1" labels.
    this.floaters = this.floaters.filter(f => {
      const k = (now - f.t0) / 900;
      if (k >= 1) return false;
      const x = this.px(f.x - 0.5) + T / 2;
      const y = this.py(f.y - 0.5) + T / 2 - easeOutCubic(k) * T * 0.6;
      ctx.save();
      ctx.globalAlpha = k > 0.6 ? (1 - k) / 0.4 : 1;
      ctx.font = `800 ${Math.round(T * 0.32)}px Fredoka, Nunito, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(2, T * 0.07);
      ctx.strokeStyle = 'rgba(60, 35, 0, 0.55)';
      ctx.strokeText(f.text, x, y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, x, y);
      ctx.restore();
      return true;
    });
  }

  // ── Ruler ─────────────────────────────────────────────────────────────────

  drawRuler(ctx) {
    const g = this.game;
    if (!g.rulerActive || !g.hoveredCell) return;
    const T = this.T;
    const target = g.hoveredCell;
    const from = { x: g.player.x, y: g.player.y };
    const center = cell => ({ x: this.px(cell.x) + T / 2, y: this.py(cell.y) + T / 2 + T * 0.1 });
    const a = center(from);
    const corner = center({ x: target.x, y: from.y });
    const b = center(target);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, T * 0.04);
    roundRectPath(ctx, this.px(target.x) + T * 0.06, this.py(target.y) + T * 0.06, T * 0.88, T * 0.88, T * 0.16);
    ctx.fill();
    ctx.stroke();

    ctx.setLineDash([T * 0.12, T * 0.08]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(corner.x, corner.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const badge = (x, y, text) => {
      ctx.font = `800 ${Math.round(T * 0.24)}px Nunito, system-ui, sans-serif`;
      const w = ctx.measureText(text).width + T * 0.26;
      const hgt = T * 0.36;
      ctx.fillStyle = 'rgba(16, 24, 32, 0.88)';
      roundRectPath(ctx, x - w / 2, y - hgt / 2, w, hgt, hgt / 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y + T * 0.01);
    };
    const dx = target.x - from.x;
    const dy = target.y - from.y;
    if (dx) badge((a.x + corner.x) / 2, a.y - T * 0.32, `${Math.abs(dx)} ${dx > 0 ? '→' : '←'}`);
    if (dy) badge(corner.x + T * 0.42, (corner.y + b.y) / 2, `${Math.abs(dy)} ${dy > 0 ? '↓' : '↑'}`);
    if (!dx && !dy) badge(a.x, a.y - T * 0.6, 'Mojo burada');
    ctx.restore();
  }
}

// ── Shared item art ─────────────────────────────────────────────────────────
// Exported so the interface can show the very same banana, key or chest in
// counters and concept cards instead of emoji look-alikes.

export function drawBananaShape(ctx, x, y, size, rotation = -0.35) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(s, s);
  const body = ctx.createLinearGradient(0, -30, 0, 30);
  body.addColorStop(0, '#fff07a');
  body.addColorStop(0.55, '#ffd23a');
  body.addColorStop(1, '#e9a91c');
  ctx.fillStyle = body;
  ctx.strokeStyle = '#9a6a10';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-36, -12);
  ctx.quadraticCurveTo(-8, 34, 38, 4);
  ctx.quadraticCurveTo(40, -2, 34, -4);
  ctx.quadraticCurveTo(-2, 14, -26, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-22, -6);
  ctx.quadraticCurveTo(-4, 16, 22, 6);
  ctx.stroke();
  ctx.fillStyle = '#6d4513';
  ctx.beginPath();
  ctx.moveTo(-36, -12);
  ctx.lineTo(-41, -21);
  ctx.lineTo(-33, -24);
  ctx.lineTo(-26, -18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#4a2c0a';
  circle(ctx, 37, 1, 3.2);
  ctx.fill();
  ctx.restore();
}

export function drawKeyShape(ctx, x, y, size, rotation = -0.5) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(s, s);
  const gold = ctx.createLinearGradient(-40, -20, 40, 20);
  gold.addColorStop(0, '#fff0a0');
  gold.addColorStop(0.5, '#ffc93c');
  gold.addColorStop(1, '#d9901a');
  ctx.fillStyle = gold;
  ctx.strokeStyle = '#8a5a0a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(-22, 0, 17, 0, TAU);
  ctx.moveTo(-10, 0);
  ctx.arc(-22, 0, 7, 0, TAU, true);
  ctx.fill('evenodd');
  ctx.stroke();
  roundRectPath(ctx, -7, -5.5, 48, 11, 4);
  ctx.fill();
  ctx.stroke();
  roundRectPath(ctx, 24, 3, 8, 13, 2);
  ctx.fill();
  ctx.stroke();
  roundRectPath(ctx, 34, 3, 7, 10, 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawChestShape(ctx, x, base, size, { ready = false, open = 0, time = 0 } = {}) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, base);
  ctx.scale(s, s);
  if (ready || open > 0) {
    const pulse = 0.55 + Math.sin(time * 4) * 0.2;
    const glow = ctx.createRadialGradient(0, -34, 4, 0, -34, 80);
    glow.addColorStop(0, `rgba(255, 224, 120, ${0.65 * pulse + open * 0.3})`);
    glow.addColorStop(1, 'rgba(255, 224, 120, 0)');
    ctx.fillStyle = glow;
    circle(ctx, 0, -34, 80);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(30, 15, 0, 0.28)';
  ellipse(ctx, 0, 2, 50, 12);
  ctx.fill();

  const wood = '#a8612c';
  const woodDark = '#7a4119';
  const gold = '#ffcc4d';
  const goldDark = '#c98a17';
  const outline = '#4a2508';

  // Body
  ctx.lineWidth = 4;
  ctx.strokeStyle = outline;
  const bodyGradient = ctx.createLinearGradient(0, -48, 0, 0);
  bodyGradient.addColorStop(0, wood);
  bodyGradient.addColorStop(1, woodDark);
  ctx.fillStyle = bodyGradient;
  roundRectPath(ctx, -44, -48, 88, 48, 7);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-40, -24); ctx.lineTo(40, -24);
  ctx.stroke();

  // Lid: rises and tilts back as it opens.
  const lift = open * 26;
  ctx.save();
  ctx.translate(0, -48 - lift * 0.4);
  ctx.scale(1, 1 - open * 0.55);
  ctx.fillStyle = wood;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-46, 2);
  ctx.lineTo(-46, -14);
  ctx.quadraticCurveTo(0, -40, 46, -14);
  ctx.lineTo(46, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.beginPath();
  ctx.moveTo(-38, -14);
  ctx.quadraticCurveTo(0, -34, 38, -14);
  ctx.quadraticCurveTo(0, -28, -38, -10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = gold;
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 2.5;
  for (const bx of [-30, 22]) {
    ctx.beginPath();
    ctx.rect(bx, -26, 8, 28);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  if (open > 0.05) {
    ctx.fillStyle = `rgba(255, 236, 150, ${Math.min(1, open)})`;
    ellipse(ctx, 0, -50 - lift * 0.2, 40 * open, 8 * open);
    ctx.fill();
    ctx.fillStyle = '#ffd84a';
    for (let i = 0; i < 5; i++) {
      circle(ctx, -24 + i * 12, -52 - lift * 0.2 - (i % 2) * 5, 5.5 * open);
      ctx.fill();
    }
  }

  // Gold straps and lock plate.
  ctx.fillStyle = gold;
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 2.5;
  for (const bx of [-30, 22]) {
    ctx.beginPath();
    ctx.rect(bx, -48, 8, 48);
    ctx.fill();
    ctx.stroke();
  }
  roundRectPath(ctx, -9, -34 - (open > 0.3 ? 0 : 0), 18, 20, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = outline;
  circle(ctx, 0, -27, 2.8);
  ctx.fill();
  ctx.fillRect(-1.3, -27, 2.6, 7);
  ctx.restore();
}

export function drawGateShape(ctx, x, y, T, open = 0) {
  const post = '#8d8496';
  const postDark = '#5d5568';
  const wood = '#a4642f';
  const woodDark = '#6f3d17';
  ctx.save();
  ctx.translate(x, y);
  const h = T * 0.78;
  const top = T * 0.3 - h;
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ellipse(ctx, 0, T * 0.32, T * 0.46, T * 0.1);
  ctx.fill();
  // Door leaves swing open towards the posts.
  const leaf = (sign) => {
    const width = T * 0.36 * (1 - open * 0.78);
    const x0 = sign < 0 ? -T * 0.38 : T * 0.38 - width;
    ctx.fillStyle = wood;
    ctx.strokeStyle = woodDark;
    ctx.lineWidth = Math.max(1, T * 0.03);
    roundRectPath(ctx, x0, top + T * 0.14, width, h - T * 0.2, T * 0.04);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = Math.max(1, T * 0.02);
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x0 + (width * i) / 3, top + T * 0.18);
      ctx.lineTo(x0 + (width * i) / 3, top + h - T * 0.1);
      ctx.stroke();
    }
    ctx.fillStyle = '#3d3f4a';
    ctx.fillRect(x0, top + T * 0.26, width, T * 0.05);
    ctx.fillRect(x0, top + h - T * 0.22, width, T * 0.05);
  };
  leaf(-1);
  leaf(1);
  // Posts
  for (const sign of [-1, 1]) {
    const px = sign * T * 0.42;
    const gradient = ctx.createLinearGradient(px - T * 0.08, 0, px + T * 0.08, 0);
    gradient.addColorStop(0, post);
    gradient.addColorStop(1, postDark);
    ctx.fillStyle = gradient;
    roundRectPath(ctx, px - T * 0.08, top, T * 0.16, h + T * 0.04, T * 0.04);
    ctx.fill();
    ctx.fillStyle = shade(post, 0.25);
    roundRectPath(ctx, px - T * 0.1, top - T * 0.05, T * 0.2, T * 0.09, T * 0.03);
    ctx.fill();
  }
  // Padlock
  if (open < 0.99) {
    const drop = open * T * 0.5;
    ctx.globalAlpha = 1 - open;
    ctx.strokeStyle = '#8b93a3';
    ctx.lineWidth = Math.max(1.5, T * 0.035);
    ctx.beginPath();
    ctx.arc(0, top + h * 0.45 + drop - T * 0.06, T * 0.07, Math.PI, 0);
    ctx.stroke();
    const lock = ctx.createLinearGradient(0, top + h * 0.45 + drop - T * 0.06, 0, top + h * 0.45 + drop + T * 0.1);
    lock.addColorStop(0, '#ffd66b');
    lock.addColorStop(1, '#d99a1f');
    ctx.fillStyle = lock;
    roundRectPath(ctx, -T * 0.1, top + h * 0.45 + drop - T * 0.06, T * 0.2, T * 0.16, T * 0.04);
    ctx.fill();
    ctx.fillStyle = '#6d4a0e';
    circle(ctx, 0, top + h * 0.45 + drop + T * 0.01, T * 0.025);
    ctx.fill();
  }
  ctx.restore();
}

export function drawLilyShape(ctx, x, y, size, wobble = 0, flower = false) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(wobble);
  ctx.scale(s * (1 + wobble * 0.3), s * (1 - wobble * 0.3));
  ctx.fillStyle = 'rgba(0, 40, 40, 0.25)';
  ellipse(ctx, 2, 6, 40, 26);
  ctx.fill();
  const pad = ctx.createRadialGradient(-10, -10, 4, 0, 0, 44);
  pad.addColorStop(0, '#8fdc6a');
  pad.addColorStop(1, '#3f9a45');
  ctx.fillStyle = pad;
  ctx.strokeStyle = '#2b6e33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 27, 0, 0.35, TAU - 0.35);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(210, 255, 180, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const angle of [0.9, 1.9, 2.8, 3.8, 4.7, 5.5]) {
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * 33, Math.sin(angle) * 22);
  }
  ctx.stroke();
  if (flower) {
    ctx.fillStyle = '#ffb3d1';
    ctx.strokeStyle = '#e0709c';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TAU;
      ellipse(ctx, -12 + Math.cos(angle) * 7, -6 + Math.sin(angle) * 5, 6, 4, angle);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#ffe27a';
    circle(ctx, -12, -6, 3.5);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTurtleShape(ctx, x, y, size, rotation = 0, sink = 0, time = 0) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  // Ripple ring on the surface.
  const surfaced = 1 - sink;
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * surfaced + 0.15})`;
  ctx.lineWidth = Math.max(1, size * 0.025);
  ellipse(ctx, 0, size * 0.06, size * (0.4 + Math.sin(time * 2) * 0.02), size * 0.2);
  ctx.stroke();

  ctx.rotate(rotation);
  ctx.scale(s * (1 - sink * 0.12), s * (1 - sink * 0.12));
  ctx.globalAlpha = 1 - sink * 0.62;
  const paddle = Math.sin(time * 4) * 0.25;
  const skin = sink > 0.5 ? '#2f6f6a' : '#5fbf6a';
  const skinDark = sink > 0.5 ? '#244f4c' : '#2f8a45';
  ctx.fillStyle = skin;
  ctx.strokeStyle = skinDark;
  ctx.lineWidth = 3;
  const flipper = (fx, fy, rot, rx, ry) => {
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(rot);
    ellipse(ctx, 0, 0, rx, ry);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  flipper(-22, -18, -0.8 + paddle, 15, 7);
  flipper(22, -18, 0.8 - paddle, 15, 7);
  flipper(-19, 20, -2.3 - paddle * 0.6, 11, 6);
  flipper(19, 20, 2.3 + paddle * 0.6, 11, 6);
  circle(ctx, 0, -32, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#12301c';
  circle(ctx, -4, -35, 2);
  ctx.fill();
  circle(ctx, 4, -35, 2);
  ctx.fill();
  const shell = ctx.createRadialGradient(-8, -8, 4, 0, 0, 30);
  shell.addColorStop(0, sink > 0.5 ? '#3c6f78' : '#9a7a3c');
  shell.addColorStop(1, sink > 0.5 ? '#244a54' : '#5e4620');
  ctx.fillStyle = shell;
  ctx.strokeStyle = sink > 0.5 ? '#1c3a42' : '#3e2c12';
  ctx.lineWidth = 3.5;
  ellipse(ctx, 0, 0, 26, 29);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = sink > 0.5 ? 'rgba(160, 220, 230, 0.35)' : 'rgba(255, 220, 150, 0.5)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * TAU;
    const px = Math.cos(angle) * 10;
    const py = Math.sin(angle) * 11;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * TAU;
    ctx.moveTo(Math.cos(angle) * 10, Math.sin(angle) * 11);
    ctx.lineTo(Math.cos(angle) * 24, Math.sin(angle) * 27);
  }
  ctx.stroke();
  ctx.restore();

  if (sink > 0.35) {
    // Bubbles rise from a submerged turtle.
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const k = (time * 0.9 + i / 3) % 1;
      ctx.fillStyle = `rgba(255, 255, 255, ${(1 - k) * 0.7 * sink})`;
      circle(ctx, x + (i - 1) * size * 0.12 + Math.sin(time * 3 + i) * size * 0.03, y - k * size * 0.35, size * (0.03 + i * 0.008));
      ctx.fill();
    }
    ctx.restore();
  }
}
