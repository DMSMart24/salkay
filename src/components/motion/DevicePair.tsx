"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type DevicePairProps = {
  children: ReactNode;
  className?: string;
};

export function DevicePair({ children, className }: DevicePairProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        node.classList.toggle("is-pairing", Boolean(entry?.isIntersecting));
      },
      { threshold: 0.28 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("device-pair", className)}>
      {children}
    </div>
  );
}
