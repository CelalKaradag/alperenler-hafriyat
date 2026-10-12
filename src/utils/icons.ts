/**
 * Elle çizilmiş çizgi ikonlar (24×24, 1.5 px çizgi). Bileşen: src/components/Icon.astro
 */
export const iconPaths = {
  // hizmetler
  excavate: 'M3 8h5v8h8V8h5M3 20h18',
  demolish: 'M5 21V8l6-4 8 3v14M3 21h18M9 11h2M9 15h2M14 11h2M14 15h2',
  pipe: 'M2 8h20v8H2zM8 8v8M16 8v8',
  road: 'M8 3L4 21M16 3l4 18M12 4v3M12 10.5v3M12 17v3',
  rock: 'M3 19l5-9 3 4 4-8 6 13H3z',
  machine: 'M2 18.5h13V21H2zM4 18.5v-4h7v4M11 14.5l3-9 6 2-2 5.5',
  truck:
    'M2.5 6.5h10.5v9.5H2.5zM13 9.5h4.2l3.3 3.3V16H13zM6.5 19.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM17 19.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z',
  soil: 'M3 17c3-4 6-4 9 0s6 4 9 0M3 12c3-4 6-4 9 0s6 4 9 0M3 7c3-3 6-3 9 0s6 3 9 0',
  // genel
  phone:
    'M5 4h3.5l1.8 4.5-2.2 1.4a10.5 10.5 0 0 0 5 5l1.4-2.2 4.5 1.8V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z',
  pin: 'M12 21s6.5-5.7 6.5-11A6.5 6.5 0 0 0 5.5 10C5.5 15.3 12 21 12 21zM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  play: 'M8 5.5v13l11-6.5-11-6.5z',
  message: 'M4 5h16v11H9l-5 4V5z',
  quote: 'M7 3h7l4 4v14H7V3zM14 3v4h4M10 12h5M10 16h5',
  calendar:
    'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  users:
    'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M14.8 5.3a3.2 3.2 0 0 1 0 6',
  check: 'M5 12.5l4.5 4.5L19 7',
  // rakam şeridi (filo) ikonları: tek çizgi stili, 24×24, yuvarlak uç; elle çizildi
  /** paletli ekskavatör: palet, kabin, bom + kol + kova */
  fleetExcavator:
    'M3.5 18.5h11a1.75 1.75 0 0 1 0 3.5h-11a1.75 1.75 0 0 1 0-3.5zM5 18.5V14h6l1.5 2.5v2M10.5 14L15 6l4.5 6M19.5 12l2 2.5H18',
  /** JCB / kazıcı yükleyici: önde yükleme kepçesi, arkada kazıcı kol, iki teker */
  fleetBackhoe:
    'M11 18.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 19.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM5 18.5H2.5V14H17M6 14V7.5h5l2 3.5v3M13 11h4.5l2.5 5h2M6 9.5L3.5 5 2 9.5',
  /** damperli kamyon: damper kasa, kabin, tekerler */
  fleetDumpTruck:
    'M2 6.5h11.5L12 14.5H2zM14 9.5h3.5l3 3.5v3.5H12M2 14.5v2h2.5M8.5 16.5h7M8.5 18.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19.5 18.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  /** lowbed tır: alçak dorse üstünde iş makinesi, çekici kabin, tekerler */
  fleetLowbed:
    'M1.5 16h14M15.5 16V9.5H19l3 3.5V16h-6.5M3.5 16v-3h4.5v3M6.5 13l3-4.5 3 4M6.3 18.5a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0zM10.3 18.5a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0zM20.3 18.5a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0z',
} as const;

export type IconName = keyof typeof iconPaths;

/**
 * WhatsApp glyph'i (konuşma balonu içinde telefon ahizesi): Simple Icons "whatsapp", CC0, viewBox 0 0 24 24.
 * Dolgulu (fill) bir şekildir; çizgi ikon değildir. Tüm WhatsApp ikonları bu tek kaynağı kullanır:
 * src/components/WhatsAppIcon.astro (WhatsAppButton, mobil çubuk, sihirbaz, footer, iletişim kartları, yüzen düğme).
 */
export const whatsappPath =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';
