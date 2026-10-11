/**
 * Teklif sihirbazı: 3 adımda bilgi toplar, Türkçe bir mesaj kurar.
 * Hiçbir veri saklanmaz veya sunucuya gönderilmez (localStorage, çerez, istek yok).
 * Mesaj yalnızca kullanıcı "WhatsApp'tan gönder"e basınca WhatsApp'a taşınır.
 *
 * Her sayfa yüklenişinde (ilk yükleme ve sayfa geçişi) page-init.js tarafından çağrılır.
 * JavaScript yoksa sunucuda basılan sade "WhatsApp'tan yazın / Hemen Ara" kutusu kalır.
 */

const TOTAL = 3;
const MAX_PLACE = 120;
const MAX_NOTE = 500;

const clean = (value, max) => value.replace(/\s+/g, ' ').trim().slice(0, max);

function setup(root) {
  if (root.dataset.ready) return;
  const app = root.querySelector('[data-wizard-app]');
  if (!app) return;
  root.dataset.ready = '1';
  app.hidden = false;

  const waBase = root.dataset.waBase || '';
  const steps = Array.from(app.querySelectorAll('[data-step]'));
  const result = app.querySelector('[data-result]');
  const preview = app.querySelector('[data-preview]');
  const waLink = app.querySelector('[data-wa-link]');
  const currentLabel = app.querySelector('[data-current]');
  const segments = Array.from(app.querySelectorAll('[data-segment]'));
  const freeJob = app.querySelector('[data-job-text]');
  const freeJobWrap = app.querySelector('[data-job-text-wrap]');
  const textOnly = root.dataset.mode === 'text';
  const placeInput = app.querySelector('[name="place"]');
  const noteInput = app.querySelector('[name="note"]');

  let index = 0; // 0..2 adım, 3 sonuç

  const selected = (name) => {
    const input = app.querySelector(`input[name="${name}"]:checked`);
    return input ? input.value : '';
  };

  function showError(step, text) {
    const box = steps[step].querySelector('[data-error]');
    if (!box) return;
    box.textContent = text;
    box.hidden = !text;
  }

  function setInvalid(el, invalid) {
    if (!el) return;
    if (invalid) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  function go(next, moveFocus) {
    index = next;
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });
    result.hidden = index !== TOTAL;

    const shown = Math.min(index + 1, TOTAL);
    if (currentLabel) currentLabel.textContent = String(shown);
    segments.forEach((segment, i) => {
      segment.dataset.state = i < shown ? 'done' : 'todo';
    });

    if (moveFocus) {
      const target = index === TOTAL ? result.querySelector('[data-focus]') : steps[index].querySelector('legend');
      if (target) target.focus();
    }
  }

  function validate(step) {
    showError(step, '');
    if (step === 0) {
      if (textOnly) {
        const value = clean(freeJob.value, MAX_PLACE);
        setInvalid(freeJob, !value);
        if (!value) {
          showError(0, 'Lütfen hangi iş için teklif istediğinizi kısaca yazın.');
          freeJob.focus();
          return false;
        }
        return true;
      }
      if (!selected('job')) {
        showError(0, 'Lütfen bir seçenek belirleyin.');
        const first = steps[0].querySelector('input[name="job"]');
        if (first) first.focus();
        return false;
      }
      return true;
    }
    if (step === 1) {
      const value = clean(placeInput.value, MAX_PLACE);
      setInvalid(placeInput, !value);
      if (!value) {
        showError(1, 'Lütfen işin yapılacağı ilçe veya mahalleyi yazın.');
        placeInput.focus();
        return false;
      }
    }
    return true;
  }

  function buildMessage() {
    const intro = 'Merhaba, web sitenizden ulaşıyorum.';
    const job = textOnly ? clean(freeJob.value, MAX_PLACE) : selected('job');
    const other = !textOnly && job === '__diger';
    const otherText = other && freeJob ? clean(freeJob.value, MAX_PLACE) : '';

    let jobPhrase;
    if (textOnly) jobPhrase = `${job} için teklif almak istiyorum.`;
    else if (other) jobPhrase = otherText ? `${otherText} için teklif almak istiyorum.` : 'Bir iş için teklif almak istiyorum.';
    else jobPhrase = `${job} için teklif almak istiyorum.`;

    const parts = [intro, jobPhrase];
    const place = clean(placeInput.value, MAX_PLACE);
    if (place) parts.push(`Yer: ${place}.`);
    const time = selected('time');
    if (time) parts.push(`Zaman: ${time}.`);
    const note = clean(noteInput.value, MAX_NOTE);
    if (note) parts.push(`Not: ${note}`);
    return parts.join(' ');
  }

  function showResult() {
    const message = buildMessage();
    preview.textContent = message;
    if (waLink && waBase) waLink.href = `${waBase}?text=${encodeURIComponent(message)}`;
    go(TOTAL, true);
  }

  // "Diğer" seçilince isteğe bağlı yazı alanı açılır
  if (!textOnly && freeJobWrap) {
    const syncOther = () => {
      freeJobWrap.hidden = selected('job') !== '__diger';
    };
    app.querySelectorAll('input[name="job"]').forEach((input) => input.addEventListener('change', syncOther));
    syncOther();
  }

  app.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'next') {
      if (validate(index)) {
        if (index === TOTAL - 1) showResult();
        else go(index + 1, true);
      }
    } else if (action === 'back') {
      go(Math.max(0, index - 1), true);
    } else if (action === 'edit') {
      go(TOTAL - 1, true);
    }
  });

  // Enter ile form gönderilmesin; ileri adıma geçsin (metin alanlarında Enter)
  app.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.matches('input[type="text"]')) {
      event.preventDefault();
      const next = index < TOTAL ? steps[index].querySelector('[data-action="next"]') : null;
      if (next) next.click();
    }
  });

  go(0, false);
}

export function initQuoteWizards() {
  document.querySelectorAll('[data-quote-wizard]').forEach(setup);
}
