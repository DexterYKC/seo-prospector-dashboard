import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MessagesMockDemo } from "@/components/MessagesMockDemo";

export const metadata: Metadata = {
  title: "B2B Sales Teams | seoprospector",
  description: "How B2B sales teams use seoprospector to filter cold leads and get SDRs calling the right accounts first.",
};

export default function B2bSalesTeamPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="ucbKicker">Use Case · B2B Sales Teams</p>
              <h1 data-i18n="ucbTitle">Stop wasting rep time on accounts that will never convert</h1>
              <p className="detail-lead" data-i18n="ucbLead">
                SDR teams spend too much time on accounts with no real pain point.
                seoprospector scores SEO urgency and decision-maker confidence before anyone picks up the phone —
                so reps only call the accounts that are genuinely ready to buy.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="ucbPill1">Automatic lead triage</span>
                <span className="detail-pill" data-i18n="ucbPill2">HOT queue first</span>
                <span className="detail-pill" data-i18n="ucbPill3">Decision-maker signal</span>
                <span className="detail-pill" data-i18n="ucbPill4">Context-driven outreach</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/use-cases/freelance-consultant" className="btn btn-ghost" data-i18n="ucbCta2">Freelance Consultants →</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <div className="feat-mock" style={{width:"min(440px,100%)"}}>
                <div className="feat-mock__bar">
                  <span className="feat-mock__dot feat-mock__dot--red"></span>
                  <span className="feat-mock__dot feat-mock__dot--yellow"></span>
                  <span className="feat-mock__dot feat-mock__dot--green"></span>
                  <span className="feat-mock__bar-title">SDR queue · auto-sorted</span>
                </div>
                <div className="feat-mock__body">
                  <div style={{fontSize:"9.5px",color:"#64748b",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"8px"}}>Today&apos;s priority — 32 leads scored</div>

                  <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"7px",marginBottom:"4px"}}>
                    <span className="feat-mock__avatar feat-mock__avatar--1">SM</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"11px",fontWeight:700,color:"#f1f6ff"}}>Sophie Martin</div>
                      <div style={{fontSize:"9.5px",color:"#94a3b8"}}>CEO · acmedigital.com</div>
                    </div>
                    <div style={{display:"flex",gap:"3px",flexShrink:0}}>
                      <span className="feat-mock__tag feat-mock__tag--hot">HOT</span>
                      <span className="feat-mock__tag feat-mock__tag--critical">CRITICAL</span>
                    </div>
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:"7px",marginBottom:"4px"}}>
                    <span className="feat-mock__avatar feat-mock__avatar--2">TL</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"11px",fontWeight:700,color:"#f1f6ff"}}>Thomas Leroy</div>
                      <div style={{fontSize:"9.5px",color:"#94a3b8"}}>Founder · techcorp.io</div>
                    </div>
                    <div style={{display:"flex",gap:"3px",flexShrink:0}}>
                      <span className="feat-mock__tag feat-mock__tag--hot">HOT</span>
                      <span className="feat-mock__tag feat-mock__tag--critical">CRITICAL</span>
                    </div>
                  </div>

                  <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:"7px",marginBottom:"4px"}}>
                    <span className="feat-mock__avatar feat-mock__avatar--3">JD</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"11px",fontWeight:700,color:"#f1f6ff"}}>Jean Dupont</div>
                      <div style={{fontSize:"9.5px",color:"#94a3b8"}}>Director · growthlab.fr</div>
                    </div>
                    <div style={{display:"flex",gap:"3px",flexShrink:0}}>
                      <span className="feat-mock__tag feat-mock__tag--warm">WARM</span>
                      <span className="feat-mock__tag feat-mock__tag--weak">WEAK</span>
                    </div>
                  </div>

                  <div style={{padding:"7px 10px",background:"rgba(100,116,139,0.08)",border:"1px solid rgba(100,116,139,0.15)",borderRadius:"6px",fontSize:"9.5px",color:"#64748b",fontWeight:600,marginBottom:"6px"}}>
                    8 COLD leads hidden — not worth rep time today
                  </div>

                  <div className="feat-mock__footer">
                    <span>32 leads scored</span>
                    <strong style={{color:"#dc2626"}}>2 to contact now</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="ucbHowTitle">How SDR teams use seoprospector</h2>
            <p className="pd-section-sub" data-i18n="ucbHowSub">Less CRM noise. More conversations that actually go somewhere.</p>
            <div className="pd-steps">
              <div className="pd-step">
                <div className="pd-step-num">1</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucbStep1Title">Browse LinkedIn normally</h3>
                  <p data-i18n="ucbStep1Desc">Reps visit target profiles while seoprospector captures roles, company data, and website URLs automatically — no manual input.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">2</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucbStep2Title">Scoring runs instantly</h3>
                  <p data-i18n="ucbStep2Desc">Every lead gets an automatic SEO audit. CRITICAL accounts surface immediately. Decision-maker role is detected from title — CEO, Founder, Owner, Director.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">3</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucbStep3Title">HOT queue, auto-sorted</h3>
                  <p data-i18n="ucbStep3Desc">Reps open seoprospector and see the exact accounts to contact today — decision-maker confirmed + CRITICAL or WEAK SEO = HOT or WARM, ranked automatically.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">4</div>
                <div className="pd-step-body">
                  <h3 data-i18n="ucbStep4Title">Message with real context</h3>
                  <p data-i18n="ucbStep4Desc">AI outreach references exact SEO issues found — no H1, slow LCP, missing meta description. Prospects respond because the message proves you did your homework.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section pd-section--alt">
            <div className="pd-feature-grid">
              <div className="pd-feature-copy">
                <h3 data-i18n="ucbDayTitle">A rep&apos;s day — before and after</h3>
                <p data-i18n="ucbDayDesc">
                  Without seoprospector, reps manually check domains, guess at urgency, and send generic messages.
                  With it, triage is automated and every message has a concrete reason to open.
                </p>
                <ul>
                  <li data-i18n="ucbDayLi1">No more manual domain checks before calls</li>
                  <li data-i18n="ucbDayLi2">HOT leads always visible at the top of the queue</li>
                  <li data-i18n="ucbDayLi3">AI message references the actual SEO issue found — specific, not generic</li>
                  <li data-i18n="ucbDayLi4">4 tones: Professional, Friendly, Direct, Consultative — pick what fits the lead</li>
                  <li data-i18n="ucbDayLi5">Reps focus on conversations, not research</li>
                  <li data-i18n="ucbDayLi6">Manager sees consistent team output via CSV exports</li>
                </ul>
              </div>
              <div className="pd-feature-visual">
                <div style={{ transform: "scale(0.82)", transformOrigin: "top left", width: "122%" }}>
                  <MessagesMockDemo />
                </div>
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card">
                <strong>3×</strong>
                <span data-i18n="ucbImpact1">more first-touch replies when outreach references real SEO issues</span>
              </div>
              <div className="pd-impact-card">
                <strong>HOT</strong>
                <span data-i18n="ucbImpact2">leads surface first — reps never manually sort the queue again</span>
              </div>
              <div className="pd-impact-card">
                <strong>0</strong>
                <span data-i18n="ucbImpact3">manual domain audits — scoring runs automatically on every capture</span>
              </div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="ucbCtaTitle">Your SDRs should be selling, not researching</h2>
            <p data-i18n="ucbCtaDesc">seoprospector does the triage. Reps get a pre-sorted action queue every morning — HOT leads at the top, always.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/use-cases/freelance-consultant" className="btn btn-ghost" data-i18n="ucbCta2">Freelance Consultants →</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/use-cases/seo-agency" data-i18n="ucbNavBack">← SEO Agencies</a>
            <a href="/use-cases/freelance-consultant" data-i18n="ucbNavNext">Freelance Consultants →</a>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
