const ENERGY_PATHS = [
  "M 380 410 C 680 330, 1040 450, 1560 360",
  "M 430 470 C 760 540, 1120 430, 1600 510",
  "M 460 340 C 820 250, 1180 380, 1580 280",
  "M 500 530 C 840 610, 1200 520, 1620 600",
  "M 410 430 C 720 400, 1100 480, 1540 420",
  "M 520 380 C 860 440, 1240 350, 1660 400",
  "M 480 500 C 800 460, 1160 560, 1580 490",
  "M 560 300 C 900 360, 1280 240, 1640 320",
] as const;

const FRAGMENTS = [
  { x: 1088, y: 352, w: 5, h: 5 },
  { x: 1196, y: 298, w: 3, h: 3 },
  { x: 1284, y: 414, w: 6, h: 2 },
  { x: 1368, y: 268, w: 2, h: 7 },
  { x: 1442, y: 486, w: 4, h: 4 },
  { x: 1518, y: 338, w: 7, h: 2 },
  { x: 1124, y: 538, w: 3, h: 6 },
  { x: 1320, y: 588, w: 5, h: 2 },
  { x: 1248, y: 246, w: 2, h: 4 },
  { x: 1404, y: 360, w: 4, h: 2 },
] as const;

export function HeroAtmosphere() {
  return (
    <div aria-hidden className="hero-fx pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-fx-base" />
      <div className="hero-fx-top" />
      <div className="hero-fx-grid" />
      <div className="hero-fx-field hero-fx-parallax-field" />
      <svg
        className="hero-fx-a hero-fx-a-rear hero-fx-parallax-a-rear"
        viewBox="0 0 140 170"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M70 2 L132 166" />
        <path d="M70 2 L8 166" />
        <path d="M70 18 L118 152" />
        <path d="M70 22 L24 148" />
      </svg>
      <svg
        className="hero-fx-a hero-fx-a-mid hero-fx-parallax-a"
        viewBox="0 0 140 170"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M70 10 L122 158" />
        <path d="M70 14 L20 154" />
        <path d="M42 104 L100 104" />
        <path d="M34 132 L56 132" />
        <path d="M86 132 L112 132" />
        <path d="M70 28 L104 136" />
        <path d="M70 36 L40 128" />
        <path d="M54 90 L88 90" />
        <path d="M62 48 L80 88 L50 88 Z" />
      </svg>
      <svg
        className="hero-fx-a hero-fx-a-core hero-fx-parallax-a"
        viewBox="0 0 140 170"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M68 16 L80 40" />
        <path d="M56 84 L86 84" />
        <path d="M74 52 L90 96" />
      </svg>
      <div className="hero-fx-bursts hero-fx-parallax-field" />
      <svg
        className="hero-fx-energy hero-fx-parallax-energy"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id="hero-energy-glow"
            x="-20%"
            y="-40%"
            width="140%"
            height="180%"
          >
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="hero-energy-bloom"
            x="-30%"
            y="-60%"
            width="160%"
            height="220%"
          >
            <feGaussianBlur stdDeviation="10" result="bloom" />
            <feMerge>
              <feMergeNode in="bloom" />
            </feMerge>
          </filter>
        </defs>
        {ENERGY_PATHS.map((d, index) => {
          const extra = index > 1 ? " hero-fx-wave-extra" : "";
          const tone = index === 2 || index === 4 || index === 7 ? " hero-fx-wave-cyan" : "";
          return (
            <g
              key={d}
              className={`hero-fx-wave hero-fx-wave-${index}${extra}${tone}`}
            >
              <path className="hero-fx-wave-bloom" d={d} />
              <path className="hero-fx-wave-strand" d={d} />
              <path className="hero-fx-wave-pulse" d={d} />
            </g>
          );
        })}
        {FRAGMENTS.map((item) => (
          <rect
            key={`${item.x}-${item.y}`}
            className="hero-fx-fragment"
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
          />
        ))}
      </svg>
      <div className="hero-fx-points hero-fx-parallax-points">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="hero-fx-connect" />
      <div className="hero-fx-copy-shade" />
      <div className="hero-fx-studio hero-fx-parallax-floor">
        <div className="hero-fx-studio-plane" />
        <div className="hero-fx-studio-grid" />
        <div className="hero-fx-studio-streaks" />
        <div className="hero-fx-studio-pool" />
        <div className="hero-fx-studio-ring hero-fx-studio-ring-a" />
        <div className="hero-fx-studio-ring hero-fx-studio-ring-b" />
        <div className="hero-fx-studio-ring hero-fx-studio-ring-c" />
      </div>
      <div className="hero-fx-vignette" />
    </div>
  );
}
