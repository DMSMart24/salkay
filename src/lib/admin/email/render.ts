import type { CompanyEmailInput } from "@/lib/admin/email/context";
import {
  buildBarEmailContext,
  buildIndustryEmailContext,
  buildRestaurantEmailContext,
} from "@/lib/admin/email/context";
import { applyMerge, hasUnresolvedMerge, htmlToPlainText, looksLikeHtmlEmail } from "@/lib/admin/email/html";
import { mergeTemplate } from "@/lib/admin/merge";
import {
  resolveSendableTemplate,
  type SendableTemplate,
  type SendableTemplateInput,
} from "@/lib/admin/email/sendable";
import { renderArchitectureEmail } from "@/lib/admin/email/templates/architecture";
import { renderAutomotiveEmail } from "@/lib/admin/email/templates/automotive";
import { barPremiumSource, renderBarEmail } from "@/lib/admin/email/templates/bar";
import { renderConstructionEmail } from "@/lib/admin/email/templates/construction";
import { renderHotelEmail } from "@/lib/admin/email/templates/hotel";
import { isPremiumIndustryKind } from "@/lib/admin/email/templates/premium-kind";
import { premiumHtmlSource } from "@/lib/admin/email/templates/premium-source";
import { renderRealEstateEmail } from "@/lib/admin/email/templates/real-estate";
import { renderRestaurantEmail, restaurantPremiumSource } from "@/lib/admin/email/templates/restaurant";

export function renderFromTemplate(template: SendableTemplateInput, company: CompanyEmailInput) {
  const sendable = resolveSendableTemplate(template);
  return {
    sendable,
    ...renderPersonalizedEmail({
      subject: sendable.subject,
      body: sendable.body,
      company,
      templateName: template.name ?? undefined,
      templateCategory: template.category ?? undefined,
    }),
  };
}

export function renderPersonalizedEmail(input: {
  subject: string;
  body: string;
  company: CompanyEmailInput;
  templateName?: string;
  templateCategory?: string;
}) {
  const sendable: SendableTemplate = resolveSendableTemplate({
    name: input.templateName,
    body: input.body,
    category: input.templateCategory,
    subject: input.subject,
  });
  const kind = sendable.kind;
  const context = isPremiumIndustryKind(kind)
    ? buildIndustryEmailContext(kind, input.company)
    : kind === "bar"
      ? buildBarEmailContext(input.company)
      : buildRestaurantEmailContext(input.company);
  const subject = mergeTemplate(sendable.subject, context.vars);
  let bodyHtml: string;
  switch (kind) {
    case "bar":
      bodyHtml = renderBarEmail(barPremiumSource(), context);
      break;
    case "restaurant":
      bodyHtml = renderRestaurantEmail(restaurantPremiumSource(), context);
      break;
    case "construction":
      bodyHtml = renderConstructionEmail(premiumHtmlSource(kind), context);
      break;
    case "architecture":
      bodyHtml = renderArchitectureEmail(premiumHtmlSource(kind), context);
      break;
    case "realEstate":
      bodyHtml = renderRealEstateEmail(premiumHtmlSource(kind), context);
      break;
    case "hotel":
      bodyHtml = renderHotelEmail(premiumHtmlSource(kind), context);
      break;
    case "automotive":
      bodyHtml = renderAutomotiveEmail(premiumHtmlSource(kind), context);
      break;
    case "custom":
      bodyHtml = looksLikeHtmlEmail(sendable.body)
        ? applyMerge(sendable.body, { ...context.vars }, true)
        : mergeTemplate(sendable.body, context.vars);
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
