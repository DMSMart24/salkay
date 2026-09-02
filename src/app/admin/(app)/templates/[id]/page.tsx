import Link from "next/link";
import { notFound } from "next/navigation";
import { duplicateTemplateForm } from "@/app/admin/actions/templates";
import { TemplateStudio } from "@/components/admin/TemplateStudio";
import { formatDateTime } from "@/lib/admin/format";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import { premiumHtmlSource } from "@/lib/admin/email/templates/premium-source";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

function previewRank(
  company: {
    companyName: string;
    group: { name: string; industry: string | null } | null;
  },
  kind: ReturnType<typeof resolvePremiumEmailKind>,
) {
  const name = company.companyName.toLocaleLowerCase("tr");
  const group = `${company.group?.name ?? ""} ${company.group?.industry ?? ""}`.toLocaleLowerCase("tr");
  if (kind === "bar") {
    if (name.includes("galeron")) return 0;
    if (group.includes("barlar") || group.includes("cocktail") || /\bbar\b/.test(group)) return 1;
    if (name.includes("valuna")) return 10;
    return 20;
  }
  if (kind === "construction") {
    if (group.includes("inşaat") || group.includes("insaat") || group.includes("construction")) return 0;
    return 20;
  }
  if (kind === "architecture") {
    if (group.includes("mimarlık") || group.includes("mimarlik") || group.includes("architecture")) return 0;
    return 20;
  }
  if (kind === "realEstate") {
    if (group.includes("gayrimenkul") || group.includes("real estate") || group.includes("emlak")) return 0;
    return 20;
  }
  if (kind === "hotel") {
    if (group.includes("otel") || group.includes("hotel")) return 0;
    return 20;
  }
  if (kind === "automotive") {
    if (group.includes("otomotiv") || group.includes("automotive")) return 0;
    return 20;
  }
  if (name.includes("develi")) return 0;
  if (name === "fauna") return 1;
  if (name.includes("köz kanat") || name.includes("koz kanat")) return 2;
  if (name.includes("sapa")) return 3;
  if (name.includes("beluga")) return 4;
  if (group.includes("restoran") || group.includes("restaurant")) return 10;
  return 20;
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [template, companies] = await Promise.all([
    getPrisma().emailTemplate.findUnique({ where: { id } }),
    getPrisma().company.findMany({
      where: { archivedAt: null },
      select: {
        id: true,
        companyName: true,
        group: { select: { name: true, industry: true } },
      },
      orderBy: { companyName: "asc" },
      take: 200,
    }),
  ]);
  if (!template) notFound();
  const kind = resolvePremiumEmailKind({
    name: template.name,
    category: template.category,
  });
  const studioBody = kind === "custom" ? template.body : premiumHtmlSource(kind);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Vorlagen</p>
          <h1>{template.name}</h1>
          <p className="admin-help">
            Kategori: {template.category} · Dil: {template.language === "tr" ? "Türkçe" : template.language} ·{" "}
            {template.active ? "Aktif" : "Kapalı"} · Son güncelleme {formatDateTime(template.updatedAt)}
          </p>
        </div>
        <div className="admin-actions">
          <form action={duplicateTemplateForm}>
            <input type="hidden" name="templateId" value={template.id} />
            <button className="admin-btn ghost">Kopyala</button>
          </form>
          <Link href="/admin/templates" className="admin-btn ghost">
            Liste
          </Link>
        </div>
      </header>
      <TemplateStudio
        key={template.id}
        template={{
          ...template,
          body: studioBody,
          updatedAt: template.updatedAt.toISOString(),
        }}
        companies={[...companies]
          .sort((left, right) => previewRank(left, kind) - previewRank(right, kind))
          .map(({ id, companyName }) => ({ id, companyName }))}
      />
    </div>
  );
}
