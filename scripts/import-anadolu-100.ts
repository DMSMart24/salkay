import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  attachRestaurantLeadDuplicates,
  isImportableLead,
  parseRestaurantLeadXlsx,
  summarizeRestaurantLeadPreview,
  type RestaurantLeadPreviewRow,
} from "../src/lib/admin/restaurant-leads-import";
import { isDatabaseConfigured } from "../src/lib/admin/prisma";
import { getPrisma } from "../src/lib/admin/prisma";
import { sanitizeRestaurantLeadWrite } from "../src/lib/admin/restaurant-leads";

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

const FILE_NAMES = [
  "SALKAY_Anadolu_100_Restaurant_Candidates.xlsx",
  "SALKAY_Anadolu_100_Restaurant_Candidates (1).xlsx",
];

function findWorkbook() {
  const explicit = process.argv.find((arg) => arg.endsWith(".xlsx") || arg.endsWith(".xls"));
  if (explicit && existsSync(explicit)) return explicit;

  const roots = [
    process.cwd(),
    path.join(process.cwd(), "data"),
    path.join(process.cwd(), "scripts"),
    path.join(process.env.USERPROFILE ?? "", "Desktop"),
    path.join(process.env.USERPROFILE ?? "", "Downloads"),
    path.join(process.env.USERPROFILE ?? "", "Documents"),
    path.join(process.env.USERPROFILE ?? "", "Desktop", "Salkay"),
  ];
  for (const root of roots) {
    for (const name of FILE_NAMES) {
      const candidate = path.join(root, name);
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

function inFileDuplicates(rows: Awaited<ReturnType<typeof parseRestaurantLeadXlsx>>["rows"]): RestaurantLeadPreviewRow[] {
  const seen = new Map<string, (typeof rows)[number]>();
  return rows.map((row) => {
    const key = `${row.nameNorm}|${row.districtNorm}`;
    const previous = seen.get(key);
    if (row.nameNorm && row.districtNorm) {
      seen.set(key, previous ?? row);
    }
    if (previous) {
      return {
        ...row,
        duplicate: {
          id: "",
          restaurantName: previous.restaurantName,
          district: previous.district,
          reason: "in_file",
        },
      };
    }
    return { ...row, duplicate: null };
  });
}

async function main() {
  const confirm = process.argv.includes("--confirm");
  const filePath = findWorkbook();
  if (!filePath) {
    console.error("Excel bulunamadı: SALKAY_Anadolu_100_Restaurant_Candidates.xlsx");
    console.error("Dosyayı proje köküne, Desktop veya Downloads klasörüne koyun.");
    process.exit(2);
  }

  console.log(`Dosya: ${filePath}`);
  const parsed = await parseRestaurantLeadXlsx(readFileSync(filePath));
  if (parsed.parseError) {
    console.error(parsed.parseError);
    process.exit(1);
  }

  const preview = isDatabaseConfigured()
    ? await attachRestaurantLeadDuplicates(parsed.rows)
    : inFileDuplicates(parsed.rows);
  const stats = summarizeRestaurantLeadPreview(preview);

  console.log("\n=== Import preview ===");
  console.log(`Excel total rows: ${stats.total}`);
  console.log(`Valid rows: ${stats.valid}`);
  console.log(`New leads: ${stats.newLeads}`);
  console.log(`Duplicates: ${stats.duplicates}`);
  console.log(`Invalid rows: ${stats.invalid}`);
  console.log(`NOT_VERIFIED count: ${stats.notVerified}`);
  console.log(`Missing leadScore count: ${stats.missingLeadScore}`);

  const invalid = preview.filter((row) => row.errors.length > 0);
  if (invalid.length) {
    console.log("\nInvalid rows:");
    for (const row of invalid) {
      console.log(`  #${row.index} ${row.restaurantName || "—"} / ${row.district || "—"}: ${row.errors.join(", ")}`);
    }
  }

  if (!confirm) {
    console.log("\nImport yazılmadı. Yazmak için: npx tsx scripts/import-anadolu-100.ts --confirm");
    if (!isDatabaseConfigured()) {
      console.log("DATABASE_URL tanımlı değil; confirm için .env gerekli.");
    }
    return;
  }

  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL yok; import yazılamadı.");
    process.exit(1);
  }

  const importable = preview.filter(isImportableLead);
  const data = importable.map((row) => sanitizeRestaurantLeadWrite(row));
  const result = await getPrisma().restaurantLead.createMany({
    data,
    skipDuplicates: true,
  });
  const created = result.count;

  const total = await getPrisma().restaurantLead.count();
  const notVerified = await getPrisma().restaurantLead.count({ where: { websiteStatus: "NOT_VERIFIED" } });
  console.log("\n=== Import result ===");
  console.log(`Added from this file: ${created}`);
  console.log(`Duplicates skipped: ${stats.duplicates}`);
  console.log(`Invalid rows: ${stats.invalid}`);
  console.log(`RestaurantLead total: ${total}`);
  console.log(`NOT_VERIFIED in database: ${notVerified}`);
  await getPrisma().$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
