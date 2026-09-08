/**
 * APPROVED import: SALKAY_FINAL_VERIFIED_SAFE_DRY_RUN.csv
 * Single transaction. Rollback if counts or QA fail.
 * Expected: 254 → CREATE 41 + UPDATE 15 → 295
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  Prisma,
  RestaurantLead,
  RestaurantLeadPriority,
  RestaurantWebsiteStatus,
} from "@prisma/client";
import { normalizeDomain, normalizeWebsite } from "../src/lib/admin/normalize";
import {
  matchRestaurantLeadAgainstPool,
  toMatchCandidate,
} from "../src/lib/admin/restaurant-lead-duplicates";
import {
  allowsWebsiteScore,
  blankToNull,
  isClosedOrHoldRestaurant,
  normalizeLeadKey,
  readyForOutreachWhere,
  sanitizeRestaurantLeadWrite,
} from "../src/lib/admin/restaurant-leads";
import { parseRestaurantLeadCsv } from "../src/lib/admin/restaurant-leads-import";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";

const EXPECTED_BEFORE = 254;
const EXPECTED_CREATE = 41;
const EXPECTED_UPDATE = 15;
const EXPECTED_AFTER = 295;

type EmailTrust =
  | "OFFICIAL_VERIFIED"
  | "THIRD_PARTY_VERIFIED"
  | "NOT_VERIFIED"
  | "NOT_FOUND"
  | "HISTORICAL"
  | "UNKNOWN";

function fold(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "");
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if ((char === "," || char === ";") && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function parseEmailTrust(raw?: string | null): EmailTrust {
  const folded = fold(raw ?? "");
  if (folded === "officialverified") return "OFFICIAL_VERIFIED";
  if (folded === "thirdpartyverified") return "THIRD_PARTY_VERIFIED";
  if (folded === "notverified") return "NOT_VERIFIED";
  if (folded === "notfound") return "NOT_FOUND";
  if (folded === "historical") return "HISTORICAL";
  return "UNKNOWN";
}

function readEmailTrustByRow(csvPath: string) {
  const source = readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const lines = source.split(/\r?\n/).filter((line) => line.trim());
  const headers = splitCsvLine(lines[0] ?? "").map((h) => fold(h));
  const trustIdx = headers.findIndex((h) => h === "emailtrust");
  const map = new Map<number, EmailTrust>();
  if (trustIdx < 0) return map;
  lines.slice(1).forEach((line, i) => {
    map.set(i + 2, parseEmailTrust(splitCsvLine(line)[trustIdx] ?? ""));
  });
  return map;
}

function appendNotes(existing: string | null | undefined, addition: string) {
  const base = blankToNull(existing);
  const add = blankToNull(addition);
  if (!add) return base;
  if (!base) return add;
  if (base.includes(add)) return base;
  return `${base}\n${add}`;
}

function trustNote(trust: EmailTrust, email?: string | null) {
  const e = blankToNull(email);
  if (!e) return `emailTrust: ${trust}`;
  return `emailTrust: ${trust}; email: ${e}`;
}

function safePublicEmail(email: string | null | undefined, trust: EmailTrust) {
  const value = blankToNull(email);
  if (!value) return null;
  if (trust !== "OFFICIAL_VERIFIED") return null;
  return value;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`IMPORT ABORT: ${message}`);
}

type CsvRow = ReturnType<typeof parseRestaurantLeadCsv>["rows"][number];

function buildCreateData(row: CsvRow, trust: EmailTrust): Prisma.RestaurantLeadCreateInput {
  const publicEmail = safePublicEmail(row.publicEmail, trust);
  const websiteStatus = row.websiteStatus;
  const websiteScore = allowsWebsiteScore(websiteStatus) ? row.websiteScore ?? null : null;
  const sanitized = sanitizeRestaurantLeadWrite({
    restaurantName: row.restaurantName,
    district: row.district,
    region: row.region ?? "ANADOLU",
    neighborhood: row.neighborhood,
    address: row.address,
    website: row.website,
    websiteDomain: row.websiteDomain,
    websiteStatus,
    websiteScore,
    leadScore: row.leadScore,
    priority: row.priority,
    publicEmail,
    phone: row.phone,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    googleMapsUrl: row.googleMapsUrl,
    googleRating: row.googleRating,
    googleReviewCount: row.googleReviewCount,
    category: row.category,
    problem1: row.problem1,
    problem2: row.problem2,
    problem3: row.problem3,
    websiteAnalysis: row.websiteAnalysis,
    opportunities: row.opportunities,
    salkayPitch: row.salkayPitch,
    source: row.source,
    dateChecked: row.dateChecked,
    contactStatus: "NOT_CONTACTED",
    outreachNotes: appendNotes(
      row.outreachNotes,
      trust !== "OFFICIAL_VERIFIED" && row.publicEmail
        ? trustNote(trust, row.publicEmail)
        : trust !== "OFFICIAL_VERIFIED"
          ? trustNote(trust)
          : null,
    ),
  });

  // Re-enforce approved email + score constraints after sanitize.
  sanitized.publicEmail = publicEmail;
  sanitized.websiteScore = allowsWebsiteScore(sanitized.websiteStatus)
    ? sanitized.websiteScore
    : null;
  if (websiteStatus === "GOOD" || websiteStatus === "VERY_GOOD") {
    sanitized.priority = "QUALIFIED_OUT";
  }

  return {
    ...sanitized,
    salesStatus: "NEW",
    isFinalTop20: false,
    finalRank: null,
  };
}

async function main() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL missing");

  const csvPath = path.resolve(process.cwd(), "SALKAY_FINAL_VERIFIED_SAFE_DRY_RUN.csv");
  const trustMap = readEmailTrustByRow(csvPath);
  const parsed = parseRestaurantLeadCsv(readFileSync(csvPath, "utf8"));
  assert(!parsed.parseError, parsed.parseError ?? "CSV parse error");
  assert(parsed.rows.length === 56, `Expected 56 CSV rows, got ${parsed.rows.length}`);

  const prisma = getPrisma();
  const beforeTotal = await prisma.restaurantLead.count();
  assert(beforeTotal === EXPECTED_BEFORE, `BEFORE TOTAL ${beforeTotal} !== ${EXPECTED_BEFORE}`);

  const findRow = (predicate: (row: CsvRow) => boolean) => {
    const row = parsed.rows.find(predicate);
    assert(row, "CSV row not found for approved update/create");
    return row;
  };

  const rowByExact = (name: string, district: string) =>
    findRow(
      (row) =>
        normalizeLeadKey(row.restaurantName) === normalizeLeadKey(name) &&
        normalizeLeadKey(row.district) === normalizeLeadKey(district),
    );

  const rowIncludes = (fragment: string, district?: string) =>
    findRow(
      (row) =>
        row.restaurantName.includes(fragment) &&
        (!district || normalizeLeadKey(row.district) === normalizeLeadKey(district)),
    );

  // Classify CSV rows using dry-run report actions for NEW set.
  const dryRun = JSON.parse(
    readFileSync(path.resolve(process.cwd(), "scripts/output/safe-dry-run-report.json"), "utf8"),
  ) as {
    results: Array<{
      index: number;
      restaurantName: string;
      district: string;
      action: string;
    }>;
  };

  const newIndexes = new Set(
    dryRun.results.filter((r) => r.action === "NEW").map((r) => r.index),
  );
  assert(newIndexes.size === 40, `Expected 40 NEW indexes, got ${newIndexes.size}`);

  const adileCsv = rowIncludes("Adile Sultan", "Üsküdar");
  const umraniyeAdile = await prisma.restaurantLead.findFirst({
    where: {
      restaurantName: { contains: "Adile Sultan" },
      district: { equals: "Ümraniye", mode: "insensitive" },
    },
  });
  assert(umraniyeAdile, "Ümraniye Adile Sultan must exist and remain untouched");
  const umraniyeSnapshot = { ...umraniyeAdile };

  type UpdateSpec = {
    id: string;
    label: string;
    patch: (existing: RestaurantLead, csv: CsvRow) => Prisma.RestaurantLeadUpdateInput;
    csv: CsvRow;
  };

  const updates: UpdateSpec[] = [
    {
      id: "cmtkih2v80012t6w0ef99xmka",
      label: "Bridge Nakkaştepe",
      csv: rowByExact("Bridge Nakkaştepe", "Üsküdar"),
      patch: (existing, csv) => ({
        address: csv.address,
        websiteScore: 3.7,
        leadScore: 8.8,
        // HISTORICAL — do not touch publicEmail
        publicEmail: existing.publicEmail,
        outreachNotes: appendNotes(
          existing.outreachNotes,
          trustNote("HISTORICAL", csv.publicEmail),
        ),
      }),
    },
    {
      id: "cmtkih2v9001bt6w0894fg052",
      label: "Bağevi Kebapçısı",
      csv: rowByExact("Bağevi Kebapçısı", "Üsküdar"),
      patch: (existing, csv) => ({
        address: csv.address,
        website: normalizeWebsite(csv.website),
        websiteDomain: normalizeDomain(csv.website),
        websiteStatus: "VERY_WEAK" as RestaurantWebsiteStatus,
        websiteScore: 2.7,
        leadScore: 9.2,
        publicEmail: existing.publicEmail, // NOT_FOUND — keep null
        outreachNotes: appendNotes(existing.outreachNotes, trustNote("NOT_FOUND")),
      }),
    },
    {
      id: "cmtkih2v90017t6w005oevw33",
      label: "Seyir Üsküdar Kafe",
      csv: rowByExact("Seyir Üsküdar Kafe", "Üsküdar"),
      patch: (existing, csv) => ({
        address: csv.address,
        leadScore: 9.4,
        websiteStatus: "NO_WEBSITE" as RestaurantWebsiteStatus,
        websiteScore: null,
        publicEmail: existing.publicEmail,
        outreachNotes: appendNotes(existing.outreachNotes, trustNote("NOT_FOUND")),
      }),
    },
    {
      id: "cmtkih2v90019t6w0e80f4w3u",
      label: "KAF Cafe Restoran",
      csv: rowIncludes("KAF Cafe", "Üsküdar"),
      patch: (existing, csv) => ({
        phone: existing.phone,
        address: csv.address,
        website: existing.website,
        websiteDomain: existing.websiteDomain,
        websiteStatus: "GOOD" as RestaurantWebsiteStatus,
        websiteScore: 7.0,
        leadScore: 7.2,
        priority: "QUALIFIED_OUT" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
      }),
    },
    {
      id: "cmtkqgyg20008t63kbnpjpu0t",
      label: "Cremia Cafe & Rest",
      csv: rowByExact("Cremia Cafe & Rest", "Üsküdar"),
      patch: (existing, csv) => ({
        phone: existing.phone,
        address: csv.address,
        websiteStatus: "WEAK" as RestaurantWebsiteStatus,
        websiteScore: 3.4,
        leadScore: 9.1,
        priority: "HIGH" as RestaurantLeadPriority,
        outreachNotes: appendNotes(
          existing.outreachNotes,
          `alternative phone: ${csv.phone}`,
        ),
      }),
    },
    {
      id: "cmtkqgz36000qt63ktofcd8zn",
      label: "Nazenin Restaurant",
      csv: rowIncludes("Nazenin", "Ataşehir"),
      patch: (existing, csv) => ({
        phone: csv.phone,
        address: csv.address,
        website: existing.website ?? normalizeWebsite(csv.website),
        websiteDomain: existing.websiteDomain ?? normalizeDomain(csv.website),
        websiteStatus: "IMPROVABLE" as RestaurantWebsiteStatus,
        websiteScore: 5.4,
        leadScore: 7.7,
        priority: "MEDIUM" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
      }),
    },
    {
      id: "cmtkqgywr000lt63kvk8fwuk5",
      label: "Madalyalı Restoran",
      csv: rowByExact("Madalyalı Restoran", "Ataşehir"),
      patch: (existing, csv) => ({
        phone: existing.phone,
        address: csv.address,
        websiteStatus: "IMPROVABLE" as RestaurantWebsiteStatus,
        websiteScore: 5.8,
        leadScore: 8.3,
        priority: "HIGH" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
      }),
    },
    {
      id: "cmtkqgyvi000kt63kbafazb7l",
      label: "Köz Kanat Ataşehir",
      csv: rowByExact("Köz Kanat Ataşehir", "Ataşehir"),
      patch: (existing, csv) => ({
        address: csv.address,
        websiteStatus: "IMPROVABLE" as RestaurantWebsiteStatus,
        websiteScore: 5.2,
        leadScore: 8.4,
        priority: "HIGH" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
        outreachNotes: appendNotes(
          existing.outreachNotes,
          existing.address
            ? `previous address/branch note: ${existing.address}`
            : "Kartal şube bilgisi korunmalı",
        ),
      }),
    },
    {
      id: "cmtkih2v9001at6w0ncj1mh3w",
      label: "Katibim",
      csv: rowIncludes("Katibim", "Üsküdar"),
      patch: (existing, csv) => ({
        phone: existing.phone,
        address: csv.address,
        publicEmail: "info@katibim.com.tr",
        website: normalizeWebsite(csv.website),
        websiteDomain: normalizeDomain(csv.website),
        websiteStatus: "WEAK" as RestaurantWebsiteStatus,
        websiteScore: 4.2,
        leadScore: 8.8,
        priority: "HIGH" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
        outreachNotes: appendNotes(existing.outreachNotes, "emailTrust: OFFICIAL_VERIFIED"),
      }),
    },
    {
      id: "cmtkqgz8a000ut63k1b6y00os",
      label: "Sapa İstanbul",
      csv: rowByExact("Sapa İstanbul", "Ataşehir"),
      patch: (_existing, csv) => ({
        phone: csv.phone,
        address: csv.address,
        websiteStatus: "GOOD" as RestaurantWebsiteStatus,
        websiteScore: 8.0,
        leadScore: 5.2,
        priority: "QUALIFIED_OUT" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood,
      }),
    },
    {
      id: "cmtkqgyp0000ft63k7mw09hhn",
      label: "Hatay Gurme",
      csv: rowIncludes("Hatay Gurme", "Ataşehir"),
      patch: (existing, csv) => ({
        phone: csv.phone,
        address: csv.address,
        website: existing.website,
        websiteDomain: existing.websiteDomain,
        websiteStatus: "GOOD" as RestaurantWebsiteStatus,
        websiteScore: 8.0,
        leadScore: 6.8,
        priority: "QUALIFIED_OUT" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
      }),
    },
    {
      id: "cmtkqgzii0012t63kdc0ej005",
      label: "Zekibey İskender",
      csv: rowByExact("Zekibey İskender", "Üsküdar"),
      patch: (existing, csv) => ({
        phone: existing.phone,
        address: csv.address,
        website: existing.website,
        websiteDomain: existing.websiteDomain,
        websiteStatus: "IMPROVABLE" as RestaurantWebsiteStatus,
        websiteScore: 5.2,
        leadScore: 8.2,
        priority: "HIGH" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
      }),
    },
    {
      id: "cmtkih2v9001it6w0vndtt881",
      label: "Kudüs Han",
      csv: rowByExact("Kudüs Han", "Üsküdar"),
      patch: (existing, csv) => ({
        phone: existing.phone,
        address: csv.address,
        website: null,
        websiteDomain: null,
        publicEmail: null,
        websiteStatus: "VERY_WEAK" as RestaurantWebsiteStatus,
        websiteScore: 2.5,
        leadScore: 9.3,
        priority: "HIGH" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
        outreachNotes: appendNotes(existing.outreachNotes, trustNote("NOT_FOUND")),
      }),
    },
    {
      id: "cmtqc7lx50006t6hww6g366jw",
      label: "Hatice Anne Ev Yemekleri",
      csv: rowIncludes("Hatice Anne"),
      patch: (existing, csv) => ({
        phone: existing.phone,
        address: csv.address,
        websiteStatus: "VERY_WEAK" as RestaurantWebsiteStatus,
        websiteScore: 2.0,
        leadScore: 9.5,
        priority: "HIGH" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
        outreachNotes: appendNotes(existing.outreachNotes, trustNote("NOT_FOUND")),
      }),
    },
    {
      id: "cmtkih2v9001jt6w0wolcfsb1",
      label: "Hakiki Kebap",
      csv: rowByExact("Hakiki Kebap", "Üsküdar"),
      patch: (existing, csv) => ({
        phone: existing.phone,
        publicEmail: existing.publicEmail,
        website: existing.website,
        websiteDomain: existing.websiteDomain,
        address: csv.address,
        websiteStatus: "IMPROVABLE" as RestaurantWebsiteStatus,
        websiteScore: 5.8,
        leadScore: 8.5,
        priority: "HIGH" as RestaurantLeadPriority,
        neighborhood: csv.neighborhood ?? existing.neighborhood,
      }),
    },
  ];

  assert(updates.length === EXPECTED_UPDATE, `Expected ${EXPECTED_UPDATE} updates, got ${updates.length}`);

  const createRows: Array<{ row: CsvRow; trust: EmailTrust; label: string }> = [];
  for (const row of parsed.rows) {
    if (!newIndexes.has(row.index)) continue;
    createRows.push({
      row,
      trust: trustMap.get(row.index) ?? "UNKNOWN",
      label: `${row.restaurantName} (${row.district})`,
    });
  }
  assert(createRows.length === 40, `Expected 40 create rows, got ${createRows.length}`);

  // Adile Altunizade SEPARATE_BRANCH create
  createRows.push({
    row: {
      ...adileCsv,
      district: "Üsküdar",
      neighborhood: "Altunizade / Barbaros",
      region: "ANADOLU",
    },
    trust: trustMap.get(adileCsv.index) ?? "OFFICIAL_VERIFIED",
    label: "Adile Sultan Altunizade (SEPARATE_BRANCH)",
  });
  assert(createRows.length === EXPECTED_CREATE, `Expected ${EXPECTED_CREATE} creates`);

  const warnings: string[] = [];
  const createdNames: string[] = [];
  const updatedLabels: string[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      const existingAll = await tx.restaurantLead.findMany();
      const pool = existingAll.map(toMatchCandidate);

      // Preflight: no unexpected match for NEW creates
      for (const item of createRows) {
        const decision = matchRestaurantLeadAgainstPool(
          {
            restaurantName: item.row.restaurantName,
            nameNorm: normalizeLeadKey(item.row.restaurantName),
            district: item.row.district,
            districtNorm: normalizeLeadKey(item.row.district),
            address: item.row.address,
            phone: item.row.phone,
            website: item.row.website,
            websiteDomain: item.row.websiteDomain,
          },
          pool,
        );

        const isAdileAltunizade = item.label.includes("Adile Sultan Altunizade");

        if (isAdileAltunizade) {
          if (decision.status === "match") {
            throw new Error(
              `Adile Altunizade unexpectedly auto-matched: ${decision.existing.restaurantName}`,
            );
          }
          if (decision.status === "review_required") {
            warnings.push(
              `Adile Altunizade SEPARATE_BRANCH collision (${decision.reason}): ${decision.detail}`,
            );
          }
          continue;
        }

        if (decision.status === "match") {
          throw new Error(
            `Unexpected match for NEW "${item.label}": ${decision.reason} → ${decision.existing.restaurantName}`,
          );
        }
        if (decision.status === "review_required") {
          throw new Error(
            `Unexpected REVIEW_REQUIRED for NEW "${item.label}": ${decision.detail}`,
          );
        }
      }

      // CREATE 41
      for (const item of createRows) {
        const data = buildCreateData(item.row, item.trust);
        // Unique key check
        const clash = await tx.restaurantLead.findFirst({
          where: { nameNorm: data.nameNorm, districtNorm: data.districtNorm },
          select: { id: true, restaurantName: true },
        });
        if (clash) {
          throw new Error(
            `Unique clash creating "${item.label}" vs existing ${clash.restaurantName} (${clash.id})`,
          );
        }
        if (
          !allowsWebsiteScore(data.websiteStatus as RestaurantWebsiteStatus) &&
          data.websiteScore != null
        ) {
          throw new Error(`Constraint violation on create ${item.label}: websiteScore not null`);
        }
        if (
          item.trust !== "OFFICIAL_VERIFIED" &&
          data.publicEmail
        ) {
          throw new Error(`Unsafe email on create ${item.label}`);
        }
        await tx.restaurantLead.create({ data });
        createdNames.push(item.label);
        // Refresh pool for subsequent creates in same txn
        pool.push(
          toMatchCandidate({
            id: `pending-${createdNames.length}`,
            restaurantName: String(data.restaurantName),
            district: String(data.district),
            nameNorm: String(data.nameNorm),
            districtNorm: String(data.districtNorm),
            address: (data.address as string) ?? null,
            phone: (data.phone as string) ?? null,
            website: (data.website as string) ?? null,
            websiteDomain: (data.websiteDomain as string) ?? null,
          }),
        );
      }

      // UPDATE 15
      for (const spec of updates) {
        const existing = await tx.restaurantLead.findUnique({ where: { id: spec.id } });
        assert(existing, `Update target missing: ${spec.label} (${spec.id})`);

        const protectedBefore = {
          contactStatus: existing.contactStatus,
          salesStatus: existing.salesStatus,
          isFinalTop20: existing.isFinalTop20,
          finalRank: existing.finalRank,
          createdAt: existing.createdAt,
          outreachNotes: existing.outreachNotes,
        };

        const patch = spec.patch(existing, spec.csv);
        // Never allow protected resets
        delete (patch as { contactStatus?: unknown }).contactStatus;
        delete (patch as { salesStatus?: unknown }).salesStatus;
        delete (patch as { isFinalTop20?: unknown }).isFinalTop20;
        delete (patch as { finalRank?: unknown }).finalRank;
        delete (patch as { createdAt?: unknown }).createdAt;

        const nextStatus =
          (patch.websiteStatus as RestaurantWebsiteStatus | undefined) ?? existing.websiteStatus;
        if ("websiteScore" in patch) {
          if (!allowsWebsiteScore(nextStatus) && patch.websiteScore != null) {
            throw new Error(`Constraint: ${spec.label} would set websiteScore on ${nextStatus}`);
          }
        }

        await tx.restaurantLead.update({ where: { id: spec.id }, data: patch });
        const after = await tx.restaurantLead.findUniqueOrThrow({ where: { id: spec.id } });

        assert(after.contactStatus === protectedBefore.contactStatus, `${spec.label} contactStatus changed`);
        assert(after.salesStatus === protectedBefore.salesStatus, `${spec.label} salesStatus changed`);
        assert(after.isFinalTop20 === protectedBefore.isFinalTop20, `${spec.label} isFinalTop20 changed`);
        assert(after.finalRank === protectedBefore.finalRank, `${spec.label} finalRank changed`);
        assert(
          after.createdAt.getTime() === protectedBefore.createdAt.getTime(),
          `${spec.label} createdAt changed`,
        );
        if (protectedBefore.outreachNotes) {
          assert(
            (after.outreachNotes ?? "").includes(protectedBefore.outreachNotes),
            `${spec.label} outreachNotes overwritten`,
          );
        }
        updatedLabels.push(spec.label);
      }

      // Ümraniye Adile untouched
      const umraniyeAfter = await tx.restaurantLead.findUniqueOrThrow({
        where: { id: umraniyeSnapshot.id },
      });
      assert(umraniyeAfter.phone === umraniyeSnapshot.phone, "Ümraniye Adile phone changed");
      assert(umraniyeAfter.address === umraniyeSnapshot.address, "Ümraniye Adile address changed");
      assert(
        umraniyeAfter.district === umraniyeSnapshot.district,
        "Ümraniye Adile district changed",
      );
      assert(
        umraniyeAfter.updatedAt.getTime() === umraniyeSnapshot.updatedAt.getTime(),
        "Ümraniye Adile was modified",
      );

      const afterCount = await tx.restaurantLead.count();
      assert(
        afterCount === EXPECTED_AFTER,
        `AFTER TOTAL ${afterCount} !== ${EXPECTED_AFTER} (created=${createdNames.length}, updated=${updatedLabels.length})`,
      );
      assert(createdNames.length === EXPECTED_CREATE, `created ${createdNames.length}`);
      assert(updatedLabels.length === EXPECTED_UPDATE, `updated ${updatedLabels.length}`);

      // Duplicate key QA
      const all = await tx.restaurantLead.findMany({
        select: {
          nameNorm: true,
          districtNorm: true,
          websiteStatus: true,
          websiteScore: true,
        },
      });
      const keys = all.map((r) => `${r.nameNorm}|${r.districtNorm}`);
      const keySet = new Set(keys);
      assert(keySet.size === all.length, "exact duplicate nameNorm+districtNorm detected");

      const badScores = all.filter(
        (r) => !allowsWebsiteScore(r.websiteStatus) && r.websiteScore != null,
      );
      assert(badScores.length === 0, `websiteScore constraint violations: ${badScores.length}`);
    },
    {
      maxWait: 60000,
      timeout: 180000,
    });
  } catch (error) {
    console.error("ROLLBACK — transaction failed, no partial import.");
    console.error(error);
    const still = await prisma.restaurantLead.count();
    console.error(`DB count after failed txn: ${still} (expected still ${EXPECTED_BEFORE})`);
    process.exitCode = 1;
    return;
  }

  // Post-commit QA
  const afterTotal = await prisma.restaurantLead.count();
  const all = await prisma.restaurantLead.findMany();
  const keySet = new Set(all.map((r) => `${r.nameNorm}|${r.districtNorm}`));
  const badScores = all.filter(
    (r) => !allowsWebsiteScore(r.websiteStatus) && r.websiteScore != null,
  );
  const readyRows = await prisma.restaurantLead.findMany({
    where: readyForOutreachWhere(),
    select: { outreachNotes: true, salesStatus: true, priority: true },
  });
  const readyCount = readyRows.filter((r) => !isClosedOrHoldRestaurant(r)).length;
  const qualifiedInReady = readyRows.filter(
    (r) => r.priority === "QUALIFIED_OUT" && !isClosedOrHoldRestaurant(r),
  ).length;

  // Spot-check a few finals
  const kaf = await prisma.restaurantLead.findUniqueOrThrow({
    where: { id: "cmtkih2v90019t6w0e80f4w3u" },
  });
  const hatay = await prisma.restaurantLead.findUniqueOrThrow({
    where: { id: "cmtkqgyp0000ft63k7mw09hhn" },
  });
  const hakiki = await prisma.restaurantLead.findUniqueOrThrow({
    where: { id: "cmtkih2v9001jt6w0wolcfsb1" },
  });
  const kudus = await prisma.restaurantLead.findUniqueOrThrow({
    where: { id: "cmtkih2v9001it6w0vndtt881" },
  });
  const adileNew = await prisma.restaurantLead.findFirst({
    where: {
      nameNorm: normalizeLeadKey(adileCsv.restaurantName),
      districtNorm: normalizeLeadKey("Üsküdar"),
    },
  });

  const report = {
    BEFORE_TOTAL: beforeTotal,
    CREATED: createdNames.length,
    UPDATED: updatedLabels.length,
    DELETED: 0,
    SKIPPED: 0,
    ERROR: 0,
    AFTER_TOTAL: afterTotal,
    createdNames,
    updatedLabels,
    warnings,
    qa: {
      exactDuplicateKeys: all.length - keySet.size,
      badWebsiteScores: badScores.length,
      readyForOutreach: readyCount,
      qualifiedOutInReady: qualifiedInReady,
      kaf: {
        websiteStatus: kaf.websiteStatus,
        websiteScore: kaf.websiteScore,
        leadScore: kaf.leadScore,
        priority: kaf.priority,
      },
      hatay: {
        websiteStatus: hatay.websiteStatus,
        websiteScore: hatay.websiteScore,
        leadScore: hatay.leadScore,
        priority: hatay.priority,
      },
      hakiki: {
        websiteStatus: hakiki.websiteStatus,
        websiteScore: hakiki.websiteScore,
        leadScore: hakiki.leadScore,
        priority: hakiki.priority,
      },
      kudus: {
        websiteStatus: kudus.websiteStatus,
        websiteScore: kudus.websiteScore,
      },
      adileAltunizadeCreated: Boolean(adileNew),
      adileAltunizadeId: adileNew?.id ?? null,
      umraniyeAdileUntouched: true,
    },
  };

  writeFileSync(
    path.resolve(process.cwd(), "scripts/output/approved-import-report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  console.log("=== APPROVED IMPORT COMPLETE ===");
  console.log(`BEFORE TOTAL: ${report.BEFORE_TOTAL}`);
  console.log(`CREATED: ${report.CREATED}`);
  console.log(`UPDATED: ${report.UPDATED}`);
  console.log(`DELETED: ${report.DELETED}`);
  console.log(`SKIPPED: ${report.SKIPPED}`);
  console.log(`ERROR: ${report.ERROR}`);
  console.log(`AFTER TOTAL: ${report.AFTER_TOTAL}`);
  console.log(`READY FOR OUTREACH: ${readyCount}`);
  console.log(`exact duplicate keys: ${report.qa.exactDuplicateKeys}`);
  console.log(`bad websiteScores: ${report.qa.badWebsiteScores}`);
  console.log(`QUALIFIED_OUT in READY: ${qualifiedInReady}`);
  if (warnings.length) {
    console.log("WARNINGS:");
    for (const w of warnings) console.log(` - ${w}`);
  }
  console.log("\nCREATED:");
  for (const name of createdNames) console.log(` - ${name}`);
  console.log("\nUPDATED:");
  for (const name of updatedLabels) console.log(` - ${name}`);
  console.log("\nDONE — no email/WhatsApp/SMS sent.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
