import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";
import { publicPages } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
