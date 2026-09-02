"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { resolveContactPackageSurface } from "@/lib/contact/package-surface";
import { siteWhatsAppUrl } from "@/lib/site";

type InquiryFormProps = {
  compact?: boolean;
  tone?: "on-dark" | "on-light";
  variant?: "default" | "studio";
  packageSlug?: string;
};

type FormStatus = "idle" | "loading" | "success" | "error";

const fieldClass =
  "min-h-12 rounded-xl border border-line bg-surface px-4 text-fg placeholder:text-faint";

const lightFieldClass =
  "min-h-12 rounded-xl border border-[color:var(--sl-border-light)] bg-white px-4 text-[#0A0E1B] placeholder:text-[#64748B]";

export function InquiryForm({
  compact = false,
  tone = "on-dark",
  variant = "default",
  packageSlug,
}: InquiryFormProps) {
  const studio = variant === "studio";
  const fields = tone === "on-light" ? lightFieldClass : fieldClass;
  const { form, messageHint, submitNote } = getDictionary().contactPage;
  const selectedPackage = resolveContactPackageSurface(packageSlug);
  const [status, setStatus] = useState<FormStatus>("idle");
  const submittingRef = useRef(false);
  const messagePrefix = selectedPackage
    ? `İlgilendiğim paket: ${selectedPackage.displayName}`
    : "";

  useEffect(() => {
    if (!packageSlug) {
      return;
    }

    document.getElementById("sl-contact-selected")?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [packageSlug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) {
      return;
    }

    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const rawMessage = String(data.get("message") ?? "");
    const message =
      selectedPackage && !rawMessage.includes(messagePrefix)
        ? `${messagePrefix}\n\n${rawMessage}`
        : rawMessage;
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
          package: selectedPackage?.slug ?? "",
          message,
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
    <FormStatusMessage
      status={status}
      studio={studio}
      tone={tone}
      form={form}
      packageName={selectedPackage?.displayName}
    />
  );

  if (studio) {
    return (
      <form onSubmit={handleSubmit} className="sl-contact-form" noValidate={false}>
        <Honeypot />
        {selectedPackage ? (
          <input type="hidden" name="package" value={selectedPackage.slug} />
        ) : null}
        <div className="sl-contact-fields">
          <StudioField label={form.name} name="name" required />
          <StudioField label={form.email} name="email" type="email" required />
          <StudioField label={form.company} name="company" />
          <StudioField label={form.phone} name="phone" type="tel" />
        </div>

        <label className="sl-contact-field sl-contact-field-full">
          <span className="sl-contact-label">{form.service}</span>
          <select
            name="service"
            defaultValue={selectedPackage?.service ?? ""}
            className="sl-contact-input"
          >
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
          <textarea
            name="message"
            required
            rows={7}
            defaultValue={selectedPackage?.messagePrefill ?? ""}
            className="sl-contact-input sl-contact-area"
          />
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
      {selectedPackage ? (
        <input type="hidden" name="package" value={selectedPackage.slug} />
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={form.name} name="name" required tone={tone} inputClass={fields} />
        <Field label={form.email} name="email" type="email" required tone={tone} inputClass={fields} />
        <Field label={form.company} name="company" tone={tone} inputClass={fields} />
        {compact ? null : (
          <Field label={form.phone} name="phone" type="tel" tone={tone} inputClass={fields} />
        )}
      </div>

      <label className="grid gap-2">
        <span className={cn("text-sm", tone === "on-light" ? "text-[#64748B]" : "text-muted")}>
          {form.service}
        </span>
        <select name="service" defaultValue={selectedPackage?.service ?? ""} className={fields}>
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
        <span className={cn("text-sm", tone === "on-light" ? "text-[#64748B]" : "text-muted")}>
          {form.message} <span className={tone === "on-light" ? "text-[#64748B]" : "text-faint"}>*</span>
        </span>
        <textarea
          name="message"
          required
          rows={6}
          defaultValue={selectedPackage?.messagePrefill ?? ""}
          className={`${fields} py-3`}
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        aria-busy={busy}
        className={cn(
          "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[0.95rem] font-medium",
          "transition-colors disabled:cursor-not-allowed disabled:opacity-70",
          "bg-blue text-fg hover:bg-salkay-bright",
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
  packageName,
}: {
  status: FormStatus;
  studio: boolean;
  tone: "on-dark" | "on-light";
  form: ReturnType<typeof getDictionary>["contactPage"]["form"];
  packageName?: string;
}) {
  if (status === "idle" || status === "loading") {
    return null;
  }

  const className = studio
    ? cn("sl-contact-status", status === "success" && "is-ok", status === "error" && "is-err")
    : cn(
        "text-sm leading-6",
        tone === "on-light" ? "text-[#64748B]" : "text-muted",
      );

  if (status === "success") {
    return (
      <p role="status" className={className}>
        {packageName ? (
          <>
            <strong>Talebiniz alındı.</strong> Projenizi inceleyip sizinle en kısa sürede
            iletişime geçeceğiz.
            <span className="sl-contact-status-package">Seçilen paket: {packageName}</span>
          </>
        ) : (
          <>
            <strong>{form.successTitle}</strong> {form.successBody}
          </>
        )}
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
        className={cn("text-sm", tone === "on-light" ? "text-[#64748B]" : "text-muted")}
      >
        {label}
        {required ? (
          <span className={tone === "on-light" ? "text-[#64748B]" : "text-faint"}>
            {" "}
            *
          </span>
        ) : null}
      </span>
      <input name={name} type={type} required={required} className={inputClass} />
    </label>
  );
}
