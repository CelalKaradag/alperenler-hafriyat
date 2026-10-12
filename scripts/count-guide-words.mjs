#!/usr/bin/env node
/**
 * Rehber yazılarının kelime sayısını drafts.spec.ts ile AYNI yöntemle hesaplar:
 * sayfadaki `.guide-section` öğelerinin textContent'i birleştirilir, boşluklara göre bölünür.
 * (Derlenmiş HTML'de kardeş öğeler arasında boşluk yoktur; bu yüzden başlık/paragraf/madde
 * parçaları BOŞLUKSUZ birleştirilir: her öğe sınırında iki sözcük tek sayılır.)
 * Hedef aralık: test 500–800; yazı hedefi 550–750.
 *
 * Kullanım: node scripts/count-guide-words.mjs
 */
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/data/guides.ts', import.meta.url), 'utf8');
const start = source.indexOf('export const guides: Guide[] = [') + 'export const guides: Guide[] = '.length;
const end = source.indexOf('\n];', start) + 2;
// Dizi değişmezi saf JS'tir (tip notasyonu yok): doğrudan değerlendirilir
const guides = new Function(`return ${source.slice(start, end)}`)();

const count = (text) => text.split(/\s+/).filter(Boolean).length;
let failed = false;

for (const guide of guides) {
  const parts = guide.sections.flatMap((section) => [
    section.title,
    ...section.paragraphs,
    ...(section.items ?? []),
  ]);
  const asRendered = count(parts.join('')); // testteki textContent yöntemi
  const spaced = count(parts.join(' ')); // gerçek sözcük sayısı
  const ok = asRendered >= 550 && asRendered <= 750;
  if (!ok) failed = true;
  console.log(
    `${ok ? 'OK  ' : 'DIŞI'} ${String(asRendered).padStart(4)} (gerçek ${String(spaced).padStart(4)})  ${guide.slug}`,
  );
}
process.exit(failed ? 1 : 0);
