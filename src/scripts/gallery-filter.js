/**
 * /galeri/ filtre sekmeleri: Tümü / Fotoğraflar / Videolar (aria-pressed düğmeler).
 * JavaScript yoksa filtre çubuğu gizli kalır ve her şey görünür. Her sayfa yüklenişinde
 * page-init.js çağırır; DOM sayfa geçişinde yenilendiği için temizlik gerekmez.
 */
export function initGalleryFilters() {
  const bar = document.querySelector('[data-gallery-filters]');
  if (!bar) return null;
  const grid = document.querySelector('.gallery-grid');
  const status = document.querySelector('[data-gallery-status]');
  if (!grid) return null;

  const items = Array.from(grid.querySelectorAll('.gallery-item'));
  const buttons = Array.from(bar.querySelectorAll('[data-filter]'));
  bar.hidden = false;

  const labels = { all: 'Tümü', image: 'Fotoğraflar', video: 'Videolar' };

  function apply(filter) {
    let shown = 0;
    for (const item of items) {
      const hide = filter !== 'all' && item.dataset.kind !== filter;
      item.hidden = hide;
      if (!hide) shown += 1;
      // gizlenen videoları durdur
      if (hide) item.querySelectorAll('video').forEach((video) => video.pause());
    }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    }
    if (status) status.textContent = `${labels[filter]}: ${shown} öğe gösteriliyor`;
  }

  bar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (button) apply(button.dataset.filter);
  });

  return null;
}
