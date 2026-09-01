export const OUTREACH_FROM_DISPLAY_NAME = "SALKAY · Web Tasarım & Dijital Büyüme";

export function extractEmailAddress(from: string) {
  const trimmed = from.trim();
  const angled = trimmed.match(/<([^>]+)>/);
  return (angled?.[1] ?? trimmed).trim();
}

export function applyFromDisplayName(fromRaw: string, displayName: string) {
  const address = extractEmailAddress(fromRaw);
  if (!address.includes("@")) return fromRaw.trim();
  const escaped = displayName.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  return `"${escaped}" <${address}>`;
}

export function previewFrom(fromRaw: string, displayName?: string) {
  const applied = displayName ? applyFromDisplayName(fromRaw, displayName) : fromRaw.trim();
  const address = extractEmailAddress(applied);
  const domain = address.includes("@") ? address.split("@")[1] ?? "" : "";
  const displayMatch = applied.match(/^(.*?)<([^>]+)>\s*$/);
  const display = (displayMatch?.[1] ?? "").trim().replace(/^"|"$/g, "");
  return {
    displayName: display || null,
    addressRedacted: address.includes("@") ? `***@${domain}` : null,
    formattedRedacted: display
      ? `${display} <***@${domain}>`
      : address.includes("@")
        ? `***@${domain}`
        : null,
  };
}
