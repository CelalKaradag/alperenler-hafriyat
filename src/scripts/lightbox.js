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

  // Gezilecek öğeler: filtreyle gizlenmemiş ve ekranda gerçekten görünen düğmeler.
  // (Masaüstünde video kendi yerinde oynar; mobilde video düğmesi lightbox'ta oynatır,
  // bu yüzden "gallery-open--video" düğmeleri yalnızca mobilde görünür sayılır.)
  const visibleOpeners = () =>
    openers.filter((button) => {
      const item = button.closest('.gallery-item');
      return (!item || !item.hidden) && button.offsetParent !== null;
    });

  const source = dialog.querySelector('[data-lightbox-source]');
  const image = dialog.querySelector('[data-lightbox-img]');
  const picture = dialog.querySelector('[data-lightbox-picture]');
  const video = dialog.querySelector('[data-lightbox-video]');
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

  function stopVideo() {
    video.pause();
    video.removeAttribute('src'); // indirmeyi keser
    video.load();
  }

  function show(i) {
    const list = visibleOpeners();
    index = (i + list.length) % list.length;
    const data = list[index].dataset;
    stopVideo();
    if (data.kind === 'video') {
      // Video: lightbox içinde oynatılır (kullanıcı dokunuşuyla başladığı için sessiz otomatik oynatma izinli)
      picture.hidden = true;
      video.hidden = false;
      video.poster = data.poster || '';
      video.src = data.video;
      video.width = Number(data.width) || video.width;
      video.height = Number(data.height) || video.height;
      video.setAttribute('aria-label', data.alt || 'Video');
      const played = video.play();
      if (played && typeof played.catch === 'function') played.catch(() => {});
    } else {
      video.hidden = true;
      picture.hidden = false;
      if (data.webp) {
        source.srcset = data.webp;
      } else {
        source.removeAttribute('srcset');
      }
      image.src = data.src;
      image.alt = data.alt || '';
      image.width = Number(data.width) || image.width;
      image.height = Number(data.height) || image.height;
    }
    caption.textContent = data.alt || '';
    count.textContent = `${index + 1} / ${list.length}`;
    const single = list.length < 2;
    prev.hidden = single;
    next.hidden = single;
  }

  // View Transitions API varsa görsel karttan büyüyerek açılır / karta küçülerek kapanır; yoksa
  // CSS ile yumuşak fade (hareket azaltmada ikisi de yok). Aynı anda tek eleman bu adı taşır.
  const canTransition = () =>
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const thumbOf = (button) => (button && button.dataset.kind === 'image' ? button.querySelector('img') : null);

  function open(i, trigger) {
    opener = trigger;
    const run = () => {
      show(i);
      lockScroll(true);
      dialog.showModal();
      close.focus();
    };
    const thumb = thumbOf(trigger);
    if (thumb && canTransition()) {
      thumb.style.viewTransitionName = 'lb-img';
      const transition = document.startViewTransition(() => {
        thumb.style.viewTransitionName = '';
        image.style.viewTransitionName = 'lb-img';
        run();
      });
      transition.finished.catch(() => {}).finally(() => {
        image.style.viewTransitionName = '';
      });
    } else {
      run();
    }
  }

  function closeAnimated() {
    if (!dialog.open) return;
    const current = visibleOpeners()[index];
    const thumb = thumbOf(current);
    const rect = thumb && thumb.getBoundingClientRect();
    const onScreen = rect && rect.bottom > 0 && rect.top < window.innerHeight;
    // video gösteriliyorsa (video.hidden false) küçülme geçişi yapılmaz
    if (thumb && onScreen && video.hidden && canTransition()) {
      image.style.viewTransitionName = 'lb-img';
      const transition = document.startViewTransition(() => {
        image.style.viewTransitionName = '';
        thumb.style.viewTransitionName = 'lb-img';
        dialog.close();
      });
      transition.finished.catch(() => {}).finally(() => {
        thumb.style.viewTransitionName = '';
      });
    } else {
      dialog.close();
    }
  }

  function onOpenerClick(event) {
    const trigger = event.currentTarget;
    open(visibleOpeners().indexOf(trigger), trigger);
  }

  // Tab dialog içinde döner (odak tuzağı)
  function onKeyDown(event) {
    // Video kontrollerindeki ok tuşları (ileri/geri sarma) bozulmasın
    const onVideo = event.target === video;
    if (event.key === 'ArrowRight' && !onVideo) {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === 'ArrowLeft' && !onVideo) {
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
    if (event.target === dialog) closeAnimated();
  }

  function onClose() {
    stopVideo();
    lockScroll(false);
    if (opener && opener.isConnected) opener.focus();
    opener = null;
  }

  openers.forEach((button) => button.addEventListener('click', onOpenerClick));
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', closeAnimated);
  dialog.addEventListener('keydown', onKeyDown);
  dialog.addEventListener('click', onDialogClick);
  dialog.addEventListener('close', onClose);
  // Escape: yerel kapatmayı durdurup animasyonlu kapat (View Transitions varsa)
  dialog.addEventListener('cancel', (event) => {
    if (canTransition()) {
      event.preventDefault();
      closeAnimated();
    }
  });

  return () => {
    stopVideo();
    if (dialog.open) dialog.close();
    lockScroll(false);
  };
}
