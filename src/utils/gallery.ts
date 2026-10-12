import { gallery, type GalleryImage, type GalleryVideo } from '../data/gallery';
import { firstExisting, publicFileExists, webpSibling } from './assets';
import { getImageSize, getResponsive, pickDerivative } from './responsive';

export interface ResolvedImage {
  kind: 'image';
  item: GalleryImage;
  src: string;
  webp: string | null;
  /** Lightbox tam boy için srcset (duyarlı türevler varsa) */
  webpSet: string | null;
  jpgSet: string | null;
  alt: string;
  width: number;
  height: number;
}

export interface ResolvedVideo {
  kind: 'video';
  item: GalleryVideo;
  src: string;
  /** Özgün poster yolu (Picture srcset üretir) */
  poster: string | undefined;
  /** <video poster> için tek dosya: küçük webp türevi (yoksa özgün) */
  posterSmall: string | undefined;
  /** Lightbox'ta video için büyük poster */
  posterLarge: string | undefined;
  title: string;
  width: number;
  height: number;
}

export type ResolvedEntry = ResolvedImage | ResolvedVideo;

/**
 * Dosyası public/ altında bulunan galeri öğeleri (sıra gallery.ts'tekiyle aynı).
 * Boyutlar verilmediyse önce image-meta.json'dan (build-images.mjs), yoksa dosyadan okunur;
 * okunamazsa görsel için 4:3, video için 16:9 varsayılır.
 */
export function getGalleryEntries(): ResolvedEntry[] {
  const entries: ResolvedEntry[] = [];
  for (const item of gallery) {
    if (item.type === 'image') {
      if (!publicFileExists(item.src)) continue;
      const size = getImageSize(item.src);
      const responsive = getResponsive(item.src);
      entries.push({
        kind: 'image',
        item,
        src: item.src,
        webp: webpSibling(item.src),
        webpSet: responsive?.webpSet ?? null,
        jpgSet: responsive?.jpgSet ?? null,
        alt: item.alt,
        width: size?.width ?? item.width ?? 1600,
        height: size?.height ?? item.height ?? 1200,
      });
    } else {
      const src = firstExisting(item.src);
      if (!src) continue;
      const poster = publicFileExists(item.poster) ? item.poster : undefined;
      const size = poster ? getImageSize(poster) : null;
      entries.push({
        kind: 'video',
        item,
        src,
        poster,
        posterSmall: poster ? pickDerivative(poster, 480, 'webp') : undefined,
        posterLarge: poster ? pickDerivative(poster, 960, 'jpg') : undefined,
        title: item.title,
        width: size?.width ?? item.width ?? 960,
        height: size?.height ?? item.height ?? 540,
      });
    }
  }
  return entries;
}
