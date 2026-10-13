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
  mail: 'M3.5 6h17v12h-17zM3.5 7l8.5 6.5L20.5 7',
  // rakam şeridi (filo) ikonları: tek çizgi stili, 24×24, yuvarlak uç; elle çizildi
  /** paletli ekskavatör: palet, kabin, bom + kol + kova */
  fleetExcavator:
    'M2.5 17.5h10a1.75 1.75 0 0 1 0 3.5h-10a1.75 1.75 0 0 1 0-3.5zM4 17.5V12h4.5l1.5 2.5v3M10 13l4.5-7 5 5.5M19.5 11.5l1.5 3h-3.5z',
  /** mini ekskavatör: kısa palet, küçük kabin, kısa kol + küçük kova, önde dozer bıçağı (kompakt makine) */
  fleetMiniExcavator:
    'M4.5 17.5h8a1.75 1.75 0 0 1 0 3.5h-8a1.75 1.75 0 0 1 0-3.5zM5.5 17.5v-6h4.5l1 2v4M10.5 13.5l4-4.5 3 3.5M17.5 12.5l.8 2.5h-2.6zM15.5 17v4h3',
  /** JCB / kazıcı yükleyici: önde büyük yükleme kepçesi + yükleyici kolu, arkada kazıcı kol, büyük arka teker, küçük ön teker, kabin */
  fleetBackhoe:
    'M10 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM18.5 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 14V6.5h4.5l1.5 4.5h3.5l1 3M4 14h11M10 17h4.5M15.5 12.5l3.5 2.5M18.5 13.5h4l-.5 4.5h-3zM6 9.5L3.5 5 1.5 9l1.5 1.5',
  /** damperli kamyon: damper kasa, kabin, tekerler */
  fleetDumpTruck:
    'M2 6.5h11.5L12 14.5H2zM14 9.5h3.5l3 3.5v3.5H12M2 14.5v2h2.5M8.5 16.5h7M8.5 18.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19.5 18.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  /** lowbed tır: uzun alçak dorse (arkası basamaklı), önde çekici kabin, dorse üstünde küçük paletli makine silueti, çok tekerlek */
  fleetLowbed:
    'M1.5 15.5h12.5l2-2.5h6.5V9.5L20.5 7H17v6M5.4 18.5a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0zM9 18.5a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0zM17.4 18.5a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0zM21.4 18.5a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0zM3 13.5h7M4 13.5V10h3l1 1.5M8 11.5l2.5-3.5 2 3',
  /** tamamlanan iş: onay işaretli pano */
  statJobs:
    'M9 3h6v3H9zM9 4.5H7A1.5 1.5 0 0 0 5.5 6v14A1.5 1.5 0 0 0 7 21.5h10a1.5 1.5 0 0 0 1.5-1.5V6A1.5 1.5 0 0 0 17 4.5h-2M8.8 13.5l2.4 2.4 4.2-4.8',
  /** mutlu müşteri: el sıkışma (iki kol manşeti + kenetlenen eller) */
  statHandshake:
    'M1.5 8.5l3.5-.5 1 7.5-3.5.5zM22.5 8.5L19 8l-1 7.5 3.5.5zM5 8.2l5-2 2.5 1.5 2.5-1.5 4 2M5.8 15.4l5 4c.7.6 1.8.4 2.3-.4l.4-.8M18 15.4l-4.6 3.6M12.5 7.7l-2.6 2.3a1.3 1.3 0 0 0 1.8 1.9l2-1.5 2.9 3a1.2 1.2 0 0 0 1.7-1.6',
} as const;

export type IconName = keyof typeof iconPaths;

/**
 * WhatsApp glyph'i (konuşma balonu içinde telefon ahizesi): Simple Icons "whatsapp", CC0, viewBox 0 0 24 24.
 * Dolgulu (fill) bir şekildir; çizgi ikon değildir. Tüm WhatsApp ikonları bu tek kaynağı kullanır:
 * src/components/WhatsAppIcon.astro (WhatsAppButton, mobil çubuk, sihirbaz, footer, iletişim kartları, yüzen düğme).
 */
export const whatsappPath =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';
