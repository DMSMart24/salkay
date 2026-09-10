import { reconcileFirstWaveFromResendRetrieve } from "@/lib/admin/restaurant-lead-reconciliation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { confirm?: string; token?: string };
  if (body.confirm !== "RECONCILE_FIRST_WAVE" || !body.token) {
    return Response.json({ error: "rejected" }, { status: 400 });
  }

  try {
    const result = await reconcileFirstWaveFromResendRetrieve({ token: body.token });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.error === "unauthorized" ? 401 : 500 });
    }
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "reconcile_failed" },
      { status: 500 },
    );
  }
}
