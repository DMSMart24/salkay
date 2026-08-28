import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getDictionary } from "@/i18n/get-dictionary";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const dictionary = getDictionary();

  return (
    <>
      <a href="#icerik" className="skip-link">
        {dictionary.nav.skip}
      </a>
      <Header />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
