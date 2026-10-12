/**
 * Küçük arayüz efektleri (her sayfa yüklenişinde page-init.js çağırır; dönen fonksiyon temizler):
 *  - Görsel yer tutucu + yumuşak fade-in (img.fade-img → .is-loaded)
 *  - Hizmet kartlarında fareyi takip eden ışık (yalnızca fare/hover destekli cihazlarda)
 *  - "Nasıl çalışıyoruz" aktif adım (numara sarıya dolar)
 *  - Telefon numarasını kopyala
 */
export function initUiEffects() {
  const cleanups = [];

  // --- Görsel fade-in: yüklenince is-loaded; hata olursa da görünür yap
  document.querySelectorAll('img.fade-img').forEach((img) => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth > 0) {
      done();
    } else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });

  // --- Hizmet kartı ışığı
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const grids = finePointer && !reduced ? document.querySelectorAll('.card-grid') : [];
  grids.forEach((grid) => {
    let frame = 0;
    let lastEvent = null;
    const update = () => {
      frame = 0;
      if (!lastEvent) return;
      const card = lastEvent.target.closest && lastEvent.target.closest('.service-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${lastEvent.clientX - rect.left}px`);
      card.style.setProperty('--my', `${lastEvent.clientY - rect.top}px`);
    };
    const onMove = (event) => {
      lastEvent = event;
      if (!frame) frame = window.requestAnimationFrame(update); // her karede en fazla bir güncelleme
    };
    grid.addEventListener('mousemove', onMove, { passive: true });
    cleanups.push(() => {
      grid.removeEventListener('mousemove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    });
  });

  // --- Nasıl çalışıyoruz: ekranın ortasındaki adım aktif olur
  const steps = Array.from(document.querySelectorAll('[data-steps] .step'));
  if (steps.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            steps.forEach((step) => step.classList.toggle('is-active', step === entry.target));
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    );
    steps.forEach((step) => observer.observe(step));
    cleanups.push(() => observer.disconnect());
  }

  // --- Telefonu kopyala
  document.querySelectorAll('[data-copy]').forEach((button) => {
    const status = button.parentElement && button.parentElement.querySelector('[data-copy-status]');
    button.hidden = false; // JavaScript yoksa düğme gizli kalır
    let timer = 0;
    const onClick = async () => {
      const text = button.dataset.copy || '';
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        // Pano API'si yoksa/izin yoksa eski yöntem
        try {
          const input = document.createElement('input');
          input.value = text;
          input.setAttribute('readonly', '');
          input.style.position = 'fixed';
          input.style.opacity = '0';
          document.body.appendChild(input);
          input.select();
          ok = document.execCommand('copy');
          input.remove();
        } catch {
          ok = false;
        }
      }
      if (status) {
        status.textContent = ok ? 'Kopyalandı' : 'Kopyalanamadı';
        status.classList.add('is-shown');
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          status.classList.remove('is-shown');
          status.textContent = '';
        }, 2200);
      }
    };
    button.addEventListener('click', onClick);
    cleanups.push(() => {
      button.removeEventListener('click', onClick);
      window.clearTimeout(timer);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}