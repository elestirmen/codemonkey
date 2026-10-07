// Ada modeli: harita, Mojo'nun durumu ve oyunun bütün kuralları.
//
// Kurallar tek yerde ve görünür biçimde durur; çizim, ses ve arayüz yalnızca
// buradaki durumu okur. Dünya deterministiktir: aynı program aynı haritada her
// zaman aynı sonucu verir. Bu yüzden "bir adım geri" ve parkur testleri
// programı baştan yeniden oynatarak yapılabilir.
//
// Harita alfabesi
//   .  çimen / kum (yürünür)       #  ağaç ya da kaya (geçilmez)
//   ~  su (geçilmez)               =  köprü (yürünür)
//   M  Mojo'nun başlangıcı         S  hedef sandık
//   B  muz (üstünden geçince alınır)
//   K  anahtar (alınınca kapılar açılır)
//   G  kapı (anahtarlar toplanana kadar geçilmez)
// Haritanın dışı denizdir: adanın kenarından çıkmak suya düşmek demektir.

export const DIRECTIONS = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

const DIRECTION_ALIASES = { N: 'UP', E: 'RIGHT', S: 'DOWN', W: 'LEFT', UP: 'UP', RIGHT: 'RIGHT', DOWN: 'DOWN', LEFT: 'LEFT' };

export const DIRECTION_NAMES = { UP: 'KUZEY', RIGHT: 'DOĞU', DOWN: 'GÜNEY', LEFT: 'BATI' };

export function directionOffset(dir) {
  switch (dir) {
    case 'UP': return { dx: 0, dy: -1 };
    case 'RIGHT': return { dx: 1, dy: 0 };
    case 'DOWN': return { dx: 0, dy: 1 };
    case 'LEFT': return { dx: -1, dy: 0 };
    default: return { dx: 0, dy: 0 };
  }
}

export function turnDirection(dir, side) {
  const index = DIRECTIONS.indexOf(dir);
  return DIRECTIONS[(index + (side === 'right' ? 1 : 3)) % 4];
}


const TERRAIN = new Set(['.', '#', '~', '=', 'M', 'S', 'B', 'K', 'G']);

export class World {
  // rows: harita satırları; dir: Mojo'nun başlangıçta baktığı yön.
  static parse(rows, dir = 'RIGHT') {
    if (!Array.isArray(rows) || !rows.length) throw new Error('Harita boş.');
    const width = rows[0].length;
    const tiles = [];
    const bananas = [];
    const keys = [];
    let start = null;
    let chest = null;
    rows.forEach((row, y) => {
      if (row.length !== width) throw new Error(`Harita satırı ${y + 1} diğerleriyle aynı uzunlukta değil.`);
      for (let x = 0; x < width; x++) {
        const ch = row[x];
        if (!TERRAIN.has(ch)) throw new Error(`Haritada bilinmeyen karo: "${ch}" (${x}, ${y}).`);
        if (ch === 'M') {
          if (start) throw new Error('Haritada birden fazla M var.');
          start = { x, y };
        } else if (ch === 'S') {
          if (chest) throw new Error('Haritada birden fazla sandık var.');
          chest = { x, y };
        } else if (ch === 'B') bananas.push({ x, y });
        else if (ch === 'K') keys.push({ x, y });
        tiles.push(ch === 'M' || ch === 'S' || ch === 'B' || ch === 'K' ? '.' : ch);
      }
    });
    if (!start) throw new Error('Haritada Mojo (M) yok.');
    if (!chest) throw new Error('Haritada sandık (S) yok.');
    const facing = DIRECTION_ALIASES[dir];
    if (!facing) throw new Error(`Bilinmeyen yön: ${dir}`);
    return new World({ width, height: rows.length, tiles, bananas, keys, start, chest, dir: facing });
  }

  constructor(base) {
    this.base = base;
    this.width = base.width;
    this.height = base.height;
    this.tiles = base.tiles;
    this.chest = base.chest;
    this.reset();
  }

  reset() {
    const { start, dir, bananas, keys } = this.base;
    this.x = start.x;
    this.y = start.y;
    this.dir = dir;
    this.bananas = bananas.map(b => ({ ...b, collected: false }));
    this.keys = keys.map(k => ({ ...k, collected: false }));
    this.steps = 0;
    this.turns = 0;
    this.trail = [{ x: start.x, y: start.y }];
    return this;
  }

  clone() {
    const copy = new World(this.base);
    copy.x = this.x;
    copy.y = this.y;
    copy.dir = this.dir;
    copy.bananas = this.bananas.map(b => ({ ...b }));
    copy.keys = this.keys.map(k => ({ ...k }));
    copy.steps = this.steps;
    copy.turns = this.turns;
    copy.trail = this.trail.map(c => ({ ...c }));
    return copy;
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  terrain(x, y) {
    return this.inBounds(x, y) ? this.tiles[y * this.width + x] : null;
  }

  get gatesOpen() {
    return this.keys.every(k => k.collected);
  }

  // Bir kareye neden girilemediğini söyler; girilebiliyorsa null.
  blockReason(x, y) {
    const cell = this.terrain(x, y);
    if (cell === null) return 'edge';
    if (cell === '#') return 'rock';
    if (cell === '~') return 'water';
    if (cell === 'G' && !this.gatesOpen) return 'gate';
    return null;
  }

  walkable(x, y) {
    return this.blockReason(x, y) === null;
  }

  ahead(side = null) {
    const dir = side ? turnDirection(this.dir, side) : this.dir;
    const { dx, dy } = directionOffset(dir);
    return { x: this.x + dx, y: this.y + dy };
  }

  // Bir kare ilerler. Engel varsa Mojo yerinde kalır ve sebep döner.
  forward() {
    const from = { x: this.x, y: this.y };
    const to = this.ahead();
    const reason = this.blockReason(to.x, to.y);
    if (reason) return { ok: false, from, to, reason };
    this.x = to.x;
    this.y = to.y;
    this.steps++;
    this.trail.push({ x: to.x, y: to.y });
    const event = { ok: true, from, to, banana: null, key: null, gateOpened: false };
    const banana = this.bananas.find(b => !b.collected && b.x === to.x && b.y === to.y);
    if (banana) {
      banana.collected = true;
      event.banana = banana;
    }
    const key = this.keys.find(k => !k.collected && k.x === to.x && k.y === to.y);
    if (key) {
      key.collected = true;
      event.key = key;
      event.gateOpened = this.gatesOpen;
    }
    return event;
  }

  turn(side) {
    this.dir = turnDirection(this.dir, side);
    this.turns++;
    return { ok: true, dir: this.dir };
  }

  sense(name) {
    switch (name) {
      case 'onumBos': {
        const cell = this.ahead();
        return this.walkable(cell.x, cell.y);
      }
      case 'solumBos': {
        const cell = this.ahead('left');
        return this.walkable(cell.x, cell.y);
      }
      case 'sagimBos': {
        const cell = this.ahead('right');
        return this.walkable(cell.x, cell.y);
      }
      case 'hedefteDegilim':
        return !(this.x === this.chest.x && this.y === this.chest.y);
      default:
        throw new Error(`Bilinmeyen soru: ${name}`);
    }
  }

  get bananasLeft() {
    return this.bananas.reduce((n, b) => n + (b.collected ? 0 : 1), 0);
  }

  get onChest() {
    return this.x === this.chest.x && this.y === this.chest.y;
  }

  get won() {
    return this.onChest && this.bananasLeft === 0;
  }
}
