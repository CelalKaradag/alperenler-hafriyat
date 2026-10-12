import imageMeta from '../data/image-meta.json';
import { publicFileExists } from './assets';
import { imageSize, type ImageSize } from './image-size';

/** scripts/build-images.mjs'in src/data/image-meta.json'a yazdığı kayıt */
interface MetaEntry {
  key: string;
  width: number;
  height: number;
  color: string;
  widths: number[];
}

const meta = imageMeta as unknown as Record<string, MetaEntry>;

export interface Responsive {
  key: string;
  width: number;
  height: number;
  /** Baskın renk (yer tutucu zemin) */
  color: string;
  widths: number[];
  webpSet: string;
  jpgSet: string;
}

const derivative = (key: string, width: number, ext: 'webp' | 'jpg') => `/images/_r/${key}-${width}.${ext}`;

/**
 * Görselin duyarlı türevleri varsa (meta + dosyalar diskte) srcset bilgisini döndürür;
 * yoksa null: çağıran taraf tek boy orijinal görsele düşer.
 */
export function getResponsive(src: string): Responsive | null {
  const entry = meta[src];
  if (!entry || entry.widths.length === 0) return null;
  const complete = entry.widths.every(
    (w) => publicFileExists(derivative(entry.key, w, 'webp')) && publicFileExists(derivative(entry.key, w, 'jpg')),
  );
  if (!complete) return null;
  const set = (ext: 'webp' | 'jpg') =>
    entry.widths.map((w) => `${derivative(entry.key, w, ext)} ${w}w`).join(', ');
  return {
    key: entry.key,
    width: entry.width,
    height: entry.height,
    color: entry.color,
    widths: entry.widths,
    webpSet: set('webp'),
    jpgSet: set('jpg'),
  };
}

/** Boyut: önce meta, yoksa dosyadan okunan değer (image-size.ts) */
export function getImageSize(src: string): ImageSize | null {
  const entry = meta[src];
  if (entry) return { width: entry.width, height: entry.height };
  return imageSize(src);
}

/**
 * Tek bir türev yolu gerektiğinde (örn. <video poster>): hedef genişliği karşılayan en küçük türev,
 * yoksa en büyüğü; duyarlı türev yoksa özgün dosya yolu.
 */
export function pickDerivative(src: string, targetWidth: number, ext: 'webp' | 'jpg'): string {
  const responsive = getResponsive(src);
  if (!responsive) return src;
  const widths = [...responsive.widths].sort((a, b) => a - b);
  const chosen = widths.find((w) => w >= targetWidth) ?? widths[widths.length - 1];
  return derivative(responsive.key, chosen, ext);
}