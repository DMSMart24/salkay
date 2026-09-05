type ConceptSiteProps = {
  label: string;
  caption: string;
  size?: "hero" | "section";
};

export function ConceptSite({ label, caption, size = "hero" }: ConceptSiteProps) {
  return (
    <figure className={`concept-site concept-site-${size}`}>
      <div className="concept-site-stage">
        <div className="concept-desktop" aria-hidden>
          <div className="concept-chrome">
            <span />
            <span />
            <span />
            <p>salkay.com/konsept</p>
          </div>
          <ConceptPage />
        </div>
        <div className="concept-phone" aria-hidden>
          <div className="concept-phone-notch" />
          <ConceptPage compact />
        </div>
      </div>
      <figcaption className="concept-site-caption">
        <span className="concept-site-label">{label}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

function ConceptPage({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "concept-page is-compact" : "concept-page"}>
      <header className="concept-page-bar">
        <strong>Marka</strong>
        {compact ? (
          <span className="concept-page-menu" />
        ) : (
          <nav>
            <span>Hizmetler</span>
            <span>Hakkımızda</span>
            <span>İletişim</span>
          </nav>
        )}
      </header>
      <div className="concept-page-hero">
        <p>Kurumsal web</p>
        <h2>Müşterileriniz sizi hemen anlasın.</h2>
        <span>İletişime geçin</span>
      </div>
      {compact ? null : (
        <div className="concept-page-grid">
          <article>
            <b>Hizmetler</b>
            <small>Ne sunduğunuz net durur.</small>
          </article>
          <article>
            <b>Hakkınızda</b>
            <small>Güven, kısa ve anlaşılır.</small>
          </article>
          <article>
            <b>İletişim</b>
            <small>Form ve WhatsApp görünür.</small>
          </article>
        </div>
      )}
    </div>
  );
}
