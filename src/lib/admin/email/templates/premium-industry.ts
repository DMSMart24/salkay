import {
  type CompanyEmailContext,
  developmentAreasHtml,
  phoneBlockHtml,
  recommendedServicesChipsHtml,
  scoreBlockHtml,
} from "@/lib/admin/email/context";
import { applyMerge } from "@/lib/admin/email/html";
import type { PremiumIndustryKind } from "@/lib/admin/email/templates/premium-kind";
import {
  PREMIUM_EMAIL_CSS,
  benefitCellsHtml,
  footerBlockHtml,
  introGiftCardHtml,
  mainCtaBlockHtml,
  serviceGridHtml,
  signatureBlockHtml,
} from "@/lib/admin/email/templates/premium-shell";

type CardCopy = readonly [string, string, string, string];

export type IndustryPremiumSpec = {
  kind: PremiumIndustryKind;
  marker: string;
  heroRequired: true;
  templateName: string;
  category: string;
  subject: string;
  heroKicker: string;
  heroHeadline: string;
  preheader: string;
  introLead: string;
  introOpportunity: string;
  ctaHeadline: string;
  ctaSupport: string;
  cardPreview: string;
  composePlaceholder: string;
  benefits: readonly CardCopy[];
  services: readonly CardCopy[];
  companyPhrases: readonly string[];
};

export const INDUSTRY_SUBJECT = "{{companyName}} web sitesi hakkında kısa bir fikir";

export const CONSTRUCTION_SPEC: IndustryPremiumSpec = {
  kind: "construction",
  marker: "construction",
  heroRequired: true,
  templateName: "İNŞAAT — Premium Web Sitesi Analizi",
  category: "İNŞAAT",
  subject: INDUSTRY_SUBJECT,
  heroKicker: "İNŞAAT · PREMIUM DİJİTAL ORTAK",
  heroHeadline: "Projenizin dijital yüzünü birlikte daha etkileyici hale getirelim.",
  preheader:
    "SALKAY. İNŞAAT İÇİN DİJİTAL ÇÖZÜMLER. Projenizin dijital yüzünü birlikte daha etkileyici hale getirelim. {{companyName}} için ücretsiz kısa bir website değerlendirmesi.",
  introLead: "Dijital görünümünüzü sizin için kısaca inceledik.",
  introOpportunity:
    "Projenizin güvenini dijitalde daha güçlü yansıtmak; <strong style=\"font-weight:700;color:#f4f7fb;\">proje sunumunu</strong>, <strong style=\"font-weight:700;color:#f4f7fb;\">referans görünürlüğünü</strong> ve <strong style=\"font-weight:700;color:#f4f7fb;\">teklif sürecini</strong> geliştirmek için bazı fırsatlar gördük.",
  ctaHeadline: "Projeniz dijitalde de güven versin.",
  ctaSupport: "Size özel kısa bir analiz ve geliştirme önerisi hazırlayalım.",
  cardPreview: "İnşaat firmaları için kişiselleştirilmiş website analizi ve ücretsiz geliştirme önerisi.",
  composePlaceholder: "İnşaat premium HTML şablonu gönderimde otomatik kullanılır.",
  benefits: [
    ["01", "✦", "Daha güçlü ilk izlenim", "Projenizin kalitesini dijitalde ilk bakışta daha güçlü yansıtın."],
    ["02", "▣", "Referansları öne çıkarın", "Tamamlanan projeleri daha net ve etkileyici sunun."],
    ["03", "▢", "Daha net teklif süreci", "Potansiyel müşterilerin size daha kolay ulaşmasını sağlayın."],
  ],
  services: [
    ["01", "✦", "Web Tasarımı", "Firmanızın gücünü yansıtan modern web deneyimi."],
    ["02", "▢", "Mobil Uyum", "Telefonlarda hızlı ve kusursuz kullanım."],
    ["03", "▣", "Proje Portföyü", "Devam eden ve tamamlanan projeleri daha net sergileyin."],
    ["04", "●", "Referans Galerisi", "İşlerinizi görsel olarak daha güçlü anlatın."],
    ["05", "▸", "SEO &amp; Google", "Google ve harita sonuçlarında daha güçlü görünürlük."],
    ["06", "✧", "Teklif &amp; İletişim", "Yeni iş taleplerini daha basit bir forma bağlayın."],
  ],
  companyPhrases: ["inşaat", "insaat", "construction", "müteahhit", "muteahhit"],
};

export const ARCHITECTURE_SPEC: IndustryPremiumSpec = {
  kind: "architecture",
  marker: "architecture",
  heroRequired: true,
  templateName: "MİMARLIK — Premium Web Sitesi Analizi",
  category: "MİMARLIK",
  subject: INDUSTRY_SUBJECT,
  heroKicker: "MİMARLIK · PREMIUM DİJİTAL ORTAK",
  heroHeadline: "Ofisinizin dijital portföyünü birlikte daha etkileyici hale getirelim.",
  preheader:
    "SALKAY. MİMARLIK İÇİN DİJİTAL ÇÖZÜMLER. Ofisinizin dijital portföyünü birlikte daha etkileyici hale getirelim. {{companyName}} için ücretsiz kısa bir website değerlendirmesi.",
  introLead: "Dijital görünümünüzü sizin için kısaca inceledik.",
  introOpportunity:
    "Ofisinizin yaklaşımını dijitalde daha güçlü yansıtmak; <strong style=\"font-weight:700;color:#f4f7fb;\">proje portföyünü</strong>, <strong style=\"font-weight:700;color:#f4f7fb;\">görsel sunumu</strong> ve <strong style=\"font-weight:700;color:#f4f7fb;\">iletişim sürecini</strong> geliştirmek için bazı fırsatlar gördük.",
  ctaHeadline: "Ofisiniz dijitalde de fark yaratsın.",
  ctaSupport: "Size özel kısa bir analiz ve geliştirme önerisi hazırlayalım.",
  cardPreview: "Mimarlık ofisleri için kişiselleştirilmiş website analizi ve ücretsiz geliştirme önerisi.",
  composePlaceholder: "Mimarlık premium HTML şablonu gönderimde otomatik kullanılır.",
  benefits: [
    ["01", "✦", "Daha güçlü ilk izlenim", "Ofisinizin çizgisini dijitalde ilk bakışta daha güçlü yansıtın."],
    ["02", "▣", "Portföyü öne çıkarın", "Seçilmiş projeleri daha net ve etkileyici sunun."],
    ["03", "▢", "Daha net iletişim", "Yeni iş taleplerinin size daha kolay ulaşmasını sağlayın."],
  ],
  services: [
    ["01", "✦", "Web Tasarımı", "Ofisinizin dilini yansıtan modern web deneyimi."],
    ["02", "▢", "Mobil Uyum", "Telefonlarda hızlı ve kusursuz kullanım."],
    ["03", "▣", "Proje Portföyü", "Seçilmiş işleri daha güçlü bir akışla sergileyin."],
    ["04", "●", "Proje Sayfaları", "Her projeyi net bir hikâye ile anlatın."],
    ["05", "▸", "SEO &amp; Google", "Google sonuçlarında daha güçlü görünürlük."],
    ["06", "✧", "İletişim", "Yeni iş başvurularını daha basit bir forma bağlayın."],
  ],
  companyPhrases: ["mimarlık", "mimarlik", "architecture"],
};

export const REAL_ESTATE_SPEC: IndustryPremiumSpec = {
  kind: "realEstate",
  marker: "real-estate",
  heroRequired: true,
  templateName: "GAYRİMENKUL — Premium Web Sitesi Analizi",
  category: "GAYRİMENKUL",
  subject: INDUSTRY_SUBJECT,
  heroKicker: "GAYRİMENKUL · PREMIUM DİJİTAL ORTAK",
  heroHeadline: "Portföyünüzün dijital yüzünü birlikte daha etkileyici hale getirelim.",
  preheader:
    "SALKAY. GAYRİMENKUL İÇİN DİJİTAL ÇÖZÜMLER. Portföyünüzün dijital yüzünü birlikte daha etkileyici hale getirelim. {{companyName}} için ücretsiz kısa bir website değerlendirmesi.",
  introLead: "Dijital görünümünüzü sizin için kısaca inceledik.",
  introOpportunity:
    "Portföyünüzü dijitalde daha güçlü yansıtmak; <strong style=\"font-weight:700;color:#f4f7fb;\">ilan görünürlüğünü</strong>, <strong style=\"font-weight:700;color:#f4f7fb;\">mobil deneyimi</strong> ve <strong style=\"font-weight:700;color:#f4f7fb;\">iletişim sürecini</strong> geliştirmek için bazı fırsatlar gördük.",
  ctaHeadline: "Portföyünüz dijitalde daha güçlü görünsün.",
  ctaSupport: "Size özel kısa bir analiz ve geliştirme önerisi hazırlayalım.",
  cardPreview: "Gayrimenkul firmaları için kişiselleştirilmiş website analizi ve ücretsiz geliştirme önerisi.",
  composePlaceholder: "Gayrimenkul premium HTML şablonu gönderimde otomatik kullanılır.",
  benefits: [
    ["01", "✦", "Daha güçlü ilk izlenim", "Ofisinizin güvenini dijitalde ilk bakışta daha güçlü yansıtın."],
    ["02", "▣", "İlanları öne çıkarın", "Portföyü daha net ve hızlı taranabilir hale getirin."],
    ["03", "▢", "Daha hızlı iletişim", "Alıcı ve satıcıların size daha kolay ulaşmasını sağlayın."],
  ],
  services: [
    ["01", "✦", "Web Tasarımı", "Markanızın güvenini yansıtan modern web deneyimi."],
    ["02", "▢", "Mobil Uyum", "Telefonlarda hızlı ve kusursuz kullanım."],
    ["03", "▣", "İlan Portföyü", "Mülkleri daha net filtreleyip sergileyin."],
    ["04", "●", "Harita &amp; Konum", "Bölge ve konum bilgisini daha görünür hale getirin."],
    ["05", "▸", "SEO &amp; Google", "Google ve harita sonuçlarında daha güçlü görünürlük."],
    ["06", "✧", "İletişim", "Talep formunu daha basit ve hızlı hale getirin."],
  ],
  companyPhrases: ["gayrimenkul", "real estate", "emlak"],
};

export const HOTEL_SPEC: IndustryPremiumSpec = {
  kind: "hotel",
  marker: "hotel",
  heroRequired: true,
  templateName: "OTEL — Premium Web Sitesi Analizi",
  category: "OTEL",
  subject: INDUSTRY_SUBJECT,
  heroKicker: "OTEL · PREMIUM DİJİTAL ORTAK",
  heroHeadline: "Otelinizin dijital atmosferini birlikte daha etkileyici hale getirelim.",
  preheader:
    "SALKAY. OTELLER İÇİN DİJİTAL ÇÖZÜMLER. Otelinizin dijital atmosferini birlikte daha etkileyici hale getirelim. {{companyName}} için ücretsiz kısa bir website değerlendirmesi.",
  introLead: "Dijital görünümünüzü sizin için kısaca inceledik.",
  introOpportunity:
    "Otelinizin atmosferini dijitalde daha güçlü yansıtmak; <strong style=\"font-weight:700;color:#f4f7fb;\">mobil deneyimi</strong>, <strong style=\"font-weight:700;color:#f4f7fb;\">rezervasyon sürecini</strong> ve <strong style=\"font-weight:700;color:#f4f7fb;\">oda sunumunu</strong> geliştirmek için bazı fırsatlar gördük.",
  ctaHeadline: "Oteliniz dijitalde de fark yaratsın.",
  ctaSupport: "Size özel kısa bir analiz ve geliştirme önerisi hazırlayalım.",
  cardPreview: "Oteller için kişiselleştirilmiş website analizi ve ücretsiz geliştirme önerisi.",
  composePlaceholder: "Otel premium HTML şablonu gönderimde otomatik kullanılır.",
  benefits: [
    ["01", "✦", "Daha güçlü ilk izlenim", "Otelinizin atmosferini dijitalde ilk bakışta daha güçlü yansıtın."],
    ["02", "▣", "Daha kolay rezervasyon", "Misafirlerin oda rezervasyonuna daha hızlı ulaşmasını sağlayın."],
    ["03", "▢", "Odaları öne çıkarın", "Oda ve deneyim sunumunu daha görünür hale getirin."],
  ],
  services: [
    ["01", "✦", "Web Tasarımı", "Otelinizin atmosferini yansıtan modern web deneyimi."],
    ["02", "▢", "Mobil Uyum", "Telefonlarda hızlı ve kusursuz kullanım."],
    ["03", "▣", "Rezervasyon", "Oda rezervasyonunu daha basit hale getiren akışlar."],
    ["04", "●", "Oda Sunumu", "Odaları ve deneyimleri daha güçlü sergileyin."],
    ["05", "▸", "SEO &amp; Google", "Google ve harita sonuçlarında daha güçlü görünürlük."],
    ["06", "✧", "Sosyal Medya", "Sosyal medya içeriklerini dijital deneyime bağlayın."],
  ],
  companyPhrases: ["otel", "oteller", "hotel", "hotels"],
};

export const AUTOMOTIVE_SPEC: IndustryPremiumSpec = {
  kind: "automotive",
  marker: "automotive",
  heroRequired: true,
  templateName: "OTOMOTİV — Premium Web Sitesi Analizi",
  category: "OTOMOTİV",
  subject: INDUSTRY_SUBJECT,
  heroKicker: "OTOMOTİV · PREMIUM DİJİTAL ORTAK",
  heroHeadline: "Showroomunuzun dijital yüzünü birlikte daha etkileyici hale getirelim.",
  preheader:
    "SALKAY. OTOMOTİV İÇİN DİJİTAL ÇÖZÜMLER. Showroomunuzun dijital yüzünü birlikte daha etkileyici hale getirelim. {{companyName}} için ücretsiz kısa bir website değerlendirmesi.",
  introLead: "Dijital görünümünüzü sizin için kısaca inceledik.",
  introOpportunity:
    "Showroomunuzun gücünü dijitalde daha güçlü yansıtmak; <strong style=\"font-weight:700;color:#f4f7fb;\">stok sunumunu</strong>, <strong style=\"font-weight:700;color:#f4f7fb;\">mobil deneyimi</strong> ve <strong style=\"font-weight:700;color:#f4f7fb;\">randevu sürecini</strong> geliştirmek için bazı fırsatlar gördük.",
  ctaHeadline: "Showroomunuz dijitalde de fark yaratsın.",
  ctaSupport: "Size özel kısa bir analiz ve geliştirme önerisi hazırlayalım.",
  cardPreview: "Otomotiv firmaları için kişiselleştirilmiş website analizi ve ücretsiz geliştirme önerisi.",
  composePlaceholder: "Otomotiv premium HTML şablonu gönderimde otomatik kullanılır.",
  benefits: [
    ["01", "✦", "Daha güçlü ilk izlenim", "Showroomunuzun kalitesini dijitalde ilk bakışta daha güçlü yansıtın."],
    ["02", "▣", "Stoğu öne çıkarın", "Araç ve modelleri daha net sergileyin."],
    ["03", "▢", "Daha kolay randevu", "Müşterilerin size daha hızlı ulaşmasını sağlayın."],
  ],
  services: [
    ["01", "✦", "Web Tasarımı", "Markanızın gücünü yansıtan modern web deneyimi."],
    ["02", "▢", "Mobil Uyum", "Telefonlarda hızlı ve kusursuz kullanım."],
    ["03", "▣", "Stok &amp; Model", "Araç stoğunu daha net ve taranabilir sunun."],
    ["04", "●", "Randevu", "Test sürüşü ve servis talebini daha basit hale getirin."],
    ["05", "▸", "SEO &amp; Google", "Google ve harita sonuçlarında daha güçlü görünürlük."],
    ["06", "✧", "Sosyal Medya", "Sosyal medya içeriklerini dijital deneyime bağlayın."],
  ],
  companyPhrases: ["otomotiv", "automotive"],
};

export const INDUSTRY_SPECS: Record<PremiumIndustryKind, IndustryPremiumSpec> = {
  construction: CONSTRUCTION_SPEC,
  architecture: ARCHITECTURE_SPEC,
  realEstate: REAL_ESTATE_SPEC,
  hotel: HOTEL_SPEC,
  automotive: AUTOMOTIVE_SPEC,
};

export function industrySpec(kind: PremiumIndustryKind) {
  return INDUSTRY_SPECS[kind];
}

export function classifyIndustryHay(input: {
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

export function isIndustryCompany(
  spec: IndustryPremiumSpec,
  input: {
    industry?: string | null;
    groupName?: string | null;
    groupIndustry?: string | null;
    category?: string | null;
  },
) {
  const hay = classifyIndustryHay(input);
  if (!hay) return false;
  return spec.companyPhrases.some((phrase) => hay.includes(phrase));
}

function industryHeroPlaceholderHtml(spec: IndustryPremiumSpec) {
  return `
          <tr>
            <td bgcolor="#07111F" class="salkay-pad" style="background:#07111F;padding:36px 28px 32px;border-top:3px solid #d5aa62;">
              <!-- salkay-hero:required:${spec.marker} -->
              <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#d5aa62;">${spec.heroKicker}</p>
              <h1 style="margin:0 0 16px;font-family:Georgia,Times,serif;font-size:28px;line-height:36px;color:#ffffff;font-weight:700;">${spec.heroHeadline}</h1>
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr><td width="50" height="2" bgcolor="#16c7ff" style="background:#16c7ff;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>`;
}

function personalizedIntro(spec: IndustryPremiumSpec) {
  return `
                    <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;letter-spacing:0.16em;text-transform:uppercase;color:#d5aa62;white-space:nowrap;">
                      <span style="color:#16c7ff;">●</span>&nbsp;&nbsp;SİZE ÖZEL · KISA WEB İNCELEMESİ
                    </p>
                    <h2 class="salkay-intro-title" style="margin:0 0 14px;font-family:Georgia,Times,serif;font-size:24px;line-height:32px;color:#ffffff;font-weight:700;">
                      <span class="salkay-hello" style="display:block;color:#ffffff;">Merhaba</span>
                      <span class="salkay-hello-name" style="display:block;"><span style="color:#16c7ff;">{{companyName}}</span>&nbsp;<span style="color:#ffffff;">Ekibi</span>&nbsp;👋</span>
                    </h2>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 18px;">
                      <tr><td width="50" height="2" bgcolor="#d5aa62" style="background:#d5aa62;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:#e8edf5;">${spec.introLead}</p>
                    <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:#e8edf5;">${spec.introOpportunity}</p>
                    ${introGiftCardHtml()}`;
}

export function industryPremiumSource(spec: IndustryPremiumSpec) {
  return `<!-- salkay-email:${spec.marker} -->
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
    ${spec.preheader}
  </div>
  <table class="salkay-wrap" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07111f;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:16px 8px;">
        <table role="presentation" class="salkay-container" width="700" cellpadding="0" cellspacing="0" style="width:700px;max-width:700px;border-collapse:collapse;background:#081526;">
${industryHeroPlaceholderHtml(spec)}
          <tr>
            <td bgcolor="#07111F" class="salkay-pad salkay-intro-wrap" style="background:#07111F;padding:16px 20px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td class="salkay-intro" valign="top" width="48%" style="width:48%;padding-right:22px;">
                    <table role="presentation" class="salkay-intro-card" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0B1729" style="border-collapse:separate;background:#0B1729;border:1px solid #4A3F2E;border-color:rgba(213,170,98,0.35);border-radius:10px;">
                      <tr>
                        <td bgcolor="#0B1729" style="background:#0B1729;padding:22px 20px 20px;border-radius:10px;">
                          ${personalizedIntro(spec)}
                        </td>
                      </tr>
                    </table>
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
            <td bgcolor="#07111F" class="salkay-pad salkay-benefits-wrap" style="background:#07111F;padding:8px 24px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  ${benefitCellsHtml(spec.benefits)}
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
                ${serviceGridHtml(spec.services)}
              </table>
            </td>
          </tr>

          ${mainCtaBlockHtml({
            headline: spec.ctaHeadline,
            support: spec.ctaSupport,
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

export function renderIndustryEmail(spec: IndustryPremiumSpec, context: CompanyEmailContext) {
  const source = industryPremiumSource(spec);
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
