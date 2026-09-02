import { PrismaClient } from "@prisma/client";
import { renderPersonalizedEmail } from "../src/lib/admin/email/render";
import { RESTAURANT_TEMPLATE_NAME, RESTAURANT_TEMPLATE_SUBJECT } from "../src/lib/admin/email/templates/restaurant";

const prisma = new PrismaClient();

async function preview(name: string) {
  const company = await prisma.company.findFirst({
    where: { companyName: { contains: name, mode: "insensitive" } },
    include: { contacts: true },
  });
  if (!company) return { name, found: false };
  const rendered = renderPersonalizedEmail({
    subject: RESTAURANT_TEMPLATE_SUBJECT,
    body: "preview",
    company,
    templateName: RESTAURANT_TEMPLATE_NAME,
    templateCategory: "RESTORAN",
  });
  return {
    name: company.companyName,
    websiteStatus: company.websiteStatus,
    websiteScore: company.websiteScore,
    leadScore: company.leadScore,
    hasDigitalScore: rendered.bodyHtml.includes("DİJİTAL WEB SKORU"),
    hasOpportunity: rendered.bodyHtml.includes("DİJİTAL FIRSAT"),
    hasNoWebsiteCopy: rendered.bodyHtml.includes("Bağımsız web sitesi bulunamadı"),
    hasDecimal: rendered.bodyHtml.includes("2,5"),
    hasBandZayif: rendered.bodyHtml.includes("Zayıf"),
    leakedLeadScore: /9,2|Lead Score|leadScore/i.test(rendered.bodyHtml),
    leakedFakeOne: /1 \/ 10|1\/10/.test(rendered.bodyHtml),
    unresolved: rendered.unresolved,
  };
}

async function main() {
  const salve = await preview("Salve Cafe");
  const forchetta = await preview("Forchetta");
  console.log(JSON.stringify({ salve, forchetta, emailsSent: 0 }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "preview failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
