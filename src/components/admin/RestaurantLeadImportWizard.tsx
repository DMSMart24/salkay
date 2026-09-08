"use client";

import { useActionState } from "react";
import {
  confirmRestaurantLeadImportAction,
  previewRestaurantLeadImportAction,
  type RestaurantLeadImportState,
} from "@/app/admin/actions/restaurant-leads";
import { ActionMessage } from "@/components/admin/ActionMessage";
import { RESTAURANT_LEAD_CSV_COLUMNS } from "@/lib/admin/restaurant-leads-import";

function actionLabel(action: string) {
  switch (action) {
    case "new":
      return "New";
    case "update":
      return "Update";
    case "unchanged":
      return "Unchanged";
    case "invalid":
      return "Invalid";
    case "review_required":
      return "REVIEW_REQUIRED";
    case "skip":
      return "Skip";
    default:
      return action;
  }
}

export function RestaurantLeadImportWizard() {
  const [preview, previewAction, previewPending] = useActionState<RestaurantLeadImportState, FormData>(
    previewRestaurantLeadImportAction,
    {},
  );
  const [confirm, confirmAction, confirmPending] = useActionState<RestaurantLeadImportState, FormData>(
    confirmRestaurantLeadImportAction,
    {},
  );
  const stats = preview.stats;
  const mode = preview.mode ?? "create";
  const canConfirm = mode === "update" ? Boolean(stats?.updates) : Boolean(stats?.newLeads);

  return (
    <div className="admin-grid-2">
      <form action={previewAction} className="admin-form admin-panel" encType="multipart/form-data">
        <ActionMessage state={preview} />
        <fieldset>
          <legend>Import modu</legend>
          <label>
            <input type="radio" name="mode" value="create" defaultChecked />
            Create new leads
          </label>
          <label>
            <input type="radio" name="mode" value="update" />
            Update existing leads
          </label>
        </fieldset>
        <label>
          CSV veya XLSX dosyası
          <input name="file" type="file" accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
        </label>
        <label>
          Veya CSV yapıştır
          <textarea name="source" rows={12} placeholder={RESTAURANT_LEAD_CSV_COLUMNS.join(",")} />
        </label>
        <button className="admin-btn" disabled={previewPending}>
          Önizle
        </button>
        <p className="admin-help">
          Update existing leads: restaurantName + district ile eşleşen kayıt güncellenir, duplicate
          oluşturulmaz. Boş hücre mevcut veriyi silmez. Confirm edilmeden veritabanına yazılmaz.
        </p>
      </form>

      <section className="admin-panel">
        <ActionMessage state={confirm} />
        {stats ? (
          <div className="admin-cards admin-rl-import-stats">
            <article className="admin-card">
              <p>Total rows</p>
              <strong>{stats.total}</strong>
            </article>
            <article className="admin-card">
              <p>New</p>
              <strong>{stats.newLeads}</strong>
            </article>
            <article className="admin-card">
              <p>Update</p>
              <strong>{stats.updates}</strong>
            </article>
            <article className="admin-card">
              <p>Unchanged</p>
              <strong>{stats.unchanged}</strong>
            </article>
            <article className="admin-card">
              <p>Invalid</p>
              <strong>{stats.invalid}</strong>
            </article>
            <article className="admin-card">
              <p>Possible duplicates</p>
              <strong>{stats.duplicates}</strong>
            </article>
            <article className="admin-card">
              <p>REVIEW_REQUIRED</p>
              <strong>{stats.reviewRequired}</strong>
            </article>
            <article className="admin-card">
              <p>NOT_VERIFIED</p>
              <strong>{stats.notVerified}</strong>
            </article>
            <article className="admin-card">
              <p>Missing leadScore</p>
              <strong>{stats.missingLeadScore}</strong>
            </article>
          </div>
        ) : (
          <p className="admin-help">Önce dosyayı veya CSV’yi önizleyin. Confirm edilmeden kayıt yazılmaz.</p>
        )}

        {preview.rows?.length ? (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Restaurant</th>
                    <th>District</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row) => (
                    <tr key={`${row.index}-${row.restaurantName}-${row.district}`}>
                      <td>{row.index}</td>
                      <td>{row.restaurantName || "—"}</td>
                      <td>{row.district || "—"}</td>
                      <td>
                        {row.importAction === "invalid" || row.errors.length
                          ? `Invalid (${row.errors.join(", ") || "geçersiz"})`
                          : actionLabel(row.importAction ?? (row.duplicate ? "unchanged" : "new"))}
                        {row.duplicate && row.importAction !== "invalid"
                          ? ` · ${row.duplicate.restaurantName} · ${row.duplicate.district}`
                          : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form action={confirmAction} className="admin-form">
              <input type="hidden" name="payload" value={preview.payload ?? ""} />
              <input type="hidden" name="mode" value={mode} />
              <button className="admin-btn" disabled={confirmPending || !canConfirm}>
                {mode === "update"
                  ? stats?.updates
                    ? `${stats.updates} lead’i güncelle`
                    : "Güncellenecek lead yok"
                  : stats?.newLeads
                    ? `${stats.newLeads} yeni lead’i içe aktar`
                    : "Eklenecek yeni lead yok"}
              </button>
            </form>
          </>
        ) : null}
      </section>
    </div>
  );
}
