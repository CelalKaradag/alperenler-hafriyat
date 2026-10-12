/**
 * Galeri lightbox'ı: yerel <dialog> (showModal) ile erişilebilir görsel büyütme.
 *  - Escape kapatır (yerel), ok tuşları önceki/sonraki görseli gösterir.
 *  - Odak tuzağı: Tab dialog içinde döner; kapanınca odak büyütme düğmesine döner.
 *  - Arka plan kaydırması kilitlenir.
 * Her sayfa yüklenişinde page-init.js çağırır; dönen fonksiyon açık dialog'u kapatıp kilidi kaldırır.
 */
export function initLightbox() {
  const root = document.querySelector('[data-lightbox-root]');
  const dialog = root && root.querySelector('[data-lightbox]');
  if (!root || !dialog || typeof dialog.showModal !== 'function') return null;

  const openers = Array.from(root.querySelectorAll('[data-lightbox-open]'));
  if (openers.length === 0) return null;

  // Galeri filtresi bazı öğeleri gizleyebilir: yalnızca görünür görseller arasında gezilir
  const visibleOpeners = () =>
    openers.filter((button) => {
      const item = button.closest('.gallery-item');
      return !item || !item.hidden;
    });

  const source = dialog.querySelector('[data-lightbox-source]');
  const image = dialog.querySelector('[data-lightbox-img]');
  const caption = dialog.querySelector('[data-lightbox-caption]');
  const count = dialog.querySelector('[data-lightbox-count]');
  const prev = dialog.querySelector('[data-lightbox-prev]');
  const next = dialog.querySelector('[data-lightbox-next]');
  const close = dialog.querySelector('[data-lightbox-close]');

  let index = 0;
  let opener = null;

  const lockScroll = (lock) => {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
  };

  function show(i) {
    const list = visibleOpeners();
    index = (i + list.length) % list.length;
    const data = list[index].dataset;
    if (data.webp) {
      source.srcset = data.webp;
    } else {
      source.removeAttribute('srcset');
    }
    image.src = data.src;
    image.alt = data.alt || '';
    image.width = Number(data.width) || image.width;
    image.height = Number(data.height) || image.height;
    caption.textContent = data.alt || '';
    count.textContent = `${index + 1} / ${list.length}`;
    const single = list.length < 2;
    prev.hidden = single;
    next.hidden = single;
  }

  function open(i, trigger) {
    opener = trigger;
    show(i);
    lockScroll(true);
    dialog.showModal();
    close.focus();
  }

  function onOpenerClick(event) {
    const trigger = event.currentTarget;
    open(visibleOpeners().indexOf(trigger), trigger);
  }

  // Tab dialog içinde döner (odak tuzağı)
  function onKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === 'Tab') {
      const focusable = Array.from(dialog.querySelectorAll('button:not([hidden])'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function onDialogClick(event) {
    // Arka plana (dialog'un kendisine) tıklanınca kapat
    if (event.target === dialog) dialog.close();
  }

  function onClose() {
    lockScroll(false);
    if (opener && opener.isConnected) opener.focus();
    opener = null;
  }

  openers.forEach((button) => button.addEventListener('click', onOpenerClick));
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', onKeyDown);
  dialog.addEventListener('click', onDialogClick);
  dialog.addEventListener('close', onClose);

  return () => {
    if (dialog.open) dialog.close();
    lockScroll(false);
  };
}
