// Ada 2 · Kemer Takımadaları · Döngüler
// Tekrar eden kalıbı bul, tekrarla ile kısalt; döngüleri sırala ve iç içe kur.

export const ISLAND_2 = [
  {
    title: 'Tekrarla!',
    concept: 'Döngü',
    teaches: 'loop',
    text: 'Mojo göletin çevresinde bir kare çizecek. Aynı iki komut dört kez tekrar ediyor: <code>ilerle(3)</code> ve <code>sagaDon()</code>. <code>tekrarla(4):</code> ile bunu <b>3 satırda</b> yaz!',
    map: [
      '.........',
      '..M..B...',
      '..S~~....',
      '...~~....',
      '..B..B...',
      '.........'
    ],
    dir: 'E',
    solution: 'tekrarla(4):\n    ilerle(3)\n    sagaDon()',
    stars: { three: 3, two: 7 },
    hints: [
      'Önce döngüsüz yaz: hangi iki satır tekrar tekrar geliyor?',
      'Tekrar edenleri bir kez yaz ve üstlerine <code>tekrarla(4):</code> koy. İçerideki satırlar 4 boşlukla başlar.',
      '<code>tekrarla(4):</code> → içeride <code>ilerle(3)</code> ve <code>sagaDon()</code>. Mojo sandığa varınca kendiliğinden durur.'
    ]
  },
  {
    title: 'Merdiven',
    concept: 'Kalıp bulma',
    text: 'Muzlar bir merdiven gibi aşağı iniyor. Bir basamağın komutlarını bul, sonra o basamağı tekrarla.',
    map: [
      '...........',
      '.M.........',
      '..B........',
      '...B.......',
      '....B......',
      '.....S.....',
      '...........'
    ],
    dir: 'E',
    solution: 'tekrarla(4):\n    ilerle()\n    sagaDon()\n    ilerle()\n    solaDon()',
    stars: { three: 5, two: 9 },
    hints: [
      'Bir basamak: bir kare sağa, bir kare aşağı. Sonra yine sağa bakman gerekir.',
      'Basamak = <code>ilerle()</code>, <code>sagaDon()</code>, <code>ilerle()</code>, <code>solaDon()</code>.',
      'Bu dört satırı <code>tekrarla(4):</code> içine al.'
    ]
  },
  {
    title: 'Pervane',
    concept: 'Kalıp bulma',
    text: 'Mojo bir pervanenin ortasında. Dört kolun ucunda muz ya da sandık var. Bir kola gidip ortaya dönmek hep <b>aynı hareket</b>!',
    map: [
      '...........',
      '..#..S.....',
      '...........',
      '...B.M.B...',
      '...........',
      '.....B..#..',
      '...........'
    ],
    dir: 'E',
    solution: 'tekrarla(4):\n    ilerle(2)\n    sagaDon()\n    sagaDon()\n    ilerle(2)\n    solaDon()',
    record: 5,
    hints: [
      'Bir kol: 2 kare git, arkanı dön, 2 kare geri gel. Sonra bir sonraki kola dön.',
      'Arkanı dönmek için iki kez <code>sagaDon()</code>. Bir sonraki kola bakmak için de <code>solaDon()</code>.',
      'Bu beş satırı <code>tekrarla(4):</code> içine al. Son kolda sandık var.'
    ]
  },
  {
    title: 'Döngüde Hata',
    concept: 'Hata ayıklama',
    text: 'Mojo merdiveni <b>yukarı</b> çıkacaktı ama aşağı yürüyüp denize düşüyor. Döngünün içinde bir hata var. Adım adım izle ve bul!',
    map: [
      '............',
      '............',
      '..#......S..',
      '.......B....',
      '.....B....#.',
      '...B........',
      '.M..........',
      '............'
    ],
    dir: 'E',
    starter: 'tekrarla(4):\n    ilerle(2)\n    sagaDon()\n    ilerle()\n    solaDon()',
    solution: 'tekrarla(4):\n    ilerle(2)\n    solaDon()\n    ilerle()\n    sagaDon()',
    hints: [
      '<b>Adım</b> düğmesiyle döngünün ilk turunu izle. Mojo ilk dönüşte nereye bakıyor?',
      'Yukarı çıkmak için doğuya bakan Mojo önce <b>sola</b> dönmeli.',
      'Döngüdeki iki dönüşün yerini değiştir: önce <code>solaDon()</code>, sonra <code>sagaDon()</code>.'
    ]
  },
  {
    title: 'Uzun Basamaklar',
    concept: 'Kalıp bulma',
    text: 'Bu merdivenin basamakları uzun. Bir basamak kaç kare sağa, kaç kare aşağı? Cetvel ile ölç, sonra tekrarla.',
    map: [
      '..............',
      '.M............',
      '..............',
      '....B.........',
      '..............',
      '.......B......',
      '..............',
      '..........B.S.',
      '..............'
    ],
    dir: 'E',
    solution: 'tekrarla(4):\n    ilerle(3)\n    sagaDon()\n    ilerle(2)\n    solaDon()',
    stars: { three: 5, two: 8 },
    hints: [
      'Mojo\'dan ilk muza: kaç kare sağa, kaç kare aşağı?',
      'Bir basamak: <code>ilerle(3)</code>, <code>sagaDon()</code>, <code>ilerle(2)</code>, <code>solaDon()</code>.',
      'Basamağı <code>tekrarla(4):</code> içine al; son turda sandığa varırsın.'
    ]
  },
  {
    title: 'Dağ Yolu',
    concept: 'Ardışık döngüler',
    text: 'Önce dağa tırman, sonra öbür yamaçtan in. Çıkış ve iniş farklı iki merdiven: <b>iki döngü</b> art arda!',
    map: [
      '...........',
      '...........',
      '....B......',
      '...B.B.....',
      '..B.##B....',
      '.M.####S...',
      '...........'
    ],
    dir: 'E',
    solution: 'tekrarla(3):\n    ilerle()\n    solaDon()\n    ilerle()\n    sagaDon()\ntekrarla(3):\n    ilerle()\n    sagaDon()\n    ilerle()\n    solaDon()',
    record: 7,
    hints: [
      'Çıkışta bir basamak: bir kare sağa, bir kare yukarı. İnişte: bir kare sağa, bir kare aşağı.',
      'İlk döngü çıkışı, ikinci döngü inişi yapar. İkisi de 3 tur.',
      'İkinci döngünün dönüşleri birincinin tersidir: önce <code>sagaDon()</code>, sonra <code>solaDon()</code>.'
    ]
  },
  {
    title: 'Muz Tarlası',
    concept: 'Kalıp bulma',
    text: 'Tarladaki bütün muzları topla. Bir çiftçi gibi sıra sıra git: sağa, aşağı, sola, aşağı… Hangi kısım tekrar ediyor?',
    map: [
      '...........',
      '.M.B...B...',
      '.....B..B..',
      '..B...B....',
      '.S..B...B..',
      '...........'
    ],
    dir: 'E',
    solution: 'tekrarla(2):\n    ilerle(7)\n    sagaDon()\n    ilerle()\n    sagaDon()\n    ilerle(7)\n    solaDon()\n    ilerle()\n    solaDon()',
    record: 7,
    hints: [
      'Bir gidiş-dönüş: sağa 7 kare, aşağı 1, sola 7 kare, aşağı 1.',
      'Sağ uçta iki kez sağa, sol uçta iki kez sola dönersin.',
      'Gidiş-dönüşü (8 satır) <code>tekrarla(2):</code> içine al.'
    ]
  },
  {
    title: 'Kare Kuleler',
    concept: 'İç içe döngü',
    text: 'Her kulenin çevresinde bir kare çiz. Kare zaten bir döngü… Peki kuleler de tekrar ediyorsa? <b>Döngünün içine döngü</b> koyabilirsin!',
    map: [
      '..............',
      '.M.......S....',
      '..#...#...#...',
      '.B.B#B.B#B.B..',
      '....#...#.....'
    ],
    dir: 'E',
    solution: 'tekrarla(3):\n    tekrarla(4):\n        ilerle(2)\n        sagaDon()\n    ilerle(4)',
    stars: { three: 5, two: 8 },
    hints: [
      'Bir kulenin çevresi: <code>tekrarla(4):</code> içinde <code>ilerle(2)</code> ve <code>sagaDon()</code>.',
      'Kareyi bitirince Mojo yine sağa bakar. Sonraki kulenin köşesi 4 kare ötede.',
      'Kare döngüsünü ve <code>ilerle(4)</code>\'ü bir <code>tekrarla(3):</code> içine al. İç döngü 8 boşluk içeride olur.'
    ]
  },
  {
    title: 'Elmas',
    concept: 'İç içe döngü',
    text: 'Gölün etrafındaki muzlar bir elmas çiziyor. Elmasın her kenarı küçük bir merdiven; dört kenar da aynı!',
    map: [
      '...............',
      '.#....SM.......',
      '.....B.~.B...#.',
      '......~~~......',
      '#...B~~~~~B....',
      '......~~~.....#',
      '.....B.~.B.....',
      '..#....B....#..',
      '...............'
    ],
    dir: 'E',
    solution: 'tekrarla(4):\n    tekrarla(3):\n        ilerle()\n        sagaDon()\n        ilerle()\n        solaDon()\n    sagaDon()',
    stars: { three: 7, two: 11 },
    record: 6,
    hints: [
      'Bir kenar: 3 basamaklı bir merdiven (<code>ilerle()</code>, <code>sagaDon()</code>, <code>ilerle()</code>, <code>solaDon()</code>).',
      'Bir kenarı bitirince sonraki kenara geçmek için bir kez <code>sagaDon()</code>.',
      'Merdiven döngüsü + <code>sagaDon()</code> = bir kenar. Bunu <code>tekrarla(4):</code> içine al.'
    ]
  },
  {
    title: 'Kalıbı Sen Seç',
    concept: 'Kalıp bulma',
    text: 'Muzlar ağaçların arasındaki ceplerde. Ceplere aşağıdan da girebilirsin, yukarıdan da. Bir kalıp seç ve tekrarla!',
    map: [
      '...........',
      '...........',
      '..B#B#B....',
      '...........',
      '.M.....S...',
      '...........'
    ],
    dir: 'E',
    solution: 'tekrarla(3):\n    ilerle()\n    solaDon()\n    ilerle(2)\n    sagaDon()\n    sagaDon()\n    ilerle(2)\n    solaDon()\n    ilerle()',
    stars: { three: 9, two: 13 },
    record: 6,
    hints: [
      'Aşağıdan bir cebe gir ve geri çık: yukarı 2 kare, arkanı dön, aşağı 2 kare.',
      'Bir tur: bir kare sağa, cebe gir-çık, bir kare daha sağa.',
      'Ya da üst sıradan yürüyüp ceplere yukarıdan dalabilirsin. Hangisi daha kısa?'
    ]
  },
  {
    title: 'Havuz Başında Hata',
    concept: 'Hata ayıklama',
    text: 'Mojo havuzların çevresini dolaşacaktı ama ilk havuzdan sonra denize yürüyor. İç içe döngülerde bir sayı yanlış!',
    map: [
      '.................',
      '.M...........S...',
      '..~...~...~...~..',
      '.B.B#B.B#B.B#B.B.',
      '....#...#...#....'
    ],
    dir: 'E',
    starter: 'tekrarla(4):\n    tekrarla(3):\n        ilerle(2)\n        sagaDon()\n    ilerle(4)',
    solution: 'tekrarla(4):\n    tekrarla(4):\n        ilerle(2)\n        sagaDon()\n    ilerle(4)',
    hints: [
      'Adım adım izle: ilk havuzun etrafını tamamlıyor mu?',
      'Bir kare dört kenarlıdır. İç döngü kaç kez dönüyor?',
      'İç döngü <code>tekrarla(4):</code> olmalı.'
    ]
  },
  {
    title: 'Köprü Mimarı',
    concept: 'Ada sınavı',
    text: 'Takımadaların son görevi: üç gölcük, merdiven gibi diziliyor. Her gölcüğün çevresini dolaş ve bir sonrakine in.',
    map: [
      '...........',
      '.M.B.......',
      '..~........',
      '.B.B.B.....',
      '....~......',
      '...B.B.B...',
      '......~....',
      '.....B.S...',
      '...........'
    ],
    dir: 'E',
    solution: 'tekrarla(3):\n    tekrarla(4):\n        ilerle(2)\n        sagaDon()\n    ilerle(2)\n    sagaDon()\n    ilerle(2)\n    solaDon()',
    record: 5,
    hints: [
      'Bir gölcüğün çevresi bir kare: <code>tekrarla(4):</code> ile <code>ilerle(2)</code> ve <code>sagaDon()</code>.',
      'Kareyi bitirince bir sonraki gölcüğün köşesine in: sağa 2, aşağı 2.',
      'Kare döngüsü ve iniş (4 satır) birlikte bir tur yapar. Bunu <code>tekrarla(3):</code> içine al.'
    ]
  }
];
