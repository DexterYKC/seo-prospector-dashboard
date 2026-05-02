import NavScript from "./NavScript";
import { NavAuthButtons } from "./NavAuthButtons";

export function MarketingNav() {
  return (
    <>
      <NavScript />
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
            <a href="/home#faq" data-i18n="navFaq">FAQ</a>
            <a href="/blog" data-i18n="navBlog">Blog</a>
            <a href="/contact" data-i18n="navContact">Contact</a>
          </nav>

          <div className="nav-auth-wrap">
            <NavAuthButtons />
          </div>

          <button className="nav-burger" id="navBurger" aria-label="Menu" aria-expanded="false">
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
            <span className="nav-burger-bar" />
          </button>
        </div>
      </header>

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
    </>
  );
}
