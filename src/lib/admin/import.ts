import type { WebsiteStatus } from "@prisma/client";
import {
  normalizeCompanyName,
  normalizeDomain,
  normalizeEmail,
  normalizeWebsite,
} from "@/lib/admin/normalize";
import {
  parseOpportunities,
  parseStringList,
  parseWebsiteScore,
  parseWebsiteStatus,
} from "@/lib/admin/outreach";
import { sanitizeQualificationWrite } from "@/lib/admin/qualification";
import { getPrisma } from "@/lib/admin/prisma";

export type ResearchImportRow = {
  companyName: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  industry?: string | null;
  group?: string | null;
  city?: string | null;
  district?: string | null;
  country?: string | null;
  websiteScore?: number | null;
  websiteStatus?: WebsiteStatus;
  websiteIssues?: string[];
  recommendedServices?: string[];
  leadScore?: number | null;
  scoreDesign?: number | null;
  scoreMobile?: number | null;
  scoreUx?: number | null;
  scoreConversion?: number | null;
  scoreTechnical?: number | null;
  scoreSeo?: number | null;
  opportunities?: string[];
  salesPitch?: string | null;
  instagram?: string | null;
  address?: string | null;
  researchSource?: string | null;
};

export type ParsedImportRow = ResearchImportRow & {
  index: number;
  domain: string | null;
  emailNorm: string | null;
  websiteNorm: string | null;
  errors: string[];
};

export type DuplicateMatch = {
  id: string;
  companyName: string;
  domain: string | null;
  generalEmail: string | null;
  city: string | null;
  reason: "domain" | "email" | "name_city";
};

export type ImportPreviewRow = ParsedImportRow & {
  duplicate: DuplicateMatch | null;
};

const REQUIRED_FIELDS = ["companyName"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function text(value: unknown) {
  if (value === null || value === undefined) return null;
  const next = String(value).trim();
  return next ? next : null;
}

export function parseResearchRow(raw: unknown, index: number): ParsedImportRow {
  const record = asRecord(raw) ?? {};
  const companyName = text(record.companyName) ?? "";
  const website = text(record.website);
  const email = text(record.email);
  const score = parseWebsiteScore(record.websiteScore);
  const leadScore = parseWebsiteScore(record.leadScore);
  const websiteStatus = parseWebsiteStatus(record.websiteStatus);
  const qualification = sanitizeQualificationWrite({
    websiteStatus,
    websiteScore: score === undefined ? null : score,
    leadScore: leadScore === undefined ? null : leadScore,
    scoreDesign: parseWebsiteScore(record.scoreDesign, 2),
    scoreMobile: parseWebsiteScore(record.scoreMobile, 2),
    scoreUx: parseWebsiteScore(record.scoreUx, 2),
    scoreConversion: parseWebsiteScore(record.scoreConversion, 2),
    scoreTechnical: parseWebsiteScore(record.scoreTechnical, 1),
    scoreSeo: parseWebsiteScore(record.scoreSeo, 1),
    opportunities: parseOpportunities(record.opportunities),
  });
  const errors: string[] = [];

  if (!companyName) {
    errors.push("Firma adı gerekli");
  }
  if (record.websiteScore !== undefined && record.websiteScore !== null && record.websiteScore !== "" && score === undefined) {
    errors.push("websiteScore 0–10 olmalı");
  }
  if (record.leadScore !== undefined && record.leadScore !== null && record.leadScore !== "" && leadScore === undefined) {
    errors.push("leadScore 1–10 olmalı");
  }
  if (record.websiteStatus !== undefined && record.websiteStatus !== null && record.websiteStatus !== "" && !websiteStatus) {
    errors.push("websiteStatus geçersiz");
  }
  if (email && !normalizeEmail(email)) {
    errors.push("e-posta geçersiz");
  }

  const websiteNorm = normalizeWebsite(website);
  const domain = normalizeDomain(website || record.domain as string | undefined);
  const emailNorm = normalizeEmail(email);

  return {
    index,
    companyName,
    website: websiteNorm,
    websiteNorm,
    email: emailNorm,
    emailNorm,
    domain,
    phone: text(record.phone),
    industry: text(record.industry),
    group: text(record.group),
    city: text(record.city),
    district: text(record.district),
    country: text(record.country),
    websiteScore: qualification.websiteScore,
    websiteStatus: qualification.websiteStatus,
    websiteIssues: parseStringList(record.websiteIssues).slice(0, 4),
    recommendedServices: parseStringList(record.recommendedServices),
    leadScore: qualification.leadScore,
    scoreDesign: qualification.scoreDesign,
    scoreMobile: qualification.scoreMobile,
    scoreUx: qualification.scoreUx,
    scoreConversion: qualification.scoreConversion,
    scoreTechnical: qualification.scoreTechnical,
    scoreSeo: qualification.scoreSeo,
    opportunities: qualification.opportunities,
    salesPitch: text(record.salesPitch),
    instagram: text(record.instagram),
    address: text(record.address),
    researchSource: text(record.researchSource),
    errors,
  };
}

export function parseResearchJson(source: string): { rows: ParsedImportRow[]; parseError?: string } {
  try {
    const parsed = JSON.parse(source) as unknown;
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return { rows: list.map((item, index) => parseResearchRow(item, index + 1)) };
  } catch {
    return { rows: [], parseError: "JSON okunamadı. Dizi veya tek nesne bekleniyor." };
  }
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
    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

export function parseResearchCsv(source: string): { rows: ParsedImportRow[]; parseError?: string } {
  const lines = source
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) {
    return { rows: [], parseError: "CSV başlık ve en az bir satır içermeli." };
  }

  const headers = splitCsvLine(lines[0] ?? "").map((header) => header.trim());
  const missing = REQUIRED_FIELDS.filter((field) => !headers.includes(field));
  if (missing.length > 0) {
    return { rows: [], parseError: `CSV başlığı eksik: ${missing.join(", ")}` };
  }

  const rows = lines.slice(1).map((line, index) => {
    const cells = splitCsvLine(line);
    const record: Record<string, string> = {};
    headers.forEach((header, cellIndex) => {
      record[header] = cells[cellIndex] ?? "";
    });
    return parseResearchRow(record, index + 2);
  });

  return { rows };
}

export async function attachDuplicates(rows: ParsedImportRow[]): Promise<ImportPreviewRow[]> {
  const prisma = getPrisma();
  const domains = rows.map((row) => row.domain).filter((value): value is string => Boolean(value));
  const emails = rows.map((row) => row.emailNorm).filter((value): value is string => Boolean(value));
  const existing = await prisma.company.findMany({
    where: {
      OR: [
        ...(domains.length ? [{ domain: { in: domains } }] : []),
        ...(emails.length ? [{ generalEmail: { in: emails, mode: "insensitive" as const } }] : []),
        ...(emails.length ? [{ contacts: { some: { emailNorm: { in: emails } } } }] : []),
      ],
    },
    select: {
      id: true,
      companyName: true,
      domain: true,
      generalEmail: true,
      city: true,
    },
    take: 500,
  });

  const extraNames = rows.filter((row) => !row.domain && !row.emailNorm && row.companyName);
  const nameMatches =
    extraNames.length > 0
      ? await prisma.company.findMany({
          where: {
            OR: extraNames.map((row) => ({
              companyName: { equals: row.companyName, mode: "insensitive" as const },
              city: row.city ? { equals: row.city, mode: "insensitive" as const } : undefined,
            })),
          },
          select: {
            id: true,
            companyName: true,
            domain: true,
            generalEmail: true,
            city: true,
          },
          take: 200,
        })
      : [];

  const catalog = [...existing, ...nameMatches];

  return rows.map((row) => {
    const byDomain = row.domain
      ? catalog.find((company) => company.domain && company.domain === row.domain)
      : undefined;
    if (byDomain) {
      return { ...row, duplicate: { ...byDomain, reason: "domain" } };
    }

    const byEmail = row.emailNorm
      ? catalog.find((company) => normalizeEmail(company.generalEmail) === row.emailNorm)
      : undefined;
    if (byEmail) {
      return { ...row, duplicate: { ...byEmail, reason: "email" } };
    }

    const byName = catalog.find(
      (company) =>
        normalizeCompanyName(company.companyName) === normalizeCompanyName(row.companyName) &&
        normalizeCompanyName(company.city) === normalizeCompanyName(row.city),
    );
    if (byName && row.companyName) {
      return { ...row, duplicate: { ...byName, reason: "name_city" } };
    }

    return { ...row, duplicate: null };
  });
}
