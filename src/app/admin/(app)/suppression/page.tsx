import { SuppressionForm } from "@/components/admin/SimpleForms";
import { formatDateTime } from "@/lib/admin/format";
import { suppressionLabels } from "@/lib/admin/labels";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

export default async function SuppressionPage() {
  const rows = await getPrisma().suppression.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { companyName: true } } },
    take: 200,
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Sperrliste</p>
          <h1>İletişim yasağı</h1>
          <p className="admin-help">
            Buradaki e-posta ve domainler her gönderimde sunucu tarafında engellenir.
          </p>
        </div>
      </header>
      <section className="admin-panel">
        <SuppressionForm />
      </section>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>E-posta / domain</th>
              <th>Neden</th>
              <th>Kaynak</th>
              <th>Tarih</th>
              <th>Firma</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.email}
                  {row.domain ? ` · ${row.domain}` : ""}
                </td>
                <td>{suppressionLabels[row.reason]}</td>
                <td>{row.source || "—"}</td>
                <td>{formatDateTime(row.createdAt)}</td>
                <td>{row.company?.companyName || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
