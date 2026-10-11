/**
 * Sık sorulan sorular.
 *
 * `onaylandi: true`  → ana sayfada, /hizmetler sayfasında ve FAQPage JSON-LD'de görünür.
 * `onaylandi: false` → yalnızca `showDrafts` (src/data/drafts.ts) true iken görünür: `npm run dev` ya da
 *                      `PUBLIC_SHOW_DRAFTS=true` ile alınan önizleme build'i ("TASLAK" rozetiyle).
 *                      Normal yayın çıktısında hiç üretilmez; JSON-LD'ye hiçbir zaman girmez.
 *
 * Cevaplar bilerek genel ve koşulludur; rakam, süre, garanti veya "en iyi" ifadesi yoktur.
 * Firma her cevabı okuyup onayladıktan sonra `onaylandi` değerini `true` yapmalıdır.
 */

import { showDrafts } from './drafts';

export interface Faq {
  question: string;
  answer: string;
  onaylandi: boolean;
}

export const faqs: Faq[] = [
  {
    question: 'Fiyat neye göre belirlenir?',
    answer:
      'Fiyat işin koşullarına göre belirlenir. Başlıca etkenler zemin türü, hacim (metreküp), sahaya mesafe ve kullanılacak makine tipidir. Kesin fiyat, işin ayrıntıları öğrenildikten sonra verilir.',
    onaylandi: false,
  },
  {
    question: 'Fiyat teklifi almak için ne gerekir?',
    answer:
      'İşin türü, sahanın bulunduğu yer (ilçe ve mahalle) ve varsa yaklaşık ölçüler yeterlidir. Bizi arayabilir veya Teklif Al sayfasından mesajınızı hazırlayabilirsiniz.',
    onaylandi: false,
  },
  {
    question: 'Hafriyat toprağı ve moloz nereye götürülür?',
    answer:
      'Hafriyat toprağı ve inşaat molozunun, ilgili belediyenin izin verdiği döküm alanlarına götürülmesi gerekir. Hangi alanın kullanılacağı sahanın yerine ve belediyenin düzenlemelerine bağlıdır; ayrıntı için arayarak sorabilirsiniz.',
    onaylandi: false,
  },
  {
    question: 'Dar alanlarda çalışılabilir mi?',
    answer:
      'Bu, sahanın ölçülerine ve kullanılacak makineye bağlıdır. Sahayı kısaca anlatıp bizi arayın, birlikte değerlendirelim.',
    onaylandi: false,
  },
  {
    question: 'Operatörlü iş makinesi kiralanabilir mi?',
    answer:
      'Operatörlü iş makinesi kiralama saatlik veya günlük olarak görüşülür. Hangi makinenin uygun olduğu işin niteliğine ve sahaya bağlıdır; ihtiyacınızı anlatarak bizi arayın.',
    onaylandi: false,
  },
  {
    question: 'Bina yıkımı için izin gerekir mi?',
    answer:
      'Yıkım işlerinde belediye ve ilgili kurumların süreçleri olabilir. İşe başlamadan önce ilgili belediyeden öğrenilmesi gerekir. Bu yanıt genel bilgidir, hukuki tavsiye değildir.',
    onaylandi: false,
  },
  {
    question: 'Hangi bölgelere hizmet veriyorsunuz?',
    answer:
      'Bulunduğunuz yeri yazın veya bizi arayın; konumunuza uygun olup olmadığını birlikte netleştirelim.',
    onaylandi: false,
  },
];

/** Yayında yalnızca onaylılar; showDrafts (dev veya önizleme build'i) iken taslaklar da. */
export const visibleFaqs: Faq[] = faqs.filter((item) => item.onaylandi || showDrafts);

/** JSON-LD için yalnızca onaylılar (taslaklar yapısal veriye girmez) */
export const approvedFaqs: Faq[] = faqs.filter((item) => item.onaylandi);
