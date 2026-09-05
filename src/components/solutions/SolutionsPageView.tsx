import { AIScene } from "@/components/solutions/AIScene";
import { AutomationScene } from "@/components/solutions/AutomationScene";
import { CommerceScene } from "@/components/solutions/CommerceScene";
import { PlatformScene } from "@/components/solutions/PlatformScene";
import { SolutionsBridge } from "@/components/solutions/SolutionsBridge";
import { SolutionsCTA } from "@/components/solutions/SolutionsCTA";
import { SolutionsHero } from "@/components/solutions/SolutionsHero";
import { SolutionsIntro } from "@/components/solutions/SolutionsIntro";
import { SolutionsOutcomes } from "@/components/solutions/SolutionsOutcomes";
import { WebDesignScene } from "@/components/solutions/WebDesignScene";

export function SolutionsPageView() {
  return (
    <div data-salkay-solutions className="studio-public">
      <SolutionsHero />
      <SolutionsIntro />
      <WebDesignScene />
      <PlatformScene />
      <AIScene />
      <AutomationScene />
      <CommerceScene />
      <SolutionsBridge />
      <SolutionsOutcomes />
      <SolutionsCTA />
    </div>
  );
}
