import { parseProgram } from '../../lang.js';
import { World } from '../../world.js';
import { runToEnd, execute } from '../../interpreter.js';
import { solveMinimum } from '../solver.mjs';
export function grid(W, H) { return Array.from({ length: H }, () => Array(W).fill('.')); }
export function put(g, ch, cells) { for (const [x, y] of cells) g[y][x] = ch; }
export function rows(g) { return g.map(r => r.join('')); }
export function check(map, dir, code) { const w = World.parse(map, dir); const r = runToEnd(parseProgram(code), w).result; return r.kind + (r.reason ? '/' + r.reason + '@' + r.line : '') + ` (bananas left ${w.bananasLeft}, at ${w.x},${w.y})`; }
export function lines(code) { return parseProgram(code).lineCount; }
export function degenerate(map, dir, maxLines) { const t0 = Date.now(); const r = solveMinimum(map, dir, { loops: true, maxLines }); return `loop-only ≤${maxLines}: ${r.lines ?? 'yok'} (${Date.now() - t0}ms)` + (r.code ? '\n' + r.code : ''); }
export function show(map) { console.log(map.map(r => "      '" + r + "',").join('\n')); }
// 4×4 chamber with two doors on top: walls at cx, cx+3; doors (cx+1,cy),(cx+2,cy); floor rows cy+1..cy+2; bottom wall cy+3.
export function chamber(g, cx, cy, { bananas = [[1, 2], [2, 2]] } = {}) {
  for (let x = cx; x <= cx + 3; x++) for (let y = cy; y <= cy + 3; y++) {
    const wall = x === cx || x === cx + 3 || y === cy + 3;
    g[y][x] = wall ? '#' : '.';
  }
  for (const [bx, by] of bananas) g[cy + by][cx + bx] = 'B';
}
// Chamber whose doors face east (rotated): walls at rows cy, cy+3; doors (cx+3, cy+1),(cx+3,cy+2); floor cols cx+1..cx+2; back wall cx.
export function chamberEast(g, cx, cy, { bananas = [[1, 1], [1, 2]] } = {}) {
  for (let x = cx; x <= cx + 3; x++) for (let y = cy; y <= cy + 3; y++) {
    const wall = y === cy || y === cy + 3 || x === cx;
    g[y][x] = wall ? '#' : '.';
  }
  for (const [bx, by] of bananas) g[cy + by][cx + bx] = 'B';
}
// Chamber whose doors face south: walls at cx, cx+3; doors (cx+1,cy+3),(cx+2,cy+3); floor rows cy+1..cy+2; back wall cy.
export function chamberSouth(g, cx, cy, { bananas = [[1, 1], [2, 1]] } = {}) {
  for (let x = cx; x <= cx + 3; x++) for (let y = cy; y <= cy + 3; y++) {
    const wall = x === cx || x === cx + 3 || y === cy;
    g[y][x] = wall ? '#' : '.';
  }
  for (const [bx, by] of bananas) g[cy + by][cx + bx] = 'B';
}
