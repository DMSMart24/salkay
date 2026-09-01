import { PrismaClient, type Prisma } from "@prisma/client";
import { slugify } from "../src/lib/admin/normalize";
import { sanitizeQualificationWrite } from "../src/lib/admin/qualification";

type SeedLead = {
  companyName: string;
  category: string;
  district: string;
  city: string;
  address?: string;
  website?: string | null;
  websiteStatus: Prisma.CompanyCreateInput["websiteStatus"];
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  websiteScore?: number | null;
  leadScore: number;
  scoreDesign?: number | null;
  scoreMobile?: number | null;
  scoreUx?: number | null;
  scoreConversion?: number | null;
  scoreTechnical?: number | null;
  scoreSeo?: number | null;
  opportunities: string[];
  websiteIssues?: string[];
  recommendedServices?: string[];
  salesPitch: string;
  notes: string;
  researchSource: string;
};

const leads: SeedLead[] = [
  {
    companyName: "Forchetta Kadıköy",
    category: "Italian",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Osmanağa, Kıvanç Sk. No:6/B, 34714 Kadıköy/İstanbul",
    websiteStatus: "NO_WEBSITE",
    phone: "+905353125953",
    instagram: "https://www.instagram.com/forchettaplus/",
    leadScore: 9.2,
    opportunities: ["WEBSITE_NEW", "RESERVATION_FLOW", "LOCAL_SEO"],
    recommendedServices: ["Restoran açılış sayfası", "Rezervasyon entegrasyonu", "Yerel SEO"],
    salesPitch:
      "Kadıköy'de güçlü bir İtalyan masa deneyimi var; bağımsız bir web ve rezervasyon yüzü henüz yok. Markayı Google dışında da görünür kılacak premium bir restoran sitesi öncelikli.",
    notes: "Research candidate verified via public directories. Claimed domain forchettaplus.com was unreachable (503); treated as NO_WEBSITE, no website score.",
    researchSource: "https://placera.com.tr/glutensiz-restorani/662693218834536975/",
  },
  {
    companyName: "Cafe de Kadıköy",
    category: "Cafe Restaurant",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Osmanağa, Piri Çavuş Sk. No:22, 34714 Kadıköy/İstanbul",
    websiteStatus: "NO_WEBSITE",
    phone: "+905339665369",
    instagram: "https://www.instagram.com/cafedekadikoy/",
    leadScore: 8.8,
    opportunities: ["WEBSITE_NEW", "DIGITAL_MENU", "LOCAL_SEO"],
    recommendedServices: ["Restoran açılış sayfası", "Mobil kullanıcı deneyimi", "Yerel SEO"],
    salesPitch:
      "Bahariye çevresinde bilinen bir kafe; dijital varlık Facebook/Instagram ile sınırlı. Bağımsız menü ve rezervasyon yüzü net bir fırsat.",
    notes: "Official independent website not found. Public Facebook/Instagram only.",
    researchSource: "https://placera.com.tr/buyuk-kafe/538074655137028467/",
  },
  {
    companyName: "BİNA Kadıköy",
    category: "Restaurant + Event Location",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Caferağa, Kadife Sk. No:26, 34710 Kadıköy/İstanbul",
    websiteStatus: "NO_WEBSITE",
    phone: "+902163308466",
    instagram: "https://www.instagram.com/bina.moda/",
    leadScore: 9.0,
    opportunities: ["WEBSITE_NEW", "BRAND_REFRESH", "RESERVATION_FLOW"],
    recommendedServices: ["Premium web yeniden tasarım", "Rezervasyon entegrasyonu", "Sosyal medya entegrasyonu"],
    salesPitch:
      "Moda'da katmanlı bir bar/restoran/galeri deneyimi var; resmi yüz Instagram. Etkinlik ve rezervasyon için bağımsız bir web deneyimi güçlü bir satış açısı.",
    notes: "Social-only official presence. Directory listings confirm Kadife Sokak address and landline.",
    researchSource: "https://www.happycow.net/reviews/bina-istanbul-166265",
  },
  {
    companyName: "Kuzu Kadıköy",
    category: "Restaurant",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Caferağa, Dumlupınar Sk. No:1/B, 34710 Kadıköy/İstanbul",
    websiteStatus: "NO_WEBSITE",
    phone: "+905347367133",
    instagram: "https://instagram.com/kuzukadikoy",
    leadScore: 8.4,
    opportunities: ["WEBSITE_NEW", "LOCAL_SEO", "DIGITAL_MENU"],
    recommendedServices: ["Restoran açılış sayfası", "Yerel SEO"],
    salesPitch:
      "Mahalle ölçeğinde güçlü bir lezzet adresi; dijitalde yalnızca Instagram görünüyor. Kısa, net bir web yüzü rezervasyon ve menü için yeterli olur.",
    notes: "No official website; Instagram listed as web presence on directories.",
    researchSource: "https://placera.com.tr/corba-restorani/18145429855946267269/",
  },
  {
    companyName: "Maltepe Garden Cafe Restaurant",
    category: "Cafe Restaurant",
    district: "Maltepe",
    city: "İstanbul",
    address: "Cevizli, Tansel Cd. No:11, 34846 Maltepe/İstanbul",
    websiteStatus: "NO_WEBSITE",
    phone: "+902164571900",
    leadScore: 8.6,
    opportunities: ["WEBSITE_NEW", "RESERVATION_FLOW", "LOCAL_SEO"],
    recommendedServices: ["Restoran açılış sayfası", "Rezervasyon entegrasyonu", "Yerel SEO"],
    salesPitch:
      "Bahçe/etkinlik tipi bir Maltepe adresi; bağımsız site yok. Rezervasyon ve etkinlik talebi için sade bir web deneyimi öncelikli.",
    notes: "Multiple directories list the same address and landline. No official website.",
    researchSource: "https://placera.com.tr/arabaya-servis-bari/11159412587484169865/",
  },
  {
    companyName: "Tuzda Balık Restaurant",
    category: "Balık Restaurant",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Kozyatağı, Değirmen Sk. Şaşmaz Sitesi B Blok No:7/B, 34742 Kadıköy/İstanbul",
    websiteStatus: "NO_WEBSITE",
    phone: "+902163722102",
    instagram: "https://www.instagram.com/tuzdabaliktr/",
    leadScore: 8.7,
    opportunities: ["WEBSITE_NEW", "RESERVATION_FLOW", "LOCAL_SEO"],
    recommendedServices: ["Restoran açılış sayfası", "Rezervasyon entegrasyonu", "Yerel SEO"],
    salesPitch:
      "Kozyatağı'nda bilinen bir tuzda balık adresi; resmi site yok. Rezervasyon ve menü için bağımsız bir dijital yüz net fırsat.",
    notes: "No official website. Public landline and Instagram confirmed via directories.",
    researchSource: "https://harbiyiyorum.com/directory/tuzda-balik-kozyatagi/",
  },
  {
    companyName: "Ataşehir Mey",
    category: "Restaurant",
    district: "Ataşehir",
    city: "İstanbul",
    address: "Küçükbakkalköy, Vedat Günyol Cd. No:34/A, 34758 Ataşehir/İstanbul",
    websiteStatus: "NO_WEBSITE",
    phone: "+902165742642",
    leadScore: 8.5,
    opportunities: ["WEBSITE_NEW", "RESERVATION_FLOW", "LOCAL_SEO"],
    recommendedServices: ["Restoran açılış sayfası", "Rezervasyon entegrasyonu", "Yerel SEO"],
    salesPitch:
      "Ataşehir meyhane/restoran konumunda güçlü bir masa deneyimi var; atasehirmey.com erişilemiyor. Yeni, rezervasyon odaklı bir site önerilir.",
    notes: "Listed domain atasehirmey.com not usable. Public phones confirmed on directories.",
    researchSource: "https://haritane.com/atasehir-mey-detay4978040/",
  },
  {
    companyName: "Hanedan Ocakbaşı",
    category: "Ocakbaşı",
    district: "Maltepe",
    city: "İstanbul",
    address: "Bağlarbaşı, Beşevler Sk. No:33/A, 34844 Maltepe/İstanbul",
    websiteStatus: "NO_WEBSITE",
    phone: "+905321340038",
    leadScore: 8.3,
    opportunities: ["WEBSITE_NEW", "LOCAL_SEO", "RESERVATION_FLOW"],
    recommendedServices: ["Restoran açılış sayfası", "Yerel SEO"],
    salesPitch:
      "Maltepe ocakbaşı adresi; bağımsız site yok. Kısa bir marka + rezervasyon sayfası yerel aramada fark yaratır.",
    notes: "Verified Maltepe listing. Not treated as Kadıköy. No official website.",
    researchSource: "https://yandex.com/maps/org/hanedan_ocakbasi_restaurant/1158981889/",
  },
  {
    companyName: "Ikaria Balık Restaurant",
    category: "Balık Restaurant",
    district: "Maltepe",
    city: "İstanbul",
    address: "İdealtepe, Turgut Özal Bulvarı No:125, Maltepe/İstanbul",
    website: "https://ikariabalik.com.tr/",
    websiteStatus: "NOT_VERIFIED",
    phone: "+905532064746",
    leadScore: 8.3,
    opportunities: ["WEBSITE_REDESIGN", "RESERVATION_FLOW", "LOCAL_SEO"],
    recommendedServices: ["Web yeniden tasarım", "Rezervasyon entegrasyonu"],
    salesPitch:
      "Maltepe sahil/etkinlik balık restoranı; resmi domain var ancak inceleme anında site yanıt vermedi. Skor verilmedi. Reachable olduktan sonra tam audit.",
    notes: "Official domain listed and confirmed in search, but live fetch returned 500. No website score.",
    researchSource: "https://ikariabalik.com.tr/",
  },
  {
    companyName: "Mojo Ataşehir",
    category: "Cafe Restaurant",
    district: "Ataşehir",
    city: "İstanbul",
    address: "Küçükbakkalköy, Nar Tanesi Sk. No:9 İç Kapı No:1, 34750 Ataşehir/İstanbul",
    website: "https://www.mojolounge.com.tr/",
    websiteStatus: "NOT_VERIFIED",
    phone: "+902164699936",
    leadScore: 8.1,
    opportunities: ["WEBSITE_REDESIGN", "RESERVATION_FLOW", "BRAND_REFRESH"],
    recommendedServices: ["Web yeniden tasarım", "Rezervasyon entegrasyonu"],
    salesPitch:
      "Ataşehir'de yüksek kapasiteli cafe-brasserie. Domain mevcut, inceleme anında site açılamadı; skor yok. Açıldığında rezervasyon ve marka sunumu mercek altına alınmalı.",
    notes: "Official domain mojolounge.com.tr confirmed in listings; live fetch failed. Email not taken from third-party pages.",
    researchSource: "https://www.mojolounge.com.tr/",
  },
  {
    companyName: "Adile Sultan Ev Yemekleri",
    category: "Restaurant",
    district: "Ümraniye",
    city: "İstanbul",
    address: "Çok şubeli marka — Anadolu Yakası (Ümraniye ve diğer şubeler notlarda)",
    website: "https://adilesultanevyemekleri.com/",
    websiteStatus: "IMPROVABLE",
    phone: "+902169124220",
    email: "info@adilesultanevyemekleri.com",
    websiteScore: 4.7,
    leadScore: 7.8,
    scoreDesign: 1.1,
    scoreMobile: 0.8,
    scoreUx: 0.8,
    scoreConversion: 0.9,
    scoreTechnical: 0.5,
    scoreSeo: 0.6,
    opportunities: ["WEBSITE_REDESIGN", "MOBILE_UX", "ECOMMERCE_ORDERING"],
    websiteIssues: [
      "Ana sayfa hikâye, blog ve franchising bloklarıyla açılıyor; şube bulma ve sipariş ilk bakışta geri planda kalıyor.",
      "Markanın ev yemeği vaadi hero alanında net bir rezervasyon veya sipariş aksiyonuna bağlanmıyor.",
      "Çok şubeli yapı için konum seçimi ana kullanıcı akışının parçası değil, ayrı bir iletişim/şube katmanında duruyor.",
      "İçerik yoğunluğu, ilk ziyarette menü ve günlük yemek seçimini gizleyebiliyor.",
    ],
    recommendedServices: ["Web yeniden tasarım", "Mobil kullanıcı deneyimi", "E-ticaret entegrasyonu"],
    salesPitch:
      "Güçlü bir zincir hikâyesi var; site içerik ve franchise ağırlıklı. Sipariş ve şube bulmayı öne çıkaran sadeleştirme, restoran lead'inden çok platform iyileştirmesi.",
    notes:
      "ONE company for the brand. Locations: 70+ branches across İstanbul/Kocaeli/Tekirdağ. Anadolu Yakası examples include Ümraniye (Atakent Mah. Gelibolu Cd. No:5/A, 0216 912 42 20). Do not create per-branch companies.",
    researchSource: "https://adilesultanevyemekleri.com/",
  },
  {
    companyName: "Sembol Künefe",
    category: "Dessert/Künefe",
    district: "Ataşehir",
    city: "İstanbul",
    address: "Atatürk Mahallesi, Dudullu Cd. No:49/1, 34490 Ataşehir/İstanbul",
    website: "https://sembolkunefe.com/",
    websiteStatus: "WEAK",
    phone: "+908502596363",
    email: "info@sembolkunefe.com",
    instagram: "https://www.instagram.com/sembolocakbasi/",
    websiteScore: 3.6,
    leadScore: 8.2,
    scoreDesign: 0.8,
    scoreMobile: 0.6,
    scoreUx: 0.8,
    scoreConversion: 0.5,
    scoreTechnical: 0.4,
    scoreSeo: 0.5,
    opportunities: ["WEBSITE_REDESIGN", "MOBILE_UX", "DIGITAL_MENU"],
    websiteIssues: [
      "Ana sayfa klasik PHP şablon ve ürün katalog dilinde; künefe/ocakbaşı markasının mekân deneyimi yeterince yansımıyor.",
      "Rezervasyon veya WhatsApp aksiyonu ilk ekranda yok; iletişim ayrı .php sayfasında kalıyor.",
      "Menü deneyimi QR/ayrı sayfaya kopuk; ana akış ürün başlıklarından ibaret.",
      "Şube ve iletişim bilgisi footer'a sıkışmış, Google'dan gelen ziyaretçi için yol net değil.",
    ],
    recommendedServices: ["Premium web yeniden tasarım", "Mobil kullanıcı deneyimi", "Yerel SEO"],
    salesPitch:
      "Ataşehir'de işlek bir künefe/ocakbaşı markası; site eski katalog yapısında. Premium mekân sunumu + rezervasyon bu skoru hızla taşır.",
    notes: "Official contact email published on sembolkunefe.com/iletisim.php. One company.",
    researchSource: "https://sembolkunefe.com/",
  },
  {
    companyName: "Barbun Balık Restaurant",
    category: "Balık Restaurant",
    district: "Maltepe",
    city: "İstanbul",
    address: "İdealtepe Mh. Turgut Özal Bulvarı Cumhuriyet Cd. No:77, Maltepe/İstanbul",
    website: "https://www.barbunrestaurant.net/",
    websiteStatus: "WEAK",
    phone: "+902164172200",
    email: "info@barbunrestaurant.net",
    websiteScore: 3.2,
    leadScore: 8.6,
    scoreDesign: 0.6,
    scoreMobile: 0.5,
    scoreUx: 0.7,
    scoreConversion: 0.6,
    scoreTechnical: 0.4,
    scoreSeo: 0.4,
    opportunities: ["WEBSITE_REDESIGN", "MOBILE_UX", "RESERVATION_FLOW"],
    websiteIssues: [
      "Site eski ASP.NET şablonunda; sahil balıkçı kimliği görsel olarak zayıf kalıyor.",
      "Menü düz metin listesi olarak dökülmüş, hiyerarşi ve görsel sunum yok.",
      "Rezervasyon var ama iletişim sayfasındaki telefon dizilimi okunaksız; güven vermiyor.",
      "Mobilde uzun metin + menü yığını, ilk 10 saniyede masa ayırtmayı öne çıkarmıyor.",
    ],
    recommendedServices: ["Premium web yeniden tasarım", "Mobil kullanıcı deneyimi", "Rezervasyon entegrasyonu"],
    salesPitch:
      "Maltepe sahilinde köklü bir rakı-balık adresi; dijital yüz 2010'lar şablonunda. Rezervasyon ve menü modernize edilirse lead değeri yüksek.",
    notes: "Official email published on barbunrestaurant.net/Home/Iletisim. Phone 0216 417 22 00 from consistent listings.",
    researchSource: "https://www.barbunrestaurant.net/Home/Index",
  },
  {
    companyName: "Köz Kanat",
    category: "Restaurant",
    district: "Kartal",
    city: "İstanbul",
    address: "Kordonboyu Mah. Turgut Özal Bulvarı No:55, Atalar, Kartal/İstanbul",
    website: "https://kozkanat.com/",
    websiteStatus: "WEAK",
    phone: "+902164883084",
    email: "info@kozkanat.com",
    websiteScore: 3.6,
    leadScore: 8.4,
    scoreDesign: 0.7,
    scoreMobile: 0.6,
    scoreUx: 0.8,
    scoreConversion: 0.7,
    scoreTechnical: 0.4,
    scoreSeo: 0.4,
    opportunities: ["WEBSITE_REDESIGN", "MOBILE_UX", "RESERVATION_FLOW"],
    websiteIssues: [
      "Şube sayfası tekrarlayan pazarlama metniyle açılıyor; Kartal manzara ve masa deneyimi görsel olarak zayıf.",
      "Rezervasyon formu var ancak yazım hataları ve telefon tekrarı güveni düşürüyor.",
      "Çok şubeli marka için konum seçimi header'da dağınık; Kartal sayfası bağımsız bir restoran yüzü gibi durmuyor.",
      "WhatsApp veya tek net rezervasyon aksiyonu ilk ekranda yeterince öne çıkmıyor.",
    ],
    recommendedServices: ["Web yeniden tasarım", "Rezervasyon entegrasyonu", "Mobil kullanıcı deneyimi"],
    salesPitch:
      "Kartal sahilinde yüksek kapasiteli kanat/restoran; site eski ve metin ağırlıklı. Şube sayfalarını premium restoran yüzüne çekmek doğru açı.",
    notes:
      "ONE company. Other published locations: Ataşehir 0216 577 75 44, Çekmeköy 0850 304 8 444. Kartal is the researched Anadolu Yakası focus.",
    researchSource: "https://kozkanat.com/kartal",
  },
  {
    companyName: "Salve Cafe Kadıköy",
    category: "Cafe Restaurant",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Osmanağa, Piri Çavuş Sk. No:4, 34714 Kadıköy/İstanbul",
    website: "https://www.salvecafe.com/",
    websiteStatus: "WEAK",
    phone: "+905399253108",
    websiteScore: 2.5,
    leadScore: 8.9,
    scoreDesign: 0.5,
    scoreMobile: 0.7,
    scoreUx: 0.4,
    scoreConversion: 0.3,
    scoreTechnical: 0.4,
    scoreSeo: 0.2,
    opportunities: ["WEBSITE_REDESIGN", "RESERVATION_FLOW", "BRAND_REFRESH"],
    websiteIssues: [
      "salvecafe.com bir dijital menü listesi; Kadıköy mekânının marka ve atmosfer sunumu yok.",
      "Adres, rezervasyon ve WhatsApp ana akışta görünmüyor.",
      "Menü fiyat listesi kullanıcıyı mekâna veya masaya yönlendirmiyor.",
      "Google'dan gelen ziyaretçi için konum ve iletişim ilk ekranda yok.",
    ],
    recommendedServices: ["Premium web yeniden tasarım", "Rezervasyon entegrasyonu", "Restoran hikâyesi ve içerik"],
    salesPitch:
      "Kadıköy'de yüksek puanlı bir kafe; site yalnızca menü. Marka + rezervasyon + konum içeren kısa bir restoran yüzü ideal SALKAY işi.",
    notes: "Official menu site observed. No public email on the site. Phone from public directories.",
    researchSource: "https://www.salvecafe.com/",
  },
  {
    companyName: "Ekol Künefe",
    category: "Dessert/Künefe",
    district: "Kadıköy",
    city: "İstanbul",
    address: "Hasanpaşa / Kadıköy şubesi odaklı — diğer Anadolu şubeleri notlarda",
    website: "https://www.ekolkunefe.com/",
    websiteStatus: "WEAK",
    phone: "+902163302313",
    email: "info@ekolkunefe.com",
    websiteScore: 2.9,
    leadScore: 8.0,
    scoreDesign: 0.6,
    scoreMobile: 0.5,
    scoreUx: 0.6,
    scoreConversion: 0.5,
    scoreTechnical: 0.3,
    scoreSeo: 0.4,
    opportunities: ["WEBSITE_REDESIGN", "MOBILE_UX", "LOCAL_SEO"],
    websiteIssues: [
      "Klasik ASP sitesi; Hatay künefe markasının görsel kimliği güncel bir restoran yüzüne taşınmamış.",
      "Ana metin hâlâ üç şube diyor, listede beş şube var; güven ve güncellik zayıf.",
      "Paket/telefon bilgisi metin içinde kayboluyor, rezervasyon veya sipariş aksiyonu yok.",
      "Şube sayfaları ayrı bir deneyim sunmuyor; Kadıköy/Üsküdar ziyaretçisi için yerel giriş yok.",
    ],
    recommendedServices: ["Web yeniden tasarım", "Yerel SEO", "Mobil kullanıcı deneyimi"],
    salesPitch:
      "Anadolu Yakası'nda çok şubeli künefe markası; site 2000'ler ASP. Tek marka, modern şube + sipariş yüzü.",
    notes:
      "ONE company. Anadolu locations: Üsküdar Bağlarbaşı 0216 651 72 73, Kadıköy Hasanpaşa 0216 330 23 13, Ümraniye Tepeüstü 0216 611 15 65, Ataşehir Örnek 0216 341 41 71. Official email on ekolkunefe.com/sube.asp.",
    researchSource: "https://www.ekolkunefe.com/",
  },
  {
    companyName: "Nazar Profiterol",
    category: "Dessert/Künefe",
    district: "Maltepe",
    city: "İstanbul",
    address: "Feyzullah, Bağdat Cad. No:268-270 D:78, 34843 Maltepe/İstanbul",
    website: "https://nazarprofiterol.com/",
    websiteStatus: "GOOD",
    phone: "+902166062289",
    email: "info@nazarprofiterol.com",
    websiteScore: 6.3,
    leadScore: 6.8,
    scoreDesign: 1.4,
    scoreMobile: 1.2,
    scoreUx: 1.3,
    scoreConversion: 1.2,
    scoreTechnical: 0.6,
    scoreSeo: 0.6,
    opportunities: ["MOBILE_UX", "LOCAL_SEO", "DIGITAL_MENU"],
    websiteIssues: [
      "Ana sayfa uygulama ve hediye kartına odaklanıyor; Maltepe/Kadıköy şube deneyimi ilk ekranda yok.",
      "Restoran/pastane ziyareti için rezervasyon değil uygulama indir çağrısı öne çıkıyor.",
      "Şube listesi ayrı sayfada; Google'dan gelen yerel ziyaretçi için en yakın Nazar net değil.",
    ],
    recommendedServices: ["Mobil kullanıcı deneyimi", "Yerel SEO"],
    salesPitch:
      "Marka sitesi daha olgun; yine de şube odaklı yerel giriş ve masa/gel-al akışı güçlendirilebilir. Lead önceliği orta.",
    notes:
      "ONE company. Other Anadolu locations: Ziverbey/Kadıköy, Suadiye, Kavacık, Şerifali/Ümraniye. Official email on nazarprofiterol.com/sayfa/iletisim.",
    researchSource: "https://nazarprofiterol.com/",
  },
];

const skippedUnverified = [
  "Rolik Istanbul Kadıköy — resmi Rolik Sushi şube listesinde Kadıköy yok (İstanbul'da yalnızca Beylikdüzü)",
  "Aheste Et & Balık Restoranı — Kadıköy adayı Aheste Pera ile karışıyor; Ataşehir kaydı ayrı ve site doğrulanamadı",
  "Maksime Cafe — yeterli resmi kaynak yok",
  "Maltepe Bisko Restaurant & Ocakbaşı — yeterli resmi kaynak yok",
  "Güzel Ocakbaşı — yeterli resmi kaynak yok",
  "Anılar Ocakbaşı — yeterli resmi kaynak yok",
  "Ada Ocakbaşı — yeterli resmi kaynak yok",
  "Yako Ocakbaşı — yeterli resmi kaynak yok",
  "Şirin Ocakbaşı — yeterli resmi kaynak yok",
  "Loşşş Cafe Maltepe — yeterli resmi kaynak yok",
  "DÖNERCİDYZ — yeterli resmi kaynak yok",
  "Kuzgun Baba Lokantası — yeterli resmi kaynak yok",
  "Alır Cafe & Restaurant — yeterli resmi kaynak yok",
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const prisma = new PrismaClient();
  const created: SeedLead[] = [];
  const duplicates: string[] = [];

  try {
    const groupName = "Restoranlar";
    const slug = slugify(groupName);
    const group =
      (await prisma.leadGroup.findFirst({
        where: { OR: [{ slug }, { name: { equals: groupName, mode: "insensitive" } }] },
      })) ??
      (await prisma.leadGroup.create({
        data: { name: groupName, slug, industry: "Restaurant", country: "Türkiye" },
      }));

    for (const lead of leads) {
      const qualification = sanitizeQualificationWrite(lead);
      const existing = await prisma.company.findFirst({
        where: {
          OR: [
            { companyName: { equals: lead.companyName, mode: "insensitive" } },
            ...(lead.phone ? [{ phone: { equals: lead.phone, mode: "insensitive" as const } }] : []),
            ...(lead.website
              ? [{ domain: lead.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "") }]
              : []),
          ],
        },
        select: { id: true, companyName: true },
      });
      if (existing) {
        duplicates.push(`${lead.companyName} → ${existing.companyName}`);
        continue;
      }

      await prisma.company.create({
        data: {
          companyName: lead.companyName,
          website: lead.website ?? null,
          domain: lead.website
            ? lead.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
            : null,
          industry: "Restaurant",
          city: lead.city,
          district: lead.district,
          country: "Türkiye",
          address: lead.address,
          phone: lead.phone ?? null,
          generalEmail: lead.email ?? null,
          instagram: lead.instagram ?? null,
          source: "restaurant-research-2026-09",
          notes: lead.notes,
          status: "RESEARCHED",
          outreachStatus: "NEW",
          websiteScore: qualification.websiteScore,
          websiteStatus: qualification.websiteStatus,
          websiteIssues: lead.websiteIssues ?? [],
          recommendedServices: lead.recommendedServices ?? [],
          leadScore: qualification.leadScore,
          scoreDesign: qualification.scoreDesign,
          scoreMobile: qualification.scoreMobile,
          scoreUx: qualification.scoreUx,
          scoreConversion: qualification.scoreConversion,
          scoreTechnical: qualification.scoreTechnical,
          scoreSeo: qualification.scoreSeo,
          opportunities: qualification.opportunities,
          salesPitch: lead.salesPitch,
          researchSource: lead.researchSource,
          researchedAt: new Date("2026-09-01T12:00:00.000Z"),
          groupId: group.id,
          priority:
            lead.leadScore >= 8 ? "HIGH" : lead.leadScore >= 7 ? "MEDIUM" : "LOW",
          tags: ["restaurant", "anadolu-yakasi", lead.category.toLowerCase().replace(/\s+/g, "-")],
        },
      });
      created.push(lead);
    }

    console.log(
      JSON.stringify(
        {
          created: created.length,
          duplicates: duplicates.length,
          unverified: skippedUnverified.length,
          createdNames: created.map((row) => row.companyName),
          duplicateNames: duplicates,
          skippedUnverified,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Seed failed");
  process.exit(1);
});
