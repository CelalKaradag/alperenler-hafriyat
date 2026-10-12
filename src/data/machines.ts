/**
 * Makine kiralama sayfaları (/makine-kiralama/ ve /makine-kiralama/<slug>/).
 *
 * `onaylandi: false` → yalnızca `showDrafts` (src/data/drafts.ts) true iken görünür ve "TASLAK"
 * rozeti taşır: `npm run dev` veya `PUBLIC_SHOW_DRAFTS=true` ile alınan önizleme build’i.
 * Normal yayın çıktısında sayfa, menü/liste bağlantısı ve sitemap girdisi üretilmez; JSON-LD’ye girmez.
 *
 * Firma onayı (hepsi onaylı): kepçe/JCB, ekskavatör, kırıcılı ekskavatör, hafriyat kamyonu, lowbed ile taşıma.
 * Mini ekskavatör firmada yok: kaldırıldı.
 * FİLO (müşteri onayı, kesin): 7 paletli ekskavatör (22 ton × 3, 30 ton × 2, 35 ton × 2), 2 JCB, 7 kamyon,
 * 2 lowbed tır; firmada hidrolik kırıcı var (adet ve hangi makineye takıldığı BİLİNMİYOR: yazılmaz).
 * Marka/model/yıl, kapasite, güzergâh, fiyat, süre, "en iyi" ifadesi YAZILMAZ.
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
  /** İlgili hizmet slug’ları (services.ts) */
  relatedServices: string[];
  icon: IconName;
  /** Galeri görseli (JPG; aynı adlı .webp varsa <picture> ile önce o) */
  image: string;
  /** Filo tablosu (müşteri onaylı adetler); yalnızca doğrulanmış makineler için */
  fleet?: { title: string; rows: Array<{ label: string; count: number }> };
  onaylandi: boolean;
}

// Hizmet slug’ları (services.ts)
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
      "Kazı ve yükleme işlerini tek makineyle yürüten kazıcı yükleyici (kepçe); operatörlü kiralama Malatya’da iş ve sahaya göre görüşülür.",
    detail: [
      'Kazıcı yükleyici, halk arasında kepçe olarak da bilinir; önünde yükleme kovası, arkasında kazı kolu bulunan bir iş makinesidir. Aynı makine hem kazı yapabilir hem de malzemeyi yükleyip yerinden oynatabildiği için küçük ve orta ölçekli işlerde sık tercih edilir.',
      "Malatya’da arsa hazırlığı, hat kazısı ve dolgu gibi işlerde makinenin sahaya girebilmesi, zeminin türü ve işin hacmi hangi makinenin uygun olacağını belirler; bu yüzden iş önce konuşulur.",
      'Filomuzda 2 adet JCB bulunur.',
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
    onaylandi: true,
  },
  {
    slug: 'ekskavator-kiralama',
    title: 'Ekskavatör Kiralama',
    seoName: 'Ekskavatör Kiralama',
    summary:
      "Derin ve geniş kazılar için 22 ile 35 ton arası paletli ekskavatörler; operatörlü kiralama Malatya’da iş ve sahaya göre görüşülür.",
    detail: [
      'Paletli ekskavatör; uzun kolu ve kovası sayesinde derin ve geniş kazılarda, ağır zeminlerde ve yüksek hacimli işlerde kullanılan temel kazı makinesidir. Kol ucuna kırıcı gibi farklı ataşmanlar takılabildiği için aynı makine farklı işlerde de çalışabilir.',
      "Malatya’da temel kazısı, altyapı hattı, yıkım sonrası hafriyat ve arazi düzleme gibi işlerde ekskavatör sıkça gerekir. Kazı derinliği, zemin ve çıkacak malzemenin miktarı makinenin ve sayısının belirlenmesinde etkilidir.",
      'Filomuzda 22 ile 35 ton arası paletli ekskavatörler bulunur; hangi ton sınıfının uygun olduğu sahaya ve işin kapsamına göre birlikte belirlenir.',
    ],
    fleet: {
      title: 'Ekskavatör filomuz',
      rows: [
        { label: '22 ton paletli ekskavatör', count: 3 },
        { label: '30 ton paletli ekskavatör', count: 2 },
        { label: '35 ton paletli ekskavatör', count: 2 },
      ],
    },
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
    onaylandi: true,
  },
  {
    slug: 'kiricili-ekskavator',
    title: 'Kırıcılı Ekskavatör Kiralama',
    seoName: 'Kırıcılı Ekskavatör Kiralama',
    summary:
      "Sert zemin, kaya ve beton için kırıcı takılmış ekskavatör; operatörlü kiralama Malatya’da iş ve sahaya göre görüşülür.",
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
    onaylandi: true, // firmada hidrolik kırıcı var; adedi ve hangi makineye takıldığı bilinmiyor: YAZILMAZ
  },
  {
    slug: 'hafriyat-kamyonu-kiralama',
    title: 'Hafriyat Kamyonu Kiralama',
    seoName: 'Hafriyat Kamyonu Kiralama',
    summary:
      "Toprak, moloz ve benzeri malzemeyi sahadan taşıyan damperli kamyon; kiralama Malatya’da iş ve sahaya göre görüşülür.",
    detail: [
      'Hafriyat kamyonu, kazıdan çıkan toprağın, enkazın veya dolgu malzemesinin sahadan taşınması için kullanılan damperli kamyondur. Kazı makinesiyle birlikte çalıştığında malzeme sahada birikmeden uzaklaştırılır.',
      "Malatya’da taşıma işinin planı; sahadan boşaltma noktasına mesafeye, sahaya kamyon girişinin kolaylığına ve malzemenin türüne göre yapılır. Hafriyat toprağı ve molozun ilgili belediyenin izin verdiği alanlara götürülmesi gerekir.",
      'Filomuzda 7 adet hafriyat kamyonu bulunur.',
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
    onaylandi: true,
  },
  {
    slug: 'lowbed-ile-is-makinesi-tasima',
    title: 'Lowbed ile İş Makinesi Taşıma',
    seoName: 'Lowbed ile İş Makinesi Taşıma',
    summary:
      "İş makinelerinin tırla (lowbed) bir sahadan diğerine taşınması; Malatya’da iş ve sahaya göre görüşülür.",
    detail: [
      'Paletli iş makineleri yollarda kendi başına uzun mesafe gidemeyeceği için bir sahadan diğerine lowbed adı verilen alçak platformlu tırlarla taşınır. Taşıma, makinenin güvenle yüklenmesini, bağlanmasını ve varış sahasında indirilmesini kapsar.',
      'Taşınacak makinenin türü, sahaya giriş ve yükleme-indirme için uygun bir yer bulunması taşıma planını belirler. Bu yüzden iş önce konuşulur.',
      'Filomuzda 2 adet lowbed tır bulunur.',
    ],
    uses: [
      'Ekskavatör gibi paletli makinelerin başka bir sahaya götürülmesinde',
      'Kazı bittikten sonra makinenin sahadan alınmasında',
      'Makinenin yeni bir iş için ilçeler arasında taşınmasında',
    ],
    quoteNeeds: [
      'Taşınacak makinenin türü',
      'Yükleme ve varış noktaları (ilçe, mahalle)',
      'Yükleme/indirme için uygun bir alan olup olmadığı',
    ],
    relatedServices: [S.tasima, S.makine],
    icon: 'truck',
    image: '/images/galeri/ekskavator-tasima-lowbed.jpg',
    onaylandi: true, // firma onayı: 2 tır LOWBED'dir (kapasite/ton/güzergâh/fiyat YAZILMAZ)
  },
];

/** Yayında yalnızca onaylılar; showDrafts (dev veya önizleme build’i) iken taslaklar da. */
export const visibleMachines: Machine[] = machines.filter(
  (machine) => machine.onaylandi || showDrafts,
);
