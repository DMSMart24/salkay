import { site } from "@/lib/site";
import {
  type CompanyEmailContext,
  developmentAreasHtml,
  phoneBlockHtml,
  recommendedServicesChipsHtml,
  scoreBlockHtml,
} from "@/lib/admin/email/context";
import { applyMerge } from "@/lib/admin/email/html";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";

export const RESTAURANT_TEMPLATE_NAME = "RESTORAN — Premium Web Sitesi Analizi";
export const RESTAURANT_TEMPLATE_SUBJECT = "{{companyName}} web sitesi hakkında kısa bir fikir";
export const RESTAURANT_TEMPLATE_SUBJECT_ALT = "{{companyName}} için birkaç dijital geliştirme önerisi";

export function isRestaurantCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
}) {
  const hay = [input.industry, input.groupName, input.groupIndustry]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr");
  return hay.includes("restoran") || hay.includes("restaurant");
}

export function isRestaurantPremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  return resolvePremiumEmailKind(input) === "restaurant";
}

const SERVICES = [
  ["01", "✦", "Web Tasarımı", "Modern, şık ve markanıza özel tasarım"],
  ["02", "▢", "Mobil Uyum", "Tüm cihazlarda hızlı ve kusursuz deneyim"],
  ["03", "▣", "Rezervasyon", "Kolay rezervasyon, daha fazla müşteri"],
  ["04", "●", "SEO &amp; Google", "Daha fazla görünürlük, daha fazla misafir"],
  ["05", "▸", "Hız &amp; Performans", "Hızlı ve modern kullanıcı deneyimi"],
  ["06", "✧", "İçerik &amp; Görsel", "Profesyonel içerik ve görsel yönetimi"],
] as const;

const BENEFITS = [
  ["01", "✦", "Daha güçlü ilk izlenim", "Markanızı ilk bakışta daha profesyonel yansıtın."],
  ["02", "▣", "Kolay rezervasyon", "Daha az adım, daha fazla rezervasyon."],
  ["03", "▢", "Mobilde mükemmel deneyim", "Telefon ve tablette hızlı, kusursuz kullanım."],
] as const;

function benefitPad(index: number) {
  if (index === 0) return "0 6px 0 0";
  if (index === 1) return "0 6px";
  return "0 0 0 6px";
}

function benefitCells() {
  return `<!-- salkay-benefits:cards -->${BENEFITS.map(
    ([num, icon, title, support], index) => `
      <td class="salkay-benefit${index === 2 ? " salkay-benefit-last" : ""}" valign="top" width="33%" style="width:33.33%;padding:${benefitPad(index)};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F8F3EA" style="border-collapse:separate;background:#F8F3EA;border:1px solid #D5AA62;border-left:4px solid #16C7FF;border-radius:8px;">
          <tr>
            <td bgcolor="#F8F3EA" style="background:#F8F3EA;padding:16px 18px;border-radius:8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:14px;letter-spacing:0.14em;color:#16C7FF;font-weight:700;">${num}</td>
                  <td valign="middle" align="right" style="font-family:Georgia,Times,serif;font-size:14px;line-height:14px;color:#D5AA62;">${icon}</td>
                </tr>
              </table>
              <p style="margin:10px 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;color:#07111F;font-weight:700;">${title}</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#5A6A7C;">${support}</p>
            </td>
          </tr>
        </table>
      </td>`,
  ).join("")}`;
}

function serviceCard(num: string, icon: string, title: string, body: string, pad: string) {
  return `
    <td class="salkay-service" valign="top" width="50%" style="width:50%;padding:${pad};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B1729" style="border-collapse:separate;background:#0B1729;border:1px solid #D5AA62;border-radius:8px;">
        <tr>
          <td width="4" bgcolor="#D5AA62" style="width:4px;background:#D5AA62;border-radius:8px 0 0 8px;font-size:0;line-height:0;">&nbsp;</td>
          <td bgcolor="#0B1729" height="118" valign="top" style="background:#0B1729;padding:16px 14px 16px 12px;height:118px;border-radius:0 8px 8px 0;">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:13px;letter-spacing:0.12em;color:#16C7FF;font-weight:700;">${num}&nbsp;&nbsp;<span style="color:#D5AA62;">${icon}</span></p>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#FFFFFF;font-weight:700;">${title}</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#B8C3D1;">${body}</p>
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
    if (!left) continue;
    rows.push(
      `<tr>${serviceCard(left[0], left[1], left[2], left[3], "0 5px 10px 0")}${
        right ? serviceCard(right[0], right[1], right[2], right[3], "0 0 10px 5px") : ""
      }</tr>`,
    );
  }
  return rows.join("");
}

function gastronomyPill() {
  return `
                                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">
                                  <tr>
                                    <td bgcolor="#081525" style="background:#081525;border:1px solid #d5aa62;border-radius:16px;padding:6px 12px;">
                                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;color:#f8f3ea;">Gastronomi Sektörü İçin Dijital Çözümler</p>
                                    </td>
                                  </tr>
                                </table>`;
}

function heroHeadline(size: number, line: number) {
  return `<h1 style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:${size}px;line-height:${line}px;color:#ffffff;font-weight:700;">Restoranınızın<br>dijital yüzünü<br>birlikte daha<br><span style="color:#16c7ff;font-family:Georgia,Times,serif;font-style:italic;border-bottom:2px solid #16c7ff;">etkileyici</span> hale getirelim.</h1>`;
}

function personalizedIntro() {
  return `
                    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.18em;color:#d5aa62;white-space:nowrap;">
                      <span style="color:#16c7ff;">●</span>&nbsp;&nbsp;SİZE ÖZEL · KISA WEB İNCELEMESİ
                    </p>
                    <h2 class="salkay-intro-title" style="margin:0 0 14px;font-family:Georgia,Times,serif;font-size:24px;line-height:32px;color:#07111f;font-weight:700;">
                      <span class="salkay-hello" style="display:block;">Merhaba</span>
                      <span class="salkay-hello-name" style="display:block;"><span style="color:#d5aa62;">{{companyName}}</span>&nbsp;Ekibi&nbsp;👋</span>
                    </h2>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 18px;">
                      <tr><td width="50" height="2" bgcolor="#d5aa62" style="background:#d5aa62;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:#07111f;">{{analysisIntro}}</p>
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:#07111f;">{{companyName}}’in dijital tarafta daha güçlü bir deneyim sunabileceği bazı geliştirme fırsatları gördük.</p>
                    <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:#07111f;">Özellikle <strong style="font-weight:700;">kullanıcı deneyimi</strong>, <strong style="font-weight:700;">rezervasyon akışı</strong> ve <strong style="font-weight:700;">mobil görünüm</strong> tarafında yapılacak dokunuşlarla daha güçlü bir dijital deneyim oluşturulabilir.</p>
                    <table role="presentation" class="salkay-intro-gift" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07111F" style="border-collapse:collapse;margin-top:20px;background-color:#07111F !important;border:1px solid #D5AA62 !important;border-radius:8px;">
                      <tr>
                        <td class="salkay-intro-gift-cell" bgcolor="#07111F" valign="top" style="background-color:#07111F !important;color:#FFFFFF !important;padding:0;border-left:4px solid #D5AA62;">
                          <!-- salkay-intro-gift:cta -->
                          <a class="salkay-intro-gift-link" href="{{ctaUrl}}" style="display:block;padding:16px 18px;text-decoration:none;color:#FFFFFF;border:0;outline:none;">
                            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;color:#D5AA62;font-weight:700;text-decoration:none;">✦&nbsp;&nbsp;SİZE ÖZEL</p>
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#FFFFFF;text-decoration:none;">Web siteniz için hazırladığımız geliştirme fikirlerini <span style="color:#D5AA62;font-weight:700;">ücretsiz</span> paylaşmak isteriz. <span style="color:#16C7FF;">→</span></p>
                          </a>
                        </td>
                      </tr>
                    </table>`;
}

function mobileHero() {
  return `
          <!--[if !mso]><!-->
          <tr class="salkay-hero-mobile">
            <td class="salkay-hero-mobile-cell" bgcolor="#07111f" style="display:none;max-height:0;background:#07111f;border-top:3px solid #d5aa62;padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#07111f;">
                <tr>
                  <td align="center" bgcolor="#07111f" style="padding:0;line-height:0;font-size:0;background:#07111f;">
                    <img class="salkay-hero-mobile-art" src="{{heroMobileUrl}}" width="390" alt="SALKAY — Gastronomi Sektörü İçin Dijital Çözümler" style="display:block;border:0;margin:0;padding:0;width:100%;max-width:390px;height:auto;background-color:#07111f;color:#f8f3ea;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!--<![endif]-->`;
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
  .salkay-hero-mobile,
  .salkay-hero-mobile-cell {
    display: none !important;
    max-height: 0 !important;
    overflow: hidden !important;
    mso-hide: all;
  }
  .salkay-hello,
  .salkay-hello-name { display: block !important; }
  @media only screen and (min-width: 701px) {
    .salkay-hello,
    .salkay-hello-name { display: inline !important; }
    .salkay-intro-title { font-size: 26px !important; line-height: 34px !important; }
  }
  @media only screen and (max-width: 700px) {
    .salkay-container { width: 100% !important; max-width: 390px !important; }
    .salkay-pad { padding-left: 18px !important; padding-right: 18px !important; }
    .salkay-intro-wrap { padding: 34px 24px 30px !important; }
    .salkay-hello,
    .salkay-hello-name { display: block !important; }
    .salkay-intro-title { font-size: 24px !important; line-height: 32px !important; }
    .salkay-intro-gift,
    .salkay-intro-gift-cell {
      width: 100% !important;
      background-color: #07111F !important;
      color: #FFFFFF !important;
      border-color: #D5AA62 !important;
    }
    .salkay-intro-gift-link { display: block !important; width: 100% !important; text-decoration: none !important; color: #FFFFFF !important; }
    .salkay-hero-desktop { display: none !important; max-height: 0 !important; overflow: hidden !important; }
    .salkay-hero-mobile { display: table-row !important; max-height: none !important; overflow: visible !important; }
    .salkay-hero-mobile-cell {
      display: table-cell !important;
      max-height: none !important;
      overflow: visible !important;
      font-size: inherit !important;
      line-height: inherit !important;
    }
    .salkay-hero-copy, .salkay-kay, .salkay-intro, .salkay-audit, .salkay-benefit, .salkay-sign-logo, .salkay-sign-contact { display: block !important; width: 100% !important; }
    .salkay-benefit { padding: 0 0 14px 0 !important; }
    .salkay-benefit-last { padding-bottom: 0 !important; }
    .salkay-services-wrap { padding: 22px 20px 16px !important; background: #07111F !important; }
    .salkay-intro { padding-right: 0 !important; padding-left: 0 !important; }
    .salkay-hero-photo { width: 100% !important; height: auto !important; }
    .salkay-hero-mobile-art { width: 100% !important; max-width: 390px !important; height: auto !important; }
    .salkay-audit { padding-top: 16px !important; }
    .salkay-audit-card { padding: 20px !important; }
    .salkay-cta-wrap { padding: 12px 18px 10px !important; background: #07111F !important; }
    .salkay-cta-inner { padding: 22px 20px 20px !important; }
    .salkay-cta-btn-wrap { width: 86% !important; }
    .salkay-cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    .salkay-sign-wrap { padding: 8px 18px 14px !important; background: #F8F3EA !important; }
    .salkay-sign-head { padding: 18px 18px 0 !important; }
    .salkay-sign-logo { padding: 14px 18px 8px !important; }
    .salkay-sign-contact { padding: 0 18px 18px !important; }
    .salkay-footer { padding: 16px 18px 20px !important; text-align: center !important; }
  }
</style>
</head>
<body class="salkay-body" style="margin:0;padding:0;background:#07111f;color:#f8f3ea;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    SALKAY. Gastronomi Sektörü İçin Dijital Çözümler. Restoranınızın dijital yüzünü birlikte daha etkileyici hale getirelim. {{companyName}} için ücretsiz kısa bir website değerlendirmesi.
  </div>
  <table class="salkay-wrap" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07111f;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:16px 8px;">
        <table role="presentation" class="salkay-container" width="700" cellpadding="0" cellspacing="0" style="width:700px;max-width:700px;border-collapse:collapse;background:#081526;">

          ${mobileHero()}

          <tr class="salkay-hero-desktop">
            <td bgcolor="#07111f" style="background:#07111f;border-top:3px solid #d5aa62;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-pad salkay-hero-copy" valign="top" width="50%" bgcolor="#07111f" style="width:50%;padding:22px 16px 24px 24px;background:#07111f;">
                    <img class="salkay-logo-hero" src="{{logoUrl}}" width="188" height="106" alt="SALKAY" style="display:block;border:0;width:188px;height:auto;max-width:100%;">
                    <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;color:#16c7ff;">Web · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                    ${gastronomyPill()}
                    ${heroHeadline(28, 34)}
                    <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#c5d2e0;">Harika yemek deneyimleri, harika bir web sitesi ile daha çok misafire ulaşır.</p>
                  </td>
                  <td class="salkay-kay" valign="top" width="50%" bgcolor="#081525" style="width:50%;padding:0;background:#081525;">
                    <img class="salkay-hero-photo" src="{{heroUrl}}" width="350" alt="KAY restoran masasında" style="display:block;border:0;width:100%;height:auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="#f8f3ea" class="salkay-pad salkay-intro-wrap" style="background:#f8f3ea;padding:32px 28px 26px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-intro" valign="top" width="48%" style="width:48%;padding-right:22px;">
                    ${personalizedIntro()}
                  </td>
                  <td class="salkay-audit" valign="top" width="52%">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07111F" style="border-collapse:collapse;background:#07111F;border:1px solid #1E3A54;">
                      <tr>
                        <td class="salkay-audit-card" bgcolor="#07111F" style="background:#07111F;padding:20px;">
                          <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.18em;text-transform:uppercase;color:#D5AA62;">WEB SİTESİ İNCELEMESİ</p>
                          <p style="margin:0;font-family:Georgia,Times,serif;font-size:24px;line-height:30px;color:#FFFFFF;font-weight:700;">{{companyName}}</p>
                          <p style="margin:8px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#B8C3D1;"><span style="color:#16C7FF;">●</span>&nbsp;{{district}}{{locationSep}}{{city}}</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 18px;">
                            <tr><td width="40" height="1" bgcolor="#D5AA62" style="background:#D5AA62;font-size:0;line-height:0;">&nbsp;</td></tr>
                          </table>
                          {{scoreBlock}}
                          {{issuesBlock}}
                          {{recommendedServicesBlock}}
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B1729" style="border-collapse:collapse;margin-top:20px;background:#0B1729;border:1px solid #D5AA62;border-left:3px solid #D5AA62;">
                            <tr>
                              <td style="padding:16px 16px 16px 14px;">
                                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:16px;color:#D5AA62;">✦</p>
                                <p style="margin:0;font-family:Georgia,Times,serif;font-size:13px;line-height:21px;color:#B8C3D1;">Doğru strateji ve modern tasarım ile<br><span style="color:#D5AA62;">dijitalde fark</span> yaratmanız mümkün.</p>
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
            <td bgcolor="#ffffff" class="salkay-pad" style="background:#ffffff;padding:8px 24px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  ${benefitCells()}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad salkay-services-wrap" bgcolor="#07111F" style="background:#07111F;padding:26px 24px 16px;">
              <p style="margin:0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:#FFFFFF;font-weight:700;">SALKAY NELER SUNAR?</p>
              <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:10px auto 16px;">
                <tr><td width="50" height="2" bgcolor="#D5AA62" style="background:#D5AA62;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <table role="presentation" class="salkay-service-grid" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <!-- salkay-services:cards -->
                ${serviceGrid()}
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad salkay-cta-wrap" bgcolor="#07111F" style="background:#07111F;padding:18px 24px 14px;">
              <!-- salkay-close:cta -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07111F" style="border-collapse:separate;background:#07111F;border:1px solid #D5AA62;border-radius:10px;">
                <tr>
                  <td width="4" bgcolor="#16C7FF" style="width:4px;background:#16C7FF;border-radius:10px 0 0 10px;font-size:0;line-height:0;">&nbsp;</td>
                  <td class="salkay-cta-inner" bgcolor="#07111F" align="center" style="background:#07111F;padding:26px 28px 24px;border-radius:0 10px 10px 0;">
                    <p style="margin:0 0 16px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;color:#FFFFFF;font-weight:700;">Size özel kısa bir analiz<br>ve geliştirme önerisi hazırlayalım.</p>
                    <table role="presentation" class="salkay-cta-btn-wrap" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse;">
                      <tr>
                        <td bgcolor="#D5AA62" align="center" style="background:#D5AA62;border-radius:24px;">
                          <a class="salkay-cta-btn" href="{{ctaUrl}}" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:18px;color:#07111F;text-decoration:none;font-weight:700;">Ücretsiz Fikir Al →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad salkay-sign-wrap" bgcolor="#F8F3EA" style="background:#F8F3EA;padding:10px 24px 16px;">
              <!-- salkay-close:signature -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="border-collapse:separate;background:#FFFFFF;border:1px solid #D5AA62;border-radius:10px;">
                <tr>
                  <td class="salkay-sign-head" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:20px 22px 0;border-radius:10px 10px 0 0;">
                    <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#5A6A7C;">İyi çalışmalar,</p>
                    <p style="margin:0 0 12px;font-family:Georgia,Times,serif;font-size:26px;line-height:32px;color:#07111F;">Salih Kaya</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr><td width="44" height="2" bgcolor="#D5AA62" style="background:#D5AA62;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#FFFFFF" style="background:#FFFFFF;padding:14px 22px 20px;border-radius:0 0 10px 10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td class="salkay-sign-logo" valign="middle" width="38%" style="width:38%;padding:0 16px 0 0;">
                          <img src="{{logoUrl}}" width="88" height="50" alt="SALKAY" style="display:block;border:0;width:88px;height:auto;max-width:88px;">
                        </td>
                        <td class="salkay-sign-contact" valign="middle" width="62%" style="width:62%;padding:0;">
                          <p style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:16px;letter-spacing:0.14em;color:#07111F;font-weight:700;">SALKAY</p>
                          <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#5A6A7C;">Web · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                          <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;"><a href="mailto:info@salkay.com" style="color:#16C7FF;text-decoration:none;">info@salkay.com</a></p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;"><a href="${site.url}" style="color:#16C7FF;text-decoration:none;">salkay.com</a></p>
                          {{phoneBlock}}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad salkay-footer" bgcolor="#07111F" align="center" style="background:#07111F;padding:20px 24px 24px;text-align:center;">
              <!-- salkay-close:footer -->
              <p style="margin:0 0 8px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:0.28em;color:#D5AA62;font-weight:700;">S A L K A Y</p>
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse;margin:0 auto 12px;">
                <tr><td width="40" height="2" bgcolor="#16C7FF" style="background:#16C7FF;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
              <p style="margin:0 0 12px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8EA0B8;">
                İstanbul, Türkiye
                &nbsp;·&nbsp;
                <a href="mailto:info@salkay.com" style="color:#16C7FF;text-decoration:none;">info@salkay.com</a>
                &nbsp;·&nbsp;
                <a href="${site.url}" style="color:#B8C3D1;text-decoration:none;">salkay.com</a>
              </p>
              <p style="margin:0 0 8px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#8EA0B8;">Bu e-posta {{companyName}} ekibine özel hazırlanmıştır.</p>
              <p style="margin:0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;">
                <a href="{{unsubscribeUrl}}" style="color:#D5AA62;text-decoration:underline;">Abonelikten çık</a>
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

export function renderRestaurantEmail(_source: string, context: CompanyEmailContext) {
  const source = restaurantPremiumSource();
  const locationSep = context.vars.district && context.vars.city ? ", " : "";

  const serviceChips = `<!--safe-->${recommendedServicesChipsHtml(context.recommendedServices)}`;
  const blocks: Record<string, string> = {
    ...context.vars,
    locationSep,
    scoreBlock: `<!--safe-->${scoreBlockHtml(context)}`,
    issuesBlock: `<!--safe-->${developmentAreasHtml(context.customerIssues)}`,
    recommendedServices: serviceChips,
    recommendedServicesBlock: serviceChips,
    recommendedLine: "",
    phoneBlock: `<!--safe-->${phoneBlockHtml(context)}`,
    ctaNote: "",
  };

  return applyMerge(source, blocks, true);
}
