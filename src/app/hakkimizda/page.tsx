import type { Metadata } from "next";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
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
      <PageHero eyebrow="Stüdyo" title={page.title} lead={page.lead} />
      <Container className="grid gap-8 pb-24 lg:grid-cols-2">
        {page.body.map((paragraph) => (
          <p
            key={paragraph}
            className="rounded-[1.3rem] border border-gold/20 bg-navy-mid p-6 text-[1.05rem] leading-8 text-muted sm:p-8"
          >
            {paragraph}
          </p>
        ))}
      </Container>
    </>
  );
}
