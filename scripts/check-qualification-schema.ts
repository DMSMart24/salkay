import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const names = [
  "Forchetta Kadıköy",
  "BİNA Kadıköy",
  "Salve Cafe Kadıköy",
  "Cafe de Kadıköy",
  "Tuzda Balık Restaurant",
  "Barbun Balık Restaurant",
  "Maltepe Garden Cafe Restaurant",
  "Ataşehir Mey",
  "Kuzu Kadıköy",
  "Köz Kanat Ataşehir",
  "Hanedan Ocakbaşı",
  "Ikaria Balık Restaurant",
  "Sembol Künefe",
  "Mojo Ataşehir",
  "Ekol Künefe",
  "Adile Sultan Ev Yemekleri",
  "Nazar Profiterol",
];

async function main() {
  const columns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'Company'
      AND column_name IN (
        'websiteScore','leadScore','scoreDesign','scoreMobile','scoreUx',
        'scoreConversion','scoreTechnical','scoreSeo','opportunities',
        'salesPitch','instagram'
      )
    ORDER BY column_name
  `;
  const enumValues = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
    SELECT e.enumlabel
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'WebsiteStatus'
    ORDER BY e.enumsortorder
  `;
  const companies = await prisma.company.findMany({
    where: { OR: names.map((companyName) => ({ companyName: { equals: companyName, mode: "insensitive" } })) },
    select: {
      companyName: true,
      district: true,
      websiteStatus: true,
      websiteScore: true,
      leadScore: true,
      generalEmail: true,
      opportunities: true,
      notes: true,
    },
    orderBy: { companyName: "asc" },
  });
  const koz = await prisma.company.findMany({
    where: { companyName: { contains: "Köz Kanat", mode: "insensitive" } },
    select: { companyName: true, id: true },
  });
  const adile = companies.filter((row) => row.companyName.toLocaleLowerCase("tr").includes("adile"));
  const recentEmails = await prisma.emailMessage.count({
    where: { createdAt: { gte: new Date("2026-09-01T16:00:00.000Z") }, status: "SENT" },
  });
  const recentCampaigns = await prisma.campaign.count({
    where: { updatedAt: { gte: new Date("2026-09-01T16:00:00.000Z") }, status: { in: ["SENDING", "COMPLETED"] } },
  });

  console.log(
    JSON.stringify(
      {
        columns,
        websiteStatusValues: enumValues.map((row) => row.enumlabel),
        found: companies.length,
        names: companies.map((row) => ({
          restaurant: row.companyName,
          district: row.district,
          websiteStatus: row.websiteStatus,
          websiteScore: row.websiteScore,
          leadScore: row.leadScore,
          email: row.generalEmail ? "SET" : null,
          opportunity: row.opportunities.join(", "),
        })),
        kozCount: koz.length,
        kozNames: koz.map((row) => row.companyName),
        adileCount: adile.length,
        adileHasNotes: adile.some((row) => Boolean(row.notes)),
        emailsSentSinceReleaseWindow: recentEmails,
        campaignsStartedSinceReleaseWindow: recentCampaigns,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "schema check failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
