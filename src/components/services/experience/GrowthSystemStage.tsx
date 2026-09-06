"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { ServiceModuleCard, type ServiceModule } from "@/components/services/experience/ServiceModuleCard";

export function GrowthSystemStage({ modules }: { modules: ServiceModule[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-inview");
      return;
    }

    node.classList.add("is-ready");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.classList.add("is-inview");
          observer.disconnect();
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const card = (event.target as HTMLElement).closest(".svc-dgs-card");
    const stage = ref.current;
    if (!stage) {
      return;
    }

    for (const item of stage.querySelectorAll(".svc-dgs-card.is-on")) {
      item.classList.remove("is-on");
    }

    card?.classList.add("is-on");
  };

  return (
    <div ref={ref} className="svc-dgs-stage" onPointerDown={onPointerDown}>
      <p className="svc-dgs-tag is-top">TEK SİSTEM, DAHA BÜYÜK ETKİ.</p>
      <p className="svc-dgs-flow">FİKİR → TEKNOLOJİ → BÜYÜME</p>
      <ServiceModuleCard module={modules[0]} className="is-01" />
      <ServiceModuleCard module={modules[1]} className="is-02" />
      <ServiceModuleCard module={modules[2]} className="is-03" />
      <ServiceModuleCard module={modules[3]} className="is-04" />
      <p className="svc-dgs-tag is-bottom">DAHA FAZLA OLANAK</p>
    </div>
  );
}
