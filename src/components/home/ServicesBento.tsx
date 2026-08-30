import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

type VisualKind = "web" | "software" | "seo" | "ads" | "analytics" | "ai";

type ServiceItem = {
  index: string;
  tag: string;
  title: string;
  body: string;
  visual: VisualKind;
};

function ServiceFigure({ kind }: { kind: VisualKind }) {
  const common = {
    viewBox: "0 0 132 80",
    className: "home-services-svg",
    fill: "none",
    "aria-hidden": true,
  } as const;

  switch (kind) {
    case "web":
      return (
        <svg {...common}>
          <rect x="10" y="12" width="112" height="56" rx="8" />
          <rect x="10" y="12" width="112" height="14" rx="8" />
          <circle cx="20" cy="19" r="2" />
          <circle cx="28" cy="19" r="2" />
          <circle cx="36" cy="19" r="2" />
          <rect x="20" y="34" width="40" height="24" rx="4" />
          <rect x="66" y="34" width="44" height="8" rx="2" />
          <rect x="66" y="46" width="32" height="6" rx="2" />
        </svg>
      );
    case "software":
      return (
        <svg {...common}>
          <rect x="14" y="18" width="36" height="28" rx="5" />
          <rect x="48" y="28" width="36" height="28" rx="5" />
          <rect x="30" y="40" width="36" height="24" rx="5" />
        </svg>
      );
    case "seo":
      return (
        <svg {...common}>
          <circle cx="52" cy="38" r="18" />
          <circle cx="52" cy="38" r="6" />
          <path d="M66 52 L86 68" />
          <path d="M28 62 L44 48 L58 54 L78 34" />
        </svg>
      );
    case "ads":
      return (
        <svg {...common}>
          <circle cx="66" cy="40" r="22" />
          <circle cx="66" cy="40" r="13" />
          <circle cx="66" cy="40" r="4" />
          <path d="M66 18 L70 12" />
          <path d="M88 40 L94 34" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path d="M18 62 H114" />
          <path d="M24 54 L46 40 L64 48 L86 26 L110 32" />
          <circle cx="46" cy="40" r="2.2" />
          <circle cx="86" cy="26" r="2.2" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common}>
          <circle cx="66" cy="40" r="5" />
          <circle cx="34" cy="24" r="3" />
          <circle cx="100" cy="26" r="3" />
          <circle cx="98" cy="58" r="3" />
          <circle cx="36" cy="58" r="3" />
          <path d="M62 37 L37 26" />
          <path d="M71 37 L97 28" />
          <path d="M70 44 L95 56" />
          <path d="M62 44 L39 56" />
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
      <Container className="home-services-shell">
        <Reveal>
          <p className="home-services-eye">
            <span aria-hidden className="home-services-dot" />
            {bento.eyebrow}
          </p>
          <h2 className="home-services-intro font-display">
            <span className="block">{bento.titleBefore.trim()}</span>
            <em>{bento.titleAccent}</em>
            {bento.titleAfter}
          </h2>
          <p className="home-services-lead">{bento.lead}</p>
        </Reveal>

        <ol className="home-services-list">
          {items.map((item, index) => (
            <li
              key={item.index}
              className={index === 0 ? "home-services-row is-lead" : "home-services-row"}
            >
              <div className="home-services-meta">
                <span className="home-services-index">{item.index}</span>
                <span className="home-services-tag">{item.tag}</span>
              </div>
              <h3 className="home-services-title font-display">{item.title}</h3>
              <div className="home-services-copy">
                <p>{item.body}</p>
                <Link href={routes.services} className="home-services-cta">
                  {bento.coreCta}
                  <span aria-hidden className="home-services-arrow">
                    →
                  </span>
                </Link>
                <div className="home-services-figure">
                  <ServiceFigure kind={item.visual} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
