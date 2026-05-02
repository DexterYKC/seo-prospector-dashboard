import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { WaitlistButton } from "@/components/WaitlistModal";

export const metadata: Metadata = {
  title: "Pricing — Plans & Features | seoprospector",
  description:
    "Simple, transparent pricing for LinkedIn SEO prospecting. Free plan, Starter $29, Pro $59, Agency $149 with 18,000 scans/month (shared pool), up to 15 seats and +2,000 scans per extra seat. No credit card required to start.",
};

export default function PricingPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          {/* ── Hero ── */}
          <section className="detail-hero" style={{ textAlign: "center", paddingBottom: 0 }}>
            <p className="detail-kicker" data-i18n="pricingKicker">Pricing</p>
            <h1 style={{ margin: "0 auto" }} data-i18n="pricingTitle">Simple pricing, serious pipeline</h1>
            <p className="detail-lead" style={{ maxWidth: 520, margin: "0 auto 12px" }} data-i18n="pricingSubtitle">
              Start free to validate signal quality. Upgrade when your outbound is ready to scale.
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", margin: 0 }} data-i18n="pricingNoCc">
              No credit card required · Cancel anytime
            </p>
          </section>

          {/* ── Plans grid ── */}
          <section className="section pricing-section" style={{ paddingTop: 48 }}>
            <div className="pricing-grid">

              {/* Free */}
              <article className="price-card price-card-free">
                <p className="price-badge" data-i18n="freeBadge">Free</p>
                <p className="plan" data-i18n="freePlan">Free</p>
                <p className="price">$0<span data-i18n="perMonth">/month</span></p>
                <p className="plan-note" data-i18n="freeDesc">Test signal quality before committing. Capture, score, and validate your first leads.</p>
                <ul>
                  <li data-i18n="free1">1 user</li>
                  <li data-i18n="free2">40 scans / month</li>
                  <li data-i18n="free3">15 SEO audits / month</li>
                  <li data-i18n="free4">5 messages / month</li>
                  <li className="li-no" data-i18n="free5">CSV export</li>
                  <li className="li-no" data-i18n="free6">AI scanner</li>
                  <li className="li-no" data-i18n="free7">Direct LinkedIn send</li>
                </ul>
                <a href="/register" className="btn btn-secondary price-cta" data-i18n="freeCta">Start free trial</a>
              </article>

              {/* Starter */}
              <article className="price-card price-card-starter">
                <p className="price-badge price-badge-starter" data-i18n="starterBadge">Starter</p>
                <p className="plan" data-i18n="starterPlan">Starter</p>
                <p className="price">$29<span data-i18n="perMonth">/month</span></p>
                <p className="plan-note" data-i18n="starterDesc">For solo prospectors building a steady outbound rhythm. More scans, CSV export included.</p>
                <ul>
                  <li data-i18n="starter1">1 user</li>
                  <li data-i18n="starter2">800 scans / month</li>
                  <li data-i18n="starter3">300 SEO audits / month</li>
                  <li data-i18n="starter4">100 messages / month</li>
                  <li data-i18n="starterCsv">CSV export</li>
                  <li data-i18n="starterAi">AI scanner</li>
                  <li data-i18n="starterSend">Direct LinkedIn send</li>
                </ul>
                <WaitlistButton plan="STARTER" trigger="Join waitlist" />
              </article>

              {/* Pro */}
              <article className="price-card featured price-card-pro">
                <p className="price-badge price-badge-pro" data-i18n="proBadge">Most popular</p>
                <p className="plan" data-i18n="proPlan">Pro</p>
                <p className="price">$59<span data-i18n="perMonth">/month</span></p>
                <p className="plan-note" data-i18n="proDesc">Full pipeline automation — 3 000 scans, AI scanner, full audit, and direct LinkedIn sending.</p>
                <ul>
                  <li data-i18n="pro1">1 user</li>
                  <li data-i18n="pro2">3&thinsp;000 scans / month</li>
                  <li data-i18n="pro3">1&thinsp;200 SEO audits / month</li>
                  <li data-i18n="pro4">400 messages / month</li>
                  <li data-i18n="pro5">CSV export</li>
                  <li data-i18n="pro6">AI scanner</li>
                  <li data-i18n="pro7">Full audit</li>
                </ul>
                <WaitlistButton plan="PRO" trigger="Join waitlist" />
              </article>

              {/* Agency */}
              <article className="price-card price-card-agency">
                <p className="price-badge price-badge-agency" data-i18n="agencyBadge">Agency</p>
                <p className="plan" data-i18n="agencyPlan">Agency</p>
                <p className="price">$149<span data-i18n="perMonth">/month</span></p>
                <p className="plan-note" data-i18n="agencyDesc">For teams managing multiple clients. Shared scan pool, up to 15 seats, dedicated support.</p>
                <ul>
                  <li data-i18n="agency1">5 users included (max 15)</li>
                  <li data-i18n="agency2">18&thinsp;000 scans / month (shared pool)</li>
                  <li data-i18n="agency3">6&thinsp;000 SEO audits / month</li>
                  <li data-i18n="agency4">2&thinsp;000 messages / month</li>
                  <li data-i18n="agency5">CSV export + AI scanner + full audit</li>
                  <li data-i18n="agency6">Team notifications</li>
                  <li className="li-seat" data-i18n="agency7">+$19 / extra seat · +2&thinsp;000 scans/seat</li>
                </ul>
                <WaitlistButton plan="AGENCY" trigger="Join waitlist" />
              </article>

            </div>
          </section>

          {/* ── What each plan unlocks ── */}
          <section className="section" style={{ paddingTop: 0, paddingBottom: 0, marginBottom: 40 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", maxWidth: 920, margin: "0 auto" }}>
              {[
                { plan: "Free", color: "#64748b", for: "Validate before committing", items: ["Capture your first HOT leads", "See SEO scores on real accounts", "Test message quality"] },
                { plan: "Starter", color: "#3b82f6", for: "Solo, consistent outbound", items: ["800 scans for a full week cycle", "Export leads to your CRM", "Build a repeatable pipeline"] },
                { plan: "Pro", color: "#6366f1", for: "Serious closers & consultants", items: ["AI scanner for smarter prospecting", "Full SEO audit per account", "Send directly from LinkedIn panel"] },
                { plan: "Agency", color: "#a855f7", for: "Teams & multi-client ops", items: ["Shared pool across all operators", "Up to 15 seats", "Dedicated support channel"] },
              ].map(({ plan, color, for: forText, items }) => (
                <div key={plan} style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "22px 24px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>{plan}</p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "14px", lineHeight: 1.35 }} data-i18n={`pricingFor${plan}`}>{forText}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {items.map((item) => (
                      <li key={item} style={{ fontSize: "12px", color: "#334155", display: "flex", alignItems: "flex-start", gap: "8px", lineHeight: 1.4 }}>
                        <span style={{ color, flexShrink: 0, marginTop: "1px", fontWeight: 700 }}>✓</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── Comparison table ── */}
          <section className="section section-light" style={{ borderRadius: 6, padding: "48px 40px", margin: "0 0 56px" }}>
            <h2 style={{ textAlign: "center", marginBottom: 8 }} data-i18n="compareTitle">Compare plans</h2>
            <p className="section-subtitle" style={{ textAlign: "center", marginBottom: 36 }} data-i18n="compareSubtitle">
              Every feature, side by side.
            </p>

            <div className="pricing-compare-wrap">
              <table className="pricing-compare">
                <thead>
                  <tr>
                    <th data-i18n="compareFeature">Feature</th>
                    <th data-i18n="freePlan">Free</th>
                    <th data-i18n="starterPlan">Starter</th>
                    <th className="col-pro" data-i18n="proPlan">Pro</th>
                    <th data-i18n="agencyPlan">Agency</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-i18n="compareUsers">Users</td>
                    <td>1</td>
                    <td>1</td>
                    <td className="col-pro">1</td>
                    <td data-i18n="compareAgencyUsers">5 incl. (max 15)</td>
                  </tr>
                  <tr>
                    <td data-i18n="compareScans">Scans / month</td>
                    <td>40</td>
                    <td>800</td>
                    <td className="col-pro">3&thinsp;000</td>
                    <td>18&thinsp;000</td>
                  </tr>
                  <tr>
                    <td data-i18n="compareSeo">SEO audits / month</td>
                    <td>15</td>
                    <td>300</td>
                    <td className="col-pro">1&thinsp;200</td>
                    <td>6&thinsp;000</td>
                  </tr>
                  <tr>
                    <td data-i18n="compareMessages">Messages / month</td>
                    <td>5</td>
                    <td>100</td>
                    <td className="col-pro">400</td>
                    <td>2&thinsp;000</td>
                  </tr>
                  <tr>
                    <td data-i18n="compareCsv">CSV export</td>
                    <td><span className="cmp-no">—</span></td>
                    <td><span className="cmp-yes">✓</span></td>
                    <td className="col-pro"><span className="cmp-yes">✓</span></td>
                    <td><span className="cmp-yes">✓</span></td>
                  </tr>
                  <tr>
                    <td data-i18n="compareAi">AI scanner</td>
                    <td><span className="cmp-no">—</span></td>
                    <td><span className="cmp-no">—</span></td>
                    <td className="col-pro"><span className="cmp-yes">✓</span></td>
                    <td><span className="cmp-yes">✓</span></td>
                  </tr>
                  <tr>
                    <td data-i18n="compareAudit">Full audit</td>
                    <td><span className="cmp-no">—</span></td>
                    <td><span className="cmp-no">—</span></td>
                    <td className="col-pro"><span className="cmp-yes">✓</span></td>
                    <td><span className="cmp-yes">✓</span></td>
                  </tr>
                  <tr>
                    <td data-i18n="compareExtraSeats">Extra seats</td>
                    <td><span className="cmp-no">—</span></td>
                    <td><span className="cmp-no">—</span></td>
                    <td className="col-pro"><span className="cmp-no">—</span></td>
                    <td><span className="cmp-seat">+$19 / seat · +2k scans</span></td>
                  </tr>
                  <tr>
                    <td data-i18n="compareSupport">Support</td>
                    <td data-i18n="supportEmail">Email</td>
                    <td data-i18n="supportEmail">Email</td>
                    <td className="col-pro" data-i18n="supportPriority">Priority</td>
                    <td data-i18n="supportDedicated">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <div className="pricing-final-cta">
            <p className="final-cta-kicker" data-i18n="finalKicker">From profile activity to booked meetings</p>
            <h2 data-i18n="finalTitle">Build more pipeline this week</h2>
            <p data-i18n="finalText">Start with Free, then upgrade to Pro when your outbound is ready to scale. No credit card, no lock-in.</p>
            <div className="pricing-final-cta-btns">
              <a href="/register" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/contact" className="btn btn-secondary" data-i18n="finalCta1">Talk to us</a>
            </div>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
