import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GrowthDashboard } from "@/components/services/experience/GrowthDashboard";
import { HeroParallax } from "@/components/services/experience/HeroParallax";
import { MobilePreview } from "@/components/services/experience/MobilePreview";
import { NetworkBackground } from "@/components/services/experience/NetworkBackground";
import { sections } from "@/lib/routes";

const features = [
  { icon: "bolt", label: "Daha hızlı büyüme" },
  { icon: "layers", label: "Estetik ve performans" },
  { icon: "chart", label: "Dönüşüm odaklı tasarım" },
] as const;

function FeatureIcon({ icon }: { icon: (typeof features)[number]["icon"] }) {
  switch (icon) {
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M13 3 5.8 13.2h5.1L10.2 21 18.4 10.6h-5.2Z" />
        </svg>
      );
    case "layers":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 4.5 4 8.2l8 3.7 8-3.7Z" />
          <path d="M4 12.2 12 16l8-3.8" />
          <path d="M4 16.1 12 20l8-3.9" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M5 18V9M12 18V6M19 18v-7" />
        </svg>
      );
    default: {
      const _never: never = icon;
      return _never;
    }
  }
}

export function HeroSection() {
  return (
    <section id="web-tasarim" className="svc-hero" aria-labelledby="svc-hero-title">
      <NetworkBackground />
      <Container className="svc-shell relative">
        <div className="svc-hero-grid">
          <div className="svc-hero-copy">
            <p className="svc-hero-eye">
              <span aria-hidden className="svc-hero-dot" />
              DİJİTAL DENEYİM
            </p>
            <p className="svc-hero-kicker">01 / WEB TASARIM</p>
            <h1 id="svc-hero-title" className="svc-hero-title">
              Markanızın dijital yüzünü <em>tasarlıyoruz.</em>
            </h1>
            <p className="svc-hero-lead">
              Kurumsal web siteleri, landing page&apos;ler ve dijital deneyimleri
              markanıza özel tasarlıyor; hız, kullanılabilirlik ve dönüşümü
              birlikte ele alıyoruz.
            </p>
            <div className="svc-hero-actions">
              <Button href={sections.packages} className="svc-hero-cta">
                Paketleri İncele
                <span aria-hidden>→</span>
              </Button>
            </div>
            <ul className="svc-hero-feats">
              {features.map((item) => (
                <li key={item.label}>
                  <FeatureIcon icon={item.icon} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <HeroParallax>
            <p className="sr-only">Örnek arayüz</p>
            <GrowthDashboard />
            <MobilePreview />
          </HeroParallax>
        </div>
      </Container>
    </section>
  );
}
