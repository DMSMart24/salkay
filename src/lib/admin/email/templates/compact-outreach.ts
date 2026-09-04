import type { CompanyEmailContext } from "@/lib/admin/email/context";
import { applyMerge, escapeHtml } from "@/lib/admin/email/html";
import { site } from "@/lib/site";
import {
  followOnForContext,
  opportunityCards,
  type OutreachCopySpec,
} from "@/lib/admin/email/templates/outreach-copy";

const COMPACT_CSS = `
  @media only screen and (max-width: 700px) {
    .salkay-container { width: 100% !important; max-width: 390px !important; }
    .salkay-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .salkay-cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    .salkay-cta-btn-wrap { width: 100% !important; }
  }
`;

function locationLine(context: CompanyEmailContext) {
  const district = context.vars.district?.trim() ?? "";
  const city = context.vars.city?.trim() ?? "";
  const location = [district, city].filter(Boolean).join(", ");
  const website = context.copyKind === "no_website" ? "" : context.vars.website?.trim() ?? "";
  const bits = [location, website].filter(Boolean);
  if (bits.length === 0) return "";
  return `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#8EA0B8;">${escapeHtml(bits.join(" · "))}</p>`;
}

function analysisItems(context: CompanyEmailContext) {
  if (context.copyKind === "not_verified") return [];
  if (context.copyKind === "no_website") {
    return [
      "Markanızı sakin ve net anlatan bağımsız bir sayfa",
      "Telefonda kolay okunan iletişim yolu",
      "Harita ve yerel aramada daha görünür olmak",
    ];
  }
  return context.customerIssues.map((item) => item.trim()).filter(Boolean).slice(0, 3);
}

function analysisCardHtml(context: CompanyEmailContext) {
  const items = analysisItems(context);
  const showScore = context.hasScore && context.copyKind === "verified";
  if (items.length === 0 && !showScore) return "";

  const heading = context.copyKind === "no_website" ? "Dijital fırsat" : "Kısa inceleme";
  const scoreLine = showScore
    ? `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8EA0B8;">Dijital skor <span style="color:#F4F7FB;font-weight:700;">${escapeHtml(context.scoreLabel)}</span> / 10</p>`
    : "";
  const rows = items
    .map((item, index) => {
      const last = index === items.length - 1;
      return `<tr class="salkay-analysis-item">
        <td style="padding:0 0 ${last ? "0" : "10px"};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#E8EDF5;">${escapeHtml(item)}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B1729" style="border-collapse:separate;background:#0B1729;border:1px solid #24344A;border-radius:8px;margin:0 0 22px;">
    <tr>
      <td style="padding:18px 18px 16px;">
        <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.14em;text-transform:uppercase;color:#D5AA62;">${heading}</p>
        ${scoreLine}
        ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>` : ""}
      </td>
    </tr>
  </table>`;
}

function opportunitiesHtml(spec: OutreachCopySpec, context: CompanyEmailContext) {
  const cards = opportunityCards(spec, context.recommendedServices);
  if (cards.length === 0) return "";
  const rows = cards
    .map((card, index) => {
      const last = index === cards.length - 1;
      return `<tr class="salkay-improve-item">
        <td style="padding:0 0 ${last ? "0" : "14px"};">
          <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:21px;color:#FFFFFF;font-weight:700;">${escapeHtml(card.title)}</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#B8C3D1;">${escapeHtml(card.body)}</p>
        </td>
      </tr>`;
    })
    .join("");
  return `<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.14em;text-transform:uppercase;color:#D5AA62;">Sizin için öne çıkan fırsatlar</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 22px;">
      ${rows}
    </table>`;
}

export function compactOutreachSource(spec: OutreachCopySpec) {
  return `<!-- salkay-email:${spec.marker} -->
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
${COMPACT_CSS}
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
              <p style="margin:0 0 14px;font-family:Georgia,Times,serif;font-size:22px;line-height:30px;color:#FFFFFF;">Merhaba {{companyName}} Ekibi,</p>
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#E8EDF5;">{{analysisIntro}}</p>
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#E8EDF5;">{{followOn}}</p>
              {{locationLine}}
              {{analysisCard}}
              {{opportunitiesBlock}}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B1729" style="border-collapse:separate;background:#0B1729;border-left:3px solid #D5AA62;border-radius:6px;margin:0 0 22px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#D7DEE8;">{{offer}}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" class="salkay-cta-btn-wrap" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 28px;">
                <tr>
                  <td bgcolor="#D5AA62" align="center" style="background:#D5AA62;border-radius:26px;">
                    <a class="salkay-cta-btn" href="{{ctaUrl}}" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#07111F;text-decoration:none;font-weight:700;">{{ctaLabel}}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#8EA0B8;">İyi çalışmalar,</p>
              <p style="margin:0 0 10px;font-family:Georgia,Times,serif;font-size:20px;line-height:26px;color:#FFFFFF;">Salih Kaya</p>
              <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;letter-spacing:0.12em;color:#FFFFFF;font-weight:700;">SALKAY</p>
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8EA0B8;">Web Tasarım · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
              <p style="margin:0 0 1px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;"><a href="mailto:info@salkay.com" style="color:#16C7FF;text-decoration:none;">info@salkay.com</a></p>
              <p style="margin:0 0 1px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;"><a href="${site.url}" style="color:#16C7FF;text-decoration:none;">salkay.com</a></p>
              <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#16C7FF;">${site.whatsappDisplay}</p>
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

export function renderCompactOutreach(spec: OutreachCopySpec, context: CompanyEmailContext) {
  const noWebsiteNote =
    context.copyKind === "no_website"
      ? `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#B8C3D1;">Bağımsız web sitesi bulunamadı.</p>`
      : "";
  const blocks: Record<string, string> = {
    ...context.vars,
    followOn: followOnForContext(spec, context),
    offer: spec.offer,
    ctaLabel: spec.ctaLabel,
    locationLine: `<!--safe-->${locationLine(context)}${noWebsiteNote}`,
    analysisCard: `<!--safe-->${analysisCardHtml(context)}`,
    opportunitiesBlock: `<!--safe-->${opportunitiesHtml(spec, context)}`,
  };
  return applyMerge(compactOutreachSource(spec), blocks, true);
}
