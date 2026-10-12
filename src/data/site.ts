/**
 * Firma ve iletişim bilgileri için tek kaynak.
 * Site genelinde bu dosyadaki değerler kullanılır; başka yere elle yazmayın.
 */

export interface SiteConfig {
  /** Başlık ve logo alanında görünen kısa ad */
  name: string;
  /** Resmî/tam firma adı */
  legalName: string;
  /** Logoda yazan tam ticari ünvan: yalnızca footer telif satırında ve JSON-LD legalName'de kullanılır */
  registeredName: string;
  /** Telefon: görünen biçim ve tel: bağlantısı */
  phone: { display: string; href: string };
  /**
   * WhatsApp numarası: ülke koduyla, yalnızca rakam (örn. "905XXXXXXXXX").
   * null iken WhatsApp butonları hiçbir yerde gösterilmez.
   */
  whatsappNumber: string | null;
  /** E-posta: tanımlı değilse hiçbir yerde gösterilmez (şu an doğrulanmış adres yok) */
  email?: string;
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
  registeredName: 'Alperenler Hafriyat İnşaat Taahhüt Ltd. Şti.',
  phone: { display: '0539 252 70 58', href: 'tel:+905392527058' },
  whatsappNumber: '905392527058',
  address: 'Koyunoğlu Mh. Erikli Sk. No:34/2/8, Yeşilyurt / Malatya',
  mapCoords: null,
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

/** "Yol tarifi al" bağlantısı: İşletme Profili bağlantısı varsa o, yoksa koordinata/adrese yol tarifi */
export const mapsDirectionsUrl =
  site.mapsPlaceUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${target}`;

/**
 * Gömülü harita (iframe) adresi.
 * Koordinat varsa `ll=` ile odaklanır ve `q` BULUNMAZ (Google kendi iğnesini koymasın; biz koyarız).
 * Yoksa adres araması yapılır.
 */
export const mapsEmbedUrl = coords
  ? `https://www.google.com/maps?ll=${coords.lat},${coords.lng}&z=16&output=embed`
  : `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

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
