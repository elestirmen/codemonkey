// Ada 5 · Bilgelik Zirvesi · Koşullu döngüler ve değişkenler
// iken, kaç kez döneceğini bilmediğin yerlerde (bir duvara kadar, labirentte)
// işe yarar; değişken bir sayıyı hatırlar ve değiştirir (sarmallar, sayma).
// Birden çok parkurlu görevlerde hiçbir sabit program 3★ sınırına inemez.

export const ISLAND_5 = [
  {
    title: 'Duvara Kadar',
    concept: 'Koşullu döngü',
    teaches: 'while',
    text: 'Duvara olan uzaklık her parkurda farklı. <code>iken(onumBos()):</code> Mojo\'yu <b>önü boş olduğu sürece</b> yürütür; duvara gelince döngü kendiliğinden biter.',
    dir: 'E',
    scenarios: [
      { map: [
        '...........',
        '.M..B..#...',
        '......B....',
        '......S....',
        '...........'
      ] },
      { map: [
        '...........',
        '.M.B#......',
        '...B.......',
        '...S.......',
        '...........'
      ] },
      { map: [
        '...........',
        '.M.....B.B#',
        '.........B.',
        '.........S.',
        '...........'
      ] }
    ],
    solution: 'iken(onumBos()):\n    ilerle()\nsagaDon()\nilerle(2)',
    stars: { two: 6 },
    hints: [
      'Kaç kare gideceğini bilmiyorsun; Mojo\'nun önü boş olduğu sürece ilerlemesi yeterli.',
      '<code>iken(onumBos()):</code> içine <code>ilerle()</code> yaz.',
      'Duvara gelince <code>sagaDon()</code> ve <code>ilerle(2)</code>.'
    ]
  },
  {
    title: 'Teras Basamakları',
    concept: 'İç içe döngü',
    text: 'Zirveye teraslarla çıkılıyor ve terasların uzunluğu her parkurda farklı. Terasın sonuna kadar yürü, bir basamak çık, tekrarla… <b>sandığa varana kadar</b>.',
    dir: 'E',
    scenarios: [
      { map: [
        '..............',
        '..............',
        '............S.',
        '.........B.#..',
        '......B#...###',
        '.M.B.#.#######',
        '.....#########'
      ] },
      { map: [
        '..............',
        '..............',
        '.........B.S..',
        '.........#....',
        '...B...B######',
        '.M..#...######',
        '....##########'
      ] },
      { map: [
        '..............',
        '..............',
        '..........B.S.',
        '......B...#...',
        '.......#..####',
        '.M...B########',
        '......########'
      ] }
    ],
    solution: 'iken(hedefteDegilim()):\n    iken(onumBos()):\n        ilerle()\n    solaDon()\n    ilerle()\n    sagaDon()',
    stars: { two: 9 },
    hints: [
      'Bir teras: önün boşken ilerle. Sonra bir basamak çık: sola dön, ilerle, sağa dön.',
      'Bunu sandığa varana kadar yap: dıştaki döngü <code>iken(hedefteDegilim()):</code>.',
      'İç döngü <code>iken(onumBos()):</code> → <code>ilerle()</code>; ardından <code>solaDon()</code>, <code>ilerle()</code>, <code>sagaDon()</code>.'
    ]
  },
  {
    title: 'Sonsuz Döngü',
    concept: 'Hata ayıklama',
    text: 'Bu programın ikinci döngüsü hiç bitmiyor: Mojo olduğu yerde dönüp duruyor. Bir döngü, içinde <b>cevabı değiştiren</b> bir şey olmadıkça bitmez!',
    dir: 'E',
    scenarios: [
      { map: [
        '..........',
        '.M.B..#...',
        '.....B....',
        '.....S....',
        '..........'
      ] },
      { map: [
        '..........',
        '.M..B...#.',
        '..........',
        '.......B..',
        '.......S..'
      ] }
    ],
    starter: 'iken(onumBos()):\n    ilerle()\nsagaDon()\niken(hedefteDegilim()):\n    sagaDon()',
    solution: 'iken(onumBos()):\n    ilerle()\nsagaDon()\niken(hedefteDegilim()):\n    ilerle()',
    stars: { two: 7 },
    hints: [
      'Çalıştır: Mojo ikinci döngüde ne yapıyor?',
      'Olduğu yerde dönmek Mojo\'yu sandığa yaklaştırmaz; <code>hedefteDegilim()</code> cevabı hiç değişmez.',
      'İkinci döngünün içine <code>sagaDon()</code> yerine <code>ilerle()</code> yaz.'
    ]
  },
  {
    title: 'Sağ El Kuralı',
    concept: 'Algoritma',
    text: 'Labirent her parkurda başka! Eski bir kâşif sırrı: <b>sağ elini duvardan hiç ayırma</b>. Sağın boşsa sağa dön ve ilerle; değilse önün boşsa ilerle; o da değilse sola dön.',
    dir: 'E',
    scenarios: [
      { map: [
        '#############',
        '#M..#....B..#',
        '###.#.#####.#',
        '#...#.#.B.#.#',
        '#.###.#.#.#.#',
        '#...#...#.#.#',
        '###.#####.#.#',
        '#..B......#S#',
        '#############'
      ] },
      { map: [
        '#############',
        '#M...B.....B#',
        '###########.#',
        '#.#.....#...#',
        '#.#.#.#.#B###',
        '#...#.#.#...#',
        '#.###.#####.#',
        '#...#......S#',
        '#############'
      ] },
      { map: [
        '#############',
        '#M....#....B#',
        '#####.###.#.#',
        '#...#...#.#.#',
        '#.#####.#.#.#',
        '#.#.B...#.#.#',
        '#.#.#####.#.#',
        '#....B....#S#',
        '#############'
      ] }
    ],
    solution: 'iken(hedefteDegilim()):\n    ise(sagimBos()):\n        sagaDon()\n        ilerle()\n    degilse:\n        ise(onumBos()):\n            ilerle()\n        degilse:\n            solaDon()',
    stars: { two: 13 },
    hints: [
      'Kıyıyı İzle görevindeki kuralı hatırla; burada denizin yerine duvar var.',
      'Dış döngü: <code>iken(hedefteDegilim()):</code>.',
      'İçeride: <code>ise(sagimBos()):</code> → <code>sagaDon()</code>, <code>ilerle()</code>; <code>degilse:</code> → <code>ise(onumBos()):</code> <code>ilerle()</code> / <code>degilse:</code> <code>solaDon()</code>.'
    ]
  },
  {
    title: 'Büyük Labirent',
    concept: 'Algoritma',
    text: 'Bu labirentler daha büyük ve muzlar çıkmaz sokaklarda. İyi bir algoritma haritanın boyutuna aldırmaz: aynı kuralın yine işe yarıyor mu?',
    dir: 'E',
    scenarios: [
      { map: [
        '#################',
        '#M..#.........#.#',
        '###.#.#######.#.#',
        '#.#.#.#B....#...#',
        '#.#.#B#.#######.#',
        '#.#.#.#...#....B#',
        '#B#.#.###.#.#####',
        '#...#...#.#.#...#',
        '#.#####.#.#.###.#',
        '#.......#......S#',
        '#################'
      ] },
      { map: [
        '#################',
        '#M....#.....B.#.#',
        '#####.#.#####.#.#',
        '#.#...#...#...#.#',
        '#.#.#####.#.###.#',
        '#.#...#...#.#...#',
        '#.###.#.###.###.#',
        '#...#B..#.#.#...#',
        '#.#######.#.#.#.#',
        '#......B....B.#S#',
        '#################'
      ] },
      { map: [
        '#################',
        '#M..........#...#',
        '###########B#.#.#',
        '#...#.......#.#.#',
        '#.#.#.#######.#.#',
        '#.#...#.....#.#.#',
        '#.#####.###.###.#',
        '#.#.....#.#.#...#',
        '#B#####.#.#B#.#.#',
        '#.......#.....#S#',
        '#################'
      ] }
    ],
    solution: 'iken(hedefteDegilim()):\n    ise(sagimBos()):\n        sagaDon()\n        ilerle()\n    degilse:\n        ise(onumBos()):\n            ilerle()\n        degilse:\n            solaDon()',
    stars: { two: 13 },
    hints: [
      'Önceki görevdeki kodun bu labirentlerde de çalışmalı.',
      'Sağ el kuralı çıkmaz sokaklara da girer ve geri döner; muzlar orada.',
      'Kodunu kısaltmaya çalış: kural 9 satır.'
    ]
  },
  {
    title: 'Büyüyen Adımlar',
    concept: 'Değişken',
    teaches: 'variable',
    text: 'Muzlar dışa doğru açılan bir sarmalda: Mojo 1, 2, 3, 4… kare gidiyor. Her turda büyüyen sayıyı bir <b>değişkende</b> tut: <code>n = n + 1</code>.',
    map: [
      '...............',
      '.....B.....B...',
      '...............',
      '.......B.B.....',
      '.......M.......',
      '...............',
      '.....B...B.....',
      '...............',
      '...S.......B...',
      '...............'
    ],
    dir: 'N',
    solution: 'n = 1\ntekrarla(8):\n    ilerle(n)\n    sagaDon()\n    n = n + 1',
    stars: { two: 9 },
    hints: [
      'Her kolda bir öncekinden bir kare fazla yürüyorsun.',
      '<code>n = 1</code> ile başla. Döngüde <code>ilerle(n)</code>, <code>sagaDon()</code>, <code>n = n + 1</code>.',
      'Sarmal 8 koldan oluşuyor: <code>tekrarla(8):</code>.'
    ]
  },
  {
    title: 'İçe Doğru',
    concept: 'Değişken',
    text: 'Bu sarmal dışarıdan içeriye kıvrılıyor: her kol bir öncekinden <b>bir kare kısa</b>. Değişkeni büyütmek yerine küçült!',
    map: [
      '............',
      '.B.....B....',
      '............',
      '...B.B......',
      '.....S......',
      '............',
      '...B...B....',
      '............',
      '.M..........'
    ],
    dir: 'N',
    solution: 'n = 7\ntekrarla(7):\n    ilerle(n)\n    sagaDon()\n    n = n - 1',
    stars: { two: 9 },
    hints: [
      'İlk kol 7 kare. Sonra 6, 5, 4…',
      '<code>n = 7</code> ile başla ve her turda <code>n = n - 1</code>.',
      '<code>tekrarla(7):</code> içinde <code>ilerle(n)</code>, <code>sagaDon()</code>, <code>n = n - 1</code>.'
    ]
  },
  {
    title: 'Büyüyen Merdiven',
    concept: 'Değişken',
    text: 'Kayalara oyulmuş bu merdivenin her basamağı bir öncekinden büyük: 1, 2, 3. Bir basamağı yaz, boyunu değişkenle büyüt.',
    map: [
      '...........',
      '.MB........',
      '.#B.B......',
      '.###.......',
      '.###B..B...',
      '.######....',
      '.######....',
      '.######S...',
      '.#######...'
    ],
    dir: 'E',
    solution: 'n = 1\ntekrarla(3):\n    ilerle(n)\n    sagaDon()\n    ilerle(n)\n    solaDon()\n    n = n + 1',
    stars: { two: 10 },
    hints: [
      'Bir basamak: <code>ilerle(n)</code>, <code>sagaDon()</code>, <code>ilerle(n)</code>, <code>solaDon()</code>.',
      'Her basamaktan sonra <code>n = n + 1</code>.',
      '<code>n = 1</code> ile başla ve basamağı <code>tekrarla(3):</code> içine al.'
    ]
  },
  {
    title: 'Sıfırdan Başlama',
    concept: 'Hata ayıklama',
    text: 'Bu sarmal programı ilk satırda takılıyor. Mojo\'nun söylediğini oku: değişken hangi değerle başlıyor?',
    map: [
      '..B......B...',
      '.............',
      '....B..B.....',
      '.............',
      '......MB.....',
      '.............',
      '....B....B...',
      '.............',
      '..S..........'
    ],
    dir: 'E',
    starter: 'n = 0\ntekrarla(8):\n    ilerle(n)\n    solaDon()\n    n = n + 1',
    solution: 'n = 1\ntekrarla(8):\n    ilerle(n)\n    solaDon()\n    n = n + 1',
    stars: { two: 7 },
    hints: [
      'Çalıştır ve hata mesajını oku: <code>ilerle</code> kaç kare istiyor?',
      '<code>ilerle(0)</code> anlamsız: Mojo en az 1 kare ilerler.',
      'İlk satırı <code>n = 1</code> yap.'
    ]
  },
  {
    title: 'Say ve Dön',
    concept: 'Değişken + iken',
    text: 'Dağ patikasında ilk yol bir kayada bitiyor; aşağı inen yol ise uzayıp gidiyor. Sandık, <b>ilk yol kadar</b> indikten sonra sağda. Yürürken adımlarını say!',
    dir: 'E',
    scenarios: [
      { map: [
        '~~~~~~~~~~',
        '~M.B.#~~~~',
        '~~~~.~~~~~',
        '~~~~B~~~~~',
        '~~~~..S~~~',
        '~~~~.~~~~~',
        '~~~~.~~~~~',
        '~~~~.~~~~~'
      ] },
      { map: [
        '~~~~~~~~~~',
        '~M.B...#~~',
        '~~~~~~.~~~',
        '~~~~~~.~~~',
        '~~~~~~B~~~',
        '~~~~~~.~~~',
        '~~~~~~..S~',
        '~~~~~~.~~~'
      ] },
      { map: [
        '~~~~~~~~~~',
        '~MB#~~~~~~',
        '~~.BS~~~~~',
        '~~.~~~~~~~',
        '~~.~~~~~~~',
        '~~.~~~~~~~',
        '~~.~~~~~~~',
        '~~.~~~~~~~'
      ] }
    ],
    solution: 'n = 0\niken(onumBos()):\n    ilerle()\n    n = n + 1\nsagaDon()\nilerle(n)\nsolaDon()\nilerle(2)',
    stars: { two: 11 },
    hints: [
      'İnen yolun sonunda duvar yok; <code>iken(onumBos())</code> seni fazla yürütür. Kaç kare ineceğini bilmelisin.',
      'İlk yolda her <code>ilerle()</code>den sonra <code>n = n + 1</code> yaz; <code>n = 0</code> ile başla.',
      'Sonra <code>sagaDon()</code>, <code>ilerle(n)</code>, <code>solaDon()</code>, <code>ilerle(2)</code>.'
    ]
  },
  {
    title: 'Kareyi Ölç',
    concept: 'Değişken + iken',
    text: 'Muzlar bir karenin köşelerinde ama karenin boyu her parkurda farklı. Yalnızca ilk kenar bir kayada bitiyor: <b>onu ölç</b>, kalan kenarları aynı uzunlukta yürü.',
    dir: 'E',
    scenarios: [
      { map: [
        '..........',
        '.M..B#....',
        '....B.#...',
        '..........',
        '.S..B.....',
        '..........',
        '........#.',
        '..........'
      ] },
      { map: [
        '..........',
        '.M....B#..',
        '..........',
        '...#..B...',
        '..........',
        '..........',
        '.S....B.#.',
        '..........'
      ] },
      { map: [
        '..........',
        '.M...B#...',
        '..........',
        '.....B....',
        '..........',
        '.S...B....',
        '........#.',
        '..#.......'
      ] }
    ],
    solution: 'n = 0\niken(onumBos()):\n    ilerle()\n    n = n + 1\ntekrarla(3):\n    sagaDon()\n    ilerle(n)',
    stars: { two: 10 },
    hints: [
      'Kare: dört kenarı eşit. İlk kenarın uzunluğunu sayarsan diğerlerini de bilirsin.',
      '<code>n = 0</code>, <code>iken(onumBos()):</code> → <code>ilerle()</code>, <code>n = n + 1</code>.',
      'Sonra <code>tekrarla(3):</code> → <code>sagaDon()</code>, <code>ilerle(n)</code>.'
    ]
  },
  {
    title: 'Bilgelik Zirvesi',
    concept: 'Final',
    text: 'Zirvenin yolu içe kıvrılan bir sarmal ve boyu her parkurda farklı. İlk kolu ölç; sonraki her kol bir öncekinden <b>bir kare kısa</b>. Öğrendiğin her şey bu görevde!',
    dir: 'E',
    scenarios: [
      { map: [
        '............',
        '.M.....B#...',
        '............',
        '...B.B......',
        '.....S......',
        '............',
        '...B...B....',
        '............',
        '............'
      ] },
      { map: [
        '............',
        '.M.......B#.',
        '............',
        '...B...B....',
        '............',
        '.....S......',
        '.....B.B....',
        '............',
        '...B.....B..'
      ] },
      { map: [
        '............',
        '.M......B#..',
        '............',
        '...B..B.....',
        '............',
        '.....SB.....',
        '............',
        '...B....B...',
        '............'
      ] }
    ],
    solution: 'n = 0\niken(onumBos()):\n    ilerle()\n    n = n + 1\niken(hedefteDegilim()):\n    sagaDon()\n    n = n - 1\n    ilerle(n)',
    stars: { two: 12 },
    hints: [
      'İlk kol bir kayada bitiyor: <code>iken(onumBos())</code> ile yürürken say.',
      'Sonra her turda: sağa dön, sayıyı bir azalt, o kadar ilerle.',
      'Dış döngü <code>iken(hedefteDegilim()):</code> → <code>sagaDon()</code>, <code>n = n - 1</code>, <code>ilerle(n)</code>.'
    ]
  }
];
