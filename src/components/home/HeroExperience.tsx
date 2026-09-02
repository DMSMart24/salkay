import type { ReactNode } from "react";
import { HeroVideo } from "@/components/home/HeroVideo";

type HeroExperienceProps = {
  children: ReactNode;
};

export function HeroExperience({ children }: HeroExperienceProps) {
  return (
    <section
      data-salkay-hero
      className="relative overflow-hidden bg-canvas text-fg"
    >
      <div className="hero-visual">
        <HeroVideo />
      </div>
      <div className="hero-veil" aria-hidden />
      {children}
    </section>
  );
}
