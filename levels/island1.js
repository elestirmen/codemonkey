// Ada 1 · Filiz Ormanı · Sıralama
// Komutlar sırayla çalışır; ilerle bir sayı alır; rota seçmek görevin parçasıdır.

export const ISLAND_1 = [
  {
    title: 'İlk Adımlar',
    concept: 'Komut',
    text: 'Mojo sandığa gitmek istiyor. Her <code>ilerle()</code> onu baktığı yönde <b>1 kare</b> ilerletir. Kodunu yaz ve <b>Çalıştır</b>\'a bas.',
    map: [
      '#...#....',
      '.........',
      '..M..S...',
      '.......#.',
      '..#......'
    ],
    dir: 'E',
    solution: 'ilerle()\nilerle()\nilerle()',
    stars: { three: 3, two: 5 },
    record: 1,
    hints: [
      'Mojo ile sandık arasında kaç kare var? Her kare için bir <code>ilerle()</code> yaz.',
      'Sandık 3 kare ileride: alt alta üç kez <code>ilerle()</code>.',
      'Kod yukarıdan aşağıya, satır satır çalışır.'
    ]
  },
  {
    title: 'Kaç Kare?',
    concept: 'Parametre',
    text: 'Aynı komutu tekrar tekrar yazmana gerek yok: <code>ilerle(8)</code> Mojo\'yu <b>8 kare</b> ilerletir. Yoldaki muzlar üstünden geçince toplanır.',
    map: [
      '...#.......',
      '...........',
      '.M.B...B.S.',
      '.......#...',
      '.#.........'
    ],
    dir: 'E',
    solution: 'ilerle(8)',
    stars: { three: 1, two: 3 },
    hints: [
      '<b>Cetvel</b>\'i aç ve sandığa dokun: Mojo\'ya kaç kare uzakta olduğunu gösterir.',
      'Parantezin içine yazdığın sayı, Mojo\'nun kaç kare gideceğidir.',
      'Tek satır yeter: <code>ilerle(8)</code>'
    ]
  },
  {
    title: 'Sağa Dön',
    concept: 'Dönüş',
    text: 'Sandık aşağıda. <code>sagaDon()</code> Mojo\'yu olduğu yerde <b>sağa</b> çevirir. Dönünce yeniden ilerlemen gerekir.',
    map: [
      '..#........',
      '.M..B......',
      '...........',
      '.#.....B...',
      '.......S.#.',
      '...........'
    ],
    dir: 'E',
    solution: 'ilerle(6)\nsagaDon()\nilerle(3)',
    hints: [
      'Önce sandığın üstündeki sütuna kadar ilerle, sonra dön.',
      'Mojo doğuya (sağa) bakıyor. Sağına dönerse güneye, yani aşağı bakar.',
      '<code>ilerle(6)</code>, <code>sagaDon()</code>, <code>ilerle(3)</code>'
    ]
  },
  {
    title: 'Sola Dön',
    concept: 'Dönüş',
    text: 'Bu kez sandık yukarıda. <code>solaDon()</code> Mojo\'yu <b>sola</b> çevirir.',
    map: [
      '...........',
      '..#....S...',
      '.......B...',
      '...........',
      '.M.....B.#.',
      '....#......'
    ],
    dir: 'E',
    solution: 'ilerle(6)\nsolaDon()\nilerle(3)',
    hints: [
      'Sandığın altındaki muza kadar ilerle.',
      'Doğuya bakan Mojo sola dönerse kuzeye, yani yukarı bakar.',
      '<code>ilerle(6)</code>, <code>solaDon()</code>, <code>ilerle(3)</code>'
    ]
  },
  {
    title: 'İki Yol',
    concept: 'Rota seçimi',
    text: 'Gölet yolu kesiyor. Üstünden de altından da dolaşabilirsin; <b>hangi yolu seçeceğin sana kalmış.</b>',
    map: [
      '...........',
      '....~~~....',
      '.M..~~~..S.',
      '....~~~....',
      '...........'
    ],
    dir: 'E',
    solution: 'solaDon()\nilerle(2)\nsagaDon()\nilerle(8)\nsagaDon()\nilerle(2)',
    hints: [
      'Mojo suya basamaz. Göletin etrafından dolaşmalısın.',
      'Hemen dönüp göletin üst ya da alt sırasına geçersen, uzun bir düz yol açılır. Az dönüş, az satır demektir.',
      'Üstten: <code>solaDon()</code>, <code>ilerle(2)</code>, <code>sagaDon()</code>, <code>ilerle(8)</code>, <code>sagaDon()</code>, <code>ilerle(2)</code>. Alttan da aynı uzunlukta!'
    ]
  },
  {
    title: 'Muz Avı',
    concept: 'Sıralama',
    text: 'Üç muz dağılmış. Hangi sırayla toplayacağına sen karar ver; sonra sandığa git. Daha az dönen rota daha kısa kod demek.',
    map: [
      '............',
      '.M...B......',
      '.........#..',
      '..#.........',
      '.....B..B...',
      '..........S.'
    ],
    dir: 'E',
    solution: 'ilerle(4)\nsagaDon()\nilerle(3)\nsolaDon()\nilerle(5)\nsagaDon()\nilerle()',
    hints: [
      'Önce rotayı parmağınla haritada çiz; sonra koda dök.',
      'Üstteki muzdan aşağı inersen alttaki iki muz aynı sırada kalır: tek bir <code>ilerle</code> ikisini birden toplar.',
      'İlk muza <code>ilerle(4)</code>, sonra aşağı <code>ilerle(3)</code>, sonra sağa doğru yürü.'
    ]
  },
  {
    title: 'Hata Avı',
    concept: 'Hata ayıklama',
    text: 'Bu kodu bir arkadaşın yazmış ama Mojo suya düşüyor! Önce <b>çalıştır</b>, hangi satırda takıldığını gör, sonra <b>düzelt</b>.',
    map: [
      '...........',
      '.M...B.~~..',
      '.......~~..',
      '...#.......',
      '.....B...S.',
      '...........'
    ],
    dir: 'E',
    starter: 'ilerle(6)\nsagaDon()\nilerle(3)\nsolaDon()\nilerle(4)',
    solution: 'ilerle(4)\nsagaDon()\nilerle(3)\nsolaDon()\nilerle(4)',
    hints: [
      'Çalıştır ve Mojo\'nun nerede durduğuna bak: mesaj, hatanın hangi satırda olduğunu söyler.',
      'İlk satırdaki sayı fazla. Muza kadar kaç kare var? Cetvel yardım eder.',
      'İlk satır <code>ilerle(4)</code> olmalı.'
    ]
  },
  {
    title: 'Köprü Geçidi',
    concept: 'Rota seçimi',
    text: 'Nehri yalnızca köprülerden geçebilirsin. İki köprü ve iki muz var; rotanı planla.',
    map: [
      '.....~......',
      '.M...=....B.',
      '..#..~......',
      '.....~..#...',
      '..B..=......',
      '.....~....S.'
    ],
    dir: 'E',
    solution: 'sagaDon()\nilerle(3)\nsolaDon()\nilerle(9)\nsolaDon()\nilerle(3)\nsagaDon()\nsagaDon()\nilerle(4)',
    hints: [
      'Soldaki muz alt köprünün hizasında. Önce onu almak işini kolaylaştırır.',
      'Alt köprüden geçip sağ kenara kadar yürüyebilirsin. İki kez <code>sagaDon()</code> yazarsan Mojo geri döner.',
      'Aşağı in, alt sırada sağa yürü, yukarıdaki muzu al, sonra dönüp sandığa in.'
    ]
  },
  {
    title: 'Anahtar ve Kapı',
    concept: 'Sıralama',
    text: 'Sandık çalılarla çevrili. Kapıdan geçmek için önce <b>anahtarı</b> almalısın. İşlerin sırası önemli!',
    map: [
      '........###.',
      '.M......#S#.',
      '........#G#.',
      '............',
      '..K.........',
      '............'
    ],
    dir: 'E',
    solution: 'sagaDon()\nilerle(3)\nsolaDon()\nilerle(8)\nsolaDon()\nilerle(3)',
    hints: [
      'Kapı anahtar alınmadan açılmaz. Önce anahtara git.',
      'Kapı aşağıdan açılıyor. Anahtarın sırasında sağa yürürsen tam kapının altına gelirsin.',
      '<code>sagaDon()</code>, <code>ilerle(3)</code>, <code>solaDon()</code>, <code>ilerle(8)</code>, <code>solaDon()</code>, <code>ilerle(3)</code>'
    ]
  },
  {
    title: 'Kısa Kod, Uzun Yol',
    concept: 'Verimlilik',
    text: 'Ormanın içinden kıvrılan kısa bir patika var; ormanın çevresinden dolaşan uzun bir yol da. Hangisi <b>daha az satır</b> tutar?',
    map: [
      '............',
      '...#######..',
      '...#.....#..',
      'M....###...S',
      '...#.....#..',
      '...#######..',
      '............'
    ],
    dir: 'E',
    solution: 'solaDon()\nilerle(3)\nsagaDon()\nilerle(11)\nsagaDon()\nilerle(3)',
    hints: [
      'Patikadan gitmek daha az adım ama çok dönüş ister. Her dönüş bir satır daha demek.',
      'Ormanın kenarından dolaşırsan yalnızca üç düz parça ve üç dönüş gerekir.',
      'Yukarı çık, en üst sırada sağa yürü, sonra sandığa in.'
    ]
  },
  {
    title: 'Yön Karışıklığı',
    concept: 'Hata ayıklama',
    text: 'Mojo bu kez <b>aşağı</b> bakıyor ve kod yine hatalı. Unutma: sağ ve sol, <b>Mojo\'nun baktığı yöne göredir</b>.',
    map: [
      '..M........',
      '...........',
      '..B....#...',
      '...........',
      '.#.....B..S',
      '...........'
    ],
    dir: 'S',
    starter: 'ilerle(4)\nsagaDon()\nilerle(8)',
    solution: 'ilerle(4)\nsolaDon()\nilerle(8)',
    hints: [
      'Kendini Mojo\'nun yerine koy: aşağı bakarken sağ elin hangi tarafı gösterir?',
      'Güneye bakan Mojo\'nun sağı batı (ekranın solu), solu doğu (ekranın sağı).',
      '<code>sagaDon()</code> yerine <code>solaDon()</code> yaz.'
    ]
  },
  {
    title: 'Orman Muhafızı',
    concept: 'Ada sınavı',
    text: 'Filiz Ormanı\'nın son görevi: anahtar, kapı, nehir ve üç muz. Rotanı planla, sonra kısalt!',
    map: [
      '......~.......',
      '.M....=...###.',
      '..#...~...#S#.',
      '....B.~...#G#.',
      '......~.......',
      '.K..#.=..B....',
      '......~.....#.',
      '...B..~.......'
    ],
    dir: 'E',
    solution: 'sagaDon()\nilerle(6)\nsolaDon()\nilerle(2)\nsolaDon()\nilerle(4)\nsagaDon()\nilerle(2)\nsagaDon()\nilerle(2)\nsolaDon()\nilerle(6)\nsolaDon()\nilerle(3)',
    hints: [
      'Anahtar ve iki muz nehrin solunda. Önce o tarafı bitir.',
      'Sol sütundan aşağı inersen anahtarı yolda alırsın. Alttaki muzdan sonra yukarı çıkıp ortadaki muzu al.',
      'Alt köprüden geç, sağdaki muzu topla ve kapıya aşağıdan gir.'
    ]
  }
];
