import type { CompanyEmailInput } from "@/lib/admin/email/context";
import { buildRestaurantEmailContext } from "@/lib/admin/email/context";
import { applyMerge, hasUnresolvedMerge, htmlToPlainText, looksLikeHtmlEmail } from "@/lib/admin/email/html";
import { mergeTemplate } from "@/lib/admin/merge";
import {
  isRestaurantPremiumTemplate,
  renderRestaurantEmail,
  restaurantPremiumSource,
} from "@/lib/admin/email/templates/restaurant";

export function renderPersonalizedEmail(input: {
  subject: string;
  body: string;
  company: CompanyEmailInput;
  templateName?: string;
  templateCategory?: string;
}) {
  const context = buildRestaurantEmailContext(input.company);
  const subject = mergeTemplate(input.subject, context.vars);
  const restaurant = isRestaurantPremiumTemplate({
    name: input.templateName,
    body: input.body,
    category: input.templateCategory,
  });
  const bodyHtml = restaurant
    ? renderRestaurantEmail(restaurantPremiumSource(), context)
    : looksLikeHtmlEmail(input.body)
      ? applyMerge(input.body, { ...context.vars }, true)
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
