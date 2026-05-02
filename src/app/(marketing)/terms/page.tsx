import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "Terms of Service | seoprospector",
  description: "Terms and conditions governing your use of the seoprospector Chrome extension and web platform.",
};

export default function TermsPage() {
  return (
    <div className="legal-page">
      <MarketingNav />
      <main style={{ padding: "60px 0 100px" }}>
        <div className="container">
          <div className="legal-shell">
            <p className="legal-kicker">Legal</p>
            <div className="legal-card">
              <h1>Terms of Service</h1>
              <p className="legal-updated">Last updated: 30 April 2026</p>

              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the <strong>seoprospector</strong> Chrome
                extension and web platform, operated by <strong>TransactSolution</strong>, a company registered in the United Kingdom
                (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By registering or using seoprospector, you agree to these Terms.
                If you do not agree, do not use the service.
              </p>

              <h2>1. The service</h2>
              <p>
                seoprospector is a Chrome Side Panel extension and associated web dashboard that helps users capture LinkedIn
                profiles, score SEO opportunities, classify leads, and generate outreach messages. The service is provided on
                a subscription basis with a free tier available.
              </p>

              <h2>2. Eligibility</h2>
              <p>
                You must be at least 18 years old and have the legal capacity to enter into a binding contract.
                By using seoprospector, you confirm that you meet these requirements. Use of the service on behalf
                of a company requires that you have authority to bind that company to these Terms.
              </p>

              <h2>3. Account registration</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activity that occurs under your account. You must provide accurate information during registration.
                Notify us immediately of any unauthorised access at{" "}
                <a href="mailto:support@example.com">support@example.com</a>.
              </p>

              <h2>4. Subscription plans and billing</h2>
              <p>
                seoprospector offers a Free plan and paid plans (Starter, Pro, Agency). Paid subscriptions are billed
                monthly. Prices are displayed at the time of purchase and may be changed with 30 days&apos; notice.
                Billing is handled by our payment processor. You authorise us to charge your payment method on a
                recurring monthly basis until you cancel.
              </p>
              <p>
                Cancellation takes effect at the end of the current billing period. You retain access to paid features
                until the period expires.
              </p>

              <h2>5. Free trial</h2>
              <p>
                Where a free trial is offered, it provides access to the specified plan for the stated duration.
                At the end of the trial, your account reverts to the Free plan unless you upgrade.
                We reserve the right to modify or discontinue trial offers at any time.
              </p>

              <h2>6. Acceptable use</h2>
              <p>You agree not to use seoprospector to:</p>
              <ul>
                <li>Violate any applicable law, including data protection legislation (UK GDPR, GDPR) and LinkedIn&apos;s Terms of Service.</li>
                <li>Scrape, harvest, or collect data in a manner that violates the rights of individuals or platforms.</li>
                <li>Transmit spam, unsolicited messages, or abusive outreach to LinkedIn members.</li>
                <li>Circumvent any technical limit, quota, or access control of the service.</li>
                <li>Attempt to reverse-engineer, decompile, or extract the source code of seoprospector.</li>
                <li>Resell, sublicense, or redistribute access to the service without written authorisation.</li>
                <li>Use the service to harass, defame, or harm any individual or organisation.</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these rules, without refund.
              </p>

              <h2>7. LinkedIn compliance</h2>
              <p>
                seoprospector operates as a Chrome extension that reads publicly visible LinkedIn profile data
                while you are logged into your own LinkedIn account. You are solely responsible for ensuring
                that your use of seoprospector complies with LinkedIn&apos;s User Agreement and applicable law.
                seoprospector is not affiliated with or endorsed by LinkedIn Corporation.
              </p>

              <h2>8. Intellectual property</h2>
              <p>
                All content, software, branding, and intellectual property related to seoprospector belong to
                TransactSolution. You are granted a limited, non-exclusive, non-transferable licence to use the
                service for your own business purposes during the term of your subscription.
              </p>
              <p>
                Data you capture and store through seoprospector remains your property. We claim no ownership over
                your lead data or outreach content.
              </p>

              <h2>9. Availability and changes</h2>
              <p>
                We aim to maintain high availability but do not guarantee uninterrupted access. We may modify,
                suspend, or discontinue any feature with reasonable notice. We will not be liable for any downtime,
                data loss, or service interruption beyond our control.
              </p>

              <h2>10. Limitation of liability</h2>
              <p>
                To the maximum extent permitted by UK law, TransactSolution is not liable for any indirect, incidental,
                special, or consequential damages arising from your use of seoprospector, including but not limited to
                loss of revenue, loss of data, or missed business opportunities.
              </p>
              <p>
                Our total liability to you for any claim shall not exceed the amount paid by you to us in the 3 months
                preceding the claim.
              </p>

              <h2>11. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless TransactSolution from any claims, damages, or expenses
                (including legal fees) arising from your violation of these Terms or your misuse of the service.
              </p>

              <h2>12. Termination</h2>
              <p>
                You may delete your account at any time from the account settings. We may suspend or terminate
                your account immediately for breach of these Terms, with or without prior notice depending on severity.
                Upon termination, your right to use the service ceases immediately.
              </p>

              <h2>13. Governing law</h2>
              <p>
                These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the
                exclusive jurisdiction of the courts of England and Wales.
              </p>

              <h2>14. Changes to these Terms</h2>
              <p>
                We may update these Terms from time to time. We will notify you by email at least 14 days before
                material changes take effect. Continued use of seoprospector after that date constitutes acceptance
                of the updated Terms.
              </p>

              <h2>15. Contact</h2>
              <p>
                Questions about these Terms:{" "}
                <a href="mailto:support@example.com">support@example.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
