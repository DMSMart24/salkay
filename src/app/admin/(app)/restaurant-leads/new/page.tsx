import { RestaurantLeadForm } from "@/components/admin/RestaurantLeadForm";
import { isDatabaseConfigured } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

export default function NewRestaurantLeadPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Firmalar · Restoranlar</p>
          <h1>Yeni restaurant lead</h1>
          {!isDatabaseConfigured() ? <p className="admin-error">DATABASE_URL tanımlı değil.</p> : null}
        </div>
      </header>
      {isDatabaseConfigured() ? <RestaurantLeadForm mode="create" /> : null}
    </div>
  );
}
