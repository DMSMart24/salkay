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

const CHECKED = "2026-09-03";

function noWebsite(input: {
  restaurantName: string;
  district: string;
  websiteAnalysis: string;
  salkayPitch: string;
  source: string;
  leadScore?: number;
  priority?: string;
}): Record<string, unknown> {
  return {
    restaurantName: input.restaurantName,
    district: input.district,
    websiteStatus: "NO_WEBSITE",
    websiteScore: null,
    leadScore: input.leadScore ?? 8.4,
    priority: input.priority ?? "HIGH",
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
  noWebsite({
    restaurantName: "Kartal Kebap Pide Lahmacun Çorba Kahvaltı - Eski Uzunlar",
    district: "Kartal",
    leadScore: 8.4,
    websiteAnalysis:
      "2026-09-03: Kartal Karlıktepe işletmesi dizinlerde doğrulanıyor. uzunlarkebap.com.tr Tuzla/başka Uzunlar zinciri; bu kayda yazılmadı. Bağımsız resmi site bulunamadı.",
    salkayPitch: "Kartal Eski Uzunlar; 900+ yorumlu kebapçı, kendi sitesi yok. Yeni marka sitesi.",
    source: "https://yandex.com.tr/maps/org/kebapci_uzunlar/205553881962/",
  }),
  noWebsite({
    restaurantName: "Kebap 27 Celal Usta",
    district: "Kartal",
    leadScore: 8.5,
    websiteAnalysis:
      "2026-09-03: kebap27.com DNS yok. Dizin/Novacircle Petrolis İnönü Cad.; menü üçüncü taraf/Migros. Bağımsız resmi site bulunamadı.",
    salkayPitch: "Kartal Kebap 27; rezervasyon telefonla. Yeni site + dijital menü.",
    source: "https://www.novacircle.com/spots/europe/turkiye/istanbul-province/kartal/istanbul/kebap-27-2e5ddb/menu",
  }),
  noWebsite({
    restaurantName: "Sedir Ocakbaşı",
    district: "Kartal",
    leadScore: 8.2,
    websiteAnalysis:
      "2026-09-03: sedirocakbasi.com DNS yok. Kartal Yukarı telefon +90 216 306 45 67 dizinlerde. Bağımsız resmi site bulunamadı.",
    salkayPitch: "Kartal Sedir; aktif ocakbaşı, site yok. Yeni ocakbaşı vitrini.",
    source: "https://www.google.com/maps/search/?api=1&query=Sedir+Ocakbaşı+Kartal+Istanbul",
  }),
  noWebsite({
    restaurantName: "Sondurak Ocakbaşı",
    district: "Kartal",
    leadScore: 8.1,
    websiteAnalysis:
      "2026-09-03: Bağımsız restoran domain’i yok. Aktif Kartal Hürriyet işletmesi dizinlerde. Resmi site bulunamadı.",
    salkayPitch: "Sondurak ocakbaşı; site yok. Yeni site + rezervasyon.",
    source: "https://www.google.com/maps/search/?api=1&query=Sondurak+Ocakbaşı+Kartal+Istanbul",
  }),
  noWebsite({
    restaurantName: "Sunset Restaurant",
    district: "Kartal",
    leadScore: 7.5,
    priority: "MEDIUM",
    websiteAnalysis:
      "2026-09-03: Kartal Petroliş işletmesi +90 535 871 20 08 ile doğrulanıyor. Bağımsız resmi site yok; dijital hacim diğer HIGH adaylardan düşük.",
    salkayPitch: "Kartal Sunset; site yok, hacim orta. Yeni site ikinci sıra.",
    source: "https://www.google.com/maps/search/?api=1&query=Sunset+Restaurant+Kartal+Istanbul",
  }),
  noWebsite({
    restaurantName: "Vakt-i Zaman Meyhane Kartal",
    district: "Kartal",
    leadScore: 8.7,
    websiteAnalysis:
      "2026-09-03: vaktizaman.com DNS yok. Facebook vakti.zaman.meyhane üçüncü taraf; bağımsız restoran sitesi yok. nevalihotel/alaçatı karıştırılmadı.",
    salkayPitch: "Kartal sahil meyhane; 200 yorum, site yok. Yeni meyhane vitrini.",
    source: "https://www.facebook.com/vakti.zaman.meyhane/",
  }),
  noWebsite({
    restaurantName: "Çamlık Cafe",
    district: "Kartal",
    leadScore: 8.2,
    websiteAnalysis:
      "2026-09-03: Kartal Yukarı +90 216 473 90 26 dizinlerde. Bağımsız resmi site bulunamadı.",
    salkayPitch: "Kartal Çamlık Cafe; 376 yorum, site yok. Yeni kafe sitesi.",
    source: "https://www.google.com/maps/search/?api=1&query=Çamlık+Cafe+Kartal+Istanbul",
  }),
  noWebsite({
    restaurantName: "Ada Ocakbaşı",
    district: "Maltepe",
    leadScore: 8.4,
    websiteAnalysis:
      "2026-09-03: adaocakbasi.com tarayıcıda Natro “Premium Parking Page”; restoran içeriği yok, URL yazılmadı. adaocakbasi.com.tr DNS yok. Bağımsız restoran sitesi yok.",
    salkayPitch: "Maltepe Ada Ocakbaşı; domain park, site yok. Yeni ocakbaşı sitesi.",
    source: "http://adaocakbasi.com/",
  }),
  noWebsite({
    restaurantName: "Bir Bakan Meyhanesi",
    district: "Maltepe",
    leadScore: 8.6,
    websiteAnalysis:
      "2026-09-03: Maltepe Yalı +90 553 545 46 79 dizinlerde. Bağımsız resmi site bulunamadı.",
    salkayPitch: "Maltepe sahil meyhane; site yok. Yeni meyhane sitesi.",
    source: "https://www.google.com/maps/search/?api=1&query=Bir+Bakan+Meyhanesi+Maltepe+Istanbul",
  }),
  {
    restaurantName: "Holly Hola Cafe & Restaurant İdealtepe Maltepe",
    district: "Maltepe",
    website: "https://hollyhola.com.tr/",
    websiteDomain: "hollyhola.com.tr",
    websiteStatus: "IMPROVABLE",
    websiteScore: 5.6,
    leadScore: 7.4,
    priority: "MEDIUM",
    publicEmail: "info@hollyhola.com.tr",
    instagram: "https://www.instagram.com/hollyholacafe/",
    problem1: "Ana sayfada “Kahve” H1 bloğu üç kez tekrar ediyor.",
    problem2: "İletişimde hem hollyhola.com.tr hem hollyholacoffee.com.tr yazıyor; ikinci domain ayrı site olarak net değil.",
    problem3: "Rezervasyon formunda placeholder “Reservasyon İçin Konu Başlığı” yazımı hatalı.",
    websiteAnalysis:
      "hollyhola.com.tr 2026-09-03 tarayıcıda açıldı (önceki timeout bu oturumda yok). Feyzullah Bağdat Cad. No:226 ve 0 216 759 87 12 DB telefonuyla eşleşti. Menü kategorileri, hakkımızda, SSS, iletişim formu, hızlı rezervasyon var. info@hollyhola.com.tr ve Instagram hollyholacafe resmi sitede.",
    opportunities: "WEBSITE_REDESIGN, BRAND_REFRESH",
    salkayPitch: "İdealtepe Holly Hola; site var ama H1 tekrarı ve çift domain. MEDIUM yenileme.",
    source: "https://hollyhola.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Loss Garden Cafe & Restaurant",
    district: "Maltepe",
    website: "https://lossgarden.com/",
    websiteDomain: "lossgarden.com",
    websiteStatus: "VERY_WEAK",
    websiteScore: 1.3,
    leadScore: 9.4,
    priority: "HIGH",
    problem1: "Canlı ana sayfa başlığı “Ultimate Blogging Championship”; restoran adı yok.",
    problem2: "Tek yazı “Hello world! Welcome to WordPress. This is your first post.” (31 Ağustos 2026).",
    problem3: "Nav Sample Page, Blog, About, FAQs, Authors, Events, Shop, Patterns, Themes; menü/rezervasyon/iletişim yok.",
    websiteAnalysis:
      "lossgarden.com 2026-09-03 tarayıcıda açıldı. Twenty Twenty-Five “Designed with WordPress”. Dizin/arama önbelleği Zümrütevler Atatürk Cad. No:28 ve 0216 442 00 58 ile aynı domain’i restoran sitesi olarak gösteriyor; canlı içerik restoran değil. URL yazıldı çünkü domain-işletme ilişkisi var ve bozuk içerik satış kanıtı.",
    opportunities: "WEBSITE_REDESIGN, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Maltepe Loss Garden; canlı site WordPress demo. Ekran görüntüsüyle net satış.",
    source: "https://lossgarden.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Nevâli Meyhane",
    district: "Maltepe",
    leadScore: 8.7,
    websiteAnalysis:
      "2026-09-03: nevalimeyhane.com DNS yok. nevalihotel.com Şanlıurfa oteli; yazılmadı. Menü üçüncü taraf https://nevalimeyhane.parita.tr/ ; telefon +90 532 479 46 04 DB ile eşleşti. Bağımsız site yok.",
    salkayPitch: "Maltepe sahil meyhane; menü Parita QR. Kendi sitesi yok.",
    source: "https://nevalimeyhane.parita.tr/",
  }),
  {
    restaurantName: "THEGRANMA food&coffee",
    district: "Maltepe",
    website: "https://thegranmacoffee.com/",
    websiteDomain: "thegranmacoffee.com",
    websiteStatus: "GOOD",
    websiteScore: 7.2,
    leadScore: 4.7,
    priority: "QUALIFIED_OUT",
    instagram: "https://www.instagram.com/thegranmacoffee/",
    problem1: "Şubeler sayfasında “Küçülyalı The Granma” yazımı hatalı (Küçükyalı).",
    problem2: "Ana sayfada “Amacınız ne olursa olsu” yazımı hatalı.",
    problem3: "Bize Ulaşın’da public e-posta ve şube telefonu yok; yalnızca form.",
    websiteAnalysis:
      "thegranmacoffee.com 2026-09-03 tarayıcıda açıldı. Menü, hakkımızda, projeler, mağaza, franchise, şubeler (Küçülyalı, Maltepe Piazza, İSTMarina…), rezervasyon var. Instagram thegranmacoffee resmi sitede. Public e-posta sitede yok.",
    opportunities: "LOCAL_SEO, BRAND_REFRESH",
    salkayPitch: "Granma zincir sitesi çalışıyor. Satış listesi dışı.",
    source: "https://thegranmacoffee.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Velora Lounge Cafe Restaurant Maltepe",
    district: "Maltepe",
    website: "https://veloralounge.com.tr/",
    websiteDomain: "veloralounge.com.tr",
    websiteStatus: "GOOD",
    websiteScore: 7.1,
    leadScore: 4.2,
    priority: "QUALIFIED_OUT",
    whatsapp: "+90 536 224 94 47",
    instagram: "https://www.instagram.com/veloralounge_maltepe",
    problem1: "Nav Menü https://veloralounge.com.tr/menu/ “Portfolio / Nothing Found”; asıl menü /velora-menu/.",
    websiteAnalysis:
      "veloralounge.com.tr 2026-09-03 tarayıcıda açıldı. Maltepe Sahil ve 0536 224 94 47 DB telefonuyla eşleşti. Hakkımızda, galeri, etkinlik, blog, rezervasyon var. /velora-menu/ kahvaltı–burger–ızgara kategorileri dolu. WhatsApp wa.me/905362249447 ve Instagram veloralounge_maltepe resmi sitede. Public e-posta yok. veloralounge.com İngiltere şirketi; yazılmadı.",
    opportunities: "DIGITAL_MENU",
    salkayPitch: "Maltepe Velora sitesi çalışıyor. Kapsam dışı; /menu/ 404 ikinci dalga.",
    source: "https://veloralounge.com.tr/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Çınaraltı Dürüm",
    district: "Maltepe",
    website: "https://www.cinaraltidurum.com/",
    websiteDomain: "cinaraltidurum.com",
    websiteStatus: "GOOD",
    websiteScore: 7.4,
    leadScore: 4.6,
    priority: "QUALIFIED_OUT",
    whatsapp: "+90 532 244 77 03",
    instagram: "https://www.instagram.com/cinaralti_durum",
    problem1: "Public business e-posta sitede yok.",
    websiteAnalysis:
      "cinaraltidurum.com 2026-09-03 tarayıcıda açıldı (QR menü). Salon/Al götür ve Paket ayrımı, TR/EN, dürüm–kebap kategorileri, hikâye, 28.04.2026 güncelleme metni. tel:02163994860 DB telefonuyla eşleşti. WhatsApp 905322447703 ve Instagram cinaralti_durum resmi sitede.",
    opportunities: "LOCAL_SEO",
    salkayPitch: "Maltepe Çınaraltı dijital menü çalışıyor. Kapsam dışı.",
    source: "https://www.cinaraltidurum.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Buğday Cafe & Breakfast",
    district: "Pendik",
    website: "https://bugdaycafe.com/",
    websiteDomain: "bugdaycafe.com",
    websiteStatus: "GOOD",
    websiteScore: 7.2,
    leadScore: 5.0,
    priority: "QUALIFIED_OUT",
    instagram: "https://www.instagram.com/bugdaypendik/",
    problem1: "Üst barda telefon 0532 479 05 58; footer “Telefon : 0 531 747 87 34” (DB hattı). Aynı sitede iki farklı numara.",
    websiteAnalysis:
      "bugdaycafe.com 2026-09-03 tarayıcıda açıldı. Doğu Mah. Aydınlı Yolu Cad. No 43 Pendik. Menü fiyatlı (oduncu kahvaltı, pizza, sandviç), hakkımızda, blog. Instagram bugdaypendik resmi sitede. Public e-posta yok. DB telefonu 531 silinmedi.",
    opportunities: "LOCAL_SEO",
    salkayPitch: "Pendik Buğday sitesi menüyle çalışıyor. Çift telefon ikinci dalga; satış dışı.",
    source: "https://bugdaycafe.com/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Happy Beans Coffee",
    district: "Pendik",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-03: Facebook/Instagram ve üçüncü taraf QR menü görülüyor. happybeans.com.tr DNS yok; happybeanscoffee.com A kaydı boş/çözülmedi. Bağımsız domain restoran sitesi olarak doğrulanamadı. NO_WEBSITE verilmedi.",
    source: "https://www.google.com/maps/search/?api=1&query=Happy+Beans+Coffee+Pendik+Istanbul",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "MOSTAR BOSNA RESTAURANT",
    district: "Pendik",
    leadScore: 9.0,
    websiteAnalysis:
      "2026-09-03: Güncel kaynaklarda website olarak Facebook/Instagram. Mostar Otel Pendik ve Urfa Nevali karıştırılmadı. Bağımsız restoran sitesi yok.",
    salkayPitch: "Pendik Bosna restoran; görünürlük Facebook. Yeni marka sitesi, en güçlü no-site adaylarından.",
    source: "https://www.google.com/maps/search/?api=1&query=MOSTAR+BOSNA+RESTAURANT+Pendik+Istanbul",
  }),
  noWebsite({
    restaurantName: "Meşhur Karadeniz Ocakbaşı",
    district: "Pendik",
    leadScore: 8.5,
    websiteAnalysis:
      "2026-09-03: Pendik Esenler +90 530 041 20 52 dizinlerde. Bağımsız resmi site bulunamadı.",
    salkayPitch: "Pendik Karadeniz ocakbaşı; 4.9 puan, site yok. Yeni ocakbaşı sitesi.",
    source: "https://www.google.com/maps/search/?api=1&query=Meşhur+Karadeniz+Ocakbaşı+Pendik+Istanbul",
  }),
  {
    restaurantName: "Pendik Meze Balık",
    district: "Pendik",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-03: İşletme/telefon +90 532 240 38 21 haber ve dizinlerde doğrulanıyor. pendikmezebalik.com ve .com.tr DNS NXDOMAIN; canlı site açılamadı. Domain iddiası var, restoran sitesi doğrulanamadı. NO_WEBSITE verilmedi.",
    source: "https://tuzlagazetesi.com.tr/tuzladan-pendike-uzanan-lezzet-koprusu/",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Pendik Sahil Kebap",
    district: "Pendik",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-03: pendiksahilkebap.com DNS A kaydı var. HTTPS tarayıcıda chrome-error; site açılmadan skor verilmedi. URL yazılmadı. NO_WEBSITE verilmedi.",
    source: "https://www.google.com/maps/search/?api=1&query=Pendik+Sahil+Kebap+Pendik+Istanbul",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Katibim",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-03: Yandex www.katibim.com.tr listeliyor. katibim.com.tr ve www DNS NXDOMAIN; tarayıcı chrome-error, hikayemiz fetch 500. Site açılmadan skor yok. katibim.com inşaat/proje sitesi (0212 212 47 17, info@katibim.com); Üsküdar kaydına yazılmadı.",
    source: "https://yandex.com.tr/maps/org/katibim/1114834807/",
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
      publicEmail: row.publicEmail,
      problem1: row.problem1,
      problem2: row.problem2,
      problem3: row.problem3,
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
    console.log("\nConfirm için: npx tsx scripts/update-wave6-verified-leads.ts --confirm");
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
          problem1: row.problem1,
          problem2: row.problem2,
          problem3: row.problem3,
        })),
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
