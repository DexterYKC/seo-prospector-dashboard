import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { SeoAuditMockDemo } from "@/components/SeoAuditMockDemo";

export const metadata: Metadata = {
  title: "Freelance Consultants | seoprospector",
  description: "How freelance SEO and marketing consultants use seoprospector to find, qualify, and pitch the right prospects solo — without a team.",
};

export default function FreelanceConsultantPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="uccKicker">Use Case · Freelance Consultants</p>
              <h1 data-i18n="uccTitle">Find your next client on LinkedIn — without hours of manual research</h1>
              <p className="detail-lead" data-i18n="uccLead">
                As a solo consultant, every hour counts. seoprospector captures prospects automatically as you browse LinkedIn,
                scores their SEO urgency, and drafts the outreach message — so you spend time on conversations, not spreadsheets.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="uccPill1">Solo workflow</span>
                <span className="detail-pill" data-i18n="uccPill2">No VA needed</span>
                <span className="detail-pill" data-i18n="uccPill3">Auto SEO audit per lead</span>
                <span className="detail-pill" data-i18n="uccPill4">1-click LinkedIn outreach</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/use-cases/revops-operator" className="btn btn-ghost" data-i18n="uccCta2">RevOps Operators →</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <div className="feat-mock" style={{width:"min(440px,100%)"}}>
                <div className="feat-mock__bar">
                  <span className="feat-mock__dot feat-mock__dot--red"></span>
                  <span className="feat-mock__dot feat-mock__dot--yellow"></span>
                  <span className="feat-mock__dot feat-mock__dot--green"></span>
                  <span className="feat-mock__bar-title">seoprospector · Side Panel</span>
                </div>
                <div className="feat-mock__body">

                  <div style={{display:"flex",alignItems:"center",gap:"6px",padding:"5px 8px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(108,141,208,0.15)",borderRadius:"5px",marginBottom:"10px"}}>
                    <span style={{fontSize:"9px",fontWeight:800,color:"#3a86ff",background:"rgba(58,134,255,0.12)",border:"1px solid rgba(58,134,255,0.25)",borderRadius:"3px",padding:"1px 5px"}}>in</span>
                    <span style={{fontSize:"9px",color:"#64748b",flex:1}}>linkedin.com/in/sophie-martin-ceo</span>
                    <span style={{fontSize:"8px",fontWeight:700,color:"#34d399",background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:"3px",padding:"1px 5px"}}>CAPTURED</span>
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
                    <span className="feat-mock__avatar feat-mock__avatar--1" style={{width:"36px",height:"36px",fontSize:"13px",flexShrink:0}}>SM</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"12px",fontWeight:700,color:"#f1f6ff"}}>Sophie Martin</div>
                      <div style={{fontSize:"9.5px",color:"#94a3b8"}}>CEO at Acme Digital · Paris</div>
                      <div style={{marginTop:"4px",display:"inline-flex",alignItems:"center",gap:"4px",padding:"2px 7px",background:"rgba(16,185,129,0.14)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:"4px",fontSize:"9px",fontWeight:700,color:"#34d399"}}>
                        ✓ Decision maker detected
                      </div>
                    </div>
                  </div>

                  <div style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"7px",padding:"9px 10px",marginBottom:"9px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"6px"}}>
                      <span style={{fontSize:"9.5px",fontWeight:700,color:"#f1f6ff"}}>acmedigital.com</span>
                      <span style={{fontSize:"8.5px",fontWeight:800,color:"#ef4444",background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:"3px",padding:"1px 6px"}}>CRITICAL</span>
                    </div>
                    <div style={{fontSize:"9.5px",color:"#fca5a5",marginBottom:"2px"}}>✗ No H1 tag on homepage</div>
                    <div style={{fontSize:"9.5px",color:"#fca5a5",marginBottom:"2px"}}>✗ Missing meta description</div>
                    <div style={{fontSize:"9.5px",color:"#fbbf24"}}>~ LCP: 4.2s — above threshold</div>
                  </div>

                  <div style={{background:"rgba(37,99,235,0.07)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:"7px",padding:"9px 10px",marginBottom:"8px"}}>
                    <div style={{fontSize:"8.5px",color:"#60a5fa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"5px"}}>AI Message · Professional</div>
                    <div style={{fontSize:"9.5px",color:"#c8dcf5",lineHeight:1.55}}>Hi Sophie, I audited acmedigital.com — no H1, missing meta, 4.2s load. These gaps are directly limiting your organic reach. Worth a quick call?</div>
                  </div>

                  <div className="feat-mock__footer">
                    <span style={{color:"#ef4444",fontWeight:700}}>HOT · Contact Now</span>
                    <strong style={{color:"#60a5fa"}}>Send on LinkedIn →</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="uccWorkTitle">Your entire client acquisition workflow in one tool</h2>
            <p className="pd-section-sub" data-i18n="uccWorkSub">No VA, no spreadsheet, no manual research. Just LinkedIn, seoprospector, and a message that gets replies.</p>
            <div className="pd-steps">
              <div className="pd-step">
                <div className="pd-step-num">1</div>
                <div className="pd-step-body">
                  <h3 data-i18n="uccStep1Title">Browse LinkedIn as normal</h3>
                  <p data-i18n="uccStep1Desc">Visit profiles with the side panel open. seoprospector captures each profile automatically — name, role, company, website, LinkedIn URL. No action needed.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">2</div>
                <div className="pd-step-body">
                  <h3 data-i18n="uccStep2Title">SEO audit runs automatically</h3>
                  <p data-i18n="uccStep2Desc">Every lead&apos;s website gets scored instantly — CRITICAL (0–39), WEAK (40–64), or OK (65–100). You see the specific issues without opening any other tool.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">3</div>
                <div className="pd-step-body">
                  <h3 data-i18n="uccStep3Title">Pick the HOT ones</h3>
                  <p data-i18n="uccStep3Desc">CEO / Founder / Owner / Director + CRITICAL SEO = HOT. These are your best pitch opportunities. The queue shows them first — no manual sorting.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">4</div>
                <div className="pd-step-body">
                  <h3 data-i18n="uccStep4Title">One click to a personalized message</h3>
                  <p data-i18n="uccStep4Desc">AI generates a message that references the real SEO issues on their site — no H1, slow LCP, missing meta — in English or French. Send directly from the panel.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section pd-section--alt">
            <div className="pd-feature-grid is-reverse">
              <div className="pd-feature-visual">
                <div style={{ transform: "scale(0.82)", transformOrigin: "top right", width: "122%" }}>
                  <SeoAuditMockDemo />
                </div>
              </div>
              <div className="pd-feature-copy">
                <h3 data-i18n="uccMoreTitle">More pitches, less prep — same quality</h3>
                <p data-i18n="uccMoreDesc">
                  Before seoprospector, finding 5 qualified prospects took half a day — manual SEO checks, copy-pasting data,
                  writing messages from scratch. Now it&apos;s an hour of LinkedIn browsing and a button click.
                </p>
                <ul>
                  <li data-i18n="uccMoreLi1">Capture 10–30 prospects in a single browsing session</li>
                  <li data-i18n="uccMoreLi2">Every prospect auto-scored — H1, meta, robots.txt, LCP, CLS all checked</li>
                  <li data-i18n="uccMoreLi3">HOT leads identified in seconds, not hours</li>
                  <li data-i18n="uccMoreLi4">EN / FR outreach message generated and sent from the panel</li>
                  <li data-i18n="uccMoreLi5">Your prospect list is always clean, structured, and deduped</li>
                  <li data-i18n="uccMoreLi6">Export as CSV to share with a future client or collaborator</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card">
                <strong>10×</strong>
                <span data-i18n="uccImpact1">faster from LinkedIn profile to personalized outreach message</span>
              </div>
              <div className="pd-impact-card">
                <strong>Solo</strong>
                <span data-i18n="uccImpact2">workflow — no VA, no team needed to run qualified outbound</span>
              </div>
              <div className="pd-impact-card">
                <strong>EN/FR</strong>
                <span data-i18n="uccImpact3">AI messages in both languages — pitch any market without extra effort</span>
              </div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="uccCtaTitle">Your next client is already on LinkedIn</h2>
            <p data-i18n="uccCtaDesc">seoprospector finds them, scores them, and writes the pitch. You send it. Simple as that.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/use-cases/revops-operator" className="btn btn-ghost" data-i18n="uccCta2">RevOps Operators →</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/use-cases/b2b-sales-team" data-i18n="uccNavBack">← B2B Sales Teams</a>
            <a href="/use-cases/revops-operator" data-i18n="uccNavNext">RevOps Operators →</a>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
