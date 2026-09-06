import { AnimatedDataLine } from "@/components/services/systems/AnimatedDataLine";
import { DigitalCore } from "@/components/services/systems/DigitalCore";
import { SystemFlowNode } from "@/components/services/systems/SystemFlowNode";

export function SystemsArchitecture() {
  return (
    <div className="ds-arch" aria-hidden>
      <DigitalCore />
      <SystemFlowNode
        className="is-app"
        title="SİSTEM UYGULAMALARI"
        meta="VERİ • UYGULAMA • KULLANICI"
        icon="stack"
      />
      <SystemFlowNode
        className="is-proc"
        title="ENTEGRE SÜREÇLER"
        meta="API • OTOMASYON • SENKRONİZASYON"
        icon="gear"
      />
      <SystemFlowNode
        className="is-ai"
        title="YAPAY ZEKA ÇÖZÜMLERİ"
        meta="ANALİZ • TAHMİN • OTOMATİK İŞLEM"
        icon="spark"
      />
      <AnimatedDataLine />
    </div>
  );
}
