import { expect, test } from '@playwright/test';
import { stubGoogle, watchErrors } from './helpers';

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

test('13 bölge sayfası: başlık, taslak notu, ilçeye özel WhatsApp ve ön-dolu sihirbaz bağlantısı', async ({
  page,
}) => {
  const intros = new Set<string>();
  for (const [slug, name] of REGIONS) {
    const response = await page.goto(`/bolgeler/${slug}/`);
    expect(response?.status(), `${slug} durum kodu`).toBe(200);
    await expect(page).toHaveTitle(`${name} Hafriyat | Alperenler Hafriyat`);
    await expect(page.locator('h1')).toHaveText(`${name} Hafriyat`);
    await expect(page.locator('.draft-notice')).toContainText('Bu bölgeye hizmet verildiği onaylanmadı.');
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

test('önizleme şeridi ve TASLAK rozetleri görünür', async ({ page }) => {
  await page.goto('/hizmetler/');
  await expect(page.locator('.preview-bar')).toContainText('Önizleme sürümü');
  await expect(page.locator('.draft-badge').first()).toBeVisible();
});

test('JSON-LD\'ye taslaklar girmez (Service, FAQPage)', async ({ page }) => {
  for (const path of ['/', '/hizmetler/', '/makine-kiralama/', '/hafriyat-fiyatlari/']) {
    await page.goto(path);
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''));
    const joined = blocks.join('\n');
    expect(joined, `${path} JSON-LD`).not.toContain('"FAQPage"');
    expect(joined, `${path} JSON-LD`).not.toContain('"@type":"Service"');
  }
});