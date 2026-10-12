/**
 * Makine kiralama sayfaları (/makine-kiralama/ ve /makine-kiralama/<slug>/).
 *
 * `onaylandi: false` → yalnızca `showDrafts` (src/data/drafts.ts) true iken görünür ve "TASLAK"
 * rozeti taşır: `npm run dev` veya `PUBLIC_SHOW_DRAFTS=true` ile alınan önizleme build'i.
 * Normal yayın çıktısında sayfa, menü/liste bağlantısı ve sitemap girdisi üretilmez; JSON-LD'ye girmez.
 *
 * DİKKAT: Bu makinelerin firmada bulunduğu henüz ONAYLANMADI. Firma hangi makinelerin gerçekten
 * bulunduğunu doğrulamadan `onaylandi: true` yapılmamalıdır. Metinlerde rakam, fiyat, süre,
 * model/marka iddiası veya "en iyi" ifadesi yoktur; eklenmemelidir.
 */
import type { IconName } from '../utils/icons';
import { showDrafts } from './drafts';

export interface Machine {
  slug: string;
  title: string;
  /** SEO başlığında kullanılan ad: "<seoName> Malatya | Alperenler Hafriyat" */
  seoName: string;
  summary: string;
  /** Makine ne işe yarar (paragraflar) */
  detail: string[];
  /** Hangi işlerde tercih edilir */
  uses: string[];
  /** Teklif için gerekenler */
  quoteNeeds: string[];
  /** İlgili hizmet slug'ları (services.ts) */
  relatedServices: string[];
  icon: IconName;
  /** Galeri görseli (JPG; aynı adlı .webp varsa <picture> ile önce o) */
  image: string;
  onaylandi: boolean;
}

// Hizmet slug'ları (services.ts)
const S = {
  hafriyat: 'hafriyat-ve-temel-kazisi',
  yikim: 'bina-yikim-ve-kirim',
  altyapi: 'altyapi-ve-kanalizasyon-kazisi',
  arazi: 'arazi-duzleme-ve-yol-acma',
  kaya: 'kaya-kirma-ve-kirici-isleri',
  makine: 'operatorlu-is-makinesi-kiralama',
  tasima: 'hafriyat-kamyonu-ve-moloz-tasima',
  dolgu: 'dolgu-toprak-temini-ve-saha-temizligi',
} as const;

/** Çalışma şekli: tüm makine sayfalarında ortak, rakamsız */
export const machineWorkingModel =
  'Saatlik, günlük veya iş bazında (kamyonda sefer bazında) çalışma şekli işin niteliğine göre görüşülür. Makineler operatörlü çalışır; fiyat işin koşulları öğrenildikten sonra verilir.';

/** Teklif için gerekenler: tüm makine sayfalarında ortak liste (makineye özel maddeler başa eklenir) */
export const machineCommonNeeds = [
  'İşin türü ve ne yapılmak istendiği',
  'Sahanın bulunduğu ilçe ve mahalle',
  'Zemin durumu ve yaklaşık ölçüler (biliniyorsa)',
  'Çalışmanın ne zaman yapılması istendiği',
];

export const machines: Machine[] = [
  {
    slug: 'kiralik-kepce-jcb',
    title: 'Kiralık Kepçe (Kazıcı Yükleyici)',
    seoName: 'Kiralık Kepçe (Kazıcı Yükleyici)',
    summary:
      "Kazı ve yükleme işlerini tek makineyle yürüten kazıcı yükleyici (kepçe); operatörlü kiralama Malatya'da iş ve sahaya göre görüşülür.",
    detail: [
      'Kazıcı yükleyici, halk arasında kepçe olarak da bilinir; önünde yükleme kovası, arkasında kazı kolu bulunan bir iş makinesidir. Aynı makine hem kazı yapabilir hem de malzemeyi yükleyip yerinden oynatabildiği için küçük ve orta ölçekli işlerde sık tercih edilir.',
      "Malatya'da arsa hazırlığı, hat kazısı ve dolgu gibi işlerde makinenin sahaya girebilmesi, zeminin türü ve işin hacmi hangi makinenin uygun olacağını belirler; bu yüzden iş önce konuşulur.",
    ],
    uses: [
      'Küçük ve orta ölçekli temel veya hendek kazılarında',
      'Kazı ile yüklemenin birlikte yapılması gereken işlerde',
      'Dolgu malzemesinin sahaya serilmesi ve yüklenmesinde',
      'Saha temizliği ve malzeme toplama işlerinde',
    ],
    quoteNeeds: ['Kazı mı, yükleme mi, ikisi birden mi gerektiği'],
    relatedServices: [S.hafriyat, S.altyapi, S.dolgu, S.makine],
    icon: 'machine',
    image: '/images/galeri/altyapi-boru-dosemesi.jpg',
    onaylandi: false,
  },
  {
    slug: 'ekskavator-kiralama',
    title: 'Ekskavatör Kiralama',
    seoName: 'Ekskavatör Kiralama',
    summary:
      "Derin ve geniş kazılar için paletli ekskavatör; operatörlü kiralama Malatya'da iş ve sahaya göre görüşülür.",
    detail: [
      'Paletli ekskavatör; uzun kolu ve kovası sayesinde derin ve geniş kazılarda, ağır zeminlerde ve yüksek hacimli işlerde kullanılan temel kazı makinesidir. Kol ucuna kırıcı gibi farklı ataşmanlar takılabildiği için aynı makine farklı işlerde de çalışabilir.',
      "Malatya'da temel kazısı, altyapı hattı, yıkım sonrası hafriyat ve arazi düzleme gibi işlerde ekskavatör sıkça gerekir. Kazı derinliği, zemin ve çıkacak malzemenin miktarı makinenin ve sayısının belirlenmesinde etkilidir.",
    ],
    uses: [
      'Derin ve geniş temel kazılarında',
      'Altyapı ve kanal hattı kazılarında',
      'Yıkım sonrası enkaz ve hafriyat kaldırmada',
      'Arazi düzleme ve yol açma gibi büyük hacimli işlerde',
    ],
    quoteNeeds: ['Kazı derinliği ve alanı (yaklaşık)'],
    relatedServices: [S.hafriyat, S.yikim, S.altyapi, S.arazi, S.makine],
    icon: 'machine',
    image: '/images/galeri/santiye-temel-kazisi.jpg',
    onaylandi: false,
  },
  {
    slug: 'mini-ekskavator-kiralama',
    title: 'Mini Ekskavatör Kiralama',
    seoName: 'Mini Ekskavatör Kiralama',
    summary:
      "Dar alanlarda ve hassas çalışmalarda küçük ekskavatör; operatörlü kiralama Malatya'da iş ve sahaya göre görüşülür.",
    detail: [
      'Mini ekskavatör, normal ekskavatörün küçültülmüş hâlidir; dar sokaklarda, bina aralarında, bahçelerde ve kapıdan geçmesi gereken sahalarda çalışabilir. Daha küçük olduğu için yüzeye ve çevredeki yapılara daha az yük bindirir.',
      "Malatya'da şehir içi dar sokaklarda hat kazısı, bahçe düzenlemesi ve ince işlerde mini ekskavatör tercih edilir. Hangi makinenin uygun olacağı sahanın giriş genişliğine, zemine ve işin hacmine bağlıdır.",
    ],
    uses: [
      'Dar sokak ve bina arası hat kazılarında',
      'Bahçe ve avlu gibi kapalı alanlarda kazı ve dolgu işlerinde',
      'Hassas, küçük hacimli kazılarda',
      'Büyük makinenin giremediği sahalarda',
    ],
    quoteNeeds: ['Sahaya giriş genişliği (kapı, sokak) ve ulaşım durumu'],
    relatedServices: [S.altyapi, S.dolgu, S.makine, S.hafriyat],
    icon: 'machine',
    image: '/images/galeri/sokakta-kanal-kazisi.jpg',
    onaylandi: false,
  },
  {
    slug: 'kiricili-ekskavator',
    title: 'Kırıcılı Ekskavatör Kiralama',
    seoName: 'Kırıcılı Ekskavatör Kiralama',
    summary:
      "Sert zemin, kaya ve beton için kırıcı takılmış ekskavatör; operatörlü kiralama Malatya'da iş ve sahaya göre görüşülür.",
    detail: [
      'Kırıcılı ekskavatör, kol ucuna hidrolik kırıcı takılmış ekskavatördür. Normal kova ile ilerlenemeyen sert zeminleri, kayayı ve betonu kırarak kazıya devam etmeyi sağlar.',
      'Taşlık ve kayalık arsalarda temel kazısı, hat kazısı ve beton kırım işlerinde gerekir. Kırıcı çalışırken titreşim ve gürültü oluşabildiğinden çevredeki yapılara mesafe ve çalışma düzeni işe başlamadan konuşulmalıdır.',
    ],
    uses: [
      'Kaya veya çok sert zeminde yapılacak kazılarda',
      'Beton ve iri parçaların kırılmasında',
      'Yıkım işlerinde beton elemanların parçalanmasında',
      'Standart kova ile ilerlenemeyen zeminlerde',
    ],
    quoteNeeds: ['Zeminin türü (kaya, beton, sert toprak) ve çevredeki yapılara mesafe'],
    relatedServices: [S.kaya, S.yikim, S.hafriyat, S.makine],
    icon: 'rock',
    image: '/images/galeri/kirici-ile-kaya-kirma.jpg',
    onaylandi: false,
  },
  {
    slug: 'hafriyat-kamyonu-kiralama',
    title: 'Hafriyat Kamyonu Kiralama',
    seoName: 'Hafriyat Kamyonu Kiralama',
    summary:
      "Toprak, moloz ve benzeri malzemeyi sahadan taşıyan damperli kamyon; kiralama Malatya'da iş ve sahaya göre görüşülür.",
    detail: [
      'Hafriyat kamyonu, kazıdan çıkan toprağın, enkazın veya dolgu malzemesinin sahadan taşınması için kullanılan damperli kamyondur. Kazı makinesiyle birlikte çalıştığında malzeme sahada birikmeden uzaklaştırılır.',
      "Malatya'da taşıma işinin planı; sahadan boşaltma noktasına mesafeye, sahaya kamyon girişinin kolaylığına ve malzemenin türüne göre yapılır. Hafriyat toprağı ve molozun ilgili belediyenin izin verdiği alanlara götürülmesi gerekir.",
    ],
    uses: [
      'Kazıdan çıkan toprağın sahadan taşınmasında',
      'Yıkım sonrası molozun kaldırılmasında',
      'Dolgu malzemesinin sahaya getirilmesinde',
      'Kazı ile taşımanın birlikte yürütüldüğü işlerde',
    ],
    quoteNeeds: [
      'Taşınacak malzemenin türü ve yaklaşık hacmi',
      'Sahadan boşaltma noktasına yaklaşık mesafe',
    ],
    relatedServices: [S.tasima, S.hafriyat, S.dolgu],
    icon: 'truck',
    image: '/images/galeri/tas-ocagi-ekskavator-kamyon.jpg',
    onaylandi: false,
  },
];

/** Yayında yalnızca onaylılar; showDrafts (dev veya önizleme build'i) iken taslaklar da. */
export const visibleMachines: Machine[] = machines.filter(
  (machine) => machine.onaylandi || showDrafts,
);
