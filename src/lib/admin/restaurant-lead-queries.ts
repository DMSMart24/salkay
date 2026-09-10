import type { Prisma, RestaurantLead, RestaurantLeadPriority, RestaurantWebsiteStatus } from "@prisma/client";
import { getPrisma } from "@/lib/admin/prisma";
import { restaurantLeadReadyGuard } from "@/lib/admin/restaurant-email-ownership";
import { listRestaurantLeadDataset, restaurantLeadDatasetWhere } from "@/lib/admin/restaurant-lead-scope";

export type ProspectLeadPreset =
  | "all"
  | "anadolu"
  | "avrupa"
  | "high"
  | "medium"
  | "qualified_out"
  | "no_website"
  | "very_weak"
  | "weak"
  | "average"
  | "good"
  | "premium"
  | "ready_for_review"
  | "needs_review"
  | "no_email"
  | "email_verified"
  | "analyzed"
  | "fetch_failed"
  | "top20";

const PAGE_SIZE = 25;

export function parseProspectLeadPreset(value?: string | null): ProspectLeadPreset {
  const allowed: ProspectLeadPreset[] = [
    "all",
    "anadolu",
    "avrupa",
    "high",
    "medium",
    "qualified_out",
    "no_website",
    "very_weak",
    "weak",
    "average",
    "good",
    "premium",
    "ready_for_review",
    "needs_review",
    "no_email",
    "email_verified",
    "analyzed",
    "fetch_failed",
    "top20",
  ];
  return allowed.includes(value as ProspectLeadPreset) ? (value as ProspectLeadPreset) : "all";
}

function matchesPreset(lead: RestaurantLead, preset: ProspectLeadPreset) {
  switch (preset) {
    case "anadolu":
      return lead.region === "ANADOLU";
    case "avrupa":
      return lead.region === "AVRUPA";
    case "high":
      return lead.priority === "HIGH";
    case "medium":
      return lead.priority === "MEDIUM";
    case "qualified_out":
      return lead.priority === "QUALIFIED_OUT";
    case "no_website":
      return lead.websiteStatus === "NO_WEBSITE";
    case "very_weak":
      return lead.websiteStatus === "VERY_WEAK";
    case "weak":
      return lead.websiteStatus === "WEAK";
    case "average":
      return lead.websiteStatus === "IMPROVABLE";
    case "good":
      return lead.websiteStatus === "GOOD";
    case "premium":
      return lead.websiteStatus === "VERY_GOOD";
    case "ready_for_review":
      return lead.emailStatus === "READY_FOR_REVIEW";
    case "needs_review":
      return lead.emailStatus === "NEEDS_REVIEW" || lead.analysisStatus === "NEEDS_REVIEW";
    case "no_email":
      return !lead.publicEmail;
    case "email_verified":
      return lead.emailVerified && Boolean(lead.publicEmail);
    case "analyzed":
      return lead.analysisStatus !== "NOT_STARTED";
    case "fetch_failed":
      return lead.fetchStatus === "FAILED";
    case "top20":
      return lead.isFinalTop20;
    default:
      return true;
  }
}

export function summarizeProspectLeads(leads: RestaurantLead[]) {
  const countStatus = (status: RestaurantWebsiteStatus) => leads.filter((row) => row.websiteStatus === status).length;
  const countPriority = (priority: RestaurantLeadPriority) => leads.filter((row) => row.priority === priority).length;
  return {
    total: leads.length,
    anadolu: leads.filter((row) => row.region === "ANADOLU").length,
    avrupa: leads.filter((row) => row.region === "AVRUPA").length,
    high: countPriority("HIGH"),
    medium: countPriority("MEDIUM"),
    qualifiedOut: countPriority("QUALIFIED_OUT"),
    noWebsite: countStatus("NO_WEBSITE"),
    weakWebsite: countStatus("WEAK") + countStatus("VERY_WEAK"),
    veryWeak: countStatus("VERY_WEAK"),
    weak: countStatus("WEAK"),
    average: countStatus("IMPROVABLE"),
    good: countStatus("GOOD"),
    premium: countStatus("VERY_GOOD"),
    analyzed: leads.filter((row) => row.analysisStatus !== "NOT_STARTED").length,
    readyForReview: leads.filter((row) => row.emailStatus === "READY_FOR_REVIEW").length,
    needsReview: leads.filter((row) => row.emailStatus === "NEEDS_REVIEW").length,
    verifiedEmail: leads.filter((row) => row.emailVerified && Boolean(row.publicEmail)).length,
    noEmail: leads.filter((row) => !row.publicEmail).length,
    fetchFailed: leads.filter((row) => row.fetchStatus === "FAILED").length,
  };
}

export async function getProspectLeadWorkspace(preset: ProspectLeadPreset, page = 1) {
  const prisma = getPrisma();
  const leads = await prisma.restaurantLead.findMany({
    where: restaurantLeadDatasetWhere(),
    orderBy: [{ leadScore: { sort: "desc", nulls: "last" } }, { restaurantName: "asc" }],
  });
  const universe = await listRestaurantLeadDataset();
  const stats = summarizeProspectLeads(leads);
  const filtered = leads.filter((lead) => matchesPreset(lead, preset));
  const firstContact = leads
    .filter((lead) => {
      if (lead.emailStatus !== "READY_FOR_REVIEW") return false;
      return restaurantLeadReadyGuard({
        operatingStatus: lead.operatingStatus,
        emailVerified: lead.emailVerified,
        pitchConfidence: lead.pitchConfidence,
        emailSubject: lead.emailSubject,
        emailBody: lead.emailBody,
        fetchStatus: lead.fetchStatus,
        possibleDuplicate: lead.possibleDuplicate,
        primaryOpportunity: lead.primaryOpportunity,
        email: lead.publicEmail,
        website: lead.website,
        websiteDomain: lead.websiteDomain,
        emailSource: lead.emailSource,
      }).readyEligible;
    })
    .sort((a, b) => (b.salesOpportunityScore ?? 0) - (a.salesOpportunityScore ?? 0))
    .slice(0, 10);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pageCount);
  return {
    stats,
    rows: filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    total: filtered.length,
    page: safePage,
    pageCount,
    filteredIds: filtered.map((row) => row.id),
    firstContact,
    universe,
  };
}

export async function getProspectLeadById(id: string) {
  const prisma = getPrisma();
  return prisma.restaurantLead.findUnique({ where: { id } });
}

export type { Prisma };
