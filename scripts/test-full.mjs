#!/usr/bin/env node
/**
 * Tam kalite testi (yerelde): QA_MODE=full ile Playwright'ı çalıştırır (iPhone 13 WebKit dahil 3 proje,
 * tüm sayfalar a11y, layout 6 genişlik, görsel arşiv). Ek argümanlar Playwright'a iletilir,
 * örn. `npm run test:full -- --shard=1/4`. CI'da elle başlatmak için README'ye bakın.
 */
import { spawnSync } from 'node:child_process';

const result = spawnSync('npx', ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, QA_MODE: 'full' },
});
process.exit(result.status ?? 1);
