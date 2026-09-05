# KodMaymunu v4 — Keşif Atlası

Mojo adında bir maymunu kod yazarak yönlendirdiğin, sıralı komutlardan döngülere ve
koşullara ve koşullu döngülere uzanan 100 görevlik bir web oyunu. Tarayıcıda çalışır,
sunucu gerektirmez. 54 görev kavram odaklı parkurlarla yenilendi; son bölümde 35 ek
harita, oyuncunun aynı programını farklı koşullarda sınar.

## Keşif sürümü

- **Atlas:** Beş adanın görevleri, yıldızları, muhafız mühürleri ve ustalık rozetleri.
- **30–40:** Tekrarlanan köprü/basamak motifleri; 32 ve 38'de negatif adımla
  iskelelerden geri çıkma. Uzunluk değil, tekrarın fark edilmesi ödüllendirilir.
- **49–60:** Yan yoldaki anahtar ve muzları toplama, gerçek kapı geçişleri,
  tek kullanımlık yapraklara basmadan önce hedefleri sıralama.
- **70–80:** Atlanamayan kaplumbağa geçişleri. Gelgit göstergesi bir sonraki
  hareketin güvenli olup olmadığını gösterir. Finalde anahtar ve zamanlama birleşir.
- **81–90:** Koşullar ve iç içe kararlar; aynı kod farklı kıyı ve sarmal haritalarda
  çalışır. `onumdeGuvenliYolVar()` hem mevcut hem bir sonraki zaman adımını kontrol eder.
- **91–100:** `iken(hedefteDegilim())` ile değişen uzunluklara uyarlanan algoritmalar.
  100. görevin dört parkuru arasında iç içe bir tapınak sarmalı da bulunur.
- **Yardım:** Üç kademeli ipucu, komut/sensör rehberi ve editörü değiştirmeden
  incelenebilen örnek çözüm. Örneğin editöre aktarılması ayrı bir eylemdir.
- **Ustalık:** Tamamlanan tüm parkurlar + üç yıldızlık satır hedefi + görevin
  kavramı (`loop`, `branch`, `while`) için ayrı rozet. Normal yıldız akışı korunur.

### Tasarım referansları

[CodeMonkey Coding Adventure](https://www.codemonkey.com/courses/coding-adventure/)
sıralama, döngü, koşul ve hata ayıklamayı kademeli öğretir.
[Lightbot'un eğitim yaklaşımı](https://lightbot.com/Lightbot_HowDoesLightbotTeachProgramming.pdf)
kısa program kısıtlarıyla tekrar eden parçaları fark ettirir.
[CodeCombat'ın değerlendirmeleri](https://blog.codecombat.com/assessments/)
birden fazla kavramın birlikte uygulanmasını sınar. Bu sürümün tasarım tercihi:
kompakt ama mekanikleri zorunlu parkurlar, kavramlara bağlı rozetler ve aynı
algoritmanın değişen haritalarda doğrulanmasıdır. Rakiplerin görsel varlıkları kullanılmaz.

## Dosya yapısı

| Dosya | Sorumluluk |
| --- | --- |
| `index.html` | Arayüz kabuğu ve tüm UI mantığı (tek satır içi modül) |
| `style.css` | Orman temalı görsel katman, açık/koyu tema, duyarlı yerleşim |
| `game.js` | Seviye verisi, güvenli yorumlayıcı, sanal makine, yol planlayıcı, çizim motoru |
| `authored-levels.js` | 54 tasarlanmış görevin pişirilmiş harita, çözüm, ipucu ve parkur verileri |
| `tools/author-missions.mjs` | Tasarlanmış görev aileleri ve çözüm üretimi (`npm run missions`) |
| `audio.js` | Web Audio API ile sentezlenen ses efektleri ve ortam sesi |
| `test/game.test.js` | Motorun ve müfredatın değişmezlerini doğrulayan test paketi (`npm test`) |
| `test/browser.test.mjs` | Gerçek Chromium ile masaüstü, mobil, final akışı ve kayıt geçişi testleri |

## Mimari kararlar

### Güvenlik
- `eval()` yok: `parseCode` komutları satır satır ayrıştırıp bir bayt kodu üretir,
  sanal makine (`Game#step`) bu bayt kodunu yürütür.
- DOM güncellemelerinde `innerHTML` kullanılmaz; zengin metin gerektiğinde
  `setSafeHTML` DOMParser ile ayrıştırıp script/olay özniteliklerini temizler.
- Kod uzunluğu (500 satır / 20.000 karakter), döngü sayısı (1-100) ve toplam
  işlem bütçesi (5000 adım) sınırlıdır; sonsuz döngü tarayıcıyı kilitlemez.

### Tek doğruluk kaynağı
Sürüm 3'ün ana ilkesi: aynı bilgi iki yerde tutulmaz.

- **Komut izinleri** yalnızca `COMMAND_UNLOCKS` tablosundan türetilir
  (`commandsForLevel`). Seviye verisi izin listesi taşımaz.
- **Yol planlama** tek bir planlayıcıdan geçer (`buildRouteWorld` +
  `planShortestRoute`); hem oyun içi "örnek çözüm" hem seviye üreticisinin
  çözülebilirlik kontrolü aynı kuralları görür.
- **Yıldız hedefleri** elle yazılmaz. Her görevin doğrulanmış bir referans
  çözümü vardır; 3 yıldız eşiği o çözümün satır sayısıdır, 2 yıldız eşiği
  üzerine pay eklenir. Böylece ulaşılamayan hedef oluşamaz.
- **Bölüm bilgileri** `CHAPTERS` tablosundan gelir; arayüz kendi kopyasını tutmaz.

### Puanlama
Puan, yazılan programın *etkin satır* sayısıdır (yorumlar ve kapanış parantezleri
sayılmaz). `encodeActions` bir hareket dizisini en az satıra kodlayan dinamik
programlama çözümüdür ve hem örnek çözümü hem hedefi üretir. Referans çözümden
daha kısa bir program yazmak "rekor" olarak kaydedilir.

## Müfredat

100 görev, 20'şerlik 5 bölüm. Açılış görevleri bölümün mekaniğini öğretir;
ileri görevler tasarlanmış bulmaca aileleriyle beceriyi geliştirir. Eski üretilmiş
verilerden yalnızca tasarlanmış bir görevin yerini almadığı slotlar kullanılır.

| Bölüm | Görevler | Konu | Açılan komut |
| --- | --- | --- | --- |
| 1 | 1-20 | İlerleme, dönüşler, su/kaya engelleri, ilk döngüler | `ilerle` (1), `sagaDon` (3), `solaDon` (4), `tekrarla` (6) |
| 2 | 21-40 | Köprüler, nehir geçişleri, kalıp döngüleri | `adimla(N)` (29) |
| 3 | 41-60 | Anahtar-kilit, batan nilüfer yaprakları | — |
| 4 | 61-80 | Dalan kaplumbağalar, zamanlama | `bekle` (61), `kaplumbaga.adimla` (69, göreve özel) |
| 5 | 81-100 | Koşullar, değişen parkurlar ve koşullu döngüler | `ise` / `degilse` (81), `iken` (91) |

## Karo alfabesi

| Karo | Anlamı |
| --- | --- |
| `M` | Mojo'nun başlangıç karesi |
| `S` | Hedef sandık |
| `B` | Muz (üzerinden geçince otomatik toplanır) |
| `#` | Kaya (geçilemez) |
| `~` | Su (üzerinde kaplumbağa yoksa geçilemez) |
| `=` | Köprü (su üzerinde güvenli geçiş) |
| `K` | Anahtar |
| `G` | Kilitli kapı (anahtar alınınca açılır) |
| `L` | Nilüfer yaprağı (bir kez basılır, sonra batar) |
| `T` | Kaplumbağa (2 adım suda, 2 adım havada; `pilotTurtles` görevlerinde dalmaz) |

## Test paketi

`npm test` müfredatın ve motorun değişmezlerini doğrular:

- Her görevin referans çözümü iki sözdizimi modunda da ayrıştırılır, izin
  denetiminden geçer, motorda çalıştırılır ve görevi kazanır.
- Tüm 100 görev gerçek yürütme döngüsünden (animasyon + zafer kontrolü + puanlama)
  geçirilir ve 3 yıldız alır.
- Yıldız hedefleri referans çözümle birebir uyumludur ve sıralıdır.
- Komut izinleri türetilmiştir ve seviye yükleme paylaşılan veriyi değiştirmez.
- Görev adları tekildir; tahtalar dikdörtgendir ve tek `M`/`S` içerir.
- Tahtanın çerçeve dolgusu hiçbir görevde yürünebilir alana açılmaz.
- Bir komut, onu öğreten görevden önceki görevlerde kullanılamaz.
- 35 ek parkurun her biri aynı referansla iki sözdiziminde de kazanılır.
- İlk harita için ezberlenen sabit rota ikinci haritada başarısız olur.
- İlerleme yapmayan `iken` döngüsü işlem bütçesiyle durdurulur.
- Güvenli yol sensörü kaplumbağanın dört zaman fazında doğrulanır.
- 70–80 arasındaki görevlerde kaplumbağa geçitleri atlanamaz.

Tarayıcı testleri için Playwright kurulu olmalıdır:

```sh
node test/browser.test.mjs
```

Başka bir kurulum kullanılıyorsa `PLAYWRIGHT_MODULE` değişkenini Playwright'ın
`index.mjs` dosyasına, `PLAYWRIGHT_BROWSERS_PATH` değişkenini tarayıcı önbelleğine
ayarla. Testler kendi izole tarayıcı profilinde yerel dosyaları sunar; canlı
oyuncu kaydını değiştirmez. Ekran görüntüleri `/tmp/codemonkey-*.png` altında oluşur.

## Kayıt uyumluluğu

Görev kimlikleri, eski açılma durumu ve yıldızlar korunur. Yenilenen görevlerin
taslak anahtarlarına `expedition-1` eki eklenir; önceki kodlar eski anahtarlarında
kalır. Yeni haritaların satır rekorları `kodmaymunu_best_lines_v4`, ustalıkları
`kodmaymunu_mastery_v4` altında tutulur. Böylece önceki haritanın iki satırlık
rekoru, yeni harita için yanıltıcı bir hedef olarak gösterilmez.
