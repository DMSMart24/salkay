"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import {
  previewTemplateAction,
  resetBarTemplateForm,
  resetIndustryTemplateForm,
  resetRestaurantTemplateForm,
  saveTemplateTestDraftForm,
  updateTemplateAction,
  type TemplatePreviewState,
} from "@/app/admin/actions/templates";
import { isBarPremiumTemplate } from "@/lib/admin/email/templates/bar";
import { isPremiumIndustryKind, resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import { isRestaurantPremiumTemplate } from "@/lib/admin/email/templates/restaurant";
import { ActionMessage } from "@/components/admin/ActionMessage";
import { mergeVariableHelp } from "@/lib/admin/merge";
import { templateCategories } from "@/lib/admin/labels";
import type { PreviewWebsiteMode } from "@/lib/admin/email/website-copy";
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
  sourceOfTruth: "code" | "database";
  editorAffectsSend: boolean;
  kindLabel: string;
  companies: Array<{ id: string; companyName: string }>;
};

export function TemplateStudio({
  template,
  sourceOfTruth,
  editorAffectsSend,
  kindLabel,
  companies,
}: TemplateStudioProps) {
  const [body, setBody] = useState(template.body);
  const [subject, setSubject] = useState(template.subject);
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [previewStatus, setPreviewStatus] = useState<PreviewWebsiteMode>("actual");
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
    if (!editorAffectsSend) return;
    setBody((current) => `${current}{{${key}}}`);
  }

  useEffect(() => {
    if (!companyId) return;
    const data = new FormData();
    data.set("templateId", template.id);
    data.set("companyId", companyId);
    data.set("subject", subject);
    data.set("body", body);
    data.set("previewStatus", previewStatus);
    startTransition(() => {
      previewAction(data);
    });
    // Preview on company/template/status change only; Önizle uses the current editor values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, template.id, previewStatus]);

  return (
    <div className="admin-detail-grid">
      <section className="admin-panel">
        <h2>{editorAffectsSend ? "Düzenle" : "Şablon"}</h2>
        <p className={editorAffectsSend ? "admin-help" : "admin-warning"}>
          {editorAffectsSend
            ? "Kaynak: Veritabanı. Editör içeriği Preview, Compose, Bulk ve gönderimde aynıdır."
            : "Kaynak: Kod. Premium layout ve konu kod tarafından belirlenir. Aşağıdaki HTML gönderimi değiştirmez."}
        </p>
        <p className="admin-help">
          {template.name} · {kindLabel} · {template.active ? "Aktif" : "Kapalı"} · {sourceOfTruth}
        </p>
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
            Konu {editorAffectsSend ? "" : "(gönderim konusu, salt okunur)"}
            <input
              name="subject"
              required
              value={subject}
              readOnly={!editorAffectsSend}
              onChange={(event) => {
                if (editorAffectsSend) setSubject(event.target.value);
              }}
            />
          </label>
          {editorAffectsSend ? (
            <>
              <div className="admin-merge-help">
                {mergeVariableHelp.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className="admin-btn ghost"
                    onClick={() => insertVariable(item.key)}
                  >
                    {`{{${item.key}}}`}
                  </button>
                ))}
              </div>
              <label>
                HTML içerik
                <textarea
                  name="body"
                  rows={16}
                  required
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <input type="hidden" name="body" value={body} />
              <p className="admin-help">
                Kullanılan değişkenler: companyName, district, city, score, issue_1–4, ctaUrl,
                unsubscribeUrl
              </p>
              <label>
                Kod layout kaynağı (salt okunur, gönderim bu renderer ile üretilir)
                <textarea name="layoutSource" rows={10} readOnly value={body} />
              </label>
            </>
          )}
          <button className="admin-btn" disabled={savePending}>
            {editorAffectsSend ? "Değişiklikleri kaydet" : "Ad / kategori kaydet"}
          </button>
        </form>
      </section>

      <section className="admin-panel">
        <h2>Gönderim önizlemesi</h2>
        <p className="admin-help">
          Desktop ve mobile aynı renderer kullanır (Preview = Compose = Bulk = Send).
        </p>
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
          {sourceOfTruth === "code" ? (
            <label>
              Website durumu (önizleme)
              <select
                name="previewStatus"
                value={previewStatus}
                onChange={(event) => setPreviewStatus(event.target.value as PreviewWebsiteMode)}
              >
                <option value="actual">Kayıtlı durum</option>
                <option value="verified">VERIFIED</option>
                <option value="not_verified">NOT_VERIFIED</option>
                <option value="no_website">NO_WEBSITE</option>
              </select>
            </label>
          ) : (
            <input type="hidden" name="previewStatus" value="actual" />
          )}
          <button className="admin-btn" disabled={previewPending}>
            Önizle
          </button>
        </form>
        <ActionMessage state={preview} />
        {preview.companyName ? (
          <div className="admin-preview-meta">
            <p><span>KAYNAK</span> {preview.sourceOfTruth === "code" ? "CODE" : "DATABASE"}</p>
            <p><span>COPY</span> {preview.copyKind ?? "—"}</p>
            <p><span>ALICI</span> {preview.recipient || "—"}</p>
            <p><span>FİRMA</span> {preview.companyName}</p>
            <p><span>KONU</span> {preview.subject}</p>
            <p><span>PREHEADER</span> {preview.preheader || "—"}</p>
            <p><span>CTA</span> {preview.ctaLabel || "—"}</p>
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
            {preview.droppedIssues?.length ? (
              <p className="admin-warning">
                Claim-safety tarafından çıkarıldı: {preview.droppedIssues.join(" · ")}
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
          <button className="admin-btn ghost">Test taslağı (gönderilmez, outreach değişmez)</button>
        </form>
        {isRestaurantPremiumTemplate(template) ? (
          <form action={resetRestaurantTemplateForm}>
            <input type="hidden" name="templateId" value={template.id} />
            <button className="admin-btn ghost">Kod kaynağına sıfırla</button>
          </form>
        ) : null}
        {isBarPremiumTemplate(template) ? (
          <form action={resetBarTemplateForm}>
            <input type="hidden" name="templateId" value={template.id} />
            <button className="admin-btn ghost">Kod kaynağına sıfırla</button>
          </form>
        ) : null}
        {isPremiumIndustryKind(resolvePremiumEmailKind(template)) ? (
          <form action={resetIndustryTemplateForm}>
            <input type="hidden" name="templateId" value={template.id} />
            <button className="admin-btn ghost">Kod kaynağına sıfırla</button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
