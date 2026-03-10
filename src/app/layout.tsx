import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/contexts/SessionContext";
import { LangProvider } from "@/contexts/LangContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnimationsProvider } from "@/contexts/AnimationsContext";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://app.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "seoprospector — LinkedIn Prospecting for SEO Agencies",
    template: "%s | seoprospector",
  },
  description:
    "Automate LinkedIn lead qualification for SEO agencies. Capture leads, score SEO opportunities, classify as HOT/WARM/COLD, and close deals faster — all from a Chrome extension.",
  keywords: [
    "SEO prospecting",
    "LinkedIn SEO tool",
    "SEO agency Chrome extension",
    "LinkedIn lead generation",
    "SEO audit automation",
    "lead qualification LinkedIn",
    "Chrome extension SEO",
    "LinkedIn outreach tool",
  ],
  authors: [{ name: "seoprospector", url: SITE_URL }],
  creator: "seoprospector",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "fr_FR",
    url: SITE_URL,
    siteName: "seoprospector",
    title: "seoprospector — LinkedIn Prospecting for SEO Agencies",
    description:
      "Automate LinkedIn lead qualification for SEO agencies. Chrome extension that captures leads, scores SEO opportunities, and classifies contacts as HOT, WARM or COLD.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "seoprospector — LinkedIn Prospecting Chrome Extension",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "seoprospector — LinkedIn Prospecting for SEO Agencies",
    description:
      "Chrome extension that turns LinkedIn browsing into a revenue-ready pipeline. Capture leads, score SEO opportunities, generate AI outreach.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AnimationsProvider>
            <LangProvider>
              <SessionProvider>
                {children}
              </SessionProvider>
            </LangProvider>
          </AnimationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
