import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MessagesMockDemo } from "@/components/MessagesMockDemo";

export const metadata: Metadata = {
  title: "AI Outreach Messages | seoprospector",
  description: "Generate personalized outreach drafts from lead role context and SEO opportunity status to improve reply quality.",
};

export default function MessagesPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="fmsgKicker">Feature · AI Outreach Messages</p>
              <h1 data-i18n="fmsgTitle">From HOT lead to sent message in 30 seconds</h1>
              <p className="detail-lead" data-i18n="fmsgLead">
                Select a lead, pick a tone (Professional, Friendly, Direct, or Consultative), add optional context, and generate a personalized draft from the lead&apos;s name, role, company, and exact SEO issues — then send directly to their LinkedIn inbox without leaving the panel.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="fmsgPill1">4 tones: Professional · Friendly · Direct · Consultative</span>
                <span className="detail-pill" data-i18n="fmsgPill2">SEO issues auto-injected</span>
                <span className="detail-pill" data-i18n="fmsgPill3">Optional context field</span>
                <span className="detail-pill" data-i18n="fmsgPill4">EN / FR bilingual</span>
                <span className="detail-pill" data-i18n="fmsgPill5">Send direct via LinkedIn</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/features/export" className="btn btn-ghost" data-i18n="fmsgCta2">Next: Dashboard →</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <MessagesMockDemo />
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="fmsgCompTitle">Generic outreach vs context-driven outreach</h2>
            <p className="pd-section-sub" data-i18n="fmsgCompSub">The difference in reply rate isn&apos;t about AI — it&apos;s about whether the message proves you did your homework.</p>
            <div className="pd-before-after">
              <div className="pd-before">
                <p className="pd-ba-label" data-i18n="fmsgWithoutLabel">✗ Without seoprospector</p>
                <p className="pd-ba-msg">&quot;Hi Sophie, I noticed your company could benefit from SEO services. We help businesses grow organically. Would you be open to a quick call to discuss?&quot;</p>
                <div style={{marginTop:"12px",display:"flex",gap:"6px",alignItems:"center"}}>
                  <div style={{width:"100%",background:"rgba(239,68,68,0.1)",borderRadius:"999px",height:"5px",overflow:"hidden"}}>
                    <div style={{width:"3%",background:"#ef4444",height:"100%",borderRadius:"999px"}}></div>
                  </div>
                  <span style={{fontSize:"10px",fontWeight:700,color:"#dc2626",whiteSpace:"nowrap"}}>~3% reply</span>
                </div>
              </div>
              <div className="pd-after">
                <p className="pd-ba-label" data-i18n="fmsgWithLabel">✓ With seoprospector</p>
                <p className="pd-ba-msg">&quot;Hi Sophie, I looked at acmedigital.com — no H1 tag, missing meta description, 4s load time. These issues are directly limiting your organic inbound. I fix exactly these for SaaS companies. Worth a quick call?&quot;</p>
                <div style={{marginTop:"12px",display:"flex",gap:"6px",alignItems:"center"}}>
                  <div style={{width:"100%",background:"rgba(16,185,129,0.12)",borderRadius:"999px",height:"5px",overflow:"hidden"}}>
                    <div style={{width:"28%",background:"#10b981",height:"100%",borderRadius:"999px"}}></div>
                  </div>
                  <span style={{fontSize:"10px",fontWeight:700,color:"#047857",whiteSpace:"nowrap"}}>~28% reply</span>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section pd-section--alt">
            <h2 className="pd-section-title" data-i18n="fmsgHowTitle">How the AI message engine works</h2>
            <div className="pd-steps">
              <div className="pd-step">
                <div className="pd-step-num">1</div>
                <div className="pd-step-body">
                  <h3 data-i18n="fmsgStep1Title">Select a lead</h3>
                  <p data-i18n="fmsgStep1Desc">Open the Messages tab and select any lead from your priority queue. Lead data and SEO context load automatically.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">2</div>
                <div className="pd-step-body">
                  <h3 data-i18n="fmsgStep2Title">Context is injected automatically</h3>
                  <p data-i18n="fmsgStep2Desc">Name, role, company, SEO status, specific issues, and your selected action tone are all injected into the AI prompt — nothing to fill in manually.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">3</div>
                <div className="pd-step-body">
                  <h3 data-i18n="fmsgStep3Title">Pick tone, language, and optional context</h3>
                  <p data-i18n="fmsgStep3Desc">Choose from 4 tones — Professional, Friendly, Direct, Consultative. Switch EN/FR with one click. Add a free-text context hint (e.g. "focus on LCP issue, keep under 300 chars") to steer the output.</p>
                </div>
              </div>
              <div className="pd-step">
                <div className="pd-step-num">4</div>
                <div className="pd-step-body">
                  <h3 data-i18n="fmsgStep4Title">Send directly via LinkedIn</h3>
                  <p data-i18n="fmsgStep4Desc">Hit &quot;Send&quot; — the extension navigates to the lead&apos;s LinkedIn profile and sends automatically, or fills the compose box as a draft. No tab switching, no copy-paste.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pd-section">
            <div className="pd-feature-grid is-reverse">
              <div className="pd-feature-visual">
                <MessagesMockDemo />
              </div>
              <div className="pd-feature-copy">
                <h3 data-i18n="fmsgToneTitle">3 action tones — message matches the lead&apos;s temperature</h3>
                <p data-i18n="fmsgToneDesc">
                  Not all outreach should feel the same. A CRITICAL lead needs urgency. A WARM lead needs curiosity.
                  A COLD lead needs a soft touch. seoprospector generates the right tone automatically based on the lead classification.
                </p>
                <ul>
                  <li data-i18n="fmsgToneLi1"><strong style={{color:"#93c5fd"}}>Contact Now</strong> — direct, urgent, references specific SEO issues</li>
                  <li data-i18n="fmsgToneLi2"><strong style={{color:"#93c5fd"}}>Soft Contact</strong> — conversational, exploring interest, no hard pitch</li>
                  <li data-i18n="fmsgToneLi3"><strong style={{color:"#93c5fd"}}>Monitor</strong> — relationship builder, no ask, pure value signal</li>
                  <li data-i18n="fmsgToneLi4">EN / FR toggle — full bilingual generation on demand</li>
                  <li data-i18n="fmsgToneLi5">Regenerate button for alternative drafts if needed</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card">
                <strong>30s</strong>
                <span data-i18n="fmsgImpact1">from opening a lead to sending a personalized LinkedIn message</span>
              </div>
              <div className="pd-impact-card">
                <strong>3</strong>
                <span data-i18n="fmsgImpact2">action tones — Contact Now, Soft Contact, Monitor</span>
              </div>
              <div className="pd-impact-card">
                <strong>EN/FR</strong>
                <span data-i18n="fmsgImpact3">bilingual output — full message translated on demand</span>
              </div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="fmsgCtaTitle">Send smarter first-touch messages today</h2>
            <p data-i18n="fmsgCtaDesc">Install seoprospector and go from profile to personalized LinkedIn outreach in under a minute.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/features/export" className="btn btn-ghost" data-i18n="fmsgCta2">Next: Dashboard &amp; Exports →</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/features/prioritization" data-i18n="fmsgNavBack">← Lead Prioritization</a>
            <a href="/features/export" data-i18n="fmsgNavNext">Dashboard &amp; Exports →</a>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
