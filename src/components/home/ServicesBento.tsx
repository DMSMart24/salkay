import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { routes } from "@/lib/routes";

type ServiceKind = "software" | "seo" | "ads" | "analytics";

const trioKinds: ServiceKind[] = ["software", "seo", "ads"];

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
          <rect x="7" y="7" width="9" height="9" rx="1.2" />
          <rect x="16" y="11" width="9" height="9" rx="1.2" />
          <rect x="10" y="17" width="9" height="8" rx="1.2" />
        </svg>
      );
    case "seo":
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="6.5" />
          <circle cx="14" cy="14" r="2.2" />
          <path d="M19 19 L26 26" />
          <path d="M14 8.8 V14 H18.2" />
        </svg>
      );
    case "ads":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="9" />
          <circle cx="16" cy="16" r="5" />
          <circle cx="16" cy="16" r="1.6" />
          <path d="M16 7 L18.4 4.6" />
          <path d="M25 16 L27.4 13.6" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path d="M6 25 H26" />
          <rect x="8" y="16" width="4" height="9" rx="0.8" />
          <rect x="14" y="11" width="4" height="14" rx="0.8" />
          <rect x="20" y="7" width="4" height="18" rx="0.8" />
        </svg>
      );
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

function AiIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="services-icon"
      fill="none"
      aria-hidden
    >
      <circle cx="16" cy="16" r="3.2" />
      <circle cx="7" cy="10" r="2" />
      <circle cx="25" cy="11" r="2" />
      <circle cx="24" cy="23" r="2" />
      <circle cx="8" cy="22" r="2" />
      <path d="M13.4 14.2 L8.6 11.2" />
      <path d="M18.8 14.2 L23.4 12.2" />
      <path d="M18.4 18.4 L22.6 21.8" />
      <path d="M13.6 18.6 L9.6 20.8" />
    </svg>
  );
}

function CoreVisual() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 280"
      className="services-core-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="svc-core-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-blue)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--c-blue)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--c-cyan)" stopOpacity="0.25" />
        </linearGradient>
        <clipPath id="svc-core-frame">
          <rect x="18" y="38" width="248" height="178" rx="16" />
        </clipPath>
      </defs>
      <g className="services-core-a" transform="translate(262 8) scale(1.72)">
        <path
          d="M50 8 L92 88 L70 88 L50 46 L30 88 L8 88 Z"
          fill="none"
          stroke="url(#svc-core-line)"
          strokeWidth="0.85"
        />
      </g>
      <g className="services-core-ui-main" clipPath="url(#svc-core-frame)">
        <rect
          x="18"
          y="38"
          width="248"
          height="178"
          rx="16"
          className="services-core-panel"
        />
        <rect x="18" y="38" width="248" height="30" className="services-core-chrome" />
        <circle cx="38" cy="53" r="3.4" className="services-core-dot" />
        <circle cx="52" cy="53" r="3.4" className="services-core-dot" />
        <circle cx="66" cy="53" r="3.4" className="services-core-dot" />
        <rect x="36" y="84" width="52" height="112" rx="8" className="services-core-tile" />
        <rect x="44" y="96" width="36" height="6" rx="2" className="services-core-bar" />
        <rect x="44" y="110" width="28" height="5" rx="2" className="services-core-bar dim" />
        <rect x="44" y="122" width="32" height="5" rx="2" className="services-core-bar dim" />
        <rect x="100" y="84" width="148" height="70" rx="8" className="services-core-tile" />
        <path
          d="M114 136 L140 118 L162 126 L188 104 L220 112 L236 96"
          className="services-core-graph"
        />
        <circle cx="140" cy="118" r="2.2" className="services-core-dot" />
        <circle cx="188" cy="104" r="2.2" className="services-core-dot" />
        <circle cx="236" cy="96" r="2.2" className="services-core-dot" />
      </g>
      <g className="services-core-ui-extra">
        <rect
          x="214"
          y="22"
          width="72"
          height="54"
          rx="10"
          className="services-core-tile tall"
        />
        <rect x="226" y="36" width="48" height="6" rx="2" className="services-core-bar" />
        <rect x="226" y="48" width="32" height="5" rx="2" className="services-core-bar dim" />
        <rect x="100" y="164" width="70" height="36" rx="8" className="services-core-tile" />
        <rect x="178" y="164" width="70" height="36" rx="8" className="services-core-tile" />
      </g>
    </svg>
  );
}

function AiNetworkVisual() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 280 200"
      className="services-wide-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="140" cy="100" r="58" className="services-ai-ring" />
      <circle cx="140" cy="100" r="34" className="services-ai-ring" />
      <circle cx="140" cy="100" r="5" className="services-core-dot" />
      <circle cx="86" cy="62" r="3.2" className="services-core-dot" />
      <circle cx="188" cy="54" r="3" className="services-core-dot" />
      <circle cx="216" cy="108" r="3.1" className="services-core-dot" />
      <circle cx="176" cy="156" r="2.8" className="services-core-dot" />
      <circle cx="92" cy="148" r="3" className="services-core-dot" />
      <circle cx="58" cy="104" r="2.6" className="services-core-dot" />
      <circle cx="132" cy="42" r="2.4" className="services-core-dot" />
      <circle cx="232" cy="72" r="2.2" className="services-core-dot" />
      <path d="M136 96 L88 64" className="services-ai-link" />
      <path d="M144 96 L186 56" className="services-ai-link" />
      <path d="M145 102 L214 108" className="services-ai-link" />
      <path d="M144 105 L176 154" className="services-ai-link" />
      <path d="M136 104 L94 146" className="services-ai-link" />
      <path d="M135 100 L60 104" className="services-ai-link" />
      <path d="M140 95 L132 44" className="services-ai-link" />
      <path d="M186 56 L230 72" className="services-ai-link" />
    </svg>
  );
}

function ServicesAtmosphere() {
  return (
    <div aria-hidden className="services-atmosphere">
      <div className="services-atmosphere-glow" />
      <div className="services-atmosphere-glow services-atmosphere-glow-a" />
      <svg
        viewBox="0 0 1440 980"
        className="services-atmosphere-svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="svc-diag" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-blue)" stopOpacity="0" />
            <stop offset="45%" stopColor="var(--c-blue)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--c-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform="translate(1048 -110) scale(8.1)">
          <path
            d="M50 8 L92 88 L70 88 L50 46 L30 88 L8 88 Z"
            className="services-atmosphere-a"
          />
        </g>
        <g transform="translate(1118 -30) scale(6.4)">
          <path
            d="M50 8 L92 88 L70 88 L50 46 L30 88 L8 88 Z"
            className="services-atmosphere-a dim"
          />
        </g>
        <line x1="40" y1="180" x2="480" y2="860" stroke="url(#svc-diag)" />
        <line x1="260" y1="40" x2="820" y2="900" stroke="url(#svc-diag)" />
        <line x1="1320" y1="60" x2="900" y2="880" stroke="url(#svc-diag)" />
        <g className="services-atmosphere-nodes">
          <circle cx="160" cy="210" r="1.5" />
          <circle cx="380" cy="140" r="1.2" />
          <circle cx="620" cy="260" r="1.4" />
          <circle cx="980" cy="180" r="1.3" />
          <circle cx="1260" cy="240" r="1.5" />
          <circle cx="240" cy="640" r="1.2" />
          <circle cx="760" cy="720" r="1.3" />
          <circle cx="1180" cy="680" r="1.1" />
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
  const trio = bento.items.slice(0, 3);
  const analytics = bento.items[3];
  const automation = bento.items[4];

  return (
    <section id="hizmetler" className="services-system">
      <ServicesAtmosphere />

      <Container className="services-shell relative">
        <Reveal>
          <p className="eyebrow inline-flex items-center gap-2 text-gold">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--c-cyan)]"
            />
            {bento.eyebrow}
          </p>
          <h2 className="services-intro-title mt-5 max-w-3xl font-display text-h2 text-cream">
            <span className="block">{bento.titleBefore.trim()}</span>
            <span className="hero-title-accent">{bento.titleAccent}</span>
            {bento.titleAfter}
          </h2>
          <div className="brand-rule" aria-hidden />
          <p className="services-intro-lead mt-6 max-w-xl text-muted">{bento.lead}</p>
        </Reveal>

        <div className="services-board">
          <Reveal className="services-core-wrap" delay={80}>
            <article className="services-card services-core">
              <div className="services-core-copy">
                <span className="services-index" aria-hidden>
                  01
                </span>
                <EyebrowLabel>{bento.coreTag}</EyebrowLabel>
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

          {trio.map((item, index) => {
            const kind = trioKinds[index];
            return (
              <Reveal
                key={item.title}
                className="services-cell"
                delay={(index + 1) * 70}
              >
                <article className="services-card services-support">
                  <div className="services-card-head">
                    <span className="services-index" aria-hidden>
                      {formatIndex(index + 2)}
                    </span>
                    {kind ? <ServiceIcon kind={kind} /> : null}
                  </div>
                  <EyebrowLabel>{item.tag}</EyebrowLabel>
                  <h3 className="services-card-title font-display text-fg">
                    {item.title}
                  </h3>
                  <p className="services-card-body text-muted">{item.body}</p>
                </article>
              </Reveal>
            );
          })}

          {analytics ? (
            <Reveal className="services-cell services-analytics-wrap" delay={280}>
              <article className="services-card services-support services-analytics">
                <div className="services-card-head">
                  <span className="services-index" aria-hidden>
                    05
                  </span>
                  <ServiceIcon kind="analytics" />
                </div>
                <EyebrowLabel>{analytics.tag}</EyebrowLabel>
                <h3 className="services-card-title font-display text-fg">
                  {analytics.title}
                </h3>
                <p className="services-card-body text-muted">{analytics.body}</p>
              </article>
            </Reveal>
          ) : null}

          {automation ? (
            <Reveal className="services-wide-wrap" delay={340}>
              <article className="services-card services-wide">
                <AiIcon />
                <div className="services-wide-copy">
                  <span className="services-index" aria-hidden>
                    06
                  </span>
                  <EyebrowLabel>{automation.tag}</EyebrowLabel>
                  <h3 className="services-card-title font-display text-fg">
                    {automation.title}
                  </h3>
                  <p className="services-card-body text-muted">{automation.body}</p>
                </div>
                <div className="services-wide-visual">
                  <AiNetworkVisual />
                </div>
              </article>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
