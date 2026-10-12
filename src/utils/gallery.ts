import { gallery, type GalleryImage, type GalleryVideo } from '../data/gallery';
import { firstExisting, publicFileExists, webpSibling } from './assets';
import { imageSize } from './image-size';

export interface ResolvedImage {
  kind: 'image';
  item: GalleryImage;
  src: string;
  webp: string | null;
  alt: string;
  width: number;
  height: number;
}

export interface ResolvedVideo {
  kind: 'video';
  item: GalleryVideo;
  src: string;
  poster: string | undefined;
  title: string;
  width: number;
  height: number;
}

export type ResolvedEntry = ResolvedImage | ResolvedVideo;

/**
 * Dosyası public/ altında bulunan galeri öğeleri (sıra gallery.ts'tekiyle aynı).
 * Boyutlar verilmediyse dosyadan okunur; okunamazsa görsel için 4:3, video için 16:9 varsayılır.
 */
export function getGalleryEntries(): ResolvedEntry[] {
  const entries: ResolvedEntry[] = [];
  for (const item of gallery) {
    if (item.type === 'image') {
      if (!publicFileExists(item.src)) continue;
      const size = item.width && item.height ? null : imageSize(item.src);
      entries.push({
        kind: 'image',
        item,
        src: item.src,
        webp: webpSibling(item.src),
        alt: item.alt,
        width: item.width ?? size?.width ?? 1600,
        height: item.height ?? size?.height ?? 1200,
      });
    } else {
      const src = firstExisting(item.src);
      if (!src) continue;
      const poster = publicFileExists(item.poster) ? item.poster : undefined;
      const size = item.width && item.height ? null : poster ? imageSize(poster) : null;
      entries.push({
        kind: 'video',
        item,
        src,
        poster,
        title: item.title,
        width: item.width ?? size?.width ?? 960,
        height: item.height ?? size?.height ?? 540,
      });
    }
  }
  return entries;
}