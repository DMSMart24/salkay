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
    <header className="page-hero">
      <Container>
        <p className="studio-eye">{eyebrow}</p>
        <h1 className="mt-4 font-display text-h1">{title}</h1>
        <p className="mt-5 max-w-2xl text-[1.05rem] leading-8 text-muted">
          {lead}
        </p>
        {children}
      </Container>
    </header>
  );
}
