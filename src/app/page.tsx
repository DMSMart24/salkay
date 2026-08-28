import { HomeContact } from "@/components/home/HomeContact";
import { Hero } from "@/components/home/Hero";
import { KayStory } from "@/components/home/KayStory";
import { Marquee } from "@/components/home/Marquee";
import { Process } from "@/components/home/Process";
import { ServicesBento } from "@/components/home/ServicesBento";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, serviceSchema, websiteSchema } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={serviceSchema()} />
      <Hero />
      <Marquee />
      <ServicesBento />
      <Process />
      <KayStory />
      <HomeContact />
    </>
  );
}
