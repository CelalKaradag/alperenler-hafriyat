/**
 * Sayfa başlatıcı. Astro ClientRouter (sayfa geçişleri) ile sayfalar tam yeniden yüklenmediği için
 * sayfaya bağlı betikler (reveal, hero video, teklif sihirbazı) her sayfa yüklenişinde burada
 * yeniden başlatılır. Bu dosya bir kez yüklenir; dinleyiciler çoğalmaz.
 */
import { initReveal } from './reveal.js';
import { initHeroVideo } from './hero-video.js';
import { initQuoteWizards } from './quote-wizard.js';
import { initMapCards } from './map-card.js';
import { initFloatingActions } from './floating-actions.js';

let cleanups = [];
let lastBody = null;

function run() {
  // Aynı sayfa için iki kez başlatma (ilk yükleme + astro:page-load)
  if (!document.body || document.body === lastBody) return;
  lastBody = document.body;
  cleanups = [initReveal(), initHeroVideo(), initMapCards(), initFloatingActions()].filter(Boolean);
  initQuoteWizards();
}

function teardown() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
}

// Sayfa değişmeden önce: videoları durdur, gözlemcileri bırak
document.addEventListener('astro:before-swap', teardown);

// Geçişte <html> öznitelikleri yenilenir; JavaScript işareti geri konur
document.addEventListener('astro:after-swap', () => {
  document.documentElement.classList.add('js');
});

document.addEventListener('astro:page-load', run);
run();
