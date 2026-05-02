import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "Refund Policy | seoprospector",
  description: "seoprospector refund and cancellation policy for paid subscriptions.",
};

export default function RefundPage() {
  return (
    <div className="legal-page">
      <MarketingNav />
      <main style={{ padding: "60px 0 100px" }}>
        <div className="container">
          <div className="legal-shell">
            <p className="legal-kicker">Legal</p>
            <div className="legal-card">
              <h1>Refund Policy</h1>
              <p className="legal-updated">Last updated: 30 April 2026</p>

              <p>
                This Refund Policy applies to all paid subscriptions to <strong>seoprospector</strong>, operated by
                TransactSolution (United Kingdom). Please read it carefully before purchasing a plan.
              </p>

              <h2>1. Free plan</h2>
              <p>
                The Free plan is available at no cost. No payment is required, and therefore no refund is applicable.
              </p>

              <h2>2. Paid plans — 5-day refund window</h2>
              <p>
                If you have purchased a paid subscription (Starter, Pro, or Agency), you may request a full refund
                within <strong>5 calendar days</strong> of the date of payment. Refund requests made after this period
                will not be eligible for reimbursement.
              </p>
              <p>
                This policy applies to each billing cycle independently. A refund for a renewal payment must be
                requested within 5 days of that renewal date.
              </p>

              <h2>3. How to request a refund</h2>
              <p>
                To request a refund, email us at{" "}
                <a href="mailto:support@example.com">support@example.com</a> with:
              </p>
              <ul>
                <li>The email address associated with your account.</li>
                <li>The date of the payment you wish to be refunded.</li>
                <li>A brief reason for the request (optional but appreciated).</li>
              </ul>
              <p>
                We will process eligible refund requests within 5 business days. Refunds are issued to the
                original payment method. Processing time may vary depending on your bank or card provider
                (typically 5–10 business days to appear on your statement).
              </p>

              <h2>4. Conditions</h2>
              <p>Refunds may be declined if:</p>
              <ul>
                <li>The 5-day refund window has passed since the payment date.</li>
                <li>The account has violated our Terms of Service or Acceptable Use policy.</li>
                <li>The refund request has already been granted for a previous billing cycle on the same account.</li>
                <li>The account has consumed a significant portion of its monthly quota (more than 80%) at the time of the request.</li>
              </ul>

              <h2>5. Cancellation</h2>
              <p>
                You may cancel your subscription at any time from your account settings. Cancellation stops future
                billing but does not automatically trigger a refund. You retain access to paid features until the
                end of the current billing period.
              </p>
              <p>
                If you cancel within the 5-day refund window and request a refund, both the cancellation and the
                refund will be processed together.
              </p>

              <h2>6. Disputes</h2>
              <p>
                If you believe you have been charged incorrectly or have a billing dispute, contact us at{" "}
                <a href="mailto:support@example.com">support@example.com</a> before initiating a chargeback
                with your bank. We are committed to resolving billing issues promptly and fairly.
              </p>

              <h2>7. Contact</h2>
              <p>
                For refund requests or billing questions:{" "}
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
