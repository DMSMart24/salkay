import type { CompanyEmailContext } from "@/lib/admin/email/context";
import type { CustomerWebsiteCopyKind } from "@/lib/admin/email/website-copy";
import type { PremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";

export type OpportunityCard = { title: string; body: string };

export type OutreachCopySpec = {
  kind: Exclude<PremiumEmailKind, "custom">;
  marker: string;
  templateName: string;
  category: string;
  subject: string;
  preheader: string;
  eyebrow: string;
  composePlaceholder: string;
  followOn: Record<CustomerWebsiteCopyKind, string>;
  offer: string;
  ctaLabel: string;
  defaultOpportunities: readonly OpportunityCard[];
  mapOpportunity: (service: string) => OpportunityCard;
};

const CTA_LABEL = "Ücretsiz örneği görmek istiyorum";

function restaurantOpportunity(service: string): OpportunityCard {
  const key = service.toLocaleLowerCase("tr");
  if (/rezerv|whatsapp|telefon/.test(key)) {
    return {
      title: "Rezervasyon akışı",
      body: "Misafirin masaya veya WhatsApp’a daha az adımda ulaşması.",
    };
  }
  if (/seo|google|yerel|local/.test(key)) {
    return {
      title: "Yerel görünürlük",
      body: "Bölge aramalarında ve haritada daha net bulunmak.",
    };
  }
  if (/mobil|ux/.test(key)) {
    return {
      title: "Mobil deneyim",
      body: "Telefonda menü, adres ve iletişim ilk bakışta net olsun.",
    };
  }
  if (/menü|menu|hikâye|hikaye|içerik|atmosfer/.test(key)) {
    return {
      title: "Menü ve atmosfer",
      body: "Mekânın tadını ve menüyü dijitalde daha inandırıcı anlatmak.",
    };
  }
  return {
    title: "Dijital vitrin",
    body: "Restoranınızın kalitesini ilk ekranda daha sakin ve net göstermek.",
  };
}

function barOpportunity(service: string): OpportunityCard {
  const key = service.toLocaleLowerCase("tr");
  if (/etkinlik|event|dj/.test(key)) {
    return {
      title: "Etkinlik görünürlüğü",
      body: "Gecelerin ve programın sitede daha kolay takip edilmesi.",
    };
  }
  if (/rezerv|masa/.test(key)) {
    return {
      title: "Masa rezervasyonu",
      body: "Yoğun gecede masaya daha kısa ve net bir yol.",
    };
  }
  if (/sosyal|instagram|social/.test(key)) {
    return {
      title: "Sosyal medya akışı",
      body: "Instagram’dan siteye gelen misafiri kaybetmeden karşılamak.",
    };
  }
  if (/seo|google|harita|maps|konum/.test(key)) {
    return {
      title: "Konum ve harita",
      body: "“Yakınımda bar” aramasında adresi ve yolu daha görünür kılmak.",
    };
  }
  if (/mobil|ux/.test(key)) {
    return {
      title: "Mobil ilk izlenim",
      body: "Gece planı telefon üzerinden hızla netleşsin.",
    };
  }
  return {
    title: "Mekân atmosferi",
    body: "Işık, müzik ve karakterin dijitalde de hissedilmesi.",
  };
}

function constructionOpportunity(service: string): OpportunityCard {
  const key = service.toLocaleLowerCase("tr");
  if (/portföy|proje/.test(key)) {
    return {
      title: "Proje sunumu",
      body: "Devam eden ve biten işlerin daha düzenli ve inandırıcı anlatılması.",
    };
  }
  if (/referans/.test(key)) {
    return {
      title: "Referanslar",
      body: "Tamamlanan işlerin güven verecek şekilde öne çıkarılması.",
    };
  }
  if (/teklif|iletişim|form/.test(key)) {
    return {
      title: "Teklif süreci",
      body: "Yeni iş talebinin size daha az sürtünmeyle ulaşması.",
    };
  }
  if (/seo|google/.test(key)) {
    return {
      title: "Google görünürlüğü",
      body: "Bölgedeki proje aramalarında firmanızın daha net bulunması.",
    };
  }
  if (/mobil|ux/.test(key)) {
    return {
      title: "Mobil güven",
      body: "Telefonda da ciddi, okunaklı bir ilk izlenim.",
    };
  }
  return {
    title: "Dijital güven",
    body: "Şantiyedeki iş disiplininin sitede de hissedilmesi.",
  };
}

function architectureOpportunity(service: string): OpportunityCard {
  const key = service.toLocaleLowerCase("tr");
  if (/portföy|proje/.test(key)) {
    return {
      title: "Portföy akışı",
      body: "Seçilmiş işlerin daha sakin ve güçlü bir sırayla okunması.",
    };
  }
  if (/hikâye|hikaye|içerik/.test(key)) {
    return {
      title: "Proje hikâyesi",
      body: "Her işin bağlamını kısa ve net anlatmak.",
    };
  }
  if (/iletişim|form/.test(key)) {
    return {
      title: "İletişim kalitesi",
      body: "Yeni iş başvurusunun ofise daha kolay ulaşması.",
    };
  }
  if (/seo|google/.test(key)) {
    return {
      title: "Arama görünürlüğü",
      body: "Ofisinizin doğru aramalarda daha sakin ve net bulunması.",
    };
  }
  if (/mobil|ux/.test(key)) {
    return {
      title: "Mobil portföy",
      body: "Projelerin telefonda da bozulmadan görünmesi.",
    };
  }
  return {
    title: "Görsel dil",
    body: "Ofisin çizgisini ilk bakışta daha ölçülü yansıtmak.",
  };
}

function realEstateOpportunity(service: string): OpportunityCard {
  const key = service.toLocaleLowerCase("tr");
  if (/ilan|listing|portföy/.test(key)) {
    return {
      title: "İlan sunumu",
      body: "Mülklerin daha hızlı taranabilir ve güven veren şekilde durması.",
    };
  }
  if (/iletişim|form|lead/.test(key)) {
    return {
      title: "İletişim",
      body: "Alıcı ve satıcının size daha kısa yoldan ulaşması.",
    };
  }
  if (/seo|google|harita|local|yerel/.test(key)) {
    return {
      title: "Yerel arama",
      body: "Bölge ve konum aramalarında ofisinizin daha net görünmesi.",
    };
  }
  if (/mobil|ux/.test(key)) {
    return {
      title: "Mobil iletişim",
      body: "Telefonda ilan ve iletişim adımlarının daha sade olması.",
    };
  }
  return {
    title: "Güven hissi",
    body: "Ofisin ciddiyetini dijitalde daha sakin göstermek.",
  };
}

function hotelOpportunity(service: string): OpportunityCard {
  const key = service.toLocaleLowerCase("tr");
  if (/rezerv|booking|oda/.test(key)) {
    return {
      title: "Rezervasyon yolu",
      body: "Misafirin size ulaşması için daha net ve kısa bir adım.",
    };
  }
  if (/seo|google|harita|maps|local|yerel/.test(key)) {
    return {
      title: "Harita ve keşif",
      body: "Konum ve bölge aramalarında otelin daha kolay bulunması.",
    };
  }
  if (/mobil|ux/.test(key)) {
    return {
      title: "Mobil misafir",
      body: "Yolda veya odada telefon üzerinden rahat okunan bir deneyim.",
    };
  }
  if (/atmosfer|görsel|sunum/.test(key)) {
    return {
      title: "Oda sunumu",
      body: "Mekânın sessizliğini ve konforunu daha inandırıcı göstermek.",
    };
  }
  return {
    title: "İlk izlenim",
    body: "Otelin karakterini abartmadan, net anlatmak.",
  };
}

function automotiveOpportunity(service: string): OpportunityCard {
  const key = service.toLocaleLowerCase("tr");
  if (/stok|model|araç|inventory/.test(key)) {
    return {
      title: "Araç sunumu",
      body: "Modellerin daha düzenli ve karşılaştırılabilir durması.",
    };
  }
  if (/randevu|test|whatsapp|telefon/.test(key)) {
    return {
      title: "Randevu ve WhatsApp",
      body: "Test sürüşü veya servis talebinin daha kısa yoldan size gelmesi.",
    };
  }
  if (/seo|google|harita|local|yerel/.test(key)) {
    return {
      title: "Yerel görünürlük",
      body: "Bölgede showroom arayanların sizi daha kolay bulması.",
    };
  }
  if (/mobil|ux/.test(key)) {
    return {
      title: "Mobil inceleme",
      body: "Araç bilgisine telefonda hızlı ve sade erişim.",
    };
  }
  return {
    title: "Dijital showroom",
    body: "Salondaki ciddiyetin sitede de hissedilmesi.",
  };
}

export const RESTAURANT_OUTREACH: OutreachCopySpec = {
  kind: "restaurant",
  marker: "restaurant",
  templateName: "RESTORAN — Premium Web Sitesi Analizi",
  category: "RESTORAN",
  subject: "{{companyName}} için kısa bir web analizi",
  preheader: "{{companyName}} için kısa bir dijital değerlendirme ve birkaç geliştirme fikri.",
  eyebrow: "SİZE ÖZEL · KISA DİJİTAL İNCELEME",
  composePlaceholder: "Restoran premium HTML şablonu gönderimde otomatik kullanılır.",
  followOn: {
    verified:
      "Özellikle mobil kullanıcı deneyimi, rezervasyon akışı ve markanızın dijital sunumu tarafında bazı geliştirme fırsatları gördük.",
    not_verified:
      "Restoranınızın dijitalde daha net görünmesi; menü, rezervasyon ve WhatsApp yolunu sadeleştirmek için kısa bir fikir paylaşabiliriz.",
    no_website:
      "Misafir menüyü, rezervasyonu ve konumu tek yerden görmek istiyor; bunu sakin bir sayfada toplayabiliriz.",
  },
  offer:
    "İsterseniz işletmeniz için nasıl bir dijital yenileme önerdiğimizi ücretsiz ve kısa bir örnek üzerinden paylaşabiliriz.",
  ctaLabel: CTA_LABEL,
  defaultOpportunities: [
    { title: "Mobil deneyim", body: "Telefonda menü, adres ve iletişim ilk bakışta net olsun." },
    { title: "Rezervasyon akışı", body: "Misafirin masaya veya WhatsApp’a daha az adımda ulaşması." },
    { title: "Yerel görünürlük", body: "Bölge aramalarında ve haritada daha net bulunmak." },
  ],
  mapOpportunity: restaurantOpportunity,
};

export const BAR_OUTREACH: OutreachCopySpec = {
  kind: "bar",
  marker: "bar",
  templateName: "BAR — Premium Web Sitesi Analizi",
  category: "BAR",
  subject: "{{companyName}} için kısa bir dijital not",
  preheader: "{{companyName}} için atmosfer, rezervasyon ve gece programına dair birkaç sakin fikir.",
  eyebrow: "SİZE ÖZEL · KISA DİJİTAL İNCELEME",
  composePlaceholder: "Bar premium HTML şablonu gönderimde otomatik kullanılır.",
  followOn: {
    verified:
      "Mekânın atmosferini, gece programını ve masa yolunu dijitalde daha net hissettirmek için birkaç sade iyileştirme alanı gördük.",
    not_verified:
      "Barınızın karakterini, etkinliklerini ve rezervasyon yolunu dijitalde daha net anlatmak için kısa bir fikir paylaşabiliriz.",
    no_website:
      "Sosyal medya dışında, gecenin ritmini ve masaya giden yolu anlatan sade bir sayfa çoğu mekân için işe yarıyor.",
  },
  offer:
    "İsterseniz mekânınız için nasıl bir dijital yenileme önerdiğimizi ücretsiz ve kısa bir örnek üzerinden paylaşabiliriz.",
  ctaLabel: CTA_LABEL,
  defaultOpportunities: [
    { title: "Mekân atmosferi", body: "Işık, müzik ve karakterin dijitalde de hissedilmesi." },
    { title: "Masa rezervasyonu", body: "Yoğun gecede masaya daha kısa ve net bir yol." },
    { title: "Etkinlik görünürlüğü", body: "Gecelerin ve programın sitede daha kolay takip edilmesi." },
  ],
  mapOpportunity: barOpportunity,
};

export const CONSTRUCTION_OUTREACH: OutreachCopySpec = {
  kind: "construction",
  marker: "construction",
  templateName: "İNŞAAT — Premium Web Sitesi Analizi",
  category: "İNŞAAT",
  subject: "{{companyName}} projeleri için birkaç dijital fikir",
  preheader: "Projelerinizi ve referanslarınızı dijitalde daha güçlü sunmak için birkaç fikir.",
  eyebrow: "SİZE ÖZEL · KISA DİJİTAL İNCELEME",
  composePlaceholder: "İnşaat premium HTML şablonu gönderimde otomatik kullanılır.",
  followOn: {
    verified:
      "Projelerin, referansların ve teklif yolunun dijitalde daha düzenli durması için birkaç net iyileştirme alanı gördük.",
    not_verified:
      "Şantiyedeki iş disiplininin sitede de güven vermesi için kısa, ücretsiz bir yön paylaşabiliriz.",
    no_website:
      "Tamamlanan işleri ve süreci sakin bir dille anlatan bağımsız bir sayfa, yeni iş görüşmelerinde fark yaratabiliyor.",
  },
  offer:
    "İsterseniz firmanız için nasıl bir dijital yenileme önerdiğimizi ücretsiz ve kısa bir örnek üzerinden paylaşabiliriz.",
  ctaLabel: CTA_LABEL,
  defaultOpportunities: [
    { title: "Proje sunumu", body: "Devam eden ve biten işlerin daha düzenli anlatılması." },
    { title: "Referanslar", body: "Tamamlanan işlerin güven verecek şekilde öne çıkarılması." },
    { title: "Teklif süreci", body: "Yeni iş talebinin size daha az sürtünmeyle ulaşması." },
  ],
  mapOpportunity: constructionOpportunity,
};

export const ARCHITECTURE_OUTREACH: OutreachCopySpec = {
  kind: "architecture",
  marker: "architecture",
  templateName: "MİMARLIK — Premium Web Sitesi Analizi",
  category: "MİMARLIK",
  subject: "{{companyName}} portföyü için kısa bir not",
  preheader: "{{companyName}} portföyünü daha sakin ve net göstermek için birkaç kısa fikir.",
  eyebrow: "SİZE ÖZEL · KISA DİJİTAL İNCELEME",
  composePlaceholder: "Mimarlık premium HTML şablonu gönderimde otomatik kullanılır.",
  followOn: {
    verified:
      "Portföy akışı, görsel dil ve iletişim kalitesi tarafında ofisinize yakışacak birkaç sade iyileştirme alanı gördük.",
    not_verified:
      "Seçilmiş işlerinizi daha ölçülü bir dille sunmak için kısa bir fikir paylaşabiliriz.",
    no_website:
      "Seçilmiş projeleri sessiz ve net anlatan bağımsız bir sayfa, doğru işleri çekmek için çoğu ofise yeter.",
  },
  offer:
    "İsterseniz ofisiniz için nasıl bir dijital yenileme önerdiğimizi ücretsiz ve kısa bir örnek üzerinden paylaşabiliriz.",
  ctaLabel: CTA_LABEL,
  defaultOpportunities: [
    { title: "Portföy akışı", body: "Seçilmiş işlerin daha sakin ve güçlü bir sırayla okunması." },
    { title: "Görsel dil", body: "Ofisin çizgisini ilk bakışta daha ölçülü yansıtmak." },
    { title: "İletişim kalitesi", body: "Yeni iş başvurusunun ofise daha kolay ulaşması." },
  ],
  mapOpportunity: architectureOpportunity,
};

export const REAL_ESTATE_OUTREACH: OutreachCopySpec = {
  kind: "realEstate",
  marker: "real-estate",
  templateName: "GAYRİMENKUL — Premium Web Sitesi Analizi",
  category: "GAYRİMENKUL",
  subject: "{{companyName}} için kısa bir dijital değerlendirme",
  preheader: "{{companyName}} için güven, iletişim ve ilan sunumuna dair birkaç kısa fikir.",
  eyebrow: "SİZE ÖZEL · KISA DİJİTAL İNCELEME",
  composePlaceholder: "Gayrimenkul premium HTML şablonu gönderimde otomatik kullanılır.",
  followOn: {
    verified:
      "Güven hissi, mobil iletişim ve mülk sunumu tarafında ofisinize uygun birkaç sade iyileştirme alanı gördük.",
    not_verified:
      "Alıcı ve satıcının size daha kolay ulaşması için kısa, ücretsiz bir yön paylaşabiliriz.",
    no_website:
      "Ofisin ciddiyetini ve iletişim yolunu sakin anlatan bağımsız bir sayfa, yeni görüşmelerde işe yarayabiliyor.",
  },
  offer:
    "İsterseniz ofisiniz için nasıl bir dijital yenileme önerdiğimizi ücretsiz ve kısa bir örnek üzerinden paylaşabiliriz.",
  ctaLabel: CTA_LABEL,
  defaultOpportunities: [
    { title: "Güven hissi", body: "Ofisin ciddiyetini dijitalde daha sakin göstermek." },
    { title: "Mobil iletişim", body: "Telefonda iletişim adımlarının daha sade olması." },
    { title: "Yerel arama", body: "Bölge aramalarında ofisinizin daha net görünmesi." },
  ],
  mapOpportunity: realEstateOpportunity,
};

export const HOTEL_OUTREACH: OutreachCopySpec = {
  kind: "hotel",
  marker: "hotel",
  templateName: "OTEL — Premium Web Sitesi Analizi",
  category: "OTEL",
  subject: "{{companyName}} için kısa bir misafir notu",
  preheader: "{{companyName}} için misafir deneyimi ve doğrudan iletişim üzerine birkaç kısa fikir.",
  eyebrow: "SİZE ÖZEL · KISA DİJİTAL İNCELEME",
  composePlaceholder: "Otel premium HTML şablonu gönderimde otomatik kullanılır.",
  followOn: {
    verified:
      "Oda sunumu, mobil misafir deneyimi ve doğrudan iletişim yolu tarafında birkaç sade iyileştirme alanı gördük.",
    not_verified:
      "Otelinizin atmosferini ve misafirin size ulaşma yolunu daha net anlatmak için kısa bir fikir paylaşabiliriz.",
    no_website:
      "Odaları ve konumu sakin anlatan bağımsız bir sayfa, doğrudan gelen misafir için çoğu zaman yeter.",
  },
  offer:
    "İsterseniz oteliniz için nasıl bir dijital yenileme önerdiğimizi ücretsiz ve kısa bir örnek üzerinden paylaşabiliriz.",
  ctaLabel: CTA_LABEL,
  defaultOpportunities: [
    { title: "İlk izlenim", body: "Otelin karakterini abartmadan, net anlatmak." },
    { title: "Mobil misafir", body: "Telefonda rahat okunan bir deneyim." },
    { title: "Harita ve keşif", body: "Konum aramalarında otelin daha kolay bulunması." },
  ],
  mapOpportunity: hotelOpportunity,
};

export const AUTOMOTIVE_OUTREACH: OutreachCopySpec = {
  kind: "automotive",
  marker: "automotive",
  templateName: "OTOMOTİV — Premium Web Sitesi Analizi",
  category: "OTOMOTİV",
  subject: "{{companyName}} için kısa bir dijital fikir",
  preheader: "{{companyName}} için araç sunumu ve randevu yoluna dair birkaç kısa fikir.",
  eyebrow: "SİZE ÖZEL · KISA DİJİTAL İNCELEME",
  composePlaceholder: "Otomotiv premium HTML şablonu gönderimde otomatik kullanılır.",
  followOn: {
    verified:
      "Araç sunumu, mobil inceleme ve randevu yolu tarafında showroomunuza uygun birkaç sade iyileştirme alanı gördük.",
    not_verified:
      "Showroomunuzun ciddiyetini ve size ulaşma yolunu dijitalde daha net anlatmak için kısa bir fikir paylaşabiliriz.",
    no_website:
      "Modelleri ve randevu yolunu sakin anlatan bağımsız bir sayfa, salona gelmeden önce güven verebiliyor.",
  },
  offer:
    "İsterseniz showroomunuz için nasıl bir dijital yenileme önerdiğimizi ücretsiz ve kısa bir örnek üzerinden paylaşabiliriz.",
  ctaLabel: CTA_LABEL,
  defaultOpportunities: [
    { title: "Dijital showroom", body: "Salondaki ciddiyetin sitede de hissedilmesi." },
    { title: "Randevu ve WhatsApp", body: "Talebin daha kısa yoldan size gelmesi." },
    { title: "Yerel görünürlük", body: "Bölgede sizi daha kolay bulmak." },
  ],
  mapOpportunity: automotiveOpportunity,
};

export const OUTREACH_COPY: Record<Exclude<PremiumEmailKind, "custom">, OutreachCopySpec> = {
  restaurant: RESTAURANT_OUTREACH,
  bar: BAR_OUTREACH,
  construction: CONSTRUCTION_OUTREACH,
  architecture: ARCHITECTURE_OUTREACH,
  realEstate: REAL_ESTATE_OUTREACH,
  hotel: HOTEL_OUTREACH,
  automotive: AUTOMOTIVE_OUTREACH,
};

export function outreachCopy(kind: Exclude<PremiumEmailKind, "custom">) {
  return OUTREACH_COPY[kind];
}

export function followOnForContext(spec: OutreachCopySpec, context: CompanyEmailContext) {
  return spec.followOn[context.copyKind];
}

export function opportunityCards(spec: OutreachCopySpec, services: string[]) {
  const cards: OpportunityCard[] = [];
  const seen = new Set<string>();
  for (const service of services) {
    const card = spec.mapOpportunity(service);
    if (seen.has(card.title)) continue;
    seen.add(card.title);
    cards.push(card);
    if (cards.length === 3) return cards;
  }
  for (const fallback of spec.defaultOpportunities) {
    if (seen.has(fallback.title)) continue;
    seen.add(fallback.title);
    cards.push(fallback);
    if (cards.length === 3) break;
  }
  return cards.slice(0, 3);
}
