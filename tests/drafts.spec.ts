import { expect, test } from '@playwright/test';
import { stubGoogle, watchErrors } from './helpers';

// PUBLIC_SHOW_DRAFTS=true build'i (önizleme) üzerinde: taslak sayfalar VAR, ama JSON-LD'de YOK.

test.beforeEach(async ({ page }) => {
  await stubGoogle(page);
});

test('taslak sayfalar üretilir, tek H1 ve noindex içerir', async ({ page }) => {
  const errors = watchErrors(page);
  for (const path of ['/hizmetler/', '/makine-kiralama/', '/hafriyat-fiyatlari/']) {
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