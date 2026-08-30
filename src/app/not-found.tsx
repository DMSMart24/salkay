import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const page = getDictionary().notFound;

  return (
    <section className="bg-canvas">
      <Container className="py-32">
        <p className="eyebrow text-cyan">404</p>
        <h1 className="mt-4 font-display text-h1">{page.title}</h1>
        <p className="mt-5 max-w-md text-muted">{page.body}</p>
        <div className="mt-8">
          <Button href={routes.home}>{page.cta}</Button>
        </div>
      </Container>
    </section>
  );
}
