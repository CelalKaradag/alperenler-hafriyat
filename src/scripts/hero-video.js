/**
 * Hero arka plan videosu.
 *
 * - Poster her zaman altta (CSS arka planı) görünür; video yeterince tamponlanıp oynamaya
 *   başlayınca üstüne 400 ms'de yumuşakça gelir. Takılırsa (waiting/stalled) poster'a geri döner.
 * - Kesintisiz döngü için iki video üst üste kullanılır; biri bitmeye ~0,7 sn kala diğeri baştan
 *   başlar ve crossfade yapılır. Süre çok kısaysa veya ikinci video hata verirse tek video + native loop.
 * - Hareket azaltma, Save-Data, ekran dışı ve gizli sekmede video yüklenmez/duraklatılır.
 * - Video indirmesi sayfa tamamen yüklenip tarayıcı boşa çıkınca başlar (telefonda ek START_DELAY_PHONE_MS);
 *   ilk dokunuş/tuşta hemen başlar. Böylece video (≈3 MB) ilk açılışta poster, yazı ve fontlarla
 *   bant genişliği ve işlemci için yarışmaz; poster ilk karedir, geçiş fark edilmez.
 * - Kullanıcı tercihi (durdur/oynat) localStorage'da saklanır; erişilemezse sessizce yok sayılır.
 *
 * Videolar sunucu tarafında basılmaz: tarayıcı hiçbir şey indirmeden önce bu betik karar verir.
 * JavaScript kapalıysa <noscript> içindeki tek video (native loop) devreye girer.
 */

const FADE_IN_MS = 400;
const CROSSFADE_MS = 600;
const LEAD_SECONDS = 0.7;
const STORE_KEY = 'hero-video';
const START_DELAY_PHONE_MS = 1500;
const START_DELAY_WIDE_MS = 300;

let media = null;

function readPref() {
  try {
    return window.localStorage.getItem(STORE_KEY);
  } catch {
    return null;
  }
}

function writePref(value) {
  try {
    window.localStorage.setItem(STORE_KEY, value);
  } catch {
    /* depolama kapalıysa tercih saklanmaz */
  }
}

function readVariants() {
  try {
    const list = JSON.parse(media.dataset.sources || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Genişliğe uygun kaynaklar; o boyut yoksa eldeki hepsi. webm → mp4 sırası korunur. */
function pickSources(variants) {
  const wide = window.matchMedia('(min-width: 48em)').matches;
  const matching = variants.filter((item) => item.wide === wide);
  return matching.length > 0 ? matching : variants;
}

function buildVideo(variants, loop) {
  const video = document.createElement('video');
  video.className = 'hero-video';
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.playsInline = true;
  video.controls = false;
  video.tabIndex = -1;
  video.preload = 'auto';
  video.loop = loop;
  video.disablePictureInPicture = true;
  if ('disableRemotePlayback' in video) video.disableRemotePlayback = true;

  for (const item of pickSources(variants)) {
    const source = document.createElement('source');
    source.src = item.src;
    source.type = item.type;
    video.appendChild(source);
  }
  return video;
}

function init() {
  const variants = readVariants();
  if (variants.length === 0) return;

  const hero = media.closest('.hero');
  const toggle = hero.querySelector('[data-hero-toggle]');
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection && connection.saveData);

  const meta = new WeakMap(); // video başına { playing, ready }
  let videos = [];
  let active = 0;
  let started = false;
  let userPaused = readPref() === 'paused';
  let blocked = false; // play() reddedildi (örn. iOS düşük güç modu)
  let inView = true;
  let crossfading = false;
  let nativeLoop = false;
  let frame = 0;
  let crossfadeTimer = 0;

  const state = (video) => {
    if (!meta.has(video)) meta.set(video, { playing: false, ready: false });
    return meta.get(video);
  };

  const canRun = () => !reducedQuery.matches && !saveData;
  const shouldPlay = () => started && !userPaused && !blocked && inView && !document.hidden;

  function setToggleUi() {
    if (!toggle) return;
    toggle.hidden = !canRun();
    toggle.setAttribute('aria-pressed', String(userPaused || blocked));
  }

  function conceal(video) {
    video.style.transitionDuration = FADE_IN_MS + 'ms';
    video.classList.remove('is-visible');
  }

  function reveal(video) {
    if (video !== videos[active] || crossfading) return;
    const s = state(video);
    if (s.playing && s.ready) {
      video.style.transitionDuration = FADE_IN_MS + 'ms';
      video.classList.add('is-visible');
    }
  }

  function playSafe(video) {
    try {
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          if (video === videos[active]) {
            blocked = true;
            setToggleUi();
          }
        });
      }
    } catch {
      blocked = true;
      setToggleUi();
    }
  }

  function stopFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function startFrame() {
    if (frame || nativeLoop) return;
    frame = requestAnimationFrame(tick);
  }

  function tick() {
    frame = 0;
    if (!shouldPlay() || nativeLoop) return;
    const current = videos[active];
    const duration = current.duration;
    if (
      !crossfading &&
      Number.isFinite(duration) &&
      !current.paused &&
      duration - current.currentTime <= LEAD_SECONDS
    ) {
      crossfade();
    }
    frame = requestAnimationFrame(tick);
  }

  function crossfade() {
    const current = videos[active];
    const next = videos[1 - active];
    if (!next || next.readyState < 3) return; // hazır değilse 'ended' ile baştan başlatılır
    crossfading = true;
    try {
      next.currentTime = 0;
    } catch {
      /* başa sarma desteklenmiyorsa devam */
    }

    const fade = () => {
      current.style.zIndex = '1';
      next.style.zIndex = '2';
      next.style.transitionDuration = CROSSFADE_MS + 'ms';
      next.classList.add('is-visible');
      crossfadeTimer = window.setTimeout(() => {
        current.classList.remove('is-visible');
        current.pause();
        try {
          current.currentTime = 0;
        } catch {
          /* yok say */
        }
        active = 1 - active;
        crossfading = false;
        crossfadeTimer = 0;
        if (!shouldPlay()) videos.forEach((v) => v.pause());
      }, CROSSFADE_MS + 60);
    };

    try {
      const result = next.play();
      if (result && typeof result.then === 'function') {
        result.then(fade, () => {
          crossfading = false;
        });
      } else {
        fade();
      }
    } catch {
      crossfading = false;
    }
  }

  /** Tek video + native loop'a düş. */
  function useNativeLoop() {
    if (nativeLoop || videos.length === 0) return;
    nativeLoop = true;
    window.clearTimeout(crossfadeTimer);
    crossfading = false;
    stopFrame();
    const keep = videos[active];
    videos.forEach((v) => {
      if (v !== keep) v.remove();
    });
    videos = [keep];
    active = 0;
    keep.loop = true;
    keep.style.zIndex = '';
  }

  function destroy() {
    window.clearTimeout(crossfadeTimer);
    crossfading = false;
    stopFrame();
    videos.forEach((v) => {
      v.pause();
      v.remove();
    });
    videos = [];
    active = 0;
    started = false;
    nativeLoop = false;
  }

  function addSecond() {
    if (videos.length > 1 || nativeLoop) return;
    const second = buildVideo(variants, false);
    attach(second);
    media.appendChild(second);
    videos.push(second);
  }

  function attach(video) {
    video.addEventListener('playing', () => {
      state(video).playing = true;
      reveal(video);
    });
    video.addEventListener('canplaythrough', () => {
      state(video).ready = true;
      reveal(video);
      if (video === videos[0]) addSecond();
    });
    const interrupted = () => {
      state(video).playing = false;
      if (video === videos[active] && !crossfading) conceal(video);
    };
    video.addEventListener('waiting', interrupted);
    video.addEventListener('stalled', () => {
      if (video.readyState < 3) interrupted();
    });
    video.addEventListener('ended', () => {
      if (video === videos[active] && !crossfading && !video.loop) {
        video.currentTime = 0;
        playSafe(video);
      }
    });
    video.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(video.duration) && video.duration < LEAD_SECONDS * 3.5) useNativeLoop();
    });
    // <source> hataları yukarı kabarmaz; capture ile yakalanır. Tüm kaynaklar başarısızsa:
    video.addEventListener(
      'error',
      () => {
        if (video.networkState !== HTMLMediaElement.NETWORK_NO_SOURCE && !video.error) return;
        if (videos.length > 1 && video !== videos[active]) {
          videos = videos.filter((v) => v !== video);
          video.remove();
          active = 0;
          useNativeLoop();
        } else {
          destroy(); // ana video yüklenemedi: poster kalır, hata gösterilmez
        }
      },
      true,
    );
  }

  function sync() {
    if (!started) return;
    if (shouldPlay()) {
      const current = videos[active];
      if (current && current.paused) playSafe(current);
      startFrame();
    } else {
      videos.forEach((v) => v.pause());
      stopFrame();
    }
  }

  function start() {
    if (started || !canRun()) return;
    cancelSchedule();
    started = true;
    const first = buildVideo(variants, false);
    attach(first);
    media.appendChild(first);
    videos = [first];
    active = 0;
    sync();
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const playing = !userPaused && !blocked;
      if (playing) {
        userPaused = true;
        writePref('paused');
      } else {
        userPaused = false;
        blocked = false;
        writePref('playing');
      }
      setToggleUi();
      if (!started) start();
      else sync();
    });
  }

  document.addEventListener('visibilitychange', sync);

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    observer.observe(hero);
  }

  const onReducedChange = () => {
    if (reducedQuery.matches) {
      destroy();
    } else if (canRun() && !userPaused) {
      start();
    }
    setToggleUi();
  };
  if (reducedQuery.addEventListener) reducedQuery.addEventListener('change', onReducedChange);

  // Ertelenmiş başlangıç: load → (telefonda 1,5 sn) → tarayıcı boşta; ilk dokunuş/tuş beklemeden başlatır
  const KICK_EVENTS = ['pointerdown', 'keydown'];
  let delayTimer = 0;
  let idleHandle = 0;
  let scheduled = false;
  function cancelSchedule() {
    if (!scheduled) return;
    scheduled = false;
    window.removeEventListener('load', afterLoad);
    KICK_EVENTS.forEach((name) => window.removeEventListener(name, kickNow, true));
    window.clearTimeout(delayTimer);
    if (idleHandle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleHandle);
    else window.clearTimeout(idleHandle);
  }
  function kickNow() {
    cancelSchedule();
    if (canRun() && !userPaused) start();
  }
  function afterLoad() {
    const phone = window.matchMedia('(max-width: 47.99em)').matches;
    delayTimer = window.setTimeout(
      () => {
        idleHandle =
          'requestIdleCallback' in window
            ? window.requestIdleCallback(kickNow, { timeout: 2000 })
            : window.setTimeout(kickNow, 50);
      },
      phone ? START_DELAY_PHONE_MS : START_DELAY_WIDE_MS,
    );
  }
  function scheduleStart() {
    if (scheduled || started || !canRun() || userPaused) return;
    scheduled = true;
    KICK_EVENTS.forEach((name) => window.addEventListener(name, kickNow, { capture: true, passive: true }));
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });
  }

  setToggleUi();
  scheduleStart();

  // Sayfa geçişinde çağrılır: dinleyicileri bırakır, videoları durdurup kaldırır (indirme kesilir).
  return () => {
    cancelSchedule();
    document.removeEventListener('visibilitychange', sync);
    if (observer) observer.disconnect();
    if (reducedQuery.removeEventListener) reducedQuery.removeEventListener('change', onReducedChange);
    destroy();
  };
}

/** Beklenmedik bir hata olursa: tek video + native loop, sessizce. */
function fallbackNativeLoop() {
  try {
    const variants = readVariants();
    if (variants.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    media.querySelectorAll('video').forEach((v) => v.remove());
    const video = buildVideo(variants, true);
    video.autoplay = true;
    video.addEventListener('playing', () => video.classList.add('is-visible'));
    media.appendChild(video);
    const result = video.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  } catch {
    /* poster kalır */
  }
}

/**
 * Her sayfa yüklenişinde (ilk yükleme ve sayfa geçişi) page-init.js tarafından çağrılır.
 * Dönen fonksiyon (varsa) temizlik yapar.
 */
export function initHeroVideo() {
  media = document.querySelector('[data-hero-media]');
  if (!media) return null;
  try {
    return init();
  } catch {
    fallbackNativeLoop();
    return null;
  }
}
