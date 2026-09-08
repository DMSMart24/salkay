import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Prisma, RestaurantLeadPriority, RestaurantWebsiteStatus, WebsiteStatus } from "@prisma/client";
import { isValidEmail } from "../src/lib/admin/normalize";
import { getPrisma } from "../src/lib/admin/prisma";
import { blankToNull, normalizeLeadKey, sanitizeRestaurantLeadWrite } from "../src/lib/admin/restaurant-leads";

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

const RESTAURANT_COMPANY_WHERE: Prisma.CompanyWhereInput = {
  archivedAt: null,
  OR: [
    { industry: { equals: "Restaurant", mode: "insensitive" } },
    { industry: { equals: "Restoran", mode: "insensitive" } },
    { industry: { equals: "Restoranlar", mode: "insensitive" } },
    { industry: { equals: "Restaurants", mode: "insensitive" } },
    {
      group: {
        is: {
          OR: [
            { industry: { equals: "Restaurant", mode: "insensitive" } },
            { name: { contains: "Restoran", mode: "insensitive" } },
            { name: { contains: "Restaurant", mode: "insensitive" } },
          ],
        },
      },
    },
  ],
};

function mapWebsiteStatus(status: WebsiteStatus): RestaurantWebsiteStatus {
  switch (status) {
    case "NO_WEBSITE":
    case "VERY_WEAK":
    case "WEAK":
    case "IMPROVABLE":
    case "GOOD":
    case "VERY_GOOD":
    case "NOT_VERIFIED":
      return status;
    default:
      return "NOT_VERIFIED";
  }
}

function mapPriority(priority: "LOW" | "MEDIUM" | "HIGH", researched: boolean): RestaurantLeadPriority {
  if (!researched) return "PENDING";
  return priority;
}

async function main() {
  loadDotEnv();
  const apply = process.argv.includes("--apply");
  const prisma = getPrisma();

  const [companies, leads] = await Promise.all([
    prisma.company.findMany({
      where: RESTAURANT_COMPANY_WHERE,
      include: {
        group: { select: { name: true, industry: true } },
        contacts: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          take: 1,
        },
      },
      orderBy: { companyName: "asc" },
    }),
    prisma.restaurantLead.findMany({
      select: {
        id: true,
        restaurantName: true,
        district: true,
        nameNorm: true,
        districtNorm: true,
      },
    }),
  ]);

  const byKey = new Map(leads.map((row) => [`${row.nameNorm}|${row.districtNorm}`, row]));
  const byName = new Map<string, typeof leads>();
  for (const row of leads) {
    const list = byName.get(row.nameNorm) ?? [];
    list.push(row);
    byName.set(row.nameNorm, list);
  }

  const preview = companies.map((company) => {
    const district = blankToNull(company.district) || blankToNull(company.city);
    if (!district) {
      return {
        companyId: company.id,
        companyName: company.companyName,
        group: company.group?.name ?? null,
        industry: company.industry,
        district: "",
        websiteStatus: "NOT_VERIFIED" as const,
        priority: "PENDING" as const,
        hasEmail: false,
        researched: false,
        action: "skip_no_district" as const,
        duplicateOf: null,
        payload: null,
      };
    }
    const nameNorm = normalizeLeadKey(company.companyName);
    const districtNorm = normalizeLeadKey(district);
    const exact = byKey.get(`${nameNorm}|${districtNorm}`);
    const nameMatch = byName.get(nameNorm)?.[0] ?? null;
    const duplicate = exact ?? nameMatch;
    const contactEmail = company.contacts[0]?.email;
    const email = isValidEmail(company.generalEmail)
      ? company.generalEmail
      : isValidEmail(contactEmail)
        ? contactEmail
        : null;
    const researched = Boolean(company.researchedAt);
    const websiteStatus = mapWebsiteStatus(company.websiteStatus);
    const payload = sanitizeRestaurantLeadWrite({
      restaurantName: company.companyName,
      district,
      address: company.address,
      website: company.website,
      websiteDomain: company.domain,
      websiteStatus,
      websiteScore: researched ? company.websiteScore : null,
      leadScore: researched ? company.leadScore : null,
      priority: mapPriority(company.priority, researched),
      publicEmail: email,
      phone: company.phone || company.contacts[0]?.phone,
      instagram: company.instagram,
      category: company.industry,
      problem1: company.websiteIssues[0] ?? null,
      problem2: company.websiteIssues[1] ?? null,
      problem3: company.websiteIssues[2] ?? null,
      websiteAnalysis: null,
      opportunities: company.opportunities.length ? company.opportunities.join(", ") : null,
      salkayPitch: company.salesPitch,
      source: company.source || company.researchSource || "Firmen",
      dateChecked: company.researchedAt,
      contactStatus: "NOT_CONTACTED",
      outreachNotes: null,
    });

    return {
      companyId: company.id,
      companyName: company.companyName,
      group: company.group?.name ?? null,
      industry: company.industry,
      district: payload.district,
      websiteStatus: payload.websiteStatus,
      priority: payload.priority,
      hasEmail: Boolean(payload.publicEmail),
      researched,
      action: duplicate ? ("skip_duplicate" as const) : ("create" as const),
      duplicateOf: duplicate ? `${duplicate.restaurantName} · ${duplicate.district}` : null,
      payload,
    };
  });

  const create = preview.filter((row) => row.action === "create" && row.payload);
  const skip = preview.filter((row) => row.action !== "create");

  console.log(
    JSON.stringify(
      {
        firmenRestaurants: companies.length,
        existingLeads: leads.length,
        create: create.length,
        skipDuplicate: skip.length,
        createNames: create.map((row) => `${row.companyName} · ${row.district} · ${row.websiteStatus}/${row.priority}`),
        skipNames: skip.map((row) => `${row.companyName} → ${row.duplicateOf ?? row.action}`),
      },
      null,
      2,
    ),
  );

  if (!apply) {
    console.log("Dry run. Re-run with --apply to create missing RestaurantLead rows.");
    return;
  }

  let created = 0;
  for (const row of create) {
    if (!row.payload) continue;
    await prisma.restaurantLead.create({ data: row.payload });
    created += 1;
  }

  const total = await prisma.restaurantLead.count();
  console.log(JSON.stringify({ created, restaurantLeadTotal: total }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
