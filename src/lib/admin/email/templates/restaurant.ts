import { site } from "@/lib/site";
import { type CompanyEmailContext } from "@/lib/admin/email/context";
import { applyMerge, escapeHtml } from "@/lib/admin/email/html";
import { resolvePremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";
import { websiteScoreBand, type WebsiteScoreBand } from "@/lib/admin/qualification";

export const RESTAURANT_TEMPLATE_NAME = "RESTORAN — Premium Web Sitesi Analizi";
export const RESTAURANT_TEMPLATE_SUBJECT = "{{companyName}} için kısa bir web analizi";
export const RESTAURANT_TEMPLATE_SUBJECT_ALT = "{{companyName}} web sitesi için 3 geliştirme fikri";

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

const MAIL_SCORE_BANDS: Record<WebsiteScoreBand, string> = {
  VERY_WEAK: "GELİŞİM POTANSİYELİ YÜKSEK",
  WEAK: "GELİŞTİRİLEBİLİR",
  IMPROVABLE: "İYİLEŞTİRİLEBİLİR",
  GOOD: "İYİ",
  VERY_GOOD: "ÇOK İYİ",
};

const NO_WEBSITE_OPPORTUNITIES = [
  "Marka odaklı web sitesi",
  "Mobil rezervasyon / WhatsApp akışı",
  "Google ve Local SEO görünürlüğü",
] as const;

type ImproveCard = { title: string; body: string };

function restaurantMailBand(scoreLabel: string) {
  const numeric = Number(scoreLabel.replace(",", "."));
  if (!Number.isFinite(numeric)) return "";
  return MAIL_SCORE_BANDS[websiteScoreBand(numeric)];
}

function editorialScoreBar(score: number) {
  const cells = Array.from({ length: 10 }, (_, index) => {
    const on = index < score;
    return `<td width="24" height="8" bgcolor="${on ? "#16C7FF" : "#2A3B52"}" style="width:24px;height:8px;background:${on ? "#16C7FF" : "#2A3B52"};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>`;
  }).join(`<td width="5" style="width:5px;font-size:0;line-height:0;">&nbsp;</td>`);
  return `<table class="salkay-score-bar" role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0 0;">
    <tr>${cells}</tr>
  </table>`;
}

function numberedRows(items: string[], className: string) {
  return items
    .map((item, index) => {
      const last = index === items.length - 1;
      const num = String(index + 1).padStart(2, "0");
      return `<tr class="${className}">
        <td style="padding:${index === 0 ? "2px" : "12px"} 0 ${last ? "2px" : "12px"};border-bottom:${last ? "none" : "1px solid #1E3148"};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td valign="top" width="32" style="width:32px;padding:1px 12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;letter-spacing:0.1em;color:#16C7FF;font-weight:700;">${num}</td>
              <td valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#F4F7FB;">${escapeHtml(item)}</td>
            </tr>
          </table>
        </td>
      </tr>`;
    })
    .join("");
}

function restaurantScoreBlockHtml(context: CompanyEmailContext) {
  if (context.noWebsite) {
    return `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#D5AA62;">DİJİTAL FIRSAT</p>
    <p style="margin:0 0 10px;font-family:Georgia,Times,serif;font-size:20px;line-height:26px;color:#FFFFFF;font-weight:700;">Bağımsız web sitesi bulunamadı</p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#B8C3D1;">Markanızın Google ve sosyal medya dışında güçlü, bağımsız bir dijital deneyim oluşturması için önemli bir fırsat görüyoruz.</p>`;
  }

  if (!context.hasScore) {
    return `<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#D5AA62;">DİJİTAL FIRSAT</p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#B8C3D1;">Web sitenizin dijital deneyim tarafında değerlendirebileceğimiz geliştirme fırsatları bulunuyor.</p>`;
  }

  const numericScore = Number(context.scoreLabel.replace(",", "."));
  const scoreText = escapeHtml(context.scoreLabel);
  const band = escapeHtml(restaurantMailBand(context.scoreLabel) || "GELİŞTİRİLEBİLİR");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 0;">
      <tr>
        <td style="padding:14px 0 2px;border-top:1px solid #1E3148;">
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.2em;text-transform:uppercase;color:#D5AA62;">DİJİTAL WEB SKORU</p>
          <p class="salkay-score-num" style="margin:0;font-family:Georgia,Times,serif;font-size:52px;line-height:54px;color:#16C7FF;font-weight:700;">${scoreText}<span style="font-size:16px;line-height:54px;color:#8EA0B8;font-weight:400;font-family:Arial,Helvetica,sans-serif;">&nbsp;/&nbsp;10</span></p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:10px 0 0;">
            <tr>
              <td bgcolor="#0B1729" style="background:#0B1729;border:1px solid #D5AA62;border-radius:4px;padding:6px 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.1em;text-transform:uppercase;color:#D5AA62;">${band}</td>
            </tr>
          </table>
          ${Number.isFinite(numericScore) ? editorialScoreBar(numericScore) : ""}
          <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#B8C3D1;">Tasarım, mobil kullanıcı deneyimi, navigasyon ve dönüşüm akışını incelediğimizde markanız için geliştirme potansiyeli gördük.</p>
        </td>
      </tr>
    </table>`;
}

function restaurantAnalysisHtml(context: CompanyEmailContext) {
  const items = context.noWebsite
    ? [...NO_WEBSITE_OPPORTUNITIES]
    : context.customerIssues.map((item) => item.trim()).filter(Boolean).slice(0, 3);
  if (items.length === 0) return "";
  const heading = context.noWebsite ? "DİJİTAL FIRSAT NOKTALARI" : "KISA ANALİZ";
  return `<p style="margin:18px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#D5AA62;">${heading}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${numberedRows(items, "salkay-analysis-item")}
    </table>`;
}

function improvementFromService(service: string): ImproveCard {
  const key = service.toLocaleLowerCase("tr");
  if (/rezerv|whatsapp|telefon/.test(key)) {
    return {
      title: "Kolay Rezervasyon",
      body: "WhatsApp, telefon ve rezervasyon aksiyonlarına daha kısa kullanıcı yolu.",
    };
  }
  if (/seo|google|mobil|ux/.test(key)) {
    return {
      title: "Mobil &amp; Google Deneyimi",
      body: "Mobil ziyaretçiler ve Google üzerinden gelen kullanıcılar için daha güçlü yönlendirme.",
    };
  }
  if (/hikâye|hikaye|içerik|content/.test(key)) {
    return {
      title: "Marka &amp; İçerik",
      body: "Mekânın atmosferini ve hikâyesini daha net anlatan içerik.",
    };
  }
  return {
    title: "Premium Web Deneyimi",
    body: "Markanızın atmosferini ve kalitesini daha güçlü yansıtan modern tasarım.",
  };
}

function restaurantImprovementsHtml(context: CompanyEmailContext) {
  const cards: ImproveCard[] = [];
  const seen = new Set<string>();
  for (const service of context.recommendedServices) {
    const card = improvementFromService(service);
    if (seen.has(card.title)) continue;
    seen.add(card.title);
    cards.push(card);
    if (cards.length === 3) break;
  }
  if (cards.length === 0) return "";

  const rows = cards
    .map((card, index) => {
      const last = index === cards.length - 1;
      const num = String(index + 1).padStart(2, "0");
      return `<tr class="salkay-improve-item">
        <td style="padding:${index === 0 ? "2px" : "12px"} 0 ${last ? "2px" : "12px"};border-bottom:${last ? "none" : "1px solid #1E3148"};">
          <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:21px;color:#FFFFFF;font-weight:700;"><span style="color:#16C7FF;letter-spacing:0.08em;font-size:13px;">${num}</span>&nbsp;&nbsp;${card.title}</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#B8C3D1;">${card.body}</p>
        </td>
      </tr>`;
    })
    .join("");

  return `<p style="margin:18px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.12em;text-transform:uppercase;color:#D5AA62;">SİZİN İÇİN ÖNERDİĞİMİZ GELİŞTİRMELER</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${rows}
    </table>`;
}

function gastronomyPill() {
  return `
                                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:10px;">
                                  <tr>
                                    <td bgcolor="#081525" style="background:#081525;border:1px solid #d5aa62;border-radius:16px;padding:5px 11px;">
                                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:15px;color:#f8f3ea;">Restoranlar için Web Tasarım &amp; Dijital Büyüme</p>
                                    </td>
                                  </tr>
                                </table>`;
}

function heroHeadline(size: number, line: number) {
  return `<h1 style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:${size}px;line-height:${line}px;color:#ffffff;font-weight:700;">Restoranınızın<br>dijital yüzünü<br>birlikte daha<br><span style="color:#16c7ff;font-family:Georgia,Times,serif;font-style:italic;border-bottom:2px solid #16c7ff;">etkileyici</span> hale getirelim.</h1>`;
}

function personalizedIntro() {
  return `
                    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.18em;color:#d5aa62;white-space:nowrap;">
                      <span style="color:#16c7ff;">●</span>&nbsp;&nbsp;SİZE ÖZEL · KISA WEB İNCELEMESİ
                    </p>
                    <h2 class="salkay-intro-title" style="margin:0 0 12px;font-family:Georgia,Times,serif;font-size:24px;line-height:32px;color:#07111f;font-weight:700;">
                      <span class="salkay-hello" style="display:block;">Merhaba</span>
                      <span class="salkay-hello-name" style="display:block;"><span style="color:#d5aa62;">{{companyName}}</span>&nbsp;Ekibi&nbsp;👋</span>
                    </h2>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 14px;">
                      <tr><td width="50" height="2" bgcolor="#d5aa62" style="background:#d5aa62;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#07111f;">{{analysisIntro}}</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#07111f;">{{companyName}}’in dijital tarafta daha güçlü bir marka deneyimi sunabileceği bazı geliştirme fırsatları gördük.</p>`;
}

function mobileHero() {
  return `
          <!--[if !mso]><!-->
          <tr class="salkay-hero-mobile">
            <td class="salkay-hero-mobile-cell" bgcolor="#07111f" style="display:none;max-height:0;background:#07111f;border-top:3px solid #d5aa62;padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#07111f;">
                <tr>
                  <td class="salkay-pad" bgcolor="#07111f" style="background:#07111f;padding:10px 20px 10px;">
                    <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:0.18em;color:#D5AA62;font-weight:700;">SALKAY</p>
                    <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#16C7FF;">Web Tasarım · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#C5D2E0;">Restoranlar için Web Tasarım &amp; Dijital Büyüme</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#F4F7FB;">Harika bir restoran deneyimi, güçlü bir dijital vitrinle başlar.</p>
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
<title>{{companyName}} için kısa bir web analizi</title>
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
    .salkay-intro-wrap { padding: 22px 20px 18px !important; }
    .salkay-hello,
    .salkay-hello-name { display: block !important; }
    .salkay-intro-title { font-size: 22px !important; line-height: 30px !important; }
    .salkay-hero-desktop { display: none !important; max-height: 0 !important; overflow: hidden !important; }
    .salkay-hero-mobile { display: table-row !important; max-height: none !important; overflow: visible !important; }
    .salkay-hero-mobile-cell {
      display: table-cell !important;
      max-height: none !important;
      overflow: visible !important;
      font-size: inherit !important;
      line-height: inherit !important;
    }
    .salkay-hero-copy, .salkay-kay, .salkay-sign-logo, .salkay-sign-contact { display: block !important; width: 100% !important; }
    .salkay-hero-photo { width: 100% !important; height: auto !important; }
    .salkay-audit-card { padding: 22px 18px !important; }
    .salkay-score-num { font-size: 48px !important; line-height: 52px !important; }
    .salkay-cta-wrap { padding: 8px 18px 6px !important; background: #07111F !important; }
    .salkay-cta-inner { padding: 20px 16px 18px !important; }
    .salkay-cta-btn-wrap { width: 92% !important; }
    .salkay-cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
    .salkay-sign-wrap { padding: 6px 18px 12px !important; background: #F8F3EA !important; }
    .salkay-sign-head { padding: 14px 16px 0 !important; }
    .salkay-sign-logo { padding: 10px 16px 6px !important; }
    .salkay-sign-contact { padding: 0 16px 14px !important; }
    .salkay-footer { padding: 14px 18px 18px !important; text-align: center !important; }
  }
</style>
</head>
<body class="salkay-body" style="margin:0;padding:0;background:#07111f;color:#f8f3ea;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    SALKAY. {{companyName}} için kısa bir web analizi ve üç geliştirme fikri.
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
                  <td class="salkay-pad salkay-hero-copy" valign="top" width="50%" bgcolor="#07111f" style="width:50%;padding:18px 16px 20px 24px;background:#07111f;">
                    <img class="salkay-logo-hero" src="{{logoUrl}}" width="168" height="95" alt="SALKAY" style="display:block;border:0;width:168px;height:auto;max-width:100%;">
                    <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;color:#16c7ff;">Web Tasarım · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                    ${gastronomyPill()}
                    ${heroHeadline(26, 32)}
                    <p style="margin:12px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#c5d2e0;">Harika bir restoran deneyimi, güçlü bir dijital vitrinle başlar.</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;letter-spacing:0.04em;color:#8EA0B8;">Web Tasarım · Rezervasyon · Mobil Deneyim · Dijital Büyüme</p>
                  </td>
                  <td class="salkay-kay" valign="top" width="50%" bgcolor="#081525" style="width:50%;padding:0;background:#081525;">
                    <img class="salkay-hero-photo" src="{{heroUrl}}" width="350" alt="KAY restoran masasında" style="display:block;border:0;width:100%;height:auto;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="#f8f3ea" class="salkay-pad salkay-intro-wrap" style="background:#f8f3ea;padding:28px 28px 22px;">
              ${personalizedIntro()}
            </td>
          </tr>

          <tr>
            <td bgcolor="#f8f3ea" class="salkay-pad" style="background:#f8f3ea;padding:0 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07111F" style="border-collapse:collapse;background:#07111F;border:1px solid #1E3A54;">
                <tr>
                  <td class="salkay-audit-card" bgcolor="#07111F" style="background:#07111F;padding:26px 24px;">
                    <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.18em;text-transform:uppercase;color:#D5AA62;">WEB SİTESİ İNCELEMESİ</p>
                    <p style="margin:0;font-family:Georgia,Times,serif;font-size:24px;line-height:30px;color:#FFFFFF;font-weight:700;">{{companyName}}</p>
                    <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#B8C3D1;"><span style="color:#16C7FF;">●</span>&nbsp;{{district}}{{locationSep}}{{city}}</p>
                    {{scoreBlock}}
                    {{issuesBlock}}
                    {{recommendedServicesBlock}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad salkay-cta-wrap" bgcolor="#07111F" style="background:#07111F;padding:10px 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#07111F" style="border-collapse:separate;background:#07111F;border:1px solid #D5AA62;border-radius:10px;">
                <tr>
                  <td width="4" bgcolor="#16C7FF" style="width:4px;background:#16C7FF;border-radius:10px 0 0 10px;font-size:0;line-height:0;">&nbsp;</td>
                  <td class="salkay-cta-inner" bgcolor="#07111F" align="center" style="background:#07111F;padding:22px 24px 20px;border-radius:0 10px 10px 0;">
                    <p style="margin:0 0 14px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#FFFFFF;font-weight:700;">Size özel hazırladığımız geliştirme fikirlerini ücretsiz paylaşalım.</p>
                    <table role="presentation" class="salkay-cta-btn-wrap" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse;">
                      <tr>
                        <td bgcolor="#D5AA62" align="center" style="background:#D5AA62;border-radius:28px;">
                          <a class="salkay-cta-btn" href="{{ctaUrl}}" style="display:inline-block;padding:15px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#07111F;text-decoration:none;font-weight:700;">Ücretsiz Web Analizini Konuşalım →</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad salkay-sign-wrap" bgcolor="#F8F3EA" style="background:#F8F3EA;padding:8px 28px 14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="border-collapse:separate;background:#FFFFFF;border:1px solid #D5AA62;border-radius:10px;">
                <tr>
                  <td class="salkay-sign-head" bgcolor="#FFFFFF" style="background:#FFFFFF;padding:16px 18px 0;border-radius:10px 10px 0 0;">
                    <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#5A6A7C;">İyi çalışmalar,</p>
                    <p style="margin:0 0 8px;font-family:Georgia,Times,serif;font-size:22px;line-height:28px;color:#07111F;">Salih Kaya</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr><td width="36" height="2" bgcolor="#D5AA62" style="background:#D5AA62;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#FFFFFF" style="background:#FFFFFF;padding:10px 18px 14px;border-radius:0 0 10px 10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td class="salkay-sign-logo" valign="middle" width="30%" style="width:30%;padding:0 12px 0 0;">
                          <img src="{{logoUrl}}" width="72" height="41" alt="SALKAY" style="display:block;border:0;width:72px;height:auto;max-width:72px;">
                        </td>
                        <td class="salkay-sign-contact" valign="middle" width="70%" style="width:70%;padding:0;">
                          <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:0.14em;color:#07111F;font-weight:700;">SALKAY</p>
                          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#5A6A7C;">Web Tasarım · Yazılım · Yapay Zekâ · Dijital Büyüme</p>
                          <p style="margin:0 0 1px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;"><a href="mailto:info@salkay.com" style="color:#16C7FF;text-decoration:none;">info@salkay.com</a></p>
                          <p style="margin:0 0 1px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;"><a href="${site.url}" style="color:#16C7FF;text-decoration:none;">salkay.com</a></p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:19px;color:#16C7FF;">${site.whatsappDisplay}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="salkay-pad salkay-footer" bgcolor="#07111F" align="center" style="background:#07111F;padding:16px 24px 20px;text-align:center;">
              <p style="margin:0 0 6px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:0.28em;color:#D5AA62;font-weight:700;">S A L K A Y</p>
              <p style="margin:0 0 8px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8EA0B8;">
                İstanbul, Türkiye
                &nbsp;·&nbsp;
                <a href="mailto:info@salkay.com" style="color:#16C7FF;text-decoration:none;">info@salkay.com</a>
                &nbsp;·&nbsp;
                <a href="${site.url}" style="color:#B8C3D1;text-decoration:none;">salkay.com</a>
              </p>
              <p style="margin:0 0 6px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#8EA0B8;">Bu e-posta {{companyName}} ekibine özel hazırlanmıştır.</p>
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
  const blocks: Record<string, string> = {
    ...context.vars,
    locationSep,
    scoreBlock: `<!--safe-->${restaurantScoreBlockHtml(context)}`,
    issuesBlock: `<!--safe-->${restaurantAnalysisHtml(context)}`,
    recommendedServices: "",
    recommendedServicesBlock: `<!--safe-->${restaurantImprovementsHtml(context)}`,
    recommendedLine: "",
    ctaNote: "",
  };

  return applyMerge(source, blocks, true);
}
