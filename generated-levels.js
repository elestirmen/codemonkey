// GENERATED FILE — do not edit by hand.
//
// Produced by tools/generate-levels.mjs (52 missions).
// Every board here was validated with the game's own route planner: it is
// solvable, its shortest route meets the chapter's step floor and its
// reference program meets the chapter's line floor. Run `npm run levels` to
// rebuild after changing the generator.

export const GENERATED_LEVELS = [
  {
    id: 30,
    title: "30. İkiz Kemer",
    instructions: "Köprüye doğru rotayı planla; aynı hareketi üst üste yazmak yerine döngü kullan.",
    tip: "Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.",
    grid: [
      "################",
      "##.............#",
      "#..#...........#",
      "#.#...=~#......#",
      "#....B.......S.#",
      "#......~..B....#",
      "#.B...#..##....#",
      "#.M~.#.....##.~#",
      "#..........~...#",
      "################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 31,
    title: "31. Sal İskelesi",
    instructions: "Nehri köprüden (<code>=</code>) geç ve tekrar eden düz parçaları <code>tekrarla(N)</code> ile kısalt.",
    tip: "Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.",
    grid: [
      "#################",
      "#......#........#",
      "#...............#",
      "##.....~..B...#.#",
      "#....B.=.....S..#",
      "#...M.....B.....#",
      "#.......~~......#",
      "#...##.~....#...#",
      "#..#..#..#......#",
      "#################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 32,
    title: "32. Menderes Yolu",
    instructions: "Nehri köprüden (<code>=</code>) geç ve tekrar eden düz parçaları <code>tekrarla(N)</code> ile kısalt.",
    tip: "<code>ilerle()</code> satırını üç kez yazmak yerine <code>adimla(3)</code> yaz.",
    grid: [
      "#################",
      "#........#......#",
      "#~#......#....#.#",
      "#..M.....~#.#..~#",
      "#...B...B=...S.~#",
      "##.......~B.....#",
      "#....##.........#",
      "#..#.......~..#.#",
      "#~.....#.#......#",
      "#################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 33,
    title: "33. Yankılı Kalıp",
    instructions: "Nehri köprüden (<code>=</code>) geç ve tekrar eden düz parçaları <code>tekrarla(N)</code> ile kısalt.",
    tip: "Köprüler (<code>=</code>) nehirlerin üzerinden güvenli geçiş sağlar.",
    grid: [
      "#################",
      "#...~#...#......#",
      "#..#..##........#",
      "#~.###...#.....##",
      "#.....~......S..#",
      "#..B..=...#B....#",
      "##.B~.~......~.##",
      "#...........##..#",
      "#.M.........#...#",
      "#.............~.#",
      "#################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 34,
    title: "34. Suyun Üstünde",
    instructions: "Uzun düzlükleri <code>adimla(N)</code> ile tek satıra indir, dönüş kalıplarını döngüye al.",
    tip: "Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.",
    grid: [
      "##################",
      "#....#.#....#....#",
      "#~....##......#.##",
      "##.#..#.#.~...#..#",
      "#.#..#...........#",
      "#.............##.#",
      "#.M...#.......#.##",
      "#..B...B.......S.#",
      "#....#..=.B......#",
      "#...~............#",
      "##################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 35,
    title: "35. Halka Rotası",
    instructions: "Köprüye doğru rotayı planla; aynı hareketi üst üste yazmak yerine döngü kullan.",
    tip: "Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.",
    grid: [
      "##################",
      "#...#.........#~.#",
      "#.##....~=....#S.#",
      "#.M.......~......#",
      "#..B....#...B.~..#",
      "#.....#........B.#",
      "#..#.#...........#",
      "#.#..#......#....#",
      "#.#......#...#~.##",
      "#.#...~..~.....#.#",
      "##################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 36,
    title: "36. Tekrar Nehri",
    instructions: "Uzun düzlükleri <code>adimla(N)</code> ile tek satıra indir, dönüş kalıplarını döngüye al.",
    tip: "<code>ilerle()</code> satırını üç kez yazmak yerine <code>adimla(3)</code> yaz.",
    grid: [
      "###################",
      "#...#......##..~#.#",
      "#.#......B...#.#..#",
      "#........B...#....#",
      "#.##.B...#....S#..#",
      "#.#..=.......~..~##",
      "##.....B.........##",
      "#.M.#..~....~#....#",
      "#........~.......~#",
      "#....~...#....#...#",
      "###################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 37,
    title: "37. Kemerli Geçiş",
    instructions: "Nehri köprüden (<code>=</code>) geç ve tekrar eden düz parçaları <code>tekrarla(N)</code> ile kısalt.",
    tip: "Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.",
    grid: [
      "###################",
      "#........#.##.#..##",
      "#.~#....~......#..#",
      "###......B=~.#.#..#",
      "#....B.~...B..S...#",
      "#...M..#...B......#",
      "#..#.....#......#.#",
      "###.#..##..#...~~.#",
      "#......#.........##",
      "#...#.#..##.......#",
      "###################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 38,
    title: "38. Salkım Köprü",
    instructions: "Uzun düzlükleri <code>adimla(N)</code> ile tek satıra indir, dönüş kalıplarını döngüye al.",
    tip: "Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.",
    grid: [
      "###################",
      "##.#..##.....##.#.#",
      "#.MB..B......~.~..#",
      "##.#..B..~........#",
      "#.~......=....S~..#",
      "#...~...~~B...#...#",
      "##~#...###..~.#...#",
      "#..#.##..~......#.#",
      "#..#~##..##~...~.##",
      "###.#.........##.~#",
      "#...#.#...........#",
      "###################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 39,
    title: "39. Döngü Vadisi",
    instructions: "Nehri köprüden (<code>=</code>) geç ve tekrar eden düz parçaları <code>tekrarla(N)</code> ile kısalt.",
    tip: "Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.",
    grid: [
      "####################",
      "#....#.~...##......#",
      "#....#..~.#...B..#.#",
      "#.#...#~~..B......##",
      "#....B..=......S...#",
      "#.......~.~#......##",
      "#.....#...##.....#.#",
      "#..BM......#.#~#...#",
      "#.#.........#.~..~##",
      "#.#...#....~.##....#",
      "#..........#..~...~#",
      "####################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 40,
    title: "40. Kıyıdan Kıyıya",
    instructions: "Uzun düzlükleri <code>adimla(N)</code> ile tek satıra indir, dönüş kalıplarını döngüye al.",
    tip: "Simetrik bölümlerde aynı kalıbı <code>tekrarla</code> ile tek yere topla.",
    grid: [
      "####################",
      "#.........#.#.#...##",
      "#.~............~...#",
      "#~.M.B...~..#..#..##",
      "#.#B..#.......#...##",
      "#.#~..B...#....B..##",
      "#....#.~=....~...S##",
      "#.~...........#.~..#",
      "#......#..#..~.....#",
      "##.......#...#.....#",
      "#............~.#.~##",
      "####################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 49,
    title: "49. Anahtar Deliği",
    instructions: "Kilitli kapıyı (<code>G</code>) açmak için önce anahtarı (<code>K</code>) al, sonra kapıya yönel.",
    tip: "Nilüfer yaprağı bir kez taşır. Aynı yaprağa dönmek zorunda kalmayacağın rotayı seç.",
    grid: [
      "################",
      "#....~.....#...#",
      "#.M...B..B.G#S.#",
      "#....#~L.L....##",
      "#.#....~.~..B.~#",
      "#.#....#.~....~#",
      "#.........~....#",
      "#...K....#.....#",
      "#.#.......##...#",
      "################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 50,
    title: "50. Çürük Yaprak",
    instructions: "Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.",
    tip: "Cetvel butonuyla anahtar ve kapı arasındaki mesafeyi ölçebilirsin.",
    grid: [
      "################",
      "##..........##.#",
      "#.~LLLL.G..BBS.#",
      "#.K~.~.....~#~.#",
      "#...B.......##.#",
      "##...#.......#.#",
      "##M.....#..~...#",
      "#....~...#..##.#",
      "#..............#",
      "################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 51,
    title: "51. Kilit Ustası",
    instructions: "Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.",
    tip: "Anahtarı almadan kapı açılmaz; rotanı anahtar üzerinden kur.",
    grid: [
      "#################",
      "#...............#",
      "#.....LLBGB..S#.#",
      "#~.B..~~......#.#",
      "#...M..~........#",
      "#....#....~#.~~.#",
      "#.......#...#~..#",
      "#.K.............#",
      "#...........#...#",
      "#################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 52,
    title: "52. Yeşil Kapı",
    instructions: "Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.",
    tip: "Anahtarı almadan kapı açılmaz; rotanı anahtar üzerinden kur.",
    grid: [
      "#################",
      "#..#.......~....#",
      "#~.MB..LG....S..#",
      "#..B..LL........#",
      "###..BL~..#.....#",
      "#..~~.~.........#",
      "#....K#......~.##",
      "##..##....~.....#",
      "#~..............#",
      "#################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 53,
    title: "53. Sırlı Sürgü",
    instructions: "Nilüfer yaprakları (<code>L</code>) bir kez basıldıktan sonra batar. Geri dönüşü olmayan rotayı önceden çiz.",
    tip: "Cetvel butonuyla anahtar ve kapı arasındaki mesafeyi ölçebilirsin.",
    grid: [
      "#################",
      "#.....#.....#...#",
      "#...LLLL..B..S..#",
      "#........KG.B...#",
      "#..B....#~......#",
      "#....##..#.#....#",
      "#.M.....#..##...#",
      "#~....#.........#",
      "##......#......##",
      "##...#..#.#~....#",
      "#################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 54,
    title: "54. Kaygan Yaprak",
    instructions: "Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.",
    tip: "Cetvel butonuyla anahtar ve kapı arasındaki mesafeyi ölçebilirsin.",
    grid: [
      "##################",
      "#.~~.#.........###",
      "#..~....#...#....#",
      "#..#....~........#",
      "#..#.......B..K..#",
      "#..BM..~~~.G.#S.##",
      "#......LLL.B....##",
      "#......~~~......~#",
      "##...#...#..~~...#",
      "##..~.~.##.......#",
      "##################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 55,
    title: "55. Demir Kanat",
    instructions: "Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.",
    tip: "Cetvel butonuyla anahtar ve kapı arasındaki mesafeyi ölçebilirsin.",
    grid: [
      "##################",
      "##........##..#..#",
      "#...~LK.G....S...#",
      "#...~LB........~##",
      "#....B~#.#.....~~#",
      "#.....##~....#..##",
      "#....B#.........##",
      "#...........#....#",
      "#..M...........~##",
      "#...#......#...~.#",
      "##################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 56,
    title: "56. Nilüfer Halkası",
    instructions: "Nilüfer yaprakları (<code>L</code>) bir kez basıldıktan sonra batar. Geri dönüşü olmayan rotayı önceden çiz.",
    tip: "Anahtarı almadan kapı açılmaz; rotanı anahtar üzerinden kur.",
    grid: [
      "###################",
      "#..~...#........#.#",
      "#...~#..~.~.G.S.###",
      "#~...#...BK...~...#",
      "#...BB...LL~##....#",
      "#~......#~~.......#",
      "#..#M.B..#....#...#",
      "#~...#..~#........#",
      "#.~.#............~#",
      "#..#......#..#...~#",
      "###################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 57,
    title: "57. Anahtar İzi",
    instructions: "Kilitli kapıyı (<code>G</code>) açmak için önce anahtarı (<code>K</code>) al, sonra kapıya yönel.",
    tip: "Anahtarı almadan kapı açılmaz; rotanı anahtar üzerinden kur.",
    grid: [
      "###################",
      "#................##",
      "#.............~...#",
      "#..M..BB....~.....#",
      "#.#......~...#..#~#",
      "#......#.......#~.#",
      "#..~.....K..~...#.#",
      "#....B..B.........#",
      "##..LLLG......S...#",
      "##.#....#.........#",
      "###################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 58,
    title: "58. Son Yaprak",
    instructions: "Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.",
    tip: "Anahtarı almadan kapı açılmaz; rotanı anahtar üzerinden kur.",
    grid: [
      "###################",
      "##...~#......#....#",
      "#.......LL..B...S.#",
      "#...M..LG..B..B...#",
      "#.......##........#",
      "#~.##..L.....#..#.#",
      "#..#.#.~.BK..#....#",
      "#.~.#..~.........##",
      "#.....~.#.........#",
      "#..##..#.....~.####",
      "##......###......##",
      "###################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 59,
    title: "59. Kilitli Koru",
    instructions: "Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.",
    tip: "Anahtarı almadan kapı açılmaz; rotanı anahtar üzerinden kur.",
    grid: [
      "####################",
      "#..........###.#...#",
      "#...#.#.....#...#.~#",
      "#........~.........#",
      "#.#..#..~..~.......#",
      "#~.~MB....~L~......#",
      "#~##.......LB...K..#",
      "#.#~~....#..~.....~#",
      "#..~.~..#....BG.##.#",
      "#......#~~.B...S...#",
      "###....#..~........#",
      "####################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 60,
    title: "60. Bataklık Kapısı",
    instructions: "Anahtarı al, kapıyı aç ve batan yapraklara iki kez basmayacak bir sıralama kur.",
    tip: "Anahtarı almadan kapı açılmaz; rotanı anahtar üzerinden kur.",
    grid: [
      "####################",
      "#....#.............#",
      "#..............#.~.#",
      "#~.M...............#",
      "#.#..B.~...........#",
      "##..#B..B~.....#.#.#",
      "#..~..~~LL~....#...#",
      "#.#~.....~.........#",
      "#..#.K.....##...#..#",
      "#.##...#.B.G...S...#",
      "#...........#~....~#",
      "####################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 70,
    title: "70. Yavaş Akıntı",
    instructions: "Adımlarını say: kaplumbağa daldığı anda üzerine basarsan Mojo suya düşer.",
    tip: "Dönüş ve <code>bekle()</code> de birer adım harcar; sayacı buna göre tut.",
    grid: [
      "#################",
      "#.........#...#.#",
      "#...#........#.##",
      "##..#....#.....##",
      "#..~....~..B....#",
      "#.M...###~......#",
      "#...BB...T.T.S..#",
      "#...#....~......#",
      "#.#..~..........#",
      "#################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 71,
    title: "71. Kabuk Köprüsü",
    instructions: "Adımlarını say: kaplumbağa daldığı anda üzerine basarsan Mojo suya düşer.",
    tip: "Dönüş ve <code>bekle()</code> de birer adım harcar; sayacı buna göre tut.",
    grid: [
      "##################",
      "#....#.##......~.#",
      "#.~#MBB~##.#.....#",
      "#.....B.......#..#",
      "#..#.#..~..#.....#",
      "#....#..T........#",
      "##...~..~...T~S#.#",
      "#.......~.......##",
      "#..#...#.#.#..#..#",
      "##################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 72,
    title: "72. Zamanlı Sıçrayış",
    instructions: "Kaplumbağalar (<code>T</code>) iki adım suda, iki adım havada. <code>bekle()</code> ile doğru anı yakala.",
    tip: "Kaplumbağa her 2 adımda bir dalar. Adım adım çalıştırarak ritmi izle.",
    grid: [
      "##################",
      "#..~#...#..~...#.#",
      "#......#...~..#..#",
      "#......B.B.T.....#",
      "#..~...T...~~..S.#",
      "#.M.....#.~##.#..#",
      "##.....B.........#",
      "#...#.#......#...#",
      "#...~..#~....~#..#",
      "##################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 73,
    title: "73. Ritim Vadisi",
    instructions: "Zamanlamayı kur; gerekirse kıyıda <code>bekle()</code> yazıp ritmi tuttur.",
    tip: "Kaplumbağa her 2 adımda bir dalar. Adım adım çalıştırarak ritmi izle.",
    grid: [
      "##################",
      "#.~#......#..##..#",
      "#.....#........#.#",
      "#...#.#~.~.......#",
      "#........~.......#",
      "#.#.MB...#...~..##",
      "#.#......~..~#...#",
      "#~....B..T..T.S..#",
      "#.#..~~..~.~.B.#.#",
      "#..........~..#.##",
      "##################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 74,
    title: "74. Dalgıç Kaplumbağa",
    instructions: "Kaplumbağalar (<code>T</code>) iki adım suda, iki adım havada. <code>bekle()</code> ile doğru anı yakala.",
    tip: "Kaplumbağanın üzerinde dururken dönüş yaparsan o adımda dalabilir; dikkat et.",
    grid: [
      "###################",
      "##.........#.#...##",
      "#..M..#.~#......~##",
      "#......#.#....#...#",
      "#~.....#..#....#..#",
      "#..#...~#.....~...#",
      "#..#...~...T...#..#",
      "#..~T.B.B....~S...#",
      "#......B..........#",
      "#...~..#..#.......#",
      "###################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 75,
    title: "75. Saniye Şansı",
    instructions: "Zamanlamayı kur; gerekirse kıyıda <code>bekle()</code> yazıp ritmi tuttur.",
    tip: "Kaplumbağanın üzerinde dururken dönüş yaparsan o adımda dalabilir; dikkat et.",
    grid: [
      "###################",
      "#...#~....#.......#",
      "#~..#.....#......##",
      "#...#.#.....~#....#",
      "#.....#......~.#..#",
      "#.......##B.......#",
      "#.M....~T.B...S..##",
      "#.#......BT~..###~#",
      "#....#............#",
      "#.#..#.....#....#.#",
      "###################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 76,
    title: "76. Sakin Su",
    instructions: "Zamanlamayı kur; gerekirse kıyıda <code>bekle()</code> yazıp ritmi tuttur.",
    tip: "Dönüş ve <code>bekle()</code> de birer adım harcar; sayacı buna göre tut.",
    grid: [
      "####################",
      "##....~..#.~....~..#",
      "##....#......#.....#",
      "#.~T.............~##",
      "#.~..B.........B#..#",
      "#.B.......T....BS..#",
      "#........#..~....#.#",
      "#~M...#.~..#..~.~.##",
      "#...~........~#.#..#",
      "#...##....###...#..#",
      "####################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 77,
    title: "77. Tempo Geçidi",
    instructions: "Adımlarını say: kaplumbağa daldığı anda üzerine basarsan Mojo suya düşer.",
    tip: "Kaplumbağanın üzerinde dururken dönüş yaparsan o adımda dalabilir; dikkat et.",
    grid: [
      "####################",
      "##.....~..~........#",
      "##.#.#......##...#.#",
      "#......##..........#",
      "#..##..#....#......#",
      "#..#BT....T.B...#~.#",
      "#..B...........S.#.#",
      "#.....~.~.#......~.#",
      "#..MB..#.#.........#",
      "#~.#.~....#......~.#",
      "####################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 78,
    title: "78. Nabız Nehri",
    instructions: "Zamanlamayı kur; gerekirse kıyıda <code>bekle()</code> yazıp ritmi tuttur.",
    tip: "Kaplumbağanın üzerinde dururken dönüş yaparsan o adımda dalabilir; dikkat et.",
    grid: [
      "####################",
      "#..~.............#.#",
      "##.......#....T.#.##",
      "#.#~.~#......#B....#",
      "#........~~T..B....#",
      "#..#...#B....~...#.#",
      "##............B#.###",
      "#.M...~...###..S...#",
      "###......##.#...~..#",
      "#~.........#.....#.#",
      "##...~##...........#",
      "####################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 79,
    title: "79. Bekleme Odası",
    instructions: "Kaplumbağalar (<code>T</code>) iki adım suda, iki adım havada. <code>bekle()</code> ile doğru anı yakala.",
    tip: "Dönüş ve <code>bekle()</code> de birer adım harcar; sayacı buna göre tut.",
    grid: [
      "####################",
      "#..~.###.......#...#",
      "#....#...##..#.~..##",
      "#....#B.B.#~#......#",
      "#..#M...B.#...#~...#",
      "#.....#...#..##..~##",
      "#.~..#..T...#.##...#",
      "##......~...T~.S.~.#",
      "#..................#",
      "#~#..##...#.~B.....#",
      "##..#.....####.~.#.#",
      "####################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 80,
    title: "80. Son Dalış",
    instructions: "Kaplumbağalar (<code>T</code>) iki adım suda, iki adım havada. <code>bekle()</code> ile doğru anı yakala.",
    tip: "Dönüş ve <code>bekle()</code> de birer adım harcar; sayacı buna göre tut.",
    grid: [
      "####################",
      "#..##.....~####....#",
      "#~.....#....#.~....#",
      "#..#...#....~#.....#",
      "#........#.........#",
      "#.....B~..B.~T..S#.#",
      "#....#.T...BB......#",
      "###..~#~.~......##.#",
      "###...~.........#..#",
      "#..M....#...#......#",
      "##~..#....#.#......#",
      "####################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 83,
    title: "83. Büyük Geçit",
    instructions: "Bu final parkurunda uzun düzlükler için <code>adimla(N)</code>, kalıplar için <code>tekrarla(N)</code> kullan.",
    tip: "Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.",
    grid: [
      "###############",
      "#....~#......##",
      "#..........T~.#",
      "#.....=..G.K~.#",
      "#....B..B...S.#",
      "#.ML.#........#",
      "#.##......#.#.#",
      "###############"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 84,
    title: "84. Zirve Rotası",
    instructions: "Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.",
    tip: "Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.",
    grid: [
      "###############",
      "#.....#.......#",
      "#.....#..#....#",
      "#......K......#",
      "#.M....BG...S.#",
      "#~....=.~T~...#",
      "#........B....#",
      "#.....#.......#",
      "###############"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 85,
    title: "85. Algoritma Kapısı",
    instructions: "Bu final parkurunda uzun düzlükler için <code>adimla(N)</code>, kalıplar için <code>tekrarla(N)</code> kullan.",
    tip: "Adım adım çalıştırma ve geri alma butonlarıyla kritik anları incele.",
    grid: [
      "###############",
      "#.#...........#",
      "#.~M.=........#",
      "##.B..B....~..#",
      "#.K~.....G.LS.#",
      "#.....#T#..~~.#",
      "#..#.#.~......#",
      "#....#.#......#",
      "###############"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 86,
    title: "86. Son Nehir",
    instructions: "Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.",
    tip: "Adım adım çalıştırma ve geri alma butonlarıyla kritik anları incele.",
    grid: [
      "################",
      "#.#.........#..#",
      "#..=.....#...~##",
      "#...B.B...~.#..#",
      "#..K.BT.G.L..S.#",
      "##M#....~.~#...#",
      "#.......#......#",
      "#..........#~..#",
      "################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 87,
    title: "87. Kırık Pusula",
    instructions: "Bu final parkurunda uzun düzlükler için <code>adimla(N)</code>, kalıplar için <code>tekrarla(N)</code> kullan.",
    tip: "Adım adım çalıştırma ve geri alma butonlarıyla kritik anları incele.",
    grid: [
      "################",
      "##.............#",
      "##...#....#..#.#",
      "#.MB..#.......~#",
      "#....=K..BT~.S##",
      "#....B##..G..L.#",
      "#..##........#.#",
      "#..............#",
      "################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 88,
    title: "88. Uzun Sefer",
    instructions: "Ustalık sınavı: anahtar, zamanlama ve döngüleri aynı programda birleştir.",
    tip: "Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.",
    grid: [
      "#################",
      "##..#..~#.......#",
      "##.............~#",
      "##M......#...B..#",
      "#.~L...B=...GTS.#",
      "#.....B....K.~###",
      "#.......#~#~..#.#",
      "#........#~~#...#",
      "#################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 89,
    title: "89. Gizli Vadi",
    instructions: "Ustalık sınavı: anahtar, zamanlama ve döngüleri aynı programda birleştir.",
    tip: "Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.",
    grid: [
      "#################",
      "#.##......~.##..#",
      "#..K......##..#.#",
      "#...~~..#..BL...#",
      "#...=...T.G..S#.#",
      "#..M..B.B...#...#",
      "#.#.....###.....#",
      "#....#..~...#..~#",
      "#..~.....##.~#..#",
      "#################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 90,
    title: "90. Dört Element",
    instructions: "Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.",
    tip: "Rotayı önce kâğıtta bölümlere ayır: köprü, anahtar, zamanlama.",
    grid: [
      "#################",
      "#.#..........#..#",
      "#.........#.....#",
      "##..#.~.G~...~..#",
      "#.....=..~...LS.#",
      "#.....~..BT~.~..#",
      "#.##............#",
      "#..MB....K.#~...#",
      "#~........#.#...#",
      "#################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 91,
    title: "91. Efsane Patika",
    instructions: "Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.",
    tip: "Adım adım çalıştırma ve geri alma butonlarıyla kritik anları incele.",
    grid: [
      "##################",
      "#...#....#.#.....#",
      "#....K....#.....##",
      "#................#",
      "#...MB#.~#.......#",
      "#.#..B.=~~.#.....#",
      "#...~#..........~#",
      "##......GT.B..S.##",
      "#..#.........~.#.#",
      "##################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 92,
    title: "92. Kayıp Ada",
    instructions: "Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.",
    tip: "Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.",
    grid: [
      "##################",
      "#.......##...#...#",
      "#..#.....#.~T...##",
      "#...#B...........#",
      "#~.M......G...S#.#",
      "#...B......~..~.##",
      "#...L=......B.K..#",
      "#....~...........#",
      "#~...~...........#",
      "##################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 93,
    title: "93. Fırtına Öncesi",
    instructions: "Ustalık sınavı: anahtar, zamanlama ve döngüleri aynı programda birleştir.",
    tip: "Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.",
    grid: [
      "##################",
      "#........#.~.#...#",
      "#.....#..#....#.~#",
      "#...M.....#..#...#",
      "#.#.B........~...#",
      "#.~.K...........~#",
      "#..~=.....B..##..#",
      "#..~....BG.##.~..#",
      "#.#........L.S...#",
      "##........#......#",
      "##################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 94,
    title: "94. Yıldız Avı",
    instructions: "Ustalık sınavı: anahtar, zamanlama ve döngüleri aynı programda birleştir.",
    tip: "Adım adım çalıştırma ve geri alma butonlarıyla kritik anları incele.",
    grid: [
      "###################",
      "#....#....~#.#...##",
      "##..~..##.......K.#",
      "#...#...G.#.....#.#",
      "#......B..BL..S...#",
      "#.~.....=....###..#",
      "#...B....#.#.....##",
      "#..MT......~......#",
      "#.......##~..#..#~#",
      "#...#...#.#.....#.#",
      "###################"
    ],
    startDir: "UP",
    generated: true
  },
  {
    id: 95,
    title: "95. Muz Diyarı",
    instructions: "Bu final parkurunda uzun düzlükler için <code>adimla(N)</code>, kalıplar için <code>tekrarla(N)</code> kullan.",
    tip: "Rotayı önce kâğıtta bölümlere ayır: köprü, anahtar, zamanlama.",
    grid: [
      "###################",
      "####.#............#",
      "#..#......~..#.#..#",
      "#..........#.~~...#",
      "#............##...#",
      "#.~........#......#",
      "#....~.B..K..#....#",
      "##...L.G....#~.#.##",
      "#...M.=B~B...T..S.#",
      "#.....#....#......#",
      "###################"
    ],
    startDir: "LEFT",
    generated: true
  },
  {
    id: 96,
    title: "96. Ejder Sırtı",
    instructions: "Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.",
    tip: "Rotayı önce kâğıtta bölümlere ayır: köprü, anahtar, zamanlama.",
    grid: [
      "####################",
      "##.......#.#....####",
      "#......##.....~....#",
      "#..=.....B.~...~...#",
      "#....B...GB.B..LS#.#",
      "#.~......##.#..~...#",
      "#...M...#.#..#.~...#",
      "#..........#.......#",
      "#......K.......~...#",
      "##...#..~.......#.##",
      "####################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 97,
    title: "97. Son Kalıp",
    instructions: "Ustalık sınavı: anahtar, zamanlama ve döngüleri aynı programda birleştir.",
    tip: "Adım adım çalıştırma ve geri alma butonlarıyla kritik anları incele.",
    grid: [
      "####################",
      "#...#.#.....#~.....#",
      "#.........#....#...#",
      "#...B.......#~.##..#",
      "#.~=..#.T.G..L.S..##",
      "#.K.....B.#...B~.~.#",
      "#......B...........#",
      "#..M.#.~........#..#",
      "#...#.~##.........~#",
      "#~....~#........#..#",
      "####################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 98,
    title: "98. Ustalık Turu",
    instructions: "Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.",
    tip: "Rotayı önce kâğıtta bölümlere ayır: köprü, anahtar, zamanlama.",
    grid: [
      "####################",
      "#...........~...#..#",
      "#...##.......~.....#",
      "#..##.#~...#.....~.#",
      "#.M.........B#.....#",
      "#......B=..G..BS.#.#",
      "#...L..B.....K#..#.#",
      "#...~.#..~#.T~...~##",
      "#.#.#..#....~.#....#",
      "#..#...........##.##",
      "#......##.......~..#",
      "####################"
    ],
    startDir: "DOWN",
    generated: true
  },
  {
    id: 99,
    title: "99. Şafak Rotası",
    instructions: "Her mekanik bir arada: köprü, nilüfer ve kaplumbağa. Rotayı bölümlere ayırıp planla.",
    tip: "Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.",
    grid: [
      "####################",
      "#.~......~~.......##",
      "#...M.#.....B....#.#",
      "#..G.L.....B.....#.#",
      "#.#....B=.....BSK..#",
      "#..................#",
      "#..#..#...T......#~#",
      "#.......##~.....~..#",
      "##......##.~..#...##",
      "##......#.......~..#",
      "#..##....#....#.####",
      "####################"
    ],
    startDir: "RIGHT",
    generated: true
  },
  {
    id: 100,
    title: "100. Mojo Zaferi",
    instructions: "Ustalık sınavı: anahtar, zamanlama ve döngüleri aynı programda birleştir.",
    tip: "Örnek çözüm butonu referans satır sayısını gösterir; onu kırmayı hedefle.",
    grid: [
      "####################",
      "##..##..~.#~.......#",
      "#.#..#...G.#~...#..#",
      "#~...~LB=......K...#",
      "#........B.....B.S.#",
      "#........##...#~T..#",
      "#..B...~.~.#....~..#",
      "#.#M#...##...#....~#",
      "#..~~.#.~....#~....#",
      "#............#.....#",
      "#...............~..#",
      "####################"
    ],
    startDir: "RIGHT",
    generated: true
  }
];
