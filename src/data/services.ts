/**
 * Hizmet listesi.
 *
 * `onaylandi: true`  → her yerde görünür (menü, ana sayfa, /hizmetler, detay sayfaları).
 * `onaylandi: false` → YALNIZCA `showDrafts` (src/data/drafts.ts) true iken görünür ve "TASLAK" rozeti taşır:
 *                      `npm run dev` veya `PUBLIC_SHOW_DRAFTS=true` ile alınan önizleme build’i.
 *                      Normal yayın çıktısında ne kart ne menü ne de sayfa üretilir; JSON-LD’ye girmez.
 *
 * Firma bir hizmeti doğruladığında yalnızca `onaylandi` değerini `true` yapmak yeterlidir.
 * Metinlerde deneyim, makine sayısı, süre, fiyat veya garanti ifadesi yoktur; eklenmemelidir.
 */

import type { IconName } from '../utils/icons';
import { showDrafts } from './drafts';

export interface Service {
  slug: string;
  title: string;
  /** SEO başlığında kullanılan kısa ad: "<seoName> Malatya | Alperenler Hafriyat" */
  seoName: string;
  /** Kart ve sayfa girişinde görünen kısa açıklama */
  summary: string;
  /** Detay sayfası paragrafları */
  detail: string[];
  /** "Bu hizmet ne zaman gerekir" maddeleri */
  whenNeeded: string[];
  /** "Fiyatı neler belirler" maddeleri (rakamsız). Verilmezse varsayılan liste kullanılır. */
  priceFactors?: string[];
  /** İlgili konular / anahtar kelimeler */
  keywords: string[];
  icon: IconName;
  onaylandi: boolean;
  /** İsteğe bağlı görsel (JPG; aynı adlı .webp varsa <picture> ile önce o). Dosya yoksa gösterilmez. Galeri dosyalarından seçilir. */
  image?: string;
}

/** Fiyatı belirleyen genel etkenler (rakam yok) */
export const defaultPriceFactors: string[] = [
  'Zemin türü (toprak, sert zemin, taşlık veya kayalık)',
  'Hacim / metreküp',
  'Sahaya mesafe ve ulaşım',
  'Kullanılacak makine tipi',
];

export const services: Service[] = [
  {
    slug: 'hafriyat-ve-temel-kazisi',
    title: 'Hafriyat ve Temel Kazısı',
    seoName: 'Temel Kazısı',
    summary:
      "Bina, depo ve benzeri yapılar için temel kazısı ve hafriyat işleri; sert zemin ve taşlık arazide de Malatya’da ihtiyaca göre planlanır.",
    detail: [
      "Temel kazısı, bir yapının oturacağı zeminin projeye uygun ölçü ve seviyede açılmasıdır. Malatya’da arsanın zemini her yerde aynı değildir; yumuşak toprak, sert zemin ve taşlık arazi farklı makine ve yaklaşım gerektirebilir.",
      'Hafriyat işlerinde çıkan toprağın sahada nasıl toplanacağı ve nereye taşınacağı da işin bir parçasıdır. Bu yüzden iş başlamadan önce arsanın durumunu, kazı derinliğini ve çıkacak malzemeyi birlikte konuşmak gerekir.',
    ],
    whenNeeded: [
      'Yeni bir bina, depo veya ev için temel açılacağı zaman',
      'Arsada kazı ve hafriyat gerektiren bir hazırlık yapılacağı zaman',
      'Zemin sert veya taşlık olduğu için standart kazının yeterli olmayacağı düşünüldüğü zaman',
      'Çıkan toprağın sahadan uzaklaştırılması gerektiği zaman',
    ],
    keywords: ['temel kazısı', 'hafriyat işleri', 'sert zemin kazısı', 'taşlık arazi kazısı'],
    icon: 'excavate',
    image: '/images/galeri/santiye-temel-kazisi.jpg',
    onaylandi: true,
  },
  {
    slug: 'bina-yikim-ve-kirim',
    title: 'Bina Yıkım ve Kırım',
    seoName: 'Bina Yıkım ve Kırım',
    summary:
      'Eski veya kullanılmayan yapıların yıkımı, kırım işleri ve ortaya çıkan molozun sahadan uzaklaştırılması.',
    detail: [
      "Yıkım, yapının yerinde bırakılmasının mümkün olmadığı ya da yeni bir yapıya yer açılması gerektiği durumlarda gündeme gelir. Malatya’da yıkım işi çoğu zaman hafriyat ve moloz taşıma ile birlikte planlanır.",
      'Yapının türü, çevresindeki yapılar ve sahaya giriş durumu işin nasıl yürütüleceğini belirler. İş öncesinde yeri görerek konuşmak, planın doğru yapılmasına yardımcı olur. İzin süreçleri belediyeye göre değişir; işe başlamadan önce konuşulur.',
    ],
    whenNeeded: [
      'Eski veya kullanılmayan bir yapının kaldırılması gerektiğinde',
      'Yeni yapı için arsanın boşaltılması gerektiğinde',
      'Yıkım sonrası moloz ve hafriyatın birlikte kaldırılması istendiğinde',
      'Beton veya duvar gibi parçaların kırılması gerektiğinde',
    ],
    keywords: ['bina yıkım ve hafriyat', 'yıkım kırım', 'eski bina yıkımı', 'moloz kaldırma'],
    icon: 'demolish',
    image: '/images/galeri/derin-kazi-hitachi.jpg',
    onaylandi: true,
  },
  {
    slug: 'altyapi-ve-kanalizasyon-kazisi',
    title: 'Altyapı ve Kanalizasyon Kazısı',
    seoName: 'Altyapı ve Kanalizasyon Kazısı',
    summary:
      'Kanalizasyon, su ve benzeri hatlar için kanal ve hat kazısı; kazı sonrası dolgu ve kapama işlerinin planlanması.',
    detail: [
      'Altyapı kazıları genellikle dar ve uzun hatlar halinde yapılır. Hattın derinliği, zemin cinsi ve çevresindeki yapılar kazının nasıl yürütüleceğini etkiler.',
      "Malatya’da bu tür işlerde hattın geçeceği güzergâhı önceden görmek ve kazı ile kapama aşamalarını birlikte düşünmek işin düzenli ilerlemesine yardımcı olur.",
    ],
    whenNeeded: [
      'Yeni bir kanalizasyon veya su hattı döşenecekse',
      'Mevcut bir hatta bakım ya da onarım için kazı gerekiyorsa',
      'Parsel veya yapı için bağlantı hattı açılacaksa',
      'Kazı sonrası dolgu ve kapama gerekiyorsa',
    ],
    keywords: ['kanalizasyon kazısı', 'altyapı kazısı', 'hat kazısı', 'kanal kazısı'],
    icon: 'pipe',
    image: '/images/galeri/sokakta-kanal-kazisi.jpg',
    onaylandi: true,
  },
  {
    slug: 'arazi-duzleme-ve-yol-acma',
    title: 'Arazi Düzleme ve Yol Açma',
    seoName: 'Arazi Düzleme ve Yol Açma',
    summary:
      'Arazinin düzlenmesi (tesviye) ve ulaşım için yol açma işleri; orman ve dağ yolu gibi engebeli sahalar dahil.',
    detail: [
      'Arazi düzleme, eğimli ya da engebeli bir alanın kullanıma uygun seviyeye getirilmesidir. Yol açma ise sahaya araç ve makinenin ulaşabilmesi için güzergâh oluşturmayı kapsar.',
      "Malatya’da arazi yapısı bölgeden bölgeye değişir; bu yüzden eğim, zemin ve erişim durumu işe başlamadan önce birlikte değerlendirilir.",
    ],
    whenNeeded: [
      'İnşaat, tarım veya depolama için arazinin düzlenmesi gerektiğinde',
      'Sahaya araç girişi için yol açılması gerektiğinde',
      'Orman veya dağlık alanda ulaşım yolu ihtiyacı olduğunda',
      'Eğimli arazide seviye farkının giderilmesi istendiğinde',
    ],
    keywords: ['tesviye', 'arazi düzleme', 'orman yolu açma', 'dağ yolu açma'],
    icon: 'road',
    image: '/images/galeri/arazide-yol-acma.jpg',
    onaylandi: true,
  },
  {
    slug: 'kaya-kirma-ve-kirici-isleri',
    title: 'Kaya Kırma ve Kırıcı İşleri',
    seoName: 'Kaya Kırma ve Kırıcı İşleri',
    summary: 'Sert zemin ve kayalık alanlarda hidrolik kırıcı ile kaya kırma işleri.',
    detail: [
      'Kazı sırasında kaya veya çok sert zemine rastlandığında standart kova ile ilerlemek mümkün olmayabilir. Bu durumda hidrolik kırıcı ile zemin kırılarak kazı sürdürülür.',
      "Taşlık ve kayalık arsalarda Malatya’da da bu ihtiyaçla karşılaşılabilir. Çevredeki yapılara mesafe ve çalışma düzeni, iş başlamadan önce konuşulmalıdır.",
    ],
    whenNeeded: [
      'Kazı sırasında kaya veya çok sert zemin çıktığında',
      'Temel veya hat kazısı kayalık bir alanda yapılacaksa',
      'Beton veya iri parçaların kırılması gerektiğinde',
      'Standart kova ile ilerlenemeyen zeminlerde',
    ],
    keywords: ['kaya kırma', 'hidrolik kırıcı', 'sert zemin kırma', 'kırıcı işleri'],
    icon: 'rock',
    image: '/images/galeri/kirici-ile-kaya-kirma.jpg',
    onaylandi: true,
  },
  {
    slug: 'operatorlu-is-makinesi-kiralama',
    title: 'Operatörlü İş Makinesi Kiralama',
    seoName: 'Operatörlü İş Makinesi Kiralama',
    summary:
      "Operatörlü ekskavatör ve kazıcı yükleyici kiralama; saatlik veya günlük çalışma Malatya’da görüşülür.",
    detail: [
      'Bazı işler için makine satın almak yerine ihtiyaç süresince operatörlü makine kiralamak daha uygun olabilir. Ekskavatör derin ve geniş kazı ile yükleme için, kazıcı yükleyici ise kazı ve yüklemenin birlikte yapıldığı sahalar için tercih edilir.',
      "Kiralama saatlik veya günlük olarak konuşulur. Malatya’daki sahanın büyüklüğüne, zemine ve işin niteliğine göre hangi makinenin uygun olduğu birlikte belirlenir.",
    ],
    whenNeeded: [
      'Kısa süreli ya da tek seferlik bir kazı veya yükleme işi olduğunda',
      'Hangi makinenin işe uygun olduğunun birlikte netleştirilmesi gerektiğinde',
      'Sahada kazı ve yükleme işinin birlikte yapılması gerektiğinde',
      'Makine ihtiyacı yalnızca belirli saatler ya da günler için olduğunda',
    ],
    priceFactors: [
      'Makine tipi (ekskavatör, kazıcı yükleyici)',
      'Çalışma süresi (saatlik veya günlük)',
      'Zemin türü ve işin niteliği',
      'Sahaya mesafe ve ulaşım',
    ],
    keywords: [
      'ekskavatör kiralama',
      'kazıcı yükleyici kiralama',
      'saatlik makine kiralama',
      'günlük makine kiralama',
    ],
    icon: 'machine',
    image: '/images/galeri/tas-ocagi-ekskavator-kamyon.jpg',
    onaylandi: true,
  },
  {
    slug: 'hafriyat-kamyonu-ve-moloz-tasima',
    title: 'Hafriyat Kamyonu ve Moloz Taşıma',
    seoName: 'Hafriyat Kamyonu ve Moloz Taşıma',
    summary: 'Kazıdan çıkan toprak, moloz ve benzeri malzemenin kamyonla sahadan taşınması.',
    detail: [
      'Kazı ve yıkım işlerinde çıkan malzemenin sahada birikmemesi için taşıma işi kazıyla birlikte planlanır. Toprak, moloz veya karışık malzeme için taşıma düzeni farklı olabilir.',
      "Malatya’da taşıma işinde, sahadan boşaltma noktasına olan mesafe ve sahaya kamyon girişinin kolaylığı planı etkiler.",
    ],
    whenNeeded: [
      'Kazıdan çıkan toprağın sahadan uzaklaştırılması gerektiğinde',
      'Yıkım sonrası moloz taşınacağında',
      'Sahada malzeme biriktiği için çalışma alanı daraldığında',
      'Kazı ile taşımanın birlikte yürütülmesi istendiğinde',
    ],
    priceFactors: [
      'Taşınacak malzemenin türü (toprak, moloz, karışık)',
      'Hacim / metreküp',
      'Sahadan boşaltma noktasına mesafe',
      'Sahaya kamyon girişi ve kullanılacak araç tipi',
    ],
    keywords: ['hafriyat kamyonu', 'moloz taşıma', 'hafriyat taşıma', 'toprak taşıma'],
    icon: 'truck',
    image: '/images/galeri/ekskavator-tasima-lowbed.jpg',
    onaylandi: true,
  },
  {
    slug: 'dolgu-toprak-temini-ve-saha-temizligi',
    title: 'Dolgu Toprağı Temini ve Saha Temizliği',
    seoName: 'Dolgu Toprağı ve Saha Temizliği',
    summary:
      'Dolgu için uygun toprak temini ve inşaat veya arsa sahalarında temizlik, tesviye öncesi hazırlık işleri.',
    detail: [
      'Dolgu toprağı; temel çevresini, çukurları veya alçak alanları doldurmak ve sahayı seviyelemek için kullanılır. Hangi malzemenin uygun olduğu dolgunun amacına göre değişir.',
      "Saha temizliği ise inşaat öncesi veya sonrası alanda biriken malzemenin, bitki örtüsünün ve atıkların kaldırılmasıdır. Malatya’da arsa ve şantiye temizliği çoğu zaman dolgu ve taşıma ile birlikte planlanır.",
    ],
    whenNeeded: [
      'Temel çevresi veya alçak alan doldurulacağında',
      'Arsa ya da şantiyede biriken malzemenin kaldırılması gerektiğinde',
      'Tesviye öncesi sahanın hazırlanması istendiğinde',
      'Dolgu malzemesinin sahaya getirilmesi gerektiğinde',
    ],
    keywords: ['dolgu toprağı', 'dolgu malzemesi', 'saha temizliği', 'arsa temizliği'],
    icon: 'soil',
    image: '/images/galeri/istinat-duvari-ve-ekskavator.jpg',
    onaylandi: true,
  },
];

/** Yayında yalnızca onaylılar; showDrafts (dev veya önizleme build’i) iken taslaklar da. */
export const visibleServices: Service[] = services.filter(
  (service) => service.onaylandi || showDrafts,
);
