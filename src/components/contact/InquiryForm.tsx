"use client";

import { useState, type FormEvent } from "react";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";

type InquiryFormProps = {
  compact?: boolean;
};

const fieldClass =
  "min-h-12 rounded-xl border border-line bg-surface px-4 text-fg placeholder:text-faint";

export function InquiryForm({ compact = false }: InquiryFormProps) {
  const { form } = getDictionary().contactPage;
  const [status, setStatus] = useState<"idle" | "unwired">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("unwired");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={form.name} name="name" required />
        <Field label={form.email} name="email" type="email" required />
        <Field label={form.company} name="company" />
        {compact ? null : <Field label={form.phone} name="phone" type="tel" />}
      </div>

      <label className="grid gap-2">
        <span className="text-sm text-muted">{form.service}</span>
        <select name="service" defaultValue="" className={fieldClass}>
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
        <span className="text-sm text-muted">
          {form.message} <span className="text-faint">*</span>
        </span>
        <textarea name="message" required rows={6} className={`${fieldClass} py-3`} />
      </label>

      <button
        type="submit"
        className={cn(
          "inline-flex min-h-12 items-center justify-center rounded-full bg-blue px-6 text-[0.95rem] font-medium text-fg",
          "transition-colors hover:bg-salkay-bright",
        )}
      >
        {form.submit}
      </button>

      {status === "unwired" ? (
        <p role="status" className="text-sm leading-6 text-muted">
          {form.unwired}
        </p>
      ) : null}
    </form>
  );
}

function Field({
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
    <label className="grid gap-2">
      <span className="text-sm text-muted">
        {label}
        {required ? <span className="text-faint"> *</span> : null}
      </span>
      <input name={name} type={type} required={required} className={fieldClass} />
    </label>
  );
}
