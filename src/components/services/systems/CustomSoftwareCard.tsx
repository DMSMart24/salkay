import { DsLink } from "@/components/services/systems/DsLink";
import { routes } from "@/lib/routes";

const nav = ["Projeler", "Talepler", "Ekip", "Raporlar"] as const;

export function CustomSoftwareCard() {
  return (
    <article className="ds-card is-soft">
      <header>
        <span>01 / SİSTEM</span>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 4.5 4 8.2l8 3.7 8-3.7Z" />
          <path d="M4 12.2 12 16l8-3.8M4 16.1 12 20l8-3.9" />
        </svg>
      </header>
      <h3 className="font-display">Özel Yazılım</h3>
      <p>Portallar, yönetim panelleri ve işletmenizin süreçlerine özel web uygulamaları.</p>
      <div className="ds-dash" aria-hidden>
        <div className="ds-dash-top">
          <strong>Proje Performansı</strong>
          <em>Son 30 Gün</em>
        </div>
        <ul>
          <li>
            <b>128</b>
            <span>Tamamlanan İş</span>
          </li>
          <li>
            <b>%94</b>
            <span>Başarı Oranı</span>
          </li>
          <li>
            <b>12</b>
            <span>Aktif Proje</span>
          </li>
        </ul>
        <div className="ds-dash-chart">
          <i>+%40 Verimlilik artışı</i>
          <svg viewBox="0 0 220 64" preserveAspectRatio="none">
            <path d="M6 50 C36 48 52 36 78 34 C108 31 126 42 154 22 C176 10 194 16 214 10" />
            <circle cx="214" cy="10" r="3.2" />
          </svg>
        </div>
        <div className="ds-dash-nav">
          {nav.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <DsLink href={routes.contact}>Detayları İncele</DsLink>
    </article>
  );
}
