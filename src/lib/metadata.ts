import type { Metadata } from "next";
import { defaultLocale, localeOg, localePathPrefix } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  index?: boolean;
};

export function absoluteUrl(path = "/"): string {
  if (path === "/") {
    return site.url;
  }

  return `${site.url}${path}`;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  index = true,
}: BuildMetadataInput = {}): Metadata {
  const dictionary = getDictionary(defaultLocale);
  const resolvedTitle = title ?? dictionary.meta.title;
  const resolvedDescription = description ?? dictionary.meta.description;
  const canonical = absoluteUrl(path);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: dictionary.meta.keywords,
    alternates: {
      canonical,
      languages: {
        tr: `${site.url}${localePathPrefix.tr}${path === "/" ? "" : path}`,
        "x-default": site.url,
      },
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: localeOg.tr,
      url: canonical,
      siteName: site.name,
      title: title ?? dictionary.meta.ogTitle,
      description: description ?? dictionary.meta.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? dictionary.meta.ogTitle,
      description: description ?? dictionary.meta.ogDescription,
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: getDictionary().meta.title,
    template: getDictionary().meta.titleTemplate,
  },
  description: getDictionary().meta.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  keywords: getDictionary().meta.keywords,
  alternates: {
    canonical: site.url,
    languages: {
      tr: site.url,
      "x-default": site.url,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: localeOg.tr,
    url: site.url,
    siteName: site.name,
    title: getDictionary().meta.ogTitle,
    description: getDictionary().meta.ogDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: getDictionary().meta.ogTitle,
    description: getDictionary().meta.ogDescription,
  },
};
