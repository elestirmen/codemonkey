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
    title: "9. Dar Geçit",
    instructions: "Su ve kayalar arasında güvenli bir rota var. Her dönüşün neden gerekli olduğunu düşünerek sırayla yaz.",
    tip: "Bu seviye döngüden çok planlama ve yön takibi ister.",
    grid: [
      "##########",
      "#M..~#####",
      "###.######",
      "###..B####",
      "#####.#S##",
      "#####B..##",
      "##########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 17, two: 20 }
  },
  {
    id: 10,
    title: "10. Çift Döngü",
    instructions: "Aynı basamak kalıbı iki kez, sonra kısa bir final yürüyüşü var. Bu seviye döngü gövdesini doğru kurmayı ölçer.",
    tip: "Döngüden çıktıktan sonra Mojo hâlâ sağa bakıyor.",
    grid: [
      "#########",
      "#M.B#####",
      "###.#####",
      "###..B###",
      "#####.###",
      "#####B.S#",
      "#########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 9, two: 12 }
  },
  {
    id: 11,
    title: "11. Labirent Planı",
    instructions: "Bu rota geri dönmeyi ve uzun bir yatay geçişi birlikte kullanıyor. Haritayı önce gözünle çöz, sonra koda dök.",
    tip: "Yönünü kaybedersen Mojo'nun baktığı yönü takip et: sağ, aşağı, sol, aşağı, sağ, yukarı, sağ.",
    grid: [
      "###########",
      "#M..B######",
      "####.######",
      "##B....S###",
      "##.###.####",
      "##...B.####",
      "###########"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 22, two: 26 }
  },
  {
    id: 12,
    title: "12. Algoritma Adası",
    instructions: "Final rotasında merdiven döngüsü, uzun yürüyüşler ve yön değişimleri birleşiyor. Tüm muzları otomatik toplayıp sandığa ulaş.",
    tip: "İlk bölümde merdiven kalıbını üç kez tekrarla; sonra final rotasını ayrı komutlarla tamamla.",
    grid: [
      "############",
      "#M.#########",
      "##.B###B.###",
      "###..##..###",
      "####B..BBS##",
      "############"
    ],
    startDir: "RIGHT",
    allowedCommands: ["ilerle", "solaDon", "sagaDon", "tekrarla"],
    starRating: { three: 18, two: 22 }
  }
];

// Parser function that parses our safe custom language subset and returns a flat command array mapped to line numbers
export function parseCode(code) {
  // Strip single line and multiline comments
  let cleanCode = code.replace(/\/\/.*$/gm, '');
  cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, '');

  const lines = cleanCode.split('\n');
  const program = [];
  const loopStack = [];

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].trim();
    if (!lineText) continue;

    // Supported formats:
    // 1. command()
    // 2. tekrarla(N) {
    // 3. }
    const cmdRegex = /^(ilerle|solaDon|sagaDon|muzAl)\s*\(\s*\)\s*;?$/;
    const deprecatedStepCountRegex = /^(ilerle|solaDon|sagaDon|muzAl)\s*\(\s*\d+\s*\)\s*;?$/;
    const loopStartRegex = /^tekrarla\s*\(\s*(\d+)\s*\)\s*\{$/;
    const loopEndRegex = /^\}$/;

    let match;
    const lineNumber = i + 1;

    if ((match = cmdRegex.exec(lineText)) !== null) {
      const [_, name] = match;

      program.push({
        type: 'command',
        name,
        arg: 1,
        line: lineNumber
      });
    } else if (deprecatedStepCountRegex.test(lineText)) {
      throw new Error(`Satır ${lineNumber}: Komutlara sayı yazma kaldırıldı. Tekrar için tekrarla(N) { ... } kullan.`);
    } else if ((match = loopStartRegex.exec(lineText)) !== null) {
      const [_, countStr] = match;
      const count = parseInt(countStr, 10);
      
      if (count < 1 || count > 100) {
        throw new Error(`Satır ${lineNumber}: Geçersiz tekrar sayısı. Tekrarlama değeri 1 ile 100 arasında olmalıdır.`);
      }

      const loopToken = {
        type: 'loop_start',
        count,
        line: lineNumber,
        body: []
      };
      program.push(loopToken);
      loopStack.push(loopToken);
    } else if (loopEndRegex.test(lineText)) {
      if (loopStack.length === 0) {
        throw new Error(`Satır ${lineNumber}: Eşleşmeyen kapatma parantezi '}'. Açık bir 'tekrarla' döngüsü bulunamadı.`);
      }
      program.push({
        type: 'loop_end',
        line: lineNumber
      });
      loopStack.pop();
    } else {
      // Syntax error
      throw new Error(`Satır ${lineNumber}: Bilinmeyen veya hatalı komut yazımı: "${lineText}". Geçerli komutlar: ilerle(), solaDon(), sagaDon(), tekrarla(N) { ... }`);
    }
  }

  if (loopStack.length > 0) {
    throw new Error(`Kod sonu: Kapatılmamış döngü mevcut. Lütfen '}' kullanarak 'tekrarla' döngüsünü kapatın.`);
  }

  // Flatten logic
  let idx = 0;
  function flatten(tokens) {
    const flatActions = [];
    while (idx < tokens.length) {
      const token = tokens[idx];
      if (token.type === 'command') {
        for (let r = 0; r < token.arg; r++) {
          flatActions.push({ action: token.name, line: token.line });
        }
        idx++;
      } else if (token.type === 'loop_start') {
        idx++;
        const loopBody = flatten(tokens);
        for (let r = 0; r < token.count; r++) {
          for (const item of loopBody) {
            flatActions.push({ ...item });
          }
        }
      } else if (token.type === 'loop_end') {
        idx++;
        break; // Return this block
      }
    }
    return flatActions;
  }

  return flatten(program);
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
    
    // UI Callbacks
    this.onLevelComplete = null;
    this.onExecutionStep = null; // Callback for current line highlight
    this.onExecutionFinished = null;
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
    this.isRunning = false;
    this.currentQueueIdx = -1;
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    // Parse grid
    this.gridData = this.level.grid.map(row => row.split(''));
    this.gridHeight = this.gridData.length;
    this.gridWidth = Math.max(...this.gridData.map(r => r.length));

    // Resize canvas
    this.canvas.width = this.gridWidth * this.tileSize;
    this.canvas.height = this.gridHeight * this.tileSize;

    // Scan for start points, bananas, stars
    this.bananas = [];
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
    }
  }

  stop() {
    this.isRunning = false;
    this.currentQueueIdx = -1;
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

    if (this.currentQueueIdx >= this.executionQueue.length) {
      // Done executing all steps. Check win conditions.
      this.checkWinCondition();
      return;
    }

    const currentStep = this.executionQueue[this.currentQueueIdx];
    
    // Highlight UI line
    if (this.onExecutionStep) {
      this.onExecutionStep(currentStep.line);
    }

    // Execute step
    const success = this.applyAction(currentStep.action);
    
    if (!success) {
      // Crash or failed action
      this.isRunning = false;
      if (this.onExecutionFinished) {
        this.onExecutionFinished();
      }
      return;
    }

    // Setup animation
    this.animationProgress = 0;
    this.animate();
  }

  applyAction(action) {
    const { dx, dy } = this.getDirectionOffset(this.player.dir);
    
    if (action === 'ilerle') {
      const nextX = this.player.x + dx;
      const nextY = this.player.y + dy;

      // Check collision
      if (nextX < 0 || nextX >= this.gridWidth || nextY < 0 || nextY >= this.gridHeight) {
        this.log("Mojo harita dışına çıktı! Algoritma başarısız.", "error");
        soundEngine.playFail();
        this.triggerCrashAnimation();
        return false;
      }

      const cell = this.gridData[nextY][nextX];
      if (cell === '#') {
        this.log("Mojo kayaya çarptı! Algoritma başarısız.", "error");
        soundEngine.playFail();
        this.triggerCrashAnimation();
        return false;
      }
      if (cell === '~') {
        this.log("Mojo suya düştü! Algoritma başarısız.", "error");
        soundEngine.playFail();
        this.triggerCrashAnimation();
        return false;
      }

      // Safe to move
      this.player.x = nextX;
      this.player.y = nextY;
      this.collectBananaAtPlayer();
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

  collectBananaAtPlayer() {
    const banana = this.bananas.find(b => b.x === this.player.x && b.y === this.player.y && !b.collected);
    if (!banana) return false;

    banana.collected = true;
    this.log("Nefis! Muz otomatik toplandı.", "success");
    soundEngine.playCoin();
    if (this.onBananaChange) {
      this.onBananaChange(this.bananas.filter(b => b.collected).length, this.bananas.length);
    }
    return true;
  }

  triggerCrashAnimation() {
    this.animationProgress = 0;
    const self = this;
    let frames = 0;
    
    function crashLoop() {
      if (frames < 20) {
        frames++;
        // Shake canvas logic or redraw with crash effect
        self.drawCrash(frames);
        requestAnimationFrame(crashLoop);
      } else {
        self.loadLevel(self.currentLevelIdx);
      }
    }
    crashLoop();
  }

  drawCrash(frames) {
    this.draw();
    // Simple red tint flash
    this.ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0, 0.4 - frames * 0.02)})`;
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
        self.animationTimer = setTimeout(() => {
          self.step();
        }, speed * 0.2);
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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Ground Tiles & Grid lines
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        // Draw basic grass block
        this.ctx.fillStyle = (x + y) % 2 === 0 ? '#112217' : '#0c1a11';
        this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

        // Soft grid outline
        this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);

        // Draw cell items
        const cell = this.gridData[y][x];
        if (cell === '#') {
          // Rock obstacle
          this.drawRock(px, py);
        } else if (cell === '~') {
          // Water obstacle
          this.drawWater(px, py);
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

    // 4. Draw Player (Mojo)
    this.drawPlayer();
  }

  drawRock(x, y) {
    const padding = 6;
    const size = this.tileSize - padding * 2;
    this.ctx.fillStyle = '#4b5563'; // Slate grey rock
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 2;

    // Smooth rounded stone path
    this.ctx.beginPath();
    this.ctx.roundRect(x + padding, y + padding, size, size, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Rock detail highlights
    this.ctx.fillStyle = '#6b7280';
    this.ctx.beginPath();
    this.ctx.arc(x + padding + 15, y + padding + 15, 6, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawWater(x, y) {
    const padding = 2;
    const size = this.tileSize - padding * 2;
    // Cyan water block
    this.ctx.fillStyle = '#0f766e';
    this.ctx.fillRect(x + padding, y + padding, size, size);

    // Draw wavy lines
    this.ctx.strokeStyle = '#14b8a6';
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
    const center = this.tileSize / 2;
    const bx = x + center;
    const by = y + center;

    // Glowing aura effect
    const grad = this.ctx.createRadialGradient(bx, by, 4, bx, by, 20);
    grad.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(bx, by, 22, 0, Math.PI * 2);
    this.ctx.fill();

    // Stylized banana curve (drawn using SVG path logic safe in Canvas)
    this.ctx.strokeStyle = '#eab308';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.arc(bx - 2, by + 2, 10, -Math.PI / 4, Math.PI * 0.7);
    this.ctx.stroke();

    // Banana stem
    this.ctx.strokeStyle = '#854d0e';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(bx + 5, by - 5);
    this.ctx.lineTo(bx + 8, by - 9);
    this.ctx.stroke();
  }

  drawStar(x, y) {
    const center = this.tileSize / 2;
    const sx = x + center;
    const sy = y + center;

    // Pulse effect
    const time = performance.now() * 0.005;
    const glowRadius = 18 + Math.sin(time) * 4;

    const grad = this.ctx.createRadialGradient(sx, sy, 3, sx, sy, glowRadius);
    grad.addColorStop(0, 'rgba(249, 115, 22, 0.5)'); // Orange gold glow
    grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(sx, sy, glowRadius + 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw Chest/Star symbol
    this.ctx.fillStyle = '#f97316';
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
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(sx - 1, sy + 1, 2, 2);
  }

  drawPlayer() {
    const center = this.tileSize / 2;
    const px = this.player.animX * this.tileSize + center;
    const py = this.player.animY * this.tileSize + center;

    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.rotate(this.player.animRotation);

    // 1. Tail (Behind body)
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(-12, 5);
    this.ctx.bezierCurveTo(-25, 12, -22, -15, -30, -5);
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

    // 5. Eyes (Facing right by default)
    this.ctx.fillStyle = '#0f172a'; // Dark eyes
    this.ctx.beginPath();
    this.ctx.arc(7, -4, 2, 0, Math.PI * 2);
    this.ctx.arc(7, 4, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Snout / Smile
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(10, 0, 2, 0, Math.PI);
    this.ctx.stroke();

    this.ctx.restore();
  }
}
