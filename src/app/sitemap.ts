import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://app.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // Core pages
    { url: `${BASE}/home`,    lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/blog`,    lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/changelog`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },

    // Feature pages
    { url: `${BASE}/features/capture`,        lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/seo-scoring`,    lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/prioritization`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/messages`,       lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/features/export`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Use case pages
    { url: `${BASE}/use-cases/seo-agency`,           lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/use-cases/b2b-sales-team`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/use-cases/freelance-consultant`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/use-cases/revops-operator`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
