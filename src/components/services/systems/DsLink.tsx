import Link from "next/link";

export function DsLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="ds-link">
      {children}
      <span aria-hidden>→</span>
    </Link>
  );
}
