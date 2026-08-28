import type { CompanyEmailInput } from "@/lib/admin/email/context";
import { buildRestaurantEmailContext } from "@/lib/admin/email/context";
import { hasUnresolvedMerge, htmlToPlainText, looksLikeHtmlEmail } from "@/lib/admin/email/html";
import { mergeTemplate } from "@/lib/admin/merge";
import { renderRestaurantEmail } from "@/lib/admin/email/templates/restaurant";

export function renderPersonalizedEmail(input: {
  subject: string;
  body: string;
  company: CompanyEmailInput;
}) {
  const context = buildRestaurantEmailContext(input.company);
  const subject = mergeTemplate(input.subject, context.vars);
  const bodyHtml = looksLikeHtmlEmail(input.body)
    ? renderRestaurantEmail(input.body, context)
    : mergeTemplate(input.body, context.vars);
  const bodyText = looksLikeHtmlEmail(bodyHtml) ? htmlToPlainText(bodyHtml) : bodyHtml;

  return {
    subject,
    bodyHtml,
    bodyText,
    context,
    unresolved: hasUnresolvedMerge(subject) || hasUnresolvedMerge(bodyHtml),
  };
}
