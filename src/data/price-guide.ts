/**
 * Fiyat rehberi (/hafriyat-fiyatlari/). Rakam, fiyat veya süre YOKTUR; yalnızca fiyatı etkileyen
 * etkenler anlatılır. Hukuki tavsiye içermez.
 *
 * `onaylandi: false` → sayfa yalnızca `showDrafts` (src/data/drafts.ts) true iken üretilir
 * (`npm run dev` veya `PUBLIC_SHOW_DRAFTS=true` önizleme build'i), "TASLAK" rozetiyle; sitemap'e ve
 * JSON-LD'ye girmez. Firma metni onaylayınca `onaylandi: true` yapılır.
 */
import { showDrafts } from './drafts';

export interface GuideSection {
  id: string;
  title: string;
  intro: string;
  /** Fiyatı etkileyen etkenler (rakamsız) */
  factors: string[];
  /** İsteğe bağlı kısa not */
  note?: string;
}

export interface GuideFaq {
  question: string;
  answer: string;
  onaylandi: boolean;
}

export const priceGuide = {
  onaylandi: false,
  title: 'Hafriyat Fiyatları Nasıl Belirlenir?',
  seoTitle: 'Hafriyat Fiyatları Nasıl Belirlenir? | Alperenler Hafriyat',
  description:
    "Hafriyat, kazı, makine kiralama ve kamyon taşıma fiyatlarını hangi etkenlerin belirlediği; Malatya'da teklif için hangi bilgilerin yeterli olduğu.",
  lead: 'Hafriyat ve kazı işlerinde fiyat sabit bir listeyle değil, işin koşullarıyla belirlenir. Bu sayfa fiyatı etkileyen etkenleri anlatır; rakam vermez. Net fiyat için işi öğrenmemiz gerekir.',
  sections: [
    {
      id: 'metrekup-bazli-kazi',
      title: 'Metreküp bazlı kazı',
      intro:
        'Kazı işleri çoğu zaman çıkarılacak toprak veya malzemenin hacmine (metreküp) göre değerlendirilir. Hacmi ve işin zorluğunu şu etkenler belirler:',
      factors: [
        'Zemin türü (toprak, sert zemin, taşlık veya kayalık)',
        'Kazı alanı ve derinliği',
        'Çıkan malzemenin sahada kalıp kalmayacağı, taşınıp taşınmayacağı',
        'Sahaya erişim ve makinenin çalışma rahatlığı',
        'Kazı sonrası dolgu veya kapama istenip istenmediği',
      ],
    },
    {
      id: 'saatlik-gunluk-makine',
      title: 'Saatlik veya günlük makine',
      intro:
        'Bazı işlerde makine, işin süresine göre saatlik veya günlük olarak çalışır. Bu çalışma şeklinde fiyatı etkileyenler:',
      factors: [
        'Makine tipi (ekskavatör, mini ekskavatör, kazıcı yükleyici, kırıcılı ekskavatör)',
        'Çalışma süresi ve çalışma şekli (saatlik veya günlük)',
        'İşin niteliği ve zemin',
        'Makinenin sahaya nakli ve sahaya mesafe',
      ],
      note: 'Makineler operatörlü çalışır.',
    },
    {
      id: 'kamyon-sefer',
      title: 'Kamyon sefer',
      intro:
        'Toprak, moloz veya dolgu malzemesi taşınırken fiyat çoğunlukla sefer bazında değerlendirilir. Şu etkenler önemlidir:',
      factors: [
        'Taşınacak malzemenin türü (toprak, moloz, karışık) ve hacmi',
        'Sahadan boşaltma noktasına mesafe',
        'Sahaya kamyon girişi ve kullanılacak araç tipi',
        'Seferin sayısı ve zamanlaması',
      ],
      note: 'Hafriyat toprağı ve molozun, ilgili belediyenin izin verdiği alanlara götürülmesi gerekir.',
    },
    {
      id: 'yikim-isleri',
      title: 'Yıkım işleri',
      intro:
        'Yıkımda fiyatı yapının kendisi ve sahanın durumu belirler. Başlıca etkenler:',
      factors: [
        'Yapının türü ve büyüklüğü',
        'Çevredeki yapılara yakınlık ve sahaya giriş durumu',
        'Çıkacak molozun miktarı ve taşınması',
        'Beton gibi sert elemanlar için kırıcı gerekip gerekmediği',
      ],
      note: 'Yıkım işlerinde belediye ve ilgili kurumların süreçleri olabilir; işe başlamadan önce ilgili belediyeden öğrenilmesi gerekir. Bu bilgi genel niteliktedir, hukuki tavsiye değildir.',
    },
  ] satisfies GuideSection[],
  faqs: [
    {
      question: 'Fiyat neden işi görmeden net söylenemez?',
      answer:
        'Zemin, hacim, mesafe ve makine tipi işten işe değiştiği için fiyat, bu bilgiler öğrenildikten sonra verilir.',
      onaylandi: false,
    },
    {
      question: 'Teklif için hangi bilgiler yeterli?',
      answer:
        'İşin türü, yerin ilçe ve mahallesi, yaklaşık ölçüler ve varsa fotoğraf yeterlidir. Bizi arayabilir veya Teklif Al sayfasından mesajınızı hazırlayabilirsiniz.',
      onaylandi: false,
    },
    {
      question: 'Fiyat saatlik mi, metreküp mü verilir?',
      answer:
        'Bu işin türüne göre değişir. Kazıda hacim (metreküp), makinede saatlik veya günlük çalışma, taşımada sefer bazı konuşulur.',
      onaylandi: false,
    },
  ] satisfies GuideFaq[],
};

/** Sayfa yayında üretilsin mi? (onaylı ya da showDrafts) */
export const guideVisible: boolean = priceGuide.onaylandi || showDrafts;

/** Görünür SSS (taslaklar showDrafts iken) ve JSON-LD için yalnızca onaylılar */
export const visibleGuideFaqs: GuideFaq[] = priceGuide.faqs.filter(
  (item) => item.onaylandi || showDrafts,
);
export const approvedGuideFaqs: GuideFaq[] = priceGuide.faqs.filter((item) => item.onaylandi);
