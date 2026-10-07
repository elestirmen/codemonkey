import { parseProgram } from '../../lang.js';
import { World } from '../../world.js';
import { execute, runToEnd } from '../../interpreter.js';
import { solveJoint } from '../solver.mjs';

// Trace a program on a map that has rocks/water but no chest yet: returns path cells.
export function tracePath(rows, dir, code, maxMoves = 200) {
  const fake = rows.map((r, y) => r.replace(/[SB]/g, '.'));
  // put a chest somewhere unreachable (a corner rock) by replacing first '#' or adding one
  const withChest = fake.slice();
  for (let y = withChest.length - 1; y >= 0; y--) {
    const x = withChest[y].lastIndexOf('.');
    if (x >= 0) { withChest[y] = withChest[y].slice(0, x) + 'S' + withChest[y].slice(x + 1); break; }
  }
  const world = World.parse(withChest, dir);
  world.chest = { x: -9, y: -9 };
  const path = [{ x: world.x, y: world.y }];
  let moves = 0;
  for (const ev of execute(parseProgram(code), world)) {
    if (ev.kind === 'move') { path.push({ x: ev.to.x, y: ev.to.y }); if (++moves >= maxMoves) break; }
    if (ev.kind === 'fail') { path.fail = ev; break; }
  }
  return path;
}

export function draw(rows, path) {
  const g = rows.map(r => r.split(''));
  path.forEach((p, i) => { if (g[p.y] && g[p.y][p.x] === '.') g[p.y][p.x] = (i % 36).toString(36); });
  return g.map(r => r.join('')).join('\n');
}

export function verify(level) {
  const program = parseProgram(level.code);
  const out = [];
  level.scenarios.forEach((sc, i) => {
    const w = World.parse(sc.map, sc.dir || level.dir);
    const r = runToEnd(program, w).result;
    out.push(`p${i + 1}:${r.kind}${r.reason ? '/' + r.reason + '@' + r.line : ''}`);
  });
  const t0 = Date.now();
  const joint = solveJoint(level.scenarios.map(sc => ({ map: sc.map, dir: sc.dir || level.dir })), { loops: true, maxLines: level.fixedMax ?? program.lineCount + 2 });
  console.log(`## ${level.name}: ${program.lineCount} satır; ${out.join(' ')}; sabit program en az ${joint.lines ?? '>' + (level.fixedMax ?? program.lineCount + 2)} (${Date.now() - t0}ms, ${joint.states} durum)`);
  if (joint.code) console.log(joint.code);
  level.scenarios.forEach((sc, i) => console.log(`-- parkur ${i + 1}\n` + sc.map.map(r => "      '" + r + "',").join('\n')));
  console.log();
}

// Carve a sandbar path into the sea. moves: 'E4 S2 E3 N2 ...'; bananas: path indices.
export function sandbar(W, H, start, moves, { bananas = [], fill = '~', extra = [] } = {}) {
  const g = Array.from({ length: H }, () => Array(W).fill(fill));
  let [x, y] = start;
  const path = [[x, y]];
  g[y][x] = '.';
  for (const m of moves.split(/\s+/)) {
    const d = m[0], n = Number(m.slice(1));
    const [dx, dy] = { E: [1, 0], W: [-1, 0], N: [0, -1], S: [0, 1] }[d];
    for (let i = 0; i < n; i++) { x += dx; y += dy; g[y][x] = '.'; path.push([x, y]); }
  }
  for (const [ex, ey, ch] of extra) g[ey][ex] = ch;
  g[start[1]][start[0]] = 'M';
  for (const i of bananas) { const [bx, by] = path[i]; g[by][bx] = 'B'; }
  const [ex, ey] = path[path.length - 1];
  g[ey][ex] = 'S';
  return g.map(r => r.join(''));
}

// Terraces climbing to the right: lengths[i] squares on each terrace, a rock
// closes each terrace, then one step up. Returns rows with M, rocks, bananas, chest.
export function terraces(W, H, lengths, { bananas = [], fillBelow = true } = {}) {
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  let x = 1;
  let y = H - 2;
  g[y][x] = 'M';
  const cells = [];
  lengths.forEach((len, i) => {
    for (let k = 1; k <= len; k++) cells.push([x + k, y]);
    x += len;
    const last = i === lengths.length - 1;
    if (!last) {
      g[y][x + 1] = '#';
      if (fillBelow) for (let yy = y + 1; yy < H; yy++) for (let xx = x + 1; xx < W; xx++) if (g[yy][xx] === '.') g[yy][xx] = '#';
      y -= 1;
      cells.push([x, y]);
    }
  });
  for (const i of bananas) { const [bx, by] = cells[i]; g[by][bx] = 'B'; }
  const [cx, cy] = cells[cells.length - 1];
  g[cy][cx] = 'S';
  return g.map(r => r.join(''));
}

// Perfect maze on a (2w+1)x(2h+1) grid via seeded DFS. Start top-left cell, chest bottom-right.
export function maze(w, h, seed) {
  let s = seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  const W = 2 * w + 1, H = 2 * h + 1;
  const g = Array.from({ length: H }, () => Array(W).fill('#'));
  const seen = new Set();
  const stack = [[0, 0]];
  seen.add('0,0');
  g[1][1] = '.';
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nbrs = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy, dx, dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < w && y < h && !seen.has(x + ',' + y));
    if (!nbrs.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = nbrs[Math.floor(rnd() * nbrs.length)];
    g[2 * cy + 1 + dy][2 * cx + 1 + dx] = '.';
    g[2 * ny + 1][2 * nx + 1] = '.';
    seen.add(nx + ',' + ny);
    stack.push([nx, ny]);
  }
  g[1][1] = 'M';
  g[H - 2][W - 2] = 'S';
  return g.map(r => r.join(''));
}
