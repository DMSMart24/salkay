import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { RestaurantLead } from "@prisma/client";
import {
  allowsWebsiteScore,
  compareFirstContactLeads,
  compareTop20OutreachLeads,
  listFirstContactRecommendations,
  phoneHref,
  restaurantLeadWhere,
  sanitizeRestaurantLeadWrite,
  whatsappHref,
} from "../src/lib/admin/restaurant-leads";
import {
  attachRestaurantLeadDuplicates,
  buildRestaurantLeadUpdatePatch,
  classifyRestaurantLeadImportRow,
  parseRestaurantLeadCsv,
  parseRestaurantLeadRow,
  parseRestaurantLeadXlsx,
  summarizeRestaurantLeadPreview,
} from "../src/lib/admin/restaurant-leads-import";
import { assertAvrupaDataset } from "./avrupa-100-dataset";
import { assertAvrupaContacts } from "./avrupa-100-contacts";
import {
  assertNoWebsiteCopySafe,
  assertWebsiteProblemCopySafe,
  blocksRestaurantSalesEmail,
  buildNoWebsiteOpportunity,
  buildWebsiteProblemOpportunity,
  recommendedContactChannel,
  restaurantSalesType,
  usesNoWebsiteCopy,
  usesWebsiteProblemCopy,
} from "../src/lib/admin/restaurant-no-website";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";

function pass(name: string) {
  console.log(`ok  ${name}`);
}

function mockLead(overrides: Partial<RestaurantLead> = {}): RestaurantLead {
  return {
    id: "lead_1",
    restaurantName: "Cafe Pending",
    nameNorm: "cafe pending",
    district: "Kadıköy",
    districtNorm: "kadıköy",
    region: "ANADOLU",
    neighborhood: "Caferağa",
    address: "Moda Cd.",
    website: "https://old.example",
    websiteDomain: "old.example",
    websiteStatus: "NOT_VERIFIED",
    websiteScore: null,
    leadScore: null,
    priority: "PENDING",
    publicEmail: "keep@example.com",
    phone: "0216 111 11 11",
    whatsapp: null,
    instagram: null,
    googleMapsUrl: "https://maps.app.goo.gl/abc",
    googleRating: 4.2,
    googleReviewCount: 10,
    category: "Cafe",
    problem1: null,
    problem2: null,
    problem3: null,
    websiteAnalysis: null,
    opportunities: null,
    salkayPitch: null,
    source: "maps",
    dateChecked: null,
    contactStatus: "CONTACTED",
    salesStatus: "NEW",
    lastContactAt: null,
    nextFollowUpAt: null,
    contactAttempts: 0,
    outreachNotes: "Do not wipe",
    isFinalTop20: false,
    finalRank: null,
    createdAt: new Date("2026-09-01"),
    updatedAt: new Date("2026-09-01"),
    ...overrides,
  };
}

const noWebsite = sanitizeRestaurantLeadWrite({
  restaurantName: "Test Lokanta",
  district: "Ataşehir",
  websiteStatus: "NO_WEBSITE",
  websiteScore: 7.4,
  leadScore: 8.2,
  priority: "HIGH",
  contactStatus: "NOT_CONTACTED",
});
assert.equal(noWebsite.websiteScore, null);
assert.equal(allowsWebsiteScore("NO_WEBSITE"), false);
assert.equal(allowsWebsiteScore("NOT_VERIFIED"), false);
pass("websiteScore stays null for NO_WEBSITE / NOT_VERIFIED");

const notVerified = sanitizeRestaurantLeadWrite({
  restaurantName: "Pending Cafe",
  district: "Şişli",
  region: "AVRUPA",
  websiteStatus: "NOT_VERIFIED",
  websiteScore: 4,
  leadScore: 8.2,
  priority: "HIGH",
  contactStatus: "NOT_CONTACTED",
});
assert.equal(notVerified.websiteScore, null);
assert.equal(notVerified.leadScore, null);
assert.equal(notVerified.priority, "PENDING");
assert.equal(notVerified.region, "AVRUPA");
pass("NOT_VERIFIED forces null scores and PENDING");

const goodQualified = sanitizeRestaurantLeadWrite({
  restaurantName: "Strong Site",
  district: "Beyoğlu",
  region: "AVRUPA",
  websiteStatus: "GOOD",
  websiteScore: 7.0,
  leadScore: null,
  priority: "HIGH",
  contactStatus: "NOT_CONTACTED",
});
assert.equal(goodQualified.priority, "QUALIFIED_OUT");
assert.equal(goodQualified.websiteScore, 7.0);
pass("GOOD / VERY_GOOD force QUALIFIED_OUT");

const pending = parseRestaurantLeadRow(
  {
    restaurantName: "Cafe Pending",
    district: "Kadıköy",
    websiteStatus: "ANALYSIS_PENDING",
    websiteScore: 9,
    leadScore: "",
    publicEmail: "not-an-email",
  },
  2,
);
assert.equal(pending.websiteStatus, "NOT_VERIFIED");
assert.equal(pending.websiteScore, null);
assert.equal(pending.leadScore, null);
assert.equal(pending.priority, "PENDING");
assert.equal(pending.contactStatus, "NOT_CONTACTED");
assert.equal(pending.publicEmail, null);
assert.equal(pending.errors.length, 0);
assert.ok(!pending.providedFields.includes("leadScore"));
assert.ok(!pending.providedFields.includes("publicEmail"));
pass("stale research status maps to NOT_VERIFIED; no invented scores/email");

const csv = `Restaurant,District,websiteStatus,websiteScore,leadScore,priority,Public Email,Problem 1
Cafe A,Kadıköy,NO_WEBSITE,9,8.5,HIGH,,Menü yok
Cafe A,Kadıköy,WEAK,3,7.1,MEDIUM,info@example.com,Mobil zayıf
Candidate,Beşiktaş,NOT_RESEARCHED,,,PENDING,,
`;
const parsed = parseRestaurantLeadCsv(csv);
assert.equal(parsed.rows.length, 3);
assert.equal(parsed.rows[0]?.websiteScore, null);
assert.equal(parsed.rows[2]?.websiteStatus, "NOT_VERIFIED");
assert.equal(parsed.rows[2]?.leadScore, null);
assert.equal(parsed.rows[2]?.errors.length, 0);
pass("CSV Excel headers; missing leadScore stays valid");

const previewRows = parsed.rows.map((row, index) => ({
  ...row,
  duplicate:
    index === 1
      ? { id: "", restaurantName: "Cafe A", district: "Kadıköy", reason: "in_file" as const }
      : null,
  existing: null,
  importAction: undefined,
}));
const stats = summarizeRestaurantLeadPreview(previewRows, "create");
assert.equal(stats.total, 3);
assert.equal(stats.valid, 3);
assert.equal(stats.invalid, 0);
assert.equal(stats.duplicates, 1);
assert.equal(stats.newLeads, 2);
assert.equal(stats.updates, 0);
assert.equal(stats.unchanged, 1);
assert.equal(stats.notVerified, 1);
assert.equal(stats.missingLeadScore, 1);
pass("import preview stats include New / Update / Unchanged / Invalid");

const emptyUpdate = parseRestaurantLeadRow(
  {
    restaurantName: "Cafe Pending",
    district: "Kadıköy",
    website: "",
    phone: "",
    publicEmail: "",
    leadScore: "",
    websiteScore: "",
    websiteStatus: "",
    problem1: "",
  },
  2,
);
assert.ok(!emptyUpdate.providedFields.includes("website"));
assert.ok(!emptyUpdate.providedFields.includes("phone"));
assert.ok(!emptyUpdate.providedFields.includes("publicEmail"));
assert.ok(!emptyUpdate.providedFields.includes("leadScore"));
assert.ok(!emptyUpdate.providedFields.includes("websiteStatus"));
const emptyPatch = buildRestaurantLeadUpdatePatch(mockLead(), emptyUpdate);
assert.deepEqual(emptyPatch, {});
pass("empty cells do not wipe existing lead fields");

const researched = parseRestaurantLeadRow(
  {
    restaurantName: "Cafe Pending",
    district: "Kadıköy",
    websiteStatus: "WEAK",
    websiteScore: 3.4,
    leadScore: 8.2,
    priority: "HIGH",
    publicEmail: "hello@example.com",
    website: "https://cafe-pending.example",
    problem1: "Mobil menü yok",
    problem2: "İletişim formu kırık",
    dateChecked: "2026-09-02",
  },
  3,
);
const researchPatch = buildRestaurantLeadUpdatePatch(mockLead(), researched);
assert.equal(researchPatch.websiteStatus, "WEAK");
assert.equal(researchPatch.websiteScore, 3.4);
assert.equal(researchPatch.leadScore, 8.2);
assert.equal(researchPatch.priority, "HIGH");
assert.equal(researchPatch.publicEmail, "hello@example.com");
assert.equal(researchPatch.problem1, "Mobil menü yok");
assert.equal(researchPatch.phone, undefined);
assert.equal(researchPatch.contactStatus, undefined);
assert.equal(researchPatch.outreachNotes, undefined);
pass("filled research fields patch; empty/omitted fields stay untouched");

const goodSite = parseRestaurantLeadRow(
  {
    restaurantName: "Cafe Pending",
    district: "Kadıköy",
    websiteStatus: "GOOD",
    websiteScore: 8.8,
  },
  4,
);
assert.equal(goodSite.priority, "QUALIFIED_OUT");
const goodPatch = buildRestaurantLeadUpdatePatch(mockLead(), goodSite);
assert.equal(goodPatch.priority, "QUALIFIED_OUT");
assert.equal(goodPatch.websiteStatus, "GOOD");
pass("GOOD sites default to QUALIFIED_OUT on update patch");

const updatePreview = {
  ...researched,
  duplicate: {
    id: "lead_1",
    restaurantName: "Cafe Pending",
    district: "Kadıköy",
    reason: "name_district" as const,
  },
  existing: mockLead(),
  importAction: "update" as const,
};
assert.equal(classifyRestaurantLeadImportRow(updatePreview, "update"), "update");
const updateStats = summarizeRestaurantLeadPreview([updatePreview], "update");
assert.equal(updateStats.updates, 1);
assert.equal(updateStats.newLeads, 0);
pass("update mode preview counts a matching changed row as Update");

const unmatched = {
  ...researched,
  restaurantName: "Unknown Place",
  district: "Şişli",
  nameNorm: "unknown place",
  districtNorm: "şişli",
  duplicate: null,
  existing: null,
  importAction: "new" as const,
};
assert.equal(classifyRestaurantLeadImportRow(unmatched, "update"), "new");
pass("update mode does not treat unmatched rows as creates");

const top20 = restaurantLeadWhere({ view: "top-20" });
const top20Json = JSON.stringify(top20);
assert.ok(top20Json.includes("HIGH"));
assert.ok(top20Json.includes("NO_WEBSITE"));
assert.ok(top20Json.includes("VERY_WEAK"));
assert.ok(top20Json.includes("IMPROVABLE"));
assert.equal(top20Json.includes("NOT_VERIFIED"), false);
assert.equal(top20Json.includes("GOOD"), false);
assert.equal(top20Json.includes("publicEmail"), false);
pass("Top 20 Outreach is HIGH sales leads only; GOOD / VERY_GOOD / NOT_VERIFIED excluded");

const ranked = [
  { leadScore: 8.5, publicEmail: "a@example.com", problem1: "x", problem2: null, problem3: null },
  { leadScore: 9.1, publicEmail: null, problem1: "x", problem2: null, problem3: null },
  { leadScore: 8.5, publicEmail: null, problem1: "x", problem2: null, problem3: null },
  { leadScore: 8.5, publicEmail: null, problem1: null, problem2: null, problem3: null },
].sort(compareTop20OutreachLeads);
assert.equal(ranked[0]?.leadScore, 9.1);
assert.equal(ranked[1]?.publicEmail, "a@example.com");
assert.equal(ranked[2]?.problem1, "x");
assert.equal(ranked[3]?.problem1, null);
pass("Top 20 ranks leadScore first, then email, then concrete problems");

const qualifiedOut = restaurantLeadWhere({ view: "qualified-out" });
assert.ok(JSON.stringify(qualifiedOut).includes("QUALIFIED_OUT"));
pass("Qualified Out filter uses QUALIFIED_OUT");

const noWebsiteView = restaurantLeadWhere({ view: "no-website-opportunities" });
assert.ok(JSON.stringify(noWebsiteView).includes("NO_WEBSITE"));
pass("No Website Opportunities filters websiteStatus NO_WEBSITE");

const websiteProblemView = restaurantLeadWhere({ view: "website-problem-opportunities" });
assert.ok(JSON.stringify(websiteProblemView).includes("VERY_WEAK"));
assert.ok(JSON.stringify(websiteProblemView).includes("WEAK"));
assert.ok(JSON.stringify(websiteProblemView).includes("IMPROVABLE"));
pass("Website Problem Opportunities filters VERY_WEAK / WEAK / IMPROVABLE");

const strongest = restaurantLeadWhere({ view: "strongest" });
const strongestJson = JSON.stringify(strongest);
assert.ok(strongestJson.includes("HIGH"));
assert.ok(strongestJson.includes("NO_WEBSITE"));
assert.ok(strongestJson.includes("VERY_WEAK"));
assert.ok(strongestJson.includes("WEAK"));
assert.equal(strongestJson.includes("IMPROVABLE"), false);
assert.ok(strongestJson.includes("phone"));
assert.ok(strongestJson.includes("whatsapp"));
assert.ok(strongestJson.includes("publicEmail"));
pass("En Güçlü Leadler: HIGH + contact + NO_WEBSITE/VERY_WEAK/WEAK");

const noWebsiteSales = restaurantLeadWhere({ view: "no-website-sales" });
assert.ok(JSON.stringify(noWebsiteSales).includes("NO_WEBSITE"));
assert.ok(JSON.stringify(noWebsiteSales).includes("QUALIFIED_OUT"));
pass("Sitesi olmayanlar excludes QUALIFIED_OUT");

const weakSite = restaurantLeadWhere({ view: "weak-site" });
const weakSiteJson = JSON.stringify(weakSite);
assert.ok(weakSiteJson.includes("VERY_WEAK"));
assert.ok(weakSiteJson.includes("WEAK"));
assert.equal(weakSiteJson.includes("IMPROVABLE"), false);
pass("Kötü sitesi olanlar is VERY_WEAK + WEAK only");

const pendingResearch = restaurantLeadWhere({ view: "pending-research" });
assert.ok(JSON.stringify(pendingResearch).includes("NOT_VERIFIED"));
assert.ok(JSON.stringify(pendingResearch).includes("PENDING"));
pass("Doğrulama bekleyenler is NOT_VERIFIED or PENDING");

const turkishSearch = restaurantLeadWhere({ q: "ŞİŞLİ" });
assert.ok(JSON.stringify(turkishSearch).includes("şişli"));
pass("Search normalizes Turkish characters onto nameNorm/districtNorm");

const websiteSearch = restaurantLeadWhere({ q: "example.com" });
assert.ok(JSON.stringify(websiteSearch).includes("website"));
pass("Search includes website fields");

assert.equal(phoneHref("0212 505 74 55"), "tel:+902125057455");
assert.equal(whatsappHref("0542 695 29 28"), "https://wa.me/905426952928");
pass("Phone tel: and WhatsApp wa.me hrefs use TR digits");

const firstContactRanked = [
  { leadScore: 8.1, websiteScore: 3, phone: "1", whatsapp: null, publicEmail: null },
  { leadScore: 9.2, websiteScore: 4, phone: "1", whatsapp: null, publicEmail: null },
  { leadScore: 9.2, websiteScore: null, phone: "1", whatsapp: null, publicEmail: null },
  { leadScore: 9.2, websiteScore: null, phone: "1", whatsapp: "2", publicEmail: "a@x.com" },
].sort(compareFirstContactLeads);
assert.equal(firstContactRanked[0]?.publicEmail, "a@x.com");
assert.equal(firstContactRanked[1]?.websiteScore, null);
assert.equal(firstContactRanked[2]?.websiteScore, 4);
assert.equal(firstContactRanked[3]?.leadScore, 8.1);
pass("İlk temas sıralaması: leadScore DESC, websiteScore ASC NULLS FIRST, contact availability");

const eskiUzunlar = buildNoWebsiteOpportunity(
  mockLead({
    restaurantName: "Kartal Kebap Pide Lahmacun Çorba Kahvaltı - Eski Uzunlar",
    websiteStatus: "NO_WEBSITE",
    website: null,
    websiteDomain: null,
  }),
);
assert.equal(assertNoWebsiteCopySafe(eskiUzunlar.emailSubject).length, 0);
assert.equal(assertNoWebsiteCopySafe(eskiUzunlar.emailBody).length, 0);
pass("NO_WEBSITE copy check does not flag restaurant names containing Eski");

const lossGarden = buildWebsiteProblemOpportunity(
  mockLead({
    restaurantName: "Loss Garden Cafe & Restaurant",
    district: "Maltepe",
    websiteStatus: "VERY_WEAK",
    website: "https://lossgarden.com/",
    websiteDomain: "lossgarden.com",
    problem1: "Açık WordPress varsayılan tema; Ultimate Blogging Championship ve Hello world! yazıları duruyor.",
    problem2: "Restoran menü, rezervasyon ve iletişim yok.",
    publicEmail: null,
    phone: "+90 216 442 00 58",
  }),
);
assert.equal(lossGarden.salesType, "WEBSITE_PROBLEM_EMAIL");
assert.ok(lossGarden.emailBody.includes("Ultimate Blogging Championship"));
assert.ok(lossGarden.emailBody.includes("https://lossgarden.com/"));
assert.equal(assertWebsiteProblemCopySafe(lossGarden.emailBody).length, 0);
assert.equal(assertWebsiteProblemCopySafe(lossGarden.emailSubject).length, 0);
assert.equal(lossGarden.emailBody.includes("bağımsız"), false);
assert.equal(usesWebsiteProblemCopy("VERY_WEAK"), true);
assert.equal(usesNoWebsiteCopy("VERY_WEAK"), false);
assert.equal(lossGarden.recommendedChannel.channel, "PHONE");
pass("WEBSITE_PROBLEM draft uses verified site issues and avoids NO_WEBSITE copy");

const noWebsiteLead = mockLead({
  restaurantName: "Vakt-i Zaman Meyhane Kartal",
  district: "Kartal",
  websiteStatus: "NO_WEBSITE",
  website: null,
  websiteDomain: null,
  publicEmail: null,
  phone: "0530 592 19 26",
  instagram: "https://www.instagram.com/vakti.zaman.meyhane/",
  whatsapp: null,
  googleMapsUrl: "https://maps.app.goo.gl/example",
  googleRating: 4.6,
  googleReviewCount: 200,
  salkayPitch: "Kartal sahil meyhane; 200 yorum, site yok. Yeni meyhane vitrini.",
});
const opportunity = buildNoWebsiteOpportunity(noWebsiteLead);
assert.equal(opportunity.salesType, "NO_WEBSITE_EMAIL");
assert.equal(opportunity.publicEmail, null);
assert.equal(opportunity.hasPublicEmail, false);
assert.equal(opportunity.recommendedChannel.channel, "INSTAGRAM");
assert.ok(opportunity.emailSubject.includes("Vakt-i Zaman Meyhane Kartal"));
assert.ok(opportunity.emailBody.includes("Vakt-i Zaman Meyhane Kartal"));
assert.ok(opportunity.emailBody.includes("Kartal"));
assert.ok(opportunity.emailBody.includes("Instagram"));
assert.ok(opportunity.emailBody.includes("Google"));
assert.ok(opportunity.emailBody.includes("ana sayfa konsepti"));
assert.equal(assertNoWebsiteCopySafe(opportunity.emailBody).length, 0);
assert.equal(assertNoWebsiteCopySafe(opportunity.emailSubject).length, 0);
assert.equal(opportunity.emailBody.includes("@"), false);
assert.equal(usesNoWebsiteCopy("NO_WEBSITE"), true);
assert.equal(usesWebsiteProblemCopy("NO_WEBSITE"), false);
assert.equal(restaurantSalesType("WEAK"), "WEBSITE_PROBLEM_EMAIL");
assert.equal(restaurantSalesType("VERY_WEAK"), "WEBSITE_PROBLEM_EMAIL");
assert.equal(restaurantSalesType("NOT_VERIFIED"), null);
assert.equal(restaurantSalesType("GOOD"), null);
assert.equal(blocksRestaurantSalesEmail("NOT_VERIFIED"), true);
assert.equal(blocksRestaurantSalesEmail("GOOD"), true);
assert.equal(blocksRestaurantSalesEmail("NO_WEBSITE"), false);
pass("NO_WEBSITE draft is personalized, has no fake email, avoids weak-site copy");

const emailFirst = recommendedContactChannel(
  mockLead({ publicEmail: "info@example.com", instagram: "@x", phone: "0216 000 00 00" }),
);
assert.equal(emailFirst.channel, "EMAIL");
assert.equal(emailFirst.value, "info@example.com");
const phoneOnly = recommendedContactChannel(
  mockLead({ publicEmail: null, instagram: null, whatsapp: null, phone: "+90 216 387 59 58" }),
);
assert.equal(phoneOnly.channel, "PHONE");
const none = recommendedContactChannel(
  mockLead({ publicEmail: null, instagram: null, whatsapp: null, phone: null }),
);
assert.equal(none.channel, "NONE");
pass("contact channel prefers verified email, then Instagram/WhatsApp/phone; never invents email");

assert.equal(assertAvrupaDataset().length, 100);
pass("Avrupa Yakası 100 dataset is unique, status-safe, and has no fabricated contact fields");
assert.equal(assertAvrupaContacts().length, 100);
pass("Avrupa contact list aligns 1:1 with seeds; 10 SKIP; no invented phones");

async function testXlsx() {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet([
    {
      Restaurant: "Excel Restoran",
      District: "Beşiktaş",
      Mahalle: "Levent",
      "Google Rating": 4.6,
      "Review Count": 120,
      "Public Email": "hello@example.com",
      Website: "https://example.com",
      "SALKAY Opportunity": "Yeni site",
      Source: "https://maps.app.goo.gl/abc",
    },
  ]);
  XLSX.utils.book_append_sheet(workbook, sheet, "Leads");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const xlsxParsed = await parseRestaurantLeadXlsx(buffer);
  assert.equal(xlsxParsed.rows.length, 1);
  assert.equal(xlsxParsed.rows[0]?.restaurantName, "Excel Restoran");
  assert.equal(xlsxParsed.rows[0]?.neighborhood, "Levent");
  assert.equal(xlsxParsed.rows[0]?.googleMapsUrl, "https://maps.app.goo.gl/abc");
  assert.equal(xlsxParsed.rows[0]?.websiteStatus, "NOT_VERIFIED");
  assert.equal(xlsxParsed.rows[0]?.priority, "PENDING");
  pass("XLSX Excel-style headers and maps URL from Source");
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

async function testExistingLeadUpdateAgainstDb() {
  loadDotEnv();
  if (!isDatabaseConfigured()) {
    console.log("skip existing-lead update against DB (DATABASE_URL missing)");
    return;
  }

  const prisma = getPrisma();
  const lead = await prisma.restaurantLead.findFirst({ orderBy: { createdAt: "asc" } });
  if (!lead) {
    console.log("skip existing-lead update against DB (no RestaurantLead rows)");
    return;
  }

  const identityOnly = parseRestaurantLeadRow(
    { restaurantName: lead.restaurantName, district: lead.district },
    2,
  );
  const preview = await attachRestaurantLeadDuplicates([identityOnly], "update");
  const row = preview[0];
  assert.ok(row);
  assert.equal(row?.importAction, "unchanged");
  assert.equal(row?.existing?.id, lead.id);
  const patch = buildRestaurantLeadUpdatePatch(lead, identityOnly);
  assert.deepEqual(patch, {});

  const [total, anadolu, avrupa, europePhone, europeWhatsapp] = await Promise.all([
    prisma.restaurantLead.count(),
    prisma.restaurantLead.count({ where: { region: "ANADOLU" } }),
    prisma.restaurantLead.count({ where: { region: "AVRUPA" } }),
    prisma.restaurantLead.count({
      where: {
        region: "AVRUPA",
        AND: [{ phone: { not: null } }, { phone: { not: "" } }],
      },
    }),
    prisma.restaurantLead.count({
      where: {
        region: "AVRUPA",
        AND: [{ whatsapp: { not: null } }, { whatsapp: { not: "" } }],
      },
    }),
  ]);
  assert.equal(total, 239);
  assert.equal(anadolu, 139);
  assert.equal(avrupa, 100);
  assert.equal(europePhone, 90);
  assert.equal(europeWhatsapp, 4);

  const firstContact = await listFirstContactRecommendations();
  assert.ok(firstContact.length <= 10);
  console.log(
    "first contact:",
    firstContact.map((row) => `${row.restaurantName} · ${row.district}`).join(" | "),
  );

  pass("DB: identity-only update is Unchanged; 239 / 139 / 100 / EU phone 90 / WA 4 preserved");
}

testXlsx()
  .then(() => testExistingLeadUpdateAgainstDb())
  .then(() => {
    console.log("\nAll restaurant lead parser/filter checks passed.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
