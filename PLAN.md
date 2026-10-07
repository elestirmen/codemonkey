# KodMaymunu v5 — Algoritma Adası

Mojo adında bir maymunu Türkçe komutlarla programlayıp bütün muzları toplatarak
sandığa ulaştırdığın, 5 ada ve 60 görevlik bir tarayıcı oyunu. Sunucu gerektirmez;
statik dosyalar olarak çalışır.

## v5'te ne değişti (neden)

| Sorun (v4) | v5 çözümü |
| --- | --- |
| `ilerle()` ve `adimla(N)` aynı işi yapıyordu. | **Tek hareket komutu:** `ilerle(n)`; sayı verilmezse 1 kare. `adimla` yazan oyuncuya `ilerle(n)` önerilir. |
| Haritalar koridordu; harita tek bir programı dayatıyordu. | **Açık adalar:** muzları istediğin sırayla toplarsın, birden çok rota vardır. Yıldızlar rotayı değil kodun kısalığını ölçer. Koşul adalarında aynı kod 2–3 farklı haritada (gelgit/parkur) çalışmak zorundadır; ezber rota işe yaramaz. |
| Oyun ekranın küçük bir bölümündeydi. | **Geniş sahne:** sahne ekranın ~%70'i, tam yükseklik; kod paneli sağda. Telefonda sahne yüksekliği haritanın oranına göre ayarlanır. |
| Zamanlamalı kaplumbağa, batan yaprak gibi gizli durum taşıyan mekanikler. | Kaldırıldı. Kurallar görünür ve deterministik: çimen/kum, ağaç/kaya, su, köprü, muz, anahtar, kapı, sandık. |

## Tasarım ilkeleri

- **Tek kural seti, tek ölçü.** Hedef her görevde aynı: bütün muzlar + sandık.
  Mojo sandığa bütün muzlarla vardığı anda görev biter. Puan = etkin satır sayısı
  (komutlar, blok başlıkları, `degilse`; yorum, boş satır ve `}` sayılmaz).
  ★ çalışan çözüm, ★★ ve ★★★ satır hedefleri. ★★★ hedefi doğrulanmış örnek
  çözümün uzunluğudur; çözücü daha kısa bir program bulduysa bu `record` olarak
  "usta meydan okuması" diye gösterilir.
- **Her ada tek bir düşünme biçimi öğretir**; yapı, öğretildiği görevde açılır ve
  komut paletinde "YENİ" olarak belirir. İlk görevde kısa bir ders penceresi çıkar.
- **Kavram, bulmacanın şekliyle zorunlu kılınır** (çözücüyle doğrulanır):
  - Döngü adasında döngüsüz programlar 3★'a inemez (merdiven, elmas, pervane…).
  - Fonksiyon adasında tekrarlar *düzensiz aralıklarla* gelir; döngü kısaltamaz.
  - Çok parkurlu görevlerde hiçbir sabit (koşulsuz) program bütün parkurları
    kazanamaz: çözücü 3★ hedefine kadar (uzun çözümlerde 9 satıra kadar) arar.
  - Koşullu döngü / değişken görevlerinde uzunluklar parkurdan parkura değişir
    (duvara kadar yürü, say ve dön, kareyi ölç, zirve sarmalı).
- **Hata avları:** her adada 1–2 görev bozuk bir kodla açılır; oyuncu çalıştırır,
  Mojo'nun hangi satırda takıldığını görür ve düzeltir.
- **Mojo birinci ağızdan konuşur** ve hatayı satır numarasıyla söyler; sorular
  (`onumBos()` vb.) haritada yeşil ✓ / kırmızı ✗ kareyle görünür; döngüler
  editörde "tur 2/4" rozeti, değişkenler editörün altında değerleriyle görünür.

### Araştırma dayanakları

- CodeMonkey: `step N` + cetvel, kısa koda yıldız.
- CodeCombat: tek komut, isteğe bağlı sayı (`moveRight(3)`).
- Blockly Games / Code.org: blok sınırı, labirentte "duvarı izle" finali.
- Lightbot: tekrar eden parçayı fonksiyona alma.
- Reeborg / Karel: aynı programın birden çok dünyada çalışması.
- Swift Playgrounds: adım adım çalıştırma, hata avı bulmacaları.
- Human Resource Machine: kod kısalığı ile yol kısalığı ayrımı (zafer ekranında adım sayısı).
- Pelánek & Effenberger (2022): sınır yerine genellenebilirlik istemek pedagojik açıdan
  tercih edilebilir.
- Lee & Ko (2011, Gidget): hatayı üstlenen karakter oyuncuyu daha uzun tutar.

## Dil

| Yazım | Anlamı |
| --- | --- |
| `ilerle()` / `ilerle(3)` | Baktığı yönde 1 / 3 kare ilerler |
| `sagaDon()` / `solaDon()` | Olduğu yerde 90° döner |
| `tekrarla(4):` | İçindekileri 4 kez yapar |
| `tanimla ad():` … `ad()` | Fonksiyon tanımlar ve çağırır (tanımdan önce de çağrılabilir) |
| `ise(soru):` / `degilse:` | Koşul |
| `iken(soru):` | Cevap evet oldukça tekrarlar |
| `n = 1`, `n = n + 1` | Değişken; `+ - *` ve parantez |
| `onumBos()`, `solumBos()`, `sagimBos()`, `hedefteDegilim()` | Sorular |

Bloklar Python gibi `:` ve 4 boşlukla ya da JavaScript gibi `{ }` ile yazılır
(ayarlardan seçilir; iki biçim aynı puanı verir). `sağaDön()` gibi Türkçe harfli
yazım da anlaşılır. Kod `eval` edilmez: metin → sözdizimi ağacı → üreteç tabanlı
yorumlayıcı. İşlem bütçesi (4000), çağrı derinliği (30) ve sayı sınırları sonsuz
döngüyü güvenle durdurur.

## Müfredat

| Ada | Görevler | Konu | Açılan yapı |
| --- | --- | --- | --- |
| 1 Filiz Ormanı | 1–12 | Sıralama, parametre, dönüşler, rota seçimi, anahtar/kapı, kısa kod ≠ kısa yol | — |
| 2 Kemer Takımadaları | 13–24 | Kalıp bulma, döngü, ardışık ve iç içe döngü | `tekrarla` (13) |
| 3 Nilüfer Tapınağı | 25–36 | Fonksiyon, her yönde aynı fonksiyon, fonksiyon + döngü, iki fonksiyon | `tanimla` (25) |
| 4 Gelgit Kıyıları | 37–48 | Koşul, iç içe koşul, fonksiyon içinde koşul, kıyı izleme; her görev 2–3 gelgit | `ise/degilse` (37) |
| 5 Bilgelik Zirvesi | 49–60 | `iken`, iç içe `iken`, sonsuz döngü, sağ el kuralı, değişkenle sarmal/merdiven, sayma ve ölçme | `iken` (49), değişken (54) |

## Dosya yapısı

| Dosya | Sorumluluk |
| --- | --- |
| `index.html` | Arayüz iskeleti (geniş ekran yerleşimi, pencereler) |
| `style.css` | Tema (koyu/açık), yerleşim, editör ve sözdizimi renkleri |
| `ui.js` | Arayüz mantığı: editör, palet, çalıştırma/adım/geri, ada haritası, ipuçları, kayıt |
| `game.js` | Oyun denetleyicisi: olayları canlandırır, sesi ve çizimi tetikler |
| `lang.js` | Ayrıştırıcı, satır sayacı, biçimlendirici, yazım biçimi dönüştürücü |
| `interpreter.js` | Üreteç tabanlı yorumlayıcı (her görünür olayda durur) |
| `world.js` | Harita ve oyun kuralları (deterministik) |
| `renderer.js` | Ada temalı çizim; soruların ✓/✗ işaretleri, efektler, cetvel |
| `audio.js` | Web Audio ile ses efektleri ve ada ortam sesleri |
| `levels.js`, `levels/island*.js` | Adalar ve 60 görevin verisi |
| `tools/solver.mjs` | En kısa programı arayan çözücü; çoklu parkur için sabit program araması |
| `tools/check-levels.mjs` | Görev denetimi (`npm run check`) |
| `tools/design/` | Görev tasarım yardımcıları (iz sürme, oda/labirent/teras/sarmal üreticileri) |
| `test/game.test.js` | Dil, kurallar ve müfredat değişmezleri (`npm test`) |
| `test/browser.test.mjs` | Gerçek Chromium'da 60 görevin arayüzden oynanması (`npm run test:browser`) |

### Harita alfabesi

`.` çimen/kum · `#` ağaç/kaya · `~` su · `=` köprü · `M` Mojo · `S` sandık ·
`B` muz · `K` anahtar · `G` kapı. Haritanın dışı denizdir.

### Görev verisi

```js
{
  title, concept, text, hints: [3 ipucu],
  map: [...] | scenarios: [{ map: [...] }, ...], dir: 'E',
  solution: 'girintili örnek çözüm',   // 3★ = satır sayısı
  stars: { two },                      // isteğe bağlı
  teaches: 'loop' | 'function' | 'if' | 'while' | 'variable',
  starter: 'hatalı başlangıç kodu',     // hata avı görevleri
  record: 5                             // çözücünün bulduğu daha kısa program
}
```

## Doğrulama

- `npm test` — 24 test: dil, hata mesajları, kurallar, 60 görevin örnek çözümü
  iki yazım biçiminde bütün parkurlarda, hata avı başlangıç kodlarının gerçekten
  hatalı olması, yapıların öğretilmeden kullanılmaması, oyun denetleyicisi ve
  adım adım geri alma.
- `npm run check` — çözücüyle: döngü adasında döngüsüz 3★ olmadığını, kayıtlı
  rekorların doğru olduğunu ve çok parkurlu görevlerde ezber bir programın
  yetmediğini denetler (birkaç dakika sürebilir; `--fast` yalnızca örnek
  çözümleri çalıştırır).
- `npm run test:browser` — puppeteer ile masaüstü, telefon ve 60 görev.

## Kayıt

Yeni anahtarlar `km5_*` (ilerleme, taslaklar, ayarlar). v4 kayıtlarına dokunulmaz;
v4'te ilerlemiş bir oyuncu, ulaştığı bölümün adasından başlar.
