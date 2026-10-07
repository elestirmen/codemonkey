// Görev çözücü: bir haritayı kazanan EN KISA programı (satır sayısı olarak)
// arar. Yıldız hedeflerinin ulaşılabilir ve sıkı olduğunu, haritada birden
// fazla rota bulunduğunu doğrulamak için kullanılır; oyunun kendisi bu
// dosyayı yüklemez.
//
// Arama, dünya durumları üzerinde satır maliyetli bir Dijkstra'dır:
//   düğüm  = (konum, yön, toplanan muzlar, toplanan anahtarlar)
//   kenar  = bir üst düzey deyim: ilerle(n), sagaDon(), solaDon() ya da
//            tekrarla(k): gövde   (maliyeti satır sayısı)
// Döngü gövdeleri, ilk tur adım adım simüle edilerek derinlemesine üretilir;
// ilk turda çarpan bir gövde öneki hemen budanır. Gövdenin tek turundan
// sonraki turlar k = 2..K için tek simülasyonla bulunur.
//
// Kural eşdeğerliği: buradaki simülasyon world.js ile aynı kuralları uygular;
// test paketi bulunan her çözümü gerçek yorumlayıcıda yeniden çalıştırır.

import { World, directionOffset, DIRECTIONS } from '../world.js';

const CRASH = -1;

export function compileMap(rows, dir) {
  const world = World.parse(rows, dir);
  const W = world.width;
  const H = world.height;
  const cells = W * H;
  const walk = new Uint8Array(cells); // 0 engel, 1 yürünür, 2 kapı
  const bananaBit = new Int32Array(cells).fill(-1);
  const keyBit = new Int32Array(cells).fill(-1);
  for (let i = 0; i < cells; i++) {
    const t = world.tiles[i];
    walk[i] = t === '#' || t === '~' ? 0 : t === 'G' ? 2 : 1;
  }
  world.base.bananas.forEach((b, i) => { bananaBit[b.y * W + b.x] = i; });
  world.base.keys.forEach((k, i) => { keyBit[k.y * W + k.x] = i; });
  const nb = world.base.bananas.length;
  const nk = world.base.keys.length;
  const deltas = DIRECTIONS.map(d => directionOffset(d));
  return {
    W, H, walk, bananaBit, keyBit, nb, nk,
    allBananas: (1 << nb) - 1,
    allKeys: (1 << nk) - 1,
    chest: world.chest.y * W + world.chest.x,
    start: { p: world.base.start.y * W + world.base.start.x, d: DIRECTIONS.indexOf(world.base.dir), b: 0, k: 0 },
    deltas
  };
}

// Durum: { p, d, b, k } — p konum, d yön (0 yukarı, 1 sağ, 2 aşağı, 3 sol)
function keyOf(m, s) {
  return ((s.p * 4 + s.d) * (m.allBananas + 1) + s.b) * (m.allKeys + 1) + s.k;
}

// Bir kare ilerler. Dönüş: yeni durum, CRASH ya da { win: true }
function stepForward(m, s) {
  const x = s.p % m.W;
  const y = (s.p - x) / m.W;
  const { dx, dy } = m.deltas[s.d];
  const nx = x + dx;
  const ny = y + dy;
  if (nx < 0 || ny < 0 || nx >= m.W || ny >= m.H) return CRASH;
  const np = ny * m.W + nx;
  const w = m.walk[np];
  if (w === 0) return CRASH;
  if (w === 2 && s.k !== m.allKeys) return CRASH;
  let b = s.b;
  let k = s.k;
  if (m.bananaBit[np] >= 0) b |= 1 << m.bananaBit[np];
  if (m.keyBit[np] >= 0) k |= 1 << m.keyBit[np];
  if (np === m.chest && b === m.allBananas) return { win: true, p: np, d: s.d, b, k };
  return { p: np, d: s.d, b, k };
}

// Deyimler: { t: 'F', n } ilerle(n), { t: 'R' } sağa, { t: 'L' } sola,
// { t: 'loop', k, body: [...] }
function simulate(m, s, stmt) {
  switch (stmt.t) {
    case 'F': {
      let cur = s;
      for (let i = 0; i < stmt.n; i++) {
        cur = stepForward(m, cur);
        if (cur === CRASH || cur.win) return cur;
      }
      return cur;
    }
    case 'R': return { p: s.p, d: (s.d + 1) % 4, b: s.b, k: s.k };
    case 'L': return { p: s.p, d: (s.d + 3) % 4, b: s.b, k: s.k };
    case 'loop': {
      let cur = s;
      for (let i = 0; i < stmt.k; i++) {
        for (const inner of stmt.body) {
          cur = simulate(m, cur, inner);
          if (cur === CRASH || cur.win) return cur;
        }
      }
      return cur;
    }
    default:
      throw new Error('bilinmeyen deyim');
  }
}

export function stmtLines(stmt) {
  if (stmt.t === 'loop') return 1 + stmt.body.reduce((n, x) => n + stmtLines(x), 0);
  return 1;
}

export function stmtToCode(stmts, depth = 0) {
  const pad = '    '.repeat(depth);
  const out = [];
  for (const s of stmts) {
    if (s.t === 'F') out.push(`${pad}ilerle(${s.n === 1 ? '' : s.n})`);
    else if (s.t === 'R') out.push(`${pad}sagaDon()`);
    else if (s.t === 'L') out.push(`${pad}solaDon()`);
    else {
      out.push(`${pad}tekrarla(${s.k}):`);
      out.push(...stmtToCode(s.body, depth + 1).split('\n'));
    }
  }
  return out.join('\n');
}

// Bir gövdeye eklenebilecek sonraki deyimin gereksiz olup olmadığını söyler.
function redundantAfter(prev, prev2, next) {
  if (!prev) return false;
  if (prev.t === 'F' && next.t === 'F') return true; // ilerle(a) ilerle(b) = ilerle(a+b)
  if ((prev.t === 'R' && next.t === 'L') || (prev.t === 'L' && next.t === 'R')) return true;
  if (prev2 && prev2.t === next.t && prev.t === next.t && (next.t === 'R' || next.t === 'L')) return true;
  if (prev.t === 'L' && next.t === 'L') return true; // sola+sola = sağa+sağa; tek biçim yeter
  return false;
}

// `state` durumundan başlayan, en fazla `maxLines` satırlık tüm üst düzey
// deyimleri ve sonuçlarını üretir.
function* blocksFrom(m, state, maxLines, opts, depth = 0) {
  if (maxLines < 1) return;
  // Basit deyimler
  for (let n = 1; n <= opts.maxStep; n++) {
    const stmt = { t: 'F', n };
    const r = simulate(m, state, stmt);
    if (r === CRASH) break;
    yield { stmt, lines: 1, result: r };
    if (r.win) break;
  }
  yield { stmt: { t: 'R' }, lines: 1, result: simulate(m, state, { t: 'R' }) };
  yield { stmt: { t: 'L' }, lines: 1, result: simulate(m, state, { t: 'L' }) };
  if (!opts.loops || maxLines < 2 || depth >= opts.maxNest) return;

  // Döngüler: gövdeyi ilk tur üzerinde derinlemesine kur.
  const body = [];
  function* grow(cur, used) {
    if (body.length) {
      const hasMove = body.some(x => x.t !== 'R' && x.t !== 'L');
      const singleMove = body.length === 1 && body[0].t === 'F';
      if (hasMove && !singleMove) {
        // k = 2..K: ilk tur `cur` ile bitti; sonraki turları sırayla ekle.
        let it = cur;
        for (let k = 2; k <= opts.maxRepeat; k++) {
          for (const inner of body) {
            it = simulate(m, it, inner);
            if (it === CRASH || it.win) break;
          }
          if (it === CRASH) break;
          yield { stmt: { t: 'loop', k, body: body.slice() }, lines: 1 + used, result: it };
          if (it.win) break;
          if (it.p === cur.p && it.d === cur.d && it.b === cur.b && it.k === cur.k && k > 2) break;
        }
      }
    }
    if (used >= maxLines - 1) return;
    const prev = body[body.length - 1];
    const prev2 = body[body.length - 2];
    for (const option of blocksFrom(m, cur, maxLines - 1 - used, opts, depth + 1)) {
      if (redundantAfter(prev, prev2, option.stmt)) continue;
      if (option.result === CRASH) continue;
      if (option.result.win) continue; // ilk turda kazanan döngü, döngüsüz halinden uzundur
      body.push(option.stmt);
      yield* grow(option.result, used + option.lines);
      body.pop();
    }
  }
  yield* grow(state, 0);
}

function decode(m, key) {
  const k = key % (m.allKeys + 1);
  let rest = (key - k) / (m.allKeys + 1);
  const b = rest % (m.allBananas + 1);
  rest = (rest - b) / (m.allBananas + 1);
  const d = rest % 4;
  const p = (rest - d) / 4;
  return { p, d, b, k };
}

// En az satırlı kazanan programı bulur. `maxLines` arama sınırıdır.
export function solveMinimum(rows, dir, { loops = true, maxLines = 9, maxStep = 0, maxRepeat = 12, maxNest = 2, countLimit = 0 } = {}) {
  const m = compileMap(rows, dir);
  const opts = { loops, maxStep: maxStep || Math.max(m.W, m.H), maxRepeat, maxNest };
  const startKey = keyOf(m, m.start);
  const dist = new Map([[startKey, 0]]);
  const parentKey = new Map();
  const parentStmt = new Map();
  const buckets = [[startKey]];
  let best = maxLines + 1;
  let bestPlan = null;

  for (let cost = 0; cost < best && cost < buckets.length; cost++) {
    const bucket = buckets[cost] || [];
    for (const sk of bucket) {
      if (dist.get(sk) !== cost) continue;
      const state = decode(m, sk);
      for (const { stmt, lines, result } of blocksFrom(m, state, best - 1 - cost, opts)) {
        if (result === CRASH) continue;
        const total = cost + lines;
        if (result.win) {
          if (total < best) {
            best = total;
            bestPlan = { last: stmt, from: sk };
          }
          continue;
        }
        if (total >= best) continue;
        const rk = keyOf(m, result);
        const known = dist.get(rk);
        if (known !== undefined && known <= total) continue;
        dist.set(rk, total);
        parentKey.set(rk, sk);
        parentStmt.set(rk, stmt);
        (buckets[total] ||= []).push(rk);
      }
    }
    buckets[cost] = null;
  }
  if (!bestPlan) return { lines: null, program: null, states: dist.size };
  const stmts = [bestPlan.last];
  let cur = bestPlan.from;
  while (cur !== startKey) {
    stmts.unshift(parentStmt.get(cur));
    cur = parentKey.get(cur);
  }
  const result = { lines: best, program: stmts, code: stmtToCode(stmts), states: dist.size };
  if (countLimit) result.optimalCount = countOptimal(m, opts, dist, best, countLimit);
  return result;
}

// En kısa satır sayısına ulaşan farklı programları (en fazla `limit`) sayar.
function countOptimal(m, opts, dist, best, limit) {
  let count = 0;
  const walk = (state, cost) => {
    if (count >= limit) return;
    for (const { lines, result } of blocksFrom(m, state, best - cost, opts)) {
      if (result === CRASH) continue;
      const total = cost + lines;
      if (result.win) {
        if (total === best) count++;
        if (count >= limit) return;
        continue;
      }
      if (total >= best) continue;
      if (dist.get(keyOf(m, result)) !== total) continue;
      walk(result, total);
      if (count >= limit) return;
    }
  };
  walk(m.start, 0);
  return count;
}

// En kısa yürüyüş (adım sayısı) — rota çeşitliliğini ölçmek için BFS.
export function shortestWalk(rows, dir) {
  const m = compileMap(rows, dir);
  const start = m.start;
  const seen = new Map([[keyOf(m, start), 0]]);
  let frontier = [start];
  let steps = 0;
  while (frontier.length) {
    const next = [];
    for (const s of frontier) {
      for (const stmt of [{ t: 'F', n: 1 }, { t: 'R' }, { t: 'L' }]) {
        const r = simulate(m, s, stmt);
        if (r === CRASH) continue;
        if (r.win) return { actions: steps + 1 };
        const k = keyOf(m, r);
        if (seen.has(k)) continue;
        seen.set(k, steps + 1);
        next.push(r);
      }
    }
    frontier = next;
    steps++;
  }
  return { actions: null };
}

// ── Çoklu parkur ────────────────────────────────────────────────────────────
// Aynı SABİT programın (koşulsuz, döngülü olabilir) bütün parkurları kazanıp
// kazanamayacağını arar. Koşul görevlerinde "ezberlenmiş bir rota yetmez"
// iddiasını doğrulamak için kullanılır. Bir parkur kazanılınca o parkurda
// program durur; diğerlerinde sürer.

function simulateJoint(ms, state, stmt) {
  const parts = state.parts.slice();
  const won = state.won.slice();
  for (let i = 0; i < ms.length; i++) {
    if (won[i]) continue;
    const r = simulate(ms[i], parts[i], stmt);
    if (r === CRASH) return CRASH;
    parts[i] = r;
    if (r.win) won[i] = true;
  }
  return { parts, won, win: won.every(Boolean) };
}

function jointKey(ms, state) {
  return state.parts.map((s, i) => (state.won[i] ? 'W' : keyOf(ms[i], s))).join('|');
}

function* jointBlocksFrom(ms, state, maxLines, opts, depth = 0) {
  if (maxLines < 1) return;
  for (let n = 1; n <= opts.maxStep; n++) {
    const stmt = { t: 'F', n };
    const r = simulateJoint(ms, state, stmt);
    if (r === CRASH) break;
    yield { stmt, lines: 1, result: r };
    if (r.win) break;
  }
  yield { stmt: { t: 'R' }, lines: 1, result: simulateJoint(ms, state, { t: 'R' }) };
  yield { stmt: { t: 'L' }, lines: 1, result: simulateJoint(ms, state, { t: 'L' }) };
  if (!opts.loops || maxLines < 2 || depth >= opts.maxNest) return;
  const body = [];
  function* grow(cur, used) {
    if (body.length) {
      const hasMove = body.some(x => x.t !== 'R' && x.t !== 'L');
      const singleMove = body.length === 1 && body[0].t === 'F';
      if (hasMove && !singleMove) {
        let it = cur;
        for (let k = 2; k <= opts.maxRepeat; k++) {
          for (const inner of body) {
            it = simulateJoint(ms, it, inner);
            if (it === CRASH || it.win) break;
          }
          if (it === CRASH) break;
          yield { stmt: { t: 'loop', k, body: body.slice() }, lines: 1 + used, result: it };
          if (it.win) break;
        }
      }
    }
    if (used >= maxLines - 1) return;
    const prev = body[body.length - 1];
    const prev2 = body[body.length - 2];
    for (const option of jointBlocksFrom(ms, cur, maxLines - 1 - used, opts, depth + 1)) {
      if (redundantAfter(prev, prev2, option.stmt)) continue;
      if (option.result === CRASH || option.result.win) continue;
      body.push(option.stmt);
      yield* grow(option.result, used + option.lines);
      body.pop();
    }
  }
  yield* grow(state, 0);
}

export function solveJoint(scenarios, { loops = true, maxLines = 8, maxStep = 0, maxRepeat = 12, maxNest = 2 } = {}) {
  const ms = scenarios.map(sc => compileMap(sc.map, sc.dir));
  const opts = { loops, maxStep: maxStep || Math.max(...ms.map(m => Math.max(m.W, m.H))), maxRepeat, maxNest };
  const start = { parts: ms.map(m => m.start), won: ms.map(() => false) };
  const startKey = jointKey(ms, start);
  const dist = new Map([[startKey, 0]]);
  const parent = new Map();
  const buckets = [[start]];
  let best = maxLines + 1;
  let bestPlan = null;
  for (let cost = 0; cost < best && cost < buckets.length; cost++) {
    for (const state of buckets[cost] || []) {
      const sk = jointKey(ms, state);
      if (dist.get(sk) !== cost) continue;
      for (const { stmt, lines, result } of jointBlocksFrom(ms, state, best - 1 - cost, opts)) {
        if (result === CRASH) continue;
        const total = cost + lines;
        if (result.win) {
          if (total < best) {
            best = total;
            bestPlan = { last: stmt, from: sk };
          }
          continue;
        }
        if (total >= best) continue;
        const rk = jointKey(ms, result);
        const known = dist.get(rk);
        if (known !== undefined && known <= total) continue;
        dist.set(rk, total);
        parent.set(rk, { from: sk, stmt });
        (buckets[total] ||= []).push(result);
      }
    }
    buckets[cost] = null;
  }
  if (!bestPlan) return { lines: null, code: null, states: dist.size };
  const stmts = [bestPlan.last];
  let cur = bestPlan.from;
  while (cur !== startKey) {
    const p = parent.get(cur);
    stmts.unshift(p.stmt);
    cur = p.from;
  }
  return { lines: best, code: stmtToCode(stmts), states: dist.size };
}
