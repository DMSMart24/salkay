import Link from "next/link";
import type { Route } from "next";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

type VisualKind = "web" | "software" | "seo" | "ads" | "analytics" | "ai";

function ServiceIcon({ kind }: { kind: VisualKind }) {
  switch (kind) {
    case "web":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="3.2" y="5" width="17.6" height="14" rx="2" />
          <path d="M3.2 8.6 H20.8" />
          <path d="M6.2 6.8 H8.1" />
        </svg>
      );
    case "software":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M6 8.2 L12 5.4 L18 8.2 L12 11 Z" />
          <path d="M6 12 L12 14.8 L18 12" />
          <path d="M6 15.8 L12 18.6 L18 15.8" />
        </svg>
      );
    case "seo":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="11" cy="11" r="6.2" />
          <path d="M15.6 15.6 L20 20" />
        </svg>
      );
    case "ads":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M5.2 9.2 H8.4 L14.8 5.4 V18.6 L8.4 14.8 H5.2 Z" />
          <path d="M17.4 9.2 C18.6 10.2 18.6 13.8 17.4 14.8" />
          <path d="M19.2 7.4 C21.4 9.2 21.4 14.8 19.2 16.6" />
        </svg>
      );
    case "analytics":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M4 18.4 H20" />
          <path d="M7 14.6 V18.4" />
          <path d="M12 10.4 V18.4" />
          <path d="M17 6.8 V18.4" />
          <path d="M7 12.2 L12 8.6 L17 5.6" />
        </svg>
      );
    case "ai":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="6.2" y="7.2" width="11.6" height="10.2" rx="3.2" />
          <path d="M12 4.6 V7.2" />
          <circle cx="12" cy="4.4" r="0.9" />
          <circle cx="9.4" cy="11.6" r="0.85" />
          <circle cx="14.6" cy="11.6" r="0.85" />
          <path d="M10.2 14.6 H13.8" />
        </svg>
      );
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function ServicesBento() {
  const { bento } = getDictionary().home;
  const [software, seo, ads, analytics, automation] = bento.items;
  const compact = [
    { visual: "seo" as const, item: seo },
    { visual: "ads" as const, item: ads },
    { visual: "analytics" as const, item: analytics },
    { visual: "ai" as const, item: automation },
  ].flatMap((entry) => (entry.item ? [entry] : []));

  return (
    <section id="hizmetler" className="home-services">
      <Container className="home-services-shell">
        <header className="home-services-head">
          <p className="home-services-eye">
            <span aria-hidden className="home-services-dot" />
            {bento.eyebrow}
          </p>
          <h2 className="home-services-intro font-display">{bento.title}</h2>
          <p className="home-services-lead">{bento.lead}</p>
        </header>

        <div className="home-services-focus">
          <article className="home-services-feature">
            <span className="home-services-icon" aria-hidden>
              <ServiceIcon kind="web" />
            </span>
            <p className="home-services-tag">{bento.coreTag}</p>
            <h3 className="home-services-title font-display">{bento.coreTitle}</h3>
            <p>{bento.coreBody}</p>
            <Link href={bento.coreHref as Route} className="home-services-cta">
              {bento.coreCta}
              <span aria-hidden className="home-services-arrow">
                →
              </span>
            </Link>
          </article>
          {software ? (
            <article className="home-services-feature">
              <span className="home-services-icon" aria-hidden>
                <ServiceIcon kind="software" />
              </span>
              <p className="home-services-tag">{software.tag}</p>
              <h3 className="home-services-title font-display">{software.title}</h3>
              <p>{software.body}</p>
              <Link href={software.href as Route} className="home-services-cta">
                {software.cta}
                <span aria-hidden className="home-services-arrow">
                  →
                </span>
              </Link>
            </article>
          ) : null}
        </div>

        <ul className="home-services-compact">
          {compact.map(({ visual, item }) => (
            <li key={item.title}>
              <Link href={item.href as Route} className="home-services-chip">
                <span className="home-services-icon" aria-hidden>
                  <ServiceIcon kind={visual} />
                </span>
                <span className="home-services-tag">{item.tag}</span>
                <strong className="font-display">{item.title}</strong>
                <span>{item.body}</span>
                <em>
                  {item.cta}
                  <span aria-hidden className="home-services-arrow">
                    →
                  </span>
                </em>
              </Link>
            </li>
          ))}
        </ul>

        <p className="home-services-more">
          <Link href={routes.services}>Tüm hizmetleri görün →</Link>
        </p>
      </Container>
    </section>
  );
}
