import { RestaurantSalesEmailDraft } from "@/components/admin/RestaurantSalesEmailDraft";
import type { WebsiteProblemOpportunity } from "@/lib/admin/restaurant-no-website";

export function WebsiteProblemEmailDraft({ opportunity }: { opportunity: WebsiteProblemOpportunity }) {
  return (
    <RestaurantSalesEmailDraft
      opportunity={opportunity}
      help="Gönderilmez. Doğrulanmış mevcut site sorunları kullanılır. NO_WEBSITE “bağımsız site yok” metni uygulanmaz. Public e-posta yoksa sahte adres üretilmez."
    />
  );
}
