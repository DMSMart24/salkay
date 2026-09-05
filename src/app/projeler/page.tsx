import type { Metadata } from "next";
import Link from "next/link";
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
  const home = getDictionary().home.projects;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([{ name: page.title, path: routes.projects }])}
      />
      <PageHero eyebrow="Arşiv" title={page.title} lead={page.lead} />
      <Container className="studio-archive">
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
        <p className="studio-archive-note mt-8">{home.disclaimer}</p>
        <div className="studio-archive-empty">
          <h2 className="font-display text-h3">Seçilmiş işler henüz yayımlanmadı.</h2>
          <p>
            Onaylı referans görselleri ve proje kayıtları eklendiğinde burada gerçek
            işler duracak. Şimdilik hizmetleri ve çalışma biçimimizi inceleyebilirsiniz.
          </p>
          <p>
            <Link href={routes.contact}>Projenizi konuşalım</Link>
            {" · "}
            <Link href={routes.webDesign}>Web tasarım paketleri</Link>
          </p>
        </div>
      </Container>
    </>
  );
}
