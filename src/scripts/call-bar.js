/** Mobil alt çubuk: hero'daki Ara/WhatsApp düğmeleri ekrandayken saklı, düğmeler ekrandan çıkınca `is-shown` ile gelir. */
export function initCallBar() {
  const bar = document.querySelector('.call-bar');
  if (!bar) return null;
  const heroButtons = document.querySelector('.hero .btn-row');
  if (!heroButtons || !('IntersectionObserver' in window)) {
    bar.classList.add('is-shown');
    return null;
  }
  const observer = new IntersectionObserver((entries) => {
    const visible = entries[entries.length - 1].isIntersecting;
    bar.classList.toggle('is-shown', !visible);
  });
  observer.observe(heroButtons);
  return () => {
    observer.disconnect();
    bar.classList.add('is-shown');
  };
}
