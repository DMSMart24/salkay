import type { Metadata } from "next";
import { ContactStudio } from "@/components/contact/ContactStudio";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "İletişim",
  description: getDictionary().contactPage.description,
  path: routes.contact,
});

export default function ContactPage() {
  const page = getDictionary().contactPage;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: page.title, path: routes.contact }])}
      />
      <ContactStudio />
    </>
  );
}
