/**
 * Müşteri yorumları (Google'dan ELLE girilen, statik liste). Yorum UYDURULMAZ, örnek yorum eklenmez.
 * Liste boşken ana sayfada "Müşterilerimiz ne diyor" bölümü HİÇ render edilmez (başlık, boşluk yok).
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

// Google İşletme Profili'nden 15.10.2026'da birebir aktarıldı (metinler yazıldığı gibi). Tarih, Google'daki
// "x ay önce" bilgisinden ay olarak hesaplandı. Firma çalışanlarının ve site geliştiricisinin kendi yorumları
// ile metinsiz (yalnızca yıldız) yorumlar listeye alınmaz. Kullanıcı adı takma ad olan yorumda ad gösterilmez.
export const reviews: Review[] = [
  {
    author: 'Bayram K.',
    rating: 5,
    text: "Yaptıkları işin arkasında duran dürüst ve deneyimli insanlardır işinin ehli Turgut aydın'a teşekkürler ederiz",
    date: '2026-05',
  },
  {
    author: 'Okan G.',
    rating: 5,
    text: 'Bizde alt yapı taahhüt işini verdik Çok memnunuz cık tecrübeliler',
    date: '2026-05',
  },
  {
    author: 'Google kullanıcısı',
    rating: 5,
    text: 'deneyimli ve çözüm üreten operatörlere sahip hafriyat firması',
    date: '2026-05',
  },
  {
    author: 'Murat K.',
    rating: 5,
    text: "Çok deneyimli oparatörleri ile işimizi gününde teslim ettiler elemanların tecrübeli ahlaklı güler yüzlü olmasından dolayı Turgut Aydın'a ve muhammed bayrağa teşekkür ederiz.",
    date: '2026-03',
  },
  {
    author: 'Canpolat K.',
    rating: 5,
    text: "Malatya'da güvenebileceğiniz en iyi firma",
    date: '2026-03',
  },
];

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
