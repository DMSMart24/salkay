import type { OutreachStatus, Prisma, WebsiteStatus } from "@prisma/client";
import { normalizeEmail, isValidEmail } from "@/lib/admin/normalize";
import { getPrisma } from "@/lib/admin/prisma";
import { isAddressSuppressed } from "@/lib/admin/suppression";
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

export function assertFollowUpRateLimit(userId: string) {
  return assertBulkRateLimit(userId);
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

export const TEST_EMAIL_SUBJECT_PREFIX = "[TEST] ";

export function companyRecipientEmails(company: {
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null; emailNorm?: string | null }>;
}) {
  const emails = [
    company.generalEmail,
    ...(company.contacts ?? []).map((contact) => contact.emailNorm || contact.email),
  ]
    .map((value) => normalizeEmail(value))
    .filter((value): value is string => Boolean(value && isValidEmail(value)));
  return [...new Set(emails)];
}

export async function evaluateAddressSend(input: {
  archivedAt?: Date | null;
  outreachStatus: OutreachStatus;
  status?: string | null;
  to: string;
}) {
  if (input.archivedAt) {
    return { ok: false as const, reason: "Arşivlenmiş" };
  }
  if (input.outreachStatus === "DO_NOT_CONTACT" || input.status === "DO_NOT_CONTACT") {
    return { ok: false as const, reason: "İletişim dışı" };
  }
  const email = normalizeEmail(input.to);
  if (!email || !isValidEmail(email)) {
    return { ok: false as const, reason: "Geçerli e-posta yok" };
  }
  if (await isAddressSuppressed(email)) {
    return { ok: false as const, reason: "Sperrliste" };
  }
  return { ok: true as const, email };
}

export async function evaluateTestRecipient(input: {
  company: {
    id: string;
    generalEmail?: string | null;
    contacts?: Array<{ email?: string | null; emailNorm?: string | null }>;
  };
  testEmail: string;
}) {
  const email = normalizeEmail(input.testEmail);
  if (!email || !isValidEmail(email)) {
    return { ok: false as const, reason: "Geçerli bir test e-posta adresi girin." };
  }
  if (await isAddressSuppressed(email)) {
    return { ok: false as const, reason: "Bu adres bastırılmış (do-not-contact / unsubscribe)." };
  }
  if (companyRecipientEmails(input.company).includes(email)) {
    return {
      ok: false as const,
      reason: "Test gönderimi firma alıcısına yapılamaz. İç test adresi kullanın.",
    };
  }

  const blocked = await getPrisma().company.findFirst({
    where: {
      AND: [
        {
          OR: [{ outreachStatus: "DO_NOT_CONTACT" }, { status: "DO_NOT_CONTACT" }],
        },
        {
          OR: [
            { generalEmail: { equals: email, mode: "insensitive" } },
            { contacts: { some: { emailNorm: email } } },
          ],
        },
      ],
    },
    select: { id: true },
  });
  if (blocked) {
    return { ok: false as const, reason: "Bu adres iletişim dışı bir firmaya ait." };
  }

  return { ok: true as const, email };
}

export async function evaluateSendEligibility(company: {
  id: string;
  archivedAt?: Date | null;
  outreachStatus: OutreachStatus;
  status?: string | null;
  lastContactedAt?: Date | null;
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null; isPrimary?: boolean }>;
  allowResend?: boolean;
}) {
  if (company.archivedAt) {
    return { ok: false as const, reason: "Arşivlenmiş" };
  }
  if (company.outreachStatus === "DO_NOT_CONTACT" || company.status === "DO_NOT_CONTACT") {
    return { ok: false as const, reason: "İletişim kurma" };
  }

  const email = primaryEmail(company);
  if (!email || !isValidEmail(email)) {
    return { ok: false as const, reason: "Geçerli e-posta yok" };
  }

  if (await isAddressSuppressed(email)) {
    return { ok: false as const, reason: "Sperrliste" };
  }

  if (!company.allowResend && (company.outreachStatus === "SENT" || company.outreachStatus === "REPLIED")) {
    return { ok: false as const, reason: "Zaten gönderildi" };
  }

  return { ok: true as const, email };
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
