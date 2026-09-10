import type { RestaurantLeadBounceRecoveryAction } from "@prisma/client";
import { FIRST_WAVE_BULK_SEND_ID } from "@/lib/admin/restaurant-lead-tracking";
import { appendRestaurantLeadTimeline } from "@/lib/admin/restaurant-lead-tracking";
import { getPrisma } from "@/lib/admin/prisma";

export const PERMANENT_BOUNCE_NO_VERIFIED_ALTERNATIVE = "PERMANENT_BOUNCE_NO_VERIFIED_ALTERNATIVE";

export const FIRST_WAVE_BOUNCE_RECOVERY = [
  {
    restaurantName: "Palukçu",
    bounceType: "Permanent / General",
    alternativeEmail: null,
    alternativePhone: "0212 529 08 72 / 73 · 0539 567 14 14 · 0554 234 74 21",
    whatsapp: null,
    instagram: null,
    hasOfficialContactForm: false,
    recommendedAction: "MANUAL_CONTACT" as RestaurantLeadBounceRecoveryAction,
    emailSuppressed: true,
    emailSuppressedReason: PERMANENT_BOUNCE_NO_VERIFIED_ALTERNATIVE,
    retryStatus: "NONE" as const,
    replacementEmailStatus: "NONE" as const,
  },
  {
    restaurantName: "Rıhtım Restaurant",
    bounceType: "Permanent / General",
    alternativeEmail: null,
    alternativePhone: "+90 216 318 61 04",
    whatsapp: null,
    instagram: null,
    hasOfficialContactForm: false,
    recommendedAction: "MANUAL_CONTACT" as RestaurantLeadBounceRecoveryAction,
    emailSuppressed: true,
    emailSuppressedReason: PERMANENT_BOUNCE_NO_VERIFIED_ALTERNATIVE,
    retryStatus: "NONE" as const,
    replacementEmailStatus: "NONE" as const,
  },
  {
    restaurantName: "Sembol Künefe",
    bounceType: "Permanent / General",
    alternativeEmail: null,
    alternativePhone: "0850 259 63 63",
    whatsapp: null,
    instagram: "https://www.instagram.com/sembolkunefe/",
    hasOfficialContactForm: false,
    recommendedAction: "MANUAL_CONTACT" as RestaurantLeadBounceRecoveryAction,
    emailSuppressed: true,
    emailSuppressedReason: PERMANENT_BOUNCE_NO_VERIFIED_ALTERNATIVE,
    retryStatus: "NONE" as const,
    replacementEmailStatus: "NONE" as const,
  },
  {
    restaurantName: "Sensus Wine & Food Ataşehir",
    bounceType: "Permanent / General",
    alternativeEmail: null,
    alternativePhone: "0216 672 45 45",
    whatsapp: "https://api.whatsapp.com/send/?phone=905342045415",
    instagram: "https://www.instagram.com/sensuswinefood",
    hasOfficialContactForm: true,
    recommendedAction: "MANUAL_CONTACT" as RestaurantLeadBounceRecoveryAction,
    emailSuppressed: true,
    emailSuppressedReason: PERMANENT_BOUNCE_NO_VERIFIED_ALTERNATIVE,
    retryStatus: "NONE" as const,
    replacementEmailStatus: "NONE" as const,
  },
  {
    restaurantName: "İnciraltı Meyhanesi",
    bounceType: "Permanent / General",
    alternativeEmail: "iletisim@inciralti.com.tr",
    alternativePhone: "0216 557 66 86 · 0530 265 25 05",
    whatsapp: null,
    instagram: "https://www.instagram.com/inciraltimeyhanesi",
    hasOfficialContactForm: false,
    recommendedAction: "USE_NEW_EMAIL" as RestaurantLeadBounceRecoveryAction,
    emailSuppressed: true,
    emailSuppressedReason: "PERMANENT_BOUNCE_REPLACEMENT_PENDING_APPROVAL",
    retryStatus: "NONE" as const,
    replacementEmailStatus: "NEEDS_HUMAN_APPROVAL" as const,
  },
  {
    restaurantName: "Sembol Ocakbaşı Çamlıca",
    bounceType: "Transient / General",
    alternativeEmail: null,
    alternativePhone: "0850 259 63 63",
    whatsapp: "https://wa.me/905316365363",
    instagram: "https://www.instagram.com/sembolocakbasi",
    hasOfficialContactForm: false,
    recommendedAction: "RETRY_LATER_TRANSIENT" as RestaurantLeadBounceRecoveryAction,
    emailSuppressed: true,
    emailSuppressedReason: "TRANSIENT_BOUNCE_HUMAN_REVIEW",
    retryStatus: "HUMAN_REVIEW_REQUIRED" as const,
    replacementEmailStatus: "NONE" as const,
  },
  {
    restaurantName: "Madalyalı Restoran",
    bounceType: "Transient / MailboxFull",
    alternativeEmail: null,
    alternativePhone: "0216 471 04 82",
    whatsapp: "https://api.whatsapp.com/send/?phone=905318841502",
    instagram: "https://www.instagram.com/madalyalirestoran",
    hasOfficialContactForm: true,
    recommendedAction: "RETRY_LATER_TRANSIENT" as RestaurantLeadBounceRecoveryAction,
    emailSuppressed: true,
    emailSuppressedReason: "TRANSIENT_BOUNCE_HUMAN_REVIEW",
    retryStatus: "HUMAN_REVIEW_REQUIRED" as const,
    replacementEmailStatus: "NONE" as const,
  },
] as const;

export function bounceTypeFromError(errorMessage?: string | null) {
  if (!errorMessage) return "Unknown";
  if (/MailboxFull/i.test(errorMessage)) return "Transient / MailboxFull";
  if (/Transient/i.test(errorMessage)) return "Transient / General";
  if (/Permanent/i.test(errorMessage)) return "Permanent / General";
  return errorMessage;
}

export async function applySafeBounceContactStates() {
  const prisma = getPrisma();
  const companiesBefore = await prisma.company.count();
  const names = FIRST_WAVE_BOUNCE_RECOVERY.map((row) => row.restaurantName);
  const leads = await prisma.restaurantLead.findMany({
    where: { restaurantName: { in: [...names] } },
    include: {
      sendHistory: {
        where: { batchId: FIRST_WAVE_BULK_SEND_ID, deliveryStatus: "BOUNCED" },
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
  });

  const applied = [];
  for (const plan of FIRST_WAVE_BOUNCE_RECOVERY) {
    const lead = leads.find((row) => row.restaurantName === plan.restaurantName);
    if (!lead) continue;
    await prisma.restaurantLead.update({
      where: { id: lead.id },
      data: {
        followUpStatus: "STOPPED",
        nextFollowUpAt: null,
        emailSuppressed: plan.emailSuppressed,
        emailSuppressedReason: plan.emailSuppressedReason,
        approvedReplacementEmail: plan.alternativeEmail,
        replacementEmailStatus: plan.replacementEmailStatus,
        retryStatus: plan.retryStatus,
        bounceRecoveryAction: plan.recommendedAction,
        hasOfficialContactForm: plan.hasOfficialContactForm,
        emailStatus: plan.replacementEmailStatus === "NEEDS_HUMAN_APPROVAL" ? "NEEDS_REVIEW" : lead.emailStatus,
        whatsapp: lead.whatsapp || plan.whatsapp,
        instagram: lead.instagram || plan.instagram,
        publicEmail: lead.publicEmail,
      },
    });
    await appendRestaurantLeadTimeline({
      restaurantLeadId: lead.id,
      kind: "NOTE",
      at: new Date(),
      source: "BOUNCE_RECOVERY_STATES",
      label: `Güvenli iletişim durumu: ${plan.recommendedAction}`,
      metadata: JSON.stringify({
        emailSuppressed: plan.emailSuppressed,
        reason: plan.emailSuppressedReason,
        replacementEmail: plan.alternativeEmail,
        replacementEmailStatus: plan.replacementEmailStatus,
        retryStatus: plan.retryStatus,
        publicEmailUnchanged: lead.publicEmail,
      }),
    });
    applied.push({
      restaurant: lead.restaurantName,
      publicEmail: lead.publicEmail,
      replacement: plan.alternativeEmail,
    });
  }

  return {
    appliedCount: applied.length,
    applied,
    COMPANY_ROWS_MUTATED: (await prisma.company.count()) - companiesBefore,
  };
}

export async function getBounceRecoveryWorkspace() {
  const prisma = getPrisma();
  const names = FIRST_WAVE_BOUNCE_RECOVERY.map((row) => row.restaurantName);
  const leads = await prisma.restaurantLead.findMany({
    where: { restaurantName: { in: [...names] } },
    include: {
      sendHistory: {
        where: { batchId: FIRST_WAVE_BULK_SEND_ID, deliveryStatus: "BOUNCED" },
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
    orderBy: { restaurantName: "asc" },
  });

  const rows = leads.map((lead) => {
    const plan = FIRST_WAVE_BOUNCE_RECOVERY.find((item) => item.restaurantName === lead.restaurantName);
    const send = lead.sendHistory[0];
    return {
      id: lead.id,
      restaurantName: lead.restaurantName,
      bounceType: bounceTypeFromError(send?.errorMessage) || plan?.bounceType || "Unknown",
      currentEmail: send?.toAddress || lead.publicEmail,
      alternativeEmail: lead.approvedReplacementEmail,
      alternativePhone: lead.phone || plan?.alternativePhone || null,
      whatsapp: lead.whatsapp,
      instagram: lead.instagram,
      contactForm: lead.hasOfficialContactForm,
      recommendedAction: lead.bounceRecoveryAction,
      emailSuppressed: lead.emailSuppressed,
      emailSuppressedReason: lead.emailSuppressedReason,
      replacementEmailStatus: lead.replacementEmailStatus,
      retryStatus: lead.retryStatus,
      followUpStatus: lead.followUpStatus,
    };
  });

  return {
    rows,
    counters: {
      PERMANENT_SUPPRESSED: rows.filter((row) => row.emailSuppressedReason === PERMANENT_BOUNCE_NO_VERIFIED_ALTERNATIVE)
        .length,
      ALTERNATIVE_EMAIL_PENDING_APPROVAL: rows.filter(
        (row) => row.replacementEmailStatus === "NEEDS_HUMAN_APPROVAL",
      ).length,
      TRANSIENT_HUMAN_REVIEW: rows.filter((row) => row.retryStatus === "HUMAN_REVIEW_REQUIRED").length,
      MANUAL_CONTACT_ONLY: rows.filter((row) => row.recommendedAction === "MANUAL_CONTACT").length,
    },
  };
}
