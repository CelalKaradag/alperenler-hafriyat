/**
 * Sayfa başlatıcı. Astro ClientRouter (sayfa geçişleri) ile sayfalar tam yeniden yüklenmediği için
 * sayfaya bağlı betikler her sayfa yüklenişinde burada yeniden başlatılır. Bu dosya bir kez
 * yüklenir; dinleyiciler çoğalmaz.
 *
 * Her sayfada gereken küçük betikler (reveal, ui-effects) doğrudan içe aktarılır. Diğerleri
 * (hero video, harita, lightbox, galeri filtre/şerit, teklif sihirbazı, yüzen düğmeler) yalnızca
 * ilgili öğe sayfada varsa dinamik import ile yüklenir; böylece ilgisiz sayfalar bu kodu indirmez.
 */
import { initHyphenate } from './hyphenate-tr.js';
import { initReveal } from './reveal.js';
import { initUiEffects } from './ui-effects.js';

/**
 * [sayfada aranacak seçici, betik yükleyici, çağrılacak başlatıcı, boşta/etkileşimde yükle?]
 * Dördüncü değer true olan betikler (galeri lightbox'ı, filtre, şerit) ilk yüklemeyi ve ana iş parçacığını
 * meşgul etmesin diye tarayıcı boşta kalınca (requestIdleCallback) ya da ilk kullanıcı etkileşiminde
 * (dokunma/fare/klavye/kaydırma — hangisi önceyse) yüklenir.
 */
const lazyModules = [
  ['[data-hero-media]', () => import('./hero-video.js'), (m) => m.initHeroVideo()],
  ['[data-map-card]', () => import('./map-card.js'), (m) => m.initMapCards()],
  ['[data-floating]', () => import('./floating-actions.js'), (m) => m.initFloatingActions()],
  ['[data-lightbox-root]', () => import('./lightbox.js'), (m) => m.initLightbox(), true],
  ['[data-gallery-grid="home"]', () => import('./gallery-carousel.js'), (m) => m.initGalleryCarousel(), true],
  ['[data-gallery-filters]', () => import('./gallery-filter.js'), (m) => m.initGalleryFilters(), true],
  ['[data-quote-wizard]', () => import('./quote-wizard.js'), (m) => m.initQuoteWizards()],
  ['[data-stats]', () => import('./stats-counter.js'), (m) => m.initStatsCounter()],
];

const INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'scroll'];

/** İlk etkileşimde ya da boşta (hangisi önceyse) bir kez çalıştırır; dönen fonksiyon iptal eder. */
function whenIdleOrInteract(callback) {
  let done = false;
  let idleHandle = 0;
  const cancel = () => {
    INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, fire, true));
    if (idleHandle) {
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleHandle);
      else window.clearTimeout(idleHandle);
    }
  };
  function fire() {
    if (done) return;
    done = true;
    cancel();
    callback();
  }
  INTERACTION_EVENTS.forEach((name) => window.addEventListener(name, fire, { capture: true, passive: true }));
  idleHandle =
    'requestIdleCallback' in window
      ? window.requestIdleCallback(fire, { timeout: 2500 })
      : window.setTimeout(fire, 800);
  return cancel;
}

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

  initHyphenate(); // iki yana yaslı paragraflara Türkçe yumuşak tireler (typography.css)
  cleanups = [initReveal(), initUiEffects()].filter(Boolean);

  for (const [selector, load, start, deferred] of lazyModules) {
    if (!document.querySelector(selector)) continue;
    let ready = false;
    let started = false;
    let pendingClick = null;
    const begin = () => {
      if (started) return Promise.resolve();
      started = true;
      return load()
        .then((module) => {
          if (current !== generation) return; // bu arada başka sayfaya geçildi
          const cleanup = start(module);
          if (typeof cleanup === 'function') cleanups.push(cleanup);
          ready = true;
          // Betik yüklenmeden yapılan tıklama (örn. çok hızlı dokunuş) yeniden uygulanır
          if (pendingClick && pendingClick.isConnected) pendingClick.click();
          pendingClick = null;
        })
        .catch(() => {
          /* betik yüklenemezse sayfa betiksiz çalışmaya devam eder */
        });
    };
    if (deferred) {
      cleanups.push(whenIdleOrInteract(begin));
      // Henüz hazır değilken tıklanan galeri düğmesi: betiği hemen yükle, hazır olunca tıklamayı tekrarla
      const triggerSelector =
        selector === '[data-lightbox-root]'
          ? '[data-lightbox-open]'
          : selector === '[data-gallery-filters]'
            ? '[data-filter]'
            : null;
      if (triggerSelector) {
        const onEarlyClick = (event) => {
          if (ready || !(event.target instanceof Element)) return;
          const trigger = event.target.closest(triggerSelector);
          if (!trigger) return;
          event.preventDefault();
          event.stopPropagation();
          pendingClick = trigger;
          begin();
        };
        document.addEventListener('click', onEarlyClick, true);
        cleanups.push(() => document.removeEventListener('click', onEarlyClick, true));
      }
    } else {
      // Hero video, harita, yüzen düğmeler, sihirbaz: sayfa yüklenince HEMEN başlar (boşta bekleme yok)
      begin();
    }
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
