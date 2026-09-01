import Link from "next/link";
import type { OutreachStatus, WebsiteStatus } from "@prisma/client";
import { OutreachTable } from "@/components/admin/OutreachTable";
import { outreachStatusLabels, websiteStatusLabels } from "@/lib/admin/labels";
import { leadPriorityLabels, type LeadPriorityBand } from "@/lib/admin/qualification";
import { listCompanies, listFilterOptions } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  industry?: string;
  group?: string;
  city?: string;
  district?: string;
  websiteStatus?: string;
  websiteScore?: string;
  leadPriority?: string;
  outreachStatus?: string;
  email?: string;
  sort?: string;
  page?: string;
};

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const filters = {
    q: params.q,
    industry: params.industry,
    groupId: params.group,
    city: params.city,
    district: params.district,
    websiteStatus: (params.websiteStatus || "") as WebsiteStatus | "",
    websiteScoreMin: params.websiteScore ? Number(params.websiteScore) : undefined,
    leadPriority: (params.leadPriority || "") as LeadPriorityBand | "",
    outreachStatus: (params.outreachStatus || "") as OutreachStatus | "",
    hasEmail: (params.email || "") as "yes" | "no" | "",
    sort: params.sort,
    page: Number(params.page || "1"),
  };
  const [{ rows, page, pageCount, total, filteredIds }, options] = await Promise.all([
    listCompanies(filters),
    listFilterOptions(),
  ]);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Firmen</p>
          <h1>Firmalar</h1>
          <p className="admin-help">{total} kayıt</p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/companies/import" className="admin-btn">
            Firma İçe Aktar
          </Link>
          <Link href="/admin/companies/new" className="admin-btn ghost">
            Yeni firma
          </Link>
        </div>
      </header>

      <form className="admin-filters" method="get">
        <input name="q" defaultValue={params.q} placeholder="Ara" />
        <select name="industry" defaultValue={params.industry ?? ""}>
          <option value="">Sektör</option>
          {options.industries.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="group" defaultValue={params.group ?? ""}>
          <option value="">Grup</option>
          {options.groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <select name="city" defaultValue={params.city ?? ""}>
          <option value="">Şehir</option>
          {options.cities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="district" defaultValue={params.district ?? ""}>
          <option value="">İlçe</option>
          {options.districts.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select name="websiteStatus" defaultValue={params.websiteStatus ?? ""}>
          <option value="">Website</option>
          {Object.entries(websiteStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="websiteScore" defaultValue={params.websiteScore ?? ""}>
          <option value="">Skor</option>
          {[4, 5, 6, 7, 8].map((score) => (
            <option key={score} value={score}>
              {score}+ 
            </option>
          ))}
        </select>
        <select name="leadPriority" defaultValue={params.leadPriority ?? ""}>
          <option value="">Lead Priority</option>
          {(Object.keys(leadPriorityLabels) as LeadPriorityBand[]).map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
        <select name="outreachStatus" defaultValue={params.outreachStatus ?? ""}>
          <option value="">Durum</option>
          {Object.entries(outreachStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="email" defaultValue={params.email ?? ""}>
          <option value="">E-posta</option>
          <option value="yes">E-posta var</option>
          <option value="no">E-posta yok</option>
        </select>
        <select name="sort" defaultValue={params.sort ?? "updated"}>
          <option value="updated">Son güncelleme</option>
          <option value="pipeline">Pipeline (Lead yüksek / Web düşük)</option>
          <option value="leadScore">Highest Lead Score</option>
          <option value="websiteScoreAsc">Lowest Website Score</option>
          <option value="reviewed">Recently Reviewed</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="name">Ad</option>
          <option value="last">Son iletişim</option>
          <option value="score">Website skoru</option>
        </select>
        <button className="admin-btn">Filtrele</button>
      </form>

      <OutreachTable rows={rows} filteredIds={filteredIds} groups={options.groups} />

      <div className="admin-pager">
        {page > 1 ? (
          <Link href={`/admin/companies?${new URLSearchParams({ ...params, page: String(page - 1) })}`}>
            Önceki
          </Link>
        ) : null}
        <span>
          {page} / {pageCount}
        </span>
        {page < pageCount ? (
          <Link href={`/admin/companies?${new URLSearchParams({ ...params, page: String(page + 1) })}`}>
            Sonraki
          </Link>
        ) : null}
      </div>
    </div>
  );
}
