"use client";

import { useActionState, useMemo, useState } from "react";
import {
  confirmRestaurantLeadBulkSendAction,
  prepareRestaurantLeadBulkAction,
  previewRestaurantLeadBulkAction,
  retryFailedRestaurantLeadBulkAction,
  type RestaurantLeadBulkActionState,
} from "@/app/admin/actions/restaurant-lead-bulk";
import { ActionMessage } from "@/components/admin/ActionMessage";
import {
  INTERNAL_CHUNK_SIZE,
  INTERNAL_CHUNK_SIZES,
  restaurantLeadExcludeLabels,
  restaurantLeadPitchLabels,
  restaurantLeadWebsiteFilterLabels,
  type RestaurantLeadBulkRow,
  type RestaurantLeadExcludeBucket,
} from "@/lib/admin/restaurant-lead-bulk";

type Counters = {
  total: number;
  ready: number;
  needsReview: number;
  noEmail: number;
  sent: number;
  failed: number;
};

type Props = {
  counters: Counters;
  rows: RestaurantLeadBulkRow[];
  defaultSelectedIds: string[];
  sendEligibleIds: string[];
  eligibleCount: number;
  excludedCount: number;
  previouslySent: number;
  excludeBuckets: Record<RestaurantLeadExcludeBucket, number>;
  filters: {
    status: string;
    region: string;
    tier: string;
    website: string;
    pitch: string;
    firstWave: boolean;
  };
};

const PREVIEW_WINDOW = 12;

export function RestaurantLeadBulkWizard({
  counters,
  rows,
  defaultSelectedIds,
  sendEligibleIds,
  eligibleCount,
  excludedCount,
  previouslySent,
  excludeBuckets,
  filters,
}: Props) {
  const [selected, setSelected] = useState<string[]>(defaultSelectedIds);
  const [chunkSize, setChunkSize] = useState(INTERNAL_CHUNK_SIZE);
  const [mode, setMode] = useState<"TEST" | "LIVE">("TEST");
  const [liveArmed, setLiveArmed] = useState(false);
  const [previewLeadId, setPreviewLeadId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [preview, previewAction, previewPending] = useActionState<RestaurantLeadBulkActionState, FormData>(
    previewRestaurantLeadBulkAction,
    {},
  );
  const [prepared, prepareAction, preparePending] = useActionState<RestaurantLeadBulkActionState, FormData>(
    prepareRestaurantLeadBulkAction,
    {},
  );
  const [sendState, sendAction, sendPending] = useActionState<RestaurantLeadBulkActionState, FormData>(
    confirmRestaurantLeadBulkSendAction,
    {},
  );
  const [retryState, retryAction, retryPending] = useActionState<RestaurantLeadBulkActionState, FormData>(
    retryFailedRestaurantLeadBulkAction,
    {},
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const previewLead = rows.find((row) => row.id === previewLeadId) ?? null;
  const snapshots = prepared.snapshots ?? preview.snapshots ?? [];
  const step = sendState.step ?? prepared.step ?? preview.step ?? "list";
  const visibleSnapshots = showAllPreview ? snapshots : snapshots.slice(0, PREVIEW_WINDOW);
  const progress = sendState.progress ?? prepared.progress ?? preview.progress;
  const sendCount = prepared.snapshots?.length ?? snapshots.length;

  function toggle(id: string, eligible: boolean) {
    if (!eligible) return;
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function requestLiveMode() {
    const ok = window.confirm(
      "Canlı moda geçildiğinde seçilen tüm uygun alıcılara gerçek e-posta gönderilebilir.",
    );
    if (!ok) return;
    setMode("LIVE");
    setLiveArmed(true);
  }

  const excludeEntries = (Object.entries(excludeBuckets) as Array<[RestaurantLeadExcludeBucket, number]>).filter(
    ([, count]) => count > 0,
  );

  return (
    <div className="admin-wizard admin-rl-bulk">
      <section className="admin-cards">
        <div className="admin-card">
          <p>Toplam RestaurantLead</p>
          <strong>{counters.total}</strong>
        </div>
        <div className="admin-card">
          <p>Gönderime uygun</p>
          <strong>{eligibleCount}</strong>
        </div>
        <div className="admin-card">
          <p>Seçili</p>
          <strong>{selected.length}</strong>
        </div>
        <div className="admin-card">
          <p>Hariç tutulan</p>
          <strong>{excludedCount}</strong>
        </div>
        <div className="admin-card">
          <p>READY</p>
          <strong>{counters.ready}</strong>
        </div>
        <div className="admin-card">
          <p>Gönderilmiş</p>
          <strong>{counters.sent}</strong>
        </div>
      </section>

      <p className="admin-help">
        Toplam RestaurantLead: {counters.total} · Gönderime uygun: {eligibleCount} · Seçili: {selected.length} ·
        Hariç tutulan: {excludedCount}
      </p>

      {excludeEntries.length ? (
        <section className="admin-panel admin-rl-excludes">
          <h2>Hariç tutulan: {excludedCount}</h2>
          <ul className="admin-list">
            {excludeEntries.map(([bucket, count]) => (
              <li key={bucket}>
                {restaurantLeadExcludeLabels[bucket]}: {count}
              </li>
            ))}
            <li>Daha önce gönderilen kayıt: {previouslySent}</li>
          </ul>
        </section>
      ) : null}

      <div className={`admin-rl-mode ${mode === "LIVE" ? "is-live" : "is-test"}`}>
        <div>
          <strong>{mode === "LIVE" ? "CANLI MOD" : "TEST MODU"}</strong>
          <p>
            {mode === "LIVE"
              ? "Canlı moda geçildiğinde seçilen tüm uygun alıcılara gerçek e-posta gönderilebilir."
              : "Varsayılan. Gerçek e-posta gönderilmez."}
          </p>
        </div>
        {mode === "TEST" ? (
          <button type="button" className="admin-btn ghost" onClick={requestLiveMode}>
            Canlı moda geç
          </button>
        ) : (
          <button
            type="button"
            className="admin-btn ghost"
            onClick={() => {
              setMode("TEST");
              setLiveArmed(false);
            }}
          >
            Test moda dön
          </button>
        )}
      </div>
      {mode === "LIVE" && !liveArmed ? <p className="admin-error">Canlı mod onaylanmadı.</p> : null}

      <form method="get" className="admin-filters admin-rl-bulk-filters">
        <input type="hidden" name="tab" value="bulk" />
        <input type="hidden" name="source" value="leads" />
        <label>
          Durum
          <select name="status" defaultValue={filters.status}>
            <option value="READY_FOR_REVIEW">READY_FOR_REVIEW</option>
            <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
            <option value="QUALIFIED_OUT">QUALIFIED_OUT</option>
            <option value="ALL">ALL</option>
          </select>
        </label>
        <label>
          Bölge
          <select name="region" defaultValue={filters.region}>
            <option value="">Tümü</option>
            <option value="ANADOLU">Anadolu Yakası</option>
            <option value="AVRUPA">Avrupa Yakası</option>
          </select>
        </label>
        <label>
          Kalite / Tier
          <select name="tier" defaultValue={filters.tier}>
            <option value="">Tümü</option>
            <option value="A">Tier A</option>
            <option value="B">Tier B</option>
            <option value="C">Tier C</option>
          </select>
        </label>
        <label>
          Website
          <select name="website" defaultValue={filters.website}>
            <option value="">Tümü</option>
            {Object.entries(restaurantLeadWebsiteFilterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Pitch
          <select name="pitch" defaultValue={filters.pitch}>
            <option value="">Tümü</option>
            {Object.entries(restaurantLeadPitchLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-check">
          <input type="checkbox" name="wave" value="first" defaultChecked={filters.firstWave} />
          İlk Test Dalgası
        </label>
        <button className="admin-btn ghost">Filtrele</button>
      </form>

      <div className="admin-rl-actions">
        <button type="button" className="admin-btn" onClick={() => setSelected(sendEligibleIds)}>
          Tüm uygun alıcıları seç
        </button>
        <button type="button" className="admin-btn ghost" onClick={() => setSelected([])}>
          Seçimi temizle
        </button>
        <label>
          İç parça boyutu
          <select
            name="chunkSizeDisplay"
            value={chunkSize}
            onChange={(event) => setChunkSize(Number(event.target.value))}
          >
            {INTERNAL_CHUNK_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="admin-help">
        Parça boyutu alıcı sayısını sınırlamaz. {selected.length} seçili alıcı {chunkSize} kişilik iç parçalarla tek
        gönderim olarak işlenir.
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th />
              <th>Restaurant</th>
              <th>District</th>
              <th>Region</th>
              <th>Email</th>
              <th>Website</th>
              <th>Website Status</th>
              <th>Sales Score</th>
              <th>Tier</th>
              <th>Primary Pitch</th>
              <th>Email Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={row.eligible ? undefined : "is-excluded"}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSet.has(row.id)}
                    disabled={!row.eligible}
                    onChange={() => toggle(row.id, row.eligible)}
                  />
                </td>
                <td>{row.restaurantName}</td>
                <td>{row.district}</td>
                <td>{row.region}</td>
                <td>{row.publicEmail ?? "—"}</td>
                <td>{row.website ?? "—"}</td>
                <td>{row.websiteStatus}</td>
                <td>{row.salesOpportunityScore ?? "—"}</td>
                <td>Tier {row.tier}</td>
                <td>{restaurantLeadPitchLabels[row.primaryPitch]}</td>
                <td>{row.emailStatus}</td>
                <td>
                  <button type="button" className="admin-btn-link" onClick={() => setPreviewLeadId(row.id)}>
                    Maili Gör
                  </button>
                  {!row.eligible ? (
                    <div className="admin-help">{row.excludeReasons[0] ?? "Hariç tutuldu — e-posta incelemesi gerekli"}</div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {step === "list" || !snapshots.length ? (
        <form action={previewAction} className="admin-form admin-panel">
          <ActionMessage state={preview} />
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="chunkSize" value={String(chunkSize)} />
          {selected.map((id) => (
            <input key={id} type="hidden" name="leadIds" value={id} />
          ))}
          <button className="admin-btn" disabled={previewPending || !selected.length}>
            Önizle
          </button>
        </form>
      ) : null}

      {preview.snapshots?.length && !prepared.batchId ? (
        <section className="admin-panel">
          <h2>TOPLU GÖNDERİM ÖNİZLEMESİ</h2>
          <p>Toplam Lead: {counters.total}</p>
          <p>Gönderime uygun: {eligibleCount}</p>
          <p>Seçili: {selected.length}</p>
          <p>Hariç: {excludedCount}</p>
          <p>Bu pakette: {preview.snapshots.length}</p>
          <p>
            İç parçalar: {Math.ceil(preview.snapshots.length / chunkSize)} × {chunkSize}
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Tier</th>
                  <th>Pitch</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibleSnapshots.map((row) => (
                  <tr key={row.restaurantLeadId}>
                    <td>{row.restaurantName}</td>
                    <td>{row.recipientEmail}</td>
                    <td>{row.emailSubject}</td>
                    <td>Tier {row.tier}</td>
                    <td>{restaurantLeadPitchLabels[row.primaryPitch]}</td>
                    <td>{row.eligibilityStatus}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn-link"
                        onClick={() => setExpandedId(expandedId === row.restaurantLeadId ? null : row.restaurantLeadId)}
                      >
                        Maili Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {snapshots.length > PREVIEW_WINDOW ? (
            <button type="button" className="admin-btn ghost" onClick={() => setShowAllPreview((value) => !value)}>
              {showAllPreview ? "Kısalt" : "Tümünü Göster"}
            </button>
          ) : (
            <button type="button" className="admin-btn ghost" onClick={() => setShowAllPreview(true)}>
              Tümünü Göster
            </button>
          )}
          {expandedId ? (
            <pre>{snapshots.find((row) => row.restaurantLeadId === expandedId)?.emailBody}</pre>
          ) : null}
          {preview.skipped?.length ? (
            <p className="admin-help">
              Paketten düşen: {preview.skipped.map((row) => `${row.restaurantName} (${row.reason})`).join(" · ")}
            </p>
          ) : null}
          <form action={prepareAction} className="admin-form">
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="chunkSize" value={String(chunkSize)} />
            {preview.snapshots.map((row) => (
              <input key={row.restaurantLeadId} type="hidden" name="leadIds" value={row.restaurantLeadId} />
            ))}
            <button type="button" className="admin-btn ghost" onClick={() => window.location.reload()}>
              Taslaklara Dön
            </button>
            <button className="admin-btn" disabled={preparePending}>
              Gönderimi Hazırla
            </button>
          </form>
        </section>
      ) : null}

      {prepared.batchId ? (
        <section className="admin-panel">
          <h2>GERÇEK GÖNDERİM KONTROLÜ</h2>
          <ActionMessage state={prepared} />
          <p>Gönderilecek: {sendCount}</p>
          <dl className="admin-dl">
            <div>
              <dt>Verified email</dt>
              <dd>{prepared.checks?.verifiedEmails ?? "0/0"}</dd>
            </div>
            <div>
              <dt>Personalized subject</dt>
              <dd>{prepared.checks?.personalizedSubjects ?? "0/0"}</dd>
            </div>
            <div>
              <dt>Personalized body</dt>
              <dd>{prepared.checks?.personalizedBodies ?? "0/0"}</dd>
            </div>
            <div>
              <dt>Ready status</dt>
              <dd>{prepared.checks?.readyStatus ?? "0/0"}</dd>
            </div>
            <div>
              <dt>Active</dt>
              <dd>{prepared.checks?.active ?? "0/0"}</dd>
            </div>
            <div>
              <dt>Duplicates</dt>
              <dd>{prepared.checks?.duplicates ?? 0}</dd>
            </div>
            <div>
              <dt>Previously sent</dt>
              <dd>{prepared.checks?.previouslySent ?? 0}</dd>
            </div>
            <div>
              <dt>Invalid inbox</dt>
              <dd>{prepared.checks?.invalidInbox ?? 0}</dd>
            </div>
          </dl>
          {progress ? (
            <p className={`admin-rl-progress ${progress.status === "BLOCKED" ? "is-blocked" : ""}`}>
              {progress.status === "BLOCKED"
                ? `Gönderildi ${progress.sent} / ${progress.total}`
                : sendPending
                  ? `Gönderiliyor ${progress.processed} / ${progress.total}`
                  : `Hazır ${progress.processed} / ${progress.total}`}
              {progress.failed ? ` · başarısız ${progress.failed}` : ""}
            </p>
          ) : null}
          <form action={sendAction} className="admin-form">
            <ActionMessage state={sendState} />
            <input type="hidden" name="batchId" value={prepared.batchId} />
            <p className="admin-warning">
              {sendCount} adet kişiselleştirilmiş e-posta gönderilecek. Bu işlem gerçek e-posta gönderimidir.
            </p>
            <label className="admin-check">
              <input
                type="checkbox"
                name="reviewed"
                checked={reviewed}
                onChange={(event) => setReviewed(event.target.checked)}
              />
              {sendCount} adet gerçek e-postanın gönderileceğini onaylıyorum.
            </label>
            <button
              className="admin-btn admin-rl-send"
              disabled={!reviewed || sendPending || (prepared.checks?.duplicates ?? 0) > 0}
            >
              {sendCount} E-postayı Gönder
            </button>
          </form>
          <form action={retryAction} className="admin-form">
            <ActionMessage state={retryState} />
            <input type="hidden" name="batchId" value={prepared.batchId} />
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="chunkSize" value={String(chunkSize)} />
            <button className="admin-btn ghost" disabled={retryPending}>
              Yalnızca başarısızları dene
            </button>
          </form>
        </section>
      ) : null}

      {previewLead ? (
        <div className="admin-rl-mail-modal" role="dialog" aria-modal="true">
          <div className="admin-panel">
            <h2>Maili Gör</h2>
            <p>
              <strong>TO</strong> {previewLead.publicEmail ?? "—"}
            </p>
            <p>
              <strong>SUBJECT</strong> {previewLead.emailSubject ?? "taslak yok"}
            </p>
            <pre>{previewLead.emailBody ?? ""}</pre>
            <button type="button" className="admin-btn ghost" onClick={() => setPreviewLeadId(null)}>
              Kapat
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
