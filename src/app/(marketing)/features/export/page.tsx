import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { DashboardMockDemo } from "@/components/DashboardMockDemo";

export const metadata: Metadata = {
  title: "Dashboard and Export Operations | seoprospector",
  description: "Track pipeline health and export lead plus SEO data in structured formats for operations, reporting, and CRM workflows.",
};

export default function ExportPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="expKicker">Feature · Dashboard &amp; Exports</p>
              <h1 data-i18n="expTitle">Track pipeline health. Export clean data. Close the loop.</h1>
              <p className="detail-lead" data-i18n="expLead">
                The dashboard shows your live prospecting performance — scans used, HOT leads, decider rate, and a quality score that tells you at a glance whether your pipeline is hitting the right accounts.
                One click exports your full lead list as a CRM-ready CSV with all scores, statuses, and context included.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="expPill1">Quality score — STRONG · STEADY · EARLY</span>
                <span className="detail-pill" data-i18n="expPill2">HOT / WARM / COLD breakdown</span>
                <span className="detail-pill" data-i18n="expPill3">CSV export — leads + SEO audits</span>
                <span className="detail-pill" data-i18n="expPill4">Quota usage per feature</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/home#product" className="btn btn-ghost" data-i18n="expCta2">All Features</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <div style={{ transform: "scale(0.9)", transformOrigin: "top right", width: "111%" }}>
                <DashboardMockDemo />
              </div>
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="expPulseTitle">Quality score — your pipeline health at a glance</h2>
            <p className="pd-section-sub" data-i18n="expPulseSub">The quality score combines three signals: actionable lead rate (50%), decider rate (30%), and HOT rate (20%). It tells you whether your prospecting is hitting the right accounts — not just any accounts.</p>
            <div className="pd-score-grid">
              <div className="pd-score-card pd-score-card--hot">
                <p className="pd-score-card__label">✦ STRONG</p>
                <h3 data-i18n="expStrongH3">High-quality pipeline</h3>
                <p data-i18n="expStrongDesc">Quality score ≥ 70. Your scans are landing on the right profiles — high decider rate, strong HOT conversion, actionable leads in queue.</p>
              </div>
              <div className="pd-score-card" style={{background:"rgba(99,102,241,0.07)",borderColor:"rgba(99,102,241,0.3)"}}>
                <p className="pd-score-card__label" style={{color:"#4f46e5"}}>→ STEADY</p>
                <h3 data-i18n="expSteadyH3">Healthy, not exceptional</h3>
                <p data-i18n="expSteadyDesc">Quality score 45–69. Pipeline is stable. Review your targeting — adjusting your prospecting query can lift decider rate.</p>
              </div>
              <div className="pd-score-card pd-score-card--cold">
                <p className="pd-score-card__label">↗ EARLY</p>
                <h3 data-i18n="expEarlyH3">Pipeline building</h3>
                <p data-i18n="expEarlyDesc">Quality score &lt; 45. Not enough actionable signal yet. Refine targeting, increase scan volume, or focus on CRITICAL-SEO accounts.</p>
              </div>
            </div>
          </section>

          <section className="pd-section pd-section--alt">
            <div className="pd-feature-grid">
              <div className="pd-feature-copy">
                <h3 data-i18n="expCsvTitle">CRM-ready CSV — no reformatting needed</h3>
                <p data-i18n="expCsvDesc">
                  Every exported lead includes all the data your CRM, RevOps stack, or reporting tool needs.
                  Fields are pre-labeled and consistent across all exports — no column renaming, no missing data.
                </p>
                <ul>
                  <li data-i18n="expCsvLi1">Full name, headline, company, company domain, LinkedIn URL</li>
                  <li data-i18n="expCsvLi2">SEO badge (CRITICAL / WEAK / OK) and SEO label</li>
                  <li data-i18n="expCsvLi3">Lead classification (HOT / WARM / COLD) and action label</li>
                  <li data-i18n="expCsvLi4">Role type, confidence score, and detected headline</li>
                  <li data-i18n="expCsvLi5">Capture timestamp for reporting and SLA tracking</li>
                  <li data-i18n="expCsvLi6">Separate SEO audit export — badge, label, pain summary, and JS-heavy flag per domain</li>
                </ul>
              </div>
              <div className="pd-feature-visual">
                <div className="feat-mock" style={{width:"min(420px,100%)",fontSize:"11px"}}>
                  <div className="feat-mock__bar">
                    <span className="feat-mock__dot feat-mock__dot--red"></span>
                    <span className="feat-mock__dot feat-mock__dot--yellow"></span>
                    <span className="feat-mock__dot feat-mock__dot--green"></span>
                    <span className="feat-mock__bar-title">seo-prospector-leads-2026-04-24.csv</span>
                  </div>
                  <div className="pd-csv-preview" style={{margin:"10px"}}>
                    <div className="pd-csv-preview-header">CSV Preview — 48 records</div>
                    <div className="pd-csv-row pd-csv-row--head" style={{gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1.2fr"}}>
                      <span>name</span>
                      <span>company</span>
                      <span>seo_badge</span>
                      <span>ui_action</span>
                      <span>ui_role</span>
                    </div>
                    <div className="pd-csv-row pd-csv-row--data" style={{gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1.2fr"}}>
                      <span>Sophie Martin</span>
                      <span>acmedigital.com</span>
                      <span style={{color:"#f87171"}}>CRITICAL</span>
                      <span style={{color:"#f87171"}}>CONTACT_NOW</span>
                      <span>DECISION_MAKER</span>
                    </div>
                    <div className="pd-csv-row pd-csv-row--data" style={{gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1.2fr"}}>
                      <span>Thomas Leroy</span>
                      <span>techcorp.io</span>
                      <span style={{color:"#fbbf24"}}>WEAK</span>
                      <span style={{color:"#fbbf24"}}>CONTACT_SOFT</span>
                      <span>DECISION_MAKER</span>
                    </div>
                    <div className="pd-csv-row pd-csv-row--data" style={{gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1.2fr"}}>
                      <span>Jean Dupont</span>
                      <span>growthlab.fr</span>
                      <span style={{color:"#34d399"}}>OK</span>
                      <span style={{color:"#94a3b8"}}>IGNORE</span>
                      <span>OTHER</span>
                    </div>
                    <div className="pd-csv-row pd-csv-row--data" style={{gridTemplateColumns:"2fr 1.5fr 1fr 1fr 1.2fr",opacity:0.45}}>
                      <span>...</span>
                      <span>...</span>
                      <span>...</span>
                      <span>...</span>
                      <span>...</span>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"center",padding:"0 10px 10px"}}>
                    <button style={{width:"100%",padding:"8px",borderRadius:"6px",background:"#2563eb",color:"#fff",border:"none",fontSize:"11px",fontWeight:700,cursor:"default"}}>Download 48 leads as CSV ↓</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section">
            <div className="pd-feature-grid is-reverse">
              <div className="pd-feature-visual">
                <DashboardMockDemo />
              </div>
              <div className="pd-feature-copy">
                <h3 data-i18n="expAuditTitle">Per-domain SEO audit export — structured issue list per account</h3>
                <p data-i18n="expAuditDesc">
                  For agencies and consultants, single-account SEO audit exports give you a structured issue list per domain —
                  company name, website, SEO badge, detected pain points, and PageSpeed context — all in one CSV row per lead.
                  Use it directly in proposals, client handoffs, or your CRM.
                </p>
                <ul>
                  <li data-i18n="expAuditLi1">Per-domain SEO audit: seo_badge, seo_label, pain_business, js_heavy</li>
                  <li data-i18n="expAuditLi2">Role, action, and confidence fields included alongside SEO data</li>
                  <li data-i18n="expAuditLi3">Export as CSV — EN (comma) or FR (semicolon) delimiter auto-selected</li>
                  <li data-i18n="expAuditLi4">Quota-tracked: each export consumes from your monthly SEO export limit</li>
                  <li data-i18n="expAuditLi5">Available for every scored account in your pipeline</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card">
                <strong>1</strong>
                <span data-i18n="expImpact1">click to export your full lead list as CRM-ready CSV</span>
              </div>
              <div className="pd-impact-card">
                <strong>3</strong>
                <span data-i18n="expImpact2">quality levels — STRONG · STEADY · EARLY — measuring pipeline health in real time</span>
              </div>
              <div className="pd-impact-card">
                <strong>0</strong>
                <span data-i18n="expImpact3">manual reformatting — all fields pre-labeled, action labels machine-readable</span>
              </div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="expCtaTitle">Clean pipeline data, always ready to export</h2>
            <p data-i18n="expCtaDesc">Every lead scored, classified, and structured — one click to your CRM. No cleanup, no reformatting.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/home#product" className="btn btn-ghost" data-i18n="expCta2b">Browse All Features</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/features/messages" data-i18n="expNavBack">← AI Messages</a>
            <a href="/home#product" data-i18n="expNavNext">All Features ↑</a>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
