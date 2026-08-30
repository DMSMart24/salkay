export const CONTACT_PROJECT_TYPES = [
  "Web Tasarım",
  "Özel Yazılım",
  "AI & Otomasyon",
  "SEO & Büyüme",
  "Diğer",
] as const;

export type ContactProjectType = (typeof CONTACT_PROJECT_TYPES)[number];
