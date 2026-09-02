"use client";

import { useSearchParams } from "next/navigation";
import { publicWhatsAppHref } from "@/lib/contact/whatsapp";

const WHATSAPP_LABEL = "SALKAY ile WhatsApp üzerinden iletişime geçin";

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.43 2.15 11.89c0 1.96.52 3.87 1.5 5.56L2 22l4.69-1.61a9.86 9.86 0 0 0 5.35 1.56h.01c5.46 0 9.89-4.43 9.89-9.89C21.94 6.43 17.51 2 12.04 2Zm5.76 13.98c-.24.67-1.4 1.28-1.94 1.36-.5.08-1.13.11-1.82-.11-.42-.14-.96-.31-1.66-.61-2.92-1.26-4.82-4.21-4.97-4.4-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.26-.29.57-.36.76-.36h.55c.18 0 .41-.07.64.49.24.58.81 2 .88 2.14.07.15.12.32.02.51-.1.2-.15.32-.3.49-.14.17-.3.38-.43.51-.14.14-.29.29-.12.56.17.27.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.45.29.14.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.14.27.1 1.71.81 2 .95.29.15.49.22.56.34.07.12.07.71-.17 1.38Z"
      />
    </svg>
  );
}

function FloatingWhatsAppLink({ href }: { href: string }) {
  return (
    <a
      className="sl-wa"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={WHATSAPP_LABEL}
    >
      <span className="sl-wa-icon" aria-hidden>
        <WhatsAppMark />
        <i className="sl-wa-dot" />
      </span>
      <span className="sl-wa-label">WhatsApp</span>
    </a>
  );
}

export function FloatingWhatsApp() {
  const searchParams = useSearchParams();

  return <FloatingWhatsAppLink href={publicWhatsAppHref(searchParams.get("package"))} />;
}

export function FloatingWhatsAppFallback() {
  return <FloatingWhatsAppLink href={publicWhatsAppHref()} />;
}
