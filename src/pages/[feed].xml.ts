import type { APIRoute, GetStaticPaths } from 'astro';
import { calculator } from '../data/calculator';
import { guides } from '../data/guides';
import { machines } from '../data/machines';
import { priceGuide } from '../data/price-guide';
import { regions } from '../data/regions';
import { services } from '../data/services';
import { site } from '../data/site';
import { getGalleryEntries } from '../utils/gallery';

/**
 * Basit kendi sitemap’imiz (/sitemap.xml). `@astrojs/sitemap` kullanılmaz.
 *  - Yalnızca site.publish.indexable === true iken ÜRETİLİR (aksi halde dosya hiç oluşmaz).
 *  - Taslak içerik ASLA girmez: hizmet, makine, bölge, rehber yazı ve fiyat rehberi için yalnızca `onaylandi: true`
 *    olanlar listelenir (PUBLIC_SHOW_DRAFTS açık olsa bile).
 *  - /gizlilik/ (noindex) ve 404 listelenmez.
 */
export const getStaticPaths: GetStaticPaths = () =>
  site.publish.indexable ? [{ params: { feed: 'sitemap' } }] : [];

export const GET: APIRoute = ({ site: base }) => {
  if (!base) {
    throw new Error(
      "sitemap.xml için astro.config.mjs içinde 'site' (alan adı) tanımlı olmalıdır.",
    );
  }

  const paths = new Set<string>(['/', '/hakkimizda/', '/iletisim/', '/teklif/']);

  if (getGalleryEntries().length > 0) paths.add('/galeri/');

  const approvedServices = services.filter((item) => item.onaylandi);
  if (approvedServices.length > 0) {
    paths.add('/hizmetler/');
    approvedServices.forEach((item) => paths.add(`/hizmetler/${item.slug}/`));
  }

  const approvedMachines = machines.filter((item) => item.onaylandi);
  if (approvedMachines.length > 0) {
    paths.add('/makine-kiralama/');
    approvedMachines.forEach((item) => paths.add(`/makine-kiralama/${item.slug}/`));
  }

  if (priceGuide.onaylandi) paths.add('/hafriyat-fiyatlari/');
  if (calculator.onaylandi) paths.add('/hafriyat-hesaplama/');

  const approvedRegions = regions.filter((item) => item.onaylandi);
  if (approvedRegions.length > 0) {
    paths.add('/bolgeler/');
    approvedRegions.forEach((item) => paths.add(`/bolgeler/${item.slug}/`));
  }

  const approvedGuides = guides.filter((item) => item.onaylandi);
  if (approvedGuides.length > 0) {
    paths.add('/rehber/');
    approvedGuides.forEach((item) => paths.add(`/rehber/${item.slug}/`));
  }

  const urls = [...paths]
    .map((path) => `  <url><loc>${new URL(path, base).href}</loc></url>`)
    .join('\n');

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urls}\n` +
    '</urlset>\n';

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
