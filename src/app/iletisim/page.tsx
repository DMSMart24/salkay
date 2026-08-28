import type { Metadata } from "next";
import { InquiryForm } from "@/components/contact/InquiryForm";
import { PageHero } from "@/components/page/PageHero";
import { Container } from "@/components/ui/Container";
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
      <PageHero eyebrow="İletişim" title={page.title} lead={page.lead} />
      <Container className="grid gap-12 pb-24 lg:grid-cols-[1fr_1.15fr]">
        <aside className="max-w-md">
          <p className="text-muted">{page.pendingChannels}</p>
          <p className="mt-6 text-sm text-faint">
            salkay.com
            <span className="mx-2 text-line">/</span>
            salkay.com.tr
          </p>
        </aside>
        <InquiryForm />
      </Container>
    </>
  );
}
