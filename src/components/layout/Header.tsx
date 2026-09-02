"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { HeaderLogo } from "@/components/brand/HeaderLogo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

function navPath(href: string) {
  return href.split("#")[0] || "/";
}

function isActiveNav(pathname: string, href: string) {
  const path = navPath(href);
  if (href.includes("#") && path === "/") {
    return false;
  }

  return pathname === path;
}

function scrollToNavHash(pathname: string, href: string) {
  const hash = href.split("#")[1];
  if (!hash || pathname !== navPath(href)) {
    return;
  }

  window.requestAnimationFrame(() => {
    document.getElementById(hash)?.scrollIntoView();
  });
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

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className={cn("site-header", (scrolled || open) && "is-solid")}>
      <Container className="flex h-[4.25rem] items-center justify-between gap-6 min-[920px]:h-[5.15rem]">
        <HeaderLogo />

        <nav
          aria-label="Ana menü"
          className="site-header-nav hidden items-center gap-5 min-[920px]:flex min-[1280px]:gap-8"
        >
          {dictionary.nav.items.map((item) => {
            const active = isActiveNav(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("site-header-link", active && "is-active")}
                onClick={() => scrollToNavHash(pathname, item.href)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden min-[920px]:block">
          <Button href={routes.contact} className="site-header-cta min-h-11 px-5">
            {dictionary.nav.primaryCta}
          </Button>
        </div>

        <button
          type="button"
          className="site-header-toggle min-[920px]:hidden"
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
        className="site-header-menu min-[920px]:hidden"
      >
        <Container className="site-header-menu-inner">
          <nav aria-label="Mobil menü" className="site-header-menu-nav">
            {dictionary.nav.items.map((item) => {
              const active = isActiveNav(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("site-header-menu-link", active && "is-active")}
                  onClick={() => {
                    setOpen(false);
                    scrollToNavHash(pathname, item.href);
                  }}
                >
                  {item.label}
                  <span aria-hidden className="site-header-menu-arrow">
                    →
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="site-header-menu-cta">
            <Button href={routes.contact} className="site-header-cta site-header-menu-cta-btn">
              {dictionary.nav.primaryCta}
              <span aria-hidden>→</span>
            </Button>
            <p className="site-header-menu-note">{dictionary.home.hero.eyebrow}</p>
          </div>
        </Container>
      </div>
    </header>
  );
}
