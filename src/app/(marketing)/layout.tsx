import type { Metadata } from "next";
import "./landing.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://app.example.com";

export const metadata: Metadata = {
  title: "seoprospector — LinkedIn Prospecting for SEO Agencies",
  description:
    "Turn LinkedIn activity into revenue-ready pipeline. Capture leads, score SEO opportunities, classify as HOT/WARM/COLD, and generate AI outreach — with a Chrome extension built for SEO agencies.",
  alternates: {
    canonical: `${SITE_URL}/home`,
    languages: {
      "en-US": `${SITE_URL}/home`,
      "fr-FR": `${SITE_URL}/home`,
    },
  },
  openGraph: {
    url: `${SITE_URL}/home`,
    title: "seoprospector — LinkedIn Prospecting for SEO Agencies",
    description:
      "Chrome Side Panel that captures LinkedIn leads, scores SEO opportunities, and classifies contacts as HOT, WARM or COLD — built for SEO agencies.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "seoprospector — LinkedIn Prospecting Chrome Extension",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "seoprospector",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Chrome, Brave",
      description:
        "Chrome extension that automates LinkedIn lead qualification for SEO agencies. Captures profiles, scores SEO opportunities, classifies leads as HOT/WARM/COLD, and generates AI outreach messages.",
      url: SITE_URL,
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Starter", price: "29", priceCurrency: "USD", billingIncrement: "P1M" },
        { "@type": "Offer", name: "Pro", price: "59", priceCurrency: "USD", billingIncrement: "P1M" },
        { "@type": "Offer", name: "Agency", price: "149", priceCurrency: "USD", billingIncrement: "P1M" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Is this a Chrome extension or a web app?", acceptedAnswer: { "@type": "Answer", text: "seoprospector is a Chrome Side Panel extension. It stays open alongside LinkedIn as you browse, so you can capture leads, review audits, and generate messages without switching tabs." } },
        { "@type": "Question", name: "Can I start without a credit card?", acceptedAnswer: { "@type": "Answer", text: "Yes. Free plan access does not require card details." } },
        { "@type": "Question", name: "Is Pro monthly and cancel anytime?", acceptedAnswer: { "@type": "Answer", text: "Yes. Pro is billed monthly and you can cancel renewal anytime." } },
        { "@type": "Question", name: "Do you support agencies with multiple clients?", acceptedAnswer: { "@type": "Answer", text: "Yes. The workflow is designed for agency operators handling multiple opportunities per client." } },
        { "@type": "Question", name: "How do extra seats work on the Agency plan?", acceptedAnswer: { "@type": "Answer", text: "The Agency plan includes 5 seats. You can add up to 10 more (max 15 total) at $19/seat/month. Each extra seat also adds 2,000 scans/month to your quota — 32,000 scans/month at max seats." } },
        { "@type": "Question", name: "Where can I find legal and billing policies?", acceptedAnswer: { "@type": "Answer", text: "See Privacy, Terms, and Refund pages from the footer links." } },
        { "@type": "Question", name: "How does lead classification work (HOT / WARM / COLD)?", acceptedAnswer: { "@type": "Answer", text: "Classification combines role signal (decision-maker confidence), SEO status, and business decision logic to prioritize action." } },
      ],
    },
    {
      "@type": "Organization",
      name: "seoprospector",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@example.com",
        contactType: "customer support",
      },
    },
  ],
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
