import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { SeoMockDemo } from "@/components/SeoMockDemo";

export const metadata: Metadata = {
  title: "Lead Prioritization Engine | seoprospector",
  description: "Prioritize captured leads using role confidence and SEO urgency so teams execute outreach in the right order.",
};

export default function PrioritizationPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="priKicker">Feature · Lead Prioritization</p>
              <h1 data-i18n="priTitle">HOT, WARM, COLD — your lead queue, sorted automatically</h1>
              <p className="detail-lead" data-i18n="priLead">
                The prioritization engine detects decision-makers (CEO, Founder, Owner, Director) and combines that signal with SEO urgency to assign every lead a HOT, WARM, or COLD status — plus an action: Contact Now, Contact Soft, Find Decision-Maker, or Ignore. Fully automatic, manually overridable.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="priPill1">HOT / WARM / COLD</span>
                <span className="detail-pill" data-i18n="priPill2">CEO · Founder · Owner · Director</span>
                <span className="detail-pill" data-i18n="priPill3">4 action labels</span>
                <span className="detail-pill" data-i18n="priPill4">Manual override</span>
                <span className="detail-pill" data-i18n="priPill5">Primary opportunity selection</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/features/messages" className="btn btn-ghost" data-i18n="priCta2">Next: AI Messages →</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <SeoMockDemo />
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="priScoreTitle">What HOT, WARM and COLD really mean</h2>
            <p className="pd-section-sub" data-i18n="priScoreSub">Each classification is a decision, not just a color. It tells the team what action to take, not just how exciting the lead looks.</p>
            <div className="pd-score-grid">
              <div className="pd-score-card pd-score-card--hot">
                <p className="pd-score-card__label">🔴 HOT</p>
                <h3 data-i18n="priHotH3">Contact Now</h3>
                <p data-i18n="priHotDesc">Decision-maker confirmed + CRITICAL or WEAK SEO. Highest signal combination. Action: <strong>CONTACT_NOW</strong>.</p>
                <ul>
                  <li data-i18n="priHotLi1">Role: CEO, Founder, Owner, or Director detected</li>
                  <li data-i18n="priHotLi2">SEO status: CRITICAL (score 0–39)</li>
                  <li data-i18n="priHotLi3">Real pain point — strong pitch urgency</li>
                  <li data-i18n="priHotLi4">AI message uses &quot;contact now&quot; tone automatically</li>
                </ul>
              </div>
              <div className="pd-score-card pd-score-card--warm">
                <p className="pd-score-card__label">🟡 WARM</p>
                <h3 data-i18n="priWarmH3">Contact Soft or Find Decision-Maker</h3>
                <p data-i18n="priWarmDesc">Two possible actions: <strong>CONTACT_SOFT</strong> (decision-maker + WEAK SEO) or <strong>FIND_DECISION_MAKER</strong> (CRITICAL SEO but non-DM contact).</p>
                <ul>
                  <li data-i18n="priWarmLi1">DM + WEAK SEO → CONTACT_SOFT tone</li>
                  <li data-i18n="priWarmLi2">Non-DM + CRITICAL SEO → FIND_DECISION_MAKER</li>
                  <li data-i18n="priWarmLi3">Worth a touch — softer angle or escalation path</li>
                  <li data-i18n="priWarmLi4">AI message adapts tone to the action automatically</li>
                </ul>
              </div>
              <div className="pd-score-card pd-score-card--cold">
                <p className="pd-score-card__label">🟢 COLD</p>
                <h3 data-i18n="priColdH3">Ignore</h3>
                <p data-i18n="priColdDesc">OK or no-issue SEO + non-decision-maker. Low business case for immediate outreach. Action: <strong>IGNORE</strong>.</p>
                <ul>
                  <li data-i18n="priColdLi1">SEO status: OK (65–100) or NO WEBSITE</li>
                  <li data-i18n="priColdLi2">Role: non-decision-maker or no position detected</li>
                  <li data-i18n="priColdLi3">No immediate pitch angle — park for future cycles</li>
                  <li data-i18n="priColdLi4">Can be manually overridden at any time</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="pd-section pd-section--alt">
            <div className="pd-feature-grid">
              <div className="pd-feature-copy">
                <h3 data-i18n="priAltTitle">The scoring logic — signal × urgency</h3>
                <p data-i18n="priAltDesc">
                  seoprospector combines two independent signals to produce the final classification.
                  Neither signal alone is enough — a CEO at a perfectly healthy website isn&apos;t HOT for an SEO pitch.
                  A junior employee at a CRITICAL domain isn&apos;t either.
                </p>
                <ul>
                  <li data-i18n="priAltLi1"><strong style={{color:"#93c5fd"}}>Decision-maker signal</strong> — Exact keyword match: CEO, Founder, Owner, Director in title or headline</li>
                  <li data-i18n="priAltLi2"><strong style={{color:"#93c5fd"}}>SEO urgency</strong> — CRITICAL (0–39), WEAK (40–64), OK (65–100), or no website</li>
                  <li data-i18n="priAltLi3">Primary opportunity: HOT &gt; WARM &gt; PRIMARY flag &gt; first opportunity</li>
                  <li data-i18n="priAltLi4">Classification is automatic — no config required</li>
                  <li data-i18n="priAltLi5">Manual override available: switch action to CONTACT_NOW / CONTACT_SOFT / FIND_DECISION_MAKER / IGNORE</li>
                </ul>
              </div>
              <div className="pd-feature-visual">
                <SeoMockDemo />
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card">
                <strong>HOT</strong>
                <span data-i18n="priImpact1">leads always go to the top of the action queue automatically</span>
              </div>
              <div className="pd-impact-card">
                <strong>2×</strong>
                <span data-i18n="priImpact2">signals combined — role + SEO urgency — for more accurate classification</span>
              </div>
              <div className="pd-impact-card">
                <strong>100%</strong>
                <span data-i18n="priImpact3">consistent logic across team members — no subjective scoring</span>
              </div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="priCtaTitle">Stop guessing which lead to call first</h2>
            <p data-i18n="priCtaDesc">seoprospector classifies every lead automatically. HOT accounts are always first in queue.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/features/messages" className="btn btn-ghost" data-i18n="priCta2">Next: AI Messages →</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/features/seo-scoring" data-i18n="priNavBack">← SEO Scoring</a>
            <a href="/features/messages" data-i18n="priNavNext">AI Messages →</a>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
