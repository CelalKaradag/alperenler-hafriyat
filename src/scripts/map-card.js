/**
 * Harita kartı: kart görünür alana yaklaşınca (rootMargin ~300 px) Google Maps iframe'i
 * kendiliğinden yüklenir. iframe `load` olunca bekleme kartı yumuşakça kaybolur.
 *
 * Durumlar (kart üzerinde data-state):
 *   (yok)    JS çalışmadı: kart + "Google Maps'te aç" bağlantısı
 *   loading  iframe istendi, kart bekleme ekranı (iğne nabzı sürer)
 *   loaded   harita göründü
 *   failed   8 sn içinde load gelmedi veya hata: kart + "Google Maps'te aç"
 *   manual   Save-Data açık: otomatik yükleme yok, "Haritayı göster" düğmesi
 *
 * Her sayfa yüklenişinde page-init.js çağırır; dönen fonksiyon gözlemcileri ve zamanlayıcıları
 * temizler (sayfa geçişinde). `data-ready` ve `data-loaded` çift iframe'i önler.
 */
const LOAD_TIMEOUT_MS = 8000;
const ROOT_MARGIN = '300px 0px';

function saveDataOn() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return Boolean(connection && connection.saveData);
}

function setup(card, cleanups) {
  if (card.dataset.ready) return;
  const slot = card.querySelector('[data-map-slot]');
  const show = card.querySelector('[data-map-show]');
  const embed = card.dataset.embed;
  if (!slot || !embed) return;
  card.dataset.ready = '1';

  const setState = (state) => {
    card.dataset.state = state;
  };

  function load() {
    if (card.dataset.loaded) return; // çift iframe olmasın
    card.dataset.loaded = '1';
    setState('loading');

    const frame = document.createElement('iframe');
    frame.className = 'map-frame';
    frame.title = card.dataset.title || 'Konum';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';

    const timer = window.setTimeout(() => {
      if (card.dataset.state !== 'loaded') setState('failed');
    }, LOAD_TIMEOUT_MS);
    cleanups.push(() => window.clearTimeout(timer));

    // Geç gelen load da haritayı gösterir (önce "failed" olmuş olsa bile)
    frame.addEventListener('load', () => {
      window.clearTimeout(timer);
      setState('loaded');
    });
    frame.addEventListener('error', () => {
      window.clearTimeout(timer);
      if (card.dataset.state !== 'loaded') setState('failed');
    });

    frame.src = embed;
    slot.appendChild(frame);
  }

  // Save-Data: otomatik yükleme yok, eski tıkla-yükle düğmesine düş
  if (saveDataOn()) {
    setState('manual');
    if (show) {
      show.hidden = false;
      show.addEventListener('click', (event) => {
        event.preventDefault();
        load();
        if (show.isConnected) show.hidden = true;
      });
    }
    return;
  }

  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }

  setState('loading'); // bekleme ekranı (henüz iframe yok); "Google Maps'te aç" gizli
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    },
    { rootMargin: ROOT_MARGIN },
  );
  observer.observe(card);
  cleanups.push(() => observer.disconnect());
}

export function initMapCards() {
  const cleanups = [];
  document.querySelectorAll('[data-map-card]').forEach((card) => setup(card, cleanups));
  return () => cleanups.forEach((fn) => fn());
}
