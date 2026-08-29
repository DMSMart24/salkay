import type { CompanyEmailInput } from "@/lib/admin/email/context";
import { buildBarEmailContext, buildRestaurantEmailContext } from "@/lib/admin/email/context";
import { applyMerge, hasUnresolvedMerge, htmlToPlainText, looksLikeHtmlEmail } from "@/lib/admin/email/html";
import { mergeTemplate } from "@/lib/admin/merge";
import {
  barPremiumSource,
  isBarPremiumTemplate,
  renderBarEmail,
} from "@/lib/admin/email/templates/bar";
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
  const templateMeta = {
    name: input.templateName,
    body: input.body,
    category: input.templateCategory,
  };
  const restaurant = isRestaurantPremiumTemplate(templateMeta);
  const bar = !restaurant && isBarPremiumTemplate(templateMeta);
  const context = bar ? buildBarEmailContext(input.company) : buildRestaurantEmailContext(input.company);
  const subject = mergeTemplate(input.subject, context.vars);
  const bodyHtml = restaurant
    ? renderRestaurantEmail(restaurantPremiumSource(), context)
    : bar
      ? renderBarEmail(barPremiumSource(), context)
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
