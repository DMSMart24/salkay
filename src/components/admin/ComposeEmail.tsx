"use client";

import { useActionState, useMemo, useState } from "react";
import { composeEmailAction, sendTestEmailAction } from "@/app/admin/actions/comms";
import { ActionMessage } from "@/components/admin/ActionMessage";
import { isArchitectureCompany } from "@/lib/admin/email/templates/architecture";
import { isAutomotiveCompany } from "@/lib/admin/email/templates/automotive";
import {
  BAR_TEMPLATE_NAME,
  isBarCompany,
  isBarPremiumTemplate,
} from "@/lib/admin/email/templates/bar";
import { isConstructionCompany } from "@/lib/admin/email/templates/construction";
import { isHotelCompany } from "@/lib/admin/email/templates/hotel";
import { industrySpec } from "@/lib/admin/email/templates/premium-industry";
import {
  isCodeBackedPremiumKind,
  resolvePremiumEmailKind,
  type PremiumIndustryKind,
} from "@/lib/admin/email/templates/premium-kind";
import { composePlaceholderForKind, premiumSubject } from "@/lib/admin/email/templates/premium-source";
import { isRealEstateCompany } from "@/lib/admin/email/templates/real-estate";
import {
  isRestaurantCompany,
  isRestaurantPremiumTemplate,
  RESTAURANT_TEMPLATE_NAME,
} from "@/lib/admin/email/templates/restaurant";
import { mergeTemplate } from "@/lib/admin/merge";
import type { FormState } from "@/lib/admin/validation";

type TemplateOption = {
  id: string;
  name: string;
  category?: string | null;
  subject: string;
  body: string;
};

type ContactOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

type ComposeEmailProps = {
  companyId: string;
  companyName: string;
  website?: string | null;
  city?: string | null;
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  contacts: ContactOption[];
  templates: TemplateOption[];
  outreachSendEnabled?: boolean;
};

export function ComposeEmail({
  companyId,
  companyName,
  website,
  city,
  industry,
  groupName,
  groupIndustry,
  contacts,
  templates,
  outreachSendEnabled = false,
}: ComposeEmailProps) {
  const companyInput = { industry, groupName, groupIndustry };
  const barCompany = isBarCompany(companyInput);
  const restaurantCompany = isRestaurantCompany(companyInput);
  const industryCompanyKind: PremiumIndustryKind | null = isConstructionCompany(companyInput)
    ? "construction"
    : isArchitectureCompany(companyInput)
      ? "architecture"
      : isRealEstateCompany(companyInput)
        ? "realEstate"
        : isHotelCompany(companyInput)
          ? "hotel"
          : isAutomotiveCompany(companyInput)
            ? "automotive"
            : null;
  const barTemplate = useMemo(
    () =>
      templates.find((row) => row.name === BAR_TEMPLATE_NAME) ??
      templates.find((row) => isBarPremiumTemplate(row)),
    [templates],
  );
  const restaurantTemplate = useMemo(
    () =>
      templates.find((row) => row.name === RESTAURANT_TEMPLATE_NAME) ??
      templates.find((row) => isRestaurantPremiumTemplate(row)),
    [templates],
  );
  const industryTemplate = useMemo(() => {
    if (!industryCompanyKind) return undefined;
    const spec = industrySpec(industryCompanyKind);
    return (
      templates.find((row) => row.name === spec.templateName) ??
      templates.find((row) => resolvePremiumEmailKind(row) === industryCompanyKind)
    );
  }, [industryCompanyKind, templates]);
  const initialTemplateId = barCompany
    ? barTemplate?.id ?? ""
    : restaurantCompany
      ? restaurantTemplate?.id ?? ""
      : industryTemplate?.id ?? "";

  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(composeEmailAction, {});
  const [testState, testAction, testPending] = useActionState<FormState, FormData>(
    sendTestEmailAction,
    {},
  );
  const primary = contacts[0];
  const prefill = useMemo(() => {
    const template = templates.find((row) => row.id === initialTemplateId);
    const vars = {
      companyName,
      firstName: primary?.firstName,
      website: website ?? undefined,
      city: city ?? undefined,
      industry: industry ?? undefined,
    };
    const kind = template ? resolvePremiumEmailKind(template) : "custom";
    if (template && isCodeBackedPremiumKind(kind)) {
      return {
        subject: mergeTemplate(premiumSubject(kind), vars),
        body: composePlaceholderForKind(kind),
      };
    }
    if (!template) return { subject: "", body: "" };
    return {
      subject: mergeTemplate(template.subject, vars),
      body: mergeTemplate(template.body, vars),
    };
  }, [companyName, industry, initialTemplateId, primary?.firstName, templates, website, city]);

  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [subject, setSubject] = useState(prefill.subject);
  const [body, setBody] = useState(prefill.body);
  const [to, setTo] = useState(contacts.find((row) => row.email)?.email ?? "");
  const [testEmail, setTestEmail] = useState("");

  function applyTemplate(id: string) {
    const template = templates.find((row) => row.id === id);
    if (!template) {
      setSubject("");
      setBody("");
      return;
    }
    const vars = {
      companyName,
      firstName: primary?.firstName,
      website: website ?? undefined,
      city: city ?? undefined,
      industry: industry ?? undefined,
    };
    const kind = resolvePremiumEmailKind(template);
    if (isCodeBackedPremiumKind(kind)) {
      setSubject(mergeTemplate(premiumSubject(kind), vars));
      setBody(composePlaceholderForKind(kind));
      return;
    }
    setSubject(mergeTemplate(template.subject, vars));
    setBody(mergeTemplate(template.body, vars));
  }

  return (
    <>
      <button type="button" className="admin-btn" onClick={() => setOpen(true)}>
        E-posta Gönder
      </button>
      {open ? (
        <div className="admin-modal" role="dialog" aria-labelledby="compose-title">
          <div className="admin-modal-card">
            <div className="admin-modal-head">
              <div>
                <p className="admin-kicker">E-posta</p>
                <h2 id="compose-title">{companyName}</h2>
              </div>
              <button type="button" className="admin-btn ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
            <p className="admin-help">
              Gönderim yalnızca açık bir tıklama ile olur. Sağlayıcı yoksa taslak kaydedebilirsiniz.
            </p>
            <ActionMessage state={state} />
            <form action={action} className="admin-form">
              <input type="hidden" name="companyId" value={companyId} />
              <label>
                Kişi
                <select
                  name="contactId"
                  defaultValue={primary?.id ?? ""}
                  onChange={(event) => {
                    const contact = contacts.find((row) => row.id === event.target.value);
                    if (contact?.email) setTo(contact.email);
                  }}
                >
                  <option value="">Seçilmedi</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                      {contact.email ? ` · ${contact.email}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                To
                <input name="to" type="email" required value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              <label>
                CC
                <input name="cc" type="text" placeholder="opsiyonel, virgülle" />
              </label>
              <label>
                Template
                <select
                  name="templateId"
                  value={templateId}
                  onChange={(event) => {
                    setTemplateId(event.target.value);
                    applyTemplate(event.target.value);
                  }}
                >
                  <option value="">Şablon yok</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Subject
                <input
                  name="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </label>
              <label>
                Body
                <textarea
                  name="body"
                  rows={8}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </label>
              {!outreachSendEnabled ? (
                <p className="admin-help">
                  Gerçek gönderim kapalı (OUTREACH_SEND_ENABLED). Firma alıcısına e-posta gitmez.
                </p>
              ) : null}
              <div className="admin-actions">
                <button
                  name="intent"
                  value="send"
                  className="admin-btn"
                  disabled={pending || !outreachSendEnabled}
                >
                  Send
                </button>
                <button name="intent" value="draft" className="admin-btn ghost" disabled={pending}>
                  Save Draft
                </button>
              </div>
            </form>

            <form action={testAction} className="admin-form admin-test-block">
              <input type="hidden" name="companyId" value={companyId} />
              <input type="hidden" name="templateId" value={templateId} />
              <p className="admin-kicker">TEST E-POSTASI</p>
              <ActionMessage state={testState} />
              <label>
                Test e-posta adresi
                <input
                  name="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                  placeholder="ornek@adres.com"
                />
              </label>
              <p className="admin-help">
                Bu test yalnızca aşağıdaki adrese gönderilir. Firma alıcısına e-posta gönderilmez.
              </p>
              <div className="admin-actions">
                <button className="admin-btn" disabled={testPending || !templateId}>
                  Test E-postası Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
