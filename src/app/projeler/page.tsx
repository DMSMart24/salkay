import type { Metadata } from "next";
import { Projects } from "@/components/home/Projects";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = buildMetadata({
  title: "Projeler",
  description: getDictionary().projectsPage.description,
  path: routes.projects,
});

export default function ProjectsPage() {
  const page = getDictionary().projectsPage;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: page.title, path: routes.projects }])}
      />
      <PageHero eyebrow="Arşiv" title={page.title} lead={page.lead} />
      <Container className="pb-8">
        <p className="label text-faint">Vaka mimarisi</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {page.architecture.map((item) => (
            <li
              key={item}
              className="rounded-full border border-line px-3 py-1 text-sm text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      </Container>
      <Projects showIntro={false} />
    </>
  );
}
