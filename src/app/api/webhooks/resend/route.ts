import {
  processResendWebhookEvent,
  resolveResendWebhookSecret,
  verifyResendWebhookSignature,
} from "@/lib/admin/restaurant-lead-webhooks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.text();
  const verified = verifyResendWebhookSignature({
    payload,
    svixId: request.headers.get("svix-id"),
    svixTimestamp: request.headers.get("svix-timestamp"),
    svixSignature: request.headers.get("svix-signature"),
    secret: await resolveResendWebhookSecret(),
  });
  if (!verified.ok) {
    return Response.json({ error: verified.error }, { status: verified.error.includes("not configured") ? 503 : 401 });
  }

  const result = await processResendWebhookEvent({
    payload,
    svixId: request.headers.get("svix-id"),
  });
  return Response.json(result);
}
