import { site } from "@/lib/site";
import { resolveContactPackage } from "@/lib/contact/packages";
import type { ContactInquiry } from "@/lib/contact/schema";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function line(label: string, value: string | undefined) {
  return `${label}: ${value?.trim() || "—"}`;
}

export function buildContactEmail(inquiry: ContactInquiry) {
  const selected = resolveContactPackage(inquiry.package);
  const rows: Array<[string, string | undefined]> = [
    ...(selected ? ([["Paket", selected.displayName]] as Array<[string, string]>) : []),
    ["Ad Soyad", inquiry.name],
    ["E-posta", inquiry.email],
    ["Şirket", inquiry.company],
    ["Telefon", inquiry.phone],
    ["Proje Türü", inquiry.service],
    ["Mesaj", inquiry.message],
  ];

  const text = [
    "Yeni proje talebi",
    "",
    ...rows.map(([label, value]) => line(label, value)),
  ].join("\n");

  const htmlRows = rows
    .map(([label, value]) => {
      const safe = escapeHtml(value?.trim() || "—").replaceAll("\n", "<br />");
      return `<tr><th align="left" style="padding:6px 12px 6px 0;color:#6d7d92;font-weight:500;">${escapeHtml(label)}</th><td style="padding:6px 0;color:#0a1020;white-space:pre-wrap;">${safe}</td></tr>`;
    })
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f6fa;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4eaf2;border-radius:12px;padding:24px;">
    <tr><td style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#246bfd;">SALKAY</td></tr>
    <tr><td style="padding:12px 0 18px;font-size:20px;color:#0a1020;">Yeni proje talebi</td></tr>
    <tr><td><table cellpadding="0" cellspacing="0">${htmlRows}</table></td></tr>
  </table>
</body></html>`;

  return {
    to: site.email,
    subject: `Yeni proje talebi — ${inquiry.name}`,
    text,
    html,
    replyTo: inquiry.email,
  };
}

export async function sendContactInquiry(inquiry: ContactInquiry) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return { ok: false as const, configured: false };
  }

  const email = buildContactEmail(inquiry);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email.to],
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  });

  if (!response.ok) {
    return { ok: false as const, configured: true };
  }

  return { ok: true as const, configured: true };
}
