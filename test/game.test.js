// Motorun, dilin ve müfredatın değişmezleri: `npm test`
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { parseProgram, formatProgram, convertSyntax, countLines, CodeError, FEATURES, SENSORS } from '../lang.js?v=20261007-v5';
import { World } from '../world.js?v=20261007-v5';
import { execute, runToEnd } from '../interpreter.js?v=20261007-v5';
import { LEVELS, ISLANDS } from '../levels.js?v=20261007-v5';
import { Game } from '../game.js?v=20261007-v5';

const scenariosOf = level => level.scenarios || [{ map: level.map, dir: level.dir }];
const play = (source, rows, dir = 'E', features) => runToEnd(parseProgram(source, features ? { features } : undefined), World.parse(rows, dir)).result;
const errorOf = (source, options) => {
  try {
    parseProgram(source, options);
  } catch (error) {
    return error;
  }
  assert.fail(`hata bekleniyordu: ${source}`);
};

// ── Dil ─────────────────────────────────────────────────────────────────────

test('tek hareket komutu: ilerle() 1 kare, ilerle(n) n kare', () => {
  const rows = ['M....S'];
  assert.equal(play('ilerle()\nilerle()\nilerle()\nilerle()\nilerle()', rows).kind, 'win');
  assert.equal(play('ilerle(5)', rows).kind, 'win');
  assert.equal(play('ilerle(2)\nilerle(3)', rows).kind, 'win');
  assert.match(errorOf('adimla(3)').message, /ilerle\(3\)/);
});

test('girinti ve süslü parantez aynı programı ve aynı puanı verir', () => {
  const indent = 'tanimla kare():\n    tekrarla(4):\n        ilerle(2)\n        sagaDon()\n\nn = 1\nise(onumBos()):\n    kare()\ndegilse:\n    solaDon()\niken(hedefteDegilim()):\n    ilerle(n)';
  const a = parseProgram(indent);
  const bracketSource = formatProgram(a, 'bracket');
  const b = parseProgram(bracketSource);
  assert.equal(b.syntax, 'bracket');
  assert.equal(a.lineCount, b.lineCount);
  assert.equal(formatProgram(b, 'indent'), formatProgram(a, 'indent'));
  assert.equal(convertSyntax(bracketSource, 'indent').trim(), formatProgram(a, 'indent').trim());
  // tanimla 1 + tekrarla 1 + 2 + atama 1 + ise 1 + 1 + degilse 1 + 1 + iken 1 + 1
  assert.equal(a.lineCount, 11);
});

test('yorumlar, boş satırlar ve kapanış parantezleri satır sayılmaz', () => {
  const program = parseProgram('# rota\n\nilerle(2) // iki kare\ntekrarla(2) {\n  sagaDon()\n}\n');
  assert.equal(program.lineCount, 3);
  assert.equal(countLines(program), 3);
});

test('Türkçe harflerle yazılan komutlar da anlaşılır', () => {
  assert.equal(play('ilerle(2)\nsağaDön()\nilerle()', ['M..', '..S'], 'E').kind, 'win');
});

test('hata mesajları satırı söyler ve yol gösterir', () => {
  assert.equal(errorOf('ilerle()\nilerle').line, 2);
  assert.match(errorOf('ilerle').message, /parantez ekle: ilerle\(\)/);
  assert.match(errorOf('ilerle 3').message, /ilerle\(3\)/);
  assert.match(errorOf('sagadon()').message, /sagaDon\(\) mu demek istedin/);
  assert.match(errorOf('sagaDon(2)').message, /sayı almaz/);
  assert.match(errorOf('onumBos()').message, /bir soru/);
  assert.match(errorOf('ise(ilerle()):\n    ilerle()').message, /hareket komutu, soru değil/);
  assert.match(errorOf('tekrarla(3):\nilerle()').message, /altına içeride/);
  assert.match(errorOf('  ilerle()').message, /neden içeride/);
  assert.equal(errorOf('tekrarla(2) {\n  ilerle()\n').line, 1);
  assert.match(errorOf('kare()', { features: FEATURES }).message, /tanimla kare\(\)/);
  assert.match(errorOf('ilerle(n)', { features: [] }).message, /sayı yazmalısın/);
  assert.ok(errorOf('ilerle(').message.length > 0);
  assert.ok(errorOf('}').message.includes('Fazladan'));
});

test('henüz öğretilmeyen yapılar kilitlidir', () => {
  assert.equal(errorOf('tekrarla(2):\n    ilerle()', { features: [] }).locked, 'loop');
  assert.equal(errorOf('tanimla a():\n    ilerle()\na()', { features: ['loop'] }).locked, 'function');
  assert.equal(errorOf('ise(onumBos()):\n    ilerle()', { features: ['loop', 'function'] }).locked, 'if');
  assert.equal(errorOf('iken(onumBos()):\n    ilerle()', { features: ['loop', 'function', 'if'] }).locked, 'while');
  assert.equal(errorOf('n = 1', { features: ['loop', 'function', 'if', 'while'] }).locked, 'variable');
  assert.ok(errorOf('n = 1', { features: [] }) instanceof CodeError);
});

// ── Kurallar ────────────────────────────────────────────────────────────────

test('engeller, su, adanın kenarı ve kilitli kapı programı durdurur', () => {
  assert.equal(play('ilerle(2)', ['M#.S']).reason, 'rock');
  assert.equal(play('ilerle(2)', ['M~.S']).reason, 'water');
  assert.equal(play('solaDon()\nilerle()', ['M..S']).reason, 'edge');
  assert.equal(play('ilerle(3)', ['M.GS', 'K...']).reason, 'gate');
  assert.equal(play('ilerle(3)', ['M=.S']).kind, 'win');
});

test('anahtar alınınca kapı açılır; sandık ancak bütün muzlarla açılır', () => {
  assert.equal(play('sagaDon()\nilerle()\nsolaDon()\nilerle()\nsolaDon()\nilerle()\nsagaDon()\nilerle(2)', ['M.GS', '.K..']).kind, 'win');
  const ended = play('ilerle(3)', ['M..S', '.B..']);
  assert.equal(ended.kind, 'end');
  assert.equal(ended.bananasLeft, 1);
});

test('Mojo sandığa bütün muzlarla vardığı anda görev biter', () => {
  // ilerle(9) haritanın dışına taşardı ama sandıkta durur.
  assert.equal(play('ilerle(9)', ['M.B.S']).kind, 'win');
});

test('sorular doğru kareye bakar', () => {
  const world = World.parse(['.#.', '.M~', '...', 'S..'], 'UP');
  assert.equal(world.sense('onumBos'), false);
  assert.equal(world.sense('solumBos'), true);
  assert.equal(world.sense('sagimBos'), false);
  assert.equal(world.sense('hedefteDegilim'), true);
  assert.deepEqual(Object.keys(SENSORS), ['onumBos', 'solumBos', 'sagimBos', 'hedefteDegilim']);
});

test('fonksiyonlar, değişkenler ve iken birlikte çalışır', () => {
  const rows = ['M....#', '......', '....S.'];
  const source = 'n = 0\niken(onumBos()):\n    ilerle()\n    n = n + 1\nsagaDon()\ntanimla iki():\n    ilerle(2)\niki()';
  assert.equal(play(source, rows).kind, 'win');
});

test('bitmeyen döngü işlem bütçesiyle güvenle durur', () => {
  const result = play('iken(hedefteDegilim()):\n    sagaDon()', ['M.S']);
  assert.equal(result.kind, 'fail');
  assert.equal(result.reason, 'budget');
  const deep = play('tanimla a():\n    a()\na()', ['M.S']);
  assert.equal(deep.reason, 'runtime');
  assert.match(deep.message, /çok fazla çağırdı/);
  assert.match(play('ilerle(0)', ['M.S']).message, /en az 1 kare/);
});

test('olaylar döngü turunu ve satırı taşır', () => {
  const program = parseProgram('tekrarla(3):\n    ilerle()');
  const events = [...execute(program, World.parse(['M...S'], 'E'))];
  const moves = events.filter(e => e.kind === 'move');
  assert.equal(moves.length, 3);
  assert.deepEqual(moves.map(m => m.loops[0].iteration), [1, 2, 3]);
  assert.ok(moves.every(m => m.line === 2));
  assert.equal(events.at(-1).kind, 'end');
});

// ── Müfredat ────────────────────────────────────────────────────────────────

test('beş ada, her adada 12 görev; numaralar ve adlar tekil', () => {
  assert.equal(ISLANDS.length, 5);
  assert.equal(LEVELS.length, 60);
  LEVELS.forEach((level, index) => assert.equal(level.id, index + 1));
  for (const island of ISLANDS) assert.equal(LEVELS.filter(l => l.island === island.id).length, 12, island.name);
  assert.equal(new Set(LEVELS.map(l => l.title)).size, LEVELS.length);
});

test('haritalar dikdörtgen, tek M ve tek S içerir ve geçerli karolardan oluşur', () => {
  for (const level of LEVELS) {
    for (const sc of scenariosOf(level)) {
      const world = World.parse(sc.map, sc.dir || level.dir);
      assert.ok(world.width >= 5 && world.height >= 3, `${level.id} çok küçük`);
      assert.ok(world.width <= 18 && world.height <= 11, `${level.id} çok büyük`);
    }
  }
});

test('her görevin örnek çözümü bütün parkurlarda kazanır ve 3★ hedefini tutturur', () => {
  for (const level of LEVELS) {
    for (const syntax of ['indent', 'bracket']) {
      const source = syntax === 'indent' ? level.solution : convertSyntax(level.solution, 'bracket');
      const program = parseProgram(source, { features: level.features });
      assert.equal(program.lineCount, level.stars.three, `${level.id} ${syntax}`);
      for (const [i, sc] of scenariosOf(level).entries()) {
        const { result } = runToEnd(program, World.parse(sc.map, sc.dir || level.dir));
        assert.equal(result.kind, 'win', `${level.id} ${level.title} parkur ${i + 1} (${syntax}): ${JSON.stringify(result)}`);
      }
    }
    assert.ok(level.stars.two > level.stars.three, `${level.id} yıldız hedefleri`);
    if (level.record) assert.ok(level.record < level.stars.three, `${level.id} rekor`);
  }
});

test('hata avı görevlerinin başlangıç kodu gerçekten hatalıdır', () => {
  const debug = LEVELS.filter(l => l.starter);
  assert.ok(debug.length >= 10);
  for (const level of debug) {
    const program = parseProgram(level.starter, { features: level.features });
    const outcomes = scenariosOf(level).map(sc => runToEnd(program, World.parse(sc.map, sc.dir || level.dir)).result.kind);
    assert.ok(outcomes.some(kind => kind !== 'win'), `${level.id} ${level.title} başlangıç kodu kazanmamalı`);
  }
});

test('her yapı önce öğretilir, sonra kullanılır; adalar sırayla açılır', () => {
  const taught = LEVELS.filter(l => l.teaches).map(l => [l.teaches, l.island]);
  assert.deepEqual(taught, [['loop', 2], ['function', 3], ['if', 4], ['while', 5], ['variable', 5]]);
  for (const level of LEVELS) {
    const used = parseProgram(level.solution).usedFeatures;
    for (const feature of used) assert.ok(level.features.includes(feature), `${level.id} ${feature}`);
  }
  // Her adanın konusu o adada gerçekten kullanılır.
  const needs = { 2: ['loop'], 3: ['function'], 4: ['if'], 5: ['while', 'variable'] };
  for (const [island, features] of Object.entries(needs)) {
    const levels = LEVELS.filter(l => l.island === Number(island));
    const using = levels.filter(l => features.some(f => parseProgram(l.solution).usedFeatures.has(f)));
    assert.equal(using.length, levels.length, `ada ${island}: ${features}`);
  }
});

test('koşul adalarında aynı kod birden çok parkurda sınanır', () => {
  const multi = LEVELS.filter(l => l.island === 4 || (l.features.includes('while') && l.scenarios));
  assert.ok(multi.length >= 18);
  for (const level of multi) assert.ok(scenariosOf(level).length >= 2, `${level.id}`);
});

test('ezberlenmiş bir rota başka bir parkurda işe yaramaz', () => {
  // 37. görevin ilk gelgidini kazanan sabit rota, ikinci gelgitte suya düşer.
  const level = LEVELS.find(l => l.title === 'Gelgit Geldi');
  const route = 'ilerle(5)\nsagaDon()\nilerle(4)\nsagaDon()\nilerle(6)\nsagaDon()\nilerle(5)\nsagaDon()\nilerle(3)';
  assert.equal(play(route, level.scenarios[0].map, level.dir).kind, 'win');
  assert.notEqual(play(route, level.scenarios[1].map, level.dir).kind, 'win');
});

test('görev metinleri ve ipuçları dolu; ipuçları üç kademeli', () => {
  for (const level of LEVELS) {
    assert.ok(level.text.length > 30 && level.text.length < 320, `${level.id} metin`);
    assert.equal(level.hints.length, 3, `${level.id} ipuçları`);
    assert.ok(level.concept, `${level.id} kavram`);
  }
});

// ── Oyun denetleyicisi (çizim olmadan) ──────────────────────────────────────

test('Game bütün görevleri gerçek yürütme döngüsüyle kazanır', async () => {
  const game = new Game(null);
  game.speed = 0;
  for (const level of LEVELS) {
    game.load(level);
    const result = await game.run(level.solution);
    assert.equal(result.ok, true, `${level.id} ${level.title}: ${result.message}`);
    assert.equal(result.lines, level.stars.three);
    assert.equal(result.scenarios, scenariosOf(level).length);
  }
});

test('adım adım yürütme ileri ve geri aynı durumlara varır', async () => {
  const game = new Game(null);
  game.speed = 0;
  game.load(LEVELS[2]);
  game.startStepping(LEVELS[2].solution);
  const positions = [];
  for (let i = 0; i < 4; i++) {
    await game.stepForward();
    positions.push([game.player.x, game.player.y, game.player.dir]);
  }
  game.stepBack();
  assert.deepEqual([game.player.x, game.player.y, game.player.dir], positions[2]);
  await game.stepForward();
  assert.deepEqual([game.player.x, game.player.y, game.player.dir], positions[3]);
});

// ── Arayüz ──────────────────────────────────────────────────────────────────

test('arayüz kimlikleri tekil, modüller aynı sürümle yüklenir', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'yinelenen id');
  const ui = readFileSync(new URL('../ui.js', import.meta.url), 'utf8');
  for (const [, id] of ui.matchAll(/\$\('([^']+)'\)/g)) assert.ok(ids.includes(id), `ui.js #${id} bulunamadı`);
  const versions = new Set();
  for (const file of ['index.html', 'ui.js', 'game.js', 'levels.js', 'interpreter.js']) {
    const text = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    for (const [, v] of text.matchAll(/\?v=([\w-]+)/g)) versions.add(v);
  }
  assert.equal(versions.size, 1, `farklı sürüm sorguları: ${[...versions].join(', ')}`);
});
