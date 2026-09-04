import {
  isCodeBackedPremiumKind,
  resolvePremiumEmailKind,
  type PremiumEmailKind,
} from "@/lib/admin/email/templates/premium-kind";
import { premiumHtmlSource, premiumSubject } from "@/lib/admin/email/templates/premium-source";

export type SendableTemplateInput = {
  name?: string | null;
  category?: string | null;
  subject?: string | null;
  body?: string | null;
};

export type SendableTemplate = {
  kind: PremiumEmailKind;
  subject: string;
  body: string;
  sourceOfTruth: "code" | "database";
  editorAffectsSend: boolean;
};

export function resolveSendableTemplate(template: SendableTemplateInput): SendableTemplate {
  const kind = resolvePremiumEmailKind({
    name: template.name,
    category: template.category,
    body: template.body,
  });
  if (isCodeBackedPremiumKind(kind)) {
    return {
      kind,
      subject: premiumSubject(kind),
      body: premiumHtmlSource(kind),
      sourceOfTruth: "code",
      editorAffectsSend: false,
    };
  }
  return {
    kind: "custom",
    subject: template.subject ?? "",
    body: template.body ?? "",
    sourceOfTruth: "database",
    editorAffectsSend: true,
  };
}

export function sendableSourceLabel(sendable: SendableTemplate) {
  return sendable.sourceOfTruth === "code"
    ? "Kod (premium layout). Admin HTML düzenlemesi gönderimi değiştirmez."
    : "Veritabanı. Editör içeriği gönderimde kullanılır.";
}
