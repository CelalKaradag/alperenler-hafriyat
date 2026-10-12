#!/usr/bin/env node
/**
 * Playwright testleri için: sitenin İKİ sürümünü sırayla build edip önizler.
 *   - normal   → dist-test/         → http://127.0.0.1:4321  (taslak bayrağı kapalı)
 *   - taslaklı → dist-test-drafts/  → http://127.0.0.1:4322  (PUBLIC_SHOW_DRAFTS=true)
 * Süreç, Playwright onu sonlandırana kadar açık kalır. (Bkz. playwright.config.ts)
 * Not: `npm run build` ile üretilen font/görsel varlıkları (prepare:assets) önceden hazır olmalıdır.
 */
import { spawn, spawnSync } from 'node:child_process';

const base = { ...process.env };
delete base.PUBLIC_SHOW_DRAFTS;

function build(outDir, drafts) {
  const env = { ...base, ASTRO_OUT_DIR: outDir };
  if (drafts) env.PUBLIC_SHOW_DRAFTS = 'true';
  const result = spawnSync('npx', ['astro', 'build'], { stdio: 'inherit', shell: true, env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

build('dist-test', false);
build('dist-test-drafts', true);

const children = [
  ['dist-test', '4321'],
  ['dist-test-drafts', '4322'],
].map(([outDir, port]) =>
  spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', port], {
    stdio: 'inherit',
    shell: true,
    env: { ...base, ASTRO_OUT_DIR: outDir },
  }),
);

const stop = () => {
  for (const child of children) child.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);