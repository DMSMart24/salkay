import Image from "next/image";
import { ConceptSite } from "@/components/home/ConceptSite";
import { getDictionary } from "@/i18n/get-dictionary";
import { kayHeroStillSrc } from "@/lib/kay";

export function HeroStage() {
  const { hero } = getDictionary().home;

  return (
    <div className="hero-stage">
      <ConceptSite label={hero.visualLabel} caption={hero.visualCaption} />
      <Image
        src={kayHeroStillSrc}
        alt=""
        width={220}
        height={330}
        sizes="72px"
        className="hero-stage-kay"
      />
    </div>
  );
}
