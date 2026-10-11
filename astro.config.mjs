import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Alan adı belli olunca buraya yazılır, örn. site: 'https://ornek.com'
  // Tanımlanana kadar canonical ve og:url üretilmez (bkz. src/components/SEO.astro).
  output: 'static',
});
