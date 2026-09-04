import type { OutreachStatus, Prisma, WebsiteStatus } from "@prisma/client";
import { isValidEmail, normalizeEmail } from "@/lib/admin/normalize";

export const QUALIFIED_OUT_TAGS = ["no-outreach", "qualified-out", "qualified_out"] as const;
export const WEBSITE_PROBLEM_STATUSES = [
  "VERY_WEAK",
  "WEAK",
  "IMPROVABLE",
  "NEEDS_UPGRADE",
] as const satisfies readonly WebsiteStatus[];
export const TOP_OUTREACH_LIMIT = 20;
export const HIGH_PRIORITY_LEAD_SCORE = 8;

export type EmailOutreachLane = "NO_EMAIL" | "HAS_EMAIL" | "READY_TO_EMAIL" | "CONTACTED";

export type EmailOutreachCompany = {
  id?: string;
  archivedAt?: Date | null;
  outreachStatus: OutreachStatus;
  status?: string | null;
  tags?: string[] | null;
  priority?: string | null;
  leadScore?: number | null;
  websiteStatus?: WebsiteStatus | null;
  lastContactedAt?: Date | null;
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null; isPrimary?: boolean }>;
  suppressed?: boolean;
};

export function isQualifiedOut(tags?: string[] | null) {
  return (tags ?? []).some((tag) => QUALIFIED_OUT_TAGS.includes(tag.trim().toLowerCase() as (typeof QUALIFIED_OUT_TAGS)[number]));
}

export function collectCandidateEmails(company: {
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null }>;
}) {
  return [
    ...(company.contacts ?? []).map((contact) => contact.email),
    company.generalEmail,
  ]
    .map((value) => value?.trim() ?? "")
    .filter(Boolean);
}

export function collectUsableEmails(company: {
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null }>;
}) {
  const emails = collectCandidateEmails(company)
    .map((value) => normalizeEmail(value))
    .filter((value): value is string => Boolean(value && isValidEmail(value)));
  return [...new Set(emails)];
}

export function hasUsableEmail(company: {
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null }>;
}) {
  return collectUsableEmails(company).length > 0;
}

export function hasInvalidEmailOnly(company: {
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null }>;
}) {
  return collectCandidateEmails(company).length > 0 && !hasUsableEmail(company);
}

export function isEmailContacted(company: Pick<EmailOutreachCompany, "outreachStatus" | "lastContactedAt">) {
  return (
    company.outreachStatus === "SENT" ||
    company.outreachStatus === "REPLIED" ||
    Boolean(company.lastContactedAt)
  );
}

export function isHighPriorityLead(company: Pick<EmailOutreachCompany, "priority" | "leadScore">) {
  if (company.priority === "HIGH") return true;
  return typeof company.leadScore === "number" && company.leadScore >= HIGH_PRIORITY_LEAD_SCORE;
}

export function isWebsiteProblem(status?: WebsiteStatus | null) {
  return Boolean(status && (WEBSITE_PROBLEM_STATUSES as readonly string[]).includes(status));
}

export function evaluateEmailOutreachEligibility(company: EmailOutreachCompany) {
  if (company.archivedAt) {
    return { ok: false as const, reason: "Arşivlenmiş", emailEligible: false };
  }
  if (company.outreachStatus === "DO_NOT_CONTACT" || company.status === "DO_NOT_CONTACT") {
    return { ok: false as const, reason: "İletişim kurma", emailEligible: false };
  }
  if (isQualifiedOut(company.tags)) {
    return { ok: false as const, reason: "Qualified out", emailEligible: false };
  }

  const emails = collectUsableEmails(company);
  if (emails.length === 0) {
    return {
      ok: false as const,
      reason: hasInvalidEmailOnly(company) ? "Geçersiz e-posta" : "Geçerli e-posta yok",
      emailEligible: false,
    };
  }
  if (company.suppressed) {
    return { ok: false as const, reason: "Sperrliste", emailEligible: false };
  }

  return { ok: true as const, email: emails[0], emailEligible: true, reason: undefined };
}

export function isReadyToEmail(company: EmailOutreachCompany) {
  return evaluateEmailOutreachEligibility(company).ok && !isEmailContacted(company);
}

export function emailOutreachLane(company: EmailOutreachCompany): EmailOutreachLane {
  if (isEmailContacted(company)) return "CONTACTED";
  if (isReadyToEmail(company)) return "READY_TO_EMAIL";
  if (hasUsableEmail(company)) return "HAS_EMAIL";
  return "NO_EMAIL";
}

export const emailOutreachLaneLabels: Record<EmailOutreachLane, string> = {
  NO_EMAIL: "NO EMAIL",
  HAS_EMAIL: "HAS EMAIL",
  READY_TO_EMAIL: "READY TO EMAIL",
  CONTACTED: "CONTACTED",
};

export function restaurantLeadWhere(): Prisma.CompanyWhereInput {
  return {
    archivedAt: null,
    OR: [
      { industry: { equals: "Restaurant", mode: "insensitive" } },
      { tags: { has: "restaurant" } },
      { group: { is: { name: { equals: "Restoranlar", mode: "insensitive" } } } },
      { group: { is: { industry: { equals: "Restaurant", mode: "insensitive" } } } },
    ],
  };
}

export type RestaurantLeadPreset =
  | "all"
  | "top"
  | "high"
  | "no_website"
  | "has_email"
  | "no_email"
  | "ready_to_email"
  | "not_contacted"
  | "contacted"
  | "qualified_out"
  | "top20";

export function matchesRestaurantPreset(company: EmailOutreachCompany, preset: RestaurantLeadPreset) {
  switch (preset) {
    case "all":
      return true;
    case "top":
      return isHighPriorityLead(company);
    case "high":
      return isHighPriorityLead(company);
    case "no_website":
      return company.websiteStatus === "NO_WEBSITE";
    case "has_email":
      return hasUsableEmail(company);
    case "no_email":
      return !hasUsableEmail(company);
    case "ready_to_email":
      return isReadyToEmail(company);
    case "not_contacted":
      return !isEmailContacted(company) && company.outreachStatus !== "DO_NOT_CONTACT";
    case "contacted":
      return isEmailContacted(company);
    case "qualified_out":
      return isQualifiedOut(company.tags);
    case "top20":
      return evaluateEmailOutreachEligibility(company).emailEligible;
    default: {
      const _never: never = preset;
      return _never;
    }
  }
}

export function selectTop20Outreach<T extends EmailOutreachCompany>(leads: T[]) {
  return leads
    .filter((lead) => evaluateEmailOutreachEligibility(lead).emailEligible)
    .sort((left, right) => (right.leadScore ?? -1) - (left.leadScore ?? -1))
    .slice(0, TOP_OUTREACH_LIMIT);
}

export function summarizeRestaurantLeads(leads: EmailOutreachCompany[]) {
  let hasEmail = 0;
  let noEmail = 0;
  let validEmail = 0;
  let invalidEmail = 0;
  let suppressed = 0;
  let dnc = 0;
  let readyToEmail = 0;
  let contacted = 0;
  let interested = 0;
  let highPriority = 0;
  let noWebsite = 0;
  let websiteProblems = 0;
  let noWebsiteWithEmail = 0;
  let noWebsiteWithoutEmail = 0;
  let websiteProblemWithEmail = 0;
  let websiteProblemWithoutEmail = 0;
  let qualifiedOut = 0;

  for (const lead of leads) {
    const usable = hasUsableEmail(lead);
    const invalidOnly = hasInvalidEmailOnly(lead);
    if (usable) {
      hasEmail += 1;
      validEmail += 1;
    } else {
      noEmail += 1;
    }
    if (invalidOnly) invalidEmail += 1;
    if (lead.suppressed) suppressed += 1;
    if (lead.outreachStatus === "DO_NOT_CONTACT" || lead.status === "DO_NOT_CONTACT") dnc += 1;
    if (isReadyToEmail(lead)) readyToEmail += 1;
    if (isEmailContacted(lead)) contacted += 1;
    if (lead.outreachStatus === "REPLIED") interested += 1;
    if (isHighPriorityLead(lead)) highPriority += 1;
    if (lead.websiteStatus === "NO_WEBSITE") {
      noWebsite += 1;
      if (usable) noWebsiteWithEmail += 1;
      else noWebsiteWithoutEmail += 1;
    }
    if (isWebsiteProblem(lead.websiteStatus)) {
      websiteProblems += 1;
      if (usable) websiteProblemWithEmail += 1;
      else websiteProblemWithoutEmail += 1;
    }
    if (isQualifiedOut(lead.tags)) qualifiedOut += 1;
  }

  return {
    total: leads.length,
    hasEmail,
    noEmail,
    validEmail,
    invalidEmail,
    suppressed,
    dnc,
    readyToEmail,
    contacted,
    interested,
    highPriority,
    noWebsite,
    websiteProblems,
    noWebsiteWithEmail,
    noWebsiteWithoutEmail,
    websiteProblemWithEmail,
    websiteProblemWithoutEmail,
    qualifiedOut,
  };
}
