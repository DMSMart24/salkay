import Link from "next/link";
import { notFound } from "next/navigation";
import type { OutreachStatus } from "@prisma/client";
import { GroupForm } from "@/components/admin/GroupForm";
import { OutreachTable } from "@/components/admin/OutreachTable";
import { listCompanies, listFilterOptions, getGroupDetail } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  outreachStatus?: string;
  page?: string;
};

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tümü" },
  { value: "NEW", label: "Henüz gönderilmedi" },
  { value: "SENT", label: "Gönderildi" },
  { value: "REPLIED", label: "Yanıt geldi" },
  { value: "FAILED", label: "Başarısız" },
  { value: "DO_NOT_CONTACT", label: "İletişim kurma" },
];

export default async function GroupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Search>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const group = await getGroupDetail(id);
  if (!group) notFound();

  const outreachStatus = (query.outreachStatus || "") as OutreachStatus | "";
  const [{ rows, total, page, pageCount, filteredIds }, options] = await Promise.all([
    listCompanies({
      groupId: id,
      q: query.q,
      outreachStatus,
      page: Number(query.page || "1"),
    }),
    listFilterOptions(),
  ]);

  const paramsBase = new URLSearchParams();
  if (query.q) paramsBase.set("q", query.q);
  if (query.outreachStatus) paramsBase.set("outreachStatus", query.outreachStatus);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Grup</p>
          <h1>{group.name}</h1>
          <p className="admin-help">
            {[group.industry, group.city, group.country].filter(Boolean).join(" · ") || "—"} · {total}{" "}
            firma
          </p>
        </div>
        <div className="admin-actions">
          <Link href={`/admin/emails?groupId=${group.id}`} className="admin-btn">
            Seçilenlere E-posta Gönder
          </Link>
          <a href={`/admin/groups/${group.id}/export`} className="admin-btn ghost">
            Dışa Aktar
          </a>
          <Link href="/admin/companies/new" className="admin-btn ghost">
            Firma Ekle
          </Link>
        </div>
      </header>

      <form className="admin-filters" method="get">
        <input name="q" defaultValue={query.q} placeholder="Ara" />
        <select name="outreachStatus" defaultValue={query.outreachStatus ?? ""}>
          {FILTERS.map((item) => (
            <option key={item.label} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button className="admin-btn">Filtrele</button>
      </form>

      <OutreachTable
        rows={rows}
        filteredIds={filteredIds}
        groups={options.groups}
        emailHref={`/admin/emails?groupId=${group.id}`}
      />

      <div className="admin-pager">
        {page > 1 ? (
          <Link href={`/admin/groups/${group.id}?${new URLSearchParams({ ...Object.fromEntries(paramsBase), page: String(page - 1) })}`}>
            Önceki
          </Link>
        ) : null}
        <span>
          {page} / {pageCount}
        </span>
        {page < pageCount ? (
          <Link href={`/admin/groups/${group.id}?${new URLSearchParams({ ...Object.fromEntries(paramsBase), page: String(page + 1) })}`}>
            Sonraki
          </Link>
        ) : null}
      </div>

      <section className="admin-panel">
        <h2>Grup bilgileri</h2>
        <GroupForm group={group} />
      </section>
    </div>
  );
}
