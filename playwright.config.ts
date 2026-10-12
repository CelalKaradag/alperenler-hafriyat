import { defineConfig, devices } from '@playwright/test';

/**
 * İki mod (QA_MODE ortam değişkeni):
 *  - HIZLI (varsayılan; `npm test`, CI'da her push/PR): masaüstü Chromium 1366×768 + Pixel 7 (Chromium).
 *    smoke ve drafts tam; a11y az sayfada; layout yalnız 390 ve 1366 px; visual ÇALIŞMAZ.
 *  - TAM (`QA_MODE=full`, `npm run test:full`, .github/workflows/full-qa.yml): iPhone 13 (WebKit) dahil
 *    3 smoke projesi, tüm sayfalarda a11y, layout 6 genişlik, görsel arşiv (Chromium 6 genişlik;
 *    WebKit yalnız 390).
 *
 * `npm test` yerelde iki build alır (normal + PUBLIC_SHOW_DRAFTS=true) ve önizler
 * (scripts/serve-for-tests.mjs). CI'da build'ler testlerden ÖNCE bir kez alınır ve testler
 * yeniden build etmez (SKIP_BUILD=1).
 */
const FULL = process.env.QA_MODE === 'full';
const NORMAL = 'http://127.0.0.1:4321';
const DRAFTS = 'http://127.0.0.1:4322';
const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } };

const fastProjects = [
  { name: 'normal', testMatch: /smoke\.spec\.ts/, use: { ...desktop, baseURL: NORMAL } },
  { name: 'normal-pixel', testMatch: /smoke\.spec\.ts/, use: { ...devices['Pixel 7'], baseURL: NORMAL } },
  { name: 'drafts', testMatch: /drafts\.spec\.ts/, use: { ...desktop, baseURL: DRAFTS } },
  { name: 'a11y-normal', testMatch: /a11y\.spec\.ts/, use: { ...desktop, baseURL: NORMAL } },
  { name: 'a11y-drafts', testMatch: /a11y\.spec\.ts/, use: { ...desktop, baseURL: DRAFTS } },
  { name: 'layout-normal', testMatch: /layout\.spec\.ts/, use: { ...desktop, baseURL: NORMAL } },
  { name: 'layout-drafts', testMatch: /layout\.spec\.ts/, use: { ...desktop, baseURL: DRAFTS } },
];

const fullOnlyProjects = [
  { name: 'normal-iphone', testMatch: /smoke\.spec\.ts/, use: { ...devices['iPhone 13'], baseURL: NORMAL } },
  { name: 'visual-normal', testMatch: /visual\.spec\.ts/, use: { ...desktop, baseURL: NORMAL } },
  { name: 'visual-drafts', testMatch: /visual\.spec\.ts/, use: { ...desktop, baseURL: DRAFTS } },
  // WebKit: yalnız 390 genişlik (visual.spec.ts proje adından anlar), taslaklı build = tüm sayfalar
  { name: 'visual-webkit', testMatch: /visual\.spec\.ts/, use: { ...devices['iPhone 13'], baseURL: DRAFTS } },
];

export default defineConfig({
  testDir: 'tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // CI'da 2 işçi (runner 2 çekirdek); yerelde sıralı (iki önizleme sunucusu yeterince yük)
  workers: process.env.CI ? 2 : 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Rapor boyutu küçük kalsın: video yok, ekran görüntüsü yalnızca hatada, iz yalnızca hatada
  use: { trace: 'retain-on-failure', video: 'off', screenshot: 'only-on-failure' },
  projects: FULL ? [...fastProjects, ...fullOnlyProjects] : fastProjects,
  webServer: {
    command: 'node scripts/serve-for-tests.mjs',
    // Taslaklı sürüm en son ayağa kalkar; hazır olunca ikisi de hazırdır
    url: 'http://127.0.0.1:4322/',
    timeout: 600_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
