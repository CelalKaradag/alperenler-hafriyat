import { defineConfig, devices } from '@playwright/test';

/**
 * `npm test` iki build alır (normal + PUBLIC_SHOW_DRAFTS=true) ve ikisini de önizler
 * (scripts/serve-for-tests.mjs). Sonra:
 *  - smoke.spec.ts (normal build): masaüstü Chromium 1366×768, iPhone 13 (WebKit = iOS Safari motoru)
 *    ve Pixel 7 (Chromium) üzerinde
 *  - drafts.spec.ts (taslaklı build): masaüstü Chromium
 *  - a11y.spec.ts, layout.spec.ts, visual.spec.ts: her iki build'de, masaüstü Chromium
 *    (genişlikleri testler kendisi ayarlar). visual.spec.ts yalnızca ekran görüntüsü arşivler.
 */
const NORMAL = 'http://127.0.0.1:4321';
const DRAFTS = 'http://127.0.0.1:4322';
const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } };

export default defineConfig({
  testDir: 'tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'normal', testMatch: /smoke\.spec\.ts/, use: { ...desktop, baseURL: NORMAL } },
    {
      name: 'normal-iphone',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['iPhone 13'], baseURL: NORMAL },
    },
    {
      name: 'normal-pixel',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['Pixel 7'], baseURL: NORMAL },
    },
    { name: 'drafts', testMatch: /drafts\.spec\.ts/, use: { ...desktop, baseURL: DRAFTS } },

    { name: 'a11y-normal', testMatch: /a11y\.spec\.ts/, use: { ...desktop, baseURL: NORMAL } },
    { name: 'a11y-drafts', testMatch: /a11y\.spec\.ts/, use: { ...desktop, baseURL: DRAFTS } },
    { name: 'layout-normal', testMatch: /layout\.spec\.ts/, use: { ...desktop, baseURL: NORMAL } },
    { name: 'layout-drafts', testMatch: /layout\.spec\.ts/, use: { ...desktop, baseURL: DRAFTS } },
    { name: 'visual-normal', testMatch: /visual\.spec\.ts/, use: { ...desktop, baseURL: NORMAL } },
    { name: 'visual-drafts', testMatch: /visual\.spec\.ts/, use: { ...desktop, baseURL: DRAFTS } },
  ],
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
