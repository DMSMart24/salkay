import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type LogoProps = {
  tone?: "on-dark" | "on-light";
  className?: string;
};

export function Mark({
  className,
  cutout = "var(--c-bg)",
}: {
  className?: string;
  cutout?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 8 L92 88 L70 88 L50 46 L30 88 L8 88 Z" fill="currentColor" />
      <rect x="37" y="61" width="26" height="11" fill={cutout} />
    </svg>
  );
}

export function Logo({ tone = "on-dark", className }: LogoProps) {
  const onLight = tone === "on-light";

  return (
    <Link
      href={routes.home}
      aria-label="SALKAY ana sayfa"
      className={cn(
        "group inline-flex items-center gap-2.5",
        onLight ? "text-[#0A1020]" : "text-fg",
        className,
      )}
    >
      <Mark
        cutout={onLight ? "#F3F6FA" : "var(--c-bg)"}
        className={cn(
          "h-[22px] w-[22px] transition-transform duration-300 group-hover:scale-[1.04]",
          onLight ? "text-[#0A1020]" : "text-fg",
        )}
      />
      <span className="font-display text-[1.15rem] font-semibold leading-none tracking-[-0.04em]">
        SALKAY
      </span>
    </Link>
  );
}
