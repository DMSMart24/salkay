import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/metadata";
import { site } from "@/lib/site";

export function organizationSchema() {
  const dictionary = getDictionary();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: absoluteUrl("/icon"),
    description: dictionary.meta.description,
    email: site.email,
    areaServed: {
      "@type": "Country",
      name: "Türkiye",
    },
    knowsLanguage: ["tr", "de", "en"],
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "tr-TR",
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SALKAY hizmetleri",
    itemListElement: [
      {
        "@type": "Service",
        position: 1,
        name: "Web Tasarım",
        serviceType: "Web design",
        provider: { "@type": "Organization", name: site.name },
        areaServed: "TR",
      },
      {
        "@type": "Service",
        position: 2,
        name: "Web Geliştirme",
        serviceType: "Web development",
        provider: { "@type": "Organization", name: site.name },
        areaServed: "TR",
      },
      {
        "@type": "Service",
        position: 3,
        name: "SEO",
        serviceType: "Search engine optimization",
        provider: { "@type": "Organization", name: site.name },
        areaServed: "TR",
      },
    ],
  };
}

export function webDesignServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Professional Web Design & Development",
    serviceType: "Web design and development",
    url: absoluteUrl(routes.webDesign),
    provider: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    areaServed: {
      "@type": "Country",
      name: "Türkiye",
    },
  };
}

export function faqPageSchema(
  items: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "SALKAY",
        item: absoluteUrl(routes.home),
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: absoluteUrl(item.path),
      })),
    ],
  };
}
