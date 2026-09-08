import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Prisma, RestaurantContactStatus, RestaurantLead } from "@prisma/client";
import { normalizeDomain, normalizeWebsite } from "../src/lib/admin/normalize";
import { getPrisma } from "../src/lib/admin/prisma";
import { blankToNull, normalizeLeadKey } from "../src/lib/admin/restaurant-leads";
import { FINAL_ANADOLU_TOP20, type FinalTop20Lead } from "./data/final-anadolu-top20";

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

const PROTECTED_CONTACT: RestaurantContactStatus[] = [
  "CONTACTED",
  "REPLIED",
  "FOLLOW_UP",
  "INTERESTED",
  "MEETING",
  "WON",
  "LOST",
];

function primaryDistrictNorm(district: string) {
  return normalizeLeadKey(district.split("/")[0] ?? district);
}

function buildVerificationNotes(item: FinalTop20Lead) {
  return [item.verificationNotes, item.alternatePhoneNote].filter(Boolean).join(" · ") || null;
}

function matchLead(item: FinalTop20Lead, leads: RestaurantLead[]) {
  const nameNorm = normalizeLeadKey(item.restaurantName);
  const districtNorm = normalizeLeadKey(item.district);
  const primaryDistrict = primaryDistrictNorm(item.district);

  const exact = leads.find(
    (row) => row.nameNorm === nameNorm && row.districtNorm === districtNorm,
  );
  if (exact) return { lead: exact, match: "exact_name_district" as const };

  const primary = leads.find(
    (row) =>
      row.nameNorm === nameNorm &&
      (row.districtNorm === primaryDistrict ||
        primaryDistrictNorm(row.district) === primaryDistrict),
  );
  if (primary) return { lead: primary, match: "name_primary_district" as const };

  const byName = leads.filter((row) => row.nameNorm === nameNorm);
  if (byName.length === 1) return { lead: byName[0]!, match: "unique_name" as const };

  return { lead: null, match: "none" as const };
}

function buildData(item: FinalTop20Lead, existing?: RestaurantLead | null) {
  const website = item.website ? normalizeWebsite(item.website) : existing?.website ?? null;
  const websiteDomain = website ? normalizeDomain(website) : existing?.websiteDomain ?? null;
  const keepVerifiedEmail =
    existing?.publicEmail && blankToNull(existing.publicEmail) && item.finalRank === 18
      ? existing.publicEmail
      : null;
  const allowsScore =
    item.websiteStatus !== "NO_WEBSITE" && item.websiteStatus !== "NOT_VERIFIED";

  const data: Prisma.RestaurantLeadUncheckedCreateInput = {
    restaurantName: item.restaurantName,
    nameNorm: normalizeLeadKey(item.restaurantName),
    district: item.district,
    districtNorm: normalizeLeadKey(item.district),
    region: "ANADOLU",
    neighborhood: item.neighborhood ?? null,
    website,
    websiteDomain,
    websiteStatus: item.websiteStatus,
    websiteScore: allowsScore ? item.websiteScore : null,
    leadScore: item.leadScore,
    priority: item.priority,
    publicEmail: keepVerifiedEmail,
    phone: item.phone,
    googleRating: item.googleRating,
    googleReviewCount: item.googleReviewCount,
    problem1: item.problem,
    problem2: null,
    problem3: null,
    opportunities: item.opportunity,
    salkayPitch: item.pitchAngle,
    websiteAnalysis: buildVerificationNotes(item),
    source: "FINAL Anadolu Yakası TOP 20",
    dateChecked: new Date("2026-09-06T12:00:00.000Z"),
    isFinalTop20: true,
    finalRank: item.finalRank,
  };

  return data;
}

async function main() {
  loadDotEnv();
  const apply = process.argv.includes("--apply");
  const prisma = getPrisma();
  const leads = await prisma.restaurantLead.findMany();

  const preview = FINAL_ANADOLU_TOP20.map((item) => {
    const { lead, match } = matchLead(item, leads);
    const data = buildData(item, lead);
    if (!lead) {
      return {
        finalRank: item.finalRank,
        restaurantName: item.restaurantName,
        district: item.district,
        action: "CREATE" as const,
        match,
        existingId: null,
        preservedContactStatus: null,
        preservedOutreachNotes: false,
        data,
      };
    }

    return {
      finalRank: item.finalRank,
      restaurantName: item.restaurantName,
      district: item.district,
      action: "UPDATE" as const,
      match,
      existingId: lead.id,
      existingName: lead.restaurantName,
      existingDistrict: lead.district,
      existingContactStatus: lead.contactStatus,
      existingOutreachNotes: lead.outreachNotes,
      preservedContactStatus: lead.contactStatus,
      preservedOutreachNotes: Boolean(blankToNull(lead.outreachNotes)),
      protectedContact: PROTECTED_CONTACT.includes(lead.contactStatus),
      data,
    };
  });

  const created = preview.filter((row) => row.action === "CREATE");
  const updated = preview.filter((row) => row.action === "UPDATE");
  const matched = updated.length;

  console.log(
    JSON.stringify(
      {
        mode: apply ? "APPLY" : "DRY_RUN",
        packSize: FINAL_ANADOLU_TOP20.length,
        matched,
        updated: updated.length,
        created: created.length,
        skipped: 0,
        rows: preview.map((row) => ({
          finalRank: row.finalRank,
          action: row.action,
          match: row.match,
          restaurantName: row.restaurantName,
          district: row.district,
          existing: row.existingId
            ? `${row.existingName} · ${row.existingDistrict} · ${row.existingContactStatus}`
            : null,
          preserveNotes: row.preservedOutreachNotes,
        })),
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to write.");
    return;
  }

  let contactPreserved = 0;
  let notesPreserved = 0;

  await prisma.$transaction(async (tx) => {
    await tx.restaurantLead.updateMany({
      where: { OR: [{ isFinalTop20: true }, { finalRank: { not: null } }] },
      data: { isFinalTop20: false, finalRank: null },
    });

    for (const row of preview) {
      if (row.action === "CREATE") {
        await tx.restaurantLead.create({
          data: {
            ...row.data,
            contactStatus: "NOT_CONTACTED",
            outreachNotes: null,
          },
        });
        continue;
      }

      const existing = leads.find((lead) => lead.id === row.existingId)!;
      if (PROTECTED_CONTACT.includes(existing.contactStatus) || existing.contactStatus) {
        contactPreserved += 1;
      }
      if (blankToNull(existing.outreachNotes)) notesPreserved += 1;

      await tx.restaurantLead.update({
        where: { id: row.existingId! },
        data: {
          ...row.data,
          // Never wipe contact workflow / manual notes
          contactStatus: undefined,
          salesStatus: undefined,
          lastContactAt: undefined,
          nextFollowUpAt: undefined,
          contactAttempts: undefined,
          outreachNotes: undefined,
          whatsapp: undefined,
          instagram: undefined,
          address: undefined,
          googleMapsUrl: undefined,
        },
      });
    }
  });

  const finalRows = await prisma.restaurantLead.findMany({
    where: { isFinalTop20: true },
    orderBy: { finalRank: "asc" },
    select: {
      finalRank: true,
      restaurantName: true,
      district: true,
      phone: true,
      publicEmail: true,
      websiteStatus: true,
      websiteScore: true,
      leadScore: true,
      googleRating: true,
      googleReviewCount: true,
      contactStatus: true,
      outreachNotes: true,
      website: true,
    },
  });

  const ranks = finalRows.map((row) => row.finalRank);
  const dupGroups = await prisma.restaurantLead.groupBy({
    by: ["nameNorm", "districtNorm"],
    _count: { _all: true },
    having: { nameNorm: { _count: { gt: 1 } } },
  });

  const missingPhone = finalRows.filter((row) => !blankToNull(row.phone)).length;
  const invalidRating = finalRows.filter(
    (row) => typeof row.googleRating !== "number" || row.googleRating < 0 || row.googleRating > 5,
  ).length;
  const invalidLeadScore = finalRows.filter(
    (row) => typeof row.leadScore !== "number" || row.leadScore < 0 || row.leadScore > 10,
  ).length;
  const inventedEmail = finalRows.filter((row) => blankToNull(row.publicEmail)).length;
  const badNoWebsite = finalRows.filter(
    (row) => row.websiteStatus === "NO_WEBSITE" && blankToNull(row.website),
  ).length;
  const uniqueRanks = new Set(ranks.filter((rank): rank is number => rank != null));

  console.log(
    JSON.stringify(
      {
        applied: true,
        matched,
        updated: updated.length,
        created: created.length,
        skipped: 0,
        finalTop20Count: finalRows.length,
        finalRankUnique: uniqueRanks.size,
        duplicateGroups: dupGroups.length,
        missingPhone,
        invalidRating,
        invalidLeadScore,
        inventedEmail,
        badNoWebsite,
        contactPreserved,
        notesPreserved,
        emailsSent: 0,
        messagesSent: 0,
        finalRows,
      },
      null,
      2,
    ),
  );

  if (finalRows.length !== 20) throw new Error(`Final Top 20 count !== 20 (${finalRows.length})`);
  if (uniqueRanks.size !== 20) throw new Error("finalRank unique 1..20 failed");
  if (dupGroups.length !== 0) throw new Error("Duplicate restaurant groups found");
  if (missingPhone !== 0) throw new Error("Missing primary phone");
  if (invalidRating !== 0) throw new Error("Invalid rating");
  if (invalidLeadScore !== 0) throw new Error("Invalid leadScore");
  if (inventedEmail !== 0) throw new Error("Unexpected publicEmail on final pack");
  if (badNoWebsite !== 0) throw new Error("NO_WEBSITE with website URL");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
