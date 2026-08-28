import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

type ServiceKind = "software" | "seo" | "ads" | "analytics" | "ai";

const secondaryKinds: ServiceKind[] = [
  "software",
  "seo",
  "ads",
  "analytics",
  "ai",
];

function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2">
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
      />
      <span className="label text-cyan">{children}</span>
    </p>
  );
}

function ServiceIcon({ kind }: { kind: ServiceKind }) {
  const common = {
    viewBox: "0 0 32 32",
    className: "services-icon",
    fill: "none",
    "aria-hidden": true,
  } as const;

  switch (kind) {
    case "software":
      return (
        <svg {...common}>
          <path d="M6 11 L11 16 L6 21" />
          <path d="M26 11 L21 16 L26 21" />
          <rect x="13" y="8" width="6" height="6" rx="1" />
          <rect x="10" y="18" width="5" height="5" rx="1" />
          <rect x="17" y="18" width="5" height="5" rx="1" />
        </svg>
      );
    case "seo":
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="6.5" />
          <path d="M19 19 L26 26" />
          <path d="M14 9.5 V14 H18" />
          <circle cx="14" cy="14" r="2" />
        </svg>
      );
    case "ads":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="9" />
          <circle cx="16" cy="16" r="5" />
          <circle cx="16" cy="16" r="1.5" />
          <path d="M16 7 L18.5 4.5" />
          <path d="M25 16 L27.5 13.5" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path d="M5 24 H27" />
          <path d="M8 20 L13 14 L18 17 L24 9" />
          <circle cx="8" cy="20" r="1.4" />
          <circle cx="13" cy="14" r="1.4" />
          <circle cx="18" cy="17" r="1.4" />
          <circle cx="24" cy="9" r="1.4" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="2.2" />
          <circle cx="7" cy="10" r="1.6" />
          <circle cx="25" cy="10" r="1.6" />
          <circle cx="8" cy="23" r="1.6" />
          <circle cx="24" cy="23" r="1.6" />
          <path d="M14.2 14.6 L8.4 11.2" />
          <path d="M17.8 14.6 L23.6 11.2" />
          <path d="M14.4 17.8 L9.4 21.8" />
          <path d="M17.6 17.8 L22.6 21.8" />
        </svg>
      );
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

function CoreVisual() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 360 260"
      className="services-core-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="svc-core-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-blue)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--c-blue)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--c-cyan)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect
        x="48"
        y="28"
        width="240"
        height="168"
        rx="14"
        className="services-core-panel"
      />
      <rect x="48" y="28" width="240" height="28" rx="14" className="services-core-chrome" />
      <circle cx="68" cy="42" r="3.5" className="services-core-dot" />
      <circle cx="82" cy="42" r="3.5" className="services-core-dot" />
      <circle cx="96" cy="42" r="3.5" className="services-core-dot" />
      <rect x="64" y="74" width="88" height="10" rx="2" className="services-core-bar" />
      <rect x="64" y="94" width="124" height="6" rx="2" className="services-core-bar dim" />
      <rect x="64" y="110" width="72" height="48" rx="6" className="services-core-tile" />
      <rect x="144" y="110" width="72" height="48" rx="6" className="services-core-tile" />
      <rect x="224" y="74" width="44" height="84" rx="6" className="services-core-tile tall" />
      <polygon
        points="300,18 348,210 252,210"
        fill="none"
        stroke="url(#svc-core-line)"
        strokeWidth="1.2"
      />
      <polygon
        points="312,52 340,186 276,186"
        fill="none"
        stroke="url(#svc-core-line)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

function ServicesAtmosphere() {
  return (
    <div aria-hidden className="services-atmosphere">
      <div className="services-atmosphere-glow" />
      <svg
        viewBox="0 0 1440 980"
        className="services-atmosphere-svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="svc-diag" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-blue)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--c-blue)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--c-blue)" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="svc-grid"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <path d="M72 0 H0 V72" className="services-atmosphere-grid" />
          </pattern>
        </defs>
        <rect width="1440" height="980" fill="url(#svc-grid)" />
        <path
          d="M1080 40 L1420 860 L1240 860 L1080 500 L920 860 L740 860 Z"
          className="services-atmosphere-a"
        />
        <line x1="80" y1="120" x2="620" y2="860" stroke="url(#svc-diag)" />
        <line x1="220" y1="40" x2="980" y2="920" stroke="url(#svc-diag)" />
        <line x1="1180" y1="80" x2="760" y2="900" stroke="url(#svc-diag)" />
        <g className="services-atmosphere-nodes">
          <circle cx="180" cy="210" r="1.6" />
          <circle cx="410" cy="360" r="1.4" />
          <circle cx="690" cy="190" r="1.5" />
          <circle cx="980" cy="430" r="1.3" />
          <circle cx="1240" cy="260" r="1.6" />
          <circle cx="300" cy="720" r="1.3" />
          <circle cx="860" cy="780" r="1.4" />
          <circle cx="1320" cy="640" r="1.2" />
        </g>
      </svg>
    </div>
  );
}

function formatIndex(value: number) {
  return String(value).padStart(2, "0");
}

export function ServicesBento() {
  const { bento } = getDictionary().home;
  const pairCards = bento.items.slice(0, 4);
  const automation = bento.items[4];

  return (
    <section id="hizmetler" className="services-system">
      <ServicesAtmosphere />

      <Container className="relative">
        <Reveal>
          <p className="eyebrow inline-flex items-center gap-2 text-cyan">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
            />
            {bento.eyebrow}
          </p>
          <h2 className="services-intro-title mt-5 max-w-3xl font-display text-h2 text-fg">
            {bento.titleBefore}
            <span className="text-blue">{bento.titleAccent}</span>
            {bento.titleAfter}
          </h2>
          <p className="mt-6 max-w-2xl text-muted">{bento.lead}</p>
        </Reveal>

        <Reveal className="services-core-wrap" delay={80}>
          <article className="services-card services-core">
            <div className="services-core-copy">
              <div className="services-card-head">
                <span className="services-index" aria-hidden>
                  01
                </span>
                <EyebrowLabel>{bento.coreTag}</EyebrowLabel>
              </div>
              <h3 className="services-core-title font-display text-fg">
                {bento.coreTitle}
              </h3>
              <p className="services-core-body text-muted">{bento.coreBody}</p>
              <Link href={routes.services} className="services-core-cta">
                {bento.coreCta}
                <span aria-hidden className="services-core-arrow">
                  →
                </span>
              </Link>
            </div>
            <div className="services-core-visual">
              <CoreVisual />
            </div>
          </article>
        </Reveal>

        <div className="services-grid">
          {pairCards.map((item, index) => {
            const kind = secondaryKinds[index];
            return (
              <Reveal key={item.title} delay={(index + 1) * 70}>
                <article className="services-card services-support">
                  <div className="services-card-head">
                    <span className="services-index" aria-hidden>
                      {formatIndex(index + 2)}
                    </span>
                    {kind ? <ServiceIcon kind={kind} /> : null}
                  </div>
                  <EyebrowLabel>{item.tag}</EyebrowLabel>
                  <h3 className="mt-3 font-display text-h3 text-fg">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        {automation ? (
          <Reveal delay={360}>
            <article className="services-card services-support services-wide">
              <div className="services-wide-copy">
                <div className="services-card-head">
                  <span className="services-index" aria-hidden>
                    06
                  </span>
                  <ServiceIcon kind="ai" />
                </div>
                <EyebrowLabel>{automation.tag}</EyebrowLabel>
                <h3 className="mt-3 font-display text-h3 text-fg">
                  {automation.title}
                </h3>
              </div>
              <p className="services-wide-body text-[0.95rem] leading-relaxed text-muted">
                {automation.body}
              </p>
            </article>
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
