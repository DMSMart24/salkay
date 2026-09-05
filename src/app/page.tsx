import { HomeContact } from "@/components/home/HomeContact";
import { Hero } from "@/components/home/Hero";
import { Process } from "@/components/home/Process";
import { SoftwareCraft } from "@/components/home/SoftwareCraft";
import { Visibility } from "@/components/home/Visibility";
import { WebCraft } from "@/components/home/WebCraft";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, serviceSchema, websiteSchema } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={serviceSchema()} />
      <Hero />
      <WebCraft />
      <SoftwareCraft />
      <Visibility />
      <Process />
      <HomeContact />
    </>
  );
}
