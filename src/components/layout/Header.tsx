"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { routes, sections } from "@/lib/routes";

function isActiveNav(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  return pathname === routes.services && href === sections.services;
}

export function Header() {
  const pathname = usePathname();
  const dictionary = getDictionary();
  const [open, setOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-t-[3px] border-t-gold transition-[background-color,border-color,backdrop-filter,padding] duration-300",
        scrolled || open
          ? "border-b border-gold/25 bg-navy/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-[4.25rem] items-center justify-between gap-6 min-[920px]:h-[5.15rem]">
        <Logo />

        <nav
          aria-label="Ana menü"
          className="hidden items-center gap-5 min-[920px]:flex min-[1280px]:gap-8"
        >
          {dictionary.nav.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActiveNav(pathname, item.href) ? "page" : undefined}
              className={cn(
                "text-[0.94rem] tracking-[-0.01em] transition-colors hover:text-cyan",
                isActiveNav(pathname, item.href) ? "text-cream" : "text-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-[920px]:block">
          <Button href={sections.contact} className="min-h-11 px-5">
            {dictionary.nav.primaryCta}
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 text-cream min-[920px]:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? dictionary.nav.closeMenu : dictionary.nav.openMenu}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">
            {open ? dictionary.nav.closeMenu : dictionary.nav.openMenu}
          </span>
          <span aria-hidden className="flex w-4 flex-col gap-1.5">
            <span
              className={cn(
                "block h-px w-full bg-current transition-transform",
                open && "translate-y-[3.5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-px w-full bg-current transition-transform",
                open && "-translate-y-[3.5px] -rotate-45",
              )}
            />
          </span>
        </button>
      </Container>

      <div
        id={menuId}
        hidden={!open}
        className="border-t border-gold/20 bg-navy min-[920px]:hidden"
      >
        <Container className="flex flex-col gap-1 py-6">
          {dictionary.nav.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-3 font-display text-h3 text-cream"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4">
            <Button href={sections.contact} className="w-full">
              {dictionary.nav.primaryCta}
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
