import { visibleServices } from './services';

export interface NavItem {
  label: string;
  href: string;
}

/** Ana menü. "Hizmetler" yalnızca görünür hizmet varsa eklenir. */
export const navItems: NavItem[] = [
  { label: 'Ana Sayfa', href: '/' },
  ...(visibleServices.length > 0 ? [{ label: 'Hizmetler', href: '/hizmetler/' }] : []),
  { label: 'Teklif Al', href: '/teklif/' },
  { label: 'Hakkımızda', href: '/hakkimizda/' },
  { label: 'İletişim', href: '/iletisim/' },
];
