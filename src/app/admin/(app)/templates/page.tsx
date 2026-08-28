import { seedExampleTemplateForm, toggleTemplateAction } from "@/app/admin/actions/comms";
import { TemplateForm } from "@/components/admin/SimpleForms";
import { formatDate } from "@/lib/admin/format";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getPrisma().emailTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Vorlagen</p>
          <h1>Outreach şablonları</h1>
        </div>
        <form action={seedExampleTemplateForm}>
          <button className="admin-btn ghost">Örnek şablon ekle</button>
        </form>
      </header>
      <TemplateForm />
      <div className="admin-template-grid">
        {templates.map((template) => (
          <article key={template.id} className="admin-panel">
            <p className="admin-kicker">{template.category}</p>
            <h3>{template.name}</h3>
            <p>{template.subject}</p>
            <pre>{template.body.slice(0, 180)}{template.body.length > 180 ? "…" : ""}</pre>
            <p className="admin-help">
              {template.active ? "Aktif" : "Kapalı"} · {formatDate(template.updatedAt)}
            </p>
            <form action={toggleTemplateAction}>
              <input type="hidden" name="templateId" value={template.id} />
              <input type="hidden" name="active" value={template.active ? "false" : "true"} />
              <button className="admin-btn ghost">
                {template.active ? "Pasifleştir" : "Aktifleştir"}
              </button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
