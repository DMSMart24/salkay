import { site } from "@/lib/site";
import {
  type CompanyEmailContext,
  issueRowsHtml,
  phoneBlockHtml,
  scoreBlockHtml,
} from "@/lib/admin/email/context";
import { applyMerge } from "@/lib/admin/email/html";

export const RESTAURANT_TEMPLATE_NAME = "RESTORAN — Premium Web Sitesi Analizi";
export const RESTAURANT_TEMPLATE_SUBJECT = "{{companyName}} web sitesi hakkında kısa bir fikir";
export const RESTAURANT_TEMPLATE_SUBJECT_ALT = "{{companyName}} için birkaç dijital geliştirme önerisi";

const SERVICES = [
  ["Web Tasarımı", "Modern, şık ve markanıza özel tasarım"],
  ["Mobil Uyum", "Tüm cihazlarda hızlı ve kusursuz deneyim"],
  ["Rezervasyon Sistemleri", "Kolay rezervasyon, daha fazla müşteri"],
  ["SEO & Google Görünürlüğü", "Daha fazla görünürlük, daha fazla misafir"],
  ["Hız & Performans", "Hızlı ve modern kullanıcı deneyimi"],
  ["İçerik & Görsel Destek", "Profesyonel içerik ve görsel yönetimi"],
] as const;

const BENEFITS = [
  ["01", "Daha güçlü", "ilk izlenim"],
  ["02", "Kolay rezervasyon", "ve daha fazla dönüşüm"],
  ["03", "Mobilde mükemmel", "deneyim"],
] as const;

function benefitCells() {
  return BENEFITS.map(
    ([num, line1, line2], index) => `
      <td class="salkay-benefit" valign="top" width="33%" style="width:33.33%;padding:${index === 1 ? "0 7px" : "0"};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f8f3ea;border:1px solid #d5aa62;">
          <tr>
            <td style="padding:14px 12px 16px;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:14px;letter-spacing:0.12em;color:#1478ff;font-weight:700;">${num}</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#0d1728;font-weight:700;">${line1}<br>${line2}</p>
            </td>
          </tr>
        </table>
      </td>`,
  ).join("");
}

function serviceCell(title: string, body: string, pad: string) {
  return `
    <td class="salkay-service" valign="top" width="33%" style="width:33.33%;padding:${pad};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td width="10" valign="top" style="padding-top:3px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr><td width="8" height="8" bgcolor="#16c7ff" style="background:#16c7ff;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
          <td style="padding-left:8px;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#ffffff;font-weight:700;">${title}</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9eb0c4;">${body}</p>
          </td>
        </tr>
      </table>
    </td>`;
}

function serviceGrid() {
  const rows: string[] = [];
  for (let index = 0; index < SERVICES.length; index += 3) {
    const a = SERVICES[index];
    const b = SERVICES[index + 1];
    const c = SERVICES[index + 2];
    rows.push(
      `<tr>${serviceCell(a[0], a[1], "0 10px 16px 0")}${b ? serviceCell(b[0], b[1], "0 10px 16px 0") : ""}${c ? serviceCell(c[0], c[1], "0 0 16px 0") : ""}</tr>`,
    );
  }
  return rows.join("");
}

export function restaurantPremiumSource() {
  return `<!-- salkay-email:restaurant -->
<!DOCTYPE html>
<html lang="tr" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>{{companyName}} için dijital öneri</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<style type="text/css">
table, td, div, p, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
  @media only screen and (max-width: 700px) {
    .salkay-container { width: 100% !important; }
    .salkay-pad { padding-left: 18px !important; padding-right: 18px !important; }
    .salkay-hero-copy, .salkay-kay, .salkay-intro, .salkay-audit, .salkay-benefit, .salkay-service, .salkay-cta-copy, .salkay-cta-kay { display: block !important; width: 100% !important; }
    .salkay-kay { padding: 0 18px 18px !important; }
    .salkay-hero-photo { width: 100% !important; height: auto !important; }
    .salkay-audit { padding-top: 16px !important; }
    .salkay-logo-hero { width: 168px !important; height: auto !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#07111f;color:#f8f3ea;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    {{companyName}} için ücretsiz kısa bir website değerlendirmesi.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07111f;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:16px 8px;">
        <table role="presentation" class="salkay-container" width="700" cellpadding="0" cellspacing="0" style="width:700px;max-width:700px;border-collapse:collapse;background:#081526;">

          <tr>
            <td bgcolor="#0b1729" style="background:#0b1729;border-top:3px solid #d5aa62;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-pad salkay-hero-copy" valign="middle" width="58%" style="padding:28px 24px 26px 28px;">
                    <img class="salkay-logo-hero" src="{{logoHeaderUrl}}" width="200" height="113" alt="SALKAY" style="display:block;border:0;width:200px;height:auto;max-width:100%;">
                    <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.16em;text-transform:uppercase;color:#16c7ff;">Web · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                    <h1 style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:36px;color:#ffffff;font-weight:700;">{{companyName}} için<br>dijitalde <span style="color:#d5aa62;">daha güçlü</span> bir<br>izlenim yaratabilirsiniz.</h1>
                    <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#c5d2e0;">Misafir deneyiminizi web sitenizde en iyi şekilde yansıtın.</p>
                  </td>
                  <td class="salkay-kay" valign="bottom" width="42%" bgcolor="#0b1729" style="background:#0b1729;padding:12px 12px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td align="left" style="padding:0 4px 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                            <tr>
                              <td bgcolor="#ffffff" style="background:#ffffff;padding:9px 11px;border-radius:10px;">
                                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#0d1728;font-weight:700;">Daha iyi bir dijital deneyim,<br>daha mutlu misafirler.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="line-height:0;font-size:0;">
                          <img class="salkay-hero-photo" src="{{heroUrl}}" width="280" alt="Restoran atmosferi" style="display:block;border:0;width:100%;height:auto;">
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding:0;">
                          <img src="{{kayUrl}}" width="168" alt="KAY, SALKAY maskotu" style="display:block;border:0;width:168px;max-width:168px;height:auto;margin:-78px auto 0;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="#ffffff" class="salkay-pad" style="background:#ffffff;padding:26px 24px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-intro" valign="top" width="48%" style="padding-right:14px;">
                    <h2 style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:23px;line-height:30px;color:#0d1728;">Merhaba <span style="color:#d5aa62;">{{companyName}}</span> Ekibi,</h2>
                    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#334155;">Web sitenizi inceledik ve markanızın dijital dünyada çok daha güçlü bir izlenim bırakabileceğini gördük.</p>
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#334155;">Modern, hızlı ve kullanıcı dostu bir web sitesi ile hem marka değerinizi yükseltebilir hem de rezervasyon sürecinizi daha etkili hale getirebilirsiniz.</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f8f3ea;border:1px solid #d5aa62;">
                      <tr>
                        <td style="padding:12px 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#0d1728;">
                          ★ Size özel birkaç geliştirme fikrimizi ücretsiz olarak paylaşmak isteriz.
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="salkay-audit" valign="top" width="52%">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#0b1729;border:1px solid #1d334d;">
                      <tr>
                        <td style="padding:18px 18px 8px;">
                          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#d5aa62;">Web Sitesi İncelemesi</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:#ffffff;font-weight:700;">{{companyName}}</p>
                          <p style="margin:5px 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9eb0c4;"><span style="color:#16c7ff;">●</span> {{district}}{{locationSep}}{{city}}</p>
                          {{scoreBlock}}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px 8px;">
                          <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;color:#16c7ff;">Öne Çıkan Gelişim Alanları</p>
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                            {{issuesBlock}}
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 18px 18px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#07111f;border-left:3px solid #d5aa62;">
                            <tr>
                              <td width="22" valign="top" style="padding:12px 0 12px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#d5aa62;">✦</td>
                              <td style="padding:12px 12px 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#e8eef6;">
                                Doğru strateji ve modern tasarım ile dijitalde fark yaratmanız mümkün.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="#ffffff" class="salkay-pad" style="background:#ffffff;padding:6px 24px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  ${benefitCells()}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" bgcolor="#0b1729" style="background:#0b1729;padding:26px 24px 18px;">
              <p style="margin:0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:#ffffff;font-weight:700;">SALKAY NELER SUNAR?</p>
              <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:10px auto 18px;">
                <tr><td width="56" height="2" bgcolor="#d5aa62" style="background:#d5aa62;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${serviceGrid()}
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" bgcolor="#081526" style="background:#081526;padding:22px 24px;border-top:1px solid #d5aa62;border-bottom:1px solid #d5aa62;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-cta-kay" valign="middle" width="88" style="padding-right:14px;">
                    <img src="{{kayUrl}}" width="72" alt="KAY" style="display:block;border:0;width:72px;height:auto;">
                  </td>
                  <td class="salkay-cta-copy" valign="middle">
                    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:23px;color:#ffffff;font-weight:700;">İsterseniz {{companyName}} için size özel kısa bir analiz ve geliştirme önerisi hazırlayalım.</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td bgcolor="#d5aa62" style="background:#d5aa62;border-radius:24px;">
                          <a href="{{ctaUrl}}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#07111f;text-decoration:none;font-weight:700;">Ücretsiz Fikir Al →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="#ffffff" class="salkay-pad" style="background:#ffffff;padding:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="top" width="72" style="padding-right:14px;">
                    <img src="{{kayUrl}}" width="58" alt="KAY" style="display:block;border:0;width:58px;height:auto;">
                  </td>
                  <td valign="top">
                    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#334155;">İyi çalışmalar,</p>
                    <p style="margin:0 0 10px;font-family:Georgia,Times,serif;font-size:22px;line-height:26px;color:#0d1728;">Salih Kaya</p>
                    <img src="{{logoUrl}}" width="140" height="79" alt="SALKAY" style="display:block;border:0;width:140px;height:auto;max-width:100%;">
                    <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;letter-spacing:0.05em;color:#64748b;">Web · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                    <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;"><a href="mailto:info@salkay.com" style="color:#1478ff;text-decoration:none;">info@salkay.com</a></p>
                    <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;"><a href="${site.url}" style="color:#1478ff;text-decoration:none;">${site.url.replace("https://", "")}</a></p>
                    {{phoneBlock}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" bgcolor="#07111f" style="background:#07111f;padding:20px 24px 24px;">
              <img src="{{logoUrl}}" width="120" height="68" alt="SALKAY" style="display:block;border:0;width:120px;height:auto;max-width:100%;">
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8ea0b8;">İstanbul, Türkiye</p>
              <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">
                <a href="mailto:info@salkay.com" style="color:#16c7ff;text-decoration:none;">info@salkay.com</a>
                &nbsp;·&nbsp;
                <a href="${site.url}" style="color:#16c7ff;text-decoration:none;">salkay.com</a>
              </p>
              <p style="margin:12px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8ea0b8;">Bu e-posta {{companyName}} ekibine özel hazırlanmıştır.</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;">
                <a href="{{unsubscribeUrl}}" style="color:#9eb0c4;text-decoration:underline;">Abonelikten çık</a>
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

  const blocks: Record<string, string> = {
    ...context.vars,
    locationSep,
    scoreBlock: `<!--safe-->${scoreBlockHtml(context)}`,
    issuesBlock: `<!--safe-->${issueRowsHtml(context.customerIssues)}`,
    recommendedLine: "",
    phoneBlock: `<!--safe-->${phoneBlockHtml(context)}`,
    ctaNote: "",
  };

  return applyMerge(source, blocks, true);
}
