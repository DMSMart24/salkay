import type { Metadata } from "next";
import { SolutionsPageView } from "@/components/solutions/SolutionsPageView";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { breadcrumbSchema } from "@/lib/schema";

const page = getDictionary().solutionsPage;

export const metadata: Metadata = {
  ...buildMetadata({
    title: page.title,
    description: page.description,
    path: routes.solutions,
  }),
  title: {
    absolute: page.title,
  },
};

export default function SolutionsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: page.breadcrumb, path: routes.solutions }])}
      />
      <SolutionsPageView />
    </>
  );
}
