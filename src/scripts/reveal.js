/**
 * Bölümler ekrana girerken hafif yukarı kayarak belirir (tek seferlik).
 * Başlangıçta gizleme yalnızca bu betik çalışınca (html.reveal-ready) uygulanır;
 * JavaScript yoksa, hata olursa veya hareket azaltma açıksa içerik doğrudan görünür.
 *
 * Her sayfa yüklenişinde (ilk yükleme ve sayfa geçişi) page-init.js tarafından çağrılır;
 * dönen fonksiyon gözlemciyi bırakır.
 */
export function initReveal() {
  try {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (reduced || items.length === 0 || !('IntersectionObserver' in window)) return null;

    // İlk ekranda zaten görünenler gizlenmeden başlar (yanıp sönme olmasın).
    const viewport = window.innerHeight;
    for (const item of items) {
      if (item.getBoundingClientRect().top < viewport) item.classList.add('is-in');
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    for (const item of items) {
      if (!item.classList.contains('is-in')) observer.observe(item);
    }
    document.documentElement.classList.add('reveal-ready');
    return () => observer.disconnect();
  } catch {
    /* içerik görünür kalır */
    return null;
  }
}
