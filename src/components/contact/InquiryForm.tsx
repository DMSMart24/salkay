"use client";

import { useRef, useState, type FormEvent } from "react";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { siteWhatsAppUrl } from "@/lib/site";

type InquiryFormProps = {
  compact?: boolean;
  tone?: "on-dark" | "on-light";
  variant?: "default" | "studio";
};

type FormStatus = "idle" | "loading" | "success" | "error";

const fieldClass =
  "min-h-12 rounded-xl border border-line bg-surface px-4 text-fg placeholder:text-faint";

const lightFieldClass =
  "min-h-12 rounded-xl border border-[rgba(10,16,32,0.12)] bg-white px-4 text-[#0A1020] placeholder:text-[#596579]";

export function InquiryForm({
  compact = false,
  tone = "on-dark",
  variant = "default",
}: InquiryFormProps) {
  const studio = variant === "studio";
  const fields = tone === "on-light" ? lightFieldClass : fieldClass;
  const { form, messageHint, submitNote } = getDictionary().contactPage;
  const [status, setStatus] = useState<FormStatus>("idle");
  const submittingRef = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) {
      return;
    }

    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    submittingRef.current = true;
    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          company: String(data.get("company") ?? ""),
          phone: String(data.get("phone") ?? ""),
          service: String(data.get("service") ?? ""),
          message: String(data.get("message") ?? ""),
          website: String(data.get("website") ?? ""),
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      formElement.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  const busy = status === "loading";

  const statusNode = (
    <FormStatusMessage status={status} studio={studio} tone={tone} form={form} />
  );

  if (studio) {
    return (
      <form onSubmit={handleSubmit} className="sl-contact-form" noValidate={false}>
        <Honeypot />
        <div className="sl-contact-fields">
          <StudioField label={form.name} name="name" required />
          <StudioField label={form.email} name="email" type="email" required />
          <StudioField label={form.company} name="company" />
          <StudioField label={form.phone} name="phone" type="tel" />
        </div>

        <label className="sl-contact-field sl-contact-field-full">
          <span className="sl-contact-label">{form.service}</span>
          <select name="service" defaultValue="" className="sl-contact-input">
            <option value="" disabled>
              {form.servicePlaceholder}
            </option>
            {form.services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </label>

        <label className="sl-contact-field sl-contact-field-full">
          <span className="sl-contact-label">
            {form.message} <i>*</i>
          </span>
          <textarea name="message" required rows={7} className="sl-contact-input sl-contact-area" />
          <small className="sl-contact-hint">{messageHint}</small>
        </label>

        <div className="sl-contact-actions">
          <button type="submit" className="sl-contact-submit" disabled={busy} aria-busy={busy}>
            {busy ? form.sending : form.submit}
            {busy ? null : <i aria-hidden>→</i>}
          </button>
          <p className="sl-contact-note">{submitNote}</p>
        </div>

        {statusNode}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate={false}>
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={form.name} name="name" required tone={tone} inputClass={fields} />
        <Field label={form.email} name="email" type="email" required tone={tone} inputClass={fields} />
        <Field label={form.company} name="company" tone={tone} inputClass={fields} />
        {compact ? null : (
          <Field label={form.phone} name="phone" type="tel" tone={tone} inputClass={fields} />
        )}
      </div>

      <label className="grid gap-2">
        <span className={cn("text-sm", tone === "on-light" ? "text-[#596579]" : "text-muted")}>
          {form.service}
        </span>
        <select name="service" defaultValue="" className={fields}>
          <option value="" disabled>
            {form.servicePlaceholder}
          </option>
          {form.services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className={cn("text-sm", tone === "on-light" ? "text-[#596579]" : "text-muted")}>
          {form.message} <span className={tone === "on-light" ? "text-[#596579]" : "text-faint"}>*</span>
        </span>
        <textarea name="message" required rows={6} className={`${fields} py-3`} />
      </label>

      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className={cn(
          "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[0.95rem] font-medium",
          "transition-colors disabled:cursor-not-allowed disabled:opacity-70",
          tone === "on-light"
            ? "bg-[#246BFD] text-white hover:bg-[#1557E8]"
            : "bg-blue text-fg hover:bg-salkay-bright",
        )}
      >
        {busy ? form.sending : form.submit}
      </button>

      {statusNode}
    </form>
  );
}

function FormStatusMessage({
  status,
  studio,
  tone,
  form,
}: {
  status: FormStatus;
  studio: boolean;
  tone: "on-dark" | "on-light";
  form: ReturnType<typeof getDictionary>["contactPage"]["form"];
}) {
  if (status === "idle" || status === "loading") {
    return null;
  }

  const className = studio
    ? cn("sl-contact-status", status === "success" && "is-ok", status === "error" && "is-err")
    : cn(
        "text-sm leading-6",
        tone === "on-light" ? "text-[#596579]" : "text-muted",
      );

  if (status === "success") {
    return (
      <p role="status" className={className}>
        <strong>{form.successTitle}</strong> {form.successBody}
      </p>
    );
  }

  return (
    <p role="alert" className={className}>
      <strong>{form.errorTitle}</strong> {form.errorBody}{" "}
      <a href={siteWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
        {form.errorWhatsApp}
      </a>
    </p>
  );
}

function Honeypot() {
  return (
    <div className="sl-contact-honey" aria-hidden="true">
      <label>
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function StudioField({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="sl-contact-field">
      <span className="sl-contact-label">
        {label}
        {required ? <i> *</i> : null}
      </span>
      <input name={name} type={type} required={required} className="sl-contact-input" />
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  tone = "on-dark",
  inputClass,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  tone?: "on-dark" | "on-light";
  inputClass: string;
}) {
  return (
    <label className="grid gap-2">
      <span
        className={cn("text-sm", tone === "on-light" ? "text-[#596579]" : "text-muted")}
      >
        {label}
        {required ? (
          <span className={tone === "on-light" ? "text-[#596579]" : "text-faint"}>
            {" "}
            *
          </span>
        ) : null}
      </span>
      <input name={name} type={type} required={required} className={inputClass} />
    </label>
  );
}
