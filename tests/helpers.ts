import type { Browser, Page } from '@playwright/test';

/** Tam kalite modu (QA_MODE=full): hızlı modda a11y/layout daha az sayfa/genişlikle koşar, visual hiç koşmaz */
export const FULL = process.env.QA_MODE === 'full';

export const PHONE_HREF = 'tel:+905392527058';
export const WA_BASE = 'https://wa.me/905392527058';

/** Google harita isteklerini sahte bir HTML ile karşılar: ağ erişimi gerekmez, konsolda hata çıkmaz */
export async function stubGoogle(page: Page): Promise<void> {
  await page.route(/^https:\/\/(www\.)?google\.com\/maps/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>harita</title>' }),
  );
}

/** Tüm sayfalar: ana sayfadan taranan iç bağlantılar + bağlantısı olmayan sayfalar (404) */
export async function sitePages(page: Page): Promise<string[]> {
  const pages = await crawl(page, 150);
  for (const extra of ['/gizlilik/', '/404.html']) if (!pages.includes(extra)) pages.push(extra);
  return pages;
}

/** Sayfa listesini bir kez toplar (beforeAll için: kendi bağlamını açar/kapatır) */
export async function collectPages(browser: Browser, baseURL: string): Promise<string[]> {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  await stubGoogle(page);
  const pages = await sitePages(page);
  await context.close();
  return pages;
}

/** Sayfayı baştan sona kaydırarak lazy görselleri yükletir, sonra en üste döner */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(300, window.innerHeight - 100);
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await frame(); // gözlemciler (lazy görsel) çalışsın; sabit bekleme yok
    }
    window.scrollTo(0, 0);
  });
  // Görünür görseller yüklensin (en çok 8 sn)
  await page
    .waitForFunction(
      () =>
        Array.from(document.images)
          .filter((img) => img.getClientRects().length > 0)
          .every((img) => img.complete),
      undefined,
      { timeout: 8000 },
    )
    .catch(() => undefined);
}

/** Konsol uyarı/hata iletileri ve 4xx/5xx ağ yanıtları (Google harita sahte olmalı) */
export function watchConsoleAndNetwork(page: Page): string[] {
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(`console.${message.type()}: ${message.text()}`);
    }
  });
  page.on('response', (response) => {
    const url = response.url();
    // 404.html sayfasının kendisi bilerek 404 dönebilir
    if (response.status() >= 400 && !url.endsWith('/404.html')) {
      problems.push(`HTTP ${response.status()}: ${url}`);
    }
  });
  return problems;
}

/** Sayfa hatalarını ve konsol "error" iletilerini toplar */
export function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

/** Sayfadaki iç bağlantılar (yalnızca "/..." yolları, #parça atılır) */
export async function internalLinks(page: Page): Promise<string[]> {
  const hrefs = await page.$$eval('a[href]', (anchors) =>
    anchors.map((anchor) => anchor.getAttribute('href') ?? ''),
  );
  const found = new Set<string>();
  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    found.add(href.split('#')[0].split('?')[0] || '/');
  }
  return [...found];
}

/** Ana sayfadan başlayıp iç bağlantıları tarar (en çok `limit` sayfa) */
export async function crawl(page: Page, limit = 80): Promise<string[]> {
  const visited = new Set<string>();
  const queue: string[] = ['/'];
  while (queue.length > 0 && visited.size < limit) {
    const path = queue.shift() as string;
    if (visited.has(path)) continue;
    visited.add(path);
    await page.goto(path);
    for (const link of await internalLinks(page)) {
      if (!visited.has(link) && !queue.includes(link)) queue.push(link);
    }
  }
  return [...visited];
}