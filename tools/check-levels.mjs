// Görev denetimi: her görevin örnek çözümünü gerçek yorumlayıcıda bütün
// parkurlarda çalıştırır, satır sayısını yıldız hedefleriyle karşılaştırır ve
// koşulsuz görevlerde çözücüyle en kısa programı arar.
//
//   node tools/check-levels.mjs            tüm görevler
//   node tools/check-levels.mjs 3 7 12     yalnızca bu numaralar
//   node tools/check-levels.mjs --fast     yalnızca örnek çözümleri çalıştır

import { LEVELS } from '../levels.js';
import { parseProgram } from '../lang.js';
import { World } from '../world.js';
import { runToEnd } from '../interpreter.js';
import { solveMinimum, solveJoint } from './solver.mjs';

const args = process.argv.slice(2);
const skipSearch = args.includes('--fast');
const FIXED_SEARCH_LIMIT = 9;
const only = new Set(args.filter(a => /^\d+$/.test(a)).map(Number));

function scenariosOf(level) {
  return level.scenarios || [{ map: level.map, dir: level.dir }];
}

let problems = 0;
for (const level of LEVELS) {
  if (only.size && !only.has(level.id)) continue;
  const notes = [];
  let program;
  try {
    program = parseProgram(level.solution, { features: level.features });
  } catch (error) {
    console.log(`✗ ${level.id} ${level.title}: çözüm ayrıştırılamadı — ${error.message}`);
    problems++;
    continue;
  }
  const failures = [];
  scenariosOf(level).forEach((sc, i) => {
    const world = World.parse(sc.map, sc.dir || level.dir);
    const { result } = runToEnd(program, world);
    if (result.kind !== 'win') failures.push(`parkur ${i + 1}: ${result.kind}/${result.reason || ''} satır ${result.line || '-'}`);
  });
  if (failures.length) {
    problems++;
    notes.push(`ÇÖZÜM KAZANMIYOR (${failures.join('; ')})`);
  }
  if (program.lineCount !== level.stars.three) {
    notes.push(`çözüm ${program.lineCount} satır ama 3★ hedefi ${level.stars.three}`);
  }
  const conditional = level.features.includes('if') || level.features.includes('while');
  const searchable = !conditional && !level.scenarios && !level.features.includes('function') && !level.features.includes('variable');
  if (searchable && !skipSearch) {
    const sc = scenariosOf(level)[0];
    const dir = sc.dir || level.dir;
    // Döngüsüz programlar 2★ sınırına kadar aranır; döngülü programlar
    // örnek çözümden kısa bir şey var mı diye aranır.
    const plain = solveMinimum(sc.map, dir, { loops: false, maxLines: level.stars.two });
    notes.push(`döngüsüz en az ${plain.lines ?? '>' + level.stars.two}`);
    let best = plain.lines;
    if (level.features.includes('loop')) {
      if (plain.lines !== null && plain.lines <= level.stars.three) notes.push('UYARI: 3★ döngüsüz alınabiliyor');
      const looped = solveMinimum(sc.map, dir, { loops: true, maxLines: level.stars.three - 1 });
      if (looped.lines !== null) best = best === null ? looped.lines : Math.min(best, looped.lines);
      notes.push(`daha kısa döngülü ${looped.lines ?? 'yok'}`);
      if (looped.lines !== null && level.record !== looped.lines && (level.record ?? Infinity) > looped.lines) console.log(looped.code);
    }
    if (best !== null && best < level.stars.three) {
      if (level.record !== best) notes.push(`REKOR ${best} satır — level.record=${level.record ?? 'yok'} güncellenmeli`);
      else notes.push(`rekor ${best}`);
      if (level.record !== best) problems++;
    } else if (level.record) {
      notes.push(`level.record=${level.record} ama arama daha kısa bulmadı`);
      problems++;
    }
  }
  // Çok parkurlu görevlerde ezberlenmiş (koşulsuz) bir program 3★ alamamalı.
  if (level.scenarios && !skipSearch && !level.starter) {
    // Arama satır sayısıyla üstel büyür; uzun çözümlerde 9 satırla sınırlanır.
    const bound = Math.min(level.stars.three, FIXED_SEARCH_LIMIT);
    const fixed = solveJoint(level.scenarios.map(sc => ({ map: sc.map, dir: sc.dir || level.dir })), { loops: true, maxLines: bound });
    if (fixed.lines !== null) {
      notes.push(`UYARI: ${fixed.lines} satırlık sabit program bütün parkurları geçiyor`);
      problems++;
    } else {
      notes.push(`sabit program ≤${bound}: yok`);
    }
  }
  console.log(`${failures.length ? '✗' : '✓'} ${String(level.id).padStart(2)} ${level.title.padEnd(26)} ★★★≤${level.stars.three} ★★≤${level.stars.two} | ${notes.join(' | ')}`);
}
if (problems) {
  console.log(`\n${problems} sorunlu görev`);
  process.exitCode = 1;
}
