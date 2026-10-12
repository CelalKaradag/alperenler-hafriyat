import { expect, test } from '@playwright/test';
import { PHONE_HREF, WA_BASE, crawl, internalLinks, stubGoogle, watchErrors } from './helpers';

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
  // Not: bu sayfalar onaylanıp `onaylandi: true` yapılınca burası güncellenmelidir.
  // Bölge ve rehber sayfaları da onaylanana kadar (onaylandi:false) normal build'de üretilmez.
  for (const path of [
    '/makine-kiralama/',
    '/hafriyat-fiyatlari/',
    '/bolgeler/',
    '/bolgeler/yesilyurt/',
    '/rehber/',
    '/rehber/temel-kazisindan-once-bilinmesi-gerekenler/',
  ]) {
    const response = await request.get(path);
    expect(response.status(), `${path} üretilmemeli`).toBe(404);
  }
  await page.goto('/');
  await expect(page.locator('.preview-bar')).toHaveCount(0);
  await expect(page.locator('.draft-badge')).toHaveCount(0);
  // Footer'da taslak bölge/rehber bağlantısı da görünmemeli
  await expect(page.locator('footer a[href="/bolgeler/"], footer a[href="/rehber/"]')).toHaveCount(0);
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

test('masaüstü yüzen WhatsApp düğmesi: görünür, wa.me bağlantılı, kaydırınca ikona daralır, hover\'da açılır', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  const wa = page.locator('.wa-float');
  await expect(wa).toHaveAttribute('aria-label', 'WhatsApp ile teklif için yazın');
  await expect(wa).toHaveAttribute('href', new RegExp(`^${WA_BASE.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}`));

  // Hero görünürken gizli; aşağı inince belirir, 600 px sonrası yalnızca ikon
  await page.evaluate(() => window.scrollTo(0, 1600));
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
  for (const size of [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1600, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    test(`${size.width}x${size.height}: header <= 96px, menü öğeleri aynı satırda, üstte boşluk yok`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto('/');

      const header = await page.locator('.site-header').boundingBox();
      expect(header, 'header ölçülemedi').not.toBeNull();
      expect((header as { height: number }).height).toBeLessThanOrEqual(96);

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

      // Hero, sayfanın en üstünden (y = 0) başlar: üstte açık renkli boş şerit yok
      const hero = await page.locator('.hero').boundingBox();
      expect((hero as { y: number }).y).toBeLessThanOrEqual(1);
    });
  }

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
    expect(((await page.locator('.site-header').boundingBox()) as { height: number }).height).toBeLessThanOrEqual(96);
  });
});