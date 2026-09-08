import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getPrisma } from "../src/lib/admin/prisma";
import { listCompanies, listFilterOptions } from "../src/lib/admin/queries";
import { excludeLegacyRestaurantCompanies, legacyRestaurantCompanyWhere } from "../src/lib/admin/restaurant-industry";
import { getRestaurantLeadStats, listRestaurantLeads } from "../src/lib/admin/restaurant-leads";

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

async function main() {
  loadDotEnv();
  const prisma = getPrisma();
  const stats = await getRestaurantLeadStats();
  const listed = await listRestaurantLeads({ view: "top", pageSize: 100, page: 1 });
  const names = new Set(listed.rows.map((row) => row.restaurantName));
  const dupKey = await prisma.restaurantLead.groupBy({
    by: ["nameNorm", "districtNorm"],
    _count: { _all: true },
    having: { nameNorm: { _count: { gt: 1 } } },
  });
  const legacy = await prisma.company.count({ where: legacyRestaurantCompanyWhere() });
  const visibleCompanies = await listCompanies({ page: 1 });
  const options = await listFilterOptions();
  const visibleNames = new Set(
    (
      await prisma.company.findMany({
        where: excludeLegacyRestaurantCompanies({ archivedAt: null }),
        select: { companyName: true },
      })
    ).map((row) => row.companyName),
  );
  const samples = ["Loss Garden", "Nakkaş Kebap", "MOSTAR BOSNA RESTAURANT", "ASF Gurme", "Morn Kadıköy"];
  const found = samples.filter((name) =>
    [...names].some((row) => row.toLocaleLowerCase("tr").includes(name.toLocaleLowerCase("tr"))),
  );
  const hiddenRestaurantCompanies = listed.rows
    .filter((lead) => visibleNames.has(lead.restaurantName))
    .map((row) => row.restaurantName);

  console.log(
    JSON.stringify(
      {
        restaurantLead: stats.total,
        noWebsite: stats.noWebsite,
        websiteProblems: stats.websiteProblem,
        notVerified: stats.needsVerification,
        high: stats.highPriority,
        listed: listed.total,
        listedRows: listed.rows.length,
        duplicateGroups: dupKey.length,
        legacyRestaurantCompanies: legacy,
        visibleCompanyTotal: visibleCompanies.total,
        industries: options.industries,
        sampleFound: found,
        overlapWithVisibleCompanies: hiddenRestaurantCompanies,
      },
      null,
      2,
    ),
  );

  if (stats.total !== 100) throw new Error(`RestaurantLead !== 100 (${stats.total})`);
  if (stats.noWebsite !== 51) throw new Error(`NO_WEBSITE !== 51 (${stats.noWebsite})`);
  if (stats.websiteProblem !== 34) throw new Error(`Website Problems !== 34 (${stats.websiteProblem})`);
  if (stats.needsVerification !== 2) throw new Error(`NOT_VERIFIED !== 2 (${stats.needsVerification})`);
  if (stats.highPriority !== 79) throw new Error(`HIGH !== 79 (${stats.highPriority})`);
  if (dupKey.length !== 0) throw new Error(`Duplicate groups ${dupKey.length}`);
  if (listed.rows.length !== 100) throw new Error(`List rows !== 100 (${listed.rows.length})`);
  if (found.length !== samples.length) {
    throw new Error(
      `Missing samples: ${samples.filter((name) => !found.includes(name)).join(", ")} | have=${[...names].filter((n) => /loss|nakka|garden/i.test(n)).join(" | ")}`,
    );
  }
  if (hiddenRestaurantCompanies.length) {
    throw new Error(`Restaurant leads still visible as companies: ${hiddenRestaurantCompanies.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
