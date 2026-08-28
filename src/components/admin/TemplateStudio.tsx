"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import {
  previewTemplateAction,
  resetRestaurantTemplateForm,
  saveTemplateTestDraftForm,
  updateTemplateAction,
  type TemplatePreviewState,
} from "@/app/admin/actions/templates";
import { ActionMessage } from "@/components/admin/ActionMessage";
import { mergeVariableHelp } from "@/lib/admin/merge";
import { templateCategories } from "@/lib/admin/labels";
import type { FormState } from "@/lib/admin/validation";

type TemplateStudioProps = {
  template: {
    id: string;
    name: string;
    category: string;
    subject: string;
    body: string;
    language: string;
    active: boolean;
    updatedAt: string;
  };
  companies: Array<{ id: string; companyName: string }>;
};

export function TemplateStudio({ template, companies }: TemplateStudioProps) {
  const [body, setBody] = useState(template.body);
  const [subject, setSubject] = useState(template.subject);
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [preview, previewAction, previewPending] = useActionState<TemplatePreviewState, FormData>(
    previewTemplateAction,
    {},
  );
  const [saveState, saveAction, savePending] = useActionState<FormState, FormData>(
    updateTemplateAction,
    {},
  );

  function insertVariable(key: string) {
    setBody((current) => `${current}{{${key}}}`);
  }

  useEffect(() => {
    if (!companyId) return;
    const data = new FormData();
    data.set("templateId", template.id);
    data.set("companyId", companyId);
    data.set("subject", subject);
    data.set("body", body);
    startTransition(() => {
      previewAction(data);
    });
    // Preview on company change only; Önizle uses the current editor values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, template.id]);

  return (
    <div className="admin-detail-grid">
      <section className="admin-panel">
        <h2>Düzenle</h2>
        <ActionMessage state={saveState} />
        <form action={saveAction} className="admin-form">
          <input type="hidden" name="templateId" value={template.id} />
          <label>
            Ad
            <input name="name" required defaultValue={template.name} />
          </label>
          <div className="admin-grid-2">
            <label>
              Kategori
              <select name="category" defaultValue={template.category}>
                {templateCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dil
              <input name="language" defaultValue={template.language} />
            </label>
          </div>
          <label>
            Konu
            <input name="subject" required value={subject} onChange={(event) => setSubject(event.target.value)} />
          </label>
          <p className="admin-help">Alternatif: {"{{companyName}} için birkaç dijital geliştirme önerisi"}</p>
          <div className="admin-merge-help">
            {mergeVariableHelp.map((item) => (
              <button key={item.key} type="button" className="admin-btn ghost" onClick={() => insertVariable(item.key)}>
                {`{{${item.key}}}`}
              </button>
            ))}
          </div>
          <label>
            HTML içerik
            <textarea name="body" rows={16} required value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
          <button className="admin-btn" disabled={savePending}>
            Değişiklikleri kaydet
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2>Önizleme</h2>
        <form action={previewAction} className="admin-form">
          <input type="hidden" name="templateId" value={template.id} />
          <input type="hidden" name="subject" value={subject} />
          <input type="hidden" name="body" value={body} />
          <label>
            Önizleme Firması
            <select name="companyId" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </label>
          <button className="admin-btn" disabled={previewPending}>
            Önizle
          </button>
        </form>
        <ActionMessage state={preview} />
        {preview.companyName ? (
          <div className="admin-preview-meta">
            <p><span>ALICI</span> {preview.recipient || "—"}</p>
            <p><span>FİRMA</span> {preview.companyName}</p>
            <p><span>KONU</span> {preview.subject}</p>
            <p><span>SKOR</span> {preview.score}</p>
            <div className="admin-preview-split">
              <div>
                <p><span>DAHİLİ ARAŞTIRMA</span></p>
                <ul>
                  {(preview.internalIssues?.length ? preview.internalIssues : ["—"]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p><span>MÜŞTERİYE GÖSTERİLEN</span></p>
                <ul>
                  {(preview.customerIssues?.length ? preview.customerIssues : ["—"]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {preview.issueReviewNeeded?.length ? (
              <p className="admin-warning">
                Çeviri eşleşmesi yok, genel Türkçe kullanıldı: {preview.issueReviewNeeded.join(" · ")}
              </p>
            ) : null}
            {preview.unresolved ? <p className="admin-error">Çözülmemiş merge etiketi var.</p> : null}
            {preview.ctaConfigured === false ? (
              <p className="admin-warning">
                EMAIL_CTA_URL tanımsız. Buton resmi iletişim sayfasına gider: salkay.com/iletisim
              </p>
            ) : null}
            {preview.phoneVisible === false ? (
              <p className="admin-help">SALKAY telefonu gizli (EMAIL_SALKAY_PHONE yok).</p>
            ) : null}
          </div>
        ) : null}
        <div className="admin-actions">
          <button type="button" className={mode === "desktop" ? "admin-btn" : "admin-btn ghost"} onClick={() => setMode("desktop")}>
            Desktop
          </button>
          <button type="button" className={mode === "mobile" ? "admin-btn" : "admin-btn ghost"} onClick={() => setMode("mobile")}>
            Mobile
          </button>
        </div>
        {preview.bodyHtml ? (
          <div className={mode === "mobile" ? "admin-email-frame is-mobile" : "admin-email-frame"}>
            <iframe title="E-posta önizleme" srcDoc={preview.bodyHtml} sandbox="" />
          </div>
        ) : (
          <p className="admin-help">Bir firma seçip Önizle deyin. Veri değişmez.</p>
        )}
        <form action={saveTemplateTestDraftForm} className="admin-form">
          <input type="hidden" name="templateId" value={template.id} />
          <input type="hidden" name="companyId" value={companyId} />
          <button className="admin-btn ghost">Test E-postası (yalnızca taslak, gönderilmez)</button>
        </form>
        <form action={resetRestaurantTemplateForm}>
          <input type="hidden" name="templateId" value={template.id} />
          <button className="admin-btn ghost">Varsayılan HTML’e sıfırla</button>
        </form>
      </section>
    </div>
  );
}
