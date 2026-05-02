"use client";

import { useState } from "react";

export function ScanMockDemo({ defaultQbOpen = false }: { defaultQbOpen?: boolean } = {}) {
  const [tab,         setTab]         = useState<"pipeline" | "how">("pipeline");
  const [qbOpen,      setQbOpen]      = useState(defaultQbOpen);
  const [qbQuery,     setQbQuery]     = useState("");

  return (
    <div className="feat-mock feat-mock--scan">
      <div className="feat-mock__bar">
        <span className="feat-mock__dot feat-mock__dot--red"></span>
        <span className="feat-mock__dot feat-mock__dot--yellow"></span>
        <span className="feat-mock__dot feat-mock__dot--green"></span>
        <span className="feat-mock__bar-title">Scan · seoprospector</span>
      </div>
      <div className={`feat-mock__body sm-body${qbOpen ? " sm-body--qb-open" : ""}`}>

        {/* Tab bar */}
        <div className="sm-tabs">
          <button
            type="button"
            className={`sm-tab${tab === "pipeline" ? " sm-tab--active" : ""}`}
            onClick={() => setTab("pipeline")}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="12" height="12" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Pipeline
          </button>
          <button
            type="button"
            className={`sm-tab${tab === "how" ? " sm-tab--active" : ""}`}
            onClick={() => setTab("how")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
            How it works
          </button>
        </div>

        <div className="sm-panel-scroll">
        {/* Pipeline panel */}
        {tab === "pipeline" && (
          <div key="pipeline" className="sm-panel sm-panel--in">
            <div className="sm-kpi-row">
              <div className="sm-kpi-card">
                <span className="sm-kpi-label">Status</span>
                <span className="sm-badge--running">RUNNING</span>
              </div>
              <div className="sm-kpi-card">
                <span className="sm-kpi-label">Monthly limit</span>
                <span className="sm-kpi-value">3 000</span>
              </div>
            </div>

            <div className="sm-activity-section">
              <div className="sm-activity-head">
                <span className="sm-activity-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" aria-hidden="true">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  Activity
                </span>
                <span className="sm-activity-hint">Latest events</span>
              </div>
              <div className="sm-log">
                <div className="sm-log-item">
                  <span className="sm-log-icon sm-log-icon--done">✓</span>
                  <span className="sm-log-text">Sophie Martin — CEO · acmedigital.com</span>
                  <span className="sm-log-badge sm-log-badge--critical">CRITICAL</span>
                </div>
                <div className="sm-log-item">
                  <span className="sm-log-icon sm-log-icon--done">✓</span>
                  <span className="sm-log-text">Thomas Leroy — Head of Growth · marketboost.io</span>
                  <span className="sm-log-badge sm-log-badge--weak">WEAK</span>
                </div>
                <div className="sm-log-item">
                  <span className="sm-log-icon sm-log-icon--done">✓</span>
                  <span className="sm-log-text">Jean Dupont — Dir. Marketing · techflow.fr</span>
                  <span className="sm-log-badge sm-log-badge--ok">OK</span>
                </div>
                <div className="sm-log-item sm-log-item--pending">
                  <span className="sm-log-icon sm-log-icon--spin">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="9" height="9"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
                  </span>
                  <span className="sm-log-text" style={{ color: "#94a3b8" }}>Scanning next profile…</span>
                </div>
              </div>
            </div>

            <div className="sm-footer">
              <span>This month</span><strong>847 / 3 000</strong>
            </div>
          </div>
        )}

        {/* How it works panel */}
        {tab === "how" && (
          <div key="how" className="sm-panel sm-panel--in">
            <button type="button" className="sm-best-practices-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" aria-hidden="true">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
              </svg>
              Best Practices
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10" style={{ marginLeft: "auto" }} aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <div className="sm-how-list">
              <details className="sm-how-item">
                <summary className="sm-how-summary">
                  <div className="sm-how-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                  </div>
                  <span className="sm-how-title">Browse LinkedIn profiles manually</span>
                  <svg className="sm-how-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </summary>
                <div className="sm-how-desc">Navigate normally — the extension captures profiles in the background as you scroll.</div>
              </details>

              <details className="sm-how-item">
                <summary className="sm-how-summary">
                  <div className="sm-how-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </div>
                  <span className="sm-how-title">Automatic scoring &amp; SEO audit</span>
                  <svg className="sm-how-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </summary>
                <div className="sm-how-desc">
                  SEO health score 0–100 — lower score = more issues = bigger opportunity.
                  <span className="sm-score-grid">
                    <span><span className="sm-score-dot sm-score-dot--red"></span><strong style={{ color: "#ef4444" }}>0–39</strong> · Critical → <strong>HOT</strong></span>
                    <span><span className="sm-score-dot sm-score-dot--amber"></span><strong style={{ color: "#f59e0b" }}>40–64</strong> · Weak SEO → <strong>WARM</strong></span>
                    <span><span className="sm-score-dot sm-score-dot--green"></span><strong style={{ color: "#10b981" }}>65–100</strong> · Good SEO → <strong>COLD</strong></span>
                  </span>
                  <span className="sm-override-note">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <strong>noindex</strong> or blocked <strong>robots.txt</strong> → always CRITICAL.
                  </span>
                </div>
              </details>

              <details className="sm-how-item">
                <summary className="sm-how-summary">
                  <div className="sm-how-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </div>
                  <span className="sm-how-title">Outreach via AI messages</span>
                  <svg className="sm-how-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </summary>
                <div className="sm-how-desc">Generate personalised LinkedIn messages using the SEO audit as context.</div>
              </details>

              <details className="sm-how-item">
                <summary className="sm-how-summary">
                  <div className="sm-how-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </div>
                  <span className="sm-how-title">Monthly scan limit</span>
                  <svg className="sm-how-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </summary>
                <div className="sm-how-desc">Your plan includes a monthly scan quota. Pausing stops captures without losing your leads.</div>
              </details>
            </div>
          </div>
        )}
        </div>{/* end sm-panel-scroll */}

        {/* ── Query Builder panel ── */}
        {qbOpen && (
          <div className="sm-qb-panel sm-panel--in">
            <div className="sm-qb-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3a86ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <span className="sm-qb-title">LinkedIn Query Builder</span>
              <button className="sm-qb-linkedin" type="button">
                <svg viewBox="0 0 24 24" fill="#fff" width="11" height="11"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
              </button>
              <button className="sm-qb-close" onClick={() => setQbOpen(false)} type="button">×</button>
            </div>
            <div className="sm-qb-sub">Generate your query with AI</div>
            <div className="sm-qb-field">
              <label className="sm-qb-label">Describe your ideal prospect</label>
              <textarea className="sm-qb-textarea" rows={3} placeholder="Ex: CEO or founder of a SMB in France, B2B sector, with a website not optimized for SEO…" />
            </div>
            <div className="sm-qb-field">
              <label className="sm-qb-label">People query</label>
              <textarea className="sm-qb-textarea sm-qb-textarea--output" rows={2} readOnly
                value={qbQuery}
                placeholder="Generated people query"
              />
            </div>
            <div className="sm-qb-actions">
              <button className="sm-qb-btn-ai" type="button" onClick={() => setQbQuery('(CEO OR Founder OR PDG) AND (SEO OR "digital marketing") AND (France OR Belgique)')}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd"/></svg>
                Generate with AI
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── FAB ── */}
      <button className={`sm-fab${qbOpen ? " sm-fab--open" : ""}`} type="button" onClick={() => setQbOpen(v => !v)} aria-label="Toggle Query Builder">
        <span className="sm-fab-text">Query Builder</span>
        <span className="sm-fab-dot">
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.7"/>
            <circle cx="12" cy="12" r="2.4" fill="currentColor"/>
            <path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          <span className="sm-fab-star sm-fab-star--a">✦</span>
          <span className="sm-fab-star sm-fab-star--b">✦</span>
        </span>
      </button>
    </div>
  );
}
