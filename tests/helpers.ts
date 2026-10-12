import type { Page } from '@playwright/test';

export const PHONE_HREF = 'tel:+905392527058';
export const WA_BASE = 'https://wa.me/905392527058';

/** Google harita isteklerini sahte bir HTML ile karşılar: ağ erişimi gerekmez, konsolda hata çıkmaz */
export async function stubGoogle(page: Page): Promise<void> {
  await page.route(/^https:\/\/(www\.)?google\.com\/maps/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>harita</title>' }),
  );
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