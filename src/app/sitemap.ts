import type { MetadataRoute } from "next";
import { SITE_URL, CITIES, citySlug } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/signup", priority: 0.9, freq: "monthly" },
    { path: "/stories", priority: 0.8, freq: "weekly" },
    { path: "/safety", priority: 0.7, freq: "monthly" },
    { path: "/services", priority: 0.7, freq: "weekly" },
    ...CITIES.map((c) => ({ path: `/cities/${citySlug(c)}`, priority: 0.8, freq: "weekly" as const })),
    { path: "/login", priority: 0.5, freq: "yearly" },
    { path: "/legal/terms", priority: 0.4, freq: "yearly" },
    { path: "/legal/community", priority: 0.4, freq: "yearly" },
    { path: "/legal/declaration", priority: 0.4, freq: "yearly" },
    { path: "/legal/privacy", priority: 0.4, freq: "yearly" },
    { path: "/legal/refund", priority: 0.3, freq: "yearly" },
    { path: "/legal/grievance", priority: 0.3, freq: "yearly" },
  ];
  return pages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
