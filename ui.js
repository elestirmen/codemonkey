// Arayüz: editör, komut paleti, görev kartı, ada haritası ve pencereler.
// Oyunun kuralları burada değil; bu modül yalnızca Game'i yönetir ve
// sonuçları gösterir.

import { Game, SPEEDS } from './game.js?v=20261007-v5';
import { LEVELS, ISLANDS } from './levels.js?v=20261007-v5';
import { parseProgram, formatProgram, convertSyntax, SENSORS, foldTurkish } from './lang.js?v=20261007-v5';
import { DIRECTION_NAMES } from './world.js?v=20261007-v5';
import { soundEngine } from './audio.js?v=20261007-v5';

// ── Kayıt ──────────────────────────────────────────────────────────────────

const KEY = {
  progress: 'km5_progress',
  level: 'km5_level',
  code: (id, syntax) => `km5_code_${id}_${syntax}`,
  theme: 'km5_theme',
  sound: 'km5_sound',
  syntax: 'km5_syntax',
  dev: 'km5_dev',
  speed: 'km5_speed',
  welcome: 'km5_welcome',
  learned: 'km5_learned',
  hints: 'km5_hints'
};

const store = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      // Kayıt kapalıysa oyun yine oynanır.
    }
  },
  json(key, fallback) {
    const raw = this.get(key);
    if (!raw) return fallback;
    try {
      const value = JSON.parse(raw);
      return value ?? fallback;
    } catch (_) {
      return fallback;
    }
  }
};

const state = {
  index: 0,
  syntax: 'indent',
  dev: false,
  stars: {},
  best: {},
  unlocked: 0,
  learned: new Set(),
  hints: {},
  running: false,
  stepping: false,
  lastError: null,
  activeLine: null,
  badges: new Map(),
  vars: null
};

function loadProgress() {
  const saved = store.json(KEY.progress, null);
  if (saved && typeof saved === 'object') {
    state.stars = sanitizeMap(saved.stars, value => Math.max(0, Math.min(3, value)));
    state.best = sanitizeMap(saved.best, value => Math.max(1, value));
    state.unlocked = Number.isInteger(saved.unlocked) ? Math.max(0, Math.min(LEVELS.length - 1, saved.unlocked)) : 0;
  } else {
    migrateOldProgress();
  }
  for (const id of Object.keys(state.stars)) {
    const index = LEVELS.findIndex(level => level.id === Number(id));
    if (index >= 0) state.unlocked = Math.max(state.unlocked, Math.min(LEVELS.length - 1, index + 1));
  }
  state.learned = new Set(store.json(KEY.learned, []));
  state.hints = store.json(KEY.hints, {}) || {};
}

function sanitizeMap(source, clamp) {
  const out = {};
  if (!source || typeof source !== 'object') return out;
  for (const [id, value] of Object.entries(source)) {
    if (LEVELS.some(level => level.id === Number(id)) && Number.isFinite(Number(value))) out[id] = clamp(Number(value));
  }
  return out;
}

// Önceki sürümde ilerlemiş bir oyuncu, ulaştığı bölümün adasından başlar.
function migrateOldProgress() {
  const old = store.json('kodmaymunu_unlocked', null);
  if (!Array.isArray(old) || !old.length) return;
  const furthest = Math.max(...old.filter(Number.isInteger));
  const island = Math.min(ISLANDS.length, Math.floor(furthest / 20) + 1);
  if (island <= 1) return;
  state.unlocked = LEVELS.findIndex(level => level.island === island);
  state.migratedIsland = island;
  saveProgress();
}

function saveProgress() {
  store.set(KEY.progress, JSON.stringify({ stars: state.stars, best: state.best, unlocked: state.unlocked }));
}

// ── DOM ────────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);
const dom = {
  app: $('app'),
  canvas: $('game-canvas'),
  stage: document.querySelector('.stage'),
  levelIsland: $('level-island'),
  levelTitle: $('level-title'),
  prev: $('btn-prev'),
  next: $('btn-next'),
  starTotal: $('star-total'),
  sound: $('btn-sound'),
  settings: $('settings'),
  syntax: $('syntax-mode'),
  theme: $('btn-theme'),
  themeLabel: $('theme-label'),
  guide: $('btn-guide'),
  clearCode: $('btn-clear-code'),
  dev: $('btn-dev'),
  devLabel: $('dev-label'),
  map: $('btn-map'),
  scenarioTabs: $('scenario-tabs'),
  bananaCounter: $('banana-counter'),
  keyCounter: $('key-counter'),
  ruler: $('btn-ruler'),
  bubble: $('bubble'),
  bubbleText: $('bubble-text'),
  statusChip: $('status-chip'),
  statusText: $('status-text'),
  facing: $('facing-chip'),
  concept: $('concept-chip'),
  missionTitle: $('mission-title'),
  missionText: $('mission-text'),
  targets: $('targets'),
  hint: $('btn-hint'),
  lineMeter: $('line-meter'),
  gutter: $('gutter'),
  layer: $('code-layer'),
  code: $('code'),
  vars: $('vars'),
  palette: $('palette'),
  run: $('btn-run'),
  step: $('btn-step'),
  back: $('btn-back'),
  reset: $('btn-reset'),
  speed: $('speed'),
  mapOverlay: $('map-overlay'),
  islands: $('islands'),
  winOverlay: $('win-overlay'),
  winEyebrow: $('win-eyebrow'),
  winStars: $('win-stars'),
  winTitle: $('win-title'),
  winText: $('win-text'),
  winFacts: $('win-facts'),
  winRetry: $('btn-win-retry'),
  winNext: $('btn-win-next'),
  hintOverlay: $('hint-overlay'),
  hintList: $('hint-list'),
  moreHint: $('btn-more-hint'),
  solutionBox: $('solution-box'),
  solutionCode: $('solution-code'),
  useSolution: $('btn-use-solution'),
  learnOverlay: $('learn-overlay'),
  learnEyebrow: $('learn-eyebrow'),
  learnTitle: $('learn-title'),
  learnBody: $('learn-body'),
  welcomeOverlay: $('welcome-overlay'),
  welcomeStart: $('btn-welcome'),
  toasts: $('toasts')
};

const game = new Game(dom.canvas);
const level = () => LEVELS[state.index];

// Görev metinlerinde yalnızca birkaç güvenli biçim etiketi kullanılır.
const RICH_TAGS = new Set(['CODE', 'B', 'STRONG', 'I', 'EM', 'BR']);
function setRich(element, html) {
  element.replaceChildren();
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const copy = (node, parent) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        parent.appendChild(document.createTextNode(child.textContent));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (RICH_TAGS.has(child.tagName)) {
          const clean = document.createElement(child.tagName.toLowerCase());
          copy(child, clean);
          parent.appendChild(clean);
        } else {
          copy(child, parent);
        }
      }
    }
  };
  copy(doc.body.firstChild, element);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function toast(message) {
  const node = el('div', 'toast', message);
  dom.toasts.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}

// ── Pencereler ─────────────────────────────────────────────────────────────

let openOverlay = null;
let focusBeforeOverlay = null;

function showOverlay(overlay, focus = null) {
  if (openOverlay && openOverlay !== overlay) hideOverlay(openOverlay, false);
  focusBeforeOverlay = document.activeElement;
  overlay.hidden = false;
  openOverlay = overlay;
  (focus || overlay.querySelector('button, [href], select, summary'))?.focus();
}

function hideOverlay(overlay = openOverlay, restore = true) {
  if (!overlay) return;
  overlay.hidden = true;
  if (openOverlay === overlay) openOverlay = null;
  if (restore && focusBeforeOverlay && document.contains(focusBeforeOverlay)) focusBeforeOverlay.focus();
}

for (const overlay of document.querySelectorAll('.overlay')) {
  overlay.addEventListener('click', event => {
    if (event.target === overlay || event.target.closest('[data-close]')) hideOverlay(overlay);
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (openOverlay) {
      hideOverlay();
      event.preventDefault();
    } else if (dom.settings.open) {
      dom.settings.open = false;
    }
    return;
  }
  if (event.key === 'Tab' && openOverlay) {
    const focusable = [...openOverlay.querySelectorAll('button:not([disabled]), [href], select, summary, textarea')].filter(node => node.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }
});

document.addEventListener('click', event => {
  if (dom.settings.open && !dom.settings.contains(event.target)) dom.settings.open = false;
});

// ── Ayarlar ────────────────────────────────────────────────────────────────

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  dom.themeLabel.textContent = theme === 'light' ? 'Koyu tema' : 'Açık tema';
  document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'light' ? '#eef5f0' : '#0b1712');
}

function applySound(enabled) {
  if (soundEngine.isSoundEnabled() !== enabled) soundEngine.toggleSound();
  dom.sound.setAttribute('aria-pressed', String(enabled));
  dom.sound.setAttribute('aria-label', enabled ? 'Sesi kapat' : 'Sesi aç');
  dom.sound.querySelector('use').setAttribute('href', enabled ? '#i-sound' : '#i-mute');
}

function applyDev(enabled) {
  state.dev = enabled;
  dom.dev.classList.toggle('on', enabled);
  dom.devLabel.textContent = enabled ? 'Öğretmen modu açık' : 'Öğretmen modu';
}

// ── Görev yükleme ──────────────────────────────────────────────────────────

function isUnlocked(index) {
  return state.dev || index <= state.unlocked;
}

function islandOf(lvl) {
  return ISLANDS.find(island => island.id === lvl.island);
}

function codeKey(lvl = level(), syntax = state.syntax) {
  return KEY.code(lvl.id, syntax);
}

function starterCode(lvl) {
  if (!lvl.starter) return '';
  return state.syntax === 'indent' ? lvl.starter : convertSyntax(lvl.starter, 'bracket');
}

function loadLevel(index, { fromUser = true } = {}) {
  const target = Math.max(0, Math.min(LEVELS.length - 1, index));
  if (!isUnlocked(target)) {
    toast('Bu görev, öncekini bitirince açılır.');
    return;
  }
  saveDraft();
  state.index = target;
  store.set(KEY.level, String(target));
  const lvl = level();
  const island = islandOf(lvl);
  document.documentElement.style.setProperty('--island', island.color);

  game.load(lvl);
  // Telefonda sahne, haritanın en/boy oranına göre uzar ya da kısalır.
  document.documentElement.style.setProperty('--board-ratio', ((game.gridHeight + 1.4) / (game.gridWidth + 0.8)).toFixed(3));
  clearRunDecor();
  hideBubble();

  dom.levelIsland.textContent = `ADA ${island.id} · ${island.name.toLocaleUpperCase('tr')} · ${lvl.islandIndex}/${LEVELS.filter(l => l.island === island.id).length}`;
  dom.levelTitle.textContent = `${lvl.id}. ${lvl.title}`;
  document.title = `${lvl.id}. ${lvl.title} · KodMaymunu`;
  dom.prev.disabled = target === 0;
  dom.next.disabled = target >= LEVELS.length - 1 || !isUnlocked(target + 1);

  dom.concept.textContent = lvl.concept;
  dom.missionTitle.textContent = lvl.title;
  setRich(dom.missionText, lvl.text);
  renderTargets();

  const draft = store.get(codeKey(lvl), null);
  dom.code.value = draft !== null ? draft : starterCode(lvl);
  renderPalette();
  renderScenarioTabs();
  refreshEditor();
  updateCounters();
  updateFacing();
  setStatus(lvl.starter && draft === null ? 'Kodda bir hata var; bul ve düzelt!' : 'Hazır', 'idle');
  updateControls();

  if (fromUser) maybeShowLesson(lvl);
}

function renderTargets() {
  const lvl = level();
  const best = state.best[lvl.id];
  dom.targets.replaceChildren();
  const add = (cls, starCount, label) => {
    const chip = el('span', `target ${cls}`);
    if (starCount) chip.dataset.tier = String(starCount);
    if (starCount) chip.appendChild(el('span', 'stars', '★'.repeat(starCount)));
    chip.appendChild(document.createTextNode(label));
    dom.targets.appendChild(chip);
    return chip;
  };
  const stars = state.stars[lvl.id] || 0;
  add(stars >= 3 ? 'hit' : '', 3, `≤ ${lvl.stars.three} satır`);
  add(stars >= 2 ? 'hit' : '', 2, `≤ ${lvl.stars.two} satır`);
  if (best) add('best', 0, `En iyin: ${best} satır`);
  if (lvl.record && stars >= 3) add('record', 0, `Usta: ${lvl.record} satır mümkün`);
  updateLineMeter();
}

function renderScenarioTabs() {
  const count = game.scenarioCount();
  dom.scenarioTabs.hidden = count < 2;
  dom.scenarioTabs.replaceChildren();
  if (count < 2) return;
  const label = level().scenarioName || 'Parkur';
  for (let i = 0; i < count; i++) {
    const button = el('button', '', `${label} ${i + 1}`);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(i === game.scenarioIndex));
    button.addEventListener('click', () => {
      if (state.running) return;
      stopStepping();
      game.showScenario(i);
      clearRunDecor();
      hideBubble();
      markScenarioTabs();
      updateCounters();
      updateFacing();
    });
    dom.scenarioTabs.appendChild(button);
  }
}

function markScenarioTabs(results = null) {
  [...dom.scenarioTabs.children].forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === game.scenarioIndex));
    if (results) {
      if (results[i]) button.dataset.state = results[i];
      else delete button.dataset.state;
    }
  });
}

// ── Komut paleti ───────────────────────────────────────────────────────────

const LESSON_ORDER = [
  { id: 1, items: ['ilerle()'] },
  { id: 2, items: ['ilerle(n)'] },
  { id: 3, items: ['sagaDon()'] },
  { id: 4, items: ['solaDon()'] }
];

function paletteItems(lvl) {
  const items = [];
  const introduced = new Set();
  for (const step of LESSON_ORDER) if (lvl.id >= step.id) step.items.forEach(item => introduced.add(item));
  if (introduced.has('ilerle(n)')) items.push({ label: 'ilerle(n)', insert: 'ilerle(2)', select: '2', kind: 'cmd', fresh: lvl.id === 2 });
  else items.push({ label: 'ilerle()', insert: 'ilerle()', kind: 'cmd', fresh: lvl.id === 1 });
  if (introduced.has('sagaDon()')) items.push({ label: '↻ sagaDon()', insert: 'sagaDon()', kind: 'cmd', fresh: lvl.id === 3, title: 'Olduğu yerde saat yönünde, sağa döner' });
  if (introduced.has('solaDon()')) items.push({ label: '↺ solaDon()', insert: 'solaDon()', kind: 'cmd', fresh: lvl.id === 4, title: 'Olduğu yerde saat yönünün tersine, sola döner' });
  const has = feature => lvl.features.includes(feature);
  const fresh = feature => lvl.teaches === feature;
  if (has('loop')) items.push({ label: 'tekrarla(n):', block: 'tekrarla(3)', select: '3', kind: 'key', fresh: fresh('loop') });
  if (has('function')) {
    items.push({ label: 'tanimla ad():', block: 'tanimla adim()', select: 'adim', kind: 'key', fresh: fresh('function') });
  }
  if (has('if')) {
    items.push({ label: 'ise(soru):', block: 'ise(onumBos())', select: 'onumBos', kind: 'key', fresh: fresh('if') });
    items.push({ label: 'degilse:', block: 'degilse', kind: 'key', fresh: fresh('if') });
  }
  if (has('while')) items.push({ label: 'iken(soru):', block: 'iken(hedefteDegilim())', select: 'hedefteDegilim', kind: 'key', fresh: fresh('while') });
  if (has('variable')) {
    items.push({ label: 'n = 1', insert: 'n = 1', select: '1', kind: 'var', fresh: fresh('variable') });
    items.push({ label: 'n = n + 1', insert: 'n = n + 1', kind: 'var', fresh: fresh('variable') });
  }
  if (has('if') || has('while')) {
    for (const sensor of Object.keys(SENSORS)) {
      if (sensor === 'hedefteDegilim' && !has('while')) continue;
      items.push({ label: `${sensor}()`, inline: `${sensor}()`, kind: 'sensor', title: SENSORS[sensor] });
    }
  }
  return items;
}

function renderPalette() {
  const lvl = level();
  dom.palette.replaceChildren(el('span', 'palette-label', 'KOMUTLAR'));
  for (const item of paletteItems(lvl)) {
    const button = el('button', `cmd ${item.kind}${item.fresh ? ' fresh' : ''}`, item.label);
    button.type = 'button';
    if (item.title) button.title = item.title;
    button.addEventListener('click', () => insertItem(item));
    dom.palette.appendChild(button);
  }
  // Tanımlanmış fonksiyonlar için çağrı düğmeleri
  if (lvl.features.includes('function')) {
    const names = [...dom.code.value.matchAll(/^\s*tanimla\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm)].map(m => m[1]);
    for (const name of new Set(names)) {
      const button = el('button', 'cmd fn', `${name}()`);
      button.type = 'button';
      button.style.color = 'var(--tok-fn)';
      button.addEventListener('click', () => insertItem({ insert: `${name}()` }));
      dom.palette.appendChild(button);
    }
  }
  setPaletteDisabled(state.running);
}

function setPaletteDisabled(disabled) {
  for (const button of dom.palette.querySelectorAll('button')) button.disabled = disabled;
}

// ── Editör ─────────────────────────────────────────────────────────────────

const INDENT = '    ';
const TOKEN_RE = /(#.*$|\/\/.*$)|\b(tekrarla|ise|degilse|iken|tanimla)\b|\b(ilerle|sagaDon|solaDon)\b|\b(onumBos|solumBos|sagimBos|hedefteDegilim)\b|\b(\d+)\b|\b([A-Za-z_][A-Za-z0-9_]*)\b(?=\s*\()|\b([A-Za-z_][A-Za-z0-9_]*)\b/g;

function highlightLine(text, parent) {
  const folded = foldTurkish(text);
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = TOKEN_RE.exec(folded)) !== null) {
    if (match.index > last) parent.appendChild(document.createTextNode(text.slice(last, match.index)));
    const piece = text.slice(match.index, match.index + match[0].length);
    const cls = match[1] ? 'tok-comment' : match[2] ? 'tok-key' : match[3] ? 'tok-cmd' : match[4] ? 'tok-sensor' : match[5] ? 'tok-num' : match[6] ? 'tok-fn' : 'tok-var';
    parent.appendChild(el('span', cls, piece));
    last = match.index + match[0].length;
    if (match[0].length === 0) TOKEN_RE.lastIndex++;
  }
  if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
}

function refreshEditor() {
  const lines = dom.code.value.split('\n');
  const fragment = document.createDocumentFragment();
  const gutter = document.createDocumentFragment();
  lines.forEach((text, i) => {
    const number = i + 1;
    const row = el('span', 'ln');
    if (number === state.activeLine) row.classList.add('active');
    if (number === state.lastError) row.classList.add('error');
    highlightLine(text, row);
    if (!text) row.appendChild(document.createTextNode(' '));
    const badge = state.badges.get(number);
    if (badge) row.appendChild(el('span', `badge ${badge.tone}`, badge.text));
    fragment.appendChild(row);
    const g = el('div', '', String(number));
    if (number === state.activeLine) g.classList.add('active');
    if (number === state.lastError) g.classList.add('error');
    gutter.appendChild(g);
  });
  dom.layer.replaceChildren(fragment);
  dom.gutter.replaceChildren(gutter);
  syncScroll();
  updateLineMeter();
}

function syncScroll() {
  dom.layer.scrollTop = dom.code.scrollTop;
  dom.layer.scrollLeft = dom.code.scrollLeft;
  dom.gutter.scrollTop = dom.code.scrollTop;
}

function countLinesLoosely(source) {
  try {
    return parseProgram(source, { features: level().features }).lineCount;
  } catch (_) {
    return source.split('\n').filter(line => {
      const text = line.replace(/(#|\/\/).*$/, '').trim();
      return text && !/^}+$/.test(text);
    }).length;
  }
}

// Satır sayacı, kod çalışırsa hangi yıldız hedefine girdiğini gösterir.
function updateLineMeter() {
  const lvl = level();
  const lines = countLinesLoosely(dom.code.value);
  const tier = lines === 0 ? 0 : lines <= lvl.stars.three ? 3 : lines <= lvl.stars.two ? 2 : 1;
  dom.lineMeter.textContent = `${lines} satır`;
  dom.lineMeter.dataset.level = String(tier);
  const chips = dom.targets.querySelectorAll('.target[data-tier]');
  chips.forEach(chip => chip.classList.toggle('now', Number(chip.dataset.tier) === tier));
}

let draftTimer = null;
function saveDraft() {
  clearTimeout(draftTimer);
  draftTimer = null;
  if (!LEVELS[state.index]) return;
  store.set(codeKey(), dom.code.value);
}

function scheduleDraft() {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraft, 400);
}

function onCodeInput() {
  if (state.stepping || game.mode === 'done') {
    stopStepping();
    game.reset();
    clearRunDecor();
    hideBubble();
    updateCounters();
    updateFacing();
  }
  state.lastError = null;
  refreshEditor();
  scheduleDraft();
  if (level().features.includes('function')) renderPalette();
  updateControls();
}

function currentLineInfo() {
  const value = dom.code.value;
  const start = value.lastIndexOf('\n', dom.code.selectionStart - 1) + 1;
  let end = value.indexOf('\n', dom.code.selectionStart);
  if (end === -1) end = value.length;
  const text = value.slice(start, end);
  return { start, end, text, indent: text.match(/^\s*/)[0] };
}

function replaceRange(start, end, text, selectFrom = null, selectTo = null) {
  dom.code.focus();
  dom.code.setSelectionRange(start, end);
  // execCommand korur geri alma (Ctrl+Z) geçmişini; desteklenmezse doğrudan yaz.
  const ok = document.execCommand && document.execCommand('insertText', false, text);
  if (!ok) {
    dom.code.setRangeText(text, start, end, 'end');
    onCodeInput();
  }
  if (selectFrom !== null) dom.code.setSelectionRange(selectFrom, selectTo ?? selectFrom);
}

function blockText(header, indent) {
  const inner = indent + INDENT;
  if (state.syntax === 'bracket') {
    if (header === 'degilse') return { text: `${indent}} degilse {\n${inner}`, bodyAt: null, bracketElse: true };
    return { text: `${indent}${header} {\n${inner}ilerle()\n${indent}}`, bodyAt: null };
  }
  if (header === 'degilse') return { text: `${indent}degilse:\n${inner}`, bodyAt: null };
  return { text: `${indent}${header}:\n${inner}ilerle()`, bodyAt: null };
}

function insertItem(item) {
  if (state.running) return;
  if (item.inline) {
    const start = dom.code.selectionStart;
    const end = dom.code.selectionEnd;
    replaceRange(start, end, item.inline, start + item.inline.length);
    return;
  }
  const info = currentLineInfo();
  const trimmed = info.text.trim();
  let indent = info.indent;
  if (/:\s*$/.test(trimmed) || /\{\s*$/.test(trimmed)) indent += INDENT;
  const piece = item.block ? blockText(item.block, indent).text : `${indent}${item.insert}`;
  let insertAt;
  let text;
  if (!trimmed) {
    insertAt = info.start;
    text = piece;
    replaceRange(info.start, info.end, text);
  } else {
    insertAt = info.end + 1;
    text = `\n${piece}`;
    replaceRange(info.end, info.end, text);
  }
  const base = trimmed ? info.end + 1 : info.start;
  if (item.select) {
    const offset = piece.indexOf(item.select);
    if (offset >= 0) dom.code.setSelectionRange(base + offset, base + offset + item.select.length);
  } else {
    const endOfPiece = base + piece.length;
    dom.code.setSelectionRange(endOfPiece, endOfPiece);
  }
  void insertAt;
}

function handleEditorKeys(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    onRun();
    return;
  }
  if (event.key === 'Tab') {
    event.preventDefault();
    const { selectionStart: start, selectionEnd: end, value } = dom.code;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    if (start === end && !event.shiftKey) {
      replaceRange(start, end, INDENT);
      return;
    }
    const blockEnd = value.indexOf('\n', end - (end > start && value[end - 1] === '\n' ? 1 : 0));
    const stop = blockEnd === -1 ? value.length : blockEnd;
    const chunk = value.slice(lineStart, stop);
    const changed = chunk.split('\n').map(line => (event.shiftKey ? line.replace(/^( {1,4}|\t)/, '') : INDENT + line)).join('\n');
    replaceRange(lineStart, stop, changed, lineStart, lineStart + changed.length);
    return;
  }
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const info = currentLineInfo();
    const before = dom.code.value.slice(info.start, dom.code.selectionStart);
    let indent = info.indent;
    if (/[:{]\s*$/.test(before.trim())) indent += INDENT;
    event.preventDefault();
    const pos = dom.code.selectionStart;
    replaceRange(pos, dom.code.selectionEnd, `\n${indent}`);
  }
}

// ── Sahne üstü bilgiler ────────────────────────────────────────────────────

function setStatus(text, tone = 'idle') {
  dom.statusText.textContent = text;
  dom.statusChip.dataset.tone = tone;
}

function updateCounters() {
  const total = game.bananas.length;
  const got = game.bananas.filter(b => b.collected).length;
  dom.bananaCounter.querySelector('strong').textContent = `${got}/${total}`;
  dom.bananaCounter.classList.toggle('done', total > 0 && got === total);
  dom.bananaCounter.hidden = total === 0;
  const keys = game.keys.length;
  dom.keyCounter.hidden = keys === 0;
  if (keys) {
    const k = game.keys.filter(key => key.collected).length;
    dom.keyCounter.querySelector('strong').textContent = `${k}/${keys}`;
    dom.keyCounter.classList.toggle('done', k === keys);
  }
}

function updateFacing() {
  const arrows = { UP: '↑', RIGHT: '→', DOWN: '↓', LEFT: '←' };
  dom.facing.textContent = `Mojo ${arrows[game.player.dir]} ${DIRECTION_NAMES[game.player.dir]}`;
}

let bubbleTimer = null;
function say(text, tone = 'info', { sticky = false } = {}) {
  clearTimeout(bubbleTimer);
  dom.bubbleText.textContent = text;
  dom.bubble.dataset.tone = tone;
  dom.bubble.hidden = false;
  positionBubble();
  if (!sticky) bubbleTimer = setTimeout(hideBubble, 3200);
}

function hideBubble() {
  clearTimeout(bubbleTimer);
  dom.bubble.hidden = true;
}

function positionBubble() {
  if (dom.bubble.hidden || !game.renderer) return;
  const r = game.renderer;
  const dpr = r.dpr || 1;
  const T = r.T / dpr;
  const stageRect = dom.stage.getBoundingClientRect();
  const x = r.px(game.player.animX) / dpr + T / 2;
  const y = r.py(game.player.animY) / dpr;
  const width = dom.bubble.offsetWidth || 260;
  const clampedX = Math.max(width / 2 + 12, Math.min(stageRect.width - width / 2 - 12, x));
  const below = y < 120;
  dom.bubble.dataset.place = below ? 'below' : 'above';
  dom.bubble.style.left = `${clampedX}px`;
  dom.bubble.style.top = `${below ? y + T * 1.1 : y + T * 0.05}px`;
  const tail = 50 + ((x - clampedX) / width) * 100;
  dom.bubble.style.setProperty('--tail', `${Math.max(12, Math.min(88, tail))}%`);
}

// ── Çalıştırma ─────────────────────────────────────────────────────────────

function clearRunDecor() {
  state.activeLine = null;
  state.lastError = null;
  state.badges.clear();
  state.vars = null;
  dom.vars.hidden = true;
  refreshEditor();
}

function updateControls() {
  const running = state.running;
  dom.run.classList.toggle('stop', running);
  dom.run.querySelector('use').setAttribute('href', running ? '#i-stop' : '#i-play');
  dom.run.querySelector('span').textContent = running ? 'Durdur' : state.stepping ? 'Devam et' : 'Çalıştır';
  dom.step.disabled = running;
  dom.step.classList.toggle('active', state.stepping);
  dom.back.disabled = !(state.stepping && game.canStepBack);
  dom.code.readOnly = running;
  setPaletteDisabled(running);
  dom.prev.disabled = running || state.index === 0;
  dom.next.disabled = running || state.index >= LEVELS.length - 1 || !isUnlocked(state.index + 1);
}

function compileOrReport() {
  try {
    game.compile(dom.code.value);
    return true;
  } catch (error) {
    showCodeError(error);
    return false;
  }
}

function showCodeError(error) {
  state.lastError = error.line || null;
  refreshEditor();
  setStatus(error.line ? `Satır ${error.line}: yazım hatası` : 'Yazım hatası', 'error');
  say(error.message, 'error', { sticky: true });
  soundEngine.playFail();
  if (error.line) scrollToLine(error.line);
}

function scrollToLine(line) {
  const lineHeight = parseFloat(getComputedStyle(dom.code).lineHeight) || 24;
  const top = (line - 1) * lineHeight;
  if (top < dom.code.scrollTop || top > dom.code.scrollTop + dom.code.clientHeight - lineHeight * 2) {
    dom.code.scrollTop = Math.max(0, top - dom.code.clientHeight / 3);
    syncScroll();
  }
}

async function onRun() {
  if (state.running) {
    game.reset();
    state.running = false;
    state.stepping = false;
    clearRunDecor();
    setStatus('Durduruldu', 'idle');
    say('Durdum. Kodunu düzenleyip yeniden deneyebilirsin.', 'info');
    updateCounters();
    updateFacing();
    updateControls();
    return;
  }
  hideOverlay(openOverlay, false);
  hideBubble();
  if (state.stepping) {
    state.running = true;
    state.stepping = false;
    setStatus('Çalışıyor…', 'run');
    updateControls();
    const result = await game.continueRun();
    return afterRun(result);
  }
  if (!dom.code.value.trim()) {
    say('Önce bir komut yaz ya da aşağıdaki düğmelere dokun.', 'info');
    dom.code.focus();
    return;
  }
  if (!compileOrReport()) return;
  saveDraft();
  clearRunDecor();
  markScenarioTabs([]);
  state.running = true;
  setStatus('Çalışıyor…', 'run');
  updateControls();
  let result;
  try {
    result = await game.run(dom.code.value);
  } catch (error) {
    state.running = false;
    updateControls();
    showCodeError(error);
    return;
  }
  afterRun(result);
}

function afterRun(result) {
  state.running = false;
  state.stepping = false;
  updateControls();
  if (!result || result.cancelled) return;
  updateCounters();
  updateFacing();
  if (result.ok) {
    state.activeLine = null;
    refreshEditor();
    setStatus('Görev tamam!', 'win');
    setTimeout(() => showVictory(result), 900);
    return;
  }
  state.lastError = result.line || null;
  state.activeLine = null;
  refreshEditor();
  if (result.line) scrollToLine(result.line);
  setStatus(result.line ? `Satır ${result.line}'de takıldı` : 'Hedefe ulaşamadı', 'error');
  const prefix = game.scenarioCount() > 1 ? `${level().scenarioName || 'Parkur'} ${result.scenario + 1}: ` : '';
  setTimeout(() => say(prefix + result.message, 'error', { sticky: true }), 380);
  recordFailure();
}

async function onStep() {
  if (state.running) return;
  hideBubble();
  if (!state.stepping) {
    if (!dom.code.value.trim()) {
      say('Adım adım izlemek için önce bir komut yaz.', 'info');
      return;
    }
    if (!compileOrReport()) return;
    clearRunDecor();
    markScenarioTabs([]);
    game.startStepping(dom.code.value);
    state.stepping = true;
    setStatus('Adım modu: her basışta bir adım', 'run');
    updateControls();
  }
  const result = await game.stepForward();
  if (result) {
    afterRun(result);
    return;
  }
  updateCounters();
  updateFacing();
  updateControls();
}

function onBack() {
  if (!state.stepping) return;
  hideBubble();
  state.badges.clear();
  game.stepBack();
  updateCounters();
  updateFacing();
  updateControls();
}

function stopStepping() {
  if (!state.stepping) return;
  state.stepping = false;
  game.reset();
  clearRunDecor();
  updateControls();
}

function onReset() {
  if (state.running) {
    onRun();
    return;
  }
  state.stepping = false;
  game.reset();
  clearRunDecor();
  hideBubble();
  markScenarioTabs([]);
  updateCounters();
  updateFacing();
  setStatus('Hazır', 'idle');
  updateControls();
}

function recordFailure() {
  const id = level().id;
  const fails = (state.failCounts ||= {});
  fails[id] = (fails[id] || 0) + 1;
  if (fails[id] === 3) {
    setTimeout(() => toast('Takıldın mı? İpucu düğmesi sana yol gösterebilir.'), 1600);
  }
}

// Oyun olaylarını editöre yansıt.
game.onLine = (line, event) => {
  state.activeLine = line;
  if (event?.kind === 'sense') {
    state.badges.set(line, { text: `${event.sensor}() → ${event.value ? 'evet' : 'hayır'}`, tone: event.value ? 'yes' : 'no' });
  } else if (event?.kind === 'move' && event.of > 1) {
    state.badges.set(line, { text: `${event.part}/${event.of} kare`, tone: '' });
  } else if (line) {
    const badge = state.badges.get(line);
    if (badge && badge.tone === '') state.badges.delete(line);
  }
  for (const loop of event?.loops || []) {
    state.badges.set(loop.line, { text: loop.count === null ? `tur ${loop.iteration}` : `tur ${loop.iteration}/${loop.count}`, tone: 'loop' });
  }
  refreshEditor();
  if (line) scrollToLine(line);
};

game.onEvent = event => {
  if (!event) {
    updateCounters();
    updateFacing();
    return;
  }
  if (event.kind === 'move' || event.kind === 'turn') {
    updateCounters();
    updateFacing();
    if (!dom.bubble.hidden) positionBubble();
  }
  if (event.kind === 'assign') {
    state.vars = event.vars;
    dom.vars.hidden = false;
    dom.vars.replaceChildren(...Object.entries(event.vars).map(([name, value]) => el('span', '', `${name} = ${value}`)));
  }
};

game.onMessage = (text, tone) => say(text, tone === 'success' ? 'success' : 'info');

game.onScenario = (index, status) => {
  const tabs = [...dom.scenarioTabs.children];
  if (!tabs.length) return;
  tabs.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  if (tabs[index]) tabs[index].dataset.state = status;
  updateCounters();
  updateFacing();
};

game.onStateChange = () => {
  dom.back.disabled = !(state.stepping && game.canStepBack);
};

// ── Zafer ──────────────────────────────────────────────────────────────────

function starsFor(lines, lvl) {
  if (lines <= lvl.stars.three) return 3;
  if (lines <= lvl.stars.two) return 2;
  return 1;
}

function showVictory(result) {
  const lvl = level();
  const stars = starsFor(result.lines, lvl);
  const previousStars = state.stars[lvl.id] || 0;
  const previousBest = state.best[lvl.id];
  state.stars[lvl.id] = Math.max(previousStars, stars);
  state.best[lvl.id] = previousBest ? Math.min(previousBest, result.lines) : result.lines;
  const nextIndex = state.index + 1;
  if (nextIndex < LEVELS.length) state.unlocked = Math.max(state.unlocked, nextIndex);
  saveProgress();
  updateStarTotal();
  renderTargets();

  const islandDone = nextIndex >= LEVELS.length || LEVELS[nextIndex].island !== lvl.island;
  const island = islandOf(lvl);
  dom.winEyebrow.textContent = islandDone ? `${island.name.toLocaleUpperCase('tr')} TAMAM` : `GÖREV ${lvl.id} TAMAM`;
  [...dom.winStars.children].forEach((star, i) => {
    star.classList.remove('on');
    setTimeout(() => {
      star.classList.add('on');
      if (i < stars) soundEngine.playStar(i);
    }, 250 + i * 260);
    if (i >= stars) setTimeout(() => star.classList.remove('on'), 0);
  });
  setTimeout(() => [...dom.winStars.children].forEach((star, i) => star.classList.toggle('on', i < stars)), 260 + 3 * 260);

  const titles = { 3: ['Kusursuz!', 'Usta işi!', 'Muhteşem!'], 2: ['Çok iyi!', 'Harika!'], 1: ['Başardın!', 'Görev tamam!'] };
  dom.winTitle.textContent = titles[stars][Math.floor(Math.random() * titles[stars].length)];
  dom.winText.textContent = stars === 3
    ? 'Mojo bütün muzları topladı ve sandığı açtı. Kodun hem doğru hem kısa!'
    : stars === 2
      ? `Kodun çalışıyor! ${lvl.stars.three} satıra inersen üçüncü yıldız senin.`
      : `Kodun çalışıyor! Daha kısa bir yol var: ${lvl.stars.two} satır ★★, ${lvl.stars.three} satır ★★★ getirir.`;

  dom.winFacts.replaceChildren();
  const fact = (cls, text) => dom.winFacts.appendChild(el('li', cls, text));
  fact(stars === 3 ? 'good' : '', `Kodun ${result.lines} satır (★★★ hedefi ≤ ${lvl.stars.three}).`);
  if (result.scenarios === 1) fact('', `Mojo ${result.steps} kare yürüdü. Daha kısa kod her zaman daha kısa yol demek değildir!`);
  if (result.scenarios > 1) fact('good', `Aynı kod ${result.scenarios} farklı parkurun hepsinde çalıştı.`);
  if (result.lines < lvl.stars.three) fact('record', `Rekor! Hedeften ${lvl.stars.three - result.lines} satır daha kısa bir çözüm buldun.`);
  else if (stars === 3 && lvl.record && result.lines > lvl.record) fact('record', `Usta meydan okuması: bu görev ${lvl.record} satırda da çözülebilir. Bulabilir misin?`);
  if (previousBest && result.lines < previousBest) fact('good', `Kendi rekorunu kırdın: ${previousBest} → ${result.lines} satır.`);
  if (islandDone) fact('good', `${island.name} tamamlandı! “${island.seal}” mührünü kazandın.`);
  if (state.migratedIsland) delete state.migratedIsland;

  dom.winNext.hidden = nextIndex >= LEVELS.length;
  dom.winRetry.textContent = stars === 3 ? 'Tekrar oyna' : 'Kodu kısalt';
  showOverlay(dom.winOverlay, dom.winNext.hidden ? dom.winRetry : dom.winNext);
}

function updateStarTotal() {
  const total = Object.values(state.stars).reduce((sum, value) => sum + value, 0);
  dom.starTotal.querySelector('strong').textContent = String(total);
  dom.starTotal.querySelector('small').textContent = `/ ${LEVELS.length * 3}`;
}

// ── Ada haritası ───────────────────────────────────────────────────────────

function renderMap() {
  dom.islands.replaceChildren();
  for (const island of ISLANDS) {
    const levels = LEVELS.filter(lvl => lvl.island === island.id);
    const firstIndex = LEVELS.indexOf(levels[0]);
    const done = levels.filter(lvl => state.stars[lvl.id]).length;
    const stars = levels.reduce((sum, lvl) => sum + (state.stars[lvl.id] || 0), 0);
    const card = el('section', `island${isUnlocked(firstIndex) ? '' : ' locked'}`);
    card.style.setProperty('--island', island.color);
    const top = el('div', 'island-top');
    top.appendChild(el('div', 'island-glyph', island.glyph));
    const name = el('div');
    name.appendChild(el('div', 'island-concept', `ADA ${island.id} · ${island.concept.toLocaleUpperCase('tr')}`));
    name.appendChild(el('h3', '', island.name));
    top.appendChild(name);
    card.appendChild(top);
    card.appendChild(el('p', '', island.summary));
    const progress = el('div', 'island-progress');
    progress.appendChild(el('span', '', `${done}/${levels.length} görev`));
    progress.appendChild(el('span', '', `★ ${stars}/${levels.length * 3}`));
    card.appendChild(progress);
    const grid = el('div', 'island-levels');
    for (const lvl of levels) {
      const index = LEVELS.indexOf(lvl);
      const button = el('button', `level-dot${index === state.index ? ' current' : ''}`);
      button.type = 'button';
      button.title = `${lvl.id}. ${lvl.title}`;
      if (isUnlocked(index)) {
        button.appendChild(el('span', '', String(lvl.id)));
        const s = state.stars[lvl.id] || 0;
        button.appendChild(el('small', '', s ? '★'.repeat(s) : ''));
        button.addEventListener('click', () => {
          hideOverlay(dom.mapOverlay, false);
          loadLevel(index);
        });
      } else {
        button.disabled = true;
        button.innerHTML = '<svg aria-hidden="true"><use href="#i-lock"></use></svg>';
        button.setAttribute('aria-label', `${lvl.id}. görev kilitli`);
      }
      grid.appendChild(button);
    }
    card.appendChild(grid);
    dom.islands.appendChild(card);
  }
}

// ── İpuçları ───────────────────────────────────────────────────────────────

function openHints() {
  renderHints();
  showOverlay(dom.hintOverlay, dom.moreHint.hidden ? null : dom.moreHint);
}

function renderHints() {
  const lvl = level();
  const shown = Math.min(lvl.hints.length, state.hints[lvl.id] || 0);
  dom.hintList.replaceChildren();
  lvl.hints.slice(0, shown).forEach(text => {
    const li = el('li');
    setRich(li, text);
    dom.hintList.appendChild(li);
  });
  dom.moreHint.hidden = shown >= lvl.hints.length;
  dom.moreHint.textContent = shown === 0 ? 'İlk ipucunu göster' : 'Bir ipucu daha';
  dom.solutionBox.hidden = shown < Math.min(2, lvl.hints.length);
  dom.solutionBox.open = false;
  try {
    const program = parseProgram(lvl.solution);
    dom.solutionCode.textContent = formatProgram(program, state.syntax);
  } catch (_) {
    dom.solutionCode.textContent = lvl.solution;
  }
}

// ── Dersler ve rehber ──────────────────────────────────────────────────────

const LESSONS = {
  basics: {
    eyebrow: 'İLK DERS',
    title: 'Kod, sırayla çalışan komutlardır',
    body: [
      '<p>Mojo yazdığın komutları <b>yukarıdan aşağıya, birer birer</b> yapar.</p>',
      'pre:ilerle()\nilerle()\nilerle()',
      '<p>Komutları klavyeyle yazabilir ya da alttaki <b>KOMUTLAR</b> düğmelerine dokunabilirsin. Sonra <b>Çalıştır</b>!</p>'
    ]
  },
  param: {
    eyebrow: 'YENİ: PARAMETRE',
    title: 'Komuta bir sayı ver',
    body: [
      '<p>Aynı komutu tekrar tekrar yazmak yerine Mojo\'ya <b>kaç kare</b> gideceğini söyleyebilirsin. Parantezin içindeki sayıya <b>parametre</b> denir.</p>',
      'pre:ilerle(5)    # 5 kare ilerler\nilerle()     # sayı yoksa 1 kare',
      '<p>Kaç kare olduğunu bulmak için <b>Cetvel</b>\'i açıp bir kareye dokun.</p>'
    ]
  },
  loop: {
    eyebrow: 'YENİ: DÖNGÜ',
    title: 'tekrarla(n): aynı işi n kez yap',
    body: [
      '<p>Bir hareket kalıbı tekrar ediyorsa onu bir kez yaz, <code>tekrarla</code> ile kaç kez yapılacağını söyle. Döngünün içindeki komutlar <b>4 boşluk içeride</b> yazılır.</p>',
      'pre:tekrarla(4):\n    ilerle(3)\n    sagaDon()',
      '<p>Bu üç satır, 8 satırlık işi yapar: Mojo bir kare çizer. Önce kalıbı bul: <i>hangi komutlar aynı sırayla tekrarlanıyor?</i></p>'
    ]
  },
  function: {
    eyebrow: 'YENİ: FONKSİYON',
    title: 'Kendi komutunu tanımla',
    body: [
      '<p>Bir hareket parçası haritanın farklı yerlerinde tekrar ediyorsa ona bir ad ver. <code>tanimla</code> bir kez öğretir; adıyla istediğin yerde çağırırsın.</p>',
      'pre:tanimla tepe():\n    solaDon()\n    ilerle()\n    sagaDon()\n\ntepe()\nilerle(3)\ntepe()',
      '<p>Döngü <b>art arda</b> tekrarları kısaltır; fonksiyon <b>aralıklı</b> tekrarları. İkisini birlikte de kullanabilirsin.</p>'
    ]
  },
  if: {
    eyebrow: 'YENİ: KOŞUL',
    title: 'ise / degilse: bak, sonra karar ver',
    body: [
      '<p>Bu adada gelgit haritayı değiştirir: kodun <b>birden çok parkurda</b> çalışmalı. Mojo bir soru sorar; cevap <i>evet</i> ise ilk blok, <i>hayır</i> ise <code>degilse</code> bloğu çalışır.</p>',
      'pre:ise(onumBos()):\n    ilerle()\ndegilse:\n    sagaDon()',
      '<p>Sorular: <code>onumBos()</code>, <code>solumBos()</code>, <code>sagimBos()</code> — o kare yürünebilir mi? Mojo sorduğu kareyi haritada yeşil (evet) ya da kırmızı (hayır) yakar.</p>'
    ]
  },
  while: {
    eyebrow: 'YENİ: KOŞULLU DÖNGÜ',
    title: 'iken(soru): cevap evet oldukça tekrarla',
    body: [
      '<p><code>tekrarla</code> kaç kez döneceğini bilir. <code>iken</code> ise her turdan önce soruyu yeniden sorar ve cevap <i>hayır</i> olunca durur. Bir duvara ne kadar uzak olduğunu bilmediğinde tam aradığın şey.</p>',
      'pre:iken(onumBos()):\n    ilerle()\nsagaDon()',
      '<p>Mojo önü boş olduğu sürece yürür, duvara gelince döngü biter ve sağa döner. <code>iken(hedefteDegilim()):</code> ise "sandığa varana kadar" demektir. Dikkat: döngünün içinde Mojo bir şey değiştirmezse cevap hiç değişmez ve döngü bitmez.</p>'
    ]
  },
  variable: {
    eyebrow: 'YENİ: DEĞİŞKEN',
    title: 'Bir sayıyı hatırla, sonra değiştir',
    body: [
      '<p><b>Değişken</b>, adı olan bir kutudur. İçine bir sayı koyarsın, sonra o sayıyı kullanır ya da değiştirirsin.</p>',
      'pre:n = 1\ntekrarla(4):\n    ilerle(n)\n    sagaDon()\n    n = n + 1',
      '<p>Her turda <code>n</code> bir büyür: Mojo 1, 2, 3, 4 kare giderek dışa doğru bir sarmal çizer. Değişkenlerin değerini kodun altında görürsün.</p>'
    ]
  }
};

function lessonKeyFor(lvl) {
  if (lvl.id === 1) return 'basics';
  if (lvl.id === 2) return 'param';
  return lvl.teaches || null;
}

function showLesson(key) {
  const lesson = LESSONS[key];
  if (!lesson) return;
  dom.learnEyebrow.textContent = lesson.eyebrow;
  dom.learnTitle.textContent = lesson.title;
  dom.learnBody.replaceChildren();
  for (const part of lesson.body) {
    if (part.startsWith('pre:')) {
      const pre = el('pre');
      const source = part.slice(4);
      const text = state.syntax === 'bracket' ? convertSyntax(source, 'bracket') : source;
      text.split('\n').forEach((line, i, all) => {
        highlightLine(line, pre);
        if (i < all.length - 1) pre.appendChild(document.createTextNode('\n'));
      });
      dom.learnBody.appendChild(pre);
    } else {
      const div = el('div');
      setRich(div, part);
      dom.learnBody.appendChild(div);
    }
  }
  showOverlay(dom.learnOverlay);
}

function maybeShowLesson(lvl) {
  const key = lessonKeyFor(lvl);
  if (!key || state.learned.has(key)) return;
  if (!store.get(KEY.welcome)) return; // hoş geldin penceresi önce
  state.learned.add(key);
  store.set(KEY.learned, JSON.stringify([...state.learned]));
  setTimeout(() => showLesson(key), 250);
}

function showGuide() {
  const lvl = level();
  dom.learnEyebrow.textContent = 'KOMUT REHBERİ';
  dom.learnTitle.textContent = 'Mojo neleri anlar?';
  dom.learnBody.replaceChildren();
  const row = (code, text, locked) => {
    const div = el('div', 'guide-row');
    div.appendChild(el('code', '', code));
    const p = el('span', '', locked ? `${text} (henüz kilitli)` : text);
    if (locked) p.className = 'muted';
    div.appendChild(p);
    dom.learnBody.appendChild(div);
  };
  const has = feature => lvl.features.includes(feature);
  dom.learnBody.appendChild(el('h3', '', 'HAREKET'));
  row('ilerle()', 'Baktığı yönde 1 kare ilerler.');
  row('ilerle(3)', 'Baktığı yönde 3 kare ilerler. Sayıyı sen seçersin.');
  row('sagaDon()', 'Olduğu yerde sağa döner.');
  row('solaDon()', 'Olduğu yerde sola döner.');
  dom.learnBody.appendChild(el('h3', '', 'YAPILAR'));
  row('tekrarla(4):', 'İçindeki komutları 4 kez yapar.', !has('loop'));
  row('tanimla ad():', 'Yeni bir komut tanımlar; ad() ile çağrılır.', !has('function'));
  row('ise(soru):', 'Cevap evetse içindekileri yapar.', !has('if'));
  row('degilse:', 'ise cevabı hayırsa bunu yapar.', !has('if'));
  row('iken(soru):', 'Cevap evet oldukça tekrarlar.', !has('while'));
  row('n = n + 1', 'Değişken: bir sayıyı saklar ve değiştirir.', !has('variable'));
  dom.learnBody.appendChild(el('h3', '', 'SORULAR'));
  for (const [name, text] of Object.entries(SENSORS)) row(`${name}()`, text, !(has('if') || has('while')));
  dom.learnBody.appendChild(el('h3', '', 'KURALLAR'));
  const rules = el('div');
  setRich(rules, '<p>Mojo çimende, kumda ve köprüde yürür; ağaca, kayaya, suya ya da adanın kenarına giremez. Üstünden geçtiği muzları toplar. Bütün muzlarla <b>sandığa</b> vardığında görev biter. Anahtarı alınca kapılar açılır.</p>');
  dom.learnBody.appendChild(rules);
  showOverlay(dom.learnOverlay);
}

// ── Cetvel ─────────────────────────────────────────────────────────────────

function setRuler(on) {
  game.rulerActive = on;
  dom.ruler.setAttribute('aria-pressed', String(on));
  dom.stage.classList.toggle('ruler-on', on);
  if (!on) game.hoveredCell = null;
  game.draw();
}

dom.canvas.addEventListener('pointermove', event => {
  if (!game.rulerActive || event.pointerType === 'touch') return;
  game.hoveredCell = game.renderer.cellFromClient(event.clientX, event.clientY);
});
dom.canvas.addEventListener('pointerdown', event => {
  if (!game.rulerActive) return;
  game.hoveredCell = game.renderer.cellFromClient(event.clientX, event.clientY);
});
dom.canvas.addEventListener('pointerleave', () => {
  if (game.rulerActive) game.hoveredCell = null;
});

// ── Olay bağlama ───────────────────────────────────────────────────────────

dom.code.addEventListener('input', onCodeInput);
dom.code.addEventListener('scroll', syncScroll);
dom.code.addEventListener('keydown', handleEditorKeys);
dom.run.addEventListener('click', onRun);
dom.step.addEventListener('click', onStep);
dom.back.addEventListener('click', onBack);
dom.reset.addEventListener('click', onReset);
dom.prev.addEventListener('click', () => loadLevel(state.index - 1));
dom.next.addEventListener('click', () => loadLevel(state.index + 1));
dom.map.addEventListener('click', () => {
  renderMap();
  showOverlay(dom.mapOverlay, dom.mapOverlay.querySelector('.level-dot.current') || null);
});
dom.hint.addEventListener('click', openHints);
dom.moreHint.addEventListener('click', () => {
  const lvl = level();
  state.hints[lvl.id] = Math.min(lvl.hints.length, (state.hints[lvl.id] || 0) + 1);
  store.set(KEY.hints, JSON.stringify(state.hints));
  renderHints();
  (dom.moreHint.hidden ? dom.solutionBox.querySelector('summary') : dom.moreHint).focus();
});
dom.useSolution.addEventListener('click', () => {
  if (state.running) return;
  stopStepping();
  dom.code.value = dom.solutionCode.textContent;
  onCodeInput();
  saveDraft();
  hideOverlay(dom.hintOverlay);
  say('Örnek çözüm editörde. Çalıştırmadan önce nasıl çalıştığını incele!', 'info');
});
dom.winRetry.addEventListener('click', () => {
  hideOverlay(dom.winOverlay);
  onReset();
  dom.code.focus();
});
dom.winNext.addEventListener('click', () => {
  hideOverlay(dom.winOverlay, false);
  loadLevel(state.index + 1);
});
dom.ruler.addEventListener('click', () => setRuler(!game.rulerActive));
dom.speed.addEventListener('input', () => {
  const value = Number(dom.speed.value);
  game.speed = SPEEDS[value - 1];
  store.set(KEY.speed, String(value));
});
dom.sound.addEventListener('click', () => {
  const enabled = !soundEngine.isSoundEnabled();
  applySound(enabled);
  store.set(KEY.sound, String(enabled));
});
dom.theme.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  store.set(KEY.theme, next);
});
dom.syntax.addEventListener('change', () => {
  const previous = state.syntax;
  const next = dom.syntax.value;
  if (previous === next) return;
  if (state.running) onRun();
  stopStepping();
  saveDraft();
  state.syntax = next;
  store.set(KEY.syntax, next);
  const saved = store.get(codeKey(), null);
  dom.code.value = saved !== null && saved.trim() ? saved : convertSyntax(dom.code.value, next);
  onCodeInput();
  saveDraft();
  toast(next === 'indent' ? 'Python biçimi: bloklar ":" ve girintiyle yazılır.' : 'JavaScript biçimi: bloklar { } ile yazılır.');
});
dom.guide.addEventListener('click', () => {
  dom.settings.open = false;
  showGuide();
});
dom.clearCode.addEventListener('click', () => {
  dom.settings.open = false;
  if (state.running) return;
  stopStepping();
  dom.code.value = starterCode(level());
  onCodeInput();
  saveDraft();
  toast('Editör temizlendi.');
});
dom.dev.addEventListener('click', () => {
  applyDev(!state.dev);
  store.set(KEY.dev, String(state.dev));
  loadLevel(state.index, { fromUser: false });
  toast(state.dev ? 'Öğretmen modu: bütün görevler açık.' : 'Öğretmen modu kapandı.');
});
dom.welcomeStart.addEventListener('click', () => {
  store.set(KEY.welcome, 'true');
  hideOverlay(dom.welcomeOverlay, false);
  maybeShowLesson(level());
  dom.code.focus();
});

window.addEventListener('resize', () => {
  if (!dom.bubble.hidden) positionBubble();
});
window.addEventListener('beforeunload', saveDraft);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) saveDraft();
});

const unlockAudio = () => soundEngine.unlock();
document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('keydown', unlockAudio, { once: true });

// ── Başlangıç ──────────────────────────────────────────────────────────────

function init() {
  applyTheme(store.get(KEY.theme, 'dark') === 'light' ? 'light' : 'dark');
  applySound(store.get(KEY.sound, 'true') !== 'false');
  applyDev(store.get(KEY.dev, 'false') === 'true');
  state.syntax = store.get(KEY.syntax, 'indent') === 'bracket' ? 'bracket' : 'indent';
  dom.syntax.value = state.syntax;
  const speed = Math.max(1, Math.min(5, Number(store.get(KEY.speed, '3')) || 3));
  dom.speed.value = String(speed);
  game.speed = SPEEDS[speed - 1];
  loadProgress();
  updateStarTotal();

  const saved = Number.parseInt(store.get(KEY.level, ''), 10);
  let index = Number.isInteger(saved) ? saved : state.unlocked;
  if (!isUnlocked(index)) index = state.unlocked;
  game.startRenderLoop();
  loadLevel(index, { fromUser: false });

  if (!store.get(KEY.welcome)) {
    setTimeout(() => showOverlay(dom.welcomeOverlay, dom.welcomeStart), 200);
  } else {
    maybeShowLesson(level());
    if (state.migratedIsland) toast(`Önceki ilerlemene göre ${state.migratedIsland}. ada açıldı.`);
  }
}

init();

// Testler ve hata ayıklama için
window.kodmaymunu = { game, state, LEVELS, loadLevel };
