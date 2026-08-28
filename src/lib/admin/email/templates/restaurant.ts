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
  ["Özel Web Tasarımı", "Modern, markanıza özel tasarım"],
  ["Mobil Uyum", "Tüm cihazlarda hızlı ve kusursuz deneyim"],
  ["Rezervasyon Sistemleri", "Daha kolay rezervasyon, daha fazla misafir"],
  ["SEO & Google Görünürlüğü", "Daha fazla görünürlük, daha fazla potansiyel müşteri"],
  ["Hız & Performans", "Hızlı ve modern web deneyimi"],
  ["İçerik & Görsel Destek", "Profesyonel dijital sunum"],
] as const;

function serviceRows() {
  return SERVICES.map(
    ([title, body]) => `
      <tr>
        <td style="padding:0 0 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#10151f;border:1px solid #1d2633;">
            <tr>
              <td width="4" style="background:#c9a46c;font-size:0;line-height:0;">&nbsp;</td>
              <td style="padding:12px 14px;">
                <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#ffffff;font-weight:700;">${title}</p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#9aa6b8;">${body}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`,
  ).join("");
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
  @media only screen and (max-width: 620px) {
    .salkay-container { width: 100% !important; }
    .salkay-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .salkay-kay { display: none !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }
    .salkay-hero-copy { width: 100% !important; display: block !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#07090d;color:#f4f7fb;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    {{companyName}} için ücretsiz kısa bir website değerlendirmesi.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07090d;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="salkay-container" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;border-collapse:collapse;background:#0b0f16;">

          <tr>
            <td bgcolor="#0b1220" style="background:#0b1220;border-bottom:1px solid #c9a46c;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-pad salkay-hero-copy" valign="top" style="padding:28px 32px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td valign="middle" style="padding-right:10px;">
                          <img src="{{logoUrl}}" width="28" height="28" alt="SALKAY" style="display:block;border:0;width:28px;height:28px;">
                        </td>
                        <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:22px;color:#ffffff;font-weight:700;letter-spacing:0.04em;">SALKAY</td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.14em;text-transform:uppercase;color:#49e8ff;">Restoranlar İçin Dijital Çözümler</p>
                    <h1 style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:34px;color:#ffffff;font-weight:700;">{{companyName}} için<br>dijitalde daha güçlü bir izlenim yaratabiliriz.</h1>
                    <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#c5cedb;">Misafir deneyiminizi web sitenizde en iyi şekilde yansıtın.</p>
                  </td>
                  <td class="salkay-kay" valign="bottom" width="170" style="padding:16px 16px 0 0;">
                    <img src="{{kayUrl}}" width="150" alt="KAY, SALKAY maskotu" style="display:block;border:0;width:150px;max-width:150px;height:auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="#ffffff" class="salkay-pad" style="background:#ffffff;padding:32px;">
              <h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#10151f;">Merhaba {{companyName}} Ekibi,</h2>
              <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#334155;">Web sitenizi inceledik ve markanızın dijital dünyada çok daha güçlü, modern ve misafir odaklı bir şekilde yansıtılabileceğini gördük.</p>
              <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#334155;">SALKAY olarak restoranlar için özel web tasarımları, rezervasyon odaklı çözümler ve dijital büyüme stratejileri geliştiriyoruz.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f4f7fb;border-left:4px solid #3768ff;">
                <tr>
                  <td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#10151f;">
                    Size özel birkaç geliştirme fikrimizi ücretsiz olarak paylaşmak isteriz.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" style="padding:8px 32px 28px;background:#0b0f16;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#121826;border:1px solid #243044;">
                <tr>
                  <td style="padding:22px 22px 10px;">
                    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.16em;text-transform:uppercase;color:#c9a46c;">Web Sitesi İncelemesi</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;color:#ffffff;font-weight:700;">{{companyName}}</p>
                    <p style="margin:4px 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#9aa6b8;">{{district}}{{locationSep}}{{city}}</p>
                    {{scoreBlock}}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 22px 22px;">
                    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:0.08em;text-transform:uppercase;color:#49e8ff;">Geliştirme alanları</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      {{issuesBlock}}
                    </table>
                    {{recommendedLine}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" bgcolor="#ffffff" style="background:#ffffff;padding:28px 32px;">
              <h2 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:28px;color:#10151f;">SALKAY NELER SUNAR?</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${serviceRows()}
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" align="center" style="padding:28px 32px;background:#0b1220;">
              <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;color:#ffffff;font-weight:700;">{{companyName}} için ücretsiz kısa bir analiz ve geliştirme önerisi hazırlayalım.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td bgcolor="#3768ff" style="border-radius:28px;background:#3768ff;">
                    <a href="{{ctaUrl}}" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#ffffff;text-decoration:none;font-weight:700;">Ücretsiz Fikir Al</a>
                  </td>
                </tr>
              </table>
              {{ctaNote}}
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" bgcolor="#ffffff" style="background:#ffffff;padding:28px 32px;">
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#334155;">İyi çalışmalar,</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#10151f;font-weight:700;">Salih Kaya</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#3768ff;font-weight:700;">SALKAY</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#64748b;">Web · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#334155;"><a href="mailto:info@salkay.com" style="color:#3768ff;text-decoration:none;">info@salkay.com</a></p>
              <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#334155;"><a href="${site.url}" style="color:#3768ff;text-decoration:none;">${site.url.replace("https://", "")}</a></p>
              {{phoneBlock}}
            </td>
          </tr>

          <tr>
            <td class="salkay-pad" style="padding:20px 32px 28px;background:#07090d;">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9aa6b8;font-weight:700;">SALKAY</p>
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7f8b9c;">İstanbul, Türkiye</p>
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7f8b9c;">
                <a href="${site.url}" style="color:#49e8ff;text-decoration:none;">Website</a>
                &nbsp;·&nbsp;
                <a href="mailto:info@salkay.com" style="color:#49e8ff;text-decoration:none;">E-posta</a>
              </p>
              <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7f8b9c;">Bu e-posta {{companyName}} ekibine özel hazırlanmıştır.</p>
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
    ? `<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#c9a46c;">Önerilen hizmetler: ${escapeHtml(context.vars.recommendedServices)}</p>`
    : "";

  const blocks: Record<string, string> = {
    ...context.vars,
    locationSep,
    scoreBlock: `<!--safe-->${scoreBlockHtml(context)}`,
    issuesBlock: `<!--safe-->${issueRowsHtml(context.issues)}`,
    recommendedLine: `<!--safe-->${recommendedLine}`,
    phoneBlock: `<!--safe-->${phoneBlockHtml(context)}`,
    ctaNote: "",
  };

  return applyMerge(source, blocks, true);
}
