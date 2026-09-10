import { activateProductionResendWebhook } from "@/lib/admin/restaurant-lead-webhooks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { confirm?: string; token?: string };
  if (body.confirm !== "ACTIVATE_RESEND_WEBHOOK" || !body.token) {
    return Response.json({ error: "rejected" }, { status: 400 });
  }

  const result = await activateProductionResendWebhook({ token: body.token });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.error === "unauthorized" ? 401 : 500 });
  }

  return Response.json({
    ok: true,
    endpoint: result.endpoint,
    events: result.events,
    webhookIdStored: result.webhookIdStored,
    secretStored: result.secretStored,
  });
}
