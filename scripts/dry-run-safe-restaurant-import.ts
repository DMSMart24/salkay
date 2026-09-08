/**
 * READ-ONLY dry run: compare SALKAY_FINAL_VERIFIED_SAFE_DRY_RUN.csv vs RestaurantLead DB.
 * NO create / update / delete / migration / email send.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RestaurantLead, RestaurantLeadPriority, RestaurantWebsiteStatus } from "@prisma/client";
import { normalizeDomain } from "../src/lib/admin/normalize";
import {
  isOfficialWebsiteDomain,
  matchRestaurantLeadAgainstPool,
  normalizeAddressKey,
  resolveWebsiteDomain,
  toMatchCandidate,
} from "../src/lib/admin/restaurant-lead-duplicates";
import {
  allowsWebsiteScore,
  blankToNull,
  isClosedOrHoldRestaurant,
  normalizePhoneDigits,
  readyForOutreachWhere,
} from "../src/lib/admin/restaurant-leads";
import { parseRestaurantLeadCsv, scalarEqual } from "../src/lib/admin/restaurant-leads-import";
import { getPrisma, isDatabaseConfigured } from "../src/lib/admin/prisma";

type EmailTrust =
  | "OFFICIAL_VERIFIED"
  | "THIRD_PARTY_VERIFIED"
  | "NOT_VERIFIED"
  | "NOT_FOUND"
  | "HISTORICAL"
  | "UNKNOWN";

type DryAction = "NEW" | "UPDATE" | "SKIP" | "DUPLICATE" | "REVIEW_REQUIRED" | "ERROR";

type FieldDiff = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  wouldApply: boolean;
  note?: string;
};

type DryRowResult = {
  index: number;
  restaurantName: string;
  district: string;
  action: DryAction;
  reason: string;
  matchReason?: string;
  matched?: { id: string; restaurantName: string; district: string } | null;
  emailTrust: EmailTrust;
  diffs: FieldDiff[];
  conflicts: {
    phone: boolean;
    email: boolean;
    address: boolean;
    domain: boolean;
  };
  qaFlags: string[];
};

const WEBSITE_RANK: Record<RestaurantWebsiteStatus, number> = {
  NOT_VERIFIED: 0,
  NO_WEBSITE: 1,
  VERY_WEAK: 2,
  WEAK: 3,
  IMPROVABLE: 4,
  GOOD: 5,
  VERY_GOOD: 6,
};

const DIFF_FIELDS = [
  "phone",
  "publicEmail",
  "address",
  "website",
  "websiteStatus",
  "websiteScore",
  "leadScore",
  "priority",
] as const;

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
  if (!folded) return "UNKNOWN";
  if (folded === "officialverified") return "OFFICIAL_VERIFIED";
  if (folded === "thirdpartyverified") return "THIRD_PARTY_VERIFIED";
  if (folded === "notverified") return "NOT_VERIFIED";
  if (folded === "notfound") return "NOT_FOUND";
  if (folded === "historical") return "HISTORICAL";
  return "UNKNOWN";
}

function readEmailTrustByRow(csvPath: string): Map<number, EmailTrust> {
  const source = readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const lines = source.split(/\r?\n/).filter((line) => line.trim());
  const headers = splitCsvLine(lines[0] ?? "").map((h) => fold(h));
  const trustIdx = headers.findIndex((h) => h === "emailtrust");
  const map = new Map<number, EmailTrust>();
  if (trustIdx < 0) return map;
  lines.slice(1).forEach((line, i) => {
    const cells = splitCsvLine(line);
    map.set(i + 2, parseEmailTrust(cells[trustIdx] ?? ""));
  });
  return map;
}

function phoneKey(value?: string | null) {
  const digits = normalizePhoneDigits(value);
  return digits.length >= 10 ? digits : "";
}

function fmt(value: unknown) {
  if (value === null || value === undefined || value === "") return "(empty)";
  return String(value);
}

function isWebsiteDowngrade(from: RestaurantWebsiteStatus, to: RestaurantWebsiteStatus) {
  if (from === to) return false;
  if (from === "NOT_VERIFIED") return false;
  return WEBSITE_RANK[to] < WEBSITE_RANK[from];
}

function safeEmailForPublic(
  email: string | null | undefined,
  trust: EmailTrust,
): string | null {
  const value = blankToNull(email);
  if (!value) return null;
  if (trust !== "OFFICIAL_VERIFIED") return null;
  return value;
}

function evaluateMatchedRow(
  existing: RestaurantLead,
  row: ReturnType<typeof parseRestaurantLeadCsv>["rows"][number],
  emailTrust: EmailTrust,
  matchReason: string,
): Pick<DryRowResult, "action" | "reason" | "diffs" | "conflicts" | "qaFlags"> {
  const conflicts = { phone: false, email: false, address: false, domain: false };
  const qaFlags: string[] = [];
  const diffs: FieldDiff[] = [];
  const reviewReasons: string[] = [];

  const csvPhone = blankToNull(row.phone);
  const csvEmailRaw = blankToNull(row.publicEmail);
  const csvEmailSafe = safeEmailForPublic(csvEmailRaw, emailTrust);
  const csvAddress = blankToNull(row.address);
  const csvWebsite = blankToNull(row.website);
  const csvDomain = resolveWebsiteDomain({ website: csvWebsite, websiteDomain: row.websiteDomain });
  const existingDomain = resolveWebsiteDomain(existing);

  const existingPhone = blankToNull(existing.phone);
  const existingEmail = blankToNull(existing.publicEmail);
  const existingAddress = blankToNull(existing.address);
  const existingWebsite = blankToNull(existing.website);

  // Phone
  {
    const oldP = existingPhone;
    const newP = csvPhone;
    const same =
      !oldP && !newP
        ? true
        : Boolean(oldP && newP && phoneKey(oldP) === phoneKey(newP));
    let wouldApply = false;
    let note = "korundu";
    if (!oldP && newP) {
      wouldApply = true;
      note = "boş alanı doldurur";
    } else if (oldP && newP && !same) {
      conflicts.phone = true;
      reviewReasons.push("phone conflict (mevcut korunur, alternatif notes'a)");
      note = "CONFLICT — mevcut phone korunur; CSV phone notes append adayı";
    } else if (oldP && !newP) {
      note = "CSV boş — mevcut phone silinmez";
    }
    diffs.push({ field: "phone", oldValue: oldP, newValue: newP, wouldApply, note });
  }

  // Email
  {
    const oldE = existingEmail;
    let proposed = csvEmailSafe;
    let wouldApply = false;
    let note = "korundu";
    if (emailTrust !== "OFFICIAL_VERIFIED" && csvEmailRaw) {
      note = `${emailTrust} — publicEmail'e YAZILMAZ`;
      proposed = null;
      if (emailTrust === "THIRD_PARTY_VERIFIED" || emailTrust === "HISTORICAL" || emailTrust === "NOT_VERIFIED") {
        qaFlags.push(`email blocked from publicEmail (${emailTrust})`);
      }
      if (oldE && csvEmailRaw && oldE.toLowerCase() !== csvEmailRaw.toLowerCase()) {
        conflicts.email = true;
      }
    } else if (emailTrust === "OFFICIAL_VERIFIED") {
      if (!oldE && proposed) {
        wouldApply = true;
        note = "OFFICIAL_VERIFIED — boş email doldurulur";
      } else if (oldE && proposed && oldE.toLowerCase() !== proposed.toLowerCase()) {
        conflicts.email = true;
        reviewReasons.push("email conflict (iki farklı official aday)");
        note = "CONFLICT — mevcut email korunur; manuel review";
        wouldApply = false;
      } else if (oldE && !proposed) {
        note = "CSV email yok/uygunsuz — mevcut silinmez";
      }
    } else if (!csvEmailRaw) {
      note = "CSV email yok — mevcut silinmez";
    }
    diffs.push({
      field: "publicEmail",
      oldValue: oldE,
      newValue: emailTrust === "OFFICIAL_VERIFIED" ? proposed : csvEmailRaw,
      wouldApply,
      note,
    });
    if (
      emailTrust !== "OFFICIAL_VERIFIED" &&
      csvEmailRaw &&
      wouldApply
    ) {
      qaFlags.push("BUG: non-official email wouldApply=true");
    }
  }

  // Address
  {
    const oldA = existingAddress;
    const newA = csvAddress;
    const same =
      normalizeAddressKey(oldA) === normalizeAddressKey(newA) && Boolean(oldA || newA);
    let wouldApply = false;
    let note = "korundu";
    if (!oldA && newA) {
      wouldApply = true;
      note = "boş adresi doldurur";
    } else if (oldA && newA && normalizeAddressKey(oldA) !== normalizeAddressKey(newA)) {
      conflicts.address = true;
      reviewReasons.push("address conflict");
      note = "CONFLICT — mevcut address korunur; CSV alternatif notes append";
    } else if (oldA && !newA) {
      note = "CSV boş — mevcut address silinmez";
    } else if (same) {
      note = "aynı/normalize eşit";
    }
    diffs.push({ field: "address", oldValue: oldA, newValue: newA, wouldApply, note });
  }

  // Website / domain
  {
    const oldW = existingWebsite;
    const newW = csvWebsite;
    const newIsOfficial = Boolean(csvDomain && isOfficialWebsiteDomain(csvDomain));
    const oldIsOfficial = Boolean(existingDomain && isOfficialWebsiteDomain(existingDomain));
    let wouldApply = false;
    let note = "korundu";
    if (newW && !newIsOfficial && oldIsOfficial) {
      conflicts.domain = true;
      reviewReasons.push("third-party/social URL cannot replace official website");
      note = "CONFLICT — üçüncü taraf URL official site üzerine yazılmaz";
    } else if (!oldW && newW && newIsOfficial) {
      wouldApply = true;
      note = "boş official website doldurulur";
    } else if (oldW && newW && normalizeDomain(oldW) !== normalizeDomain(newW)) {
      if (oldIsOfficial && newIsOfficial) {
        conflicts.domain = true;
        reviewReasons.push("domain conflict (iki official domain)");
        note = "CONFLICT — mevcut website korunur";
      } else if (!oldIsOfficial && newIsOfficial) {
        wouldApply = true;
        note = "üçüncü taraf/zayıf URL → official ile iyileştirilir";
      } else {
        note = "CSV website uygulanmaz";
      }
    } else if (oldW && !newW) {
      note = "CSV boş — mevcut website silinmez";
    }
    diffs.push({ field: "website", oldValue: oldW, newValue: newW, wouldApply, note });
  }

  // websiteStatus
  {
    const oldS = existing.websiteStatus;
    const newS = row.websiteStatus;
    let wouldApply = false;
    let note = "korundu";
    if (oldS !== newS) {
      if (isWebsiteDowngrade(oldS, newS)) {
        reviewReasons.push(`websiteStatus downgrade ${oldS} → ${newS}`);
        note = `DOWNGRADE — otomatik uygulanmaz; REVIEW`;
        qaFlags.push(`status downgrade blocked: ${oldS} → ${newS}`);
      } else if (oldS === "NOT_VERIFIED" || WEBSITE_RANK[newS] > WEBSITE_RANK[oldS]) {
        wouldApply = true;
        note = "status iyileştirmesi / doğrulama";
      } else {
        note = "değişiklik uygulanmaz";
      }
    }
    diffs.push({ field: "websiteStatus", oldValue: oldS, newValue: newS, wouldApply, note });
  }

  // websiteScore (constraint)
  {
    const nextStatus = diffs.find((d) => d.field === "websiteStatus")?.wouldApply
      ? row.websiteStatus
      : existing.websiteStatus;
    const constraintNull = !allowsWebsiteScore(nextStatus);
    const oldScore = existing.websiteScore;
    const rawNew = row.websiteScore;
    const constrainedNew = constraintNull ? null : rawNew ?? null;
    let wouldApply = false;
    let note = "korundu";
    if (constraintNull) {
      note =
        rawNew != null
          ? `constraint: ${nextStatus} → websiteScore NULL (research score notes'a: ${rawNew})`
          : `constraint: ${nextStatus} → websiteScore NULL`;
      if (oldScore != null) {
        wouldApply = true;
        note += " — mevcut skor temizlenir (constraint)";
      }
      if (rawNew != null) qaFlags.push("research websiteScore kept out of DB column");
    } else if (oldScore == null && constrainedNew != null) {
      wouldApply = true;
      note = "boş skoru doldurur";
    } else if (
      oldScore != null &&
      constrainedNew != null &&
      !scalarEqual(oldScore, constrainedNew)
    ) {
      // don't blindly overwrite scores — review if lower
      if (constrainedNew < oldScore) {
        reviewReasons.push("websiteScore decrease");
        note = "skor düşüşü — otomatik overwrite yok";
      } else {
        wouldApply = true;
        note = "skor güncellenir";
      }
    }
    diffs.push({
      field: "websiteScore",
      oldValue: oldScore,
      newValue: constrainedNew,
      wouldApply,
      note,
    });
    if (constraintNull && constrainedNew != null) {
      qaFlags.push("BUG: NO_WEBSITE/NOT_VERIFIED would store websiteScore");
    }
  }

  // leadScore
  {
    const oldL = existing.leadScore;
    const newL = row.leadScore;
    let wouldApply = false;
    let note = "korundu";
    if (oldL == null && newL != null) {
      wouldApply = true;
      note = "boş leadScore doldurulur";
    } else if (oldL != null && newL != null && !scalarEqual(oldL, newL)) {
      if (newL < oldL) {
        reviewReasons.push("leadScore decrease");
        note = "düşük skor — otomatik overwrite yok";
      } else {
        wouldApply = true;
        note = "leadScore yükseltilir";
      }
    } else if (oldL != null && newL == null) {
      note = "CSV null — mevcut leadScore 0/null'a çevrilmez";
    }
    diffs.push({ field: "leadScore", oldValue: oldL, newValue: newL, wouldApply, note });
  }

  // priority
  {
    const oldP = existing.priority;
    const newP = row.priority as RestaurantLeadPriority;
    let wouldApply = false;
    let note = "korundu";
    if (oldP === "QUALIFIED_OUT" && newP !== "QUALIFIED_OUT") {
      reviewReasons.push("QUALIFIED_OUT korunmalı — outreach'e çekilmez");
      note = "QUALIFIED_OUT korunur";
      qaFlags.push("QUALIFIED_OUT would stay out of auto outreach upgrade");
    } else if (oldP !== newP) {
      if (oldP === "HIGH" && (newP === "MEDIUM" || newP === "LOW" || newP === "PENDING")) {
        reviewReasons.push(`priority downgrade ${oldP} → ${newP}`);
        note = "priority downgrade — REVIEW";
      } else if (!oldP || oldP === "PENDING") {
        wouldApply = true;
        note = "priority güncellenir";
      } else if (newP === "QUALIFIED_OUT" && (row.websiteStatus === "GOOD" || row.websiteStatus === "VERY_GOOD")) {
        wouldApply = true;
        note = "GOOD/VERY_GOOD → QUALIFIED_OUT";
      } else if (oldP !== newP) {
        reviewReasons.push(`priority change ${oldP} → ${newP}`);
        note = "priority değişikliği manuel review";
      }
    }
    diffs.push({ field: "priority", oldValue: oldP, newValue: newP, wouldApply, note });
  }

  // Protected fields — never apply
  for (const field of ["contactStatus", "outreachNotes", "salesStatus", "isFinalTop20", "finalRank"] as const) {
    const oldValue = existing[field];
    const newValue =
      field === "contactStatus"
        ? row.contactStatus
        : field === "outreachNotes"
          ? row.outreachNotes
          : existing[field];
    diffs.push({
      field,
      oldValue,
      newValue: field === "outreachNotes" && row.outreachNotes ? `(append candidate) ${row.outreachNotes}` : newValue,
      wouldApply: false,
      note:
        field === "outreachNotes"
          ? "silinmez; yalnızca append adayı (apply yok bu dry-run'da)"
          : "KORUNUR — reset/overwrite yok",
    });
  }

  const hasConflict =
    conflicts.phone || conflicts.email || conflicts.address || conflicts.domain || reviewReasons.length > 0;
  const wouldChange = diffs.some((d) => d.wouldApply && DIFF_FIELDS.includes(d.field as (typeof DIFF_FIELDS)[number]));

  if (hasConflict) {
    return {
      action: "REVIEW_REQUIRED",
      reason: `Match (${matchReason}); ${reviewReasons.join("; ") || "conflict"}`,
      diffs,
      conflicts,
      qaFlags,
    };
  }
  if (wouldChange) {
    return {
      action: "UPDATE",
      reason: `Match (${matchReason}); güvenli alan doldurma/iyileştirme`,
      diffs,
      conflicts,
      qaFlags,
    };
  }
  return {
    action: "SKIP",
    reason: `Match (${matchReason}); uygulanabilir güvenli değişiklik yok / mevcut veri korunuyor`,
    diffs,
    conflicts,
    qaFlags,
  };
}

function printDiffBlock(result: DryRowResult) {
  console.log("\n----------------------------------------");
  console.log(`Restaurant: ${result.restaurantName} (${result.district})`);
  console.log(`Action: ${result.action}`);
  console.log(`Reason: ${result.reason}`);
  if (result.matched) {
    console.log(
      `Matched DB record: ${result.matched.restaurantName} (${result.matched.district}) [${result.matched.id}]`,
    );
  } else {
    console.log("Matched DB record: (none)");
  }
  console.log(`emailTrust: ${result.emailTrust}`);
  for (const field of DIFF_FIELDS) {
    const diff = result.diffs.find((d) => d.field === field);
    if (!diff) continue;
    console.log(`${field}:`);
    console.log(`  OLD → NEW: ${fmt(diff.oldValue)} → ${fmt(diff.newValue)}`);
    console.log(`  wouldApply=${diff.wouldApply}${diff.note ? ` · ${diff.note}` : ""}`);
  }
  for (const flag of result.qaFlags) {
    console.log(`  QA: ${flag}`);
  }
}

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL missing");
  }

  const csvPath = path.resolve(process.cwd(), "SALKAY_FINAL_VERIFIED_SAFE_DRY_RUN.csv");
  const csvText = readFileSync(csvPath, "utf8");
  const trustMap = readEmailTrustByRow(csvPath);
  const parsed = parseRestaurantLeadCsv(csvText);
  if (parsed.parseError) {
    throw new Error(parsed.parseError);
  }

  const prisma = getPrisma();
  const beforeCount = await prisma.restaurantLead.count();
  const existing = await prisma.restaurantLead.findMany();
  const pool = existing.map(toMatchCandidate);
  const byId = new Map(existing.map((lead) => [lead.id, lead]));

  const seenKeys = new Map<string, number>();
  const results: DryRowResult[] = [];

  for (const row of parsed.rows) {
    const emailTrust = trustMap.get(row.index) ?? "UNKNOWN";
    const key = `${row.nameNorm}|${row.districtNorm}`;

    if (row.errors.length > 0) {
      results.push({
        index: row.index,
        restaurantName: row.restaurantName,
        district: row.district,
        action: "ERROR",
        reason: row.errors.join("; "),
        emailTrust,
        diffs: [],
        conflicts: { phone: false, email: false, address: false, domain: false },
        qaFlags: [],
      });
      continue;
    }

    const prev = seenKeys.get(key);
    if (prev != null) {
      results.push({
        index: row.index,
        restaurantName: row.restaurantName,
        district: row.district,
        action: "DUPLICATE",
        reason: `In-file duplicate of CSV row ${prev}`,
        emailTrust,
        diffs: [],
        conflicts: { phone: false, email: false, address: false, domain: false },
        qaFlags: ["in-file duplicate"],
      });
      continue;
    }
    seenKeys.set(key, row.index);

    const decision = matchRestaurantLeadAgainstPool(
      {
        restaurantName: row.restaurantName,
        nameNorm: row.nameNorm,
        district: row.district,
        districtNorm: row.districtNorm,
        address: row.address,
        phone: row.phone,
        website: row.website,
        websiteDomain: row.websiteDomain,
      },
      pool,
    );

    if (decision.status === "review_required") {
      const first = decision.candidates[0];
      const existingLead = first ? byId.get(first.id) : null;
      const base = existingLead
        ? evaluateMatchedRow(existingLead, row, emailTrust, decision.reason)
        : {
            action: "REVIEW_REQUIRED" as const,
            reason: decision.detail,
            diffs: [] as FieldDiff[],
            conflicts: { phone: false, email: false, address: false, domain: false },
            qaFlags: [] as string[],
          };
      results.push({
        index: row.index,
        restaurantName: row.restaurantName,
        district: row.district,
        action: "REVIEW_REQUIRED",
        reason: `${decision.detail} | ${base.reason}`,
        matchReason: decision.reason,
        matched: first
          ? { id: first.id, restaurantName: first.restaurantName, district: first.district }
          : null,
        emailTrust,
        diffs: base.diffs,
        conflicts: base.conflicts,
        qaFlags: [...base.qaFlags, "ambiguous matcher"],
      });
      continue;
    }

    if (decision.status === "match") {
      const existingLead = byId.get(decision.existing.id);
      if (!existingLead) {
        results.push({
          index: row.index,
          restaurantName: row.restaurantName,
          district: row.district,
          action: "ERROR",
          reason: "Matched id not found in loaded pool",
          emailTrust,
          diffs: [],
          conflicts: { phone: false, email: false, address: false, domain: false },
          qaFlags: [],
        });
        continue;
      }
      const evaluated = evaluateMatchedRow(
        existingLead,
        row,
        emailTrust,
        `${decision.reason}/${decision.confidence}`,
      );
      results.push({
        index: row.index,
        restaurantName: row.restaurantName,
        district: row.district,
        action: evaluated.action,
        reason: evaluated.reason,
        matchReason: decision.reason,
        matched: {
          id: existingLead.id,
          restaurantName: existingLead.restaurantName,
          district: existingLead.district,
        },
        emailTrust,
        diffs: evaluated.diffs,
        conflicts: evaluated.conflicts,
        qaFlags: evaluated.qaFlags,
      });
      continue;
    }

    // NEW — still validate email/score safety for proposed create payload
    const createEmail = safeEmailForPublic(row.publicEmail, emailTrust);
    const createScore = allowsWebsiteScore(row.websiteStatus) ? row.websiteScore : null;
    const qaFlags: string[] = [];
    if (emailTrust !== "OFFICIAL_VERIFIED" && row.publicEmail) {
      qaFlags.push(`NEW would set publicEmail=null (${emailTrust})`);
    }
    if (!allowsWebsiteScore(row.websiteStatus) && row.websiteScore != null) {
      qaFlags.push("NEW research score → notes only; DB websiteScore null");
    }
    results.push({
      index: row.index,
      restaurantName: row.restaurantName,
      district: row.district,
      action: "NEW",
      reason: "No DB match",
      matched: null,
      emailTrust,
      diffs: [
        {
          field: "publicEmail",
          oldValue: null,
          newValue: createEmail,
          wouldApply: true,
          note: emailTrust === "OFFICIAL_VERIFIED" ? "OFFICIAL_VERIFIED" : `${emailTrust} blocked`,
        },
        {
          field: "websiteScore",
          oldValue: null,
          newValue: createScore,
          wouldApply: true,
          note: allowsWebsiteScore(row.websiteStatus) ? "ok" : "constraint null",
        },
        {
          field: "priority",
          oldValue: null,
          newValue: row.priority,
          wouldApply: true,
        },
        {
          field: "websiteStatus",
          oldValue: null,
          newValue: row.websiteStatus,
          wouldApply: true,
        },
      ],
      conflicts: { phone: false, email: false, address: false, domain: false },
      qaFlags,
    });
  }

  const counts = {
    TOTAL_INPUT: results.length,
    NEW: results.filter((r) => r.action === "NEW").length,
    UPDATE: results.filter((r) => r.action === "UPDATE").length,
    SKIP: results.filter((r) => r.action === "SKIP").length,
    DUPLICATE: results.filter((r) => r.action === "DUPLICATE").length,
    REVIEW_REQUIRED: results.filter((r) => r.action === "REVIEW_REQUIRED").length,
    ERROR: results.filter((r) => r.action === "ERROR").length,
  };

  const conflictCounts = {
    PHONE_CONFLICTS: results.filter((r) => r.conflicts.phone).length,
    EMAIL_CONFLICTS: results.filter((r) => r.conflicts.email).length,
    ADDRESS_CONFLICTS: results.filter((r) => r.conflicts.address).length,
    DOMAIN_CONFLICTS: results.filter((r) => r.conflicts.domain).length,
    AMBIGUOUS_MATCHES: results.filter((r) => r.qaFlags.includes("ambiguous matcher")).length,
  };

  // QA checks (still read-only)
  const afterCount = await prisma.restaurantLead.count();
  const matchedIds = results
    .filter((r) => r.matched?.id)
    .map((r) => r.matched!.id);
  const duplicateMatchIds = matchedIds.filter((id, i) => matchedIds.indexOf(id) !== i);
  const unsafeEmailApplies = results.filter((r) =>
    r.diffs.some(
      (d) =>
        d.field === "publicEmail" &&
        d.wouldApply &&
        r.emailTrust !== "OFFICIAL_VERIFIED" &&
        d.newValue,
    ),
  );
  const badScores = results.filter((r) => {
    const statusDiff = r.diffs.find((d) => d.field === "websiteStatus");
    const scoreDiff = r.diffs.find((d) => d.field === "websiteScore");
    const status = (statusDiff?.wouldApply ? statusDiff.newValue : statusDiff?.oldValue) as
      | RestaurantWebsiteStatus
      | undefined;
    if (!status) return false;
    if (allowsWebsiteScore(status)) return false;
    return scoreDiff?.wouldApply && scoreDiff.newValue != null;
  });
  const contactStatusWouldChange = results.filter((r) =>
    r.diffs.some((d) => d.field === "contactStatus" && d.wouldApply),
  );
  const notesWouldWipe = results.filter((r) =>
    r.diffs.some(
      (d) =>
        d.field === "outreachNotes" &&
        d.wouldApply &&
        d.oldValue &&
        !String(d.newValue ?? "").includes(String(d.oldValue)),
    ),
  );

  const readyWhere = readyForOutreachWhere();
  const readyLeads = await prisma.restaurantLead.findMany({
    where: readyWhere,
    select: {
      id: true,
      priority: true,
      websiteStatus: true,
      contactStatus: true,
      outreachNotes: true,
      salesStatus: true,
    },
  });
  const readyActive = readyLeads.filter((l) => !isClosedOrHoldRestaurant(l));
  const qualifiedInReady = readyActive.filter((l) => l.priority === "QUALIFIED_OUT").length;
  const closedInReady = readyLeads.length - readyActive.length;

  console.log("=== SALKAY SAFE DRY RUN (NO DB WRITE) ===");
  console.log(`CSV: ${csvPath}`);
  console.log(`DB RestaurantLead count before: ${beforeCount}`);
  console.log(`DB RestaurantLead count after dry-run: ${afterCount}`);
  console.log(`writes: 0`);
  console.log("");
  console.log(`TOTAL INPUT: ${counts.TOTAL_INPUT}`);
  console.log(`NEW: ${counts.NEW}`);
  console.log(`UPDATE: ${counts.UPDATE}`);
  console.log(`SKIP: ${counts.SKIP}`);
  console.log(`DUPLICATE: ${counts.DUPLICATE}`);
  console.log(`REVIEW_REQUIRED: ${counts.REVIEW_REQUIRED}`);
  console.log(`ERROR: ${counts.ERROR}`);
  console.log("");
  console.log(`PHONE CONFLICTS: ${conflictCounts.PHONE_CONFLICTS}`);
  console.log(`EMAIL CONFLICTS: ${conflictCounts.EMAIL_CONFLICTS}`);
  console.log(`ADDRESS CONFLICTS: ${conflictCounts.ADDRESS_CONFLICTS}`);
  console.log(`DOMAIN CONFLICTS: ${conflictCounts.DOMAIN_CONFLICTS}`);
  console.log(`AMBIGUOUS MATCHES: ${conflictCounts.AMBIGUOUS_MATCHES}`);

  console.log("\n======== UPDATE + REVIEW_REQUIRED DETAILS ========");
  for (const result of results.filter(
    (r) => r.action === "UPDATE" || r.action === "REVIEW_REQUIRED",
  )) {
    printDiffBlock(result);
  }

  console.log("\n======== NEW (names only) ========");
  for (const result of results.filter((r) => r.action === "NEW")) {
    console.log(
      `- ${result.restaurantName} (${result.district}) · emailTrust=${result.emailTrust} · publicEmailWould=${fmt(
        result.diffs.find((d) => d.field === "publicEmail")?.newValue,
      )}`,
    );
  }

  console.log("\n======== SKIP (names only) ========");
  for (const result of results.filter((r) => r.action === "SKIP")) {
    console.log(
      `- ${result.restaurantName} ↔ ${result.matched?.restaurantName ?? "?"} · ${result.reason}`,
    );
  }

  console.log("\n======== FINAL QA ========");
  console.log(`duplicate CREATE risk (same DB id matched twice): ${duplicateMatchIds.length}`);
  console.log(`unsafe email wouldApply count: ${unsafeEmailApplies.length}`);
  console.log(`NO_WEBSITE/NOT_VERIFIED websiteScore would store non-null: ${badScores.length}`);
  console.log(`contactStatus wouldApply count: ${contactStatusWouldChange.length}`);
  console.log(`outreachNotes wipe wouldApply count: ${notesWouldWipe.length}`);
  console.log(`DB count unchanged: ${beforeCount === afterCount}`);
  console.log(`READY FOR OUTREACH current count: ${readyActive.length}`);
  console.log(`QUALIFIED_OUT inside READY filter: ${qualifiedInReady}`);
  console.log(`closed/HOLD excluded from READY: ${closedInReady}`);
  console.log(
    `branch false-merge risk (ambiguous matcher rows): ${conflictCounts.AMBIGUOUS_MATCHES}`,
  );

  const reportPath = path.resolve(process.cwd(), "scripts/output/safe-dry-run-report.json");
  try {
    writeFileSync(
      reportPath,
      JSON.stringify({ counts, conflictCounts, results, beforeCount, afterCount, writes: 0 }, null, 2),
      "utf8",
    );
    console.log(`\nJSON report: ${reportPath}`);
  } catch {
    // directory may not exist — still ok, console is source of truth
    const fallback = path.resolve(process.cwd(), "safe-dry-run-report.json");
    writeFileSync(
      fallback,
      JSON.stringify({ counts, conflictCounts, results, beforeCount, afterCount, writes: 0 }, null, 2),
      "utf8",
    );
    console.log(`\nJSON report: ${fallback}`);
  }

  console.log("\nDONE — STOPPING. No IMPORT ONAYI received. No DB mutations.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
