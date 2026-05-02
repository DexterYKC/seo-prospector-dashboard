import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "RevOps Operators | seoprospector",
  description: "How RevOps operators use seoprospector to structure LinkedIn outbound data, integrate clean leads into CRM, and track pipeline health automatically.",
};

export default function RevopsOperatorPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="ucdKicker">Use Case · RevOps Operators</p>
              <h1 data-i18n="ucdTitle">Structured LinkedIn data that goes straight into your CRM — no cleanup</h1>
              <p className="detail-lead" data-i18n="ucdLead">
                RevOps teams waste hours normalizing messy LinkedIn exports. seoprospector captures pre-structured leads
                with consistent field names, SEO scores, and action labels — ready to import into HubSpot, Salesforce, or any CRM.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="ucdPill1">CRM-ready CSV exports</span>
                <span className="detail-pill" data-i18n="ucdPill2">Consistent field schema</span>
                <span className="detail-pill" data-i18n="ucdPill3">Quality score tracking</span>
                <span className="detail-pill" data-i18n="ucdPill4">Zero data cleanup</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/use-cases/seo-agency" className="btn btn-ghost" data-i18n="ucdCta2">SEO Agencies →</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <div className="feat-mock" style={{width:"min(440px,100%)"}}>
                <div className="feat-mock__bar">
                  <span className="feat-mock__dot feat-mock__dot--red"></span>
                  <span className="feat-mock__dot feat-mock__dot--yellow"></span>
                  <span className="feat-mock__dot feat-mock__dot--green"></span>
                  <span className="feat-mock__bar-title">Export · seoprospector</span>
                </div>
                <div className="feat-mock__body">

                  <div style={{display:"flex",alignItems:"center",gap:"9px",padding:"9px 10px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:"7px",marginBottom:"10px"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"10px",fontWeight:800,color:"#34d399",marginBottom:"2px"}}>✦ Quality Score — STRONG</div>
                      <div style={{fontSize:"9px",color:"#64748b"}}>Score 74 · actionable 68% · decider 42% · HOT 25%</div>
                    </div>
                    <div style={{fontSize:"22px",fontWeight:900,color:"#10b981",lineHeight:1,flexShrink:0}}>74</div>
                  </div>

                  <div className="pd-csv-preview" style={{fontSize:"9px",marginBottom:"8px"}}>
                    <div className="pd-csv-preview-header">seo-prospector-leads-2026-04-30.csv · 48 records</div>
                    <div className="pd-csv-row pd-csv-row--head" style={{gridTemplateColumns:"1.5fr 1.4fr 0.85fr 1.2fr 1.1fr",fontSize:"8.5px"}}>
                      <span>name</span><span>website</span><span>seo_badge</span><span>ui_action</span><span>ui_role</span>
                    </div>
                    <div className="pd-csv-row pd-csv-row--data" style={{gridTemplateColumns:"1.5fr 1.4fr 0.85fr 1.2fr 1.1fr"}}>
                      <span>Sophie Martin</span>
                      <span>acmedigital.com</span>
                      <span style={{color:"#f87171"}}>CRITICAL</span>
                      <span style={{color:"#f87171",fontSize:"8px"}}>CONTACT_NOW</span>
                      <span style={{fontSize:"8px"}}>DECISION_MAKER</span>
                    </div>
                    <div className="pd-csv-row pd-csv-row--data" style={{gridTemplateColumns:"1.5fr 1.4fr 0.85fr 1.2fr 1.1fr"}}>
                      <span>Thomas Leroy</span>
                      <span>techcorp.io</span>
                      <span style={{color:"#fbbf24"}}>WEAK</span>
                      <span style={{color:"#fbbf24",fontSize:"8px"}}>CONTACT_SOFT</span>
                      <span style={{fontSize:"8px"}}>DECISION_MAKER</span>
                    </div>
                    <div className="pd-csv-row pd-csv-row--data" style={{gridTemplateColumns:"1.5fr 1.4fr 0.85fr 1.2fr 1.1fr"}}>
                      <span>Jean Dupont</span>
                      <span>growthlab.fr</span>
                      <span style={{color:"#34d399"}}>OK</span>
                      <span style={{color:"#94a3b8",fontSize:"8px"}}>IGNORE</span>
                      <span style={{fontSize:"8px"}}>OTHER</span>
                    </div>
                    <div className="pd-csv-row pd-csv-row--data" style={{gridTemplateColumns:"1.5fr 1.4fr 0.85fr 1.2fr 1.1fr",opacity:0.4}}>
                      <span>...</span><span>...</span><span>...</span><span>...</span><span>...</span>
                    </div>
                  </div>

                  <button style={{width:"100%",padding:"8px",borderRadius:"6px",background:"#2563eb",color:"#fff",border:"none",fontSize:"10px",fontWeight:700,cursor:"default",marginBottom:"6px"}}>
                    Download 48 leads as CSV ↓
                  </button>

                  <div className="feat-mock__footer">
                    <span>0 cleanup needed</span>
                    <strong style={{color:"#34d399"}}>CRM-ready</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="ucdWhatTitle">What RevOps operators get from seoprospector</h2>
            <p className="pd-section-sub" data-i18n="ucdWhatSub">Clean data, consistent schema, and a pipeline signal — all without building a custom integration.</p>
            <div className="pd-steps">
              <div className="pd-step">
                <div className="pd-step-num">1</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucdStep1Title">Structured capture from day one</h3>
                  <p data-i18n="ucdStep1Desc">Every lead is saved with consistent fields: name, headline, role type, company, website, SEO badge, action label. No column mapping, no cleanup on import.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">2</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucdStep2Title">SEO enrichment included</h3>
                  <p data-i18n="ucdStep2Desc">Every lead comes with an automatic SEO badge (CRITICAL / WEAK / OK / NO_WEBSITE / SITE_UNREACHABLE) and specific issues — data you&apos;d normally pay for separately.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">3</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucdStep3Title">Action label for routing</h3>
                  <p data-i18n="ucdStep3Desc">CONTACT_NOW / CONTACT_SOFT / FIND_DECISION_MAKER / IGNORE — pre-assigned on every lead. Use them in CRM workflows to route to the right sequence automatically.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">4</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucdStep4Title">Quality score for reporting</h3>
                  <p data-i18n="ucdStep4Desc">STRONG / STEADY / EARLY signal shows whether the team&apos;s outbound is hitting the right accounts — combining actionable rate, decider rate, and HOT rate into one ops metric.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section pd-section--alt">
            <div className="pd-feature-grid">
              <div className="pd-feature-copy">
                <h3 data-i18n="ucdCleanTitle">Clean data in, clean CRM out</h3>
                <p data-i18n="ucdCleanDesc">
                  The biggest RevOps tax on LinkedIn outbound is data normalization. Inconsistent job titles,
                  missing domains, unknown SEO context — all of it needs manual cleanup before it&apos;s CRM-ready.
                  seoprospector outputs a schema that imports directly.
                </p>
                <ul>
                  <li data-i18n="ucdCleanLi1"><strong style={{color:"#93c5fd"}}>name</strong> — full name, always present</li>
                  <li data-i18n="ucdCleanLi2"><strong style={{color:"#93c5fd"}}>website</strong> — normalized, validated domain URL</li>
                  <li data-i18n="ucdCleanLi3"><strong style={{color:"#93c5fd"}}>seo_badge</strong> — CRITICAL / WEAK / OK / NO_WEBSITE / SITE_UNREACHABLE</li>
                  <li data-i18n="ucdCleanLi4"><strong style={{color:"#93c5fd"}}>ui_action</strong> — CONTACT_NOW / CONTACT_SOFT / FIND_DECISION_MAKER / IGNORE</li>
                  <li data-i18n="ucdCleanLi5"><strong style={{color:"#93c5fd"}}>ui_role</strong> — DECISION_MAKER / OTHER, detected from title</li>
                  <li data-i18n="ucdCleanLi6">All fields consistent across every export, every operator</li>
                </ul>
              </div>
              <div className="pd-feature-visual">
                <div className="feat-mock" style={{width:"min(400px,100%)"}}>
                  <div className="feat-mock__bar">
                    <span className="feat-mock__dot feat-mock__dot--red"></span>
                    <span className="feat-mock__dot feat-mock__dot--yellow"></span>
                    <span className="feat-mock__dot feat-mock__dot--green"></span>
                    <span className="feat-mock__bar-title">CRM Import · HubSpot</span>
                  </div>
                  <div className="feat-mock__body">
                    <div style={{fontSize:"10px",color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"7px"}}>Field mapping — auto-matched</div>
                    <div style={{display:"grid",gap:"4px"}}>
                      {[
                        ["name","Contact Name"],
                        ["website","Company URL"],
                        ["seo_badge","Custom Field"],
                        ["ui_action","Lead Status"],
                      ].map(([field, crm]) => (
                        <div key={field} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 9px",background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"5px"}}>
                          <span style={{fontSize:"9.5px",fontWeight:700,color:"#e0ecff"}}>{field}</span>
                          <span style={{fontSize:"9px",color:"#94a3b8"}}>→</span>
                          <span style={{fontSize:"9.5px",color:"#34d399",fontWeight:600}}>{crm} ✓</span>
                        </div>
                      ))}
                    </div>
                    <div className="feat-mock__footer" style={{marginTop:"8px"}}>
                      <span>48 records ready</span>
                      <strong style={{color:"#34d399"}}>0 errors</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card">
                <strong>0</strong>
                <span data-i18n="ucdImpact1">hours of data cleanup — fields are consistent and CRM-ready on export</span>
              </div>
              <div className="pd-impact-card">
                <strong>13+</strong>
                <span data-i18n="ucdImpact2">structured fields per lead — name, website, seo_badge, ui_action, ui_role and more</span>
              </div>
              <div className="pd-impact-card">
                <strong>3</strong>
                <span data-i18n="ucdImpact3">quality levels — STRONG · STEADY · EARLY — one metric for your ops dashboard</span>
              </div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="ucdCtaTitle">LinkedIn outbound data that doesn&apos;t need cleaning</h2>
            <p data-i18n="ucdCtaDesc">seoprospector captures, scores, and exports structured leads — ready for your CRM, your workflows, your reporting.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/use-cases/seo-agency" className="btn btn-ghost" data-i18n="ucdCta2">SEO Agencies →</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/use-cases/freelance-consultant" data-i18n="ucdNavBack">← Freelance Consultants</a>
            <a href="/use-cases/seo-agency" data-i18n="ucdNavNext">SEO Agencies →</a>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
