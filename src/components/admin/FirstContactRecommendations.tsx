import Link from "next/link";
import type { RestaurantLead } from "@prisma/client";
import {
  RestaurantLeadScore,
  RestaurantWebsiteBadge,
} from "@/components/admin/RestaurantLeadBadges";
import { RestaurantLeadContactActions } from "@/components/admin/RestaurantLeadContactActions";
import { restaurantProblemList } from "@/lib/admin/restaurant-leads";

export function FirstContactRecommendations({ rows }: { rows: RestaurantLead[] }) {
  return (
    <section className="admin-panel admin-rl-first-contact">
      <div className="admin-rl-first-contact-head">
        <h2>🔥 İlk Temas İçin Önerilenler</h2>
        <p className="admin-help">
          HIGH · sitesi yok / çok zayıf / zayıf · telefon, WhatsApp veya e-posta var · satış durumu Yeni
          veya İletişime hazır. En fazla 10 kayıt, CRM’den dinamik.
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="admin-help">Bu bölgede ilk temas adayı yok.</p>
      ) : (
        <div className="admin-rl-first-contact-grid">
          {rows.map((row) => {
            const problems = restaurantProblemList(row);
            return (
              <article key={row.id} className="admin-rl-first-card">
                <div className="admin-rl-first-card-top">
                  <Link href={`/admin/restaurant-leads/${row.id}`} className="admin-strong">
                    {row.restaurantName}
                  </Link>
                  <RestaurantWebsiteBadge status={row.websiteStatus} />
                </div>
                <p className="admin-help">
                  {row.district}
                  {row.neighborhood ? ` · ${row.neighborhood}` : ""}
                </p>
                <RestaurantLeadScore score={row.leadScore} />
                {problems.length > 0 ? (
                  <ul className="admin-rl-problem-mini">
                    {problems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-help">Problem özeti yok.</p>
                )}
                <p className="admin-help">
                  {[row.phone, row.whatsapp, row.publicEmail].filter(Boolean).join(" · ") || "—"}
                </p>
                <RestaurantLeadContactActions lead={row} compact />
                <Link href={`/admin/restaurant-leads/${row.id}`} className="admin-btn">
                  Detaya Git
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
