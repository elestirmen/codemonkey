// Görevler ve adalar.
//
// Tasarım kuralları (PLAN.md ayrıntılı anlatır):
// - Haritalar açık adalardır, koridor değildir. Her görevin birden çok çözümü
//   vardır; yıldızlar kısa kodu ödüllendirir (★ çalışan çözüm, ★★ ve ★★★
//   satır hedefleri). Bir rota seçmek görevin parçasıdır.
// - Hedef her zaman aynıdır: bütün muzları topla ve sandığa ulaş. Mojo
//   sandığa bütün muzlarla vardığı anda görev biter.
// - Her ada tek bir yeni düşünme biçimi öğretir. Yapılar (tekrarla, tanimla,
//   ise, iken, değişken) öğretildikleri görevden itibaren açılır.
// - `solution` doğrulanmış örnek çözümdür; 3★ hedefi onun satır sayısıdır.
//   `record`, çözücünün bulduğu daha kısa bir program varsa onun uzunluğudur
//   ve usta meydan okuması olarak gösterilir.

import { FEATURES } from './lang.js?v=20261007-v5';
import { ISLAND_1 } from './levels/island1.js?v=20261007-v5';
import { ISLAND_2 } from './levels/island2.js?v=20261007-v5';
import { ISLAND_3 } from './levels/island3.js?v=20261007-v5';
import { ISLAND_4 } from './levels/island4.js?v=20261007-v5';
import { ISLAND_5 } from './levels/island5.js?v=20261007-v5';

export const ISLANDS = [
  {
    id: 1,
    name: 'Filiz Ormanı',
    concept: 'Sıralama',
    color: '#72d9a5',
    glyph: '❧',
    seal: 'Orman Kaşifi',
    story: 'Her büyük keşif bir adımla başlar.',
    summary: 'Komutları sıraya koy, kaç kare gideceğini söyle, rotanı kendin seç.'
  },
  {
    id: 2,
    name: 'Kemer Takımadaları',
    concept: 'Döngüler',
    color: '#74cce8',
    glyph: '≋',
    seal: 'Köprü Mimarı',
    story: 'Suyun üzerinde aynı ritmi bul; tekrarın gücünü keşfet.',
    summary: 'Tekrar eden kalıbı bul, tekrarla ile kısalt, döngüleri iç içe kur.'
  },
  {
    id: 3,
    name: 'Nilüfer Tapınağı',
    concept: 'Fonksiyonlar',
    color: '#c5a2ef',
    glyph: '❋',
    seal: 'Tapınak Koruyucusu',
    story: 'Tapınağın ustaları bir hareketi bir kez öğretir, sonra adıyla çağırır.',
    summary: 'Kendi komutlarını tanımla; aynı parçayı farklı yerlerde kullan.'
  },
  {
    id: 4,
    name: 'Gelgit Kıyıları',
    concept: 'Koşullar',
    color: '#f4bd78',
    glyph: '◷',
    seal: 'Gelgit Ustası',
    story: 'Gelgit her sabah kıyıyı değiştirir. Bakmadan adım atma.',
    summary: 'ise / degilse ile karar ver; aynı kod her gelgitte çalışsın.'
  },
  {
    id: 5,
    name: 'Bilgelik Zirvesi',
    concept: 'Koşullu döngüler',
    color: '#f1d782',
    glyph: '◇',
    seal: 'Algoritma Ustası',
    story: 'Haritalar değişir. İyi bir algoritma yolunu yine bulur.',
    summary: 'iken ile hedefe kadar yürü, değişkenlerle büyüyen desenler kur.'
  }
];

// Ham görev verisi levels/ klasöründe, adalara göre durur. `teaches` o
// görevde açılan yapıdır; `starter` varsa görev bir hata avıdır ve editör bu
// kodla açılır; `record`, çözücünün bulduğu daha kısa programın uzunluğudur.

const RAW = [ISLAND_1, ISLAND_2, ISLAND_3, ISLAND_4, ISLAND_5]
  .flatMap((levels, i) => levels.map(level => ({ ...level, island: i + 1 })));

// Satır sayımı lang.js'teki puanlamayla aynıdır: örnek çözümler girintiyle
// yazılır, kapanış parantezi içermez; boş ve yorum satırları sayılmaz.
function countSolutionLines(source) {
  return source.split('\n').filter(line => line.trim() && !/^\s*(#|\/\/)/.test(line)).length;
}

function defaultTwoStars(three) {
  return three + Math.max(2, Math.ceil(three / 2));
}

const open = new Set();
export const LEVELS = RAW.map((raw, index) => {
  if (raw.teaches) open.add(raw.teaches);
  const three = raw.stars?.three ?? countSolutionLines(raw.solution);
  return {
    ...raw,
    id: index + 1,
    features: FEATURES.filter(feature => open.has(feature)),
    stars: { three, two: raw.stars?.two ?? defaultTwoStars(three) },
    islandIndex: RAW.slice(0, index).filter(level => level.island === raw.island).length + 1
  };
});

export function levelsOfIsland(island) {
  return LEVELS.filter(level => level.island === island);
}
