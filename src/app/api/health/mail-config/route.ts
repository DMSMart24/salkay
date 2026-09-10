import { describeEmailProvider } from "@/lib/admin/email/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const provider = describeEmailProvider();
  return Response.json({
    PRODUCTION_RESEND_API_KEY_AVAILABLE: provider.id === "resend" && provider.configured,
    PRODUCTION_EMAIL_FROM_AVAILABLE: provider.fromConfigured,
    PROVIDER_CONFIGURED: provider.configured,
    RESTAURANTLEAD_BULK_LIVE: true,
    TEST_MODE_DEFAULT: true,
  });
}
