import { existsSync, readFileSync } from "node:fs";
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

type BaselineLead = {
  id: string;
  restaurantName: string;
  district: string;
  region: string;
  phone: string | null;
  website: string | null;
  websiteStatus: string;
  websiteScore: number | null;
  leadScore: number | null;
  priority: string;
  websiteAnalysis: string | null;
};

async function main() {
  const prisma = new PrismaClient();
  const after = await prisma.restaurantLead.findMany();
  const baseline = JSON.parse(
    readFileSync(path.join(process.cwd(), "tmp/restaurant-qa-baseline.json"), "utf8"),
  ) as { count: number; leads: BaselineLead[] };
  const beforeById = new Map(baseline.leads.map((lead) => [lead.id, lead]));

  console.log("AFTER_COUNT", after.length);
  if (after.length !== 239) throw new Error("count drifted");
  if (baseline.count !== 239) throw new Error("baseline was not 239");

  let identityChanged = 0;
  let statusChanged = 0;
  let websiteScoreChanged = 0;
  let leadScoreChanged = 0;
  let analysisChanged = 0;
  let phoneChanged = 0;

  for (const lead of after) {
    const before = beforeById.get(lead.id);
    if (!before) throw new Error(`new lead ${lead.id}`);
    if (
      before.restaurantName !== lead.restaurantName ||
      before.district !== lead.district ||
      before.region !== lead.region
    ) {
      identityChanged += 1;
    }
    if (before.phone !== lead.phone) phoneChanged += 1;
    if (before.websiteStatus !== lead.websiteStatus) statusChanged += 1;
    if (before.websiteScore !== lead.websiteScore) websiteScoreChanged += 1;
    if (before.leadScore !== lead.leadScore) leadScoreChanged += 1;
    if (before.websiteAnalysis !== lead.websiteAnalysis) analysisChanged += 1;
  }
  if (after.length !== beforeById.size) throw new Error("id set mismatch");

  const byStatus: Record<string, number> = {};
  const byPrio: Record<string, number> = {};
  const highRegion: Record<string, number> = { ANADOLU: 0, AVRUPA: 0 };
  for (const lead of after) {
    byStatus[lead.websiteStatus] = (byStatus[lead.websiteStatus] ?? 0) + 1;
    byPrio[lead.priority] = (byPrio[lead.priority] ?? 0) + 1;
    if (lead.priority === "HIGH") highRegion[lead.region] += 1;
  }

  console.log(
    JSON.stringify(
      {
        identityChanged,
        phoneChanged,
        statusChanged,
        websiteScoreChanged,
        leadScoreChanged,
        scoreChangedEither: after.filter((lead) => {
          const before = beforeById.get(lead.id);
          return before && (before.websiteScore !== lead.websiteScore || before.leadScore !== lead.leadScore);
        }).length,
        analysisChanged,
        byStatus,
        byPrio,
        highRegion,
        anadolu: after.filter((lead) => lead.region === "ANADOLU").length,
        avrupa: after.filter((lead) => lead.region === "AVRUPA").length,
        emptyAnalysis: after.filter((lead) => !lead.websiteAnalysis).length,
      },
      null,
      2,
    ),
  );

  const top = after
    .filter(
      (lead) =>
        lead.region === "AVRUPA" &&
        lead.priority === "HIGH" &&
        Boolean(lead.phone || lead.whatsapp) &&
        ["NO_WEBSITE", "VERY_WEAK", "WEAK"].includes(lead.websiteStatus),
    )
    .sort((a, b) => {
      const rank = (status: string) =>
        status === "NO_WEBSITE" ? 0 : status === "VERY_WEAK" ? 1 : 2;
      const statusCmp = rank(a.websiteStatus) - rank(b.websiteStatus);
      if (statusCmp !== 0) return statusCmp;
      return (b.leadScore ?? 0) - (a.leadScore ?? 0);
    })
    .slice(0, 20);

  console.log("\n=== AVRUPA TOP 20 ===");
  for (const [index, lead] of top.entries()) {
    console.log(
      JSON.stringify({
        n: index + 1,
        name: lead.restaurantName,
        district: lead.district,
        phone: lead.phone,
        website: lead.website,
        websiteStatus: lead.websiteStatus,
        score: lead.leadScore,
        websiteScore: lead.websiteScore,
        problem1: lead.problem1,
        pitch: lead.salkayPitch,
        analysis: lead.websiteAnalysis,
      }),
    );
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
