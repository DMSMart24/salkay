import { getDictionary } from "@/i18n/get-dictionary";

const moduleIcons = ["system", "tool", "auto"] as const;
const benefitIcons = ["shield", "data", "bolt"] as const;

type ModuleIcon = (typeof moduleIcons)[number];
type BenefitIcon = (typeof benefitIcons)[number];

export function SystemsShowcase() {
  const systems = getDictionary().servicesPage.systems;

  return (
    <div className="svc-sys">
      <div className="svc-sys-head">
        <div>
          <p className="svc-sys-eye">
            <span aria-hidden />
            {systems.eyebrow}
          </p>
          <h2 className="svc-sys-title font-display">
            <span>İşinize göre</span>
            <em>çalışan teknoloji.</em>
          </h2>
        </div>
        <p className="svc-sys-intro">{systems.intro}</p>
      </div>

      <div className="svc-sys-compose">
        <svg className="svc-sys-line" viewBox="0 0 100 18" preserveAspectRatio="none" aria-hidden>
          <path d="M16.6 4 H83.4" />
          <path d="M16.6 4 V16" />
          <path d="M50 4 V16" />
          <path d="M83.4 4 V16" />
          <circle cx="16.6" cy="4" r="1.4" />
          <circle cx="50" cy="4" r="1.4" />
          <circle cx="83.4" cy="4" r="1.4" />
          <circle cx="16.6" cy="16" r="1.1" />
          <circle cx="50" cy="16" r="1.1" />
          <circle cx="83.4" cy="16" r="1.1" />
        </svg>

        <div className="svc-sys-grid">
          {systems.items.map((item, index) => {
            const icon = moduleIcons[index] ?? "system";
            return (
              <article key={item.index} className={`svc-sys-mod is-${item.index}`}>
                <header className="svc-sys-mod-head">
                  <p>
                    {item.index} / {item.label}
                  </p>
                  <SysIcon name={icon} />
                </header>
                <h3 className="svc-sys-mod-title font-display">{item.title}</h3>
                <p className="svc-sys-mod-body">{item.body}</p>
                <div className="svc-sys-visual">
                  <ModuleVisual index={item.index} />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <ul className="svc-sys-benefits">
        {systems.benefits.map((item, index) => (
          <li key={item.title}>
            <SysIcon name={benefitIcons[index] ?? "shield"} />
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModuleVisual({ index }: { index: string }) {
  switch (index) {
    case "01":
      return <SoftwareVisual />;
    case "02":
      return <ConfiguratorVisual />;
    case "03":
      return <AutomationVisual />;
    default:
      return null;
  }
}

function SoftwareVisual() {
  return (
    <div className="svc-sys-dash" aria-hidden>
      <aside>
        <i />
        <i />
        <i />
        <i />
      </aside>
      <div>
        <b>Genel Bakış</b>
        <ul>
          <li>
            <em>Projeler</em>
            <span />
          </li>
          <li>
            <em>Talepler</em>
            <span />
          </li>
          <li>
            <em>Akışlar</em>
            <span />
          </li>
        </ul>
        <div className="svc-sys-chart">
          <small>Performans</small>
          <svg viewBox="0 0 160 48" preserveAspectRatio="none">
            <path d="M4 36 C28 34 36 22 52 24 C72 27 80 12 98 16 C118 21 128 10 156 14" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ConfiguratorVisual() {
  return (
    <div className="svc-sys-config" aria-hidden>
      <ol>
        <li>01 Ürün</li>
        <li className="is-on">02 Özelleştirme</li>
        <li>03 Fiyat</li>
        <li>04 Teklif</li>
      </ol>
      <div className="svc-sys-config-body">
        <span className="svc-sys-preview">
          <svg viewBox="0 0 64 64">
            <path d="M18 28h28v6H18Z" />
            <path d="M22 34v16M42 34v16" />
            <path d="M18 50h10M36 50h10" />
            <path d="M24 20h16l4 8H20Z" />
          </svg>
        </span>
        <ul>
          <li>
            <em>Model</em>
            <i />
          </li>
          <li>
            <em>Renk</em>
            <i />
          </li>
          <li>
            <em>Malzeme</em>
            <i />
          </li>
          <li>
            <em>Adet</em>
            <i />
          </li>
          <li className="is-sum">
            <em>Toplam</em>
            <b>— — —</b>
          </li>
        </ul>
      </div>
      <span className="svc-sys-config-cta">Teklif Oluştur</span>
    </div>
  );
}

function AutomationVisual() {
  return (
    <div className="svc-sys-flow" aria-hidden>
      <div className="svc-sys-flow-col">
        <span>
          <b>Veri</b>
          <small>API / DB</small>
        </span>
        <span>
          <b>Form</b>
          <small>Talep</small>
        </span>
      </div>
      <div className="svc-sys-flow-core">
        <strong>AI</strong>
        <small>İşlem & Analiz</small>
      </div>
      <div className="svc-sys-flow-col">
        <span>
          <b>Otomatik İşlem</b>
          <small>Workflow</small>
        </span>
        <span>
          <b>Raporlama</b>
          <small>Dashboard</small>
        </span>
      </div>
    </div>
  );
}

function SysIcon({ name }: { name: ModuleIcon | BenefitIcon }) {
  switch (name) {
    case "system":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M12 4.5 19 8.4v7.2L12 19.5 5 15.6V8.4Z" />
          <path d="M12 4.5v15M5 8.4l7 3.9 7-3.9" />
        </svg>
      );
    case "tool":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <rect x="5" y="5" width="6" height="6" rx="1" />
          <rect x="13" y="5" width="6" height="6" rx="1" />
          <rect x="5" y="13" width="6" height="6" rx="1" />
          <rect x="13" y="13" width="6" height="6" rx="1" />
        </svg>
      );
    case "auto":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="7" r="2" />
          <circle cx="18" cy="17" r="2" />
          <path d="M8 12h8M8 12l8-4.2M8 12l8 4.2" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M12 3.5 5.4 6.1v5.2c0 4.1 2.8 7.8 6.6 9.1 3.8-1.3 6.6-5 6.6-9.1V6.1Z" />
        </svg>
      );
    case "data":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <ellipse cx="12" cy="7" rx="6" ry="2.3" />
          <path d="M6 7v8c0 1.3 2.7 2.3 6 2.3s6-1 6-2.3V7" />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="M13 3.5 6.8 13h5.1L11 20.5 17.4 11h-5Z" />
        </svg>
      );
    default: {
      const _never: never = name;
      return _never;
    }
  }
}
