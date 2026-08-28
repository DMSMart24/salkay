"use client";

import Link from "next/link";
import { useState } from "react";
import type { Company, Contact } from "@prisma/client";
import {
  archiveCompanyAction,
  bulkChangeStatusForm,
  changeCompanyStatusForm,
} from "@/app/admin/actions/crm";
import { PriorityBadge, StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/admin/format";
import { companyStatusLabels } from "@/lib/admin/labels";
import { fullName } from "@/lib/admin/normalize";

type Row = Company & { contacts: Contact[] };

export function CompaniesTable({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const allIds = rows.map((row) => row.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));

  return (
    <div className="admin-table-wrap">
      {selected.length > 0 ? (
        <form action={bulkChangeStatusForm} className="admin-bulk">
          {selected.map((id) => (
            <input key={id} type="hidden" name="companyIds" value={id} />
          ))}
          <span>{selected.length} seçildi</span>
          <select name="status" defaultValue="CONTACTED">
            {Object.entries(companyStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button className="admin-btn">Durumu uygula</button>
        </form>
      ) : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => setSelected(event.target.checked ? allIds : [])}
                aria-label="Tümünü seç"
              />
            </th>
            <th>Firma</th>
            <th>Kişi</th>
            <th>E-posta</th>
            <th>Durum</th>
            <th>Son iletişim</th>
            <th>Takip</th>
            <th>Kaynak</th>
            <th>Öncelik</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((company) => {
            const contact = company.contacts[0];
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
                  <p>{company.domain || company.website || "—"}</p>
                </td>
                <td>{contact ? fullName(contact.firstName, contact.lastName) : "—"}</td>
                <td>{contact?.email || company.generalEmail || "—"}</td>
                <td>
                  <StatusBadge status={company.status} />
                </td>
                <td>{formatDate(company.lastContactedAt)}</td>
                <td>{formatDate(company.nextFollowUpAt)}</td>
                <td>{company.source || "—"}</td>
                <td>
                  <PriorityBadge priority={company.priority} />
                </td>
                <td className="admin-row-actions">
                  <Link href={`/admin/companies/${company.id}`}>Open</Link>
                  <Link href={`/admin/companies/${company.id}#edit`}>Edit</Link>
                  <Link href={`/admin/companies/${company.id}#note`}>Add Note</Link>
                  <Link href={`/admin/companies/${company.id}#compose`}>Send Email</Link>
                  <form action={changeCompanyStatusForm}>
                    <input type="hidden" name="companyId" value={company.id} />
                    <select name="status" defaultValue={company.status} aria-label="Durum">
                      {Object.entries(companyStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button type="submit">Kaydet</button>
                  </form>
                  <form action={archiveCompanyAction}>
                    <input type="hidden" name="companyId" value={company.id} />
                    <button type="submit">Archive</button>
                  </form>
                  <form action={changeCompanyStatusForm}>
                    <input type="hidden" name="companyId" value={company.id} />
                    <input type="hidden" name="status" value="DO_NOT_CONTACT" />
                    <button type="submit">Do Not Contact</button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
