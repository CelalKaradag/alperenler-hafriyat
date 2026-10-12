import { defineConfig, devices } from '@playwright/test';

/**
 * Duman (smoke) testleri. `npm test` iki build alır (normal + PUBLIC_SHOW_DRAFTS=true) ve ikisini de
 * önizler (scripts/serve-for-tests.mjs); sonra iki proje çalışır.
 */
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
    {
      name: 'normal',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4321' },
    },
    {
      name: 'drafts',
      testMatch: /drafts\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4322' },
    },
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