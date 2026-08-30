export const routes = {
  home: "/",
  services: "/hizmetler",
  solutions: "/cozumler",
  projects: "/projeler",
  about: "/hakkimizda",
  blog: "/blog",
  contact: "/iletisim",
} as const;

export const futureRoutes = {
  webDesign: "/web-tasarim",
  webDevelopment: "/web-gelistirme",
  software: "/yazilim-gelistirme",
  seo: "/seo",
  googleAds: "/google-ads",
  digitalMarketing: "/dijital-pazarlama",
  analytics: "/analitik",
  aiAutomation: "/yapay-zeka-otomasyon",
  configurators: "/konfiguratorler",
  video: "/video-icerik",
} as const;

export const sections = {
  intro: "/#hizmetler",
  capabilities: "/#hizmetler",
  webDesign: "/#hizmetler",
  services: "/#hizmetler",
  process: "/#surec",
  kay: "/#kay",
  projects: "/projeler",
  growth: "/#hizmetler",
  analytics: "/#hizmetler",
  software: "/#hizmetler",
  contact: "/#iletisim",
  cta: "/#iletisim",
} as const;

export const publicPages = [
  routes.home,
  routes.services,
  routes.solutions,
  routes.projects,
  routes.about,
  routes.blog,
  routes.contact,
] as const;
