"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Company, Contact, LeadGroup } from "@prisma/client";
import {
  bulkChangeOutreachForm,
  moveCompaniesToGroupForm,
  suppressSelectedForm,
} from "@/app/admin/actions/outreach";
import { LeadPriorityBadge, OutreachBadge, WebsiteBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/format";
import { outreachStatusLabels } from "@/lib/admin/labels";
import { formatScore, leadPriorityBand } from "@/lib/admin/qualification";
import {
  emailOutreachLane,
  emailOutreachLaneLabels,
} from "@/lib/admin/email-outreach";

type Row = Company & {
  contacts: Contact[];
  group?: { id: string; name: string } | null;
  emails?: Array<{
    direction: "INBOUND" | "OUTBOUND";
    sentAt: Date | null;
    receivedAt: Date | null;
    createdAt: Date;
    status: string;
  }>;
};

type OutreachTableProps = {
  rows: Row[];
  filteredIds: string[];
  groups: Array<Pick<LeadGroup, "id" | "name">>;
  emailHref?: string;
  showEmailLane?: boolean;
};

function lastOutbound(row: Row) {
  return row.emails?.find((item) => item.direction === "OUTBOUND") ?? null;
}

function lastReply(row: Row) {
  return row.emails?.find((item) => item.direction === "INBOUND") ?? null;
}

export function OutreachTable({
  rows,
  filteredIds,
  groups,
  emailHref = "/admin/emails",
  showEmailLane = false,
}: OutreachTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const pageIds = rows.map((row) => row.id);
  const allPage = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const allFiltered = filteredIds.length > 0 && filteredIds.every((id) => selected.includes(id));
  const query = useMemo(() => selected.map((id) => `ids=${id}`).join("&"), [selected]);

  return (
    <div className="admin-table-wrap">
      {selected.length > 0 ? (
        <div className="admin-bulk">
          <span>{selected.length} firma seçildi</span>
          <Link href={`${emailHref}${emailHref.includes("?") ? "&" : "?"}${query}`} className="admin-btn">
            E-posta Gönder
          </Link>
          <form action={moveCompaniesToGroupForm} className="admin-inline-form">
            {selected.map((id) => (
              <input key={id} type="hidden" name="companyIds" value={id} />
            ))}
            <select name="groupId" required defaultValue="">
              <option value="" disabled>
                Gruba ekle
              </option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <button className="admin-btn ghost">Gruba Ekle</button>
          </form>
          <form action={bulkChangeOutreachForm} className="admin-inline-form">
            {selected.map((id) => (
              <input key={id} type="hidden" name="companyIds" value={id} />
            ))}
            <select name="outreachStatus" defaultValue="READY">
              {Object.entries(outreachStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button className="admin-btn ghost">Durumu Değiştir</button>
          </form>
          <form action={suppressSelectedForm} className="admin-inline-form">
            {selected.map((id) => (
              <input key={id} type="hidden" name="companyIds" value={id} />
            ))}
            <button className="admin-btn ghost">Sperrlistesine Ekle</button>
          </form>
        </div>
      ) : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allPage}
                onChange={(event) => setSelected(event.target.checked ? pageIds : [])}
                aria-label="Sayfayı seç"
              />
            </th>
            <th>Firma</th>
            <th>İlçe</th>
            <th>Website</th>
            <th>Website Score</th>
            <th>Lead Score</th>
            <th>Priority</th>
            <th>Kontakt</th>
            {showEmailLane ? <th>E-Mail</th> : null}
            <th>Durum</th>
            <th>Son E-posta</th>
            <th>Yanıt</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((company) => {
            const contact = company.contacts[0];
            const outbound = lastOutbound(company);
            const reply = lastReply(company);
            return (
              <tr key={company.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(company.id)}
                    onChange={(event) => {
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, company.id]
                          : current.filter((id) => id !== company.id),
                      );
                    }}
                    aria-label={company.companyName}
                  />
                </td>
                <td>
                  <Link href={`/admin/companies/${company.id}`} className="admin-strong">
                    {company.companyName}
                  </Link>
                  <p>{company.group?.name || company.industry || "—"}</p>
                </td>
                <td>{company.district || "—"}</td>
                <td>
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer">
                      {company.domain || company.website}
                    </a>
                  ) : (
                    <WebsiteBadge status={company.websiteStatus} />
                  )}
                </td>
                <td>
                  {company.websiteStatus === "NO_WEBSITE"
                    ? "—"
                    : formatScore(company.websiteScore)
                      ? `${formatScore(company.websiteScore)} / 10`
                      : "—"}
                </td>
                <td>{formatScore(company.leadScore) ? `${formatScore(company.leadScore)} / 10` : "—"}</td>
                <td>
                  {typeof company.leadScore === "number" ? (
                    <LeadPriorityBadge band={leadPriorityBand(company.leadScore)} />
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {contact?.email || company.generalEmail || (showEmailLane ? "—" : company.phone) || "—"}
                </td>
                {showEmailLane ? (
                  <td>{emailOutreachLaneLabels[emailOutreachLane(company)]}</td>
                ) : null}
                <td>
                  <OutreachBadge status={company.outreachStatus} />
                </td>
                <td>{formatDate(outbound?.sentAt ?? outbound?.createdAt ?? company.lastContactedAt)}</td>
                <td>{reply ? formatDate(reply.receivedAt ?? reply.createdAt) : "—"}</td>
                <td className="admin-row-actions">
                  <Link href={`/admin/companies/${company.id}`}>Aç</Link>
                  <Link href={`/admin/emails?ids=${company.id}`}>E-posta</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filteredIds.length > pageIds.length ? (
        <div className="admin-bulk">
          <button
            type="button"
            className="admin-btn ghost"
            onClick={() => setSelected(allFiltered ? [] : filteredIds)}
          >
            {allFiltered ? "Seçimi kaldır" : `Filtrelenen ${filteredIds.length} firmanın tümünü seç`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
