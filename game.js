// Oyun denetleyicisi: dünyayı, yorumlayıcıyı, çizimi ve sesi birbirine bağlar.
//
// Kurallar world.js'te, dil lang.js'te, yürütme interpreter.js'tedir. Bu sınıf
// yalnızca olayları sırayla canlandırır ve arayüze haber verir. Çizici
// (renderer.js) buradaki görünüm alanlarını okur: player, bananas, keys,
// gridData, starTile, trail, playArea...

import { soundEngine } from './audio.js?v=20261007-v5';
import { parseProgram } from './lang.js?v=20261007-v5';
import { execute } from './interpreter.js?v=20261007-v5';
import { World } from './world.js?v=20261007-v5';
import { WorldRenderer } from './renderer.js?v=20261007-v5';

const ROTATION = { RIGHT: 0, DOWN: Math.PI / 2, LEFT: Math.PI, UP: -Math.PI / 2 };

// Hız kaydırıcısının 1-5 değerleri için bir kare ilerlemenin süresi (ms).
export const SPEEDS = [760, 520, 340, 210, 110];

const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutBackSoft = t => {
  const c1 = 1.2;
  const c3 = c1 + 1;
  const x = t - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
};

const pick = list => list[Math.floor(Math.random() * list.length)];

// Mojo kendi ağzından konuşur; her mesaj sorunun çıktığı satırı söyler.
export function describeFailure(event) {
  const at = event.line ? `Satır ${event.line}: ` : '';
  switch (event.reason) {
    case 'rock':
      return at + pick(['Ah! Önümde bir engel vardı, çarptım.', 'Bonk! Oradan geçemem; önümde bir engel var.', 'Dur dur! Önümdeki engele tosladım.']);
    case 'water':
      return at + pick(['Şıp! Suya düştüm. Maymunlar yüzemez!', 'Glu glu… Önümde su vardı; köprüden geçmeliydim.', 'Islandım! Su karelerine basamam.']);
    case 'edge':
      return at + pick(['Aaa! Adanın kenarından denize düştüm.', 'Şıp! Adanın dışı deniz; orada yürünmez.']);
    case 'gate':
      return at + 'Kapı kilitli. Önce anahtarı almalıyım.';
    default:
      return at + (event.message || 'Bir şeyler ters gitti.');
  }
}

export function describeEnding(world) {
  const left = world.bananasLeft;
  if (left > 0 && !world.onChest) return `Program bitti ama hâlâ ${left} muz var ve sandığa da ulaşmadım.`;
  if (left > 0) return `Sandığa geldim ama ${left} muz daha kaldı. Sandık ancak bütün muzlar toplanınca açılır.`;
  return 'Program bitti ama sandığa ulaşamadım. Rotam biraz daha devam etmeli.';
}

export class Game {
  constructor(canvas) {
    this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.level = null;
    this.scenarioIndex = 0;
    this.world = null;
    this.worldId = 1;
    this.speed = SPEEDS[2];

    // Çizicinin okuduğu görünüm alanları
    this.player = { x: 0, y: 0, dir: 'RIGHT', animX: 0, animY: 0, animRotation: 0, targetRotation: 0 };
    this.bananas = [];
    this.keys = [];
    this.gridData = [];
    this.baseGridData = [];
    this.starTile = { x: 0, y: 0 };
    this.trail = [];
    this.playArea = null;
    this.gridWidth = 0;
    this.gridHeight = 0;
    this.tileSize = 64;
    this.isRunning = false;
    this.currentAction = null;
    this.animationProgress = 1;
    this.rulerActive = false;
    this.hoveredCell = null;

    // Yürütme durumu
    this.token = 0;
    this.mode = 'idle'; // idle | run | step | done
    this.session = null;
    this.busy = false;

    // Arayüz geri çağrıları
    this.onLine = null; // (line, event)
    this.onEvent = null; // (event)
    this.onMessage = null; // (text, tone)
    this.onScenario = null; // (index, state)
    this.onFinish = null; // (result)
    this.onStateChange = null; // ()

    this.renderer = this.canvas ? new WorldRenderer(this) : null;
    this.renderLoopActive = false;
    this.renderFrame = null;
  }

  // ── Çizim döngüsü ─────────────────────────────────────────────────────────

  startRenderLoop() {
    if (this.renderLoopActive || typeof requestAnimationFrame !== 'function' || !this.renderer) return;
    this.renderLoopActive = true;
    const frame = now => {
      if (!this.renderLoopActive) return;
      if (!(typeof document !== 'undefined' && document.hidden)) this.renderer.render(now);
      this.renderFrame = requestAnimationFrame(frame);
    };
    this.renderFrame = requestAnimationFrame(frame);
  }

  stopRenderLoop() {
    this.renderLoopActive = false;
    if (this.renderFrame !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(this.renderFrame);
    this.renderFrame = null;
  }

  draw() {
    if (this.renderer && !this.renderLoopActive) this.renderer.render();
  }

  hasKeyCollected() {
    return this.keys.every(k => k.collected);
  }

  // ── Görev yükleme ─────────────────────────────────────────────────────────

  scenarioCount(level = this.level) {
    return level?.scenarios ? level.scenarios.length : 1;
  }

  scenarioData(index = this.scenarioIndex, level = this.level) {
    if (level.scenarios) return level.scenarios[index];
    return { map: level.map, dir: level.dir };
  }

  createWorld(index = this.scenarioIndex) {
    const data = this.scenarioData(index);
    return World.parse(data.map, data.dir || this.level.dir);
  }

  load(level, scenarioIndex = 0) {
    this.cancel();
    this.level = level;
    this.worldId = level.island;
    soundEngine.setWorld(this.worldId);
    this.showScenario(scenarioIndex);
  }

  showScenario(index) {
    this.scenarioIndex = Math.max(0, Math.min(this.scenarioCount() - 1, index));
    this.world = this.createWorld(this.scenarioIndex);
    this.syncView({ snap: true, rebuild: true });
    this.renderer?.reset();
    this.draw();
  }

  // Dünyanın durumunu çizicinin okuduğu alanlara aktarır.
  syncView({ snap = false, rebuild = false } = {}) {
    const w = this.world;
    if (rebuild) {
      this.gridWidth = w.width;
      this.gridHeight = w.height;
      this.playArea = { x: 0, y: 0, width: w.width, height: w.height };
      this.baseGridData = [];
      for (let y = 0; y < w.height; y++) {
        const row = [];
        for (let x = 0; x < w.width; x++) row.push(w.terrain(x, y));
        this.baseGridData.push(row);
      }
      this.gridData = this.baseGridData;
      this.starTile = { ...w.chest };
      this.baseStart = { ...w.base.start };
    }
    this.bananas = w.bananas;
    this.keys = w.keys;
    this.trail = w.trail;
    this.player.x = w.x;
    this.player.y = w.y;
    this.player.dir = w.dir;
    this.player.targetRotation = ROTATION[w.dir];
    if (snap) {
      this.player.animX = w.x;
      this.player.animY = w.y;
      this.player.animRotation = ROTATION[w.dir];
      this.animationProgress = 1;
      this.currentAction = null;
    }
  }

  // ── Yürütme ───────────────────────────────────────────────────────────────

  compile(source) {
    return parseProgram(source, { features: this.level.features });
  }

  cancel() {
    this.token++;
    this.isRunning = false;
    this.currentAction = null;
    this.animationProgress = 1;
    this.session = null;
    this.mode = 'idle';
    this.busy = false;
  }

  // Haritayı başa alır (program durur).
  reset(index = this.scenarioIndex) {
    this.cancel();
    this.showScenario(index);
    this.onStateChange?.();
  }

  newSession(program) {
    return {
      program,
      scenario: 0,
      generator: null,
      events: [], // bu parkurda oynatılan olaylar (geri adım için)
      results: new Array(this.scenarioCount()).fill(null),
      lines: program.lineCount
    };
  }

  beginScenario(session, index) {
    session.scenario = index;
    session.events = [];
    this.scenarioIndex = index;
    this.world = this.createWorld(index);
    session.generator = execute(session.program, this.world);
    this.syncView({ snap: true, rebuild: true });
    this.renderer?.reset();
    this.onScenario?.(index, 'running');
  }

  // Kodu baştan sona canlandırarak çalıştırır.
  async run(source) {
    const program = this.compile(source);
    this.cancel();
    const token = this.token;
    const session = this.newSession(program);
    this.session = session;
    this.mode = 'run';
    this.isRunning = true;
    soundEngine.playStart();
    this.onStateChange?.();
    return this.playSession(session, token);
  }

  async playSession(session, token) {
    for (let index = session.scenario; index < this.scenarioCount(); index++) {
      if (index !== session.scenario || !session.generator) {
        this.beginScenario(session, index);
        if (index > 0) {
          soundEngine.playScenario();
          this.onMessage?.(`Parkur ${index + 1}: aynı kod yeni haritada deneniyor…`, 'info');
          await this.wait(Math.min(700, this.speed * 1.5));
        }
      }
      const outcome = await this.drain(session, token);
      if (token !== this.token) return { cancelled: true };
      if (outcome !== 'win') return this.finish(session, false, outcome);
      session.results[index] = 'pass';
      this.onScenario?.(index, 'pass');
      if (index < this.scenarioCount() - 1) await this.wait(this.speed * 1.6);
      if (token !== this.token) return { cancelled: true };
    }
    return this.finish(session, true);
  }

  // Üreteçteki olayları sırayla canlandırır; sonucu döndürür.
  async drain(session, token) {
    for (;;) {
      if (token !== this.token) return 'cancelled';
      const next = session.generator.next();
      if (next.done) return 'end';
      const event = next.value;
      session.events.push(event);
      const outcome = await this.present(event, token);
      if (outcome) return outcome;
    }
  }

  // Tek bir olayı gösterir. Bitirici olaylarda sonucu döndürür.
  async present(event, token) {
    this.onEvent?.(event);
    if (event.line) this.onLine?.(event.line, event);
    switch (event.kind) {
      case 'move': {
        if (this.mode === 'step') this.renderer?.clearSense();
        this.currentAction = { name: 'ilerle', line: event.line };
        this.syncView();
        if (event.banana) {
          soundEngine.playCoin(this.world.bananas.filter(b => b.collected).length - 1);
          this.renderer?.burst('banana', event.banana.x, event.banana.y);
        } else if (!event.key) {
          soundEngine.playStep(this.surfaceAt(event.to.x, event.to.y));
        }
        if (event.key) {
          soundEngine.playKey();
          this.renderer?.burst('key', event.key.x, event.key.y);
          if (event.gateOpened) {
            soundEngine.playGate(250);
            this.renderer?.gateOpened(250);
            this.onMessage?.('Anahtarı aldım! Kapılar açıldı.', 'success');
          }
        }
        await this.animate(this.speed, token);
        return null;
      }
      case 'turn':
        if (this.mode === 'step') this.renderer?.clearSense();
        this.currentAction = { name: event.side === 'right' ? 'sagaDon' : 'solaDon', line: event.line };
        this.syncView();
        soundEngine.playTurn();
        await this.animate(this.speed * 0.7, token);
        return null;
      case 'sense':
        this.currentAction = { name: 'sense', line: event.line };
        this.renderer?.sense(this.senseCells(event.sensor), event.value, { hold: this.mode === 'step', duration: Math.max(520, this.speed * 1.5) });
        if (this.mode !== 'step') await this.wait(this.speed * 0.55);
        return null;
      case 'assign':
      case 'call':
        this.currentAction = { name: event.kind, line: event.line };
        if (this.mode !== 'step') await this.wait(this.speed * 0.35);
        return null;
      case 'win':
        this.syncView({ snap: true });
        return 'win';
      case 'end':
        return 'end';
      case 'fail':
        return event;
      default:
        return null;
    }
  }

  animate(duration, token) {
    const startX = this.player.animX;
    const startY = this.player.animY;
    const startRot = this.player.animRotation;
    let diff = this.player.targetRotation - startRot;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    const endRot = startRot + diff;
    const endX = this.player.x;
    const endY = this.player.y;
    const move = duration * 0.82;
    return new Promise(resolve => {
      const settle = () => {
        this.player.animX = endX;
        this.player.animY = endY;
        this.player.animRotation = endRot;
        this.animationProgress = 1;
      };
      if (typeof requestAnimationFrame !== 'function' || duration <= 0) {
        settle();
        resolve();
        return;
      }
      const start = performance.now();
      const frame = now => {
        if (token !== this.token) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - start) / move);
        this.animationProgress = t;
        this.player.animX = startX + (endX - startX) * easeInOutSine(t);
        this.player.animY = startY + (endY - startY) * easeInOutSine(t);
        this.player.animRotation = startRot + (endRot - startRot) * easeOutBackSoft(t);
        this.draw();
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          settle();
          setTimeout(resolve, duration - move);
        }
      };
      requestAnimationFrame(frame);
    });
  }

  wait(ms) {
    return new Promise(resolve => (ms > 0 ? setTimeout(resolve, ms) : resolve()));
  }

  // Bir sorunun baktığı kareler (haritada yeşil/kırmızı yanar).
  senseCells(sensor) {
    const w = this.world;
    if (sensor === 'onumBos') return [w.ahead()];
    if (sensor === 'solumBos') return [w.ahead('left')];
    if (sensor === 'sagimBos') return [w.ahead('right')];
    return [{ x: w.x, y: w.y }];
  }

  surfaceAt(x, y) {
    if (this.world.terrain(x, y) === '=') return 'wood';
    if (this.worldId === 3) return 'stone';
    if (this.worldId === 4) return 'sand';
    return 'grass';
  }

  finish(session, ok, outcome = null) {
    this.isRunning = false;
    this.mode = 'done';
    this.currentAction = null;
    const result = {
      ok,
      lines: session.lines,
      steps: this.world.steps,
      scenario: session.scenario,
      scenarios: this.scenarioCount(),
      line: null,
      reason: null,
      message: ''
    };
    if (ok) {
      this.renderer?.startVictory();
      soundEngine.playVictory();
    } else if (outcome && typeof outcome === 'object') {
      result.line = outcome.line;
      result.reason = outcome.reason;
      result.message = describeFailure(outcome);
      if (['rock', 'water', 'edge', 'gate'].includes(outcome.reason)) {
        const type = outcome.reason === 'edge' ? 'water' : outcome.reason;
        this.renderer?.startCrash(type, outcome.from, outcome.to);
        if (type === 'water') soundEngine.playSplash();
        else soundEngine.playBump();
      } else {
        soundEngine.playFail();
      }
      this.onScenario?.(session.scenario, 'fail');
    } else {
      result.reason = 'end';
      result.message = describeEnding(this.world);
      this.renderer?.markStuck();
      soundEngine.playFail();
      this.onScenario?.(session.scenario, 'fail');
    }
    this.onFinish?.(result);
    this.onStateChange?.();
    return result;
  }

  // ── Adım adım yürütme ─────────────────────────────────────────────────────

  startStepping(source) {
    const program = this.compile(source);
    this.cancel();
    const session = this.newSession(program);
    this.session = session;
    this.mode = 'step';
    this.isRunning = true;
    this.beginScenario(session, 0);
    this.onStateChange?.();
  }

  get canStepBack() {
    return this.mode === 'step' && Boolean(this.session) && this.session.events.length > 0 && !this.busy;
  }

  // Bir sonraki olayı oynatır. Program bitince sonucu döndürür.
  async stepForward() {
    const session = this.session;
    if (this.mode !== 'step' || !session || this.busy) return null;
    this.busy = true;
    const token = this.token;
    try {
      const next = session.generator.next();
      if (next.done) return null;
      const event = next.value;
      session.events.push(event);
      const outcome = await this.present(event, token);
      if (token !== this.token || !outcome) return null;
      if (outcome === 'win') {
        session.results[session.scenario] = 'pass';
        this.onScenario?.(session.scenario, 'pass');
        if (session.scenario < this.scenarioCount() - 1) {
          this.onMessage?.(`Parkur ${session.scenario + 1} tamam! Sıradaki parkura geçiyorum.`, 'success');
          await this.wait(this.speed);
          if (token !== this.token) return null;
          this.beginScenario(session, session.scenario + 1);
          return null;
        }
        return this.finish(session, true);
      }
      return this.finish(session, false, outcome);
    } finally {
      if (token === this.token) this.busy = false;
      this.onStateChange?.();
    }
  }

  // Bir önceki olaya döner: dünya deterministik olduğundan program bu
  // parkurun başından bir eksik olaya kadar sessizce yeniden oynatılır.
  stepBack() {
    const session = this.session;
    if (!this.canStepBack) return false;
    const target = session.events.length - 1;
    this.world = this.createWorld(session.scenario);
    session.generator = execute(session.program, this.world);
    session.events = [];
    let last = null;
    for (let i = 0; i < target; i++) {
      const next = session.generator.next();
      if (next.done) break;
      session.events.push(next.value);
      last = next.value;
    }
    this.renderer?.reset();
    this.syncView({ snap: true, rebuild: true });
    this.onLine?.(last?.line || null, last);
    this.onEvent?.(last);
    this.onStateChange?.();
    return true;
  }

  // Adım modundayken kalan programı normal hızda sürdürür.
  async continueRun() {
    const session = this.session;
    if (this.mode !== 'step' || !session || this.busy) return null;
    this.mode = 'run';
    const token = this.token;
    this.onStateChange?.();
    return this.playSession(session, token);
  }
}
