import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/admin/UnsubscribeForm";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Abonelikten çık",
  description: "SALKAY e-posta listesinden çıkış.",
  path: "/unsubscribe",
  index: false,
});

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="admin-kicker">SALKAY</p>
        <h1>Abonelikten çık</h1>
        <p className="admin-help">
          Bu adres outreach listesine tekrar eklenmez. Onayınız olmadan işlem yapılmaz.
        </p>
        <UnsubscribeForm email={email ?? ""} />
      </div>
    </div>
  );
}
