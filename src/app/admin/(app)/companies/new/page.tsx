import { CompanyForm } from "@/components/admin/CompanyForm";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  const groups = await getPrisma().leadGroup.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Firmen</p>
          <h1>Yeni firma</h1>
        </div>
      </header>
      <CompanyForm mode="create" groups={groups} />
    </div>
  );
}
