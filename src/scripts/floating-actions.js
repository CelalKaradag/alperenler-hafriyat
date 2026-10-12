/**
 * Masaüstü yüzen düğmeler: WhatsApp (hero görünürken gizli, aşağı inince belirir) ve
 * "yukarı çık" (sayfa yarıdan sonra). Her sayfa yüklenişinde page-init.js çağırır;
 * dönen fonksiyon dinleyicileri temizler.
 */
export function initFloatingActions() {
  const root = document.querySelector('[data-floating]');
  if (!root) return null;
  const whatsapp = root.querySelector('.wa-float');
  const toTop = root.querySelector('[data-to-top]');
  const hero = document.querySelector('.hero');

  let heroVisible = Boolean(hero);
  let ticking = false;
  let pulsed = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    // Hero olan sayfalarda hero görünürken gizli; hero olmayan sayfalarda biraz kaydırınca belirir
    if (whatsapp) {
      const shown = hero ? !heroVisible : y > 240;
      whatsapp.classList.toggle('is-shown', shown);
      // İlk 600 px'ten sonra yazı kısmı kapanır, yalnızca ikon kalır (hover/odakta açılır)
      whatsapp.classList.toggle('is-compact', y > 600);
      // Halka nabzı: ilk görünüşte tek sefer (2 tekrar), sonra durur
      if (shown && !pulsed) {
        pulsed = true;
        whatsapp.classList.add('is-pulsing');
      }
    }
    if (toTop) toTop.classList.toggle('is-shown', max > 0 && y > max / 2);
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };

  const onTopClick = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  let observer = null;
  if (hero && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[entries.length - 1].isIntersecting;
        update();
      },
      { threshold: 0.15 },
    );
    observer.observe(hero);
  } else {
    heroVisible = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  if (toTop) toTop.addEventListener('click', onTopClick);
  update();

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (toTop) toTop.removeEventListener('click', onTopClick);
    if (observer) observer.disconnect();
  };
}
