// Level generator — a build-time tool, not part of the shipped game.
//
// The generated missions used to be built on every page load, which cost about
// three seconds of blocking work before the first frame. Generation is fully
// deterministic (seeded per level id), so nothing is lost by baking the result
// into `generated-levels.js` instead. Regenerate with:
//
//   npm run levels
//
// The tool imports the planner and the encoder from the game itself, so a
// generated mission is validated against exactly the rules the engine enforces.

import { writeFileSync } from 'node:fs';

import {
  CHAPTER_SIZE,
  LEVELS,
  LEVEL_COUNT,
  commandsForLevel,
  encodeActions,
  getLevelGroup,
  planLevelRoute
} from '../game.js';

function makeRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return function next() {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// ── Procedural mission generator ────────────────────────────────────────────
// Names are indexed by the mission's position inside its chapter, so a chapter
// can never ship two missions with the same name.

const GENERATED_TITLES = {
  2: [
    'Köprü Nöbeti', 'Dörtlü Tekrar', 'Nehir Kıyısı', 'Sarmal Geçit',
    'Tahta Köprü', 'Akıntıya Karşı', 'Zincir Adımlar', 'Kıvrımlı Dere',
    'Çifte Tur', 'İkiz Kemer', 'Sal İskelesi', 'Menderes Yolu',
    'Yankılı Kalıp', 'Suyun Üstünde', 'Halka Rotası', 'Tekrar Nehri',
    'Kemerli Geçiş', 'Salkım Köprü', 'Döngü Vadisi', 'Kıyıdan Kıyıya'
  ],
  3: [
    'Paslı Kilit', 'Nilüfer Sıçraması', 'Bronz Anahtar', 'Batan Yaprak',
    'Kapının Ardında', 'Yaprak Basamakları', 'Gizli Menteşe', 'Su Zambağı',
    'Anahtar Deliği', 'Çürük Yaprak', 'Kilit Ustası', 'Yeşil Kapı',
    'Sırlı Sürgü', 'Kaygan Yaprak', 'Demir Kanat', 'Nilüfer Halkası',
    'Anahtar İzi', 'Son Yaprak', 'Kilitli Koru', 'Bataklık Kapısı'
  ],
  4: [
    'Kaplumbağa Nöbeti', 'Dalga Ritmi', 'Sabırlı Adım', 'Nefes Molası',
    'Kabuklu Geçit', 'Zaman Penceresi', 'Dalış Sayacı', 'Bekleyiş Kıyısı',
    'Metronom Nehri', 'Yavaş Akıntı', 'Kabuk Köprüsü', 'Zamanlı Sıçrayış',
    'Ritim Vadisi', 'Dalgıç Kaplumbağa', 'Saniye Şansı', 'Sakin Su',
    'Tempo Geçidi', 'Nabız Nehri', 'Bekleme Odası', 'Son Dalış'
  ],
  5: [
    'Usta Sınavı', 'Karma Arazi', 'Büyük Geçit', 'Zirve Rotası',
    'Algoritma Kapısı', 'Son Nehir', 'Kırık Pusula', 'Uzun Sefer',
    'Gizli Vadi', 'Dört Element', 'Efsane Patika', 'Kayıp Ada',
    'Fırtına Öncesi', 'Yıldız Avı', 'Muz Diyarı', 'Ejder Sırtı',
    'Son Kalıp', 'Ustalık Turu', 'Şafak Rotası', 'Mojo Zaferi'
  ]
};

const GENERATED_INSTRUCTIONS = {
  2: [
    'Nehri köprüden (<code>=</code>) geç ve tekrar eden düz parçaları <code>tekrarla(N)</code> ile kısalt.',
    'Uzun düzlükleri <code>adimla(N)</code> ile tek satıra indir, dönüş kalıplarını döngüye al.',
    'Köprüye doğru rotayı planla; aynı hareketi üst üste yazmak yerine döngü kullan.'
  ],
  3: [
    'Kilitli kapıyı (<code>G</code>) açmak için önce anahtarı (<code>K</code>) al, sonra kapıya yönel.',
    'Nilüfer yaprakları (<code>L</code>) bir kez basıldıktan sonra batar. Geri dönüşü olmayan rotayı önceden çiz.',
    'Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.'
  ],
  4: [
    'Kaplumbağalar (<code>T</code>) iki adım suda, iki adım havada. <code>bekle()</code> ile doğru anı yakala.',
    'Adımlarını say: kaplumbağa daldığı anda üzerine basarsan Mojo suya düşer.',
    'Zamanlamayı kur; gerekirse kıyıda <code>bekle()</code> yazıp ritmi tuttur.'
  ],
  5: [
    'Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.',
    'Bu final parkurunda uzun düzlükler için <code>adimla(N)</code>, kalıplar için <code>tekrarla(N)</code> kullan.',
    'Ustalık sınavı: anahtar, zamanlama ve döngüleri aynı programda birleştir.'
  ]
};

const GENERATED_TIPS = {
  2: [
    'Köprüler (<code>=</code>) nehirlerin üzerinden güvenli geçiş sağlar.',
    '<code>ilerle()</code> satırını üç kez yazmak yerine <code>adimla(3)</code> yaz.',
    'Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.'
  ],
  3: [
    'Anahtarı almadan kapı açılmaz; rotanı anahtar üzerinden kur.',
    'Nilüfer yaprağı bir kez taşır. Aynı yaprağa dönmek zorunda kalmayacağın rotayı seç.',
    'Cetvel butonuyla anahtar ve kapı arasındaki mesafeyi ölçebilirsin.'
  ],
  4: [
    'Kaplumbağa her 2 adımda bir dalar. Adım adım çalıştırarak ritmi izle.',
    'Dönüş ve <code>bekle()</code> de birer adım harcar; sayacı buna göre tut.',
    'Kaplumbağanın üzerinde dururken dönüş yaparsan o adımda dalabilir; dikkat et.'
  ],
  5: [
    'Rotayı önce kâğıtta bölümlere ayır: köprü, anahtar, zamanlama.',
    'Adım adım çalıştırma ve geri alma butonlarıyla kritik anları incele.',
    'Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.'
  ]
};

// Chapter 1 is fully handcrafted, so it needs no generated copy.
const CHAPTER_1_FALLBACK = {
  title: 'Ek Alıştırma',
  instructions: 'Sıralı komutlarla hedefe ulaş: ilerle, gerektiğinde dön.',
  tip: 'Cetvel butonuyla kaç adım gideceğini ölçebilirsin.'
};

function pickFromPool(pool, index, fallback) {
  if (!pool || pool.length === 0) return fallback;
  return pool[index % pool.length];
}

// Board size grows across a chapter so the first generated mission is not as
// dense as the last one.
function boardSizeFor(group, position) {
  const progress = position / (CHAPTER_SIZE - 1);
  const width = Math.round(13 + progress * 7) + (group >= 4 ? 1 : 0);
  const height = Math.round(8 + progress * 4);
  return {
    width: Math.min(20, Math.max(11, width)),
    height: Math.min(12, Math.max(7, height))
  };
}

function difficultyFor(group, position) {
  const progress = position / (CHAPTER_SIZE - 1);
  return {
    // Minimum command count the shortest route must need, so no generated
    // mission is a two-liner in a late chapter slot.
    minSteps: Math.round(10 + progress * 10) + (group - 2) * 2,
    // Minimum length of the reference *program*. Without this a large board
    // can still collapse into five lines, which makes a late mission feel
    // easier than an early one even though the route is long.
    minPar: Math.round(6 + progress * 5) + Math.max(0, group - 3),
    bananas: 2 + Math.round(progress * 2),
    obstacleDensity: 0.09 + progress * 0.07 + (group >= 4 ? 0.03 : 0),
    waterDensity: group === 1 ? 0 : 0.02 + progress * 0.05
  };
}

function placeSpecialElements(grid, pathCells, group, rand, bounds) {
  const { minX, maxX, minY, maxY } = bounds;
  const onPath = new Set(pathCells.map(cell => `${cell.x},${cell.y}`));

  const bandAround = (cell, index) => {
    const prev = pathCells[index - 1];
    const next = pathCells[index + 1];
    const horizontal = prev && next ? prev.y === next.y : true;
    const sides = horizontal
      ? [{ x: cell.x, y: cell.y - 1 }, { x: cell.x, y: cell.y + 1 }]
      : [{ x: cell.x - 1, y: cell.y }, { x: cell.x + 1, y: cell.y }];
    for (const side of sides) {
      if (side.x < minX || side.x > maxX || side.y < minY || side.y > maxY) continue;
      if (onPath.has(`${side.x},${side.y}`)) continue;
      if (grid[side.y][side.x] === '.') grid[side.y][side.x] = '~';
    }
  };

  const placeAt = (fraction, spread, char, decorate) => {
    const base = Math.floor(pathCells.length * fraction);
    const index = base + Math.floor(rand() * Math.max(1, pathCells.length * spread));
    if (index <= 2 || index >= pathCells.length - 2) return false;
    const cell = pathCells[index];
    if (grid[cell.y][cell.x] !== '.') return false;
    grid[cell.y][cell.x] = char;
    if (decorate) decorate(cell, index);
    return true;
  };

  if (group === 2) {
    placeAt(0.4, 0.2, '=', bandAround);
  } else if (group === 3) {
    // Two to four stepping stones that sink behind Mojo.
    const start = Math.floor(pathCells.length * 0.3);
    const count = 2 + Math.floor(rand() * 3);
    for (let offset = 0; offset < count; offset++) {
      const index = start + offset;
      if (index <= 2 || index >= pathCells.length - 2) continue;
      const cell = pathCells[index];
      if (grid[cell.y][cell.x] !== '.') continue;
      grid[cell.y][cell.x] = 'L';
      for (const side of [
        { x: cell.x - 1, y: cell.y }, { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y - 1 }, { x: cell.x, y: cell.y + 1 }
      ]) {
        if (side.x < minX || side.x > maxX || side.y < minY || side.y > maxY) continue;
        if (onPath.has(`${side.x},${side.y}`)) continue;
        if (grid[side.y][side.x] === '.') grid[side.y][side.x] = '~';
      }
    }
  } else if (group === 4) {
    placeAt(0.4, 0.2, 'T', bandAround);
    placeAt(0.7, 0.15, 'T', bandAround);
  } else if (group === 5) {
    placeAt(0.2, 0.15, '=', bandAround);
    placeAt(0.5, 0.15, 'T', bandAround);
    placeAt(0.75, 0.12, 'L', bandAround);
  }
}

function tryGenerateLevel(id, group, rand) {
  const position = (id - 1) % CHAPTER_SIZE;
  const { width, height } = boardSizeFor(group, position);
  const tuning = difficultyFor(group, position);

  const grid = [];
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width).fill('.'));
  }
  for (let x = 0; x < width; x++) {
    grid[0][x] = '#';
    grid[height - 1][x] = '#';
  }
  for (let y = 0; y < height; y++) {
    grid[y][0] = '#';
    grid[y][width - 1] = '#';
  }

  const bounds = { minX: 2, maxX: width - 3, minY: 2, maxY: height - 3 };
  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;

  const startDir = ['RIGHT', 'DOWN', 'LEFT', 'UP'][Math.floor(rand() * 4)];

  const startX = bounds.minX + Math.floor(rand() * Math.max(1, Math.floor(spanX * 0.25)));
  const startY = bounds.minY + Math.floor(rand() * Math.max(1, spanY + 1));
  grid[startY][startX] = 'M';

  const starX = bounds.maxX - Math.floor(rand() * Math.max(1, Math.floor(spanX * 0.25)));
  const starY = bounds.minY + Math.floor(rand() * Math.max(1, spanY + 1));
  if (grid[starY][starX] !== '.') return null;
  grid[starY][starX] = 'S';

  // Random walk biased toward the goal carves the guaranteed route.
  let cx = startX;
  let cy = startY;
  const pathCells = [{ x: cx, y: cy }];
  const visitedPath = new Set([`${cx},${cy}`]);

  for (let step = 0; step < 160 && (cx !== starX || cy !== starY); step++) {
    const neighbours = [];
    for (const delta of [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }]) {
      const nx = cx + delta.dx;
      const ny = cy + delta.dy;
      if (nx < bounds.minX || nx > bounds.maxX || ny < bounds.minY || ny > bounds.maxY) continue;
      let weight = 1;
      if (Math.sign(starX - cx) === delta.dx) weight += 3;
      if (Math.sign(starY - cy) === delta.dy) weight += 3;
      neighbours.push({ x: nx, y: ny, weight });
    }
    if (neighbours.length === 0) break;

    const total = neighbours.reduce((sum, n) => sum + n.weight, 0);
    let roll = rand() * total;
    let chosen = neighbours[neighbours.length - 1];
    for (const neighbour of neighbours) {
      roll -= neighbour.weight;
      if (roll <= 0) {
        chosen = neighbour;
        break;
      }
    }

    cx = chosen.x;
    cy = chosen.y;
    if (!visitedPath.has(`${cx},${cy}`)) {
      pathCells.push({ x: cx, y: cy });
      visitedPath.add(`${cx},${cy}`);
    }
  }

  if (cx !== starX || cy !== starY) return null;

  // A key/gate pair for the chapters that teach it.
  const wantsKeyGate = group === 3 || group === 5;
  if (wantsKeyGate) {
    const gateIndex = Math.floor(pathCells.length * 0.55) + Math.floor(rand() * Math.max(1, pathCells.length * 0.25));
    const gateCell = pathCells[Math.min(pathCells.length - 2, Math.max(2, gateIndex))];
    if (grid[gateCell.y][gateCell.x] !== '.') return null;
    grid[gateCell.y][gateCell.x] = 'G';

    let placed = false;
    for (let attempt = 0; attempt < 120 && !placed; attempt++) {
      const keyX = bounds.minX + Math.floor(rand() * (spanX + 1));
      const keyY = bounds.minY + Math.floor(rand() * (spanY + 1));
      if (grid[keyY][keyX] !== '.') continue;
      grid[keyY][keyX] = 'K';
      placed = true;

      // Carve a corridor from the start to the key so it is always reachable
      // before the gate.
      let kx = startX;
      let ky = startY;
      for (let step = 0; step < 120 && (kx !== keyX || ky !== keyY); step++) {
        const dx = Math.sign(keyX - kx);
        const dy = Math.sign(keyY - ky);
        if (dx !== 0 && (dy === 0 || rand() < 0.5)) kx += dx;
        else ky += dy;
        if (grid[ky][kx] === '.') {
          pathCells.push({ x: kx, y: ky });
          visitedPath.add(`${kx},${ky}`);
        }
      }
    }
    if (!placed) return null;
  }

  placeSpecialElements(grid, pathCells, group, rand, bounds);

  // Bananas go on plain path cells only.
  const free = pathCells.filter(cell => grid[cell.y][cell.x] === '.');
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  for (let i = 0; i < Math.min(tuning.bananas, free.length); i++) {
    grid[free[i].y][free[i].x] = 'B';
  }

  // Everything off the guaranteed route becomes scenery.
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] !== '.' || visitedPath.has(`${x},${y}`)) continue;
      const roll = rand();
      if (roll < tuning.waterDensity) grid[y][x] = '~';
      else if (roll < tuning.waterDensity + tuning.obstacleDensity) grid[y][x] = '#';
    }
  }

  const pool = group === 1 ? null : GENERATED_TITLES[group];
  const title = `${id}. ${pickFromPool(pool, position, CHAPTER_1_FALLBACK.title)}`;

  return {
    id,
    title,
    instructions: pickFromPool(GENERATED_INSTRUCTIONS[group], position + Math.floor(rand() * 3), CHAPTER_1_FALLBACK.instructions),
    tip: pickFromPool(GENERATED_TIPS[group], position + Math.floor(rand() * 3), CHAPTER_1_FALLBACK.tip),
    grid: grid.map(row => row.join('')),
    startDir,
    allowedCommands: commandsForLevel(id),
    generated: true,
    minSteps: tuning.minSteps,
    minPar: tuning.minPar
  };
}

// Every command unlock lives here, keyed by the mission that teaches it, so
// the level data, the validator and the command palette can never drift apart.

function generateFallbackLevel(id, group) {
  const position = (id - 1) % CHAPTER_SIZE;
  const { width, height } = boardSizeFor(group, position);
  const grid = [];
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width).fill('#'));
  }
  const row = Math.floor(height / 2);
  for (let x = 2; x <= width - 3; x++) grid[row][x] = '.';
  grid[row][2] = 'M';
  grid[row][width - 3] = 'S';
  grid[row][Math.floor(width / 2)] = 'B';

  return {
    id,
    title: `${id}. ${pickFromPool(GENERATED_TITLES[group], position, CHAPTER_1_FALLBACK.title)}`,
    instructions: 'Düz bir koridorda ilerleyerek muzu topla ve sandığa ulaş.',
    tip: 'Uzun düzlüğü tek satırda geçmek için döngü veya <code>adimla(N)</code> kullan.',
    grid: grid.map(line => line.join('')),
    startDir: 'RIGHT',
    allowedCommands: commandsForLevel(id),
    generated: true,
    minSteps: 6
  };
}

function generateProceduralLevel(id) {
  const group = getLevelGroup(id);
  const allowed = commandsForLevel(id);
  const encodeOptions = {
    allowLoops: allowed.includes('tekrarla'),
    allowCompact: allowed.includes('adimla')
  };
  let seed = id * 7919 + 13;
  let best = null;

  for (let attempt = 0; attempt < 900; attempt++) {
    const rand = makeRandom(seed);
    seed = (seed * 31 + 17) % 2147483647;

    const level = tryGenerateLevel(id, group, rand);
    if (!level) continue;

    // Validate with the same planner the game uses at runtime, so a generated
    // mission can never ship unsolvable or trivially short.
    const route = planLevelRoute(level);
    if (!route || route.length < level.minSteps) continue;

    const par = encodeActions(route, encodeOptions).lines;
    if (par >= level.minPar) {
      delete level.minSteps;
      delete level.minPar;
      return level;
    }

    // Keep the closest near-miss so a hard-to-satisfy slot still ships the
    // most demanding board found rather than the plain fallback corridor.
    if (!best || par > best.par) best = { level, par };
  }

  if (best) {
    delete best.level.minSteps;
    delete best.level.minPar;
    return best.level;
  }

  return generateFallbackLevel(id, group);
}

// ── Emit ────────────────────────────────────────────────────────────────────

// Only handcrafted missions claim a slot: the previously baked file is loaded
// through game.js, so counting those ids would regenerate nothing.
const takenIds = new Set(LEVELS.filter(level => !level.generated).map(level => level.id));
const generated = [];
for (let id = 1; id <= LEVEL_COUNT; id++) {
  if (takenIds.has(id)) continue;
  generated.push(generateProceduralLevel(id));
}

const serialize = level => {
  const rows = level.grid.map(row => `      ${JSON.stringify(row)}`).join(',\n');
  return [
    '  {',
    `    id: ${level.id},`,
    `    title: ${JSON.stringify(level.title)},`,
    `    instructions: ${JSON.stringify(level.instructions)},`,
    `    tip: ${JSON.stringify(level.tip)},`,
    '    grid: [',
    rows,
    '    ],',
    `    startDir: ${JSON.stringify(level.startDir)},`,
    '    generated: true',
    '  }'
  ].join('\n');
};

const banner = [
  '// GENERATED FILE — do not edit by hand.',
  '//',
  `// Produced by tools/generate-levels.mjs (${generated.length} missions).`,
  '// Every board here was validated with the game\'s own route planner: it is',
  '// solvable, its shortest route meets the chapter\'s step floor and its',
  '// reference program meets the chapter\'s line floor. Run `npm run levels` to',
  '// rebuild after changing the generator.',
  '',
  'export const GENERATED_LEVELS = ['
].join('\n');

const output = `${banner}\n${generated.map(serialize).join(',\n')}\n];\n`;
writeFileSync(new URL('../generated-levels.js', import.meta.url), output, 'utf8');

const summary = new Map();
for (const level of generated) {
  const group = getLevelGroup(level.id);
  const route = planLevelRoute({ ...level, allowedCommands: commandsForLevel(level.id, level) });
  const allowed = commandsForLevel(level.id, level);
  const par = encodeActions(route, {
    allowLoops: allowed.includes('tekrarla'),
    allowCompact: allowed.includes('adimla')
  }).lines;
  if (!summary.has(group)) summary.set(group, []);
  summary.get(group).push({ steps: route.length, par });
}

console.log(`generated-levels.js yazildi — ${generated.length} gorev`);
for (const [group, rows] of [...summary.entries()].sort((a, b) => a[0] - b[0])) {
  const steps = rows.map(row => row.steps);
  const pars = rows.map(row => row.par);
  console.log(
    `  bolum ${group}: ${rows.length} gorev | adim ${Math.min(...steps)}-${Math.max(...steps)} | par ${Math.min(...pars)}-${Math.max(...pars)}`
  );
}
