import { ImportWizard } from "@/components/admin/ImportWizard";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

export default async function ImportCompaniesPage() {
  const groups = await getPrisma().leadGroup.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Firmen</p>
          <h1>Firma içe aktar</h1>
          <p className="admin-help">
            JSON veya CSV. Domain ve e-posta normalize edilir, kopyalar gösterilir, otomatik e-posta
            gönderilmez.
          </p>
        </div>
      </header>
      <ImportWizard groups={groups} />
    </div>
  );
}
