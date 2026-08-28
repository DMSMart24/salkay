"use client";

import { useActionState, useState } from "react";
import { composeEmailAction } from "@/app/admin/actions/comms";
import { ActionMessage } from "@/components/admin/ActionMessage";
import { mergeTemplate } from "@/lib/admin/merge";
import type { FormState } from "@/lib/admin/validation";

type TemplateOption = {
  id: string;
  name: string;
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
  contacts: ContactOption[];
  templates: TemplateOption[];
};

export function ComposeEmail({
  companyId,
  companyName,
  website,
  city,
  industry,
  contacts,
  templates,
}: ComposeEmailProps) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    composeEmailAction,
    {},
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [to, setTo] = useState(contacts.find((row) => row.email)?.email ?? "");
  const primary = contacts[0];

  function applyTemplate(id: string) {
    const template = templates.find((row) => row.id === id);
    if (!template) return;
    const vars = {
      companyName,
      firstName: primary?.firstName,
      website: website ?? undefined,
      city: city ?? undefined,
      industry: industry ?? undefined,
    };
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
                  defaultValue=""
                  onChange={(event) => applyTemplate(event.target.value)}
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
              <div className="admin-actions">
                <button name="intent" value="send" className="admin-btn" disabled={pending}>
                  Send
                </button>
                <button name="intent" value="draft" className="admin-btn ghost" disabled={pending}>
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
