export const campaignVisuals = {
  reel: {
    src: "/campaigns/reel.png",
    width: 768,
    height: 1365,
  },
  ads: {
    src: "/campaigns/ads.png",
    width: 1376,
    height: 768,
  },
  hero: {
    src: "/campaigns/hero.png",
    width: 1376,
    height: 768,
  },
} as const;

export type CampaignTone = keyof typeof campaignVisuals;
