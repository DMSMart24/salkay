import { AutomationCard } from "@/components/services/systems/AutomationCard";
import { ConfiguratorCard } from "@/components/services/systems/ConfiguratorCard";
import { CustomSoftwareCard } from "@/components/services/systems/CustomSoftwareCard";
import { SystemsArchitecture } from "@/components/services/systems/SystemsArchitecture";
import { SystemsReveal } from "@/components/services/systems/SystemsReveal";
import { ValueStrip } from "@/components/services/systems/ValueStrip";
import { Container } from "@/components/ui/Container";

export function DigitalSystemsSection() {
  return (
    <section id="yazilim" className="ds" aria-labelledby="ds-title">
      <Container className="svc-shell">
        <SystemsReveal>
          <header className="ds-head">
            <p className="ds-eye">
              <span aria-hidden />
              YAZILIM & SİSTEMLER
            </p>
            <div className="ds-head-row">
              <h2 id="ds-title" className="font-display">
                İşinize göre <em>çalışan teknoloji.</em>
              </h2>
              <div>
                <p className="ds-lead">
                  İhtiyaçlarınıza özel yazılım ve sistem çözümleri geliştiriyor;
                  süreçlerinizi dijitalleştirerek işinizi daha verimli ve
                  sürdürülebilir hale getiriyoruz.
                </p>
                <p className="ds-tag">DAHA AKILLI SİSTEMLER, DAHA GÜÇLÜ YARINLAR.</p>
              </div>
            </div>
          </header>

          <SystemsArchitecture />

          <div className="ds-cards">
            <CustomSoftwareCard />
            <ConfiguratorCard />
            <AutomationCard />
          </div>

          <ValueStrip />
        </SystemsReveal>
      </Container>
    </section>
  );
}
