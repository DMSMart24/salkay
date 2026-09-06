import { DigitalMarketingCard } from "@/components/services/growth/DigitalMarketingCard";
import { GoogleAdsCard } from "@/components/services/growth/GoogleAdsCard";
import { GrowthAnalytics } from "@/components/services/growth/GrowthAnalytics";
import { GrowthReveal } from "@/components/services/growth/GrowthReveal";
import { GrowthValues } from "@/components/services/growth/GrowthValues";
import { SeoCard } from "@/components/services/growth/SeoCard";
import { Container } from "@/components/ui/Container";
import { routes } from "@/lib/routes";
import Link from "next/link";

export function GrowthSection() {
  return (
    <section id="buyume" className="gx" aria-labelledby="gx-title">
      <Container className="svc-shell">
        <GrowthReveal>
          <div className="gx-hero">
            <div className="gx-copy">
              <p className="gx-eye">
                <span aria-hidden />
                BÜYÜME
              </p>
              <h2 id="gx-title">
                Görünür olun.
                <span>Doğru kitleye ulaşın.</span>
                <em>Büyüyün.</em>
              </h2>
              <p className="gx-lead">
                Dijital görünürlüğünüzü artırıyor, doğru kitleye ulaşmanızı
                destekliyor ve sürdürülebilir büyüme için güçlü bir dijital
                altyapı oluşturuyoruz.
              </p>
              <Link href={routes.contact} className="gx-cta">
                <i aria-hidden>
                  <svg viewBox="0 0 24 24">
                    <path d="M8 12h8M13 7l5 5-5 5" />
                  </svg>
                </i>
                Büyüme yolculuğunuzu başlatın
                <span aria-hidden>→</span>
              </Link>
            </div>
            <GrowthAnalytics />
          </div>

          <div className="gx-cards">
            <SeoCard />
            <GoogleAdsCard />
            <DigitalMarketingCard />
          </div>

          <GrowthValues />
          <p className="gx-end">DAHA GÜÇLÜ MARKALAR İÇİN, DAİMA İLERİ</p>
        </GrowthReveal>
      </Container>
    </section>
  );
}
