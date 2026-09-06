import { routes } from "@/lib/routes";

/**
 * Navigation entries taken out of the live header, mobile menu, and footer.
 * Pages and components stay in place so a route can be restored by moving
 * an item back into `tr.nav.items`.
 */
export const archivedNavItems = [
  {
    id: "projects",
    href: routes.projects,
    label: "Çalışmalar",
    page: "src/app/projeler/page.tsx",
    components: ["src/components/home/Projects.tsx"],
  },
  {
    id: "about",
    href: routes.about,
    label: "Yaklaşımımız",
    page: "src/app/hakkimizda/page.tsx",
    components: ["src/components/about/AboutStudio.tsx"],
  },
] as const;
