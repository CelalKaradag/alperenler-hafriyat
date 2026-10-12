import type { APIRoute } from 'astro';
import { site } from '../data/site';

/**
 * robots.txt: site.publish.indexable === false iken her şeyi engeller ("Disallow: /");
 * true iken izin verir ve sitemap.xml adresini bildirir.
 * (robots.txt noindex yerine geçmez; sayfalarda ayrıca noindex meta etiketi yönetilir.)
 */
export const GET: APIRoute = ({ site: base }) => {
  const lines = site.publish.indexable
    ? [
        'User-agent: *',
        'Allow: /',
        ...(base ? ['', `Sitemap: ${new URL('/sitemap.xml', base).href}`] : []),
      ]
    : ['User-agent: *', 'Disallow: /'];

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
