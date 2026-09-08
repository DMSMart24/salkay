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
  };
}

const RESEARCHED_ROWS: Record<string, unknown>[] = [
  {
    restaurantName: "Günaydın Kasap & Steakhouse Suadiye",
    district: "Kadıköy",
    website: "https://gunaydinet.com/kasap-steakhouse/",
    websiteStatus: "GOOD",
    websiteScore: 6.8,
    leadScore: 5.1,
    priority: "QUALIFIED_OUT",
    publicEmail: "info@gunaydinet.com",
    problem1: "Şube REZERVASYON linki https://gunaydinet.com/rezervasyon/ adresinde 404: This page could not be found.",
    problem2: "Kurumsal e-posta genel merkez (Maslak D-Ofis); şubeye özel public e-posta yok.",
    websiteAnalysis:
      "gunaydinet.com 2026-09-02 tarayıcıda açıldı. Kasap & Steakhouse sayfasında SUADİYE ve 216 519 99 15 doğrulandı. Menü, restoranlar, hakkımızda ve kurumsal sayfalar var. info@gunaydinet.com footer’da. Rezervasyon URL 404.",
    opportunities: "RESERVATION_FLOW, LOCAL_SEO",
    salkayPitch:
      "Ulusal zincir sitesi çalışıyor; satış listesi dışı. Rezervasyon 404 ikinci dalga/kapsam dışı.",
    source: "https://gunaydinet.com/kasap-steakhouse/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Kırmızı Et Steak Burger Sosis",
    district: "Kadıköy",
    website: "https://www.kirmizimet.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.6,
    leadScore: 8.3,
    priority: "HIGH",
    publicEmail: "info@kirmizimet.com",
    problem1: "Site başlığı Hll Gurme; restoran menü/rezervasyon yok, nav Ürünler ve Bayilik.",
    problem2: "Dil bayrakları href=#; çalışmayan boş dil bağlantıları.",
    problem3: "Footer “Bilgi Kurumsal Web Tasarım”; iletişim yolu /iletisim/m/3.",
    websiteAnalysis:
      "kirmizimet.com 2026-09-02 açıldı. Osmanağa Yağlıkçı İsmail Sk. No:11 ve 0216 336 59 08 iletişimde DB telefonuyla eşleşti. info@kirmizimet.com sitede. Copyright 2020 Kırmızım Et.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Kadıköy etçi; domain restoran değil gurme/bayilik şablonu. Restoran sitesi net iş.",
    source: "https://www.kirmizimet.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Bop Breakfast Of Pan",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: bopbreakfast.com / bopkadikoy.com / bopbreakfastofpan.com DNS yok. Dizinlerde bağımsız site yok; Sluurpy Facebook sayfasını website olarak gösteriyor, kayda yazılmadı.",
    salkayPitch: "Yeldeğirmeni brunch; kendi sitesi yok. Brunch marka sitesi.",
    source: "https://www.sluurpy.com/en/istanbul/restaurant/6739873/bop-breakfast-of-pan",
  }),
  noWebsite({
    restaurantName: "Çıkmaz Meyhane",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: Meyhankoli sitede website alanı boş. cikmazmeyhane.com ve .com.tr DNS yok. Bağımsız site bulunamadı.",
    salkayPitch: "Mimar Çıkmazı meyhane; kendi sitesi yok. Yeni meyhane vitrini.",
    source: "https://www.meyhankoli.com/restoran/cikmaz-meyhane-7631",
  }),
  noWebsite({
    restaurantName: "Nisan Balık Restaurant",
    district: "Kadıköy",
    websiteAnalysis:
      "2026-09-02: YNY/Meyhankoli sitede website yok. nisanbalik.com ve nisanbalikrestaurant.com DNS yok. Bağımsız site bulunamadı.",
    salkayPitch: "Yasa Cad. balıkçı; site yok. Yeni site + rezervasyon.",
    source: "https://foodos.yemekneredeyenir.com/restoran/nisan-balik-restaurant-istanbul",
  }),
  {
    restaurantName: "Günaydın Kebap & Steakhouse Kalamış",
    district: "Kadıköy",
    website: "https://gunaydinet.com/kebap-steakhouse/",
    websiteStatus: "GOOD",
    websiteScore: 6.8,
    leadScore: 5.1,
    priority: "QUALIFIED_OUT",
    publicEmail: "info@gunaydinet.com",
    problem1: "Şube REZERVASYON linki https://gunaydinet.com/rezervasyon/ adresinde 404: This page could not be found.",
    problem2: "Kurumsal e-posta genel merkez; Kalamış şubesine özel public e-posta yok.",
    websiteAnalysis:
      "gunaydinet.com/kebap-steakhouse/ 2026-09-02 tarayıcıda açıldı. KALAMIŞ kartı ve 216 348 23 36 DB telefonuyla eşleşti. Menü ve şube listesi var. Rezervasyon URL 404.",
    opportunities: "RESERVATION_FLOW, LOCAL_SEO",
    salkayPitch: "Aynı zincir sitesi; Kalamış listeleniyor. Kapsam dışı.",
    source: "https://gunaydinet.com/kebap-steakhouse/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Pişi Mutfak Moda – Kahvaltı & Brunch",
    district: "Kadıköy",
    website: "https://pisimutfak.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.4,
    leadScore: 8.5,
    priority: "HIGH",
    publicEmail: "pisimoda@gmail.com",
    instagram: "https://www.instagram.com/pisimutfakmoda/",
    problem1: "Menü linki üçüncü taraf menu-online.co/pisimutfak/undefined/welcome; sitede okunabilir menü yok.",
    problem2: "Footer GoDaddy website builder; telefon sitede yok.",
    problem3: "Adres Caferağa Ağabey Sokak; kapı numarası sitede yok.",
    websiteAnalysis:
      "pisimutfak.com 2026-09-02 tarayıcıda açıldı. Moda kahvaltı metni ve Caferağa Ağabey Sk. doğrulandı. pisimoda@gmail.com iletişimde. Instagram pisimutfakmoda resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Moda kahvaltı; GoDaddy tek sayfa + dış menü. Tam brunch sitesi.",
    source: "https://pisimutfak.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Sıralı Kebap Ataşehir",
    district: "Ataşehir / Ümraniye sınırı",
    website: "https://www.siralikebap.com/",
    websiteStatus: "IMPROVABLE",
    websiteScore: 5.7,
    leadScore: 7.1,
    priority: "MEDIUM",
    instagram: "https://www.instagram.com/siralikebapatasehir",
    problem1: "Public e-posta yok; iletişim yalnızca şube telefonları.",
    problem2: "Rezervasyon nav #reservation/#contact hash; hero overlay tıklamayı kesiyor.",
    problem3: "Ana metinde “ö zelliklerini”, “ş ey”, “yolculuğ una” boşluklu yazımlar.",
    websiteAnalysis:
      "siralikebap.com 2026-09-02 açıldı. İstanbul Finans Merkezi / Finanskent Cad. No:8 ve 0535 825 34 34 sitede. Instagram siralikebapatasehir resmi sitede. Public e-posta yok.",
    opportunities: "RESERVATION_FLOW, DIGITAL_MENU, BRAND_REFRESH",
    salkayPitch: "IFM şubesi zincir sitede; rezervasyon ve e-posta zayıf. MEDIUM.",
    source: "https://www.siralikebap.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Foça Balık Restaurant",
    district: "Ataşehir",
    websiteAnalysis:
      "2026-09-02: focabalik.com Maltepe/Küçükyalı (Turgut Özal Blv. No:93) restoranı; Ataşehir kaydına yazılmadı. focarestaurant.com Ataşehir dizininde geçiyor, tarayıcıda restoran sitesi doğrulanamadı. Ataşehir için bağımsız site bulunamadı.",
    salkayPitch: "Küçükbakkalköy balık; kendi sitesi yok. Yeni site.",
    source: "https://www.tikla.com.tr/foca-balik-restaurant-atasehir.html",
  }),
  noWebsite({
    restaurantName: "Kebapçı Ataşehir",
    district: "Ataşehir",
    websiteAnalysis:
      "2026-09-02: Yandex Işıklar Cad. 37H kaydında website yok. kebapciatasehir.com açılınca yalnızca Redirecting... siyah sayfa; restoran içeriği yok, kayda yazılmadı. atasehirkebap.com.tr başka adres (Fevzipaşa), yazılmadı.",
    salkayPitch: "Küçükbakkalköy kebapçı; bağımsız site yok.",
    source: "https://yandex.com.tr/maps/org/kebapci_atasehir/8741765405/",
  }),
  {
    restaurantName: "The Muhtar",
    district: "Ataşehir",
    website: "https://www.themuhtar.com.tr/",
    websiteStatus: "IMPROVABLE",
    websiteScore: 4.4,
    leadScore: 8.1,
    priority: "HIGH",
    publicEmail: "rezervasyon@themuhtar.com.tr",
    instagram: "https://www.instagram.com/themuhtarofficial",
    problem1: "Menü sayfası yemek listesi değil; program, giyim kuralı ve rezervasyon şartları.",
    problem2: "İletişimde çalışma saati “19:30 am – 00:30 pm” yazımı hatalı.",
    problem3: "Ayrı /rezervasyon/ URL 404; rezervasyon Guestplan widget’a bağlı.",
    websiteAnalysis:
      "themuhtar.com.tr 2026-09-02 açıldı. Barbaros Ihlamur Blv. No:3 D:238 ve 0532 012 17 19 doğrulandı. rezervasyon@themuhtar.com.tr HTML’de. Instagram themuhtarofficial resmi sitede.",
    opportunities: "DIGITAL_MENU, WEBSITE_REDESIGN, RESERVATION_FLOW",
    salkayPitch: "Ataşehir show restoran; menü sitede yok. Dijital menü + net rezervasyon.",
    source: "https://www.themuhtar.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Şaşkın Balık Ataşehir",
    district: "Ataşehir",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-02: Dizinlerde saskinbalikatasehir.com geçiyor; HTTPS saskinbalik.com’a 301. saskinbalik.com Noter Çıkmazı Sok. No:8 Kadıköy ve 0538 643 58 60; Ataşehir Evren Cad. / 0216 470 05 35 ile eşleşmedi. Domain-işletme ilişkisi kesin değil; URL yazılmadı. NO_WEBSITE verilmedi.",
    source: "https://www.iletisimadresleri.com/saskin-balik-1055725",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Bridge Nakkaştepe",
    district: "Üsküdar",
    website: "https://www.bridgenakkastepe.com/",
    websiteStatus: "WEAK",
    websiteScore: 3.3,
    leadScore: 8.4,
    priority: "HIGH",
    publicEmail: "satis@bridgerestaurant.com.tr",
    instagram: "https://www.instagram.com/bridgenakkastepe/",
    problem1: "Sayfa başlığı “Ana Sayfa | Bridge Nakka 2”; Wix şablon izi.",
    problem2: "İçerik etkinlik/düğün alanı; restoran menü ve yemek rezervasyon sayfası yok.",
    problem3: "Public e-posta satış adresi satis@; yemek rezervasyon formu yok.",
    websiteAnalysis:
      "bridgenakkastepe.com 2026-09-02 açıldı. Baba Nakkaş Sok. No:56 ve 0216 391 95 85 DB telefonuyla eşleşti. satis@bridgerestaurant.com.tr sitede. Instagram bridgenakkastepe resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Nakkaştepe etkinlik sitesi; restoran yüzü yok. Premium restoran sitesi.",
    source: "https://www.bridgenakkastepe.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Bağevi Kebapçısı",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-02: Blog bagevikebapcisi.com listeliyor. DNS A kaydı yok, www çözülmüyor, HTTP açılamadı. Domain-işletme ilişkisi var gibi; site doğrulanamadı. NO_WEBSITE verilmedi.",
    source: "https://istanbullezzetduraklari.com/2026/02/27/2026da-uskudarda-iftar-icin-en-cok-tercih-edilen-5-mekan/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Seyir Üsküdar Kafe",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-02: seyiruskudar.com DNS yok. seyircafe.com.tr Ankara, seyircafe.net Aliağa; bu kayıt değil, yazılmadı. 0532 179 83 36 ile eşleşen resmi site bulunamadı. İşletme-site ilişkisi doğrulanamadı.",
    source: "https://www.google.com/maps/search/?api=1&query=Seyir+Üsküdar+Kafe+Üsküdar+Istanbul",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "KAF Cafe Restoran",
    district: "Üsküdar",
    website: "https://kafkisikli.com/",
    websiteStatus: "IMPROVABLE",
    websiteScore: 5.5,
    leadScore: 7.2,
    priority: "MEDIUM",
    publicEmail: "info@kafkisikli.com",
    instagram: "https://www.instagram.com/kafcaferestaurant/",
    problem1: "Yorum avatarsı i.pravatar.cc stok görseller; gerçek müşteri fotoğrafı değil.",
    problem2: "Nav’da menü yok; yemek listesi sitede yok.",
    problem3: "Booking sayfasında “Rezervasyon ayarları yükleniyor...” metni duruyor.",
    websiteAnalysis:
      "kafkisikli.com 2026-09-02 açıldı. Burhaniye Nurbaba Sk. No:27 ve info@kafkisikli.com sitede. Instagram kafcaferestaurant resmi sitede. Sitedeki telefon 505 120 86 53; DB 216 401 27 27 silinmedi.",
    opportunities: "DIGITAL_MENU, RESERVATION_FLOW, BRAND_REFRESH",
    salkayPitch: "Kısıklı kafe; rezervasyon iskeleti var, menü yok. MEDIUM.",
    source: "https://kafkisikli.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Butcha Steakhouse",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-02: butcha.com açıldı; nav Ankara, Dubai, Doha, Bakü. Üsküdar/Libadiye şubesi sitede yok. Marka-şube ilişkisi bu URL ile kesinleşmedi; website yazılmadı. NO_WEBSITE verilmedi.",
    source: "http://www.butcha.com/tr/iletisim",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Waymis Tost & Coffee",
    district: "Üsküdar",
    websiteAnalysis:
      "2026-09-02: Placera website alanı boş. waymis.com / waymiscafe.com DNS yok. Yandex’te menu-online.co üçüncü taraf QR menü; bağımsız site değil, yazılmadı.",
    salkayPitch: "Selami Ali kahvaltı; kendi sitesi yok.",
    source: "https://placera.com.tr/gozleme-restorani/15869853345985113718/",
  }),
  {
    restaurantName: "Boğaziçi Balık Restorant",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-02: Eski dizin bogazicibalik.com listeliyor. DNS NXDOMAIN, HTTP açılamadı. Domain listelenmiş ama site doğrulanamadı. NO_WEBSITE verilmedi.",
    source: "https://allrestaurants.eu/ar/mt-aam/almatbakh-albahri/trky/ar-istanbul-tur/bogazici-4",
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
    console.log("\nConfirm için: npx tsx scripts/update-wave4-verified-leads.ts --confirm");
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
        wave4NoWebsite: after.filter((row) => row.websiteStatus === "NO_WEBSITE").length,
        wave4NotVerified: after.filter((row) => row.websiteStatus === "NOT_VERIFIED").length,
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
