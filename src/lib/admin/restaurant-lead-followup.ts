import type { RestaurantLead, RestaurantLeadSendHistory } from "@prisma/client";
import { getPrisma } from "@/lib/admin/prisma";
import {
  appendRestaurantLeadTimeline,
  evaluateFollowUpDraftEligibility,
} from "@/lib/admin/restaurant-lead-tracking";

const SIGNATURE = ["İyi çalışmalar,", "Salih Kaya", "SALKAY"];

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function restaurantLabel(name: string) {
  return name.replace(/\s+(restaurant|restoran|cafe|lokanta)$/i, "").trim() || name;
}

function verifiedOpportunity(lead: Pick<RestaurantLead, "primaryOpportunity" | "salkayPitch" | "servicesToPitch">) {
  const fromPrimary = lead.primaryOpportunity?.trim();
  if (fromPrimary) return fromPrimary.replace(/\.+$/, "");
  const fromPitch = lead.salkayPitch?.trim();
  if (fromPitch) return fromPitch.split(/[.!\n]/)[0]?.trim() || fromPitch;
  const fromService = lead.servicesToPitch.find((item) => item.trim());
  if (fromService) return fromService.trim();
  return "web siteniz ve dijital görünümünüz";
}

function normalizeForOverlap(value: string) {
  return value.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
}

export function followUpCopiesFirstEmail(firstBody: string, followUpBody: string) {
  const first = normalizeForOverlap(firstBody);
  const followUp = normalizeForOverlap(followUpBody);
  if (!first || !followUp) return false;
  const windowSize = 12;
  const followWords = followUp.split(" ");
  for (let index = 0; index <= followWords.length - windowSize; index += 1) {
    const chunk = followWords.slice(index, index + windowSize).join(" ");
    if (chunk.length > 40 && first.includes(chunk)) return true;
  }
  return followUp.includes(first.slice(0, Math.min(first.length, 80)));
}

export function buildRestaurantLeadFollowUpDraft(
  lead: Pick<RestaurantLead, "restaurantName" | "primaryOpportunity" | "salkayPitch" | "servicesToPitch">,
  firstSend: Pick<RestaurantLeadSendHistory, "subject" | "bodyText">,
) {
  const name = restaurantLabel(lead.restaurantName);
  const opportunity = verifiedOpportunity(lead);
  const subject = `${name} için kısa bir takip`;
  const body = [
    `Merhaba ${name} ekibi,`,
    "",
    "Geçtiğimiz günlerde web siteniz ve dijital görünümünüzle ilgili kısa bir not paylaşmıştım.",
    "",
    `Özellikle ${opportunity} tarafında birkaç somut fikir hazırlayabileceğimizi düşünüyorum.`,
    "",
    "Uygun olursanız size kısa bir örnek çalışma paylaşabilirim.",
    "Bu yalnızca kısa bir takip; ilk e-postadaki uzun anlatımı tekrar etmiyorum.",
    "",
    ...SIGNATURE,
  ].join("\n");

  const words = wordCount(body);
  const copies = followUpCopiesFirstEmail(firstSend.bodyText, body);
  const sameSubject = normalizeForOverlap(subject) === normalizeForOverlap(firstSend.subject);
  const ok = words >= 50 && words <= 90 && !copies && !sameSubject;
  return {
    subject,
    bodyText: body,
    opportunityUsed: opportunity,
    wordCount: words,
    ok,
    reasons: [
      ...(words < 50 || words > 90 ? [`word count ${words} outside 50-90`] : []),
      ...(copies ? ["copies first email"] : []),
      ...(sameSubject ? ["subject repeats first email"] : []),
    ],
  };
}

export async function prepareDueRestaurantLeadFollowUpDrafts() {
  const prisma = getPrisma();
  const leads = await prisma.restaurantLead.findMany({
    where: { followUpStatus: "DUE" },
    include: {
      sendHistory: { where: { status: "SENT" }, orderBy: { sentAt: "asc" }, take: 1 },
    },
  });

  const prepared = [];
  const excluded = [];
  for (const lead of leads) {
    const initial = lead.sendHistory[0];
    const eligibility = evaluateFollowUpDraftEligibility({
      initialSendStatus: initial?.status,
      deliveryStatus: lead.deliveryStatus,
      replyStatus: lead.replyStatus,
      followUpStatus: lead.followUpStatus,
      emailVerified: lead.emailVerified,
      publicEmail: lead.publicEmail,
      possibleDuplicate: lead.possibleDuplicate,
      operatingStatus: lead.operatingStatus,
      salesStatus: lead.salesStatus,
      emailSuppressed: lead.emailSuppressed,
    });
    if (!initial || !eligibility.ok) {
      excluded.push({
        restaurantLeadId: lead.id,
        restaurantName: lead.restaurantName,
        reasons: eligibility.reasons,
      });
      continue;
    }

    const draft = buildRestaurantLeadFollowUpDraft(lead, initial);
    await prisma.restaurantLeadFollowUpDraft.create({
      data: {
        restaurantLeadId: lead.id,
        sourceSendId: initial.id,
        subject: draft.subject,
        bodyText: draft.bodyText,
        opportunityUsed: draft.opportunityUsed,
        excludeReason: draft.ok ? null : draft.reasons.join(" · "),
      },
    });
    await prisma.restaurantLead.update({
      where: { id: lead.id },
      data: { followUpStatus: draft.ok ? "DRAFT_READY" : "NEEDS_REVIEW" },
    });
    await appendRestaurantLeadTimeline({
      restaurantLeadId: lead.id,
      kind: "FOLLOW_UP_DRAFT",
      at: new Date(),
      source: "SYSTEM",
      label: draft.ok ? "Follow-up taslağı hazır" : "Follow-up taslağı incelemeye alındı",
      sendHistoryId: initial.id,
      metadata: draft.opportunityUsed,
    });
    prepared.push({ restaurantLeadId: lead.id, ok: draft.ok, wordCount: draft.wordCount });
  }

  return { preparedCount: prepared.length, excludedCount: excluded.length, prepared, excluded };
}

export function followUpSendIsBlocked() {
  return {
    blocked: true as const,
    resendCalled: false,
    error: "Follow-up gönderimi bu fazda kapalı. Taslak ve önizleme var; Resend çağrılmadı.",
  };
}
