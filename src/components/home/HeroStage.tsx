import Image from "next/image";
import { HeroVideo } from "@/components/home/HeroVideo";
import { kayHeroStillSrc } from "@/lib/kay";

const plates = ["Web tasarım", "Yazılım"] as const;

export function HeroStage() {
  return (
    <div className="hero-stage">
      <div className="hero-stage-frame">
        <HeroVideo />
        <p className="hero-stage-caption">SALKAY stüdyo sahnesi · marka karakteri KAY</p>
        <ul className="hero-stage-plates">
          {plates.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <Image
          src={kayHeroStillSrc}
          alt=""
          width={220}
          height={330}
          sizes="96px"
          className="hero-stage-kay"
        />
      </div>
    </div>
  );
}
