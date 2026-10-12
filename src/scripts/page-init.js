/**
 * Sayfa başlatıcı. Astro ClientRouter (sayfa geçişleri) ile sayfalar tam yeniden yüklenmediği için
 * sayfaya bağlı betikler her sayfa yüklenişinde burada yeniden başlatılır. Bu dosya bir kez
 * yüklenir; dinleyiciler çoğalmaz.
 *
 * Her sayfada gereken küçük betikler (reveal, ui-effects) doğrudan içe aktarılır. Diğerleri
 * (hero video, harita, lightbox, galeri filtre/şerit, teklif sihirbazı, yüzen düğmeler) yalnızca
 * ilgili öğe sayfada varsa dinamik import ile yüklenir; böylece ilgisiz sayfalar bu kodu indirmez.
 */
import { initReveal } from './reveal.js';
import { initUiEffects } from './ui-effects.js';

/** [sayfada aranacak seçici, betik yükleyici, çağrılacak başlatıcı] */
const lazyModules = [
  ['[data-hero-media]', () => import('./hero-video.js'), (m) => m.initHeroVideo()],
  ['[data-map-card]', () => import('./map-card.js'), (m) => m.initMapCards()],
  ['[data-floating]', () => import('./floating-actions.js'), (m) => m.initFloatingActions()],
  ['[data-lightbox-root]', () => import('./lightbox.js'), (m) => m.initLightbox()],
  ['[data-gallery-grid="home"]', () => import('./gallery-carousel.js'), (m) => m.initGalleryCarousel()],
  ['[data-gallery-filters]', () => import('./gallery-filter.js'), (m) => m.initGalleryFilters()],
  ['[data-quote-wizard]', () => import('./quote-wizard.js'), (m) => m.initQuoteWizards()],
];

let cleanups = [];
let lastBody = null;
let firstRun = true;
let generation = 0; // sayfa geçişinde bekleyen yüklemeleri iptal etmek için

function run() {
  // Aynı sayfa için iki kez başlatma (ilk yükleme + astro:page-load)
  if (!document.body || document.body === lastBody) return;
  lastBody = document.body;
  generation += 1;
  const current = generation;

  // Sayfa geçişinden sonra odak 'İçeriğe geç' bağlantısına gitmesin: ana içeriğe alınır
  // (main tabindex=-1, görünür halka yok). İlk yüklemede odak değiştirilmez.
  if (!firstRun) {
    const main = document.getElementById('icerik');
    if (main) main.focus({ preventScroll: true });
  }
  firstRun = false;

  cleanups = [initReveal(), initUiEffects()].filter(Boolean);

  for (const [selector, load, start] of lazyModules) {
    if (!document.querySelector(selector)) continue;
    load()
      .then((module) => {
        if (current !== generation) return; // bu arada başka sayfaya geçildi
        const cleanup = start(module);
        if (typeof cleanup === 'function') cleanups.push(cleanup);
      })
      .catch(() => {
        /* betik yüklenemezse sayfa betiksiz çalışmaya devam eder */
      });
  }
}

function teardown() {
  generation += 1; // bekleyen dinamik yüklemeleri geçersiz kıl
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
