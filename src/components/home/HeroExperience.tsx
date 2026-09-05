import type { ReactNode } from "react";
import { HeroStage } from "@/components/home/HeroStage";

type HeroExperienceProps = {
  children: ReactNode;
};

export function HeroExperience({ children }: HeroExperienceProps) {
  return (
    <section data-salkay-hero className="hero-studio">
      {children}
      <HeroStage />
    </section>
  );
}
