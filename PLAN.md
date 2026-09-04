# KodMaymunu v3 — Eğitsel Algoritma Oyunu

Mojo adında bir maymunu kod yazarak yönlendirdiğin, sıralı komutlardan döngülere ve
koşullara uzanan 100 görevlik bir web oyunu. Tarayıcıda çalışır, sunucu gerektirmez.

## Dosya yapısı

| Dosya | Sorumluluk |
| --- | --- |
| `index.html` | Arayüz kabuğu ve tüm UI mantığı (tek satır içi modül) |
| `style.css` | Orman temalı görsel katman, açık/koyu tema, duyarlı yerleşim |
| `game.js` | Seviye verisi, güvenli yorumlayıcı, sanal makine, yol planlayıcı, çizim motoru |
| `audio.js` | Web Audio API ile sentezlenen ses efektleri ve ortam sesi |
| `test/game.test.js` | Motorun ve müfredatın değişmezlerini doğrulayan test paketi (`npm test`) |

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

100 görev, 20'şerlik 5 bölüm. Her bölümün başındaki görevler el yapımıdır ve
bölümün mekaniğini öğretir; kalan slotlar aynı temaya göre üretilir.

| Bölüm | Görevler | Konu | Açılan komut |
| --- | --- | --- | --- |
| 1 | 1-20 | İlerleme, dönüşler, su/kaya engelleri, ilk döngüler | `ilerle` (1), `sagaDon` (3), `solaDon` (4), `tekrarla` (6) |
| 2 | 21-40 | Köprüler, nehir geçişleri, kalıp döngüleri | `adimla(N)` (29) |
| 3 | 41-60 | Anahtar-kilit, batan nilüfer yaprakları | — |
| 4 | 61-80 | Dalan kaplumbağalar, zamanlama | `bekle` (61), `kaplumbaga.adimla` (69, göreve özel) |
| 5 | 81-100 | Koşullu komutlar ve tüm mekaniklerin birleşimi | `ise` / `degilse` (81) |

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
