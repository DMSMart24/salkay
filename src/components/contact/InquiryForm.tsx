"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Layers,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { resolveContactPackageSurface } from "@/lib/contact/package-surface";
import { buttonMotion } from "@/lib/motion";
import { siteWhatsAppUrl } from "@/lib/site";

type InquiryFormProps = {
  compact?: boolean;
  tone?: "on-dark" | "on-light";
  variant?: "default" | "studio";
  packageSlug?: string;
};

type FormStatus = "idle" | "loading" | "success" | "error";

export function InquiryForm({
  compact = false,
  tone = "on-dark",
  variant = "default",
  packageSlug,
}: InquiryFormProps) {
  const studio = variant === "studio";
  const { form, messageHint, submitNote } = getDictionary().contactPage;
  const selectedPackage = resolveContactPackageSurface(packageSlug);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [formKey, setFormKey] = useState(0);
  const submittingRef = useRef(false);
  const reduce = useReducedMotion();
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
      setFormKey((current) => current + 1);
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

  return (
    <form
      onSubmit={handleSubmit}
      key={formKey}
      className={studio ? "sl-contact-form" : "grid gap-6"}
      noValidate={false}
    >
      <Honeypot />
      {selectedPackage ? (
        <input type="hidden" name="package" value={selectedPackage.slug} />
      ) : null}
      <div className={studio ? "sl-contact-fields" : "grid min-w-0 gap-6 min-[720px]:grid-cols-2"}>
        <FloatingField icon={User} label={form.name} name="name" required />
        <FloatingField icon={Mail} label={form.email} name="email" type="email" required />
        <FloatingField icon={Building2} label={form.company} name="company" />
        {compact ? null : (
          <FloatingField icon={Phone} label={form.phone} name="phone" type="tel" />
        )}
      </div>

      <FloatingField
        icon={Layers}
        label={form.service}
        name="service"
        as="select"
        defaultValue={selectedPackage?.service ?? ""}
      >
        <option value="" disabled>
          {form.servicePlaceholder}
        </option>
        {form.services.map((service) => (
          <option key={service} value={service}>
            {service}
          </option>
        ))}
      </FloatingField>

      <FloatingField
        icon={MessageSquare}
        label={`${form.message} *`}
        name="message"
        as="textarea"
        required
        rows={7}
        defaultValue={selectedPackage?.messagePrefill ?? ""}
      />
      {studio ? <small className="sl-contact-hint">{messageHint}</small> : null}

      <div className={studio ? "sl-contact-actions" : "grid gap-3"}>
        <motion.button
          type="submit"
          className={studio ? "sl-contact-submit apple-btn" : "apple-btn w-full"}
          disabled={busy}
          aria-busy={busy}
          {...(reduce ? {} : buttonMotion)}
        >
          {busy ? form.sending : form.submit}
          {busy ? null : <ArrowRight size={16} strokeWidth={1.5} aria-hidden />}
        </motion.button>
        {studio ? <p className="sl-contact-note">{submitNote}</p> : null}
      </div>

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
    : cn("text-sm leading-6", tone === "on-light" ? "text-[#64748B]" : "text-muted");

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

function FloatingField({
  icon: Icon,
  label,
  name,
  type = "text",
  required = false,
  as = "input",
  rows,
  defaultValue,
  children,
}: {
  icon: LucideIcon;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  as?: "input" | "textarea" | "select";
  rows?: number;
  defaultValue?: string;
  children?: ReactNode;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const active = value.trim().length > 0;

  const shared = {
    name,
    required,
    className: cn("apple-field-control", as === "textarea" && "apple-field-area"),
    value,
    onChange: (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setValue(event.target.value);
    },
  };

  return (
    <div className={cn("apple-field", active && "is-active")}>
      <Icon className="apple-field-icon" size={16} strokeWidth={1.5} aria-hidden />
      <label className="apple-field-label" htmlFor={`apple-${name}`}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea id={`apple-${name}`} rows={rows ?? 6} {...shared} />
      ) : as === "select" ? (
        <select id={`apple-${name}`} {...shared}>
          {children}
        </select>
      ) : (
        <input id={`apple-${name}`} type={type} {...shared} />
      )}
    </div>
  );
}
