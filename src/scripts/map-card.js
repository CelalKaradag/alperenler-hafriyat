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
  const shield = card.querySelector('[data-map-shield]');
  let frameEl = null;
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
    frameEl = frame;
  }

  /*
   * Koruma katmanı (map-shield): harita yüklenince iframe'in üstünü şeffaf bir düğme kaplar.
   * Varsayılan olarak tıklama/kaydırmayı katman alır; sayfa normal kayar ve Google'ın
   * "ctrl + kaydırma ile yakınlaştırın" uyarısı hiç tetiklenmez. Tıklayınca/dokununca katman
   * kalkar (harita kullanılabilir olur); fare haritadan çıkınca, sayfa kayınca, dışarı
   * basılınca veya Escape ile geri gelir.
   */
  function activateMap() {
    if (!shield || card.dataset.active) return;
    card.dataset.active = '1';
    shield.hidden = true;
    if (frameEl) frameEl.focus(); // klavye kullanıcısı için odak haritaya geçer
    window.addEventListener('scroll', deactivateMap, { passive: true });
    document.addEventListener('pointerdown', onOutsidePress, true);
    document.addEventListener('keydown', onKeyDown);
  }

  function deactivateMap() {
    if (!shield || !card.dataset.active) return;
    delete card.dataset.active;
    shield.hidden = false;
    window.removeEventListener('scroll', deactivateMap);
    document.removeEventListener('pointerdown', onOutsidePress, true);
    document.removeEventListener('keydown', onKeyDown);
  }

  function onOutsidePress(event) {
    if (!card.contains(event.target)) deactivateMap();
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') deactivateMap();
  }

  if (shield) {
    shield.addEventListener('click', activateMap);
    card.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') deactivateMap();
    });
    cleanups.push(() => {
      window.removeEventListener('scroll', deactivateMap);
      document.removeEventListener('pointerdown', onOutsidePress, true);
      document.removeEventListener('keydown', onKeyDown);
    });
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
