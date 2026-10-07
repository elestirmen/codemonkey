// Trace an intended program on a blank (or decorated) map; place bananas at
// chosen step indices / corners and the chest at the end.
import { parseProgram } from '../../lang.js';
import { World } from '../../world.js';
import { execute } from '../../interpreter.js';
import { solveMinimum, shortestWalk } from '../solver.mjs';

export function trace({ base, dir, code, bananas = 'corners', every = 0, extra = [], skip = [], endTrim = 0 }) {
  // base: rows with M placed and no S; we add a temporary S far away? -> use a big open trace world
  const rows = base.map(r => r.split(''));
  const H = rows.length, W = rows[0].length;
  let sx, sy;
  rows.forEach((r, y) => r.forEach((c, x) => { if (c === 'M') { sx = x; sy = y; } }));
  // temp world: put chest in a corner not on the path (we'll ignore win)
  const tmp = rows.map(r => r.map(c => (c === 'B' || c === 'S' ? '.' : c)).join(''));
  const fake = tmp.map((r, y) => y === 0 ? 'S' + r.slice(1) : r);
  const program = parseProgram(code);
  const world = World.parse(fake.map(r => r.replace(/S/g, (m, i) => m)), dir);
  world.chest = { x: -5, y: -5 };
  const path = [{ x: sx, y: sy, turn: false }];
  let pending = false;
  for (const ev of execute(program, world)) {
    if (ev.kind === 'move') { path.push({ x: ev.to.x, y: ev.to.y, turnAfter: false }); }
    else if (ev.kind === 'turn') { path[path.length - 1].turnAfter = true; }
    else if (ev.kind === 'fail') { throw new Error('trace failed: ' + JSON.stringify(ev)); }
  }
  const out = rows.map(r => r.map(c => (c === 'S' ? '.' : c)));
  for (let i = 0; i < endTrim; i++) path.pop();
  const end = path[path.length - 1];
  path.forEach((p, i) => {
    if (i === 0 || i === path.length - 1) return;
    const pick = bananas === 'all' ? true : bananas === 'corners' ? p.turnAfter : (every && i % every === 0);
    if ((pick || extra.includes(i)) && !skip.includes(i) && out[p.y][p.x] === '.') out[p.y][p.x] = 'B';
  });
  out[end.y][end.x] = 'S';
  return { map: out.map(r => r.join('')), path };
}

export function report(name, map, dir, three, { two = three + Math.max(2, Math.ceil(three / 2)) } = {}) {
  const t0 = Date.now();
  // Döngüsüz: 2★ sınırına kadar ara (3★ döngüsüz alınabiliyor mu? 2★?)
  const plain = solveMinimum(map, dir, { loops: false, maxLines: two });
  // Döngülü: amaçlanandan kısa bir program var mı?
  const looped = solveMinimum(map, dir, { loops: true, maxLines: three - 1 });
  console.log(`## ${name}  3★=${three} 2★=${two}  plain=${plain.lines ?? '>' + two}  shorter-loop=${looped.lines ?? 'yok'}  walk=${shortestWalk(map, dir).actions}  ${Date.now() - t0}ms`);
  console.log(map.map(r => "    '" + r + "',").join('\n'));
  if (looped.lines) console.log('-- daha kısa:\n' + looped.code);
  console.log();
}
