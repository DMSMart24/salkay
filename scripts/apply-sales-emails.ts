import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import {
  assertRestaurantSalesCopySafe,
  buildRestaurantSalesEmail,
  canBuildRestaurantSalesEmail,
} from "../src/lib/admin/restaurant-sales-email";

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

async function main() {
  loadDotEnv();
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL missing");
  const prisma = getPrisma();
  const leads = await prisma.restaurantLead.findMany({ orderBy: { restaurantName: "asc" } });

  const sales = leads.filter((row) => canBuildRestaurantSalesEmail(row));
  const skipped = leads.filter((row) => !canBuildRestaurantSalesEmail(row));
  const failed: string[] = [];
  const unsafe: string[] = [];
  const byType = { NO_WEBSITE_EMAIL: 0, WEBSITE_PROBLEM_EMAIL: 0 };
  const withRecipient: string[] = [];
  const jargon: string[] = [];

  for (const lead of sales) {
    const draft = buildRestaurantSalesEmail(lead, 0);
    if (!draft) {
      failed.push(`${lead.restaurantName} — ${lead.district}`);
      continue;
    }
    byType[draft.emailType] += 1;
    if (draft.recipient) withRecipient.push(`${lead.restaurantName} <${draft.recipient}>`);
    const hits = assertRestaurantSalesCopySafe(
      draft.emailType,
      `${draft.subject}\n${draft.plainText}\n${draft.html}`,
      lead.leadScore,
    );
    if (hits.length) unsafe.push(`${lead.restaurantName}: ${hits.join(", ")}`);
    if (
      /public e-posta|DNS NXDOMAIN|user-scalable|i\.pravatar|html lang|Create React App|Hello Elementor|WordPress \d|jQuery /i.test(
        `${draft.subject}\n${draft.plainText}`,
      )
    ) {
      jargon.push(lead.restaurantName);
    }
  }

  console.log(
    JSON.stringify(
      {
        total: leads.length,
        sales: sales.length,
        skipped: skipped.map((row) => `${row.restaurantName} [${row.websiteStatus}/${row.priority}]`),
        byType,
        failed,
        unsafe,
        recipientCount: withRecipient.length,
        withRecipient,
        jargon,
        skippedCount: skipped.length,
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
