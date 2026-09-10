import { diagnoseProductionResendWebhook } from "@/lib/admin/restaurant-lead-webhooks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    confirm?: string;
    token?: string;
    repair?: boolean;
  };
  if (body.confirm !== "DIAGNOSE_RESEND_WEBHOOK" || !body.token) {
    return Response.json({ error: "rejected" }, { status: 400 });
  }

  try {
    const result = await diagnoseProductionResendWebhook({
      token: body.token,
      repair: body.repair === true,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.error === "unauthorized" ? 401 : 500 });
    }
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "diagnose_failed" },
      { status: 500 },
    );
  }
}
