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
    <header className="bg-canvas pt-28 lg:pt-36">
      <Container className="pb-12 lg:pb-16">
        <p className="eyebrow inline-flex items-center gap-2 text-gold">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
          />
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-h1 text-cream">{title}</h1>
        <div className="brand-rule" aria-hidden />
        <p className="mt-5 max-w-2xl text-[1.05rem] leading-8 text-muted">
          {lead}
        </p>
        {children}
      </Container>
    </header>
  );
}
