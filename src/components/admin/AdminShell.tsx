"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions/auth";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/companies", label: "Firmen" },
  { href: "/admin/restaurant-leads", label: "Restaurant-Leads" },
  { href: "/admin/groups", label: "Gruppen" },
  { href: "/admin/emails", label: "E-Mails" },
  { href: "/admin/templates", label: "Vorlagen" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/suppression", label: "Sperrliste" },
  { href: "/admin/settings", label: "Einstellungen" },
];

type AdminShellProps = {
  userName: string;
  userEmail: string;
  children: ReactNode;
};

export function AdminShell({ userName, userEmail, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-app">
      <button
        type="button"
        className="admin-menu-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        Menü
      </button>
      {open ? (
        <button
          type="button"
          className="admin-backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside className={cn("admin-sidebar", open && "is-open")}>
        <div className="admin-brand">
          <span className="admin-brand-mark">A</span>
          <div>
            <strong>SALKAY</strong>
            <p>Outreach</p>
          </div>
        </div>
        <nav aria-label="Admin">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("admin-nav-link", active && "is-active")}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-user">
          <p>{userName}</p>
          <span>{userEmail}</span>
          <form action={logoutAction}>
            <button type="submit">Logout</button>
          </form>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
