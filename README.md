# Alperenler Hafriyat – Yerel Taslak (Aşama 1)

Astro + TypeScript + sade CSS ile hazırlanmış statik site. React, veritabanı, yönetim paneli, üyelik ve e-ticaret yoktur. Tek etkileşim, vanilla TypeScript ile yazılmış mobil menüdür.

> Bu sürüm **yerel taslaktır**: tüm sayfalarda `noindex, nofollow` vardır, `canonical`/`og:url`/sitemap üretilmez.

## Gereksinimler

- Node.js **>= 22.12.0** (Astro 7.3.8'in `engines` alanı; geliştirme ortamı: Node v24.13.0, npm 11.6.2)
- Bağımlılıklar sabit sürümdür: `astro 7.3.8`, `@astrojs/check 0.9.10`, `typescript 6.0.3`, `@types/node 24.19.2`, `@fontsource-variable/archivo 5.3.0` (başlık), `@fontsource-variable/inter 5.3.0` (gövde)
- Fontlar kendi sunucumuzdan verilir (dış istek yok); `global.css` içinde yalnızca latin + latin-ext alt kümeleri tanımlıdır (Türkçe karakterler latin-ext'tedir).
  (`@astrojs/check` TypeScript için `^5 || ^6` ister; bu yüzden TypeScript 7 değil 6.0.3 seçildi.)

## Kurulum ve çalıştırma

```powershell
npm install
npm run check     # astro check (tip ve şablon denetimi)
npm run build     # dist/ klasörüne statik çıktı
npm run dev       # http://localhost:4321
npm run preview   # build çıktısını yerelde önizler
```

## Firma bilgilerini değiştirme

Tüm firma/iletişim bilgisi tek dosyada: [src/data/site.ts](src/data/site.ts)

- `name`, `legalName`, `phone`, `address`: görünen bilgiler. Adres harita bağlantısı otomatik üretilir.
- `whatsappNumber`: doğrulandı (`"905392527058"`, wa.me biçimi). `null` yapılırsa WhatsApp butonları hiçbir yerde görünmez. Butonlar hero'da, mobil çubukta, iletişim sayfasında, birleşik iletişim kartında, hizmet detay kartında ve footer'da çıkar. Hazır mesaj `site.ts` içinde (`whatsappDefaultMessage`, hizmetlerde `whatsappServiceMessage`).
- `publish.indexable`: yayına çıkarken `true` yapılır.
- Menü öğeleri: [src/data/nav.ts](src/data/nav.ts). "Hizmetler" yalnızca görünür hizmet varsa eklenir.

### Hizmetler ve taslak durumu

Hizmetler [src/data/services.ts](src/data/services.ts) içindedir. Şu an 8 hizmet **taslak** olarak (`onaylandi: false`) tanımlıdır.

- `onaylandi: true` → menü, ana sayfa, `/hizmetler/` ve `/hizmetler/<slug>/` sayfalarında görünür.
- `onaylandi: false` → yalnızca `npm run dev` sırasında görünür, kartta "TASLAK" rozeti olur. `npm run build` çıktısında ne kart, ne menü öğesi, ne de sayfa üretilir.
- Firma bir hizmeti doğruladığında yalnızca o hizmetin `onaylandi` değerini `true` yapın; metni de gözden geçirin. Hiç onaylı hizmet yoksa `/hizmetler/` sayfası da üretilmez.
- Taslak metinlerde deneyim, makine sayısı, süre, fiyat, garanti veya "en iyi/lider" ifadesi bilerek yoktur; eklenmemelidir.
- `keywords` alanı yalnızca veri olarak durur; sayfada görünür liste olarak basılmaz ve meta keywords eklenmez.

Alan adı: [astro.config.mjs](astro.config.mjs) içindeki `site` alanı. Tanımlanınca `canonical` ve `og:url` üretilir.

## Görseller (public/images/)

Dosya yoksa ilgili alan hiç render edilmez; kırık görsel ikonu veya boş kutu çıkmaz. Dosya eklenince sayfayı yenilemek yeterlidir (dev sunucusunda), yayın için yeniden `npm run build` gerekir.

| Dosya | Kullanıldığı yer | Yoksa |
|---|---|---|
| `public/videos/hero-1080.webm`, `hero-1080.mp4` | Açılış videosu, masaüstü (≥ 768 px) | Video hiç basılmaz |
| `public/videos/hero-720.webm`, `hero-720.mp4` | Açılış videosu, mobil | Eldeki diğer boyut kullanılır; hiçbiri yoksa video yok |
| `public/images/hero-poster.jpg` | Videonun **ilk karesi, birebir aynı** (videonun altında hep görünür; hareket azaltma / Save-Data / yükleme anında tek görünen şey) | `hero.jpg` varsa o, yoksa koyu degrade + sade desen |
| `public/images/hero.jpg` | Video yokken kullanılacak açılış fotoğrafı (yatay, en az ~1920 px; üstüne koyu katman biner) | Koyu degrade + sade desen |
| `public/images/hakkimizda.jpg` | "Biz Kimiz" bölümünde sol görsel (4:3 önerilir) | Bölüm tek sütun metin |
| `services.ts` → `image` | Hizmet kartı görseli, örn. `"/images/hizmet-kazi.jpg"` (16:10 önerilir) | Kart görselsiz |
| `gallery.ts` → `src`, `poster` | Galeri görselleri, örn. `"/images/galeri/saha-01.jpg"`; videolar için `"/videos/saha-01.mp4"` ve kapak `poster` | Öğe atlanır; hiç öğe yoksa bölüm gizlenir |

Açılış videosu önerileri:
- **Her dosya 5 MB altında olmalı.** 1080 sürümü 1920×1080, 720 sürümü 1280×720; yatay, 8–20 saniye, 24–30 fps.
- Sessiz çekim veya sesi silinmiş dosya. Sayfada ses hiç çalınmaz, kontrol çubuğu yoktur.
- webm: VP9 (veya AV1); mp4: H.264, `faststart` (moov atom başta). Her boyut için ikisini de hazırlamak tüm tarayıcıları karşılar.
- Klibin son karesi ilk karesine yakınsa döngü fark edilmez (iki video üst üste biner, yine de yardımcı olur).
- Poster, videonun **ilk karesinin** birebir aynısı olmalı (~200 KB altı, JPG); aksi halde video belirirken görüntü sıçrar.

Açılış videosu davranışı:
- Video JavaScript ile yüklenir; yeterince tamponlanınca poster üzerine 400 ms'de yumuşakça gelir. Takılırsa poster'a geri döner.
- Kesintisiz döngü için iki video kullanılır, biri bitmeden ~0,7 sn önce diğeri başlar ve crossfade yapılır. Klip çok kısaysa veya bir hata olursa tek video + native `loop`.
- Video yüklenmez, yalnızca poster görünür: işletim sistemi "hareketi azalt" açıkken, tarayıcıda Veri Tasarrufu (Save-Data) açıkken.
- Ekran dışına kaydırınca veya sekme gizlenince durur, dönünce devam eder. `play()` reddedilirse (örn. iOS düşük güç modu) sessizce poster kalır.
- Sağ alt köşedeki "Durdur / Oynat" düğmesi tercihi `localStorage`'a kaydeder (erişilemezse yok sayılır).
- JavaScript kapalıyken `<noscript>` içindeki tek video + native `loop` oynar.
- Video yalnızca açılış alanında otomatik oynar. Galeri videoları `preload="none"` + poster + tıklayınca oynatma kuralındadır.

Notlar:
- Yollar `/` ile başlar ve `public/` klasörüne göredir. Dosya adlarında Türkçe karakter ve boşluk kullanmayın.
- Videolar otomatik yüklenmez (`preload="none"`); ziyaretçi oynat tuşuna basınca iner. Dosyaları küçük tutun.
- `stats.ts` (rakam şeridi), `gallery.ts` ve `services.ts` boşken ilgili bölümler ana sayfada görünmez. Rakamlar yalnızca firma tarafından doğrulandıktan sonra eklenmelidir.
- `site.ts` içindeki `email` alanı tanımlanmadıkça e-posta hiçbir yerde görünmez.

## Teklif sihirbazı

[QuoteWizard.astro](src/components/QuoteWizard.astro) + [quote-wizard.js](src/scripts/quote-wizard.js). Ana sayfadaki "Fiyatı ne belirler?" bölümünde ve `/teklif/` sayfasında (menüde "Teklif Al") bulunur.

- 3 adım: iş türü (görünür hizmetler; hiç yoksa serbest metin), işin yeri (serbest metin, hazır bölge listesi yok), ayrıntı + zaman (isteğe bağlı).
- Sonuçta Türkçe bir mesaj kurulur; "WhatsApp'tan gönder" (`wa.me/...?text=`) ve "Hemen Ara" sunulur. `whatsappNumber` `null` ise yalnızca Ara kalır.
- Hiçbir veri saklanmaz, sunucuya gönderilmez, `localStorage` kullanılmaz.
- JavaScript kapalıyken yerine sade "Hemen Ara / WhatsApp" kutusu görünür.

## Sık sorulan sorular

[src/data/faq.ts](src/data/faq.ts): her soruda `onaylandi`. `false` olanlar yalnızca `npm run dev`'de "TASLAK" rozetiyle görünür; yayın çıktısında ve FAQPage JSON-LD'de yer almaz. Cevaplar firma tarafından okunup onaylanmalı, sonra `onaylandi: true` yapılmalıdır.

## Harita

[MapBand.astro](src/components/MapBand.astro) tam genişlik (full-bleed) harita şeridi + üstünde yüzen iletişim kartıdır (masaüstü ~440 px, tablet ~380 px, mobilde ~260 px; mobilde kart haritanın altında). Footer'da (CTA şeridinin altında) ve iletişim sayfasında (orada footer haritası gizli) kullanılır. Harita alanı [MapCard.astro](src/components/MapCard.astro). Haritanın ve iğnenin görünen merkezi, kartın sağında kalan alanın ortasına denk gelir. **Harita, kart görünür alana yaklaşınca (yaklaşık 300 px önce) Google'dan otomatik yüklenir**; HTML'de iframe yoktur, sayfa açılırken Google'a istek gitmez. Yüklenene kadar tasarım kartı bekleme ekranı olarak kalır (iğne nabzı sürer), iframe `load` olunca kart yumuşakça kaybolur. Sağ altta "Yol tarifi al" düğmesi sabittir. Mantık [map-card.js](src/scripts/map-card.js) içindedir.

- 8 saniye içinde yüklenmezse veya hata olursa kart kalır ve "Google Maps'te aç" bağlantısı görünür. JavaScript yoksa da kart + bu bağlantı görünür.
- Tarayıcıda Veri Tasarrufu (Save-Data) açıksa otomatik yükleme yapılmaz; "Haritayı göster" düğmesi çıkar ve harita tıklanınca yüklenir.
- Sayfa geçişlerinde gözlemci ve zamanlayıcılar temizlenir; çift iframe oluşmaz.
- İletişim sayfasında footer şeridi gizlenir (aynı sayfada iki harita olmasın).

- **Harita adres aramasıyla çalışır** (`https://www.google.com/maps?q=<adres>&output=embed`); koordinat kullanılmaz. Google adresi bulamazsa veya yanlış yere işaret ederse bu görünür: **yayından önce iğnenin doğru yeri gösterdiğini gözle doğrulayın.** Kartın ortasındaki sarı iğne yalnızca dekoratiftir, gerçek konum değildir.
- Firmanın Google İşletme Profili bağlantısı gelince [site.ts](src/data/site.ts) içindeki `mapsPlaceUrl` alanına yazın; "Google Maps'te aç" ve "Yol tarifi al" bağlantıları (ve diğer harita bağlantıları) onu kullanır. (Gömülü harita yine adres aramasıyla çalışır.)
- Koyu tema için iframe'e CSS filtresi uygulanır: `global.css` içindeki `--map-filter`. Beğenilmezse `--map-filter: none;` yapın.

### Koordinat (sonra gelecek)

[site.ts](src/data/site.ts) içinde `mapCoords: null`. Doğrulanmış enlem/boylam girilirse (`{ lat, lng }`):
- gömülü harita `maps?ll=<lat>,<lng>&z=16&output=embed` ile açılır (`q` yoktur, Google kendi iğnesini koymaz) ve kendi sarı iğnemiz haritanın tam ortasına konur (ucu merkezde);
- "Yol tarifi al" ve "Google Maps'te aç" koordinatı kullanır;
- JSON-LD'ye `geo` eklenir (yalnızca bu durumda).
Koordinat doğrulanmadan doldurulmamalıdır.

## Footer, yüzen düğmeler, gizlilik sayfası

- Footer sırası: (ana sayfa dışında) "Projeniz için teklif alın" şeridi → tam genişlik harita + yüzen iletişim kartı (iletişim sayfasında harita sayfanın kendi içindedir) → logo + tanıtım / Sayfalar / Hizmetler → telif + "Gizlilik ve Çerezler" → dev soluk kontur "ALPERENLER" (mobilde gizli). Ana sayfada CTA şeridi gizlidir (birleşik iletişim bölümü zaten var).
- Masaüstünde (48em üstü) sağ altta yeşil WhatsApp düğmesi (hero görünürken gizli) ve "yukarı çık" düğmesi (sayfa yarıdan sonra). `whatsappNumber` `null` ise WhatsApp düğmesi basılmaz.
- Header'da 64em üstünde "Bizi arayın / telefon" iki satırı vardır.
- `/gizlilik/` sayfası **taslaktır** ve `noindex` kalır (site `indexable: true` olsa bile). Sayfada yalnızca sitenin gerçekte yaptıkları anlatılır; dev'de üstte "Hukuki metin taslağı – firma/uzman onaylamalı" uyarısı çıkar.

### Yayın öncesi kontrol: gizlilik sayfası
Sayfadaki `[firma tarafından doldurulacak]` yer tutucuları yayından önce doldurulmalı veya kaldırılmalıdır: barındırma sağlayıcısı, ticari unvan, vergi no, KVKK veri sorumlusu, son güncelleme tarihi. Metin firma/hukuk uzmanı tarafından onaylanmalıdır.

## Logo, favicon, paylaşım görseli

- [LogoMark.astro](src/components/LogoMark.astro) **geçici** bir işarettir (iç içe üç eş yükselti çizgisinden tepe / "A"). Firma logosu gelince değiştirilecek; header, footer ve `public/favicon.svg` aynı işareti kullanır.
- `apple-touch-icon.png` (180×180) üretilmedi. Gerekirse `public/favicon.svg` dosyasını herhangi bir araçla (ör. Inkscape, Squoosh, tarayıcıda SVG'yi PNG'ye dışa aktarma) 180×180 PNG'ye çevirip `public/apple-touch-icon.png` olarak kaydedin; dosya varsa `<link rel="apple-touch-icon">` kendiliğinden eklenir.
- **`public/og-image.png` bekleniyor** (1200×630 PNG). Dosya varsa **ve** `astro.config.mjs` içinde `site` tanımlıysa `og:image` etiketleri basılır (mutlak adres gerektiği için); aksi halde basılmaz.

## Yapısal veri (JSON-LD) ve sayfa geçişleri

- Hepsi [src/utils/schema.ts](src/utils/schema.ts) içinde üretilir. Ana sayfa ve iletişim: `GeneralContractor` (ad, unvan, telefon, adres). Onaylı hizmet detaylarında `Service`, onaylı SSS varsa `FAQPage`. `url` yalnızca `site` (alan adı) tanımlıysa, `sameAs` yalnızca `site.ts`'de `sameAs` doluysa eklenir. `geo`, `openingHours`, `priceRange`, `aggregateRating`, `review` bilerek yoktur.
- Sayfa geçişleri Astro `ClientRouter` ile yapılır; header sabit kalır (`transition:persist`). Sayfaya bağlı betikler (reveal, hero video, sihirbaz) [page-init.js](src/scripts/page-init.js) içinde her sayfa yüklenişinde yeniden başlatılır. Hareket azaltma açıkken geçiş animasyonu yoktur.

## Henüz doğrulanmamış / eksik içerik

- Hizmet listesi ve hizmet bölgeleri
- E-posta, çalışma saatleri, deneyim yılı, makine sayısı
- Logo (şimdilik geçici tipografik "ALPERENLER / HAFRİYAT"; nihai logo değildir)
- Gerçek fotoğraflar (açılış alanındaki SVG yalnızca dekoratiftir, gerçek proje/makine değildir)
- Alan adı
- Hizmetlerin firma tarafından onaylanması (8 taslak hizmet `onaylandi: false`)

## Yayın öncesi SEO ve kontrol listesi

- [ ] `astro.config.mjs` içinde `site` alanını gerçek alan adıyla doldur
- [ ] `src/data/site.ts` içinde `publish.indexable` değerini `true` yap
- [ ] `sitemap.xml` ve `robots.txt` ekle (alan adı belli olunca; `@astrojs/sitemap` düşünülebilir)
- [ ] Doğrulanmış hizmet, bölge ve çalışma saatlerini ekle; gerekiyorsa `LocalBusiness` structured data'yı yalnızca doğrulanmış bilgilerle ekle
- [ ] Sayfa başlıkları ve açıklamalarını gerçek içerikle gözden geçir
- [ ] Logo, favicon ve paylaşım görseli (`og:image`) ekle
- [ ] Google İşletme Profili bağlantısı varsa iletişim sayfasına ekle
- [ ] Gerçek cihazlarda (360 px dahil) ve klavyeyle test et
- [ ] KVKK/gizlilik metni gerekiyorsa ekle (form veya çerez kullanımı eklenirse zorunlu)
