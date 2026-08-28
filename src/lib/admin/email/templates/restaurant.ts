import { site } from "@/lib/site";
import {
  type CompanyEmailContext,
  issueRowsHtml,
  phoneBlockHtml,
  scoreBlockHtml,
} from "@/lib/admin/email/context";
import { applyMerge, escapeHtml } from "@/lib/admin/email/html";

export const RESTAURANT_TEMPLATE_NAME = "RESTORAN — Premium Web Sitesi Analizi";
export const RESTAURANT_TEMPLATE_SUBJECT = "{{companyName}} web sitesi hakkında kısa bir fikir";
export const RESTAURANT_TEMPLATE_SUBJECT_ALT = "{{companyName}} için birkaç dijital geliştirme önerisi";

const SERVICES = [
  ["Web Tasarımı", "Modern, şık ve markanıza özel tasarım"],
  ["Mobil Uyum", "Tüm cihazlarda hızlı ve kusursuz deneyim"],
  ["Rezervasyon Sistemleri", "Kolay rezervasyon, daha fazla müşteri"],
  ["SEO & Google Görünürlüğü", "Daha fazla görünürlük, daha fazla misafir"],
  ["Hız & Performans", "Hızlı ve modern kullanıcı deneyimi"],
  ["İçerik & Görsel Destek", "Profesyonel dijital sunum"],
] as const;

const BENEFITS = [
  ["01", "Daha güçlü", "ilk izlenim"],
  ["02", "Kolay rezervasyon", "ve daha fazla dönüşüm"],
  ["03", "Mobilde mükemmel", "deneyim"],
] as const;

function benefitCells() {
  return BENEFITS.map(
    ([num, line1, line2], index) => `
      <td class="salkay-benefit" valign="top" width="33%" style="width:33.33%;padding:${index === 1 ? "0 8px" : "0"};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f7f4ee;border:1px solid #ead9b8;">
          <tr>
            <td style="padding:16px 14px;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.14em;color:#49e8ff;font-weight:700;">${num}</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:21px;color:#10151f;font-weight:700;">${line1}<br>${line2}</p>
            </td>
          </tr>
        </table>
      </td>`,
  ).join("");
}

function serviceCell(title: string, body: string, first: boolean) {
  return `
    <td class="salkay-service" valign="top" width="50%" style="width:50%;padding:${first ? "0 8px 12px 0" : "0 0 12px 8px"};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#10151f;border:1px solid #243044;">
        <tr>
          <td width="4" bgcolor="#49e8ff" style="background:#49e8ff;font-size:0;line-height:0;">&nbsp;</td>
          <td style="padding:14px 14px 14px 12px;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#ffffff;font-weight:700;">${title}</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#9aa6b8;">${body}</p>
          </td>
        </tr>
      </table>
    </td>`;
}

function serviceGrid() {
  const rows: string[] = [];
  for (let index = 0; index < SERVICES.length; index += 2) {
    const left = SERVICES[index];
    const right = SERVICES[index + 1];
    rows.push(`<tr>${serviceCell(left[0], left[1], true)}${right ? serviceCell(right[0], right[1], false) : ""}</tr>`);
  }
  return rows.join("");
}

export function restaurantPremiumSource() {
  return `<!-- salkay-email:restaurant -->
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>{{companyName}} için dijital öneri</title>
<!--[if mso]>
<style type="text/css">
table, td, div, p, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
  @media only screen and (max-width: 680px) {
    .salkay-container { width: 100% !important; }
    .salkay-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .salkay-kay { display: block !important; width: 100% !important; }
    .salkay-kay-img { display: none !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }
    .salkay-hero-copy { width: 100% !important; display: block !important; }
    .salkay-benefit { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
    .salkay-service { display: block !important; width: 100% !important; padding: 0 0 10px 0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#07090d;color:#f4f7fb;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    {{companyName}} için ücretsiz kısa bir website değerlendirmesi.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07090d;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" class="salkay-container" width="680" cellpadding="0" cellspacing="0" style="width:680px;max-width:680px;border-collapse:collapse;background:#0b0f16;">

          <tr>
            <td bgcolor="#0b1220" style="background:#0b1220;background-image:linear-gradient(180deg,#0b1220 0%,#07090d 100%);border-top:3px solid #c9a46c;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-pad salkay-hero-copy" valign="top" style="padding:28px 32px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td valign="middle" style="padding-right:12px;">
                          <img src="{{logoUrl}}" width="32" height="32" alt="SALKAY" style="display:block;border:0;width:32px;height:32px;">
                        </td>
                        <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:24px;color:#ffffff;font-weight:700;letter-spacing:0.08em;">SALKAY</td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.16em;text-transform:uppercase;color:#49e8ff;">Web · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                    <h1 style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:36px;color:#ffffff;font-weight:700;">{{companyName}} için<br>dijitalde <span style="color:#c9a46c;">daha güçlü</span> bir izlenim<br>yaratabilirsiniz.</h1>
                    <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#c5cedb;">Misafir deneyiminizi web sitenizde en iyi şekilde yansıtın.</p>
                  </td>
                  <td class="salkay-kay" valign="bottom" width="200" style="padding:20px 24px 0 0;">
                    <table role="presentation" width="176" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td bgcolor="#ffffff" style="background:#ffffff;padding:10px 12px;border-radius:12px;">
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#10151f;font-weight:700;">Daha iyi bir dijital deneyim, daha mutlu misafirler.</p>
                        </td>
                      </tr>
                      <tr>
                        <td class="salkay-kay-img" align="center" style="padding-top:10px;">
                          <img src="{{kayUrl}}" width="150" alt="KAY, SALKAY maskotu" style="display:block;border:0;width:150px;max-width:150px;height:auto;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="#ffffff" class="salkay-pad" style="background:#ffffff;padding:34px 32px 28px;">
              <h2 style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:32px;color:#10151f;">Merhaba <span style="color:#c9a46c;">{{companyName}}</span> Ekibi,</h2>
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#334155;">Web sitenizi inceledik ve markanızın dijital dünyada çok daha güçlü bir izlenim bırakabileceğini gördük.</p>
              <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#334155;">Modern, hızlı ve kullanıcı dostu bir web sitesi ile hem marka değerinizi yükseltebilir hem de rezervasyon sürecinizi daha etkili hale getirebilirsiniz.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fbf6ec;border:1px solid #c9a46c;">
                <tr>
                  <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#10151f;">
                    ★ Size özel birkaç geliştirme fikrimizi ücretsiz olarak paylaşmak isteriz.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="#ffffff" class="salkay-pad" style="background:#ffffff;padding:0 32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  ${benefitCells()}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" style="padding:8px 32px 28px;background:#07090d;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#121826;border:1px solid #2a3548;">
                <tr>
                  <td style="padding:24px 24px 8px;">
                    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a46c;">Web Sitesi İncelemesi</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;color:#ffffff;font-weight:700;">{{companyName}}</p>
                    <p style="margin:6px 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#9aa6b8;"><span style="color:#49e8ff;">●</span> {{district}}{{locationSep}}{{city}}</p>
                    {{scoreBlock}}
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 24px 10px;">
                    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:0.12em;text-transform:uppercase;color:#49e8ff;">Öne Çıkan Gelişim Alanları</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      {{issuesBlock}}
                    </table>
                    {{recommendedLine}}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 24px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#0b1220;border-left:4px solid #c9a46c;">
                      <tr>
                        <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#f4f7fb;">
                          Doğru strateji ve modern tasarım ile dijitalde fark yaratmanız mümkün.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" bgcolor="#ffffff" style="background:#ffffff;padding:28px 32px;">
              <h2 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:28px;color:#10151f;">SALKAY NELER SUNAR?</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${serviceGrid()}
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" align="center" style="padding:32px;background:#0b1220;">
              <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;color:#ffffff;font-weight:700;">İsterseniz {{companyName}} için size özel kısa bir analiz ve geliştirme önerisi hazırlayalım.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td bgcolor="#c9a46c" style="border-radius:28px;background:#c9a46c;">
                    <a href="{{ctaUrl}}" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#0b1220;text-decoration:none;font-weight:700;">Ücretsiz Fikir Al →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" bgcolor="#ffffff" style="background:#ffffff;padding:28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="top">
                    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#334155;">İyi çalışmalar,</p>
                    <p style="margin:0;font-family:Georgia,Times,serif;font-size:22px;line-height:28px;color:#10151f;">Salih Kaya</p>
                    <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#c9a46c;font-weight:700;">SALKAY</p>
                    <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:0.04em;color:#64748b;">Web · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                    <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#334155;"><a href="mailto:info@salkay.com" style="color:#3768ff;text-decoration:none;">info@salkay.com</a></p>
                    <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#334155;"><a href="${site.url}" style="color:#3768ff;text-decoration:none;">${site.url.replace("https://", "")}</a></p>
                    {{phoneBlock}}
                  </td>
                  <td class="salkay-kay-img" valign="bottom" width="72" style="padding-left:16px;">
                    <img src="{{kayUrl}}" width="64" alt="KAY" style="display:block;border:0;width:64px;height:auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" style="padding:22px 32px 28px;background:#07090d;border-top:1px solid #1d2633;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td valign="middle" style="padding-right:8px;">
                          <img src="{{logoUrl}}" width="18" height="18" alt="SALKAY" style="display:block;border:0;width:18px;height:18px;">
                        </td>
                        <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#ffffff;font-weight:700;letter-spacing:0.08em;">SALKAY</td>
                      </tr>
                    </table>
                    <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7f8b9c;">İstanbul, Türkiye</p>
                    <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7f8b9c;">
                      <a href="mailto:info@salkay.com" style="color:#49e8ff;text-decoration:none;">info@salkay.com</a>
                      &nbsp;·&nbsp;
                      <a href="${site.url}" style="color:#49e8ff;text-decoration:none;">${site.url.replace("https://", "")}</a>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7f8b9c;">Bu e-posta {{companyName}} ekibine özel hazırlanmıştır.</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">
                <a href="{{unsubscribeUrl}}" style="color:#9aa6b8;text-decoration:underline;">Abonelikten çık</a>
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

export function renderRestaurantEmail(source: string, context: CompanyEmailContext) {
  const locationSep = context.vars.district && context.vars.city ? ", " : "";
  const recommendedLine = context.recommendedServices.length
    ? `<p style="margin:4px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#c9a46c;">Önerilen hizmetler: ${escapeHtml(context.vars.recommendedServices)}</p>`
    : "";

  const blocks: Record<string, string> = {
    ...context.vars,
    locationSep,
    scoreBlock: `<!--safe-->${scoreBlockHtml(context)}`,
    issuesBlock: `<!--safe-->${issueRowsHtml(context.customerIssues)}`,
    recommendedLine: `<!--safe-->${recommendedLine}`,
    phoneBlock: `<!--safe-->${phoneBlockHtml(context)}`,
    ctaNote: "",
  };

  return applyMerge(source, blocks, true);
}
