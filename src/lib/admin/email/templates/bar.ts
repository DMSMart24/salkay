import {
  type CompanyEmailContext,
  developmentAreasHtml,
  phoneBlockHtml,
  recommendedServicesChipsHtml,
  scoreBlockHtml,
} from "@/lib/admin/email/context";
import { applyMerge } from "@/lib/admin/email/html";
import {
  PREMIUM_EMAIL_CSS,
  benefitCellsHtml,
  footerBlockHtml,
  introGiftCardHtml,
  mainCtaBlockHtml,
  mobileHeroHtml,
  serviceGridHtml,
  signatureBlockHtml,
} from "@/lib/admin/email/templates/premium-shell";

export const BAR_TEMPLATE_NAME = "BAR — Premium Web Sitesi Analizi";
export const BAR_TEMPLATE_SUBJECT = "{{companyName}} web sitesi hakkında kısa bir fikir";
export const BAR_GROUP_NAME = "Barlar";
export const BAR_GROUP_INDUSTRY = "Bar";
export const BAR_TEMPLATE_CATEGORY = "BAR";

const BAR_PHRASES = [
  "barlar",
  "cocktail bar",
  "cocktailbar",
  "lounge bar",
  "loungebar",
  "pub",
] as const;

function classifyHay(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  return [input.industry, input.groupName, input.groupIndustry, input.category]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr")
    .replace(/\s+/g, " ")
    .trim();
}

function hasRestaurantSignal(hay: string) {
  return hay.includes("restoran") || hay.includes("restaurant");
}

function hasStrongBarSignal(hay: string) {
  return BAR_PHRASES.some((phrase) => hay.includes(phrase));
}

function hasBarWord(hay: string) {
  return /(^|[\s/&|,_-])bar($|[\s/&|,_-])/.test(` ${hay} `);
}

export function isBarCompany(input: {
  industry?: string | null;
  groupName?: string | null;
  groupIndustry?: string | null;
  category?: string | null;
}) {
  const hay = classifyHay(input);
  if (!hay) return false;
  if (hasStrongBarSignal(hay)) return true;
  return hasBarWord(hay) && !hasRestaurantSignal(hay);
}

export function isBarPremiumTemplate(input: {
  name?: string | null;
  body?: string | null;
  category?: string | null;
}) {
  const name = (input.name ?? "").trim();
  if (name === BAR_TEMPLATE_NAME) return true;
  const normalized = name.replace(/[—–−-]/g, "-").toLocaleLowerCase("tr");
  if (normalized.includes("restoran") || normalized.includes("restaurant")) return false;
  if (/\bbar\b/.test(normalized) && normalized.includes("premium") && normalized.includes("analiz")) {
    return true;
  }
  const category = (input.category ?? "").toLocaleUpperCase("tr");
  if ((category === "BAR" || category === "BARLAR") && /salkay-email:bar/i.test(input.body ?? "")) {
    return true;
  }
  return /<!--\s*salkay-email:bar/i.test(input.body ?? "");
}

const SERVICES = [
  ["01", "✦", "Web Tasarımı", "Markanızın atmosferini yansıtan modern web deneyimi."],
  ["02", "▢", "Mobil Uyum", "Telefonlarda hızlı ve kusursuz kullanım."],
  ["03", "▣", "Rezervasyon", "Masa rezervasyonunu daha basit hale getiren akışlar."],
  ["04", "●", "Etkinlik Modülü", "DJ, canlı müzik ve özel geceleri görünür hale getirin."],
  ["05", "▸", "SEO &amp; Google", "Google ve harita sonuçlarında daha güçlü görünürlük."],
  ["06", "✧", "Sosyal Medya", "Sosyal medya içeriklerini dijital deneyime bağlayın."],
] as const;

const BENEFITS = [
  ["01", "✦", "Daha güçlü ilk izlenim", "Barınızın atmosferini dijitalde ilk bakışta daha güçlü yansıtın."],
  ["02", "▣", "Daha kolay rezervasyon", "Misafirlerin masa rezervasyonuna daha hızlı ulaşmasını sağlayın."],
  ["03", "▢", "Etkinlikleri öne çıkarın", "DJ geceleri, canlı müzik ve özel etkinlikleri daha görünür hale getirin."],
] as const;

function nightlifePill() {
  return `
                                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">
                                  <tr>
                                    <td bgcolor="#081525" style="background:#081525;border:1px solid #d5aa62;border-radius:16px;padding:6px 12px;">
                                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;letter-spacing:0.04em;text-transform:uppercase;color:#f8f3ea;">BAR &amp; GECE HAYATI İÇİN DİJİTAL ÇÖZÜMLER</p>
                                    </td>
                                  </tr>
                                </table>`;
}

function premiumBadge() {
  return `
                                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:10px;">
                                  <tr>
                                    <td style="border:1px solid #d5aa62;border-radius:4px;padding:4px 8px;">
                                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:13px;letter-spacing:0.08em;text-transform:uppercase;color:#d5aa62;">PREMIUM DİJİTAL PARTNER</p>
                                    </td>
                                  </tr>
                                </table>`;
}

function heroHeadline(size: number, line: number) {
  return `<h1 style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:${size}px;line-height:${line}px;color:#ffffff;font-weight:700;">Barınızın<br>dijital atmosferini<br>birlikte daha<br><span style="color:#16c7ff;font-family:Georgia,Times,serif;font-style:italic;border-bottom:2px solid #16c7ff;">etkileyici</span> hale getirelim.</h1>`;
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
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:#07111f;">Dijital görünümünüzü sizin için kısaca inceledik.</p>
                    <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:#07111f;">Mekanınızın atmosferini dijitalde daha güçlü yansıtmak; <strong style="font-weight:700;">mobil deneyimi</strong>, <strong style="font-weight:700;">masa rezervasyonunu</strong> ve <strong style="font-weight:700;">etkinlik görünürlüğünü</strong> geliştirmek için bazı fırsatlar gördük.</p>
                    ${introGiftCardHtml()}`;
}

export function barPremiumSource() {
  return `<!-- salkay-email:bar -->
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
${PREMIUM_EMAIL_CSS}
</style>
</head>
<body class="salkay-body" style="margin:0;padding:0;background:#07111f;color:#f8f3ea;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    SALKAY. BAR &amp; GECE HAYATI İÇİN DİJİTAL ÇÖZÜMLER. Barınızın dijital atmosferini birlikte daha etkileyici hale getirelim. {{companyName}} için ücretsiz kısa bir website değerlendirmesi.
  </div>
  <table class="salkay-wrap" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07111f;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:16px 8px;">
        <table role="presentation" class="salkay-container" width="700" cellpadding="0" cellspacing="0" style="width:700px;max-width:700px;border-collapse:collapse;background:#081526;">

          ${mobileHeroHtml("SALKAY — Bar ve gece hayatı için dijital çözümler")}

          <tr class="salkay-hero-desktop">
            <td bgcolor="#07111f" style="background:#07111f;border-top:3px solid #d5aa62;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-pad salkay-hero-copy" valign="top" width="50%" bgcolor="#07111f" style="width:50%;padding:22px 16px 24px 24px;background:#07111f;">
                    <img class="salkay-logo-hero" src="{{logoUrl}}" width="188" height="106" alt="SALKAY" style="display:block;border:0;width:188px;height:auto;max-width:100%;">
                    <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.12em;text-transform:uppercase;color:#16c7ff;">Web · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                    ${premiumBadge()}
                    ${nightlifePill()}
                    ${heroHeadline(28, 34)}
                    <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#c5d2e0;">Güçlü bir atmosfer, doğru dijital deneyimle daha fazla misafire ulaşır.</p>
                  </td>
                  <td class="salkay-kay" valign="top" width="50%" bgcolor="#081525" style="width:50%;padding:0;background:#081525;">
                    <img class="salkay-hero-photo" src="{{heroUrl}}" width="350" alt="SALKAY — Bar ve gece hayatı için dijital çözümler" style="display:block;border:0;width:100%;height:auto;background-color:#081525;">
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
                          <p style="margin:8px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#B8C3D1;"><span style="color:#16C7FF;">●</span>&nbsp;{{location}}</p>
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
                  ${benefitCellsHtml(BENEFITS)}
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
                ${serviceGridHtml(SERVICES)}
              </table>
            </td>
          </tr>

          ${mainCtaBlockHtml({
            headline: "Barınız dijitalde de fark yaratsın.",
            support: "Size özel kısa bir analiz ve geliştirme önerisi hazırlayalım.",
          })}
          ${signatureBlockHtml()}
          ${footerBlockHtml()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderBarEmail(_source: string, context: CompanyEmailContext) {
  const source = barPremiumSource();
  const serviceChips = `<!--safe-->${recommendedServicesChipsHtml(context.recommendedServices)}`;
  const blocks: Record<string, string> = {
    ...context.vars,
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
