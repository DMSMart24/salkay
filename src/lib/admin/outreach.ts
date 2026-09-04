import type { OutreachStatus, Prisma, WebsiteStatus } from "@prisma/client";
import { normalizeEmail } from "@/lib/admin/normalize";
import { getPrisma } from "@/lib/admin/prisma";
import { isAddressSuppressed } from "@/lib/admin/suppression";
import { evaluateEmailOutreachEligibility } from "@/lib/admin/email-outreach";
import {
  isOpportunityType,
  leadPriorityRange,
  type LeadPriorityBand,
  type OpportunityType,
} from "@/lib/admin/qualification";

export const DEFAULT_BATCH_SIZE = 20;
export const MAX_BATCH_SIZE = 50;

export const DEFAULT_GROUPS = [
  { name: "Restoranlar", industry: "Restaurant" },
  { name: "Barlar", industry: "Bar" },
  { name: "İnşaat Firmaları", industry: "Construction" },
  { name: "Mimarlık", industry: "Architecture" },
  { name: "Gayrimenkul", industry: "Real Estate" },
  { name: "Oteller", industry: "Hotel" },
  { name: "Otomotiv", industry: "Automotive" },
  { name: "Sağlık", industry: "Healthcare" },
  { name: "Güzellik", industry: "Beauty" },
  { name: "E-Ticaret", industry: "E-Commerce" },
  { name: "Diğer", industry: "Other" },
] as const;

export type CompanyFilterInput = {
  q?: string;
  industry?: string;
  groupId?: string;
  city?: string;
  district?: string;
  country?: string;
  websiteStatus?: WebsiteStatus | "";
  websiteScoreMin?: number;
  leadPriority?: LeadPriorityBand | "";
  outreachStatus?: OutreachStatus | "";
  hasEmail?: "yes" | "no" | "";
  archived?: boolean;
};

const lastBulkAt = new Map<string, number>();

export function isOutreachSendEnabled() {
  return process.env.OUTREACH_SEND_ENABLED === "true";
}

export function getBatchSize(raw?: string | number | null) {
  const parsed = typeof raw === "number" ? raw : Number(raw ?? DEFAULT_BATCH_SIZE);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_BATCH_SIZE;
  }
  return Math.min(MAX_BATCH_SIZE, Math.max(1, Math.floor(parsed)));
}

export function assertBulkRateLimit(userId: string) {
  const now = Date.now();
  const previous = lastBulkAt.get(userId) ?? 0;
  if (now - previous < 8_000) {
    return "Toplu işlem çok sık tekrarlandı. Birkaç saniye bekleyin.";
  }
  lastBulkAt.set(userId, now);
  return null;
}

export function companyFilterWhere(input: CompanyFilterInput): Prisma.CompanyWhereInput {
  const where: Prisma.CompanyWhereInput = {
    archivedAt: input.archived ? { not: null } : null,
  };

  if (input.q) {
    where.OR = [
      { companyName: { contains: input.q, mode: "insensitive" } },
      { domain: { contains: input.q, mode: "insensitive" } },
      { generalEmail: { contains: input.q, mode: "insensitive" } },
      { city: { contains: input.q, mode: "insensitive" } },
      { district: { contains: input.q, mode: "insensitive" } },
      { contacts: { some: { email: { contains: input.q, mode: "insensitive" } } } },
    ];
  }
  if (input.industry) where.industry = { equals: input.industry, mode: "insensitive" };
  if (input.groupId) where.groupId = input.groupId;
  if (input.city) where.city = { contains: input.city, mode: "insensitive" };
  if (input.district) where.district = { contains: input.district, mode: "insensitive" };
  if (input.country) where.country = { contains: input.country, mode: "insensitive" };
  if (input.websiteStatus) where.websiteStatus = input.websiteStatus;
  if (typeof input.websiteScoreMin === "number" && Number.isFinite(input.websiteScoreMin)) {
    where.websiteScore = { gte: input.websiteScoreMin };
  }
  if (input.leadPriority) {
    where.leadScore = leadPriorityRange(input.leadPriority);
  }
  if (input.outreachStatus) where.outreachStatus = input.outreachStatus;
  if (input.hasEmail === "yes") {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [{ generalEmail: { not: null } }, { contacts: { some: { email: { not: null } } } }],
      },
    ];
  }
  if (input.hasEmail === "no") {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { OR: [{ generalEmail: null }, { generalEmail: "" }] },
      { contacts: { none: { email: { not: null } } } },
    ];
  }

  return where;
}

export function primaryEmail(company: {
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null; isPrimary?: boolean }>;
}) {
  const primary = company.contacts?.find((contact) => contact.isPrimary && contact.email);
  return normalizeEmail(primary?.email || company.contacts?.find((contact) => contact.email)?.email || company.generalEmail);
}

export async function evaluateSendEligibility(company: {
  id: string;
  archivedAt?: Date | null;
  outreachStatus: OutreachStatus;
  status?: string | null;
  tags?: string[] | null;
  lastContactedAt?: Date | null;
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null; isPrimary?: boolean }>;
  allowResend?: boolean;
}) {
  const email = primaryEmail(company);
  const suppressed = email ? await isAddressSuppressed(email) : false;
  const eligibility = evaluateEmailOutreachEligibility({
    ...company,
    suppressed,
  });
  if (!eligibility.ok) {
    return { ok: false as const, reason: eligibility.reason };
  }

  if (!company.allowResend && (company.outreachStatus === "SENT" || company.outreachStatus === "REPLIED")) {
    return { ok: false as const, reason: "Zaten gönderildi" };
  }

  return { ok: true as const, email: eligibility.email };
}

export async function markCompanyReplied(companyId: string) {
  await getPrisma().company.update({
    where: { id: companyId },
    data: { outreachStatus: "REPLIED" },
  });
}

export function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(/[,\n;]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function parseWebsiteScore(value: unknown, max = 10) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const score = Number(String(value).replace(",", "."));
  if (!Number.isFinite(score) || score < 0 || score > max) {
    return undefined;
  }
  return Math.round(score * 10) / 10;
}

export function parseOpportunities(value: unknown): OpportunityType[] {
  return parseStringList(value).filter(isOpportunityType);
}

export function parseWebsiteStatus(value: unknown): WebsiteStatus | undefined {
  if (value === null || value === undefined || value === "") {
    return "UNKNOWN";
  }
  switch (String(value).trim().toUpperCase().replace(/\s+/g, "_")) {
    case "GOOD":
      return "GOOD";
    case "AVERAGE":
      return "AVERAGE";
    case "NEEDS_UPGRADE":
      return "NEEDS_UPGRADE";
    case "UNKNOWN":
      return "UNKNOWN";
    case "NO_WEBSITE":
    case "SOCIAL_ONLY":
      return "NO_WEBSITE";
    case "VERY_WEAK":
      return "VERY_WEAK";
    case "WEAK":
      return "WEAK";
    case "IMPROVABLE":
      return "IMPROVABLE";
    case "VERY_GOOD":
      return "VERY_GOOD";
    case "NOT_VERIFIED":
      return "NOT_VERIFIED";
    default:
      return undefined;
  }
}
