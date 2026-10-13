/**
 * Referanslar (müşteri onaylı; liste ve sıra sabittir). Yalnızca burada yazılanlar gösterilir; logo, tarih, rakam
 * veya proje detayı EKLENMEZ.
 */

export interface CorporateReference {
  /** Kartta büyük ve kalın görünen kısaltma (logo yerine) */
  mark: string;
  name: string;
  /** İsteğe bağlı küçük not */
  note?: string;
}

export interface InfrastructureItem {
  /** İl adı (kalın) veya kurum projeleri */
  name: string;
  /** İlçeler (varsa il adının yanında) */
  districts?: string[];
}

export const corporateReferences: CorporateReference[] = [
  { mark: 'EMLAK KONUT', name: 'Emlak Konut GYO A.Ş.', note: 'Malatya 4. ve 6. Etap' },
  { mark: 'ORMAN', name: 'Hekimhan Orman Müdürlüğü', note: 'Orman yolu yapımı' },
  { mark: 'TCDD', name: 'TCDD Genel Müdürlüğü' },
  { mark: 'MASKİ', name: 'Malatya MASKİ Genel Müdürlüğü' },
  { mark: 'ASKİ', name: 'Ankara ASKİ Genel Müdürlüğü' },
  { mark: 'MASKİ', name: 'Manisa MASKİ Genel Müdürlüğü' },
  { mark: 'SİBESKİ', name: 'Sivas SİBESKİ Genel Müdürlüğü' },
  { mark: 'İSKİ', name: 'İstanbul İSKİ Genel Müdürlüğü' },
];

/** Altyapı taşeronluğu */
export const infrastructure: InfrastructureItem[] = [
  { name: 'Ankara', districts: ['Beypazarı', 'Polatlı'] },
  { name: 'Manisa', districts: ['Alaşehir'] },
  { name: 'Sivas', districts: ['Çarkışla', 'Gemerek', 'Kangal'] },
  { name: 'Malatya' },
  { name: 'İller Bankası A.Ş. projeleri' },
];
