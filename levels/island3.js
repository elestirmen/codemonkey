// Ada 3 · Nilüfer Tapınağı · Fonksiyonlar
// Döngü art arda gelen tekrarı kısaltır; fonksiyon ise haritaya dağılmış,
// aralıkları farklı tekrarları. Odalar arasındaki mesafeler bu yüzden eşit değil.

const ODA = 'tanimla oda():\n    sagaDon()\n    ilerle(3)\n    solaDon()\n    ilerle()\n    solaDon()\n    ilerle(3)\n    sagaDon()\n\n';
const CEP = 'tanimla cep():\n    solaDon()\n    ilerle(3)\n    sagaDon()\n    sagaDon()\n    ilerle(3)\n    solaDon()\n\n';

export const ISLAND_3 = [
  {
    title: 'Kendi Komutun',
    concept: 'Fonksiyon',
    teaches: 'function',
    text: 'Tapınakta üç oda var ve her birine <b>aynı şekilde</b> girip çıkıyorsun. Bu hareketi bir kez <code>tanimla oda():</code> ile öğret, sonra <code>oda()</code> diye çağır!',
    map: [
      '....#....#......',
      '.M...........S..',
      '#..#.#..#..#..#.',
      '#..#.#..#..#..#.',
      '#BB#.#BB#..#BB#.',
      '####.####..####.',
      '....#.....#....#'
    ],
    dir: 'E',
    solution: ODA + 'oda()\nilerle(4)\noda()\nilerle(5)\noda()',
    stars: { three: 13, two: 19 },
    hints: [
      'Bir odaya gir, iki muzu al, öbür kapıdan çık. Bu kaç komut?',
      '<code>tanimla oda():</code> altına 4 boşluk içeriden: <code>sagaDon()</code>, <code>ilerle(3)</code>, <code>solaDon()</code>, <code>ilerle()</code>, <code>solaDon()</code>, <code>ilerle(3)</code>, <code>sagaDon()</code>.',
      'Ana programda: <code>oda()</code>, <code>ilerle(4)</code>, <code>oda()</code>, <code>ilerle(5)</code>, <code>oda()</code>. Aralıklar farklı olduğu için döngü yetmez; fonksiyon yeter!'
    ]
  },
  {
    title: 'Her Yönde Aynı',
    concept: 'Fonksiyon',
    text: 'Bu kez odalar farklı yönlere bakıyor. Ama Mojo için <b>sağ hep sağdır</b>: aynı <code>oda()</code> fonksiyonu her yönde çalışır!',
    map: [
      '.......#........',
      '.M.............#',
      '..#..#....####..',
      '..#..#....#B....',
      '..#BB#....#B....',
      '..####.#######..',
      '.......#BB#.....',
      '#...#..#..#.....',
      '.......#..#.....',
      '.#......S.......'
    ],
    dir: 'E',
    solution: ODA + 'ilerle(2)\noda()\nilerle(10)\nsagaDon()\nilerle(2)\noda()\nilerle(5)\nsagaDon()\nilerle(5)\noda()',
    stars: { three: 18, two: 26 },
    hints: [
      'Her odanın kapısına geldiğinde oda Mojo\'nun sağında kalıyor mu? Öyleyse aynı fonksiyon işe yarar.',
      'Fonksiyonu bir kez tanımla; odalar arasında yalnızca yürü ve dön.',
      '<code>ilerle(2)</code>, <code>oda()</code>, <code>ilerle(10)</code>, <code>sagaDon()</code>, <code>ilerle(2)</code>, <code>oda()</code>, <code>ilerle(5)</code>, <code>sagaDon()</code>, <code>ilerle(5)</code>, <code>oda()</code>'
    ]
  },
  {
    title: 'Çıkmaz Sokaklar',
    concept: 'Fonksiyon',
    text: 'Duvardaki dar sokakların sonunda muzlar var. Her sokağa girip geri çıkmak aynı hareket, ama sokaklar arasındaki mesafeler farklı.',
    map: [
      '###B##B###B#B###',
      '###.##.###.#.###',
      '###.##.###.#.###',
      '.M............S.',
      '........#.......',
      '#....#.....#....'
    ],
    dir: 'E',
    solution: CEP + 'ilerle(2)\ncep()\nilerle(3)\ncep()\nilerle(4)\ncep()\nilerle(2)\ncep()\nilerle(2)',
    stars: { three: 16, two: 23 },
    hints: [
      'Bir sokak: sola dön, 3 kare gir, arkanı dön, 3 kare çık, yeniden sağa bak.',
      'Arkanı dönmek için iki kez <code>sagaDon()</code> yaz.',
      '<code>tanimla cep():</code> yaz ve her sokağın önünde <code>cep()</code> çağır.'
    ]
  },
  {
    title: 'Fonksiyonda Hata',
    concept: 'Hata ayıklama',
    text: 'Bu kodda <code>oda()</code> fonksiyonu yanlış: Mojo odaların dibine inemiyor. Fonksiyonu düzeltirsen <b>bütün çağrılar birden</b> düzelir!',
    map: [
      '......#.........',
      '..M..........S..',
      '.#..#..#..##..#.',
      '.#..#..#..##..#.',
      '.#BB#..#BB##BB#.',
      '.####..#########',
      '#....#..........'
    ],
    dir: 'E',
    starter: ODA.replace('ilerle(3)\n    solaDon()\n    ilerle()', 'ilerle(2)\n    solaDon()\n    ilerle()') + 'oda()\nilerle(5)\noda()\nilerle(3)\noda()',
    solution: ODA + 'oda()\nilerle(5)\noda()\nilerle(3)\noda()',
    stars: { three: 13, two: 16 },
    hints: [
      '<b>Adım adım</b> çalıştır: ilk odada Mojo kaç kare iniyor?',
      'Odanın dibindeki muzlara ulaşmak için kapıdan 3 kare inmek gerekir.',
      'Fonksiyondaki ilk <code>ilerle(2)</code>, <code>ilerle(3)</code> olmalı.'
    ]
  },
  {
    title: 'Merdiven Fonksiyonu',
    concept: 'Fonksiyon + döngü',
    text: 'Tapınağın basamakları üç merdiven halinde iniyor. Bir basamağı fonksiyon yap; her merdiveni <code>tekrarla</code> ile, kaç basamaksa o kadar çağır.',
    map: [
      '................',
      '.M..............',
      '.#.B............',
      '.##.............',
      '.###B.B.........',
      '.######.........',
      '.#######B.B.....',
      '.#########......',
      '.##########B....',
      '.###########S...'
    ],
    dir: 'E',
    solution: 'tanimla basamak():\n    ilerle()\n    sagaDon()\n    ilerle()\n    solaDon()\n\ntekrarla(3):\n    basamak()\nilerle(2)\ntekrarla(2):\n    basamak()\nilerle()\ntekrarla(3):\n    basamak()',
    stars: { three: 13, two: 17 },
    hints: [
      'Bir basamak: <code>ilerle()</code>, <code>sagaDon()</code>, <code>ilerle()</code>, <code>solaDon()</code>.',
      'Merdivenler 3, 2 ve 3 basamak; aralarında düz yollar var.',
      '<code>tekrarla(3):</code> içinde <code>basamak()</code>, sonra <code>ilerle(2)</code>, sonra <code>tekrarla(2):</code>…'
    ]
  },
  {
    title: 'Döngü ve Fonksiyon',
    concept: 'Fonksiyon + döngü',
    text: 'Üç oda yan yana ve aralarındaki mesafe hep aynı: burada <b>döngü</b> işe yarar. Son oda ise başka bir köşede: fonksiyonu orada da çağır!',
    map: [
      '...............#..',
      '.M................',
      '#..#.#..#.#..#....',
      '#..#.#..#.#..#...#',
      '#BB#.#BB#.#BB#....',
      '####.####.####....',
      '............####..',
      '........#...#B....',
      '...#........#B..S.',
      '............####..'
    ],
    dir: 'E',
    solution: ODA + 'tekrarla(3):\n    oda()\n    ilerle(4)\nsagaDon()\nilerle(6)\noda()',
    stars: { three: 14, two: 18 },
    hints: [
      'Eşit aralıkla tekrar eden kısım: <code>oda()</code> ve <code>ilerle(4)</code>.',
      'Döngünün içinde fonksiyon çağırabilirsin: <code>tekrarla(3):</code> → <code>oda()</code>, <code>ilerle(4)</code>.',
      'Sonra sağa dön, 6 kare in ve son odada yine <code>oda()</code>.'
    ]
  },
  {
    title: 'Anahtarlı Kasa',
    concept: 'Fonksiyon',
    text: 'Sandık, tapınak duvarındaki kilitli bir kasada. Anahtar odalardan birinde. Önce odaları gez, sonra kasaya git.',
    map: [
      '#############S##',
      '#############G##',
      'M...............',
      '.#..#..#..#.....',
      '.#..#..#..#.....',
      '.#BB#..#BK#....#',
      '.####..####.....',
      '.....#......#...'
    ],
    dir: 'E',
    solution: ODA + 'ilerle(2)\noda()\nilerle(5)\noda()\nilerle(4)\nsolaDon()\nilerle(2)',
    stars: { three: 15, two: 20 },
    hints: [
      'Anahtar ikinci odada; <code>oda()</code> fonksiyonu onu da toplar.',
      'Kapı anahtar alınınca açılır. Kasaya koridordan yukarı doğru girersin.',
      '<code>ilerle(2)</code>, <code>oda()</code>, <code>ilerle(5)</code>, <code>oda()</code>, <code>ilerle(4)</code>, <code>solaDon()</code>, <code>ilerle(2)</code>'
    ]
  },
  {
    title: 'İki Fonksiyon',
    concept: 'Fonksiyon',
    text: 'Koridorun üstünde dar sokaklar, altında odalar var. İki farklı hareket, iki farklı fonksiyon: <code>cep()</code> ve <code>oda()</code>.',
    map: [
      '##B######B######',
      '##.######.######',
      '##.######.######',
      '.M...........S..',
      '....#..#...#..#.',
      '....#..#...#..#.',
      '....#BB#...#BB##',
      '#...####.#.####.'
    ],
    dir: 'E',
    solution: CEP + ODA + 'ilerle()\ncep()\nilerle(3)\noda()\nilerle(3)\ncep()\nilerle(3)\noda()',
    stars: { three: 23, two: 30 },
    hints: [
      'Bir programda birden çok fonksiyon tanımlayabilirsin.',
      '<code>cep()</code>: sola dön, gir, arkanı dön, çık. <code>oda()</code>: sağa dön, in, yürü, çık.',
      'Ana program sırayla: <code>cep()</code>, <code>oda()</code>, <code>cep()</code>, <code>oda()</code>; aralarda doğru sayıda ilerle.'
    ]
  },
  {
    title: 'Sütunlu Avlular',
    concept: 'Fonksiyon + döngü',
    text: 'Her avluda bir sütun var; muzlar sütunun etrafında. Avluyu dolaşmak bir döngü… ve o döngü de bir <b>fonksiyonun içinde</b> olabilir.',
    map: [
      '....#.....#.......',
      '.M............S...',
      '#.###.#.###..#.###',
      '#..B#.#..B#..#..B#',
      '#.#.#.#.#.#..#.#.#',
      '#B.B#.#B.B#..#B.B#',
      '#####.#####..#####',
      '.....#......#.....'
    ],
    dir: 'E',
    solution: 'tanimla avlu():\n    sagaDon()\n    ilerle(2)\n    tekrarla(3):\n        ilerle(2)\n        solaDon()\n    ilerle(2)\n    sagaDon()\n    ilerle(2)\n    sagaDon()\n\navlu()\nilerle(6)\navlu()\nilerle(7)\navlu()',
    stars: { three: 15, two: 22 },
    hints: [
      'Avluya gir; sütunun çevresinde üç kenar dolaş, dördüncü kenarda kapıya dön.',
      'Kenarlar: <code>tekrarla(3):</code> içinde <code>ilerle(2)</code> ve <code>solaDon()</code>.',
      'Avlu fonksiyonu bitince Mojo yine sağa bakmalı. Avlular 6 ve 7 kare arayla.'
    ]
  },
  {
    title: 'Eksik Çağrı',
    concept: 'Hata ayıklama',
    text: 'Bu programda bir sokak atlanıyor ve Mojo sandığa muzsuz varıyor. Hangi çağrı eksik?',
    map: [
      '##B##B#####B###',
      '##.##.#####.###',
      '##.##.#####.###',
      'M............S.',
      '.........#.....',
      '....#.........#'
    ],
    dir: 'E',
    starter: CEP + 'ilerle(2)\ncep()\nilerle(3)\nilerle(6)\ncep()\nilerle(2)',
    solution: CEP + 'ilerle(2)\ncep()\nilerle(3)\ncep()\nilerle(6)\ncep()\nilerle(2)',
    stars: { three: 14, two: 17 },
    hints: [
      'Çalıştır ve hangi sokağın atlandığına bak.',
      'Mojo ikinci sokağın önünden geçiyor ama içine girmiyor.',
      '<code>ilerle(3)</code> ile <code>ilerle(6)</code> arasına <code>cep()</code> ekle.'
    ]
  },
  {
    title: 'Yukarı ve Aşağı',
    concept: 'Fonksiyon',
    text: 'Koridorun iki yanında sokaklar var. Yukarıdakiler için sola, aşağıdakiler için sağa dönersin: <b>ayna gibi iki fonksiyon</b> yaz.',
    map: [
      '##B####B####B###',
      '##.####.####.###',
      'M.............S.',
      '####.####..#####',
      '####B####BB#####'
    ],
    dir: 'E',
    solution: 'tanimla yukari():\n    solaDon()\n    ilerle(2)\n    sagaDon()\n    sagaDon()\n    ilerle(2)\n    solaDon()\n\ntanimla asagi():\n    sagaDon()\n    ilerle(2)\n    sagaDon()\n    sagaDon()\n    ilerle(2)\n    sagaDon()\n\nilerle(2)\nyukari()\nilerle(2)\nasagi()\nilerle(3)\nyukari()\nilerle(2)\nasagi()\nilerle()\nasagi()\nilerle(2)\nyukari()\nilerle(2)',
    stars: { three: 27, two: 36 },
    hints: [
      'Yukarı sokak: sola dön, gir, arkanı dön, çık, sola dön (yeniden doğuya bakarsın).',
      'Aşağı sokak bunun aynası: sola yerine sağa.',
      'Sokakları soldan sağa sırayla gez; her birinin önünde doğru fonksiyonu çağır.'
    ]
  },
  {
    title: 'Tapınak Koruyucusu',
    concept: 'Ada sınavı',
    text: 'Tapınağın son görevi: sokaklar, odalar ve kilitli kapı. Anahtar son sokakta. İki fonksiyonunu kur ve tapınağı baştan sona gez!',
    map: [
      '##B###B####B#K####',
      '##.###.####.#.####',
      '##.###.####.#.####',
      'M...............GS',
      '..#..#.#..#..#..#.',
      '..#..#.#..#..#..#.',
      '..#BB#.#BB#..#BB#.',
      '#.#########.#####.'
    ],
    dir: 'E',
    solution: CEP + ODA + 'ilerle(2)\ncep()\nilerle()\noda()\nilerle(2)\ncep()\nilerle(2)\noda()\nilerle(2)\ncep()\nilerle(2)\ncep()\nilerle()\noda()\nilerle(3)',
    stars: { three: 30, two: 40 },
    hints: [
      'Önce iki fonksiyonu tanımla: <code>cep()</code> (yukarı sokak) ve <code>oda()</code> (aşağı oda).',
      'Soldan sağa: sokak, oda, sokak, oda, sokak, sokak (anahtar), oda.',
      'Anahtarı aldıktan sonra kapı açılır; son odadan çıkınca 3 kare ilerle.'
    ]
  }
];
