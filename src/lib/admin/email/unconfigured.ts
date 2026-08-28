import type { EmailProvider, EmailSendInput, InboxSyncResult } from "@/lib/admin/email/types";

export class UnconfiguredEmailProvider implements EmailProvider {
  readonly id = "unconfigured";
  readonly configured = false;
  readonly supportsInboxSync = false;

  async sendEmail(input: EmailSendInput) {
    void input;
    return {
      ok: false as const,
      configured: false,
      error:
        "E-posta sağlayıcısı yapılandırılmadı. RESEND_API_KEY ve EMAIL_FROM ekleyin.",
    };
  }

  async syncInbox(): Promise<InboxSyncResult> {
    return {
      ok: false,
      configured: false,
      error: "Gelen kutusu senkronizasyonu için bir sağlayıcı henüz bağlı değil.",
    };
  }

  async getThread() {
    return null;
  }

  async getMessage() {
    return null;
  }
}
