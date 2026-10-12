#!/usr/bin/env node
/**
 * Önizleme yayını (Cloudflare Workers, yalnızca statik dosya):
 *   1) PUBLIC_SHOW_DRAFTS=true ile `npm run build` (taslaklar "TASLAK" rozetiyle görünür)
 *   2) başarılıysa `npx wrangler deploy` (wrangler.jsonc: dist/ yayınlanır)
 * Hata olursa aynı çıkış koduyla durur. Kullanım: npm run deploy:preview
 * Not: Wrangler'a önceden giriş yapılmış olmalıdır (`npx wrangler login`).
 */
import { spawnSync } from 'node:child_process';

function run(command, args, env) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true, // Windows uyumlu (npm/npx .cmd)
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) {
    console.error(`\n✖ "${command} ${args.join(' ')}" başarısız (çıkış kodu ${result.status ?? 1}). Yayın durduruldu.`);
    process.exit(result.status ?? 1);
  }
}

console.log('▶ 1/2 Önizleme build (PUBLIC_SHOW_DRAFTS=true)');
run('npm', ['run', 'build'], { PUBLIC_SHOW_DRAFTS: 'true' });

console.log('\n▶ 2/2 wrangler deploy (dist/ → Cloudflare Workers statik assets)');
run('npx', ['wrangler', 'deploy'], {});

console.log('\n✔ Yayınlandı.');
