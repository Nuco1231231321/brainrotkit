import type { MetadataRoute } from "next";
import { allowIndexing, publicRoutes, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowIndexing) return [];

  return publicRoutes.map((route) => ({
    url: `${siteConfig.url}${route === "/" ? "/" : `${route}/`}`,
    lastModified: new Date("2026-07-16"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/remove-bg" || route.includes("brainrot") ? 0.9 : 0.6,
  }));
}
