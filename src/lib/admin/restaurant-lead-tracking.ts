import type {
  RestaurantLead,
  RestaurantLeadDeliveryStatus,
  RestaurantLeadFollowUpStatus,
  RestaurantLeadReplyStatus,
  RestaurantLeadSendHistory,
  RestaurantLeadTimelineKind,
  RestaurantSalesStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/admin/prisma";

export const FIRST_WAVE_BULK_SEND_ID = "cmtvoi4d60000ju04ip91olvv";
export const FIRST_FOLLOW_UP_BUSINESS_DAYS = 4;
export const ISTANBUL_TIME_ZONE = "Europe/Istanbul";

export type RestaurantLeadOutreachFilter =
  | "SENT"
  | "DELIVERED"
  | "PENDING"
  | "DELAYED"
  | "BOUNCED"
  | "COMPLAINED"
  | "REPLIED"
  | "POSITIVE"
  | "NEGATIVE"
  | "NO_REPLY"
  | "FOLLOW_UP_DUE"
  | "FOLLOW_UP_DRAFT_READY";

export type RestaurantLeadPostSendCounters = {
  sent: number;
  delivered: number;
  pending: number;
  delayed: number;
  bounced: number;
  complained: number;
  failed: number;
  replied: number;
  positive: number;
  negative: number;
  noReply: number;
  followUpDue: number;
  followUpDraftReady: number;
  pendingOver24h: number;
};

export function parseRestaurantLeadOutreachFilter(value?: string | null): RestaurantLeadOutreachFilter | "ALL" {
  const allowed: RestaurantLeadOutreachFilter[] = [
    "SENT",
    "DELIVERED",
    "PENDING",
    "DELAYED",
    "BOUNCED",
    "COMPLAINED",
    "REPLIED",
    "POSITIVE",
    "NEGATIVE",
    "NO_REPLY",
    "FOLLOW_UP_DUE",
    "FOLLOW_UP_DRAFT_READY",
  ];
  return allowed.includes(value as RestaurantLeadOutreachFilter) ? (value as RestaurantLeadOutreachFilter) : "ALL";
}

export function isPendingDelivery(status: RestaurantLeadDeliveryStatus) {
  return status === "PENDING";
}

export function isStalePendingDelivery(sentAt?: Date | null, now = new Date()) {
  if (!sentAt) return false;
  return now.getTime() - sentAt.getTime() >= 24 * 60 * 60 * 1000;
}

export function istanbulWeekday(date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: ISTANBUL_TIME_ZONE, weekday: "short" }).format(date);
}

export function isIstanbulWeekend(date: Date) {
  const day = istanbulWeekday(date);
  return day === "Sat" || day === "Sun";
}

export function addBusinessDays(from: Date, days: number, timeZone = ISTANBUL_TIME_ZONE) {
  const cursor = new Date(from.getTime());
  let added = 0;
  while (added < days) {
    cursor.setTime(cursor.getTime() + 24 * 60 * 60 * 1000);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(cursor);
    if (weekday !== "Sat" && weekday !== "Sun") added += 1;
  }
  return cursor;
}

export function firstFollowUpDueAt(sentAt: Date) {
  return addBusinessDays(sentAt, FIRST_FOLLOW_UP_BUSINESS_DAYS);
}

export function isFollowUpTimeReached(sentAt: Date, now = new Date()) {
  return now.getTime() >= firstFollowUpDueAt(sentAt).getTime();
}

export function mapResendEventToDelivery(eventType: string): RestaurantLeadDeliveryStatus | null {
  switch (eventType) {
    case "email.delivered":
      return "DELIVERED";
    case "email.delivery_delayed":
      return "DELAYED";
    case "email.bounced":
      return "BOUNCED";
    case "email.complained":
      return "COMPLAINED";
    case "email.failed":
      return "FAILED";
    default:
      return null;
  }
}

export function resendEventId(input: { svixId?: string | null; type: string; emailId?: string | null; createdAt?: string | null }) {
  if (input.svixId?.trim()) return input.svixId.trim();
  return `${input.type}:${input.emailId ?? "unknown"}:${input.createdAt ?? "unknown"}`;
}

export function evaluateFollowUpDraftEligibility(input: {
  initialSendStatus?: string | null;
  deliveryStatus: RestaurantLeadDeliveryStatus;
  replyStatus: RestaurantLeadReplyStatus;
  followUpStatus: RestaurantLeadFollowUpStatus;
  emailVerified: boolean;
  publicEmail?: string | null;
  possibleDuplicate: boolean;
  operatingStatus: string;
  salesStatus: RestaurantSalesStatus;
}) {
  const reasons: string[] = [];
  if (input.initialSendStatus !== "SENT") reasons.push("initial send is not SENT");
  if (input.deliveryStatus === "BOUNCED") reasons.push("deliveryStatus = BOUNCED");
  if (input.deliveryStatus === "COMPLAINED") reasons.push("deliveryStatus = COMPLAINED");
  if (input.deliveryStatus === "DELAYED") reasons.push("deliveryStatus = DELAYED");
  if (input.replyStatus !== "NO_REPLY") reasons.push("replyStatus is not NO_REPLY");
  if (input.followUpStatus !== "DUE") reasons.push("followUpStatus is not DUE");
  if (!input.emailVerified) reasons.push("emailVerified = false");
  if (!input.publicEmail?.trim()) reasons.push("publicEmail missing");
  if (input.possibleDuplicate) reasons.push("possibleDuplicate = true");
  if (input.operatingStatus !== "ACTIVE") reasons.push("operatingStatus is not ACTIVE");
  if (input.salesStatus === "LOST" || input.salesStatus === "DO_NOT_CONTACT") reasons.push("salesStatus blocked");
  return { ok: reasons.length === 0, reasons };
}

export function emptyPostSendCounters(): RestaurantLeadPostSendCounters {
  return {
    sent: 0,
    delivered: 0,
    pending: 0,
    delayed: 0,
    bounced: 0,
    complained: 0,
    failed: 0,
    replied: 0,
    positive: 0,
    negative: 0,
    noReply: 0,
    followUpDue: 0,
    followUpDraftReady: 0,
    pendingOver24h: 0,
  };
}

export function countPostSendState(
  rows: Array<
    Pick<RestaurantLead, "deliveryStatus" | "replyStatus" | "followUpStatus"> & {
      sentAt?: Date | null;
    }
  >,
  sentCount: number,
  now = new Date(),
): RestaurantLeadPostSendCounters {
  const counters = emptyPostSendCounters();
  counters.sent = sentCount;
  for (const row of rows) {
    if (row.deliveryStatus === "DELIVERED") counters.delivered += 1;
    if (row.deliveryStatus === "PENDING") counters.pending += 1;
    if (row.deliveryStatus === "DELAYED") counters.delayed += 1;
    if (row.deliveryStatus === "BOUNCED") counters.bounced += 1;
    if (row.deliveryStatus === "COMPLAINED") counters.complained += 1;
    if (row.deliveryStatus === "FAILED") counters.failed += 1;
    if (row.replyStatus !== "NO_REPLY") counters.replied += 1;
    if (row.replyStatus === "POSITIVE") counters.positive += 1;
    if (row.replyStatus === "NEGATIVE") counters.negative += 1;
    if (row.replyStatus === "NO_REPLY") counters.noReply += 1;
    if (row.followUpStatus === "DUE") counters.followUpDue += 1;
    if (row.followUpStatus === "DRAFT_READY") counters.followUpDraftReady += 1;
    if (row.deliveryStatus === "PENDING" && isStalePendingDelivery(row.sentAt, now)) counters.pendingOver24h += 1;
  }
  return counters;
}

export async function appendRestaurantLeadTimeline(input: {
  restaurantLeadId: string;
  kind: RestaurantLeadTimelineKind;
  at: Date;
  source: string;
  label: string;
  metadata?: string;
  sendHistoryId?: string;
}) {
  const prisma = getPrisma();
  const existing = await prisma.restaurantLeadTimelineEvent.findFirst({
    where: {
      restaurantLeadId: input.restaurantLeadId,
      kind: input.kind,
      sendHistoryId: input.sendHistoryId ?? null,
      label: input.label,
    },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.restaurantLeadTimelineEvent.create({
    data: {
      restaurantLeadId: input.restaurantLeadId,
      kind: input.kind,
      at: input.at,
      source: input.source,
      label: input.label,
      metadata: input.metadata,
      sendHistoryId: input.sendHistoryId,
    },
  });
}

export async function initializePostSendTracking(batchId = FIRST_WAVE_BULK_SEND_ID) {
  const prisma = getPrisma();
  const sends = await prisma.restaurantLeadSendHistory.findMany({
    where: { batchId, status: "SENT" },
    include: { restaurantLead: true },
    orderBy: { sentAt: "asc" },
  });

  for (const send of sends) {
    const sentAt = send.sentAt ?? send.createdAt;
    const dueAt = firstFollowUpDueAt(sentAt);
    await prisma.restaurantLead.update({
      where: { id: send.restaurantLeadId },
      data: {
        deliveryStatus: send.deliveryStatus,
        nextFollowUpAt: send.restaurantLead.nextFollowUpAt ?? dueAt,
      },
    });
    await appendRestaurantLeadTimeline({
      restaurantLeadId: send.restaurantLeadId,
      kind: "INITIAL_PREPARED",
      at: send.createdAt,
      source: "SEND_HISTORY",
      label: "İlk e-posta hazırlandı",
      sendHistoryId: send.id,
    });
    await appendRestaurantLeadTimeline({
      restaurantLeadId: send.restaurantLeadId,
      kind: "INITIAL_SENT",
      at: sentAt,
      source: "SEND_HISTORY",
      label: "İlk e-posta gönderildi",
      sendHistoryId: send.id,
    });
  }

  return { initialized: sends.length };
}

export async function refreshRestaurantLeadFollowUpDue(now = new Date()) {
  const prisma = getPrisma();
  const leads = await prisma.restaurantLead.findMany({
    where: {
      followUpStatus: { in: ["NOT_DUE", "DUE"] },
      replyStatus: "NO_REPLY",
      salesStatus: { notIn: ["LOST", "DO_NOT_CONTACT"] },
    },
    include: {
      sendHistory: { where: { status: "SENT" }, orderBy: { sentAt: "asc" }, take: 1 },
    },
  });

  let markedDue = 0;
  for (const lead of leads) {
    const initial = lead.sendHistory[0];
    if (!initial?.sentAt) continue;
    if (lead.deliveryStatus === "BOUNCED" || lead.deliveryStatus === "COMPLAINED" || lead.deliveryStatus === "DELAYED") {
      continue;
    }
    if (lead.operatingStatus !== "ACTIVE") continue;
    if (lead.possibleDuplicate) continue;
    if (lead.followUpCount !== 0) continue;
    if (!isFollowUpTimeReached(initial.sentAt, now)) {
      if (!lead.nextFollowUpAt) {
        await prisma.restaurantLead.update({
          where: { id: lead.id },
          data: { nextFollowUpAt: firstFollowUpDueAt(initial.sentAt) },
        });
      }
      continue;
    }
    if (lead.followUpStatus === "DUE") continue;
    await prisma.restaurantLead.update({
      where: { id: lead.id },
      data: {
        followUpStatus: "DUE",
        nextFollowUpAt: firstFollowUpDueAt(initial.sentAt),
      },
    });
    await appendRestaurantLeadTimeline({
      restaurantLeadId: lead.id,
      kind: "FOLLOW_UP_DUE",
      at: now,
      source: "SYSTEM",
      label: "Follow-up zamanı geldi",
      sendHistoryId: initial.id,
    });
    markedDue += 1;
  }
  return { markedDue };
}

export async function getFirstWaveReport(batchId = FIRST_WAVE_BULK_SEND_ID) {
  const prisma = getPrisma();
  const sends = await prisma.restaurantLeadSendHistory.findMany({
    where: { batchId, status: "SENT" },
    include: { restaurantLead: true },
  });
  return {
    batchId,
    counters: countPostSendState(
      sends.map((row) => ({ ...row.restaurantLead, sentAt: row.sentAt })),
      sends.length,
    ),
    inboxIntegration: "NONE" as const,
    inboxNote: "Resend V1 outbound only. Replies are marked manually until an inbox provider is connected.",
  };
}

export async function getRestaurantLeadOutreachWorkspace(input: {
  batchId?: string;
  filter?: string | null;
}) {
  const prisma = getPrisma();
  const batchId = input.batchId || FIRST_WAVE_BULK_SEND_ID;
  await initializePostSendTracking(batchId);
  await refreshRestaurantLeadFollowUpDue();

  const sends = await prisma.restaurantLeadSendHistory.findMany({
    where: { batchId, status: "SENT" },
    include: {
      restaurantLead: {
        include: { followUpDrafts: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
    orderBy: { sentAt: "asc" },
  });

  const filter = parseRestaurantLeadOutreachFilter(input.filter);
  const rows = sends.filter((send) => {
    const lead = send.restaurantLead;
    switch (filter) {
      case "SENT":
        return send.status === "SENT";
      case "DELIVERED":
        return lead.deliveryStatus === "DELIVERED";
      case "PENDING":
        return lead.deliveryStatus === "PENDING";
      case "DELAYED":
        return lead.deliveryStatus === "DELAYED";
      case "BOUNCED":
        return lead.deliveryStatus === "BOUNCED";
      case "COMPLAINED":
        return lead.deliveryStatus === "COMPLAINED";
      case "REPLIED":
        return lead.replyStatus !== "NO_REPLY";
      case "POSITIVE":
        return lead.replyStatus === "POSITIVE";
      case "NEGATIVE":
        return lead.replyStatus === "NEGATIVE";
      case "NO_REPLY":
        return lead.replyStatus === "NO_REPLY";
      case "FOLLOW_UP_DUE":
        return lead.followUpStatus === "DUE";
      case "FOLLOW_UP_DRAFT_READY":
        return lead.followUpStatus === "DRAFT_READY";
      default:
        return true;
    }
  });

  return {
    batchId,
    filter,
    inboxIntegration: "NONE" as const,
    counters: countPostSendState(
      sends.map((row) => ({ ...row.restaurantLead, sentAt: row.sentAt })),
      sends.length,
    ),
    rows,
  };
}

export async function getRestaurantLeadTimeline(restaurantLeadId: string) {
  const prisma = getPrisma();
  return prisma.restaurantLeadTimelineEvent.findMany({
    where: { restaurantLeadId },
    orderBy: { at: "asc" },
  });
}

export type { RestaurantLeadSendHistory };
