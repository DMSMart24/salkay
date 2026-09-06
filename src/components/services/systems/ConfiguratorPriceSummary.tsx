import Link from "next/link";
import { routes } from "@/lib/routes";

export function ConfiguratorPriceSummary({ total }: { total: string }) {
  return (
    <div className="ds-cfg-sum">
      <p>
        Toplam Tutar
        <strong>₺ {total}</strong>
      </p>
      <Link href={routes.contact} className="ds-offer">
        Teklif Oluştur
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
