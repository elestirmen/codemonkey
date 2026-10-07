// Ada 4 · Gelgit Kıyıları · Koşullar
// Her görevde birden çok gelgit (parkur) var ve aynı kod hepsinde çalışmalı.
// Haritalar tools/ altındaki çözücüyle denetlendi: hiçbir sabit (koşulsuz)
// program bütün gelgitleri 3★ sınırında kazanamıyor.

export const ISLAND_4 = [
  {
    title: 'Gelgit Geldi',
    concept: 'Koşul',
    teaches: 'if',
    text: 'Gelgit her sabah su birikintisini başka yere taşıyor; kodun <b>üç gelgitte de</b> çalışmalı. Kural basit: önün boşsa ilerle, değilse sağa dön. <code>ise(onumBos()):</code> ile Mojo\'ya bakmayı öğret!',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '...S.......',
        '.M....B~...',
        '.....#.....',
        '......B....',
        '..#........',
        '...........'
      ] },
      { map: [
        '...S.......',
        '.M.B~......',
        '.....#.....',
        '...........',
        '..#B.......',
        '...........'
      ] },
      { map: [
        '...S.......',
        '.M.......B~',
        '.....#.....',
        '.........B.',
        '..#........',
        '...........'
      ] }
    ],
    solution: 'tekrarla(50):\n    ise(onumBos()):\n        ilerle()\n    degilse:\n        sagaDon()',
    stars: { two: 9 },
    hints: [
      'Gelgit sekmelerine tıkla: üç harita da farklı. Tek bir rota ezberleyemezsin; bir <b>kural</b> yazmalısın.',
      '<code>ise(onumBos()):</code> içine <code>ilerle()</code>, <code>degilse:</code> içine <code>sagaDon()</code>.',
      'Bu kararı çok kez tekrarla: <code>tekrarla(50):</code> içine al. Mojo sandığa varınca kendiliğinden durur.'
    ]
  },
  {
    title: 'Sağ mı Sol mu?',
    concept: 'Koşul',
    text: 'Bu kıyıda Mojo engele gelince hangi yöne dönmeli? Üç gelgitte de sandığa götüren kuralı bul.',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '...........',
        '...........',
        '.......#...',
        '...#.......',
        '.M....B~...',
        '...S.......'
      ] },
      { map: [
        '...........',
        '...........',
        '.......#...',
        '...B.......',
        '.M.B~......',
        '...S.......'
      ] },
      { map: [
        '...........',
        '...........',
        '.......#.B.',
        '...#.......',
        '.M.......B~',
        '...S.......'
      ] }
    ],
    solution: 'tekrarla(50):\n    ise(onumBos()):\n        ilerle()\n    degilse:\n        solaDon()',
    stars: { two: 9 },
    hints: [
      'Önceki görevdeki kuralı dene ve Mojo\'nun nereye gittiğine bak.',
      'Sandıklar alt sırada. Engelde sağa dönersen yukarıya mı aşağıya mı gidersin?',
      '<code>degilse:</code> içinde <code>solaDon()</code> kullan.'
    ]
  },
  {
    title: 'Hangi Köprü?',
    concept: 'Koşul',
    text: 'Gelgit köprülerden birini yutuyor: bazen üstteki açık, bazen alttaki. Nehrin kıyısında <b>önüne bak</b>, sonra karar ver.',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '....~.......',
        '.M..=.B..S..',
        '....~.......',
        '..#.~...#...',
        '....~.......',
        '....~.......'
      ] },
      { map: [
        '....~.......',
        '.M..~....S..',
        '....~.......',
        '..#.~...#...',
        '....=..B....',
        '....~.......'
      ] }
    ],
    solution: 'ilerle(2)\nise(onumBos()):\n    ilerle(6)\ndegilse:\n    sagaDon()\n    ilerle(3)\n    solaDon()\n    ilerle(6)\n    solaDon()\n    ilerle(3)',
    stars: { two: 14 },
    hints: [
      'Mojo nehre gelmeden önce durup bakmalı: köprünün bir kare önünde.',
      '<code>ise(onumBos()):</code> üst köprü açıksa doğrudan geç; <code>degilse:</code> aşağı inip alt köprüden dolaş.',
      'Alt yol: sağa dön, 3 in, sola dön, 6 ilerle, sola dön, 3 çık.'
    ]
  },
  {
    title: 'Yanlış Soru',
    concept: 'Hata ayıklama',
    text: 'Bu kod yanlış soruyu soruyor; Mojo engelleri göremiyor. Kodu adım adım izle: Mojo hangi kareye bakıyor?',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '....#.....',
        '.M....B~..',
        '..........',
        '...#..B...',
        '......S...'
      ] },
      { map: [
        '....#.....',
        '.M.B~.....',
        '..........',
        '...B......',
        '...S......'
      ] }
    ],
    starter: 'tekrarla(50):\n    ise(solumBos()):\n        ilerle()\n    degilse:\n        sagaDon()',
    solution: 'tekrarla(50):\n    ise(onumBos()):\n        ilerle()\n    degilse:\n        sagaDon()',
    stars: { two: 7 },
    hints: [
      'Adım adım çalıştır: Mojo her turda hangi kareyi yeşil/kırmızı yakıyor?',
      '<code>solumBos()</code> Mojo\'nun solundaki kareyi sorar. Burada önündeki kare önemli.',
      '<code>ise(solumBos())</code> yerine <code>ise(onumBos())</code> yaz.'
    ]
  },
  {
    title: 'Su Birikintileri',
    concept: 'Koşul + fonksiyon',
    text: 'Yolda gelgitten kalan birikintiler var; yerleri her gün değişiyor. Önün boşsa ilerle, değilse birikintinin üstünden dolaş. Dolaşmayı bir <b>fonksiyon</b> yap!',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '.....#.......',
        '.............',
        '.M.B~..B~..S.',
        '.............',
        '..#.....#....'
      ] },
      { map: [
        '.....#.......',
        '.............',
        '.M~.B~...~BS.',
        '.............',
        '..#.....#....'
      ] },
      { map: [
        '.....#.......',
        '.............',
        '.M..B..~B..S.',
        '.............',
        '..#.....#....'
      ] }
    ],
    solution: 'tanimla atla():\n    solaDon()\n    ilerle()\n    sagaDon()\n    ilerle(2)\n    sagaDon()\n    ilerle()\n    solaDon()\n\ntekrarla(14):\n    ise(onumBos()):\n        ilerle()\n    degilse:\n        atla()',
    stars: { two: 19 },
    hints: [
      'Dolaşma: sola dön, 1 ilerle, sağa dön, 2 ilerle, sağa dön, 1 ilerle, sola dön.',
      'Bunu <code>tanimla atla():</code> ile tanımla.',
      '<code>tekrarla(14):</code> içinde: <code>ise(onumBos()):</code> → <code>ilerle()</code>, <code>degilse:</code> → <code>atla()</code>.'
    ]
  },
  {
    title: 'Üç Yol',
    concept: 'Koşul',
    text: 'Kavşaktan üç yol çıkıyor ama gelgit yalnızca birini açık bırakıyor. Kavşakta sola ve sağa bak; hangisi açıksa oraya dön ve devam et.',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '....S....',
        '....B....',
        '...~=~...',
        '.M.B.~...',
        '...~~~...',
        '.........',
        '.........'
      ] },
      { map: [
        '.........',
        '.........',
        '...~~~...',
        '.M.B.=BS.',
        '...~~~...',
        '.........',
        '.........'
      ] },
      { map: [
        '.........',
        '.........',
        '...~~~...',
        '.M.B.~...',
        '...~=~...',
        '....B....',
        '....S....'
      ] }
    ],
    solution: 'ilerle(3)\nise(solumBos()):\n    solaDon()\nise(sagimBos()):\n    sagaDon()\nilerle(3)',
    stars: { two: 10 },
    hints: [
      'Önce kavşağa yürü: <code>ilerle(3)</code>.',
      '<code>ise(solumBos()):</code> sola dön; <code>ise(sagimBos()):</code> sağa dön. İkisi de değilse yol zaten düz.',
      'Son olarak <code>ilerle(3)</code>: sandık hangi yöndeyse oraya varırsın.'
    ]
  },
  {
    title: 'İki Nehir',
    concept: 'Koşul + fonksiyon',
    text: 'İki nehir, her birinde bir açık bir kapalı köprü. İki nehirde de <b>aynı kararı</b> veriyorsun: kararı bir fonksiyonun içine koy!',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '...~....~....',
        '.M.=.B..=..S.',
        '...~....~....',
        '...~....~....',
        '...~....~....',
        '..#~....~.#..'
      ] },
      { map: [
        '...~....~....',
        '.M.~.B..=..S.',
        '...~....~....',
        '...=....~....',
        '...~....~....',
        '..#~....~.#..'
      ] },
      { map: [
        '...~....~....',
        '.M.~.B..~..S.',
        '...~....~....',
        '...=....=....',
        '...~....~....',
        '..#~....~.#..'
      ] }
    ],
    solution: 'tanimla gec():\n    ise(onumBos()):\n        ilerle(2)\n    degilse:\n        sagaDon()\n        ilerle(2)\n        solaDon()\n        ilerle(2)\n        solaDon()\n        ilerle(2)\n        sagaDon()\n\nilerle()\ngec()\nilerle(3)\ngec()\nilerle(2)',
    stars: { two: 24 },
    hints: [
      'Bir nehirde: önün boşsa 2 ilerle; değilse aşağıdaki köprüden dolaş ve aynı yere çık.',
      'Dolaşma: sağa dön, 2 in, sola dön, 2 ilerle, sola dön, 2 çık, sağa dön.',
      '<code>tanimla gec():</code> içine <code>ise</code>/<code>degilse</code> yaz; ana programda <code>ilerle()</code>, <code>gec()</code>, <code>ilerle(3)</code>, <code>gec()</code>, <code>ilerle(2)</code>.'
    ]
  },
  {
    title: 'Yengeç Yolu',
    concept: 'İç içe koşul',
    text: 'Kumdan yollar her gelgitte başka yöne kıvrılıyor. Önün boşsa ilerle; değilse solun boşsa sola, o da değilse sağa dön. <b>Koşulun içinde koşul!</b>',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '~~~~~~~~~~~~~',
        '~M..B.~~~~~~~',
        '~~~~~.~~B..B~',
        '~~~~~.~~.~~.~',
        '~~~~~B...~~.~',
        '~~~~~~~~~~~.~',
        '~~~~~~~~~~~S~'
      ] },
      { map: [
        '~~~~~~~~~~~~~',
        '~M.B~~~~~~~~~',
        '~~~.~~~~.B..~',
        '~~~.~~~~.~~S~',
        '~~~.~~~~.~~~~',
        '~~~B...B.~~~~',
        '~~~~~~~~~~~~~'
      ] },
      { map: [
        '~~~~~~~~~~~~~',
        '~M...B..~~~~~',
        '~~~~~~~.~~~~~',
        '~~~~~..B~~~~~',
        '~~~~~B~~~~~~~',
        '~~~~~.~~~~~~~',
        '~~~~~..B...S~'
      ] }
    ],
    solution: 'tekrarla(80):\n    ise(onumBos()):\n        ilerle()\n    degilse:\n        ise(solumBos()):\n            solaDon()\n        degilse:\n            sagaDon()',
    stars: { two: 12 },
    hints: [
      'Üç durum var: düz git, sola dön, sağa dön.',
      '<code>degilse:</code> bloğunun içine ikinci bir <code>ise(solumBos()):</code> yazabilirsin.',
      '<code>tekrarla(80):</code> → <code>ise(onumBos()):</code> <code>ilerle()</code> / <code>degilse:</code> → <code>ise(solumBos()):</code> <code>solaDon()</code> / <code>degilse:</code> <code>sagaDon()</code>.'
    ]
  },
  {
    title: 'Kıyıyı İzle',
    concept: 'İç içe koşul',
    text: 'Mojo adanın kıyısında, deniz sağında. Kıyı boyunca yürüyüp bütün muzları topla. Kural: <b>sağın boşsa sağa dön ve ilerle</b>; değilse önün boşsa ilerle; o da değilse sola dön.',
    scenarioName: 'Gelgit',
    dir: 'W',
    scenarios: [
      { map: [
        '~~~~~~~~~~~~~~',
        '~~~~..B...M~~~',
        '~~~.......S.~~',
        '~~B....#...B.~',
        '~~.......B...~',
        '~~~.......~~~~',
        '~~~~.B..~~~~~~',
        '~~~~~~~~~~~~~~'
      ] },
      { map: [
        '~~~~~~~~~~~~~~',
        '~~...B....M~~~',
        '~~...B....S~~~',
        '~~~~~..#...B~~',
        '~~~~~.......~~',
        '~~B.........~~',
        '~~~~~~..B~~~~~',
        '~~~~~~~~~~~~~~'
      ] },
      { map: [
        '~~~~~~~~~~~~~~',
        '~~~~~~..B..M~~',
        '~~~~~......S~~',
        '~~..B....#..~~',
        '~~.....~~..B~~',
        '~~~.B.~~~...~~',
        '~~~~.....B.~~~',
        '~~~~~~~~~~~~~~'
      ] }
    ],
    solution: 'tekrarla(80):\n    ise(sagimBos()):\n        sagaDon()\n        ilerle()\n    degilse:\n        ise(onumBos()):\n            ilerle()\n        degilse:\n            solaDon()',
    stars: { two: 13 },
    hints: [
      'Denizi hep sağında tutarsan kıyıdan ayrılmazsın.',
      'Önce <code>ise(sagimBos()):</code> sor. Boşsa <code>sagaDon()</code> ve <code>ilerle()</code>.',
      '<code>degilse:</code> içinde: <code>ise(onumBos()):</code> <code>ilerle()</code>, <code>degilse:</code> <code>solaDon()</code>. Hepsini <code>tekrarla(80):</code> içine al.'
    ]
  },
  {
    title: 'Soruların Sırası',
    concept: 'Hata ayıklama',
    text: 'Bu kodda kıyı kuralının sorularının sırası karışmış: Mojo bazı koylara girmeden geçiyor. İki gelgitte de çalışacak şekilde düzelt.',
    scenarioName: 'Gelgit',
    dir: 'W',
    scenarios: [
      { map: [
        '~~~~~~~~~~~~~~',
        '~~~...B...M~~~',
        '~~B........~~~',
        '~~~~~~.....~~~',
        '~~~...B.....~~',
        '~~.B.....~~~~~',
        '~~~~~..B.S~~~~',
        '~~~~~~~~~~~~~~'
      ] },
      { map: [
        '~~~~~~~~~~~~~~',
        '~~~~~...B..M~~',
        '~~~~~.......~~',
        '~~~.B.~~...~~~',
        '~~.....~~.S.B~',
        '~~~.B........~',
        '~~~~~~~..B~~~~',
        '~~~~~~~~~~~~~~'
      ] }
    ],
    starter: 'tekrarla(80):\n    ise(onumBos()):\n        ilerle()\n    degilse:\n        ise(sagimBos()):\n            sagaDon()\n            ilerle()\n        degilse:\n            solaDon()',
    solution: 'tekrarla(80):\n    ise(sagimBos()):\n        sagaDon()\n        ilerle()\n    degilse:\n        ise(onumBos()):\n            ilerle()\n        degilse:\n            solaDon()',
    stars: { two: 12 },
    hints: [
      'Hangi gelgitte kaç muz kalıyor? Mojo nereden kestirme yapıyor?',
      'Kıyıyı izlemek için önce <b>sağa</b> bakmalısın; sonra önüne.',
      '<code>sagimBos()</code> sorusunu dışarı, <code>onumBos()</code> sorusunu içeri al.'
    ]
  },
  {
    title: 'Robot Süpürge',
    concept: 'Koşul',
    text: 'Gelgit adaya muz saçmış. Mojo bir robot süpürge gibi: duvara kadar git, sağa dön, yine git… Bu tek kural üç adayı da süpürebilir mi?',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '......B.....S.',
        '.M....B......B',
        'B.........#...',
        '...#..........',
        '..............',
        '.......#......',
        '..............',
        '...B.......B..'
      ] },
      { map: [
        '....B#........',
        '.M...B......B.',
        '..............',
        'B.......#.....',
        '..#...........',
        '..............',
        '....S#........',
        '....B.......B.'
      ] },
      { map: [
        '.....B......B.',
        '.M..B...#.....',
        'B.............',
        '..............',
        '....#.........',
        '.......B......',
        '..........#..S',
        '..B...........'
      ] }
    ],
    solution: 'tekrarla(80):\n    ise(onumBos()):\n        ilerle()\n    degilse:\n        sagaDon()',
    stars: { two: 9 },
    hints: [
      'Gelgit 1, 2 ve 3\'teki muzlar hep Mojo\'nun spiral yolunun üstünde.',
      'İlk gelgit görevindeki kuralı hatırla.',
      '<code>tekrarla(80):</code> → <code>ise(onumBos()):</code> <code>ilerle()</code> / <code>degilse:</code> <code>sagaDon()</code>.'
    ]
  },
  {
    title: 'Gelgit Ustası',
    concept: 'Ada sınavı',
    text: 'Kıyının son görevi: kıvrılan kum yolları, köprüler ve kilitli bir kapı. Anahtar her zaman kapıdan önce yolda. Üç gelgitte de çalışan <b>tek bir kural</b> yaz!',
    scenarioName: 'Gelgit',
    dir: 'E',
    scenarios: [
      { map: [
        '~~~~~~~~~~~~~~~',
        '~M..B..~~~~~~~~',
        '~~~~~~=~~~B.=.~',
        '~~~~~~K~~~.~~G~',
        '~~~~~~.B...~~.~',
        '~~~~~~~~~~~~~B~',
        '~~~~~~~~~~~~~.~',
        '~~~~~~~~~~~~~S~'
      ] },
      { map: [
        '~~~~~~~~~~~~~~~',
        '~M.B~~~~~~~~~~~',
        '~~~.~~~~~..BG.~',
        '~~~=~~~~~.~~~.~',
        '~~~.~~~~~B~~~S~',
        '~~~K~~~~~.~~~~~',
        '~~~..B..=.~~~~~',
        '~~~~~~~~~~~~~~~'
      ] },
      { map: [
        '~~~~~~~~~~~~~~~',
        '~M....B...~~~~~',
        '~~~~~~~~~=~~~~~',
        '~~~~~~.BK.~~~~~',
        '~~~~~~.~~~~~~~~',
        '~~~~~~.~~~~~~~~',
        '~~~~~~B.=.GB.S~',
        '~~~~~~~~~~~~~~~'
      ] }
    ],
    solution: 'tekrarla(80):\n    ise(onumBos()):\n        ilerle()\n    degilse:\n        ise(solumBos()):\n            solaDon()\n        degilse:\n            sagaDon()',
    stars: { two: 14 },
    hints: [
      'Köprüler ve açılan kapı da yolun parçası: kural onları ayırt etmek zorunda değil.',
      'Yengeç Yolu\'ndaki iç içe koşulu hatırla.',
      'Önün boşsa ilerle; değilse solun boşsa sola, değilse sağa dön. <code>tekrarla(80):</code> içinde.'
    ]
  }
];
