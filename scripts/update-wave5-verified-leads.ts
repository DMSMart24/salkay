import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  attachRestaurantLeadDuplicates,
  buildRestaurantLeadUpdatePatch,
  parseRestaurantLeadRow,
  summarizeRestaurantLeadPreview,
} from "../src/lib/admin/restaurant-leads-import";
import { getPrisma } from "../src/lib/admin/prisma";
import { listRestaurantLeads } from "../src/lib/admin/restaurant-leads";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

const CHECKED = "2026-09-02";

function noWebsite(input: {
  restaurantName: string;
  district: string;
  websiteAnalysis: string;
  salkayPitch: string;
  source: string;
  phone?: string;
  instagram?: string;
  whatsapp?: string;
}): Record<string, unknown> {
  return {
    restaurantName: input.restaurantName,
    district: input.district,
    websiteStatus: "NO_WEBSITE",
    websiteScore: null,
    leadScore: 8.4,
    priority: "HIGH",
    problem1:
      "Bağımsız marka websitesi yok; dijital görünürlük dizin, sosyal medya veya üçüncü taraf sayfalarla sınırlı.",
    websiteAnalysis: input.websiteAnalysis,
    opportunities: "WEBSITE_NEW, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: input.salkayPitch,
    source: input.source,
    dateChecked: CHECKED,
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.instagram ? { instagram: input.instagram } : {}),
    ...(input.whatsapp ? { whatsapp: input.whatsapp } : {}),
  };
}

const RESEARCHED_ROWS: Record<string, unknown>[] = [
  {
    restaurantName: "Ethem Efendi Kahvaltı Ataşehir Watergarden",
    district: "Ataşehir",
    website: "https://ethemefendikahvalti.com/subeler/atasehir/",
    websiteDomain: "ethemefendikahvalti.com",
    websiteStatus: "GOOD",
    websiteScore: 6.9,
    leadScore: 5.0,
    priority: "QUALIFIED_OUT",
    instagram: "https://www.instagram.com/ethemefendikahvalti/",
    problem1: "Şube menü butonu üçüncü taraf https://ethemefendi.qrgood.tr/qr4/; sitede okunabilir menü sayfası yok.",
    problem2: "Nav’da rezervasyon yok; Ataşehir sayfasında rezervasyon formu da yok.",
    problem3: "Public business e-posta sitede yok.",
    websiteAnalysis:
      "ethemefendikahvalti.com/subeler/atasehir/ 2026-09-02 tarayıcıda açıldı. Watergarden / Barbaros Begonya Sk. ve +90 533 455 52 82 DB telefonuyla eşleşti. Anasayfa, değerler, lezzetler, nerede, fotoğraflar var. Instagram ethemefendikahvalti resmi sitede. Menü qrgood.tr. Public e-posta yok.",
    opportunities: "DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Zincir kahvaltı sitesi çalışıyor; Ataşehir Watergarden listeleniyor. Satış listesi dışı.",
    source: "https://ethemefendikahvalti.com/subeler/atasehir/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Hacıbaşar - Kebap Katmer Ataşehir",
    district: "Ataşehir",
    website: "https://hacibasar.com/sube/atasehir/",
    websiteDomain: "hacibasar.com",
    websiteStatus: "GOOD",
    websiteScore: 7.0,
    leadScore: 5.0,
    priority: "QUALIFIED_OUT",
    publicEmail: "hacibasar@hacibasar.com",
    instagram: "https://www.instagram.com/hacibasar/",
    problem1: "Ataşehir menü QR https://qr.hacibasar.com/qr1/; sitede şubeye özel okunabilir menü sayfası yok.",
    problem2: "Şube sayfasında rezervasyon yok; iletişim 0850 888 1955 genel hat.",
    websiteAnalysis:
      "hacibasar.com/sube/atasehir/ 2026-09-02 açıldı. Vedat Günyol Cad. No 24 Yolbulan Plaza ve şube telefonu +90 216 575 19 55 sitede. DB GSM 532 216 16 89 silinmedi. hacibasar@hacibasar.com footer’da. Instagram hacibasar resmi sitede. Hakkımızda, şubeler, franchise, QR menü ve uygulama var.",
    opportunities: "DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Franchise zincir sitesi Ataşehir’i listeliyor. Kapsam dışı.",
    source: "https://hacibasar.com/sube/atasehir/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Mor Meyhane",
    district: "Ataşehir",
    website: "https://mormeyhane.com/",
    websiteDomain: "mormeyhane.com",
    websiteStatus: "GOOD",
    websiteScore: 6.6,
    leadScore: 5.2,
    priority: "QUALIFIED_OUT",
    whatsapp: "+90 553 169 92 73",
    instagram: "https://www.instagram.com/mormeyhaneatasehir/",
    problem1: "Dijital menü allzinapp.com/mormeyhane/menu; sitede yemek listesi yok.",
    problem2: "İletişimde sokak adresi yok; yalnızca “Ataşehir, İstanbul”.",
    problem3: "Public business e-posta sitede yok; rezervasyon WhatsApp formu.",
    websiteAnalysis:
      "mormeyhane.com 2026-09-02 tarayıcıda açıldı. Ataşehir meyhane içeriği ve 0553 169 92 73 DB telefonuyla eşleşti. Home, hakkımızda, galeri, yorumlar, menü, etkinlik, rezervasyon, iletişim var. Instagram mormeyhaneatasehir ve WhatsApp resmi sitede. Public e-posta yok.",
    opportunities: "DIGITAL_MENU, LOCAL_SEO",
    salkayPitch: "Ataşehir meyhanesinin kendi sitesi çalışıyor. Satış listesi dışı.",
    source: "https://mormeyhane.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Adana Park Ocakbaşı Bekir Usta",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: adanaparkocakbasi.com DNS yok. parkadana.com Ataşehir/Çekmeköy Park Adana zinciri; Koşuyolu Bekir Usta kaydına yazılmadı. Dizinlerde bağımsız site yok.",
    salkayPitch: "Koşuyolu ocakbaşı; kendi sitesi yok. Yeni kebap sitesi + rezervasyon.",
    source: "https://www.novacircle.com/spots/europe/turkiye/istanbul-province/istanbul-province/istanbul/adana-park-ocakbas-bekir-usta-de6f3c",
  }),
  {
    restaurantName: "Hasan Usta Kebap",
    district: "Kadıköy",
    website: "https://hasanustakebap.com/",
    websiteDomain: "hasanustakebap.com",
    websiteStatus: "GOOD",
    websiteScore: 7.3,
    leadScore: 4.9,
    priority: "QUALIFIED_OUT",
    publicEmail: "info@hasanustakebap.com",
    instagram: "https://www.instagram.com/hasanustakebap/",
    problem1: "Nav’da Menü yok; yemekler ana sayfa kartları ve hasanusta.myrezzta.com sipariş.",
    websiteAnalysis:
      "hasanustakebap.com 2026-09-02 tarayıcıda açıldı. Koşuyolu Mah. Dr. Eyüp Aksoy Cad. No:29 ve 0216 418 01 01 DB telefonuyla eşleşti. Hakkımızda, galeri, kariyer, iletişim, rezervasyon formu, uygulama ve online sipariş var. info@hasanustakebap.com ve Instagram hasanustakebap resmi sitede.",
    opportunities: "DIGITAL_MENU",
    salkayPitch: "Koşuyolu şubesi zincir sitede; rezervasyon ve e-posta çalışıyor. Kapsam dışı.",
    source: "https://hasanustakebap.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Misina Balık Restaurant",
    district: "Kadıköy",
    website: "https://www.misina.com.tr/",
    websiteDomain: "misina.com.tr",
    websiteStatus: "GOOD",
    websiteScore: 7.1,
    leadScore: 5.0,
    priority: "QUALIFIED_OUT",
    publicEmail: "info@misina.com.tr",
    phone: "+90 216 350 80 90",
    whatsapp: "+90 532 700 40 66",
    instagram: "https://www.instagram.com/misinabalik/",
    problem1: "Sayfa başlığı “Beylerbeyi, Göztepe”; iletişim Caddebostan Hulusi Behçet Cd. No:10.",
    websiteAnalysis:
      "misina.com.tr 2026-09-02 açıldı. Caddebostan Mah. Prof. Dr. Hulusi Behçet Cd. No:10 ve 0216 350 80 90 DB telefonuyla eşleşti. Menü kategorileri, galeri, blog, iletişim, online rezervasyon var. info@misina.com.tr, WhatsApp 905327004066 ve Instagram misinabalik resmi sitede.",
    opportunities: "LOCAL_SEO",
    salkayPitch: "Caddebostan balık sitesi menü ve rezervasyonla çalışıyor. Kapsam dışı.",
    source: "https://www.misina.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Strada",
    district: "Kadıköy",
    website: "https://stradasuadiye.com/",
    websiteDomain: "stradasuadiye.com",
    websiteStatus: "WEAK",
    websiteScore: 3.8,
    leadScore: 8.3,
    priority: "HIGH",
    publicEmail: "strada@cafecadde.com.tr",
    instagram: "https://www.instagram.com/strada.suadiye/",
    problem1: "Ana sayfada iki adet “Add Content Here” yer tutucu metin duruyor.",
    problem2: "“Make a Reservation” / https://stradasuadiye.com/rezervasyon/ 404: Page not found.",
    problem3: "QR Menu sayfası yemek listesi değil; guest.rezervem.com.tr/strada rezervasyon iframe’i.",
    websiteAnalysis:
      "stradasuadiye.com 2026-09-02 tarayıcıda /en/stradahome/ açıldı. Suadiye Bağdat Cd. No:459 ve 0216 464 1000 DB telefonuyla eşleşti. strada@cafecadde.com.tr mailto’da (boşluklu href). Instagram strada.suadiye resmi sitede. /contact 404. QR menü sayfasında yemek yok.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Suadiye Strada; rezervasyon 404, menü boş, yer tutucu metin. Tam restoran sitesi.",
    source: "https://stradasuadiye.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Almarin BALIK",
    district: "Kartal",
    instagram: "https://www.instagram.com/almarinbalik/",
    websiteAnalysis:
      "2026-09-02: almarinbalik.com DNS yok. Yandex Kartal İnönü Cad. 151D kaydında website yok; Instagram @almarinbalik listeli. Bağımsız site bulunamadı.",
    salkayPitch: "Kartal sahil balık; kendi sitesi yok. Yeni site + rezervasyon.",
    source: "https://yandex.com.tr/maps/org/almarin_balik/245067633035/",
  }),
  noWebsite({
    restaurantName: "GRİDA BALIK SEAFOOD",
    district: "Kartal",
    websiteAnalysis:
      "2026-09-02: gridabalik.com ve gridabalik.com.tr DNS yok. Arama KKTC Girne Grida’ya düşüyor; Kartal kaydına yazılmadı. Kartal için bağımsız site bulunamadı.",
    salkayPitch: "Kartal balık; kendi sitesi yok. Yeni seafood sitesi.",
    source: "https://www.google.com/maps/search/?api=1&query=GRİDA+BALIK+SEAFOOD+Kartal+Istanbul",
  }),
  {
    restaurantName: "Mahall Cafe & Restaurant",
    district: "Kartal",
    website: "https://www.mahallcafe.com.tr/",
    websiteDomain: "mahallcafe.com.tr",
    websiteStatus: "IMPROVABLE",
    websiteScore: 5.2,
    leadScore: 7.8,
    priority: "HIGH",
    instagram: "https://www.instagram.com/mahallcaferestaurant/",
    problem1: "Menümüz nav https://www.mahallcafe.com.tr/#sec3; sayfada #sec3 elementi yok, yemek listesi yok.",
    problem2: "Public business e-posta sitede yok.",
    problem3: "Rezervasyon formunda Mahall Bahçe seçeneği var; şubeler listesinde Bahçe kartı yok.",
    websiteAnalysis:
      "mahallcafe.com.tr 2026-09-02 açıldı. Soğanlık Yeni Mah. Atatürk Cd. No:121 ve (0216) 309 0126 DB telefonuyla eşleşti. Hakkımızda, galeri, rezervasyon formu, şubeler var. Instagram mahallcaferestaurant resmi sitede. Public e-posta yok. Copyright 2019.",
    opportunities: "DIGITAL_MENU, WEBSITE_REDESIGN, LOCAL_SEO",
    salkayPitch: "Kartal Mahall; rezervasyon var, menü hedefi boş. Dijital menü + şube netliği.",
    source: "https://www.mahallcafe.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Mavi Sandal Balıkçısı",
    district: "Kartal",
    website: "https://www.mavisandalbalikcisi.com/",
    websiteDomain: "mavisandalbalikcisi.com",
    websiteStatus: "WEAK",
    websiteScore: 3.2,
    leadScore: 8.5,
    priority: "HIGH",
    problem1: "https://www.mavisandalbalikcisi.com/menu başlığı “Menü”; yemek kalemi yok, ardından bülten formu.",
    problem2: "Rezervasyon sayfası/formu yok.",
    problem3: "Public e-posta ve Instagram sitede yok.",
    websiteAnalysis:
      "mavisandalbalikcisi.com 2026-09-02 tarayıcıda açıldı (Wix). Atalar Sahil Kordonboyu Turgut Özal Blv. No:37 ve 0538 699 21 38 DB telefonuyla eşleşti. Hakkımızda metni ve iki Kartal adresi var. Menü sayfası boş. Public e-posta yok.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Kartal alkolsüz balık; Wix iskelet, menü boş. Tam restoran sitesi.",
    source: "https://www.mavisandalbalikcisi.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Mehir Et Kebap",
    district: "Kartal",
    websiteAnalysis:
      "2026-09-02: Yandex mehiretkebap.com listeliyor. http://mehiretkebap.com tarayıcıda Natro “WEB SİTEMİZ YAPIM AŞAMASINDA” park sayfası; restoran içeriği yok, URL yazılmadı. Bağımsız restoran sitesi yok.",
    salkayPitch: "Kartal etçi; domain park, site yok. Yeni kebap sitesi.",
    source: "https://yandex.com.tr/maps/org/mehir_et_kebap/98608208976/",
  }),
  {
    restaurantName: "İntiba Döner",
    district: "Kartal",
    website: "https://www.intiba.com.tr/",
    websiteDomain: "intiba.com.tr",
    websiteStatus: "GOOD",
    websiteScore: 6.8,
    leadScore: 5.0,
    priority: "QUALIFIED_OUT",
    publicEmail: "info@intiba.com.tr",
    instagram: "https://www.instagram.com/intibadoner/",
    problem1: "https://www.intiba.com.tr/iletisim 404; iletişim ana sayfa formu ve şube listesi.",
    websiteAnalysis:
      "intiba.com.tr 2026-09-02 açıldı. Kartal Kordonboyu Mah. Ankara Cad. No:2 listede. Sipariş hattı 0850 644 57 75 DB telefonuyla eşleşti. Menü, restoranlar, iletişim formu var. info@intiba.com.tr ve Instagram intibadoner resmi sitede.",
    opportunities: "LOCAL_SEO",
    salkayPitch: "Döner zinciri sitesi Kartal’ı listeliyor. Kapsam dışı.",
    source: "https://www.intiba.com.tr/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Saki Meyhane Kartal",
    district: "Kartal",
    websiteAnalysis:
      "2026-09-02: sakimeyhanekartal.com DNS yok. sakimeyhane.com HTTP 500. sakialacati.com Alaçatı otel/meyhane; Kadıköy Saki ayrı işletme. Kartal kaydına yazılmadı. Kartal için bağımsız site bulunamadı.",
    salkayPitch: "Kartal meyhane; kendi sitesi yok. Yeni meyhane vitrini.",
    source: "https://www.google.com/maps/search/?api=1&query=Saki+Meyhane+Kartal+Kartal+Istanbul",
  }),
  noWebsite({
    restaurantName: "Antepli Mustafa Usta",
    district: "Maltepe",
    websiteAnalysis:
      "2026-09-02: anteplimustafausta.com DNS yok. Yandex Cevizli Talat Paşa Cad. 90 kaydında website yok. Bağımsız site bulunamadı.",
    salkayPitch: "Cevizli Antep ustası; site yok. Yeni kebap/katmer vitrini.",
    source: "https://yandex.com.tr/maps/org/antepli_mustafa_usta/184278942835/",
  }),
  noWebsite({
    restaurantName: "Big Lou Burger",
    district: "Maltepe",
    websiteAnalysis:
      "2026-09-02: biglouburger.com açıldı, yalnızca “Coming Soon”; restoran içeriği yok, URL yazılmadı. biglourburger.com DNS yok. OGGUSTO/GZT Maltepe burger olarak dizin/haber; bağımsız çalışan site yok.",
    salkayPitch: "Maltepe burger; coming soon domain, çalışan site yok. Yeni burger sitesi.",
    source: "https://www.oggusto.com/gastronomi/istanbul/anadolu-yakasinin-en-iyi-mekanlari",
  }),
  {
    restaurantName: "Pusula Mezze Balık",
    district: "Maltepe",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-02: Yandex www.pusulabalik.com listeliyor. pusulabalik.com ve pusulamezzebalik.com DNS NXDOMAIN; HTTP açılamadı. Domain-işletme ilişkisi dizin kaynaklı; site doğrulanamadı. NO_WEBSITE verilmedi.",
    source: "https://yandex.com.tr/maps/org/pusula_mezze_balik/228713788905/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Favoretti Burger Steakhouse",
    district: "Pendik",
    websiteAnalysis:
      "2026-09-02: favorettiburger.com DNS yok. favoretti.com 500 ve Brezilya restoranı; Pendik kaydına yazılmadı. Yandex Yenişehir Cumhuriyet Blv. 12/A kaydında website yok. Bağımsız site bulunamadı.",
    salkayPitch: "Pendik burger/steak; kendi sitesi yok. Yeni steakhouse sitesi.",
    source: "https://yandex.com.tr/maps/org/favoretti_burger_steakhouse/30135758985/",
  }),
  {
    restaurantName: "Elbet Steakhouse",
    district: "Üsküdar",
    website: "https://www.elbetsteakhouse.com.tr/",
    websiteDomain: "elbetsteakhouse.com.tr",
    websiteStatus: "GOOD",
    websiteScore: 7.4,
    leadScore: 4.8,
    priority: "QUALIFIED_OUT",
    instagram: "https://www.instagram.com/elbetsteakhouse",
    problem1: "Public e-posta yalnızca kariyer@elbetsteakhouse.com.tr / career@; misafir iletişim e-postası yok.",
    websiteAnalysis:
      "elbetsteakhouse.com.tr 2026-09-02 tarayıcıda açıldı. Akasya AVM Acıbadem Üsküdar ve +90 216 514 55 35 DB telefonuyla eşleşti. Menü (başlangıç–steak–burger), galeri, hakkımızda, kariyer, online rezervasyon var. Instagram elbetsteakhouse resmi sitede. kariyer@ iş başvurusu; publicEmail yazılmadı.",
    opportunities: "LOCAL_SEO",
    salkayPitch: "Akasya Elbet zincir sitesinde; menü ve rezervasyon çalışıyor. Kapsam dışı.",
    source: "https://www.elbetsteakhouse.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Mahide Ocakbaşı Beylerbeyi",
    district: "Üsküdar",
    website: "https://mahideocakbasi.com/",
    websiteDomain: "mahideocakbasi.com",
    websiteStatus: "WEAK",
    websiteScore: 3.6,
    leadScore: 8.4,
    priority: "HIGH",
    whatsapp: "+90 532 449 98 53",
    instagram: "https://www.instagram.com/mahidebeylerbeyi/",
    problem1: "Ana sayfada “Hoşgeldiniz / Mahide Ocakbaşı” H1 bloğu beş kez tekrar ediyor.",
    problem2: "Nav’da Menü yok; yemekler SEO kartları (kuzu şiş, levrek vb.), ayrı menü sayfası yok.",
    problem3: "Rezervasyon butonları wa.me/+905324499853; sitede rezervasyon formu yok. Public e-posta yok.",
    websiteAnalysis:
      "mahideocakbasi.com 2026-09-02 açıldı. Beylerbeyi İskele Cad. metni ve 0532 449 98 53 DB telefonuyla eşleşti. Hakkımızda, özel gün, iletişim ve Instagram mahidebeylerbeyi resmi sitede. Ana sayfa anahtar kelime tekrarlı. Public e-posta yok.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Beylerbeyi ocakbaşı; SEO şablon, menü/rezervasyon yok. Boğaz restoran sitesi.",
    source: "https://mahideocakbasi.com/",
    dateChecked: CHECKED,
  },
];

const TARGET_KEYS = RESEARCHED_ROWS.map((row) => ({
  restaurantName: String(row.restaurantName),
  district: String(row.district),
}));

async function main() {
  const apply = process.argv.includes("--confirm");
  const parsed = RESEARCHED_ROWS.map((row, index) => parseRestaurantLeadRow(row, index + 2));
  const preview = await attachRestaurantLeadDuplicates(parsed, "update");
  const stats = summarizeRestaurantLeadPreview(preview, "update");

  const details = preview.map((row) => {
    const patch = row.existing ? buildRestaurantLeadUpdatePatch(row.existing, row) : {};
    return {
      restaurantName: row.restaurantName,
      district: row.district,
      action: row.importAction,
      matchedId: row.existing?.id ?? null,
      websiteStatus: row.websiteStatus,
      websiteScore: row.websiteScore,
      leadScore: row.leadScore,
      priority: row.priority,
      errors: row.errors,
      changedFields: Object.keys(patch),
    };
  });

  const noWebsiteRows = details.filter((row) => row.websiteStatus === "NO_WEBSITE");
  const notVerifiedRows = details.filter((row) => row.websiteStatus === "NOT_VERIFIED");
  const qualifiedOut = details.filter((row) => row.priority === "QUALIFIED_OUT");
  const scoredRows = details.filter(
    (row) => row.websiteStatus !== "NO_WEBSITE" && row.websiteStatus !== "NOT_VERIFIED",
  );
  const goodRows = details.filter(
    (row) => row.websiteStatus === "GOOD" || row.websiteStatus === "VERY_GOOD",
  );

  console.log(
    JSON.stringify(
      {
        mode: apply ? "CONFIRM_UPDATE" : "PREVIEW",
        matched: preview.filter((row) => Boolean(row.existing)).length,
        newLeads: stats.newLeads,
        updates: stats.updates,
        unchanged: stats.unchanged,
        invalid: stats.invalid,
        scored: scoredRows.length,
        noWebsite: noWebsiteRows.length,
        notVerified: notVerifiedRows.length,
        goodOrVeryGood: goodRows.length,
        qualifiedOut: qualifiedOut.length,
        noWebsiteNames: noWebsiteRows.map((row) => `${row.restaurantName} — ${row.district}`),
        notVerifiedNames: notVerifiedRows.map((row) => `${row.restaurantName} — ${row.district}`),
        scoredNames: scoredRows.map(
          (row) =>
            `${row.restaurantName} — ${row.district} (${row.websiteStatus} / ${row.websiteScore} / ${row.priority})`,
        ),
        qualifiedOutNames: qualifiedOut.map((row) => `${row.restaurantName} — ${row.district}`),
        unmatched: details.filter((row) => !row.matchedId).map((row) => `${row.restaurantName} — ${row.district}`),
        details,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("\nConfirm için: npx tsx scripts/update-wave5-verified-leads.ts --confirm");
    return;
  }

  if (stats.newLeads > 0) {
    throw new Error("Update modunda yeni kayıt oluşturulmamalı.");
  }
  if (stats.invalid > 0) {
    throw new Error("Invalid satır var; confirm iptal.");
  }

  const prisma = getPrisma();
  let updated = 0;
  for (const row of preview) {
    if (row.importAction !== "update" || !row.existing) continue;
    const existing = await prisma.restaurantLead.findUnique({ where: { id: row.existing.id } });
    if (!existing) continue;
    const data = buildRestaurantLeadUpdatePatch(existing, row);
    if (Object.keys(data).length === 0) continue;
    await prisma.restaurantLead.update({ where: { id: existing.id }, data });
    updated += 1;
  }

  const after = await prisma.restaurantLead.findMany({
    where: {
      OR: TARGET_KEYS.map((key) => ({
        restaurantName: key.restaurantName,
        district: key.district,
      })),
    },
    orderBy: [{ leadScore: { sort: "desc" } }, { restaurantName: "asc" }],
  });
  const [total, notVerified, high] = await Promise.all([
    prisma.restaurantLead.count(),
    prisma.restaurantLead.count({ where: { websiteStatus: "NOT_VERIFIED" } }),
    prisma.restaurantLead.count({ where: { priority: "HIGH" } }),
  ]);
  const top20 = await listRestaurantLeads({ view: "top-20" });

  console.log(
    JSON.stringify(
      {
        updated,
        after: after.map((row) => ({
          restaurantName: row.restaurantName,
          district: row.district,
          websiteStatus: row.websiteStatus,
          websiteScore: row.websiteScore,
          leadScore: row.leadScore,
          priority: row.priority,
          publicEmail: row.publicEmail,
          website: row.website,
        })),
        wave5NoWebsite: after.filter((row) => row.websiteStatus === "NO_WEBSITE").length,
        wave5NotVerified: after.filter((row) => row.websiteStatus === "NOT_VERIFIED").length,
        remaining: { total, notVerified, high, researched: total - notVerified },
        emails: after
          .filter((row) => row.publicEmail)
          .map((row) => `${row.restaurantName}: ${row.publicEmail}`),
        top20: top20.rows.map((row, index) => ({
          rank: index + 1,
          restaurantName: row.restaurantName,
          district: row.district,
          websiteStatus: row.websiteStatus,
          websiteScore: row.websiteScore,
          leadScore: row.leadScore,
          priority: row.priority,
          publicEmail: row.publicEmail,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
