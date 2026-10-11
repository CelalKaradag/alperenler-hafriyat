/**
 * Saha görselleri / projeler. Gerçek ve onaylı medya gelene kadar BOŞ kalır.
 * Liste boşsa (veya dosyalar public/ altında yoksa) ana sayfada bölüm görünmez.
 * Yollar public/ altındadır, örn. "/images/galeri/saha-01.jpg".
 */

export interface GalleryImage {
  type: 'image';
  src: string;
  /** Görseli anlatan kısa metin (erişilebilirlik için zorunlu) */
  alt: string;
  caption?: string;
}

export interface GalleryVideo {
  type: 'video';
  /** Örn. "/videos/saha-01.mp4" */
  src: string;
  /** Video başlığı (erişilebilirlik için zorunlu) */
  title: string;
  /** Kapak görseli, örn. "/images/galeri/saha-01-poster.jpg" */
  poster?: string;
  caption?: string;
}

export type GalleryItem = GalleryImage | GalleryVideo;

export const gallery: GalleryItem[] = [];
