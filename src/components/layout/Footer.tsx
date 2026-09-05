import Link from "next/link";
import { HeaderLogo } from "@/components/brand/HeaderLogo";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

export function Footer() {
  const dictionary = getDictionary();

  return (
    <footer className="site-footer studio-footer">
      <Container className="studio-footer-inner">
        <HeaderLogo />
        <nav aria-label="Alt menü" className="studio-footer-nav">
          {dictionary.nav.items.map((item, index) => (
            <span key={item.href} className="studio-footer-item">
              {index > 0 ? <span aria-hidden className="studio-footer-dot">·</span> : null}
              <Link href={item.href}>{item.label}</Link>
            </span>
          ))}
          <span aria-hidden className="studio-footer-rule" />
          <Link href={routes.contact}>İletişim</Link>
        </nav>
        <p className="studio-footer-slogan">Daha iyi bir dijital yarın için.</p>
      </Container>
    </footer>
  );
}
