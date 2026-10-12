import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // ÖNİZLEME adresi (Netlify). Gerçek alan adı belli olunca burası onunla değiştirilmelidir.
  // og:image mutlak URL gerektirdiği için bu alan tanımlı olmalı; canonical, og:url ve JSON-LD url
  // alanları da buradan üretilir (bkz. src/components/SEO.astro). Sayfalar yine noindex'tir
  // (site.publish.indexable: false).
  site: 'https://alperenler-hafriyat.netlify.app',
  output: 'static',
});
