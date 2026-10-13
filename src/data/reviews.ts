/**
 * Müşteri yorumları (Google'dan ELLE girilen, statik liste). ŞİMDİLİK BOŞ: yorum UYDURULMAZ, örnek yorum
 * eklenmez. Liste boşken ana sayfada "Müşterilerimiz ne diyor" bölümü HİÇ render edilmez (başlık, boşluk yok).
 *
 * Dış script/iframe/API YOKTUR; bölüm hiçbir ağ isteği yapmaz. schema.org Review/AggregateRating işaretlemesi
 * EKLENMEZ (Google, işletmenin kendi sitesindeki yorumların işaretlenmesini kabul etmiyor).
 *
 * Yorum eklemek için aşağıdaki diziye şu biçimde satır yazın (soyadı kısaltılmış, yalnızca gerçek yorumlar):
 *   { author: 'Ahmet Y.', rating: 5, text: '…yorum metni…', date: '2026-03', googleUrl: 'https://…' },
 * `googleUrl` isteğe bağlıdır (yorumun Google'daki bağlantısı). Google bağlantıları: src/data/site.ts
 * (googleReviewsUrl, googleWriteReviewUrl).
 */

export interface Review {
  /** Soyadı kısaltılmış ad, örn. "Ahmet Y." */
  author: string;
  /** 1–5 */
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** YYYY-MM */
  date: string;
  /** Yorumun Google'daki bağlantısı (isteğe bağlı) */
  googleUrl?: string;
}

export const reviews: Review[] = [];

/** "2026-03" → "Mart 2026" (tarih ayrıştırılamazsa olduğu gibi) */
export function formatReviewDate(date: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(date);
  if (!match) return date;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return date;
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(
    new Date(Number(match[1]), month - 1, 1),
  );
}
