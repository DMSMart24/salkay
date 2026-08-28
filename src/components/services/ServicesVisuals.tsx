import type { ReactNode } from "react";

type ServiceIconKind = "software" | "config" | "ai" | "seo" | "ads" | "marketing" | "analytics" | "creative";

const iconProps = {
  viewBox: "0 0 32 32",
  className: "svc-icon",
  fill: "none",
  "aria-hidden": true,
} as const;

export function ServiceIcon({ kind }: { kind: ServiceIconKind }) {
  switch (kind) {
    case "software":
      return (
        <svg {...iconProps}>
          <path d="M6 11 L11 16 L6 21" />
          <path d="M26 11 L21 16 L26 21" />
          <rect x="13" y="8" width="6" height="6" rx="1" />
          <rect x="10" y="18" width="5" height="5" rx="1" />
          <rect x="17" y="18" width="5" height="5" rx="1" />
        </svg>
      );
    case "config":
      return (
        <svg {...iconProps}>
          <rect x="6" y="7" width="8" height="8" rx="1.5" />
          <rect x="18" y="7" width="8" height="8" rx="1.5" />
          <rect x="12" y="17" width="8" height="8" rx="1.5" />
          <path d="M14 11 H18" />
          <path d="M16 15 V17" />
        </svg>
      );
    case "ai":
      return (
        <svg {...iconProps}>
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
    case "seo":
      return (
        <svg {...iconProps}>
          <circle cx="14" cy="14" r="6.5" />
          <path d="M19 19 L26 26" />
          <path d="M14 9.5 V14 H18" />
          <circle cx="14" cy="14" r="2" />
        </svg>
      );
    case "ads":
      return (
        <svg {...iconProps}>
          <circle cx="16" cy="16" r="9" />
          <circle cx="16" cy="16" r="5" />
          <circle cx="16" cy="16" r="1.5" />
          <path d="M16 7 L18.5 4.5" />
          <path d="M25 16 L27.5 13.5" />
        </svg>
      );
    case "marketing":
      return (
        <svg {...iconProps}>
          <path d="M6 22 L12 14 L18 17 L26 8" />
          <path d="M20 8 H26 V14" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...iconProps}>
          <path d="M5 24 H27" />
          <path d="M8 20 L13 14 L18 17 L24 9" />
          <circle cx="8" cy="20" r="1.4" />
          <circle cx="13" cy="14" r="1.4" />
          <circle cx="18" cy="17" r="1.4" />
          <circle cx="24" cy="9" r="1.4" />
        </svg>
      );
    case "creative":
      return (
        <svg {...iconProps}>
          <rect x="7" y="8" width="18" height="13" rx="2" />
          <path d="M13 13 L18 15.5 L13 18 Z" />
          <path d="M10 24 H22" />
        </svg>
      );
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function EyebrowLabel({ children }: { children: ReactNode }) {
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

export function ServicesHeroAtmosphere() {
  return (
    <div aria-hidden className="svc-atmosphere">
      <div className="svc-atmosphere-glow svc-hero-glow" />
      <svg
        viewBox="0 0 1440 820"
        className="svc-atmosphere-svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="svc-page-diag" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-blue)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--c-blue)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--c-blue)" stopOpacity="0" />
          </linearGradient>
          <pattern
            id="svc-page-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path d="M80 0 H0 V80" className="svc-atmosphere-grid" />
          </pattern>
        </defs>
        <rect width="1440" height="820" fill="url(#svc-page-grid)" />
        <path
          d="M980 20 L1360 760 L1160 760 L980 420 L800 760 L600 760 Z"
          className="svc-atmosphere-a"
        />
        <line x1="60" y1="80" x2="520" y2="740" stroke="url(#svc-page-diag)" />
        <line x1="240" y1="20" x2="900" y2="780" stroke="url(#svc-page-diag)" />
        <line x1="1280" y1="60" x2="820" y2="760" stroke="url(#svc-page-diag)" />
        <g className="svc-atmosphere-nodes">
          <circle cx="160" cy="180" r="1.6" />
          <circle cx="390" cy="300" r="1.4" />
          <circle cx="720" cy="150" r="1.5" />
          <circle cx="1040" cy="340" r="1.3" />
          <circle cx="1260" cy="220" r="1.6" />
          <circle cx="280" cy="620" r="1.3" />
          <circle cx="860" cy="680" r="1.4" />
        </g>
      </svg>
    </div>
  );
}

export function ServicesHeroSystem() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 340"
      className="svc-hero-system"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="svc-hero-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-blue)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="var(--c-cyan)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--c-blue)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <polygon
        points="268,18 348,248 188,248"
        fill="none"
        stroke="url(#svc-hero-line)"
        strokeWidth="1.2"
      />
      <polygon
        points="282,52 336,220 228,220"
        fill="none"
        stroke="url(#svc-hero-line)"
        strokeWidth="0.8"
      />
      <circle cx="210" cy="168" r="7" className="svc-core-node" />
      <circle cx="86" cy="92" r="4.5" className="svc-sat-node" />
      <circle cx="68" cy="228" r="4.5" className="svc-sat-node" />
      <circle cx="168" cy="286" r="4.5" className="svc-sat-node" />
      <circle cx="352" cy="118" r="4.5" className="svc-sat-node" />
      <circle cx="338" cy="286" r="4.5" className="svc-sat-node" />
      <path d="M204 162 L90 96" className="svc-sys-link" />
      <path d="M204 174 L74 224" className="svc-sys-link" />
      <path d="M210 176 L168 280" className="svc-sys-link" />
      <path d="M218 164 L346 122" className="svc-sys-link" />
      <path d="M218 174 L332 278" className="svc-sys-link" />
      <rect x="54" y="58" width="64" height="42" rx="8" className="svc-sys-panel" />
      <rect x="36" y="248" width="64" height="42" rx="8" className="svc-sys-panel" />
      <rect x="300" y="84" width="64" height="42" rx="8" className="svc-sys-panel" />
    </svg>
  );
}

export function ExperienceVisual() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 360 250"
      className="svc-experience-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="36" y="24" width="228" height="162" rx="14" className="svc-core-panel" />
      <rect x="36" y="24" width="228" height="28" rx="14" className="svc-core-chrome" />
      <circle cx="56" cy="38" r="3.5" className="svc-core-dot" />
      <circle cx="70" cy="38" r="3.5" className="svc-core-dot" />
      <circle cx="84" cy="38" r="3.5" className="svc-core-dot" />
      <rect x="52" y="70" width="86" height="10" rx="2" className="svc-core-bar" />
      <rect x="52" y="90" width="118" height="6" rx="2" className="svc-core-bar dim" />
      <rect x="52" y="110" width="68" height="48" rx="6" className="svc-core-tile" />
      <rect x="130" y="110" width="68" height="48" rx="6" className="svc-core-tile" />
      <rect x="208" y="70" width="40" height="88" rx="6" className="svc-core-tile tall" />
      <rect x="276" y="78" width="52" height="92" rx="10" className="svc-core-panel" />
      <rect x="286" y="90" width="32" height="6" rx="2" className="svc-core-bar" />
      <rect x="286" y="104" width="32" height="48" rx="5" className="svc-core-tile" />
    </svg>
  );
}

export function GrowthVisual() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 220"
      className="svc-growth-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="110" cy="110" r="86" className="svc-radar-ring" />
      <circle cx="110" cy="110" r="56" className="svc-radar-ring" />
      <circle cx="110" cy="110" r="26" className="svc-radar-ring" />
      <path d="M110 24 V196" className="svc-radar-axis" />
      <path d="M24 110 H196" className="svc-radar-axis" />
      <path d="M110 110 L176 58" className="svc-radar-beam" />
      <circle cx="176" cy="58" r="3.5" className="svc-sat-node" />
      <circle cx="110" cy="110" r="4" className="svc-core-node" />
    </svg>
  );
}

export function DataMergeVisual() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 280 160"
      className="svc-data-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M20 118 L64 78 L102 96 L148 40" className="svc-sys-link" />
      <circle cx="20" cy="118" r="2.4" className="svc-sat-node" />
      <circle cx="64" cy="78" r="2.4" className="svc-sat-node" />
      <circle cx="102" cy="96" r="2.4" className="svc-sat-node" />
      <circle cx="148" cy="40" r="3" className="svc-core-node" />
      <path d="M148 40 C188 36 208 70 248 52" className="svc-creative-beam" />
      <path d="M148 40 C186 54 214 88 252 78" className="svc-creative-beam dim" />
      <path d="M148 40 C180 22 214 18 250 28" className="svc-creative-beam dim" />
    </svg>
  );
}

export function FinaleAtmosphere() {
  return (
    <div aria-hidden className="svc-atmosphere">
      <div className="svc-atmosphere-glow svc-finale-glow" />
      <svg
        viewBox="0 0 1440 520"
        className="svc-atmosphere-svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="svc-finale-diag" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--c-blue)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--c-blue)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--c-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M1080 10 L1380 460 L1220 460 L1080 240 L940 460 L780 460 Z"
          className="svc-atmosphere-a"
        />
        <line
          x1="80"
          y1="80"
          x2="640"
          y2="460"
          stroke="url(#svc-finale-diag)"
        />
        <g className="svc-atmosphere-nodes">
          <circle cx="220" cy="140" r="1.5" />
          <circle cx="540" cy="220" r="1.3" />
          <circle cx="980" cy="120" r="1.5" />
          <circle cx="1240" cy="300" r="1.4" />
        </g>
      </svg>
    </div>
  );
}
