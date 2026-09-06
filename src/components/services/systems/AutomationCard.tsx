import { DsLink } from "@/components/services/systems/DsLink";
import { routes } from "@/lib/routes";

const inputs = ["Veri Kaynağı", "Form / Talep", "E-posta", "Diğer Sistemler"] as const;
const outputs = ["Otomatik İşlem", "Raporlama", "Bildirim", "Süreç Tetikleme"] as const;

export function AutomationCard() {
  return (
    <article className="ds-card is-auto">
      <header>
        <span>03 / OTOMASYON</span>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M13 3.5 6.8 13h5.1L11 20.5 17.4 11h-5Z" />
        </svg>
      </header>
      <h3 className="font-display">AI & Otomasyon</h3>
      <p>
        Tekrarlayan işleri otomatikleştiren ve ekiplerin daha verimli çalışmasını
        destekleyen yapay zekâ çözümleri.
      </p>
      <div className="ds-flow" aria-hidden>
        <ul className="is-in">
          {inputs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="ds-flow-mid">
          <span className="ds-beam" />
          <div className="ds-brain">
            <svg viewBox="0 0 24 24">
              <path d="M12 3.5 13.4 9H19l-4.4 3.4L16.2 18 12 14.8 7.8 18l1.6-5.6L5 9h5.6Z" />
            </svg>
            <strong>AI – İşlem & Analiz</strong>
          </div>
          <span className="ds-beam" />
        </div>
        <ul className="is-out">
          {outputs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <DsLink href={routes.solutions}>Detayları İncele</DsLink>
    </article>
  );
}
