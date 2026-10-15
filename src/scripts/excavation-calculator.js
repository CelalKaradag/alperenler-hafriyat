/**
 * Hafriyat hesaplayıcı: uzunluk × genişlik × derinlik → kazı hacmi, kabarmış hacim, yaklaşık kamyon seferi.
 * Hesap tarayıcıda yapılır; hiçbir veri saklanmaz veya gönderilmez. WhatsApp mesajını kullanıcı gönderir.
 * Ondalık için virgül veya nokta kabul edilir (Türkçe klavye: "2,5").
 */

const fmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
const LABELS = { length: 'uzunluk', width: 'genişlik', depth: 'derinlik' };

/** "2,5" / "2.5" / " 12 " → sayı; geçersizse NaN */
export function parseMeters(raw) {
  const text = String(raw).trim().replace(/\s+/g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(text)) return Number.NaN;
  return Number(text);
}

/** Saf hesap (testlerde ve sayfada aynı) */
export function computeExcavation({ length, width, depth, swell, truck }) {
  const bank = length * width * depth;
  const loose = bank * swell;
  const trips = Math.max(1, Math.ceil(loose / truck - 1e-9));
  return { bank, loose, trips };
}

const meters = (value) => `${fmt.format(value)} m`;

function setup(root) {
  if (root.dataset.ready) return;
  root.dataset.ready = '1';

  const form = root.querySelector('[data-calc-form]');
  const error = root.querySelector('[data-calc-error]');
  const result = root.querySelector('[data-calc-result]');
  const waLink = root.querySelector('[data-calc-wa]');
  const wizardLink = root.querySelector('[data-calc-wizard]');
  const out = (key) => root.querySelector(`[data-out="${key}"]`);
  const fig = (key) => root.querySelector(`[data-fig="${key}"]`);
  const truck = Number(root.dataset.truck) || 16;
  const waBase = root.dataset.waBase || '';
  const service = root.dataset.service || 'Hafriyat';

  form.addEventListener('submit', (event) => event.preventDefault());

  function read() {
    const values = {};
    const bad = [];
    for (const name of Object.keys(LABELS)) {
      const input = form.elements.namedItem(name);
      const value = parseMeters(input.value);
      const max = Number(input.dataset.max) || 1000;
      const ok = Number.isFinite(value) && value > 0 && value <= max;
      if (ok) input.removeAttribute('aria-invalid');
      else input.setAttribute('aria-invalid', 'true');
      if (!ok) bad.push(LABELS[name]);
      values[name] = value;
    }
    const soil = form.querySelector('input[name="soil"]:checked');
    values.swell = soil ? Number(soil.value) : 1.25;
    values.soilLabel = soil ? soil.dataset.label : 'Toprak';
    return { values, bad };
  }

  function update() {
    const { values, bad } = read();
    if (bad.length) {
      error.textContent = `Lütfen ${bad.join(', ')} için metre cinsinden bir sayı yazın (örnek: 2,5).`;
      error.hidden = false;
      result.dataset.state = 'invalid';
      return;
    }
    error.hidden = true;
    error.textContent = '';
    result.dataset.state = 'ok';

    const { bank, loose, trips } = computeExcavation({ ...values, truck });
    out('bank').textContent = fmt.format(bank);
    out('loose').textContent = fmt.format(loose);
    out('trips').textContent = fmt.format(trips);
    fig('length').textContent = meters(values.length);
    fig('width').textContent = meters(values.width);
    fig('depth').textContent = meters(values.depth);

    const dims = `${meters(values.length)} × ${meters(values.width)} × ${meters(values.depth)}`;
    const detail = `Ölçüler: ${dims} (yaklaşık ${fmt.format(bank)} m³ kazı, zemin: ${values.soilLabel.toLocaleLowerCase('tr-TR')}).`;
    const message = `Merhaba, web sitenizden ulaşıyorum. ${service} için teklif almak istiyorum. ${detail}`;
    if (waLink && waBase) waLink.href = `${waBase}?text=${encodeURIComponent(message)}`;
    if (wizardLink) {
      const params = new URLSearchParams({ is: service, not: detail });
      wizardLink.href = `/teklif/?${params.toString()}`;
    }
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
}

export function initExcavationCalculators() {
  document.querySelectorAll('[data-calculator]').forEach(setup);
}
