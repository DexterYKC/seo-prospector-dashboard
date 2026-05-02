import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the seoprospector team for support, billing, bug reports, partnerships, or legal enquiries. We reply within 24 hours.",
  openGraph: {
    title: "Contact seoprospector",
    description: "Reach our support, billing, or partnerships team. We reply within 24 hours.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
