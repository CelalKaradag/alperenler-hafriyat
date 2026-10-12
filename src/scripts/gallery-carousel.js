/**
 * Ana sayfa "Sahadan" mobil şeridi (48em altı): yatay kaydırmalı scroll-snap listesi için
 * "1 / 6" sayacını günceller. Masaüstünde (masonry) sayaç CSS ile gizlidir.
 * Her sayfa yüklenişinde page-init.js çağırır; dönen fonksiyon dinleyiciyi kaldırır.
 */
export function initGalleryCarousel() {
  const list = document.querySelector('[data-gallery-grid="home"]');
  const counter = document.querySelector('[data-carousel-count]');
  if (!list || !counter) return null;

  const items = Array.from(list.querySelectorAll('.gallery-item'));
  if (items.length < 2) return null;

  let frame = 0;

  function update() {
    frame = 0;
    let index = 0;
    const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
    if (atEnd) {
      index = items.length - 1;
    } else {
      // scrollLeft'e en yakın öğe
      let best = Infinity;
      items.forEach((item, i) => {
        const distance = Math.abs(item.offsetLeft - list.offsetLeft - list.scrollLeft);
        if (distance < best) {
          best = distance;
          index = i;
        }
      });
    }
    counter.textContent = `${index + 1} / ${items.length}`;
  }

  function onScroll() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  counter.hidden = false;
  list.addEventListener('scroll', onScroll, { passive: true });
  update();

  return () => {
    list.removeEventListener('scroll', onScroll);
    if (frame) window.cancelAnimationFrame(frame);
  };
}