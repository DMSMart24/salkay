import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma, type RestaurantLeadDeliveryStatus } from "@prisma/client";
import { getPrisma } from "@/lib/admin/prisma";
import { appendRestaurantLeadTimeline, mapResendEventToDelivery, resendEventId } from "@/lib/admin/restaurant-lead-tracking";

type ResendWebhookPayload = {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    bounce?: { type?: string; message?: string };
    bounce_type?: string;
  };
};

export function resendBounceKind(payload: ResendWebhookPayload) {
  const raw = payload.data?.bounce?.type || payload.data?.bounce_type || "";
  if (/hard|permanent/i.test(raw)) return "HARD";
  if (/soft|transient|temporary/i.test(raw)) return "SOFT";
  return raw || null;
}

export const RESEND_DELIVERY_EVENTS = ["email.delivered", "email.bounced", "email.complained"] as const;
export const PRODUCTION_WEBHOOK_ENDPOINT = "https://www.salkay.com/api/webhooks/resend";

export function getResendWebhookSecret() {
  return process.env.RESEND_WEBHOOK_SECRET?.trim() || null;
}

export async function resolveResendWebhookSecret() {
  const fromEnv = getResendWebhookSecret();
  if (fromEnv) return fromEnv;
  const stored = await getPrisma().restaurantLeadWebhookConfig.findUnique({
    where: { id: "resend-production" },
    select: { signingSecret: true },
  });
  return stored?.signingSecret?.trim() || null;
}

export function verifyResendWebhookSignature(input: {
  payload: string;
  svixId?: string | null;
  svixTimestamp?: string | null;
  svixSignature?: string | null;
  secret?: string | null;
}) {
  const secret = input.secret ?? getResendWebhookSecret();
  if (!secret) return { ok: false as const, error: "RESEND_WEBHOOK_SECRET is not configured" };
  if (!input.svixId || !input.svixTimestamp || !input.svixSignature) {
    return { ok: false as const, error: "Missing Svix signature headers" };
  }

  const rawSecret = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const key = Buffer.from(rawSecret, "base64");
  const signed = `${input.svixId}.${input.svixTimestamp}.${input.payload}`;
  const digest = createHmac("sha256", key).update(signed).digest("base64");
  const candidates = input.svixSignature.split(" ").map((part) => part.replace(/^v1,/, "").trim());
  const expected = Buffer.from(digest);
  const match = candidates.some((candidate) => {
    const actual = Buffer.from(candidate);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
  return match ? { ok: true as const } : { ok: false as const, error: "Invalid webhook signature" };
}

export function parseResendWebhookPayload(payload: string): ResendWebhookPayload {
  return JSON.parse(payload) as ResendWebhookPayload;
}

function timelineForDelivery(status: RestaurantLeadDeliveryStatus) {
  if (status === "DELIVERED") return { kind: "DELIVERED" as const, label: "Teslim edildi" };
  if (status === "BOUNCED") return { kind: "BOUNCED" as const, label: "Bounce" };
  if (status === "COMPLAINED") return { kind: "COMPLAINED" as const, label: "Şikayet" };
  return null;
}

export async function processResendWebhookEvent(input: {
  payload: string;
  svixId?: string | null;
}) {
  const body = parseResendWebhookPayload(input.payload);
  const eventType = body.type ?? "unknown";
  const providerMessageId = body.data?.email_id ?? null;
  const providerEventId = resendEventId({
    svixId: input.svixId,
    type: eventType,
    emailId: providerMessageId,
    createdAt: body.created_at,
  });

  const prisma = getPrisma();
  try {
    await prisma.restaurantLeadWebhookEvent.create({
      data: {
        providerEventId,
        eventType,
        providerMessageId,
        payloadJson: input.payload,
      },
    });
  } catch (error) {
    const duplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    if (duplicate) {
      return { ok: true as const, duplicate: true, eventType, providerMessageId };
    }
    throw error;
  }

  const deliveryStatus = mapResendEventToDelivery(eventType);
  if (!deliveryStatus || !providerMessageId) {
    return { ok: true as const, duplicate: false, ignored: true, eventType, providerMessageId };
  }

  const send = await prisma.restaurantLeadSendHistory.findFirst({
    where: { providerMessageId },
    orderBy: { createdAt: "desc" },
  });
  if (!send) {
    return { ok: true as const, duplicate: false, unmatched: true, eventType, providerMessageId };
  }

  const at = body.created_at ? new Date(body.created_at) : new Date();
  const bounceKind = deliveryStatus === "BOUNCED" ? resendBounceKind(body) : null;
  await prisma.restaurantLeadSendHistory.update({
    where: { id: send.id },
    data: {
      deliveryStatus,
      deliveredAt: deliveryStatus === "DELIVERED" ? at : send.deliveredAt,
      bouncedAt: deliveryStatus === "BOUNCED" ? at : send.bouncedAt,
      complainedAt: deliveryStatus === "COMPLAINED" ? at : send.complainedAt,
      errorMessage:
        deliveryStatus === "BOUNCED"
          ? [bounceKind ? `bounce:${bounceKind}` : "bounce", body.data?.bounce?.message].filter(Boolean).join(" · ")
          : send.errorMessage,
    },
  });

  const stopFollowUp = deliveryStatus === "BOUNCED" || deliveryStatus === "COMPLAINED";
  await prisma.restaurantLead.update({
    where: { id: send.restaurantLeadId },
    data: {
      deliveryStatus,
      deliveredAt: deliveryStatus === "DELIVERED" ? at : undefined,
      bouncedAt: deliveryStatus === "BOUNCED" ? at : undefined,
      complainedAt: deliveryStatus === "COMPLAINED" ? at : undefined,
      followUpStatus: stopFollowUp ? "STOPPED" : undefined,
      nextFollowUpAt: stopFollowUp ? null : undefined,
      salesStatus: deliveryStatus === "COMPLAINED" ? "DO_NOT_CONTACT" : undefined,
    },
  });

  const timeline = timelineForDelivery(deliveryStatus);
  if (timeline) {
    await appendRestaurantLeadTimeline({
      restaurantLeadId: send.restaurantLeadId,
      kind: timeline.kind,
      at,
      source: "WEBHOOK",
      label: timeline.label,
      sendHistoryId: send.id,
      metadata: eventType,
    });
  }

  return { ok: true as const, duplicate: false, eventType, providerMessageId, deliveryStatus };
}

type ResendWebhookRecord = {
  id?: string;
  endpoint?: string;
  events?: string[];
  signing_secret?: string;
};

function resendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || null;
}

async function resendJson<T>(path: string, init?: RequestInit) {
  const apiKey = resendApiKey();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const response = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.message || `Resend ${path} failed`);
  }
  return payload;
}

export async function activateProductionResendWebhook(input: { token: string; endpoint?: string }) {
  const prisma = getPrisma();
  const endpoint = input.endpoint || PRODUCTION_WEBHOOK_ENDPOINT;
  const existing = await prisma.restaurantLeadWebhookConfig.findUnique({
    where: { id: "resend-production" },
  });
  if (!existing?.activationToken || existing.activationToken !== input.token) {
    return { ok: false as const, error: "unauthorized" };
  }

  const listed = await resendJson<{ data?: ResendWebhookRecord[] }>("/webhooks");
  const found = (listed.data ?? []).find((row) => row.endpoint === endpoint);
  let record = found;
  if (!record?.id) {
    record = await resendJson<ResendWebhookRecord>("/webhooks", {
      method: "POST",
      body: JSON.stringify({
        endpoint,
        events: [...RESEND_DELIVERY_EVENTS],
      }),
    });
  } else if (record.events && RESEND_DELIVERY_EVENTS.some((event) => !record?.events?.includes(event))) {
    record = await resendJson<ResendWebhookRecord>(`/webhooks/${record.id}`, {
      method: "PATCH",
      body: JSON.stringify({ events: [...RESEND_DELIVERY_EVENTS] }),
    });
  }

  const signingSecret = record.signing_secret?.trim();
  if (!signingSecret) {
    return { ok: false as const, error: "signing_secret_missing" };
  }

  await prisma.restaurantLeadWebhookConfig.update({
    where: { id: "resend-production" },
    data: {
      endpoint,
      resendWebhookId: record.id,
      signingSecret,
      eventsJson: JSON.stringify(RESEND_DELIVERY_EVENTS),
      activationToken: null,
    },
  });

  return {
    ok: true as const,
    endpoint,
    events: [...RESEND_DELIVERY_EVENTS],
    webhookIdStored: Boolean(record.id),
    secretStored: true,
  };
}

export async function describeWebhookConfig() {
  const prisma = getPrisma();
  const stored = await prisma.restaurantLeadWebhookConfig.findUnique({
    where: { id: "resend-production" },
    select: { signingSecret: true, resendWebhookId: true, endpoint: true, eventsJson: true },
  });
  return {
    PRODUCTION_WEBHOOK_SECRET_AVAILABLE: Boolean(getResendWebhookSecret() || stored?.signingSecret),
    WEBHOOK_ENDPOINT: stored?.endpoint || PRODUCTION_WEBHOOK_ENDPOINT,
    WEBHOOK_ID_STORED: Boolean(stored?.resendWebhookId),
    EVENTS: RESEND_DELIVERY_EVENTS,
    SIGNATURE_VALIDATION: Boolean(getResendWebhookSecret() || stored?.signingSecret),
  };
}
