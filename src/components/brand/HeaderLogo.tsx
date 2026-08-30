import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

export function HeaderLogo() {
  return (
    <Link href={routes.home} aria-label="SALKAY Ana Sayfa" className="site-header-brand">
      <Image
        src="/brand/salkay-logo-header.png"
        alt=""
        width={615}
        height={144}
        priority
        quality={90}
        sizes="(max-width: 479px) 124px, (max-width: 919px) 136px, 154px"
        className="site-header-logo"
      />
    </Link>
  );
}
