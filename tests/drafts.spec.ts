import { expect, test } from '@playwright/test';
import { expectH1BelowHeader, stubGoogle, watchErrors } from './helpers';

// PUBLIC_SHOW_DRAFTS=true build'i (önizleme) üzerinde: taslak sayfalar VAR, ama JSON-LD'de YOK.

const GUIDE_SLUGS = [
  'temel-kazisindan-once-bilinmesi-gerekenler',
  'hafriyat-topragi-ve-moloz-nereye-goturulur',
  'ekskavator-mu-kepce-mi-dogru-makine-secimi',
  'bina-yikimi-oncesi-hazirlik-kontrol-listesi',
];
const REGIONS = [
  ['yesilyurt', 'Yeşilyurt'],
  ['battalgazi', 'Battalgazi'],
  ['akcadag', 'Akçadağ'],
  ['arapgir', 'Arapgir'],
  ['arguvan', 'Arguvan'],
  ['darende', 'Darende'],
  ['dogansehir', 'Doğanşehir'],
  ['doganyol', 'Doğanyol'],
  ['hekimhan', 'Hekimhan'],
  ['kale', 'Kale'],
  ['kuluncak', 'Kuluncak'],
  ['puturge', 'Pütürge'],
  ['yazihan', 'Yazıhan'],
];

test.beforeEach(async ({ page }) => {
  await stubGoogle(page);
});

test('13 bölge sayfası (firma onaylı): başlık, taslak notu yok, ilçeye özel WhatsApp ve ön-dolu sihirbaz bağlantısı', async ({
  page,
}) => {
  const intros = new Set<string>();
  for (const [slug, name] of REGIONS) {
    const response = await page.goto(`/bolgeler/${slug}/`);
    expect(response?.status(), `${slug} durum kodu`).toBe(200);
    await expect(page).toHaveTitle(`${name} Hafriyat | Alperenler Hafriyat`);
    await expect(page.locator('h1')).toHaveText(`${name} Hafriyat`);
    // Firma Malatya'nın tüm ilçelerine hizmet verdiğini onayladı: taslak notu/rozeti yok
    await expect(page.locator('.draft-notice')).toHaveCount(0);
    intros.add((await page.locator('.page-head .lead').innerText()).trim());

    const wa = await page.locator('.call-card a[href*="wa.me"]').getAttribute('href');
    expect(decodeURIComponent(wa ?? '')).toContain(name);
    await expect(page.locator('a[href^="/teklif/?yer="]')).toHaveAttribute(
      'href',
      `/teklif/?yer=${encodeURIComponent(name)}`,
    );
  }
  expect(intros.size, 'giriş cümleleri 13 ilçede aynı olmamalı').toBeGreaterThanOrEqual(13);
});

test('bölge ve rehber bağlantıları footer’da görünür', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="/bolgeler/"]')).toBeVisible();
  await expect(page.locator('footer a[href="/rehber/"]')).toBeVisible();
});

test('rehber yazıları: 500–800 kelime, okuma süresi, içindekiler, belediye notu, Article JSON-LD yok', async ({
  page,
}) => {
  for (const slug of GUIDE_SLUGS) {
    await page.goto(`/rehber/${slug}/`);
    const words = await page
      .locator('.guide-section')
      .evaluateAll((nodes) =>
        nodes.map((node) => node.textContent ?? '').join(' ').split(/\s+/).filter(Boolean).length,
      );
    expect(words, `${slug} kelime sayısı`).toBeGreaterThanOrEqual(500);
    expect(words, `${slug} kelime sayısı`).toBeLessThanOrEqual(800);
    await expect(page.locator('.guide-meta')).toContainText('dk okuma');
    await expect(page.locator('.toc a').first()).toBeVisible();
    await expect(page.locator('a[href="#teklif"]')).toBeVisible();
    const ld = (
      await page.locator('script[type="application/ld+json"]').evaluateAll((n) => n.map((x) => x.textContent ?? ''))
    ).join('\n');
    expect(ld, `${slug} JSON-LD`).not.toContain('"Article"');
  }
  // Hukuki konulu yazıda belediye notu
  await page.goto(`/rehber/${GUIDE_SLUGS[1]}/`);
  await expect(page.locator('.guide-note')).toContainText('belediyenizden teyit edin');
});

test('hizmet detayında ilgili rehber bağlantısı bulunur', async ({ page }) => {
  await page.goto('/hizmetler/hafriyat-ve-temel-kazisi/');
  await expect(page.locator('.related-block a[href^="/rehber/"]').first()).toBeVisible();
});

test('taslak sayfalar üretilir, tek H1 ve noindex içerir', async ({ page }) => {
  const errors = watchErrors(page);
  for (const path of [
    '/hizmetler/',
    '/makine-kiralama/',
    '/hafriyat-fiyatlari/',
    '/bolgeler/',
    '/bolgeler/yesilyurt/',
    '/rehber/',
    ...GUIDE_SLUGS.map((slug) => `/rehber/${slug}/`),
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} durum kodu`).toBe(200);
    await expect(page.locator('h1'), `${path} H1 sayısı`).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
  expect(errors, `konsol/sayfa hataları:\n${errors.join('\n')}`).toEqual([]);
});

test('taslak sayfalarda (rehber, fiyat rehberi, taslak hizmet/makine) başlık header\'ın altında kalmaz', async ({
  page,
}) => {
  await expectH1BelowHeader(
    page,
    [
      '/hafriyat-fiyatlari/',
      '/rehber/',
      ...GUIDE_SLUGS.map((slug) => `/rehber/${slug}/`),
      '/hizmetler/hafriyat-ve-temel-kazisi/',
      '/makine-kiralama/kiricili-ekskavator/',
      '/makine-kiralama/lowbed-ile-is-makinesi-tasima/',
    ],
    [
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 390, height: 844 },
    ],
  );
});

test('önizleme şeridi masaüstü header\'ı ile çakışmaz (şerit üstte, header hemen altında)', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  for (const path of ['/', '/hakkimizda/']) {
    await page.goto(path);
    const bar = (await page.locator('.preview-bar').boundingBox()) as { y: number; height: number };
    const header = (await page.locator('.site-header').boundingBox()) as { y: number };
    expect(bar.y).toBe(0);
    expect(header.y, `${path}: header şeridin altında`).toBeGreaterThanOrEqual(bar.y + bar.height - 0.5);
    // kaydırınca da şerit üstte sabit kalır, header ile çakışmaz
    await page.evaluate(() => window.scrollTo(0, 600));
    const bar2 = (await page.locator('.preview-bar').boundingBox()) as { y: number; height: number };
    const header2 = (await page.locator('.site-header').boundingBox()) as { y: number };
    expect(bar2.y).toBe(0);
    expect(header2.y).toBeGreaterThanOrEqual(bar2.y + bar2.height - 0.5);
  }
});

test('önizleme şeridi ve TASLAK rozetleri görünür (kalan taslaklar: rehber yazıları)', async ({ page }) => {
  await page.goto('/rehber/');
  await expect(page.locator('.preview-bar')).toContainText('Önizleme sürümü');
  await expect(page.locator('.draft-badge').first()).toBeVisible();
});

test("JSON-LD'ye taslaklar girmez (rehber, fiyat rehberi); onaylı hizmet/SSS girer", async ({ page }) => {
  const ld = async () =>
    (
      await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''))
    ).join('\n');

  // Onaylı hizmet sayfasında Service var; onaylı SSS ana sayfada FAQPage'e girer
  await page.goto('/hizmetler/hafriyat-ve-temel-kazisi/');
  expect(await ld()).toContain('"@type":"Service"');
  await page.goto('/');
  expect(await ld()).toContain('"FAQPage"');

  // Taslak rehber yazılarında Article, taslak fiyat rehberinde FAQPage yok
  for (const slug of GUIDE_SLUGS) {
    await page.goto(`/rehber/${slug}/`);
    expect(await ld(), `${slug} JSON-LD`).not.toContain('"Article"');
  }
  await page.goto('/hafriyat-fiyatlari/');
  expect(await ld()).not.toContain('"FAQPage"');

  // Onaylı makineler (kırıcılı ekskavatör, lowbed dahil) rozetsizdir
  for (const slug of ['kiricili-ekskavator', 'lowbed-ile-is-makinesi-tasima']) {
    const response = await page.goto(`/makine-kiralama/${slug}/`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator('.draft-badge')).toHaveCount(0);
  }
});
// ---- Google yorumları bölümü (yalnızca test fixture'ı; sahte veri siteye girmez) ----
for (const width of [360, 390, 1366]) {
  test(`yorum bölümü fixture ${width}px: yıldız metin alternatifi, taşma yok, dış istek yok`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const external: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      // Sayfanın altındaki harita şeridi görünür olunca Google haritayı yükler; yorum bölümüyle ilgisi yok
      if (/^https:\/\/(www\.)?google\.com\/maps/.test(url)) return;
      if (new URL(url).origin !== new URL(page.url() === 'about:blank' ? 'http://127.0.0.1:4322' : page.url()).origin) {
        external.push(url);
      }
    });
    await page.goto('/test-fixtures/yorumlar/');
    const section = page.locator('[data-reviews]');
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { name: 'Müşterilerimiz ne diyor' })).toBeVisible();
    await expect(section.locator('.review-card')).toHaveCount(4);
    await expect(section.getByRole('img', { name: '5 üzerinden 5' }).first()).toBeVisible();
    await expect(section.getByRole('img', { name: '5 üzerinden 4' })).toHaveCount(1);
    await expect(section.getByRole('img', { name: '5 üzerinden 3' })).toHaveCount(1);
    // Google bağlantıları tanımlı: iki düğme yeni sekmede açılır
    const all = section.getByRole('link', { name: /Google'da tüm yorumlar/ });
    const write = section.getByRole('link', { name: /Google'da yorum yazın/ });
    await expect(all).toHaveAttribute('href', 'https://g.page/r/CUW_reguN3B4EBE');
    await expect(write).toHaveAttribute('href', 'https://g.page/r/CUW_reguN3B4EBE/review');
    for (const link of [all, write]) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    // sayfa yatay taşmıyor; kart şerit içinde kaydırılabilir
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'yatay taşma').toBeLessThanOrEqual(0);
    if (width >= 1024) {
      const xs = await section.locator('.review-card').evaluateAll((els) => els.slice(0, 3).map((e) => Math.round(e.getBoundingClientRect().top)));
      expect(new Set(xs).size, '3 sütun aynı satırda').toBe(1);
    }
    expect(external, `dış istekler:\n${external.join('\n')}`).toEqual([]);
  });
}

// ---- Hafriyat hesaplama (firma onaylı) ----
test('hafriyat hesaplama: virgüllü ölçü, zemin seçimi, sonuç, WhatsApp mesajı ve teklif formuna aktarım', async ({ page }) => {
  const errors = watchErrors(page);
  const response = await page.goto('/hafriyat-hesaplama/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Hafriyat Hesaplama');
  await expect(page.locator('.draft-badge')).toHaveCount(0);

  // Varsayılan 20 × 12 × 3, toprak (%25), 16 m³ kamyon → 720 / 900 / 57
  await expect(page.locator('[data-out="bank"]')).toHaveText('720');
  await expect(page.locator('[data-out="loose"]')).toHaveText('900');
  await expect(page.locator('[data-out="trips"]')).toHaveText('57');

  await page.fill('#calc-length', '25,5');
  await page.fill('#calc-depth', '4');
  await page.locator('.calc .pill', { hasText: 'Taşlık / kayalık' }).click();
  await expect(page.locator('[data-out="bank"]')).toHaveText('1.224');
  await expect(page.locator('[data-out="loose"]')).toHaveText('1.836');
  await expect(page.locator('[data-out="trips"]')).toHaveText('115');
  await expect(page.locator('[data-fig="length"]')).toHaveText('25,5 m');

  const wa = decodeURIComponent((await page.locator('[data-calc-wa]').getAttribute('href')) ?? '');
  expect(wa).toContain('wa.me/905392527058');
  expect(wa).toContain('Hafriyat ve Temel Kazısı için teklif almak istiyorum');
  expect(wa).toContain('25,5 m × 12 m × 4 m');
  expect(wa).toContain('1.224 m³');
  expect(wa).toContain('zemin: taşlık / kayalık');

  // Geçersiz değer: hata mesajı, alan işaretli
  await page.fill('#calc-width', 'abc');
  await expect(page.locator('[data-calc-error]')).toBeVisible();
  await expect(page.locator('#calc-width')).toHaveAttribute('aria-invalid', 'true');
  await page.fill('#calc-width', '12');
  await expect(page.locator('[data-calc-error]')).toBeHidden();

  // Teklif formuna aktar: iş türü seçili, açıklama ölçülerle dolu
  await page.locator('[data-calc-wizard]').click();
  await expect(page).toHaveURL(/\/teklif\/\?is=/);
  await expect(page.locator('input[name="job"][value="Hafriyat ve Temel Kazısı"]')).toBeChecked();
  await expect(page.locator('#wizard-note')).toHaveValue(/25,5 m × 12 m × 4 m/);
  expect(errors, `konsol/sayfa hataları:\n${errors.join('\n')}`).toEqual([]);
});

for (const width of [360, 390, 1366]) {
  test(`hafriyat hesaplama ${width}px: üç ölçü tek satır, taşma yok, sonuç kartı görünür`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/hafriyat-hesaplama/');
    const tops = await page
      .locator('.calc-input input')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size, 'ölçü alanları aynı satırda').toBe(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.locator('[data-calc-result]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-out="trips"]')).toBeVisible();
    const box = (await page.locator('[data-calc-result]').boundingBox()) as { x: number; width: number };
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  });
}

test('hafriyat hesaplama bağlantıları: footer, teklif sayfası, ana sayfa fiyat bölümü, hafriyat hizmeti', async ({ page }) => {
  for (const path of ['/', '/teklif/', '/hizmetler/hafriyat-ve-temel-kazisi/']) {
    await page.goto(path);
    await expect(page.locator('footer a[href="/hafriyat-hesaplama/"]'), `${path} footer`).toHaveCount(1);
    await expect(page.locator('main a.calc-promo[href="/hafriyat-hesaplama/"]'), `${path} kart`).toHaveCount(1);
  }
  // Hesaplamanın anlamsız olduğu hizmette kart yok
  await page.goto('/hizmetler/kaya-kirma-ve-kirici-isleri/');
  await expect(page.locator('a.calc-promo')).toHaveCount(0);
});
