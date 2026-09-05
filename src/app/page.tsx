import { StudioPage } from "@/components/studio/StudioPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, serviceSchema, websiteSchema } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={serviceSchema()} />
      <StudioPage />
    </>
  );
}
