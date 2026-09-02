import type { Metadata } from "next";
import { WebPricingPage } from "@/components/web-design/WebPricingPage";
import { webDesignContent } from "@/components/web-design/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { breadcrumbSchema, faqPageSchema, webDesignServiceSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: webDesignContent.meta.title,
  description: webDesignContent.meta.description,
  path: routes.webDesign,
});

export default function WebDesignPage() {
  return (
    <>
      <JsonLd data={webDesignServiceSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Hizmetler", path: routes.services },
          { name: "Web Tasarım", path: routes.webDesign },
        ])}
      />
      <JsonLd
        data={faqPageSchema(
          webDesignContent.faq.items.map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
        )}
      />
      <WebPricingPage />
    </>
  );
}
