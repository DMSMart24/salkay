import Link from "next/link";
import { toggleTemplateAction } from "@/app/admin/actions/comms";
import {
  duplicateTemplateForm,
  ensureBarTemplateForm,
  ensureIndustryTemplateForm,
  ensureRestaurantTemplateForm,
} from "@/app/admin/actions/templates";
import { INDUSTRY_SPECS } from "@/lib/admin/email/templates/premium-industry";
import { PREMIUM_INDUSTRY_KINDS } from "@/lib/admin/email/templates/premium-kind";
import { TemplateForm } from "@/components/admin/SimpleForms";
import { templateCardPreview } from "@/lib/admin/email/html";
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
        <div className="admin-actions">
          <form action={ensureRestaurantTemplateForm}>
            <button className="admin-btn">Restoran şablonunu aç / kur</button>
          </form>
          <form action={ensureBarTemplateForm}>
            <button className="admin-btn ghost">Bar şablonunu aç / kur</button>
          </form>
          {PREMIUM_INDUSTRY_KINDS.map((kind) => (
            <form key={kind} action={ensureIndustryTemplateForm}>
              <input type="hidden" name="industry" value={kind} />
              <button className="admin-btn ghost">{INDUSTRY_SPECS[kind].category} şablonunu aç / kur</button>
            </form>
          ))}
        </div>
      </header>
      <TemplateForm />
      <div className="admin-template-grid">
        {templates.map((template) => (
          <article key={template.id} className="admin-panel">
            <p className="admin-kicker">{template.category}</p>
            <h3>{template.name}</h3>
            <p>{template.subject}</p>
            <p className="admin-help">{templateCardPreview(template.name, template.body)}</p>
            <p className="admin-help">
              Dil: {template.language === "tr" ? "Türkçe" : template.language} ·{" "}
              {template.active ? "Aktif" : "Kapalı"} · Son güncelleme {formatDate(template.updatedAt)}
            </p>
            <div className="admin-actions">
              <Link href={`/admin/templates/${template.id}`} className="admin-btn">
                Önizle
              </Link>
              <Link href={`/admin/templates/${template.id}`} className="admin-btn ghost">
                Düzenle
              </Link>
              <form action={duplicateTemplateForm}>
                <input type="hidden" name="templateId" value={template.id} />
                <button className="admin-btn ghost">Kopyala</button>
              </form>
              <form action={toggleTemplateAction}>
                <input type="hidden" name="templateId" value={template.id} />
                <input type="hidden" name="active" value={template.active ? "false" : "true"} />
                <button className="admin-btn ghost">
                  {template.active ? "Pasifleştir" : "Aktifleştir"}
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
