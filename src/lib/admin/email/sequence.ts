import type { EmailMessageStatus, OutreachStatus } from "@prisma/client";
import { evaluateEmailOutreachEligibility } from "@/lib/admin/email-outreach";

export const FOLLOW_UP_1_BUSINESS_DAYS = 3;
export const FOLLOW_UP_2_CALENDAR_DAYS = 5;
export const FOLLOW_UP_RATE_LIMIT_MS = 8_000;
export const FOLLOW_UP_STOPPED_TAG = "follow-up-stopped";

export type SequenceStepNumber = 0 | 1 | 2;
export type FollowUpStepNumber = 1 | 2;
export type SequenceStepStatus = "PENDING" | "READY" | "SENT" | "SKIPPED" | "STOPPED";

export type SequenceMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  status: EmailMessageStatus;
  sequenceStep?: number | null;
  bodyHtml?: string | null;
  bodyText?: string | null;
  sentAt?: Date | null;
  createdAt: Date;
  failureReason?: string | null;
};

export type SequenceCompanyInput = {
  outreachStatus: OutreachStatus;
  status?: string | null;
  archivedAt?: Date | null;
  followUpStopped?: boolean;
  followUpStoppedAt?: Date | null;
  suppressed?: boolean;
  unsubscribed?: boolean;
  tags?: string[] | null;
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null; isPrimary?: boolean }>;
};

export type SequenceStepView = {
  step: SequenceStepNumber;
  label: string;
  status: SequenceStepStatus;
  sentAt?: Date | null;
  readyAt?: Date | null;
  reason?: string;
};

export type CompanySequenceView = {
  initial: SequenceStepView;
  followUp1: SequenceStepView;
  followUp2: SequenceStepView;
  nextFollowUp: { step: FollowUpStepNumber; readyAt: Date } | null;
  complete: boolean;
  replyDetection: "manual";
  replyDetectionNote: string;
};

const SENT_STATUSES: readonly EmailMessageStatus[] = ["SENT", "DELIVERED"];

export function parseSequenceStep(raw: string | null | undefined): SequenceStepNumber {
  switch (raw) {
    case "1":
      return 1;
    case "2":
      return 2;
    case "0":
    case "initial":
    case "":
    case undefined:
    case null:
      return 0;
    default:
      return 0;
  }
}

export function isFollowUpStep(step: SequenceStepNumber): step is FollowUpStepNumber {
  return step === 1 || step === 2;
}

export function addBusinessDays(from: Date, days: number) {
  const date = new Date(from.getTime());
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return date;
}

export function addCalendarDays(from: Date, days: number) {
  const date = new Date(from.getTime());
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

export function followUpReadyAt(step: FollowUpStepNumber, after: Date) {
  return step === 1
    ? addBusinessDays(after, FOLLOW_UP_1_BUSINESS_DAYS)
    : addCalendarDays(after, FOLLOW_UP_2_CALENDAR_DAYS);
}

export function followUpSubject(originalSubject: string) {
  const trimmed = originalSubject.trim();
  if (!trimmed) return "Re: SALKAY";
  if (/^re\s*:/i.test(trimmed)) return trimmed;
  return `Re: ${trimmed}`;
}

export function threadingHeaders(parentProviderMessageId?: string | null) {
  const id = parentProviderMessageId?.trim();
  if (!id) return undefined;
  const messageId = id.includes("@") ? `<${id.replace(/^<|>$/g, "")}>` : `<${id}@salkay.resend>`;
  return {
    "In-Reply-To": messageId,
    References: messageId,
  };
}

export function inferredSequenceStep(message: {
  sequenceStep?: number | null;
  bodyHtml?: string | null;
  bodyText?: string | null;
}): SequenceStepNumber {
  if (message.sequenceStep === 1 || message.sequenceStep === 2) return message.sequenceStep;
  const hay = `${message.bodyHtml ?? ""}\n${message.bodyText ?? ""}`;
  if (/salkay-email:[a-z0-9-]+-follow-2/i.test(hay)) return 2;
  if (/salkay-email:[a-z0-9-]+-follow-1/i.test(hay)) return 1;
  return 0;
}

export function resolvedSequenceStep(message: SequenceMessage): SequenceStepNumber {
  return inferredSequenceStep(message);
}

function isOutbound(message: SequenceMessage) {
  return message.direction === "OUTBOUND";
}

function isSentLike(status: EmailMessageStatus) {
  return SENT_STATUSES.includes(status);
}

function latestOutbound(messages: SequenceMessage[], step: SequenceStepNumber) {
  return messages
    .filter((message) => isOutbound(message) && resolvedSequenceStep(message) === step)
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];
}

function latestSentOutbound(messages: SequenceMessage[], step: SequenceStepNumber) {
  return messages
    .filter(
      (message) =>
        isOutbound(message) &&
        resolvedSequenceStep(message) === step &&
        isSentLike(message.status) &&
        message.sentAt,
    )
    .sort((left, right) => (right.sentAt?.getTime() ?? 0) - (left.sentAt?.getTime() ?? 0))[0];
}

function stopReason(company: SequenceCompanyInput, messages: SequenceMessage[]) {
  if (company.archivedAt) return "Arşivlenmiş";
  if (company.followUpStopped || company.followUpStoppedAt) return "Manuel durduruldu";
  const emailEligibility = evaluateEmailOutreachEligibility({
    archivedAt: company.archivedAt,
    outreachStatus: company.outreachStatus,
    status: company.status,
    tags: company.tags,
    generalEmail: company.generalEmail,
    contacts: company.contacts,
    suppressed: company.suppressed,
  });
  if (!emailEligibility.ok) {
    return emailEligibility.reason;
  }
  if (company.outreachStatus === "DO_NOT_CONTACT" || company.status === "DO_NOT_CONTACT") {
    return "İletişim dışı";
  }
  if (company.outreachStatus === "REPLIED" || company.status === "REPLIED") {
    return "Yanıtlandı";
  }
  if (company.unsubscribed) return "Abonelikten çıktı";
  if (company.suppressed) return "Sperrliste";
  if (messages.some((message) => message.status === "REPLIED")) return "Yanıtlandı";
  if (messages.some((message) => isOutbound(message) && message.status === "BOUNCED")) {
    return "Geri döndü";
  }
  const failed = messages.find((message) => isOutbound(message) && message.status === "FAILED");
  if (failed && isPermanentFailure(failed.failureReason)) {
    return "Kalıcı gönderim hatası";
  }
  return null;
}

export function isPermanentFailure(reason?: string | null) {
  if (!reason) return false;
  return /bounce|invalid|reject|blocked|unsubscribed|do.not.contact|kalıcı|geçersiz/i.test(reason);
}

export function evaluateFollowUpEligibility(input: {
  company: SequenceCompanyInput;
  messages: SequenceMessage[];
  step: FollowUpStepNumber;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const stopped = stopReason(input.company, input.messages);
  if (stopped) {
    return { ok: false as const, reason: stopped, status: "STOPPED" as const };
  }

  const initial = latestSentOutbound(input.messages, 0);
  const initialAny = latestOutbound(input.messages, 0);
  if (!initial) {
    if (initialAny?.status === "DRAFT" || initialAny?.status === "QUEUED") {
      return { ok: false as const, reason: "İlk e-posta henüz gönderilmedi", status: "PENDING" as const };
    }
    return { ok: false as const, reason: "İlk gönderim yok", status: "SKIPPED" as const };
  }

  if (input.step === 1) {
    const existing = latestSentOutbound(input.messages, 1);
    if (existing) {
      return { ok: false as const, reason: "Follow-up 1 zaten gönderildi", status: "SENT" as const };
    }
    const readyAt = followUpReadyAt(1, initial.sentAt ?? initial.createdAt);
    if (now.getTime() < readyAt.getTime()) {
      return { ok: false as const, reason: "Follow-up 1 henüz zamanı gelmedi", status: "PENDING" as const, readyAt };
    }
    return { ok: true as const, status: "READY" as const, readyAt };
  }

  const followUp1 = latestSentOutbound(input.messages, 1);
  if (!followUp1) {
    const pendingFirst = evaluateFollowUpEligibility({ ...input, step: 1, now });
    if (pendingFirst.status === "PENDING" || pendingFirst.status === "READY") {
      return { ok: false as const, reason: "Follow-up 1 henüz tamamlanmadı", status: "PENDING" as const };
    }
    return { ok: false as const, reason: "Follow-up 1 gönderilmedi", status: "SKIPPED" as const };
  }

  const existingSecond = latestSentOutbound(input.messages, 2);
  if (existingSecond) {
    return { ok: false as const, reason: "Follow-up 2 zaten gönderildi", status: "SENT" as const };
  }
  const readyAt = followUpReadyAt(2, followUp1.sentAt ?? followUp1.createdAt);
  if (now.getTime() < readyAt.getTime()) {
    return { ok: false as const, reason: "Follow-up 2 henüz zamanı gelmedi", status: "PENDING" as const, readyAt };
  }
  return { ok: true as const, status: "READY" as const, readyAt };
}

export function resolveCompanySequence(input: {
  company: SequenceCompanyInput;
  messages: SequenceMessage[];
  now?: Date;
}): CompanySequenceView {
  const now = input.now ?? new Date();
  const stopped = stopReason(input.company, input.messages);
  const initialSent = latestSentOutbound(input.messages, 0);
  const initialAny = latestOutbound(input.messages, 0);
  const follow1Sent = latestSentOutbound(input.messages, 1);
  const follow2Sent = latestSentOutbound(input.messages, 2);
  const first = evaluateFollowUpEligibility({ ...input, step: 1, now });
  const second = evaluateFollowUpEligibility({ ...input, step: 2, now });

  const initialStatus: SequenceStepStatus = initialSent
    ? "SENT"
    : stopped
      ? "STOPPED"
      : initialAny
        ? "PENDING"
        : "SKIPPED";

  const followUp1: SequenceStepView = {
    step: 1,
    label: "Follow-up 1",
    status: follow1Sent ? "SENT" : stopped ? "STOPPED" : first.status,
    sentAt: follow1Sent?.sentAt,
    readyAt: first.readyAt,
    reason: follow1Sent ? undefined : first.ok ? undefined : first.reason,
  };
  const followUp2: SequenceStepView = {
    step: 2,
    label: "Follow-up 2",
    status: follow2Sent ? "SENT" : stopped ? "STOPPED" : second.status,
    sentAt: follow2Sent?.sentAt,
    readyAt: second.readyAt,
    reason: follow2Sent ? undefined : second.ok ? undefined : second.reason,
  };

  let nextFollowUp: CompanySequenceView["nextFollowUp"] = null;
  if (!stopped && first.ok && first.readyAt) {
    nextFollowUp = { step: 1, readyAt: first.readyAt };
  } else if (!stopped && second.ok && second.readyAt) {
    nextFollowUp = { step: 2, readyAt: second.readyAt };
  } else if (!stopped && first.status === "PENDING" && first.readyAt) {
    nextFollowUp = { step: 1, readyAt: first.readyAt };
  } else if (!stopped && second.status === "PENDING" && second.readyAt) {
    nextFollowUp = { step: 2, readyAt: second.readyAt };
  }

  return {
    initial: {
      step: 0,
      label: "İlk e-posta",
      status: initialStatus,
      sentAt: initialSent?.sentAt,
      reason: initialSent ? undefined : stopped ?? (initialAny ? "İlk e-posta henüz gönderilmedi" : "İlk gönderim yok"),
    },
    followUp1,
    followUp2,
    nextFollowUp,
    complete: Boolean(follow2Sent),
    replyDetection: "manual",
    replyDetectionNote: "Yanıt tespiti manueldir. Resend inbox sync yok. REPLIED durumu follow-up’ı durdurur.",
  };
}

export function nextFollowUpAtAfterSend(step: SequenceStepNumber, sentAt = new Date()) {
  if (step === 0) return followUpReadyAt(1, sentAt);
  if (step === 1) return followUpReadyAt(2, sentAt);
  return null;
}

export function sequenceFlagsFromCompany(company: {
  outreachStatus: OutreachStatus;
  status?: string | null;
  archivedAt?: Date | null;
  tags?: string[] | null;
  followUpStoppedAt?: Date | null;
  generalEmail?: string | null;
  contacts?: Array<{ email?: string | null; isPrimary?: boolean }>;
  suppressions?: Array<{ reason: string }>;
}): SequenceCompanyInput {
  const suppressions = company.suppressions ?? [];
  const tags = company.tags ?? [];
  return {
    outreachStatus: company.outreachStatus,
    status: company.status,
    archivedAt: company.archivedAt,
    tags,
    generalEmail: company.generalEmail,
    contacts: company.contacts,
    followUpStopped: tags.includes(FOLLOW_UP_STOPPED_TAG),
    followUpStoppedAt: company.followUpStoppedAt ?? null,
    suppressed: suppressions.length > 0,
    unsubscribed: suppressions.some((row) => row.reason === "UNSUBSCRIBE"),
  };
}

export function sequenceStepLabel(step?: number | null) {
  switch (step) {
    case 1:
      return "Follow-up 1";
    case 2:
      return "Follow-up 2";
    case 0:
    case null:
    case undefined:
      return "İlk e-posta";
    default:
      return `Adım ${step}`;
  }
}
