import Link from "next/link";
import { routes } from "@/lib/routes";

export function GrowthLink({ children }: { children: string }) {
  return (
    <Link href={routes.contact} className="gx-link">
      <span>{children}</span>
      <i aria-hidden>
        <svg viewBox="0 0 24 24">
          <path d="M8 12h8M13 7l5 5-5 5" />
        </svg>
      </i>
    </Link>
  );
}
