/**
 * Firma ve iletişim bilgileri için tek kaynak.
 * Site genelinde bu dosyadaki değerler kullanılır; başka yere elle yazmayın.
 */

export interface SiteConfig {
  /** Başlık ve logo alanında görünen kısa ad */
  name: string;
  /** Resmî/tam firma adı */
  legalName: string;
  /** Resmi ticari ünvan (firma kaşesinden, kesin): footer telif satırı, gizlilik sayfası ve JSON-LD legalName'de kullanılır */
  registeredName: string;
  /** Vergi dairesi (firma kaşesinden, kesin) */
  taxOffice: string;
  /** Vergi no (firma kaşesinden, kesin; 10 hane, boşluksuz) */
  taxId: string;
  /** MERSİS no (firma kaşesinden, kesin) */
  mersisNo: string;
  /** Ticaret sicil no (firma kaşesinden, kesin) */
  tradeRegistryNo: string;
  /** Kuruluş yılı (müşteri onaylı): ana sayfa, Hakkımızda */
  foundedYear: number;
  /** Kuruluş tarihi (ISO, JSON-LD foundingDate) */
  foundingDate: string;
  /** Firmanın onaylı sosyal medya hesapları (footer, iletişim sayfası, JSON-LD sameAs) */
  social: { tiktok?: string };
  /** Telefon: görünen biçim ve tel: bağlantısı */
  phone: { display: string; href: string };
  /**
   * WhatsApp numarası: ülke koduyla, yalnızca rakam (örn. "905XXXXXXXXX").
   * null iken WhatsApp butonları hiçbir yerde gösterilmez.
   */
  whatsappNumber: string | null;
  /** E-posta (firma onaylı, kesin): iletişim sayfası, footer (harita kartı), gizlilik sayfası ve JSON-LD'de gösterilir; tanımsızsa hiçbir yerde görünmez */
  email?: string;
  /** Google'daki tüm yorumlar bağlantısı (İşletme Profili); tanımsızsa "Google'da tüm yorumlar" düğmesi gizli */
  googleReviewsUrl?: string;
  /** Google'da yorum yazma bağlantısı; tanımsızsa "Google'da yorum yazın" düğmesi gizli */
  googleWriteReviewUrl?: string;
  /** Adres tek satırda; 34/2/8 aynen korunur */
  address: string;
  /** Aynı adresin yapısal hâli (JSON-LD için). `address` ile tutarlı tutulmalıdır. */
  addressParts: {
    street: string;
    district: string;
    region: string;
    country: string;
  };
  /**
   * Firmanın Google İşletme Profili / Maps yer bağlantısı. Tanımlıysa "Google Maps’te aç",
   * "Yol tarifi al" ve diğer harita bağlantıları bunu kullanır; tanımsızsa adres araması kullanılır.
   * Şimdilik tanımsız (doğrulanmış bağlantı yok).
   */
  mapsPlaceUrl?: string;
  /**
   * Doğrulanmış koordinat (enlem/boylam). null iken harita adres aramasıyla çalışır.
   * Tanımlıysa gömülü harita bu noktaya odaklanır, kendi sarı iğnemiz tam ortaya konur
   * ve JSON-LD’ye `geo` eklenir. Koordinat uydurulmaz; doğrulanmadan doldurulmamalıdır.
   */
  mapCoords: { lat: number; lng: number } | null;
  /** Doğrulanmış sosyal medya / işletme profili bağlantıları. Tanımlı değilse JSON-LD’ye eklenmez. */
  sameAs?: string[];
  publish: {
    /**
     * false: tüm sayfalarda noindex, nofollow (taslak).
     * Yayına çıkarken true yapılır; alan adı ise astro.config.mjs içindeki `site` ile verilir.
     */
    indexable: boolean;
  };
}

export const site: SiteConfig = {
  name: 'Alperenler Hafriyat',
  legalName: 'Alperenler Hafriyat İnşaat',
  // Kısa ad (legalName) başlık ve metinlerde aynen kalır; aşağıdakiler firma kaşesindeki RESMİ bilgilerdir.
  registeredName: 'Alperenler Hafriyat İnşaat Taah. Pet. Tar. İth. İhr. San. ve Tic. Ltd. Şti.',
  taxOffice: 'Beydağı',
  taxId: '0570602318',
  mersisNo: '0057060231800001',
  tradeRegistryNo: '27135',
  foundedYear: 2008,
  foundingDate: '2008',
  social: { tiktok: 'https://www.tiktok.com/@kaptanblacck' },
  // Google İşletme Profili (müşteri onaylı kısa bağlantı): profil, yorumlar ve yol tarifi buradan açılır.
  // mapCoords: işletme sahibinin Google Maps'te binanın üstünden aldığı koordinat (kısa bağlantı koordinat içermiyor).
  mapsPlaceUrl: 'https://maps.app.goo.gl/U4xZsNWxEhQWsY3x6',
  // Google İşletme Profili yorum bağlantıları (müşteri onaylı). Yalnızca ReviewsSection kullanır; yorum listesi boşken görünmez.
  googleReviewsUrl: 'https://g.page/r/CUW_reguN3B4EBE',
  googleWriteReviewUrl: 'https://g.page/r/CUW_reguN3B4EBE/review',
  email: 'alperenler.hrf.ltd@gmail.com',
  phone: { display: '0539 252 70 58', href: 'tel:+905392527058' },
  whatsappNumber: '905392527058',
  address: 'Koyunoğlu Mh. Erikli Sk. No:34/2/8, Yeşilyurt / Malatya',
  mapCoords: { lat: 38.316073, lng: 38.2685777 },
  addressParts: {
    street: 'Koyunoğlu Mh. Erikli Sk. No:34/2/8',
    district: 'Yeşilyurt',
    region: 'Malatya',
    country: 'TR',
  },
  publish: { indexable: false },
};

const encodedAddress = encodeURIComponent(site.address);
const coords = site.mapCoords;
/** Koordinat varsa harita/yol tarifi ona göre; yoksa adres araması */
const target = coords ? `${coords.lat},${coords.lng}` : encodedAddress;

/** Koordinat tanımlı mı? (tanımlıysa MapCard kendi iğnesini ortaya koyar) */
export const hasMapCoords = coords !== null;

/** "Google Maps’te aç" bağlantısı: İşletme Profili bağlantısı varsa o, yoksa koordinat/adres araması */
export const mapsUrl =
  site.mapsPlaceUrl ?? `https://www.google.com/maps/search/?api=1&query=${target}`;

/** "Yol tarifi al" bağlantısı: koordinat varsa koordinata, yoksa adrese yol tarifi (profil bağlantısı kullanılmaz) */
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${target}`;

/**
 * Gömülü harita (iframe) adresi.
 * Koordinat varsa `ll=` ile odaklanır ve `q` BULUNMAZ (Google kendi iğnesini koymasın; biz koyarız).
 * Yoksa adres araması yapılır.
 */
export const mapsEmbedUrl = coords
  ? `https://www.google.com/maps?ll=${coords.lat},${coords.lng}&z=16&output=embed`
  : `https://www.google.com/maps?q=${encodeURIComponent(`${site.legalName}, ${site.address}`)}&output=embed`;

/** Varsayılan hazır WhatsApp mesajı */
export const whatsappDefaultMessage =
  'Merhaba, web sitenizden ulaşıyorum. Bilgi ve fiyat teklifi almak istiyorum.';

/** Hizmete özel hazır WhatsApp mesajı */
export const whatsappServiceMessage = (serviceTitle: string): string =>
  `Merhaba, web sitenizden ulaşıyorum. ${serviceTitle} için bilgi ve fiyat teklifi almak istiyorum.`;

/** wa.me bağlantısı (mesaj URL-encode edilir). Numara girilmediyse null. */
export function whatsappLink(message: string = whatsappDefaultMessage): string | null {
  if (!site.whatsappNumber) return null;
  return `https://wa.me/${site.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

/** Varsayılan mesajlı bağlantı; WhatsApp numarası girilmediyse null */
export const whatsappUrl: string | null = whatsappLink();
