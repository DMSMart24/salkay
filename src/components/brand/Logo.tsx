import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type LogoProps = {
  tone?: "on-dark" | "on-light";
  className?: string;
};

const LOCKUP_SRC = "/email/salkay-logo-transparent.png";

export function Mark({ className }: { className?: string; cutout?: string }) {
  return (
    <Image
      src={LOCKUP_SRC}
      alt=""
      width={512}
      height={288}
      className={cn("h-[22px] w-auto", className)}
      aria-hidden
    />
  );
}

export function Logo({ tone = "on-dark", className }: LogoProps) {
  return (
    <Link
      href={routes.home}
      aria-label="SALKAY ana sayfa"
      className={cn("group site-logo inline-flex items-center", className)}
      data-tone={tone}
    >
      <Image
        src={LOCKUP_SRC}
        alt="SALKAY"
        width={512}
        height={288}
        priority
        className="site-logo-lockup h-10 w-auto min-[920px]:h-12"
      />
    </Link>
  );
}
