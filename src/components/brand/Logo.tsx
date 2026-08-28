import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type LogoProps = {
  tone?: "on-dark" | "on-light";
  className?: string;
};

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 8 L92 88 L70 88 L50 46 L30 88 L8 88 Z" fill="currentColor" />
      <rect x="37" y="61" width="26" height="11" fill="var(--c-bg)" />
    </svg>
  );
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href={routes.home}
      aria-label="SALKAY ana sayfa"
      className={cn("group inline-flex items-center gap-2.5 text-fg", className)}
    >
      <Mark className="h-[22px] w-[22px] text-fg transition-transform duration-300 group-hover:scale-[1.04]" />
      <span className="font-display text-[1.15rem] font-semibold leading-none tracking-[-0.04em]">
        SALKAY
      </span>
    </Link>
  );
}
