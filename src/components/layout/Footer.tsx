import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { serviceIndex } from "@/i18n/dictionaries/tr";
import { routes, sections } from "@/lib/routes";
import { site, siteMailto, siteWhatsAppUrl } from "@/lib/site";

export function Footer() {
  const dictionary = getDictionary();
  const year = 2026;

  return (
    <footer className="site-footer">
      <Container className="py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-20">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-8 text-body leading-7 text-muted">{dictionary.footer.tagline}</p>
          </div>

          <FooterColumn title={dictionary.footer.services}>
            {serviceIndex.slice(0, 6).map((item) => (
              <Link
                key={item.title}
                href={item.href as Route}
                className="text-muted transition-colors hover:text-fg"
              >
                {item.title}
              </Link>
            ))}
          </FooterColumn>

          <FooterColumn title={dictionary.footer.company}>
            <Link href={routes.about} className="text-muted hover:text-fg">
              Hakkımızda
            </Link>
            <Link href={routes.solutions} className="text-muted hover:text-fg">
              Çözümler
            </Link>
            <Link href={routes.projects} className="text-muted hover:text-fg">
              Projeler
            </Link>
            <Link href={sections.process} className="text-muted hover:text-fg">
              Yaklaşımımız
            </Link>
            <Link href={routes.contact} className="text-muted hover:text-fg">
              İletişim
            </Link>
          </FooterColumn>

          <FooterColumn title={dictionary.footer.contact}>
            <span className="apple-footer-line text-muted">
              <MapPin size={16} strokeWidth={1.5} aria-hidden />
              {site.location}
            </span>
            <a href={siteMailto()} className="apple-footer-line text-muted hover:text-fg">
              <Mail size={16} strokeWidth={1.5} aria-hidden />
              {site.email}
            </a>
            <a
              href={siteWhatsAppUrl()}
              className="apple-footer-line text-muted hover:text-fg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone size={16} strokeWidth={1.5} aria-hidden />
              {site.whatsappDisplay}
            </a>
          </FooterColumn>
        </div>

        <div className="site-footer-rule mt-20" />

        <div className="site-footer-copy mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {dictionary.footer.rights}
          </p>
          <p>{site.domain}</p>
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
      <p className="eyebrow text-faint">{title}</p>
      <div className="mt-6 flex flex-col gap-3.5 text-[0.95rem]">{children}</div>
    </div>
  );
}
