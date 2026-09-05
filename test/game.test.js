import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CHAPTERS,
  CHAPTER_SIZE,
  COMMAND_UNLOCKS,
  Game,
  LEVELS,
  LEVEL_COUNT,
  commandsForLevel,
  countBlockLines,
  encodeActions,
  getLevelGroup,
  parseCode,
  planLevelRoute,
  renderBlocks
} from '../game.js';
import { soundEngine } from '../audio.js';

const VALID_DIRECTIONS = new Set(['UP', 'RIGHT', 'DOWN', 'LEFT']);
const VALID_TILES = new Set(['.', '#', '~', 'M', 'S', 'B', 'K', 'G', 'L', 'T', '=']);
const VALID_COMMANDS = new Set(COMMAND_UNLOCKS.map(unlock => unlock.command).concat('kaplumbaga.adimla'));
const SYNTAX_MODES = ['indent', 'bracket'];

function createNoopCanvasContext() {
  let noop;
  noop = new Proxy(function noopCanvasOperation() {}, {
    apply: () => noop,
    get: () => noop,
    set: () => true
  });
  return noop;
}

function installBrowserStubs() {
  const storage = new Map();
  const context = createNoopCanvasContext();
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context
  };

  globalThis.localStorage = {
    clear: () => storage.clear(),
    getItem: key => storage.has(key) ? storage.get(key) : null,
    removeItem: key => storage.delete(key),
    setItem: (key, value) => storage.set(key, String(value))
  };
  globalThis.document = {
    body: {
      classList: {
        contains: () => false
      }
    },
    getElementById: () => canvas
  };
  globalThis.Image = class ImageStub {
    set src(_value) {}
  };
  globalThis.requestAnimationFrame = callback => {
    callback(performance.now());
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {};
}

installBrowserStubs();
if (soundEngine.isSoundEnabled()) soundEngine.toggleSound();

function createGame() {
  localStorage.clear();
  const game = new Game('game-canvas');
  game.draw = () => {};
  return game;
}

// Interprets a compiled program exactly the way Game#step does, minus the
// animation timers, so a level's reference solution can be verified end to end.
function executeProgram(game, instructions) {
  const loopCounters = new Map();
  let pointer = 0;
  let operations = 0;

  while (pointer < instructions.length) {
    operations += 1;
    assert.ok(operations < 200_000, 'program exceeded the test execution budget');

    const instruction = instructions[pointer];
    switch (instruction.type) {
      case 'command': {
        const moved = game.applyAction(instruction.name, instruction.target);
        if (!moved) return `"${instruction.name}" failed on line ${instruction.line}`;
        pointer += 1;
        break;
      }
      case 'loop_init':
        loopCounters.set(instruction.loopId, instruction.count);
        pointer += 1;
        break;
      case 'loop_step': {
        const remaining = loopCounters.get(instruction.loopId) - 1;
        loopCounters.set(instruction.loopId, remaining);
        pointer = remaining > 0 ? instruction.target : pointer + 1;
        break;
      }
      case 'jump_if_false':
        pointer = game.evaluateCondition(instruction.condition) ? pointer + 1 : instruction.target;
        break;
      case 'jump':
        pointer = instruction.target;
        break;
      default:
        return `unexpected instruction ${instruction.type}`;
    }
  }

  return null;
}

function levelIsSolved(game) {
  return game.player.x === game.starTile.x
    && game.player.y === game.starTile.y
    && game.bananas.every(banana => banana.collected)
    && game.keys.every(key => key.collected);
}

test('premium UI keeps unique controls and a syntactically valid module', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'index.html contains duplicate IDs');

  for (const requiredId of [
    'game-canvas', 'code-editor', 'btn-run', 'level-sidebar', 'level-search',
    'console-panel', 'success-modal', 'welcome-overlay', 'toast-region'
  ]) {
    assert.ok(ids.includes(requiredId), `missing premium UI control #${requiredId}`);
  }

  // A query string on the specifier would give the UI its own audio module
  // instance, so muting from the settings menu would not silence the engine.
  const uiAudioImport = html.match(/import \{ soundEngine \} from '([^']+)'/);
  assert.ok(uiAudioImport, 'UI does not import the audio module');
  const engineSource = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  const engineAudioImport = engineSource.match(/import \{ soundEngine \} from '([^']+)'/);
  assert.ok(engineAudioImport, 'engine does not import the audio module');
  assert.equal(
    uiAudioImport[1],
    engineAudioImport[1],
    'UI and engine must import the audio module through the identical specifier'
  );
  assert.match(html, /setupEventListeners\(\);[\s\S]*?game\.loadLevel\(game\.currentLevelIdx\);[\s\S]*?loadActiveLevel\(\);/);

  const moduleMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  assert.ok(moduleMatch, 'inline module script is missing');
  const syntaxOnlySource = moduleMatch[1].replace(/^\s*import .*$/gm, '');
  assert.doesNotThrow(() => new Function(syntaxOnlySource));
});

test('UI imports the chapter model instead of redefining it', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /function getLevelGroup\(/, 'chapter mapping must come from game.js, not a UI copy');
  assert.match(html, /import \{[^}]*getLevelGroup[^}]*\} from '\.\/game\.js/);
  assert.doesNotMatch(html, /starRating/, 'star targets are derived, so the UI must not read a stored threshold');
});

test('parseCode compiles equivalent bracket and indentation programs', () => {
  const bracketCode = `
    tekrarla(2) {
      ilerle()
      sagaDon()
    }
    adimla(-2)
  `;
  const indentationCode = `
tekrarla(2):
    ilerle()
    sagaDon()
adimla(-2)
  `;
  const expected = ['ilerle', 'sagaDon', 'ilerle', 'sagaDon', 'geriGit', 'geriGit'];

  const flatten = instructions => {
    const game = createGame();
    const actions = [];
    game.applyAction = name => {
      actions.push(name);
      return true;
    };
    assert.equal(executeProgram(game, instructions), null);
    return actions;
  };

  assert.deepEqual(flatten(parseCode(bracketCode, 'bracket')), expected);
  assert.deepEqual(flatten(parseCode(indentationCode, 'indent')), expected);
});

test('parseCode preserves adjacent and nested indentation blocks', () => {
  const code = `
tekrarla(3):
    adimla()
tekrarla(2):
    sagaDon()
    tekrarla(2):
        ilerle()
solaDon()
  `;

  const game = createGame();
  const actions = [];
  game.applyAction = name => {
    actions.push(name);
    return true;
  };
  assert.equal(executeProgram(game, parseCode(code, 'indent')), null);
  assert.deepEqual(actions, [
    'ilerle', 'ilerle', 'ilerle',
    'sagaDon', 'ilerle', 'ilerle',
    'sagaDon', 'ilerle', 'ilerle',
    'solaDon'
  ]);
});

test('parseCode keeps original source line numbers after indentation dedents', () => {
  const instructions = parseCode([
    'tekrarla(2):',
    '    ilerle()',
    'sagaDon()',
    'solaDon()'
  ].join('\n'), 'indent');
  const commands = instructions.filter(instruction => instruction.type === 'command');

  assert.deepEqual(commands.map(command => command.line), [2, 3, 4]);
});

test('parseCode compiles indentation if/else jump targets', () => {
  const instructions = parseCode([
    'ise(onumdeEngelVar()):',
    '    sagaDon()',
    'degilse:',
    '    ilerle()',
    'solaDon()'
  ].join('\n'), 'indent');

  assert.deepEqual(instructions.map(instruction => instruction.type), [
    'jump_if_false', 'command', 'jump', 'command', 'command'
  ]);
  assert.equal(instructions[0].target, 3);
  assert.equal(instructions[2].target, 4);
});

test('parseCode rejects malformed commands and unsafe repeat counts', () => {
  assert.throws(() => parseCode('uc()', 'bracket'), /Bilinmeyen veya hatalı komut/);
  assert.throws(() => parseCode('tekrarla(0) {\n}', 'bracket'), /Geçersiz tekrar sayısı/);
  assert.throws(() => parseCode('adimla(101)', 'bracket'), /1 ile 100/);
  assert.throws(() => parseCode('tekrarla(2) {\nilerle()', 'bracket'), /Kapatılmamış/);
  assert.throws(() => parseCode('ilerle()\n'.repeat(501), 'bracket'), /Kod sınırı aşıldı/);
});

test('level permissions prevent commands a mission has not unlocked yet', () => {
  const game = createGame();
  game.loadLevel(0);

  assert.doesNotThrow(() => game.validateInstructionsForLevel(parseCode('ilerle()', 'bracket'), game.level));
  assert.throws(
    () => game.validateInstructionsForLevel(parseCode('adimla(4)', 'bracket'), game.level),
    /henüz kullanılamaz/
  );
  assert.throws(
    () => game.validateInstructionsForLevel(parseCode('tekrarla(2) {\n ilerle()\n}', 'bracket'), game.level),
    /tekrarla/
  );
  assert.throws(
    () => game.validateInstructionsForLevel(parseCode('kaplumbaga.adimla()', 'bracket'), game.level),
    /kaplumbaga/
  );
});

test('encodeActions finds the shortest program for a pattern', () => {
  // A staircase is three copies of a four-command pattern plus one step.
  const staircase = ['ilerle', 'sagaDon', 'ilerle', 'solaDon'];
  const actions = [...staircase, ...staircase, ...staircase, 'ilerle'];
  assert.equal(encodeActions(actions, { allowLoops: true }).lines, 6);

  // Without loops every command costs a line.
  assert.equal(encodeActions(actions, { allowLoops: false }).lines, actions.length);

  // A straight run collapses to one loop, or to a single compact move.
  const straight = new Array(12).fill('ilerle');
  assert.equal(encodeActions(straight, { allowLoops: true }).lines, 2);
  assert.equal(encodeActions(straight, { allowLoops: true, allowCompact: true }).lines, 1);
});

test('encodeActions never wraps a single command in a two-iteration loop', () => {
  const encoded = encodeActions(['ilerle', 'ilerle'], { allowLoops: true });
  assert.equal(encoded.lines, 2);
  assert.deepEqual(encoded.blocks.map(block => block.type), ['simple', 'simple']);
});

test('countBlockLines matches what the scorer counts in both syntax modes', () => {
  const blocks = [
    'ilerle',
    { type: 'loop', count: 3, body: ['ilerle', 'sagaDon'] },
    { type: 'branch', condition: 'onumdeEngelVar', then: ['sagaDon'], otherwise: ['ilerle'] },
    { type: 'compact', action: 'ilerle', count: 4 }
  ];
  const game = createGame();
  game.loadLevel(0);

  for (const mode of SYNTAX_MODES) {
    game.lastSourceCode = renderBlocks(blocks, mode).join('\n');
    assert.equal(game.getUniqueCodeLineCount(), countBlockLines(blocks), `line count drifted in ${mode} mode`);
  }
});

test('LEVELS fills every chapter slot with sequential ids', () => {
  assert.equal(LEVEL_COUNT, CHAPTERS.length * CHAPTER_SIZE);
  assert.equal(LEVELS.length, LEVEL_COUNT);
  assert.deepEqual(LEVELS.map(level => level.id), Array.from({ length: LEVEL_COUNT }, (_, index) => index + 1));
  for (const level of LEVELS) {
    assert.equal(getLevelGroup(level.id), Math.ceil(level.id / CHAPTER_SIZE));
  }
});

test('every mission name is unique', () => {
  const seen = new Map();
  const duplicates = [];
  for (const level of LEVELS) {
    const name = level.title.replace(/^\d+\.\s*/, '');
    if (seen.has(name)) duplicates.push(`${name}: L${seen.get(name)} and L${level.id}`);
    else seen.set(name, level.id);
  }
  assert.deepEqual(duplicates, []);
});

test('command permissions are derived, never hand-maintained', () => {
  const drifted = LEVELS
    .filter(level => JSON.stringify(level.allowedCommands) !== JSON.stringify(commandsForLevel(level.id, level)))
    .map(level => level.id);
  assert.deepEqual(drifted, []);

  // Loading a level must not mutate the shared level definition.
  const game = createGame();
  const before = LEVELS.map(level => level.allowedCommands.join(','));
  for (let index = 0; index < LEVELS.length; index += 1) game.loadLevel(index);
  assert.deepEqual(LEVELS.map(level => level.allowedCommands.join(',')), before);
});

test('every level has a rectangular, valid grid with exactly one start and goal', () => {
  const problems = [];

  for (const level of LEVELS) {
    if (!Array.isArray(level.grid) || level.grid.length === 0) {
      problems.push(`L${level.id}: grid is empty`);
      continue;
    }

    const widths = new Set(level.grid.map(row => row.length));
    if (widths.size !== 1) {
      problems.push(`L${level.id}: row widths are ${[...widths].join(', ')}`);
    }
    if (level.grid.length > 12 || Math.max(...widths) > 20) {
      problems.push(`L${level.id}: grid exceeds the engine's 20x12 bounds`);
    }

    const cells = [...level.grid.join('')];
    const starts = cells.filter(cell => cell === 'M').length;
    const goals = cells.filter(cell => cell === 'S').length;
    if (starts !== 1) problems.push(`L${level.id}: expected one M, found ${starts}`);
    if (goals !== 1) problems.push(`L${level.id}: expected one S, found ${goals}`);

    const unknownTiles = [...new Set(cells.filter(cell => !VALID_TILES.has(cell)))];
    if (unknownTiles.length > 0) {
      problems.push(`L${level.id}: unknown tiles ${unknownTiles.join(', ')}`);
    }
    if (!VALID_DIRECTIONS.has(level.startDir)) {
      problems.push(`L${level.id}: invalid start direction ${level.startDir}`);
    }

    const unknownCommands = level.allowedCommands.filter(command => !VALID_COMMANDS.has(command));
    if (unknownCommands.length > 0) {
      problems.push(`L${level.id}: unknown commands ${unknownCommands.join(', ')}`);
    }
  }

  assert.deepEqual(problems, []);
});

test('board padding never becomes reachable playable ground', () => {
  const game = createGame();
  const leaks = [];

  for (let index = 0; index < LEVELS.length; index += 1) {
    game.loadLevel(index);
    const { x: originX, y: originY, width, height } = game.playArea;

    const seen = new Set([`${game.player.x},${game.player.y}`]);
    const queue = [[game.player.x, game.player.y]];
    let outside = 0;

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      if (x < originX || x >= originX + width || y < originY || y >= originY + height) outside += 1;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nextX = x + dx;
        const nextY = y + dy;
        if (nextX < 0 || nextY < 0 || nextX >= game.gridWidth || nextY >= game.gridHeight) continue;
        const key = `${nextX},${nextY}`;
        if (seen.has(key)) continue;
        const cell = game.gridData[nextY][nextX];
        if (cell === '#' || cell === '~') continue;
        seen.add(key);
        queue.push([nextX, nextY]);
      }
    }

    if (outside > 0) leaks.push(`L${LEVELS[index].id}: ${outside} padding cells are walkable`);
  }

  assert.deepEqual(leaks, []);
});

test('every level ships a reference solution that actually wins', () => {
  const game = createGame();
  const problems = [];

  for (let index = 0; index < LEVELS.length; index += 1) {
    const level = LEVELS[index];
    game.loadLevel(index);
    const reference = game.getReferenceSolution();

    if (!reference || reference.blocks.length === 0) {
      problems.push(`L${level.id}: no reference solution`);
      continue;
    }

    for (const mode of SYNTAX_MODES) {
      game.loadLevel(index);
      game.syntaxMode = mode;
      const code = renderBlocks(reference.blocks, mode).join('\n');

      let instructions;
      try {
        instructions = parseCode(code, mode);
        game.validateInstructionsForLevel(instructions, level);
      } catch (error) {
        problems.push(`L${level.id} [${mode}]: ${error.message}\n${code}`);
        continue;
      }

      game.isRunning = true;
      game.lastSourceCode = code;
      const failure = executeProgram(game, instructions);
      if (failure) {
        problems.push(`L${level.id} [${mode}]: ${failure}\n${code}`);
        continue;
      }
      if (!levelIsSolved(game)) {
        problems.push(`L${level.id} [${mode}]: program ran but did not solve the level\n${code}`);
        continue;
      }
      if (game.getUniqueCodeLineCount() !== reference.lines) {
        problems.push(`L${level.id} [${mode}]: scored ${game.getUniqueCodeLineCount()} lines, reference claims ${reference.lines}`);
      }
    }
  }

  assert.deepEqual(problems, []);
});

test('star targets are always reachable and ordered', () => {
  const game = createGame();
  const problems = [];

  for (let index = 0; index < LEVELS.length; index += 1) {
    game.loadLevel(index);
    const reference = game.getReferenceSolution();
    const targets = game.getStarTargets();

    if (targets.three !== reference.lines) {
      problems.push(`L${LEVELS[index].id}: three-star target ${targets.three} does not match the reference (${reference.lines})`);
    }
    if (targets.two < targets.three) {
      problems.push(`L${LEVELS[index].id}: two-star target ${targets.two} is tighter than the three-star target ${targets.three}`);
    }
  }

  assert.deepEqual(problems, []);
});

test('the smart-route button always produces a three-star program', () => {
  const game = createGame();
  const problems = [];

  for (let index = 0; index < LEVELS.length; index += 1) {
    for (const mode of SYNTAX_MODES) {
      game.loadLevel(index);
      game.syntaxMode = mode;
      const code = game.createSmartRouteCode();
      if (!code) {
        problems.push(`L${LEVELS[index].id} [${mode}]: no example solution`);
        continue;
      }
      game.lastSourceCode = code;
      const scored = game.getUniqueCodeLineCount();
      const targets = game.getStarTargets();
      if (scored > targets.three) {
        problems.push(`L${LEVELS[index].id} [${mode}]: example solution scores ${scored} but three stars needs ${targets.three}`);
      }
    }
  }

  assert.deepEqual(problems, []);
});

test('every unlock is introduced by a mission that exists', () => {
  for (const unlock of COMMAND_UNLOCKS) {
    const level = LEVELS.find(candidate => candidate.id === unlock.from);
    assert.ok(level, `${unlock.command} unlocks at L${unlock.from}, which does not exist`);
    assert.ok(level.allowedCommands.includes(unlock.command), `L${unlock.from} does not allow the command it unlocks`);
    if (unlock.from > 1) {
      const previous = LEVELS.find(candidate => candidate.id === unlock.from - 1);
      assert.ok(!previous.allowedCommands.includes(unlock.command), `${unlock.command} leaked into L${unlock.from - 1}`);
    }
  }
});

test('the planner and the level data agree on solvability', () => {
  const unsolvable = LEVELS
    .filter(level => !level.solution && !planLevelRoute(level))
    .map(level => level.id);
  assert.deepEqual(unsolvable, [], 'levels without an authored solution must be plannable');
});

test('adimla stays locked until the mission that teaches it', () => {
  const game = createGame();

  game.loadLevel(0);
  assert.throws(() => game.validateInstructionsForLevel(parseCode('adimla()', 'bracket'), game.level), /adimla/);
  assert.doesNotThrow(() => game.validateInstructionsForLevel(parseCode('ilerle()', 'bracket'), game.level));

  const unlockIndex = LEVELS.findIndex(level => level.id === 29);
  game.loadLevel(unlockIndex);
  assert.doesNotThrow(() => game.validateInstructionsForLevel(parseCode('adimla(4)', 'bracket'), game.level));
});

test('command palette snippets only use commands every mission allows', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const snippets = [
    ...[...html.matchAll(/setAttribute\('data-cmd', '([^']*)'\)/g)].map(match => match[1]),
    ...[...html.matchAll(/data-cmd="([^"]*)"\s+id="cmd-(tekrarla|ise)"/g)].map(match => match[1])
  ];
  assert.ok(snippets.length >= 4, 'no command snippets found');
  const leaking = snippets.filter(snippet => /adimla/.test(snippet));
  assert.deepEqual(
    leaking,
    [],
    'loop/branch snippets must not paste adimla() into missions that have not unlocked it'
  );
});

// ── End-to-end run through the real engine ─────────────────────────────────
// Drives Game#runCodeText with queue-based animation-frame and timer stubs, so
// the VM, the animation bookkeeping, the win check and the star calculation all
// run exactly as they do in a browser.
test('playing every reference solution through the engine earns three stars', () => {
  const frameQueue = [];
  const timerQueue = [];
  const realPerformance = globalThis.performance;
  const realRequestAnimationFrame = globalThis.requestAnimationFrame;
  const realCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;

  let clock = 0;
  globalThis.performance = { now: () => clock };
  globalThis.requestAnimationFrame = callback => frameQueue.push(callback);
  globalThis.cancelAnimationFrame = () => {};
  globalThis.setTimeout = callback => {
    timerQueue.push(callback);
    return 0;
  };
  globalThis.clearTimeout = () => {};

  const drain = () => {
    for (let guard = 0; guard < 200_000; guard += 1) {
      if (frameQueue.length > 0) {
        clock += 1000;
        for (const callback of frameQueue.splice(0)) callback(clock);
      } else if (timerQueue.length > 0) {
        for (const callback of timerQueue.splice(0)) callback();
      } else {
        return true;
      }
    }
    return false;
  };

  const problems = [];

  try {
    const game = createGame();
    game.executionSpeed = 20;

    for (let index = 0; index < LEVELS.length; index += 1) {
      const level = LEVELS[index];
      frameQueue.length = 0;
      timerQueue.length = 0;

      game.loadLevel(index);
      game.syntaxMode = 'indent';
      const reference = game.getReferenceSolution();
      const code = renderBlocks(reference.blocks, 'indent').join('\n');

      let result = null;
      let finishedWithoutWin = false;
      game.onLevelComplete = (stars, lineCount, meta) => {
        result = { stars, lineCount, meta };
        game.cancelEffectsAnimation();
        frameQueue.length = 0;
      };
      game.onExecutionFinished = () => {
        if (!result) finishedWithoutWin = true;
      };

      game.runCodeText(code);
      if (!drain()) {
        problems.push(`L${level.id}: execution did not settle`);
        continue;
      }

      if (finishedWithoutWin || !result) {
        problems.push(`L${level.id}: reference solution finished without winning`);
        continue;
      }
      if (result.stars !== 3) {
        problems.push(`L${level.id}: reference solution scored ${result.stars} stars (${result.lineCount} lines vs par ${result.meta.par})`);
      }
      if (result.lineCount !== reference.lines) {
        problems.push(`L${level.id}: engine scored ${result.lineCount} lines, reference claims ${reference.lines}`);
      }
      if (result.meta.beatPar) {
        problems.push(`L${level.id}: reference solution reported as beating its own par`);
      }
      assert.equal(result.meta.scenarios, 1 + (level.scenarios?.length || 0), `L${level.id}: not all scenarios completed`);
      assert.equal(game.scenarioIndex, level.scenarios?.length || 0);
      if (level.mastery) assert.equal(result.meta.mastery.earned, true, `L${level.id}: reference must earn mastery`);
    }
  } finally {
    globalThis.performance = realPerformance;
    globalThis.requestAnimationFrame = realRequestAnimationFrame;
    globalThis.cancelAnimationFrame = realCancelAnimationFrame;
    globalThis.setTimeout = realSetTimeout;
    globalThis.clearTimeout = realClearTimeout;
  }

  assert.deepEqual(problems, []);
});

test('baked level data carries no build-time-only fields', () => {
  const buildOnlyFields = ['minSteps', 'minPar'];
  const problems = [];

  for (const level of LEVELS) {
    for (const field of buildOnlyFields) {
      if (field in level) problems.push(`L${level.id}: ${field} leaked into shipped level data`);
    }
    if (!Array.isArray(level.grid) || level.grid.some(row => typeof row !== 'string')) {
      problems.push(`L${level.id}: grid rows must be strings`);
    }
    if (typeof level.instructions !== 'string' || level.instructions.trim() === '') {
      problems.push(`L${level.id}: missing instructions`);
    }
    if (typeof level.tip !== 'string' || level.tip.trim() === '') {
      problems.push(`L${level.id}: missing tip`);
    }
  }

  assert.deepEqual(problems, []);
});

test('level data loads without blocking work', async () => {
  const start = performance.now();
  await import(`../generated-levels.js?fresh=${Date.now()}`);
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 500, `importing baked level data took ${elapsed.toFixed(0)}ms; it must not run the generator`);
});

test('every alternate parkur is valid and the same reference program solves it in both syntaxes', () => {
  const game = createGame();
  let scenarios = 0;
  for (const [index, level] of LEVELS.entries()) {
    for (let scenario = 1; scenario <= (level.scenarios?.length || 0); scenario++) {
      scenarios++;
      const board = level.scenarios[scenario - 1];
      assert.equal(new Set(board.grid.map(row => row.length)).size, 1);
      assert.ok(board.grid.length <= 12 && board.grid[0].length <= 20);
      for (const tile of board.grid.join('')) assert.ok(VALID_TILES.has(tile));
      for (const tile of ['M', 'S']) assert.equal([...board.grid.join('')].filter(c => c === tile).length, 1);
      for (const mode of SYNTAX_MODES) {
        game.loadLevel(index, scenario);
        const code = renderBlocks(game.getReferenceSolution().blocks, mode).join('\n');
        const instructions = parseCode(code, mode);
        game.validateInstructionsForLevel(instructions, level);
        game.isRunning = true;
        assert.equal(executeProgram(game, instructions), null, `L${level.id} parkur ${scenario + 1} ${mode}`);
        assert.ok(levelIsSolved(game), `L${level.id} parkur ${scenario + 1} ${mode}`);
      }
    }
  }
  assert.ok(scenarios >= 35);
});

test('a route memorized for the first map fails the second map', () => {
  const game = createGame();
  const index = LEVELS.findIndex(level => level.id === 92);
  game.loadLevel(index);
  const route = planLevelRoute(game.level);
  const code = renderBlocks(encodeActions(route, { allowCompact: true }).blocks).join('\n');
  game.isRunning = true;
  assert.equal(executeProgram(game, parseCode(code)), null);
  assert.ok(levelIsSolved(game));
  game.loadLevel(index, 1);
  game.isRunning = true;
  game.triggerCrashAnimation = () => {};
  executeProgram(game, parseCode(code));
  assert.equal(levelIsSolved(game), false);
});

test('conditional loops unlock at 91 and obey the operation budget without freezing', () => {
  const game = createGame();
  const code = 'iken(hedefteDegilim()):\n    ise(onumdeMuzVar()):\n        ilerle()';
  const instructions = parseCode(code);
  game.loadLevel(89);
  assert.throws(() => game.validateInstructionsForLevel(instructions, game.level), /iken/);
  game.loadLevel(90);
  assert.doesNotThrow(() => game.validateInstructionsForLevel(instructions, game.level));
  let finished = false;
  const messages = [];
  game.onExecutionFinished = () => { finished = true; };
  game.onLogMessage = message => messages.push(message);
  game.runCodeText(code);
  assert.equal(finished, true);
  assert.equal(game.isRunning, false);
  assert.ok(messages.some(message => message.includes('güvenli çalışma sınırı')));
});

test('safe path sensor accounts for both entry time and next turtle phase', () => {
  const game = createGame();
  game.loadLevel(84);
  const turtle = game.turtles[0];
  game.player.x = turtle.x - 1;
  game.player.y = turtle.y;
  game.player.dir = 'RIGHT';
  game.isRunning = true;
  for (let phase = 0; phase < 4; phase++) {
    game.executionStepCount = phase;
    assert.equal(game.evaluateCondition('onumdeGuvenliYolVar'), phase === 0);
  }
});

test('authored arcs have specific hints, reachable mastery and unavoidable mechanics', () => {
  for (const level of LEVELS.filter(level => level.authored)) {
    assert.equal(level.hints.length, 3);
    assert.ok(level.skill && level.mastery && level.solution && level.revision);
    if (level.id >= 70 && level.id <= 80) {
      const blocked = { ...level, grid: level.grid.map(row => row.replaceAll('T', '~')), allowedCommands: commandsForLevel(level.id) };
      assert.equal(planLevelRoute(blocked), null, `L${level.id}: turtle can be bypassed`);
    }
  }
});
