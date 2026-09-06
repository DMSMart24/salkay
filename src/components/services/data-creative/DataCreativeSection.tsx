import { AnalyticsShowcase } from "@/components/services/data-creative/AnalyticsShowcase";
import { DataCreativeReveal } from "@/components/services/data-creative/DataCreativeReveal";
import { GrowthValueStrip } from "@/components/services/data-creative/GrowthValueStrip";
import { VideoCreativeShowcase } from "@/components/services/data-creative/VideoCreativeShowcase";
import { Container } from "@/components/ui/Container";

export function DataCreativeSection() {
  return (
    <section id="veri" className="dcr" aria-labelledby="dcr-title">
      <span className="dcr-orbit" aria-hidden />
      <span className="dcr-stars" aria-hidden />
      <span className="dcr-lines" aria-hidden />
      <Container className="svc-shell">
        <DataCreativeReveal>
          <header className="dcr-head">
            <p className="dcr-eye">
              <span aria-hidden />
              VERİ & CREATIVE
            </p>
            <div className="dcr-head-row">
              <h2 id="dcr-title" className="font-display">
                <span>Ölçün. Anlayın.</span>
                <span>Daha iyi anlatın.</span>
              </h2>
              <div>
                <p className="dcr-lead">
                  Veriyi içgörüye, içgörüyü etkileyici hikâyelere dönüştürüyoruz.
                  Daha güçlü markalar, daha anlamlı sonuçlar.
                </p>
                <p className="dcr-aside" aria-hidden>
                  VERİYLE DAHA FAZLASI MÜMKÜN
                  <span>INSIGHTS CREATE OPPORTUNITIES</span>
                </p>
              </div>
            </div>
          </header>

          <AnalyticsShowcase />
          <VideoCreativeShowcase />
          <GrowthValueStrip />

          <footer className="dcr-foot" aria-hidden>
            <p>FİKİRLERİ HAREKETE GEÇİRİRİZ</p>
            <p>DAHA GÜÇLÜ HİKAYELER / DAHA BÜYÜK SONUÇLAR</p>
          </footer>
        </DataCreativeReveal>
      </Container>
    </section>
  );
}
