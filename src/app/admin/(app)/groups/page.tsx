import Link from "next/link";
import { seedDefaultGroupsForm } from "@/app/admin/actions/groups";
import { GroupForm } from "@/components/admin/GroupForm";
import { formatDate } from "@/lib/admin/format";
import { listGroups } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await listGroups();

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Gruppen</p>
          <h1>Gruplar</h1>
        </div>
        {groups.length === 0 ? (
          <form action={seedDefaultGroupsForm}>
            <button className="admin-btn ghost">Varsayılan grupları ekle</button>
          </form>
        ) : null}
      </header>

      <section className="admin-panel">
        <h2>Yeni grup</h2>
        <GroupForm />
      </section>

      {groups.length === 0 ? (
        <p className="admin-help">Henüz grup yok.</p>
      ) : (
        <div className="admin-group-grid">
          {groups.map((group) => (
            <article key={group.id} className="admin-group-card">
              <p className="admin-kicker">{[group.industry, group.city].filter(Boolean).join(" · ") || "Grup"}</p>
              <h3>{group.name}</h3>
              <p>{group.total} Firma</p>
              <p>{group.notContacted} Henüz gönderilmedi</p>
              <p>{group.sent} Gönderildi · {group.replied} Yanıt</p>
              <p>Yanıt oranı: %{group.replyRate}</p>
              <p className="admin-help">Son gönderim: {formatDate(group.lastSend)}</p>
              <Link href={`/admin/groups/${group.id}`} className="admin-btn">
                Grubu Aç
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
