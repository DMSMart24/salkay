import { UnsubscribeForm } from "@/components/admin/UnsubscribeForm";

export const dynamic = "force-dynamic";

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
