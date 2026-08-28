export const kayVariants = [
  "hero",
  "web",
  "seo",
  "analytics",
  "ai",
  "cta",
] as const;

export type KayVariant = (typeof kayVariants)[number];

export type KayRenderer = "image" | "placeholder" | "rive" | "lottie" | "gltf";

export const kayGlbSrc = "/brand/kay/kay-web.glb";

/**
 * KAY 3D archived for future reactivation.
 * Homepage must not load the GLB or initialize WebGL.
 * See src/components/brand/archived-3d/README.md
 */
export const kay3dArchived = true;

export const kayHeroStillSrc = "/brand/kay/kay-hero-still.webp";
export const kayHeroStillFallbackSrc = "/brand/kay/kay-hero-still.png";

export const kayLook = {
  headWeight: 0.55,
  neck02Weight: 0.28,
  neck01Weight: 0.17,
  maxYaw: (15 * Math.PI) / 180,
  maxPitch: (10 * Math.PI) / 180,
  maxYawDeg: 15,
  maxPitchDeg: 10,
  /** Permanent rest yaw toward the hero copy (screen-left). +Y yaw looks right. */
  contentRestYaw: (-4 * Math.PI) / 180,
  contentRestYawDeg: 4,
  tabletYawScale: 0.7,
  tabletPitchScale: 0.7,
  headResponse: 10,
  neckResponse: 6.5,
  returnResponse: 5,
  yawSign: 1,
  pitchSign: 1,
  bodyFollow: 0,
  idleBobAmount: 0.012,
  idleBobSpeed: 1.05,
} as const;

export type KayTone = "on-dark" | "on-light";

export type KayAsset = {
  variant: KayVariant;
  src: string;
  width: number;
  height: number;
  available: boolean;
  renderer: KayRenderer;
};

type KayFile = Omit<KayAsset, "available" | "renderer">;

/**
 * Drop production files into /public/brand/kay.
 * Preferred: transparent WebP or AVIF. Optional PNG fallback.
 * Future renderers (Rive / Lottie / GLB) can replace `renderer`
 * without changing page composition.
 */
export const kayFiles: Record<KayVariant, KayFile> = {
  hero: {
    variant: "hero",
    src: kayHeroStillSrc,
    width: 1024,
    height: 1536,
  },
  web: {
    variant: "web",
    src: "/brand/kay/kay-web.webp",
    width: 800,
    height: 1000,
  },
  seo: {
    variant: "seo",
    src: "/brand/kay/kay-seo.webp",
    width: 800,
    height: 1000,
  },
  analytics: {
    variant: "analytics",
    src: "/brand/kay/kay-analytics.webp",
    width: 800,
    height: 1000,
  },
  ai: {
    variant: "ai",
    src: "/brand/kay/kay-ai.webp",
    width: 800,
    height: 1000,
  },
  cta: {
    variant: "cta",
    src: "/brand/kay/kay-cta.webp",
    width: 800,
    height: 1000,
  },
};

export const kayAssetSpec = {
  format: ["image/webp", "image/avif"],
  fallback: "image/png",
  background: "transparent",
  color: {
    fur: "dark graphite / near-black",
    accent: "#1D5AAA",
    light: "subtle SALKAY-blue rim",
  },
  hero: { width: 1600, height: 2000, maxKb: 180 },
  section: { width: 1200, height: 1500, maxKb: 120 },
  framing: "full figure or 3/4, looking toward content, generous padding",
} as const;

export function assertKayVariant(variant: KayVariant): KayVariant {
  switch (variant) {
    case "hero":
    case "web":
    case "seo":
    case "analytics":
    case "ai":
    case "cta":
      return variant;
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}
