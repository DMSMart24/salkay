import Image from "next/image";
import { getDictionary } from "@/i18n/get-dictionary";
import { kayHeroStillSrc } from "@/lib/kay";

/**
 * Static KAY still — not used on the production homepage while the
 * hero video is live. Keep for archive / reactivation.
 * Do not import Kay3D / KayMascot from the homepage.
 */
export function KayHero() {
  const { kay } = getDictionary();

  return (
    <div className="kay-still">
      <div className="kay-still-floor" aria-hidden />
      <Image
        src={kayHeroStillSrc}
        alt={kay.role}
        width={1024}
        height={1536}
        priority
        quality={90}
        sizes="(max-width: 919px) 72vw, (max-width: 1439px) 34vw, 420px"
        className="kay-still-figure"
      />
    </div>
  );
}
