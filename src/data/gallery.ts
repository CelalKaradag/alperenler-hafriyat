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

const photo = (name: string, alt: string, extra: GalleryBase = {}): GalleryImage => ({
  type: 'image',
  src: `${DIR}/${name}.jpg`,
  alt,
  ...extra,
});

const video = (name: string, title: string, extra: GalleryBase = {}): GalleryVideo => ({
  type: 'video',
  src: [`${DIR}/${name}.mp4`, `/videos/galeri/${name}.mp4`],
  title,
  poster: `${DIR}/${name}-poster.jpg`,
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