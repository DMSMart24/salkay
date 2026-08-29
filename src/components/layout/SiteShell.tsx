import type { ReactNode } from "react";
import { headers } from "next/headers";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getDictionary } from "@/i18n/get-dictionary";

type SiteShellProps = {
  children: ReactNode;
};

export async function SiteShell({ children }: SiteShellProps) {
  const isAdmin = (await headers()).get("x-salkay-admin") === "1";
  if (isAdmin) {
    return children;
  }

  const dictionary = getDictionary();

  return (
    <div data-salkay-public className="flex min-h-dvh flex-col bg-canvas text-fg">
      <a href="#icerik" className="skip-link">
        {dictionary.nav.skip}
      </a>
      <Header />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
