"use client";

import { useActionState } from "react";
import {
  previewBulkSendAction,
  queueBulkSendAction,
  type BulkPreviewState,
} from "@/app/admin/actions/outreach";
import { ActionMessage } from "@/components/admin/ActionMessage";

type BulkSendWizardProps = {
  groups: Array<{ id: string; name: string }>;
  templates: Array<{ id: string; name: string; category: string; subject: string }>;
  selectedIds: string[];
  defaultGroupId?: string;
  sendEnabled: boolean;
};

export function BulkSendWizard({
  groups,
  templates,
  selectedIds,
  defaultGroupId,
  sendEnabled,
}: BulkSendWizardProps) {
  const [preview, previewAction, previewPending] = useActionState<BulkPreviewState, FormData>(
    previewBulkSendAction,
    {},
  );
  const [queued, queueAction, queuePending] = useActionState<BulkPreviewState, FormData>(
    queueBulkSendAction,
    {},
  );

  return (
    <div className="admin-wizard">
      <p className="admin-help">
        {sendEnabled
          ? "Onaydan sonra en fazla 20 alıcı işlenir. Geçerli e-postası olmayan firmalar asla eklenmez."
          : "Test modu açık: onay taslak kaydeder, gerçek e-posta gitmez. Geçerli e-postası olmayan firmalar asla eklenmez."}
      </p>
      <form action={previewAction} className="admin-form admin-panel">
        <ActionMessage state={preview} />
        <h3>1–3. Grup, alıcı, şablon</h3>
        <label>
          Grup
          <select name="groupId" defaultValue={defaultGroupId ?? ""}>
            <option value="">Tüm gruplar</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Alıcılar
          <select name="recipientMode" defaultValue={selectedIds.length ? "selected" : "unsent"}>
            <option value="unsent">Tüm gönderilmemişler</option>
            <option value="selected">Elle seçilenler</option>
            <option value="score">Website skoru ≥ X</option>
            <option value="valid_email">Yalnızca geçerli e-posta</option>
          </select>
        </label>
        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="companyIds" value={id} />
        ))}
        <label>
          Minimum skor
          <input name="websiteScoreMin" type="number" min={1} max={10} defaultValue={4} />
        </label>
        <label>
          Şablon
          <select name="templateId" required defaultValue="">
            <option value="" disabled>
              Seç
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.category} · {template.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-check">
          <input type="checkbox" name="allowResend" />
          Daha önce gönderilenlere yeniden gönder
        </label>
        <label>
          Batch
          <input name="batchSize" type="number" min={1} max={50} defaultValue={20} />
        </label>
        <button className="admin-btn" disabled={previewPending}>
          Önizle
        </button>
      </form>

      {preview.recipients?.length || preview.skipped?.length ? (
        <section className="admin-panel">
          <h3>4. Önizleme</h3>
          <p>
            Şablon: {preview.templateName ?? "—"} · {preview.recipients?.length ?? 0} gönderilecek ·{" "}
            {preview.skipped?.length ?? 0} atlandı
          </p>
          <ul className="admin-list">
            {preview.recipients?.slice(0, 20).map((row) => (
              <li key={row.companyId}>
                <strong>
                  {row.companyName} · {row.email}
                </strong>
                <span>Konu: {row.subject}</span>
                <span>Skor: {row.score ?? "—"}</span>
                <span>Geliştirme: {row.issues?.length ? row.issues.join(" · ") : "—"}</span>
                {row.bodyHtml ? (
                  <div className="admin-email-frame is-compact">
                    <iframe title={`${row.companyName} önizleme`} srcDoc={row.bodyHtml} sandbox="" />
                  </div>
                ) : (
                  <pre>{row.body}</pre>
                )}
              </li>
            ))}
          </ul>
          {preview.skipped?.length ? (
            <p className="admin-help">
              Atlananlar: {preview.skipped.map((row) => `${row.companyName} (${row.reason})`).join(", ")}
            </p>
          ) : null}
          <form action={queueAction} className="admin-form">
            <ActionMessage state={queued} />
            <input type="hidden" name="groupId" value={preview.groupId ?? ""} />
            <input type="hidden" name="recipientMode" value={preview.recipientMode ?? "selected"} />
            <input type="hidden" name="templateId" value={preview.templateId ?? ""} />
            <input type="hidden" name="websiteScoreMin" value={preview.websiteScoreMin ?? ""} />
            <input type="hidden" name="batchSize" value={preview.batchSize ?? "20"} />
            {preview.allowResend ? <input type="hidden" name="allowResend" value="true" /> : null}
            {(preview.companyIds ?? selectedIds).map((id) => (
              <input key={id} type="hidden" name="companyIds" value={id} />
            ))}
            <label className="admin-check">
              <input type="checkbox" name="confirm" required />
              {sendEnabled
                ? "Bu listedeki alıcılara e-posta göndermeyi onaylıyorum"
                : "Taslak olarak kaydetmeyi onaylıyorum (gerçek gönderim yok)"}
            </label>
            <button className="admin-btn" disabled={queuePending}>
              5. Onayla
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
