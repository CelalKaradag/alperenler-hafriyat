import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Site adresi ortam değişkeninden gelir (SITE_URL); verilmezse ÖNİZLEME adresi (Cloudflare Workers) kullanılır.
  // Gerçek alan adı belli olunca SITE_URL'i onunla ayarlayın (README: "Yayın: Cloudflare Workers").
  // og:image mutlak URL gerektirdiği için bu alan tanımlı olmalı; canonical, og:url, sitemap ve JSON-LD url
  // alanları da buradan üretilir (bkz. src/components/SEO.astro). Sayfalar yine noindex'tir
  // (site.publish.indexable: false).
  site: process.env.SITE_URL || 'https://alperenler-hafriyat.celal-krdg-13.workers.dev',
  output: 'static',
  // Testler (tests/) normal ve taslaklı iki ayrı build alır; çıktı klasörü ortam değişkeniyle ayrılır.
  outDir: process.env.ASTRO_OUT_DIR || 'dist',
});
