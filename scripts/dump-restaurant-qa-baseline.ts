import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function loadDotEnv() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), name);
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

async function main() {
  const prisma = new PrismaClient();
  const leads = await prisma.restaurantLead.findMany({
    orderBy: [{ region: "asc" }, { restaurantName: "asc" }],
  });
  console.log("COUNT", leads.length);

  const byStatus: Record<string, number> = {};
  const byPrio: Record<string, number> = {};
  const byRegionPrio: Record<string, Record<string, number>> = { ANADOLU: {}, AVRUPA: {} };
  let emptyAnalysis = 0;
  let noUrl = 0;
  let unverifiedNoUrl = 0;
  let unverifiedWithUrl = 0;

  for (const lead of leads) {
    byStatus[lead.websiteStatus] = (byStatus[lead.websiteStatus] ?? 0) + 1;
    byPrio[lead.priority] = (byPrio[lead.priority] ?? 0) + 1;
    byRegionPrio[lead.region][lead.priority] = (byRegionPrio[lead.region][lead.priority] ?? 0) + 1;
    if (!lead.websiteAnalysis) emptyAnalysis += 1;
    if (!lead.website) noUrl += 1;
    if (lead.websiteStatus === "NOT_VERIFIED" && !lead.website) unverifiedNoUrl += 1;
    if (lead.websiteStatus === "NOT_VERIFIED" && lead.website) unverifiedWithUrl += 1;
  }

  console.log(
    JSON.stringify(
      {
        byStatus,
        byPrio,
        byRegionPrio,
        emptyAnalysis,
        noUrl,
        unverifiedNoUrl,
        unverifiedWithUrl,
        anadolu: leads.filter((lead) => lead.region === "ANADOLU").length,
        avrupa: leads.filter((lead) => lead.region === "AVRUPA").length,
      },
      null,
      2,
    ),
  );

  const probePath = path.join(process.cwd(), "tmp/restaurant-website-probe.json");
  const probe = JSON.parse(readFileSync(probePath, "utf8")) as Array<{
    restaurantName: string;
    district: string;
    region: string;
    phone: string | null;
    current: {
      website: string | null;
      websiteStatus: string;
      websiteScore: number | null;
      leadScore: number | null;
      priority: string;
      websiteAnalysis: string | null;
    };
    probe: {
      kind: string;
      status: number | null;
      title: string | null;
      error: string | null;
      signals: string[];
      excerpt: string;
      host: string | null;
      finalUrl: string | null;
    };
  }>;

  const kinds: Record<string, number> = {};
  for (const row of probe) kinds[row.probe.kind] = (kinds[row.probe.kind] ?? 0) + 1;
  console.log("PROBE count", probe.length, kinds);

  const unverifiedWithUrlRows = probe.filter(
    (row) => row.current.websiteStatus === "NOT_VERIFIED" && row.current.website,
  );
  console.log("\n=== NOT_VERIFIED with URL ===");
  for (const row of unverifiedWithUrlRows) {
    console.log(
      `${row.region} | ${row.restaurantName} | ${row.district} | ${row.current.website} | kind=${row.probe.kind} status=${row.probe.status} title=${row.probe.title} err=${row.probe.error} signals=${row.probe.signals.join(",")}`,
    );
  }

  console.log("\n=== dead / placeholder / social / directory ===");
  for (const row of probe.filter((item) =>
    ["dead", "placeholder", "social", "directory", "parking", "redirect-social"].includes(item.probe.kind),
  )) {
    console.log(
      `${row.current.websiteStatus} | ${row.restaurantName} | ${row.district} | ${row.current.website} | kind=${row.probe.kind} http=${row.probe.status} title=${row.probe.title} err=${row.probe.error}`,
    );
  }

  console.log("\n=== GOOD / VERY_GOOD with URL ===");
  for (const row of probe.filter((item) =>
    ["GOOD", "VERY_GOOD"].includes(item.current.websiteStatus),
  )) {
    console.log(
      `${row.current.websiteStatus} prio=${row.current.priority} score=${row.current.websiteScore} | ${row.restaurantName} | ${row.current.website} | kind=${row.probe.kind} http=${row.probe.status} title=${row.probe.title} signals=${row.probe.signals.join(",")}`,
    );
  }

  const outDir = path.join(process.cwd(), "tmp");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    path.join(outDir, "restaurant-qa-baseline.json"),
    JSON.stringify(
      {
        count: leads.length,
        byStatus,
        byPrio,
        byRegionPrio,
        emptyAnalysis,
        noUrl,
        unverifiedNoUrl,
        unverifiedWithUrl,
        leads: leads.map((lead) => ({
          id: lead.id,
          restaurantName: lead.restaurantName,
          district: lead.district,
          region: lead.region,
          phone: lead.phone,
          whatsapp: lead.whatsapp,
          website: lead.website,
          websiteStatus: lead.websiteStatus,
          websiteScore: lead.websiteScore,
          leadScore: lead.leadScore,
          priority: lead.priority,
          problem1: lead.problem1,
          problem2: lead.problem2,
          problem3: lead.problem3,
          websiteAnalysis: lead.websiteAnalysis,
          opportunities: lead.opportunities,
          salkayPitch: lead.salkayPitch,
        })),
      },
      null,
      2,
    ),
  );
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
