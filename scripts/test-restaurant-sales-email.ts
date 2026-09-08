import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { RestaurantLead } from "@prisma/client";
import { RESTAURANT_SALES_EMAIL_MARK } from "../src/lib/admin/email/templates/restaurant-sales";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import {
  NO_WEBSITE_CTA,
  WEBSITE_PROBLEM_CTA,
  assertRestaurantSalesCopySafe,
  buildRestaurantSalesEmail,
  canBuildRestaurantSalesEmail,
  parseSalesEmailVariant,
  restaurantSalesEmailCopyPack,
} from "../src/lib/admin/restaurant-sales-email";

function pass(name: string) {
  console.log(`ok  ${name}`);
}

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

function baseLead(overrides: Partial<RestaurantLead> = {}): RestaurantLead {
  return {
    id: "lead_demo",
    restaurantName: "Demo Restoran",
    nameNorm: "demo restoran",
    district: "Kadıköy",
    districtNorm: "kadıköy",
    region: "ANADOLU",
    neighborhood: null,
    address: null,
    website: null,
    websiteDomain: null,
    websiteStatus: "NO_WEBSITE",
    websiteScore: null,
    leadScore: 8.8,
    priority: "HIGH",
    publicEmail: null,
    phone: "+90 216 000 00 00",
    whatsapp: null,
    instagram: null,
    googleMapsUrl: "https://maps.app.goo.gl/x",
    googleRating: 4.6,
    googleReviewCount: 120,
    category: "Restoran",
    problem1: null,
    problem2: null,
    problem3: null,
    websiteAnalysis: null,
    opportunities: "WEBSITE_NEW, DIGITAL_MENU, RESERVATION_FLOW",
    salkayPitch: null,
    source: null,
    dateChecked: null,
    contactStatus: "NOT_CONTACTED",
    salesStatus: "NEW",
    lastContactAt: null,
    nextFollowUpAt: null,
    contactAttempts: 0,
    outreachNotes: null,
    isFinalTop20: false,
    finalRank: null,
    createdAt: new Date("2026-09-03"),
    updatedAt: new Date("2026-09-03"),
    ...overrides,
  };
}

assert.equal(canBuildRestaurantSalesEmail(baseLead({ websiteStatus: "NOT_VERIFIED", priority: "PENDING" })), false);
assert.equal(canBuildRestaurantSalesEmail(baseLead({ websiteStatus: "GOOD", priority: "QUALIFIED_OUT" })), false);
assert.equal(canBuildRestaurantSalesEmail(baseLead({ websiteStatus: "VERY_GOOD", priority: "HIGH" })), false);
assert.equal(canBuildRestaurantSalesEmail(baseLead({ websiteStatus: "WEAK", priority: "QUALIFIED_OUT" })), false);
assert.equal(buildRestaurantSalesEmail(baseLead({ websiteStatus: "NOT_VERIFIED", priority: "PENDING" })), null);
pass("NOT_VERIFIED / GOOD / VERY_GOOD / QUALIFIED_OUT do not get sales drafts");

const mostar = buildRestaurantSalesEmail(
  baseLead({
    restaurantName: "MOSTAR BOSNA RESTAURANT",
    district: "Pendik",
    neighborhood: "Yeni",
    category: "Restoran / Balkan mutfağı",
    websiteStatus: "NO_WEBSITE",
    leadScore: 9,
    googleRating: 4.8,
    googleReviewCount: 146,
    phone: "+90 535 669 16 75",
  }),
);
assert.ok(mostar);
assert.equal(mostar?.emailType, "NO_WEBSITE_EMAIL");
assert.equal(mostar?.subject, "MOSTAR BOSNA RESTAURANT için hazırladığımız dijital fikir");
assert.equal(mostar?.cta, NO_WEBSITE_CTA);
assert.equal(mostar?.recipient, null);
assert.ok(mostar?.plainText.includes("Pendik"));
assert.ok(mostar?.plainText.includes("4,8"));
assert.ok(mostar?.plainText.includes("146"));
assert.ok(mostar?.plainText.includes("Bosna"));
assert.equal(mostar?.plainText.includes("siteniz eski"), false);
assert.equal(mostar?.html.includes("siteniz kötü"), false);
assert.equal(mostar?.html.includes("unsubscribe"), false);
assert.equal(mostar?.html.includes("utm_"), false);
assert.ok(mostar?.html.includes(RESTAURANT_SALES_EMAIL_MARK));
assert.equal(assertRestaurantSalesCopySafe("NO_WEBSITE_EMAIL", `${mostar?.subject}\n${mostar?.plainText}\n${mostar?.html}`, 9).length, 0);
pass("NO_WEBSITE Mostar draft is personalized, has no recipient, no tracking");

const pusula = buildRestaurantSalesEmail(
  baseLead({
    restaurantName: "Pusula Mezze Balık",
    district: "Maltepe",
    category: "Balık restoranı",
    websiteStatus: "NO_WEBSITE",
    leadScore: 8.9,
    googleRating: 4.7,
    googleReviewCount: 1262,
    phone: "+90 543 325 53 80",
  }),
);
assert.ok(pusula);
assert.ok(pusula?.plainText.includes("1.262") || pusula?.plainText.includes("1262"));
assert.notEqual(mostar?.plainText, pusula?.plainText);
assert.equal(pusula?.plainText.includes("mevcut sitenizi yenileyelim"), false);
pass("NO_WEBSITE drafts differ by restaurant and avoid redesign copy");

const loss = buildRestaurantSalesEmail(
  baseLead({
    restaurantName: "Loss Garden Cafe & Restaurant",
    district: "Maltepe",
    neighborhood: "Zümrütevler",
    category: "Cafe restaurant",
    websiteStatus: "VERY_WEAK",
    website: "https://lossgarden.com/",
    websiteDomain: "lossgarden.com",
    websiteScore: 1.3,
    leadScore: 9.4,
    googleRating: 4.3,
    googleReviewCount: 455,
    problem1: "Canlı ana sayfa başlığı “Ultimate Blogging Championship”; restoran adı yok.",
    problem2: "Tek yazı “Hello world! Welcome to WordPress. This is your first post.” (31 Ağustos 2026).",
    problem3: "Nav Sample Page, Blog, About, FAQs, Authors, Events, Shop, Patterns, Themes; menü/rezervasyon/iletişim yok.",
  }),
);
assert.ok(loss);
assert.equal(loss?.emailType, "WEBSITE_PROBLEM_EMAIL");
assert.equal(loss?.cta, WEBSITE_PROBLEM_CTA);
assert.ok(loss?.plainText.includes("Ultimate Blogging Championship"));
assert.ok(loss?.plainText.includes("Hello world!"));
assert.ok(loss?.plainText.includes("lossgarden.com"));
assert.equal(loss?.plainText.toLocaleLowerCase("tr").includes("sitenizi geliştirebiliriz"), false);
assert.equal(loss?.recipient, null);
assert.equal(assertRestaurantSalesCopySafe("WEBSITE_PROBLEM_EMAIL", `${loss?.plainText}\n${loss?.html}`, 9.4).length, 0);
pass("WEBSITE_PROBLEM Loss Garden uses live WordPress facts, not generic copy");

const nakkas = buildRestaurantSalesEmail(
  baseLead({
    restaurantName: "Nakkaş Kebap Nakkaştepe",
    district: "Üsküdar",
    neighborhood: "Kuzguncuk",
    category: "Kebap restoranı",
    websiteStatus: "VERY_WEAK",
    website: "https://nakkaskebap.com/",
    websiteDomain: "nakkaskebap.com",
    websiteScore: 2.6,
    leadScore: 9.1,
    instagram: "https://www.instagram.com/nakkaskebap",
    googleRating: 4.2,
    googleReviewCount: 3706,
    problem1: "Ana sayfada Lorem ipsum ve İngilizce demo menü (King Prawns, Carbonara, Fajitas) yayında; Nakkaş kebap menüsü değil.",
    problem2: "İletişim/contact sayfası WordPress PHP hatası veriyor (500).",
    problem3: "Şube sayısı metinde üç, listede iki; Göztepe/Feneryolu/Çekmeköy bilgisi tutarsız.",
  }),
);
assert.ok(nakkas);
assert.ok(nakkas?.plainText.includes("Lorem ipsum"));
assert.ok(nakkas?.plainText.includes("King Prawns"));
assert.ok(nakkas?.plainText.includes("İletişim sayfası"));
assert.ok(nakkas?.personalization.instagram);
assert.notEqual(loss?.plainText, nakkas?.plainText);
assert.equal(nakkas?.plainText.includes("9,1"), false);
assert.equal(nakkas?.html.includes("9.1"), false);
assert.equal(nakkas?.plainText.includes("(500)"), false);
pass("WEBSITE_PROBLEM Nakkaş uses demo-menu facts and hides leadScore");

const wordpressOld = buildRestaurantSalesEmail(
  baseLead({
    restaurantName: "Ataşehir Çınaraltı Mangalbaşı",
    district: "Ataşehir",
    websiteStatus: "WEAK",
    website: "https://atasehircinaralti.com/",
    websiteDomain: "atasehircinaralti.com",
    problem1: "WordPress 4.6.29 yayında; yıllardır güncellenmemiş çekirdek.",
    problem2: "Public e-posta yok; iletişim yalnızca telefon.",
  }),
);
assert.ok(wordpressOld);
assert.equal(wordpressOld?.plainText.includes("4.6.29"), false);
assert.equal(wordpressOld?.plainText.toLocaleLowerCase("tr").includes("public e-posta"), false);
assert.ok(wordpressOld?.plainText.includes("eski"));
pass("WEBSITE_PROBLEM rewrites WordPress version and skips internal email notes");

const unrelated500 = buildRestaurantSalesEmail(
  baseLead({
    restaurantName: "Sembol Ocakbaşı Çamlıca",
    district: "Üsküdar",
    websiteStatus: "WEAK",
    website: "https://sembolocakbasi.com.tr/",
    websiteDomain: "sembolocakbasi.com.tr",
    problem1: "Çamlıca şube sayfası uzun metin duvarı; rezervasyon ve menü ilk ekranda yok.",
    problem2: "QR menü (qr.sembolocakbasi.com/camlica) PHP hatası basıyor.",
  }),
);
assert.ok(unrelated500);
assert.ok(unrelated500?.plainText.includes("QR menü"));
assert.equal(unrelated500?.plainText.includes("İletişim sayfası şu anda açılmıyor"), false);
assert.equal(unrelated500?.plainText.includes("PHP hatası"), false);
pass("PHP/QR errors do not reuse the contact-page 500 sentence");

assert.ok(
  restaurantSalesEmailCopyPack(mostar!).startsWith("Konu: MOSTAR BOSNA RESTAURANT için hazırladığımız dijital fikir"),
);
pass("Copy pack prefixes subject for CRM list paste");

const variant1 = buildRestaurantSalesEmail(
  baseLead({
    restaurantName: "MOSTAR BOSNA RESTAURANT",
    district: "Pendik",
    category: "Restoran / Balkan mutfağı",
    websiteStatus: "NO_WEBSITE",
    googleRating: 4.8,
    googleReviewCount: 146,
  }),
  1,
);
assert.ok(variant1);
assert.equal(variant1?.variant, 1);
assert.ok(variant1?.plainText.includes("MOSTAR BOSNA RESTAURANT"));
assert.ok(variant1?.plainText.includes("4,8"));
assert.notEqual(variant1?.plainText, mostar?.plainText);
assert.equal(parseSalesEmailVariant("2"), 2);
pass("Regenerate cycles phrasing without inventing new facts");

async function testDbDemos() {
  loadDotEnv();
  if (!isDatabaseConfigured()) {
    console.log("skip DB sales-email demos (DATABASE_URL missing)");
    return;
  }
  const prisma = getPrisma();
  const names = [
    "MOSTAR BOSNA RESTAURANT",
    "Pusula Mezze Balık",
    "Loss Garden Cafe & Restaurant",
    "Nakkaş Kebap Nakkaştepe",
  ];
  const rows = await prisma.restaurantLead.findMany({ where: { restaurantName: { in: names } } });
  assert.equal(rows.length, 4);
  for (const row of rows) {
    const draft = buildRestaurantSalesEmail(row, 0);
    assert.ok(draft, row.restaurantName);
    assert.equal(draft?.recipient, row.publicEmail);
    assert.equal(assertRestaurantSalesCopySafe(draft!.emailType, `${draft!.subject}\n${draft!.plainText}\n${draft!.html}`, row.leadScore).length, 0);
  }
  pass("DB: four demo leads render safe sales emails");

  const all = await prisma.restaurantLead.findMany();
  const sales = all.filter((row) => canBuildRestaurantSalesEmail(row));
  const skipped = all.filter((row) => !canBuildRestaurantSalesEmail(row));
  assert.equal(sales.length + skipped.length, all.length);
  assert.ok(sales.length > 0);
  let recipientCount = 0;
  for (const row of sales) {
    const draft = buildRestaurantSalesEmail(row, 0);
    assert.ok(draft, `${row.restaurantName} — ${row.district}`);
    assert.equal(
      assertRestaurantSalesCopySafe(draft.emailType, `${draft.subject}\n${draft.plainText}\n${draft.html}`, row.leadScore)
        .length,
      0,
      row.restaurantName,
    );
    assert.equal(draft.plainText.toLocaleLowerCase("tr").includes("public e-posta yok"), false, row.restaurantName);
    assert.equal(draft.plainText.includes("DNS NXDOMAIN"), false, row.restaurantName);
    if (draft.recipient) recipientCount += 1;
  }
  assert.equal(recipientCount, sales.filter((row) => Boolean(row.publicEmail)).length);
  pass(`DB: ${sales.length} sales drafts safe; ${skipped.length} skipped; ${recipientCount} recipients`);
  await prisma.$disconnect();
}

testDbDemos()
  .then(() => {
    console.log("\nAll restaurant sales email checks passed.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
