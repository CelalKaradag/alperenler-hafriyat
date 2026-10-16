#!/usr/bin/env node
/**
 * Playwright testleri için: sitenin İKİ sürümünü build edip önizler.
 *   - normal   → dist-test/         → http://127.0.0.1:4321  (taslak bayrağı kapalı)
 *   - taslaklı → dist-test-drafts/  → http://127.0.0.1:4322  (PUBLIC_SHOW_DRAFTS=true)
 *
 * Kullanım:
 *   node scripts/serve-for-tests.mjs               build'ler + önizleme (yerel `npm test`; Playwright webServer)
 *   node scripts/serve-for-tests.mjs --build-only  yalnız iki build'i alır ve çıkar (CI: testlerden ÖNCE bir kez)
 *   SKIP_BUILD=1 node scripts/serve-for-tests.mjs  build'leri atlayıp yalnız önizler (CI: testler yeniden build etmez)
 *
 * Süreç, Playwright onu sonlandırana kadar açık kalır. (Bkz. playwright.config.ts)
 * Not: `npm run prepare:assets` (font/topo/duyarlı görseller) önceden çalışmış olmalıdır.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const base = { ...process.env };
delete base.PUBLIC_SHOW_DRAFTS;
delete base.PUBLIC_TEST_FIXTURES;

function build(outDir, drafts) {
  const env = { ...base, ASTRO_OUT_DIR: outDir };
  if (drafts) {
    env.PUBLIC_SHOW_DRAFTS = 'true';
    env.PUBLIC_TEST_FIXTURES = 'true'; // yalnız test build'inde: src/pages/test-fixtures/ sayfaları üretilir
  }
  const result = spawnSync(npx, ['astro', 'build'], { stdio: 'inherit', env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const buildOnly = process.argv.includes('--build-only');
const skipBuild = process.env.SKIP_BUILD === '1';

if (!skipBuild) {
  build('dist-test', false);
  build('dist-test-drafts', true);
}
if (buildOnly) process.exit(0);

for (const dir of ['dist-test', 'dist-test-drafts']) {
  if (!existsSync(dir)) {
    console.error(`${dir}/bulunamadı: önce "node scripts/serve-for-tests.mjs --build-only" çalıştırın.`);
    process.exit(1);
  }
}

const children = [
  ['dist-test', '4321'],
  ['dist-test-drafts', '4322'],
].map(([outDir, port]) =>
  spawn(npx, ['astro', 'preview', '--ignore-lock', '--host', '127.0.0.1', '--port', port], {
    stdio: 'inherit',
    env: { ...base, ASTRO_OUT_DIR: outDir },
  }),
);

const stop = () => {
  for (const child of children) child.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
