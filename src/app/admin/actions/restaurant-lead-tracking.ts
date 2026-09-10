"use server";

import { revalidatePath } from "next/cache";
import {
  followUpSendIsBlocked,
  prepareDueRestaurantLeadFollowUpDrafts,
} from "@/lib/admin/restaurant-lead-followup";
import { getPrisma } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";
import { appendRestaurantLeadTimeline, refreshRestaurantLeadFollowUpDue } from "@/lib/admin/restaurant-lead-tracking";
import type { FormState } from "@/lib/admin/validation";

function leadIdFrom(formData: FormData) {
  return String(formData.get("leadId") ?? "").trim();
}

async function touchLeadPaths(leadId: string) {
  revalidatePath("/admin/restaurant-leads");
  revalidatePath("/admin/restaurant-leads/outreach");
  revalidatePath(`/admin/restaurant-leads/${leadId}`);
  revalidatePath("/admin/emails");
}

export async function markRestaurantLeadReplyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const leadId = leadIdFrom(formData);
  const kind = String(formData.get("replyKind") ?? "");
  if (!leadId) return { error: "Lead bulunamadı." };

  const now = new Date();
  const prisma = getPrisma();
  const lead = await prisma.restaurantLead.findUnique({ where: { id: leadId } });
  if (!lead) return { error: "Lead bulunamadı." };

  if (kind === "NO_REPLY") {
    await prisma.restaurantLead.update({
      where: { id: leadId },
      data: { replyStatus: "NO_REPLY" },
    });
    await touchLeadPaths(leadId);
    return { success: "Yanıt yok olarak işaretlendi. Follow-up durdurulmadı." };
  }

  if (kind === "AUTO_REPLY") {
    await prisma.restaurantLead.update({
      where: { id: leadId },
      data: {
        replyStatus: "AUTO_REPLY",
        repliedAt: now,
        lastInboundAt: now,
        followUpStatus: "NEEDS_REVIEW",
      },
    });
    await appendRestaurantLeadTimeline({
      restaurantLeadId: leadId,
      kind: "REPLY",
      at: now,
      source: "MANUAL",
      label: "Otomatik yanıt — insan incelemesi",
    });
    await touchLeadPaths(leadId);
    return { success: "Otomatik yanıt işaretlendi. Pozitif/negatif değil; follow-up durdu değil, inceleme bekliyor." };
  }

  const replyStatus =
    kind === "POSITIVE" ? "POSITIVE" : kind === "NEGATIVE" ? "NEGATIVE" : kind === "REPLIED" ? "REPLIED" : null;
  if (!replyStatus) return { error: "Geçersiz yanıt türü." };

  const salesStatus =
    replyStatus === "NEGATIVE" ? "LOST" : replyStatus === "POSITIVE" ? "INTERESTED" : "REPLIED";
  const contactStatus = replyStatus === "NEGATIVE" ? lead.contactStatus : "REPLIED";

  await prisma.restaurantLead.update({
    where: { id: leadId },
    data: {
      replyStatus,
      repliedAt: now,
      lastInboundAt: now,
      followUpStatus: "STOPPED",
      nextFollowUpAt: null,
      salesStatus,
      contactStatus,
    },
  });
  await appendRestaurantLeadTimeline({
    restaurantLeadId: leadId,
    kind: replyStatus === "NEGATIVE" ? "LOST" : "REPLY",
    at: now,
    source: "MANUAL",
    label:
      replyStatus === "POSITIVE"
        ? "Pozitif yanıt"
        : replyStatus === "NEGATIVE"
          ? "Negatif yanıt"
          : "Yanıt geldi",
  });
  await touchLeadPaths(leadId);
  return { success: "Yanıt kaydedildi. Otomatik follow-up durduruldu." };
}

export async function planRestaurantLeadMeetingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const leadId = leadIdFrom(formData);
  if (!leadId) return { error: "Lead bulunamadı." };
  const prisma = getPrisma();
  await prisma.restaurantLead.update({
    where: { id: leadId },
    data: { salesStatus: "MEETING", followUpStatus: "STOPPED" },
  });
  await appendRestaurantLeadTimeline({
    restaurantLeadId: leadId,
    kind: "MEETING",
    at: new Date(),
    source: "MANUAL",
    label: "Görüşme planlandı",
  });
  await touchLeadPaths(leadId);
  return { success: "Görüşme durumu kaydedildi. Company değişmedi." };
}

export async function prepareRestaurantLeadOfferAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const leadId = leadIdFrom(formData);
  if (!leadId) return { error: "Lead bulunamadı." };
  const prisma = getPrisma();
  await prisma.restaurantLead.update({
    where: { id: leadId },
    data: { salesStatus: "PROPOSAL", followUpStatus: "STOPPED" },
  });
  await appendRestaurantLeadTimeline({
    restaurantLeadId: leadId,
    kind: "OFFER",
    at: new Date(),
    source: "MANUAL",
    label: "Teklif hazırlığı",
  });
  await touchLeadPaths(leadId);
  return { success: "Teklif durumu kaydedildi. Company değişmedi." };
}

export async function addRestaurantLeadNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const leadId = leadIdFrom(formData);
  const note = String(formData.get("note") ?? "").trim();
  if (!leadId) return { error: "Lead bulunamadı." };
  if (!note) return { error: "Not boş olamaz." };
  const prisma = getPrisma();
  const lead = await prisma.restaurantLead.findUnique({ where: { id: leadId }, select: { outreachNotes: true } });
  if (!lead) return { error: "Lead bulunamadı." };
  await prisma.restaurantLead.update({
    where: { id: leadId },
    data: {
      outreachNotes: lead.outreachNotes ? `${lead.outreachNotes}\n${note}` : note,
    },
  });
  await appendRestaurantLeadTimeline({
    restaurantLeadId: leadId,
    kind: "NOTE",
    at: new Date(),
    source: "MANUAL",
    label: "Not eklendi",
    metadata: note.slice(0, 180),
  });
  await touchLeadPaths(leadId);
  return { success: "Not eklendi. Research/draft alanları değişmedi." };
}

export async function refreshRestaurantLeadFollowUpsAction() {
  await requireAdmin();
  await refreshRestaurantLeadFollowUpDue();
  revalidatePath("/admin/restaurant-leads/outreach");
}

export async function prepareRestaurantLeadFollowUpDraftsAction() {
  await requireAdmin();
  await prepareDueRestaurantLeadFollowUpDrafts();
  revalidatePath("/admin/restaurant-leads/outreach");
}

export async function sendRestaurantLeadFollowUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const confirmed = formData.get("reviewed") === "on" || formData.get("reviewed") === "true";
  if (!confirmed) return { error: "Follow-up göndermek için onayı işaretleyin." };
  const blocked = followUpSendIsBlocked();
  return { error: blocked.error };
}
