"use client";

import { useState, type FormEvent } from "react";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";

type InquiryFormProps = {
  compact?: boolean;
  tone?: "on-dark" | "on-light";
};

const fieldClass =
  "min-h-12 rounded-xl border border-line bg-surface px-4 text-fg placeholder:text-faint";

const lightFieldClass =
  "min-h-12 rounded-xl border border-[rgba(10,16,32,0.12)] bg-white px-4 text-[#0A1020] placeholder:text-[#596579]";

export function InquiryForm({
  compact = false,
  tone = "on-dark",
}: InquiryFormProps) {
  const fields = tone === "on-light" ? lightFieldClass : fieldClass;
  const { form } = getDictionary().contactPage;
  const [status, setStatus] = useState<"idle" | "unwired">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("unwired");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate={false}>
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
        className={cn(
          "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[0.95rem] font-medium",
          "transition-colors",
          tone === "on-light"
            ? "bg-[#246BFD] text-white hover:bg-[#1557E8]"
            : "bg-blue text-fg hover:bg-salkay-bright",
        )}
      >
        {form.submit}
      </button>

      {status === "unwired" ? (
        <p
          role="status"
          className={cn(
            "text-sm leading-6",
            tone === "on-light" ? "text-[#596579]" : "text-muted",
          )}
        >
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
