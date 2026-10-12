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
- `onaylandi: false` → yalnızca `showDrafts` iken görünür (`npm run dev` ya da `PUBLIC_SHOW_DRAFTS=true` ile alınan önizleme build'i, bkz. "Netlify önizleme"); kartta "TASLAK" rozeti olur. Normal `npm run build` çıktısında ne kart, ne menü öğesi, ne de sayfa üretilir.
- Firma bir hizmeti doğruladığında yalnızca o hizmetin `onaylandi` değerini `true` yapın; metni de gözden geçirin. Hiç onaylı hizmet yoksa `/hizmetler/` sayfası da üretilmez.
- Taslak metinlerde deneyim, makine sayısı, süre, fiyat, garanti veya "en iyi/lider" ifadesi bilerek yoktur; eklenmemelidir.
- `keywords` alanı yalnızca veri olarak durur; sayfada görünür liste olarak basılmaz ve meta keywords eklenmez.

Alan adı: [astro.config.mjs](astro.config.mjs) içindeki `site` alanı. Tanımlanınca `canonical`, `og:url`, `og:image` ve JSON-LD `url` üretilir. **Şu an önizleme adresi (`https://alperenler-hafriyat.netlify.app`) yazılıdır; gerçek alan adıyla değiştirilmelidir.** Sayfalar `noindex` kalır (`site.publish.indexable: false`).

## Görseller (public/images/)

Dosya yoksa ilgili alan hiç render edilmez; kırık görsel ikonu veya boş kutu çıkmaz. Dosya eklenince sayfayı yenilemek yeterlidir (dev sunucusunda), yayın için yeniden `npm run build` gerekir.

| Dosya | Kullanıldığı yer | Yoksa |
|---|---|---|
| `public/videos/hero-1080.webm`, `hero-1080.mp4` | Açılış videosu, masaüstü (≥ 768 px) | Video hiç basılmaz |
| `public/videos/hero-720.webm`, `hero-720.mp4` | Açılış videosu, mobil | Eldeki diğer boyut kullanılır; hiçbiri yoksa video yok |
| `public/images/hero-poster.jpg` | Videonun **ilk karesi, birebir aynı** (videonun altında hep görünür; hareket azaltma / Save-Data / yükleme anında tek görünen şey) | `hero.jpg` varsa o, yoksa koyu degrade + sade desen |
| `public/images/hero-poster-720.jpg` | **Dikey** poster (720×1280 videosunun ilk karesi); mobilde (48em altı) arka plan ve önyükleme için kullanılır | `hero-poster.jpg` (yatay) kullanılır |
| `public/videos/hero-720.(webm\|mp4)` | Mobil için **dikey 720×1280** video (`object-fit: cover` ile hero'yu doldurur) | Eldeki diğer boyut |
| `public/images/hakkimizda.jpg` + `.webp` | Biz Kimiz (ana sayfa) ve Hakkımızda sayfası fotoğrafı, dikey 1000×1333; `<picture>` ile webp önce, jpg yedek. Alt: "Kayalık arazide çalışan Hitachi ekskavatör" | Ana sayfada dekoratif panel; Hakkımızda'da yalnızca metin |
| `public/images/galeri/*.jpg` + `.webp` | "Sahadan" galerisi görselleri (`santiye-temel-kazisi` 1600×1200, `derin-kazi-hitachi` ve `arazide-yol-acma` 1000×1333); bkz. [gallery.ts](src/data/gallery.ts) | Dosyası olmayan öğe atlanır |
| `public/videos/galeri/*.mp4` + `public/images/galeri/*-poster.jpg` | Galeri videoları (`kazi-calismasi` dikey 540×960, `drone-arazi-duzenleme` yatay 960×540); `preload="none"`, poster, muted, controls. `/images/galeri/` altına konan mp4 de bulunur | Öğe atlanır |
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

[src/data/faq.ts](src/data/faq.ts): her soruda `onaylandi`. `false` olanlar yalnızca `showDrafts` iken (`npm run dev` veya `PUBLIC_SHOW_DRAFTS=true` önizleme build'i) "TASLAK" rozetiyle görünür; normal yayın çıktısında ve FAQPage JSON-LD'de yer almaz. Cevaplar firma tarafından okunup onaylanmalı, sonra `onaylandi: true` yapılmalıdır.

## Harita

[MapBand.astro](src/components/MapBand.astro) tam genişlik (full-bleed) harita şeridi + üstünde yüzen iletişim kartıdır (masaüstü ~440 px, tablet ~380 px, mobilde ~260 px; mobilde kart haritanın altında). Footer'da (CTA şeridinin altında) ve iletişim sayfasında (orada footer haritası gizli) kullanılır. Harita alanı [MapCard.astro](src/components/MapCard.astro). Haritanın ve iğnenin görünen merkezi, kartın sağında kalan alanın ortasına denk gelir. **Harita, kart görünür alana yaklaşınca (yaklaşık 300 px önce) Google'dan otomatik yüklenir**; HTML'de iframe yoktur, sayfa açılırken Google'a istek gitmez. Yüklenene kadar tasarım kartı bekleme ekranı olarak kalır (iğne nabzı sürer), iframe `load` olunca kart yumuşakça kaybolur. Sağ altta "Yol tarifi al" düğmesi sabittir. Mantık [map-card.js](src/scripts/map-card.js) içindedir.

- **Koruma katmanı (map-shield):** harita yüklenince iframe'in üstünü şeffaf bir düğme ("Haritayı etkinleştir") kaplar; sayfa normal kayar ve Google'ın "ctrl + kaydırma ile yakınlaştırın" uyarısı çıkmaz. Fare üzerindeyken "Haritayı kullanmak için tıklayın" (dokunmatikte "dokunun") etiketi belirir. Tıklayınca/dokununca/Enter-Space ile katman kalkar ve harita sürüklenip yakınlaştırılabilir; fare haritadan çıkınca, sayfa kayınca, dışarı basılınca veya Escape ile katman geri gelir. Yüzen iletişim kartı her zaman katmanın üstündedir.
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

- **Logo:** firmanın logosu `public/images/logo/` altındadır (`logo-isaret-sari|beyaz|siyah.svg`, `logo-yatay-acik|koyu-zemin.svg`, `logo-dikey-acik|koyu-zemin.svg`). Site içindeki işaret [LogoMark.astro](src/components/LogoMark.astro) olarak inline SVG'dir (`logo-isaret-sari.svg` ile aynı çizim, `viewBox 0 0 100 100`, `fill="currentColor"`); header ve footer'da yazının solunda sarı görünür. İşaret değişirse hem bu dosya hem `public/favicon.svg` güncellenmelidir.
- `public/favicon.svg`, `public/apple-touch-icon.png` (180×180) ve `public/og-image.png` (1200×630) mevcuttur. `apple-touch-icon.png` dosyası varsa `<link rel="apple-touch-icon">` kendiliğinden basılır. `og:image` etiketleri dosya varsa **ve** `astro.config.mjs` içinde `site` tanımlıysa basılır (mutlak adres gerektiği için); şu an önizleme adresi tanımlıdır.
## Yapısal veri (JSON-LD) ve sayfa geçişleri

- Hepsi [src/utils/schema.ts](src/utils/schema.ts) içinde üretilir. Ana sayfa ve iletişim: `GeneralContractor` (ad, unvan, telefon, adres). Onaylı hizmet detaylarında `Service`, onaylı SSS varsa `FAQPage`. `url` yalnızca `site` (alan adı) tanımlıysa, `sameAs` yalnızca `site.ts`'de `sameAs` doluysa eklenir. `geo`, `openingHours`, `priceRange`, `aggregateRating`, `review` bilerek yoktur.
- Sayfa geçişleri Astro `ClientRouter` ile yapılır; header sabit kalır (`transition:persist`). Sayfaya bağlı betikler (reveal, hero video, sihirbaz) [page-init.js](src/scripts/page-init.js) içinde her sayfa yüklenişinde yeniden başlatılır. Hareket azaltma açıkken geçiş animasyonu yoktur.

## Performans

`npm run dev` ve `npm run build` öncesinde (`predev` / `prebuild` → `npm run prepare:assets`) iki betik otomatik çalışır; elle çalıştırmak gerekmez:

**1) Font kırpma — [scripts/subset-fonts.mjs](scripts/subset-fonts.mjs)** (saf JS, `subset-font 2.9.0`; Python gerekmez)
- `node_modules/@fontsource-variable/{archivo,inter}` içindeki latin + latin-ext dosyalarını, yalnızca gereken karakterlere (ASCII, Türkçe harfler, şapkalılar, tırnak/tire/üç nokta, `→ ₺ € © ®` vb.) kırpar (eksenler korunur); çıktı `public/fonts/*.woff2` olur:
  - **Eksenler KIRPILMAZ.** `variationAxes` ile eksen daraltma denendi ve Archivo'nun geniş biçimini bozdu (başlıklar, düğmeler dar göründü); bu yüzden yalnızca karakter kırpılır, `wght` (ve Archivo'da `wdth`) orijinal aralıklarıyla kalır. `@font-face` aralıkları fontsource'unkiyle aynıdır (Archivo: `100 900` / `62% 125%`, Inter: `100 900`). Betik, ayar değişince çıktıları yeniden üretmek için imzada `SCRIPT_VERSION` kullanır.
- Aile başına iki dosya üretilir (`*-latin.woff2` ana, `*-latin-ext.woff2` Ğ ğ İ Ş ş ₺ gibi karakterler için). fontsource latin ve latin-ext'i ayrı sunar ve JS ile birleştirilemez; tarayıcı `unicode-range` ile gerekeni alır. Hero başlığındaki Archivo (`archivo-latin.woff2`) `<link rel="preload" as="font">` ile önyüklenir.
- Çıktılar, kaynak/ayar değişmedikçe yeniden üretilmez (`public/fonts/.cache.json`).
- **Hata olursa build durmaz:** kırpılamayan dosya yerine aynı adla fontsource dosyasının kopyası konur (daha büyük ama eksiksiz). Betik her zaman 0 koduyla çıkar.
- **Yeni karakter gerekirse:** `scripts/subset-fonts.mjs` içindeki `TEXT` listesine ekleyin. Ağırlık/genişlik için ayar gerekmez (tüm aralık korunur).
- Not: `→` ve bazı simgeler fontsource alt kümelerinde yoksa tarayıcı sistem fontuna düşer (görünümde fark etmez).

**2) Topoğrafik desen — [scripts/generate-topo.mjs](scripts/generate-topo.mjs)**
- Desenler sayfaya inline basılmaz; `public/topo/hero.svg`, `soft.svg`, `low.svg` olarak üretilir ve CSS `background-image` ile kullanılır (tarayıcı önbelleğe alır). Opaklık ve maske CSS'te aynı kaldı. İki ince sarı çizgi SVG dosyasının içindedir (ayrıca inline gerekmez).
- Betik çalışmazsa desen görünmez, site bozulmaz.

**Betikler ve CSS**
- Bütün sayfa betikleri Astro'nun paketlediği `type="module"` (varsayılan olarak ertelenir) betiklerdir; ilk boyamayı engellemez. İstisna: `<head>` içindeki tek satırlık `js` sınıfı betiği (ilk boyamadan önce çalışmalı, yoksa hero/başlık yer değiştirir) ve header içindeki menü betiği (header'ın persist edilen elemanında, menünün yanıp sönmemesi için sayfa çizilirken çalışır). İkisi de çok küçüktür.
- CSS tek paket dosyasıdır (Astro varsayılanı); kritik CSS ayrıca inline edilmedi.

**Ölçüm (Lighthouse):** `npm run build` ardından `npm run preview` ile yayına yakın çıktı üzerinde test edin (`npm run dev` üzerinde değil). Önce/sonra için `public/fonts` ve `dist/_astro` boyutlarına, ana sayfa HTML'inin boyutuna (`(Get-Item dist\index.html).Length`) bakın.

## Duyarlı görseller (sharp)

[scripts/build-images.mjs](scripts/build-images.mjs) (`prepare:assets` içinde, `predev`/`prebuild` ile otomatik): `public/images/` altındaki tüm `.jpg` kaynaklardan (galeri, hakkımızda, hero posterleri) **480, 960 ve 1600 px** genişlikte webp + jpg türevleri üretir: `public/images/_r/<ad>-<genişlik>.(webp|jpg)`. Kaynaktan büyük türev üretilmez; kaynağın kendi genişliği de bir türev olarak eklenir.
- Her görselin boyutu ve **baskın rengi** (`sharp stats().dominant`) [src/data/image-meta.json](src/data/image-meta.json)'a yazılır. `Picture.astro` bununla `srcset` + `sizes` (bağlama göre), `width/height` ve yer tutucu zemin rengi (baskın renk) üretir; meta yoksa eski davranışa (tek boy görsel + sabit kum rengi, `image-size.ts`) düşer. Lightbox tam boyda ve hero posterinde de `srcset` kullanılır; hero posteri `fetchpriority="high"` taşır.
- Kaynak değişmediyse atlanır (`public/images/_r/.cache.json`). Hata olursa (sharp yoksa/çalışmazsa) build durmaz, mevcut türevler ve orijinal görseller kullanılır.
- **`public/images/_r/` ve `src/data/image-meta.json` Git'e girer**, böylece Netlify'da sharp çalışmasa bile hazır görseller kullanılır. Yeni görsel eklenince `npm run dev`/`build` türevleri üretir; üretilenleri commit etmeyi unutmayın.
- `<video poster>` ve galeri video posterleri de `_r` türevlerinden gelir (küçük webp).

## CSS yapısı

[src/styles/global.css](src/styles/global.css) yalnızca `@import` sırasıdır. Kurallar şu dosyalardadır (sıra, aynı özgüllükte sonraki kuralın kazandığı özgün tek dosyadaki sırayla aynıdır; yeni dosya eklerken sırayı gözetin): `fonts.css`, `tokens.css`, `base.css`, `utilities.css`, `layout.css`, `components/*.css` (buton, header, hero, kartlar, galeri, lightbox, harita, footer, sihirbaz, SSS, etkiler…), `motion.css` (hareket azaltma, en sonda). Kullanılmayan kurallar silindi: `.footer-phone`, `a.info-value`, `.section-surface`.

## Testler (Playwright)

`npm test` ([playwright.config.ts](playwright.config.ts), [tests/](tests/)): önce [scripts/serve-for-tests.mjs](scripts/serve-for-tests.mjs) siteyi iki kez build eder (normal → `dist-test/` :4321, `PUBLIC_SHOW_DRAFTS=true` → `dist-test-drafts/` :4322) ve önizler, sonra:
- `smoke.spec.ts` (normal build): tüm sayfalar 200 / konsolda hata yok / tek H1; iç bağlantılar 404 vermiyor; `tel:` ve `wa.me` doğru numara; taslak sayfalar ve önizleme şeridi yok; mobil (390×844) menü ve sayfa geçişi sonrası menü, yatay taşma; galeri lightbox'ı (açılır, Escape ile kapanır, ClientRouter geçişi sonrası yine açılır); teklif sihirbazı 3 adım ve WhatsApp mesajı.
- `smoke.spec.ts` ayrıca: bölge/rehber sayfaları normal build'de 404 (footer'da bağlantıları yok), Hakkımızda fotoğraf şeridi lightbox'ı ve `/teklif/?yer=` ile yer alanı ön-doldurma.
- `drafts.spec.ts` (taslaklı build): taslak sayfalar var, önizleme şeridi/rozetler görünür, JSON-LD'de `Service`/`FAQPage`/`Article` yok; 13 bölge sayfası (başlık, taslak notu, ilçeye özel WhatsApp, ön-dolu sihirbaz bağlantısı); 4 rehber yazısı (500–800 kelime, okuma süresi, içindekiler, belediye notu); hizmet sayfasında ilgili rehber bağlantısı.
Google harita istekleri testte sahte yanıtla karşılanır. Yerelde çalıştırmak zorunlu değildir; ilk kez: `npx playwright install chromium`.

## GitHub Actions (CI)

[.github/workflows/ci.yml](.github/workflows/ci.yml): her `push` ve `pull_request`'te Node 24.13.0, `npm ci`, `npm run check`, `npm run build`, `npx playwright install --with-deps chromium`, `npm test`; ayrıca ayrı bir `lighthouse` işi (bkz. Lighthouse CI). Sonucu görmek için GitHub'da depoyu açıp üstteki **Actions** sekmesine girin, ilgili çalıştırmaya (commit adı) tıklayın; her adımın yeşil/kırmızı durumu ve logu orada görünür. Test başarısız olursa sayfanın altındaki **Artifacts** bölümünden `playwright-report` indirilir (içindeki `index.html`'i tarayıcıda açın). `npm ci` için `package-lock.json` güncel olmalıdır: bağımlılık ekleyince yerelde `npm install` çalıştırıp lock dosyasını da commit edin.

## Netlify önizleme

[netlify.toml](netlify.toml) ile siteyi Netlify'a önizleme olarak koyabilirsiniz (`npm run build`, yayın klasörü `dist`, Node `24.13.0`).

**Taslak bayrağı — `PUBLIC_SHOW_DRAFTS`** ([src/data/drafts.ts](src/data/drafts.ts)): `showDrafts = import.meta.env.DEV || PUBLIC_SHOW_DRAFTS === 'true'`.
- `true` iken `onaylandi: false` hizmetler ve SSS maddeleri build çıktısına girer: menüde "Hizmetler", ana sayfa kartları, `/hizmetler/` ve detay sayfaları, footer listesi, teklif sihirbazının 1. adımı, SSS bölümü ve gizlilik sayfasındaki taslak uyarısı. "TASLAK" rozetleri görünür.
- Sayfanın en üstünde ince sarı şerit çıkar: "Önizleme sürümü – içerikler onay bekliyor" (yalnızca bu önizleme build'inde; `npm run dev`'de ve normal yayında yok).
- **JSON-LD'ye (Service, FAQPage) taslaklar hiçbir zaman girmez**; yalnızca `onaylandi: true` olanlar girer.
- Yerelde denemek: `$env:PUBLIC_SHOW_DRAFTS = 'true'; npm run build; npm run preview` (PowerShell) veya `.env` dosyasına `PUBLIC_SHOW_DRAFTS=true` yazın ([.env.example](.env.example)).

**Önizlemede arama motorlarından gizleme:** `netlify.toml` içindeki `[[headers]]` bloğu tüm yollara `X-Robots-Tag: noindex, nofollow` ekler. Ayrıca sayfalarda `noindex` meta etiketi vardır (`site.publish.indexable: false`).

**404:** Netlify, publish dizinindeki `404.html`'i (Astro `dist/404.html` üretir) eşleşmeyen yollar için otomatik kullanır; ek ayar gerekmez.

### Gerçek yayına geçerken kapatılacaklar
1. `netlify.toml` → `PUBLIC_SHOW_DRAFTS` değerini `"false"` yapın veya satırı silin (ya da Netlify panelinde değişkeni silin). Hâlâ yayına girmesi istenen hizmet/SSS için `onaylandi: true` yapın.
2. `netlify.toml` → `[[headers]]` (`X-Robots-Tag`) bloğunu kaldırın.
3. [src/data/site.ts](src/data/site.ts) → `publish.indexable: true`, `astro.config.mjs` → `site` (gerçek alan adı). Gizlilik sayfası `noindex` kalır.
4. Yayın öncesi kontrol listesindeki diğer maddeler (gizlilik sayfası yer tutucuları, logo, `og-image.png`, koordinat/İşletme Profili).

## Premium görsel katman (Aşama 9A)

- **Hero:** başlık satır satır alttan maskeyle açılır (700 ms), alt başlık ve butonlar 120 ms arayla; video üstünde çok hafif vinyet. Altında yavaş "kayan şerit" (yalnızca görünür hizmet adları, `aria-hidden`, üzerine gelince durur; [HeroMarquee.astro](src/components/HeroMarquee.astro)).
- **Numaralı bölüm etiketleri:** `BaseLayout`'a `numbered` verilen sayfada (şu an ana sayfa) `.section-head` içindeki etiketler CSS sayaçlarıyla "01 — …", "02 — …" diye gerçek sıraya göre numaralanır.
- **Tipografi:** başlıklarda `text-wrap: balance`, paragraflarda `pretty`, uzun metinlerde en çok 65ch; metinlerdeki kesme işaretleri tipografik (’).
- **Hizmet kartları:** fareyi takip eden hafif ışık (`--mx/--my`, yalnızca fare/hover cihazlarda), 80 ms kademeli belirme.
- **Nasıl çalışıyoruz:** adımlar arası çizgi kaydırdıkça dolar (`animation-timeline: view()`; desteklemeyen tarayıcıda dolu çizgi), numaralar kontur yazı, aktif adımda sarıya dolar.
- **Görseller:** yer tutucu zemin + yüklenince yumuşak fade-in. **Ortalama renk:** JPEG'den ortalama rengi saf JS ile çıkarmak (DCT çözümü) paket olmadan makul değil; bu yüzden tüm görsellerde sabit kum rengi (`--img-placeholder`) kullanılır.
- **Lightbox:** View Transitions API varsa görsel karttan büyüyerek açılır / karta küçülerek kapanır (`view-transition-name: lb-img`); yoksa fade. Videolarda ve hareket azaltmada geçiş yok.
- **Mikro etkileşimler:** basınca `scale(.98)`, sarı düğmede hover'da tek seferlik parlama, "Hemen Ara" düğmelerinde telefon ikonu hover'da titrer; iletişim sayfasında telefon için "Kopyala" düğmesi (JavaScript yoksa gizli) ve `aria-live` bildirimi.
- **İletişim sayfası:** üstte üç büyük seçenek kartı (Ara / WhatsApp'tan yaz / Yol tarifi al); çalışma saati yazılmaz (doğrulanmadı). **404:** logo işareti "kazıyormuş" gibi sallanır.
- Animasyonlar yalnızca `transform`/`opacity` kullanır; `prefers-reduced-motion` açıkken hepsi kapalı veya sade.

## Hizmet görselleri, güven şeridi

- **Hizmet görselleri:** `services.ts` içindeki `image` alanı galeri dosyalarını kullanır (`/images/galeri/*.jpg`, aynı adlı `.webp` varsa `<picture>` ile önce o). Masaüstü kartında 16/10 görsel, alttan karta kaynaşan koyu degrade ve görselin üstünde numara + ikon; hover'da görsel 400 ms'de `scale(1.04)` (hareket azaltmada yok). Mobil kompakt satırda solda 56 px kare küçük resim, yanında küçük numara. Detay sayfasının başlık bölümünün arka planı aynı görseldir (koyu katman + soluk topo deseni).
- **"Sahadan kareler":** `gallery.ts` içindeki her öğenin `services` alanı (dosya adından eşleme, bkz. `SERVICES_BY_NAME`) ilgili hizmetleri belirler; hizmet detay sayfası en çok 4 ilgili öğeyi gösterir (lightbox çalışır, altında "Tüm galeri →").
- **Güven şeridi** ([highlights.ts](src/data/highlights.ts)): ana sayfada Biz Kimiz ile Hizmetler arasında, rakamsız ve iddiasız 4 madde. `onaylandi: false` olduğu için yalnızca `showDrafts` iken (dev veya `PUBLIC_SHOW_DRAFTS=true` önizleme) görünür, "TASLAK" rozetiyle. Firma onaylayınca `onaylandi: true` yapın.

## Galeri

[src/data/gallery.ts](src/data/gallery.ts) içindeki `photo(ad, alt)` ve `video(ad, başlık)` satırlarıyla yönetilir. Dosyalar `public/images/galeri/` altındadır: `<ad>.jpg` (+ `<ad>.webp` varsa `<picture>` ile önce o sunulur), videolar için `<ad>.mp4` + `<ad>-poster.jpg` (mp4 `public/videos/galeri/` altında da aranır).

- Piksel boyutları (CLS olmasın diye `width`/`height`) paket eklenmeden dosyadan okunur ([image-size.ts](src/utils/image-size.ts): JPEG başlığı + EXIF yönü); video boyutu poster görselinden alınır. İsterseniz `width`/`height` elle de yazılabilir.
- Ana sayfa "Sahadan" yalnızca `featured: true` olan en çok 6 öğeyi gösterir ve "Tüm fotoğraf ve videolar" bağlantısıyla `/galeri/` sayfasına gider. `/galeri/` hepsini, Tümü / Fotoğraflar / Videolar filtresiyle (JavaScript yoksa filtre gizli, hepsi görünür) gösterir; ilk 3 öğe hemen, kalanı lazy yüklenir; videolar `preload="none"`. Lightbox yalnızca görünür (filtrelenmemiş) görseller arasında gezinir.
- Dosyası bulunmayan öğe atlanır; hiç öğe yoksa bölüm ve menüdeki "Galeri" görünmez (dev'de menü için yeni medyadan sonra sunucuyu yeniden başlatın).
- Konum, tarih, müşteri adı veya "projemiz" gibi iddia yazılmaz.

## Makine kiralama sayfaları, fiyat rehberi, sitemap

- **Makine kiralama** ([src/data/machines.ts](src/data/machines.ts)): `/makine-kiralama/` (liste) ve `/makine-kiralama/<slug>/` (kepçe, ekskavatör, mini ekskavatör, kırıcılı ekskavatör, hafriyat kamyonu). Hepsi `onaylandi: false`; yalnızca `showDrafts` iken (dev veya `PUBLIC_SHOW_DRAFTS=true` önizleme) üretilir ve "TASLAK" rozeti ile "Bu makinenin firmada bulunduğu onaylanmadı." notunu taşır. **Hangi makinelerin gerçekten bulunduğu firmadan doğrulanmadan `onaylandi: true` yapılmamalıdır.** Metinlerde rakam, fiyat, süre veya model iddiası yoktur; WhatsApp mesajı makine adına özeldir. Listeye `/hizmetler/` sayfasındaki "Makine kiralama" bölümünden ve footer'dan ulaşılır; hizmet ve makine sayfaları birbirine "İlgili" bağlantılarıyla bağlıdır.
- **Fiyat rehberi** ([src/data/price-guide.ts](src/data/price-guide.ts)): `/hafriyat-fiyatlari/`, `onaylandi: false`. Rakamsızdır; metreküp bazlı kazı, saatlik/günlük makine, kamyon sefer ve yıkım işlerinde fiyatı etkileyen etkenleri anlatır; içindekiler listesi, SSS ve teklif sihirbazı içerir. SSS maddeleri de `onaylandi` taşır; `FAQPage` JSON-LD yalnızca onaylılardan üretilir.
- **Taslak sayfalar `noindex`** olur (site yayına çıksa bile onaylanana kadar). `BreadcrumbList` JSON-LD hizmet, makine ve rehber sayfalarında yalnızca onaylı sayfalar için ve `astro.config.mjs` içinde `site` tanımlıysa basılır.
- **`/robots.txt`** ([robots.txt.ts](src/pages/robots.txt.ts)): `site.publish.indexable: false` iken `Disallow: /`; `true` iken `Allow: /` ve `Sitemap:` satırı.
- **`/sitemap.xml`** ([[feed].xml.ts](src/pages/[feed].xml.ts), kendi yazımımız, `@astrojs/sitemap` yok): yalnızca `indexable: true` iken üretilir; hiçbir taslak sayfa girmez (yalnızca `onaylandi: true` hizmet/makine/rehber, `/gizlilik/` ve 404 hariç).

## Bölge sayfaları, rehber yazılar, Hakkımızda (Aşama 10)

- **Hizmet bölgeleri** ([src/data/regions.ts](src/data/regions.ts)): Malatya'nın 13 ilçesi için `/bolgeler/` (liste) ve `/bolgeler/<slug>/` (SEO başlığı "<İlçe> Hafriyat | Alperenler Hafriyat"). Hepsi `onaylandi: false`; yalnızca `showDrafts` iken üretilir, "TASLAK" rozeti ve "Bu bölgeye hizmet verildiği onaylanmadı." notuyla, `noindex`, sitemap'e ve JSON-LD'ye girmeden. **Firma hangi ilçelere gittiğini onayladığında yalnızca o ilçelerin `onaylandi` değerini `true` yapın.** Coğrafi, nüfus veya mesafe bilgisi yazılmaz. Giriş cümlesi 4 farklı kalıptan ilçeye göre seçilir. Sayfada ilçeye özel WhatsApp mesajı, "Teklif için gerekenler" ve hizmet kartları vardır; "Teklif mesajını hazırla" bağlantısı `/teklif/?yer=<ilçe>` açar ve sihirbazın yer alanı ön-dolu gelir. Footer'da "Hizmet bölgeleri" bağlantısı yalnızca görünür bölge varsa çıkar. SSS'deki "Hangi bölgelere hizmet veriyorsunuz?" cevabına **onaylı** bölgelerin listesi otomatik eklenir (onaylı bölge yoksa genel cevap kalır).
- **Rehber yazılar** ([src/data/guides.ts](src/data/guides.ts)): `/rehber/` ve `/rehber/<slug>/`; 4 yazı, her biri 500–800 kelime, sade genel bilgi (firmaya özel iddia, rakam, fiyat veya süre yok). Hukuki konularda "güncel kuralları belediyenizden teyit edin" notu otomatik çıkar. Okuma süresi kelime sayısından (≈200 kelime/dk) hesaplanır; yazar "Alperenler Hafriyat"tır. Hepsi `onaylandi: false`: yalnızca `showDrafts` iken üretilir, `noindex`; `Article` ve `BreadcrumbList` JSON-LD yalnızca `onaylandi: true` yazı için basılır. Footer'da "Rehber yazılar", ilgili hizmet sayfalarında "İlgili rehber yazılar" bağlantısı vardır. Her yazıyı firma okuyup onaylamadan `true` yapmayın.
- **Sitemap:** onaylı bölge ve rehber sayfaları eklenir (taslaklar asla girmez).
- **Hakkımızda:** üstte büyük fotoğraf + başlık, kısa "Nasıl çalışıyoruz", görünür hizmetler listesi, galeriden 4'lü fotoğraf şeridi (lightbox) ve adres/yol tarifi kartı. Kuruluş yılı, ekip sayısı veya iddia yoktur.

## Lighthouse CI

[lighthouserc.json](lighthouserc.json) + `@lhci/cli` (0.15.1): normal build'in `dist/` çıktısını `astro preview` ile sunar ve **mobil** Lighthouse'u `/`, `/galeri/`, `/iletisim/` için 3'er kez çalıştırır. Eşikler: performans ≥ 0.9, erişilebilirlik ≥ 0.95, en iyi uygulamalar ≥ 0.95 (altına düşerse CI **kırmızı**); SEO ≥ 0.9 yalnızca **uyarı**: site henüz yayında değil (`publish.indexable: false`) ve tüm sayfalar bilerek `noindex` olduğundan Lighthouse "taranabilir" denetiminde puan kaybeder. Yayına alınıp `indexable: true` yapılınca `lighthouserc.json` içinde `categories:seo` değeri `"warn"` yerine `"error"` yapılmalıdır.

**Sonucu nereden görürsünüz:** GitHub'da **Actions** → ilgili çalıştırma → `lighthouse` işi (log'da kategori puanları ve eşik ihlalleri) → sayfanın altındaki **Artifacts** bölümünden `lighthouse-report` (HTML ve JSON raporları). Yerelde: `npm run build` sonra `npm run lighthouse` (rapor `.lighthouseci/` klasörüne yazılır; Chrome kurulu olmalıdır). Rapor üçüncü taraf bir sunucuya yüklenmez.

## Yayına alma kontrol listesi

1. **Alan adı:** satın alın ve DNS/Netlify ayarlarını yapın.
2. **`astro.config.mjs` → `site`:** önizleme adresini gerçek alan adıyla değiştirin (canonical, `og:url`, `og:image`, sitemap, JSON-LD buna bağlıdır).
3. **`PUBLIC_SHOW_DRAFTS`:** Netlify ortamında `false` yapın veya silin (`netlify.toml` ve Netlify panelinde); taslaklar yayına girmesin.
4. **`netlify.toml`:** `[[headers]]` altındaki `X-Robots-Tag: noindex, nofollow` bloğunu kaldırın.
5. **`src/data/site.ts` → `publish.indexable: true`:** sitemap ve `robots.txt` bu ayarla açılır, sayfalar `index` olur (gizlilik sayfası `noindex` kalır).
6. **Onaylanan içerikler:** firmanın doğruladığı hizmet, SSS, makine, güven şeridi maddeleri ve fiyat rehberi için `onaylandi: true` yapın; doğrulanmayanlar `false` kalsın.
7. **Gizlilik sayfası:** `[firma tarafından doldurulacak]` yer tutucularını (barındırma sağlayıcısı, ticari unvan, vergi no, KVKK veri sorumlusu, tarih) doldurun; metin hukuki onaydan geçsin.
8. **Google Search Console:** mülkü ekleyin, `sitemap.xml`'i gönderin.
9. **Google İşletme Profili:** profili doğrulayın; bağlantıyı `site.ts` içindeki `mapsPlaceUrl`'e, doğrulanmış koordinatı `mapCoords`'a yazın.
10. **Son kontrol:** `npm run build && npm run preview` ile gözden geçirin; sayfa kaynağında `noindex` kalmadığını, `/robots.txt` ve `/sitemap.xml` çıktısını ve Lighthouse sonucunu doğrulayın.

## Henüz doğrulanmamış / eksik içerik

- Hizmet listesi ve hizmet bölgeleri
- E-posta, çalışma saatleri, deneyim yılı, makine sayısı
- ~~Logo~~ (eklendi; logo dosyaları `public/images/logo/` altında)
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
