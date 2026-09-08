import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

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

async function main() {
  const prisma = new PrismaClient();
  const [total, nv, scored, webScored, pending, nc, email, site, ig, maps, opp, staleWebsite] =
    await Promise.all([
      prisma.restaurantLead.count(),
      prisma.restaurantLead.count({ where: { websiteStatus: "NOT_VERIFIED" } }),
      prisma.restaurantLead.count({ where: { leadScore: { not: null } } }),
      prisma.restaurantLead.count({ where: { websiteScore: { not: null } } }),
      prisma.restaurantLead.count({ where: { priority: "PENDING" } }),
      prisma.restaurantLead.count({ where: { contactStatus: "NOT_CONTACTED" } }),
      prisma.restaurantLead.count({ where: { publicEmail: { not: null } } }),
      prisma.restaurantLead.count({ where: { website: { not: null } } }),
      prisma.restaurantLead.count({ where: { instagram: { not: null } } }),
      prisma.restaurantLead.count({ where: { googleMapsUrl: { not: null } } }),
      prisma.restaurantLead.count({ where: { opportunities: { not: null } } }),
      prisma.restaurantLead.count({
        where: { website: { contains: "NOT_RESEARCHED", mode: "insensitive" } },
      }),
    ]);
  const sample = await prisma.restaurantLead.findMany({
    take: 3,
    orderBy: { restaurantName: "asc" },
    select: {
      restaurantName: true,
      district: true,
      neighborhood: true,
      websiteStatus: true,
      websiteScore: true,
      leadScore: true,
      priority: true,
      contactStatus: true,
      publicEmail: true,
      website: true,
      instagram: true,
      googleMapsUrl: true,
      opportunities: true,
    },
  });
  console.log(
    JSON.stringify(
      {
        total,
        nv,
        scored,
        webScored,
        pending,
        nc,
        email,
        site,
        ig,
        maps,
        opp,
        staleWebsite,
        sample,
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
