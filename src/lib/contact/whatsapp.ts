import { resolveContactPackage } from "@/lib/contact/packages";
import { siteWhatsAppUrl } from "@/lib/site";

export const WHATSAPP_INQUIRY_MESSAGE =
  "Merhaba SALKAY, bir proje hakkında bilgi almak istiyorum.";

export function publicWhatsAppMessage(packageValue?: string | null) {
  const selected = resolveContactPackage(packageValue ?? undefined);
  if (!selected) {
    return WHATSAPP_INQUIRY_MESSAGE;
  }

  return `Merhaba SALKAY, ${selected.displayName} paketi hakkında bilgi almak istiyorum.`;
}

export function publicWhatsAppHref(packageValue?: string | null) {
  return siteWhatsAppUrl(publicWhatsAppMessage(packageValue));
}
