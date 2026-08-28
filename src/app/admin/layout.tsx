import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "SALKAY Admin",
    description: "SALKAY internal CRM",
    path: "/admin",
    index: false,
  }),
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
