import type { Metadata } from "next";
import { AboutStudio } from "@/components/about/AboutStudio";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, organizationSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Hakkımızda",
  description: getDictionary().aboutPage.description,
  path: routes.about,
});

export default function AboutPage() {
  const page = getDictionary().aboutPage;

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd
        data={breadcrumbSchema([{ name: page.title, path: routes.about }])}
      />
      <AboutStudio />
    </>
  );
}
