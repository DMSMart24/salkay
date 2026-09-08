import { RestaurantLeadsWorkspace } from "@/components/admin/RestaurantLeadsWorkspace";
import { listFilterOptions } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  district?: string;
  region?: string;
  priority?: string;
  websiteStatus?: string;
  contactStatus?: string;
  emailSegment?: string;
  email?: string;
  website?: string;
  phone?: string;
  whatsapp?: string;
  view?: string;
  page?: string;
};

export default async function RestaurantLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const options = await listFilterOptions();

  return <RestaurantLeadsWorkspace params={params} industries={options.industries} />;
}
