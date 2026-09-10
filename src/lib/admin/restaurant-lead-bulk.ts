import type { RestaurantLead, RestaurantWebsiteStatus } from "@prisma/client";
import { classifyRestaurantEmailOwnership } from "@/lib/admin/restaurant-email-ownership";
import { getPrisma } from "@/lib/admin/prisma";

export const INTERNAL_CHUNK_SIZES = [10, 20] as const;
export const INTERNAL_CHUNK_SIZE = 10;
export const FIRST_WAVE_LIMIT = 5;

export type RestaurantLeadBulkSource = "leads" | "crm";
export type RestaurantLeadBulkStatusFilter = "READY_FOR_REVIEW" | "NEEDS_REVIEW" | "QUALIFIED_OUT" | "ALL";
export type RestaurantLeadBulkRegionFilter = "" | "ANADOLU" | "AVRUPA";
export type RestaurantLeadBulkTier = "A" | "B" | "C";
export type RestaurantLeadBulkWebsiteFilter =
  | ""
  | "NO_WEBSITE"
  | "VERY_WEAK"
  | "WEAK"
  | "IMPROVABLE"
  | "GOOD"
  | "VERY_GOOD";
export type RestaurantLeadPitchKind =
  | "PREMIUM_WEBSITE"
  | "WEBSITE_UPGRADE"
  | "SEO"
  | "LOCAL_SEO"
  | "MOBILE"
  | "RESERVATION"
  | "OTHER";

export type RestaurantLeadExcludeBucket =
  | "NO_EMAIL"
  | "NEEDS_REVIEW"
  | "DUPLICATE"
  | "INVALID_EMAIL"
  | "CLOSED_OR_UNCLEAR"
  | "FETCH_ISSUE"
  | "ALREADY_SENT"
  | "LOW_CONFIDENCE"
  | "FACT_SAFETY"
  | "DRAFT_QUALITY"
  | "OTHER";

export type RestaurantLeadBulkFilters = {
  status: RestaurantLeadBulkStatusFilter;
  region: RestaurantLeadBulkRegionFilter;
  tier: RestaurantLeadBulkTier | "";
  website: RestaurantLeadBulkWebsiteFilter;
  pitch: RestaurantLeadPitchKind | "";
  firstWave: boolean;
};

export type RestaurantLeadBulkRow = {
  id: string;
  restaurantName: string;
  district: string;
  region: "ANADOLU" | "AVRUPA";
  publicEmail: string | null;
  website: string | null;
  websiteStatus: RestaurantWebsiteStatus;
  salesOpportunityScore: number | null;
  tier: RestaurantLeadBulkTier;
  primaryPitch: RestaurantLeadPitchKind;
  primaryOpportunity: string | null;
  emailStatus: string;
  emailSubject: string | null;
  emailBody: string | null;
  operatingStatus: string;
  eligible: boolean;
  excludeReasons: string[];
  excludeBucket: RestaurantLeadExcludeBucket | null;
  previouslySent: boolean;
};

const WEBSITE_FILTERS: RestaurantLeadBulkWebsiteFilter[] = [
  "NO_WEBSITE",
  "VERY_WEAK",
  "WEAK",
  "IMPROVABLE",
  "GOOD",
  "VERY_GOOD",
];

const FACT_BANNED = [
  /web sitenizi geliştirebiliriz/i,
  /website modernization/i,
  /takipçi (sayısı|arttır|kazan)/i,
  /yorum sayısı/i,
  /google review/i,
  /salihkaya@|noreply@|example\.com/i,
];

export const restaurantLeadExcludeLabels: Record<RestaurantLeadExcludeBucket, string> = {
  NO_EMAIL: "No Email",
  NEEDS_REVIEW: "Needs Review",
  DUPLICATE: "Duplicate",
  INVALID_EMAIL: "Invalid Email",
  CLOSED_OR_UNCLEAR: "Closed / Unclear",
  FETCH_ISSUE: "Fetch Issue",
  ALREADY_SENT: "Already Sent",
  LOW_CONFIDENCE: "Low Confidence",
  FACT_SAFETY: "Fact Safety",
  DRAFT_QUALITY: "Draft Quality",
  OTHER: "Other",
};

export function parseRestaurantLeadBulkSource(value?: string | null): RestaurantLeadBulkSource {
  return value === "crm" ? "crm" : "leads";
}

export function parseRestaurantLeadBulkFilters(input: {
  status?: string | null;
  region?: string | null;
  tier?: string | null;
  website?: string | null;
  pitch?: string | null;
  wave?: string | null;
}): RestaurantLeadBulkFilters {
  const status: RestaurantLeadBulkStatusFilter =
    input.status === "NEEDS_REVIEW" || input.status === "QUALIFIED_OUT" || input.status === "ALL"
      ? input.status
      : "READY_FOR_REVIEW";
  const region: RestaurantLeadBulkRegionFilter =
    input.region === "ANADOLU" || input.region === "AVRUPA" ? input.region : "";
  const tier: RestaurantLeadBulkTier | "" = input.tier === "A" || input.tier === "B" || input.tier === "C" ? input.tier : "";
  const website: RestaurantLeadBulkWebsiteFilter = WEBSITE_FILTERS.includes(
    input.website as RestaurantLeadBulkWebsiteFilter,
  )
    ? (input.website as RestaurantLeadBulkWebsiteFilter)
    : "";
  const pitch: RestaurantLeadPitchKind | "" = [
    "PREMIUM_WEBSITE",
    "WEBSITE_UPGRADE",
    "SEO",
    "LOCAL_SEO",
    "MOBILE",
    "RESERVATION",
    "OTHER",
  ].includes(input.pitch ?? "")
    ? (input.pitch as RestaurantLeadPitchKind)
    : "";
  return {
    status,
    region,
    tier,
    website,
    pitch,
    firstWave: input.wave === "first",
  };
}

export function clampRestaurantLeadChunkSize(value?: number | string | null) {
  const parsed = Number(value);
  if (INTERNAL_CHUNK_SIZES.includes(parsed as (typeof INTERNAL_CHUNK_SIZES)[number])) return parsed;
  return INTERNAL_CHUNK_SIZE;
}

export function chunkRestaurantLeadItems<T>(items: T[], size = INTERNAL_CHUNK_SIZE) {
  const chunks: T[][] = [];
  const safe = Math.max(1, size);
  for (let index = 0; index < items.length; index += safe) {
    chunks.push(items.slice(index, index + safe));
  }
  return chunks;
}

export function classifyRestaurantLeadPitch(lead: {
  primaryOpportunity?: string | null;
  secondaryOpportunity?: string | null;
  servicesToPitch?: string[] | null;
  salkayPitch?: string | null;
  emailSubject?: string | null;
}): RestaurantLeadPitchKind {
  const text = [
    lead.primaryOpportunity,
    lead.secondaryOpportunity,
    ...(lead.servicesToPitch ?? []),
    lead.salkayPitch,
    lead.emailSubject,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr");

  if (/rezervasyon|reservation|dönüşüm|donusum|whatsapp cta|conversion/.test(text)) return "RESERVATION";
  if (/yerel seo|local seo|google maps|google işletme|google isletme/.test(text)) return "LOCAL_SEO";
  if (/mobil|mobile/.test(text)) return "MOBILE";
  if (/premium|yeni website|yeni site|sıfırdan|sifirdan/.test(text)) return "PREMIUM_WEBSITE";
  if (/upgrade|yenile|iyileştir|iyilestir|mevcut site|site iyileştir/.test(text)) return "WEBSITE_UPGRADE";
  if (/\bseo\b|google görünür|google gorunur|arama/.test(text)) return "SEO";
  return "OTHER";
}

export const restaurantLeadPitchLabels: Record<RestaurantLeadPitchKind, string> = {
  PREMIUM_WEBSITE: "Yeni Premium Website",
  WEBSITE_UPGRADE: "Website Upgrade",
  SEO: "SEO",
  LOCAL_SEO: "Local SEO",
  MOBILE: "Mobile",
  RESERVATION: "Reservation / Conversion",
  OTHER: "Other",
};

export const restaurantLeadWebsiteFilterLabels: Record<Exclude<RestaurantLeadBulkWebsiteFilter, "">, string> = {
  NO_WEBSITE: "No Website",
  VERY_WEAK: "Very Weak",
  WEAK: "Weak",
  IMPROVABLE: "Average",
  GOOD: "Good",
  VERY_GOOD: "Premium",
};

export function deriveRestaurantLeadTiers(leads: Array<Pick<RestaurantLead, "id" | "emailStatus" | "salesOpportunityScore">>) {
  const ready = [...leads]
    .filter((lead) => lead.emailStatus === "READY_FOR_REVIEW")
    .sort((a, b) => (b.salesOpportunityScore ?? -1) - (a.salesOpportunityScore ?? -1));
  const rank = new Map(ready.map((lead, index) => [lead.id, index]));
  return new Map(
    leads.map((lead) => {
      const readyIndex = rank.get(lead.id);
      if (readyIndex != null) {
        if (readyIndex < 10) return [lead.id, "A" as const];
        if (readyIndex < 30) return [lead.id, "B" as const];
        return [lead.id, "C" as const];
      }
      const score = lead.salesOpportunityScore ?? 0;
      if (score >= 80) return [lead.id, "A" as const];
      if (score >= 60) return [lead.id, "B" as const];
      return [lead.id, "C" as const];
    }),
  );
}

function normalizeNameToken(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9çğıöşüâîû ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const NAME_STOPWORDS = new Set([
  "restaurant",
  "restoran",
  "cafe",
  "kafe",
  "bar",
  "kitchen",
  "lokanta",
  "and",
  "the",
  "grill",
  "house",
  "tarihi",
  "historic",
]);

export function restaurantLeadFactSafety(lead: Pick<RestaurantLead, "restaurantName" | "emailSubject" | "emailBody">) {
  const subject = lead.emailSubject?.trim() ?? "";
  const body = lead.emailBody?.trim() ?? "";
  const haystack = `${subject}\n${body}`;
  if (FACT_BANNED.some((pattern) => pattern.test(haystack))) {
    return { ok: false, reason: "FACT_SAFETY: yasaklı/jenerik iddia" };
  }
  const name = normalizeNameToken(lead.restaurantName)
    .split(" ")
    .find((part) => part.length >= 3 && !NAME_STOPWORDS.has(part));
  if (name && !normalizeNameToken(haystack).includes(name)) {
    return { ok: false, reason: "FACT_SAFETY: taslak restoran adını taşımıyor" };
  }
  return { ok: true, reason: null };
}

export function restaurantLeadDraftQuality(lead: Pick<RestaurantLead, "emailSubject" | "emailBody" | "emailStatus">) {
  const subject = lead.emailSubject?.trim() ?? "";
  const body = lead.emailBody?.trim() ?? "";
  if (lead.emailStatus !== "READY_FOR_REVIEW") return { ok: false, reason: "Draft QA: READY değil" };
  if (subject.length < 8) return { ok: false, reason: "Draft QA: konu kısa" };
  if (body.length < 120) return { ok: false, reason: "Draft QA: gövde kısa" };
  if (!/salkay|salih kaya/i.test(body)) return { ok: false, reason: "Draft QA: imza yok" };
  return { ok: true, reason: null };
}

export function classifyRestaurantLeadExcludeBucket(
  lead: RestaurantLead,
  previouslySent: boolean,
  reasons: string[],
): RestaurantLeadExcludeBucket | null {
  if (!lead.publicEmail) return "NO_EMAIL";
  if (previouslySent) return "ALREADY_SENT";
  if (lead.possibleDuplicate || reasons.some((item) => /kopya|duplicate/i.test(item))) return "DUPLICATE";
  if (lead.operatingStatus === "CLOSED" || lead.operatingStatus === "UNCLEAR") return "CLOSED_OR_UNCLEAR";
  if (lead.fetchStatus === "FAILED") return "FETCH_ISSUE";
  if (lead.emailStatus === "NEEDS_REVIEW") return "NEEDS_REVIEW";
  if (reasons.some((item) => /FACT_SAFETY/i.test(item))) return "FACT_SAFETY";
  if (reasons.some((item) => /Draft QA/i.test(item))) return "DRAFT_QUALITY";
  if (reasons.some((item) => /incelemesi gerekli|placeholder|agency|personal|vendor/i.test(item))) {
    return "INVALID_EMAIL";
  }
  if (lead.pitchConfidence !== "HIGH" && lead.pitchConfidence !== "MEDIUM") return "LOW_CONFIDENCE";
  if (reasons.length) return "OTHER";
  return null;
}

export function evaluateRestaurantLeadSendEligibility(lead: RestaurantLead, previouslySent: boolean) {
  const reasons: string[] = [];
  if (lead.operatingStatus !== "ACTIVE") reasons.push("İşletme ACTIVE değil");
  if (lead.operatingStatus === "CLOSED" || lead.operatingStatus === "UNCLEAR") {
    reasons.push(lead.operatingStatus);
  }
  if (!lead.publicEmail) reasons.push("E-posta yok");
  if (!lead.emailVerified) reasons.push("E-posta doğrulanmadı");
  if (lead.emailStatus !== "READY_FOR_REVIEW") reasons.push(`emailStatus ${lead.emailStatus}`);
  if (!lead.emailSubject || !lead.emailBody) reasons.push("Kişiselleştirilmiş taslak yok");
  if (lead.pitchConfidence !== "HIGH" && lead.pitchConfidence !== "MEDIUM") {
    reasons.push("Pitch güveni yetersiz");
  }
  if (lead.possibleDuplicate) reasons.push("Olası kopya");
  if (previouslySent) reasons.push("Daha önce gönderildi");
  if (lead.deliveryStatus === "BOUNCED" || lead.deliveryStatus === "COMPLAINED") {
    reasons.push(`deliveryStatus ${lead.deliveryStatus}`);
  }
  if (lead.emailSuppressed) reasons.push("emailSuppressed = true");

  const facts = restaurantLeadFactSafety(lead);
  if (!facts.ok && facts.reason) reasons.push(facts.reason);

  const ownership = classifyRestaurantEmailOwnership({
    email: lead.publicEmail,
    website: lead.website,
    websiteDomain: lead.websiteDomain,
    emailSource: lead.emailSource,
  });
  if (!ownership.readyEligible) {
    reasons.push(ownership.reason || "Hariç tutuldu — e-posta incelemesi gerekli");
  }

  const unique = [...new Set(reasons)];
  return {
    eligible: unique.length === 0,
    reasons: unique,
    bucket: classifyRestaurantLeadExcludeBucket(lead, previouslySent, unique),
    ownership,
  };
}

/** @deprecated use evaluateRestaurantLeadSendEligibility */
export function evaluateRestaurantLeadBatchEligibility(lead: RestaurantLead, previouslySent: boolean) {
  return evaluateRestaurantLeadSendEligibility(lead, previouslySent);
}

function matchesStatus(lead: RestaurantLead, status: RestaurantLeadBulkStatusFilter) {
  if (status === "ALL") return true;
  if (status === "QUALIFIED_OUT") return lead.priority === "QUALIFIED_OUT";
  return lead.emailStatus === status;
}

export async function getRestaurantLeadBulkCounters() {
  const prisma = getPrisma();
  const [total, ready, needsReview, noEmail, sent, failed] = await Promise.all([
    prisma.restaurantLead.count(),
    prisma.restaurantLead.count({ where: { emailStatus: "READY_FOR_REVIEW" } }),
    prisma.restaurantLead.count({ where: { emailStatus: "NEEDS_REVIEW" } }),
    prisma.restaurantLead.count({
      where: { OR: [{ publicEmail: null }, { publicEmail: "" }] },
    }),
    prisma.restaurantLeadSendHistory.count({ where: { status: "SENT" } }),
    prisma.restaurantLeadSendHistory.count({ where: { status: "FAILED" } }),
  ]);
  return { total, ready, needsReview, noEmail, sent, failed };
}

export async function listPreviouslySentRestaurantLeadIds() {
  const rows = await getPrisma().restaurantLeadSendHistory.findMany({
    where: { OR: [{ status: "SENT" }, { sentAt: { not: null } }] },
    select: { restaurantLeadId: true },
  });
  return new Set(rows.map((row) => row.restaurantLeadId));
}

export async function listFailedRestaurantLeadIds(batchId?: string) {
  const rows = await getPrisma().restaurantLeadSendHistory.findMany({
    where: { status: "FAILED", ...(batchId ? { batchId } : {}) },
    select: { restaurantLeadId: true },
  });
  return [...new Set(rows.map((row) => row.restaurantLeadId))];
}

export async function getSendEligibleRestaurantLeads() {
  const prisma = getPrisma();
  const [leads, sentIds] = await Promise.all([
    prisma.restaurantLead.findMany({
      orderBy: [{ salesOpportunityScore: { sort: "desc", nulls: "last" } }, { restaurantName: "asc" }],
    }),
    listPreviouslySentRestaurantLeadIds(),
  ]);
  const tiers = deriveRestaurantLeadTiers(leads);
  const evaluated = leads.map((lead) => {
    const previouslySent = sentIds.has(lead.id);
    const evaluation = evaluateRestaurantLeadSendEligibility(lead, previouslySent);
    const row: RestaurantLeadBulkRow = {
      id: lead.id,
      restaurantName: lead.restaurantName,
      district: lead.district,
      region: lead.region,
      publicEmail: lead.publicEmail,
      website: lead.website,
      websiteStatus: lead.websiteStatus,
      salesOpportunityScore: lead.salesOpportunityScore,
      tier: tiers.get(lead.id) ?? "C",
      primaryPitch: classifyRestaurantLeadPitch(lead),
      primaryOpportunity: lead.primaryOpportunity,
      emailStatus: lead.emailStatus,
      emailSubject: lead.emailSubject,
      emailBody: lead.emailBody,
      operatingStatus: lead.operatingStatus,
      eligible: evaluation.eligible,
      excludeReasons: evaluation.reasons,
      excludeBucket: evaluation.eligible ? null : evaluation.bucket,
      previouslySent,
    };
    return { lead, row, evaluation };
  });

  const buckets: Record<RestaurantLeadExcludeBucket, number> = {
    NO_EMAIL: 0,
    NEEDS_REVIEW: 0,
    DUPLICATE: 0,
    INVALID_EMAIL: 0,
    CLOSED_OR_UNCLEAR: 0,
    FETCH_ISSUE: 0,
    ALREADY_SENT: 0,
    LOW_CONFIDENCE: 0,
    FACT_SAFETY: 0,
    DRAFT_QUALITY: 0,
    OTHER: 0,
  };
  for (const item of evaluated) {
    if (item.row.excludeBucket) buckets[item.row.excludeBucket] += 1;
  }

  return {
    leads,
    sentIds,
    tiers,
    rows: evaluated.map((item) => item.row),
    eligible: evaluated.filter((item) => item.evaluation.eligible).map((item) => item.row),
    excluded: evaluated.filter((item) => !item.evaluation.eligible).map((item) => item.row),
    buckets,
  };
}

export async function getRestaurantLeadBulkWorkspace(filters: RestaurantLeadBulkFilters) {
  const [universe, counters] = await Promise.all([getSendEligibleRestaurantLeads(), getRestaurantLeadBulkCounters()]);
  const leadsById = new Map(universe.leads.map((lead) => [lead.id, lead]));
  const filtered = universe.rows.filter((row) => {
    const lead = leadsById.get(row.id);
    if (!lead) return false;
    if (!matchesStatus(lead, filters.status)) return false;
    if (filters.region && row.region !== filters.region) return false;
    if (filters.tier && row.tier !== filters.tier) return false;
    if (filters.website && row.websiteStatus !== filters.website) return false;
    if (filters.pitch && row.primaryPitch !== filters.pitch) return false;
    if (filters.firstWave) {
      return (
        row.tier === "A" &&
        row.eligible &&
        lead.emailStatus === "READY_FOR_REVIEW" &&
        !row.previouslySent &&
        classifyRestaurantEmailOwnership({
          email: lead.publicEmail,
          website: lead.website,
          websiteDomain: lead.websiteDomain,
          emailSource: lead.emailSource,
        }).classification === "BUSINESS_DOMAIN"
      );
    }
    return true;
  });

  const visible = filters.firstWave ? filtered.slice(0, FIRST_WAVE_LIMIT) : filtered;

  return {
    counters,
    rows: visible,
    previouslySent: universe.sentIds.size,
    eligibleCount: universe.eligible.length,
    excludedCount: universe.excluded.length,
    sendEligibleIds: universe.eligible.map((row) => row.id),
    defaultSelectedIds: universe.eligible.map((row) => row.id),
    excludeBuckets: universe.buckets,
  };
}

export type RestaurantLeadBatchSnapshot = {
  restaurantLeadId: string;
  id: string;
  restaurantName: string;
  district: string;
  region: string;
  recipientEmail: string;
  email: string;
  emailSubject: string;
  subject: string;
  emailBody: string;
  body: string;
  operatingStatus: string;
  tier: RestaurantLeadBulkTier;
  websiteStatus: RestaurantWebsiteStatus;
  primaryPitch: RestaurantLeadPitchKind;
  eligibilityStatus: "SEND_ELIGIBLE";
  selectionTimestamp: string;
  selectedAt: string;
};

export type RestaurantLeadSendProgress = {
  total: number;
  processed: number;
  sent: number;
  failed: number;
  status: "IDLE" | "SENDING" | "DONE" | "BLOCKED";
  chunkSize: number;
  chunks: number;
};

export function toRestaurantLeadSnapshots(rows: RestaurantLeadBulkRow[]): RestaurantLeadBatchSnapshot[] {
  const selectedAt = new Date().toISOString();
  return rows
    .filter((row) => row.eligible && row.publicEmail && row.emailSubject && row.emailBody)
    .map((row) => ({
      restaurantLeadId: row.id,
      id: row.id,
      restaurantName: row.restaurantName,
      district: row.district,
      region: row.region,
      recipientEmail: row.publicEmail as string,
      email: row.publicEmail as string,
      emailSubject: row.emailSubject as string,
      subject: row.emailSubject as string,
      emailBody: row.emailBody as string,
      body: row.emailBody as string,
      operatingStatus: row.operatingStatus,
      tier: row.tier,
      websiteStatus: row.websiteStatus,
      primaryPitch: row.primaryPitch,
      eligibilityStatus: "SEND_ELIGIBLE",
      selectionTimestamp: selectedAt,
      selectedAt,
    }));
}

export function restaurantLeadBulkChecks(snapshots: RestaurantLeadBatchSnapshot[]) {
  const emails = snapshots.map((row) => row.email.toLowerCase());
  const uniqueEmails = new Set(emails);
  const total = snapshots.length;
  return {
    recipients: total,
    verifiedEmails: `${snapshots.filter((row) => row.recipientEmail || row.email).length}/${total}`,
    personalizedSubjects: `${snapshots.filter((row) => row.emailSubject || row.subject).length}/${total}`,
    personalizedBodies: `${snapshots.filter((row) => row.emailBody || row.body).length}/${total}`,
    personalizedDrafts: `${snapshots.filter((row) => (row.emailSubject || row.subject) && (row.emailBody || row.body)).length}/${total}`,
    readyStatus: `${total}/${total}`,
    active: `${snapshots.filter((row) => row.operatingStatus === "ACTIVE").length}/${total}`,
    duplicates: total - uniqueEmails.size,
    previouslySent: 0,
    invalidInbox: 0,
    chunks: chunkRestaurantLeadItems(snapshots, INTERNAL_CHUNK_SIZE).length,
  };
}

export async function listSuccessfullySentRestaurantLeadIds() {
  const rows = await getPrisma().restaurantLeadSendHistory.findMany({
    where: { OR: [{ status: "SENT" }, { sentAt: { not: null } }] },
    select: { restaurantLeadId: true },
  });
  return new Set(rows.map((row) => row.restaurantLeadId));
}

/** Insert-only send log. Never overwrites an existing SENT snapshot. */
export async function appendRestaurantLeadSendHistory(input: {
  restaurantLeadId: string;
  batchId?: string | null;
  toAddress: string;
  subject: string;
  bodyText: string;
  provider?: string | null;
  providerMessageId?: string | null;
  status: "PREPARED" | "SENT" | "FAILED";
  sentAt?: Date | null;
  errorMessage?: string | null;
}) {
  const prisma = getPrisma();
  const existingSent = await prisma.restaurantLeadSendHistory.findFirst({
    where: { restaurantLeadId: input.restaurantLeadId, status: "SENT" },
    select: { id: true },
  });
  if (existingSent && input.status === "SENT") {
    return { created: false, skipped: true as const, reason: "already_sent" };
  }
  const row = await prisma.restaurantLeadSendHistory.create({
    data: {
      restaurantLeadId: input.restaurantLeadId,
      batchId: input.batchId ?? undefined,
      toAddress: input.toAddress,
      subject: input.subject,
      bodyText: input.bodyText,
      provider: input.provider ?? undefined,
      providerMessageId: input.providerMessageId ?? undefined,
      status: input.status,
      sentAt: input.sentAt ?? undefined,
      errorMessage: input.errorMessage ?? undefined,
    },
  });
  return { created: true, skipped: false as const, id: row.id };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function restaurantLeadBodyHtml(body: string) {
  const escaped = body
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return `<div style="white-space:pre-wrap;font-family:Georgia,serif;font-size:16px;line-height:1.55">${escaped}</div>`;
}

function isSystemWideSendFailure(error: string, configured: boolean) {
  if (!configured) return true;
  return /unauthorized|invalid api|api key|not verified|forbidden|401|403|domain is not verified|from address|yapılandırılmadı|configured/i.test(
    error,
  );
}

export type RestaurantLeadLiveSendRecipient = {
  restaurantLeadId: string;
  restaurantName: string;
  recipientEmail: string;
  emailSubject: string;
  emailBody: string;
};

export type RestaurantLeadLiveSendReport = {
  liveBulkSendId: string;
  initialApproved: number;
  finalEligible: number;
  skippedBeforeSend: Array<{ restaurant: string; reason: string }>;
  attempted: number;
  sentSuccessfully: number;
  failed: Array<{ restaurant: string; email: string; error: string }>;
  unsent: Array<{ restaurant: string; reason: string }>;
  chunksCompleted: number;
  resendCalled: boolean;
  providerMessageIdsStored: number;
  duplicateSendsBlocked: number;
  companyRowsMutated: 0;
  finalStatus: "COMPLETED" | "PARTIAL" | "ABORTED";
};

export async function executeRestaurantLeadApprovedLiveSend(input: {
  approved: RestaurantLeadLiveSendRecipient[];
  createdById: string;
  sourceSnapshotId: string;
  chunkSize?: number;
}): Promise<RestaurantLeadLiveSendReport> {
  const prisma = getPrisma();
  const chunkSize = input.chunkSize ?? INTERNAL_CHUNK_SIZE;
  const universe = await getSendEligibleRestaurantLeads();
  const eligibleById = new Map(universe.eligible.map((row) => [row.id, row]));
  const alreadySent = await listSuccessfullySentRestaurantLeadIds();

  const skippedBeforeSend: RestaurantLeadLiveSendReport["skippedBeforeSend"] = [];
  const toSend: RestaurantLeadLiveSendRecipient[] = [];

  for (const approved of input.approved) {
    if (alreadySent.has(approved.restaurantLeadId)) {
      skippedBeforeSend.push({
        restaurant: approved.restaurantName,
        reason: "Already successfully sent — idempotency block",
      });
      continue;
    }
    const eligible = eligibleById.get(approved.restaurantLeadId);
    if (!eligible || !eligible.publicEmail || !eligible.emailSubject || !eligible.emailBody) {
      skippedBeforeSend.push({
        restaurant: approved.restaurantName,
        reason: eligible?.excludeReasons.join(" · ") || "No longer SEND_ELIGIBLE",
      });
      continue;
    }
    toSend.push({
      restaurantLeadId: eligible.id,
      restaurantName: eligible.restaurantName,
      recipientEmail: eligible.publicEmail,
      emailSubject: eligible.emailSubject,
      emailBody: eligible.emailBody,
    });
  }

  const snapshots = toRestaurantLeadSnapshots(
    toSend.map((row) => {
      const eligible = eligibleById.get(row.restaurantLeadId);
      if (!eligible) {
        throw new Error(`Eligible row missing for ${row.restaurantLeadId}`);
      }
      return eligible;
    }),
  );
  const checks = restaurantLeadBulkChecks(snapshots);
  const { getEmailProvider } = await import("@/lib/admin/email/provider");
  const { OUTREACH_FROM_DISPLAY_NAME } = await import("@/lib/admin/email/from");
  const provider = getEmailProvider();
  if (!provider.configured || provider.id !== "resend") {
    return {
      liveBulkSendId: "",
      initialApproved: input.approved.length,
      finalEligible: toSend.length,
      skippedBeforeSend,
      attempted: 0,
      sentSuccessfully: 0,
      failed: [],
      unsent: toSend.map((row) => ({ restaurant: row.restaurantName, reason: "Resend not configured" })),
      chunksCompleted: 0,
      resendCalled: false,
      providerMessageIdsStored: 0,
      duplicateSendsBlocked: skippedBeforeSend.filter((row) => /idempotency/i.test(row.reason)).length,
      companyRowsMutated: 0,
      finalStatus: "ABORTED",
    };
  }

  const batch = await prisma.restaurantLeadOutreachBatch.create({
    data: {
      mode: "LIVE",
      status: "PREPARED",
      leadIds: toSend.map((row) => row.restaurantLeadId),
      snapshotJson: JSON.stringify(
        toSend.map((row) => ({
          sourceSnapshotId: input.sourceSnapshotId,
          restaurantLeadId: row.restaurantLeadId,
          restaurantName: row.restaurantName,
          recipientEmail: row.recipientEmail,
          subjectSnapshot: row.emailSubject,
          bodySnapshot: row.emailBody,
          eligibilityCheckedAt: new Date().toISOString(),
          status: "PREPARED",
        })),
      ),
      checksJson: JSON.stringify({ ...checks, liveSend: true, sourceSnapshotId: input.sourceSnapshotId }),
      chunkSize,
      createdById: input.createdById,
      sends: {
        create: toSend.map((row) => ({
          restaurantLeadId: row.restaurantLeadId,
          toAddress: row.recipientEmail,
          subject: row.emailSubject,
          bodyText: row.emailBody,
          status: "PREPARED",
        })),
      },
    },
  });

  const report: RestaurantLeadLiveSendReport = {
    liveBulkSendId: batch.id,
    initialApproved: input.approved.length,
    finalEligible: toSend.length,
    skippedBeforeSend,
    attempted: 0,
    sentSuccessfully: 0,
    failed: [],
    unsent: [],
    chunksCompleted: 0,
    resendCalled: false,
    providerMessageIdsStored: 0,
    duplicateSendsBlocked: skippedBeforeSend.filter((row) => /idempotency/i.test(row.reason)).length,
    companyRowsMutated: 0,
    finalStatus: "ABORTED",
  };

  if (!toSend.length) {
    await prisma.restaurantLeadOutreachBatch.update({
      where: { id: batch.id },
      data: { status: "BLOCKED", checksJson: JSON.stringify({ ...checks, report }) },
    });
    return report;
  }

  const history = await prisma.restaurantLeadSendHistory.findMany({
    where: { batchId: batch.id },
    select: { id: true, restaurantLeadId: true },
  });
  const historyByLead = new Map(history.map((row) => [row.restaurantLeadId, row.id]));
  const chunks = chunkRestaurantLeadItems(toSend, chunkSize);
  let aborted = false;

  for (const [chunkIndex, chunk] of chunks.entries()) {
    if (aborted) {
      report.unsent.push(
        ...chunk.map((row) => ({ restaurant: row.restaurantName, reason: "Stopped after system-wide provider failure" })),
      );
      continue;
    }

    for (const recipient of chunk) {
      const sentAgain = await listSuccessfullySentRestaurantLeadIds();
      if (sentAgain.has(recipient.restaurantLeadId)) {
        report.duplicateSendsBlocked += 1;
        continue;
      }

      report.attempted += 1;
      report.resendCalled = true;
      const sent = await provider.sendEmail({
        to: recipient.recipientEmail,
        subject: recipient.emailSubject,
        bodyText: recipient.emailBody,
        bodyHtml: restaurantLeadBodyHtml(recipient.emailBody),
        fromName: OUTREACH_FROM_DISPLAY_NAME,
      });
      const historyId = historyByLead.get(recipient.restaurantLeadId);

      if (!sent.ok) {
        if (historyId) {
          await prisma.restaurantLeadSendHistory.update({
            where: { id: historyId },
            data: {
              status: "FAILED",
              errorMessage: sent.error,
              provider: "RESEND",
            },
          });
        }
        report.failed.push({
          restaurant: recipient.restaurantName,
          email: recipient.recipientEmail,
          error: sent.error,
        });
        if (isSystemWideSendFailure(sent.error, sent.configured)) {
          aborted = true;
          const remainingInChunk = chunk.slice(chunk.indexOf(recipient) + 1);
          report.unsent.push(
            ...remainingInChunk.map((row) => ({
              restaurant: row.restaurantName,
              reason: "Stopped after system-wide provider failure",
            })),
          );
          break;
        }
        await sleep(400);
        continue;
      }

      if (historyId) {
        await prisma.restaurantLeadSendHistory.update({
          where: { id: historyId },
          data: {
            status: "SENT",
            provider: "RESEND",
            providerMessageId: sent.providerMessageId,
            sentAt: new Date(),
            errorMessage: null,
          },
        });
      }
      report.sentSuccessfully += 1;
      report.providerMessageIdsStored += 1;
      await sleep(400);
    }

    if (!aborted) report.chunksCompleted += 1;
    await prisma.restaurantLeadOutreachBatch.update({
      where: { id: batch.id },
      data: {
        processedCount: report.attempted,
        successCount: report.sentSuccessfully,
        failedCount: report.failed.length,
      },
    });
    if (aborted && chunkIndex < chunks.length - 1) {
      const remaining = chunks.slice(chunkIndex + 1).flat();
      report.unsent.push(
        ...remaining.map((row) => ({ restaurant: row.restaurantName, reason: "Stopped after system-wide provider failure" })),
      );
      break;
    }
    if (!aborted && chunkIndex < chunks.length - 1) await sleep(800);
  }

  report.finalStatus = aborted
    ? report.sentSuccessfully > 0
      ? "PARTIAL"
      : "ABORTED"
    : report.failed.length
      ? "PARTIAL"
      : "COMPLETED";

  await prisma.restaurantLeadOutreachBatch.update({
    where: { id: batch.id },
    data: {
      status: report.finalStatus === "COMPLETED" ? "PREPARED" : "BLOCKED",
      processedCount: report.attempted,
      successCount: report.sentSuccessfully,
      failedCount: report.failed.length,
      checksJson: JSON.stringify({ ...checks, liveSend: true, report }),
    },
  });

  return report;
}
