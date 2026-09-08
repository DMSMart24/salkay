/**
 * READ-ONLY export of all RestaurantLead rows.
 * No CREATE / UPDATE / DELETE / migration / outreach.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { RestaurantLead } from "@prisma/client";
import {
  isClosedOrHoldRestaurant,
  restaurantEmailTrustBadge,
  readyForOutreachWhere,
} from "../src/lib/admin/restaurant-leads";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function priorityRank(priority: string) {
  switch (priority) {
    case "HIGH":
      return 0;
    case "MEDIUM":
      return 1;
    case "LOW":
      return 2;
    case "PENDING":
      return 3;
    case "QUALIFIED_OUT":
      return 4;
    default:
      return 5;
  }
}

function extractEmailTrust(notes?: string | null, publicEmail?: string | null) {
  const badge = restaurantEmailTrustBadge({ outreachNotes: notes, publicEmail });
  const tag =
    notes?.match(/\b(OFFICIAL_VERIFIED|THIRD_PARTY_VERIFIED|NOT_VERIFIED|NOT_FOUND|HISTORICAL)\b/i)?.[1]
      ?.toUpperCase() ?? badge;
  return { badge, tag };
}

async function main() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL missing");

  const prisma = getPrisma();
  const dbTotal = await prisma.restaurantLead.count();
  const rows = await prisma.restaurantLead.findMany();

  const readyCandidates = await prisma.restaurantLead.findMany({
    where: readyForOutreachWhere(),
    select: { id: true, outreachNotes: true, salesStatus: true },
  });
  const readyIds = new Set(
    readyCandidates.filter((row) => !isClosedOrHoldRestaurant(row)).map((row) => row.id),
  );

  rows.sort((a, b) => {
    const byPriority = priorityRank(a.priority) - priorityRank(b.priority);
    if (byPriority !== 0) return byPriority;
    const leadA = typeof a.leadScore === "number" ? a.leadScore : Number.NEGATIVE_INFINITY;
    const leadB = typeof b.leadScore === "number" ? b.leadScore : Number.NEGATIVE_INFINITY;
    if (leadB !== leadA) return leadB - leadA;
    return a.restaurantName.localeCompare(b.restaurantName, "tr");
  });

  const headers = [
    "#",
    "restaurantName",
    "region",
    "district",
    "neighborhood",
    "address",
    "phone",
    "whatsapp",
    "publicEmail",
    "emailTrust",
    "emailTrustBadge",
    "website",
    "instagram",
    "googleRating",
    "googleReviewCount",
    "websiteStatus",
    "websiteScore",
    "leadScore",
    "priority",
    "contactStatus",
    "isFinalTop20",
    "finalRank",
    "READY_FOR_OUTREACH",
    "nameNorm",
    "districtNorm",
  ];

  const exportRows = rows.map((row: RestaurantLead, index) => {
    const trust = extractEmailTrust(row.outreachNotes, row.publicEmail);
    return {
      n: index + 1,
      restaurantName: row.restaurantName,
      region: row.region,
      district: row.district,
      neighborhood: row.neighborhood ?? "",
      address: row.address ?? "",
      phone: row.phone ?? "",
      whatsapp: row.whatsapp ?? "",
      publicEmail: row.publicEmail ?? "",
      emailTrust: trust.tag,
      emailTrustBadge: trust.badge,
      website: row.website ?? "",
      instagram: row.instagram ?? "",
      googleRating: row.googleRating ?? "",
      googleReviewCount: row.googleReviewCount ?? "",
      websiteStatus: row.websiteStatus,
      websiteScore: row.websiteScore ?? "",
      leadScore: row.leadScore ?? "",
      priority: row.priority,
      contactStatus: row.contactStatus,
      isFinalTop20: row.isFinalTop20 ? "true" : "false",
      finalRank: row.finalRank ?? "",
      READY_FOR_OUTREACH: readyIds.has(row.id) ? "YES" : "NO",
      nameNorm: row.nameNorm,
      districtNorm: row.districtNorm,
    };
  });

  const csvLines = [
    headers.join(","),
    ...exportRows.map((row) =>
      [
        row.n,
        row.restaurantName,
        row.region,
        row.district,
        row.neighborhood,
        row.address,
        row.phone,
        row.whatsapp,
        row.publicEmail,
        row.emailTrust,
        row.emailTrustBadge,
        row.website,
        row.instagram,
        row.googleRating,
        row.googleReviewCount,
        row.websiteStatus,
        row.websiteScore,
        row.leadScore,
        row.priority,
        row.contactStatus,
        row.isFinalTop20,
        row.finalRank,
        row.READY_FOR_OUTREACH,
        row.nameNorm,
        row.districtNorm,
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  const csvPath = path.resolve(process.cwd(), "scripts/output/restaurant-leads-full-295.csv");
  writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  const count = (fn: (row: RestaurantLead) => boolean) => rows.filter(fn).length;
  const keys = rows.map((row) => `${row.nameNorm}|${row.districtNorm}`);
  const summary = {
    TOTAL: dbTotal,
    HIGH: count((row) => row.priority === "HIGH"),
    MEDIUM: count((row) => row.priority === "MEDIUM"),
    LOW: count((row) => row.priority === "LOW"),
    PENDING: count((row) => row.priority === "PENDING"),
    QUALIFIED_OUT: count((row) => row.priority === "QUALIFIED_OUT"),
    READY_FOR_OUTREACH: readyIds.size,
    NO_WEBSITE: count((row) => row.websiteStatus === "NO_WEBSITE"),
    VERY_WEAK: count((row) => row.websiteStatus === "VERY_WEAK"),
    WEAK: count((row) => row.websiteStatus === "WEAK"),
    IMPROVABLE: count((row) => row.websiteStatus === "IMPROVABLE"),
    GOOD: count((row) => row.websiteStatus === "GOOD"),
    VERY_GOOD: count((row) => row.websiteStatus === "VERY_GOOD"),
    NOT_VERIFIED: count((row) => row.websiteStatus === "NOT_VERIFIED"),
    EXPORTED_ROWS: exportRows.length,
    DB_TOTAL: dbTotal,
    duplicateNameDistrict: keys.length - new Set(keys).size,
    csvPath,
  };

  writeFileSync(
    path.resolve(process.cwd(), "scripts/output/restaurant-leads-full-295-summary.json"),
    JSON.stringify({ summary, rows: exportRows }, null, 2),
    "utf8",
  );

  console.log("=== SUMMARY ===");
  console.log(`TOTAL: ${summary.TOTAL}`);
  console.log(`HIGH: ${summary.HIGH}`);
  console.log(`MEDIUM: ${summary.MEDIUM}`);
  console.log(`QUALIFIED_OUT: ${summary.QUALIFIED_OUT}`);
  console.log(`READY_FOR_OUTREACH: ${summary.READY_FOR_OUTREACH}`);
  console.log(`NO_WEBSITE: ${summary.NO_WEBSITE}`);
  console.log(`VERY_WEAK: ${summary.VERY_WEAK}`);
  console.log(`WEAK: ${summary.WEAK}`);
  console.log(`IMPROVABLE: ${summary.IMPROVABLE}`);
  console.log(`GOOD: ${summary.GOOD}`);
  console.log(`VERY_GOOD: ${summary.VERY_GOOD}`);
  console.log(`NOT_VERIFIED: ${summary.NOT_VERIFIED}`);
  console.log(`EXPORTED ROWS: ${summary.EXPORTED_ROWS}`);
  console.log(`DB TOTAL: ${summary.DB_TOTAL}`);
  console.log(`duplicate nameNorm+districtNorm: ${summary.duplicateNameDistrict}`);
  console.log(`CSV: ${csvPath}`);
  console.log("DB writes: 0");

  // Compact table chunks for console / agent report consumption
  const chunks = [
    [1, 50],
    [51, 100],
    [101, 150],
    [151, 200],
    [201, 250],
    [251, 295],
  ] as const;

  for (const [from, to] of chunks) {
    console.log(`\n=== ROWS ${from}-${Math.min(to, exportRows.length)} ===`);
    for (const row of exportRows.slice(from - 1, to)) {
      console.log(
        [
          row.n,
          row.restaurantName,
          row.region,
          row.district,
          row.neighborhood || "-",
          row.phone || "-",
          row.publicEmail || "-",
          row.emailTrust,
          row.website || "-",
          row.websiteStatus,
          row.websiteScore === "" ? "-" : row.websiteScore,
          row.leadScore === "" ? "-" : row.leadScore,
          row.priority,
          row.contactStatus,
          row.isFinalTop20,
          row.finalRank === "" ? "-" : row.finalRank,
          row.READY_FOR_OUTREACH,
        ].join(" | "),
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
