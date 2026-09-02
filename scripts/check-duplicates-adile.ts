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
  const companies = await prisma.company.findMany({
    where: { OR: names.map((companyName) => ({ companyName: { equals: companyName, mode: "insensitive" } })) },
    select: { companyName: true, domain: true, phone: true, notes: true },
  });

  const phones = companies.map((row) => row.phone).filter((row): row is string => Boolean(row));
  const domains = companies.map((row) => row.domain).filter((row): row is string => Boolean(row));
  const phoneDup = phones.filter((item, index) => phones.indexOf(item) !== index);
  const domainDup = domains.filter((item, index) => domains.indexOf(item) !== index);
  const adile = companies.find((row) => row.companyName.includes("Adile"));
  const koz = await prisma.company.count({ where: { companyName: { contains: "Köz Kanat", mode: "insensitive" } } });

  console.log(
    JSON.stringify(
      {
        phoneDuplicates: [...new Set(phoneDup)],
        domainDuplicates: [...new Set(domainDup)],
        kozCount: koz,
        adileName: adile?.companyName ?? null,
        adileNotesHasLocations: /Kadıköy|Ümraniye|şube|standort|location/i.test(adile?.notes ?? ""),
        adileNoteLen: adile?.notes?.length ?? 0,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "check failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
