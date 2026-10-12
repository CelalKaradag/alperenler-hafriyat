/**
 * Saha görselleri / videolar ("Sahadan" ve /galeri/). Dosyası public/ altında olmayan öğe hiç render
 * edilmez; hiç öğe yoksa ana sayfada bölüm, menüde "Galeri" görünmez.
 *
 * Konum, tarih, müşteri adı veya "projemiz" gibi iddia YAZILMAZ (doğrulanmadı).
 *
 * Dosya adlandırması (public/images/galeri/):
 *   <ad>.jpg (+ <ad>.webp varsa <picture> ile önce o sunulur)
 *   <ad>.mp4 + <ad>-poster.jpg  (mp4, /videos/galeri/ altında da aranır)
 * Piksel boyutları (CLS olmasın diye) dosyadan build/dev sırasında okunur; video boyutu poster
 * görselinden alınır. Elle vermek için width/height yazın.
 *
 * `featured: true` olanlar ana sayfadaki "Sahadan" bölümünde (en çok 6) görünür.
 */

export interface GalleryBase {
  featured?: boolean;
  /** İlgili hizmetlerin slug’ları (hizmet detay sayfasındaki "Sahadan kareler" şeridi için) */
  services?: string[];
  width?: number;
  height?: number;
}

export interface GalleryImage extends GalleryBase {
  type: 'image';
  /** JPG yolu, örn. "/images/galeri/santiye-temel-kazisi.jpg" */
  src: string;
  /** Görseli anlatan kısa metin (erişilebilirlik için zorunlu) */
  alt: string;
}

export interface GalleryVideo extends GalleryBase {
  type: 'video';
  /** Tek yol ya da sırayla denenecek aday yollar (ilk var olan kullanılır) */
  src: string | string[];
  /** Video başlığı (erişilebilirlik için zorunlu) */
  title: string;
  /** Kapak görseli */
  poster?: string;
}

export type GalleryItem = GalleryImage | GalleryVideo;

const DIR = '/images/galeri';

// Hizmet slug’ları (services.ts)
const S = {
  hafriyat: 'hafriyat-ve-temel-kazisi',
  yikim: 'bina-yikim-ve-kirim',
  altyapi: 'altyapi-ve-kanalizasyon-kazisi',
  arazi: 'arazi-duzleme-ve-yol-acma',
  kaya: 'kaya-kirma-ve-kirici-isleri',
  makine: 'operatorlu-is-makinesi-kiralama',
  tasima: 'hafriyat-kamyonu-ve-moloz-tasima',
  dolgu: 'dolgu-toprak-temini-ve-saha-temizligi',
} as const;

// Dosya adından hizmet eşlemesi (görsel/video içeriğine göre makul eşleme):
//   boru/kanal → altyapı; kırıcı/kaya → kaya kırma; arazi/teras/drone/yol → arazi düzleme;
//   lowbed/kamyon → taşıma; istinat/duvar/gabion → dolgu-saha; şantiye/temel/derin → hafriyat ve yıkım
const SERVICES_BY_NAME: Record<string, string[]> = {
  'santiye-temel-kazisi': [S.hafriyat, S.yikim, S.tasima],
  'kazi-calismasi': [S.hafriyat, S.makine],
  'derin-kazi-hitachi': [S.hafriyat, S.yikim],
  'drone-arazi-duzenleme': [S.arazi],
  'arazide-yol-acma': [S.arazi],
  'tas-ocagi-ekskavator-kamyon': [S.makine, S.tasima, S.kaya],
  'beton-boru-dosemesi': [S.altyapi],
  'gun-batiminda-ekskavator': [S.makine, S.dolgu],
  'kabinden-kazi': [S.hafriyat, S.makine],
  'su-hatti-boru-dosemesi': [S.altyapi],
  'sokakta-kanal-kazisi': [S.altyapi],
  'kirici-ile-kaya-kirma': [S.kaya],
  'boru-hatti-calismasi': [S.altyapi],
  'demiryolu-hattinda-ekskavator': [S.makine, S.altyapi],
  'ekskavator-tasima-lowbed': [S.tasima, S.makine],
  'karli-arazide-calisma': [S.arazi, S.makine],
  'buyuk-cap-boru-yerlestirme': [S.altyapi],
  'raylarda-ozel-ekskavator': [S.makine],
  'istinat-duvari-ve-ekskavator': [S.dolgu],
  'sehir-ici-kanal-kazisi': [S.altyapi],
  'boru-hatti-kazisi': [S.altyapi],
  'tas-istinat-duvari': [S.dolgu],
  'teras-arazi-duzenleme': [S.arazi, S.dolgu],
  'altyapi-boru-dosemesi': [S.altyapi],
  'gabion-duvar': [S.dolgu],
  'bayrakli-arazi-calismasi': [S.arazi, S.makine],
  'duzlenmis-saha': [S.arazi, S.dolgu],
};

const photo = (name: string, alt: string, extra: GalleryBase = {}): GalleryImage => ({
  type: 'image',
  src: `${DIR}/${name}.jpg`,
  alt,
  services: SERVICES_BY_NAME[name],
  ...extra,
});

const video = (name: string, title: string, extra: GalleryBase = {}): GalleryVideo => ({
  type: 'video',
  src: [`${DIR}/${name}.mp4`, `/videos/galeri/${name}.mp4`],
  title,
  poster: `${DIR}/${name}-poster.jpg`,
  services: SERVICES_BY_NAME[name],
  ...extra,
});

export const gallery: GalleryItem[] = [
  // İlk beş öğe
  photo(
    'santiye-temel-kazisi',
    'Şehir içinde temel kazısı yapılan şantiye, Hitachi ekskavatörler ve kamyonlar',
    { width: 1600, height: 1200, featured: true },
  ),
  video('kazi-calismasi', 'Kazı çalışması', { width: 540, height: 960, featured: true }),
  photo('derin-kazi-hitachi', 'Derin temel kazısında çalışan Hitachi ekskavatör', {
    width: 1000,
    height: 1333,
    featured: true,
  }),
  video('drone-arazi-duzenleme', 'Arazi düzenleme, havadan görünüm', { width: 960, height: 540 }),
  photo('arazide-yol-acma', 'Dağlık arazide yol açma çalışması, ekskavatör ve arazi aracı', {
    width: 1000,
    height: 1333,
    featured: true,
  }),

  // Yeni fotoğraflar (videolar araya serpiştirildi)
  photo('tas-ocagi-ekskavator-kamyon', 'Taş ocağında ekskavatör ve damperli kamyon', { featured: true }),
  photo('beton-boru-dosemesi', 'Kanal kazısına beton boru indirilmesi'),
  photo('gun-batiminda-ekskavator', 'Toprak yığını üzerinde paletli ekskavatör'),
  video('kabinden-kazi', 'Kabinden kazı çalışması'),
  photo('su-hatti-boru-dosemesi', 'Arazide su hattı boru döşemesi'),
  photo('sokakta-kanal-kazisi', 'Sokakta kanalizasyon kazısı'),
  photo('kirici-ile-kaya-kirma', 'Kırıcı takılı ekskavatörlerle kaya kırma', { featured: true }),
  video('boru-hatti-calismasi', 'Boru hattı çalışması'),
  photo('demiryolu-hattinda-ekskavator', 'Demiryolu hattında çalışan ekskavatörler'),
  photo('ekskavator-tasima-lowbed', 'Ekskavatörün lowbed ile taşınması'),
  video('karli-arazide-calisma', 'Karlı arazide çalışma'),
  photo('buyuk-cap-boru-yerlestirme', 'Büyük çaplı beton borunun kazıya yerleştirilmesi'),
  photo('raylarda-ozel-ekskavator', 'Ray üzerinde çalışan ekskavatör'),
  photo('istinat-duvari-ve-ekskavator', 'Taş istinat duvarı ve ekskavatör'),
  video('sehir-ici-kanal-kazisi', 'Şehir içi kanal kazısı'),
  photo('boru-hatti-kazisi', 'Boru hattı kazısı'),
  photo('tas-istinat-duvari', 'Tamamlanan taş istinat duvarı'),
  video('teras-arazi-duzenleme', 'Teraslı arazi düzenleme'),
  photo('altyapi-boru-dosemesi', 'Şehir içinde altyapı boru döşemesi'),
  photo('gabion-duvar', 'Taş duvar çalışması'),
  photo('bayrakli-arazi-calismasi', 'Dağlık arazide ekskavatör çalışması'),
  video('duzlenmis-saha', 'Düzlenmiş saha'),
];