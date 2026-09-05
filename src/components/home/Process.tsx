"use client";

import { useRef } from "react";
import { Code2, Compass, PenTool, Rocket } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { IconWell } from "@/components/ui/IconWell";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import type { LucideIcon } from "lucide-react";

const processIcons = [Compass, PenTool, Code2, Rocket] as const satisfies readonly LucideIcon[];

export function Process() {
  const { process } = getDictionary().home;
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.8", "end 0.35"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <section id="surec" className="atelier-process">
      <Container>
        <Reveal className="atelier-process-head">
          <p className="studio-eye">{process.eyebrow}</p>
          <h2 className="studio-title font-display">{process.title}</h2>
          <p className="studio-lead">{process.lead}</p>
        </Reveal>
        <div ref={trackRef} className="apple-process-track">
          <span className="apple-process-rail" aria-hidden />
          {reduce ? null : (
            <motion.span
              className="apple-process-progress"
              style={{ scaleY }}
              aria-hidden
            />
          )}
          <ol className="atelier-spine">
            {process.steps.map((step, index) => {
              const Icon = processIcons[index] ?? Compass;

              return (
                <li key={step.index}>
                  <Reveal>
                    <article className="apple-process-step">
                      <IconWell icon={Icon} />
                      <p className="atelier-spine-index">{step.index}</p>
                      <div>
                        <h3 className="font-display">{step.title}</h3>
                        <p>{step.body}</p>
                        <p className="atelier-spine-out">{step.outcome}</p>
                      </div>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
