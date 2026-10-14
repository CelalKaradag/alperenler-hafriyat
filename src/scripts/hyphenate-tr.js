/**
 * İki yana yaslı paragraflar için Türkçe heceleme (yumuşak tire, U+00AD).
 *
 * Tarayıcıların çoğu (özellikle telefonda) Türkçe için `hyphens: auto` sözlüğü taşımaz; iki yana yaslı dar
 * satırlarda kelime araları açılır. Bu betik, typography.css'te iki yana yaslanan paragraflardaki uzun
 * kelimelere Türkçe hece kurallarına göre görünmez bölme noktaları ekler. Tire yalnızca satır sonunda kelime
 * bölünürse görünür; metin, kopyalama ve arama aynı kalır.
 *
 * Kurallar (her hecede tek ünlü): iki ünlü arasında 1 ünsüz → ünsüzden önce (ha-fri-yat), 2 ünsüz → aralarından
 * (haf-ri-yat), 3+ ünsüz → son ünsüzden önce (kont-rol, Türk-çe). Kelime başında en az 2, sonunda en az 3 harf kalır.
 */
const SELECTOR = '.about-intro, .about-copy > p, .prose p, .about-goal-text, .pillar p';
const VOWELS = new Set('aeıioöuüâîûAEIİOÖUÜÂÎÛ');
const SHY = '­';
const MIN_WORD = 7;

export function hyphenateWord(word) {
  if (word.length < MIN_WORD || word.includes(SHY)) return word;
  const vowels = [];
  for (let i = 0; i < word.length; i += 1) if (VOWELS.has(word[i])) vowels.push(i);
  if (vowels.length < 2) return word;
  let out = '';
  let last = 0;
  for (let k = 0; k < vowels.length - 1; k += 1) {
    const a = vowels[k];
    const b = vowels[k + 1];
    const consonants = b - a - 1;
    const pos = consonants === 0 ? b : consonants === 2 ? a + 2 : b - 1;
    if (pos - last >= 2 && pos >= 2 && word.length - pos >= 3) {
      out += word.slice(last, pos) + SHY;
      last = pos;
    }
  }
  return out + word.slice(last);
}

export function hyphenateText(text) {
  return text.replace(/\p{L}+/gu, hyphenateWord);
}

export function initHyphenate(root = document) {
  root.querySelectorAll(SELECTOR).forEach((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const next = hyphenateText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  });
  return null;
}
