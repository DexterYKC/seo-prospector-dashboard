import NavScript from "@/components/NavScript";
import { NavAuthButtons } from "@/components/NavAuthButtons";
import { ScanMockDemo } from "@/components/ScanMockDemo";
import { SeoMockDemo } from "@/components/SeoMockDemo";
import { SeoAuditMockDemo } from "@/components/SeoAuditMockDemo";
import { MessagesMockDemo } from "@/components/MessagesMockDemo";
import { DashboardMockDemo } from "@/components/DashboardMockDemo";
import { WaitlistButton } from "@/components/WaitlistModal";
import { ScrollToTopBtn } from "@/components/ScrollToTopBtn";

export default function HomePage() {
  return (
    <div className="landing-page">
      <NavScript />
      <div className="i18n-area">
        <header className="site-header" id="siteHeader">
          <div className="container nav" id="navShell">
            <a className="brand" href="/home">
              <img src="/logo.svg" className="brand-mark" alt="" aria-hidden="true" width="38" height="38" />
              <span>seoprospector</span>
            </a>

            <nav className="main-nav">
              <div className="nav-dropdown">
                <button type="button" className="nav-drop-trigger" data-i18n="navFeatures" aria-haspopup="true">Features</button>
                <div className="nav-drop-menu">
                  <a href="/features/capture" data-i18n="navFeature1" data-icon="CP">Opportunity Capture</a>
                  <a href="/features/seo-scoring" data-i18n="navFeature2" data-icon="SEO">SEO Opportunity Scoring</a>
                  <a href="/features/prioritization" data-i18n="navFeature3" data-icon="HOT">Lead Prioritization</a>
                  <a href="/features/messages" data-i18n="navFeature4" data-icon="AI">AI Outreach Messages</a>
                  <a href="/features/export" data-i18n="navFeature5" data-icon="CSV">Dashboard and Exports</a>
                </div>
              </div>
              <div className="nav-dropdown">
                <button type="button" className="nav-drop-trigger" data-i18n="navUseCases" aria-haspopup="true">Use Cases</button>
                <div className="nav-drop-menu">
                  <a href="/use-cases/seo-agency" data-i18n="navUseCase1" data-icon="AG">SEO Agencies</a>
                  <a href="/use-cases/b2b-sales-team" data-i18n="navUseCase2" data-icon="B2B">B2B Sales Teams</a>
                  <a href="/use-cases/freelance-consultant" data-i18n="navUseCase3" data-icon="SOLO">Freelance Consultants</a>
                  <a href="/use-cases/revops-operator" data-i18n="navUseCase4" data-icon="OPS">RevOps Operators</a>
                </div>
              </div>
              <a href="/pricing" data-i18n="navPricing">Pricing</a>
              <a href="#faq" data-i18n="navFaq">FAQ</a>
              <a href="/blog" data-i18n="navBlog">Blog</a>
              <a href="/contact" data-i18n="navContact">Contact</a>
            </nav>

            <NavAuthButtons />
          </div>
        </header>

        <main>
          <section className="hero">
            <div className="container hero-grid">
              <div>
                <p className="eyebrow" data-i18n="heroEyebrow">Revenue Engine for LinkedIn Outreach</p>
                <h1 data-i18n="heroTitle">Automate lead qualification and close more deals from LinkedIn.</h1>
                <p className="hero-lead" data-i18n="heroLead">
                  seoprospector is a Chrome Side Panel that stays open as you browse LinkedIn. It captures profiles automatically, scores SEO opportunities, and classifies every lead as HOT, WARM, or COLD — so you always know who to contact first and why.
                </p>

                <div className="hero-cta">
                  <a href="/register" className="btn btn-primary btn-download" data-i18n="heroPrimaryCta">
                    Start free trial
                  </a>
                  <a href="https://chromewebstore.google.com/detail/your-extension-id" target="_blank" rel="noopener noreferrer" className="btn btn-ghost hero-cta-secondary" data-i18n="heroSecondaryCta">Add to Chrome</a>
                </div>

                <p className="hero-note" data-i18n="heroNote">7-day free trial · No credit card required · Cancel anytime</p>
              </div>

              <div className="hero-visual">
                <div className="hero-pipeline" aria-hidden="true">

                  {/* Floating stat chips */}
                  <div className="hero-chip hero-chip--tl">
                    <span className="hero-chip__dot hero-chip__dot--red"></span>
                    <span>12 HOT leads · this session</span>
                  </div>
                  <div className="hero-chip hero-chip--br">
                    <span className="hero-chip__dot hero-chip__dot--blue"></span>
                    <span>28% avg reply rate</span>
                  </div>

                  {/* Pipeline steps */}
                  <div className="hp-card hp-card--capture">
                    <div className="hp-card__icon hp-card__icon--linkedin">
                      <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </div>
                    <div className="hp-card__body">
                      <span className="hp-card__label">Browse LinkedIn</span>
                      <span className="hp-card__sub">Profile captured automatically</span>
                    </div>
                    <span className="hp-card__status hp-card__status--done">✓</span>
                  </div>

                  <div className="hp-connector">
                    <svg viewBox="0 0 2 24" width="2" height="24"><line x1="1" y1="0" x2="1" y2="24" stroke="rgba(100,150,255,0.3)" strokeWidth="1.5" strokeDasharray="3 3"/></svg>
                  </div>

                  <div className="hp-card hp-card--seo">
                    <div className="hp-card__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </div>
                    <div className="hp-card__body">
                      <span className="hp-card__label">SEO Audit</span>
                      <span className="hp-card__sub">acmedigital.com · score 12/100</span>
                    </div>
                    <span className="hp-card__badge hp-card__badge--critical">CRITICAL</span>
                  </div>

                  <div className="hp-connector">
                    <svg viewBox="0 0 2 24" width="2" height="24"><line x1="1" y1="0" x2="1" y2="24" stroke="rgba(100,150,255,0.3)" strokeWidth="1.5" strokeDasharray="3 3"/></svg>
                  </div>

                  <div className="hp-card hp-card--lead">
                    <div className="hp-card__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className="hp-card__body">
                      <span className="hp-card__label">Sophie Martin — CEO</span>
                      <span className="hp-card__sub">Decision maker · CONTACT_NOW</span>
                    </div>
                    <span className="hp-card__badge hp-card__badge--hot">HOT</span>
                  </div>

                  <div className="hp-connector">
                    <svg viewBox="0 0 2 24" width="2" height="24"><line x1="1" y1="0" x2="1" y2="24" stroke="rgba(100,150,255,0.3)" strokeWidth="1.5" strokeDasharray="3 3"/></svg>
                  </div>

                  <div className="hp-card hp-card--msg">
                    <div className="hp-card__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </div>
                    <div className="hp-card__body">
                      <span className="hp-card__label">AI Message drafted</span>
                      <span className="hp-card__sub">References no H1, 4.2s load · EN/FR</span>
                    </div>
                    <span className="hp-card__status hp-card__status--sent">Sent</span>
                  </div>

                  {/* Bottom stat */}
                  <div className="hp-footer">
                    <span>Profile to sent message in</span>
                    <strong>30 seconds</strong>
                  </div>

                </div>
              </div>
            </div>
          </section>

          <section id="use-cases" className="section section-light results-light">
            <div className="container">
              <h2 data-i18n="useCasesTitle">Built for the people who close deals</h2>
              <p className="section-subtitle" data-i18n="useCasesSubtitle">
                seoprospector adapts to your workflow — whether you manage 30 clients or run solo outbound.
              </p>

              <div className="feature-grid">
                <a href="/use-cases/seo-agency" className="feature-card feature-link-card uc-card">
                  <span className="uc-card__tag">Agency</span>
                  <span className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  </span>
                  <h3 data-i18n="useCase1Title">SEO Agencies</h3>
                  <p data-i18n="useCase1Text">Scan dozens of LinkedIn profiles per session, auto-score every website, and ship a HOT lead list to each client — without touching a spreadsheet.</p>

                </a>
                <a href="/use-cases/b2b-sales-team" className="feature-card feature-link-card uc-card">
                  <span className="uc-card__tag">Sales</span>
                  <span className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </span>
                  <h3 data-i18n="useCase2Title">B2B Sales Teams</h3>
                  <p data-i18n="useCase2Text">Filter out cold leads before your reps ever open a CRM. HOT + CRITICAL SEO accounts go straight to the top of the call queue.</p>

                </a>
                <a href="/use-cases/freelance-consultant" className="feature-card feature-link-card uc-card">
                  <span className="uc-card__tag">Solo</span>
                  <span className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </span>
                  <h3 data-i18n="useCase3Title">Freelance Consultants</h3>
                  <p data-i18n="useCase3Text">Browse LinkedIn, capture decision-makers, get an AI-drafted outreach in 30 seconds. No VA, no manual research, no wasted prospecting hours.</p>

                </a>
                <a href="/use-cases/revops-operator" className="feature-card feature-link-card uc-card">
                  <span className="uc-card__tag">RevOps</span>
                  <span className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  </span>
                  <h3 data-i18n="useCase4Title">RevOps Operators</h3>
                  <p data-i18n="useCase4Text">Enforce consistent lead scoring logic across the team. Export structured, pre-scored data that plugs directly into your CRM or reporting stack.</p>

                </a>
              </div>
            </div>
          </section>

          <section id="product" className="section section-workflow">
            <div className="container">
              <h2 data-i18n="productTitle">The LinkedIn extension built to turn activity into qualified pipeline</h2>
              <p className="section-subtitle" data-i18n="productSubtitle">
                seoprospector unifies capture, SEO context, prioritization, messaging, and exports so your team executes faster with fewer tools.
              </p>
              <div className="feature-flow-stack">
                <article className="feature-flow feature-scan">
                  <div className="feature-flow-copy">
                    <h3 data-i18n="ffScanTitle">Capture LinkedIn opportunities while you browse</h3>
                    <p data-i18n="ffScanText">The Side Panel runs alongside LinkedIn. Browse profiles normally — capture and scoring happen automatically in the background.</p>
                    <ul>
                      <li data-i18n="ffScanP1">Chrome Side Panel — stays open during your LinkedIn session</li>
                      <li data-i18n="ffScanP2">Active positions only, with duplicate prevention</li>
                      <li data-i18n="ffScanP3">Company + role mapping per opportunity</li>
                      <li data-i18n="ffScanP4">Assistant Scan: generate targeted LinkedIn search queries <strong>(PRO)</strong></li>
                    </ul>
                  </div>
                  <div className="feature-flow-visual">
                    <ScanMockDemo />
                  </div>
                </article>

                <article className="feature-flow is-reverse feature-seo">
                  <div className="feature-flow-copy">
                    <h3 data-i18n="ffClassTitle">Lead classification with SEO + business prioritization</h3>
                    <p data-i18n="ffClassText">Score each lead with role confidence and SEO urgency to prioritize the next best action.</p>
                    <ul>
                      <li data-i18n="ffClassP1">Decision-maker signal integration</li>
                      <li data-i18n="ffClassP2">Automatic HOT / WARM / COLD classification</li>
                      <li data-i18n="ffClassP3">Primary vs secondary opportunity selection</li>
                    </ul>
                  </div>
                  <div className="feature-flow-visual">
                    <SeoMockDemo />
                  </div>
                </article>

                <article className="feature-flow feature-classify">
                  <div className="feature-flow-copy">
                    <h3 data-i18n="ffSeoTitle">SEO audit for each captured opportunity</h3>
                    <p data-i18n="ffSeoText">Analyze each company website and return clear SEO opportunity levels your team can act on.</p>
                    <ul>
                      <li data-i18n="ffSeoP1">Website normalization and validation</li>
                      <li data-i18n="ffSeoP2">Status: OK, WEAK, CRITICAL, NO WEBSITE, SITE_UNREACHABLE</li>
                      <li data-i18n="ffSeoP3">Structured issues output for outreach context</li>
                    </ul>
                  </div>
                  <div className="feature-flow-visual">
                    <SeoAuditMockDemo />
                  </div>
                </article>

                <article className="feature-flow is-reverse feature-ai">
                  <div className="feature-flow-copy">
                    <h3 data-i18n="ffMsgTitle">AI message generation and direct LinkedIn sending</h3>
                    <p data-i18n="ffMsgText">Generate personalized outreach drafts from the selected lead, role, and SEO audit — then send directly without leaving the panel.</p>
                    <ul>
                      <li data-i18n="ffMsgP1">Lead + SEO context injected automatically</li>
                      <li data-i18n="ffMsgP2">Action style: contact now / soft contact / monitor</li>
                      <li data-i18n="ffMsgP3">Bilingual output (EN / FR)</li>
                      <li data-i18n="ffMsgP4">Send now — delivers directly to the LinkedIn profile</li>
                    </ul>
                  </div>
                  <div className="feature-flow-visual">
                    <MessagesMockDemo />
                  </div>
                </article>

                <article className="feature-flow feature-dashboard">
                  <div className="feature-flow-copy">
                    <h3 data-i18n="ffDashTitle">Dashboard with pipeline health and export control</h3>
                    <p data-i18n="ffDashText">Track captured leads, conversion rate, decision-maker detection, and pipeline health — all from one operational view.</p>
                    <ul>
                      <li data-i18n="ffDashP1">Live usage: daily scans, quota, and decision-maker rate</li>
                      <li data-i18n="ffDashP2">Pipeline Pulse: STEADY / RISING / FALLING health indicator</li>
                      <li data-i18n="ffDashP3">Export lead list and single SEO audits to CSV</li>
                    </ul>
                  </div>
                  <div className="feature-flow-visual">
                    <DashboardMockDemo />
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section id="pricing" className="section section-light pricing-section">
            <div className="container">
              <div className="pricing-intro">
                <h2 data-i18n="pricingTitle">Pricing built for ROI</h2>
                <p className="section-subtitle" data-i18n="pricingSubtitle">Start free — no credit card required. Upgrade when your outbound is ready to scale.</p>
                <p className="pricing-note" data-i18n="pricingNote">No credit card required to start. Cancel anytime.</p>
              </div>

              <div className="pricing-grid">
                <article className="price-card price-card-free">
                  <p className="price-badge" data-i18n="freeBadge">Free</p>
                  <p className="plan" data-i18n="freePlan">Free</p>
                  <p className="price">$0<span data-i18n="perMonth">/month</span></p>
                  <p className="plan-note" data-i18n="freeDesc">Validate lead quality before committing.</p>
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

                <article className="price-card price-card-starter">
                  <p className="price-badge price-badge-starter" data-i18n="starterBadge">Starter</p>
                  <p className="plan" data-i18n="starterPlan">Starter</p>
                  <p className="price">$29<span data-i18n="perMonth">/month</span></p>
                  <p className="plan-note" data-i18n="starterDesc">For solo prospectors ready to scale outbound.</p>
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

                <article className="price-card featured price-card-pro">
                  <p className="price-badge price-badge-pro" data-i18n="proBadge">Most popular</p>
                  <p className="plan" data-i18n="proPlan">Pro</p>
                  <p className="price">$59<span data-i18n="perMonth">/month</span></p>
                  <p className="plan-note" data-i18n="proDesc">Full pipeline automation for serious closers.</p>
                  <ul>
                    <li data-i18n="pro1">1 user</li>
                    <li data-i18n="pro2">3 000 scans / month</li>
                    <li data-i18n="pro3">1 200 SEO audits / month</li>
                    <li data-i18n="pro4">400 messages / month</li>
                    <li data-i18n="pro5">CSV export</li>
                    <li data-i18n="pro6">AI scanner</li>
                    <li data-i18n="pro7">Full audit</li>
                  </ul>
                  <WaitlistButton plan="PRO" trigger="Join waitlist" />
                </article>

                <article className="price-card price-card-agency">
                  <p className="price-badge price-badge-agency" data-i18n="agencyBadge">Agency</p>
                  <p className="plan" data-i18n="agencyPlan">Agency</p>
                  <p className="price">$149<span data-i18n="perMonth">/month</span></p>
                  <p className="plan-note" data-i18n="agencyDesc">For teams managing multiple clients at scale.</p>
                  <ul>
                    <li data-i18n="agency1">5 users included (max 15)</li>
                    <li data-i18n="agency2">18&thinsp;000 scans / month (shared pool)</li>
                    <li data-i18n="agency3">6&thinsp;000 SEO audits / month</li>
                    <li data-i18n="agency4">2&thinsp;000 messages / month</li>
                    <li data-i18n="agency5">CSV export + AI scanner + full audit</li>
                    <li data-i18n="agency6">Team notifications</li>
                    <li className="li-seat" data-i18n="agency7">+$19 / extra seat · +2 000 scans/seat</li>
                  </ul>
                  <WaitlistButton plan="AGENCY" trigger="Join waitlist" />
                </article>
              </div>
            </div>
          </section>

          <section id="faq" className="section section-faq">
            <div className="container">
              <h2 data-i18n="faqTitle">FAQ</h2>
              <div className="faq-list">
                <details>
                  <summary data-i18n="faqQ0">Is this a Chrome extension or a web app?</summary>
                  <p data-i18n="faqA0">seoprospector is a Chrome Side Panel extension. It stays open alongside LinkedIn as you browse, so you can capture leads, review audits, and generate messages without switching tabs.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ1">Can I start without a credit card?</summary>
                  <p data-i18n="faqA1">Yes. Free plan access does not require card details.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ2">Is Pro monthly and cancel anytime?</summary>
                  <p data-i18n="faqA2">Yes. Pro is billed monthly and you can cancel renewal anytime.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ3">Do you support agencies with multiple clients?</summary>
                  <p data-i18n="faqA3">Yes. The workflow is designed for agency operators handling multiple opportunities per client.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ3b">How do extra seats work on the Agency plan?</summary>
                  <p data-i18n="faqA3b">The Agency plan includes 5 seats. You can add up to 10 more (max 15 total) at $19/seat/month. Each extra seat also adds 2,000 scans/month to your quota — 32,000 scans/month at max seats.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ4">Where can I find legal and billing policies?</summary>
                  <p data-i18n="faqA4">See Privacy, Terms, and Refund pages from the footer links.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ5">How does lead classification work (HOT / WARM / COLD)?</summary>
                  <p data-i18n="faqA5">Classification combines role signal (decision-maker confidence), SEO status, and business decision logic to prioritize action.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ6">What happens when a company has no website or an inaccessible website?</summary>
                  <p data-i18n="faqA6">The extension flags these cases clearly (No Website / Inaccessible) so outreach can be adapted instead of relying on invalid audit assumptions.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ7">Can I generate AI messages from a specific lead audit?</summary>
                  <p data-i18n="faqA7">Yes. Pro includes AI drafts based on the selected lead, role context, and SEO opportunity level for more relevant outreach.</p>
                </details>
                <details>
                  <summary data-i18n="faqQ8">Do you support exports for lead and SEO operations?</summary>
                  <p data-i18n="faqA8">Yes. You can export lead lists and single SEO audits to CSV for sales operations, reporting, and handoff workflows.</p>
                </details>
              </div>
            </div>
          </section>

          <section className="section final-cta">
            <div className="container final-cta-box">
              <div className="final-cta-copy">
                <p className="final-cta-kicker" data-i18n="finalKicker">From profile activity to booked meetings</p>
                <h2 data-i18n="finalTitle">Build more pipeline this week</h2>
                <p data-i18n="finalText">Start free — no credit card required. Upgrade to Pro or Agency when your outbound is ready to scale.</p>
                <ul className="final-cta-points">
                  <li data-i18n="finalPoint1">Capture leads automatically as you browse LinkedIn — zero manual input.</li>
                  <li data-i18n="finalPoint2">Every account scored CRITICAL / WEAK / OK / NO WEBSITE / SITE_UNREACHABLE instantly.</li>
                  <li data-i18n="finalPoint3">HOT leads at the top. AI message ready in seconds. Send directly from the panel.</li>
                </ul>
              </div>

              <aside className="final-cta-actions">
                <div className="final-cta-plans">
                  <div className="final-plan-chip">
                    <span className="final-plan-label" data-i18n="freePlan">Free</span>
                    <strong>$0</strong><span data-i18n="perMonth">/month</span>
                  </div>
                  <div className="final-plan-chip">
                    <span className="final-plan-label" data-i18n="starterPlan">Starter</span>
                    <strong>$29</strong><span data-i18n="perMonth">/month</span>
                  </div>
                  <div className="final-plan-chip final-plan-chip-pro">
                    <span className="final-plan-label" data-i18n="proPlan">Pro</span>
                    <strong>$59</strong><span data-i18n="perMonth">/month</span>
                  </div>
                  <div className="final-plan-chip">
                    <span className="final-plan-label" data-i18n="agencyPlan">Agency</span>
                    <strong>$149</strong><span data-i18n="perMonth">/month</span>
                  </div>
                </div>
                <div className="hero-cta">
                  <a href="/register" className="btn btn-primary btn-download" data-i18n="finalCta1">Start free trial</a>
                  <a href="https://chromewebstore.google.com/detail/your-extension-id" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" data-i18n="finalCta2">Add to Chrome</a>
                </div>
              </aside>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="container footer-grid">
            <p>&copy; <span id="year">{new Date().getFullYear()}</span> seoprospector</p>
            <nav>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/refund">Refund Policy</a>
              <a href="/contact">Contact</a>
            </nav>
          </div>
        </footer>

        <ScrollToTopBtn />

        <div className="lang-floating" id="langFloating">
          <svg className="lang-globe" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.4"/>
            <ellipse cx="10" cy="10" rx="3.5" ry="8.25" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M1.75 7.5h16.5M1.75 12.5h16.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <button className="lang-btn" id="langBtnEn" data-lang="en" aria-label="English">EN</button>
          <span className="lang-sep">|</span>
          <button className="lang-btn" id="langBtnFr" data-lang="fr" aria-label="Français">FR</button>
        </div>
      </div>
    </div>
  );
}
