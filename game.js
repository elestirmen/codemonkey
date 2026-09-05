import { soundEngine } from './audio.js';
// Version query busts the browser cache when `npm run levels` rewrites the
// baked board data; keep it in step with the game.js query in index.html.
import { GENERATED_LEVELS } from './generated-levels.js?v=20260904-v3';
import { AUTHORED_LEVELS } from './authored-levels.js?v=20260905-v4';

// Level definitions with increasing difficulty
export const LEVELS = [
  {
    id: 1,
    title: "1. İlk Adım",
    instructions: "Mojo algoritma adasına yeni geldi. Hedef sandığa ulaşmak için her karede bir kez <code>ilerle()</code> yaz.",
    tip: "Her <code>ilerle()</code> Mojo'yu baktığı yönde tam 1 kare hareket ettirir.",
    grid: [
      "#######",
      "#M...S#",
      "#######"
    ],
    startDir: "RIGHT",
  },
  {
    id: 2,
    title: "2. Temasla Topla",
    instructions: "Yolda bir muz var. Muzun üzerinden geçerek onu topla, ardından sandığa ulaş.",
    tip: "Muzun olduğu kareye basman yeterli. Ek bir komut yazmana gerek yok.",
    grid: [
      "#######",
      "#M.B.S#",
      "#######"
    ],
    startDir: "RIGHT",
  },
  {
    id: 3,
    title: "3. Sağa Dönüş",
    instructions: "Yol aşağı kıvrılıyor. Sağa dönmek için <code>sagaDon()</code> kullan; muzun üstünden geçersen otomatik toplanır.",
    tip: "Mojo'yu sağa döndürdükten sonra tekrar <code>ilerle()</code> demelisin.",
    grid: [
      "######",
      "#M...#",
      "#...B#",
      "#...S#",
      "######"
    ],
    startDir: "RIGHT",
  },
  {
    id: 4,
    title: "4. Sola Dönüş",
    instructions: "Bu kez sandık yukarıda. Sola dönmek için <code>solaDon()</code> komutunu kullan ve yolu takip et.",
    tip: "Sola dönüş komutu karakteri saat yönünün tersine 90 derece döndürür.",
    grid: [
      "#######",
      "#..S..#",
      "#..B..#",
      "#M....#",
      "#######"
    ],
    startDir: "RIGHT",
  },
  {
    id: 5,
    title: "5. Su Engeli",
    instructions: "Suya basarsan algoritma durur. Sağa ve sola dönüşleri birleştirerek güvenli yolu çiz.",
    tip: "Önce iki kare ilerle, sonra aşağı inen güvenli koridora dön.",
    grid: [
      "########",
      "#M..~..#",
      "#......#",
      "#..B.S.#",
      "########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 6,
    title: "6. Tekrarlamanın Gücü",
    instructions: "Uzun düz yolda aynı komutu tekrar tekrar yazmak yerine döngü kullan: <br><code>tekrarla(6) {<br>&nbsp;&nbsp;ilerle()<br>}</code>",
    tip: "Döngü, aynı işi daha kısa ve okunur anlatmanın yoludur.",
    grid: [
      "#########",
      "#M.B.B.S#",
      "#########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 7,
    title: "7. Merdiven Kalıbı",
    instructions: "Yol tam bir merdiven. Aynı dört hareket üç kez tekrarlanıyor: <code>ilerle</code>, <code>sagaDon</code>, <code>ilerle</code>, <code>solaDon</code>. Bunu bir döngüye al.",
    tip: "Önce kalıbı elle yaz, tekrarlandığını gör, sonra <code>tekrarla(3)</code> içine taşı ve son adımı dışarıda bırak.",
    grid: [
      "########",
      "#M.#####",
      "##.B####",
      "###.B###",
      "####.S##",
      "########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 8,
    title: "8. Muz Koridoru",
    instructions: "Koridor iki yöne kıvrılıyor. Uzun düz parçaları döngüyle, dönüşleri tek komutla anlat.",
    tip: "Aynı yönde çok ilerlediğin bölümlerde <code>tekrarla</code> kullan.",
    grid: [
      "##########",
      "#M.B.B...#",
      "#........#",
      "#S.B...B.#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 9,
    title: "9. Açık Alan Rotası",
    instructions: "Labirent yok; açık alanda önce hangi muz sırasının daha kısa olduğunu düşün. Sonra rotayı komutlara çevir.",
    tip: "Açık alanda iyi algoritma, en az dönüş ve en az geri yürüyüş yapan rotayı seçer.",
    grid: [
      "##########",
      "#M..B...S#",
      "#........#",
      "#..~..B..#",
      "#........#",
      "#B.......#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 10,
    title: "10. Koordinat Deseni",
    instructions: "Muzlar haritada dağınık duruyor. Gereksiz dolaşmadan hepsini toplayan bir sıralama kur ve uzun düz parçaları döngüyle kısalt.",
    tip: "Önce yatay-dikey mesafeleri karşılaştır; yakın görünen muz her zaman en iyi ilk hedef olmayabilir.",
    grid: [
      "###########",
      "#M..B.....#",
      "#.........#",
      "#....B....#",
      "#.........#",
      "#..B....S.#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 11,
    title: "11. Akıllı Kısayol",
    instructions: "Taşlar sadece küçük adacıklar gibi duruyor; amaç labirent çözmek değil, açık alanda doğru kısayolu seçmek.",
    tip: "Bir hedefe koşmadan önce sonraki hedefe çıkışının açık kalıp kalmadığını kontrol et.",
    grid: [
      "############",
      "#M...B.....#",
      "#....#.....#",
      "#..B.#..B..#",
      "#....#.....#",
      "#......S...#",
      "############"
    ],
    startDir: "RIGHT",
  },
  {
    id: 12,
    title: "12. En Kısa Plan",
    instructions: "Açık adada tüm muzları toplayıp sandığa ulaşan kısa bir plan kur. İlk hedefin, sonraki hedefe giden yolunu nasıl değiştiriyor?",
    tip: "Döngüler sadece tekrar eden uzun yürüyüşlerde işe yarar; önce hedef sırasını doğru seç.",
    grid: [
      "############",
      "#M..B......#",
      "#..........#",
      "#..B..~..B.#",
      "#..........#",
      "#B......S..#",
      "############"
    ],
    startDir: "RIGHT",
  },
  {
    id: 13,
    title: "13. Altın Anahtar ve Kilit",
    instructions: "Mojo'nun önünde kilitli bir kapı var. Kapıyı açmak için önce <code>K</code> karesindeki anahtarı almalı, ardından kapıdan geçerek sandığa ulaşmalıdır.",
    tip: "Anahtarı aldığında kapı otomatik olarak açılır.",
    grid: [
      "##########",
      "#M..K.G.S#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 14,
    title: "14. Dolambaçlı Yol",
    instructions: "Bu seviyede sandık kilitli bir kapının arkasında. Önce aşağı inip sağdaki anahtarı almalı, sonra kapıdan geçerek sandığa varmalısın.",
    tip: "Anahtarı almak için U şeklinde bir rota izle, ardından geri dönüp yukarıdaki kapıya yönel.",
    grid: [
      "########",
      "#M.##.S#",
      "##.##.G#",
      "##....K#",
      "########"
    ],
    startDir: "RIGHT",
  },
  // ── Bölüm 1 (1-20) finali: döngü + dönüş kalıpları ──
  {
    id: 15,
    title: "15. Kare Döngüsü",
    instructions: "Mojo bir kareyi turlayarak muzları topluyor. Her kenar 3 adım, her köşede bir sağa dönüş var. Döngü içinde döngü kullanmayı dene.",
    tip: "Bir kenar = <code>tekrarla(3)</code> içinde <code>ilerle()</code>. Kenar + dönüş kalıbı 3 kez tekrarlanır, sonra son kenarda 2 adım kalır.",
    grid: [
      "######",
      "#M.B.#",
      "#S..B#",
      "#....#",
      "#.B..#",
      "######"
    ],
    startDir: "RIGHT",
  },
  {
    id: 16,
    title: "16. Zigzag Yürüyüşü",
    instructions: "Patika basamak basamak aşağı iniyor. Bir adım at, sonra <code>solaDon-ilerle-sagaDon-ilerle</code> kalıbını üç kez tekrarla.",
    tip: "Kalıbın döngüye giren kısmı dönüşle başlıyor: ilk <code>ilerle()</code> döngünün dışında kalır.",
    grid: [
      "#######",
      "#M#####",
      "#.B####",
      "##.B###",
      "###.B##",
      "####S##",
      "#######"
    ],
    startDir: "DOWN",
  },
  {
    id: 17,
    title: "17. Spiral Toplama",
    instructions: "Muzlar spiral bir yol boyunca dizilmiş. Önce uzun kenarı yürü, sonra dön. Her turda yol biraz kısalıyor.",
    tip: "Muzlar sıralar hâlinde duruyor. Bir sırayı baştan sona tara, sonra bir alt sıraya geç; tekrar eden düz parçaları döngüye al.",
    grid: [
      "##########",
      "#M.B.B.B.#",
      "#........#",
      "#.B....B.#",
      "#........#",
      "#..S.B.B.#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 18,
    title: "18. Çift Koridor",
    instructions: "İki paralel koridor arasında gidip gelerek muzları topla. Her koridorda döngü kullanarak ilerle.",
    tip: "Üst koridorda ilerle, sonra alt koridora geç ve geri dön. Her koridordaki düz yolları döngüyle kısalt.",
    grid: [
      "##########",
      "#M.B.B...#",
      "########.#",
      "#S.B.B...#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 19,
    title: "19. Labirent Girişi",
    instructions: "Kayaların arasındaki dar geçitlerden ilerleyerek çıkışı bul. Sıralı komutları ve dönüşleri doğru sırada kullan.",
    tip: "Kayalara çarpmamaya dikkat et! Cetvel ile mesafeleri ölçerek hangi yönde kaç adım gideceğini hesapla.",
    grid: [
      "###########",
      "#M..#.....#",
      "#...#.B.#.#",
      "#.###...#.#",
      "#.....#.#.#",
      "#B.####...#",
      "#.......S.#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 20,
    title: "20. Büyük Final",
    instructions: "Grup 1'in son sınavı! Tüm öğrendiğin komutları ve döngüleri kullanarak bu karmaşık rotayı en az satırla çöz.",
    tip: "Önce rotanı kafanda planla, sonra tekrar eden kalıpları bul. Her uzun düz parçayı döngüyle kısaltabilirsin.",
    grid: [
      "############",
      "#M..B......#",
      "#..........#",
      "#..###.....#",
      "#..#B#..B..#",
      "#..#.#.....#",
      "#..#.......#",
      "#.......S..#",
      "############"
    ],
    startDir: "RIGHT",
  },
  // ── Bölüm 2 (21-40) açılışı: köprüler, nehir geçişleri, döngüler ──
  {
    id: 21,
    title: "21. Köprü Geçişi",
    instructions: "Mojo nehrin üzerinden geçen köprüden döngü kullanarak güvenli geçmeli ve sandığa ulaşmalıdır.",
    tip: "Köprü (<code>=</code>) karoları nehirlerin (<code>~</code>) üzerinden güvenli geçiş sağlar.",
    grid: [
      "##########",
      "#M...B...#",
      "~~~~~=~~~~",
      "#....S...#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 22,
    title: "22. Çift Köprü",
    instructions: "İki nehir iki köprüyle aşılmalı. Her köprü geçişinde dönüş yapıp bir sonraki köprüye yönelmelisin.",
    tip: "Birinci köprüden geç, sonra sağa dönüp ikinci köprüye ilerle. Simetrik kalıp var!",
    grid: [
      "###########",
      "#M..B.....#",
      "~~~~~=~~~~~",
      "#.........#",
      "~~~~~=~~~~~",
      "#.....B.S.#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 23,
    title: "23. Nehir Kenarı Rotası",
    instructions: "Nehir boyunca ilerleyip köprüden geçerek karşı kıyıdaki muzları topla. Tek köprü var, iyi planla!",
    tip: "Önce nehir kenarında ilerle, köprüyü geç, sonra karşı taraftan geri dön.",
    grid: [
      "###########",
      "#M.B......#",
      "#~~~~=~~~~#",
      "#~~~~=~~~~#",
      "#~~~~=~~~~#",
      "#......B.S#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 24,
    title: "24. Ada Atlaması",
    instructions: "Küçük adalar köprülerle birbirine bağlı. Her adada bir muz var. Hepsini toplayıp son adadaki sandığa ulaş.",
    tip: "Her adada muzu al, sonra köprüye yönel. Düz parçalarda döngü kullan, köprü dönüşlerini tek tek yaz.",
    grid: [
      "###########",
      "#M.B~.B~.S#",
      "#...=..=..#",
      "#~~~.~~.~~#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 25,
    title: "25. Kıvrımlı Nehir",
    instructions: "Nehir S şeklinde kıvrılıyor. İki köprüden geçerek nehrin iki kıvrımını da aşmalısın.",
    tip: "Uzun düz parçaları döngüyle kısalt, köprü geçişlerinde dönüş yap.",
    grid: [
      "###########",
      "#M........#",
      "#.B..~~~~~#",
      "#....=....#",
      "#~~~~.B...#",
      "#....=....#",
      "#.~~~~~...#",
      "#.......S.#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 26,
    title: "26. Döngülü Köprü Kalıbı",
    instructions: "Üç ada, üç köprü, tek kalıp: <code>ilerle, ilerle, sagaDon, ilerle, solaDon</code>. Kalıbı <code>tekrarla(3)</code> içine al, sandığa son bir adım kalır.",
    tip: "Her adada iki adım yürüyorsun, sonra köprüye dönüp bir adımla karşıya geçiyorsun. Kalıp birebir aynı.",
    grid: [
      "##########",
      "#MB.~~~~~#",
      "#~~=B.~~~#",
      "#~~~~=B.~#",
      "#~~~~~~=S#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 27,
    title: "27. Su Labirenti",
    instructions: "Kayalar ve sular arasındaki dar geçitlerden yol bul. Köprüler tek güvenli geçiş noktaları!",
    tip: "Dikkatli ol, yanlış yöne dönersen suya düşersin. Cetvelle mesafeleri ölç.",
    grid: [
      "############",
      "#M..#......#",
      "#.~.#.B....#",
      "#.~.=......#",
      "#.~.#..#...#",
      "#...#..#.B.#",
      "#......#.S.#",
      "############"
    ],
    startDir: "DOWN",
  },
  {
    id: 28,
    title: "28. Nehir Vadisi Provası",
    instructions: "İleri köprü görevlerine hazırlık: döngüleri ve dönüşleri birleştirerek nehir vadisini geç.",
    tip: "Önce tüm rotanı kafanda planla. Köprüler seni kısıtlıyor, ama döngüler seni hızlandırıyor.",
    grid: [
      "##############",
      "#M..B........#",
      "#~~~=~~~~~~~~#",
      "#............#",
      "#.B..........#",
      "#~~~~~~~~=~~~#",
      "#............#",
      "#.........B.S#",
      "##############"
    ],
    startDir: "RIGHT",
  },
  // ── Bölüm 3 (41-60) açılışı: nilüfer yaprakları, anahtar ve kilit ──
  {
    id: 41,
    title: "41. Nilüfer Patikası",
    instructions: "Nilüfer yaprakları çok narindir, üstünden geçtikten hemen sonra suya batarlar. Rota üzerinde her yaprağı sadece bir kez kullanabilirsin!",
    tip: "Anahtarı alarak kilitli kapıyı açmalısın, ancak nilüferlerin batacağını unutma! Tek yönlü bir plan kur.",
    grid: [
      "#########",
      "#M.LLLLK#",
      "#~.LLLLG#",
      "#S.LLLL.#",
      "#########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 42,
    title: "42. Batan Yapraklar",
    instructions: "Nilüfer yaprakları üzerinden yürüyerek karşıya geç. Ama dikkat: bastığın yaprak hemen batar, geri dönemezsin!",
    tip: "Doğrusal bir rota çiz. Geri dönüş yok, bu yüzden en kısa yolu seçmelisin.",
    grid: [
      "##########",
      "#M.......#",
      "#~~LLLLL~#",
      "#~~LLLLL~#",
      "#......BS#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 43,
    title: "43. Nilüfer Labirenti",
    instructions: "Nilüfer yaprakları arasında labirent var. Her yaprağa sadece bir kez basabilirsin, bu yüzden doğru yolu seçmelisin!",
    tip: "Yanlış yaprağa basarsan geri dönüş yolun kapanır. Önce rotayı kafanda planla.",
    grid: [
      "###########",
      "#M..~.....#",
      "#.L.~.L.B.#",
      "#.L.L.L.~.#",
      "#.~.L.L.~.#",
      "#...~.L.S.#",
      "###########"
    ],
    startDir: "DOWN",
  },
  {
    id: 44,
    title: "44. Anahtarlı Nilüfer",
    instructions: "Anahtar nilüfer yapraklarının arasında! Anahtarı al, geri dönmeden kapıya ulaş. Yapraklar batacak!",
    tip: "Rotanı önceden planla: anahtarı aldıktan sonra kapıya giden yolun nilüfer üzerinden geçmesi gerekebilir.",
    grid: [
      "###########",
      "#M........#",
      "#.LLL.....#",
      "#.L.L.K...#",
      "#.LLL.....#",
      "#.....G.S.#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 45,
    title: "45. Çift Kilit Bulmacası",
    instructions: "İki anahtar ve iki kapı var! Her iki anahtarı da alarak her iki kapıyı açmalı ve tüm muzları toplamalısın.",
    tip: "Önce hangi anahtarı alacağını planla. Yanlış sırayla gidersen tıkanabilirsin.",
    grid: [
      "###########",
      "#M..K.G.B.#",
      "#.........#",
      "#.B.G.K...#",
      "#.......S.#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 46,
    title: "46. Nilüfer Köprüsü",
    instructions: "Nehrin üzerindeki nilüfer yaprakları tek geçiş yolun. Ama batacakları için geri dönemezsin! Karşıdaki muzu al ve sandığa ulaş.",
    tip: "Düz bir hat çizerek nilüferlerden geç. Döngü kullanarak adım sayısını kısaltabilirsin.",
    grid: [
      "###########",
      "#M........#",
      "#~~~L~~~~~#",
      "#~~~L~~~~~#",
      "#~~~L~~~~~#",
      "#.....B.S.#",
      "###########"
    ],
    startDir: "DOWN",
  },
  {
    id: 47,
    title: "47. Anahtar Avı",
    instructions: "Anahtar haritanın bir köşesinde gizli! Onu bul, kapıyı aç ve sandığa ulaş. Su ve kayalar yolunu kesiyor.",
    tip: "Anahtarı aldıktan sonra en kısa yoldan kapıya git. Gereksiz dolaşma yıldız kaybettirir.",
    grid: [
      "############",
      "#M....#....#",
      "#.B...#..K.#",
      "#.....#....#",
      "#..####....#",
      "#..........#",
      "#.G......S.#",
      "############"
    ],
    startDir: "RIGHT",
  },
  {
    id: 48,
    title: "48. Bataklık Provası",
    instructions: "Tapınak yolculuğuna hazırlık: yapraklar, kilitler ve su engelleri arasında tüm muzları toplayarak sandığa ulaş.",
    tip: "Nilüferler batacak, kapılar kilitli. Her adımını önceden planla, geri dönüş yok!",
    grid: [
      "############",
      "#M..B.~.K..#",
      "#.....~....#",
      "#.LLL.~.G..#",
      "#.~.L.~....#",
      "#.~.L......#",
      "#.~...B..S.#",
      "############"
    ],
    startDir: "RIGHT",
  },
  // ── Bölüm 4 (61-80) açılışı: kaplumbağa zamanlama bulmacaları ──
  {
    id: 61,
    title: "61. Kaplumbağa Zamanı",
    instructions: "Yüzen kaplumbağalar suya dalar ve çıkar. Zamanlamayı ayarlamak için <code>bekle()</code> komutunu kullan!",
    tip: "Kaplumbağa 2 adım su üstünde, 2 adım su altında kalır. Oraya vardığında su üstünde olmasını sağlamak için geride beklemelisin.",
    grid: [
      "#########",
      "#...~...#",
      "#M..T.BS#",
      "#...~...#",
      "#########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 62,
    title: "62. Sabırlı Geçiş",
    instructions: "Kaplumbağa şu an su altında! Üzerine basmadan önce <code>bekle()</code> ile suyun üstüne çıkmasını bekle.",
    tip: "Kaplumbağanın döngüsünü say: 2 adım üstte, 2 adım altta. Doğru zamanda ilerle!",
    grid: [
      "##########",
      "#M...B...#",
      "#...~T~..#",
      "#........#",
      "#....S...#",
      "##########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 63,
    title: "63. Çift Kaplumbağa",
    instructions: "İki kaplumbağa farklı zamanlarda dalıyor! Her birinin zamanlamasını ayrı ayrı hesaplamalısın.",
    tip: "İlk kaplumbağayı geçtikten sonra, ikinci kaplumbağanın ne zaman su üstüne çıkacağını hesapla.",
    grid: [
      "###########",
      "#M..~.~..S#",
      "#...T.T..B#",
      "#...~.~...#",
      "###########"
    ],
    startDir: "RIGHT",
  },
  {
    id: 64,
    title: "64. Kaplumbağa Köprüsü",
    instructions: "Nehrin üzerinde kaplumbağalar köprü görevi yapıyor. Ama dalacaklar! Zamanlamayı iyi ayarla.",
    tip: "Kaplumbağanın üzerindeyken dönüş yaparsan ve o anda dalarsa boğulursun! Hızlı geç.",
    grid: [
      "###########",
      "#M.B......#",
      "#~~~~=~~~~#",
      "#~~~~T~~~~#",
      "#~~~~=~~~~#",
      "#......B.S#",
      "###########"
    ],
    startDir: "DOWN",
  },
  {
    id: 65,
    title: "65. Zamanlama Ustası",
    instructions: "Kaplumbağa, köprü ve su engelleri bir arada! Köprüler güvenli ama kaplumbağalar dalıyor. Rotanı zamanla.",
    tip: "Köprüden güvenle geçebilirsin ama kaplumbağa geçişleri zamanlama gerektirir. <code>bekle()</code> kullan.",
    grid: [
      "############",
      "#M..B......#",
      "#~~=~~~~~~~#",
      "#..........#",
      "#~~~~~~~T~~#",
      "#..........#",
      "#.....B..S.#",
      "############"
    ],
    startDir: "RIGHT",
  },
  {
    id: 66,
    title: "66. Ritmik Geçiş",
    instructions: "Üç kaplumbağa sırayla dizilmiş. Hepsinin üzerinden sırayla geçmelisin ama zamanlama kritik!",
    tip: "Her kaplumbağaya adım atarken bir öncekinin üzerinde kalma. Gerekirse <code>bekle()</code> kullan.",
    grid: [
      "###########",
      "#M........#",
      "#~~T~T~T~~#",
      "#.........#",
      "#....B..S.#",
      "###########"
    ],
    startDir: "DOWN",
  },
  {
    id: 67,
    title: "67. Kaplumbağa Labirenti",
    instructions: "Kayalar ve kaplumbağalar arasında yol bul. Kaplumbağalar tek güvenli geçiş noktaları ama zamanlama gerekli!",
    tip: "Kayalar sabit engeller, kaplumbağalar ise açılıp kapanan kapılar gibi düşün.",
    grid: [
      "############",
      "#M...#.....#",
      "#.B..#..B..#",
      "#.~..T..~..#",
      "#.~..#..~..#",
      "#....#.....#",
      "#........S.#",
      "############"
    ],
    startDir: "RIGHT",
  },
  {
    id: 68,
    title: "68. Gelgit Provası",
    instructions: "Açık denize çıkmadan önce kaplumbağaları, köprüleri ve kayaları aynı rotada birleştir. Her dönüşün zamanlamayı değiştirdiğini unutma.",
    tip: "Tüm araçlarını kullan: döngüler kısa kod için, bekle() zamanlama için, cetvel mesafe ölçmek için.",
    grid: [
      "#############",
      "#M..B.#.....#",
      "#.....#..B..#",
      "#~~=~~#~~T~~#",
      "#.....=.....#",
      "#..B..#.....#",
      "#.....#...S.#",
      "#############"
    ],
    startDir: "RIGHT"
  },
  // ── Bölüm 2 finali: toplu adım komutu ──
  {
    id: 29,
    title: "29. Uzun Düzlük",
    instructions: "Uzun düzlükler için yeni bir komut: <code>adimla(10)</code> tek satırda 10 kare ilerletir. Aynı rotayı döngüyle 8, <code>adimla</code> ile 5 satırda yazabilirsin.",
    tip: "<code>adimla(N)</code> yalnızca ilerlemek içindir; dönüşleri hâlâ tek tek yazarsın. Negatif değer (<code>adimla(-3)</code>) geri geri yürütür.",
    grid: [
      "#############",
      "#M.........B#",
      "#.#########.#",
      "#.#########.#",
      "#S.........B#",
      "#############"
    ],
    startDir: "RIGHT"
  },
  // ── Bölüm 4 finali: kaplumbağanın dümenine geçmek ──
  {
    id: 69,
    title: "69. Kaplumbağa Kaptanı",
    instructions: "Bu nehirde kaplumbağa dalmıyor ama yanlış yerde duruyor. <code>kaplumbaga.adimla()</code> ile kaplumbağayı kendi baktığı yönde bir kare kaydır, geçit hizasına gelince üzerinden yürü.",
    tip: "Kaplumbağa hareket ettiğinde Mojo onunla birlikte gitmez. Önce kaplumbağayı yerine getir, sonra üzerine bas.",
    grid: [
      "###########",
      "#M........#",
      "##.########",
      "#~~~~~T~~~#",
      "##.########",
      "#....B...S#",
      "###########"
    ],
    startDir: "RIGHT",
    pilotTurtles: true,
    solution: [
      "ilerle",
      "sagaDon",
      "ilerle",
      { type: "loop", count: 4, body: ["kaplumbaga.adimla"] },
      { type: "compact", action: "ilerle", count: 3 },
      "solaDon",
      { type: "compact", action: "ilerle", count: 7 }
    ]
  },
  // ── Bölüm 5 açılışı: koşullu komutlar ──
  {
    id: 81,
    title: "81. İlk Karar",
    instructions: "Şimdiye kadar her adımı sen ölçtün. <code>ise(onumdeEngelVar())</code> ise kararı Mojo'ya bırakır: önü kapalıysa dön, açıksa ilerle. Tek bir döngü tüm turu yürüyebilir.",
    tip: "Kalıp şu: <code>ise(onumdeEngelVar())</code> → <code>sagaDon()</code>, <code>degilse</code> → <code>ilerle()</code>. Kaç kez tekrarlaması gerektiğini adımları sayarak bul.",
    grid: [
      "#######",
      "#M.B..#",
      "#.....#",
      "#....B#",
      "#.....#",
      "#S.B..#",
      "#######"
    ],
    startDir: "RIGHT",
    solution: [
      {
        type: "loop",
        count: 14,
        body: [
          {
            type: "branch",
            condition: "onumdeEngelVar",
            then: ["sagaDon"],
            otherwise: ["ilerle"]
          }
        ]
      }
    ]
  },
  {
    id: 82,
    title: "82. Kayaya Çarpmadan",
    instructions: "Aynı beş satırlık karar döngüsü, farklı bir harita. Mojo kayaya çarpmadan sağa dönüp yolunu kendisi bulur; sen sadece kaç adım süreceğini hesaplarsın.",
    tip: "Kullanabileceğin koşullar: <code>onumdeEngelVar()</code>, <code>onumdeKayaVar()</code>, <code>onumdeSuVar()</code>, <code>onumdeMuzVar()</code>, <code>onumdeKilitVar()</code>. Artık haritayı ölçmek yerine davranışı tanımlıyorsun.",
    grid: [
      "#########",
      "#M.B#...#",
      "#...#...#",
      "#..B#...#",
      "#...#...#",
      "#S.B....#",
      "#########"
    ],
    startDir: "RIGHT",
    solution: [
      {
        type: "loop",
        count: 10,
        body: [
          {
            type: "branch",
            condition: "onumdeEngelVar",
            then: ["sagaDon"],
            otherwise: ["ilerle"]
          }
        ]
      }
    ]
  }

];

function stripCommentsPreservingLines(code) {
  const lines = code.replace(/\r\n?/g, '\n').split('\n');
  let insideBlockComment = false;

  return lines.map((line) => {
    let clean = '';
    let cursor = 0;

    while (cursor < line.length) {
      if (insideBlockComment) {
        const commentEnd = line.indexOf('*/', cursor);
        if (commentEnd === -1) {
          break;
        }
        insideBlockComment = false;
        cursor = commentEnd + 2;
        continue;
      }

      if (line.startsWith('/*', cursor)) {
        insideBlockComment = true;
        cursor += 2;
        continue;
      }
      if (line.startsWith('//', cursor) || line[cursor] === '#') {
        break;
      }

      clean += line[cursor];
      cursor++;
    }

    return clean;
  });
}

function getIndentWidth(line) {
  let width = 0;
  for (const char of line) {
    if (char === ' ') width++;
    else if (char === '\t') width += 4;
    else break;
  }
  return width;
}

function isIndentBlockHeader(text) {
  const header = text.trim().replace(/:\s*$/, '');
  return /^(?:tekrarla|ise|iken)\s*\(/.test(header) || /^(?:}\s*)?degilse$/.test(header);
}

function openIndentBlock(text) {
  const header = text.trim().replace(/:\s*$/, '');
  return `${header} {`;
}

// Convert Python-style indentation to parser tokens while retaining every
// command's original source line. Synthetic closing braces never shift the
// line numbers used by errors or the execution highlighter.
function preprocessIndentation(code) {
  const cleanLines = stripCommentsPreservingLines(code);
  const statements = [];

  cleanLines.forEach((line, index) => {
    const text = line.trim();
    if (!text) return;
    statements.push({
      text,
      indent: getIndentWidth(line),
      line: index + 1
    });
  });

  if (statements.length === 0) return [];
  if (statements[0].indent !== 0) {
    throw new Error(`Satır ${statements[0].line}: Kod beklenmeyen bir girintiyle başlayamaz.`);
  }

  const result = [];
  const indentStack = [0];
  let previousStatement = null;

  for (const statement of statements) {
    const currentIndent = statement.indent;
    let topIndent = indentStack[indentStack.length - 1];

    if (currentIndent > topIndent) {
      if (!previousStatement || !isIndentBlockHeader(previousStatement.text)) {
        throw new Error(`Satır ${statement.line}: Bu girintiden önce tekrarla, ise veya degilse bloğu bulunmalıdır.`);
      }
      previousStatement.text = openIndentBlock(previousStatement.text);
      indentStack.push(currentIndent);
    } else if (currentIndent < topIndent) {
      while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        result.push({ text: '}', line: statement.line, syntheticClose: true });
      }
      topIndent = indentStack[indentStack.length - 1];
      if (currentIndent !== topIndent) {
        throw new Error(`Satır ${statement.line}: Girinti önceki blok seviyelerinden biriyle eşleşmiyor.`);
      }
    }

    let text = statement.text;
    if (/^degilse\s*:?\s*$/.test(text)) {
      const closingToken = result[result.length - 1];
      if (!closingToken || !closingToken.syntheticClose) {
        throw new Error(`Satır ${statement.line}: 'degilse' yalnızca tamamlanmış bir 'ise' bloğundan sonra kullanılabilir.`);
      }
      result.pop();
      text = text.endsWith(':') ? '} degilse:' : '} degilse';
    }

    const token = { text, line: statement.line, syntheticClose: false };
    result.push(token);
    previousStatement = token;
  }

  const finalLine = statements[statements.length - 1].line;
  while (indentStack.length > 1) {
    indentStack.pop();
    result.push({ text: '}', line: finalLine, syntheticClose: true });
  }

  return result;
}

// Reference solutions are pure functions of the level data, so they are worth
// computing once per level id and keeping for the rest of the session.
const REFERENCE_CACHE = new Map();

// ── Program encoder ─────────────────────────────────────────────────────────
// Turns a flat action list into the *fewest scored lines* that reproduce it.
// The grammar the editor understands is small, so the optimum is reachable
// with a straightforward interval dynamic program instead of the greedy
// left-to-right pass this used to do:
//
//   single      cmd()                    -> 1 line,  1 action
//   compact     adimla(n) / adimla(-n)   -> 1 line,  n identical moves
//   loop        tekrarla(n) + body       -> 1 line + body lines, n * body
//
// cost[i][j] holds the cheapest encoding of actions[i..j-1]; a loop is only
// considered when the whole interval is a whole number of copies of its
// period, which is exactly what `tekrarla` can express.
const ENCODER_MAX_COUNT = 100;

export function encodeActions(actions, { allowLoops = true, allowCompact = false } = {}) {
  const length = actions.length;
  if (length === 0) return { lines: 0, blocks: [] };

  const cost = Array.from({ length: length + 1 }, () => new Array(length + 1).fill(Infinity));
  const choice = Array.from({ length: length + 1 }, () => new Array(length + 1).fill(null));

  const isSingleRun = (from, to) => {
    for (let i = from + 1; i < to; i++) {
      if (actions[i] !== actions[from]) return false;
    }
    return true;
  };

  const hasPeriod = (from, to, period) => {
    for (let i = from + period; i < to; i++) {
      if (actions[i] !== actions[i - period]) return false;
    }
    return true;
  };

  for (let i = 0; i < length; i++) {
    cost[i][i + 1] = 1;
    choice[i][i + 1] = { kind: 'simple' };
  }

  for (let span = 2; span <= length; span++) {
    for (let from = 0; from + span <= length; from++) {
      const to = from + span;
      let best = Infinity;
      let bestChoice = null;

      const isMove = actions[from] === 'ilerle' || actions[from] === 'geriGit';
      if (allowCompact && isMove && span <= ENCODER_MAX_COUNT && isSingleRun(from, to)) {
        best = 1;
        bestChoice = { kind: 'compact', count: span };
      }

      // Splits are considered before loops so a tie never produces a
      // `tekrarla(2)` around a single command, which reads worse than simply
      // writing the command twice.
      for (let split = from + 1; split < to; split++) {
        const candidate = cost[from][split] + cost[split][to];
        if (candidate < best) {
          best = candidate;
          bestChoice = { kind: 'split', split };
        }
      }

      if (allowLoops) {
        for (let period = 1; period * 2 <= span; period++) {
          if (span % period !== 0) continue;
          const repeats = span / period;
          if (repeats > ENCODER_MAX_COUNT) continue;
          if (!hasPeriod(from, to, period)) continue;
          const candidate = 1 + cost[from][from + period];
          if (candidate < best) {
            best = candidate;
            bestChoice = { kind: 'loop', period, repeats };
          }
        }
      }

      cost[from][to] = best;
      choice[from][to] = bestChoice;
    }
  }

  const build = (from, to) => {
    const picked = choice[from][to];
    if (picked.kind === 'simple') return [{ type: 'simple', action: actions[from] }];
    if (picked.kind === 'compact') return [{ type: 'compact', action: actions[from], count: picked.count }];
    if (picked.kind === 'loop') {
      return [{ type: 'loop', count: picked.repeats, body: build(from, from + picked.period) }];
    }
    return [...build(from, picked.split), ...build(picked.split, to)];
  };

  return { lines: cost[0][length], blocks: build(0, length) };
}

// ── Block helpers ───────────────────────────────────────────────────────────
// Authored reference solutions and generated ones share this block shape, so a
// single renderer covers both syntax modes and a single expander feeds the
// engine. `countBlockLines` mirrors Game#getUniqueCodeLineCount exactly, which
// is what keeps a level's star target and its reference solution in agreement.

export function normalizeBlocks(blocks) {
  const normalized = [];
  for (const raw of blocks) {
    if (typeof raw === 'string') {
      normalized.push({ type: 'simple', action: raw });
      continue;
    }
    if (Array.isArray(raw)) {
      normalized.push(...normalizeBlocks(raw));
      continue;
    }
    if (raw && (raw.type === 'loop' || raw.type === 'while')) {
      normalized.push({ ...raw, body: normalizeBlocks(raw.body) });
      continue;
    }
    if (raw && raw.type === 'branch') {
      normalized.push({
        type: 'branch',
        condition: raw.condition,
        then: normalizeBlocks(raw.then || []),
        otherwise: raw.otherwise ? normalizeBlocks(raw.otherwise) : null
      });
      continue;
    }
    normalized.push({ ...raw });
  }
  return normalized;
}

export function countBlockLines(blocks) {
  let total = 0;
  for (const block of normalizeBlocks(blocks)) {
    if (block.type === 'loop' || block.type === 'while') {
      total += 1 + countBlockLines(block.body);
    } else if (block.type === 'branch') {
      // `ise(...)` opens a line; `degilse` reuses the closing brace line in
      // bracket mode and is its own line in indentation mode, so both modes
      // score identically only when it is counted once here.
      total += 1 + countBlockLines(block.then);
      if (block.otherwise) total += 1 + countBlockLines(block.otherwise);
    } else {
      total += 1;
    }
  }
  return total;
}

export function renderBlocks(blocks, syntaxMode = 'indent', depth = 0) {
  const isIndent = syntaxMode === 'indent';
  const pad = (isIndent ? '    ' : '  ').repeat(depth);
  const lines = [];

  for (const block of normalizeBlocks(blocks)) {
    if (block.type === 'while') {
      lines.push(`${pad}iken(${block.condition}())${isIndent ? ':' : ' {'}`);
      lines.push(...renderBlocks(block.body, syntaxMode, depth + 1));
      if (!isIndent) lines.push(`${pad}}`);
      continue;
    }
    if (block.type === 'loop') {
      if (isIndent) {
        lines.push(`${pad}tekrarla(${block.count}):`);
        lines.push(...renderBlocks(block.body, syntaxMode, depth + 1));
      } else {
        lines.push(`${pad}tekrarla(${block.count}) {`);
        lines.push(...renderBlocks(block.body, syntaxMode, depth + 1));
        lines.push(`${pad}}`);
      }
      continue;
    }

    if (block.type === 'branch') {
      if (isIndent) {
        lines.push(`${pad}ise(${block.condition}()):`);
        lines.push(...renderBlocks(block.then, syntaxMode, depth + 1));
        if (block.otherwise) {
          lines.push(`${pad}degilse:`);
          lines.push(...renderBlocks(block.otherwise, syntaxMode, depth + 1));
        }
      } else {
        lines.push(`${pad}ise(${block.condition}()) {`);
        lines.push(...renderBlocks(block.then, syntaxMode, depth + 1));
        if (block.otherwise) {
          lines.push(`${pad}} degilse {`);
          lines.push(...renderBlocks(block.otherwise, syntaxMode, depth + 1));
        }
        lines.push(`${pad}}`);
      }
      continue;
    }

    if (block.type === 'compact') {
      const count = block.action === 'geriGit' ? -block.count : block.count;
      lines.push(`${pad}adimla(${count})`);
      continue;
    }

    lines.push(`${pad}${block.action}()`);
  }

  return lines;
}

export function parseCode(code, syntaxMode = 'indent') {
  if (typeof code !== 'string') {
    throw new Error('Kod metni okunamadı.');
  }
  if (code.length > 20_000 || code.split(/\r?\n/).length > 500) {
    throw new Error('Kod sınırı aşıldı. En fazla 500 satır veya 20.000 karakter kullanabilirsin.');
  }

  const cleanLines = stripCommentsPreservingLines(code);
  const containsCodeBraces = cleanLines.some(line => line.includes('{') || line.includes('}'));
  const lines = syntaxMode === 'indent' && !containsCodeBraces
    ? preprocessIndentation(code)
    : cleanLines.map((text, index) => ({ text, line: index + 1, syntheticClose: false }));
  const instructions = [];
  const blockStack = [];
  let nextLoopId = 1;

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i].text.trim();
    if (!lineText) continue;

    // Supported formats:
    // 1. command()
    // 2. tekrarla(N) {
    // 3. ise(onumdeEngelVar()) {
    // 4. } degilse {
    // 5. }
    const cmdRegex = /^(?:(kaplumbaga)\.)?(ilerle|adimla|solaDon|sagaDon|muzAl|bekle)\s*\(\s*(-?\d+)?\s*\)\s*;?$/;
    const loopStartRegex = /^tekrarla\s*\(\s*(\d+)\s*\)\s*\{$/;
    const ifStartRegex = /^(ise|iken)\s*\(\s*(onumdeEngelVar|onumdeMuzVar|onumdeKayaVar|onumdeSuVar|onumdeKilitVar|onumdeGuvenliYolVar|hedefteDegilim)\s*\(\s*\)\s*\)\s*\{$/;
    const elseStartRegex = /^\}\s*degilse\s*\{$/;
    const loopEndRegex = /^\}$/;

    let match;
    const lineNumber = lines[i].line;

    if ((match = cmdRegex.exec(lineText)) !== null) {
      const [_, target, name, countStr] = match;
      const count = countStr ? parseInt(countStr, 10) : 1;

      if (Math.abs(count) < 1 || Math.abs(count) > 100) {
        throw new Error(`Satır ${lineNumber}: Geçersiz parametre değeri. Adım sayısı 1 ile 100 arasında olmalıdır.`);
      }

      if (count < 0 && (name === 'solaDon' || name === 'sagaDon' || name === 'muzAl' || name === 'bekle')) {
        throw new Error(`Satır ${lineNumber}: Dönüş, bekleme veya muz alma komutları negatif parametre alamaz.`);
      }

      const isBackward = count < 0;
      const repeats = Math.abs(count);
      let compileName = name;

      if (name === 'adimla' || name === 'ilerle') {
        compileName = isBackward ? 'geriGit' : 'ilerle';
      }

      for (let r = 0; r < repeats; r++) {
        instructions.push({
          type: 'command',
          target: target || 'mojo',
          name: compileName,
          sourceName: name,
          sourceCount: count,
          line: lineNumber
        });
      }
    } else if ((match = loopStartRegex.exec(lineText)) !== null) {
      const [_, countStr] = match;
      const count = parseInt(countStr, 10);

      if (count < 1 || count > 100) {
        throw new Error(`Satır ${lineNumber}: Geçersiz tekrar sayısı. Tekrarlama değeri 1 ile 100 arasında olmalıdır.`);
      }

      const loopId = nextLoopId++;
      instructions.push({
        type: 'loop_init',
        count,
        loopId,
        line: lineNumber
      });
      blockStack.push({
        type: 'loop',
        loopId,
        startIdx: instructions.length,
        line: lineNumber
      });
    } else if ((match = ifStartRegex.exec(lineText)) !== null) {
      const [_, keyword, condition] = match;
      instructions.push({
        type: 'jump_if_false',
        sourceName: keyword,
        condition,
        target: -1, // patched on closing
        line: lineNumber
      });
      blockStack.push({
        type: keyword === 'iken' ? 'while' : 'if',
        jumpIfFalseIdx: instructions.length - 1,
        line: lineNumber
      });
    } else if (elseStartRegex.test(lineText)) {
      if (blockStack.length === 0 || blockStack[blockStack.length - 1].type !== 'if') {
        throw new Error(`Satır ${lineNumber}: 'degilse' yapısı yalnızca bir 'ise' bloğunun hemen ardından kullanılabilir.`);
      }
      const ifBlock = blockStack.pop();
      instructions.push({
        type: 'jump',
        target: -1, // patched on closing
        line: lineNumber
      });
      // Point the 'if' condition failure to the else block start
      instructions[ifBlock.jumpIfFalseIdx].target = instructions.length;
      blockStack.push({
        type: 'else',
        jumpIdx: instructions.length - 1,
        line: lineNumber
      });
    } else if (loopEndRegex.test(lineText)) {
      if (blockStack.length === 0) {
        throw new Error(`Satır ${lineNumber}: Eşleşmeyen kapatma parantezi '}'. Açık bir blok bulunamadı.`);
      }
      const block = blockStack.pop();
      if (block.type === 'loop') {
        instructions.push({
          type: 'loop_step',
          loopId: block.loopId,
          target: block.startIdx,
          line: lineNumber
        });
      } else if (block.type === 'while') {
        instructions.push({ type: 'jump', target: block.jumpIfFalseIdx, line: lineNumber });
        instructions[block.jumpIfFalseIdx].target = instructions.length;
      } else if (block.type === 'if') {
        // Point the 'if' condition failure past the block end
        instructions[block.jumpIfFalseIdx].target = instructions.length;
      } else if (block.type === 'else') {
        // Point the 'else' end-of-block jump past the else block end
        instructions[block.jumpIdx].target = instructions.length;
      }
    } else {
      // Syntax error
      throw new Error(`Satır ${lineNumber}: Bilinmeyen veya hatalı komut yazımı: "${lineText}". Geçerli komutlar: ilerle(), adimla(N), solaDon(), sagaDon(), bekle(), kaplumbaga.adimla(), tekrarla(N) { ... }, ise(koşul) { ... } degilse { ... }`);
    }
  }

  if (blockStack.length > 0) {
    const topBlock = blockStack[blockStack.length - 1];
    const name = topBlock.type === 'loop' ? 'tekrarla döngüsü' : topBlock.type === 'while' ? 'iken döngüsü' : (topBlock.type === 'if' ? 'ise bloğu' : 'degilse bloğu');
    throw new Error(`Kod sonu: Kapatılmamış bir ${name} mevcut (Satır ${topBlock.line}).`);
  }

  return instructions;
}

// ── Route planning core ─────────────────────────────────────────────────────
// One planner serves the smart-route button, the star calibration and the
// level generator. Keeping a single implementation is the only way the
// generator's "is this solvable?" check can agree with what the engine
// actually allows at runtime.

const DIRECTIONS = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

export function directionOffset(dir) {
  switch (dir) {
    case 'UP': return { dx: 0, dy: -1 };
    case 'RIGHT': return { dx: 1, dy: 0 };
    case 'DOWN': return { dx: 0, dy: 1 };
    case 'LEFT': return { dx: -1, dy: 0 };
    default: return { dx: 0, dy: 0 };
  }
}

export function turnDirection(dir, turn) {
  const index = DIRECTIONS.indexOf(dir);
  if (index === -1) return dir;
  return DIRECTIONS[(index + (turn === 'LEFT' ? 3 : 1)) % 4];
}

// Mirrors loadLevel's turtle setup so a planned route and a played route see
// the same dive rhythm. Turtles alternate phase in row-major discovery order.
function deriveTurtleDirection(grid, x, y) {
  const at = (cx, cy) => (grid[cy] && grid[cy][cx]) || '#';
  const isWater = (cx, cy) => at(cx, cy) === '~' || at(cx, cy) === 'T';
  let dir = 'UP';
  if (isWater(x - 1, y) || isWater(x + 1, y)) dir = isWater(x - 1, y) ? 'LEFT' : 'RIGHT';
  if (isWater(x, y - 1) || isWater(x, y + 1)) dir = isWater(x, y - 1) ? 'UP' : 'DOWN';
  return dir;
}

export function buildRouteWorld(grid, startDir, options = {}) {
  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;
  const rows = grid.map(row => (Array.isArray(row) ? [...row] : [...row]));

  const world = {
    width,
    height,
    startDir,
    start: null,
    goal: null,
    bananas: [],
    keys: [],
    lilypads: new Map(),
    turtles: [],
    allowWait: Boolean(options.allowWait),
    turtlesControllable: Boolean(options.turtlesControllable),
    cells: rows
  };

  const providedTurtles = options.turtles;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = rows[y][x];
      if (char === 'M') world.start = { x, y };
      else if (char === 'S') world.goal = { x, y };
      else if (char === 'B') world.bananas.push({ x, y });
      else if (char === 'K') world.keys.push({ x, y });
      else if (char === 'L') world.lilypads.set(`${x},${y}`, world.lilypads.size);
      else if (char === 'T' && !providedTurtles) {
        world.turtles.push({
          x,
          y,
          dir: deriveTurtleDirection(rows, x, y),
          phase: (world.turtles.length % 2) * 2
        });
      }
    }
  }

  if (providedTurtles) {
    world.turtles = providedTurtles.map(turtle => ({
      x: turtle.x,
      y: turtle.y,
      dir: turtle.dir,
      phase: turtle.phase || 0
    }));
  } else {
    // Turtles sit in the river; the board stores water under them.
    for (const turtle of world.turtles) {
      rows[turtle.y][turtle.x] = '~';
    }
  }

  return world;
}

export function isWorldCellWalkable(world, x, y, hasKeys, stepCount, lilyMask) {
  if (x < 0 || x >= world.width || y < 0 || y >= world.height) return false;
  const char = world.cells[y][x];

  if (char === 'L') {
    const index = world.lilypads.get(`${x},${y}`);
    if (index !== undefined && (lilyMask & (1 << index))) return false;
  }

  if (char === '~') {
    const turtle = world.turtles.find(candidate => candidate.x === x && candidate.y === y);
    if (!turtle) return false;
    if (world.turtlesControllable) return true;
    return ((stepCount + (turtle.phase || 0)) % 4) < 2;
  }

  if (char === '#') return false;
  if (char === 'G' && !hasKeys) return false;
  return true;
}

// Breadth-first over (position, facing, collected banana set, collected key
// set, sunk lilypad set, dive phase) — so the first solution found uses the
// fewest commands.
export function planShortestRoute(world) {
  if (!world.start || !world.goal) return null;

  const bananaAt = new Map();
  world.bananas.forEach((banana, index) => bananaAt.set(`${banana.x},${banana.y}`, index));
  const keyAt = new Map();
  world.keys.forEach((key, index) => keyAt.set(`${key.x},${key.y}`, index));

  const targetBananaMask = (1 << world.bananas.length) - 1;
  const targetKeyMask = (1 << world.keys.length) - 1;
  const hasTurtles = world.turtles.length > 0;

  const start = {
    x: world.start.x,
    y: world.start.y,
    dir: world.startDir,
    mask: bananaAt.has(`${world.start.x},${world.start.y}`)
      ? (1 << bananaAt.get(`${world.start.x},${world.start.y}`))
      : 0,
    keyMask: keyAt.has(`${world.start.x},${world.start.y}`)
      ? (1 << keyAt.get(`${world.start.x},${world.start.y}`))
      : 0,
    lilyMask: 0,
    stepCount: 0
  };

  const stateKey = state =>
    `${state.x},${state.y},${state.dir},${state.mask},${state.keyMask},${state.lilyMask},${state.stepCount % 4}`;

  const queue = [start];
  const startKey = stateKey(start);
  const visited = new Set([startKey]);
  const previous = new Map();
  let cursor = 0;
  let goalKey = null;

  while (cursor < queue.length) {
    const state = queue[cursor++];
    const currentKey = stateKey(state);

    if (state.x === world.goal.x && state.y === world.goal.y &&
        state.mask === targetBananaMask && state.keyMask === targetKeyMask) {
      goalKey = currentKey;
      break;
    }

    const hasKeys = state.keyMask === targetKeyMask;
    const candidates = [];

    const { dx, dy } = directionOffset(state.dir);
    const nextX = state.x + dx;
    const nextY = state.y + dy;
    // Runtime checks a timed tile both before and after the step clock ticks,
    // so a plan must never rely on a turtle that dives mid-step.
    if (isWorldCellWalkable(world, nextX, nextY, hasKeys, state.stepCount, state.lilyMask) &&
        isWorldCellWalkable(world, nextX, nextY, hasKeys, state.stepCount + 1, state.lilyMask)) {
      let mask = state.mask;
      const bananaIndex = bananaAt.get(`${nextX},${nextY}`);
      if (bananaIndex !== undefined) mask |= (1 << bananaIndex);

      let keyMask = state.keyMask;
      const keyIndex = keyAt.get(`${nextX},${nextY}`);
      if (keyIndex !== undefined) keyMask |= (1 << keyIndex);

      let lilyMask = state.lilyMask;
      const leavingLily = world.lilypads.get(`${state.x},${state.y}`);
      if (leavingLily !== undefined) lilyMask |= (1 << leavingLily);

      candidates.push({
        action: 'ilerle',
        next: { x: nextX, y: nextY, dir: state.dir, mask, keyMask, lilyMask, stepCount: state.stepCount + 1 }
      });
    }

    // Turning or waiting also burns a step, so Mojo must still be on solid
    // ground once the clock advances.
    if (isWorldCellWalkable(world, state.x, state.y, hasKeys, state.stepCount + 1, state.lilyMask)) {
      for (const turn of ['LEFT', 'RIGHT']) {
        candidates.push({
          action: turn === 'LEFT' ? 'solaDon' : 'sagaDon',
          next: { ...state, dir: turnDirection(state.dir, turn), stepCount: state.stepCount + 1 }
        });
      }
      if (hasTurtles && world.allowWait) {
        candidates.push({ action: 'bekle', next: { ...state, stepCount: state.stepCount + 1 } });
      }
    }

    for (const candidate of candidates) {
      const nextKey = stateKey(candidate.next);
      if (visited.has(nextKey)) continue;
      visited.add(nextKey);
      previous.set(nextKey, { key: currentKey, action: candidate.action });
      queue.push(candidate.next);
    }
  }

  if (!goalKey) return null;

  const actions = [];
  let key = goalKey;
  while (key !== startKey) {
    const link = previous.get(key);
    actions.push(link.action);
    key = link.key;
  }
  return actions.reverse();
}

// Convenience wrapper for level data: plan straight from a level's grid rows.
export function planLevelRoute(level) {
  const allowed = level.allowedCommands || [];
  const world = buildRouteWorld(level.grid.map(row => [...row]), level.startDir, {
    allowWait: allowed.includes('bekle'),
    turtlesControllable: levelPilotsTurtles(level)
  });
  return planShortestRoute(world);
}

// Game State Class
export class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.currentLevelIdx = 0;
    this.level = null;

    // Grid sizing
    this.tileSize = 64;
    this.gridWidth = 0;
    this.gridHeight = 0;

    // Player state
    this.player = {
      x: 0,
      y: 0,
      dir: 'RIGHT', // UP, RIGHT, DOWN, LEFT
      animX: 0,
      animY: 0,
      animRotation: 0,
      targetRotation: 0
    };

    // Level state
    this.bananas = []; // List of {x, y, collected}
    this.starTile = { x: 0, y: 0 };
    this.gridData = []; // 2D grid array of characters
    this.playArea = null; // Designed (non-padding) region of the board
    this.trail = []; // Cells Mojo has walked during this attempt
    this.baseGridData = null; // Pristine copy used by the route planner
    this.baseTurtles = [];
    this.baseStart = { x: 0, y: 0 };

    // Execution state
    this.executionQueue = [];
    this.currentQueueIdx = -1;
    this.isRunning = false;
    this.animationTimer = null;
    this.animationProgress = 1; // 0 to 1 for current transition
    this.executionSpeed = 500; // ms per step
    this.executionOperationCount = 0;
    this.maxExecutionOperations = 5000;
    this.executionGeneration = 0;
    this.lastSourceCode = '';
    this.loopCounters = {}; // VM loop counters (nested loop support)
    this.historyStack = []; // Step-by-step history for Step Back (Undo) support

    // Advanced gameplay features state
    this.keys = [];
    this.rulerActive = false;
    this.hoveredCell = null;
    this.isDebugMode = false;
    this.isWaitingForStep = false;
    this.executionStepCount = 0;

    // Syntax Mode (indent or bracket)
    let savedSyntaxMode = null;
    try {
      savedSyntaxMode = localStorage.getItem('kodmaymunu_syntax_mode');
    } catch (_) {
      savedSyntaxMode = null;
    }
    this.syntaxMode = savedSyntaxMode === 'bracket' ? 'bracket' : 'indent';

    // Particles and special animations state
    this.particles = []; // Visual particle effects (banana pick, victory fanfare)
    this.flyingKey = null; // Key-to-gate animation trajectory
    this.showVictoryFanfare = false; // continuous fireworks toggle
    this.crashType = null; // 'water', 'rock', 'gate', or 'outOfBounds'
    this.crashAnimationFrame = null;
    this.crashAnimationGeneration = 0;
    this.effectsAnimationFrame = null;
    this.effectsAnimationGeneration = 0;

    // Fail counter and hint system
    this.failCountPerLevel = {}; // { levelId: count }
    this.hintShownForLevel = {}; // { levelId: true }

    // Load the pre-processed transparent sprite (small enough for mobile GPUs).
    this.bananaImg = new Image();
    this.bananaImgProcessed = null;
    this.bananaImg.onload = () => {
      this.bananaImgProcessed = this.bananaImg;
      this.draw();
    };
    this.bananaImg.src = 'banana-sprite.png';

    // UI Callbacks
    this.onLevelComplete = null;
    this.onExecutionStep = null; // Callback for current line highlight
    this.onExecutionFinished = null;
    this.onDebugStepComplete = null; // Callback for debug step finish
    this.onLogMessage = null;
    this.onBananaChange = null;
    this.onHint = null; // Callback for contextual hints

    // Assets loaded/setup
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem('kodmaymunu_level');
      const parsed = Number.parseInt(saved, 10);
      if (Number.isInteger(parsed)) {
        this.currentLevelIdx = Math.min(LEVELS.length - 1, Math.max(0, parsed));
      }
    } catch (_) {
      this.currentLevelIdx = 0;
    }
  }

  saveState() {
    try {
      localStorage.setItem('kodmaymunu_level', this.currentLevelIdx);
    } catch (_) {
      // The game remains fully playable when storage is blocked or full.
    }
  }

  loadLevel(idx, scenarioIndex = 0) {
    this.executionGeneration++;
    this.cancelCrashAnimation();
    this.cancelEffectsAnimation();
    const safeIndex = Number.isInteger(idx) ? idx : 0;
    this.currentLevelIdx = Math.min(LEVELS.length - 1, Math.max(0, safeIndex));
    this.saveState();
    this.level = LEVELS[this.currentLevelIdx];
    this.scenarioIndex = Math.max(0, Math.min(this.level.scenarios?.length || 0, scenarioIndex));
    const scenario = this.scenarioIndex > 0 ? this.level.scenarios[this.scenarioIndex - 1] : this.level;

    this.isRunning = false;
    this.currentQueueIdx = -1;
    this.loopCounters = {};
    this.historyStack = [];
    this.particles = [];
    this.flyingKey = null;
    this.showVictoryFanfare = false;
    this.crashType = null;
    this.executionStepCount = 0;
    this.executionOperationCount = 0;
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }

    // Parse original grid
    const origGrid = scenario.grid.map(row => row.split(''));
    const origH = origGrid.length;
    const origW = Math.max(...origGrid.map(r => r.length));

    // Keep compact handcrafted missions legible instead of shrinking them into
    // a mostly empty 20x12 board. Procedural/full-size missions retain 20x12.
    this.gridWidth = Math.min(20, Math.max(9, origW + 4));
    this.gridHeight = Math.min(12, Math.max(7, origH + 4));

    // Calculate centering offsets
    const padX = Math.floor((this.gridWidth - origW) / 2);
    const padY = Math.floor((this.gridHeight - origH) / 2);

    // Initialize the responsive camera area with grass ('.').
    this.gridData = [];
    for (let y = 0; y < this.gridHeight; y++) {
      this.gridData.push(new Array(this.gridWidth).fill('.'));
    }

    // Copy original grid into centered location
    for (let y = 0; y < origH; y++) {
      for (let x = 0; x < origW; x++) {
        const char = origGrid[y][x] || '.';
        const targetX = x + padX;
        const targetY = y + padY;
        if (targetX >= 0 && targetX < this.gridWidth && targetY >= 0 && targetY < this.gridHeight) {
          this.gridData[targetY][targetX] = char;
        }
      }
    }

    // Resize canvas
    this.canvas.width = this.gridWidth * this.tileSize;
    this.canvas.height = this.gridHeight * this.tileSize;

    // Scan for start points, bananas, stars, keys, turtles
    this.bananas = [];
    this.keys = [];
    this.turtles = [];
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const char = this.gridData[y][x];
        if (char === 'M') {
          this.player.x = x;
          this.player.y = y;
          this.player.dir = scenario.startDir || this.level.startDir;
          this.player.animX = x;
          this.player.animY = y;
          this.setRotationByDir(this.player.dir);
          this.player.animRotation = this.player.targetRotation;
        } else if (char === 'B') {
          this.bananas.push({ x, y, collected: false });
        } else if (char === 'K') {
          this.keys.push({ x, y, collected: false });
        } else if (char === 'S') {
          this.starTile = { x, y };
        } else if (char === 'T') {
          this.gridData[y][x] = '~'; // Turtles live in water
          // Determine initial direction based on river orientation
          let dir = 'UP';
          const upIsWater = (y > 0 && this.gridData[y-1][x] === '~');
          const downIsWater = (y < this.gridHeight - 1 && this.gridData[y+1][x] === '~');
          const leftIsWater = (x > 0 && this.gridData[y][x-1] === '~');
          const rightIsWater = (x < this.gridWidth - 1 && this.gridData[y][x+1] === '~');

          if (leftIsWater || rightIsWater) {
             dir = leftIsWater ? 'LEFT' : 'RIGHT'; // horizontal river
          }
          if (upIsWater || downIsWater) {
             dir = upIsWater ? 'UP' : 'DOWN'; // vertical river overrides horizontal
          }

          let targetRotation = 0;
          if (dir === 'UP') targetRotation = 0;
          if (dir === 'RIGHT') targetRotation = Math.PI / 2;
          if (dir === 'DOWN') targetRotation = Math.PI;
          if (dir === 'LEFT') targetRotation = -Math.PI / 2;

          this.turtles.push({
            x, y,
            dir,
            phase: (this.turtles.length % 2) * 2,
            animX: x,
            animY: y,
            animRotation: targetRotation,
            targetRotation: targetRotation
          });
        }
      }
    }

    // The board is padded with scenery so a compact mission is not squeezed
    // into a mostly empty 20x12 canvas. Remember the designed area so the
    // padding can be rendered as a border rather than as playable ground.
    this.playArea = { x: padX, y: padY, width: origW, height: origH };
    this.trail = [{ x: this.player.x, y: this.player.y }];

    // Planning must always run against the untouched board: lilypads sink and
    // bananas disappear as a program executes, and the reference solution is
    // often requested mid-attempt.
    this.baseGridData = this.gridData.map(row => [...row]);
    this.baseTurtles = this.turtles.map(turtle => ({
      x: turtle.x,
      y: turtle.y,
      dir: turtle.dir,
      phase: turtle.phase
    }));
    this.baseStart = { x: this.player.x, y: this.player.y };

    this.animationProgress = 1;
    this.draw();
  }

  setRotationByDir(dir) {
    switch (dir) {
      case 'RIGHT': this.player.targetRotation = 0; break;
      case 'DOWN': this.player.targetRotation = Math.PI / 2; break;
      case 'LEFT': this.player.targetRotation = Math.PI; break;
      case 'UP': this.player.targetRotation = -Math.PI / 2; break;
    }
  }

  // Facing maths lives with the planner so a planned turn and a played turn can
  // never disagree.
  getDirectionOffset(dir) {
    return directionOffset(dir);
  }

  getNextDirection(currentDir, turn) {
    return turnDirection(currentDir, turn);
  }

  isWalkableCell(x, y, hasKey = this.hasKeyCollected(), stepCount = (this.isRunning ? this.executionStepCount : 0), lilyMask = 0, lilypadIndex = null) {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return false;
    const char = this.gridData[y][x];

    // Lilypad check
    if (char === 'L') {
      if (lilypadIndex) {
        const idx = lilypadIndex.get(`${x},${y}`);
        if (idx !== undefined && (lilyMask & (1 << idx))) {
          return false; // Lilypad has sunk!
        }
      }
    }

    // Water check (needs surfaced turtle)
    if (char === '~') {
      const turtle = this.turtles && this.turtles.find(t => t.x === x && t.y === y);
      if (turtle) {
        // Evaluate if surfaced
        // If the level allows turtle control, they never dive automatically
        const isEmerged = levelPilotsTurtles(this.level)
          ? true
          : ((stepCount + (turtle.phase || 0)) % 4 < 2);
        return isEmerged;
      }
      return false; // Water without a surfaced turtle is not walkable
    }

    if (char === '#') return false;
    if (char === 'G' && !hasKey) return false;
    return true; // . M S B K L =
  }

  hasKeyCollected() {
    if (!this.keys || this.keys.length === 0) return true;
    return this.keys.every(k => k.collected);
  }

  createSmartRouteCode() {
    const reference = this.getReferenceSolution();
    if (!reference || reference.blocks.length === 0) {
      return null;
    }

    return this.formatRoutePlan(reference.blocks);
  }

  findSmartRoutePlan() {
    if (!this.level || !this.baseGridData) return null;
    const allowed = this.level.allowedCommands || [];
    const world = buildRouteWorld(this.baseGridData, this.level.startDir, {
      allowWait: allowed.includes('bekle'),
      turtlesControllable: levelPilotsTurtles(this.level),
      turtles: this.baseTurtles
    });
    world.start = { ...this.baseStart };
    world.goal = { ...this.starTile };
    return planShortestRoute(world);
  }

  findStartTile() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.gridData[y][x] === 'M') {
          return { x, y };
        }
      }
    }

    return { x: this.player.x, y: this.player.y };
  }

  // The reference solution is the single source of truth for a level's star
  // targets, for the "örnek çözüm" button and for the tests. Authored levels
  // may ship their own idiomatic `solution` blocks; everything else is encoded
  // optimally from the shortest route the planner finds.
  getReferenceSolution() {
    if (!this.level) return null;

    const cached = REFERENCE_CACHE.get(this.level.id);
    if (cached !== undefined) return cached;

    let reference = null;

    if (Array.isArray(this.level.solution) && this.level.solution.length > 0) {
      const blocks = normalizeBlocks(this.level.solution);
      reference = { blocks, lines: countBlockLines(blocks), authored: true };
    } else {
      const plan = this.findSmartRoutePlan();
      if (plan && plan.length > 0) {
        const allowed = this.level.allowedCommands || [];
        const encoded = encodeActions(plan, {
          allowLoops: allowed.includes('tekrarla'),
          allowCompact: allowed.includes('adimla')
        });
        reference = { blocks: encoded.blocks, lines: encoded.lines, authored: false };
      }
    }

    REFERENCE_CACHE.set(this.level.id, reference);
    return reference;
  }

  // 3 stars means "as tight as the reference solution", so the target can
  // never be unreachable. Beating the reference is tracked separately as a
  // mastery record instead of being folded into an impossible threshold.
  getStarTargets() {
    const reference = this.getReferenceSolution();
    const par = reference ? reference.lines : 0;
    if (!par) return { three: 1, two: 2, par: 0 };
    return {
      par,
      three: par,
      two: par + Math.max(2, Math.round(par * 0.35))
    };
  }

  formatRoutePlan(blocks) {
    const reference = this.getReferenceSolution();
    const comment = this.syntaxMode === 'indent' ? '#' : '//';
    const how = reference && reference.authored
      ? 'Bu görevin mekaniğini gösteren örnek program.'
      : 'En kısa rota bulundu, sonra tekrar eden hareketler döngüye çevrildi.';
    const lines = [
      `${comment} Örnek çözüm — ${countBlockLines(blocks)} satır (3 yıldız)`,
      `${comment} ${how}`,
      `${comment} Daha kısasını bulursan rekor kırarsın.`,
      ...renderBlocks(blocks, this.syntaxMode)
    ];
    return `${lines.join('\n')}\n`;
  }

  log(msg, type = 'info') {
    if (this.onLogMessage) {
      this.onLogMessage(msg, type);
    }
  }

  validateInstructionsForLevel(instructions, level) {
    if (!level) {
      throw new Error('Aktif seviye yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
    }

    const allowed = new Set(level.allowedCommands || []);
    const movementAllowed = allowed.has('ilerle') || allowed.has('adimla');

    const reject = (instruction, command) => {
      throw new Error(`Satır ${instruction.line}: "${command}" komutu bu seviyede henüz kullanılamaz.`);
    };

    const rejectRetired = instruction => {
      throw new Error(`Satır ${instruction.line}: "muzAl()" komutu kaldırıldı. Mojo muzun üzerinden geçtiğinde muz otomatik toplanır.`);
    };

    for (const instruction of instructions) {
      if (instruction.type === 'loop_init') {
        if (!allowed.has('tekrarla')) reject(instruction, 'tekrarla');
        continue;
      }

      if (instruction.type === 'jump_if_false') {
        const keyword = instruction.sourceName || 'ise';
        if (!allowed.has(keyword)) reject(instruction, keyword);
        continue;
      }

      if (instruction.type !== 'command') continue;

      const sourceName = instruction.sourceName || instruction.name;
      if (sourceName === 'muzAl') rejectRetired(instruction);
      const isMovement = sourceName === 'ilerle' || sourceName === 'adimla' || instruction.name === 'geriGit';

      if (instruction.target === 'kaplumbaga') {
        if (!allowed.has('kaplumbaga.adimla')) {
          reject(instruction, `kaplumbaga.${sourceName}`);
        }
        if (sourceName === 'muzAl') {
          reject(instruction, `kaplumbaga.${sourceName}`);
        }
      }

      if (isMovement) {
        if (!movementAllowed) reject(instruction, sourceName);
        // `adimla` is its own unlock: before the mission that teaches it, a
        // single step must be written as `ilerle()`.
        if (sourceName === 'adimla' && !allowed.has('adimla')) {
          reject(instruction, 'adimla');
        }
        const compactMove = Math.abs(instruction.sourceCount || 1) > 1 || (instruction.sourceCount || 1) < 0;
        if (compactMove && !allowed.has('adimla')) {
          reject(instruction, `${sourceName}(${instruction.sourceCount})`);
        }
      } else if (!allowed.has(sourceName)) {
        reject(instruction, sourceName);
      }
    }
  }

  runCodeText(code) {
    if (this.isRunning) return;

    try {
      this.lastSourceCode = code;
      this.executionQueue = parseCode(code, this.syntaxMode);
      if (this.executionQueue.length === 0) {
        this.log("Hata: Çalıştırılacak geçerli bir kod bulunamadı!", "error");
        soundEngine.playFail();
        if (this.onExecutionFinished) {
          this.onExecutionFinished();
        }
        return;
      }

      const activeLevel = this.level || LEVELS[this.currentLevelIdx];
      this.validateInstructionsForLevel(this.executionQueue, activeLevel);

      this.log("Algoritma başlatılıyor...", "info");
      this.loadLevel(this.currentLevelIdx); // Reset state before running
      this.isRunning = true;
      this.currentQueueIdx = 0;
      if (this.onScenarioChange) this.onScenarioChange(0);
      this.step();
    } catch (err) {
      this.log(err.message, "error");
      soundEngine.playFail();
      if (this.onExecutionFinished) {
        this.onExecutionFinished();
      }
    }
  }

  stop() {
    this.cancelCrashAnimation();
    this.cancelEffectsAnimation();
    this.isRunning = false;
    this.currentQueueIdx = -1;
    this.loopCounters = {};
    this.historyStack = [];
    this.particles = [];
    this.flyingKey = null;
    this.showVictoryFanfare = false;
    this.crashType = null;
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    this.loadLevel(this.currentLevelIdx); // Reset state
    if (this.onScenarioChange) this.onScenarioChange(0);
    this.log("Program durduruldu.", "info");
    if (this.onExecutionFinished) {
      this.onExecutionFinished();
    }
  }

  step() {
    if (!this.isRunning) return;

    // Run control flow instructions instantly, pausing only on move commands
    while (this.currentQueueIdx < this.executionQueue.length) {
      this.executionOperationCount++;
      if (this.executionOperationCount > this.maxExecutionOperations) {
        this.isRunning = false;
        this.log('Program güvenli çalışma sınırını aştı. Döngü sayılarını küçültüp tekrar dene.', 'error');
        soundEngine.playFail();
        if (this.onExecutionFinished) this.onExecutionFinished();
        return;
      }
      const currentStep = this.executionQueue[this.currentQueueIdx];

      if (currentStep.type === 'command') {
        // Highlight UI line
        if (this.onExecutionStep) {
          this.onExecutionStep(currentStep.line);
        }

        // Save state history for step back (Undo) support
        if (this.isDebugMode) {
          this.historyStack.push({
            player: { x: this.player.x, y: this.player.y, dir: this.player.dir },
            keys: this.keys.map(k => ({ ...k })),
            bananas: this.bananas.map(b => ({ ...b })),
            turtles: (this.turtles || []).map(t => ({ ...t })),
            gridData: this.gridData.map(row => [...row]),
            executionStepCount: this.executionStepCount,
            executionOperationCount: this.executionOperationCount,
            particles: this.particles.map(p => ({ ...p })),
            flyingKey: this.flyingKey ? { ...this.flyingKey } : null,
            loopCounters: { ...this.loopCounters },
            trail: this.trail.map(cell => ({ ...cell })),
            queueIdx: this.currentQueueIdx
          });
        }

        // Execute command action
        const success = this.applyAction(currentStep.name, currentStep.target);
        if (!success) {
          this.isRunning = false;
          if (this.onExecutionFinished) {
            this.onExecutionFinished();
          }
          return;
        }

        // Pause VM loop and trigger movement animations
        this.animationProgress = 0;
        this.animate();
        return; // exit function, wait for animate() callback to resume
      } else if (currentStep.type === 'loop_init') {
        this.loopCounters[currentStep.loopId] = currentStep.count;
        this.currentQueueIdx++;
      } else if (currentStep.type === 'loop_step') {
        this.loopCounters[currentStep.loopId]--;
        if (this.loopCounters[currentStep.loopId] > 0) {
          this.currentQueueIdx = currentStep.target;
        } else {
          this.currentQueueIdx++;
        }
      } else if (currentStep.type === 'jump') {
        this.currentQueueIdx = currentStep.target;
      } else if (currentStep.type === 'jump_if_false') {
        const condVal = this.evaluateCondition(currentStep.condition);
        if (condVal) {
          this.currentQueueIdx++;
        } else {
          this.currentQueueIdx = currentStep.target;
        }
      } else {
        this.currentQueueIdx++;
      }
    }

    // Program reached the end
    this.checkWinCondition();
  }

  stepBack() {
    if (!this.isRunning || !this.isDebugMode || this.historyStack.length === 0) {
      return false;
    }

    const prevState = this.historyStack.pop();
    this.player.x = prevState.player.x;
    this.player.y = prevState.player.y;
    this.player.dir = prevState.player.dir;
    this.player.animX = prevState.player.x;
    this.player.animY = prevState.player.y;
    this.setRotationByDir(prevState.player.dir);
    this.player.animRotation = this.player.targetRotation;

    this.keys = prevState.keys;
    this.bananas = prevState.bananas;
    this.turtles = prevState.turtles || [];
    this.gridData = prevState.gridData || this.gridData;
    this.executionStepCount = prevState.executionStepCount || 0;
    this.executionOperationCount = prevState.executionOperationCount || 0;
    this.particles = prevState.particles || [];
    this.flyingKey = prevState.flyingKey || null;
    this.loopCounters = prevState.loopCounters;
    this.trail = prevState.trail || this.trail;
    this.currentQueueIdx = prevState.queueIdx; // Point IP back to this instruction

    this.animationProgress = 1;
    this.draw();

    if (this.onBananaChange) {
      this.onBananaChange();
    }

    if (this.onExecutionStep) {
      const step = this.executionQueue[this.currentQueueIdx];
      if (step) {
        this.onExecutionStep(step.line);
      }
    }

    this.isWaitingForStep = true;
    return true;
  }

  evaluateCondition(condition) {
    const { dx, dy } = this.getDirectionOffset(this.player.dir);
    const frontX = this.player.x + dx;
    const frontY = this.player.y + dy;

    // Check bounds
    const isOutOfBounds = frontX < 0 || frontX >= this.gridWidth || frontY < 0 || frontY >= this.gridHeight;
    const cell = isOutOfBounds ? '#' : this.gridData[frontY][frontX];

    switch (condition) {
      case 'hedefteDegilim':
        return this.player.x !== this.starTile.x || this.player.y !== this.starTile.y;
      case 'onumdeGuvenliYolVar':
        return this.isWalkableCell(frontX, frontY, this.hasKeyCollected(), this.executionStepCount)
          && this.isWalkableCell(frontX, frontY, this.hasKeyCollected(), this.executionStepCount + 1);
      case 'onumdeEngelVar':
        return !this.isWalkableCell(frontX, frontY);
      case 'onumdeMuzVar':
        return cell === 'B' && this.bananas.some(b => b.x === frontX && b.y === frontY && !b.collected);
      case 'onumdeKayaVar':
        return cell === '#';
      case 'onumdeSuVar':
        return cell === '~' && !this.isWalkableCell(frontX, frontY);
      case 'onumdeKilitVar':
        return cell === 'G' && !this.hasKeyCollected();
      default:
        return false;
    }
  }

  // ── Encouraging Message Pools ──
  getRandomMessage(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  getWaterFailMessage() {
    return this.getRandomMessage([
      "Mojo suya düştü ama sorun değil! 🏊 Cetvelle mesafeyi kontrol edip tekrar dene.",
      "Çıldırma! 💧 Mojo yüzme bilmiyor ama sen algoritma biliyorsun. Bir daha dene!",
      "Su engeli seni durdurdu. 🌊 Rotanı gözden geçir, doğru yol yakınlarda!",
      "Mojo ıslandı! 💦 Suya basmamak için hangi yönde kaç adım gideceğini hesapla.",
      "Splash! 🐟 Mojo suya düştü. Ama her hata seni çözüme bir adım daha yaklaştırıyor!"
    ]);
  }

  getRockFailMessage() {
    return this.getRandomMessage([
      "Mojo kayaya çarptı! 🪨 Dönüş komutlarını kontrol et, doğru yöne mi bakıyor?",
      "Kayalar sert ama sen daha sertsin! 💪 Rotanı düzelt ve tekrar dene.",
      "Oops, kaya engeli! ⛰️ Cetvel ile mesafeyi ölç ve doğru adım sayısını bul.",
      "Mojo kafasını kayaya çarptı! 😵 Hangi yönde ilerlemen gerektiğini düşün.",
      "Taş gibi bir engel! 🧱 Ama algoritmacılar her engelin üstesinden gelir."
    ]);
  }

  getGateFailMessage() {
    return this.getRandomMessage([
      "Kapı kilitli! 🔒 Önce altın anahtarı bulmalısın. Haritada K harfini ara!",
      "Mojo kapıdan geçemedi. 🗝️ Anahtarı almadan kapıyı açamazsın, rotanı değiştir!",
      "Kilitli kapı seni durdurdu! 🚪 Önce anahtarın olduğu yere git.",
      "Anahtar olmadan kapı açılmaz! 🔐 Rotanı yeniden planla, önce K karesine uğra."
    ]);
  }

  getOutOfBoundsMessage() {
    return this.getRandomMessage([
      "Mojo haritanın dışına çıktı! 🗺️ Sınırları aşmadan hedefe ulaşmalısın.",
      "Harita sınırı! 🚧 Mojo daha fazla ilerleyemez. Dönüş komutlarını kontrol et.",
      "Mojo maceraya fazla kapıldı ve haritadan çıktı! 🧭 Yönünü düzelt."
    ]);
  }

  getTurtleDrownMessage() {
    return this.getRandomMessage([
      "Mojo altındaki kaplumbağa suya dalınca boğuldu! 🐢💦 bekle() ile zamanlamayı ayarla.",
      "Kaplumbağa dalınca Mojo suya düştü! 🐢 Zamanlama her şey, bekle() kullanmayı dene.",
      "Kaplumbağa batarken Mojo da battı! ⏱️ 2 adım üstte, 2 adım altta. Sayarak ilerle!",
      "Kaplumbağanın dalış zamanı geldi! 🌊 Bir sonraki seferde daha hızlı geç veya bekle."
    ]);
  }

  getBananaCollectMessage() {
    const collected = this.bananas.filter(b => b.collected).length;
    const total = this.bananas.length;
    return this.getRandomMessage([
      `Lezzetli! 🍌 Mojo bu muzu bayıldı. (${collected}/${total})`,
      `Harika yakalama! 🍌✨ ${total - collected} muz daha kaldı!`,
      `Muz toplandı! 🎯 Devam et, Mojo'nun karnı doymuyor! (${collected}/${total})`,
      `Yummy! 🍌 ${collected}. muz cebimizde. ${total - collected > 0 ? `Sıradaki hedef nerede acaba? 🤔` : `Hepsi tamam!`}`,
      `Nefis! 🍌 Mojo mutlu. ${total - collected > 0 ? `${total - collected} tane daha var!` : `Tüm muzlar toplandı! 🎉`}`
    ]);
  }

  getKeyCollectMessage() {
    return this.getRandomMessage([
      "Harika! 🔑 Anahtarı aldın, kilitli kapılar artık açık! Yoluna devam et.",
      "Altın anahtar cebinde! 🗝️✨ Kapılar seni bekliyor, ilerle!",
      "Mükemmel keşif! 🔑 Anahtar toplandı. Şimdi kapıyı aç ve hedefe koş!",
      "Anahtar senin! 🗝️ Artık kilitli geçitler engel değil. Devam!"
    ]);
  }

  getVictoryMessage() {
    return this.getRandomMessage([
      "🎉 Tebrikler! Mojo hedefe ulaştı ve tüm muzları topladı! Muhteşem algoritma!",
      "🏆 Bravo! Mükemmel bir çözüm! Mojo sana teşekkür ediyor!",
      "🌟 Harika iş! Algoritman kusursuz çalıştı! Mojo çok mutlu!",
      "🎊 Fantastik! Tüm muzlar toplandı, hedef bulundu! Sen bir algoritma ustasısın!",
      "🥳 Muhteşem! Mojo sandığa ulaştı! Kodlama yeteneklerin gelişiyor!"
    ]);
  }

  // Record a failure and maybe show hint
  recordFailure() {
    const levelId = this.level.id;
    this.failCountPerLevel[levelId] = (this.failCountPerLevel[levelId] || 0) + 1;

    // Show contextual hint after 3 failures
    if (this.failCountPerLevel[levelId] >= 3 && !this.hintShownForLevel[levelId]) {
      this.hintShownForLevel[levelId] = true;
      this.showContextualHint();
    }
  }

  showContextualHint() {
    const allowed = this.level.allowedCommands || [];
    let hint = '';

    if (this.level.tip) {
      // Strip HTML tags from the tip for console display
      hint = '💡 İpucu: ' + this.level.tip.replace(/<[^>]*>/g, '');
    } else if (allowed.includes('tekrarla')) {
      hint = '💡 İpucu: tekrarla() döngüsünü kullanmayı denedin mi? Tekrarlayan kalıpları otomatikleştir!';
    } else if (allowed.includes('bekle')) {
      hint = '💡 İpucu: bekle() komutuyla kaplumbağanın su üstüne çıkmasını bekleyebilirsin!';
    } else {
      hint = '💡 İpucu: Cetvel aracını kullanarak mesafeleri ölç. Kaç adım gideceğini hesapla!';
    }

    this.log(hint, 'hint');
    if (this.onHint) {
      this.onHint(hint);
    }
  }

  setTurtleRotation(turtle) {
    switch (turtle.dir) {
      case 'UP': turtle.targetRotation = 0; break;
      case 'RIGHT': turtle.targetRotation = Math.PI / 2; break;
      case 'DOWN': turtle.targetRotation = Math.PI; break;
      case 'LEFT': turtle.targetRotation = -Math.PI / 2; break;
    }
  }

  applyAction(action, target = 'mojo') {
    if (target === 'kaplumbaga') {
      if (!this.turtles || this.turtles.length === 0) {
        this.log("Haritada kaplumbaga yok!", "error");
        soundEngine.playFail();
        this.recordFailure();
        return false;
      }

      let allSuccess = true;
      for (const turtle of this.turtles) {
        if (action === 'ilerle' || action === 'geriGit') {
          const { dx, dy } = this.getDirectionOffset(turtle.dir);
          const offsetFactor = action === 'geriGit' ? -1 : 1;
          const nextX = Math.round(turtle.x + dx * offsetFactor);
          const nextY = Math.round(turtle.y + dy * offsetFactor);

          if (nextX < 0 || nextX >= this.gridWidth || nextY < 0 || nextY >= this.gridHeight || this.gridData[nextY][nextX] !== '~') {
            this.log("Kaplumbağa karaya oturdu veya sınırı aştı!", "error");
            allSuccess = false;
            break;
          }

          turtle.x = nextX;
          turtle.y = nextY;
        } else if (action === 'sagaDon') {
          turtle.dir = this.getNextDirection(turtle.dir, 'RIGHT');
          this.setTurtleRotation(turtle);
        } else if (action === 'solaDon') {
          turtle.dir = this.getNextDirection(turtle.dir, 'LEFT');
          this.setTurtleRotation(turtle);
        } else if (action === 'bekle') {
          // just delay
        }
      }

      if (!allSuccess) {
        soundEngine.playFail();
        this.recordFailure();
        return false;
      }

      this.executionStepCount++;
      // Check if Mojo drowned because turtle moved away
      if (!this.isWalkableCell(this.player.x, this.player.y)) {
         this.log(this.getTurtleDrownMessage(), "error");
         soundEngine.playFail();
         this.recordFailure();
         this.triggerCrashAnimation('water');
         return false;
      }
      soundEngine.playStep();
      return true;
    }

    const { dx, dy } = this.getDirectionOffset(this.player.dir);

    if (action === 'ilerle' || action === 'geriGit') {
      const isBackward = action === 'geriGit';
      const offsetFactor = isBackward ? -1 : 1;
      const nextX = this.player.x + dx * offsetFactor;
      const nextY = this.player.y + dy * offsetFactor;

      if (!this.isWalkableCell(nextX, nextY)) {
        const cell = nextX >= 0 && nextX < this.gridWidth && nextY >= 0 && nextY < this.gridHeight ? this.gridData[nextY][nextX] : '#';
        let obstacleType = 'outOfBounds';
        if (cell === 'G') {
          this.log(this.getGateFailMessage(), "error");
          obstacleType = 'gate';
        } else if (cell === '#') {
          this.log(this.getRockFailMessage(), "error");
          obstacleType = 'rock';
        } else if (cell === '~') {
          this.log(this.getWaterFailMessage(), "error");
          obstacleType = 'water';
        } else {
          this.log(this.getOutOfBoundsMessage(), "error");
        }
        soundEngine.playFail();
        this.recordFailure();
        this.triggerCrashAnimation(obstacleType);
        return false;
      }

      const oldX = this.player.x;
      const oldY = this.player.y;
      this.player.x = nextX;
      this.player.y = nextY;

      // Sinking Lilypad check:
      if (this.gridData[oldY][oldX] === 'L') {
        this.gridData[oldY][oldX] = '~';
        this.spawnLeafParticles(oldX, oldY);
      }

      this.executionStepCount++;

      // Check if Mojo drowned at the new step count (e.g. stepped on a turtle that just submerged)
      if (!this.isWalkableCell(nextX, nextY)) {
        this.log(this.getWaterFailMessage(), "error");
        soundEngine.playFail();
        this.recordFailure();
        this.triggerCrashAnimation('water');
        return false;
      }

      this.trail.push({ x: nextX, y: nextY });
      if (this.trail.length > 400) this.trail.shift();

      this.collectBananaAtPlayer();
      this.collectKeyAtPlayer();
      soundEngine.playStep();
      return true;

    } else if (action === 'sagaDon') {
      this.player.dir = this.getNextDirection(this.player.dir, 'RIGHT');
      this.setRotationByDir(this.player.dir);

      this.executionStepCount++;
      // Check if turtle under Mojo submerged
      if (!this.isWalkableCell(this.player.x, this.player.y)) {
        this.log(this.getTurtleDrownMessage(), "error");
        soundEngine.playFail();
        this.recordFailure();
        this.triggerCrashAnimation('water');
        return false;
      }

      soundEngine.playStep();
      return true;

    } else if (action === 'solaDon') {
      this.player.dir = this.getNextDirection(this.player.dir, 'LEFT');
      this.setRotationByDir(this.player.dir);

      this.executionStepCount++;
      // Check if turtle under Mojo submerged
      if (!this.isWalkableCell(this.player.x, this.player.y)) {
        this.log(this.getTurtleDrownMessage(), "error");
        soundEngine.playFail();
        this.recordFailure();
        this.triggerCrashAnimation('water');
        return false;
      }

      soundEngine.playStep();
      return true;

    } else if (action === 'bekle') {
      this.executionStepCount++;
      // Check if turtle under Mojo submerged
      if (!this.isWalkableCell(this.player.x, this.player.y)) {
        this.log(this.getTurtleDrownMessage(), "error");
        soundEngine.playFail();
        this.recordFailure();
        this.triggerCrashAnimation('water');
        return false;
      }

      soundEngine.playStep();
      return true;

    } else if (action === 'muzAl') {
      // Retired command: the validator rejects it before execution, so this is
      // only a safety net for programs compiled elsewhere.
      this.log("muzAl() kaldırıldı; Mojo muzlara değince otomatik toplar.", "info");
      this.collectBananaAtPlayer();
      return true;
    }
    return false;
  }

  collectKeyAtPlayer() {
    if (!this.keys) return false;
    const key = this.keys.find(k => k.x === this.player.x && k.y === this.player.y && !k.collected);
    if (!key) return false;

    key.collected = true;
    this.log(this.getKeyCollectMessage(), "success");
    soundEngine.playCoin();

    // Trigger sliding key flying animation to the gate!
    let gateX = -1, gateY = -1;
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (this.gridData[y][x] === 'G') {
          gateX = x;
          gateY = y;
          break;
        }
      }
    }
    if (gateX !== -1) {
      this.flyingKey = {
        startX: this.player.x,
        startY: this.player.y,
        targetX: gateX,
        targetY: gateY,
        progress: 0
      };
    }
    return true;
  }

  collectBananaAtPlayer() {
    const banana = this.bananas.find(b => b.x === this.player.x && b.y === this.player.y && !b.collected);
    if (!banana) return false;

    banana.collected = true;
    this.log(this.getBananaCollectMessage(), "success");
    soundEngine.playCoin();

    // Spawn pick particles
    this.spawnBananaParticles(this.player.x, this.player.y);

    if (this.onBananaChange) {
      this.onBananaChange(this.bananas.filter(b => b.collected).length, this.bananas.length);
    }
    return true;
  }

  spawnBananaParticles(cellX, cellY) {
    const center = this.tileSize / 2;
    const px = cellX * this.tileSize + center;
    const py = cellY * this.tileSize + center;
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upwards bias
        color: '#facc15', // yellow gold
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 15
      });
    }
  }

  spawnLeafParticles(cellX, cellY) {
    const center = this.tileSize / 2;
    const px = cellX * this.tileSize + center;
    const py = cellY * this.tileSize + center;
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        color: '#10b981', // green leaf color
        size: 2.5 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 15 + Math.random() * 15
      });
    }
  }

  spawnVictoryParticles() {
    const px = this.starTile.x * this.tileSize + this.tileSize / 2;
    const py = this.starTile.y * this.tileSize + this.tileSize / 2;
    const colors = ['#facc15', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 4 - Math.random() * Math.PI / 2; // shoot upwards
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // upward force
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 25
      });
    }
  }

  cancelEffectsAnimation() {
    this.effectsAnimationGeneration++;
    if (this.effectsAnimationFrame !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.effectsAnimationFrame);
    }
    this.effectsAnimationFrame = null;
    this.showVictoryFanfare = false;
  }

  startVictoryEffects() {
    this.cancelEffectsAnimation();
    this.showVictoryFanfare = true;
    const generation = this.effectsAnimationGeneration;
    const startedAt = performance.now();

    const renderEffects = now => {
      if (generation !== this.effectsAnimationGeneration) return;
      if (now - startedAt > 1500) this.showVictoryFanfare = false;
      this.draw();
      if (this.showVictoryFanfare || this.particles.length > 0 || this.flyingKey) {
        this.effectsAnimationFrame = requestAnimationFrame(renderEffects);
      } else {
        this.effectsAnimationFrame = null;
      }
    };

    this.spawnVictoryParticles();
    this.effectsAnimationFrame = requestAnimationFrame(renderEffects);
  }

  cancelCrashAnimation() {
    this.crashAnimationGeneration++;
    if (this.crashAnimationFrame !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.crashAnimationFrame);
    }
    this.crashAnimationFrame = null;
    this.crashType = null;
  }

  triggerCrashAnimation(obstacleType) {
    this.cancelCrashAnimation();
    this.animationProgress = 0;
    this.crashType = obstacleType; // 'water', 'rock', 'gate', or 'outOfBounds'
    const self = this;
    const generation = this.crashAnimationGeneration;
    let frames = 0;

    function crashLoop() {
      if (generation !== self.crashAnimationGeneration) return;
      if (frames < 30) {
        frames++;
        self.drawCrash(frames);
        self.crashAnimationFrame = requestAnimationFrame(crashLoop);
      } else {
        self.crashAnimationFrame = null;
        self.crashType = null;
        self.loadLevel(self.currentLevelIdx);
      }
    }
    this.crashAnimationFrame = requestAnimationFrame(crashLoop);
  }

  drawCrash(frames) {
    const center = this.tileSize / 2;
    const px = this.player.x * this.tileSize + center;
    const py = this.player.y * this.tileSize + center;

    this.ctx.save();

    if (this.crashType === 'water') {
      // Drowning animation: spin and scale down
      this.draw(); // draw normal scene first
      this.ctx.translate(px, py);
      this.ctx.rotate(frames * 0.25);
      const scale = Math.max(0, 1 - frames / 30);
      this.ctx.scale(scale, scale);
      this.ctx.translate(-px, -py);
      this.drawPlayer(px, py, false);
    } else {
      // Rock/gate/outOfBounds shake
      const shakeX = (Math.random() - 0.5) * 8;
      const shakeY = (Math.random() - 0.5) * 8;
      this.ctx.translate(shakeX, shakeY);
      this.draw(); // draw normal scene with shake
      this.ctx.translate(-shakeX, -shakeY);
      // Draw player override as dizzy (stars around head)
      this.drawPlayer(px + shakeX, py + shakeY, true);
    }
    this.ctx.restore();

    // Red tint flash
    this.ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0, 0.4 - frames * 0.015)})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  animate() {
    const speed = this.executionSpeed;
    const start = performance.now();
    const self = this;
    const generation = this.executionGeneration;
    const startX = this.player.animX;
    const startY = this.player.animY;
    const startRot = this.player.animRotation;

    let targetRot = this.player.targetRotation;
    // Handle rotation wrapping for shortest turn direction
    let diff = targetRot - startRot;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    targetRot = startRot + diff;

    // Capture turtle animation start states
    const turtleAnimStates = (this.turtles || []).map(t => {
      let tTargetRot = t.targetRotation;
      let tDiff = tTargetRot - t.animRotation;
      while (tDiff < -Math.PI) tDiff += Math.PI * 2;
      while (tDiff > Math.PI) tDiff -= Math.PI * 2;
      return {
        startX: t.animX,
        startY: t.animY,
        startRot: t.animRotation,
        targetRot: t.animRotation + tDiff
      };
    });

    function animLoop(time) {
      if (!self.isRunning || generation !== self.executionGeneration) return;
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / (speed * 0.8)); // Leave 20% buffer

      self.animationProgress = progress;
      self.player.animX = startX + (self.player.x - startX) * progress;
      self.player.animY = startY + (self.player.y - startY) * progress;
      self.player.animRotation = startRot + (targetRot - startRot) * progress;

      // Animate turtles
      if (self.turtles) {
        for (let i = 0; i < self.turtles.length; i++) {
          const t = self.turtles[i];
          const state = turtleAnimStates[i];
          t.animX = state.startX + (t.x - state.startX) * progress;
          t.animY = state.startY + (t.y - state.startY) * progress;
          t.animRotation = state.startRot + (state.targetRot - state.startRot) * progress;
        }
      }

      self.draw();

      if (progress < 1) {
        requestAnimationFrame(animLoop);
      } else {
        // Animation finished
        self.player.animX = self.player.x;
        self.player.animY = self.player.y;
        self.player.animRotation = self.player.targetRotation;

        if (self.turtles) {
          for (let i = 0; i < self.turtles.length; i++) {
            const t = self.turtles[i];
            t.animX = t.x;
            t.animY = t.y;
            t.animRotation = t.targetRotation;
          }
        }

        self.draw();

        self.currentQueueIdx++;
        if (self.isDebugMode) {
          self.isWaitingForStep = true;
          if (self.onDebugStepComplete) {
            self.onDebugStepComplete(); // triggers UI update for debug step complete
          }
        } else {
          self.animationTimer = setTimeout(() => {
            if (generation === self.executionGeneration) self.step();
          }, speed * 0.2);
        }
      }
    }
    requestAnimationFrame(animLoop);
  }

  checkWinCondition() {
    // Check if player is on a water cell with a submerged turtle
    const currentCell = this.gridData[this.player.y][this.player.x];
    if (currentCell === '~' && !this.isWalkableCell(this.player.x, this.player.y)) {
      this.log(this.getTurtleDrownMessage(), "error");
      soundEngine.playFail();
      this.isRunning = false;
      this.recordFailure();
      this.triggerCrashAnimation('water');
      if (this.onExecutionFinished) {
        this.onExecutionFinished();
      }
      return;
    }

    // Check if at star and all bananas collected
    const uncollected = this.bananas.filter(b => !b.collected);
    const atStar = this.player.x === this.starTile.x && this.player.y === this.starTile.y;

    if (atStar && uncollected.length === 0 && this.keys.every(key => key.collected)) {
      if (this.scenarioIndex < (this.level.scenarios?.length || 0)) {
        const nextScenario = this.scenarioIndex + 1;
        this.log(`Parkur ${nextScenario} geçti. Aynı kod parkur ${nextScenario + 1} üzerinde deneniyor.`, 'success');
        this.loadLevel(this.currentLevelIdx, nextScenario);
        this.isRunning = true;
        this.currentQueueIdx = 0;
        if (this.onScenarioChange) this.onScenarioChange(nextScenario);
        this.step();
        return;
      }
      this.log(this.getVictoryMessage(), "success");
      soundEngine.playVictory();
      this.isRunning = false;
      this.startVictoryEffects();

      // Reset fail counter on success
      if (this.level) {
        this.failCountPerLevel[this.level.id] = 0;
      }

      // Star targets come from the level's verified reference solution, so a
      // three-star run is always something the player can actually write.
      const lineCount = this.getUniqueCodeLineCount();
      const targets = this.getStarTargets();
      let stars = 1;
      if (lineCount <= targets.three) {
        stars = 3;
      } else if (lineCount <= targets.two) {
        stars = 2;
      }

      if (this.onLevelComplete) {
        this.onLevelComplete(stars, lineCount, {
          par: targets.par,
          twoStarLimit: targets.two,
          beatPar: targets.par > 0 && lineCount < targets.par,
          scenarios: 1 + (this.level.scenarios?.length || 0),
          mastery: this.getMasteryResult(lineCount)
        });
      }
    } else {
      if (!atStar) {
        this.log(this.getRandomMessage([
          "Mojo sandığa ulaşamadı! 📦 Rotanı gözden geçir, hedefe doğru yönlendir.",
          "Hedefe ulaşılamadı! 🎯 Mojo'nun son konumunu kontrol et, birkaç adım eksik olabilir.",
          "Sandık hâlâ uzakta! 🗺️ Kodu gözden geçirip doğru yöne dönmeyi dene."
        ]), "error");
      } else if (uncollected.length > 0) {
        this.log(this.getRandomMessage([
          `Hedefe vardın ama ${uncollected.length} muz yolda kaldı! 🍌 Rotanı değiştir.`,
          `Sandığa ulaştın ama ${uncollected.length} muz toplanmadı! 🍌 Tüm muzlardan geç.`,
          `Neredeyse! Sadece ${uncollected.length} muz eksik. 🍌 Muzların üzerinden geçerek topla!`
        ]), "error");
      } else {
        this.log('Sandıktasın ama anahtarlar eksik. Tüm anahtarları toplayıp geri gel.', 'error');
      }
      soundEngine.playFail();
      this.recordFailure();
      this.isRunning = false;
      if (this.onExecutionFinished) {
        this.onExecutionFinished();
      }
    }
  }

  getUniqueCodeLineCount() {
    // Score the written program, not the expanded execution queue.
    // Closing braces and comments do not count as algorithm steps.
    const lines = stripCommentsPreservingLines(this.lastSourceCode)
      .map(line => line.trim())
      .filter(line => line && line !== '}');
    return lines.length;
  }

  getMasteryResult(lineCount = this.getUniqueCodeLineCount()) {
    const goal = this.level.mastery;
    if (!goal) return null;
    const program = this.executionQueue;
    const hasConcept = goal.concept === 'while'
      ? program.some(i => i.sourceName === 'iken')
      : goal.concept === 'branch'
        ? program.some(i => i.sourceName === 'ise')
        : goal.concept === 'loop'
          ? program.some(i => i.type === 'loop_init')
          : true;
    return { earned: hasConcept && lineCount <= this.getStarTargets().three, label: goal.label };
  }

  draw() {
    const isLight = document.body.classList.contains('light-theme');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Ground Tiles & Grid lines
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        // Draw basic grass block
        if (isLight) {
          this.ctx.fillStyle = (x + y) % 2 === 0 ? '#e2f5ea' : '#d0eedd';
        } else {
          this.ctx.fillStyle = (x + y) % 2 === 0 ? '#112217' : '#0c1a11';
        }
        this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

        // Soft grid outline
        this.ctx.strokeStyle = isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);

        // Draw cell items
        const cell = this.gridData[y][x];
        if (cell === '#') {
          this.drawRock(px, py);
        } else if (cell === '~') {
          this.drawWater(px, py);
        } else if (cell === 'G') {
          this.drawGate(px, py, this.hasKeyCollected());
        } else if (cell === '=') {
          this.drawWater(px, py);
          this.drawBridge(px, py);
        } else if (cell === 'L') {
          this.drawWater(px, py);
          this.drawLilypad(px, py);
        }
      }
    }

    // 1.4 Shade the padding so the designed board reads as an island
    this.drawBoardFrame(isLight);

    // 1.45 Draw the trail Mojo has actually walked this attempt
    this.drawTrail(isLight);

    // 1.5 Draw dynamic turtles
    if (this.turtles) {
      for (const t of this.turtles) {
        this.drawTurtle(t.animX * this.tileSize, t.animY * this.tileSize, t.animRotation, t.phase || 0);
      }
    }

    // 2. Draw Target Star/Chest
    this.drawStar(this.starTile.x * this.tileSize, this.starTile.y * this.tileSize);

    // 3. Draw Active Bananas
    for (const b of this.bananas) {
      if (!b.collected) {
        this.drawBanana(b.x * this.tileSize, b.y * this.tileSize);
      }
    }

    // 4. Draw Active Keys
    for (const k of this.keys) {
      if (!k.collected) {
        this.drawKey(k.x * this.tileSize, k.y * this.tileSize);
      }
    }

    // 5. Draw Player (Mojo)
    if (this.crashType === null) {
      this.drawPlayer();
    }

    // 6. Draw flying key if active
    if (this.flyingKey) {
      this.flyingKey.progress = Math.min(1, this.flyingKey.progress + 0.04);
      const kx = this.flyingKey.startX * this.tileSize + (this.flyingKey.targetX - this.flyingKey.startX) * this.flyingKey.progress * this.tileSize;
      const ky = this.flyingKey.startY * this.tileSize + (this.flyingKey.targetY - this.flyingKey.startY) * this.flyingKey.progress * this.tileSize;
      this.drawKey(kx, ky);
      if (this.flyingKey.progress >= 1) {
        this.flyingKey = null;
      }
    }

    // 7. Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravity
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Continuously spawn victory fanfare particles if active
    if (this.showVictoryFanfare && Math.random() < 0.25) {
      this.spawnVictoryParticles();
    }

    // 8. Draw Grid Coordinates HUD (Numbers along borders)
    this.drawCoordinatesHUD();

    // 9. Draw Ruler Tool Overlay
    if (this.rulerActive && this.hoveredCell) {
      this.drawRulerOverlay();
    }
  }

  // Padding cells exist only to frame a compact mission; a soft wash keeps
  // them from looking like ground the player forgot to use.
  drawBoardFrame(isLight) {
    if (!this.playArea) return;
    const { x, y, width, height } = this.playArea;
    if (width >= this.gridWidth && height >= this.gridHeight) return;

    const size = this.tileSize;
    this.ctx.save();
    this.ctx.fillStyle = isLight ? 'rgba(15, 60, 40, 0.10)' : 'rgba(0, 0, 0, 0.42)';
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.rect(x * size, y * size, width * size, height * size);
    this.ctx.fill('evenodd');

    this.ctx.strokeStyle = isLight ? 'rgba(5, 150, 105, 0.30)' : 'rgba(16, 185, 129, 0.28)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([6, 6]);
    this.ctx.strokeRect(x * size, y * size, width * size, height * size);
    this.ctx.restore();
  }

  // A fading ribbon of the route just executed. Seeing the actual path is the
  // fastest way to spot where an algorithm went wrong.
  drawTrail(isLight) {
    if (!this.trail || this.trail.length < 2) return;
    const size = this.tileSize;
    const half = size / 2;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (let i = 1; i < this.trail.length; i++) {
      const from = this.trail[i - 1];
      const to = this.trail[i];
      // Newer segments are brighter, so direction of travel is readable.
      const freshness = i / this.trail.length;
      this.ctx.strokeStyle = isLight
        ? `rgba(5, 150, 105, ${0.10 + freshness * 0.30})`
        : `rgba(52, 211, 153, ${0.10 + freshness * 0.35})`;
      this.ctx.lineWidth = 3 + freshness * 3;
      this.ctx.beginPath();
      this.ctx.moveTo(from.x * size + half, from.y * size + half);
      this.ctx.lineTo(to.x * size + half, to.y * size + half);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawCoordinatesHUD() {
    const isLight = document.body.classList.contains('light-theme');
    this.ctx.save();
    this.ctx.font = 'bold 9px monospace';
    this.ctx.fillStyle = isLight ? 'rgba(5, 150, 105, 0.45)' : 'rgba(16, 185, 129, 0.35)';

    // Draw column numbers (1 to 20) at top border
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    for (let x = 0; x < this.gridWidth; x++) {
      const px = x * this.tileSize + this.tileSize / 2;
      this.ctx.fillText(x + 1, px, 4);
    }

    // Draw row letters (A to L) at left border
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    const alphabet = 'ABCDEFGHIJKL';
    for (let y = 0; y < this.gridHeight; y++) {
      const py = y * this.tileSize + this.tileSize / 2;
      this.ctx.fillText(alphabet[y] || y, 4, py);
    }
    this.ctx.restore();
  }

  drawRock(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    const padding = 6;
    const size = this.tileSize - padding * 2;
    this.ctx.fillStyle = isLight ? '#94a3b8' : '#4b5563'; // Slate grey rock
    this.ctx.strokeStyle = isLight ? '#cbd5e1' : '#374151';
    this.ctx.lineWidth = 2;

    // Smooth rounded stone path
    this.ctx.beginPath();
    this.ctx.roundRect(x + padding, y + padding, size, size, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Rock detail highlights
    this.ctx.fillStyle = isLight ? '#cbd5e1' : '#6b7280';
    this.ctx.beginPath();
    this.ctx.arc(x + padding + 15, y + padding + 15, 6, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawWater(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    const padding = 2;
    const size = this.tileSize - padding * 2;
    // Cyan water block
    this.ctx.fillStyle = isLight ? '#bae6fd' : '#0f766e';
    this.ctx.fillRect(x + padding, y + padding, size, size);

    // Only animate water waves if level.id > 20
    const shouldAnimate = this.level && this.level.id > 20;
    const time = shouldAnimate ? performance.now() * 0.003 : 0;
    const waveOffset = Math.sin(time + x + y) * 2.5;

    // Draw wavy lines
    this.ctx.strokeStyle = isLight ? '#38bdf8' : '#14b8a6';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(x + 10 + waveOffset, y + 25);
    this.ctx.bezierCurveTo(x + 20 + waveOffset, y + 20, x + 30 + waveOffset, y + 30, x + 40 + waveOffset, y + 25);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(x + 20 - waveOffset, y + 45);
    this.ctx.bezierCurveTo(x + 30 - waveOffset, y + 40, x + 40 - waveOffset, y + 50, x + 50 - waveOffset, y + 45);
    this.ctx.stroke();
  }

  drawBridge(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    this.ctx.save();

    // Convert pixel coordinates to grid indexes
    const gridX = Math.round(x / this.tileSize);
    const gridY = Math.round(y / this.tileSize);

    // Check neighbors to determine direction
    let isVertical = false;
    const upCell = gridY > 0 ? this.gridData[gridY - 1][gridX] : '#';
    const downCell = gridY < this.gridHeight - 1 ? this.gridData[gridY + 1][gridX] : '#';
    const leftCell = gridX > 0 ? this.gridData[gridY][gridX - 1] : '#';
    const rightCell = gridX < this.gridWidth - 1 ? this.gridData[gridY][gridX + 1] : '#';

    // If there is water left and right, it's likely a vertical bridge spanning north-south
    if ((leftCell === '~' || leftCell === '#') && (rightCell === '~' || rightCell === '#') && upCell !== '~' && downCell !== '~') {
      isVertical = true;
    }

    const plankColor = isLight ? '#b45309' : '#78350f'; // Warm brown wood
    const darkWood = isLight ? '#78350f' : '#451a03';
    const ropeColor = isLight ? '#d97706' : '#92400e';

    if (isVertical) {
      // Draw handrail ropes on left and right
      this.ctx.strokeStyle = ropeColor;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 6, y);
      this.ctx.lineTo(x + 6, y + this.tileSize);
      this.ctx.moveTo(x + this.tileSize - 6, y);
      this.ctx.lineTo(x + this.tileSize - 6, y + this.tileSize);
      this.ctx.stroke();

      // Draw horizontal wooden planks
      this.ctx.fillStyle = plankColor;
      this.ctx.strokeStyle = darkWood;
      this.ctx.lineWidth = 1;

      const plankCount = 4;
      const plankHeight = (this.tileSize - 8) / plankCount;
      for (let i = 0; i < plankCount; i++) {
        const py = y + 4 + i * plankHeight;
        this.ctx.fillRect(x + 8, py + 1, this.tileSize - 16, plankHeight - 2);
        this.ctx.strokeRect(x + 8, py + 1, this.tileSize - 16, plankHeight - 2);
      }
    } else {
      // Horizontal bridge (default)
      // Draw handrail ropes on top and bottom
      this.ctx.strokeStyle = ropeColor;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + 6);
      this.ctx.lineTo(x + this.tileSize, y + 6);
      this.ctx.moveTo(x, y + this.tileSize - 6);
      this.ctx.lineTo(x + this.tileSize, y + this.tileSize - 6);
      this.ctx.stroke();

      // Draw vertical wooden planks
      this.ctx.fillStyle = plankColor;
      this.ctx.strokeStyle = darkWood;
      this.ctx.lineWidth = 1;

      const plankCount = 4;
      const plankWidth = (this.tileSize - 8) / plankCount;
      for (let i = 0; i < plankCount; i++) {
        const px = x + 4 + i * plankWidth;
        this.ctx.fillRect(px + 1, y + 8, plankWidth - 2, this.tileSize - 16);
        this.ctx.strokeRect(px + 1, y + 8, plankWidth - 2, this.tileSize - 16);
      }
    }
    this.ctx.restore();
  }

  drawTurtle(x, y, rotation = 0, phase = 0) {
    const center = this.tileSize / 2;
    const tx = x + center;
    const ty = y + center;

    // Check if emerged based on step count
    // If the level allows turtle control, they are always surfaced
    const isControllable = levelPilotsTurtles(this.level);
    const step = this.isRunning ? this.executionStepCount : 0;
    const isEmerged = isControllable ? true : ((step + phase) % 4 < 2);

    this.ctx.save();

    // Apply turtle transformations
    this.ctx.translate(tx, ty);

    if (!isEmerged) {
      this.ctx.globalAlpha = 0.3;
      this.ctx.scale(0.8, 0.8);
    }

    // Apply direction rotation
    this.ctx.rotate(rotation);

    // Move back to draw relative to 0,0
    this.ctx.translate(-tx, -ty);

    const time = performance.now() * 0.005;
    // Flippers paddling animation
    const paddleOffset = Math.sin(time) * 0.2;

    // Draw flippers
    this.ctx.fillStyle = '#10b981'; // Green flippers
    this.ctx.strokeStyle = '#047857';
    this.ctx.lineWidth = 1.5;

    // Front Left Flipper
    this.ctx.save();
    this.ctx.translate(tx - 12, ty - 12);
    this.ctx.rotate(-Math.PI / 4 + paddleOffset);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    // Front Right Flipper
    this.ctx.save();
    this.ctx.translate(tx + 12, ty - 12);
    this.ctx.rotate(Math.PI / 4 - paddleOffset);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    // Back Left Flipper
    this.ctx.save();
    this.ctx.translate(tx - 10, ty + 12);
    this.ctx.rotate(-Math.PI * 3 / 4 - paddleOffset * 0.5);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    // Back Right Flipper
    this.ctx.save();
    this.ctx.translate(tx + 10, ty + 12);
    this.ctx.rotate(Math.PI * 3 / 4 + paddleOffset * 0.5);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    // Draw Tail
    this.ctx.fillStyle = '#10b981';
    this.ctx.beginPath();
    this.ctx.moveTo(tx - 3, ty + 16);
    this.ctx.lineTo(tx, ty + 22);
    this.ctx.lineTo(tx + 3, ty + 16);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Draw Head
    const headWiggle = Math.sin(time * 0.5) * 1.5;
    this.ctx.save();
    this.ctx.translate(tx + headWiggle, ty - 18);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    // Eyes
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.arc(-2, -2, 1, 0, Math.PI * 2);
    this.ctx.arc(2, -2, 1, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Draw Shell (Carapace)
    this.ctx.fillStyle = '#047857'; // Dark green shell
    this.ctx.strokeStyle = '#064e3b';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(tx, ty, 15, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Shell details / Hex patterns
    this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    // Central hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = tx + Math.cos(angle) * 6;
      const hy = ty + Math.sin(angle) * 6;
      if (i === 0) this.ctx.moveTo(hx, hy);
      else this.ctx.lineTo(hx, hy);
    }
    this.ctx.closePath();
    this.ctx.stroke();

    // Radials from center hex to outer border
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      this.ctx.moveTo(tx + Math.cos(angle) * 6, ty + Math.sin(angle) * 6);
      this.ctx.lineTo(tx + Math.cos(angle) * 15, ty + Math.sin(angle) * 15);
    }
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawLilypad(x, y) {
    const center = this.tileSize / 2;
    const lx = x + center;
    const ly = y + center;

    this.ctx.save();
    this.ctx.fillStyle = '#10b981'; // vibrant green leaf
    this.ctx.strokeStyle = '#047857';
    this.ctx.lineWidth = 1.5;

    // Draw circle with a pie slice missing (typical lilypad shape)
    this.ctx.beginPath();
    this.ctx.arc(lx, ly, 18, 0.3, Math.PI * 2 - 0.3);
    this.ctx.lineTo(lx, ly);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Leaf veins
    this.ctx.strokeStyle = '#34d399';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(lx, ly);
    this.ctx.lineTo(lx + Math.cos(0.8) * 16, ly + Math.sin(0.8) * 16);
    this.ctx.moveTo(lx, ly);
    this.ctx.lineTo(lx + Math.cos(2.2) * 16, ly + Math.sin(2.2) * 16);
    this.ctx.moveTo(lx, ly);
    this.ctx.lineTo(lx + Math.cos(3.8) * 16, ly + Math.sin(3.8) * 16);
    this.ctx.moveTo(lx, ly);
    this.ctx.lineTo(lx + Math.cos(5.2) * 16, ly + Math.sin(5.2) * 16);
    this.ctx.stroke();

    // Draw a small pink flower on top of the leaf to make it look extra premium!
    this.ctx.fillStyle = '#f472b6'; // pink petal
    this.ctx.strokeStyle = '#db2777';
    const flowerX = lx + 4;
    const flowerY = ly - 4;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      this.ctx.beginPath();
      this.ctx.arc(flowerX + Math.cos(angle) * 4, flowerY + Math.sin(angle) * 4, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }
    this.ctx.fillStyle = '#fef08a'; // yellow center
    this.ctx.beginPath();
    this.ctx.arc(flowerX, flowerY, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawBanana(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    const center = this.tileSize / 2;
    const bx = x + center;
    const by = y + center;

    // Glowing aura effect
    const grad = this.ctx.createRadialGradient(bx, by, 4, bx, by, 22);
    grad.addColorStop(0, isLight ? 'rgba(234, 179, 8, 0.4)' : 'rgba(253, 224, 71, 0.45)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(bx, by, 24, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw the processed real banana illustration if loaded
    if (this.bananaImgProcessed) {
      this.ctx.save();
      // Center the banana inside the tile and scale down to 48x48
      const size = this.tileSize - 16;
      this.ctx.translate(bx, by);
      this.ctx.rotate(-Math.PI / 12); // subtle tilt for natural look
      this.ctx.drawImage(this.bananaImgProcessed, -size / 2, -size / 2, size, size);
      this.ctx.restore();
      return;
    }

    // Fallback: Draw realistic thick banana shape (vector code)
    this.ctx.save();
    // Center it on tile and rotate slightly for a natural look
    this.ctx.translate(bx, by);
    this.ctx.rotate(-Math.PI / 6);

    // Outer skin (Yellow)
    this.ctx.fillStyle = '#facc15'; // bright banana yellow
    this.ctx.strokeStyle = '#eab308'; // darker border
    this.ctx.lineWidth = 1.5;

    this.ctx.beginPath();
    // Start at stem base
    this.ctx.moveTo(-10, -7);
    // Outer curve to tip
    this.ctx.quadraticCurveTo(8, -12, 12, 6);
    // Tip edge
    this.ctx.lineTo(10, 8);
    // Inner curve back to stem base
    this.ctx.quadraticCurveTo(4, -4, -6, -4);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Volumetric 3D highlight (light yellow line inside body)
    this.ctx.strokeStyle = '#fef08a';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(-6, -5);
    this.ctx.quadraticCurveTo(4, -8, 8, 2);
    this.ctx.stroke();

    // Dark stem at base (Brown)
    this.ctx.fillStyle = '#78350f';
    this.ctx.beginPath();
    this.ctx.moveTo(-10, -7);
    this.ctx.lineTo(-14, -10);
    this.ctx.lineTo(-11, -12);
    this.ctx.lineTo(-6, -9);
    this.ctx.closePath();
    this.ctx.fill();

    // Dark tip at end (Brown)
    this.ctx.fillStyle = '#451a03';
    this.ctx.beginPath();
    this.ctx.moveTo(12, 6);
    this.ctx.lineTo(13.5, 9.5);
    this.ctx.lineTo(10, 8);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  makeTransparent(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        // Key out white/light gray background (R, G, B > 240)
        // Also handle the case where it might already be transparent
        if (a > 0 && r > 240 && g > 240 && b > 240) {
          data[i+3] = 0;
        } else if (a > 0 && r > 220 && g > 220 && b > 220) {
          // Softly feather alpha for smoother edges near light colors
          const maxVal = Math.max(r, g, b);
          const ratio = (maxVal - 220) / 20; // 0 to 1
          data[i+3] = Math.max(0, Math.min(255, Math.round((1 - ratio) * 255)));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn("Could not process image transparency (likely CORS):", e);
      return img;
    }
    return canvas;
  }

  drawStar(x, y) {
    const isLight = document.body.classList.contains('light-theme');
    const center = this.tileSize / 2;
    const sx = x + center;
    const sy = y + center;

    // Pulse effect
    const time = performance.now() * 0.005;
    const glowRadius = 18 + Math.sin(time) * 4;

    const grad = this.ctx.createRadialGradient(sx, sy, 3, sx, sy, glowRadius);
    grad.addColorStop(0, isLight ? 'rgba(234, 88, 12, 0.4)' : 'rgba(249, 115, 22, 0.5)'); // Orange gold glow
    grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(sx, sy, glowRadius + 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw Chest/Star symbol
    this.ctx.fillStyle = isLight ? '#ea580c' : '#f97316';
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    // Draw simple treasure chest
    const w = 24;
    const h = 20;
    this.ctx.roundRect(sx - w/2, sy - h/2, w, h, 3);
    this.ctx.fill();
    this.ctx.stroke();

    // Chest lock/metal strap
    this.ctx.fillStyle = '#eab308';
    this.ctx.fillRect(sx - 3, sy - 2, 6, 6);
    this.ctx.fillStyle = isLight ? '#fff' : '#1e293b';
    this.ctx.fillRect(sx - 1, sy + 1, 2, 2);
  }

  drawKey(x, y) {
    const center = this.tileSize / 2;
    const kx = x + center;
    const ky = y + center;

    // Glowing aura effect for key
    const grad = this.ctx.createRadialGradient(kx, ky, 2, kx, ky, 16);
    grad.addColorStop(0, 'rgba(245, 158, 11, 0.4)'); // Amber glow
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(kx, ky, 18, 0, Math.PI * 2);
    this.ctx.fill();

    // Key body (Gold)
    this.ctx.fillStyle = '#eab308';
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 1.5;

    // Key head ring
    this.ctx.beginPath();
    this.ctx.arc(kx - 6, ky, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Inner hole in ring (draw peach circle inside gold ring to create loop)
    this.ctx.fillStyle = document.body.classList.contains('light-theme') ? '#edf7f1' : '#112217';
    this.ctx.beginPath();
    this.ctx.arc(kx - 6, ky, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Key shaft
    this.ctx.fillStyle = '#eab308';
    this.ctx.fillRect(kx - 1, ky - 2, 12, 4);
    this.ctx.strokeRect(kx - 1, ky - 2, 12, 4);

    // Key teeth
    this.ctx.fillRect(kx + 7, ky + 1, 2, 3);
    this.ctx.fillRect(kx + 9, ky + 1, 2, 3);
  }

  drawGate(x, y, isUnlocked) {
    const padding = 4;
    const size = this.tileSize - padding * 2;
    const gx = x + padding;
    const gy = y + padding;

    // Base post / gate frame (Brown wood fence)
    this.ctx.fillStyle = isUnlocked ? 'rgba(120, 53, 15, 0.3)' : '#78350f';
    this.ctx.strokeStyle = isUnlocked ? 'rgba(67, 20, 7, 0.3)' : '#451a03';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.roundRect(gx, gy + 4, size, size - 8, 4);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw grid bars
    this.ctx.strokeStyle = isUnlocked ? 'rgba(255, 255, 255, 0.2)' : '#a16207';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(gx + 12, gy + 4);
    this.ctx.lineTo(gx + 12, gy + size - 4);
    this.ctx.moveTo(gx + size - 12, gy + 4);
    this.ctx.lineTo(gx + size - 12, gy + size - 4);
    this.ctx.moveTo(gx, gy + size / 2);
    this.ctx.lineTo(gx + size, gy + size / 2);
    this.ctx.stroke();

    // Padlock drawing
    const cx = x + this.tileSize / 2;
    const cy = y + this.tileSize / 2;

    if (isUnlocked) {
      // Draw small green indicator
      this.ctx.fillStyle = '#10b981';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Draw Lock body
      this.ctx.fillStyle = '#94a3b8'; // silver padlock
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.roundRect(cx - 6, cy - 2, 12, 10, 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Lock shackle (loop)
      this.ctx.beginPath();
      this.ctx.arc(cx, cy - 2, 4, Math.PI, 0);
      this.ctx.stroke();
    }
  }

  drawRulerOverlay() {
    const isLight = document.body.classList.contains('light-theme');
    const t = this.tileSize;
    const startX = this.player.x * t + t/2;
    const startY = this.player.y * t + t/2;
    const endX = this.hoveredCell.x * t + t/2;
    const endY = this.hoveredCell.y * t + t/2;

    // Highlight hovered cell
    this.ctx.fillStyle = isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.2)';
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(this.hoveredCell.x * t + 3, this.hoveredCell.y * t + 3, t - 6, t - 6, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Draw dotted line between player and target
    this.ctx.save();
    this.ctx.strokeStyle = '#10b981';
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([6, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.restore();

    // Calculate distances
    const diffX = Math.abs(this.hoveredCell.x - this.player.x);
    const diffY = Math.abs(this.hoveredCell.y - this.player.y);
    let distanceText = "";
    if (diffX === 0 || diffY === 0) {
      // Straight line distance
      distanceText = `${diffX + diffY} adım`;
    } else {
      // Manhattan grid distances
      distanceText = `↔ ${diffX}, ↕ ${diffY}`;
    }

    // Draw text badge at the center of the line
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    this.ctx.fillStyle = '#10b981';
    this.ctx.beginPath();
    this.ctx.roundRect(midX - 35, midY - 12, 70, 24, 6);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(distanceText, midX, midY);
  }

  drawPlayer(xOverride = null, yOverride = null, isDizzy = false) {
    const center = this.tileSize / 2;
    const px = xOverride !== null ? xOverride : (this.player.animX * this.tileSize + center);
    const py = yOverride !== null ? yOverride : (this.player.animY * this.tileSize + center);

    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.rotate(this.player.animRotation);

    const time = performance.now() * 0.005;

    // 1. Swaying Tail (using sine time if not dizzy)
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(-12, 5);
    const sway = isDizzy ? 0 : Math.sin(time * 2.5) * 5;
    this.ctx.bezierCurveTo(-25, 12 + sway, -22, -15 + sway, -30, -5 + sway);
    this.ctx.stroke();

    // 2. Ears
    this.ctx.fillStyle = '#b45309'; // Dark brown
    this.ctx.beginPath();
    this.ctx.arc(0, -16, 7, 0, Math.PI * 2); // Left ear
    this.ctx.arc(0, 16, 7, 0, Math.PI * 2); // Right ear
    this.ctx.fill();

    this.ctx.fillStyle = '#fed7aa'; // Peach inner ear
    this.ctx.beginPath();
    this.ctx.arc(0, -16, 4, 0, Math.PI * 2);
    this.ctx.arc(0, 16, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // 3. Body/Head
    this.ctx.fillStyle = '#d97706'; // Medium brown body
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
    this.ctx.fill();

    // 4. Face Mask (Face contour)
    this.ctx.fillStyle = '#fed7aa'; // Peach face
    this.ctx.beginPath();
    this.ctx.arc(4, -5, 7, 0, Math.PI * 2);
    this.ctx.arc(4, 5, 7, 0, Math.PI * 2);
    this.ctx.arc(8, 0, 7, 0, Math.PI * 2);
    this.ctx.fill();

    // 5. Eyes
    if (isDizzy) {
      // Draw cross dizzy eyes
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      // Left eye X
      this.ctx.beginPath();
      this.ctx.moveTo(5, -6); this.ctx.lineTo(9, -2);
      this.ctx.moveTo(9, -6); this.ctx.lineTo(5, -2);
      this.ctx.stroke();
      // Right eye X
      this.ctx.beginPath();
      this.ctx.moveTo(5, 2); this.ctx.lineTo(9, 6);
      this.ctx.moveTo(9, 2); this.ctx.lineTo(5, 6);
      this.ctx.stroke();
    } else {
      // Blinking eyes using time
      const isBlinking = Math.floor(time) % 5 === 0 && (time % 1 < 0.15);
      this.ctx.fillStyle = '#0f172a'; // Dark eyes
      if (isBlinking) {
        this.ctx.strokeStyle = '#0f172a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(5, -4); this.ctx.lineTo(9, -4);
        this.ctx.moveTo(5, 4); this.ctx.lineTo(9, 4);
        this.ctx.stroke();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(7, -4, 2, 0, Math.PI * 2);
        this.ctx.arc(7, 4, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 6. Snout / Smile / Dizzy Mouth
    this.ctx.strokeStyle = '#b45309';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    if (isDizzy) {
      // Dizzy wavy mouth
      this.ctx.moveTo(7, -2);
      this.ctx.quadraticCurveTo(8, 1, 9, -1);
      this.ctx.quadraticCurveTo(10, 1, 11, 0);
    } else {
      this.ctx.arc(10, 0, 2, 0, Math.PI);
    }
    this.ctx.stroke();

    this.ctx.restore();

    // 7. Spinning dizzy stars above head
    if (isDizzy) {
      this.ctx.save();
      const starsAngle = time * 7;
      this.ctx.translate(px, py - 18);
      this.ctx.rotate(starsAngle);
      this.ctx.fillStyle = '#facc15';
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const sx = Math.cos(angle) * 8;
        const sy = Math.sin(angle) * 4;
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }
}

// LEVEL GENERATOR UTILITIES

// ── Chapter model ───────────────────────────────────────────────────────────
// Five chapters of twenty missions. Handcrafted missions open each chapter and
// teach its mechanic; the remainder are generated against the same theme so a
// chapter never mixes lessons.
export const CHAPTER_SIZE = 20;
export const CHAPTER_COUNT = 5;
export const LEVEL_COUNT = CHAPTER_SIZE * CHAPTER_COUNT;

export const CHAPTERS = [
  {
    id: 1,
    name: 'Temel hareketler',
    eyebrow: 'BÖLÜM 1 · TEMEL HAREKETLER',
    summary: 'İlerle, dön, engelden kaçın ve ilk döngünü yaz.',
    teaches: ['ilerle', 'solaDon', 'sagaDon', 'tekrarla']
  },
  {
    id: 2,
    name: 'Döngü & köprü',
    eyebrow: 'BÖLÜM 2 · DÖNGÜLER & KÖPRÜLER',
    summary: 'Nehirleri köprüyle aş, tekrar eden kalıpları döngüye çevir.',
    teaches: ['adimla', 'tekrarla']
  },
  {
    id: 3,
    name: 'Anahtar & nilüfer',
    eyebrow: 'BÖLÜM 3 · ANAHTAR & NİLÜFER',
    summary: 'Kilitli kapıları anahtarla aç, batan yapraklarda tek şansın var.',
    teaches: ['anahtar', 'nilufer']
  },
  {
    id: 4,
    name: 'Zamanlama',
    eyebrow: 'BÖLÜM 4 · ZAMANLAMA',
    summary: 'Dalan kaplumbağaları say, bekle ve doğru anda geç.',
    teaches: ['bekle', 'kaplumbaga.adimla']
  },
  {
    id: 5,
    name: 'Koşullar & ustalık',
    eyebrow: 'BÖLÜM 5 · KOŞULLAR & USTALIK',
    summary: 'Kararlarını koda dönüştür: koşullar, koşullu döngüler ve aynı kodla farklı parkurlar.',
    teaches: ['ise', 'degilse', 'iken']
  }
];

export function getLevelGroup(id) {
  const chapter = Math.ceil(id / CHAPTER_SIZE);
  return Math.min(CHAPTER_COUNT, Math.max(1, chapter));
}

export function getChapter(id) {
  return CHAPTERS[getLevelGroup(id) - 1];
}

export const COMMAND_UNLOCKS = [
  { command: 'ilerle', from: 1, label: 'İlerleme' },
  { command: 'sagaDon', from: 3, label: 'Sağa dönüş' },
  { command: 'solaDon', from: 4, label: 'Sola dönüş' },
  { command: 'tekrarla', from: 6, label: 'Döngü' },
  { command: 'adimla', from: 29, label: 'Toplu adım' },
  { command: 'bekle', from: 61, label: 'Bekleme' },
  { command: 'ise', from: 81, label: 'Koşul' },
  { command: 'iken', from: 91, label: 'Koşullu döngü' }
];

// Turtle piloting is a per-mission mechanic rather than a permanent unlock:
// a mission either hands Mojo the helm (and the turtles stop diving on their
// own) or it is a timing puzzle. Mixing the two silently disabled the dive
// rhythm, so it is opt-in level data now.
export function commandsForLevel(id, level = null) {
  const commands = COMMAND_UNLOCKS
    .filter(unlock => id >= unlock.from)
    .map(unlock => unlock.command);
  if (level && level.pilotTurtles) commands.push('kaplumbaga.adimla');
  return commands;
}

export function levelPilotsTurtles(level) {
  return Boolean(level && level.pilotTurtles);
}

// Fill every chapter slot that no handcrafted mission claims. These boards are
// baked at build time by tools/generate-levels.mjs rather than generated on
// load, which used to cost seconds of blocking work before the first frame.
for (const level of GENERATED_LEVELS) {
  if (!LEVELS.some(existing => existing.id === level.id)) {
    LEVELS.push({ ...level, grid: [...level.grid] });
  }
}
LEVELS.sort((a, b) => a.id - b.id);

// Authored puzzle arcs replace old generated slots while keeping saved IDs.
for (const level of AUTHORED_LEVELS) {
  const index = LEVELS.findIndex(existing => existing.id === level.id);
  if (index >= 0) LEVELS[index] = level;
}

// Single normalization pass: a mission's command palette is always derived,
// never hand-maintained alongside the grid.
for (const level of LEVELS) {
  level.allowedCommands = commandsForLevel(level.id, level);
}
