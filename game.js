import { soundEngine } from './audio.js';

// Level definitions with increasing difficulty
export const LEVELS = [
  {
    id: 1,
    title: "1. İlk Adım",
    instructions: "Mojo algoritma adasına yeni geldi. Hedef sandığa ulaşmak için her karede bir kez <code>ilerle()</code> yaz.",
    tip: "Her <code>ilerle()</code> Mojo'yu baktığı yönde tam 1 kare hareket ettirir.",
    grid: [
      "#######",
      "#M...S#",
      "#######"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle"],
    starRating: { three: 4, two: 5 }
  },
  {
    id: 2,
    title: "2. Temasla Topla",
    instructions: "Yolda bir muz var. Artık ayrı bir <code>muzAl()</code> komutu yok; Mojo muzun olduğu kareye değince muz otomatik toplanır.",
    tip: "Sadece hedefe doğru ilerle. Muz toplama işi oyun motorunun sorumluluğunda.",
    grid: [
      "#######",
      "#M.B.S#",
      "#######"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle"],
    starRating: { three: 4, two: 5 }
  },
  {
    id: 3,
    title: "3. Sağa Dönüş",
    instructions: "Yol aşağı kıvrılıyor. Sağa dönmek için <code>sagaDon()</code> kullan; muzun üstünden geçersen otomatik toplanır.",
    tip: "Mojo'yu sağa döndürdükten sonra tekrar <code>ilerle()</code> demelisin.",
    grid: [
      "######",
      "#M...#",
      "####B#",
      "####S#",
      "######"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "sagaDon"],
    starRating: { three: 6, two: 8 }
  },
  {
    id: 4,
    title: "4. Sola Dönüş",
    instructions: "Bu kez sandık yukarıda. Sola dönmek için <code>solaDon()</code> komutunu kullan ve yolu takip et.",
    tip: "Sola dönüş komutu karakteri saat yönünün tersine 90 derece döndürür.",
    grid: [
      "#######",
      "#..S###",
      "#..B###",
      "#M..###",
      "#######"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon"],
    starRating: { three: 6, two: 8 }
  },
  {
    id: 5,
    title: "5. Su Engeli",
    instructions: "Suya basarsan algoritma durur. Sağa ve sola dönüşleri birleştirerek güvenli yolu çiz.",
    tip: "Önce iki kare ilerle, sonra aşağı inen güvenli koridora dön.",
    grid: [
      "########",
      "#M..~..#",
      "###.##.#",
      "#..B.S.#",
      "########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon"],
    starRating: { three: 9, two: 11 }
  },
  {
    id: 6,
    title: "6. Tekrarlamanın Gücü",
    instructions: "Uzun düz yolda aynı komutu tekrar tekrar yazmak yerine döngü kullan: <br><code>tekrarla(6) {<br>&nbsp;&nbsp;ilerle()<br>}</code>",
    tip: "Döngü, aynı işi daha kısa ve okunur anlatmanın yoludur.",
    grid: [
      "#########",
      "#M.B.B.S#",
      "#########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "tekrarla"],
    starRating: { three: 2, two: 5 }
  },
  {
    id: 7,
    title: "7. Merdiven Kalıbı",
    instructions: "Merdivende aynı hareket kalıbı üç kez tekrarlanıyor. Döngünün içine birden fazla komut yazabilirsin.",
    tip: "Kalıp şu fikre benzer: ilerle, sağa dön, ilerle, sola dön.",
    grid: [
      "########",
      "#M.#####",
      "##.B####",
      "###.B###",
      "####.S##",
      "########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 6, two: 9 }
  },
  {
    id: 8,
    title: "8. Muz Koridoru",
    instructions: "Koridor iki yöne kıvrılıyor. Uzun düz parçaları döngüyle, dönüşleri tek komutla anlat.",
    tip: "Aynı yönde çok ilerlediğin bölümlerde <code>tekrarla</code> kullan.",
    grid: [
      "##########",
      "#M.B.B..##",
      "######..##",
      "#S.B...B##",
      "##########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 8, two: 11 }
  },
  {
    id: 9,
    title: "9. Açık Alan Rotası",
    instructions: "Labirent yok; açık alanda önce hangi muz sırasının daha kısa olduğunu düşün. Sonra rotayı komutlara çevir.",
    tip: "Açık alanda iyi algoritma, en az dönüş ve en az geri yürüyüş yapan rotayı seçer.",
    grid: [
      "##########",
      "#M..B...S#",
      "#........#",
      "#..~..B..#",
      "#........#",
      "#B.......#",
      "##########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 16, two: 20 }
  },
  {
    id: 10,
    title: "10. Koordinat Deseni",
    instructions: "Muzlar haritada dağınık duruyor. Gereksiz dolaşmadan hepsini toplayan bir sıralama kur ve uzun düz parçaları döngüyle kısalt.",
    tip: "Önce yatay-dikey mesafeleri karşılaştır; yakın görünen muz her zaman en iyi ilk hedef olmayabilir.",
    grid: [
      "###########",
      "#M..B.....#",
      "#.........#",
      "#....B....#",
      "#.........#",
      "#..B....S.#",
      "###########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 12, two: 16 }
  },
  {
    id: 11,
    title: "11. Akıllı Kısayol",
    instructions: "Taşlar sadece küçük adacıklar gibi duruyor; amaç labirent çözmek değil, açık alanda doğru kısayolu seçmek.",
    tip: "Bir hedefe koşmadan önce sonraki hedefe çıkışının açık kalıp kalmadığını kontrol et.",
    grid: [
      "############",
      "#M...B.....#",
      "#....#.....#",
      "#..B.#..B..#",
      "#....#.....#",
      "#......S...#",
      "############"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 18, two: 22 }
  },
  {
    id: 12,
    title: "12. En Kısa Plan",
    instructions: "Final artık labirent değil: açık adada tüm muzları toplayıp sandığa ulaşan en kısa planı kur. Akıllı rota butonuyla kendi çözümünü karşılaştırabilirsin.",
    tip: "Döngüler sadece tekrar eden uzun yürüyüşlerde işe yarar; önce hedef sırasını doğru seç.",
    grid: [
      "############",
      "#M..B......#",
      "#..........#",
      "#..B..~..B.#",
      "#..........#",
      "#B......S..#",
      "############"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 17, two: 21 }
  },
  {
    id: 13,
    title: "13. Altın Anahtar ve Kilit",
    instructions: "Mojo'nun önünde kilitli bir kapı var. Kapıyı açmak için önce <code>K</code> karesindeki anahtarı almalı, ardından kapıdan geçerek sandığa ulaşmalıdır.",
    tip: "Anahtarı aldığında kapı otomatik olarak açılır.",
    grid: [
      "#########",
      "#M..K.G.S#",
      "#########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle"],
    starRating: { three: 8, two: 10 }
  },
  {
    id: 14,
    title: "14. Dolambaçlı Yol",
    instructions: "Bu seviyede sandık kilitli bir kapının arkasında. Önce aşağı inip sağdaki anahtarı almalı, sonra kapıdan geçerek sandığa varmalısın.",
    tip: "Anahtarı almak için U şeklinde bir rota izle, ardından geri dönüp yukarıdaki kapıya yönel.",
    grid: [
      "########",
      "#M.##.S#",
      "##.##.G#",
      "##....K#",
      "########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 12, two: 15 }
  }
];

// Parser function that parses our safe custom language subset and returns compiled VM instructions
export function parseCode(code) {
  // Strip single line and multiline comments
  let cleanCode = code.replace(/\/\/.*$/gm, '');
  cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, '');

  const lines = cleanCode.split('\n');
  const instructions = [];
  const blockStack = [];
  let nextLoopId = 1;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].trim();
    if (!lineText) continue;

    // Supported formats:
    // 1. command()
    // 2. tekrarla(N) {
    // 3. ise(onumdeEngelVar()) {
    // 4. } degilse {
    // 5. }
    const cmdRegex = /^(ilerle|adimla|solaDon|sagaDon|muzAl)\s*\(\s*(-?\d+)?\s*\)\s*;?$/;
    const loopStartRegex = /^tekrarla\s*\(\s*(\d+)\s*\)\s*\{$/;
    const ifStartRegex = /^ise\s*\(\s*(onumdeEngelVar|onumdeMuzVar|onumdeKayaVar|onumdeSuVar|onumdeKilitVar)\s*\(\s*\)\s*\)\s*\{$/;
    const elseStartRegex = /^\}\s*degilse\s*\{$/;
    const loopEndRegex = /^\}$/;

    let match;
    const lineNumber = i + 1;

    if ((match = cmdRegex.exec(lineText)) !== null) {
      const [_, name, countStr] = match;
      const count = countStr ? parseInt(countStr, 10) : 1;

      if (Math.abs(count) < 1 || Math.abs(count) > 100) {
        throw new Error(`Satır ${lineNumber}: Geçersiz parametre değeri. Adım sayısı 1 ile 100 arasında olmalıdır.`);
      }

      if (count < 0 && (name === 'solaDon' || name === 'sagaDon' || name === 'muzAl')) {
        throw new Error(`Satır ${lineNumber}: Dönüş veya muz alma komutları negatif parametre alamaz.`);
      }

      const isBackward = count < 0;
      const repeats = Math.abs(count);
      let compileName = name;
      
      if (name === 'adimla' || name === 'ilerle') {
        compileName = isBackward ? 'geriGit' : 'ilerle';
      }

      for (let r = 0; r < repeats; r++) {
        instructions.push({
          type: 'command',
          name: compileName,
          line: lineNumber
        });
      }
    } else if ((match = loopStartRegex.exec(lineText)) !== null) {
      const [_, countStr] = match;
      const count = parseInt(countStr, 10);
      
      if (count < 1 || count > 100) {
        throw new Error(`Satır ${lineNumber}: Geçersiz tekrar sayısı. Tekrarlama değeri 1 ile 100 arasında olmalıdır.`);
      }

      const loopId = nextLoopId++;
      instructions.push({
        type: 'loop_init',
        count,
        loopId,
        line: lineNumber
      });
      blockStack.push({
        type: 'loop',
        loopId,
        startIdx: instructions.length,
        line: lineNumber
      });
    } else if ((match = ifStartRegex.exec(lineText)) !== null) {
      const [_, condition] = match;
      instructions.push({
        type: 'jump_if_false',
        condition,
        target: -1, // patched on closing
        line: lineNumber
      });
      blockStack.push({
        type: 'if',
        jumpIfFalseIdx: instructions.length - 1,
        line: lineNumber
      });
    } else if (elseStartRegex.test(lineText)) {
      if (blockStack.length === 0 || blockStack[blockStack.length - 1].type !== 'if') {
        throw new Error(`Satır ${lineNumber}: 'degilse' yapısı yalnızca bir 'ise' bloğunun hemen ardından kullanılabilir.`);
      }
      const ifBlock = blockStack.pop();
      instructions.push({
        type: 'jump',
        target: -1, // patched on closing
        line: lineNumber
      });
      // Point the 'if' condition failure to the else block start
      instructions[ifBlock.jumpIfFalseIdx].target = instructions.length;
      blockStack.push({
        type: 'else',
        jumpIdx: instructions.length - 1,
        line: lineNumber
      });
    } else if (loopEndRegex.test(lineText)) {
      if (blockStack.length === 0) {
        throw new Error(`Satır ${lineNumber}: Eşleşmeyen kapatma parantezi '}'. Açık bir blok bulunamadı.`);
      }
      const block = blockStack.pop();
      if (block.type === 'loop') {
        instructions.push({
          type: 'loop_step',
          loopId: block.loopId,
          target: block.startIdx,
          line: lineNumber
        });
      } else if (block.type === 'if') {
        // Point the 'if' condition failure past the block end
        instructions[block.jumpIfFalseIdx].target = instructions.length;
      } else if (block.type === 'else') {
        // Point the 'else' end-of-block jump past the else block end
        instructions[block.jumpIdx].target = instructions.length;
      }
    } else {
      // Syntax error
      throw new Error(`Satır ${lineNumber}: Bilinmeyen veya hatalı komut yazımı: "${lineText}". Geçerli komutlar: ilerle(), solaDon(), sagaDon(), tekrarla(N) { ... }, ise(koşul) { ... }`);
    }
  }

  if (blockStack.length > 0) {
    const topBlock = blockStack[blockStack.length - 1];
    const name = topBlock.type === 'loop' ? 'tekrarla döngüsü' : (topBlock.type === 'if' ? 'ise bloğu' : 'degilse bloğu');
    throw new Error(`Kod sonu: Kapatılmamış bir ${name} mevcut (Satır ${topBlock.line}).`);
  }

  return instructions;
}

// Game State Class
export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.currentLevelIdx = 0;
    this.level = null;
    
    // Grid sizing
    this.tileSize = 64;
    this.gridWidth = 0;
    this.gridHeight = 0;
    
    // Player state
    this.player = {
      x: 0,
      y: 0,
      dir: 'RIGHT', // UP, RIGHT, DOWN, LEFT
      animX: 0,
      animY: 0,
      animRotation: 0,
      targetRotation: 0
    };

    // Level state
    this.bananas = []; // List of {x, y, collected}
    this.starTile = { x: 0, y: 0 };
    this.gridData = []; // 2D grid array of characters

    // Execution state
    this.executionQueue = [];
    this.currentQueueIdx = -1;
    this.isRunning = false;
    this.animationTimer = null;
    this.animationProgress = 1; // 0 to 1 for current transition
    this.executionSpeed = 500; // ms per step
    this.lastSourceCode = '';
    this.loopCounters = {}; // VM loop counters (nested loop support)
    this.historyStack = []; // Step-by-step history for Step Back (Undo) support

    // Advanced gameplay features state
    this.keys = [];
    this.rulerActive = false;
    this.hoveredCell = null;
    this.isDebugMode = false;
    this.isWaitingForStep = false;
    
    // Particles and special animations state
    this.particles = []; // Visual particle effects (banana pick, victory fanfare)
    this.flyingKey = null; // Key-to-gate animation trajectory
    this.showVictoryFanfare = false; // continuous fireworks toggle
    this.crashType = null; // 'water', 'rock', 'gate', or 'outOfBounds'
    
    // Load and process banana illustration image
    this.bananaImg = new Image();
    this.bananaImgProcessed = null;
    this.bananaImg.onload = () => {
      this.bananaImgProcessed = this.makeTransparent(this.bananaImg);
      this.draw();
    };
    this.bananaImg.src = 'banana.png';

    // UI Callbacks
    this.onLevelComplete = null;
    this.onExecutionStep = null; // Callback for current line highlight
    this.onExecutionFinished = null;
    this.onDebugStepComplete = null; // Callback for debug step finish
    this.onLogMessage = null;
    this.onBananaChange = null;

    // Assets loaded/setup
    this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem('kodmaymunu_level');
    if (saved) {
      this.currentLevelIdx = Math.min(LEVELS.length - 1, Math.max(0, parseInt(saved, 10)));
    }
  }

  saveState() {
    localStorage.setItem('kodmaymunu_level', this.currentLevelIdx);
  }

  loadLevel(idx) {
    this.currentLevelIdx = idx;
    this.saveState();
    this.level = LEVELS[this.currentLevelIdx];

    // Automatically allow 'ise' if 'tekrarla' is allowed in the level
    if (this.level.allowedCommands.includes("tekrarla") && !this.level.allowedCommands.includes("ise")) {
      this.level.allowedCommands.push("ise");
    }

    // Automatically allow 'adimla' if 'ilerle' is allowed in the level
    if (this.level.allowedCommands.includes("ilerle") && !this.level.allowedCommands.includes("adimla")) {
      this.level.allowedCommands.push("adimla");
    }

    this.isRunning = false;
    this.currentQueueIdx = -1;
    this.loopCounters = {};
    this.historyStack = [];
    this.particles = [];
    this.flyingKey = null;
    this.showVictoryFanfare = false;
    this.crashType = null;
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    // Target grid dimensions matching the original widescreen proportions
    this.gridWidth = 20;
    this.gridHeight = 12;

    // Parse original grid
    const origGrid = this.level.grid.map(row => row.split(''));
    const origH = origGrid.length;
    const origW = Math.max(...origGrid.map(r => r.length));

    // Calculate centering offsets
    const padX = Math.floor((this.gridWidth - origW) / 2);
    const padY = Math.floor((this.gridHeight - origH) / 2);

    // Initialize 20x12 grid with grass ('.')
    this.gridData = [];
    for (let y = 0; y < this.gridHeight; y++) {
      this.gridData.push(new Array(this.gridWidth).fill('.'));
    }

    // Copy original grid into centered location
    for (let y = 0; y < origH; y++) {
      for (let x = 0; x < origW; x++) {
        const char = origGrid[y][x] || '.';
        const targetX = x + padX;
        const targetY = y + padY;
        if (targetX >= 0 && targetX < this.gridWidth && targetY >= 0 && targetY < this.gridHeight) {
          this.gridData[targetY][targetX] = char;
        }
      }
    }

    // Resize canvas
    this.canvas.width = this.gridWidth * this.tileSize;
    this.canvas.height = this.gridHeight * this.tileSize;

    // Scan for start points, bananas, stars, keys
    this.bananas = [];
    this.keys = [];
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const char = this.gridData[y][x];
        if (char === 'M') {
          this.player.x = x;
          this.player.y = y;
          this.player.dir = this.level.startDir;
          this.player.animX = x;
          this.player.animY = y;
          this.setRotationByDir(this.player.dir);
          this.player.animRotation = this.player.targetRotation;
        } else if (char === 'B') {
          this.bananas.push({ x, y, collected: false });
        } else if (char === 'K') {
          this.keys.push({ x, y, collected: false });
        } else if (char === 'S') {
          this.starTile = { x, y };
        }
      }
    }

    this.animationProgress = 1;
    this.draw();
  }

  setRotationByDir(dir) {
    switch (dir) {
      case 'RIGHT': this.player.targetRotation = 0; break;
      case 'DOWN': this.player.targetRotation = Math.PI / 2; break;
      case 'LEFT': this.player.targetRotation = Math.PI; break;
      case 'UP': this.player.targetRotation = -Math.PI / 2; break;
    }
  }

  getDirectionOffset(dir) {
    switch (dir) {
      case 'RIGHT': return { dx: 1, dy: 0 };
      case 'LEFT': return { dx: -1, dy: 0 };
      case 'UP': return { dx: 0, dy: -1 };
      case 'DOWN': return { dx: 0, dy: 1 };
      default: return { dx: 0, dy: 0 };
    }
  }

  getNextDirection(currentDir, turn) {
    const dirs = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    let idx = dirs.indexOf(currentDir);
    if (turn === 'LEFT') {
      idx = (idx + 3) % 4;
    } else {
      idx = (idx + 1) % 4;
    }
    return dirs[idx];
  }

  isWalkableCell(x, y, hasKey = this.hasKeyCollected()) {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
      return false;
    }

    const row = this.gridData[y];
    const cell = row && row[x] ? row[x] : '#';
    if (cell === '#') return false;
    if (cell === '~') return false;
    if (cell === 'G' && !hasKey) return false;
    return true;
  }

  hasKeyCollected() {
    if (!this.keys || this.keys.length === 0) return true;
    return this.keys.every(k => k.collected);
  }

  createSmartRouteCode() {
    const plan = this.findSmartRoutePlan();
    if (!plan || plan.length === 0) {
      return null;
    }

    return this.formatRoutePlan(plan);
  }

  findSmartRoutePlan() {
    const startTile = this.findStartTile();
    const start = {
      x: startTile.x,
      y: startTile.y,
      dir: this.level.startDir,
      mask: 0,
      keyMask: 0
    };
    const bananaIndex = new Map();
    this.bananas.forEach((banana, idx) => {
      bananaIndex.set(`${banana.x},${banana.y}`, idx);
      if (banana.x === start.x && banana.y === start.y) {
        start.mask |= (1 << idx);
      }
    });

    const keyIndex = new Map();
    this.keys.forEach((key, idx) => {
      keyIndex.set(`${key.x},${key.y}`, idx);
      if (key.x === start.x && key.y === start.y) {
        start.keyMask |= (1 << idx);
      }
    });

    const targetMask = (1 << this.bananas.length) - 1;
    const targetKeyMask = (1 << this.keys.length) - 1;

    const queue = [start];
    const startKey = this.getRouteStateKey(start);
    const visited = new Set([startKey]);
    const previous = new Map();
    let cursor = 0;
    let goalKey = null;

    while (cursor < queue.length) {
      const state = queue[cursor++];
      const stateKey = this.getRouteStateKey(state);

      if (state.x === this.starTile.x && state.y === this.starTile.y && state.mask === targetMask && state.keyMask === targetKeyMask) {
        goalKey = stateKey;
        break;
      }

      const candidates = [
        {
          action: 'ilerle',
          next: this.getForwardRouteState(state, bananaIndex, keyIndex, targetKeyMask)
        },
        {
          action: 'solaDon',
          next: {
            ...state,
            dir: this.getNextDirection(state.dir, 'LEFT')
          }
        },
        {
          action: 'sagaDon',
          next: {
            ...state,
            dir: this.getNextDirection(state.dir, 'RIGHT')
          }
        }
      ];

      for (const candidate of candidates) {
        if (!candidate.next) continue;

        const nextKey = this.getRouteStateKey(candidate.next);
        if (visited.has(nextKey)) continue;

        visited.add(nextKey);
        previous.set(nextKey, {
          key: stateKey,
          action: candidate.action
        });
        queue.push(candidate.next);
      }
    }

    if (!goalKey) {
      return null;
    }

    const actions = [];
    let key = goalKey;
    while (key !== startKey) {
      const link = previous.get(key);
      actions.push(link.action);
      key = link.key;
    }

    return actions.reverse();
  }

  findStartTile() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.gridData[y][x] === 'M') {
          return { x, y };
        }
      }
    }

    return { x: this.player.x, y: this.player.y };
  }

  getRouteStateKey(state) {
    return `${state.x},${state.y},${state.dir},${state.mask},${state.keyMask || 0}`;
  }

  getForwardRouteState(state, bananaIndex, keyIndex, targetKeyMask) {
    const { dx, dy } = this.getDirectionOffset(state.dir);
    const nextX = state.x + dx;
    const nextY = state.y + dy;

    const hasKeys = (state.keyMask || 0) === targetKeyMask;
    if (!this.isWalkableCell(nextX, nextY, hasKeys)) {
      return null;
    }

    let nextMask = state.mask;
    const bananaIdx = bananaIndex.get(`${nextX},${nextY}`);
    if (bananaIdx !== undefined) {
      nextMask |= (1 << bananaIdx);
    }

    let nextKeyMask = state.keyMask || 0;
    const keyIdx = keyIndex.get(`${nextX},${nextY}`);
    if (keyIdx !== undefined) {
      nextKeyMask |= (1 << keyIdx);
    }

    return {
      x: nextX,
      y: nextY,
      dir: state.dir,
      mask: nextMask,
      keyMask: nextKeyMask
    };
  }

  formatRoutePlan(actions) {
    const lines = [
      '// Akilli rota ornegi',
      '// Once en kisa hedef sirasi bulundu, sonra uzun yuruyusler donguye cevrildi.'
    ];

    for (let i = 0; i < actions.length;) {
      const action = actions[i];
      let count = 1;
      while (actions[i + count] === action) {
        count++;
      }

      if (action === 'ilerle' && count >= 3) {
        lines.push(`tekrarla(${count}) {`);
        lines.push('  ilerle()');
        lines.push('}');
      } else {
        for (let j = 0; j < count; j++) {
          lines.push(`${action}()`);
        }
      }

      i += count;
    }

    return `${lines.join('\n')}\n`;
  }

  log(msg, type = 'info') {
    if (this.onLogMessage) {
      this.onLogMessage(msg, type);
    }
  }

  runCodeText(code) {
    if (this.isRunning) return;

    try {
      this.lastSourceCode = code;
      this.executionQueue = parseCode(code);
      if (this.executionQueue.length === 0) {
        this.log("Hata: Çalıştırılacak geçerli bir kod bulunamadı!", "error");
        soundEngine.playFail();
        if (this.onExecutionFinished) {
          this.onExecutionFinished();
        }
        return;
      }

      this.log("Algoritma başlatılıyor...", "info");
      this.loadLevel(this.currentLevelIdx); // Reset state before running
      this.isRunning = true;
      this.currentQueueIdx = 0;
      this.step();
    } catch (err) {
      this.log(err.message, "error");
      soundEngine.playFail();
      if (this.onExecutionFinished) {
        this.onExecutionFinished();
      }
    }
  }

  stop() {
    this.isRunning = false;
    this.currentQueueIdx = -1;
    this.loopCounters = {};
    this.historyStack = [];
    this.particles = [];
    this.flyingKey = null;
    this.showVictoryFanfare = false;
    this.crashType = null;
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    this.loadLevel(this.currentLevelIdx); // Reset state
    this.log("Program durduruldu.", "info");
    if (this.onExecutionFinished) {
      this.onExecutionFinished();
    }
  }

  step() {
    if (!this.isRunning) return;

    // Run control flow instructions instantly, pausing only on move commands
    while (this.currentQueueIdx < this.executionQueue.length) {
      const currentStep = this.executionQueue[this.currentQueueIdx];
      
      if (currentStep.type === 'command') {
        // Highlight UI line
        if (this.onExecutionStep) {
          this.onExecutionStep(currentStep.line);
        }

        // Save state history for step back (Undo) support
        if (this.isDebugMode) {
          this.historyStack.push({
            player: { x: this.player.x, y: this.player.y, dir: this.player.dir },
            keys: this.keys.map(k => ({ ...k })),
            bananas: this.bananas.map(b => ({ ...b })),
            loopCounters: { ...this.loopCounters },
            queueIdx: this.currentQueueIdx
          });
        }

        // Execute command action
        const success = this.applyAction(currentStep.name);
        if (!success) {
          this.isRunning = false;
          if (this.onExecutionFinished) {
            this.onExecutionFinished();
          }
          return;
        }

        // Pause VM loop and trigger movement animations
        this.animationProgress = 0;
        this.animate();
        return; // exit function, wait for animate() callback to resume
      } else if (currentStep.type === 'loop_init') {
        this.loopCounters[currentStep.loopId] = currentStep.count;
        this.currentQueueIdx++;
      } else if (currentStep.type === 'loop_step') {
        this.loopCounters[currentStep.loopId]--;
        if (this.loopCounters[currentStep.loopId] > 0) {
          this.currentQueueIdx = currentStep.target;
        } else {
          this.currentQueueIdx++;
        }
      } else if (currentStep.type === 'jump') {
        this.currentQueueIdx = currentStep.target;
      } else if (currentStep.type === 'jump_if_false') {
        const condVal = this.evaluateCondition(currentStep.condition);
        if (condVal) {
          this.currentQueueIdx++;
        } else {
          this.currentQueueIdx = currentStep.target;
        }
      } else {
        this.currentQueueIdx++;
      }
    }

    // Program reached the end
    this.checkWinCondition();
  }

  stepBack() {
    if (!this.isRunning || !this.isDebugMode || this.historyStack.length === 0) {
      return false;
    }

    const prevState = this.historyStack.pop();
    this.player.x = prevState.player.x;
    this.player.y = prevState.player.y;
    this.player.dir = prevState.player.dir;
    this.player.animX = prevState.player.x;
    this.player.animY = prevState.player.y;
    this.setRotationByDir(prevState.player.dir);
    this.player.animRotation = this.player.targetRotation;

    this.keys = prevState.keys;
    this.bananas = prevState.bananas;
    this.loopCounters = prevState.loopCounters;
    this.currentQueueIdx = prevState.queueIdx; // Point IP back to this instruction

    this.animationProgress = 1;
    this.draw();

    if (this.onBananaChange) {
      this.onBananaChange();
    }

    if (this.onExecutionStep) {
      const step = this.executionQueue[this.currentQueueIdx];
      if (step) {
        this.onExecutionStep(step.line);
      }
    }

    this.isWaitingForStep = true;
    return true;
  }

  evaluateCondition(condition) {
    const { dx, dy } = this.getDirectionOffset(this.player.dir);
    const frontX = this.player.x + dx;
    const frontY = this.player.y + dy;

    // Check bounds
    const isOutOfBounds = frontX < 0 || frontX >= this.gridWidth || frontY < 0 || frontY >= this.gridHeight;
    const cell = isOutOfBounds ? '#' : this.gridData[frontY][frontX];

    switch (condition) {
      case 'onumdeEngelVar':
        return isOutOfBounds || cell === '#' || cell === '~' || (cell === 'G' && !this.hasKeyCollected());
      case 'onumdeMuzVar':
        return cell === 'B' && this.bananas.some(b => b.x === frontX && b.y === frontY && !b.collected);
      case 'onumdeKayaVar':
        return cell === '#';
      case 'onumdeSuVar':
        return cell === '~';
      case 'onumdeKilitVar':
        return cell === 'G' && !this.hasKeyCollected();
      default:
        return false;
    }
  }

  applyAction(action) {
    const { dx, dy } = this.getDirectionOffset(this.player.dir);
    
    if (action === 'ilerle' || action === 'geriGit') {
      const isBackward = action === 'geriGit';
      const offsetFactor = isBackward ? -1 : 1;
      const nextX = this.player.x + dx * offsetFactor;
      const nextY = this.player.y + dy * offsetFactor;

      if (!this.isWalkableCell(nextX, nextY)) {
        const cell = nextX >= 0 && nextX < this.gridWidth && nextY >= 0 && nextY < this.gridHeight ? this.gridData[nextY][nextX] : '#';
        let obstacleType = 'outOfBounds';
        const crashDir = isBackward ? "geri giderken" : "giderken";
        if (cell === 'G') {
          this.log(`Mojo ${crashDir} kilitli kapıya çarptı! Önce anahtarı almalısın.`, "error");
          obstacleType = 'gate';
        } else if (cell === '#') {
          this.log(`Mojo ${crashDir} kayaya çarptı! Algoritma başarısız.`, "error");
          obstacleType = 'rock';
        } else if (cell === '~') {
          this.log(`Mojo ${crashDir} suya düştü! Algoritma başarısız.`, "error");
          obstacleType = 'water';
        } else {
          this.log(`Mojo ${crashDir} harita dışına çıktı! Algoritma başarısız.`, "error");
        }
        soundEngine.playFail();
        this.triggerCrashAnimation(obstacleType);
        return false;
      }

      this.player.x = nextX;
      this.player.y = nextY;
      this.collectBananaAtPlayer();
      this.collectKeyAtPlayer();
      soundEngine.playStep();
      return true;

    } else if (action === 'sagaDon') {
      this.player.dir = this.getNextDirection(this.player.dir, 'RIGHT');
      this.setRotationByDir(this.player.dir);
      soundEngine.playStep();
      return true;

    } else if (action === 'solaDon') {
      this.player.dir = this.getNextDirection(this.player.dir, 'LEFT');
      this.setRotationByDir(this.player.dir);
      soundEngine.playStep();
      return true;

    } else if (action === 'muzAl') {
      this.log("muzAl() artık gerekli değil; Mojo muzlara değince otomatik toplar.", "info");
      this.collectBananaAtPlayer();
      return true;
    }
    return false;
  }

  collectKeyAtPlayer() {
    if (!this.keys) return false;
    const key = this.keys.find(k => k.x === this.player.x && k.y === this.player.y && !k.collected);
    if (!key) return false;

    key.collected = true;
    this.log("Harika! Anahtarı aldın, kilitli kapı artık açıldı.", "success");
    soundEngine.playCoin();

    // Trigger sliding key flying animation to the gate!
    let gateX = -1, gateY = -1;
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.gridData[y][x] === 'G') {
          gateX = x;
          gateY = y;
          break;
        }
      }
    }
    if (gateX !== -1) {
      this.flyingKey = {
        startX: this.player.x,
        startY: this.player.y,
        targetX: gateX,
        targetY: gateY,
        progress: 0
      };
    }
    return true;
  }

  collectBananaAtPlayer() {
    const banana = this.bananas.find(b => b.x === this.player.x && b.y === this.player.y && !b.collected);
    if (!banana) return false;

    banana.collected = true;
    this.log("Nefis! Muz otomatik toplandı.", "success");
    soundEngine.playCoin();
    
    // Spawn pick particles
    this.spawnBananaParticles(this.player.x, this.player.y);
    
    if (this.onBananaChange) {
      this.onBananaChange(this.bananas.filter(b => b.collected).length, this.bananas.length);
    }
    return true;
  }

  spawnBananaParticles(cellX, cellY) {
    const center = this.tileSize / 2;
    const px = cellX * this.tileSize + center;
    const py = cellY * this.tileSize + center;
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upwards bias
        color: '#facc15', // yellow gold
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 15
      });
    }
  }

  spawnVictoryParticles() {
    const px = this.starTile.x * this.tileSize + this.tileSize / 2;
    const py = this.starTile.y * this.tileSize + this.tileSize / 2;
    const colors = ['#facc15', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 4 - Math.random() * Math.PI / 2; // shoot upwards
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // upward force
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 25
      });
    }
  }

  triggerCrashAnimation(obstacleType) {
    this.animationProgress = 0;
    this.crashType = obstacleType; // 'water', 'rock', 'gate', or 'outOfBounds'
    const self = this;
    let frames = 0;
    
    function crashLoop() {
      if (frames < 30) {
        frames++;
        self.drawCrash(frames);
        requestAnimationFrame(crashLoop);
      } else {
        self.crashType = null;
        self.loadLevel(self.currentLevelIdx);
      }
    }
    crashLoop();
  }

  drawCrash(frames) {
    const center = this.tileSize / 2;
    const px = this.player.x * this.tileSize + center;
    const py = this.player.y * this.tileSize + center;

    this.ctx.save();
    
    if (this.crashType === 'water') {
      // Drowning animation: spin and scale down
      this.draw(); // draw normal scene first
      this.ctx.translate(px, py);
      this.ctx.rotate(frames * 0.25);
      const scale = Math.max(0, 1 - frames / 30);
      this.ctx.scale(scale, scale);
      this.ctx.translate(-px, -py);
      this.drawPlayer(px, py, false);
    } else {
      // Rock/gate/outOfBounds shake
      const shakeX = (Math.random() - 0.5) * 8;
      const shakeY = (Math.random() - 0.5) * 8;
      this.ctx.translate(shakeX, shakeY);
      this.draw(); // draw normal scene with shake
      this.ctx.translate(-shakeX, -shakeY);
      // Draw player override as dizzy (stars around head)
      this.drawPlayer(px + shakeX, py + shakeY, true);
    }
    this.ctx.restore();

    // Red tint flash
    this.ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0, 0.4 - frames * 0.015)})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    const speed = this.executionSpeed;
    const start = performance.now();
    const self = this;
    const startX = this.player.animX;
    const startY = this.player.animY;
    const startRot = this.player.animRotation;

    let targetRot = this.player.targetRotation;
    // Handle rotation wrapping for shortest turn direction
    let diff = targetRot - startRot;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    targetRot = startRot + diff;

    function animLoop(time) {
      if (!self.isRunning) return;
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / (speed * 0.8)); // Leave 20% buffer

      self.animationProgress = progress;
      self.player.animX = startX + (self.player.x - startX) * progress;
      self.player.animY = startY + (self.player.y - startY) * progress;
      self.player.animRotation = startRot + (targetRot - startRot) * progress;

      self.draw();

      if (progress < 1) {
        requestAnimationFrame(animLoop);
      } else {
        // Animation finished
        self.player.animX = self.player.x;
        self.player.animY = self.player.y;
        self.player.animRotation = self.player.targetRotation;
        self.draw();

        self.currentQueueIdx++;
        if (self.isDebugMode) {
          self.isWaitingForStep = true;
          if (self.onDebugStepComplete) {
            self.onDebugStepComplete(); // triggers UI update for debug step complete
          }
        } else {
          self.animationTimer = setTimeout(() => {
            self.step();
          }, speed * 0.2);
        }
      }
    }
    requestAnimationFrame(animLoop);
  }

  checkWinCondition() {
    // Check if at star and all bananas collected
    const uncollected = this.bananas.filter(b => !b.collected);
    const atStar = this.player.x === this.starTile.x && this.player.y === this.starTile.y;

    if (atStar && uncollected.length === 0) {
      this.log("Tebrikler! Mojo hedefe ulaştı ve tüm muzları topladı!", "success");
      soundEngine.playVictory();
      this.isRunning = false;
      this.showVictoryFanfare = true; // Turn on confettis/fireworks particle generation
      
      // Calculate code efficiency stars
      const lineCount = this.getUniqueCodeLineCount();
      let stars = 1;
      if (lineCount <= this.level.starRating.three) {
        stars = 3;
      } else if (lineCount <= this.level.starRating.two) {
        stars = 2;
      }

      if (this.onLevelComplete) {
        this.onLevelComplete(stars, lineCount);
      }
    } else {
      if (!atStar) {
        this.log("Mojo yıldıza ulaşamadı! Lütfen kodu gözden geçirin.", "error");
      } else if (uncollected.length > 0) {
        this.log(`Tüm muzları toplamadın! Kalan muz sayısı: ${uncollected.length}`, "error");
      }
      soundEngine.playFail();
      this.isRunning = false;
      if (this.onExecutionFinished) {
        this.onExecutionFinished();
      }
    }
  }

  getUniqueCodeLineCount() {
    // Score the written program, not the expanded execution queue.
    // Closing braces and comments do not count as algorithm steps.
    let cleanCode = this.lastSourceCode.replace(/\/\/.*$/gm, '');
    cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, '');
    const lines = cleanCode
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line !== '}');
    return lines.length;
  }

  draw() {
    const isLight = document.body.classList.contains('light-theme');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Ground Tiles & Grid lines
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        // Draw basic grass block
        if (isLight) {
          this.ctx.fillStyle = (x + y) % 2 === 0 ? '#e2f5ea' : '#d0eedd';
        } else {
          this.ctx.fillStyle = (x + y) % 2 === 0 ? '#112217' : '#0c1a11';
        }
        this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

        // Soft grid outline
        this.ctx.strokeStyle = isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);

        // Draw cell items
        const cell = this.gridData[y][x];
        if (cell === '#') {
          this.drawRock(px, py);
        } else if (cell === '~') {
          this.drawWater(px, py);
        } else if (cell === 'G') {
          this.drawGate(px, py, this.hasKeyCollected());
        }
      }
    }

    // 2. Draw Target Star/Chest
    this.drawStar(this.starTile.x * this.tileSize, this.starTile.y * this.tileSize);

    // 3. Draw Active Bananas
    for (const b of this.bananas) {
      if (!b.collected) {
        this.drawBanana(b.x * this.tileSize, b.y * this.tileSize);
      }
    }

    // 4. Draw Active Keys
    for (const k of this.keys) {
      if (!k.collected) {
        this.drawKey(k.x * this.tileSize, k.y * this.tileSize);
      }
    }

    // 5. Draw Player (Mojo)
    if (this.crashType === null) {
      this.drawPlayer();
    }

    // 6. Draw flying key if active
    if (this.flyingKey) {
      this.flyingKey.progress = Math.min(1, this.flyingKey.progress + 0.04);
      const kx = this.flyingKey.startX * this.tileSize + (this.flyingKey.targetX - this.flyingKey.startX) * this.flyingKey.progress * this.tileSize;
      const ky = this.flyingKey.startY * this.tileSize + (this.flyingKey.targetY - this.flyingKey.startY) * this.flyingKey.progress * this.tileSize;
      this.drawKey(kx, ky);
      if (this.flyingKey.progress >= 1) {
        this.flyingKey = null;
      }
    }

    // 7. Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravity
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Continuously spawn victory fanfare particles if active
    if (this.showVictoryFanfare && Math.random() < 0.25) {
      this.spawnVictoryParticles();
    }

    // 8. Draw Grid Coordinates HUD (Numbers along borders)
    this.drawCoordinatesHUD();

    // 9. Draw Ruler Tool Overlay
    if (this.rulerActive && this.hoveredCell) {
      this.drawRulerOverlay();
    }
  }

  drawCoordinatesHUD() {
    const isLight = document.body.classList.contains('light-theme');
    this.ctx.save();
    this.ctx.font = 'bold 9px monospace';
    this.ctx.fillStyle = isLight ? 'rgba(5, 150, 105, 0.45)' : 'rgba(16, 185, 129, 0.35)';
    
    // Draw column numbers (1 to 20) at top border
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    for (let x = 0; x < this.gridWidth; x++) {
      const px = x * this.tileSize + this.tileSize / 2;
      this.ctx.fillText(x + 1, px, 4);
    }

    // Draw row letters (A to L) at left border
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    const alphabet = 'ABCDEFGHIJKL';
    for (let y = 0; y < this.gridHeight; y++) {
      const py = y * this.tileSize + this.tileSize / 2;
      this.ctx.fillText(alphabet[y] || y, 4, py);
    }
    this.ctx.restore();
  }

  drawRock(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    const padding = 6;
    const size = this.tileSize - padding * 2;
    this.ctx.fillStyle = isLight ? '#94a3b8' : '#4b5563'; // Slate grey rock
    this.ctx.strokeStyle = isLight ? '#cbd5e1' : '#374151';
    this.ctx.lineWidth = 2;

    // Smooth rounded stone path
    this.ctx.beginPath();
    this.ctx.roundRect(x + padding, y + padding, size, size, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Rock detail highlights
    this.ctx.fillStyle = isLight ? '#cbd5e1' : '#6b7280';
    this.ctx.beginPath();
    this.ctx.arc(x + padding + 15, y + padding + 15, 6, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawWater(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    const padding = 2;
    const size = this.tileSize - padding * 2;
    // Cyan water block
    this.ctx.fillStyle = isLight ? '#bae6fd' : '#0f766e';
    this.ctx.fillRect(x + padding, y + padding, size, size);

    // Draw wavy lines
    this.ctx.strokeStyle = isLight ? '#38bdf8' : '#14b8a6';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 10, y + 25);
    this.ctx.bezierCurveTo(x + 20, y + 20, x + 30, y + 30, x + 40, y + 25);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x + 20, y + 45);
    this.ctx.bezierCurveTo(x + 30, y + 40, x + 40, y + 50, x + 50, y + 45);
    this.ctx.stroke();
  }

  drawBanana(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    const center = this.tileSize / 2;
    const bx = x + center;
    const by = y + center;

    // Glowing aura effect
    const grad = this.ctx.createRadialGradient(bx, by, 4, bx, by, 22);
    grad.addColorStop(0, isLight ? 'rgba(234, 179, 8, 0.4)' : 'rgba(253, 224, 71, 0.45)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(bx, by, 24, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw the processed real banana illustration if loaded
    if (this.bananaImgProcessed) {
      this.ctx.save();
      // Center the banana inside the tile and scale down to 48x48
      const size = this.tileSize - 16;
      this.ctx.translate(bx, by);
      this.ctx.rotate(-Math.PI / 12); // subtle tilt for natural look
      this.ctx.drawImage(this.bananaImgProcessed, -size / 2, -size / 2, size, size);
      this.ctx.restore();
      return;
    }

    // Fallback: Draw realistic thick banana shape (vector code)
    this.ctx.save();
    // Center it on tile and rotate slightly for a natural look
    this.ctx.translate(bx, by);
    this.ctx.rotate(-Math.PI / 6);

    // Outer skin (Yellow)
    this.ctx.fillStyle = '#facc15'; // bright banana yellow
    this.ctx.strokeStyle = '#eab308'; // darker border
    this.ctx.lineWidth = 1.5;

    this.ctx.beginPath();
    // Start at stem base
    this.ctx.moveTo(-10, -7);
    // Outer curve to tip
    this.ctx.quadraticCurveTo(8, -12, 12, 6);
    // Tip edge
    this.ctx.lineTo(10, 8);
    // Inner curve back to stem base
    this.ctx.quadraticCurveTo(4, -4, -6, -4);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Volumetric 3D highlight (light yellow line inside body)
    this.ctx.strokeStyle = '#fef08a';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(-6, -5);
    this.ctx.quadraticCurveTo(4, -8, 8, 2);
    this.ctx.stroke();

    // Dark stem at base (Brown)
    this.ctx.fillStyle = '#78350f';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, -7);
    this.ctx.lineTo(-14, -10);
    this.ctx.lineTo(-11, -12);
    this.ctx.lineTo(-6, -9);
    this.ctx.closePath();
    this.ctx.fill();

    // Dark tip at end (Brown)
    this.ctx.fillStyle = '#451a03';
    this.ctx.beginPath();
    this.ctx.moveTo(12, 6);
    this.ctx.lineTo(13.5, 9.5);
    this.ctx.lineTo(10, 8);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  makeTransparent(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        // Key out white/light gray background (R, G, B > 240)
        // Also handle the case where it might already be transparent
        if (a > 0 && r > 240 && g > 240 && b > 240) {
          data[i+3] = 0;
        } else if (a > 0 && r > 220 && g > 220 && b > 220) {
          // Softly feather alpha for smoother edges near light colors
          const maxVal = Math.max(r, g, b);
          const ratio = (maxVal - 220) / 20; // 0 to 1
          data[i+3] = Math.max(0, Math.min(255, Math.round((1 - ratio) * 255)));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn("Could not process image transparency (likely CORS):", e);
      return img;
    }
    return canvas;
  }

  drawStar(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    const center = this.tileSize / 2;
    const sx = x + center;
    const sy = y + center;

    // Pulse effect
    const time = performance.now() * 0.005;
    const glowRadius = 18 + Math.sin(time) * 4;

    const grad = this.ctx.createRadialGradient(sx, sy, 3, sx, sy, glowRadius);
    grad.addColorStop(0, isLight ? 'rgba(234, 88, 12, 0.4)' : 'rgba(249, 115, 22, 0.5)'); // Orange gold glow
    grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(sx, sy, glowRadius + 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw Chest/Star symbol
    this.ctx.fillStyle = isLight ? '#ea580c' : '#f97316';
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    // Draw simple treasure chest
    const w = 24;
    const h = 20;
    this.ctx.roundRect(sx - w/2, sy - h/2, w, h, 3);
    this.ctx.fill();
    this.ctx.stroke();

    // Chest lock/metal strap
    this.ctx.fillStyle = '#eab308';
    this.ctx.fillRect(sx - 3, sy - 2, 6, 6);
    this.ctx.fillStyle = isLight ? '#fff' : '#1e293b';
    this.ctx.fillRect(sx - 1, sy + 1, 2, 2);
  }

  drawKey(x, y) {
    const center = this.tileSize / 2;
    const kx = x + center;
    const ky = y + center;

    // Glowing aura effect for key
    const grad = this.ctx.createRadialGradient(kx, ky, 2, kx, ky, 16);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.4)'); // Amber glow
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(kx, ky, 18, 0, Math.PI * 2);
    this.ctx.fill();

    // Key body (Gold)
    this.ctx.fillStyle = '#eab308';
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 1.5;

    // Key head ring
    this.ctx.beginPath();
    this.ctx.arc(kx - 6, ky, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Inner hole in ring (draw peach circle inside gold ring to create loop)
    this.ctx.fillStyle = document.body.classList.contains('light-theme') ? '#edf7f1' : '#112217'; 
    this.ctx.beginPath();
    this.ctx.arc(kx - 6, ky, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Key shaft
    this.ctx.fillStyle = '#eab308';
    this.ctx.fillRect(kx - 1, ky - 2, 12, 4);
    this.ctx.strokeRect(kx - 1, ky - 2, 12, 4);

    // Key teeth
    this.ctx.fillRect(kx + 7, ky + 1, 2, 3);
    this.ctx.fillRect(kx + 9, ky + 1, 2, 3);
  }

  drawGate(x, y, isUnlocked) {
    const padding = 4;
    const size = this.tileSize - padding * 2;
    const gx = x + padding;
    const gy = y + padding;

    // Base post / gate frame (Brown wood fence)
    this.ctx.fillStyle = isUnlocked ? 'rgba(120, 53, 15, 0.3)' : '#78350f'; 
    this.ctx.strokeStyle = isUnlocked ? 'rgba(67, 20, 7, 0.3)' : '#451a03';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.roundRect(gx, gy + 4, size, size - 8, 4);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw grid bars
    this.ctx.strokeStyle = isUnlocked ? 'rgba(255, 255, 255, 0.2)' : '#a16207';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(gx + 12, gy + 4);
    this.ctx.lineTo(gx + 12, gy + size - 4);
    this.ctx.moveTo(gx + size - 12, gy + 4);
    this.ctx.lineTo(gx + size - 12, gy + size - 4);
    this.ctx.moveTo(gx, gy + size / 2);
    this.ctx.lineTo(gx + size, gy + size / 2);
    this.ctx.stroke();

    // Padlock drawing
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;

    if (isUnlocked) {
      // Draw small green indicator
      this.ctx.fillStyle = '#10b981';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Draw Lock body
      this.ctx.fillStyle = '#94a3b8'; // silver padlock
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.roundRect(cx - 6, cy - 2, 12, 10, 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Lock shackle (loop)
      this.ctx.beginPath();
      this.ctx.arc(cx, cy - 2, 4, Math.PI, 0);
      this.ctx.stroke();
    }
  }

  drawRulerOverlay() {
    const isLight = document.body.classList.contains('light-theme');
    const t = this.tileSize;
    const startX = this.player.x * t + t/2;
    const startY = this.player.y * t + t/2;
    const endX = this.hoveredCell.x * t + t/2;
    const endY = this.hoveredCell.y * t + t/2;

    // Highlight hovered cell
    this.ctx.fillStyle = isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.2)';
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(this.hoveredCell.x * t + 3, this.hoveredCell.y * t + 3, t - 6, t - 6, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw dotted line between player and target
    this.ctx.save();
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([6, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.restore();

    // Calculate distances
    const diffX = Math.abs(this.hoveredCell.x - this.player.x);
    const diffY = Math.abs(this.hoveredCell.y - this.player.y);
    let distanceText = "";
    if (diffX === 0 || diffY === 0) {
      // Straight line distance
      distanceText = `${diffX + diffY} adım`;
    } else {
      // Manhattan grid distances
      distanceText = `↔ ${diffX}, ↕ ${diffY}`;
    }

    // Draw text badge at the center of the line
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    this.ctx.fillStyle = '#10b981';
    this.ctx.beginPath();
    this.ctx.roundRect(midX - 35, midY - 12, 70, 24, 6);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(distanceText, midX, midY);
  }

  drawPlayer(xOverride = null, yOverride = null, isDizzy = false) {
    const center = this.tileSize / 2;
    const px = xOverride !== null ? xOverride : (this.player.animX * this.tileSize + center);
    const py = yOverride !== null ? yOverride : (this.player.animY * this.tileSize + center);

    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.rotate(this.player.animRotation);

    const time = performance.now() * 0.005;

    // 1. Swaying Tail (using sine time if not dizzy)
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(-12, 5);
    const sway = isDizzy ? 0 : Math.sin(time * 2.5) * 5;
    this.ctx.bezierCurveTo(-25, 12 + sway, -22, -15 + sway, -30, -5 + sway);
    this.ctx.stroke();

    // 2. Ears
    this.ctx.fillStyle = '#b45309'; // Dark brown
    this.ctx.beginPath();
    this.ctx.arc(0, -16, 7, 0, Math.PI * 2); // Left ear
    this.ctx.arc(0, 16, 7, 0, Math.PI * 2); // Right ear
    this.ctx.fill();

    this.ctx.fillStyle = '#fed7aa'; // Peach inner ear
    this.ctx.beginPath();
    this.ctx.arc(0, -16, 4, 0, Math.PI * 2);
    this.ctx.arc(0, 16, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // 3. Body/Head
    this.ctx.fillStyle = '#d97706'; // Medium brown body
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. Face Mask (Face contour)
    this.ctx.fillStyle = '#fed7aa'; // Peach face
    this.ctx.beginPath();
    this.ctx.arc(4, -5, 7, 0, Math.PI * 2);
    this.ctx.arc(4, 5, 7, 0, Math.PI * 2);
    this.ctx.arc(8, 0, 7, 0, Math.PI * 2);
    this.ctx.fill();

    // 5. Eyes
    if (isDizzy) {
      // Draw cross dizzy eyes
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      // Left eye X
      this.ctx.beginPath();
      this.ctx.moveTo(5, -6); this.ctx.lineTo(9, -2);
      this.ctx.moveTo(9, -6); this.ctx.lineTo(5, -2);
      this.ctx.stroke();
      // Right eye X
      this.ctx.beginPath();
      this.ctx.moveTo(5, 2); this.ctx.lineTo(9, 6);
      this.ctx.moveTo(9, 2); this.ctx.lineTo(5, 6);
      this.ctx.stroke();
    } else {
      // Blinking eyes using time
      const isBlinking = Math.floor(time) % 5 === 0 && (time % 1 < 0.15);
      this.ctx.fillStyle = '#0f172a'; // Dark eyes
      if (isBlinking) {
        this.ctx.strokeStyle = '#0f172a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(5, -4); this.ctx.lineTo(9, -4);
        this.ctx.moveTo(5, 4); this.ctx.lineTo(9, 4);
        this.ctx.stroke();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(7, -4, 2, 0, Math.PI * 2);
        this.ctx.arc(7, 4, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 6. Snout / Smile / Dizzy Mouth
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    if (isDizzy) {
      // Dizzy wavy mouth
      this.ctx.moveTo(7, -2);
      this.ctx.quadraticCurveTo(8, 1, 9, -1);
      this.ctx.quadraticCurveTo(10, 1, 11, 0);
    } else {
      this.ctx.arc(10, 0, 2, 0, Math.PI);
    }
    this.ctx.stroke();

    this.ctx.restore();

    // 7. Spinning dizzy stars above head
    if (isDizzy) {
      this.ctx.save();
      const starsAngle = time * 7;
      this.ctx.translate(px, py - 18);
      this.ctx.rotate(starsAngle);
      this.ctx.fillStyle = '#facc15';
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const sx = Math.cos(angle) * 8;
        const sy = Math.sin(angle) * 4;
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }
}

// LEVEL GENERATOR UTILITIES

function getLevelGroup(id) {
  if (id <= 20) return 1;
  if (id <= 40) return 2;
  if (id <= 60) return 3;
  if (id <= 80) return 4;
  return 5;
}

function makeRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function findOptimalPath(grid, startDir) {
  const height = grid.length;
  const width = grid[0].length;
  
  let startX = -1, startY = -1;
  let starX = -1, starY = -1;
  const bananas = [];
  const keys = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = grid[y][x];
      if (char === 'M') {
        startX = x;
        startY = y;
      } else if (char === 'S') {
        starX = x;
        starY = y;
      } else if (char === 'B') {
        bananas.push({ x, y });
      } else if (char === 'K') {
        keys.push({ x, y });
      }
    }
  }
  
  if (startX === -1 || starX === -1) return null;
  
  const targetBananaMask = (1 << bananas.length) - 1;
  const targetKeyMask = (1 << keys.length) - 1;
  
  const startState = {
    x: startX,
    y: startY,
    dir: startDir,
    bananaMask: 0,
    keyMask: 0,
    parentKey: null,
    action: null
  };
  
  const startKey = `${startX},${startY},${startDir},0,0`;
  const queue = [startState];
  const visited = new Map();
  visited.set(startKey, startState);
  
  const getDirOffset = (dir) => {
    if (dir === 'RIGHT') return { dx: 1, dy: 0 };
    if (dir === 'LEFT') return { dx: -1, dy: 0 };
    if (dir === 'UP') return { dx: 0, dy: -1 };
    if (dir === 'DOWN') return { dx: 0, dy: 1 };
    return { dx: 0, dy: 0 };
  };
  
  const getNextDir = (currentDir, turn) => {
    const dirs = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    let idx = dirs.indexOf(currentDir);
    if (turn === 'LEFT') {
      idx = (idx + 3) % 4;
    } else {
      idx = (idx + 1) % 4;
    }
    return dirs[idx];
  };
  
  let cursor = 0;
  const maxIterations = 30000;
  let goalState = null;
  
  while (cursor < queue.length && cursor < maxIterations) {
    const state = queue[cursor++];
    
    // Check goal
    if (state.x === starX && state.y === starY &&
        state.bananaMask === targetBananaMask &&
        state.keyMask === targetKeyMask) {
      goalState = state;
      break;
    }
    
    const stateKey = `${state.x},${state.y},${state.dir},${state.bananaMask},${state.keyMask}`;
    
    const candidates = [
      {
        action: 'solaDon',
        x: state.x,
        y: state.y,
        dir: getNextDir(state.dir, 'LEFT'),
        bananaMask: state.bananaMask,
        keyMask: state.keyMask
      },
      {
        action: 'sagaDon',
        x: state.x,
        y: state.y,
        dir: getNextDir(state.dir, 'RIGHT'),
        bananaMask: state.bananaMask,
        keyMask: state.keyMask
      }
    ];
    
    // Check ilerle candidate
    const { dx, dy } = getDirOffset(state.dir);
    const nx = state.x + dx;
    const ny = state.y + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const cell = grid[ny][nx];
      let walkable = true;
      if (cell === '#') walkable = false;
      if (cell === '~') walkable = false;
      if (cell === 'G' && state.keyMask !== targetKeyMask) walkable = false;
      
      if (walkable) {
        let nBananaMask = state.bananaMask;
        let nKeyMask = state.keyMask;
        
        const bananaIdx = bananas.findIndex(b => b.x === nx && b.y === ny);
        if (bananaIdx !== -1) {
          nBananaMask |= (1 << bananaIdx);
        }
        
        const keyIdx = keys.findIndex(k => k.x === nx && k.y === ny);
        if (keyIdx !== -1) {
          nKeyMask |= (1 << keyIdx);
        }
        
        candidates.push({
          action: 'ilerle',
          x: nx,
          y: ny,
          dir: state.dir,
          bananaMask: nBananaMask,
          keyMask: nKeyMask
        });
      }
    }
    
    for (const cand of candidates) {
      const candKey = `${cand.x},${cand.y},${cand.dir},${cand.bananaMask},${cand.keyMask}`;
      if (!visited.has(candKey)) {
        const nextState = {
          x: cand.x,
          y: cand.y,
          dir: cand.dir,
          bananaMask: cand.bananaMask,
          keyMask: cand.keyMask,
          parentKey: stateKey,
          action: cand.action
        };
        visited.set(candKey, nextState);
        queue.push(nextState);
      }
    }
  }
  
  if (!goalState) return null;
  
  const path = [];
  let curr = goalState;
  while (curr && curr.parentKey) {
    path.push(curr.action);
    curr = visited.get(curr.parentKey);
  }
  return path.reverse();
}

function calculatePathLineCount(actions) {
  let count = 0;
  for (let i = 0; i < actions.length;) {
    const action = actions[i];
    let runLength = 1;
    while (actions[i + runLength] === action) {
      runLength++;
    }
    if (action === 'ilerle' && runLength >= 3) {
      count += 2; // loop start and body line (excluding closing brace)
    } else {
      count += runLength;
    }
    i += runLength;
  }
  return count;
}

function tryGenerateLevel(id, group, rand) {
  const grid = [];
  for (let r = 0; r < 12; r++) {
    grid.push(new Array(20).fill('.'));
  }
  // Make outer boundary walls
  for (let c = 0; c < 20; c++) {
    grid[0][c] = '#';
    grid[11][c] = '#';
  }
  for (let r = 0; r < 12; r++) {
    grid[r][0] = '#';
    grid[r][19] = '#';
  }

  // Randomize start direction
  const dirs = ["RIGHT", "DOWN", "LEFT", "UP"];
  const startDir = dirs[Math.floor(rand() * 4)];

  // Define sectors for M (left side) and S (right side)
  const startX = 2 + Math.floor(rand() * 4); // 2 to 5
  const startY = 2 + Math.floor(rand() * 8); // 2 to 9
  grid[startY][startX] = 'M';

  const starX = 14 + Math.floor(rand() * 4); // 14 to 17
  const starY = 2 + Math.floor(rand() * 8); // 2 to 9
  grid[starY][starX] = 'S';

  // Generate primary path
  let cx = startX, cy = startY;
  const pathCells = [{ x: cx, y: cy }];
  const visitedPath = new Set([`${cx},${cy}`]);

  let steps = 0;
  while ((cx !== starX || cy !== starY) && steps < 120) {
    steps++;
    const neighbors = [];
    const dirsList = [{dx:1, dy:0}, {dx:-1, dy:0}, {dx:0, dy:1}, {dx:0, dy:-1}];
    for (const d of dirsList) {
      const nx = cx + d.dx;
      const ny = cy + d.dy;
      if (nx >= 2 && nx <= 17 && ny >= 2 && ny <= 9) {
        let weight = 1;
        if (Math.sign(starX - cx) === d.dx) weight += 3;
        if (Math.sign(starY - cy) === d.dy) weight += 3;
        neighbors.push({ x: nx, y: ny, weight });
      }
    }
    
    const totalWeight = neighbors.reduce((acc, n) => acc + n.weight, 0);
    let rVal = rand() * totalWeight;
    let selected = neighbors[0];
    for (const n of neighbors) {
      rVal -= n.weight;
      if (rVal <= 0) {
        selected = n;
        break;
      }
    }
    
    cx = selected.x;
    cy = selected.y;
    if (!visitedPath.has(`${cx},${cy}`)) {
      pathCells.push({ x: cx, y: cy });
      visitedPath.add(`${cx},${cy}`);
    }
  }

  // Determine configuration based on group
  let numBananas = 1;
  let hasKeyGate = false;
  let obstacleDensity = 0.1;
  let waterDensity = 0.0;

  switch (group) {
    case 1: // Sequential Commands
      numBananas = rand() < 0.5 ? 1 : 2;
      hasKeyGate = false;
      obstacleDensity = 0.08;
      waterDensity = 0.0;
      break;
    case 2: // Loops
      numBananas = 2 + Math.floor(rand() * 2); // 2 or 3
      hasKeyGate = false;
      obstacleDensity = 0.12;
      waterDensity = 0.02;
      break;
    case 3: // Keys & Gates
      numBananas = 1 + Math.floor(rand() * 2); // 1 or 2
      hasKeyGate = true;
      obstacleDensity = 0.15;
      waterDensity = 0.03;
      break;
    case 4: // Mazes & Obstacles
      numBananas = 2 + Math.floor(rand() * 3); // 2 to 4
      hasKeyGate = false;
      obstacleDensity = 0.22;
      waterDensity = 0.08;
      break;
    case 5: // Master Challenges
      numBananas = 2 + Math.floor(rand() * 3); // 2 to 4
      hasKeyGate = true;
      obstacleDensity = 0.22;
      waterDensity = 0.12;
      break;
  }

  // Key and Gate placement
  const keyCells = [];
  if (hasKeyGate) {
    // Put a gate in the pathCells (towards the middle or end)
    const gateIdx = Math.floor(pathCells.length * 0.5) + Math.floor(rand() * (pathCells.length * 0.3));
    if (gateIdx > 1 && gateIdx < pathCells.length - 1) {
      const gateCell = pathCells[gateIdx];
      grid[gateCell.y][gateCell.x] = 'G';
    } else {
      const gateCell = pathCells[pathCells.length - 2];
      grid[gateCell.y][gateCell.x] = 'G';
    }

    // Put a key off the path or at a branch (retry until empty cell found)
    let placedKey = false;
    let keyAttempts = 0;
    while (!placedKey && keyAttempts < 200) {
      keyAttempts++;
      const keyX = 2 + Math.floor(rand() * 16); // 2 to 17
      const keyY = 2 + Math.floor(rand() * 8);  // 2 to 9
      if (grid[keyY][keyX] === '.') {
        grid[keyY][keyX] = 'K';
        keyCells.push({ x: keyX, y: keyY });
        placedKey = true;
        
        // Open path from start to key
        let kcx = startX, kcy = startY;
        let ksteps = 0;
        while ((kcx !== keyX || kcy !== keyY) && ksteps < 100) {
          ksteps++;
          const dx = Math.sign(keyX - kcx);
          const dy = Math.sign(keyY - kcy);
          if (dx !== 0 && (dy === 0 || rand() < 0.5)) {
            kcx += dx;
          } else {
            kcy += dy;
          }
          if (grid[kcy][kcx] === '.') {
            pathCells.push({ x: kcx, y: kcy });
            visitedPath.add(`${kcx},${kcy}`);
          }
        }
      }
    }
  }

  // Place Bananas on the path
  const availablePathCells = pathCells.filter(cell => {
    return grid[cell.y][cell.x] === '.';
  });
  
  // Shuffle available path cells
  for (let i = availablePathCells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const temp = availablePathCells[i];
    availablePathCells[i] = availablePathCells[j];
    availablePathCells[j] = temp;
  }

  const bananaCount = Math.min(numBananas, availablePathCells.length);
  for (let i = 0; i < bananaCount; i++) {
    const cell = availablePathCells[i];
    grid[cell.y][cell.x] = 'B';
  }

  // Fill obstacles in remaining empty cells
  for (let y = 1; y < 11; y++) {
    for (let x = 1; x < 19; x++) {
      if (grid[y][x] === '.' && !visitedPath.has(`${x},${y}`)) {
        const val = rand();
        if (val < waterDensity) {
          grid[y][x] = '~'; // Water
        } else if (val < waterDensity + obstacleDensity) {
          grid[y][x] = '#'; // Rock
        }
      }
    }
  }

  const stringGrid = grid.map(row => row.join(''));

  const GROUP_TITLES = {
    1: ["Düz Rota", "Sıralı Adımlar", "Uzak Mesafe", "Mojo'nun Dönüşü", "Hızlı Kararlar", "Doğru Açı", "Zirveye Doğru"],
    2: ["Kısır Döngü", "Merdiven Çıkış", "Zikzak Çizgisi", "Döngülü Yol", "Tekrarlı Rota", "Sonsuz Adımlar"],
    3: ["Altın Anahtar", "Kilitli Geçit", "Gizli Bölge", "Mojo'nun Kapısı", "Çifte Kilit", "Büyük Anahtar"],
    4: ["Labirent Koşusu", "Kaya Ormanı", "Su Çukurları", "Zorlu Geçit", "Sıkışık Rota", "Dolambaçlı Vadi"],
    5: ["Büyük Sınav", "Karışık Zemin", "Mojo'nun Zaferi", "Usta İşi Rota", "Final Kapısı", "Algoritma Şampiyonu"]
  };

  const titleIndex = Math.floor(rand() * GROUP_TITLES[group].length);
  const title = `${id}. ${GROUP_TITLES[group][titleIndex]}`;

  let instructions = "";
  let tip = "";
  let allowedCommands = ["ilerle", "solaDon", "sagaDon"];

  switch (group) {
    case 1:
      instructions = "Mojo'yu hedefe ulaştırmak için sıralı komutları kullanın. Suya veya kayalara basmamaya dikkat edin.";
      tip = "Mesafe ölçmek için <code>Cetvel</code> butonunu kullanabilirsiniz.";
      break;
    case 2:
      instructions = "Tekrar eden yolları kısaltmak için <code>tekrarla(N) { ... }</code> döngüsünü kullanın.";
      tip = "Zikzak veya merdiven benzeri örüntüleri bularak döngünün içine yerleştirin.";
      allowedCommands.push("tekrarla");
      break;
    case 3:
      instructions = "Bu bölümde kilitli bir kapı var. Mojo'nun kapıdan geçebilmesi için önce yerdeki anahtarı alması gerekir.";
      tip = "Anahtara (<code>K</code>) giden rotayı çizdikten sonra kapıdan (<code>G</code>) geçip sandığa (<code>S</code>) ilerleyin.";
      allowedCommands.push("tekrarla");
      break;
    case 4:
      instructions = "Dar geçitlerden ve su birikintilerinden oluşan bu karmaşık labirenti çözmek için en güvenli rotayı yazın.";
      tip = "Kayalar (<code>#</code>) ve su (<code>~</code>) geçilemez. Etraflarından dolaşın.";
      allowedCommands.push("tekrarla");
      break;
    case 5:
      instructions = "Tüm öğrendiğiniz kavramları bir araya getirme zamanı! Anahtarları toplayın, kapılardan geçin ve tüm muzları yiyerek hedefe varın.";
      tip = "Optimum satır sayısını aşmamak için tekrarlayan tüm hareketlerinizi mutlaka döngülere dönüştürün.";
      allowedCommands.push("tekrarla");
      break;
  }

  return {
    id,
    title,
    instructions,
    tip,
    grid: stringGrid,
    startDir,
    allowedCommands,
    starRating: { three: 999, two: 999 }
  };
}

function generateFallbackLevel(id, group) {
  const grid = [];
  for (let r = 0; r < 12; r++) {
    grid.push(new Array(20).fill('#'));
  }
  for (let c = 2; c <= 17; c++) {
    grid[5][c] = '.';
  }
  grid[5][2] = 'M';
  grid[5][17] = 'S';
  grid[5][8] = 'B';
  
  let allowedCommands = ["ilerle", "solaDon", "sagaDon"];
  if (group > 1) {
    allowedCommands.push("tekrarla");
  }
  
  const stringGrid = grid.map(row => row.join(''));
  return {
    id,
    title: `${id}. Kolay Rota`,
    instructions: "Doğrusal bir çizgide ilerleyerek sandığa ulaşın.",
    tip: "Sadece hedefe doğru ilerleyin.",
    grid: stringGrid,
    startDir: "RIGHT",
    allowedCommands,
    starRating: { three: 15, two: 18 }
  };
}

function generateProceduralLevel(id) {
  const group = getLevelGroup(id);
  let seed = id * 12345;
  let rand = makeRandom(seed);
  
  for (let attempt = 0; attempt < 500; attempt++) {
    const level = tryGenerateLevel(id, group, rand);
    const actions = findOptimalPath(level.grid, level.startDir);
    if (actions && actions.length > 0) {
      const minLines = calculatePathLineCount(actions);
      level.starRating.three = minLines;
      level.starRating.two = Math.max(minLines + 2, Math.floor(minLines * 1.3));
      return level;
    }
    seed = (seed + 98765) % 1000000;
    rand = makeRandom(seed);
  }
  
  return generateFallbackLevel(id, group);
}

// Generate levels 15 to 100 on import
for (let id = 15; id <= 100; id++) {
  LEVELS.push(generateProceduralLevel(id));
}
