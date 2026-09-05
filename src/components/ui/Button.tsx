"use client";

import Link from "next/link";
import type { Route } from "next";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { buttonMotion } from "@/lib/motion";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost";
type ButtonTone = "on-dark" | "on-light";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  className?: string;
};

const styles: Record<ButtonVariant, string> = {
  primary: "apple-btn bg-[var(--c-blue)] text-white",
  secondary: "border border-transparent bg-transparent text-fg",
  accent: "apple-btn bg-[var(--c-blue)] text-white",
  ghost: "border border-transparent bg-transparent text-fg",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
}: ButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="inline-flex"
      {...(reduce || variant === "ghost" || variant === "secondary" ? {} : buttonMotion)}
    >
      <Link
        href={href as Route}
        className={cn(
          "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-medium tracking-[-0.01em]",
          styles[variant],
          className,
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}
