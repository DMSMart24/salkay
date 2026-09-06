import { GrowthSystemStage } from "@/components/services/experience/GrowthSystemStage";
import { Container } from "@/components/ui/Container";
import type { ServiceModule } from "@/components/services/experience/ServiceModuleCard";
import { routes } from "@/lib/routes";

const modules: ServiceModule[] = [
  {
    id: "uiux",
    index: "01",
    title: "UI/UX TASARIM",
    body: "Kullanıcı odaklı, modern ve etkileyici arayüzler tasarlıyoruz.",
    href: routes.webDesign,
    icon: "pen",
  },
  {
    id: "software",
    index: "02",
    title: "ÖZEL YAZILIM",
    body: "İhtiyacınıza özel, ölçeklenebilir ve sürdürülebilir kod yapıları geliştiriyoruz.",
    href: "#yazilim",
    icon: "code",
  },
  {
    id: "seo",
    index: "03",
    title: "SEO & PERFORMANS",
    body: "Daha fazla görünürlük, daha hızlı yükleme ve sürdürülebilir büyüme sağlıyoruz.",
    href: "#buyume",
    icon: "chart",
  },
  {
    id: "ai",
    index: "04",
    title: "YAPAY ZEKA & OTOMASYON",
    body: "İş süreçlerinizi otomatikleştiriyor, yapay zekâ ile daha akıllı çözümler sunuyoruz.",
    href: routes.solutions,
    icon: "chip",
  },
];

export function DigitalGrowthSystem() {
  return (
    <section id="hizmetler" className="svc-dgs" aria-labelledby="svc-dgs-title">
      <Container className="svc-shell">
        <header className="svc-dgs-head">
          <p className="svc-dgs-eye">DİJİTAL BÜYÜME SİSTEMİ</p>
          <h2 id="svc-dgs-title">
            Markanızı büyüten <em>dijital yapı.</em>
          </h2>
          <p className="svc-dgs-lead">
            Tasarım, yazılım, performans ve yapay zekâyı tek bir sistemde
            buluşturuyor, markanızı sürdürülebilir şekilde büyütüyoruz.
          </p>
        </header>

        <GrowthSystemStage modules={modules} />

        <p className="svc-dgs-close">
          Dijitalde sadece var olmayın, <em>daha ileriye gidin.</em>
        </p>
      </Container>
    </section>
  );
}
