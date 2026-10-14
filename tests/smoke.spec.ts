import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  PHONE_HREF,
  WA_BASE,
  crawl,
  expectH1BelowHeader,
  internalLinks,
  stubGoogle,
  watchErrors,
} from './helpers';

// Normal build (taslak bayrağı KAPALI) üzerinde duman testleri.

test.beforeEach(async ({ page }) => {
  await stubGoogle(page);
});

test('tüm sayfalar: 200, konsolda hata yok, tek H1', async ({ page }) => {
  const errors = watchErrors(page);
  const pages = await crawl(page);
  expect(pages.length).toBeGreaterThan(3);

  for (const path of pages) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} durum kodu`).toBe(200);
    await expect(page.locator('h1'), `${path} H1 sayısı`).toHaveCount(1);
  }
  expect(errors, `konsol/sayfa hataları:\n${errors.join('\n')}`).toEqual([]);
});

test('iç bağlantılar 404 vermiyor', async ({ page, request }) => {
  test.setTimeout(120_000); // tüm sayfaları dolaşır; yavaş makinede 45 sn sınırına yaklaşıyordu
  const pages = await crawl(page);
  const links = new Set<string>();
  for (const path of pages) {
    await page.goto(path);
    for (const link of await internalLinks(page)) links.add(link);
  }
  for (const link of links) {
    const response = await request.get(link);
    expect(response.status(), `${link} bağlantısı`).toBeLessThan(400);
  }
});

test('tel: ve wa.me bağlantıları doğru numarayı içeriyor', async ({ page }) => {
  for (const path of ['/', '/iletisim/', '/teklif/']) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href]', (anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href') ?? ''),
    );
    const phones = hrefs.filter((href) => href.startsWith('tel:'));
    expect(phones.length, `${path} tel: bağlantısı`).toBeGreaterThan(0);
    for (const href of phones) expect(href).toBe(PHONE_HREF);

    for (const href of hrefs.filter((value) => value.includes('wa.me'))) {
      expect(href.startsWith(WA_BASE), `${path} wa.me: ${href}`).toBe(true);
    }
  }
});

test('taslak bayrağı kapalı build\'de taslak sayfalar ve şerit yok', async ({ page, request }) => {
  // Not: kalan taslaklar (fiyat rehberi, rehber yazıları) onaylanınca burası güncellenmelidir.
  // Onaylanmamış (onaylandi:false) içerik normal build'de üretilmez.
  for (const path of [
    '/hafriyat-fiyatlari/',
    '/rehber/',
    '/rehber/temel-kazisindan-once-bilinmesi-gerekenler/',
  ]) {
    const response = await request.get(path);
    expect(response.status(), `${path} üretilmemeli`).toBe(404);
  }
  await page.goto('/');
  await expect(page.locator('.preview-bar')).toHaveCount(0);
  await expect(page.locator('.draft-badge')).toHaveCount(0);
  // Footer'da taslak rehber bağlantısı görünmemeli; onaylı bölgeler/makineler görünür
  await expect(page.locator('footer a[href="/rehber/"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="/bolgeler/"]')).toHaveCount(1);
});

const SERVICE_SLUGS = [
  'hafriyat-ve-temel-kazisi',
  'bina-yikim-ve-kirim',
  'altyapi-ve-kanalizasyon-kazisi',
  'arazi-duzleme-ve-yol-acma',
  'kaya-kirma-ve-kirici-isleri',
  'operatorlu-is-makinesi-kiralama',
  'hafriyat-kamyonu-ve-moloz-tasima',
  'dolgu-toprak-temini-ve-saha-temizligi',
];
const MACHINE_SLUGS = [
  'kiralik-kepce-jcb',
  'ekskavator-kiralama',
  'mini-ekskavator-kiralama',
  'kiricili-ekskavator',
  'hafriyat-kamyonu-kiralama',
  'lowbed-ile-is-makinesi-tasima',
];

test("firma onaylı sayfalar normal build'de var: bölgeler, 8 hizmet, 6 makine (mini ekskavatör ve lowbed dahil)", async ({ request }) => {
  const present = [
    '/bolgeler/',
    ...[
      'yesilyurt', 'battalgazi', 'akcadag', 'arapgir', 'arguvan', 'darende', 'dogansehir',
      'doganyol', 'hekimhan', 'kale', 'kuluncak', 'puturge', 'yazihan',
    ].map((slug) => `/bolgeler/${slug}/`),
    '/hizmetler/',
    ...SERVICE_SLUGS.map((slug) => `/hizmetler/${slug}/`),
    '/makine-kiralama/',
    ...MACHINE_SLUGS.map((slug) => `/makine-kiralama/${slug}/`),
  ];
  for (const path of present) {
    const response = await request.get(path);
    expect(response.status(), `${path} var olmalı`).toBe(200);
  }
});

test('hizmetler sayfasında 8 kart; makine listesinde 6 kart; onaylı sayfalarda TASLAK rozeti yok', async ({ page }) => {
  await page.goto('/hizmetler/');
  // (sayfada ayrıca makine kartları da var: yalnızca /hizmetler/<slug>/ kartları sayılır)
  await expect(page.locator('main .service-card a[href^="/hizmetler/"]')).toHaveCount(8);
  await expect(page.locator('.draft-badge')).toHaveCount(0);
  await page.goto('/makine-kiralama/');
  await expect(page.locator('main .service-card')).toHaveCount(6);
  await expect(page.locator('.draft-badge')).toHaveCount(0);
  // JSON-LD: onaylı hizmet sayfasında Service var
  await page.goto('/hizmetler/hafriyat-ve-temel-kazisi/');
  const ld = (
    await page.locator('script[type="application/ld+json"]').evaluateAll((n) => n.map((x) => x.textContent ?? ''))
  ).join('\n');
  expect(ld).toContain('"@type":"Service"');
});

test("lowbed sayfası normal build'de 200 ve \"2 adet lowbed tır\" bilgisini içerir", async ({ page }) => {
  const response = await page.goto('/makine-kiralama/lowbed-ile-is-makinesi-tasima/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('main')).toContainText('Filomuzda 2 adet lowbed tır');
  await expect(page.locator('.draft-badge')).toHaveCount(0);
});
test('WhatsApp ikonları görünür: svg > 10×10 px ve path dolgusu "none" değil', async ({ page }) => {
  let checked = 0;
  for (const path of [
    '/',
    '/iletisim/',
    '/teklif/',
    '/hizmetler/operatorlu-is-makinesi-kiralama/',
    '/makine-kiralama/ekskavator-kiralama/',
    '/bolgeler/yesilyurt/',
  ]) {
    await page.goto(path);
    // Sayfanın sonuna kadar kaydır: footer/harita kartındaki düğmeler de ölçülebilsin
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    for (const link of await page.locator('a[href*="wa.me"]').all()) {
      if (!(await link.isVisible())) continue; // gizli (örn. sihirbaz sonucu, kaydırılmamış yüzen düğme)
      const svg = link.locator('svg.icon-whatsapp');
      await expect(svg, `${path}: WhatsApp bağlantısında WhatsAppIcon yok`).toHaveCount(1);
      const box = await svg.boundingBox();
      expect(box, `${path}: svg ölçülemedi`).not.toBeNull();
      expect((box as { width: number }).width, `${path} svg genişlik`).toBeGreaterThan(10);
      expect((box as { height: number }).height, `${path} svg yükseklik`).toBeGreaterThan(10);
      const fill = await svg.locator('path').evaluate((el) => getComputedStyle(el).fill);
      expect(fill, `${path}: path fill`).not.toBe('none');
      checked += 1;
    }
  }
  expect(checked, 'hiç görünür WhatsApp bağlantısı bulunamadı').toBeGreaterThan(0);
});

test('favicon.ico ve site.webmanifest 200 döner; head bağlantıları var', async ({ page, request }) => {
  for (const path of ['/favicon.ico', '/favicon-32.png', '/apple-touch-icon.png', '/site.webmanifest', '/og-image.png']) {
    const response = await request.get(path);
    expect(response.status(), `${path} durum kodu`).toBe(200);
  }
  await page.goto('/');
  await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveCount(1);
  await expect(page.locator('link[rel="manifest"][href="/site.webmanifest"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][href="/favicon.svg"]')).toHaveCount(0);
});

test('header logosu yüklenir (naturalWidth > 0), orijinal oranda ve kırpılmamış', async ({ page }) => {
  await page.goto('/');
  const logo = page.locator('.site-header .brand-logo img');
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(logo).toHaveAttribute('alt', 'Alperenler Hafriyat İnşaat Taahhüt Ltd. Şti. logosu');
  await expect(logo).toHaveAttribute('decoding', 'async');
  await expect(logo).toHaveAttribute('loading', 'eager');
  // Görsele dokunulmaz: kırpma/filtre/mask/cover yok, oran 3:2
  const style = await logo.evaluate((img) => {
    const css = getComputedStyle(img);
    return { fit: css.objectFit, filter: css.filter, mask: css.maskImage || css.webkitMaskImage };
  });
  expect(style.fit).not.toBe('cover');
  expect(style.filter).toBe('none');
  const box = (await logo.boundingBox()) as { width: number; height: number };
  expect(box.width / box.height).toBeCloseTo(1.5, 1);
});

test('mini ekskavatör sayfası: 200, "2 adet 3 tonluk mini ekskavatör", ayrı tablo, bağlantılar, fotoğraf yerine ikon', async ({ page }) => {
  const response = await page.goto('/makine-kiralama/mini-ekskavator-kiralama/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Mini Ekskavatör Kiralama Malatya/);
  await expect(page.locator('h1')).toHaveText('Mini Ekskavatör Kiralama');
  await expect(page.locator('main')).toContainText('2 adet 3 tonluk mini ekskavatör');
  await expect(page.locator('.draft-badge')).toHaveCount(0);
  // Kendi küçük filo tablosu: 3 ton × 2, toplam 2
  const fleet = page.locator('[data-fleet]');
  await expect(fleet.locator('tbody tr')).toHaveCount(1);
  await expect(fleet.locator('tbody tr').first()).toContainText('3 ton');
  await expect(fleet.locator('tbody tr td')).toHaveText('2');
  await expect(fleet.locator('tfoot td')).toHaveText('2');
  // İlgili hizmet bağlantıları
  await expect(page.locator('main a[href="/hizmetler/altyapi-ve-kanalizasyon-kazisi/"]').first()).toBeVisible();
  await expect(page.locator('main a[href="/hizmetler/hafriyat-ve-temel-kazisi/"]').first()).toBeVisible();
  // Galeride mini ekskavatör fotoğrafı yok: başka makinenin fotoğrafı kullanılmaz (sayfa başlığında görsel yok)
  await expect(page.locator('.page-head-media')).toHaveCount(0);

  // Ekskavatör sayfası: paletli tablo AYNI (3 satır, toplam 7; mini karışmaz) + "Daha küçük işler için" bağlantısı
  await page.goto('/makine-kiralama/ekskavator-kiralama/');
  await expect(page.locator('[data-fleet] tbody tr')).toHaveCount(3);
  await expect(page.locator('[data-fleet] tfoot td')).toHaveText('7');
  await expect(page.locator('[data-fleet]')).not.toContainText('mini');
  const smaller = page.locator('.smaller-jobs a');
  await expect(page.locator('.smaller-jobs')).toContainText('Daha küçük işler için');
  await expect(smaller).toHaveAttribute('href', '/makine-kiralama/mini-ekskavator-kiralama/');

  // Makine listesinde mini ekskavatör kartı: fotoğraf yok (ikon)
  await page.goto('/makine-kiralama/');
  const card = page.locator('main .service-card', { hasText: 'Mini Ekskavatör Kiralama' });
  await expect(card).toHaveCount(1);
  await expect(card.locator('.service-card-media')).toHaveCount(0);
});
test('filo bilgisi: ekskavatör tablosu (22/30/35 ton, toplam 7), JCB 2 adet, sayı şeridi 7-2-7-2-13', async ({ page }) => {
  await page.goto('/makine-kiralama/ekskavator-kiralama/');
  const fleet = page.locator('[data-fleet]');
  await expect(fleet).toBeVisible();
  const rows = fleet.locator('tbody tr');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText('22 ton');
  await expect(rows.nth(0).locator('td')).toHaveText('3');
  await expect(rows.nth(1)).toContainText('30 ton');
  await expect(rows.nth(1).locator('td')).toHaveText('2');
  await expect(rows.nth(2)).toContainText('35 ton');
  await expect(rows.nth(2).locator('td')).toHaveText('2');
  await expect(fleet.locator('tfoot')).toContainText('Toplam');
  await expect(fleet.locator('tfoot td')).toHaveText('7');
  await expect(page.locator('main')).toContainText('22 ile 35 ton arası');

  await page.goto('/makine-kiralama/kiralik-kepce-jcb/');
  await expect(page.locator('main')).toContainText('Filomuzda 2 adet JCB');

  // Ana sayfa sayı şeridi, iki grup. Üst: 1.653 Tamamlanan iş, 1.500 Mutlu müşteri (ilçe kartı yok);
  // alt (Filomuz): 7 Paletli ekskavatör, 2 JCB, 7 Kamyon, 2 Lowbed tır. Sayılar Türkçe biçimli (1.653).
  await page.goto('/');
  await page.locator('[data-stats]').scrollIntoViewIfNeeded(); // sayaç görünüme girince 0'dan sayar; bitince son sayı
  const items = page.locator('.stats .stat');
  await expect(items).toHaveCount(7);
  const expected = [
    ['1.653', 'Tamamlanan iş'],
    ['1.500', 'Mutlu müşteri'],
    ['7', 'Paletli ekskavatör'],
    ['2', 'Mini ekskavatör'],
    ['2', 'JCB'],
    ['7', 'Kamyon'],
    ['2', 'Lowbed tır'],
  ];
  for (let i = 0; i < expected.length; i += 1) {
    // her öğe görünüme kaydırılır: sayaç öğe görününce (≥ %40) 0'dan sayar, bitince son sayı
    await items.nth(i).scrollIntoViewIfNeeded();
    await expect(items.nth(i).locator('.stat-value')).toHaveText(expected[i][0]);
    await expect(items.nth(i).locator('.stat-label')).toHaveText(expected[i][1]);
  }
  // "+" son eki yok (müşteri tam sayı verdi)
  await expect(page.locator('[data-stats] .stat-value', { hasText: '+' })).toHaveCount(0);
});

test('sayı şeridi: eğimli sarı bant + başlık, üst grup rozetli, filo grafit kartlı; sütunlar, taşma, renkler', async ({ page }) => {
  for (const [width, isColumns, filoColumns] of [
    [360, 2, 2],
    [390, 2, 2],
    [768, 2, 2],
    [1024, 2, 2],
    [1200, 2, 3],
    [1366, 2, 5],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const strip = page.locator('[data-stats]');
    await strip.scrollIntoViewIfNeeded();
    await expect(strip.locator('.stat')).toHaveCount(7);
    await expect(strip.locator('.stat-icon')).toHaveCount(7);
    await expect(strip.locator('.stats-grid--is .stat')).toHaveCount(2);
    await expect(strip).not.toContainText('İlçede hizmet');

    // Başlık: eyebrow "RAKAMLARLA" + h2 "Alperenler Hafriyat"
    await expect(strip.locator('.stats-eyebrow')).toHaveText('Rakamlarla');
    await expect(strip.locator('h2')).toHaveText('Alperenler Hafriyat');
    // İki grup + "Filomuz" etiketi
    await expect(strip.locator('.stats-grid--is')).toBeVisible();
    await expect(strip.locator('.stats-grid--filo')).toBeVisible();
    await expect(strip.locator('.stats-group-label')).toHaveText('Filomuz');
    await expect(strip.locator('.stats-grid--is .stat')).toHaveCount(2);
    await expect(strip.locator('.stats-grid--filo .stat--card')).toHaveCount(5);
    // Kartlar giriş animasyonundan sonra tam görünür: önce JS kurulumu + görünüme giriş (.is-in), sonra son kartın
    // (en uzun gecikmeli) animasyonu biter (opacity 1, transform yok). Aksi halde ölçüm animasyon sırasında yapılırdı.
    await expect(strip).toHaveClass(/is-in/);
    await expect
      .poll(() =>
        strip
          .locator('.stat')
          .evaluateAll((els) =>
            els.every((el) => getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none'),
          ),
      )
      .toBe(true);

    const css = await strip.evaluate((el) => {
      const q = (selector: string) => el.querySelector(selector) as Element;
      const style = (selector: string) => getComputedStyle(q(selector));
      // auto-fit boş sütunları 0 px'e çöker: yalnızca genişliği > 0 olan sütunlar sayılır
      const tracks = (selector: string) =>
        style(selector)
          .gridTemplateColumns.trim()
          .split(/\s+/)
          .filter((track) => parseFloat(track) > 0).length;
      const badge = q('.stat-badge').getBoundingClientRect();
      const card = q('.stat--card');
      const cardStyle = getComputedStyle(card);
      const divider = getComputedStyle(q('.stats-grid--is .stat + .stat'), '::before');
      return {
        bg: getComputedStyle(el).backgroundColor,
        clip: getComputedStyle(el).clipPath,
        valueColor: style('.stat-value').color,
        labelColor: style('.stat-label').color,
        isValueSize: parseFloat(style('.stats-grid--is .stat-value').fontSize),
        isLabelSize: parseFloat(style('.stats-grid--is .stat-label').fontSize),
        isColumns: tracks('.stats-grid--is'),
        // flex düzeni: ilk satırdaki kart sayısı = sütun sayısı
        filoColumns: (() => {
          const tops = Array.from(el.querySelectorAll('.stats-grid--filo .stat')).map((n) => Math.round(n.getBoundingClientRect().top));
          return tops.filter((top) => top === Math.min(...tops)).length;
        })(),
        badgeW: badge.width,
        badgeH: badge.height,
        badgeBg: style('.stat-badge').backgroundColor,
        badgeIconColor: style('.stat-badge .stat-icon').color,
        badgeIconW: q('.stat-badge .stat-icon').getBoundingClientRect().width,
        cardBg: cardStyle.backgroundColor,
        cardRadius: cardStyle.borderRadius,
        cardShadow: cardStyle.boxShadow,
        cardIconColor: getComputedStyle(card.querySelector('.stat-icon') as Element).color,
        cardIconW: (card.querySelector('.stat-icon') as Element).getBoundingClientRect().width,
        cardValueColor: getComputedStyle(card.querySelector('.stat-value') as Element).color,
        cardValueSize: parseFloat(getComputedStyle(card.querySelector('.stat-value') as Element).fontSize),
        cardLabelSize: parseFloat(getComputedStyle(card.querySelector('.stat-label') as Element).fontSize),
        dividerContent: divider.content,
        dividerWidth: divider.width,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        width: el.getBoundingClientRect().width,
        // "1.653" tek satır: yükseklik yazı boyutunun ~1.4 katını aşmaz
        firstValueLines:
          q('.stat-value').getBoundingClientRect().height / parseFloat(style('.stat-value').fontSize),
      };
    });
    expect(css.bg, 'zemin site sarısı').toBe('rgb(245, 180, 0)');
    expect(css.clip, 'üst/alt kenar eğimli (clip-path)').toContain('polygon');
    expect(css.valueColor, 'sayı grafit').toBe('rgb(20, 22, 26)');
    expect(css.labelColor, 'etiket grafit').toBe('rgb(20, 22, 26)');
    const mobile = width < 768; // < 48em: mobil ince ayar (dikey filo kartı, küçük rozet/sayı)
    if (mobile) {
      expect(css.isValueSize, 'mobil üst grup sayısı clamp(2.25rem, 10vw, 3rem)').toBeGreaterThanOrEqual(36);
      expect(css.isValueSize).toBeLessThanOrEqual(48);
    } else {
      expect(css.isValueSize, 'üst grup sayısı ≥ 3rem').toBeGreaterThanOrEqual(48);
    }
    expect(css.isLabelSize, 'etiket 1.0625rem').toBeCloseTo(17, 0);
    // Rozet: masaüstü 72 px (ikon 36 px); mobil 60 px (ikon 30 px); grafit daire, sarı ikon
    expect(Math.round(css.badgeW)).toBe(mobile ? 60 : 72);
    expect(Math.round(css.badgeH)).toBe(mobile ? 60 : 72);
    expect(css.badgeBg).toBe('rgb(20, 22, 26)');
    expect(css.badgeIconColor).toBe('rgb(245, 180, 0)');
    expect(Math.round(css.badgeIconW)).toBe(mobile ? 30 : 36);
    // Filo kartı: grafit, radius 14 px, gölge; sarı ikon (masaüstü 56 px, mobil 40 px); sayı kum
    // (masaüstü 2.5rem, mobil 2rem); etiket .9375rem
    expect(css.cardBg).toBe('rgb(20, 22, 26)');
    expect(css.cardRadius).toBe('14px');
    expect(css.cardShadow).not.toBe('none');
    expect(css.cardIconColor).toBe('rgb(245, 180, 0)');
    expect(Math.round(css.cardIconW)).toBe(mobile ? 40 : 56);
    expect(css.cardValueColor).toBe('rgb(239, 235, 228)');
    expect(css.cardValueSize).toBe(mobile ? 32 : 40);
    expect(css.cardLabelSize).toBeCloseTo(15, 0);    // Dikey ayraç yalnızca masaüstünde (≥ 64em)
    if (width >= 1024) {
      expect(css.dividerContent).not.toBe('none');
      expect(css.dividerWidth).toBe('1px');
    } else {
      expect(css.dividerContent === 'none' || css.dividerContent === 'normal').toBe(true);
    }
    expect(css.isColumns, `${width}px üst grup sütun`).toBe(isColumns);
    expect(css.filoColumns, `${width}px filo kart sütun`).toBe(filoColumns);
    expect(css.overflow, `${width}px yatay taşma`).toBeLessThanOrEqual(0);
    expect(Math.round(css.width), 'tam genişlik bant').toBe(width);
    expect(css.firstValueLines, `${width}px: 1.653 tek satır`).toBeLessThan(1.4);

    const topsOf = (selector: string) =>
      strip
        .locator(selector)
        .evaluateAll((nodes) => nodes.map((n) => Math.round(n.getBoundingClientRect().top)));
    const isTops = await topsOf('.stats-grid--is .stat');
    const filoTops = await topsOf('.stats-grid--filo .stat');
    const rows = (tops: number[]) => new Set(tops).size;
    expect(rows(isTops), `${width}px üst grup satır: ${isTops.join(', ')}`).toBe(1); // 2 kart her genişlikte tek satır
    expect(rows(filoTops), `${width}px filo satır: ${filoTops.join(', ')}`).toBe(Math.ceil(5 / filoColumns));
    // Filo kartlarında son satırda kalanlar ortalı (2 + 2 + 1 / 3 + 2)
    if (filoColumns > 1 && filoColumns < 5) {
      const boxes = (await strip.locator('.stats-grid--filo .stat').evaluateAll((nodes) =>
        nodes.map((n) => {
          const r = n.getBoundingClientRect();
          return { top: Math.round(r.top), left: r.left, right: r.right };
        }),
      ));
      const lastTop = boxes[boxes.length - 1].top;
      const lastRow = boxes.filter((b) => b.top === lastTop);
      const middle = (Math.min(...lastRow.map((b) => b.left)) + Math.max(...lastRow.map((b) => b.right))) / 2;
      expect(Math.abs(middle - width / 2), `${width}px: filo son satır ortalı`).toBeLessThanOrEqual(2);
    }
    if (mobile) {
      // Üst grup: yan yana iki sayı birbirine değmez (≥ 16 px; sütun boşluğu ≥ 1.25rem)
      const values = await strip.locator('.stats-grid--is .stat-value').evaluateAll((nodes) =>
        nodes.map((n) => {
          const r = n.getBoundingClientRect();
          return { top: Math.round(r.top), left: r.left, right: r.right };
        }),
      );
      expect(values[1].top, 'ilk iki sayı aynı satırda').toBe(values[0].top);
      expect(values[1].left - values[0].right, `${width}px: 1.653 ile 1.500 arası boşluk`).toBeGreaterThanOrEqual(16);
      // Filo: dikey kart (ikon üstte, sayı altında), metin ortalı; 5 kart aynı genişlikte, son kart ortalı
      const cards = await strip.locator('.stats-grid--filo .stat--card').evaluateAll((nodes) =>
        nodes.map((n) => {
          const r = n.getBoundingClientRect();
          const icon = (n.querySelector('.stat-icon') as Element).getBoundingClientRect();
          const value = (n.querySelector('.stat-value') as Element).getBoundingClientRect();
          return {
            width: Math.round(r.width),
            iconAboveValue: icon.bottom <= value.top + 1,
            align: getComputedStyle(n).textAlign,
            clipped: n.scrollWidth > n.clientWidth + 1,
          };
        }),
      );
      expect(new Set(cards.map((c) => c.width)).size, `${width}px: kart genişlikleri eşit: ${cards.map((c) => c.width).join(', ')}`).toBe(1);
      for (const card of cards) {
        expect(card.iconAboveValue, 'ikon sayının üstünde (dikey kart)').toBe(true);
        expect(card.align).toBe('center');
        expect(card.clipped, 'kart içeriği taşmaz').toBe(false);
      }
    }
    if (width >= 640) {
      // 40em ve üstünde üst grup 3 sütun yan yana; sayılar birbirine değmez (≥ 16 px)
      const values = await strip.locator('.stats-grid--is .stat-value').evaluateAll((nodes) =>
        nodes.map((n) => {
          const r = n.getBoundingClientRect();
          return { top: Math.round(r.top), left: r.left, right: r.right };
        }),
      );
      expect(new Set(values.map((v) => v.top)).size, `${width}px: 3 sayı aynı satırda`).toBe(1);
      for (let k = 1; k < values.length; k += 1) {
        expect(values[k].left - values[k - 1].right, `${width}px: sayılar arası boşluk`).toBeGreaterThanOrEqual(16);
      }
    }
    // Gruplar alt alta
    expect(Math.min(...filoTops)).toBeGreaterThan(Math.max(...isTops));
  }
});

test('sayı şeridi: "22–35 ton" notu ekskavatör kartında, "3 ton" notu yalnız mini ekskavatör kartında (machines.ts filo verisinden)', async ({ page }) => {
  await page.goto('/');
  const notes = page.locator('[data-stats] .stat-note');
  // Not satırı iki kartta: paletli ekskavatör ("22–35 ton") ve mini ekskavatör ("3 ton"); diğerlerinde yok
  await expect(notes).toHaveCount(2);
  await expect(notes.nth(0)).toHaveText('22–35 ton');
  await expect(notes.nth(1)).toHaveText('3 ton');
  await expect(page.locator('[data-stats] .stat--card', { hasText: 'Mini ekskavatör' }).locator('.stat-note')).toHaveText('3 ton');
  await expect(page.locator('[data-stats] .stat--card', { hasText: 'JCB' }).locator('.stat-note')).toHaveCount(0);
  await expect(page.locator('[data-stats] .stat--card').first()).toContainText('Paletli ekskavatör');
  await expect(page.locator('[data-stats] .stat--card').first().locator('.stat-note')).toHaveCount(1);
  // not rengi kum, opacity .75
  const note = await notes.first().evaluate((el) => ({
    color: getComputedStyle(el).color,
    opacity: getComputedStyle(el).opacity,
  }));
  expect(note.color).toBe('rgb(239, 235, 228)');
  expect(note.opacity).toBe('0.75');
});
test('sayı şeridi: hareket azaltmada animasyon yok, son sayılar hemen görünür (1.653 / 1.500 / 7 / 2 / 2 / 7 / 2)', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('[data-stats]').scrollIntoViewIfNeeded();
  // Tek ölçüm (bekleme/yeniden deneme yok): sayaç çalışmıyorsa ilk okumada son değer vardır
  const values = await page.locator('[data-stats] .stat-value').evaluateAll((nodes) =>
    nodes.map((node) => node.textContent?.trim()),
  );
  expect(values).toEqual(['1.653', '1.500', '7', '2', '2', '7', '2']);
  // Hareket azaltmada kartlar gizlenip kaydırılmaz: ilk okumada tam görünür
  const cardStates = await page.locator('[data-stats] .stat--card').evaluateAll((nodes) =>
    nodes.map((n) => ({ opacity: getComputedStyle(n).opacity, transform: getComputedStyle(n).transform })),
  );
  for (const state of cardStates) {
    expect(state.opacity).toBe('1');
    expect(state.transform).toBe('none');
  }
});

test('sayı şeridi: sayaç ara değerleri de Türkçe biçimli (1.234 gibi) ve sonunda 1.653', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('[data-stats] .stat-value').first();
  const seen = new Set<string>();
  await first.scrollIntoViewIfNeeded();
  // Sayım ~1.2 sn sürer: 40 ms aralıkla örnekle
  for (let i = 0; i < 40; i += 1) {
    seen.add(((await first.textContent()) ?? '').trim());
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  await expect(first).toHaveText('1.653');
  for (const text of seen) {
    // her değer ya 0-999 arası düz sayı ya da "N.NNN" biçimli olmalı; "1653" gibi biçimsiz değer olmamalı
    expect(text, `ara değer: ${text}`).toMatch(/^(\d{1,3}|\d{1,3}(\.\d{3})+)$/);
  }
});
test('onaylı (normal build) sayfalarda "13 ton" geçmez', async ({ page, request }) => {
  const pages = await crawl(page);
  expect(pages.length).toBeGreaterThan(10);
  const problems: string[] = [];
  for (const path of pages) {
    const html = await (await request.get(path)).text();
    // Dosya yolları hariç (src/srcset/data-webp/poster... değeri /images/, /videos/ veya /_astro/ içerenler):
    // görünen metin, alt/aria/title ve meta içerikleri taranır
    const text = html.replace(/\s[\w:-]+="[^"]*\/(?:images|videos|_astro)\/[^"]*"/gi, '');
    if (/13\s*ton/i.test(text)) problems.push(`${path}: "13 ton"`);
  }
  expect(problems, problems.join('\n')).toEqual([]);
});

test('SSS: bölge cevabı tüm ilçeleri listeler', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('.faq-item', { hasText: 'Hangi bölgelere hizmet veriyorsunuz?' });
  await faq.locator('summary').click();
  await expect(faq).toContainText('Malatya merkez, ilçeleri ve şehir dışındaki projelerde hizmet veriyoruz.');
  await expect(faq).toContainText('Yeşilyurt');
  await expect(faq).toContainText('Yazıhan');
  await expect(faq).toContainText('Bulunduğunuz yeri yazın veya arayın.');

});

const EMAIL = 'alperenler.hrf.ltd@gmail.com';

test('e-posta: iletişim sayfasında ve footer harita kartında mailto var; JSON-LD email doğru; unvan gizlilikte', async ({
  page,
}) => {
  const mailto = `a[href="mailto:${EMAIL}"]`;
  // İletişim sayfası: ikonlu e-posta kartı
  await page.goto('/iletisim/');
  const contact = page.locator(`.contact-card ${mailto}`);
  await expect(contact).toBeVisible();
  await expect(contact.locator('svg.icon')).toHaveCount(1);
  await expect(contact).toContainText(EMAIL);
  const ld = (
    await page.locator('script[type="application/ld+json"]').evaluateAll((n) => n.map((x) => x.textContent ?? ''))
  ).join('\n');
  expect(ld).toContain(`"email":"${EMAIL}"`);
  expect(ld).toContain('"legalName":"Alperenler Hafriyat İnşaat Taah. Pet. Tar. İth. İhr. San. ve Tic. Ltd. Şti."');

  // Footer (harita/iletişim kartı) ana sayfada
  await page.goto('/');
  await expect(page.locator(`footer ${mailto}`)).toHaveCount(1);
  const homeLd = (
    await page.locator('script[type="application/ld+json"]').evaluateAll((n) => n.map((x) => x.textContent ?? ''))
  ).join('\n');
  expect(homeLd).toContain(`"email":"${EMAIL}"`);
  await expect(page.locator('footer')).toContainText('Alperenler Hafriyat İnşaat Taah. Pet. Tar. İth. İhr. San. ve Tic. Ltd. Şti.');

  // Gizlilik: ticari unvan + KVKK veri sorumlusu ünvanla, e-posta eklenmiş (yer tutucu kalmadı)
  await page.goto('/gizlilik/');
  const facts = page.locator('.facts');
  await expect(facts.locator('div', { hasText: 'Ticari unvan' })).toContainText('Alperenler Hafriyat İnşaat Taah. Pet. Tar. İth. İhr. San. ve Tic. Ltd. Şti.');
  await expect(facts.locator('div', { hasText: 'KVKK veri sorumlusu' })).toContainText('Alperenler Hafriyat İnşaat Taah. Pet. Tar. İth. İhr. San. ve Tic. Ltd. Şti.');
  await expect(facts.locator(mailto)).toBeVisible();
});

test('e-posta 360 px: iletişim, ana sayfa footer ve gizlilik sayfasında yatay taşma yok', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ['/iletisim/', '/', '/gizlilik/']) {
    await page.goto(path);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const mail = page.locator(`a[href="mailto:${EMAIL}"]`).first();
    await expect(mail).toBeVisible();
    const box = (await mail.boundingBox()) as { x: number; width: number };
    expect(box.x + box.width, `${path}: e-posta bağlantısı ekran içinde`).toBeLessThanOrEqual(360 + 0.5);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} yatay taşma`).toBeLessThanOrEqual(0);
  }
});
test('e-posta satır kırılımı: tek satır ya da YALNIZCA "@" öncesinden; ".c / om" gibi kırılma yok (360/390/768/1366)', async ({
  page,
}) => {
  // Bir öğedeki metnin satır başlangıç karakterleri (ilk satır hariç): kırılma "@" öncesinde olmalı
  const breaks = (selector: string) =>
    page.evaluate((sel) => {
      const el = document.querySelector(sel) as Element;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const lines: number[] = [];
      const starts: string[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node.textContent ?? '';
        for (let i = 0; i < text.length; i += 1) {
          const range = document.createRange();
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const rect = range.getClientRects()[0];
          if (!rect) continue;
          const top = Math.round(rect.top);
          if (lines.length > 0 && top > lines[lines.length - 1] + 2) starts.push(text[i]);
          lines.push(top);
        }
      }
      return { starts, lineCount: new Set(lines.map((l) => Math.round(l / 4))).size };
    }, selector);

  for (const width of [360, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, selector] of [
      ['/iletisim/', '.contact-card .mail-text'],
      ['/', 'footer .mail-text'],
      ['/gizlilik/', '.facts-mail .mail-text'],
    ] as const) {
      await page.goto(path);
      const result = await breaks(selector);
      expect(result.starts, `${path} @${width}: satır başı karakterleri`).toEqual(result.starts.map(() => '@'));
      expect(result.starts.length, `${path} @${width}: en çok bir kırılma (@ öncesi)`).toBeLessThanOrEqual(1);
    }
  }

  // İletişim kartında e-posta yazısı telefon numarasından küçük (1.0625rem, 600) ve masaüstünde tek satır
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/iletisim/');
  const sizes = await page.evaluate(() => {
    const mail = document.querySelector('.contact-value--mail') as Element;
    const phone = document.querySelector('.contact-card .contact-value:not(.contact-value--mail)') as Element;
    return {
      mail: parseFloat(getComputedStyle(mail).fontSize),
      weight: getComputedStyle(mail).fontWeight,
      phone: parseFloat(getComputedStyle(phone).fontSize),
      wrap: getComputedStyle(mail).overflowWrap,
    };
  });
  expect(sizes.mail).toBe(17);
  expect(sizes.weight).toBe('600');
  expect(sizes.mail).toBeLessThan(sizes.phone);
  expect(sizes.wrap, 'overflow-wrap: anywhere bu kartta kullanılmaz').toBe('break-word');
  expect((await breaks('.contact-card .mail-text')).starts).toEqual([]); // masaüstünde tek satır
});

test('gizlilik: barındırma sağlayıcısı "Cloudflare, Inc."; yalnızca son güncelleme yer tutucu kalır', async ({ page }) => {
  await page.goto('/gizlilik/');
  await expect(page.locator('main')).toContainText('Sağlayıcı ve ayrıntılar: Cloudflare, Inc.');
  // Yer tutucu yalnızca son güncelleme (taslak uyarısı showDrafts'a bağlı olabilir; metin her zaman var)
  await expect(page.locator('.facts div', { hasText: 'Son güncelleme' })).toContainText('[firma tarafından doldurulacak]');
  await expect(page.locator('mark.todo')).toHaveCount(1);
});
test('resmi bilgiler: footer (ünvan, MERSİS, sicil, V.D.), gizlilik (vergi no dolu), JSON-LD legalName/taxID/MERSİS; 360 px taşma yok', async ({
  page,
}) => {
  const TITLE = 'Alperenler Hafriyat İnşaat Taah. Pet. Tar. İth. İhr. San. ve Tic. Ltd. Şti.';
  await page.goto('/');
  const bottom = page.locator('footer .footer-bottom');
  await expect(bottom).toContainText(`© ${new Date().getFullYear()} ${TITLE}`);
  const ids = page.locator('footer .footer-ids');
  await expect(ids).toContainText('MERSİS No: 0057060231800001 · Ticaret Sicil No: 27135 · Beydağı V.D. 0570602318');
  // kısa ad başlık ve metinlerde aynı kalır
  await expect(page).toHaveTitle(/Alperenler Hafriyat \| Malatya Yeşilyurt/);
  const ld = (
    await page.locator('script[type="application/ld+json"]').evaluateAll((n) => n.map((x) => x.textContent ?? ''))
  ).join('\n');
  expect(ld).toContain(`"legalName":"${TITLE}"`);
  expect(ld).toContain('"taxID":"0570602318"');
  expect(ld).toContain('"@type":"PropertyValue"');
  expect(ld).toContain('"propertyID":"MERSİS"');
  expect(ld).toContain('"value":"0057060231800001"');

  await page.goto('/gizlilik/');
  const facts = page.locator('.facts');
  await expect(facts.locator('div', { hasText: 'Ticari unvan' })).toContainText(TITLE);
  await expect(facts.locator('div', { hasText: 'KVKK veri sorumlusu' })).toContainText(TITLE);
  await expect(facts.locator('div', { hasText: 'Vergi no' })).toContainText('Beydağı V.D. – 0570602318');
  await expect(facts.locator('div', { hasText: 'MERSİS No' })).toContainText('0057060231800001');
  await expect(facts.locator('div', { hasText: 'Ticaret Sicil No' })).toContainText('27135');
  // yalnızca "son güncelleme" yer tutucu kalır
  await expect(page.locator('mark.todo')).toHaveCount(1);
  await expect(facts.locator('div', { hasText: 'Son güncelleme' }).locator('mark.todo')).toHaveCount(1);

  // 360 px: footer alt satırları ve gizlilik sayfasında taşma yok; kayıt satırı "·" ayraçlarında kırılır
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ['/', '/gizlilik/']) {
    await page.goto(path);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} 360px yatay taşma`).toBeLessThanOrEqual(0);
  }
  await page.goto('/');
  const idsBox = (await page.locator('footer .footer-ids p').boundingBox()) as { x: number; width: number };
  expect(idsBox.x + idsBox.width, 'kayıt bilgileri satırı ekran içinde').toBeLessThanOrEqual(360 + 0.5);
  const itemBoxes = await page
    .locator('footer .footer-ids span')
    .evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().right));
  for (const right of itemBoxes) expect(right, 'kayıt öğesi ekran içinde').toBeLessThanOrEqual(360 + 0.5);
});
test('galeri: aynı dosya içeriğine (hash) sahip iki fotoğraf yok; ana sayfa Sahadan sırası', async ({ page, request }) => {
  await page.goto('/galeri/');
  // Galerideki her fotoğrafın JPG kaynağı indirilir ve SHA-256 hash'i hesaplanır
  const sources = await page
    .locator('.gallery-open[data-kind="image"]')
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.src ?? ''));
  expect(sources.length, 'galeride fotoğraf yok').toBeGreaterThan(5);
  const byHash = new Map<string, string[]>();
  for (const src of sources) {
    const response = await request.get(src);
    expect(response.status(), src).toBe(200);
    const hash = createHash('sha256').update(await response.body()).digest('hex');
    byHash.set(hash, [...(byHash.get(hash) ?? []), src]);
  }
  const duplicates = [...byHash.values()].filter((list) => list.length > 1);
  expect(duplicates, `yinelenen fotoğraf dosyaları: ${JSON.stringify(duplicates)}`).toEqual([]);
  // Aynı kaynak adı iki kez de verilmemiş olmalı
  expect(new Set(sources).size).toBe(sources.length);

  // Ana sayfa "Sahadan": ilk iki öne çıkan öğe şantiye temel kazısı fotoğrafı ve şehir içi drone videosu
  await page.goto('/');
  const firstTwo = await page
    .locator('.gallery-grid--home .gallery-open')
    .evaluateAll((nodes) =>
      nodes.slice(0, 2).map((node) => {
        const data = (node as HTMLElement).dataset;
        return data.src ?? data.video ?? '';
      }),
    );
  expect(firstTwo[0]).toContain('santiye-temel-kazisi');
  expect(firstTwo[1]).toContain('drone-sehir-ici-temel-kazisi');
});
test('hakkımızda: fotoğraf şeridi lightbox açar', async ({ page }) => {
  await page.goto('/hakkimizda/');
  await expect(page.locator('h1')).toHaveCount(1);
  const opener = page.locator('.gallery-open[data-kind="image"]');
  test.skip((await opener.count()) === 0, 'Galeride görsel yok (medya dosyaları eklenmemiş)');
  expect(await opener.count()).toBeLessThanOrEqual(4);

  const dialog = page.locator('[data-lightbox]');
  const isOpen = () => dialog.evaluate((element) => (element as HTMLDialogElement).open);
  await opener.first().click();
  await expect.poll(isOpen).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(isOpen).toBe(false);
});

test('teklif sihirbazı: ?yer= ile yer alanı ön-dolu gelir ve mesaja yazılır', async ({ page }) => {
  await page.goto('/teklif/?yer=Ye%C5%9Filyurt');
  await expect(page.locator('[data-wizard-app]')).toBeVisible();
  await expect(page.locator('#wizard-place')).toHaveValue('Yeşilyurt');

  const choices = page.locator('.choice');
  if ((await choices.count()) > 0) {
    await choices.first().click();
  } else {
    await page.locator('#wizard-job-text').fill('Temel kazısı');
  }
  await page.locator('[data-step]').nth(0).locator('[data-action="next"]').click();
  await expect(page.locator('#wizard-place')).toHaveValue('Yeşilyurt');
  await page.locator('[data-step]').nth(1).locator('[data-action="next"]').click();
  await page.locator('[data-step]').nth(2).locator('[data-action="next"]').click();
  await expect(page.locator('[data-preview]')).toContainText('Yer: Yeşilyurt');
});

test.describe('mobil 390x844', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('menü açılıp kapanır ve sayfa geçişi sonrası tekrar açılır', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.nav-toggle');
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-nav')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await page.locator('#site-nav a[href="/hakkimizda/"]').click();
    await expect(page).toHaveURL(/\/hakkimizda\/$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // ClientRouter geçişinden sonra menü hâlâ çalışmalı
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-nav')).toBeVisible();
  });

  test('tam ekran menü: viewport\'u kaplar, altındaki sayfa tıklanamaz, alt çubuk gizli, kaydırma kilitli, Escape kapatır', async ({
    page,
  }) => {
    await page.goto('/');
    const toggle = page.locator('.nav-toggle');
    const header = page.locator('.site-header');
    await toggle.click();
    await expect(header).toHaveClass(/is-open/);
    await expect(toggle).toHaveText('Kapat'); // "Kapat" görünür ve header üstte

    // Panel viewport'u tamamen kaplar
    const vp = page.viewportSize() as { width: number; height: number };
    const box = (await header.boundingBox()) as { x: number; y: number; width: number; height: number };
    expect(Math.abs(box.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.width - vp.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(box.height - vp.height)).toBeLessThanOrEqual(2);
    // Opak koyu zemin
    const bg = await header.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

    // Altındaki hero butonunun olduğu noktada hero öğesi değil menü bulunur
    const heroBtn = (await page.locator('.hero .btn-primary').first().boundingBox()) as {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    const hitHero = await page.evaluate(
      ([x, y]) => {
        const el = document.elementFromPoint(x, y);
        return Boolean(el && el.closest('.hero'));
      },
      [heroBtn.x + heroBtn.width / 2, heroBtn.y + heroBtn.height / 2],
    );
    expect(hitHero, 'hero butonu menünün altında tıklanamaz olmalı').toBe(false);

    // Yüzen WhatsApp düğmesi gizli, gövde kaydırması kilitli
    await expect(page.locator('.floating-actions')).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');

    // Linkler büyük: ≥ 56 px satır, ≈ 22 px yazı; altta büyük "Hemen Ara" + adres
    const link = page.locator('#site-nav ul a').first();
    const linkBox = (await link.boundingBox()) as { height: number };
    expect(linkBox.height).toBeGreaterThanOrEqual(55.5);
    expect(parseFloat(await link.evaluate((el) => getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(21.5);
    await expect(page.locator('#site-nav .nav-extra .btn-primary')).toBeVisible();
    await expect(page.locator('#site-nav .nav-address')).toContainText('Yeşilyurt');

    // Escape kapatır, odak "Menü" düğmesine döner, kilit kalkar
    await page.keyboard.press('Escape');
    await expect(header).not.toHaveClass(/is-open/);
    await expect(toggle).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
    await expect(page.locator('.floating-actions')).toHaveCSS('display', 'flex');
  });

  test('mobil ana sayfa: header en üstte şeffaf (y=0), hero y≈0, logo kartı 56 px; kaydırınca koyu', async ({
    page,
  }) => {
    await page.goto('/');
    const header = page.locator('.site-header');
    const hb = (await header.boundingBox()) as { y: number };
    expect(hb.y).toBe(0);
    const style = await header.evaluate((el) => {
      const css = getComputedStyle(el);
      return { bg: css.backgroundColor, shadow: css.boxShadow };
    });
    expect(style.bg).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    expect(style.shadow).toBe('none');
    const hero = (await page.locator('.hero').boundingBox()) as { y: number };
    expect(hero.y).toBeLessThanOrEqual(0.5);
    const card = (await page.locator('.site-header .logo-card').boundingBox()) as { height: number };
    expect(Math.abs(card.height - 56)).toBeLessThanOrEqual(1);
    // Logo + yazı + "Menü" TEK satırda: header tam piksel 72 px (iki satıra düşerse 128 px olurdu)
    const headerBox = (await header.boundingBox()) as { height: number };
    expect(headerBox.height, 'mobil header tek satır ve tam piksel').toBeCloseTo(72, 0);
    const toggleBox = (await page.locator('.nav-toggle').boundingBox()) as { y: number; height: number };
    expect(toggleBox.y + toggleBox.height).toBeLessThanOrEqual(72);

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect
      .poll(() => header.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  });

  test('hizmetler 390px: kartlar tek sütun, başlık ≥ 18 px, açıklama ≥ 15 px', async ({ page }) => {
    await page.goto('/hizmetler/');
    const columns = await page
      .locator('.card-grid')
      .first()
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
    expect(columns).toBe(1);
    const sizes = await page.locator('.service-card').first().evaluate((el) => ({
      h3: parseFloat(getComputedStyle(el.querySelector('h3') as Element).fontSize),
      p: parseFloat(getComputedStyle(el.querySelector('p') as Element).fontSize),
    }));
    expect(sizes.h3).toBeGreaterThanOrEqual(18);
    expect(sizes.p).toBeGreaterThanOrEqual(15);
  });

  test('yatay taşma yok', async ({ page }) => {
    for (const path of ['/', '/hakkimizda/', '/iletisim/', '/teklif/', '/galeri/', '/gizlilik/']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${path} yatay taşma (px)`).toBeLessThanOrEqual(0);
    }
  });
});

test('galeri: lightbox açılır, Escape kapatır, sayfa geçişinden sonra yine açılır', async ({ page }) => {
  await page.goto('/galeri/');
  const opener = page.locator('.gallery-open[data-kind="image"]');
  test.skip((await opener.count()) === 0, 'Galeride görsel yok (medya dosyaları eklenmemiş)');

  const dialog = page.locator('[data-lightbox]');
  const isOpen = () => dialog.evaluate((element) => (element as HTMLDialogElement).open);

  await opener.first().click();
  await expect.poll(isOpen).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(isOpen).toBe(false);

  // Başka sayfaya (ClientRouter) geç ve geri dön
  await page.locator('header .brand').click();
  await expect(page).toHaveURL(/\/$/);
  // Mobilde (hamburger menü) menü kapalıyken bağlantıya tıklanamaz: önce menü düğmesi
  const toggle = page.locator('.nav-toggle');
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
  await page.locator('#site-nav a[href="/galeri/"]').click();
  await expect(page).toHaveURL(/\/galeri\/$/);

  await page.locator('.gallery-open[data-kind="image"]').first().click();
  await expect.poll(isOpen).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(isOpen).toBe(false);
});

test('teklif sihirbazı: 3 adım doldurulur, WhatsApp bağlantısında mesaj olur', async ({ page }) => {
  await page.goto('/teklif/');
  await expect(page.locator('[data-wizard-app]')).toBeVisible();

  // 1. adım: hizmet kartı varsa ilkini seç, yoksa serbest metin
  const choices = page.locator('.choice');
  if ((await choices.count()) > 0) {
    await choices.first().click();
  } else {
    await page.locator('#wizard-job-text').fill('Temel kazısı');
  }
  await page.locator('[data-step]').nth(0).locator('[data-action="next"]').click();

  // 2. adım
  await page.locator('#wizard-place').fill('Deneme mahallesi');
  await page.locator('[data-step]').nth(1).locator('[data-action="next"]').click();

  // 3. adım
  await page.locator('#wizard-note').fill('Deneme notu');
  await page.locator('.pill', { hasText: 'Acil' }).click();
  await page.locator('[data-step]').nth(2).locator('[data-action="next"]').click();

  const preview = page.locator('[data-preview]');
  await expect(preview).toContainText('Merhaba, web sitenizden ulaşıyorum.');
  await expect(preview).toContainText('Yer: Deneme mahallesi');
  await expect(preview).toContainText('Zaman: Acil');
  await expect(preview).toContainText('Not: Deneme notu');

  const href = await page.locator('[data-wa-link]').getAttribute('href');
  expect(href).not.toBeNull();
  expect(href as string).toContain(`${WA_BASE}?text=`);
  const message = decodeURIComponent((href as string).split('?text=')[1]);
  expect(message).toContain('Deneme mahallesi');
  expect(message).toContain('Acil');
});

test('hero videosu iOS/Android uyumlu: muted + playsinline; oynatma reddedilirse (düşük güç modu) poster kalır', async ({
  page,
}) => {
  // play() her zaman reddedilir: iOS düşük güç modu benzetimi
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('düşük güç', 'NotAllowedError'));
  });
  await page.goto('/');
  const media = page.locator('[data-hero-media]');
  test.skip((await media.count()) === 0, 'Hero videosu yok (video dosyaları eklenmemiş)');

  const video = media.locator('video').first();
  await expect(video).toHaveCount(1);
  expect(
    await video.evaluate((node) => {
      const el = node as HTMLVideoElement;
      return el.muted && el.playsInline;
    }),
  ).toBe(true);
  await expect(video).toHaveAttribute('playsinline', '');
  await expect(video).toHaveAttribute('muted', '');
  // Oynatılamadı: video görünür olmaz (poster altta kalır), düğme "Oynat" durumuna geçer
  await expect(media.locator('video.is-visible')).toHaveCount(0);
  await expect(page.locator('[data-hero-toggle]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.hero-poster img')).toBeVisible();
});

test('dokunma hedefleri ≥ 44px (mobil cihazlarda)', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'yalnızca mobil cihaz projeleri');
  for (const path of ['/', '/teklif/', '/iletisim/', '/galeri/', '/hakkimizda/']) {
    await page.goto(path);
    const small: string[] = [];
    for (const handle of await page
      .locator('.btn, button, .nav-toggle, .wa-float, .site-footer a')
      .elementHandles()) {
      const box = await handle.boundingBox();
      if (!box || !(await handle.isVisible())) continue;
      // Metin içi (p, li, dd içindeki satır içi) bağlantılar WCAG 2.5.8 istisnasıdır; menü/footer/düğme/çubuk hariç tutulmaz
      const inlineInText = await handle.evaluate((node) => {
        const el = node as Element;
        return (
          el.tagName === 'A' &&
          Boolean(el.closest('p, li, dd, address')) &&
          !el.closest('footer, nav, header, .floating-actions') &&
          !el.matches('.btn, button')
        );
      });
      if (inlineInText) continue;
      if (box.width < 43.5 || box.height < 43.5) {
        small.push(
          `${await handle.evaluate((node) => {
            const el = node as Element;
            return el.tagName.toLowerCase() + '.' + (el.getAttribute('class') ?? '');
          })} ${Math.round(box.width)}×${Math.round(box.height)}`,
        );
      }
    }
    expect(small, `${path} küçük dokunma hedefleri`).toEqual([]);
  }
});

test('mobil: odaklanan sihirbaz alanı ekranın altında kalmaz', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'yalnızca mobil cihaz projeleri');
  await page.goto('/teklif/');
  const choices = page.locator('.choice');
  if ((await choices.count()) > 0) await choices.first().click();
  else await page.locator('#wizard-job-text').fill('Temel kazısı');
  await page.locator('[data-step]').nth(0).locator('[data-action="next"]').click();
  await page.locator('#wizard-place').focus(); // odak, alanı scroll-margin ile görünüme kaydırır
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const field = (await page.locator('#wizard-place').boundingBox()) as { y: number; height: number };
  expect(field.y + field.height, 'alan ekranın altında kalmamalı').toBeLessThanOrEqual(
    (page.viewportSize() as { height: number }).height,
  );
});

test('masaüstü yüzen WhatsApp düğmesi: görünür, wa.me bağlantılı, kaydırınca ikona daralır, hover\'da açılır', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'masaüstü projesi');
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  const wa = page.locator('.wa-float');
  await expect(wa).toHaveAttribute('aria-label', 'WhatsApp ile teklif için yazın');
  await expect(wa).toHaveAttribute('href', new RegExp(`^${WA_BASE.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}`));

  // Hero görünürken gizli; aşağı inince belirir, 600 px sonrası yalnızca ikon
  // "Yukarı çık" sayfanın yarısından sonra (scrollY > (scrollHeight − innerHeight) / 2) görünür:
  // sabit 1600 px uzun ana sayfada yarıyı geçmez, bu yüzden toplam yüksekliğin %60'ına kaydırılır.
  await page.evaluate(() => window.scrollTo(0, (document.scrollingElement as Element).scrollHeight * 0.6));
  await expect(wa).toBeVisible();
  await expect(wa).toHaveClass(/is-compact/);
  await expect.poll(async () => Math.round(((await wa.boundingBox()) as { width: number }).width)).toBeLessThanOrEqual(60);
  await expect(page.locator('.to-top')).toBeVisible();

  await wa.hover();
  await expect(wa.locator('.wa-float-big')).toHaveText('Teklif için yazın');
  await expect.poll(async () => ((await wa.boundingBox()) as { width: number }).width).toBeGreaterThan(120);
});

test('telefonda yüzen WhatsApp: alt çubuk yok, hero sonrası belirir, ilk anda yazılı sonra ikon, /iletisim/da hemen görünür', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.call-bar')).toHaveCount(0);
  const wa = page.locator('.wa-float');
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\//);
  await expect(page.locator('.to-top')).toBeHidden();
  await page.waitForTimeout(600);
  await expect(wa).not.toHaveClass(/is-shown/);

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await expect(wa).toHaveClass(/is-shown/);
  await expect(wa).not.toHaveClass(/is-compact/);
  await expect(wa.locator('.wa-float-big')).toHaveText('Teklif için yazın');
  await expect(wa).toHaveClass(/is-compact/, { timeout: 7000 });
  await expect.poll(async () => Math.round(((await wa.boundingBox()) as { width: number }).width)).toBeLessThanOrEqual(60);
  const box = (await wa.boundingBox()) as { x: number; y: number; width: number; height: number };
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  expect(box.x).toBeGreaterThanOrEqual(0);

  await page.goto('/iletisim/');
  await expect(page.locator('.wa-float')).toHaveClass(/is-shown/);
});

test.describe('masaüstü header tek satır', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'masaüstü projesi');
  });

  for (const size of [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1600, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test(`${size.width}x${size.height}: büyük logolu header tek satır, kaydırınca küçülür, üstte boşluk yok`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto('/');

      // Sayfa en üstteyken büyük logo kartı: 88 px (100em'den itibaren 80 px) + 2 × 14 px dolgu
      const maxTop = size.width >= 1600 ? 108.5 : 116.5;
      const header = (await page.locator('.site-header').boundingBox()) as { y: number; height: number };
      expect(header, 'header ölçülemedi').not.toBeNull();
      expect(header.height).toBeLessThanOrEqual(maxTop);
      expect(header.y, 'header sayfanın en üstünde (fixed)').toBe(0);
      const card = (await page.locator('.site-header .logo-card').boundingBox()) as { y: number; height: number };
      expect(card.height, 'üstteki logo kartı yüksekliği').toBeGreaterThanOrEqual(79);
      // Logo kartı header sınırları içinde: taşmaz, kesilmez
      expect(card.y, 'kart üstü header içinde').toBeGreaterThanOrEqual(header.y);
      expect(card.y + card.height, 'kart altı header içinde').toBeLessThanOrEqual(header.y + header.height);
      // Hero sayfasında header en üstteyken TAMAMEN şeffaf: arka plan, gölge, blur yok
      const topStyle = await page.locator('.site-header').evaluate((el) => {
        const css = getComputedStyle(el);
        return { bg: css.backgroundColor, shadow: css.boxShadow, blur: css.backdropFilter };
      });
      expect(topStyle.bg, 'header arka planı şeffaf').toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      expect(topStyle.shadow).toBe('none');
      expect(topStyle.blur).toBe('none');
      // Menü ve "Hemen Ara" logoyla dikeyde ortalı (±6 px)
      const cardMid = card.y + card.height / 2;
      const callBox = (await page.locator('.header-call').boundingBox()) as { y: number; height: number };
      expect(Math.abs(callBox.y + callBox.height / 2 - cardMid)).toBeLessThanOrEqual(6);
      const navBox = (await page.locator('#site-nav').boundingBox()) as { y: number; height: number };
      expect(Math.abs(navBox.y + navBox.height / 2 - cardMid)).toBeLessThanOrEqual(6);

      // Görünür menü öğelerinin üst konumları eşit olmalı (tek satır)
      const tops = await page.$$eval('#site-nav a', (anchors) =>
        anchors
          .filter((anchor) => (anchor as HTMLElement).offsetParent !== null)
          .map((anchor) => Math.round(anchor.getBoundingClientRect().top)),
      );
      expect(tops.length).toBeGreaterThan(0);
      expect(new Set(tops).size, `menü öğesi üst konumları: ${tops.join(', ')}`).toBe(1);

      // "Ana Sayfa" menünün ilk öğesi olarak görünür; "Hemen Ara" tek satır
      await expect(page.locator('#site-nav a[href="/"]')).toBeVisible();
      await expect(page.locator('#site-nav a').first()).toHaveAttribute('href', '/');
      // Header telefonu yalnızca 1600 px ve üstünde görünür
      if (size.width >= 1600) await expect(page.locator('.header-phone')).toBeVisible();
      else await expect(page.locator('.header-phone')).toBeHidden();
      const call = await page.locator('.header-call').boundingBox();
      expect((call as { height: number }).height).toBeLessThanOrEqual(56);

      // Hero, sayfanın en üstünden (y = 0) başlar: header onun üstünde durur, hiçbir şerit yok
      const hero = await page.locator('.hero').boundingBox();
      expect((hero as { y: number }).y).toBeLessThanOrEqual(0.5);

      // Aşağı kaydırınca kart ≈ 60 px'e küçülür, header 76 px olur, hâlâ tek satır
      await page.evaluate(() => window.scrollTo(0, 400));
      await expect
        .poll(async () => ((await page.locator('.site-header .logo-card').boundingBox()) as { height: number }).height)
        .toBeLessThanOrEqual(61);
      expect(((await page.locator('.site-header').boundingBox()) as { height: number }).height).toBeLessThanOrEqual(77);
      // Kaydırınca koyu grafit arka plan
      await expect
        .poll(() => page.locator('.site-header').evaluate((el) => getComputedStyle(el).backgroundColor))
        .not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      const topsAfter = await page.$$eval('#site-nav a', (anchors) =>
        anchors
          .filter((anchor) => (anchor as HTMLElement).offsetParent !== null)
          .map((anchor) => Math.round(anchor.getBoundingClientRect().top)),
      );
      expect(new Set(topsAfter).size, `kaydırınca menü üst konumları: ${topsAfter.join(', ')}`).toBe(1);
    });
  }

  test("iç sayfalarda (hero yok) başlık header'ın altında kalmaz (normal build: tüm onaylı sayfalar)", async ({ page }) => {
    test.setTimeout(120_000); // tüm sayfaları dolaşır; yavaş makinede 45 sn sınırına yaklaşıyordu
    await expectH1BelowHeader(
      page,
      [
        '/hakkimizda/',
        '/iletisim/',
        '/teklif/',
        '/galeri/',
        '/gizlilik/',
        '/404.html',
        '/hizmetler/',
        ...SERVICE_SLUGS.map((slug) => `/hizmetler/${slug}/`),
        '/makine-kiralama/',
        ...MACHINE_SLUGS.map((slug) => `/makine-kiralama/${slug}/`),
        '/bolgeler/',
        '/bolgeler/yesilyurt/',
      ],
      [
        { width: 1366, height: 768 },
        { width: 1920, height: 1080 },
        { width: 390, height: 844 },
      ],
    );
  });

  test('1024 ve 1280: hamburger, tek satır header; 1344 satır içi menü', async ({ page }) => {
    for (const width of [1024, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await expect(page.locator('.nav-toggle'), `${width} hamburger`).toBeVisible();
      expect(((await page.locator('.site-header').boundingBox()) as { height: number }).height).toBeLessThanOrEqual(96);
    }

    await page.setViewportSize({ width: 1344, height: 800 });
    await page.goto('/');
    await expect(page.locator('.nav-toggle')).toBeHidden();
    expect(((await page.locator('.site-header').boundingBox()) as { height: number }).height).toBeLessThanOrEqual(116.5);
  });
});

test('yorumlar listesi boşken ana sayfada yorum bölümü hiç yok', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-reviews]')).toHaveCount(0);
  await expect(page.getByText('Müşterilerimiz ne diyor')).toHaveCount(0);
});

test('Google Maps engellenirse harita kartı bozuk iframe göstermez; adres ve butonlar kalır', async ({ page }) => {
  await page.unroute(/^https:\/\/(www\.)?google\.com\/maps/);
  await page.route(/google\.com\/maps/, (route) => route.abort());
  await page.goto('/');
  const card = page.locator('[data-map-card]').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute('data-state', 'failed', { timeout: 15000 });
  await expect(card.locator('iframe')).toHaveCount(0);
  const band = page.locator('.map-info').first();
  await expect(band).toContainText('Koyunoğlu');
  await expect(band.getByRole('link', { name: /Yol tarifi al/ })).toBeVisible();
  await expect(band.getByRole('link', { name: /Google Maps/ })).toBeVisible();
  await card.click({ position: { x: 10, y: 10 }, trial: true });
});

test('biz kimiz (ana sayfa): 2008 başlığı ve JSON-LD foundingDate', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#firma-baslik')).toHaveText("2008'den bu yana Malatya'da hafriyat ve iş makinesi hizmetleri");
  await expect(page.locator('#firma')).toContainText('2008 yılından bu yana');
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join('')).toContain('"foundingDate":"2008"');
});

for (const width of [360, 390, 768, 1366]) {
  test(`hakkımızda ${width}px: yeni bölümler, 2008, 13 ilçe yok, StatsStrip yok, taşma yok`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const response = await page.goto('/hakkimizda/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText('Alperenler Hafriyat İnşaat');
    await expect(page.locator('.page-head-sub')).toHaveText("2008'den bu yana Malatya'da");
    await expectH1BelowHeader(page, ['/hakkimizda/'], [{ width, height: 800 }]);
    await expect(page.locator('.about-intro')).toContainText('2008 yılından bu yana Malatya');
    await expect(page.locator('.about-intro')).toContainText('şehir dışındaki projelerde de çalışıyoruz');
    await expect(page.locator('.pillar')).toHaveCount(3);
    await expect(page.getByRole('heading', { name: 'Altyapı ve taş duvar' })).toBeVisible();
    await expect(page.locator('main')).toContainText('İller Bankası işlerinde taşeron olarak Ankara, Manisa, Sivas ve Malatya');
    await expect(page.getByRole('heading', { name: 'Referanslarımız ve Tamamlanan İşler' })).toBeVisible();
    await expect(page.locator('.ref-card')).toHaveCount(8);
    await expect(page.locator('.ref-card').first()).toContainText('Malatya 4. ve 6. Etap');
    const orman = page.locator('.ref-card').nth(1);
    await expect(orman.locator('.ref-mark')).toHaveText('ORMAN');
    await expect(orman).toContainText('Hekimhan Orman Müdürlüğü');
    await expect(orman).toContainText('Orman yolu yapımı');
    await expect(page.locator('.about-quote')).toContainText("2008'den bu yana olduğu gibi bugün de tüm gönüllerde taht kuruyoruz.");
    await expect(page.locator('.about-goal-band')).toContainText('Hedefimiz');
    await expect(page.getByRole('heading', { name: 'Bize nasıl ulaşırsınız?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Konum' })).toBeVisible();
    await expect(page.locator('[data-stats]')).toHaveCount(0);
    expect(await page.locator('main').innerText()).not.toMatch(/13 ilçe/i);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBe(
      "Alperenler Hafriyat İnşaat, 2008'den bu yana Malatya'da hafriyat, kazı, altyapı ve iş makinesi hizmetleri veriyor. Referanslarımız ve tamamlanan işlerimiz.",
    );
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('kuruluş yılı 2008 her yerde; harita bağlantıları, TikTok ve JSON-LD (foundingDate, hasMap, sameAs)', async ({ page }) => {
  test.setTimeout(120_000); // tüm sayfaları dolaşır; yavaş makinede 45 sn sınırına yaklaşıyordu
  const TIKTOK = 'https://www.tiktok.com/@kaptanblacck';
  const PLACE = 'https://maps.app.goo.gl/U4xZsNWxEhQWsY3x6';
  const pages = await crawl(page);
  for (const path of pages) {
    await page.goto(path);
    expect(await page.content(), `${path} içinde 2000`).not.toContain('2000-04-07');
  }

  await page.goto('/');
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('');
  expect(ld).toContain('"foundingDate":"2008"');
  expect(ld).toContain(`"hasMap":"${PLACE}"`);
  expect(ld).toContain(`"sameAs":["${TIKTOK}"]`);

  // Harita bağlantıları profile gider
  const band = page.locator('.map-info').first();
  await expect(band.getByRole('link', { name: /Google Maps/ })).toHaveAttribute('href', PLACE);
  await expect(band.getByRole('link', { name: /Yol tarifi al/ })).toHaveAttribute(
    'href',
    'https://www.google.com/maps/dir/?api=1&destination=38.316073,38.2685777',
  );
  expect(ld).toContain('"geo":{"@type":"GeoCoordinates","latitude":38.316073,"longitude":38.2685777}');
  // Gömülü harita bu koordinata ortalanır ve kendi iğnemiz konur
  await expect(page.locator('[data-map-card]').first()).toHaveAttribute('data-embed', /ll=38\.316073,38\.2685777/);
  await expect(page.locator('.map-center-pin').first()).toHaveCount(1);

  for (const [path, width] of [['/', 360], ['/iletisim/', 390], ['/iletisim/', 1366]] as const) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(path);
    const link = page.locator('a[data-tiktok]').first();
    await link.scrollIntoViewIfNeeded();
    await expect(link).toHaveAttribute('href', TIKTOK);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('aria-label', 'Alperenler Hafriyat TikTok hesabı');
    const box = await link.boundingBox();
    expect(box!.height, `${path} ${width} dokunma hedefi`).toBeGreaterThanOrEqual(44);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

test('Google yorum yazma bağlantısı: iletişim kartı + footer; yıldız/puan yok; 44 px; taşma yok', async ({ page }) => {
  const WRITE = 'https://g.page/r/CUW_reguN3B4EBE/review';
  for (const [path, width] of [['/', 360], ['/iletisim/', 390], ['/iletisim/', 1366]] as const) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(path);
    const links = page.locator('a[data-review-link]');
    expect(await links.count(), `${path} bağlantı sayısı`).toBeGreaterThan(0);
    for (let i = 0; i < (await links.count()); i++) {
      const link = links.nth(i);
      await link.scrollIntoViewIfNeeded();
      await expect(link).toHaveAttribute('href', WRITE);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      const box = await link.boundingBox();
      expect(box!.height, `${path} ${width} dokunma hedefi`).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
  await page.goto('/iletisim/');
  const card = page.locator('.contact-card', { has: page.getByRole('heading', { name: 'Bizi değerlendirin' }) });
  await expect(card).toContainText("Hizmetimizden memnun kaldıysanız Google'da yorum bırakabilirsiniz.");
  await expect(card.locator('svg')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText(/★|\d+[,.]\d yıldız|AggregateRating/);
});

for (const [width, height] of [
  [360, 740],
  [390, 844],
  [430, 932],
] as const) {
  test(`mobil hero ${width}x${height}: videoda yazı/buton yok, butonlar ilk ekranda, taşma yok, h1 ≤ 2 satır`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.waitForTimeout(1500); // açılış animasyonları (hero-rise, h1 satır maskesi) bitsin
    const geo = await page.evaluate(() => {
      const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
      const media = r('.hero-poster');
      const h1 = r('.hero h1');
      const lineH = parseFloat(getComputedStyle(document.querySelector('.hero h1')!).lineHeight);
      const sub = document.querySelector('.hero-sub-mobile') as HTMLElement;
      const subLines = sub.getBoundingClientRect().height / parseFloat(getComputedStyle(sub).lineHeight);
      return {
        mediaBottom: media.bottom,
        mediaHeight: media.height,
        h1Top: h1.top,
        h1Lines: Math.round(h1.height / lineH),
        subLines: Math.round(subLines),
        eyebrowTop: r('.hero-inner .eyebrow').top,
        btns: Array.from(document.querySelectorAll('.hero .btn-lg')).map((b) => b.getBoundingClientRect().bottom),
        btnHeights: Array.from(document.querySelectorAll('.hero .btn-lg')).map((b) => b.getBoundingClientRect().height),
        overlay: getComputedStyle(document.querySelector('.hero-overlay')!).display,
        vignette: getComputedStyle(document.querySelector('.hero-vignette')!).display,
        scroll: getComputedStyle(document.querySelector('.hero-scroll')!).display,
        desktopSub: getComputedStyle(document.querySelector('.hero-sub-desktop')!).display,
        heroH1Size: parseFloat(getComputedStyle(document.querySelector('.hero h1')!).fontSize),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        stripe: getComputedStyle(document.querySelector('.hero-inner')!, '::before').clipPath,
      };
    });
    // video alanında h1/buton/eyebrow yok: hepsi video alanının altında
    expect(geo.eyebrowTop, 'eyebrow video altında').toBeGreaterThanOrEqual(geo.mediaBottom - 1);
    expect(geo.h1Top, 'h1 video altında').toBeGreaterThanOrEqual(geo.mediaBottom - 1);
    expect(geo.overlay).toBe('none');
    expect(geo.vignette).toBe('none');
    expect(geo.scroll).toBe('none');
    expect(geo.desktopSub).toBe('none');
    expect(geo.stripe).not.toBe('none');
    expect(geo.h1Lines, 'h1 en fazla 2 satır').toBeLessThanOrEqual(2);
    expect(geo.subLines, 'alt başlık en fazla 3 satır').toBeLessThanOrEqual(3);
    expect(geo.heroH1Size).toBeLessThanOrEqual(37.6);
    for (const bottom of geo.btns) expect(bottom, 'butonlar ilk ekranda').toBeLessThanOrEqual(height);
    for (const h of geo.btnHeights) expect(h).toBeGreaterThanOrEqual(48);
    expect(geo.overflow).toBeLessThanOrEqual(0);
    // video alanı yüksekliği CSS'te sabit: clamp(18rem, 56svh, 34rem)
    expect(Math.round(geo.mediaHeight)).toBe(Math.round(Math.min(Math.max(288, height * 0.56), 544)));
  });
}

test('referanslar: ana sayfada Biz Kimiz sonrası ve Hakkımızda; 8 kart, sıra, altyapı çipleri; 2/3/4 sütun; taşma yok; "13 ilçe" yok', async ({ page }) => {
  const names = [
    'Emlak Konut GYO A.Ş.',
    'Hekimhan Orman Müdürlüğü',
    'TCDD Genel Müdürlüğü',
    'Malatya MASKİ Genel Müdürlüğü',
    'Ankara ASKİ Genel Müdürlüğü',
    'Manisa MASKİ Genel Müdürlüğü',
    'Sivas SİBESKİ Genel Müdürlüğü',
    'İstanbul İSKİ Genel Müdürlüğü',
  ];
  for (const [path, width, columns] of [
    ['/', 360, 2],
    ['/hakkimizda/', 390, 2],
    ['/', 768, 3],
    ['/hakkimizda/', 1366, 4],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const section = page.locator('.refs-section');
    await expect(section.getByRole('heading', { name: 'Referanslarımız ve Tamamlanan İşler' })).toBeVisible();
    await expect(section.locator('.ref-card')).toHaveCount(8);
    expect(await section.locator('.ref-name').allTextContents()).toEqual(names);
    expect(await section.locator('.ref-mark').allTextContents()).toEqual([
      'EMLAK KONUT', 'ORMAN', 'TCDD', 'MASKİ', 'ASKİ', 'MASKİ', 'SİBESKİ', 'İSKİ',
    ]);
    await expect(section.locator('.ref-card').first()).toContainText('Malatya 4. ve 6. Etap');
    await expect(section.locator('.ref-card').nth(1)).toContainText('Orman yolu yapımı');
    await expect(section.locator('.refs-chip')).toHaveCount(5);
    await expect(section.locator('.refs-chip').nth(0)).toHaveText(/Ankara\s*Beypazarı, Polatlı/);
    await expect(section.locator('.refs-chip').nth(2)).toHaveText(/Sivas\s*Çarkışla, Gemerek, Kangal/);
    await expect(section.locator('.refs-chip').nth(4)).toHaveText('İller Bankası A.Ş. projeleri');
    await section.scrollIntoViewIfNeeded();
    const cols = await section.locator('.refs-grid').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
    );
    expect(cols, `${path} ${width}px sütun`).toBe(columns);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(await page.locator('main').innerText()).not.toMatch(/13 ilçe/i);
  }
  // Ana sayfada Biz Kimiz'den sonra, rakam şeridinden önce
  await page.goto('/');
  const order = await page.evaluate(() => {
    const idx = (sel: string) => Array.from(document.querySelectorAll('main section')).indexOf(document.querySelector(sel)!);
    return [idx('#firma'), idx('.refs-section'), idx('[data-stats]')];
  });
  expect(order[0]).toBeLessThan(order[1]);
  expect(order[1]).toBeLessThan(order[2]);
});

test.describe('telefon düzeni (mobile.css)', () => {
  for (const [width, height] of [
    [360, 740],
    [390, 844],
  ] as const) {
    test(`${width}x${height}: header tek satır, hero butonu ekranda, alt çubuk yok`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForTimeout(800);
      const header = await page.locator('.site-header').boundingBox();
      expect(header!.height, 'header yüksekliği (Menü alt satıra düşmez)').toBeLessThanOrEqual(73);
      const btn = await page.locator('.hero .btn-primary').first().boundingBox();
      expect(btn!.y + btn!.height, 'hero butonu ilk ekranda').toBeLessThanOrEqual(height);
      await expect(page.locator('.call-bar')).toHaveCount(0);
    });
  }

  test('360: hizmet şeridi yatay kaydırılır, ilk kart > 260 px, ipucu görünür, sayfa taşmaz', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const rail = page.locator('.card-grid--rail');
    await rail.scrollIntoViewIfNeeded();
    const info = await rail.evaluate((el) => ({
      overflowX: getComputedStyle(el).overflowX,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      firstWidth: el.firstElementChild!.getBoundingClientRect().width,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(info.overflowX).toBe('auto');
    expect(info.scrollWidth).toBeGreaterThan(info.clientWidth);
    expect(info.firstWidth).toBeGreaterThan(260);
    expect(info.pageOverflow).toBeLessThanOrEqual(0);
    await expect(page.locator('.rail-hint')).toBeVisible();
  });

  test('768: hizmet şeridi ızgara kalır (overflow visible), ipucu gizli', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/');
    const overflowX = await page.locator('.card-grid--rail').evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflowX).toBe('visible');
    await expect(page.locator('.rail-hint')).toBeHidden();
  });
});
