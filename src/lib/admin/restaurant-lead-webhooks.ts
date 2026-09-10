import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma, type RestaurantLeadDeliveryStatus } from "@prisma/client";
import { getPrisma } from "@/lib/admin/prisma";
import { canReplaceDeliveryStatus } from "@/lib/admin/restaurant-lead-reconciliation";
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
  if (status === "DELAYED") return { kind: "DELAYED" as const, label: "Teslimat gecikti" };
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

  if (!canReplaceDeliveryStatus(send.deliveryStatus, deliveryStatus)) {
    return { ok: true as const, duplicate: false, ignored: true, eventType, providerMessageId, reason: "weaker_than_current" };
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
  status?: string;
  created_at?: string;
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

function normalizeWebhookSecret(secret?: string | null) {
  const value = secret?.trim() || "";
  return value.startsWith("whsec_") ? value.slice(6) : value;
}

function webhookSecretsMatch(left?: string | null, right?: string | null) {
  const a = Buffer.from(normalizeWebhookSecret(left));
  const b = Buffer.from(normalizeWebhookSecret(right));
  if (!a.length || !b.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function secretMatchLabel(input: {
  env?: string | null;
  db?: string | null;
  resend?: string | null;
}) {
  if (input.env && input.resend) return webhookSecretsMatch(input.env, input.resend) ? "YES" : "NO";
  if (input.db && input.resend) return webhookSecretsMatch(input.db, input.resend) ? "YES" : "NO";
  return "UNABLE_TO_VERIFY";
}

export async function diagnoseProductionResendWebhook(input: { token: string; repair?: boolean }) {
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

  const listed = await resendJson<{ data?: Array<ResendWebhookRecord & { status?: string; created_at?: string }> }>(
    "/webhooks",
  );
  const webhooks = (listed.data ?? []).map((row) => ({
    id: row.id ?? null,
    endpoint: row.endpoint ?? null,
    status: row.status ?? null,
    events: row.events ?? [],
    created_at: row.created_at ?? null,
    urlExact: row.endpoint === PRODUCTION_WEBHOOK_ENDPOINT,
  }));
  const active =
    webhooks.find((row) => row.id && row.id === stored.resendWebhookId) ||
    webhooks.find((row) => row.urlExact) ||
    webhooks[0] ||
    null;

  let retrieved: (ResendWebhookRecord & { status?: string; created_at?: string }) | null = null;
  if (active?.id) {
    retrieved = await resendJson<ResendWebhookRecord & { status?: string; created_at?: string }>(`/webhooks/${active.id}`);
  }

  const events: Array<{ id?: string; type?: string; created_at?: string; status?: string }> = [];
  if (active?.id) {
    let after: string | undefined;
    for (let page = 0; page < 10; page += 1) {
      const path = after
        ? `/webhooks/${active.id}/events?limit=100&after=${encodeURIComponent(after)}`
        : `/webhooks/${active.id}/events?limit=100`;
      const pageData = await resendJson<{ data?: typeof events; has_more?: boolean }>(path);
      const rows = pageData.data ?? [];
      events.push(...rows);
      if (!pageData.has_more || !rows.length) break;
      after = rows[rows.length - 1]?.id;
      if (!after) break;
    }
  }

  const sends = await prisma.restaurantLeadSendHistory.findMany({
    where: { batchId: "cmtvoi4d60000ju04ip91olvv", status: "SENT" },
    select: { providerMessageId: true, deliveryStatus: true },
  });
  const lastEventCounts: Record<string, number> = {};
  let emailLookupErrors = 0;
  for (const send of sends) {
    if (!send.providerMessageId) continue;
    try {
      const email = await resendJson<{ last_event?: string }>(`/emails/${send.providerMessageId}`);
      const key = email.last_event || "unknown";
      lastEventCounts[key] = (lastEventCounts[key] ?? 0) + 1;
    } catch {
      emailLookupErrors += 1;
    }
  }

  const envSecret = getResendWebhookSecret();
  const dbSecret = stored.signingSecret;
  const resendSecret = retrieved?.signing_secret ?? null;
  const eventsOnWebhook = retrieved?.events ?? active?.events ?? [];
  const webhookUrl = retrieved?.endpoint ?? active?.endpoint ?? null;
  const webhookStatus = retrieved?.status ?? active?.status ?? null;

  let repaired = false;
  const repairs: string[] = [];
  if (input.repair && active?.id) {
    const needsEnable = webhookStatus && webhookStatus !== "enabled";
    const needsUrl = webhookUrl !== PRODUCTION_WEBHOOK_ENDPOINT;
    const needsEvents = RESEND_DELIVERY_EVENTS.some((event) => !eventsOnWebhook.includes(event));
    if (needsEnable || needsUrl || needsEvents) {
      await resendJson(`/webhooks/${active.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          endpoint: PRODUCTION_WEBHOOK_ENDPOINT,
          events: [...RESEND_DELIVERY_EVENTS],
          status: "enabled",
        }),
      });
      repaired = true;
      if (needsEnable) repairs.push("enabled webhook");
      if (needsUrl) repairs.push("corrected endpoint URL");
      if (needsEvents) repairs.push("subscribed delivery events");
    }
    if (resendSecret && !webhookSecretsMatch(dbSecret, resendSecret)) {
      await prisma.restaurantLeadWebhookConfig.update({
        where: { id: "resend-production" },
        data: { signingSecret: resendSecret, endpoint: PRODUCTION_WEBHOOK_ENDPOINT, resendWebhookId: active.id },
      });
      repaired = true;
      repairs.push("refreshed stored signing secret from active webhook");
    }
  }

  const attemptStatus = events.reduce(
    (acc, row) => {
      const key = row.status || "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    ok: true as const,
    WEBHOOK_EXISTS: Boolean(active?.id),
    WEBHOOK_ENABLED: (retrieved?.status ?? active?.status) === "enabled",
    WEBHOOK_URL: webhookUrl,
    WEBHOOK_ID_MATCHES_STORED: Boolean(active?.id && active.id === stored.resendWebhookId),
    WEBHOOK_COUNT: webhooks.length,
    DELIVERED_SUBSCRIBED: eventsOnWebhook.includes("email.delivered"),
    BOUNCED_SUBSCRIBED: eventsOnWebhook.includes("email.bounced"),
    COMPLAINED_SUBSCRIBED: eventsOnWebhook.includes("email.complained"),
    EVENTS_GENERATED_BY_RESEND: events.length,
    EVENT_STATUS_COUNTS: attemptStatus,
    EVENT_TYPES: events.reduce(
      (acc, row) => {
        const key = row.type || "unknown";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    FIRST_WAVE_EMAIL_LOOKUPS: sends.length,
    FIRST_WAVE_LAST_EVENT_COUNTS: lastEventCounts,
    FIRST_WAVE_EMAIL_LOOKUP_ERRORS: emailLookupErrors,
    WEBHOOK_SECRET_ENV_PRESENT: Boolean(envSecret),
    WEBHOOK_SECRET_DB_PRESENT: Boolean(dbSecret),
    WEBHOOK_SECRET_RESEND_PRESENT: Boolean(resendSecret),
    WEBHOOK_SECRET_ENV_MATCHES_DB: webhookSecretsMatch(envSecret, dbSecret),
    WEBHOOK_SECRET_ENV_MATCHES_RESEND: webhookSecretsMatch(envSecret, resendSecret),
    WEBHOOK_SECRET_DB_MATCHES_RESEND: webhookSecretsMatch(dbSecret, resendSecret),
    WEBHOOK_SECRET_MATCH: secretMatchLabel({ env: envSecret, db: dbSecret, resend: resendSecret }),
    REPAIRED: repaired,
    REPAIRS: repairs,
    webhooks,
  };
}
