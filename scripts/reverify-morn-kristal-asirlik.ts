import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getPrisma } from "../src/lib/admin/prisma";
import { listRestaurantLeads, normalizeLeadKey } from "../src/lib/admin/restaurant-leads";
import { sanitizeRestaurantLeadWrite } from "../src/lib/admin/restaurant-leads";

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

const CHECKED = new Date("2026-09-02T00:00:00.000Z");

async function findLead(restaurantName: string, district: string) {
  const prisma = getPrisma();
  const lead = await prisma.restaurantLead.findFirst({
    where: {
      nameNorm: normalizeLeadKey(restaurantName),
      districtNorm: normalizeLeadKey(district),
    },
  });
  if (!lead) throw new Error(`Lead not found: ${restaurantName} — ${district}`);
  return lead;
}

async function main() {
  const apply = process.argv.includes("--confirm");
  const prisma = getPrisma();

  const mornExisting = await findLead("Morn Kadıköy", "Kadıköy");
  const kristalExisting = await findLead("Kristal Meyhanesi", "Üsküdar");
  const asirlikExisting = await findLead("Asırlık Balık Restaurant", "Kadıköy");

  const mornWrite = sanitizeRestaurantLeadWrite({
    restaurantName: mornExisting.restaurantName,
    district: mornExisting.district,
    website: "http://mornkadikoy.com/",
    websiteStatus: "VERY_WEAK",
    websiteScore: 1.6,
    leadScore: 8.9,
    priority: "HIGH",
    contactStatus: mornExisting.contactStatus,
    problem1:
      "Açılan sayfa Plesk default: “You see this page because there is no Web site at this address.”",
    problem2: "Sayfada Morn/restoran içeriği yok; menü, adres ve işletme iletişim bilgisi görünmüyor.",
    problem3: "HTTPS bağlanmıyor; yalnızca HTTP Plesk default sayfası açılıyor.",
    websiteAnalysis:
      "http://mornkadikoy.com/ 2026-09-02 tarayıcıda açıldı. Title: Web Server's Default Page. Plesk “Log in to Plesk” paneli. Restoran içeriği yok. Public e-posta yok.",
    opportunities: "WEBSITE_NEW, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch:
      "Kadıköy brunch; domain var ama Plesk default. Gerçek restoran sitesi net SALKAY işi.",
    source: "http://mornkadikoy.com/",
    dateChecked: CHECKED,
  });

  const preview = [
    {
      restaurantName: mornExisting.restaurantName,
      district: mornExisting.district,
      before: {
        websiteStatus: mornExisting.websiteStatus,
        websiteScore: mornExisting.websiteScore,
        leadScore: mornExisting.leadScore,
        priority: mornExisting.priority,
        website: mornExisting.website,
      },
      after: {
        websiteStatus: mornWrite.websiteStatus,
        websiteScore: mornWrite.websiteScore,
        leadScore: mornWrite.leadScore,
        priority: mornWrite.priority,
        website: mornWrite.website,
      },
    },
    {
      restaurantName: kristalExisting.restaurantName,
      district: kristalExisting.district,
      before: {
        websiteStatus: kristalExisting.websiteStatus,
        websiteScore: kristalExisting.websiteScore,
        leadScore: kristalExisting.leadScore,
        priority: kristalExisting.priority,
        website: kristalExisting.website,
      },
      after: {
        websiteStatus: "NOT_VERIFIED",
        websiteScore: null,
        leadScore: null,
        priority: "PENDING",
        website: null,
      },
    },
    {
      restaurantName: asirlikExisting.restaurantName,
      district: asirlikExisting.district,
      before: {
        websiteStatus: asirlikExisting.websiteStatus,
        websiteScore: asirlikExisting.websiteScore,
        leadScore: asirlikExisting.leadScore,
        priority: asirlikExisting.priority,
        website: asirlikExisting.website,
      },
      after: {
        websiteStatus: "NOT_VERIFIED",
        websiteScore: null,
        leadScore: null,
        priority: "PENDING",
        website: null,
      },
    },
  ];

  console.log(JSON.stringify({ mode: apply ? "CONFIRM_UPDATE" : "PREVIEW", preview }, null, 2));

  if (!apply) {
    console.log("\nConfirm için: npx tsx scripts/reverify-morn-kristal-asirlik.ts --confirm");
    return;
  }

  await prisma.restaurantLead.update({
    where: { id: mornExisting.id },
    data: {
      website: mornWrite.website,
      websiteDomain: mornWrite.websiteDomain,
      websiteStatus: mornWrite.websiteStatus,
      websiteScore: mornWrite.websiteScore,
      leadScore: mornWrite.leadScore,
      priority: mornWrite.priority,
      problem1: mornWrite.problem1,
      problem2: mornWrite.problem2,
      problem3: mornWrite.problem3,
      websiteAnalysis: mornWrite.websiteAnalysis,
      opportunities: mornWrite.opportunities,
      salkayPitch: mornWrite.salkayPitch,
      source: mornWrite.source,
      dateChecked: CHECKED,
    },
  });

  await prisma.restaurantLead.update({
    where: { id: kristalExisting.id },
    data: {
      website: null,
      websiteDomain: null,
      websiteStatus: "NOT_VERIFIED",
      websiteScore: null,
      leadScore: null,
      priority: "PENDING",
      publicEmail: null,
      problem1: null,
      problem2: null,
      problem3: null,
      opportunities: null,
      salkayPitch: null,
      websiteAnalysis:
        "2026-09-02 yeniden kontrol: kristalmeyhanesi.com DNS NXDOMAIN, HTTP/HTTPS ve tarayıcı açılamadı. Dizinlerde “Web Site Belirtilmedi”. Daha önce restoran içeriği görülmüş olsa da bugün doğrulanamadı; NO_WEBSITE verilmedi.",
      source: "https://placera.com.tr/arabaya-servis-bari/3604197968222203454/",
      dateChecked: CHECKED,
    },
  });

  await prisma.restaurantLead.update({
    where: { id: asirlikExisting.id },
    data: {
      website: null,
      websiteDomain: null,
      websiteStatus: "NOT_VERIFIED",
      websiteScore: null,
      leadScore: null,
      priority: "PENDING",
      publicEmail: null,
      problem1: null,
      problem2: null,
      problem3: null,
      opportunities: null,
      salkayPitch: null,
      websiteAnalysis:
        "2026-09-02 yeniden kontrol: Placera http://www.asirlikkadikoy.com/ listeliyor. Bu makinede DNS NX, tarayıcı chrome-error, fetch 503. Domain-işletme ilişkisi var ama site açılamadı. eatbu.com üçüncü taraf; hurkaninanc@gmail.com yazılmadı. Instagram asirlik.kadikoy korundu.",
      source: "https://placera.com.tr/balikcilik-alani/1586757907333588398/",
      dateChecked: CHECKED,
    },
  });

  const names = [
    { restaurantName: "Morn Kadıköy", district: "Kadıköy" },
    { restaurantName: "Kristal Meyhanesi", district: "Üsküdar" },
    { restaurantName: "Asırlık Balık Restaurant", district: "Kadıköy" },
  ];
  const after = await prisma.restaurantLead.findMany({
    where: {
      OR: names.map((row) => ({
        nameNorm: normalizeLeadKey(row.restaurantName),
        districtNorm: normalizeLeadKey(row.district),
      })),
    },
  });
  const [high, notVerified] = await Promise.all([
    prisma.restaurantLead.count({ where: { priority: "HIGH" } }),
    prisma.restaurantLead.count({ where: { websiteStatus: "NOT_VERIFIED" } }),
  ]);
  const top20 = await listRestaurantLeads({ view: "top-20" });

  console.log(
    JSON.stringify(
      {
        updated: 3,
        after: after.map((row) => ({
          restaurantName: row.restaurantName,
          district: row.district,
          websiteStatus: row.websiteStatus,
          websiteScore: row.websiteScore,
          leadScore: row.leadScore,
          priority: row.priority,
          website: row.website,
          publicEmail: row.publicEmail,
          instagram: row.instagram,
        })),
        high,
        notVerified,
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
