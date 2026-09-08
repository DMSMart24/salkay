import { RestaurantLeadImportWizard } from "@/components/admin/RestaurantLeadImportWizard";
import { isDatabaseConfigured } from "@/lib/admin/prisma";
import { RESTAURANT_LEAD_CSV_COLUMNS } from "@/lib/admin/restaurant-leads-import";

export const dynamic = "force-dynamic";

export default function ImportRestaurantLeadsPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Firmalar · Restoranlar</p>
          <h1>Import Leads</h1>
          <p className="admin-help">
            CSV zorunlu, XLSX desteklenir. Create new leads kopyaları atlar. Update existing leads,
            restaurantName + district ile eşleşen kaydı günceller; boş hücre mevcut veriyi silmez.
            Confirm edilmeden veritabanına yazılmaz.
          </p>
        </div>
      </header>
      <section className="admin-panel">
        <h2>CSV kolonları</h2>
        <p className="admin-help">{RESTAURANT_LEAD_CSV_COLUMNS.join(", ")}</p>
      </section>
      {isDatabaseConfigured() ? (
        <RestaurantLeadImportWizard />
      ) : (
        <p className="admin-error">DATABASE_URL tanımlı değil.</p>
      )}
    </div>
  );
}
