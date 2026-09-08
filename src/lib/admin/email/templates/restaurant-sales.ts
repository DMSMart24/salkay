import { emailAssetUrl, emailAssets } from "@/lib/admin/email/assets";
import { escapeHtml } from "@/lib/admin/email/html";
import { site } from "@/lib/site";

export const RESTAURANT_SALES_EMAIL_MARK = "salkay-email:restaurant-sales";
export const RESTAURANT_SALES_EMAIL_WIDTH = 600;

const FONT = "Arial,Helvetica,sans-serif";
const SERIF = "Georgia,Times,'Times New Roman',serif";

export type RestaurantSalesHtmlInput = {
  restaurantName: string;
  emailType: "NO_WEBSITE_EMAIL" | "WEBSITE_PROBLEM_EMAIL";
  greeting: string;
  paragraphs: string[];
  listItems: string[];
  cta: string;
  ctaHref: string;
};

function rowList(items: string[]) {
  if (items.length === 0) return "";
  return items
    .map((item, index) => {
      const last = index === items.length - 1;
      return `<tr>
        <td valign="top" width="14" style="width:14px;padding:0 10px 10px 0;font-family:${FONT};font-size:15px;line-height:22px;color:#D5AA62;">•</td>
        <td valign="top" style="padding:0 0 ${last ? "0" : "10px"} 0;font-family:${FONT};font-size:15px;line-height:22px;color:#F4F7FB;">${escapeHtml(item)}</td>
      </tr>`;
    })
    .join("");
}

export function renderRestaurantSalesEmailHtml(input: RestaurantSalesHtmlInput) {
  const logo = emailAssetUrl(emailAssets.logoHeader);
  const kicker =
    input.emailType === "NO_WEBSITE_EMAIL" ? "DİJİTAL VİTRİN" : "KISA GÖZLEM";
  const paragraphs = input.paragraphs
    .map(
      (paragraph, index) =>
        `<p style="margin:${index === 0 ? "0 0 14px" : "0 0 14px"};font-family:${FONT};font-size:15px;line-height:24px;color:#F4F7FB;">${escapeHtml(paragraph)}</p>`,
    )
    .join("");
  const list = input.listItems.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:4px 0 18px;">${rowList(input.listItems)}</table>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(input.restaurantName)}</title>
  <!-- ${RESTAURANT_SALES_EMAIL_MARK} -->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .salkay-sales-wrap { width: 100% !important; }
      .salkay-sales-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .salkay-sales-cta { width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#07111F;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(input.cta)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07111F" style="border-collapse:collapse;background:#07111F;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="salkay-sales-wrap" width="${RESTAURANT_SALES_EMAIL_WIDTH}" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:${RESTAURANT_SALES_EMAIL_WIDTH}px;max-width:${RESTAURANT_SALES_EMAIL_WIDTH}px;">
          <tr>
            <td class="salkay-sales-pad" bgcolor="#07111F" style="background:#07111F;padding:8px 32px 18px;border-bottom:1px solid #1E3148;">
              <img src="${logo}" width="92" height="50" alt="SALKAY" style="display:block;border:0;width:92px;height:auto;max-width:92px;">
            </td>
          </tr>
          <tr>
            <td class="salkay-sales-pad" bgcolor="#07111F" style="background:#07111F;padding:28px 32px 8px;">
              <p style="margin:0 0 8px;font-family:${FONT};font-size:11px;line-height:14px;letter-spacing:0.18em;color:#D5AA62;font-weight:700;">${kicker}</p>
              <p style="margin:0 0 22px;font-family:${SERIF};font-size:26px;line-height:34px;color:#FFFFFF;">${escapeHtml(input.greeting)}</p>
              ${paragraphs}
              ${list}
            </td>
          </tr>
          <tr>
            <td class="salkay-sales-pad" bgcolor="#07111F" style="background:#07111F;padding:8px 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B1729" style="border-collapse:separate;background:#0B1729;border:1px solid #D5AA62;border-radius:8px;">
                <tr>
                  <td width="3" bgcolor="#16C7FF" style="width:3px;background:#16C7FF;border-radius:8px 0 0 8px;font-size:0;line-height:0;">&nbsp;</td>
                  <td bgcolor="#0B1729" style="background:#0B1729;padding:20px 22px;border-radius:0 8px 8px 0;">
                    <p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:23px;color:#F4F7FB;">${escapeHtml(input.cta)}</p>
                    <table role="presentation" class="salkay-sales-cta" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td bgcolor="#D5AA62" align="center" style="background:#D5AA62;border-radius:24px;">
                          <a href="${escapeHtml(input.ctaHref)}" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:13px;line-height:18px;color:#07111F;text-decoration:none;font-weight:700;">Kısa bir yanıt yeterli →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="salkay-sales-pad" bgcolor="#07111F" style="background:#07111F;padding:4px 32px 28px;">
              <p style="margin:0 0 4px;font-family:${FONT};font-size:14px;line-height:20px;color:#B8C3D1;">İyi çalışmalar,</p>
              <p style="margin:0 0 4px;font-family:${SERIF};font-size:22px;line-height:28px;color:#FFFFFF;">Salih Kaya</p>
              <p style="margin:0 0 12px;font-family:${FONT};font-size:12px;line-height:18px;letter-spacing:0.12em;color:#D5AA62;font-weight:700;">SALKAY</p>
              <p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;color:#8EA0B8;">Web · Yazılım · Dijital büyüme</p>
            </td>
          </tr>
          <tr>
            <td class="salkay-sales-pad" bgcolor="#07111F" align="center" style="background:#07111F;padding:16px 32px 8px;border-top:1px solid #1E3148;text-align:center;">
              <p style="margin:0 0 6px;font-family:${FONT};font-size:11px;line-height:16px;color:#8EA0B8;">
                İstanbul
                &nbsp;·&nbsp;
                <a href="mailto:${site.email}" style="color:#16C7FF;text-decoration:none;">${site.email}</a>
                &nbsp;·&nbsp;
                <a href="${site.url}" style="color:#B8C3D1;text-decoration:none;">salkay.com</a>
              </p>
              <p style="margin:0;font-family:${FONT};font-size:11px;line-height:16px;color:#8EA0B8;">Bu not ${escapeHtml(input.restaurantName)} için hazırlandı. Toplu gönderim değildir.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
