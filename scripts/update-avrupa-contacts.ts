import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { RestaurantLead } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";
import { blankToNull, normalizeLeadKey, normalizePhoneDigits, restaurantEmailSegment } from "../src/lib/admin/restaurant-leads";
import { AVRUPA_100_SEEDS } from "./avrupa-100-dataset";
import { AVRUPA_100_CONTACTS, assertAvrupaContacts } from "./avrupa-100-contacts";

function loadDotEnv() {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), file);
    if (!existsSync(envPath)) continue;
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
}

loadDotEnv();

type ContactPlanAction = "PHONE_UPDATE" | "WHATSAPP_UPDATE" | "SKIP" | "UNCHANGED" | "CONFLICT" | "NOT_FOUND";

type ContactPlan = {
  restaurantName: string;
  district: string;
  action: ContactPlanAction;
  reason: string;
  existingId: string | null;
  region: string | null;
  nextPhone?: string | null;
  nextWhatsapp?: string | null;
  phoneChanges: boolean;
  whatsappChanges: boolean;
};

const PROTECTED_FIELDS = [
  "restaurantName",
  "district",
  "region",
  "websiteStatus",
  "websiteScore",
  "leadScore",
  "priority",
  "publicEmail",
  "problem1",
  "problem2",
  "problem3",
  "websiteAnalysis",
  "outreachNotes",
  "website",
  "websiteDomain",
] as const;

type Fingerprint = Record<(typeof PROTECTED_FIELDS)[number] | "emailSegment", string | number | null>;

function fingerprint(lead: RestaurantLead): Fingerprint {
  return {
    restaurantName: lead.restaurantName,
    district: lead.district,
    region: lead.region,
    websiteStatus: lead.websiteStatus,
    websiteScore: lead.websiteScore,
    leadScore: lead.leadScore,
    priority: lead.priority,
    publicEmail: lead.publicEmail,
    problem1: lead.problem1,
    problem2: lead.problem2,
    problem3: lead.problem3,
    websiteAnalysis: lead.websiteAnalysis,
    outreachNotes: lead.outreachNotes,
    website: lead.website,
    websiteDomain: lead.websiteDomain,
    emailSegment: restaurantEmailSegment(lead.websiteStatus),
  };
}

function samePhone(left?: string | null, right?: string | null) {
  const a = normalizePhoneDigits(left);
  const b = normalizePhoneDigits(right);
  return Boolean(a) && a === b;
}

function shouldWriteContact(existing: string | null, incoming?: string) {
  const next = blankToNull(incoming);
  if (!next) return false;
  if (blankToNull(existing) && samePhone(existing, next)) return false;
  if (blankToNull(existing) && !samePhone(existing, next)) return true;
  return !blankToNull(existing);
}

async function europeContactCounts(prisma: ReturnType<typeof getPrisma>) {
  const avrupa = await prisma.restaurantLead.findMany({ where: { region: "AVRUPA" } });
  return {
    total: avrupa.length,
    withPhone: avrupa.filter((row) => Boolean(blankToNull(row.phone))).length,
    withoutPhone: avrupa.filter((row) => !blankToNull(row.phone)).length,
    withWhatsapp: avrupa.filter((row) => Boolean(blankToNull(row.whatsapp))).length,
  };
}

function classify(
  index: number,
  existingLeads: RestaurantLead[],
): ContactPlan {
  const contact = AVRUPA_100_CONTACTS[index];
  const seed = AVRUPA_100_SEEDS[index];
  if (!contact || !seed) {
    return {
      restaurantName: contact?.restaurantName ?? `index ${index}`,
      district: seed?.district ?? "",
      action: "NOT_FOUND",
      reason: "contact/seed missing",
      existingId: null,
      region: null,
      phoneChanges: false,
      whatsappChanges: false,
    };
  }

  const nameNorm = normalizeLeadKey(seed.restaurantName);
  const districtNorm = normalizeLeadKey(seed.district);
  const matches = existingLeads.filter(
    (row) => row.nameNorm === nameNorm && row.districtNorm === districtNorm,
  );
  const avrupaMatches = matches.filter((row) => row.region === "AVRUPA");
  const anadoluMatches = matches.filter((row) => row.region === "ANADOLU");

  if (anadoluMatches.length > 0) {
    const hit = anadoluMatches[0]!;
    return {
      restaurantName: seed.restaurantName,
      district: seed.district,
      action: "CONFLICT",
      reason: `Anadolu match ${hit.restaurantName} / ${hit.district}`,
      existingId: hit.id,
      region: hit.region,
      phoneChanges: false,
      whatsappChanges: false,
    };
  }

  if (contact.action === "skip") {
    return {
      restaurantName: seed.restaurantName,
      district: seed.district,
      action: "SKIP",
      reason: contact.skipReason ?? "skipped",
      existingId: avrupaMatches[0]?.id ?? null,
      region: avrupaMatches[0]?.region ?? null,
      phoneChanges: false,
      whatsappChanges: false,
    };
  }

  if (avrupaMatches.length === 0) {
    return {
      restaurantName: seed.restaurantName,
      district: seed.district,
      action: "NOT_FOUND",
      reason: "no AVRUPA name+district match",
      existingId: null,
      region: null,
      phoneChanges: false,
      whatsappChanges: false,
    };
  }

  if (avrupaMatches.length > 1) {
    return {
      restaurantName: seed.restaurantName,
      district: seed.district,
      action: "CONFLICT",
      reason: `${avrupaMatches.length} AVRUPA matches`,
      existingId: avrupaMatches[0]?.id ?? null,
      region: "AVRUPA",
      phoneChanges: false,
      whatsappChanges: false,
    };
  }

  const existing = avrupaMatches[0]!;
  const phoneChanges = shouldWriteContact(existing.phone, contact.phone);
  const whatsappChanges = shouldWriteContact(existing.whatsapp, contact.whatsapp);

  if (!phoneChanges && !whatsappChanges) {
    return {
      restaurantName: seed.restaurantName,
      district: seed.district,
      action: "UNCHANGED",
      reason: "phone/whatsapp already current",
      existingId: existing.id,
      region: existing.region,
      nextPhone: existing.phone,
      nextWhatsapp: existing.whatsapp,
      phoneChanges: false,
      whatsappChanges: false,
    };
  }

  return {
    restaurantName: seed.restaurantName,
    district: seed.district,
    action: phoneChanges ? "PHONE_UPDATE" : "WHATSAPP_UPDATE",
    reason: [
      phoneChanges ? "phone" : null,
      whatsappChanges ? "whatsapp" : null,
    ]
      .filter(Boolean)
      .join("+"),
    existingId: existing.id,
    region: existing.region,
    nextPhone: phoneChanges ? contact.phone : existing.phone,
    nextWhatsapp: whatsappChanges ? contact.whatsapp ?? null : existing.whatsapp,
    phoneChanges,
    whatsappChanges,
  };
}

async function assertProtectedFieldsUnchanged(
  before: Map<string, Fingerprint>,
  after: RestaurantLead[],
) {
  const errors: string[] = [];
  for (const lead of after) {
    const previous = before.get(lead.id);
    if (!previous) {
      errors.push(`Unexpected new lead ${lead.restaurantName}`);
      continue;
    }
    const next = fingerprint(lead);
    for (const field of Object.keys(previous) as (keyof Fingerprint)[]) {
      if (previous[field] !== next[field]) {
        errors.push(`${lead.restaurantName}: ${field} changed`);
      }
    }
  }
  if (errors.length) {
    throw new Error(`Protected fields changed:\n${errors.join("\n")}`);
  }
}

async function main() {
  const confirm = process.argv.includes("--confirm");
  assertAvrupaContacts();
  if (!isDatabaseConfigured()) {
    console.error("DATABASE_URL yok; dry-run/update yapılamadı.");
    process.exit(1);
  }

  const prisma = getPrisma();
  const beforeEurope = await europeContactCounts(prisma);
  const anadoluBefore = await prisma.restaurantLead.findMany({
    where: { region: "ANADOLU" },
    select: { id: true, phone: true, whatsapp: true, restaurantName: true, district: true },
  });
  const existing = await prisma.restaurantLead.findMany();
  const beforeFingerprints = new Map(existing.filter((row) => row.region === "AVRUPA").map((row) => [row.id, fingerprint(row)]));

  console.log("=== BEFORE ===");
  console.log(`Europe total: ${beforeEurope.total}`);
  console.log(`Europe with phone: ${beforeEurope.withPhone}`);
  console.log(`Europe with WhatsApp: ${beforeEurope.withWhatsapp}`);

  const planned = AVRUPA_100_CONTACTS.map((_, index) => classify(index, existing));
  const matched = planned.filter(
    (row) => row.action !== "SKIP" && row.existingId && row.region === "AVRUPA",
  ).length;
  const phoneUpdates = planned.filter((row) => row.phoneChanges).length;
  const whatsappUpdates = planned.filter((row) => row.whatsappChanges).length;
  const skipped = planned.filter((row) => row.action === "SKIP").length;
  const unchanged = planned.filter((row) => row.action === "UNCHANGED").length;
  const conflicts = planned.filter((row) => row.action === "CONFLICT");
  const notFound = planned.filter((row) => row.action === "NOT_FOUND");
  const anadoluUpdates = planned.filter((row) => row.region === "ANADOLU" && (row.phoneChanges || row.whatsappChanges));

  console.log("\n=== UPDATE PLAN ===");
  console.log(`matched: ${matched}`);
  console.log(`phone updates: ${phoneUpdates}`);
  console.log(`whatsapp updates: ${whatsappUpdates}`);
  console.log(`skipped: ${skipped}`);
  console.log(`unchanged: ${unchanged}`);
  console.log(`conflicts: ${conflicts.length}`);
  console.log(`not found: ${notFound.length}`);
  console.log(`ANADOLU updates: ${anadoluUpdates.length}`);

  if (conflicts.length) {
    console.log("\nConflicts:");
    for (const row of conflicts) {
      console.log(`  ${row.restaurantName} / ${row.district}: ${row.reason}`);
    }
  }
  if (notFound.length) {
    console.log("\nNot found:");
    for (const row of notFound) {
      console.log(`  ${row.restaurantName} / ${row.district}: ${row.reason}`);
    }
  }

  if (anadoluUpdates.length > 0) {
    console.error("\nSTOP: Anadolu UPDATE > 0. Yazılmadı.");
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!confirm) {
    console.log("\nUpdate yazılmadı. Yazmak için: npx tsx scripts/update-avrupa-contacts.ts --confirm");
    await prisma.$disconnect();
    return;
  }

  if (conflicts.length || notFound.length) {
    console.error("\nSTOP: CONFLICT veya NOT_FOUND var. Veri zorlanmadı.");
    await prisma.$disconnect();
    process.exit(1);
  }

  let appliedPhone = 0;
  let appliedWhatsapp = 0;
  for (const row of planned) {
    if (!row.existingId || row.region !== "AVRUPA") continue;
    if (!row.phoneChanges && !row.whatsappChanges) continue;
    const data: { phone?: string; whatsapp?: string } = {};
    if (row.phoneChanges && row.nextPhone) {
      data.phone = row.nextPhone;
      appliedPhone += 1;
    }
    if (row.whatsappChanges && row.nextWhatsapp) {
      data.whatsapp = row.nextWhatsapp;
      appliedWhatsapp += 1;
    }
    if (Object.keys(data).length === 0) continue;
    await prisma.restaurantLead.update({
      where: { id: row.existingId },
      data,
    });
  }

  const afterEurope = await europeContactCounts(prisma);
  const anadoluAfter = await prisma.restaurantLead.findMany({
    where: { region: "ANADOLU" },
    select: { id: true, phone: true, whatsapp: true, restaurantName: true },
  });
  const avrupaAfter = await prisma.restaurantLead.findMany({ where: { region: "AVRUPA" } });
  await assertProtectedFieldsUnchanged(beforeFingerprints, avrupaAfter);

  const anadoluPhoneChanged = anadoluAfter.filter((row) => {
    const before = anadoluBefore.find((item) => item.id === row.id);
    return before?.phone !== row.phone || before?.whatsapp !== row.whatsapp;
  });
  if (anadoluPhoneChanged.length) {
    throw new Error(`Anadolu contact fields changed: ${anadoluPhoneChanged.map((row) => row.restaurantName).join(", ")}`);
  }

  console.log("\n=== APPLIED ===");
  console.log(`phone updates: ${appliedPhone}`);
  console.log(`whatsapp updates: ${appliedWhatsapp}`);

  console.log("\n=== AFTER ===");
  console.log(`Europe total: ${afterEurope.total}`);
  console.log(`Europe with phone: ${afterEurope.withPhone}`);
  console.log(`Europe without phone: ${afterEurope.withoutPhone}`);
  console.log(`Europe with WhatsApp: ${afterEurope.withWhatsapp}`);
  console.log("Protected fields unchanged: websiteStatus, websiteScore, leadScore, priority, publicEmail, emailSegment, problems, notes");
  console.log("Anadolu contact fields unchanged");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
