import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // keep private, login-gated and API areas out of the index
      disallow: ["/dashboard", "/account", "/matches", "/chat", "/profile", "/membership", "/verify", "/admin", "/api/", "/login/reset"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
