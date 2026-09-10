import type { RestaurantLeadDeliveryStatus } from "@prisma/client";
import { getPrisma } from "@/lib/admin/prisma";
import { suppressEmail } from "@/lib/admin/suppression";
import { appendRestaurantLeadTimeline, FIRST_WAVE_BULK_SEND_ID } from "@/lib/admin/restaurant-lead-tracking";

export const SYNC_SOURCE = "RESEND_RETRIEVE_RECONCILIATION";

const DELIVERY_RANK: Record<RestaurantLeadDeliveryStatus, number> = {
  PENDING: 0,
  DELAYED: 1,
  DELIVERED: 2,
  FAILED: 3,
  BOUNCED: 4,
  COMPLAINED: 5,
};

export function deliveryStatusRank(status: RestaurantLeadDeliveryStatus) {
  return DELIVERY_RANK[status] ?? 0;
}

export function canReplaceDeliveryStatus(
  current: RestaurantLeadDeliveryStatus,
  next: RestaurantLeadDeliveryStatus,
) {
  return deliveryStatusRank(next) >= deliveryStatusRank(current);
}

export function mapResendLastEventToDelivery(lastEvent?: string | null): RestaurantLeadDeliveryStatus | null {
  switch ((lastEvent ?? "").trim().toLowerCase()) {
    case "delivered":
      return "DELIVERED";
    case "bounced":
      return "BOUNCED";
    case "delivery_delayed":
    case "delayed":
      return "DELAYED";
    case "complained":
      return "COMPLAINED";
    case "failed":
      return "FAILED";
    case "sent":
    case "queued":
    case "scheduled":
      return "PENDING";
    default:
      return null;
  }
}

function resendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || null;
}

type ResendEmailRetrieve = {
  id?: string;
  last_event?: string;
  created_at?: string;
  to?: string[];
  subject?: string;
  bounce?: { type?: string; message?: string; subType?: string };
};

async function retrieveResendEmail(id: string) {
  const apiKey = resendApiKey();
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const response = await fetch(`https://api.resend.com/emails/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const payload = (await response.json().catch(() => ({}))) as ResendEmailRetrieve & {
    message?: string;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.message || `Resend retrieve ${id} failed`);
  }
  return payload;
}

function bounceNote(email: ResendEmailRetrieve) {
  const parts = [
    email.bounce?.type ? `type:${email.bounce.type}` : null,
    email.bounce?.subType ? `subType:${email.bounce.subType}` : null,
    email.bounce?.message ?? null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export async function reconcileFirstWaveFromResendRetrieve(input: { token: string }) {
  const prisma = getPrisma();
  const stored = await prisma.restaurantLeadWebhookConfig.findUnique({
    where: { id: "resend-production" },
  });
  if (!stored?.activationToken || stored.activationToken !== input.token) {
    return { ok: false as const, error: "unauthorized" };
  }

  await prisma.restaurantLeadWebhookConfig.update({
    where: { id: "resend-production" },
    data: { activationToken: null },
  });

  const companiesBefore = await prisma.company.count();
  const sends = await prisma.restaurantLeadSendHistory.findMany({
    where: { batchId: FIRST_WAVE_BULK_SEND_ID, status: "SENT" },
    include: { restaurantLead: true },
    orderBy: { sentAt: "asc" },
  });

  const now = new Date();
  let retrieveSuccess = 0;
  let retrieveFailed = 0;
  let rowsUpdated = 0;
  let rowsAlreadyCurrent = 0;
  let statusConflicts = 0;
  const bouncedRecipients: Array<{
    restaurant: string;
    email: string;
    providerMessageId: string;
    bounceReason: string | null;
  }> = [];
  const delayedRecipients: Array<{ restaurant: string; email: string; providerMessageId: string }> = [];
  const otherLastEvents: Record<string, number> = {};
  const failedRetrieves: Array<{ sendId: string; providerMessageId: string | null; error: string }> = [];

  for (const send of sends) {
    if (!send.providerMessageId) {
      retrieveFailed += 1;
      failedRetrieves.push({ sendId: send.id, providerMessageId: null, error: "missing providerMessageId" });
      continue;
    }

    let email: ResendEmailRetrieve;
    try {
      email = await retrieveResendEmail(send.providerMessageId);
      retrieveSuccess += 1;
    } catch (error) {
      retrieveFailed += 1;
      failedRetrieves.push({
        sendId: send.id,
        providerMessageId: send.providerMessageId,
        error: error instanceof Error ? error.message : "retrieve_failed",
      });
      continue;
    }

    const lastEvent = email.last_event ?? "unknown";
    const nextStatus = mapResendLastEventToDelivery(lastEvent);
    if (!nextStatus) {
      otherLastEvents[lastEvent] = (otherLastEvents[lastEvent] ?? 0) + 1;
    }
    const mapped = nextStatus ?? send.deliveryStatus;
    const bounceReason = lastEvent === "bounced" ? bounceNote(email) : null;
    const current = send.deliveryStatus;
    const conflict = nextStatus ? !canReplaceDeliveryStatus(current, nextStatus) : false;

    if (conflict) {
      statusConflicts += 1;
      continue;
    }

    if (nextStatus && current !== nextStatus) {
      rowsUpdated += 1;
    } else {
      rowsAlreadyCurrent += 1;
    }

    const stopFollowUp = mapped === "BOUNCED" || mapped === "COMPLAINED";
    const blockFollowUpDue = mapped === "DELAYED" || stopFollowUp;
    const providerAt = email.created_at ? new Date(email.created_at) : null;

    await prisma.restaurantLeadSendHistory.update({
      where: { id: send.id },
      data: {
        deliveryStatus: mapped,
        deliveredAt: mapped === "DELIVERED" ? now : send.deliveredAt,
        bouncedAt: mapped === "BOUNCED" ? now : send.bouncedAt,
        complainedAt: mapped === "COMPLAINED" ? now : send.complainedAt,
        errorMessage:
          mapped === "BOUNCED"
            ? ["reconcile:bounced", bounceReason].filter(Boolean).join(" · ")
            : mapped === "DELAYED"
              ? "reconcile:delivery_delayed"
              : send.errorMessage,
        providerLastEvent: lastEvent,
        providerStatusSyncedAt: now,
        providerStatusSource: SYNC_SOURCE,
      },
    });

    await prisma.restaurantLead.update({
      where: { id: send.restaurantLeadId },
      data: {
        deliveryStatus: mapped,
        deliveredAt: mapped === "DELIVERED" ? now : undefined,
        bouncedAt: mapped === "BOUNCED" ? now : undefined,
        complainedAt: mapped === "COMPLAINED" ? now : undefined,
        followUpStatus: stopFollowUp ? "STOPPED" : send.restaurantLead.followUpStatus,
        nextFollowUpAt: blockFollowUpDue ? null : send.restaurantLead.nextFollowUpAt,
        salesStatus: mapped === "COMPLAINED" ? "DO_NOT_CONTACT" : undefined,
      },
    });

    const timelineKind =
      mapped === "DELIVERED"
        ? "DELIVERED"
        : mapped === "BOUNCED"
          ? "BOUNCED"
          : mapped === "COMPLAINED"
            ? "COMPLAINED"
            : mapped === "DELAYED"
              ? "DELAYED"
              : null;
    if (timelineKind) {
      await appendRestaurantLeadTimeline({
        restaurantLeadId: send.restaurantLeadId,
        kind: timelineKind,
        at: now,
        source: SYNC_SOURCE,
        label:
          mapped === "DELIVERED"
            ? "Teslim (Resend retrieve)"
            : mapped === "BOUNCED"
              ? "Bounce (Resend retrieve)"
              : mapped === "DELAYED"
                ? "Teslimat gecikti (Resend retrieve)"
                : "Şikayet (Resend retrieve)",
        sendHistoryId: send.id,
        metadata: JSON.stringify({
          providerMessageId: send.providerMessageId,
          providerLastEvent: lastEvent,
          syncedAt: now.toISOString(),
          source: SYNC_SOURCE,
          bounceReason,
          providerCreatedAt: providerAt?.toISOString() ?? null,
        }),
      });
    }

    if (mapped === "BOUNCED") {
      await suppressEmail(prisma, {
        email: send.toAddress,
        reason: "BOUNCED",
        source: SYNC_SOURCE,
        notes: `RestaurantLead bounce · ${send.providerMessageId}${bounceReason ? ` · ${bounceReason}` : ""}`,
      });
      bouncedRecipients.push({
        restaurant: send.restaurantLead.restaurantName,
        email: send.toAddress,
        providerMessageId: send.providerMessageId,
        bounceReason,
      });
    }
    if (mapped === "DELAYED") {
      delayedRecipients.push({
        restaurant: send.restaurantLead.restaurantName,
        email: send.toAddress,
        providerMessageId: send.providerMessageId,
      });
    }
  }

  const after = await prisma.restaurantLeadSendHistory.findMany({
    where: { batchId: FIRST_WAVE_BULK_SEND_ID, status: "SENT" },
    include: { restaurantLead: true },
  });
  const counts = {
    DELIVERED: 0,
    BOUNCED: 0,
    DELAYED: 0,
    PENDING: 0,
    COMPLAINED: 0,
    FAILED: 0,
  };
  let bouncedFollowUpStopped = 0;
  let delayedFollowUpBlocked = 0;
  for (const row of after) {
    counts[row.deliveryStatus as keyof typeof counts] += 1;
    if (row.deliveryStatus === "BOUNCED" && row.restaurantLead.followUpStatus === "STOPPED") {
      bouncedFollowUpStopped += 1;
    }
    if (
      row.deliveryStatus === "DELAYED" &&
      row.restaurantLead.followUpStatus !== "DUE" &&
      row.restaurantLead.followUpStatus !== "DRAFT_READY"
    ) {
      delayedFollowUpBlocked += 1;
    }
  }

  const companiesAfter = await prisma.company.count();
  return {
    ok: true as const,
    BULK_SEND_ID: FIRST_WAVE_BULK_SEND_ID,
    ROWS_PROCESSED: sends.length,
    RESEND_RETRIEVE_SUCCESS: retrieveSuccess,
    RESEND_RETRIEVE_FAILED: retrieveFailed,
    DELIVERED: counts.DELIVERED,
    BOUNCED: counts.BOUNCED,
    DELAYED: counts.DELAYED,
    PENDING: counts.PENDING,
    COMPLAINED: counts.COMPLAINED,
    FAILED: counts.FAILED,
    BOUNCED_FOLLOWUP_STOPPED: bouncedFollowUpStopped,
    DELAYED_FOLLOWUP_BLOCKED: delayedFollowUpBlocked,
    ROWS_UPDATED: rowsUpdated,
    ROWS_ALREADY_CURRENT: rowsAlreadyCurrent,
    STATUS_CONFLICTS: statusConflicts,
    OTHER_LAST_EVENTS: otherLastEvents,
    FAILED_RETRIEVES: failedRetrieves,
    bouncedRecipients,
    delayedRecipients,
    SYNC_SOURCE,
    COMPANY_ROWS: companiesAfter,
    COMPANY_ROWS_MUTATED: companiesAfter - companiesBefore,
  };
}
