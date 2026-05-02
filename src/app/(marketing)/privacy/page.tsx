import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | seoprospector",
  description: "How seoprospector collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <MarketingNav />
      <main style={{ padding: "60px 0 100px" }}>
        <div className="container">
          <div className="legal-shell">
            <p className="legal-kicker">Legal</p>
            <div className="legal-card">
              <h1>Privacy Policy</h1>
              <p className="legal-updated">Last updated: 30 April 2026</p>

              <p>
                This Privacy Policy explains how <strong>TransactSolution</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;),
                the company behind the <strong>seoprospector</strong> product, collects, uses, and protects your
                personal data when you use our website and Chrome extension.
                We are registered in the United Kingdom and are subject to UK GDPR and the Data Protection Act 2018.
              </p>

              <h2>1. Who we are</h2>
              <p>
                TransactSolution is the data controller for personal data processed through seoprospector.
                For any data-related enquiries, contact us at:{" "}
                <a href="mailto:support@example.com">support@example.com</a>.
              </p>

              <h2>2. What data we collect</h2>
              <p>We collect the following categories of personal data:</p>
              <ul>
                <li><strong>Account data:</strong> name, email address, and password (hashed) when you register.</li>
                <li><strong>Billing data:</strong> subscription plan, payment status. Payment card details are processed directly by our payment processor and are never stored on our servers.</li>
                <li><strong>Usage data:</strong> scan counts, features used, session timestamps, and quota consumption.</li>
                <li><strong>Lead data:</strong> LinkedIn profile information (name, job title, company, website URL) captured by the extension while you browse. This data belongs to you and is stored in your account.</li>
                <li><strong>SEO audit data:</strong> results of automated website audits run on company domains associated with your captured leads.</li>
                <li><strong>Technical data:</strong> IP address, browser type, and operating system, collected for security and abuse prevention.</li>
              </ul>

              <h2>3. How we use your data</h2>
              <ul>
                <li>To provide and operate the seoprospector service.</li>
                <li>To manage your account, subscription, and billing.</li>
                <li>To send transactional emails (account confirmation, plan updates, support replies).</li>
                <li>To detect and prevent fraud, abuse, or violations of our Terms of Service.</li>
                <li>To improve and develop our product, based on aggregated and anonymised usage analytics.</li>
              </ul>
              <p>We do not sell your personal data to third parties. We do not use your lead data for our own prospecting or outreach.</p>

              <h2>4. Legal basis for processing (UK GDPR)</h2>
              <ul>
                <li><strong>Contract:</strong> processing necessary to deliver the service you signed up for.</li>
                <li><strong>Legitimate interests:</strong> fraud prevention, security, product improvement.</li>
                <li><strong>Consent:</strong> where we send optional marketing communications (you may opt out at any time).</li>
              </ul>

              <h2>5. Data retention</h2>
              <p>
                We retain your account data for as long as your account is active. If you delete your account,
                your personal data is permanently removed within 30 days, except where retention is required by
                applicable law (e.g. financial records, which are kept for 6 years under UK law).
              </p>

              <h2>6. Your rights</h2>
              <p>Under UK GDPR, you have the right to:</p>
              <ul>
                <li><strong>Access</strong> the personal data we hold about you.</li>
                <li><strong>Rectify</strong> inaccurate or incomplete data.</li>
                <li><strong>Erase</strong> your data (&ldquo;right to be forgotten&rdquo;).</li>
                <li><strong>Restrict</strong> processing in certain circumstances.</li>
                <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format.</li>
                <li><strong>Object</strong> to processing based on legitimate interests.</li>
              </ul>
              <p>
                To exercise any of these rights, email us at{" "}
                <a href="mailto:support@example.com">support@example.com</a>. We will respond within 30 days.
                You also have the right to lodge a complaint with the{" "}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">Information Commissioner&apos;s Office (ICO)</a>.
              </p>

              <h2>7. Cookies</h2>
              <p>
                Our website uses strictly necessary cookies (session management, authentication).
                We do not use advertising or cross-site tracking cookies.
                You may disable cookies in your browser settings, though this may affect functionality.
              </p>

              <h2>8. Third-party services</h2>
              <p>We use the following trusted third-party services to operate seoprospector:</p>
              <ul>
                <li><strong>Supabase</strong> — database and authentication infrastructure.</li>
                <li><strong>Google PageSpeed API</strong> — for SEO performance audits on captured company domains.</li>
                <li><strong>LemonSqueezy</strong> — payment processing for paid subscriptions.</li>
              </ul>
              <p>Each provider operates under its own privacy policy and data processing agreements.</p>

              <h2>9. Data transfers</h2>
              <p>
                Your data may be processed on servers located outside the UK. Where transfers occur,
                we ensure appropriate safeguards are in place (Standard Contractual Clauses or equivalent mechanisms).
              </p>

              <h2>10. Security</h2>
              <p>
                We implement industry-standard security measures including encrypted connections (HTTPS),
                hashed passwords, and access controls. However, no system is completely secure and we cannot
                guarantee absolute security.
              </p>

              <h2>11. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify registered users of material
                changes by email. Continued use of seoprospector after the effective date constitutes acceptance
                of the updated policy.
              </p>

              <h2>12. Contact</h2>
              <p>
                For privacy-related questions or data requests:{" "}
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
