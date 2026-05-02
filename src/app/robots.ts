import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://app.example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/account",
          "/leads",
          "/seo",
          "/messages",
          "/settings",
          "/agency",
          "/admin",
          "/support",
          "/login",
          "/register",
          "/team/",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
