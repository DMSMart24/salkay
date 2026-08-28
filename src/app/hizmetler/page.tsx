import type { Metadata } from "next";
import { ServicesPageView } from "@/components/services/ServicesPageView";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Hizmetler",
  description: getDictionary().servicesPage.description,
  path: routes.services,
});

export default function ServicesPage() {
  const page = getDictionary().servicesPage;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: page.title, path: routes.services }])}
      />
      <ServicesPageView />
    </>
  );
}
