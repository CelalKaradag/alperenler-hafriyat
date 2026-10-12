import { expect, test } from '@playwright/test';
import { FULL, collectPages, scrollThrough, stubGoogle, watchConsoleAndNetwork } from './helpers';

// Otomatik taşma/kırılma taraması: her sayfa × genişlik. Bulgular sayfa/genişlik/öğe ile listelenir.

test.setTimeout(600_000);
test.use({ reducedMotion: 'reduce' });

// Hızlı modda yalnız 390 ve 1366; tam modda (QA_MODE=full) 6 genişlik
const WIDTHS = FULL ? [360, 390, 768, 1024, 1366, 1920] : [390, 1366];
let pages: string[] = [];

test.beforeAll(async ({ browser }, testInfo) => {
  pages = await collectPages(browser, testInfo.project.use.baseURL as string);
});

/** Sayfa içinde çalışır; bulguların listesini döndürür */
function scan(full: boolean): string[] {
  const issues: string[] = [];
  const vw = document.documentElement.clientWidth;
  const label = (el: Element) => {
    const cls = typeof (el as HTMLElement).className === 'string' ? (el as HTMLElement).className : '';
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
  };
  /** Kaydırılabilir/kırpan bir ata varsa öğe oradan taşmış sayılmaz (galeri şeridi, kayan şerit...) */
  const clippedByAncestor = (el: Element) => {
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.overflowX !== 'visible') return true;
    }
    return false;
  };
  const decorative = (el: Element) => Boolean(el.closest('[aria-hidden="true"], .visually-hidden, .skip-link'));
  const visible = (el: Element) => {
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  // 1) yatay kaydırma
  if (document.documentElement.scrollWidth > vw) {
    issues.push(`yatay kaydırma: scrollWidth ${document.documentElement.scrollWidth} > ${vw}`);
  }

  // 2) ekran dışına taşan görünür öğe + 3) kapsayıcısından taşan metin
  // (sayfa geometrisi kaydırmadan bağımsızdır: yalnızca ilk geçişte, `full`)
  for (const el of full ? Array.from(document.body.querySelectorAll('*')) : []) {
    if (!visible(el) || decorative(el) || clippedByAncestor(el)) continue;
    const rect = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'path', 'circle', 'use', 'source'].includes(tag)) continue;
    if (rect.right > vw + 1 || rect.left < -1) {
      issues.push(`ekran dışı: ${label(el)} left=${Math.round(rect.left)} right=${Math.round(rect.right)} (vw ${vw})`);
    }
    const style = getComputedStyle(el);
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim());
    if (
      hasText &&
      style.display !== 'inline' &&
      !/nowrap|pre/.test(style.whiteSpace) &&
      !['auto', 'scroll'].includes(style.overflowX) &&
      style.textOverflow !== 'ellipsis' &&
      el.scrollWidth > el.clientWidth + 1 &&
      el.clientWidth > 0
    ) {
      issues.push(`metin taşması: ${label(el)} scrollWidth ${el.scrollWidth} > clientWidth ${el.clientWidth}`);
    }
  }

  // 4) üst üste binen tıklanabilir öğeler. Yalnızca AYNI kaydırma bağlamındaki öğeler karşılaştırılır:
  //    position:fixed/sticky bir kökün (header, alt çubuk, yüzen düğmeler, önizleme şeridi, yapışkan kart)
  //    içindekiler yalnızca aynı kökün içindekilerle; akıştaki içerik akıştakilerle.
  //    Gizli (visibility/display, opacity 0, aria-hidden, [hidden], kapalı menü) öğeler hariç.
  const hiddenAnywhere = (el: Element) => {
    if (el.closest('[hidden], [aria-hidden="true"], [inert], .skip-link, .visually-hidden')) return true;
    for (let node: Element | null = el; node; node = node.parentElement) {
      if (getComputedStyle(node).opacity === '0') return true;
    }
    return false;
  };
  const scrollContext = (el: Element): Element | null => {
    for (let node: Element | null = el; node && node !== document.body; node = node.parentElement) {
      const position = getComputedStyle(node).position;
      if (position === 'fixed' || position === 'sticky') return node;
    }
    return null; // akıştaki içerik
  };
  const clickable = Array.from(document.querySelectorAll('a[href], button'))
    .filter((el) => visible(el) && !hiddenAnywhere(el))
    .map((el) => ({ el, rect: el.getBoundingClientRect(), ctx: scrollContext(el) }))
    .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight); // ekranda görünen alan
  for (let i = 0; i < clickable.length; i++) {
    for (let j = i + 1; j < clickable.length; j++) {
      const a = clickable[i];
      const b = clickable[j];
      if (a.ctx !== b.ctx) continue; // farklı kaydırma bağlamı: karşılaştırma yok
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
      const h = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
      if (w > 2 && h > 2) {
        const pair = [label(a.el), label(b.el)].sort().join(' ↔ '); // aynı çift tek kez raporlanır
        issues.push(`üst üste binen: ${pair}`); // boyut yazılmaz: kaydırma adımları arasında aynı çift tek kayıt
      }
    }
  }
  return issues;
}

for (const width of WIDTHS) {
  test(`yerleşim taraması ${width}px: taşma, kırık görsel, çakışma, konsol/ağ`, async ({ page }) => {
    await stubGoogle(page);
    await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
    const problems = watchConsoleAndNetwork(page);
    const report: string[] = [];

    for (const path of pages) {
      await page.goto(path);
      await scrollThrough(page);

      // Her ekran yüksekliğinde (sabit çubuk/yüzen düğme dahil) tara
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = (await page.evaluate(() => window.innerHeight)) - 100;
      const found = new Set<string>();
      for (let y = 0; y < total; y += step) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        for (const issue of await page.evaluate(scan, y === 0)) found.add(issue);
      }
      // Görseller: yüklenmiş ve kırık değil. Her görsel görünüme kaydırılır ve decode() beklenir
      // (lazy-load zamanlaması yüzünden yanlış alarm olmasın); gerçekten kırık olan decode'da hata verir.
      const broken = await page.evaluate(async () => {
        const bad: string[] = [];
        for (const img of Array.from(document.images)) {
          if (img.getClientRects().length === 0) continue; // görünmeyen (kapalı lightbox vb.)
          img.scrollIntoView({ block: 'center' });
          try {
            await img.decode();
          } catch {
            bad.push(img.currentSrc || img.src || '(src yok)');
            continue;
          }
          if (!(img.complete && img.naturalWidth > 0)) bad.push(img.currentSrc || img.src || '(src yok)');
        }
        return bad;
      });
      for (const src of broken) found.add(`kırık/yüklenmemiş görsel: ${src}`);
      for (const issue of found) report.push(`${path} @${width}: ${issue}`);
    }

    expect(report, `yerleşim bulguları:\n${report.join('\n')}`).toEqual([]);
    expect(problems, `konsol/ağ sorunları:\n${problems.join('\n')}`).toEqual([]);
  });
}
