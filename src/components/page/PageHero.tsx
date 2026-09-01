import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, lead, children }: PageHeroProps) {
  return (
    <header className="page-hero bg-canvas pt-28 lg:pt-36">
      <Container className="pb-12 lg:pb-16">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-h1">{title}</h1>
        <span aria-hidden className="page-hero-rule" />
        <p className="mt-5 max-w-2xl text-[1.05rem] leading-8 text-muted">
          {lead}
        </p>
        {children}
      </Container>
    </header>
  );
}
