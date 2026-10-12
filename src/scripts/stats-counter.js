/**
 * Rakam şeridi sayacı: sayılar görünüme girince 0'dan son değere ~1.2 sn'de (easeOut) artar.
 *  - HTML'de GERÇEK sayı yazılıdır; JS yoksa / hareket azaltma açıksa hiçbir şey yapılmaz (son sayı kalır).
 *  - Şerit ekrana yaklaşınca (alttan 400 px önce) sayılar sessizce 0'a çekilir, görünür olunca (≥ %40) sayılır;
 *    böylece kullanıcı "son sayı → 0" yanıp sönmesini görmez. Şerit çok uzaktayken HTML'deki sayı değişmez.
 * Her sayfa yüklenişinde page-init.js çağırır; dönen fonksiyon gözlemcileri ve çerçeveyi bırakır.
 */
const DURATION = 1200;

export function initStatsCounter() {
  const root = document.querySelector('[data-stats]');
  if (!root) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (!('IntersectionObserver' in window)) return null;

  const items = Array.from(root.querySelectorAll('[data-count]'));
  if (items.length === 0) return null;

  const frames = new Set();
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function animate(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const final = el.dataset.final || String(target) + suffix; // HTML'deki gerçek metin (prime adımında saklanır)
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / DURATION);
      el.textContent = String(Math.round(target * easeOut(progress))) + suffix; // son ek (örn. "+") sayılırken de korunur
      if (progress < 1) {
        frames.add(window.requestAnimationFrame(step));
      } else {
        el.textContent = final; // son değer her zaman HTML'deki metindir
      }
    };
    frames.add(window.requestAnimationFrame(step));
  }

  // 1) Yaklaşınca 0'a çek (henüz görünmüyor)
  const primed = new Set();
  const prime = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !primed.has(entry.target)) {
          primed.add(entry.target);
          entry.target.dataset.final = entry.target.textContent.trim();
          entry.target.textContent = '0' + (entry.target.dataset.suffix || '');
          prime.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px 400px 0px' },
  );

  // 2) Yeterince görününce say
  const counted = new Set();
  const count = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !counted.has(entry.target)) {
          counted.add(entry.target);
          if (!primed.has(entry.target)) {
            primed.add(entry.target);
            entry.target.dataset.final = entry.target.textContent.trim();
          }
          count.unobserve(entry.target);
          animate(entry.target);
        }
      }
    },
    { threshold: 0.4 },
  );

  items.forEach((el) => {
    prime.observe(el);
    count.observe(el);
  });

  return () => {
    prime.disconnect();
    count.disconnect();
    frames.forEach((id) => window.cancelAnimationFrame(id));
    // Sayfa geçişinde yarım kalan sayıyı son değere döndür
    items.forEach((el) => {
      if (el.dataset.final) el.textContent = el.dataset.final;
    });
  };
}
