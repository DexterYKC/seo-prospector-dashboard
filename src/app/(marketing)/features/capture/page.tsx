import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { ScanMockDemo } from "@/components/ScanMockDemo";

export const metadata: Metadata = {
  title: "Opportunity Capture Workflow | seoprospector",
  description: "Capture active LinkedIn opportunities with duplicate safeguards so teams start outreach from cleaner, revenue-relevant data.",
};

export default function CapturePage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">
        <div className="container">

          <section className="detail-hero pd-hero">
            <div className="pd-hero-copy">
              <p className="detail-kicker" data-i18n="capKicker">Feature · Opportunity Capture</p>
              <h1 data-i18n="capTitle">Capture LinkedIn opportunities without data noise</h1>
              <p className="detail-lead" data-i18n="capLead">
                Open the side panel, visit a LinkedIn profile, and seoprospector captures it automatically — scoring the decision-maker role, deduplicating against your existing leads, and building a structured record ready for SEO audit and outreach.
              </p>
              <div className="detail-pills">
                <span className="detail-pill" data-i18n="capPill1">Profile pages only</span>
                <span className="detail-pill" data-i18n="capPill2">Decision-maker scoring</span>
                <span className="detail-pill" data-i18n="capPill3">Dedupe shield</span>
                <span className="detail-pill" data-i18n="capPill4">3 000 scans / month · PRO</span>
                <span className="detail-pill" data-i18n="capPill5">Assistant Scan (PRO)</span>
              </div>
              <div className="pd-hero-cta">
                <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
                <a href="/features/seo-scoring" className="btn btn-ghost" data-i18n="capCta2">Next: SEO Scoring →</a>
              </div>
            </div>
            <div className="pd-hero-visual">
              <div style={{ transform: "scale(0.82)", transformOrigin: "top right", width: "122%" }}>
                <ScanMockDemo />
              </div>
            </div>
          </section>

          <section className="pd-section">
            <h2 className="pd-section-title" data-i18n="capHowTitle">How it works in 4 steps</h2>
            <div className="pd-steps">
              {[
                { n: "1", titleKey: "capStep1Title", title: "Open a LinkedIn profile", descKey: "capStep1Desc", desc: "Capture triggers when you visit a LinkedIn profile page (/in/username) with the side panel open. No action needed — the extension reads the page automatically." },
                { n: "2", titleKey: "capStep2Title", title: "Decision-maker scoring", descKey: "capStep2Desc", desc: "Each position is scored by title keywords (CEO, Founder, Owner, Director → DECISION_MAKER). Active positions are prioritised; if none found, a COLD lead is still created so nothing is missed." },
                { n: "3", titleKey: "capStep3Title", title: "Dedupe shield", descKey: "capStep3Desc", desc: "The lead is matched against your existing list by LinkedIn URL and company. Duplicate records are blocked at both profile and company level — no manual cleanup needed." },
                { n: "4", titleKey: "capStep4Title", title: "Structured record — 13+ fields", descKey: "capStep4Desc", desc: "Name, headline, title, company, website, LinkedIn URL, role type, lead classification, SEO badge, and action recommendation — all structured, ready for scoring and outreach without reformatting." },
              ].map((s) => (
                <div key={s.n} className="pd-step">
                  <div className="pd-step-num">{s.n}</div>
                  <div className="pd-step-body">
                    <h3 data-i18n={s.titleKey}>{s.title}</h3>
                    <p data-i18n={s.descKey}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pd-section pd-section--alt">
            <div className="pd-feature-grid">
              <div className="pd-feature-copy">
                <h3 data-i18n="capAssistTitle">Assistant Scan — build your prospecting list in seconds <span className="detail-pill" style={{ fontSize: "0.72rem", marginLeft: "6px" }}>PRO</span></h3>
                <p data-i18n="capAssistText">Don&apos;t start from a blank list. Tell the Assistant Scan your target profile — industry, role, location — and it generates targeted LinkedIn search queries you can run directly.</p>
                <ul>
                  <li data-i18n="capAssistLi1">Input: target persona (role, industry, region)</li>
                  <li data-i18n="capAssistLi2">Output: 3–5 ready-to-run LinkedIn search strings</li>
                  <li data-i18n="capAssistLi3">Cuts prospecting list-building time by 70%+</li>
                  <li data-i18n="capAssistLi4">Works alongside standard capture — no workflow change</li>
                  <li data-i18n="capAssistLi5">Included in Pro and Agency plans</li>
                </ul>
              </div>
              <div className="pd-feature-visual">
                <div style={{ transform: "scale(0.82)", transformOrigin: "top right", width: "122%" }}>
                  <ScanMockDemo defaultQbOpen />
                </div>
              </div>
            </div>
          </section>

          <div className="pd-impact">
            <div className="pd-impact-cards">
              <div className="pd-impact-card"><strong>3 000</strong><span data-i18n="capImpact1">profile captures / month on PRO plan</span></div>
              <div className="pd-impact-card"><strong>13+</strong><span data-i18n="capImpact2">fields captured per lead — name, role, company, website, headline, URL and more</span></div>
              <div className="pd-impact-card"><strong>0</strong><span data-i18n="capImpact3">manual steps — open a profile, capture fires automatically</span></div>
            </div>
          </div>

          <section className="pd-cta">
            <h2 data-i18n="capCtaTitle">Start capturing smarter today</h2>
            <p data-i18n="capCtaDesc">Install the extension, open a LinkedIn profile, and capture your first lead in under 10 seconds. Free plan available.</p>
            <div className="pd-cta-btns">
              <a href="/pricing" className="btn btn-primary" data-i18n="sharedCtaFree">Start free trial</a>
              <a href="/features/seo-scoring" className="btn btn-ghost" data-i18n="capCta2">Next: SEO Scoring →</a>
            </div>
          </section>

          <div className="pd-feature-nav">
            <a href="/home#product" data-i18n="capNavBack">← All Features</a>
            <a href="/features/seo-scoring" data-i18n="capNavNext">SEO Scoring →</a>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
