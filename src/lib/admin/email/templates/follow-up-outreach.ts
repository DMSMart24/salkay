import type { CompanyEmailContext } from "@/lib/admin/email/context";
import { applyMerge, escapeHtml } from "@/lib/admin/email/html";
import { whatsAppCtaUrl } from "@/lib/admin/email/assets";
import type { FollowUpStepNumber } from "@/lib/admin/email/sequence";
import {
  followUpCopy,
  followUpWhatsAppMessage,
} from "@/lib/admin/email/templates/follow-up-copy";
import type { PremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";

const FOLLOW_UP_CSS = `
  @media only screen and (max-width: 700px) {
    .salkay-container { width: 100% !important; max-width: 390px !important; }
    .salkay-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .salkay-hello { font-size: 20px !important; line-height: 28px !important; }
    .salkay-cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 15px 20px !important; }
    .salkay-cta-btn-wrap { width: 100% !important; }
  }
`;

function markerFor(kind: PremiumEmailKind, step: FollowUpStepNumber) {
  const slug =
    kind === "realEstate" ? "real-estate" : kind === "custom" ? "custom" : kind;
  return `${slug}-follow-${step}`;
}

function bodyParagraphs(lines: readonly string[]) {
  return lines
    .map(
      (line) =>
        `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#E8EDF5;">${escapeHtml(line)}</p>`,
    )
    .join("");
}

function ctaHtml(style: "button" | "link") {
  if (style === "link") {
    return `<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;">
      <a href="{{ctaUrl}}" style="color:#16C7FF;text-decoration:underline;">{{ctaLabel}}</a>
    </p>`;
  }
  return `<table role="presentation" class="salkay-cta-btn-wrap" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 28px;">
    <tr>
      <td bgcolor="#D5AA62" align="center" style="background:#D5AA62;border-radius:26px;">
        <a class="salkay-cta-btn" href="{{ctaUrl}}" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#07111F;text-decoration:none;font-weight:700;">{{ctaLabel}}</a>
      </td>
    </tr>
  </table>`;
}

function offerHtml(offer?: string) {
  if (!offer) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B1729" style="border-collapse:separate;background:#0B1729;border-left:3px solid #D5AA62;border-radius:6px;margin:0 0 22px;">
    <tr>
      <td style="padding:16px 18px;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#D7DEE8;">${escapeHtml(offer)}</p>
      </td>
    </tr>
  </table>`;
}

export function followUpOutreachSource(kind: PremiumEmailKind, step: FollowUpStepNumber) {
  const spec = followUpCopy(kind, step);
  return `<!-- salkay-email:${markerFor(kind, step)} -->
<!DOCTYPE html>
<html lang="tr" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>{{companyName}}</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<style type="text/css">
table, td, div, p, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
${FOLLOW_UP_CSS}
</style>
</head>
<body style="margin:0;padding:0;background:#07111F;color:#F4F7FB;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${spec.preheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07111F;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" class="salkay-container" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;border-collapse:collapse;background:#081526;">
          <tr>
            <td class="salkay-pad" bgcolor="#081526" style="background:#081526;padding:22px 32px 8px;border-top:3px solid #D5AA62;">
              <img src="{{logoUrl}}" width="132" alt="SALKAY" style="display:block;border:0;width:132px;height:auto;max-width:100%;">
              <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;letter-spacing:0.14em;text-transform:uppercase;color:#D5AA62;">${spec.eyebrow}</p>
            </td>
          </tr>
          <tr>
            <td class="salkay-pad" bgcolor="#081526" style="background:#081526;padding:18px 32px 8px;">
              <p class="salkay-hello" style="margin:0 0 14px;font-family:Georgia,Times,serif;font-size:22px;line-height:30px;color:#FFFFFF;">Merhaba {{companyName}} Ekibi,</p>
              ${bodyParagraphs(spec.body)}
              ${offerHtml(spec.offer)}
              ${ctaHtml(spec.ctaStyle)}
              <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#8EA0B8;">İyi çalışmalar,</p>
              <p style="margin:0 0 6px;font-family:Georgia,Times,serif;font-size:20px;line-height:26px;color:#FFFFFF;">Salih Kaya</p>
              <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;letter-spacing:0.12em;color:#FFFFFF;font-weight:700;">SALKAY</p>
            </td>
          </tr>
          <tr>
            <td class="salkay-pad salkay-footer" bgcolor="#07111F" align="center" style="background:#07111F;padding:16px 24px 22px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#6F8196;">İstanbul, Türkiye</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;">
                <a href="{{unsubscribeUrl}}" style="color:#8A7344;text-decoration:underline;">Abonelikten çık</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderFollowUpOutreach(
  kind: PremiumEmailKind,
  step: FollowUpStepNumber,
  context: CompanyEmailContext,
) {
  const spec = followUpCopy(kind, step);
  const companyName = context.vars.companyName?.trim() || "işletmeniz";
  const ctaUrl = whatsAppCtaUrl(followUpWhatsAppMessage(companyName, step));
  return applyMerge(
    followUpOutreachSource(kind, step),
    {
      ...context.vars,
      ctaUrl,
      ctaLabel: spec.ctaLabel,
    },
    true,
  );
}
