// Yorumlayıcı: ayrıştırılmış programı bir dünyada adım adım yürütür.
//
// `execute` bir üreteçtir (generator). Her görünür olayda durur ve olayı
// verir: bir kare ilerleme, bir dönüş, bir sorunun cevabı, bir değişkenin yeni
// değeri. Arayüz bu olayları istediği hızda canlandırır; testler ve görev
// doğrulayıcı aynı üreteci beklemeden sonuna kadar çalıştırır. Böylece oyunun
// kuralları tek bir yerde kalır.

import { CodeError } from './lang.js?v=20261007-v5';

export const RUN_LIMITS = {
  operations: 4000,
  callDepth: 30,
  stepsPerMove: 100,
  repeatCount: 1000
};

class Halt {
  constructor(event) {
    this.event = event;
  }
}

function evaluate(expr, vars, line) {
  switch (expr.type) {
    case 'num':
      return expr.value;
    case 'var':
      if (!vars.has(expr.name)) throw new CodeError(line, `${expr.name} değişkenine henüz bir değer verilmedi.`);
      return vars.get(expr.name);
    case 'neg':
      return -evaluate(expr.expr, vars, line);
    case 'bin': {
      const left = evaluate(expr.left, vars, line);
      const right = evaluate(expr.right, vars, line);
      const value = expr.op === '+' ? left + right : expr.op === '-' ? left - right : left * right;
      if (Math.abs(value) > 1_000_000) throw new CodeError(line, 'Sayı çok büyüdü. Değişkenini kontrol et.');
      return value;
    }
    default:
      throw new CodeError(line, 'İfade okunamadı.');
  }
}

export function* execute(program, world, limits = {}) {
  const max = { ...RUN_LIMITS, ...limits };
  const vars = new Map();
  const loops = [];
  const calls = [];
  let operations = 0;

  const snapshot = () => loops.map(loop => ({ ...loop }));
  const tick = line => {
    operations++;
    if (operations > max.operations) {
      throw new Halt({
        kind: 'fail',
        reason: 'budget',
        line,
        message: 'Program çok uzun sürdü; sonsuz bir döngü olabilir. Döngünün bir gün bitmesini sağlayan bir hareket var mı?'
      });
    }
  };

  function* runBody(body) {
    for (const node of body) {
      tick(node.line);
      switch (node.type) {
        case 'cmd': {
          if (node.name === 'ilerle') {
            const count = node.arg ? evaluate(node.arg, vars, node.line) : 1;
            if (count < 1) throw new CodeError(node.line, `ilerle en az 1 kare olmalı; parantezdeki değer ${count}.`);
            if (count > max.stepsPerMove) throw new CodeError(node.line, `Tek komutla en fazla ${max.stepsPerMove} kare ilerleyebilirsin.`);
            for (let i = 1; i <= count; i++) {
              if (i > 1) tick(node.line);
              const result = world.forward();
              if (!result.ok) {
                throw new Halt({ kind: 'fail', reason: result.reason, line: node.line, from: result.from, to: result.to, part: i, of: count, loops: snapshot() });
              }
              yield { kind: 'move', line: node.line, part: i, of: count, loops: snapshot(), calls: [...calls], ...result };
              if (world.won) throw new Halt({ kind: 'win', line: node.line });
            }
          } else {
            const side = node.name === 'sagaDon' ? 'right' : 'left';
            const result = world.turn(side);
            yield { kind: 'turn', line: node.line, side, dir: result.dir, loops: snapshot(), calls: [...calls] };
          }
          break;
        }
        case 'call': {
          const fn = program.functions.get(node.name);
          if (calls.length >= max.callDepth) {
            throw new CodeError(node.line, 'Fonksiyonlar birbirini çok fazla çağırdı. Bir fonksiyon kendini durmadan çağırıyor olabilir.');
          }
          yield { kind: 'call', line: node.line, name: node.name, loops: snapshot(), calls: [...calls] };
          calls.push({ name: node.name, line: node.line });
          // Fonksiyonun içindeki döngüler çağıranın döngülerinden ayrı sayılır.
          const saved = loops.splice(0, loops.length);
          try {
            yield* runBody(fn.body);
          } finally {
            loops.splice(0, loops.length, ...saved);
            calls.pop();
          }
          break;
        }
        case 'assign': {
          let value = evaluate(node.expr, vars, node.line);
          if (node.op !== '=') {
            if (!vars.has(node.name)) throw new CodeError(node.line, `${node.name} değişkenine henüz bir değer verilmedi.`);
            value = node.op === '+=' ? vars.get(node.name) + value : vars.get(node.name) - value;
          }
          vars.set(node.name, value);
          yield { kind: 'assign', line: node.line, name: node.name, value, vars: Object.fromEntries(vars), loops: snapshot(), calls: [...calls] };
          break;
        }
        case 'repeat': {
          const count = evaluate(node.count, vars, node.line);
          if (count < 0) throw new CodeError(node.line, `tekrarla negatif sayıda çalışamaz (${count}).`);
          if (count > max.repeatCount) throw new CodeError(node.line, `tekrarla en fazla ${max.repeatCount} kez çalışabilir.`);
          const loop = { line: node.line, iteration: 0, count };
          loops.push(loop);
          try {
            for (let i = 1; i <= count; i++) {
              loop.iteration = i;
              if (i > 1) tick(node.line);
              yield* runBody(node.body);
            }
          } finally {
            loops.pop();
          }
          break;
        }
        case 'if': {
          const value = world.sense(node.cond.name);
          yield { kind: 'sense', line: node.line, sensor: node.cond.name, value, loops: snapshot(), calls: [...calls] };
          if (value) yield* runBody(node.body);
          else if (node.else) yield* runBody(node.else);
          break;
        }
        case 'while': {
          const loop = { line: node.line, iteration: 0, count: null };
          loops.push(loop);
          try {
            for (;;) {
              const value = world.sense(node.cond.name);
              yield { kind: 'sense', line: node.line, sensor: node.cond.name, value, loops: snapshot(), calls: [...calls] };
              if (!value) break;
              loop.iteration++;
              yield* runBody(node.body);
              tick(node.line);
            }
          } finally {
            loops.pop();
          }
          break;
        }
        default:
          throw new CodeError(node.line, 'Bu satır çalıştırılamadı.');
      }
    }
  }

  try {
    yield* runBody(program.body);
    yield { kind: 'end', bananasLeft: world.bananasLeft, onChest: world.onChest };
  } catch (error) {
    if (error instanceof Halt) {
      yield error.event;
      return;
    }
    if (error instanceof CodeError) {
      yield { kind: 'fail', reason: 'runtime', line: error.line, message: error.plain };
      return;
    }
    throw error;
  }
}

// Programı beklemeden sonuna kadar çalıştırır ve son olayı döndürür.
export function runToEnd(program, world, limits) {
  let last = null;
  let count = 0;
  for (const event of execute(program, world, limits)) {
    last = event;
    count++;
  }
  return { result: last, events: count, world };
}
