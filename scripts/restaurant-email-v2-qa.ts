import { writeFileSync, mkdirSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { renderPersonalizedEmail } from "../src/lib/admin/email/render";
import {
  RESTAURANT_TEMPLATE_NAME,
  RESTAURANT_TEMPLATE_SUBJECT,
} from "../src/lib/admin/email/templates/restaurant";

const prisma = new PrismaClient();
const outDir = ".tmp-qa/restaurant-v2";

async function renderCase(name: string) {
  const company = await prisma.company.findFirst({
    where: { companyName: { contains: name, mode: "insensitive" } },
    include: { contacts: true },
  });
  if (!company) throw new Error(`Missing company: ${name}`);
  const rendered = renderPersonalizedEmail({
    subject: RESTAURANT_TEMPLATE_SUBJECT,
    body: "preview",
    company,
    templateName: RESTAURANT_TEMPLATE_NAME,
    templateCategory: "RESTORAN",
  });
  return { company: company.companyName, ...rendered };
}

function countMatches(html: string, pattern: RegExp) {
  return html.match(pattern)?.length ?? 0;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const salve = await renderCase("Salve Cafe");
  const forchetta = await renderCase("Forchetta");
  const ikaria = await renderCase("Ikaria");

  writeFileSync(`${outDir}/salve.html`, salve.bodyHtml);
  writeFileSync(`${outDir}/forchetta.html`, forchetta.bodyHtml);
  writeFileSync(`${outDir}/ikaria.html`, ikaria.bodyHtml);

  const leak = /8,9|9,2|8,3|Lead Score|leadScore|A\+|high priority|ideal SALKAY/i;
  const report = {
    subject: {
      salve: salve.subject,
      forchetta: forchetta.subject,
      ikaria: ikaria.subject,
    },
    lengths: {
      salve: salve.bodyHtml.length,
      forchetta: forchetta.bodyHtml.length,
      ikaria: ikaria.bodyHtml.length,
    },
    salve: {
      digitalScore: salve.bodyHtml.includes("DİJİTAL WEB SKORU"),
      score25: salve.bodyHtml.includes("2,5"),
      bandGelistirilebilir: salve.bodyHtml.includes("GELİŞTİRİLEBİLİR"),
      bandZayif: /ZAYIF|Zayıf/.test(salve.bodyHtml),
      analysisCount: countMatches(salve.bodyHtml, /salkay-analysis-item/g),
      recCount: countMatches(salve.bodyHtml, /salkay-improve-item/g),
      ctaCount: countMatches(salve.bodyHtml, /class="salkay-cta-btn"/g),
      servicesSix: salve.bodyHtml.includes("SALKAY NELER SUNAR?"),
      brandLine: salve.bodyHtml.includes("Web Tasarım · Yazılım · Yapay Zekâ · Dijital Büyüme"),
      restaurantLine: salve.bodyHtml.includes("Restoranlar için Web Tasarım"),
      recHeading: salve.bodyHtml.includes("SİZİN İÇİN ÖNERDİĞİMİZ GELİŞTİRMELER"),
      heroCopy: salve.bodyHtml.includes("güçlü bir dijital vitrinle başlar"),
      scoreSize: /font-size:52px/.test(salve.bodyHtml),
      leak: leak.test(salve.bodyHtml),
      unresolved: salve.unresolved,
      undefinedText: /undefined|\[object Object\]|NaN/.test(salve.bodyHtml),
    },
    forchetta: {
      digitalScore: forchetta.bodyHtml.includes("DİJİTAL WEB SKORU"),
      scoreNumber: /\/\s*10/.test(forchetta.bodyHtml) && forchetta.bodyHtml.includes("DİJİTAL WEB SKORU"),
      opportunity: forchetta.bodyHtml.includes("DİJİTAL FIRSAT"),
      noWebsite: forchetta.bodyHtml.includes("Bağımsız web sitesi bulunamadı"),
      recCount: countMatches(forchetta.bodyHtml, /salkay-improve-item/g),
      leak: leak.test(forchetta.bodyHtml),
      unresolved: forchetta.unresolved,
    },
    ikaria: {
      scoreNumber: /DİJİTAL WEB SKORU/.test(ikaria.bodyHtml) && /\/\s*10/.test(ikaria.bodyHtml),
      fakeWeak: /web siteniz zayıf/i.test(ikaria.bodyHtml),
      notVerifiedCopy: ikaria.bodyHtml.includes("değerlendirebileceğimiz geliştirme fırsatları"),
      leak: leak.test(ikaria.bodyHtml),
      unresolved: ikaria.unresolved,
    },
  };
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "qa failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
