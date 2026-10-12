import { mkdirSync } from 'node:fs';
import { test } from '@playwright/test';
import { collectPages, scrollThrough, stubGoogle } from './helpers';

// Görsel kontrol arşivi: her sayfanın tam sayfa ekran görüntüsü, her genişlikte. KARŞILAŞTIRMA YOK;
// yalnızca `screenshots/<proje>/<genişlik>/<sayfa>.png` olarak kaydedilir (CI'da "screenshots" artifact'ı).

test.setTimeout(600_000);
test.use({ reducedMotion: 'reduce' });

const ALL_WIDTHS = [360, 390, 768, 1024, 1366, 1920];
let pages: string[] = [];

test.beforeAll(async ({ browser }, testInfo) => {
  pages = await collectPages(browser, testInfo.project.use.baseURL as string);
});

// Yalnızca tam modda (QA_MODE=full; playwright.config.ts) tanımlı projelerde koşar: hızlı CI'da bu
// proje yoktur. WebKit (iPhone 13) projesinde yalnız 390 genişlik.
const WEBKIT_WIDTHS = [390];

const fileName = (path: string) =>
  path === '/' ? 'ana-sayfa' : path.replace(/^\/|\/$/g, '').replace(/\.html$/, '').replace(/\//g, '__');

for (const width of ALL_WIDTHS) {
  test(`ekran görüntüleri ${width}px`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name.includes('webkit') && !WEBKIT_WIDTHS.includes(width),
      'WebKit projesinde yalnız 390 px',
    );
    await stubGoogle(page);
    await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
    const dir = `screenshots/${testInfo.project.name}/${width}`;
    mkdirSync(dir, { recursive: true });

    for (const path of pages) {
      await page.goto(path);
      // Videolar duraklatılır (poster/ilk kare sabit kalsın)
      await page.evaluate(() => document.querySelectorAll('video').forEach((video) => video.pause()));
      await scrollThrough(page);
      await page.screenshot({ path: `${dir}/${fileName(path)}.png`, fullPage: true, animations: 'disabled' });
    }
  });
}
