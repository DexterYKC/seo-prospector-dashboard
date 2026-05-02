import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { SeoAuditMockDemo } from "@/components/SeoAuditMockDemo";

export const metadata: Metadata = {
  title: "SEO Opportunity Scoring | seoprospector",
  description: "Audit company websites and classify SEO opportunity level so outbound teams prioritize accounts with stronger business potential.",
};

export default function SeoScoringPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="seoKicker">Feature · SEO Opportunity Scoring</p>
              <h1 data-i18n="seoTitle">Score SEO opportunity before your first outreach</h1>
              <p className="detail-lead" data-i18n="seoLead">
                Every captured lead gets an automatic SEO audit. The result is one clear status — CRITICAL, WEAK, OK, NO WEBSITE, or SITE UNREACHABLE — plus a 0–100 score, detected issues, and PageSpeed metrics. Your team knows exactly who to call first and why.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="seoPill1">5 SEO status levels</span>
                <span className="detail-pill" data-i18n="seoPill2">Score 0–100</span>
                <span className="detail-pill" data-i18n="seoPill3">PageSpeed + LCP + CLS</span>
                <span className="detail-pill" data-i18n="seoPill4">noindex override rule</span>
                <span className="detail-pill" data-i18n="seoPill5">Automatic per lead</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/features/prioritization" className="btn btn-ghost" data-i18n="seoCta2">Next: Lead Priority →</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <SeoAuditMockDemo />
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="seoStatusTitle">5 status levels — each means a different action</h2>
            <p className="pd-section-sub" data-i18n="seoStatusSub">The score is not decorative. Every level maps to a specific outreach strategy — so your team always knows the next move.</p>
            <table className="pd-status-table">
              <thead>
                <tr>
                  <th data-i18n="seoThStatus">Status</th>
                  <th data-i18n="seoThMeans">What it means</th>
                  <th data-i18n="seoThAction">Recommended action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="pd-status-badge pd-status-badge--critical"><span className="pd-status-dot"></span>CRITICAL</span></td>
                  <td data-i18n="seoCriticalMeans">Score 0–39. Major SEO gaps or noindex/blocked robots.txt detected — always CRITICAL regardless of score. High urgency, strong pitch angle.</td>
                  <td data-i18n="seoCriticalAction">Contact now. Lead is HOT. Message references specific detected issues.</td>
                </tr>
                <tr>
                  <td><span className="pd-status-badge pd-status-badge--weak"><span className="pd-status-dot"></span>WEAK</span></td>
                  <td data-i18n="seoWeakMeans">Score 40–64. Foundational SEO present but technical or content quality is below par. Business case exists.</td>
                  <td data-i18n="seoWeakAction">Contact with a softer value angle. Lead is WARM.</td>
                </tr>
                <tr>
                  <td><span className="pd-status-badge pd-status-badge--ok"><span className="pd-status-dot"></span>OK</span></td>
                  <td data-i18n="seoOkMeans">Score 65–100. SEO looks healthy. Low urgency for an immediate SEO pitch.</td>
                  <td data-i18n="seoOkAction">Park for nurture. Lead is COLD.</td>
                </tr>
                <tr>
                  <td><span className="pd-status-badge pd-status-badge--none"><span className="pd-status-dot"></span>NO WEBSITE</span></td>
                  <td data-i18n="seoNoneMeans">No website detected for the company. May still be a prospect for web build + SEO services.</td>
                  <td data-i18n="seoNoneAction">Reframe pitch — &quot;build the SEO foundation&quot; angle.</td>
                </tr>
                <tr>
                  <td><span className="pd-status-badge pd-status-badge--inac"><span className="pd-status-dot"></span>SITE UNREACHABLE</span></td>
                  <td data-i18n="seoInacMeans">Website exists but timed out, was blocked, or returned an error during audit. Score unavailable.</td>
                  <td data-i18n="seoInacAction">Manual review needed. Contact is still possible but without SEO context.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="pd-section pd-section--alt">
            <h2 className="pd-section-title" data-i18n="seoEngineTitle">How the scoring engine works</h2>
            <div className="pd-steps">
              <div className="pd-step">
                <div className="pd-step-num">1</div>
                <div className="pd-step-body">
                  <h3 data-i18n="seoStep1Title">Website normalization</h3>
                  <p data-i18n="seoStep1Desc">The engine cleans and validates raw company URLs from LinkedIn — handles typos, HTTP vs HTTPS, trailing slashes, and subdomain variations.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">2</div>
                <div className="pd-step-body">
                  <h3 data-i18n="seoStep2Title">Technical audit + PageSpeed</h3>
                  <p data-i18n="seoStep2Desc">Checks H1, meta description, canonical, robots.txt, noindex, sitemap, schema markup, content volume, and PageSpeed metrics — LCP, CLS, FCP, TBT, mobile performance score. All automatic.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">3</div>
                <div className="pd-step-body">
                  <h3 data-i18n="seoStep3Title">Score → status classification</h3>
                  <p data-i18n="seoStep3Desc">Score 0–39 → CRITICAL (HOT). Score 40–64 → WEAK (WARM). Score 65–100 → OK (COLD). Override: noindex detected or robots.txt blocked → always CRITICAL, regardless of score.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">4</div>
                <div className="pd-step-body">
                  <h3 data-i18n="seoStep4Title">Issues attached to lead record</h3>
                  <p data-i18n="seoStep4Desc">Specific issues (missing H1, slow load, etc.) are stored with the lead. These flow into AI message generation to give concrete, relevant outreach context.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section">
            <div className="pd-feature-grid is-reverse">
              <div className="pd-feature-visual">
                <SeoAuditMockDemo />
              </div>
              <div className="pd-feature-copy">
                <h3 data-i18n="seoGridTitle">Issues travel with the lead — context is never lost</h3>
                <p data-i18n="seoGridDesc">
                  The specific SEO issues detected during scoring are stored as structured data on each lead record.
                  When you open the AI message module, those issues are automatically injected into the outreach prompt —
                  no copy-paste, no manual context setup.
                </p>
                <ul>
                  <li data-i18n="seoGridLi1">Issues list stored per lead (not just the status label)</li>
                  <li data-i18n="seoGridLi2">Available in lead detail view at any time</li>
                  <li data-i18n="seoGridLi3">Auto-injected into AI message generation context</li>
                  <li data-i18n="seoGridLi4">Exported with lead CSV for reporting and handoffs</li>
                  <li data-i18n="seoGridLi5">Enables hyper-personalized outreach at scale</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card">
                <strong>5</strong>
                <span data-i18n="seoImpact1">distinct status levels — each maps to a concrete action</span>
              </div>
              <div className="pd-impact-card">
                <strong>0s</strong>
                <span data-i18n="seoImpact2">manual effort — scoring runs automatically on each captured lead</span>
              </div>
              <div className="pd-impact-card">
                <strong>3×</strong>
                <span data-i18n="seoImpact3">more relevant outreach when SEO context is referenced in first touch</span>
              </div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="seoCtaTitle">Know your accounts before you call</h2>
            <p data-i18n="seoCtaDesc">Install seoprospector and every LinkedIn lead gets an instant SEO score — no spreadsheet, no manual audit.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/features/prioritization" className="btn btn-ghost" data-i18n="seoCta2">Next: Lead Prioritization →</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/features/capture" data-i18n="seoNavBack">← Opportunity Capture</a>
            <a href="/features/prioritization" data-i18n="seoNavNext">Lead Prioritization →</a>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
