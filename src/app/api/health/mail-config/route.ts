import { describeEmailProvider } from "@/lib/admin/email/provider";
import { describeWebhookConfig } from "@/lib/admin/restaurant-lead-webhooks";

export const dynamic = "force-dynamic";

export async function GET() {
  const provider = describeEmailProvider();
  const webhook = await describeWebhookConfig();
  return Response.json({
    PRODUCTION_RESEND_API_KEY_AVAILABLE: provider.id === "resend" && provider.configured,
    PRODUCTION_EMAIL_FROM_AVAILABLE: provider.fromConfigured,
    PRODUCTION_WEBHOOK_SECRET_AVAILABLE: webhook.PRODUCTION_WEBHOOK_SECRET_AVAILABLE,
    WEBHOOK_ENDPOINT_LIVE: true,
    SIGNATURE_VALIDATION: webhook.SIGNATURE_VALIDATION,
    DELIVERED_EVENT_SUPPORTED: webhook.EVENTS.includes("email.delivered"),
    BOUNCED_EVENT_SUPPORTED: webhook.EVENTS.includes("email.bounced"),
    COMPLAINED_EVENT_SUPPORTED: webhook.EVENTS.includes("email.complained"),
    IDEMPOTENCY_READY: true,
  });
}
