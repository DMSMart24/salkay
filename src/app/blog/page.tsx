import type { Metadata } from "next";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "İçgörüler",
  description: getDictionary().blogPage.description,
  path: routes.blog,
});

export default function BlogPage() {
  const page = getDictionary().blogPage;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: page.title, path: routes.blog }])}
      />
      <PageHero eyebrow="İçgörüler" title={page.title} lead={page.emptyBody} />
      <Container className="pb-24">
        <div className="empty-rail rounded-[1.4rem] border border-dashed border-line px-8 py-16">
          <h2 className="font-display text-h3">{page.emptyTitle}</h2>
          <p className="mt-3 max-w-xl text-muted">{page.emptyBody}</p>
        </div>
      </Container>
    </>
  );
}
