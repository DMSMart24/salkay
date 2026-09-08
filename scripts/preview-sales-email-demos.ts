import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import { buildRestaurantSalesEmail } from "../src/lib/admin/restaurant-sales-email";

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

const NAMES = [
  "MOSTAR BOSNA RESTAURANT",
  "Pusula Mezze Balık",
  "Loss Garden Cafe & Restaurant",
  "Nakkaş Kebap Nakkaştepe",
];

async function main() {
  loadDotEnv();
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL missing");
  const prisma = getPrisma();
  const rows = await prisma.restaurantLead.findMany({ where: { restaurantName: { in: NAMES } } });
  const ordered = NAMES.map((name) => rows.find((row) => row.restaurantName === name));
  for (const row of ordered) {
    if (!row) throw new Error("Missing demo lead");
    const draft = buildRestaurantSalesEmail(row, 0);
    if (!draft) throw new Error(`No draft for ${row.restaurantName}`);
    console.log("\n==========");
    console.log(JSON.stringify(
      {
        restaurantName: row.restaurantName,
        emailType: draft.emailType,
        subject: draft.subject,
        cta: draft.cta,
        recipient: draft.recipient,
        personalization: draft.personalization,
        plainText: draft.plainText,
      },
      null,
      2,
    ));
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
