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
  message: 'M4 5h16v11H9l-5 4V5z',
  quote: 'M7 3h7l4 4v14H7V3zM14 3v4h4M10 12h5M10 16h5',
  calendar:
    'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  users:
    'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M14.8 5.3a3.2 3.2 0 0 1 0 6',
  check: 'M5 12.5l4.5 4.5L19 7',
} as const;

export type IconName = keyof typeof iconPaths;
