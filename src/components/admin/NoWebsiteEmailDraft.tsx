import { RestaurantSalesEmailDraft } from "@/components/admin/RestaurantSalesEmailDraft";
import type { NoWebsiteOpportunity } from "@/lib/admin/restaurant-no-website";

export function NoWebsiteEmailDraft({ opportunity }: { opportunity: NoWebsiteOpportunity }) {
  return (
    <RestaurantSalesEmailDraft
      opportunity={opportunity}
      help="Gönderilmez. WEAK/VERY_WEAK “sitenizdeki somut sorunlar” metni bu gruba uygulanmaz. Public e-posta yoksa sahte adres üretilmez."
    />
  );
}
