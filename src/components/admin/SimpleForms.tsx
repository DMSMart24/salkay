"use client";

import { useActionState } from "react";
import {
  addContactAction,
  addNoteAction,
} from "@/app/admin/actions/crm";
import { addSuppressionRecordAction } from "@/app/admin/actions/outreach";
import {
  createCampaignAction,
  createTaskAction,
  createTemplateAction,
} from "@/app/admin/actions/comms";
import { suppressionLabels } from "@/lib/admin/labels";
import { ActionMessage } from "@/components/admin/ActionMessage";
import { companyStatusLabels, taskTypeLabels, templateCategories } from "@/lib/admin/labels";
import { MERGE_KEYS } from "@/lib/admin/merge";
import type { FormState } from "@/lib/admin/validation";

export function LoginFields({
  action,
  state,
  pending,
}: {
  action: (payload: FormData) => void;
  state?: FormState;
  pending: boolean;
}) {
  return (
    <form action={action} className="admin-form">
      <ActionMessage state={state} />
      <label>
        E-posta
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Şifre
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="admin-btn" disabled={pending}>
        Giriş
      </button>
    </form>
  );
}

export function NoteForm({ companyId }: { companyId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addNoteAction, {});
  return (
    <form id="note" action={action} className="admin-form">
      <input type="hidden" name="companyId" value={companyId} />
      <ActionMessage state={state} />
      <label>
        Not
        <textarea name="body" rows={3} required />
      </label>
      <button className="admin-btn" disabled={pending}>
        Not ekle
      </button>
    </form>
  );
}

export function ContactForm({ companyId }: { companyId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addContactAction, {});
  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="companyId" value={companyId} />
      <ActionMessage state={state} />
      <div className="admin-grid-2">
        <label>
          Ad
          <input name="firstName" required />
        </label>
        <label>
          Soyad
          <input name="lastName" required />
        </label>
        <label>
          Rol
          <input name="role" />
        </label>
        <label>
          E-posta
          <input name="email" type="email" />
        </label>
        <label>
          Telefon
          <input name="phone" />
        </label>
        <label>
          LinkedIn
          <input name="linkedin" />
        </label>
      </div>
      <label className="admin-check">
        <input type="checkbox" name="isPrimary" />
        Birincil kişi
      </label>
      <button className="admin-btn" disabled={pending}>
        Kişi ekle
      </button>
    </form>
  );
}

export function TaskForm({ companyId }: { companyId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createTaskAction, {});
  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="companyId" value={companyId} />
      <ActionMessage state={state} />
      <label>
        Başlık
        <input name="title" required />
      </label>
      <div className="admin-grid-2">
        <label>
          Tür
          <select name="type" defaultValue="FOLLOW_UP">
            {Object.entries(taskTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tarih
          <input name="dueAt" type="datetime-local" required />
        </label>
      </div>
      <label>
        Not
        <textarea name="notes" rows={2} />
      </label>
      <button className="admin-btn" disabled={pending}>
        Takip planla
      </button>
    </form>
  );
}

export function TemplateForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createTemplateAction,
    {},
  );
  return (
    <form action={action} className="admin-form">
      <ActionMessage state={state} />
      <div className="admin-grid-2">
        <label>
          Ad
          <input name="name" required />
        </label>
        <label>
          Kategori
          <select name="category" defaultValue="GENERAL">
            {templateCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dil
          <input name="language" defaultValue="tr" />
        </label>
        <label>
          Konu
          <input name="subject" required />
        </label>
      </div>
      <label>
        İçerik
        <textarea name="body" rows={6} required placeholder="Merhaba {{firstName}}, {{companyName}} için..." />
      </label>
      <p className="admin-help">
        Değişkenler: {MERGE_KEYS.map((key) => `{{${key}}}`).join(" ")}
      </p>
      <button className="admin-btn" disabled={pending}>
        Şablon kaydet
      </button>
    </form>
  );
}

export function CampaignForm({
  templates,
}: {
  templates: Array<{ id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createCampaignAction,
    {},
  );
  return (
    <form action={action} className="admin-form">
      <ActionMessage state={state} />
      <label>
        Ad
        <input name="name" required />
      </label>
      <label>
        Açıklama
        <textarea name="description" rows={2} />
      </label>
      <div className="admin-grid-2">
        <label>
          Şablon
          <select name="templateId" defaultValue="">
            <option value="">Yok</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Durum filtresi
          <select name="statusFilter" defaultValue="">
            <option value="">Tümü (DNC hariç)</option>
            {Object.entries(companyStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sektör
          <input name="industry" />
        </label>
        <label>
          Şehir
          <input name="city" />
        </label>
      </div>
      <p className="admin-help">
        V1 yalnızca DRAFT oluşturur. Toplu gönderim kapalıdır; DNC / suppression listesi sunucuda elenir.
      </p>
      <button className="admin-btn" disabled={pending}>
        Taslak kampanya
      </button>
    </form>
  );
}

export function SuppressionForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    addSuppressionRecordAction,
    {},
  );
  return (
    <form action={action} className="admin-form">
      <ActionMessage state={state} />
      <div className="admin-grid-2">
        <label>
          E-posta
          <input name="email" type="email" />
        </label>
        <label>
          Domain
          <input name="domain" placeholder="ornek.com" />
        </label>
        <label>
          Neden
          <select name="reason" defaultValue="MANUAL">
            {Object.entries(suppressionLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kaynak
          <select name="source" defaultValue="manual">
            <option value="manual">Manual</option>
            <option value="unsubscribe">Unsubscribe</option>
            <option value="bounce">Bounce</option>
            <option value="invalid">Invalid</option>
            <option value="do-not-contact">Do Not Contact</option>
          </select>
        </label>
      </div>
      <label>
        Not
        <input name="notes" />
      </label>
      <button className="admin-btn" disabled={pending}>
        Sperrlistesine ekle
      </button>
    </form>
  );
}
