import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { FULL, sitePages, stubGoogle } from './helpers';

// Erişilebilirlik taraması (axe-core). "serious" ve "critical" ihlal testi başarısız eder;
// "moderate"/"minor" yalnızca yazdırılır.
//  - HIZLI mod: normal build'de ana sayfa, /hizmetler/, /galeri/, /iletisim/, /teklif/;
//    taslaklı build'de bir bölge + bir rehber sayfası.
//  - TAM mod (QA_MODE=full): her iki build'de tüm sayfalar.

test.setTimeout(600_000);

const FAST_PAGES: Record<'normal' | 'drafts', string[]> = {
  normal: ['/', '/hizmetler/', '/galeri/', '/iletisim/', '/teklif/'],
  drafts: ['/bolgeler/yesilyurt/', '/rehber/temel-kazisindan-once-bilinmesi-gerekenler/'],
};

test.beforeEach(async ({ page }) => {
  await stubGoogle(page);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // belirme animasyonları kontrast ölçümünü bozmasın
});

for (const size of [
  { name: 'masaüstü', width: 1366, height: 768 },
  { name: 'mobil', width: 390, height: 844 },
]) {
  test(`axe: ciddi/kritik ihlal yok (${size.name} ${size.width}px)`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    const build = testInfo.project.name.includes('drafts') ? 'drafts' : 'normal';
    const pages = FULL ? await sitePages(page) : FAST_PAGES[build];
    const failures: string[] = [];

    for (const path of pages) {
      await page.goto(path);
      await page.locator('h1').first().waitFor(); // sayfa içeriği hazır
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
        .analyze();
      for (const violation of results.violations) {
        const line = `${path} [${violation.impact}] ${violation.id}: ${violation.help} → ${violation.nodes
          .slice(0, 3)
          .map((node) => node.target.join(' '))
          .join(' | ')}`;
        if (violation.impact === 'serious' || violation.impact === 'critical') failures.push(line);
        else console.log(`(uyarı) ${line}`);
      }
    }
    expect(failures, `axe ihlalleri:\n${failures.join('\n')}`).toEqual([]);
  });
}
