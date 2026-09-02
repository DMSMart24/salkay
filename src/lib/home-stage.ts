import {
  heroVariants,
  type HeroVideoVariant,
} from "@/lib/hero-video";

export type HomeStageMediaKind = "video" | "image" | "custom";

export type HomeStageMediaAsset = {
  kind: HomeStageMediaKind;
  src: string;
  poster: string;
  label: string;
  srcWebm?: string;
};

export const HOME_STAGE_CUE = {
  eyebrow: 0,
  headline: 40,
  copy: 90,
  cta: 140,
  media: 180,
  cards: 240,
  cardStagger: 55,
} as const;

export const HOME_STAGE_CARD_HREFS = [
  "/hizmetler",
  "/hizmetler",
  "/hizmetler",
] as const;

export function defaultHomeStageMedia(
  variant: HeroVideoVariant,
  label: string,
): HomeStageMediaAsset {
  const asset = heroVariants[variant];
  return {
    kind: "video",
    src: asset.mp4,
    poster: asset.poster,
    srcWebm: asset.webm,
    label,
  };
}
