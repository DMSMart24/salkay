import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

export function MobilePreview() {
  return (
    <aside className="svc-phone">
      <div className="svc-phone-screen">
        <Image
          src="/brand/salkay-a-mark.png"
          alt=""
          width={132}
          height={100}
          className="svc-phone-mark"
        />
        <p>Geleceğin Web Deneyimi</p>
        <span>Fikirden büyümeye.</span>
        <Link href={routes.contact} className="svc-phone-cta">
          Projenizi Konuşalım
        </Link>
      </div>
    </aside>
  );
}
