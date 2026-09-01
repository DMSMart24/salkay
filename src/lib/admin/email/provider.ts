import { applyFromDisplayName, OUTREACH_FROM_DISPLAY_NAME } from "@/lib/admin/email/from";
import { ResendEmailProvider } from "@/lib/admin/email/resend";
import type { EmailProvider } from "@/lib/admin/email/types";
import { UnconfiguredEmailProvider } from "@/lib/admin/email/unconfigured";

export function getEmailFrom() {
  return process.env.EMAIL_FROM?.trim() || null;
}

export function getOutreachFrom() {
  const from = getEmailFrom();
  if (!from) return null;
  return applyFromDisplayName(from, OUTREACH_FROM_DISPLAY_NAME);
}

export function getEmailProvider(): EmailProvider {
  const requested = (process.env.EMAIL_PROVIDER || "auto").toLowerCase();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getEmailFrom();

  if ((requested === "resend" || requested === "auto") && apiKey && from) {
    return new ResendEmailProvider(apiKey, from);
  }

  return new UnconfiguredEmailProvider();
}

export function describeEmailProvider() {
  const provider = getEmailProvider();
  return {
    id: provider.id,
    configured: provider.configured,
    fromConfigured: Boolean(getEmailFrom()),
    providerName: process.env.EMAIL_PROVIDER || "auto",
    supportsInboxSync: provider.supportsInboxSync,
    outreachSendEnabled: process.env.OUTREACH_SEND_ENABLED === "true",
  };
}
