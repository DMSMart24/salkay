import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { serviceIndex } from "@/i18n/dictionaries/tr";
import { routes, sections } from "@/lib/routes";
import { site } from "@/lib/site";

export function Footer() {
  const dictionary = getDictionary();
  const year = 2026;

  return (
    <footer className="border-t border-gold/25 bg-navy-soft text-fg">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-6 text-[1.02rem] leading-7 text-muted">
              {dictionary.footer.tagline}
            </p>
            <p className="mt-5 font-mono text-[0.68rem] tracking-[0.28em] text-gold">
              S A L K A Y
            </p>
          </div>

          <FooterColumn title={dictionary.footer.services}>
            {serviceIndex.slice(0, 6).map((item) => (
              <Link
                key={item.title}
                href={item.href as Route}
                className="text-muted transition-colors hover:text-cyan"
              >
                {item.title}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title={dictionary.footer.company}>
            <Link href={routes.about} className="text-muted hover:text-cyan">
              Hakkımızda
            </Link>
            <Link href={routes.projects} className="text-muted hover:text-cyan">
              Projeler
            </Link>
            <Link href={sections.kay} className="text-muted hover:text-cyan">
              KAY
            </Link>
            <Link href={routes.contact} className="text-muted hover:text-cyan">
              İletişim
            </Link>
          </FooterColumn>

          <FooterColumn title={dictionary.footer.social}>
            <span className="text-muted">Instagram</span>
            <span className="text-muted">LinkedIn</span>
            <span className="text-faint">{dictionary.footer.socialPending}</span>
          </FooterColumn>
        </div>

        <div className="mt-16 h-px bg-gold/25" />

        <div className="mt-6 flex flex-col gap-3 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {dictionary.footer.rights}
          </p>
          <p>{site.location}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow text-gold">{title}</p>
      <div className="mt-4 flex flex-col gap-2.5 text-[0.95rem]">{children}</div>
    </div>
  );
}
