/**
 * Saha görselleri / videolar ("Sahadan"). Dosyası public/ altında olmayan öğe hiç render edilmez;
 * hiç öğe yoksa ana sayfada bölüm görünmez.
 *
 * Konum, tarih veya müşteri adı YAZILMAZ (doğrulanmadı). Görsellerde aynı adlı .webp varsa
 * <picture> ile önce o sunulur; width/height gerçek piksel boyutudur (CLS olmasın diye).
 */

export interface GalleryImage {
  type: 'image';
  /** JPG yolu, örn. "/images/galeri/santiye-temel-kazisi.jpg" */
  src: string;
  /** Görseli anlatan kısa metin (erişilebilirlik için zorunlu) */
  alt: string;
  width: number;
  height: number;
}

export interface GalleryVideo {
  type: 'video';
  /** Tek yol ya da sırayla denenecek aday yollar (ilk var olan kullanılır) */
  src: string | string[];
  /** Video başlığı (erişilebilirlik için zorunlu) */
  title: string;
  /** Kapak görseli */
  poster?: string;
  width: number;
  height: number;
}

export type GalleryItem = GalleryImage | GalleryVideo;

export const gallery: GalleryItem[] = [
  {
    type: 'image',
    src: '/images/galeri/santiye-temel-kazisi.jpg',
    alt: 'Şehir içinde temel kazısı yapılan şantiye, Hitachi ekskavatörler ve kamyonlar',
    width: 1600,
    height: 1200,
  },
  {
    type: 'video',
    src: ['/videos/galeri/kazi-calismasi.mp4', '/images/galeri/kazi-calismasi.mp4'],
    title: 'Kazı çalışması',
    poster: '/images/galeri/kazi-calismasi-poster.jpg',
    width: 540,
    height: 960,
  },
  {
    type: 'image',
    src: '/images/galeri/derin-kazi-hitachi.jpg',
    alt: 'Derin temel kazısında çalışan Hitachi ekskavatör',
    width: 1000,
    height: 1333,
  },
  {
    type: 'video',
    src: ['/videos/galeri/drone-arazi-duzenleme.mp4', '/images/galeri/drone-arazi-duzenleme.mp4'],
    title: 'Arazi düzenleme, havadan görünüm',
    poster: '/images/galeri/drone-arazi-duzenleme-poster.jpg',
    width: 960,
    height: 540,
  },
  {
    type: 'image',
    src: '/images/galeri/arazide-yol-acma.jpg',
    alt: 'Dağlık arazide yol açma çalışması, ekskavatör ve arazi aracı',
    width: 1000,
    height: 1333,
  },
];