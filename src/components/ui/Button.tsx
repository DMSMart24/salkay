import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

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
  primary: "bg-gold text-navy hover:bg-gold-bright",
  secondary:
    "border border-gold/45 bg-transparent text-cream hover:border-gold hover:bg-gold/10",
  accent: "bg-gold text-navy hover:bg-gold-bright",
  ghost:
    "border border-gold/40 bg-transparent text-cream hover:border-gold hover:bg-gold/10",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
}: ButtonProps) {
  return (
    <Link
      href={href as Route}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[0.95rem] font-semibold tracking-[-0.01em] transition-colors duration-200",
        styles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
