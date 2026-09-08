"use client";

import { useState } from "react";

export function CopyTextButton({
  text,
  label = "Copy Email",
  className = "admin-btn ghost",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const field = document.createElement("textarea");
          field.value = text;
          field.setAttribute("readonly", "");
          field.style.position = "fixed";
          field.style.left = "-9999px";
          document.body.appendChild(field);
          field.select();
          document.execCommand("copy");
          document.body.removeChild(field);
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "Kopyalandı" : label}
    </button>
  );
}
