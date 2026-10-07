// KodMaymunu dili: ayrıştırıcı, satır sayacı ve biçimlendirici.
//
// Kaynak kod hiçbir zaman eval edilmez: metin satır satır okunur, bloklara
// ayrılır ve küçük bir sözdizimi ağacına (AST) dönüştürülür. Yorumlayıcı
// (interpreter.js) yalnızca bu ağacı yürütür.
//
// Dil bilerek küçüktür ve her şeyi tek bir yoldan yapar:
//   ilerle() / ilerle(3)        tek hareket komutu; sayı verilmezse 1 kare
//   sagaDon() / solaDon()       yerinde 90° dönüş
//   tekrarla(4):                sayılı döngü
//   tanimla kare():             fonksiyon tanımı, kare() ile çağrılır
//   ise(onumBos()): / degilse:  koşul
//   iken(hedefteDegilim()):     koşullu döngü
//   n = 1  /  n = n + 1         değişken
// Bloklar Python gibi girintiyle ya da JavaScript gibi { } ile yazılabilir.

export const COMMANDS = {
  ilerle: { args: 'optional', summary: 'Baktığı yönde ilerler. Sayı verilmezse 1 kare.' },
  sagaDon: { args: 'none', summary: 'Olduğu yerde sağa döner (90°).' },
  solaDon: { args: 'none', summary: 'Olduğu yerde sola döner (90°).' }
};

export const SENSORS = {
  onumBos: 'Önümdeki kare yürünebilir mi?',
  solumBos: 'Solumdaki kare yürünebilir mi?',
  sagimBos: 'Sağımdaki kare yürünebilir mi?',
  hedefteDegilim: 'Sandığın üstünde değil miyim?'
};

const KEYWORDS = new Set(['tekrarla', 'ise', 'degilse', 'iken', 'tanimla']);

// Bir görevin kullanabileceği yapılar. Komutlar her zaman açıktır; yapılar
// müfredatta öğretildikleri adada açılır.
export const FEATURES = ['loop', 'function', 'if', 'while', 'variable'];

export const FEATURE_INFO = {
  loop: { word: 'tekrarla', name: 'Döngüler' },
  function: { word: 'tanimla', name: 'Fonksiyonlar' },
  if: { word: 'ise / degilse', name: 'Koşullar' },
  while: { word: 'iken', name: 'Koşullu döngüler' },
  variable: { word: 'değişken', name: 'Değişkenler' }
};

export const LIMITS = {
  sourceChars: 20000,
  sourceLines: 500,
  number: 1000,
  steps: 100
};

export class CodeError extends Error {
  constructor(line, message, extra = {}) {
    super(line ? `Satır ${line}: ${message}` : message);
    this.name = 'CodeError';
    this.line = line || null;
    this.plain = message;
    Object.assign(this, extra);
  }
}

// ── Okuma yardımcıları ─────────────────────────────────────────────────────

const TURKISH_ASCII = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U', â: 'a', î: 'i', û: 'u' };

// Türkçe klavyeyle yazılan `sağaDön()` ile `sagaDon()` aynı komuttur.
export function foldTurkish(text) {
  return text.replace(/[çğıöşüÇĞİÖŞÜâîû]/g, ch => TURKISH_ASCII[ch]);
}

function stripComment(line) {
  const hash = line.indexOf('#');
  const slashes = line.indexOf('//');
  let cut = line.length;
  if (hash !== -1) cut = Math.min(cut, hash);
  if (slashes !== -1) cut = Math.min(cut, slashes);
  return line.slice(0, cut);
}

function indentWidth(line) {
  let width = 0;
  for (const ch of line) {
    if (ch === ' ') width += 1;
    else if (ch === '\t') width += 4;
    else break;
  }
  return width;
}

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function suggest(name, candidates) {
  const lower = name.toLowerCase();
  let best = null;
  let bestScore = Infinity;
  for (const candidate of candidates) {
    const score = candidate.toLowerCase() === lower ? 0 : editDistance(lower, candidate.toLowerCase());
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return bestScore <= Math.max(1, Math.floor(name.length / 4)) ? best : null;
}

// ── Satırlar → bloklar ─────────────────────────────────────────────────────
// Her iki yazım biçimi de aynı belirteç akışına çevrilir:
//   { kind: 'line', text, line }   bir deyim ya da blok başlığı
//   { kind: 'open', line }         bloğun başladığı yer
//   { kind: 'close', line }        bloğun bittiği yer

const HEADER_RE = /^(tekrarla|ise|iken)\s*\(|^degilse\b|^tanimla\b/;

function isHeader(text) {
  return HEADER_RE.test(text);
}

function readLines(source) {
  const raw = source.replace(/\r\n?/g, '\n').split('\n');
  const lines = [];
  raw.forEach((text, index) => {
    const code = foldTurkish(stripComment(text));
    if (!code.trim()) return;
    lines.push({ line: index + 1, indent: indentWidth(code), text: code.trim() });
  });
  return lines;
}

function indentTokens(lines) {
  const tokens = [];
  const stack = [0];
  let previous = null;
  for (const entry of lines) {
    const top = stack[stack.length - 1];
    if (entry.indent > top) {
      if (!previous || !isHeader(previous.text)) {
        throw new CodeError(entry.line, 'Bu satır neden içeride? Girinti yalnızca tekrarla, ise, degilse, iken ya da tanimla satırlarının altında kullanılır.');
      }
      tokens.push({ kind: 'open', line: entry.line });
      stack.push(entry.indent);
    } else {
      if (previous && isHeader(previous.text)) {
        throw new CodeError(previous.line, `"${previous.text.replace(/:$/, '')}" satırının altına içeride (girintili) en az bir komut yaz.`);
      }
      while (entry.indent < stack[stack.length - 1]) {
        stack.pop();
        tokens.push({ kind: 'close', line: entry.line });
      }
      if (entry.indent !== stack[stack.length - 1]) {
        throw new CodeError(entry.line, 'Girinti hizası tutmuyor. Bu satırı üstündeki bloklardan biriyle aynı hizaya getir.');
      }
    }
    tokens.push({ kind: 'line', text: entry.text.replace(/\s*:\s*$/, ''), line: entry.line, colon: /:\s*$/.test(entry.text) });
    previous = entry;
  }
  if (previous && isHeader(previous.text)) {
    throw new CodeError(previous.line, `"${previous.text.replace(/:$/, '')}" satırının altına içeride (girintili) en az bir komut yaz.`);
  }
  const last = lines.length ? lines[lines.length - 1].line : 0;
  while (stack.length > 1) {
    stack.pop();
    tokens.push({ kind: 'close', line: last });
  }
  return tokens;
}

function bracketTokens(lines) {
  const tokens = [];
  for (const entry of lines) {
    let text = entry.text;
    while (text.startsWith('}')) {
      tokens.push({ kind: 'close', line: entry.line });
      text = text.slice(1).trim();
    }
    let opens = false;
    if (text.endsWith('{')) {
      opens = true;
      text = text.slice(0, -1).trim();
    }
    let closesAfter = 0;
    while (text.endsWith('}')) {
      closesAfter++;
      text = text.slice(0, -1).trim();
    }
    if (text.includes('{') || text.includes('}')) {
      throw new CodeError(entry.line, 'Süslü parantezleri satırın başına ya da sonuna yaz; her satırda tek bir komut olsun.');
    }
    if (text) {
      if (text.endsWith(':')) {
        throw new CodeError(entry.line, 'Bu kodda { } kullanıyorsun; blok başlığının sonuna ":" yerine "{" koy.');
      }
      tokens.push({ kind: 'line', text, line: entry.line });
    }
    if (opens) tokens.push({ kind: 'open', line: entry.line });
    for (let i = 0; i < closesAfter; i++) tokens.push({ kind: 'close', line: entry.line });
  }
  return tokens;
}

// ── İfadeler ───────────────────────────────────────────────────────────────

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function tokenizeExpression(text, line) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === ' ' || ch === '\t') { i++; continue; }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < text.length && /[0-9]/.test(text[j])) j++;
      tokens.push({ type: 'num', value: Number(text.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++;
      tokens.push({ type: 'name', value: text.slice(i, j) });
      i = j;
      continue;
    }
    if ('+-*()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    if (ch === '/') throw new CodeError(line, 'Bölme (/) bu oyunda yok; toplama (+), çıkarma (-) ve çarpma (*) kullanabilirsin.');
    throw new CodeError(line, `"${ch}" işaretini burada anlayamadım. Sayı, değişken adı, + - * ve parantez kullanabilirsin.`);
  }
  return tokens;
}

function parseExpression(text, line, context) {
  const tokens = tokenizeExpression(text, line);
  if (!tokens.length) throw new CodeError(line, 'Parantezin içine bir sayı yazmalısın.');
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];

  const primary = () => {
    const token = take();
    if (!token) throw new CodeError(line, 'İfade yarım kalmış; bir sayı ya da değişken bekliyordum.');
    if (token.type === 'num') {
      if (token.value > LIMITS.number) throw new CodeError(line, `${token.value} çok büyük bir sayı. En fazla ${LIMITS.number} kullanabilirsin.`);
      return { type: 'num', value: token.value };
    }
    if (token.type === 'name') {
      if (peek() && peek().type === 'op' && peek().value === '(') {
        throw new CodeError(line, `${token.value}(...) bir sayı vermez; burada sayı ya da değişken kullan.`);
      }
      context.requireFeature('variable', line, token.value);
      context.useVariable(token.value, line);
      return { type: 'var', name: token.value, line };
    }
    if (token.value === '(') {
      const inner = additive();
      const close = take();
      if (!close || close.value !== ')') throw new CodeError(line, 'Açtığın parantezi kapatmayı unuttun.');
      return inner;
    }
    if (token.value === '-') return { type: 'neg', expr: primary() };
    throw new CodeError(line, `"${token.value}" işaretinden önce bir sayı bekliyordum.`);
  };

  const multiplicative = () => {
    let left = primary();
    while (peek() && peek().type === 'op' && peek().value === '*') {
      take();
      left = { type: 'bin', op: '*', left, right: primary() };
    }
    return left;
  };

  const additive = () => {
    let left = multiplicative();
    while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = take().value;
      left = { type: 'bin', op, left, right: multiplicative() };
    }
    return left;
  };

  const expr = additive();
  if (pos < tokens.length) throw new CodeError(line, 'İfadenin sonunda fazladan bir şey var.');
  return expr;
}

function parseCondition(text, line, context) {
  const trimmed = text.trim();
  if (!trimmed) throw new CodeError(line, 'Parantezin içine bir soru yazmalısın, örneğin onumBos().');
  const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*(\(\s*\))?$/.exec(trimmed);
  if (!match) {
    throw new CodeError(line, `Koşul olarak tek bir soru yazabilirsin: ${Object.keys(SENSORS).map(name => `${name}()`).join(', ')}.`);
  }
  const [, name, parens] = match;
  if (!(name in SENSORS)) {
    if (name in COMMANDS) throw new CodeError(line, `${name}() bir hareket komutu, soru değil. Koşulun içine ${Object.keys(SENSORS).map(n => `${n}()`).join(', ')} gibi bir soru yaz.`);
    const near = suggest(name, Object.keys(SENSORS));
    throw new CodeError(line, near ? `${name} diye bir soru yok. ${near}() mu demek istedin?` : `${name} diye bir soru yok. Kullanabileceğin sorular: ${Object.keys(SENSORS).map(n => `${n}()`).join(', ')}.`);
  }
  if (!parens) throw new CodeError(line, `Sorunun sonuna parantez ekle: ${name}()`);
  return { type: 'sensor', name };
}

// ── Deyimler ───────────────────────────────────────────────────────────────

function splitCall(text) {
  // ad(arg) biçimini, iç içe parantezlere dikkat ederek ayırır.
  const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec(text);
  if (!match) return null;
  let depth = 0;
  const start = match[0].length - 1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') {
      depth--;
      if (depth === 0) {
        return { name: match[1], args: text.slice(start + 1, i), rest: text.slice(i + 1).trim() };
      }
    }
  }
  return { name: match[1], args: text.slice(start + 1), rest: null };
}

function parseHeader(token, context) {
  const { text, line } = token;
  if (/^degilse\b/.test(text)) {
    if (text !== 'degilse') throw new CodeError(line, 'degilse tek başına yazılır: "degilse:" (koşul almaz).');
    return { type: 'else', line };
  }
  if (/^tanimla\b/.test(text)) {
    const match = /^tanimla\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\(\s*\))?$/.exec(text);
    if (!match) throw new CodeError(line, 'Fonksiyonu şöyle tanımla: "tanimla kare():" — addan sonra boş parantez koy.');
    if (!match[2]) throw new CodeError(line, `Fonksiyon adından sonra boş parantez koy: tanimla ${match[1]}():`);
    context.requireFeature('function', line);
    const name = match[1];
    if (name in COMMANDS || name in SENSORS || KEYWORDS.has(name)) {
      throw new CodeError(line, `${name} adı oyunda zaten kullanılıyor; fonksiyonuna başka bir ad ver.`);
    }
    return { type: 'def', name, line };
  }
  const call = splitCall(text);
  if (!call || call.rest === null) throw new CodeError(line, 'Parantezi kapatmayı unuttun.');
  if (call.rest) throw new CodeError(line, `Parantezden sonraki "${call.rest}" kısmını anlayamadım.`);
  if (call.name === 'tekrarla') {
    context.requireFeature('loop', line);
    if (!call.args.trim()) throw new CodeError(line, 'Kaç kez tekrarlanacağını yaz: tekrarla(3):');
    return { type: 'repeat', count: parseExpression(call.args, line, context), line };
  }
  if (call.name === 'ise') {
    context.requireFeature('if', line);
    return { type: 'if', cond: parseCondition(call.args, line, context), line };
  }
  context.requireFeature('while', line);
  return { type: 'while', cond: parseCondition(call.args, line, context), line };
}

function parseSimple(token, context) {
  const { text, line } = token;

  const assign = /^([A-Za-z_][A-Za-z0-9_]*)\s*(\+=|-=|=)(?!=)\s*(.*)$/.exec(text);
  if (assign) {
    const [, name, op, rest] = assign;
    context.requireFeature('variable', line);
    if (name in COMMANDS || name in SENSORS || KEYWORDS.has(name) || context.functionNames.has(name)) {
      throw new CodeError(line, `${name} adı oyunda zaten kullanılıyor; değişkenine başka bir ad ver.`);
    }
    if (!rest.trim()) throw new CodeError(line, `${name} değişkenine hangi değeri vereceğini yaz, örneğin ${name} = 1`);
    if (op !== '=') context.useVariable(name, line);
    const expr = parseExpression(rest, line, context);
    context.defineVariable(name);
    return { type: 'assign', name, op, expr, line };
  }

  const bare = /^([A-Za-z_][A-Za-z0-9_]*)(?:\s+(.*))?$/.exec(text);
  if (bare && !text.includes('(')) {
    const [, name, rest] = bare;
    if (name in COMMANDS) {
      if (rest && /^-?\d+$/.test(rest.trim())) throw new CodeError(line, `Sayıyı parantezin içine yaz: ${name}(${rest.trim()})`);
      throw new CodeError(line, `Komutun sonuna parantez ekle: ${name}()`);
    }
    if (name === 'tekrarla') throw new CodeError(line, 'Döngüyü şöyle yaz: tekrarla(3):');
    if (context.functionNames.has(name) && !rest) throw new CodeError(line, `Fonksiyonu çağırmak için sonuna parantez ekle: ${name}()`);
    if (name === 'ise' || name === 'iken') throw new CodeError(line, `Koşulu parantez içine yaz: ${name}(onumBos()):`);
  }

  const call = splitCall(text);
  if (!call) {
    throw new CodeError(line, `"${text}" satırını anlayamadım. Komutlar ilerle(), sagaDon() gibi parantezle biter.`);
  }
  if (call.rest === null) throw new CodeError(line, 'Parantezi kapatmayı unuttun.');
  if (call.rest) {
    if (call.rest === ':' || call.rest === '{') throw new CodeError(line, `${call.name}() bir blok açamaz; alt satırlar onun içine giremez.`);
    throw new CodeError(line, `Her satıra tek bir komut yaz. "${call.rest}" kısmını alt satıra taşı.`);
  }
  const { name, args } = call;

  if (name in COMMANDS) {
    const spec = COMMANDS[name];
    if (spec.args === 'none') {
      if (args.trim()) {
        throw new CodeError(line, `${name}() sayı almaz. Birden fazla dönmek için komutu tekrar yaz.`);
      }
      return { type: 'cmd', name, arg: null, line };
    }
    if (!args.trim()) return { type: 'cmd', name, arg: null, line };
    return { type: 'cmd', name, arg: parseExpression(args, line, context), line };
  }
  if (name in SENSORS) {
    throw new CodeError(line, `${name}() bir soru; tek başına bir şey yapmaz. ise(${name}()): ya da iken(${name}()): içinde kullan.`);
  }
  if (KEYWORDS.has(name)) {
    throw new CodeError(line, `${name} bir blok başlığı; sonuna ":" koy ve altına girintili komutlar yaz.`);
  }
  if (name === 'adimla' || name === 'geriGit') {
    const count = /^-?\d+$/.test(args.trim()) ? Math.abs(Number(args.trim())) : 2;
    throw new CodeError(line, `${name} artık yok: tek hareket komutu ilerle. ${count} kare için ilerle(${count}) yaz; geri gitmek için önce iki kez dön.`);
  }
  if (args.trim()) {
    if (!context.functionNames.has(name)) {
      const near = suggest(name, Object.keys(COMMANDS));
      throw new CodeError(line, near ? `${name} diye bir komut yok. ${near}() mu demek istedin?` : `${name} diye bir komut yok. Kullanabileceğin komutlar: ilerle(), sagaDon(), solaDon().`);
    }
    throw new CodeError(line, `${name}() fonksiyonları parametre almaz; parantezi boş bırak.`);
  }
  context.callFunction(name, line);
  return { type: 'call', name, line };
}

function parseBlock(stream, context, { inside = false, depth = 0, openLine = null } = {}) {
  const body = [];
  while (stream.pos < stream.tokens.length) {
    const token = stream.tokens[stream.pos];
    if (token.kind === 'close') {
      if (!inside) throw new CodeError(token.line, 'Fazladan bir "}" var; açık bir blok yok.');
      stream.pos++;
      return body;
    }
    if (token.kind === 'open') throw new CodeError(token.line, 'Bu "{" bir blok başlığından sonra gelmeli (tekrarla, ise, iken, tanimla).');
    stream.pos++;

    if (!isHeader(token.text)) {
      if (stream.tokens[stream.pos]?.kind === 'open') {
        throw new CodeError(token.line, 'Yalnızca tekrarla, ise, degilse, iken ve tanimla satırları blok açabilir.');
      }
      body.push(parseSimple(token, context));
      continue;
    }

    const header = parseHeader(token, context);
    if (header.type === 'else') throw new CodeError(token.line, 'degilse yalnızca bir ise bloğunun hemen ardından gelebilir.');
    if (header.type === 'def' && (inside || depth > 0)) {
      throw new CodeError(token.line, 'Fonksiyonları en dışta, hiçbir bloğun içinde olmadan tanımla.');
    }
    const open = stream.tokens[stream.pos];
    if (!open || open.kind !== 'open') {
      throw new CodeError(token.line, `"${token.text}" bloğunun içi boş. Altına (girintili ya da { } içinde) en az bir komut yaz.`);
    }
    stream.pos++;
    header.body = parseBlock(stream, context, { inside: true, depth: depth + 1, openLine: token.line });
    if (!header.body.length) throw new CodeError(token.line, 'Bloğun içi boş kalamaz.');

    if (header.type === 'if') {
      const next = stream.tokens[stream.pos];
      if (next && next.kind === 'line' && /^degilse\b/.test(next.text)) {
        const elseHeader = parseHeader(next, context);
        stream.pos++;
        const elseOpen = stream.tokens[stream.pos];
        if (!elseOpen || elseOpen.kind !== 'open') throw new CodeError(next.line, 'degilse bloğunun içi boş. Altına girintili en az bir komut yaz.');
        stream.pos++;
        header.else = parseBlock(stream, context, { inside: true, depth: depth + 1, openLine: next.line });
        header.elseLine = elseHeader.line;
      } else {
        header.else = null;
      }
    }

    if (header.type === 'def') {
      if (context.functions.has(header.name)) throw new CodeError(token.line, `${header.name} fonksiyonunu iki kez tanımladın.`);
      context.functions.set(header.name, header);
      continue;
    }
    body.push(header);
  }
  if (inside) throw new CodeError(openLine, 'Bu satırda açtığın blok kapanmamış; sonuna bir "}" eksik.');
  return body;
}

function createContext(features) {
  const enabled = new Set(features);
  const context = {
    functions: new Map(),
    functionNames: new Set(),
    calls: [],
    variables: new Set(),
    pendingVariables: [],
    features: enabled,
    used: new Set(),
    requireFeature(feature, line, name = null) {
      if (!enabled.has(feature)) {
        const info = FEATURE_INFO[feature];
        if (feature === 'variable' && name) {
          throw new CodeError(line, `"${name}" ne demek anlayamadım. Burada bir sayı yazmalısın (değişkenler sonraki adalarda açılır).`, { locked: feature });
        }
        throw new CodeError(line, `${info.name} (${info.word}) bu görevde henüz açık değil. Kullanabileceğin komutlar alttaki komut paletinde.`, { locked: feature });
      }
      this.used.add(feature);
    },
    useVariable(name, line) {
      this.pendingVariables.push({ name, line });
    },
    defineVariable(name) {
      this.variables.add(name);
    },
    callFunction(name, line) {
      this.calls.push({ name, line });
    }
  };
  return context;
}

// Kaynağı ayrıştırır. `features` görevde açık olan yapıları sınırlar.
export function parseProgram(source, { features = FEATURES } = {}) {
  if (typeof source !== 'string') throw new CodeError(null, 'Kod okunamadı.');
  if (source.length > LIMITS.sourceChars || source.split('\n').length > LIMITS.sourceLines) {
    throw new CodeError(null, `Kod çok uzun. En fazla ${LIMITS.sourceLines} satır yazabilirsin.`);
  }
  const lines = readLines(source);
  const bracketMode = lines.some(entry => entry.text.includes('{') || entry.text.includes('}'));
  const tokens = bracketMode ? bracketTokens(lines) : indentTokens(lines);
  const context = createContext(features);

  // Fonksiyon adlarını önce topla ki tanımdan önce çağrılabilsinler.
  for (const token of tokens) {
    if (token.kind !== 'line') continue;
    const match = /^tanimla\s+([A-Za-z_][A-Za-z0-9_]*)/.exec(token.text);
    if (match) context.functionNames.add(match[1]);
  }

  const body = parseBlock({ tokens, pos: 0 }, context);

  for (const call of context.calls) {
    if (!context.functions.has(call.name)) {
      const known = [...Object.keys(COMMANDS), ...context.functions.keys()];
      const near = suggest(call.name, known);
      if (near) throw new CodeError(call.line, `${call.name} diye bir komut yok. ${near}() mu demek istedin?`);
      if (features.includes('function')) {
        throw new CodeError(call.line, `${call.name} diye bir komut ya da fonksiyon yok. Fonksiyonsa önce "tanimla ${call.name}():" ile tanımla.`);
      }
      throw new CodeError(call.line, `${call.name} diye bir komut yok. Kullanabileceğin komutlar: ilerle(), sagaDon(), solaDon().`);
    }
  }
  for (const use of context.pendingVariables) {
    if (!context.variables.has(use.name)) {
      throw new CodeError(use.line, `${use.name} değişkenine hiç değer vermedin. Önce "${use.name} = 1" gibi bir satır yaz.`);
    }
  }

  const program = {
    body,
    functions: context.functions,
    lines: lines.length,
    syntax: bracketMode ? 'bracket' : 'indent',
    usedFeatures: context.used
  };
  program.lineCount = countLines(program);
  return program;
}

// ── Puanlama ───────────────────────────────────────────────────────────────
// Puan, programın etkin satır sayısıdır: her komut, her blok başlığı ve her
// "degilse" bir satırdır; kapanış parantezleri ve yorumlar sayılmaz. Böylece
// iki yazım biçimi aynı programa aynı puanı verir.

function countBlock(body) {
  let total = 0;
  for (const node of body) {
    total += 1;
    if (node.body) total += countBlock(node.body);
    if (node.else) total += 1 + countBlock(node.else);
  }
  return total;
}

export function countLines(program) {
  let total = countBlock(program.body);
  for (const fn of program.functions.values()) total += 1 + countBlock(fn.body);
  return total;
}

// ── Biçimlendirici ─────────────────────────────────────────────────────────

function formatExpression(expr, parentPrec = 0) {
  if (expr.type === 'num') return String(expr.value);
  if (expr.type === 'var') return expr.name;
  if (expr.type === 'neg') return `-${formatExpression(expr.expr, 3)}`;
  const prec = expr.op === '*' ? 2 : 1;
  const text = `${formatExpression(expr.left, prec)} ${expr.op} ${formatExpression(expr.right, prec + (expr.op === '-' ? 1 : 0))}`;
  return prec < parentPrec ? `(${text})` : text;
}

function formatBody(body, syntax, depth, out) {
  const indent = syntax === 'indent' ? '    ' : '  ';
  const pad = indent.repeat(depth);
  const open = syntax === 'indent' ? ':' : ' {';
  for (const node of body) {
    switch (node.type) {
      case 'cmd':
        out.push(`${pad}${node.name}(${node.arg ? formatExpression(node.arg) : ''})`);
        break;
      case 'call':
        out.push(`${pad}${node.name}()`);
        break;
      case 'assign':
        out.push(`${pad}${node.name} ${node.op} ${formatExpression(node.expr)}`);
        break;
      case 'repeat':
        out.push(`${pad}tekrarla(${formatExpression(node.count)})${open}`);
        formatBody(node.body, syntax, depth + 1, out);
        if (syntax === 'bracket') out.push(`${pad}}`);
        break;
      case 'while':
        out.push(`${pad}iken(${node.cond.name}())${open}`);
        formatBody(node.body, syntax, depth + 1, out);
        if (syntax === 'bracket') out.push(`${pad}}`);
        break;
      case 'if':
        out.push(`${pad}ise(${node.cond.name}())${open}`);
        formatBody(node.body, syntax, depth + 1, out);
        if (node.else) {
          out.push(syntax === 'indent' ? `${pad}degilse:` : `${pad}} degilse {`);
          formatBody(node.else, syntax, depth + 1, out);
        }
        if (syntax === 'bracket') out.push(`${pad}}`);
        break;
      default:
        break;
    }
  }
}

// Programı seçilen yazım biçiminde yeniden yazar (örnek çözümler için).
export function formatProgram(program, syntax = 'indent') {
  const out = [];
  for (const fn of program.functions.values()) {
    out.push(`tanimla ${fn.name}()${syntax === 'indent' ? ':' : ' {'}`);
    formatBody(fn.body, syntax, 1, out);
    if (syntax === 'bracket') out.push('}');
    out.push('');
  }
  formatBody(program.body, syntax, 0, out);
  return out.join('\n');
}

// Bir kaynak metni başka bir yazım biçimine çevirir; ayrıştırılamıyorsa
// metni olduğu gibi bırakır (öğrencinin yarım kodu kaybolmasın).
export function convertSyntax(source, syntax) {
  try {
    const program = parseProgram(source);
    if (program.syntax === syntax) return source;
    const comments = source.split('\n').filter(line => /^\s*(#|\/\/)/.test(line)).map(line => line.trim());
    const body = formatProgram(program, syntax);
    return comments.length ? `${comments.join('\n')}\n${body}` : body;
  } catch (_) {
    return source;
  }
}
