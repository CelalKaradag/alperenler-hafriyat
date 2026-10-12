import { getGalleryEntries } from '../utils/gallery';
import { visibleServices } from './services';

export interface NavItem {
  label: string;
  href: string;
}

// Galeri öğesi (dosyası bulunan) yoksa menüde "Galeri" de olmasın.
// Not: dev sunucusunda yeni medya eklenince menünün güncellenmesi için sunucuyu yeniden başlatın.
const hasGallery = getGalleryEntries().length > 0;

/** Ana menü. "Hizmetler" yalnızca görünür hizmet, "Galeri" yalnızca medya varsa eklenir. */
export const navItems: NavItem[] = [
  { label: 'Ana Sayfa', href: '/' },
  ...(visibleServices.length > 0 ? [{ label: 'Hizmetler', href: '/hizmetler/' }] : []),
  { label: 'Teklif Al', href: '/teklif/' },
  ...(hasGallery ? [{ label: 'Galeri', href: '/galeri/' }] : []),
  { label: 'Hakkımızda', href: '/hakkimizda/' },
  { label: 'İletişim', href: '/iletisim/' },
];
