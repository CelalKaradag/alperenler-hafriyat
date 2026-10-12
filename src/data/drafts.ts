/**
 * Taslak içerik gösterim bayrağı (tek kaynak).
 *
 * `onaylandi: false` olan hizmetler ve SSS maddeleri yalnızca `showDrafts` true iken görünür:
 *  - `npm run dev` sırasında her zaman (import.meta.env.DEV),
 *  - ya da build sırasında `PUBLIC_SHOW_DRAFTS=true` ortam değişkeni verilmişse (önizleme sürümü).
 *
 * Taslaklar görünür olduğunda "TASLAK" rozetleri çıkar; JSON-LD’ye (Service, FAQPage) taslaklar
 * ASLA girmez (yalnızca `onaylandi: true`). Gerçek yayında `PUBLIC_SHOW_DRAFTS` verilmemelidir.
 */
export const showDrafts: boolean =
  import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === 'true';

/**
 * Önizleme sürümü: taslaklar build çıktısında görünüyor (dev sunucusu değil).
 * Sayfanın en üstünde "Önizleme sürümü – içerikler onay bekliyor" şeridi bu durumda gösterilir.
 */
export const isPreviewBuild: boolean = showDrafts && !import.meta.env.DEV;
