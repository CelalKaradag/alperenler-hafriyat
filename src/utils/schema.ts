/**
 * Google yapısal veri (JSON-LD) üreticileri. Tüm JSON-LD buradan üretilir.
 * Yalnızca doğrulanmış verilerle çalışır: geo, openingHours, priceRange,
 * aggregateRating ve review bilerek eklenmez.
 */

import type { Faq } from '../data/faq';
import type { Service } from '../data/services';
import { site } from '../data/site';

type JsonObject = Record<string, unknown>;

/** `tel:+905392527058` → `+905392527058` */
const telephone = site.phone.href.replace(/^tel:/, '');

/** Sayfa adresi (alan adı tanımlı değilse null) */
function pageUrl(base: URL | undefined, path: string): string | undefined {
  return base ? new URL(path, base).href : undefined;
}

function organization(base?: URL): JsonObject {
  const { street, district, region, country } = site.addressParts;
  const data: JsonObject = {
    '@type': 'GeneralContractor',
    name: site.name,
    legalName: site.legalName,
    telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: street,
      addressLocality: district,
      addressRegion: region,
      addressCountry: country,
    },
  };
  const url = pageUrl(base, '/');
  if (url) data.url = url;
  // geo YALNIZCA doğrulanmış koordinat tanımlıysa eklenir
  if (site.mapCoords) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: site.mapCoords.lat,
      longitude: site.mapCoords.lng,
    };
  }
  if (site.email) data.email = site.email;
  if (site.sameAs && site.sameAs.length > 0) data.sameAs = site.sameAs;
  return data;
}

export function localBusinessSchema(base?: URL): JsonObject {
  return { '@context': 'https://schema.org', ...organization(base) };
}

export function serviceSchema(service: Service, base?: URL): JsonObject {
  const data: JsonObject = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    provider: organization(base),
  };
  const url = pageUrl(base, `/hizmetler/${service.slug}/`);
  if (url) data.url = url;
  return data;
}

export function faqSchema(faqs: Faq[]): JsonObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** <script type="application/ld+json"> içine güvenle gömülecek metin */
export function toJsonLd(data: JsonObject): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * BreadcrumbList: öğeler mutlak adres gerektirir, bu yüzden `site` (alan adı) tanımlı değilse
 * çağıran taraf JSON-LD basmamalıdır. Yalnızca onaylı sayfalar için kullanılır.
 */
export function breadcrumbSchema(items: Array<{ name: string; path: string }>, base: URL): JsonObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, base).href,
    })),
  };
}