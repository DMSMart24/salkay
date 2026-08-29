import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type LogoProps = {
  tone?: "on-dark" | "on-light";
  className?: string;
};

export function Mark({ className }: { className?: string }) {
  return (
    <Image
      src="/email/salkay-logo-transparent.png"
      alt=""
      width={512}
      height={288}
      className={cn("h-[22px] w-auto", className)}
      aria-hidden
    />
  );
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href={routes.home}
      aria-label="SALKAY ana sayfa"
      className={cn("group inline-flex items-center", className)}
    >
      <Image
        src="/email/salkay-logo-transparent.png"
        alt="SALKAY"
        width={512}
        height={288}
        priority
        className="h-10 w-auto min-[920px]:h-12"
      />
    </Link>
  );
}
