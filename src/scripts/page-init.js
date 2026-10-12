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
import { initLightbox } from './lightbox.js';
import { initGalleryFilters } from './gallery-filter.js';

let cleanups = [];
let lastBody = null;
let firstRun = true;

function run() {
  // Aynı sayfa için iki kez başlatma (ilk yükleme + astro:page-load)
  if (!document.body || document.body === lastBody) return;
  lastBody = document.body;

  // Sayfa geçişinden sonra odak 'İçeriğe geç' bağlantısına gitmesin: ana içeriğe alınır
  // (main tabindex=-1, görünür halka yok). İlk yüklemede odak değiştirilmez.
  if (!firstRun) {
    const main = document.getElementById('icerik');
    if (main) main.focus({ preventScroll: true });
  }
  firstRun = false;
  cleanups = [
    initReveal(),
    initHeroVideo(),
    initMapCards(),
    initFloatingActions(),
    initLightbox(),
  ].filter(Boolean);
  initQuoteWizards();
  initGalleryFilters();
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
