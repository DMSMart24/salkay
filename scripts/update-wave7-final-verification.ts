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
    restaurantName: "Şaşkın Balık Ataşehir",
    district: "Ataşehir",
    leadScore: 8.8,
    websiteAnalysis:
      "2026-09-03 final: saskinbalik.com tarayıcıda açıldı; Noter Çıkmazı Sok. No:8 Kadıköy ve 0538 643 58 60. Ataşehir Evren Cad. / 0216 470 05 35 ile eşleşmedi. URL yazılmadı. saskinbalikatasehir.com açılamadı. Bu konum için bağımsız resmi site yok.",
    salkayPitch: "Ataşehir Şaşkın Balık; 1290 yorum, kendi sitesi yok. Kadıköy sitesi bu şube değil.",
    source: "https://saskinbalik.com/",
  }),
  noWebsite({
    restaurantName: "Asırlık Balık Restaurant",
    district: "Kadıköy",
    leadScore: 8.4,
    websiteAnalysis:
      "2026-09-03 final: asirlikkadikoy.com / asirlikbalik.com DNS NXDOMAIN. Placera ölü domain listeliyor. asirlikbalik.eatbu.com üçüncü taraf DISH; hurkaninanc@gmail.com yazılmadı. Instagram asirlik.kadikoy korundu. Bağımsız resmi site yok.",
    salkayPitch: "Kadıköy Asırlık; 1000+ yorum, kendi sitesi yok. Yeni balık sitesi.",
    source: "https://yandex.com.tr/maps/org/asirlik_balik_restaurant/61468615147/",
  }),
  noWebsite({
    restaurantName: "Pusula Mezze Balık",
    district: "Maltepe",
    leadScore: 8.9,
    websiteAnalysis:
      "2026-09-03 final: Yandex www.pusulabalik.com listeliyor. pusulabalik.com ve pusulamezzebalik.com DNS NXDOMAIN; HTTP açılamadı. Bağımsız resmi site yok.",
    salkayPitch: "Maltepe Pusula; 1262 yorum, site yok. Yeni meze-balık sitesi.",
    source: "https://yandex.com.tr/maps/org/pusula_mezze_balik/228713788905/",
  }),
  noWebsite({
    restaurantName: "Happy Beans Coffee",
    district: "Pendik",
    leadScore: 8.5,
    websiteAnalysis:
      "2026-09-03 final: happybeans.com.tr DNS yok; happybeanscoffee.com çözülmüyor. Facebook/Instagram ve üçüncü taraf QR (allzinapp) var. Bağımsız resmi restoran sitesi yok.",
    salkayPitch: "Pendik Happy Beans; 716 yorum, kendi sitesi yok. Yeni kafe sitesi.",
    source: "https://yandex.com/maps/org/happy_beans_coffee/168236128908/",
  }),
  noWebsite({
    restaurantName: "Pendik Meze Balık",
    district: "Pendik",
    leadScore: 8.3,
    websiteAnalysis:
      "2026-09-03 final: Telefon +90 532 240 38 21 haber/Yandex ile doğrulanıyor. pendikmezebalik.com ve .com.tr DNS NXDOMAIN. Bağımsız resmi site yok.",
    salkayPitch: "Pendik sahil meze-balık; site yok. Yeni site + rezervasyon.",
    source: "https://yandex.com.tr/maps/org/pendik_meze_balik/163692813215/",
  }),
  {
    restaurantName: "Pendik Sahil Kebap",
    district: "Pendik",
    website: "http://pendiksahilkebap.com/",
    websiteDomain: "pendiksahilkebap.com",
    websiteStatus: "VERY_WEAK",
    websiteScore: 1.6,
    leadScore: 8.7,
    priority: "HIGH",
    problem1:
      "Açılan sayfa Plesk default: “You see this page because there is no Web site at this address.”",
    problem2: "Sayfada kebap/restoran içeriği yok; menü, adres ve işletme iletişim bilgisi görünmüyor.",
    problem3: "HTTPS SSL hatası; yalnızca HTTP Plesk default sayfası açılıyor.",
    websiteAnalysis:
      "http://pendiksahilkebap.com/ 2026-09-03 tarayıcıda açıldı. Title: Web Server's Default Page. Plesk “Log in to Plesk”. Restoran içeriği yok. Domain adı işletmeyle eşleşiyor; URL yazıldı çünkü canlı boş hosting satış kanıtı. Public e-posta yok.",
    opportunities: "WEBSITE_NEW, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: "Pendik Sahil Kebap; domain var ama Plesk default. Gerçek restoran sitesi net SALKAY işi.",
    source: "http://pendiksahilkebap.com/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Bağevi Kebapçısı",
    district: "Üsküdar",
    leadScore: 8.6,
    websiteAnalysis:
      "2026-09-03 final: Blog bagevikebapcisi.com listeliyor. DNS A kaydı boş/çözülmedi, www NXDOMAIN, HTTP açılamadı. Bağımsız resmi site yok.",
    salkayPitch: "Üsküdar Bağevi; 669 yorum, site yok. Yeni kebap sitesi.",
    source: "https://istanbullezzetduraklari.com/2026/02/27/2026da-uskudarda-iftar-icin-en-cok-tercih-edilen-5-mekan/",
  }),
  noWebsite({
    restaurantName: "Boğaziçi Balık Restorant",
    district: "Üsküdar",
    leadScore: 8.4,
    websiteAnalysis:
      "2026-09-03 final: bogazicibalik.com DNS NXDOMAIN. Eski dizin ölü domain ve farklı telefon (0216 532 52 42) listeliyor; DB hattı 0536 546 48 96. Bu kayıt için bağımsız resmi site bulunamadı.",
    salkayPitch: "Üsküdar Boğaziçi Balık; site yok. Yeni balık sitesi.",
    source: "https://www.google.com/maps/search/?api=1&query=Boğaziçi+Balık+Restorant+Üsküdar+Istanbul",
  }),
  {
    restaurantName: "Butcha Steakhouse",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-03 final: http://butcha.com/ açıldı (HTTPS SSL hata). Nav Ankara, Dubai, Doha, Bakü; Üsküdar/Emaar/Libadiye sitede yok. Emaar Square listing +90 533 500 47 20 bu şubeyi doğruluyor ama marka-şube URL ilişkisi sitede yok. URL yazılmadı. NO_WEBSITE verilmedi.",
    source: "http://www.butcha.com/tr/iletisim",
    dateChecked: CHECKED,
  },
  {
    restaurantName: "Katibim",
    district: "Üsküdar",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    priority: "PENDING",
    websiteAnalysis:
      "2026-09-03 final: Yandex www.katibim.com.tr listeliyor. Bu makinede DNS NXDOMAIN, tarayıcı chrome-error. Harici fetch /iletisim 500. İndekslenen iletişim metninde 0216 310 90 80 ve Harem Sahil Yolu No:53 var ama canlı sayfa açılamadığı için skor yok. katibim.com inşaat firması; yazılmadı.",
    source: "https://yandex.com.tr/maps/org/katibim/1114834807/",
    dateChecked: CHECKED,
  },
  noWebsite({
    restaurantName: "Kristal Meyhanesi",
    district: "Üsküdar",
    leadScore: 7.6,
    priority: "MEDIUM",
    websiteAnalysis:
      "2026-09-03 final: kristalmeyhanesi.com DNS NXDOMAIN. Dizinlerde “Web Site Belirtilmedi”. Bağımsız resmi site yok. Dijital hacim düşük (37 yorum).",
    salkayPitch: "Üsküdar Kristal meyhane; site yok, hacim orta. Yeni meyhane sitesi ikinci sıra.",
    source: "https://placera.com.tr/arabaya-servis-bari/3604197968222203454/",
  }),
  noWebsite({
    restaurantName: "Seyir Üsküdar Kafe",
    district: "Üsküdar",
    leadScore: 8.4,
    websiteAnalysis:
      "2026-09-03 final: seyiruskudar.com DNS yok. seyircafe.com.tr Ankara, seyircafe.net Aliağa; bu kayıt değil, yazılmadı. 0532 179 83 36 ile eşleşen resmi site yok.",
    salkayPitch: "Üsküdar Seyir Kafe; 213 yorum 4.9, kendi sitesi yok. Yeni kahvaltı sitesi.",
    source: "https://www.google.com/maps/search/?api=1&query=Seyir+Üsküdar+Kafe+Üsküdar+Istanbul",
  }),
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
  const scoredRows = details.filter(
    (row) => row.websiteStatus !== "NO_WEBSITE" && row.websiteStatus !== "NOT_VERIFIED",
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
        noWebsiteNames: noWebsiteRows.map((row) => `${row.restaurantName} — ${row.district}`),
        notVerifiedNames: notVerifiedRows.map((row) => `${row.restaurantName} — ${row.district}`),
        scoredNames: scoredRows.map(
          (row) =>
            `${row.restaurantName} — ${row.district} (${row.websiteStatus} / ${row.websiteScore} / ${row.priority})`,
        ),
        unmatched: details.filter((row) => !row.matchedId).map((row) => `${row.restaurantName} — ${row.district}`),
        details,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("\nConfirm için: npx tsx scripts/update-wave7-final-verification.ts --confirm");
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
  const remainingNv = await prisma.restaurantLead.findMany({
    where: { websiteStatus: "NOT_VERIFIED" },
    select: { restaurantName: true, district: true },
    orderBy: [{ district: "asc" }, { restaurantName: "asc" }],
  });
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
        })),
        remaining: { total, notVerified, high, researched: total - notVerified },
        remainingNotVerified: remainingNv,
        emails: after
          .filter((row) => row.publicEmail)
          .map((row) => `${row.restaurantName}: ${row.publicEmail}`),
        top20: top20.rows.slice(0, 10).map((row, index) => ({
          rank: index + 1,
          restaurantName: row.restaurantName,
          district: row.district,
          websiteStatus: row.websiteStatus,
          websiteScore: row.websiteScore,
          leadScore: row.leadScore,
          priority: row.priority,
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
