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

async function main() {
  const prisma = new PrismaClient();
  const after = await prisma.restaurantLead.findMany();
  console.log("count", after.length);
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

  for (const [index, lead] of top.entries()) {
    console.log(
      [
        index + 1,
        lead.restaurantName,
        lead.district,
        lead.phone,
        lead.website ?? "-",
        lead.websiteStatus,
        lead.leadScore,
        lead.instagram ? "IG" : "-",
        lead.googleMapsUrl ? "Maps" : "-",
        lead.problem1,
        lead.websiteAnalysis,
        lead.salkayPitch,
      ].join(" || "),
    );
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
