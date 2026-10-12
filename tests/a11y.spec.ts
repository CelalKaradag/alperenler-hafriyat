import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { sitePages, stubGoogle } from './helpers';

// Erişilebilirlik taraması (axe-core): normal ve taslaklı build'de tüm sayfalar, masaüstü ve mobil genişlikte.
// "serious" ve "critical" ihlaller testi başarısız eder; "moderate"/"minor" yalnızca yazdırılır.

test.setTimeout(600_000);

test.beforeEach(async ({ page }) => {
  await stubGoogle(page);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // belirme animasyonları kontrast ölçümünü bozmasın
});

for (const size of [
  { name: 'masaüstü', width: 1366, height: 768 },
  { name: 'mobil', width: 390, height: 844 },
]) {
  test(`axe: tüm sayfalarda ciddi/kritik ihlal yok (${size.name} ${size.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    const pages = await sitePages(page);
    const failures: string[] = [];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('load');
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
