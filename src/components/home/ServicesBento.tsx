import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

type VisualKind = "web" | "software" | "seo" | "ads" | "analytics" | "ai";
type ProofKind = "bolt" | "users" | "scale" | "clock";

type ServiceItem = {
  index: string;
  tag: string;
  title: string;
  body: string;
  visual: VisualKind;
};

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

function ProofIcon({ kind }: { kind: ProofKind }) {
  switch (kind) {
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M13.2 4.4 L6.8 13.2 H12 L10.8 19.6 L17.4 10.6 H12.2 Z" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="9.2" cy="9" r="2.6" />
          <path d="M4.8 17.6 C5.2 14.8 7 13.4 9.2 13.4 S13.2 14.8 13.6 17.6" />
          <circle cx="16.2" cy="9.4" r="2.2" />
          <path d="M15.2 13.6 C17.2 13.6 18.8 14.8 19.2 17.2" />
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M4.4 17.8 H19.6" />
          <path d="M7 17.8 V12.6" />
          <path d="M12 17.8 V9.2" />
          <path d="M17 17.8 V6.4" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="7.2" />
          <path d="M12 8.4 V12.2 L15 14" />
        </svg>
      );
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

const proofIcons: ProofKind[] = ["bolt", "users", "scale", "clock"];

export function ServicesBento() {
  const { bento } = getDictionary().home;
  const items: ServiceItem[] = [
    {
      index: "01",
      tag: bento.coreTag,
      title: bento.coreTitle,
      body: bento.coreBody,
      visual: "web",
    },
    {
      index: "02",
      tag: bento.items[0]?.tag ?? "",
      title: bento.items[0]?.title ?? "",
      body: bento.items[0]?.body ?? "",
      visual: "software",
    },
    {
      index: "03",
      tag: bento.items[1]?.tag ?? "",
      title: bento.items[1]?.title ?? "",
      body: bento.items[1]?.body ?? "",
      visual: "seo",
    },
    {
      index: "04",
      tag: bento.items[2]?.tag ?? "",
      title: bento.items[2]?.title ?? "",
      body: bento.items[2]?.body ?? "",
      visual: "ads",
    },
    {
      index: "05",
      tag: bento.items[3]?.tag ?? "",
      title: bento.items[3]?.title ?? "",
      body: bento.items[3]?.body ?? "",
      visual: "analytics",
    },
    {
      index: "06",
      tag: bento.items[4]?.tag ?? "",
      title: bento.items[4]?.title ?? "",
      body: bento.items[4]?.body ?? "",
      visual: "ai",
    },
  ];

  return (
    <section id="hizmetler" className="home-services">
      <span className="home-services-haze" aria-hidden />
      <span className="home-services-dots" aria-hidden />
      <svg className="home-services-flow" viewBox="0 0 920 180" fill="none" aria-hidden>
        <path d="M-20 128 C 90 48, 210 168, 340 98 S 560 28, 710 118 S 880 70, 980 96" />
        <circle cx="214" cy="108" r="2" />
        <circle cx="676" cy="92" r="1.8" />
      </svg>

      <Container className="home-services-shell">
        <Reveal className="home-services-head">
          <p className="home-services-eye">
            <span aria-hidden className="home-services-dot" />
            {bento.eyebrow}
          </p>
          <h2 className="home-services-intro font-display">{bento.title}</h2>
          <p className="home-services-lead">{bento.lead}</p>
        </Reveal>

        <ol className="home-services-list">
          {items.map((item, index) => (
            <li key={item.index}>
              <Reveal delay={index * 40} className="home-services-row">
                <div className="home-services-meta">
                  <span className="home-services-index">{item.index}</span>
                  <span className="home-services-tag">{item.tag}</span>
                </div>
                <span className="home-services-icon">
                  <ServiceIcon kind={item.visual} />
                </span>
                <h3 className="home-services-title font-display">{item.title}</h3>
                <div className="home-services-copy">
                  <p>{item.body}</p>
                  <Link href={routes.services} className="home-services-cta">
                    {bento.coreCta}
                    <span aria-hidden className="home-services-arrow">
                      →
                    </span>
                  </Link>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={80} className="home-services-proof">
          <ul>
            {bento.proof.map((item, index) => (
              <li key={item.index}>
                <b>
                  <ProofIcon kind={proofIcons[index] ?? "bolt"} />
                </b>
                <strong>{item.index}</strong>
                <span>{item.title}</span>
                <small>{item.body}</small>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
