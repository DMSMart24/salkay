import { SuppressionForm } from "@/components/admin/SimpleForms";
import { describeEmailProvider } from "@/lib/admin/email/provider";
import { formatDateTime } from "@/lib/admin/format";
import { getAuthSecret } from "@/lib/admin/crypto";
import { suppressionLabels } from "@/lib/admin/labels";
import { isDatabaseConfigured, getPrisma } from "@/lib/admin/prisma";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireAdmin();
  const email = describeEmailProvider();
  const suppressions = isDatabaseConfigured()
    ? await getPrisma().suppression.findMany({ orderBy: { createdAt: "desc" }, take: 40 })
    : [];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Einstellungen</p>
          <h1>Ayarlar</h1>
        </div>
      </header>
      <section className="admin-panel">
        <h2>Oturum</h2>
        <p>
          {session.name} · {session.email} · {session.role}
        </p>
      </section>
      <section className="admin-panel">
        <h2>Altyapı</h2>
        <ul className="admin-list">
          <li>
            <strong>Database</strong>
            <span>{isDatabaseConfigured() ? "DATABASE_URL set" : "eksik"}</span>
          </li>
          <li>
            <strong>AUTH_SECRET</strong>
            <span>{getAuthSecret() ? "set" : "eksik"}</span>
          </li>
          <li>
            <strong>Email provider</strong>
            <span>
              {email.id} · {email.configured ? "configured" : "not configured"} · from{" "}
              {email.fromConfigured ? "set" : "missing"}
            </span>
          </li>
          <li>
            <strong>Inbox sync</strong>
            <span>{email.supportsInboxSync ? "bağlı" : "henüz bağlı değil"}</span>
          </li>
          <li>
            <strong>Toplu gönderim</strong>
            <span>{email.outreachSendEnabled ? "OUTREACH_SEND_ENABLED" : "test/taslak (kapalı)"}</span>
          </li>
        </ul>
        <p className="admin-help">
          Gizli değerler istemciye gönderilmez. İlk admin kullanıcısı ADMIN_EMAIL + ADMIN_PASSWORD
          ile boş veritabanında oluşturulur.
        </p>
      </section>
      <section className="admin-panel">
        <h2>Sperrliste</h2>
        <p className="admin-help">
          Tam liste ve domain engeli için <a href="/admin/suppression">Sperrliste</a> sayfasını kullanın.
        </p>
        <SuppressionForm />
        <ul className="admin-list">
          {suppressions.map((row) => (
            <li key={row.id}>
              <strong>{row.email}</strong>
              <span>
                {suppressionLabels[row.reason]} · {formatDateTime(row.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
