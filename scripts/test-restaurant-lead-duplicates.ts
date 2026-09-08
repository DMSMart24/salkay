/**
 * READ-ONLY duplicate matcher audit on existing RestaurantLead rows.
 * Does not create, update, delete, or merge any records.
 */
import {
  analyzeRestaurantLeadDuplicatePairs,
  matchRestaurantLeadAgainstPool,
  toMatchCandidate,
} from "../src/lib/admin/restaurant-lead-duplicates";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import { readyForOutreachWhere, isClosedOrHoldRestaurant } from "../src/lib/admin/restaurant-leads";

function formatPair(
  label: string,
  a: { restaurantName: string; district: string },
  b: { restaurantName: string; district: string },
  detail: string,
  risk: string,
) {
  return `  - [${label}] ${a.restaurantName} (${a.district}) ↔ ${b.restaurantName} (${b.district}) · ${detail} · FP risk=${risk}`;
}

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL missing — abort (no writes attempted).");
  }

  const prisma = getPrisma();
  const total = await prisma.restaurantLead.count();
  const leads = await prisma.restaurantLead.findMany({
    orderBy: [{ region: "asc" }, { restaurantName: "asc" }],
  });
  const pool = leads.map(toMatchCandidate);

  console.log("=== RestaurantLead duplicate matcher audit (READ-ONLY) ===");
  console.log(`total leads loaded: ${total}`);
  console.log(`writes performed: 0`);

  const report = analyzeRestaurantLeadDuplicatePairs(pool);

  console.log("\n--- Counts ---");
  console.log(`exact duplicate pairs (nameNorm+districtNorm): ${report.exact.length}`);
  console.log(`phone-match candidate pairs: ${report.phone.length}`);
  console.log(`domain-match candidate pairs: ${report.domain.length}`);
  console.log(`name-only ambiguous pairs: ${report.nameOnly.length}`);
  console.log(`name+primary-district pairs: ${report.namePrimaryDistrict.length}`);
  console.log(`address-conflict pairs: ${report.address.length}`);
  console.log(`matcher wouldAutoMatch pairs: ${report.wouldAutoMatch.length}`);
  console.log(`matcher reviewRequired pairs: ${report.reviewRequired.length}`);

  const sections: Array<[string, typeof report.exact]> = [
    ["EXACT", report.exact],
    ["PHONE", report.phone],
    ["DOMAIN", report.domain],
    ["NAME_ONLY", report.nameOnly],
    ["NAME_PRIMARY_DISTRICT", report.namePrimaryDistrict],
    ["ADDRESS", report.address],
  ];

  for (const [title, pairs] of sections) {
    console.log(`\n--- ${title} (${pairs.length}) ---`);
    if (pairs.length === 0) {
      console.log("  (none)");
      continue;
    }
    for (const pair of pairs.slice(0, 40)) {
      console.log(
        formatPair(pair.reason, pair.a, pair.b, pair.detail, pair.falsePositiveRisk),
      );
    }
    if (pairs.length > 40) console.log(`  ... +${pairs.length - 40} more`);
  }

  console.log("\n--- wouldAutoMatch (should be empty for healthy unique DB) ---");
  if (report.wouldAutoMatch.length === 0) {
    console.log("  (none) — no existing pair would be silently auto-merged by matcher");
  } else {
    for (const pair of report.wouldAutoMatch) {
      console.log(
        formatPair(pair.reason, pair.a, pair.b, pair.detail, pair.falsePositiveRisk),
      );
    }
  }

  console.log("\n--- False-positive risk highlights ---");
  const highRisk = [
    ...report.phone,
    ...report.domain,
    ...report.nameOnly,
    ...report.address,
  ].filter((pair) => pair.falsePositiveRisk === "high");
  if (highRisk.length === 0) {
    console.log("  (none marked high)");
  } else {
    for (const pair of highRisk.slice(0, 50)) {
      console.log(
        formatPair(pair.kind, pair.a, pair.b, pair.detail, pair.falsePositiveRisk),
      );
    }
  }

  // Sanity: unique constraint on nameNorm+districtNorm
  const keySet = new Set(pool.map((lead) => `${lead.nameNorm}|${lead.districtNorm}`));
  console.log("\n--- Integrity ---");
  console.log(`unique nameNorm+districtNorm keys: ${keySet.size} / ${pool.length}`);
  console.log(
    `proof no silent merge on existing set: wouldAutoMatch=${report.wouldAutoMatch.length} (expected 0 if no true dups)`,
  );

  // Spot-check: probing each lead against pool excluding self should not exact-match
  let probeExact = 0;
  let probeStrong = 0;
  let probeReview = 0;
  for (const lead of pool) {
    const decision = matchRestaurantLeadAgainstPool(
      {
        restaurantName: lead.restaurantName,
        nameNorm: lead.nameNorm,
        district: lead.district,
        districtNorm: lead.districtNorm,
        address: lead.address,
        phone: lead.phone,
        website: lead.website,
        websiteDomain: lead.websiteDomain,
        excludeId: lead.id,
      },
      pool,
    );
    if (decision.status === "match") {
      if (decision.confidence === "exact") probeExact += 1;
      else probeStrong += 1;
    } else if (decision.status === "review_required") {
      probeReview += 1;
    }
  }
  console.log(`per-lead probe match exact: ${probeExact}`);
  console.log(`per-lead probe match strong: ${probeStrong}`);
  console.log(`per-lead probe review_required: ${probeReview}`);

  const readyRows = await prisma.restaurantLead.findMany({
    where: readyForOutreachWhere(),
    select: {
      id: true,
      restaurantName: true,
      outreachNotes: true,
      salesStatus: true,
    },
  });
  const readyCount = readyRows.filter((row) => !isClosedOrHoldRestaurant(row)).length;
  console.log(`\nREADY FOR OUTREACH count (no write): ${readyCount}`);
  console.log("\nDONE — no RestaurantLead rows were modified.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
