"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeOnly, fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduce ? fadeOnly : fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={delay ? { delay: delay / 1000 } : undefined}
    >
      {children}
    </motion.div>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
};

export function RevealGroup({ children, className, as = "div" }: RevealGroupProps) {
  const reduce = useReducedMotion();
  const Component = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;

  return (
    <Component
      className={className}
      variants={reduce ? undefined : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.li className={className} variants={reduce ? fadeOnly : fadeUp}>
      {children}
    </motion.li>
  );
}
