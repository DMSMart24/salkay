export const routes = {
  home: "/",
  services: "/hizmetler",
  solutions: "/cozumler",
  projects: "/projeler",
  about: "/hakkimizda",
  blog: "/blog",
  contact: "/iletisim",
  webDesign: "/web-tasarim",
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
  intro: "/#web-tasarim",
  capabilities: "/#yazilim",
  webDesign: "/#web-tasarim",
  services: "/#web-tasarim",
  process: "/#surec",
  kay: "/#kay",
  projects: "/projeler",
  growth: "/#gorunurluk",
  analytics: `${routes.services}#veri`,
  software: "/#yazilim",
  contact: "/#iletisim",
  cta: "/#iletisim",
  packages: `${routes.webDesign}#paketler`,
} as const;

export const publicPages = [
  routes.home,
  routes.services,
  routes.solutions,
  routes.projects,
  routes.about,
  routes.blog,
  routes.contact,
  routes.webDesign,
] as const;
