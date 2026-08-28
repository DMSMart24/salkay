export const heroBreakpoints = {
  desktopMin: 1280,
  tabletMin: 768,
  mobileMax: 767,
} as const;

export const heroMedia = {
  desktop: "(min-width: 1280px)",
  tablet: "(min-width: 768px) and (max-width: 1279px)",
  tabletLandscape:
    "(min-width: 768px) and (max-width: 1279px) and (orientation: landscape)",
  tabletPortrait:
    "(min-width: 768px) and (max-width: 1279px) and (orientation: portrait)",
  mobile: "(max-width: 767px)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

export type HeroVideoVariant = "desktop" | "tablet" | "mobile";

export const heroVariants = {
  desktop: {
    webm: "/video/salkay-hero-desktop.webm",
    mp4: "/video/salkay-hero-desktop.mp4",
    poster: "/video/salkay-hero-desktop-poster.webp",
    width: 1280,
    height: 720,
  },
  tablet: {
    webm: "/video/salkay-hero-tablet.webm",
    mp4: "/video/salkay-hero-tablet.mp4",
    poster: "/video/salkay-hero-tablet-poster.webp",
    width: 834,
    height: 1112,
  },
  mobile: {
    webm: "/video/salkay-hero-mobile.webm",
    mp4: "/video/salkay-hero-mobile.mp4",
    poster: "/video/salkay-hero-mobile-poster.webp",
    width: 720,
    height: 1280,
  },
} as const;

export type HeroPresentation = {
  desktop: boolean;
  tablet: boolean;
  tabletLandscape: boolean;
  tabletPortrait: boolean;
  mobile: boolean;
  stacked: boolean;
  reducedMotion: boolean;
  playVideo: boolean;
  variant: HeroVideoVariant;
};

export function heroVariantFromFlags(flags: {
  mobile: boolean;
  tabletPortrait: boolean;
}): HeroVideoVariant {
  if (flags.mobile) {
    return "mobile";
  }

  if (flags.tabletPortrait) {
    return "tablet";
  }

  return "desktop";
}

export function heroPresentationFromMatches(
  matches: (query: string) => boolean,
): HeroPresentation {
  const desktop = matches(heroMedia.desktop);
  const tablet = matches(heroMedia.tablet);
  const tabletLandscape = matches(heroMedia.tabletLandscape);
  const tabletPortrait = matches(heroMedia.tabletPortrait);
  const mobile = matches(heroMedia.mobile);
  const reducedMotion = matches(heroMedia.reducedMotion);
  const variant = heroVariantFromFlags({ mobile, tabletPortrait });

  return {
    desktop,
    tablet,
    tabletLandscape,
    tabletPortrait,
    mobile,
    stacked: mobile || tabletPortrait,
    reducedMotion,
    playVideo: !reducedMotion,
    variant,
  };
}
