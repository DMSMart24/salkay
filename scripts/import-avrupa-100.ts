import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Prisma, RestaurantLead } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import {
  blankToNull,
  normalizeLeadKey,
  normalizePhoneDigits,
  restaurantEmailSegment,
} from "../src/lib/admin/restaurant-leads";
import { normalizeDomain } from "../src/lib/admin/normalize";
import { assertAvrupaDataset, avrupaSanitizedLeads } from "./avrupa-100-dataset";

function loadDotEnv() {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), file);
    if (!existsSync(envPath)) continue;
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
}

loadDotEnv();

type ImportAction = "CREATE" | "UPDATE" | "SKIP" | "DUPLICATE" | "CONFLICT";

type PlannedRow = {
  action: ImportAction;
  lead: ReturnType<typeof avrupaSanitizedLeads>[number];
  existing: RestaurantLead | null;
  reason: string;
};

const SKIP_BLANK_FIELDS = [
  "neighborhood",
  "address",
  "website",
  "websiteDomain",
  "publicEmail",
  "phone",
  "whatsapp",
  "instagram",
  "googleMapsUrl",
  "category",
  "problem1",
  "problem2",
  "problem3",
  "websiteAnalysis",
  "opportunities",
  "salkayPitch",
  "source",
  "outreachNotes",
] as const;

function identityKey(name: string, district: string) {
  return `${normalizeLeadKey(name)}|${normalizeLeadKey(district)}`;
}

function isBlank(value: unknown) {
  if (value == null) return true;
  if (value === "") return true;
  return false;
}

function valuesEqual(left: unknown, right: unknown) {
  if (left instanceof Date && right instanceof Date) return left.getTime() === right.getTime();
  if (left instanceof Date || right instanceof Date) {
    const leftTime = left instanceof Date ? left.getTime() : left ? new Date(String(left)).getTime() : NaN;
    const rightTime = right instanceof Date ? right.getTime() : right ? new Date(String(right)).getTime() : NaN;
    return leftTime === rightTime;
  }
  return left === right;
}

function buildAvrupaUpdatePatch(existing: RestaurantLead, incoming: PlannedRow["lead"]): Prisma.RestaurantLeadUpdateInput {
  const patch: Prisma.RestaurantLeadUpdateInput = {};
  const assign = (field: keyof PlannedRow["lead"], value: unknown) => {
    if (SKIP_BLANK_FIELDS.includes(field as (typeof SKIP_BLANK_FIELDS)[number]) && isBlank(value) && !isBlank(existing[field as keyof RestaurantLead])) {
      return;
    }
    if (valuesEqual(existing[field as keyof RestaurantLead], value)) return;
    (patch as Record<string, unknown>)[field] = value;
  };

  assign("restaurantName", incoming.restaurantName);
  assign("nameNorm", incoming.nameNorm);
  assign("district", incoming.district);
  assign("districtNorm", incoming.districtNorm);
  assign("region", incoming.region);
  assign("website", incoming.website);
  assign("websiteDomain", incoming.websiteDomain);
  assign("websiteStatus", incoming.websiteStatus);
  assign("websiteScore", incoming.websiteScore);
  assign("leadScore", incoming.leadScore);
  assign("priority", incoming.priority);
  assign("publicEmail", incoming.publicEmail);
  assign("phone", incoming.phone);
  assign("whatsapp", incoming.whatsapp);
  assign("instagram", incoming.instagram);
  assign("googleMapsUrl", incoming.googleMapsUrl);
  assign("category", incoming.category);
  assign("problem1", incoming.problem1);
  assign("problem2", incoming.problem2);
  assign("problem3", incoming.problem3);
  assign("websiteAnalysis", incoming.websiteAnalysis);
  assign("opportunities", incoming.opportunities);
  assign("salkayPitch", incoming.salkayPitch);
  assign("source", incoming.source);
  assign("dateChecked", incoming.dateChecked);
  assign("outreachNotes", incoming.outreachNotes);
  return patch;
}

async function regionCounts(prisma: ReturnType<typeof getPrisma>) {
  const [total, anadolu, avrupa] = await Promise.all([
    prisma.restaurantLead.count(),
    prisma.restaurantLead.count({ where: { region: "ANADOLU" } }),
    prisma.restaurantLead.count({ where: { region: "AVRUPA" } }),
  ]);
  return { total, anadolu, avrupa };
}

function classify(
  incoming: PlannedRow["lead"],
  existingLeads: RestaurantLead[],
  seenInFile: Set<string>,
): PlannedRow {
  const key = identityKey(incoming.restaurantName, incoming.district);
  if (seenInFile.has(key)) {
    return { action: "DUPLICATE", lead: incoming, existing: null, reason: "in_file name+district" };
  }
  seenInFile.add(key);

  const byNameDistrict = existingLeads.find(
    (row) => row.nameNorm === incoming.nameNorm && row.districtNorm === incoming.districtNorm,
  );
  const domain = incoming.websiteDomain;
  const byDomain =
    domain
      ? existingLeads.find((row) => row.websiteDomain && normalizeDomain(row.websiteDomain) === domain)
      : undefined;
  const phone = normalizePhoneDigits(incoming.phone);
  const byPhone =
    phone
      ? existingLeads.find((row) => normalizePhoneDigits(row.phone) && normalizePhoneDigits(row.phone) === phone)
      : undefined;

  const nameMatch = byNameDistrict ?? null;
  const domainMatch = byDomain && byDomain.id !== nameMatch?.id ? byDomain : null;
  const phoneMatch = byPhone && byPhone.id !== nameMatch?.id && byPhone.id !== domainMatch?.id ? byPhone : null;

  if (domainMatch) {
    return {
      action: "CONFLICT",
      lead: incoming,
      existing: domainMatch,
      reason: `domain ${domain} matches ${domainMatch.restaurantName} / ${domainMatch.district} (${domainMatch.region})`,
    };
  }
  if (phoneMatch) {
    return {
      action: "CONFLICT",
      lead: incoming,
      existing: phoneMatch,
      reason: `phone matches ${phoneMatch.restaurantName} / ${phoneMatch.district} (${phoneMatch.region})`,
    };
  }
  if (!nameMatch) {
    return { action: "CREATE", lead: incoming, existing: null, reason: "new Avrupa identity" };
  }
  if (nameMatch.region === "ANADOLU") {
    return {
      action: "CONFLICT",
      lead: incoming,
      existing: nameMatch,
      reason: `would UPDATE Anadolu record ${nameMatch.restaurantName} / ${nameMatch.district}`,
    };
  }
  const patch = buildAvrupaUpdatePatch(nameMatch, incoming);
  if (Object.keys(patch).length === 0) {
    return { action: "SKIP", lead: incoming, existing: nameMatch, reason: "unchanged Avrupa record" };
  }
  return { action: "UPDATE", lead: incoming, existing: nameMatch, reason: "idempotent Avrupa update" };
}

async function printAfterReport(prisma: ReturnType<typeof getPrisma>) {
  const avrupa = await prisma.restaurantLead.findMany({ where: { region: "AVRUPA" } });
  const statuses = avrupa.reduce<Record<string, number>>((acc, row) => {
    acc[row.websiteStatus] = (acc[row.websiteStatus] ?? 0) + 1;
    return acc;
  }, {});
  const sales = {
    HIGH: avrupa.filter((row) => row.priority === "HIGH").length,
    MEDIUM: avrupa.filter((row) => row.priority === "MEDIUM").length,
    PENDING: avrupa.filter((row) => row.priority === "PENDING").length,
    QUALIFIED_OUT: avrupa.filter((row) => row.priority === "QUALIFIED_OUT").length,
    NO_WEBSITE_EMAIL: avrupa.filter((row) => restaurantEmailSegment(row.websiteStatus) === "NO_WEBSITE_EMAIL").length,
    WEBSITE_PROBLEM_EMAIL: avrupa.filter((row) => restaurantEmailSegment(row.websiteStatus) === "WEBSITE_PROBLEM_EMAIL").length,
    verifiedPublicEmails: avrupa.filter((row) => blankToNull(row.publicEmail)).length,
  };
  const quality = {
    duplicates: 0,
    branchConflicts: avrupa.filter((row) => /BRANCH|WRONG_BRANCH/i.test(row.outreachNotes ?? "")).length,
    domainConflicts: avrupa.filter((row) => /DOMAIN/i.test(row.outreachNotes ?? "")).length,
    missingPhone: avrupa.filter((row) => !blankToNull(row.phone)).length,
    missingWebsite: avrupa.filter((row) => !blankToNull(row.website)).length,
    missingPublicEmail: avrupa.filter((row) => !blankToNull(row.publicEmail)).length,
  };

  const notVerifiedBad = avrupa.filter(
    (row) =>
      row.websiteStatus === "NOT_VERIFIED" &&
      (row.websiteScore != null || row.leadScore != null || row.priority !== "PENDING"),
  );
  const noWebsiteBad = avrupa.filter((row) => row.websiteStatus === "NO_WEBSITE" && row.websiteScore != null);
  const goodBad = avrupa.filter(
    (row) => (row.websiteStatus === "GOOD" || row.websiteStatus === "VERY_GOOD") && row.priority !== "QUALIFIED_OUT",
  );

  console.log("\n=== AFTER VALIDATION ===");
  console.log(`AVRUPA rows: ${avrupa.length}`);
  console.log("EUROPE STATUS COUNTS", statuses);
  console.log("SALES", sales);
  console.log("DATA QUALITY", quality);
  if (notVerifiedBad.length || noWebsiteBad.length || goodBad.length) {
    throw new Error("Post-import status rule validation failed.");
  }
}

async function main() {
  const confirm = process.argv.includes("--confirm");
  const leads = assertAvrupaDataset();
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL yok; dry-run/import yapılamadı.");
    process.exit(1);
  }

  const prisma = getPrisma();
  const before = await regionCounts(prisma);
  console.log("=== BEFORE ===");
  console.log(`RestaurantLead total: ${before.total}`);
  console.log(`Anadolu: ${before.anadolu}`);
  console.log(`Avrupa: ${before.avrupa}`);

  const existing = await prisma.restaurantLead.findMany();
  const seenInFile = new Set<string>();
  const planned = leads.map((lead) => classify(lead, existing, seenInFile));
  const counts = {
    CREATE: planned.filter((row) => row.action === "CREATE").length,
    UPDATE: planned.filter((row) => row.action === "UPDATE").length,
    SKIP: planned.filter((row) => row.action === "SKIP").length,
    DUPLICATE: planned.filter((row) => row.action === "DUPLICATE").length,
    CONFLICT: planned.filter((row) => row.action === "CONFLICT").length,
  };

  const anadoluUpdates = planned.filter(
    (row) => row.action === "UPDATE" && row.existing?.region === "ANADOLU",
  );
  const anadoluConflicts = planned.filter(
    (row) => row.action === "CONFLICT" && row.existing?.region === "ANADOLU",
  );

  console.log("\n=== DRY-RUN ===");
  console.log(counts);
  if (anadoluUpdates.length || anadoluConflicts.length) {
    console.log("\nAnadolu protection hits:");
    for (const row of [...anadoluUpdates, ...anadoluConflicts]) {
      console.log(`  ${row.action} ${row.lead.restaurantName} / ${row.lead.district}: ${row.reason}`);
    }
  }
  if (counts.CONFLICT) {
    console.log("\nConflicts:");
    for (const row of planned.filter((item) => item.action === "CONFLICT")) {
      console.log(`  ${row.lead.restaurantName} / ${row.lead.district}: ${row.reason}`);
    }
  }

  if (anadoluUpdates.length) {
    console.error("\nSTOP: Avrupa importu Anadolu kaydını UPDATE edecekti. Yazılmadı.");
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!confirm) {
    console.log("\nImport yazılmadı. Yazmak için: npx tsx scripts/import-avrupa-100.ts --confirm");
    await prisma.$disconnect();
    return;
  }

  if (counts.CONFLICT) {
    console.error("\nSTOP: CONFLICT var. Veri zorlanmadı.");
    await prisma.$disconnect();
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  for (const row of planned) {
    if (row.action === "CREATE") {
      await prisma.restaurantLead.create({ data: row.lead });
      created += 1;
      continue;
    }
    if (row.action === "UPDATE" && row.existing) {
      if (row.existing.region === "ANADOLU") {
        throw new Error(`Refusing Anadolu overwrite: ${row.existing.restaurantName}`);
      }
      const patch = buildAvrupaUpdatePatch(row.existing, row.lead);
      if (Object.keys(patch).length) {
        await prisma.restaurantLead.update({ where: { id: row.existing.id }, data: patch });
        updated += 1;
      }
    }
  }

  const after = await regionCounts(prisma);
  console.log("\n=== IMPORT ===");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${counts.SKIP}`);
  console.log(`Duplicate prevented: ${counts.DUPLICATE}`);
  console.log(`Conflicts: ${counts.CONFLICT}`);

  console.log("\n=== AFTER ===");
  console.log(`RestaurantLead total: ${after.total}`);
  console.log(`Anadolu: ${after.anadolu}`);
  console.log(`Avrupa: ${after.avrupa}`);

  if (after.anadolu !== before.anadolu) {
    throw new Error(`Anadolu count changed: ${before.anadolu} → ${after.anadolu}`);
  }
  if (after.avrupa !== 100) {
    throw new Error(`AVRUPA count must be 100, got ${after.avrupa}`);
  }

  await printAfterReport(prisma);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
