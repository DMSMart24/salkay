export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function applyMerge(source: string, vars: Record<string, string>, htmlEscape: boolean) {
  return source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (full, key: string) => {
    if (!(key in vars)) {
      return "";
    }
    const value = vars[key] ?? "";
    return htmlEscape && !value.startsWith("<!--safe-->") ? escapeHtml(value) : value.replace(/^<!--safe-->/, "");
  });
}

export function hasUnresolvedMerge(source: string) {
  return /\{\{\s*[a-zA-Z0-9_]+\s*\}\}/.test(source);
}

export function looksLikeHtmlEmail(source: string) {
  return /<!--\s*salkay-email/i.test(source) || /<html[\s>]/i.test(source) || /<table[\s>]/i.test(source);
}

export function templateCardPreview(name: string, body: string) {
  if (/restoran/i.test(name) || /salkay-email:restaurant/i.test(body)) {
    return "Restoranlar için kişiselleştirilmiş website analizi ve ücretsiz geliştirme önerisi.";
  }

  const text = htmlToPlainText(body)
    .replace(/\{\{\s*[^}]+\s*\}\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) {
    return "E-posta şablonu";
  }
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
}
