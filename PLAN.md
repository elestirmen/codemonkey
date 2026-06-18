# KodMaymunu - Eğitsel Algoritma Oyunu Tasarım ve Uygulama Planı

Bu plan, kullanıcıların adım adım kod yazarak algoritma mantığını, döngüleri ve sıralı komutları öğrenmelerini sağlayacak **KodMaymunu** (CodeMonkey benzeri) bir web oyununun tasarlanmasını ve sisteme entegre edilmesini kapsamaktadır.

## Plan Detayları

### 1. Dosya Yapısı
- `/opt/oyunlar/codemonkey/index.html` - Oyun ekranı ve kullanıcı arayüzü.
- `/opt/oyunlar/codemonkey/style.css` - Orman temalı lüks ve dinamik tasarım kodları.
- `/opt/oyunlar/codemonkey/game.js` - Oyun motoru, seviyeler (10 adet) ve güvenli kod yorumlayıcısı (interpreter).
- `/opt/oyunlar/codemonkey/audio.js` - Web Audio API ile sentezlenen dinamik oyun sesleri.
- `/opt/oyunlar/portal/covers/codemonkey.png` - Portal için yapay zeka ile üretilecek kapak görseli.

### 2. Güvenlik ve Mimari
- **XSS Engelleme:** DOM güncellemelerinde kesinlikle `innerHTML` kullanılmayacaktır. Tüm değerler `textContent` ve güvenli DOM yöntemleriyle oluşturulacaktır.
- **Güvenli Kod Yorumlayıcı:** JavaScript `eval()` kullanımı yerine `ilerle()`, `solaDon()`, `sagaDon()`, `muzAl()` ve `tekrarla(N) { ... }` sözdizimini satır satır ayrıştırıp komut sırasına koyan özel bir yorumlayıcı yazılacaktır.
- **Docker Entegrasyonu:** `docker-compose.yml` dosyasına `codemonkey` static nginx servisi eklenecek ve iç port 80 üzerinden `npm-net` ağına dahil edilecektir.

### 3. Seviye Tasarımları (10 Seviye)
- Seviye 1-3: Sıralı komutlar (İlerleme, dönme ve muz alma temelleri).
- Seviye 4-6: Engelli yollar ve basit döngülerin (`tekrarla`) kullanımı.
- Seviye 7-10: Çoklu muzlar, labirentler ve döngülerle optimize edilmiş algoritma kurma zorlukları.
