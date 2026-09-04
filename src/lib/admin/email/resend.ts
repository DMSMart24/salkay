import { applyFromDisplayName } from "@/lib/admin/email/from";
import type { EmailProvider, EmailSendInput, InboxSyncResult } from "@/lib/admin/email/types";

type ResendResponse = {
  id?: string;
  message?: string;
  error?: { message?: string };
};

export class ResendEmailProvider implements EmailProvider {
  readonly id = "resend";
  readonly configured = true;
  readonly supportsInboxSync = false;

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async sendEmail(input: EmailSendInput) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resolveResendFrom(input.from || this.from, input.fromName),
        to: [input.to],
        cc: input.cc
          ? input.cc
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean)
          : undefined,
        subject: input.subject,
        text: input.bodyText,
        html: input.bodyHtml,
        headers: input.headers && Object.keys(input.headers).length > 0 ? input.headers : undefined,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as ResendResponse;
    if (!response.ok || !payload.id) {
      return {
        ok: false as const,
        configured: true,
        error: payload.error?.message || payload.message || "Resend gönderimi başarısız.",
      };
    }

    return {
      ok: true as const,
      providerMessageId: payload.id,
      threadId: payload.id,
    };
  }

  async syncInbox(): Promise<InboxSyncResult> {
    return {
      ok: false,
      configured: true,
      error: "Resend V1 yalnızca giden e-posta gönderir. Gelen kutusu senkronizasyonu yok.",
    };
  }

  async getThread() {
    return null;
  }

  async getMessage() {
    return null;
  }
}

function resolveResendFrom(from: string, fromName?: string) {
  if (!fromName?.trim()) return from;
  return applyFromDisplayName(from, fromName.trim());
}
