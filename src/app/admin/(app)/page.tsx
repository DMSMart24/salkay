import Link from "next/link";
import { formatDate } from "@/lib/admin/format";
import { getOutreachDashboard } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getOutreachDashboard();

  const cards = [
    { label: "Toplam Firma", value: data.total },
    { label: "Henüz Gönderilmedi", value: data.notContacted },
    { label: "E-posta Gönderildi", value: data.sent },
    { label: "Yanıt Geldi", value: data.replied },
    { label: "Başarısız", value: data.failed },
    { label: "İletişim Kurma", value: data.doNotContact },
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Dashboard</p>
          <h1>E-posta outreach</h1>
        </div>
        <div className="admin-actions">
          <Link href="/admin/companies/import" className="admin-btn">
            Firma İçe Aktar
          </Link>
          <Link href="/admin/groups" className="admin-btn ghost">
            Yeni Grup
          </Link>
        </div>
      </header>

      <section className="admin-cards">
        {cards.map((card) => (
          <article key={card.label} className="admin-card">
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section>
        <header className="admin-page-head">
          <h2>Gruplar</h2>
          <Link href="/admin/groups" className="admin-btn ghost">
            Tüm gruplar
          </Link>
        </header>
        {data.groups.length === 0 ? (
          <p className="admin-help">
            Henüz grup yok. Firmaları sektör ve bölgeye göre toplamak için bir grup oluşturun.
          </p>
        ) : (
          <div className="admin-group-grid">
            {data.groups.map((group) => (
              <article key={group.id} className="admin-group-card">
                <p className="admin-kicker">{group.industry || "Grup"}</p>
                <h3>{group.name}</h3>
                <p>{group.total} Firma</p>
                <ul className="admin-list">
                  <li>
                    <span>{group.notContacted} Henüz gönderilmedi</span>
                  </li>
                  <li>
                    <span>{group.sent} Gönderildi</span>
                  </li>
                  <li>
                    <span>{group.replied} Yanıt</span>
                  </li>
                </ul>
                <p>Yanıt oranı: %{group.replyRate}</p>
                <p className="admin-help">Son gönderim: {formatDate(group.lastSend)}</p>
                <Link href={`/admin/groups/${group.id}`} className="admin-btn">
                  Grubu Aç
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-panel">
        <h2>Son yanıtlar</h2>
        {data.recentReplies.length === 0 ? (
          <p className="admin-help">Henüz inbound yanıt yok.</p>
        ) : (
          <ul className="admin-list">
            {data.recentReplies.map((message) => (
              <li key={message.id}>
                <Link href="/admin/inbox">{message.subject}</Link>
                <span>
                  {message.company?.companyName ?? "Atanmamış"}
                  {message.company?.group?.name ? ` · ${message.company.group.name}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
