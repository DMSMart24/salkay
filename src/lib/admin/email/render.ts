import type { CompanyEmailInput } from "@/lib/admin/email/context";
import { buildBarEmailContext, buildRestaurantEmailContext } from "@/lib/admin/email/context";
import { applyMerge, hasUnresolvedMerge, htmlToPlainText, looksLikeHtmlEmail } from "@/lib/admin/email/html";
import { mergeTemplate } from "@/lib/admin/merge";
import {
  barPremiumSource,
  renderBarEmail,
} from "@/lib/admin/email/templates/bar";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import {
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
  const kind = resolvePremiumEmailKind(templateMeta);
  const context =
    kind === "bar" ? buildBarEmailContext(input.company) : buildRestaurantEmailContext(input.company);
  const subject = mergeTemplate(input.subject, context.vars);
  let bodyHtml: string;
  switch (kind) {
    case "bar":
      bodyHtml = renderBarEmail(barPremiumSource(), context);
      break;
    case "restaurant":
      bodyHtml = renderRestaurantEmail(restaurantPremiumSource(), context);
      break;
    case "custom":
      bodyHtml = looksLikeHtmlEmail(input.body)
        ? applyMerge(input.body, { ...context.vars }, true)
        : mergeTemplate(input.body, context.vars);
      break;
    default: {
      const _never: never = kind;
      throw new Error(`Unhandled premium email kind: ${_never}`);
    }
  }
  const bodyText = looksLikeHtmlEmail(bodyHtml) ? htmlToPlainText(bodyHtml) : bodyHtml;

  return {
    subject,
    bodyHtml,
    bodyText,
    context,
    unresolved: hasUnresolvedMerge(subject) || hasUnresolvedMerge(bodyHtml),
  };
}
