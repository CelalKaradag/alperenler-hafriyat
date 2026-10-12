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
  // Not: kalan taslaklar (fiyat rehberi, rehber yazıları, mini ekskavatör) onaylanınca burası güncellenmelidir.
  // Onaylanmamış (onaylandi:false) içerik normal build'de üretilmez.
  for (const path of [
    '/hafriyat-fiyatlari/',
    '/rehber/',
    '/rehber/temel-kazisindan-once-bilinmesi-gerekenler/',
    '/makine-kiralama/mini-ekskavator-kiralama/', // firmada yok: kaldırıldı
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
  'kiricili-ekskavator',
  'hafriyat-kamyonu-kiralama',
  'lowbed-ile-is-makinesi-tasima',
];

test("firma onaylı sayfalar normal build'de var: bölgeler, 8 hizmet, 5 makine (lowbed dahil)", async ({ request }) => {
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

test('hizmetler sayfasında 8 kart; makine listesinde 5 kart; onaylı sayfalarda TASLAK rozeti yok', async ({ page }) => {
  await page.goto('/hizmetler/');
  // (sayfada ayrıca makine kartları da var: yalnızca /hizmetler/<slug>/ kartları sayılır)
  await expect(page.locator('main .service-card a[href^="/hizmetler/"]')).toHaveCount(8);
  await expect(page.locator('.draft-badge')).toHaveCount(0);
  await page.goto('/makine-kiralama/');
  await expect(page.locator('main .service-card')).toHaveCount(5);
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

test('filo bilgisi: ekskavatör tablosu (22/30/35 ton, toplam 7), JCB 2 adet, sayı şeridi 7-2-7-2', async ({ page }) => {
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

  // Ana sayfa sayı şeridi: sırayla 7 · Paletli ekskavatör, 2 · JCB, 7 · Kamyon, 2 · Lowbed tır
  await page.goto('/');
  const items = page.locator('.stats .stat');
  await expect(items).toHaveCount(4);
  const expected = [
    ['7', 'Paletli ekskavatör'],
    ['2', 'JCB'],
    ['7', 'Kamyon'],
    ['2', 'Lowbed tır'],
  ];
  for (let i = 0; i < expected.length; i += 1) {
    await expect(items.nth(i).locator('.stat-value')).toHaveText(expected[i][0]);
    await expect(items.nth(i).locator('.stat-label')).toHaveText(expected[i][1]);
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

test('SSS: bölge cevabı tüm ilçeleri listeler; mini ekskavatör hiçbir yerde geçmez', async ({ page, request }) => {
  await page.goto('/');
  const faq = page.locator('.faq-item', { hasText: 'Hangi bölgelere hizmet veriyorsunuz?' });
  await faq.locator('summary').click();
  await expect(faq).toContainText('Malatya’nın tüm ilçelerinde hizmet veriyoruz:');
  await expect(faq).toContainText('Yeşilyurt');
  await expect(faq).toContainText('Yazıhan');
  await expect(faq).toContainText('Bulunduğunuz yeri yazın veya arayın.');

  for (const path of ['/', '/hizmetler/', '/makine-kiralama/', '/hizmetler/operatorlu-is-makinesi-kiralama/']) {
    const html = await (await request.get(path)).text();
    expect(html.toLowerCase(), `${path}: mini ekskavatör`).not.toContain('mini ekskavatör');
  }
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

    // Alt sabit çubuk gizli, gövde kaydırması kilitli
    await expect(page.locator('.call-bar')).toBeHidden();
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
    await expect(page.locator('.call-bar')).toBeVisible();
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
      .locator('.btn, button, .nav-toggle, .call-bar a, .site-footer a')
      .elementHandles()) {
      const box = await handle.boundingBox();
      if (!box || !(await handle.isVisible())) continue;
      // Metin içi (p, li, dd içindeki satır içi) bağlantılar WCAG 2.5.8 istisnasıdır; menü/footer/düğme/çubuk hariç tutulmaz
      const inlineInText = await handle.evaluate((node) => {
        const el = node as Element;
        return (
          el.tagName === 'A' &&
          Boolean(el.closest('p, li, dd, address')) &&
          !el.closest('footer, nav, header, .call-bar') &&
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

test('mobil: odaklanan sihirbaz alanı sabit alt çubuğun altında kalmaz', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'yalnızca mobil cihaz projeleri');
  await page.goto('/teklif/');
  await expect(page.locator('.call-bar')).toBeVisible();
  const choices = page.locator('.choice');
  if ((await choices.count()) > 0) await choices.first().click();
  else await page.locator('#wizard-job-text').fill('Temel kazısı');
  await page.locator('[data-step]').nth(0).locator('[data-action="next"]').click();
  await page.locator('#wizard-place').focus(); // odak, alanı scroll-margin ile görünüme kaydırır
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const field = (await page.locator('#wizard-place').boundingBox()) as { y: number; height: number };
  const bar = (await page.locator('.call-bar').boundingBox()) as { y: number };
  expect(field.y + field.height, 'alan alt çubuğun altında kalmamalı').toBeLessThanOrEqual(bar.y + 1);
  // Çubuk odakla kaybolup tekrar çıkmaz (dokunuşun ortasında düğmeyi örtüp tıklamayı yutmasın)
  await expect(page.locator('.call-bar')).toBeVisible();
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

test('mobilde yüzen düğmeler yok, alt çubukta WhatsApp bağlantısı var', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.floating-actions')).toBeHidden();
  await expect(page.locator('.call-bar a[href^="https://wa.me/"]')).toBeVisible();
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
