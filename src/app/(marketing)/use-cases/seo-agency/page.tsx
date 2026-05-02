import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { DashboardMockDemo } from "@/components/DashboardMockDemo";

export const metadata: Metadata = {
  title: "SEO Agency Workflow | seoprospector",
  description: "How SEO agencies use seoprospector to run multi-client prospecting, score SEO urgency, and deliver consistent pipeline outcomes.",
};

export default function SeoAgencyPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="ucaKicker">Use Case · SEO Agencies</p>
              <h1 data-i18n="ucaTitle">Run multi-client outbound without losing qualification quality</h1>
              <p className="detail-lead" data-i18n="ucaLead">
                Agency operators manage 5–15 clients at once. seoprospector gives every operator the same scoring logic,
                the same HOT lead criteria, and the same structured output — so delivery quality doesn&apos;t depend on who ran the session.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="ucaPill1">Multi-client operations</span>
                <span className="detail-pill" data-i18n="ucaPill2">Consistent scoring</span>
                <span className="detail-pill" data-i18n="ucaPill3">Weekly delivery rhythm</span>
                <span className="detail-pill" data-i18n="ucaPill4">Client-ready CSV exports</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/use-cases/b2b-sales-team" className="btn btn-ghost" data-i18n="ucaCta2">B2B Sales Teams →</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <div className="feat-mock" style={{width:"min(440px,100%)"}}>
                <div className="feat-mock__bar">
                  <span className="feat-mock__dot feat-mock__dot--red"></span>
                  <span className="feat-mock__dot feat-mock__dot--yellow"></span>
                  <span className="feat-mock__dot feat-mock__dot--green"></span>
                  <span className="feat-mock__bar-title">Agency view · seoprospector</span>
                </div>
                <div className="feat-mock__body">
                  <div style={{fontSize:"9.5px",color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"8px"}}>This week — 3 active clients</div>

                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 10px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"7px",marginBottom:"5px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                      <span style={{width:"30px",height:"30px",borderRadius:"7px",background:"linear-gradient(135deg,#6366f1,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:800,color:"#fff",flexShrink:0}}>AC</span>
                      <div>
                        <div style={{fontSize:"11px",fontWeight:700,color:"#f1f6ff"}}>Acme Corp</div>
                        <div style={{fontSize:"9px",color:"#64748b"}}>847 / 3 000 scans</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"11px",fontWeight:800,color:"#ef4444"}}>12 HOT</div>
                      <div style={{fontSize:"8.5px",color:"#64748b"}}>CONTACT_NOW</div>
                    </div>
                  </div>

                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 10px",background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:"7px",marginBottom:"5px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                      <span style={{width:"30px",height:"30px",borderRadius:"7px",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:800,color:"#fff",flexShrink:0}}>TS</span>
                      <div>
                        <div style={{fontSize:"11px",fontWeight:700,color:"#f1f6ff"}}>TechStart</div>
                        <div style={{fontSize:"9px",color:"#64748b"}}>523 / 3 000 scans</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"11px",fontWeight:800,color:"#f59e0b"}}>8 WARM</div>
                      <div style={{fontSize:"8.5px",color:"#64748b"}}>CONTACT_SOFT</div>
                    </div>
                  </div>

                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 10px",background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:"7px",marginBottom:"8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                      <span style={{width:"30px",height:"30px",borderRadius:"7px",background:"linear-gradient(135deg,#34d399,#10b981)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:800,color:"#fff",flexShrink:0}}>GL</span>
                      <div>
                        <div style={{fontSize:"11px",fontWeight:700,color:"#f1f6ff"}}>GrowthLab</div>
                        <div style={{fontSize:"9px",color:"#64748b"}}>318 / 3 000 scans</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"11px",fontWeight:800,color:"#10b981"}}>5 HOT</div>
                      <div style={{fontSize:"8.5px",color:"#64748b"}}>CONTACT_NOW</div>
                    </div>
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 10px",background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.2)",borderRadius:"6px",marginBottom:"6px"}}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span style={{fontSize:"9.5px",color:"#93c5fd",fontWeight:600}}>3 client CSVs ready to export</span>
                  </div>

                  <div className="feat-mock__footer">
                    <span>Same logic, all clients</span>
                    <strong style={{color:"#ef4444"}}>17 HOT to action</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="ucaProbTitle">The agency qualification problem</h2>
            <p className="pd-section-sub" data-i18n="ucaProbSub">Without a shared system, every operator scores leads differently — and client delivery becomes unpredictable.</p>
            <div className="pd-steps">
              <div className="pd-step">
                <div className="pd-step-num">1</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucaStep1Title">Inconsistent scoring</h3>
                  <p data-i18n="ucaStep1Desc">One operator calls a lead HOT, another parks it. No shared definition means no reproducible quality.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">2</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucaStep2Title">Manual SEO research</h3>
                  <p data-i18n="ucaStep2Desc">Checking each domain&apos;s SEO health manually before outreach wastes hours per campaign. It&apos;s not scalable across 10 clients.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">3</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucaStep3Title">Outreach without context</h3>
                  <p data-i18n="ucaStep3Desc">Generic messages go out without referencing the prospect&apos;s real SEO gaps — reply rates stay flat.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">4</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucaStep4Title">Reporting overhead</h3>
                  <p data-i18n="ucaStep4Desc">Assembling pipeline reports for clients from multiple sources takes 2–3 hours per week per client.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section pd-section--alt">
            <div className="pd-feature-grid">
              <div className="pd-feature-copy">
                <h3 data-i18n="ucaPlayTitle">The agency playbook with seoprospector</h3>
                <p data-i18n="ucaPlayDesc">
                  One tool replaces the whole manual stack. Your operators run LinkedIn, seoprospector scores and classifies automatically,
                  and you deliver HOT lists to clients every week — with the same logic every time.
                </p>
                <ul>
                  <li data-i18n="ucaPlayLi1"><strong style={{color:"#93c5fd"}}>Monday</strong> — Capture fresh profiles for each client ICP using Query Builder</li>
                  <li data-i18n="ucaPlayLi2"><strong style={{color:"#93c5fd"}}>Tuesday</strong> — Review HOT list, approve outreach targets by client</li>
                  <li data-i18n="ucaPlayLi3"><strong style={{color:"#93c5fd"}}>Wed–Thu</strong> — Send AI-generated messages with SEO context injected</li>
                  <li data-i18n="ucaPlayLi4"><strong style={{color:"#93c5fd"}}>Friday</strong> — Export leads CSV, share pipeline report with client</li>
                  <li data-i18n="ucaPlayLi5">Same HOT / WARM / COLD criteria across all operators, always</li>
                  <li data-i18n="ucaPlayLi6">No manual SEO audits, no spreadsheet cleanup</li>
                </ul>
              </div>
              <div className="pd-feature-visual">
                <div style={{ transform: "scale(0.82)", transformOrigin: "top left", width: "122%" }}>
                  <DashboardMockDemo />
                </div>
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card">
                <strong>5×</strong>
                <span data-i18n="ucaImpact1">more clients handled per operator with consistent qualification logic</span>
              </div>
              <div className="pd-impact-card">
                <strong>0</strong>
                <span data-i18n="ucaImpact2">manual SEO audits — scoring runs automatically on every captured lead</span>
              </div>
              <div className="pd-impact-card">
                <strong>1-click</strong>
                <span data-i18n="ucaImpact3">client-ready CSV export — no reformatting, no assembly</span>
              </div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="ucaCtaTitle">Built for agencies that run outbound at scale</h2>
            <p data-i18n="ucaCtaDesc">seoprospector gives your team a shared qualification system — same logic, same output, every client, every week.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/use-cases/b2b-sales-team" className="btn btn-ghost" data-i18n="ucaCta2">B2B Sales Teams →</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/use-cases/revops-operator" data-i18n="ucaNavBack">← RevOps Operators</a>
            <a href="/use-cases/b2b-sales-team" data-i18n="ucaNavNext">B2B Sales Teams →</a>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
