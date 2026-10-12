/**
 * Hizmet bölgeleri (/bolgeler/ ve /bolgeler/<slug>/): Malatya’nın 13 ilçesi.
 *
 * Hepsi `onaylandi: false`; yalnızca `showDrafts` (src/data/drafts.ts) true iken görünür (dev veya
 * `PUBLIC_SHOW_DRAFTS=true` önizleme), "TASLAK" rozetiyle ve noindex; sitemap’e ve JSON-LD’ye girmez.
 * **Firma hangi ilçelere gittiğini onayladığında yalnızca o ilçelerin `onaylandi` değerini `true`
 * yapın.** Hizmet verildiği doğrulanmadan yayına alınmamalıdır.
 *
 * Coğrafi, nüfus veya mesafe bilgisi YAZILMAZ (doğrulanmadı); metinler yalnızca ilçe adını kullanır.
 * Giriş cümlesi şablon kopyası gibi durmasın diye 4 farklı kalıptan ilçeye göre seçilir.
 */
import { showDrafts } from './drafts';

export interface Region {
  slug: string;
  /** İlçe adı */
  name: string;
  /** "Yeşilyurt’ta" gibi bulunma hâli (ünlü/ünsüz uyumuyla elle yazıldı) */
  locative: string;
  onaylandi: boolean;
  /** Bu bölgeye özel giriş cümlesi (4 kalıptan biri) */
  intro: string;
}

type RegionSeed = Pick<Region, 'slug' | 'name' | 'locative'>;

const seeds: RegionSeed[] = [
  { slug: 'yesilyurt', name: 'Yeşilyurt', locative: 'Yeşilyurt’ta' },
  { slug: 'battalgazi', name: 'Battalgazi', locative: 'Battalgazi’de' },
  { slug: 'akcadag', name: 'Akçadağ', locative: 'Akçadağ’da' },
  { slug: 'arapgir', name: 'Arapgir', locative: 'Arapgir’de' },
  { slug: 'arguvan', name: 'Arguvan', locative: 'Arguvan’da' },
  { slug: 'darende', name: 'Darende', locative: 'Darende’de' },
  { slug: 'dogansehir', name: 'Doğanşehir', locative: 'Doğanşehir’de' },
  { slug: 'doganyol', name: 'Doğanyol', locative: 'Doğanyol’da' },
  { slug: 'hekimhan', name: 'Hekimhan', locative: 'Hekimhan’da' },
  { slug: 'kale', name: 'Kale', locative: 'Kale’de' },
  { slug: 'kuluncak', name: 'Kuluncak', locative: 'Kuluncak’ta' },
  { slug: 'puturge', name: 'Pütürge', locative: 'Pütürge’de' },
  { slug: 'yazihan', name: 'Yazıhan', locative: 'Yazıhan’da' },
];

// 4 farklı giriş kalıbı: ilçenin sırasına göre seçilir
const introPatterns: Array<(region: RegionSeed) => string> = [
  (r) => `${r.locative} hafriyat, kazı ve iş makinesi ihtiyacınız için bizi arayabilirsiniz.`,
  (r) =>
    `${r.name} için kazı, hafriyat veya makine işiniz mi var? İşi anlatın, ihtiyacınıza göre teklif hazırlayalım.`,
  (r) =>
    `${r.locative} yapılacak hafriyat ve kazı işlerinde önce işin ve sahanın durumu konuşulur; sonra teklif hazırlanır.`,
  (r) =>
    `${r.name} bölgesindeki işiniz için telefonla veya WhatsApp’tan ulaşabilirsiniz; sahanın yeri ve işin türü yeterli bir başlangıçtır.`,
];

export const regions: Region[] = seeds.map((seed, index) => ({
  ...seed,
  onaylandi: false,
  intro: introPatterns[index % introPatterns.length](seed),
}));

/** Yayında yalnızca onaylılar; showDrafts (dev veya önizleme build’i) iken taslaklar da. */
export const visibleRegions: Region[] = regions.filter((region) => region.onaylandi || showDrafts);

/** Onaylı bölge adları (SSS cevabı ve sitemap için; taslaklar girmez) */
export const approvedRegionNames: string[] = regions
  .filter((region) => region.onaylandi)
  .map((region) => region.name);
