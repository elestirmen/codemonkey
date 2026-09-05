// Designed puzzle families, with solutions baked using the actual game rules.
// This tool does not run in the browser. Rebuild with npm run missions.
import { writeFileSync } from 'node:fs';
import { commandsForLevel, encodeActions, planLevelRoute } from '../game.js';

const authored = [];
const branch = (condition, then, otherwise) => ({ type: 'branch', condition, then, otherwise });
const loop = (count, body) => ({ type: 'loop', count, body });
const untilGoal = body => ({ type: 'while', condition: 'hedefteDegilim', body });
const rightRule = branch('onumdeKayaVar', ['sagaDon'], ['ilerle']);
const leftRule = branch('onumdeKayaVar', ['solaDon'], ['ilerle']);
const tideRule = branch('onumdeKayaVar', ['sagaDon'], [
  branch('onumdeGuvenliYolVar', ['ilerle'], ['bekle'])
]);

function corridor(segments, { tiles = [], fill = '#', startDir = 'RIGHT' } = {}) {
  let x = 0, y = 0;
  const path = [{ x, y }];
  for (const [dx, dy, count] of segments) {
    for (let n = 0; n < count; n++) { x += dx; y += dy; path.push({ x, y }); }
  }
  const minX = Math.min(...path.map(p => p.x));
  const minY = Math.min(...path.map(p => p.y));
  const width = Math.max(...path.map(p => p.x)) - minX + 3;
  const height = Math.max(...path.map(p => p.y)) - minY + 3;
  const grid = Array.from({ length: height }, () => Array(width).fill(fill));
  const cells = path.map(p => ({ x: p.x - minX + 1, y: p.y - minY + 1 }));
  cells.forEach(p => { grid[p.y][p.x] = '.'; });
  for (const [index, tile] of tiles) {
    const p = cells[index];
    if (!p || index === 0 || index === cells.length - 1) throw new Error('Invalid tile position');
    grid[p.y][p.x] = tile;
  }
  grid[cells[0].y][cells[0].x] = 'M';
  grid[cells.at(-1).y][cells.at(-1).x] = 'S';
  return { grid: grid.map(row => row.join('')), startDir };
}

function add(id, title, board, { skill, lesson, hints, solution, concept = 'efficient', scenarios = [] }) {
  const level = {
    id, title: `${id}. ${title}`, ...board,
    authored: true, revision: 'expedition-1',
    kind: id % 20 === 0 ? 'finale' : id % 20 >= 17 ? 'challenge' : 'practice',
    skill, instructions: lesson, tip: hints[0], hints,
    mastery: { concept, label: concept === 'while' ? 'Koşullu döngüyle tüm parkurları hedef satırda çöz.'
      : concept === 'branch' ? 'Karar yapısı kullanarak tüm parkurları hedef satırda çöz.'
        : concept === 'loop' ? 'Tekrar eden kalıbı döngüye al ve hedef satıra ulaş.'
          : 'Tüm hedefleri topla ve üç yıldızlık satır hedefini tuttur.' },
    ...(scenarios.length ? { scenarios } : {})
  };
  if (!solution) {
    const route = planLevelRoute({ ...level, allowedCommands: commandsForLevel(id) });
    if (!route) throw new Error(`Unsolvable authored level ${id}`);
    solution = encodeActions(route, { allowLoops: true, allowCompact: true }).blocks;
  }
  level.solution = solution;
  authored.push(level);
}

const bridgeNames = ['İkili Kemer', 'Basamak Senfonisi', 'Geri Vites', 'Üç İskele', 'Aynı Motif',
  'Köprü Dokumacısı', 'Dönüş Atölyesi', 'Kayıp Basamak', 'Dört Kıyı', 'Nehir Mühendisi', 'Kemerlerin Muhafızı'];
for (let i = 0; i < bridgeNames.length; i++) {
  const id = 30 + i;
  const stairs = i % 3 === 1;
  const reach = 6 + Math.floor(i / 3);
  const segments = stairs
    ? Array.from({ length: i > 5 ? 4 : 3 }, () => [[1, 0, i % 2 ? 2 : 3], [0, 1, 2]]).flat()
    : [[1, 0, reach], [0, 1, id === 35 ? 3 : 2], [-1, 0, reach], [0, 1, 2], [1, 0, reach]];
  let board = corridor(segments, { fill: '~', tiles: [[2, 'B'], [4, '='], [7, 'B'], [10, '=']] });
  let solution;
  const backwards = id === 32 || id === 38;
  if (backwards) {
    const count = id === 32 ? 3 : 4;
    const width = count * 2 + 5;
    const rows = Array.from({ length: 6 }, () => Array(width).fill('~'));
    for (let x = 1; x < width - 1; x++) rows[4][x] = '=';
    for (let n = 1; n <= count; n++) {
      const x = 1 + n * 2;
      rows[1][x] = 'B'; rows[2][x] = '.'; rows[3][x] = '.';
    }
    rows[4][1] = 'M'; rows[4][width - 2] = 'S';
    board = { grid: rows.map(row => row.join('')), startDir: 'RIGHT' };
    solution = [loop(count, [
      { type: 'compact', action: 'ilerle', count: 2 }, 'solaDon',
      { type: 'compact', action: 'ilerle', count: 3 },
      { type: 'compact', action: 'geriGit', count: 3 }, 'sagaDon'
    ]), { type: 'compact', action: 'ilerle', count: 2 }];
  }
  // Rock banks make the designed crossing boundaries unambiguous.
  board.grid = board.grid.map((row, y, rows) => y === 0 || y === rows.length - 1
    ? '#'.repeat(row.length) : `#${row.slice(1, -1)}#`);
  add(id, bridgeNames[i], board, {
    skill: backwards ? 'Geri adım & döngü' : stairs ? 'Kalıp tanıma' : 'Döngü tasarımı',
    lesson: backwards ? 'Her iskeleye gir, muzu al ve geri geri ana köprüye dön. adimla(-3) yönünü değiştirmeden üç kare geri yürütür. Aynı işi her iskelede tekrarla.'
      : stairs ? 'Aynı basamak motifi birkaç kez tekrarlanıyor. Köprülerden geç, muzları topla ve bir motifi döngüye dönüştür.'
      : 'Nehir üç kıyıya ayrılmış. Gidiş ve dönüşteki benzerliği bul; düz parçaları ve dönüşleri birlikte kısalt.',
    hints: ['Yolun tamamına değil, tekrar eden en küçük parçaya bak.',
      backwards ? 'İskelede üç kare ilerle, adimla(-3) ile geri çık. Böylece iki kez dönmen gerekmez.'
        : stairs ? `Bir motif: ${i % 2 ? 'iki' : 'üç'} kare doğuya, iki kare güneye. Her motifin sonunda doğuya dön.` : 'İlk kıyıda sağa, ikinci kıyıda sola dönersin. İki kıyıyı birlikte düşün.',
      'Önce tek motifi adım modunda doğrula; ardından tekrarla(N) içine al. Son dönüş gerekmeyebilir.'],
    solution, concept: backwards ? 'loop' : 'efficient'
  });
}

const keyNames = ['Önce Anahtar', 'Tek Yönlü Ada', 'Kilitli İskele', 'Yaprak Kararı', 'İki Hazinenin Sırrı',
  'Dönüşü Olmayan Yol', 'Anahtarın Bedeli', 'Son Güvenli Kıyı', 'Bataklık Stratejisi', 'Üç Aşamalı Plan', 'Kayıp Mühür', 'Nilüfer Tapınağı'];
for (let i = 0; i < keyNames.length; i++) {
  let board;
  if (i % 3 === 0) {
    // A key off the main route and a real gate cut: walking straight cannot win.
    board = { startDir: 'RIGHT', grid: [
      '#############', '#..K.#......#', '#....#..B...#', '#M...G.L..S.#',
      '#....#~#~#~##', '#.B..#~~~~~~#', '#############'
    ] };
  } else if (i % 3 === 1) {
    // Collect the side treasure before crossing the one-use leaf.
    board = { startDir: 'RIGHT', grid: [
      '#############', '#B..#...K...#', '#.#.#.#####.#', '#M..L....G.S#',
      '###~#~#######', '#############'
    ] };
  } else {
    board = corridor([[1, 0, 8], [0, 1, 2], [-1, 0, 8], [0, 1, 2], [1, 0, 8]], {
      fill: '~', tiles: [[2, 'K'], [4, 'G'], [6, 'L'], [8, 'B'], [12, 'L'], [14, 'B'], [19, 'L'], [22, 'B'], ...(i >= 6 ? [[3, 'K'], [16, 'B'], [24, 'G']] : [])]
    });
  }
  // Rotate the whole puzzle; this changes the reading direction, not its rules.
  if (i >= 3 && i < 6 || i >= 9) {
    board.grid = board.grid.map(row => [...row].reverse().join('')).reverse();
    board.startDir = 'LEFT';
  }
  // Later variants add a second collection decision, not empty board area.
  if (i >= 6 && i % 3 !== 2) {
    const rows = board.grid.map(row => [...row]);
    const y = rows.findIndex(row => row.filter(c => c === '.').length >= 4);
    const x = rows[y].findIndex(c => c === '.');
    rows[y][x] = 'B';
    board.grid = rows.map(row => row.join(''));
  }
  add(49 + i, keyNames[i], board, {
    skill: i % 3 === 0 ? 'Öncelik & rota' : 'Geri dönülmez kararlar',
    lesson: i % 3 === 0 ? 'Sandık kilitli geçidin ardında. Önce yan adadaki muzu ve anahtarı al; sonra kapıdan geç.'
      : 'Yaprak arkanı kapatır. Ayrıldığın adada muz bırakmadan anahtarı al ve sandığa ulaş.',
    hints: ['Sandıktan geriye doğru düşün: son geçişten önce cebinde neler olmalı?',
      'Bir nilüferden ayrılınca o kare suya dönüşür. Yan yoldaki hedefleri geçişten önce topla.',
      'Rotanı üç parçaya ayır: ilk adayı temizle → anahtarı al → kapı ve sandık. Her parçayı adım modunda dene.']
  });
}

const tideNames = ['Kıyıda Bekle', 'İki Farklı Ritim', 'Dalgaların Saati', 'Güvenli Mola', 'Üç Kabuk',
  'Gelgit Rotası', 'Zamanı Kısalt', 'Kıyıdan Kabuğa', 'Sessiz Akıntı', 'Son Zaman Penceresi', 'Gelgit Muhafızı'];
for (let i = 0; i < tideNames.length; i++) {
  const width = 6 + i;
  const tiles = [[2, 'T'], [width, 'B'], [width + 4, 'T'], [width * 2 + 2, 'B']];
  if (i >= 4) tiles.push([width * 2 + 6, 'T']);
  if (i >= 8) tiles.push([1, 'K'], [width * 2 + 5, 'G']);
  const board = corridor([[1, 0, width], [0, 1, 2], [-1, 0, width], [0, 1, 2], [1, 0, width]], { tiles });
  add(70 + i, tideNames[i], board, {
    skill: i >= 8 ? 'Zamanlama & planlama' : 'Zamanlama',
    lesson: 'Her kabuk zorunlu bir geçit. Güvenli kıyıda bekle, kaplumbağayı tek hamlede geç ve tüm muzları sandığa taşı.',
    hints: ['Her hareket, dönüş ve bekleme zamanı bir artırır. Ekrandaki gelgit göstergesini izle.',
      'Birinci kaplumbağaya 4’ün katı zamanında bas; ikinci kaplumbağanın ritmi iki vuruş kayıktır.',
      'Kabuğa çıkış ve hemen sonraki kıyıya iniş art arda olmalı. Dönüşü veya beklemeyi kıyıda yap.']
  });
}

// Closed rectangular patrols share a concept, but vary dimensions and hazards.
function patrol(w, h, { left = false, tide = false, key = false, leaf = false } = {}) {
  const sign = left ? -1 : 1;
  const tiles = [[w, 'B'], [w + h, 'B'], [w * 2 + h, 'B']];
  if (tide) tiles.push([2, 'T'], [w + h + 2, 'T']);
  if (key) tiles.push([1, 'K'], [w + 2, 'G']);
  if (leaf) tiles.push([w + 1, 'L']);
  return corridor([[1, 0, w], [0, sign, h], [-1, 0, w], [0, -sign, h - 1]], { tiles });
}

function spiral(lengths, { left = false, tide = false, key = false, leaf = false } = {}) {
  const directions = left ? [[1, 0], [0, -1], [-1, 0], [0, 1]] : [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const segments = lengths.map((length, i) => [...directions[i % 4], length]);
  let distance = 0;
  const tiles = [];
  lengths.slice(0, -1).forEach(length => { distance += length; tiles.push([distance, 'B']); });
  if (tide) tiles.push([2, 'T'], [lengths[0] + lengths[1] + 2, 'T']);
  if (key) tiles.push([1, 'K'], [lengths[0] + 2, 'G']);
  if (leaf) tiles.push([lengths[0] + 1, 'L']);
  return corridor(segments, { tiles });
}

const decisionNames = ['Karar Veren Kod', 'Başka Ada, Aynı Kod', 'Sol El Kuralı', 'Değişen Duvarlar',
  'Güvenli Adım Sensörü', 'İç İçe Kararlar', 'Gelgiti Okumak', 'Anahtarlı Devriye', 'Üç Ada Deneyi', 'Karar Laboratuvarı',
  'Hedefe Kadar', 'Mesafeden Bağımsız', 'Koşullu Sol Rota', 'Bekleyen Algoritma', 'Yaprağın Ötesi',
  'Uyarlanan Devriye', 'Dört Mevsim Testi', 'Tapınak Provası', 'Son Keşif', 'Algoritma Tapınağı'];
for (let i = 0; i < 20; i++) {
  const id = 81 + i;
  const dynamic = id >= 91;
  const left = [83, 84, 93].includes(id);
  const tide = [85, 86, 87, 90, 94, 96, 97, 98, 99, 100].includes(id);
  const key = [88, 90, 95, 98, 99, 100].includes(id);
  const leaf = [89, 95, 98, 100].includes(id);
  const options = { left, tide, key, leaf };
  const dimensions = dynamic ? [[6, 4], [8, 3], [5, 6], [9, 5]] : [[6, 4], [7, 3], [5, 5]];
  const boards = dimensions.slice(0, id >= 97 ? 4 : id >= 89 ? 3 : id >= 82 ? 2 : 1).map(([w, h]) => patrol(w, h, options));
  if (id === 82) { boards[0] = patrol(7, 3, options); boards[1] = patrol(6, 4, options); }
  if (id === 84) boards[0] = spiral([6, 4, 4, 2, 2], options);
  if (id === 86) boards[0] = spiral([8, 4, 6, 2, 4], options);
  if (id === 87) boards[0] = spiral([7, 5, 5, 3, 3], options);
  if (id === 92 || id === 93 || id === 99) boards[0] = spiral([7, 5, 5, 3, 3], options);
  if (id === 94 || id === 98) boards[0] = patrol(8, 4, options);
  if (id === 96 || id === 100) boards[0] = spiral([10, 6, 8, 4, 6, 2, 4], options);
  if (id === 97) boards[0] = patrol(7, 6, options);
  // Revisit the rule in genuinely different geometry: a U, a spiral, and a
  // deep temple spiral. Only the behavior transfers, not a memorized route.
  if (!dynamic && !tide && id >= 83) boards[1] = spiral([6, 4, 4, 2, 2], options);
  if (!dynamic && tide && id >= 86) boards[1] = spiral([8, 4, 6, 2, 4], options);
  if (dynamic && id >= 92) boards[1] = spiral([8, 4, 6, 2, 4], options);
  if (dynamic && id >= 95) boards[2] = spiral([10, 6, 8, 4, 6, 2, 4], options);
  if (id >= 98) boards[3] = spiral([12, 8, 10, 6, 8, 4, 6, 2, 4], options);
  const seenBoards = new Set();
  boards.forEach((board, index) => {
    if (seenBoards.has(board.grid.join('\n'))) boards[index] = patrol(4, 6, options);
    seenBoards.add(boards[index].grid.join('\n'));
  });
  const rule = tide ? tideRule : left ? leftRule : rightRule;
  // Fixed-loop lessons use equal perimeter lengths. With tides, count actual
  // waits from the planner and append harmless goal turns to equalize runs.
  let solution;
  if (dynamic) solution = [untilGoal([rule])];
  else if (tide) {
    // The outer condition lets an arrived patrol idle safely while the others
    // finish their different tide schedules, introducing nested decisions.
    solution = [loop(40, [branch('hedefteDegilim', [rule])])];
  } else solution = [loop(22, [rule])]; // 2w + 2h - 1 moves + 3 turns
  add(id, decisionNames[i], boards[0], {
    skill: dynamic ? 'Koşullu döngüler' : tide ? 'İç içe koşullar' : 'Koşullar',
    lesson: id === 100 ? 'Son muhafız seni dört farklı parkurda sınar. Anahtarları al, yaprakları geç ve gelgiti oku. Tek algoritma, dört sandık: adım saymadan hepsine ulaş.'
      : id === 91 ? 'Yeni komut: <code>iken(hedefteDegilim())</code>. Hedefe varana kadar karar ver. Aynı program farklı uzunluktaki tüm parkurları geçmeli.'
      : dynamic ? `${leaf ? 'Nilüferler arkanı kapatırken' : tide ? 'Kaplumbağaların ritmi değişirken' : 'Kıyı rotası iç içe sarmallara dönüşürken'} algoritmanı hedefine ulaştır. <code>iken(hedefteDegilim())</code> ile adım saymadan tüm parkurları geç.`
      : tide ? '<code>onumdeGuvenliYolVar()</code> sonraki adımda da güvenli kalacak yolu algılar. Kaya varsa dön, yol güvenliyse ilerle, aksi halde kıyıda bekle. Aynı kod tüm parkurlarda çalışmalı.'
        : `Önünde kaya varsa ${left ? 'sola' : 'sağa'} dön; yoksa ilerle. Tek karar döngüsünü kullanarak tüm muzları topla. ${boards.length > 1 ? 'Kodun aşağıdaki bütün parkurlarda sınanacak.' : ''}`,
    hints: dynamic ? ['Kaç adım gerektiğini saymak yerine ne zaman duracağını söyle.',
      tide ? 'Dış döngü hedefi, iç koşul kayayı, ikinci koşul güvenli adımı kontrol eder.' : `iken(hedefteDegilim()) içine kaya kontrolü koy; kaya varsa ${left ? 'solaDon()' : 'sagaDon()'}, yoksa ilerle().`,
      'Parkur sekmelerinden haritaları karşılaştır. Döngünün içine sabit bir uzunluk yazarsan diğer haritada başarısız olabilir.']
      : tide ? ['Bir engelin türüne göre farklı kararlar vermelisin: kaya için dön, su için bekle.',
        'Dışta tekrarla(40), içinde ise(hedefteDegilim()) kullan. Böylece erken varan parkurda hareket durur.',
        'Kaya yoksa onumdeGuvenliYolVar() ile kontrol et: doğruysa ilerle(), yanlışsa bekle().']
        : ['Dönüş yerlerini ezberleme. Her turda Mojo’nun önünü kontrol et.',
          `ise(onumdeKayaVar()) doğruysa ${left ? 'solaDon()' : 'sagaDon()'}; degilse ilerle().`,
          'Dönüşler de birer turdur. Bu devriye için karar kalıbını 22 kez çalıştır.'],
    solution, scenarios: boards.slice(1), concept: dynamic ? 'while' : 'branch'
  });
}

writeFileSync(new URL('../authored-levels.js', import.meta.url),
  `// Generated by tools/author-missions.mjs. Designed arcs; verified by npm test.\nexport const AUTHORED_LEVELS = ${JSON.stringify(authored, null, 2)};\n`);
console.log(`${authored.length} designed missions, ${authored.reduce((n, l) => n + (l.scenarios?.length || 0), 0)} additional scenario boards.`);
