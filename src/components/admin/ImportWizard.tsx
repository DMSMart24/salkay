"use client";

import { useActionState } from "react";
import { confirmImportAction, previewImportAction, type ImportPreviewState } from "@/app/admin/actions/import";
import { ActionMessage } from "@/components/admin/ActionMessage";

const SAMPLE = `[
  {
    "companyName": "Example Restaurant",
    "website": "https://example.com",
    "email": "info@example.com",
    "phone": "+90...",
    "industry": "Restaurant",
    "group": "İstanbul Restoranlar",
    "city": "İstanbul",
    "district": "Ataşehir",
    "country": "Türkiye",
    "websiteScore": 4,
    "websiteStatus": "NEEDS_UPGRADE",
    "websiteIssues": ["outdated visual design", "weak mobile experience", "no clear CTA"],
    "recommendedServices": ["Web Tasarım", "SEO"],
    "researchSource": "public web research"
  }
]`;

export function ImportWizard({ groups }: { groups: Array<{ id: string; name: string }> }) {
  const [preview, previewAction, previewPending] = useActionState<ImportPreviewState, FormData>(
    previewImportAction,
    {},
  );
  const [confirm, confirmAction, confirmPending] = useActionState<ImportPreviewState, FormData>(
    confirmImportAction,
    {},
  );

  return (
    <div className="admin-grid-2">
      <form action={previewAction} className="admin-form admin-panel">
        <ActionMessage state={preview} />
        <label>
          Format
          <select name="format" defaultValue="json">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </label>
        <label>
          Varsayılan grup
          <select name="groupId" defaultValue="">
            <option value="">Satırdaki group alanını kullan</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kaynak
          <textarea name="source" rows={16} required defaultValue={SAMPLE} />
        </label>
        <button className="admin-btn" disabled={previewPending}>
          Önizle
        </button>
        <p className="admin-help">Önizleme e-posta göndermez. Kopyalar varsayılan olarak atlanır.</p>
      </form>

      <section className="admin-panel">
        <ActionMessage state={confirm} />
        {!preview.rows?.length ? (
          <p className="admin-help">Önce JSON veya CSV önizleyin.</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Firma</th>
                    <th>E-posta</th>
                    <th>Grup</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={`${row.index}-${row.companyName}`}>
                      <td>{row.index}</td>
                      <td>{row.companyName || "—"}</td>
                      <td>{row.email || "—"}</td>
                      <td>{row.group || "—"}</td>
                      <td>
                        {row.errors.length
                          ? row.errors.join(", ")
                          : row.duplicate
                            ? `Zaten mevcut (${row.duplicate.companyName})`
                            : "Yeni"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form action={confirmAction} className="admin-form">
              <input type="hidden" name="format" value={preview.format ?? "json"} />
              <input type="hidden" name="groupId" value={preview.groupId ?? ""} />
              <input type="hidden" name="source" value={preview.source ?? ""} />
              <label>
                Kopyalar
                <select name="onDuplicate" defaultValue="skip">
                  <option value="skip">Atla (varsayılan)</option>
                  <option value="update">Mevcut kaydı güncelle</option>
                </select>
              </label>
              <button className="admin-btn" disabled={confirmPending}>
                İçe aktarmayı onayla
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
