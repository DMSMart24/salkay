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
import { renderFollowUpOutreach } from "@/lib/admin/email/templates/follow-up-outreach";
import {
  followUpSubject,
  isFollowUpStep,
  parseSequenceStep,
  type SequenceStepNumber,
} from "@/lib/admin/email/sequence";

export type RenderFromTemplateOptions = {
  sequenceStep?: SequenceStepNumber | string | null;
  originalSubject?: string;
};

export function renderFromTemplate(
  template: SendableTemplateInput,
  company: CompanyEmailInput,
  options?: RenderFromTemplateOptions,
) {
  const sendable = resolveSendableTemplate(template);
  return {
    sendable,
    ...renderPersonalizedEmail({
      subject: sendable.subject,
      body: sendable.body,
      company,
      templateName: template.name ?? undefined,
      templateCategory: template.category ?? undefined,
      sequenceStep: parseSequenceStep(
        typeof options?.sequenceStep === "number"
          ? String(options.sequenceStep)
          : options?.sequenceStep,
      ),
      originalSubject: options?.originalSubject,
    }),
  };
}

export function renderPersonalizedEmail(input: {
  subject: string;
  body: string;
  company: CompanyEmailInput;
  templateName?: string;
  templateCategory?: string;
  sequenceStep?: SequenceStepNumber;
  originalSubject?: string;
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
  const initialSubject = mergeTemplate(sendable.subject, context.vars);
  const sequenceStep = input.sequenceStep ?? 0;
  if (isFollowUpStep(sequenceStep)) {
    const bodyHtml = renderFollowUpOutreach(kind, sequenceStep, context);
    const subject = followUpSubject(input.originalSubject?.trim() || initialSubject);
    const bodyText = looksLikeHtmlEmail(bodyHtml) ? htmlToPlainText(bodyHtml) : bodyHtml;
    return {
      subject,
      bodyHtml,
      bodyText,
      context,
      sequenceStep,
      unresolved: hasUnresolvedMerge(subject) || hasUnresolvedMerge(bodyHtml),
    };
  }
  const subject = initialSubject;
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
    sequenceStep,
    unresolved: hasUnresolvedMerge(subject) || hasUnresolvedMerge(bodyHtml),
  };
}
