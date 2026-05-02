"use client";

import { useState } from "react";

type Lead = {
  id: number;
  name: string;
  seed: string;
  bg: string;
  role: string;
  domain: string;
  type: "hot" | "warm" | "cold";
  score: number;
  issues: number;
  reason: string;
  websiteStatus: string;
  issueList: string[];
};

const LEADS: Lead[] = [
  {
    id: 1, name: "Marc Lambert", seed: "MarcLambert", bg: "b6e3f4",
    role: "1 position", domain: "brightloop.io",
    type: "hot", score: 58, issues: 10,
    reason: "Decision-maker identified and SEO is critical",
    websiteStatus: "Website Ok",
    issueList: ["Robots.txt missing", "Canonical missing", "H1 missing", "Meta description absent", "Schema.org absent", "Thin content detected", "No sitemap.xml", "Title too short", "LCP > 4s", "No HTTPS redirect"],
  },
  {
    id: 2, name: "Sophie Martin", seed: "SophieMartin", bg: "ffd5dc",
    role: "CEO · 3 positions", domain: "acmedigital.com",
    type: "hot", score: 34, issues: 14,
    reason: "Decision-maker identified and SEO is critical",
    websiteStatus: "Website Ok",
    issueList: ["noindex detected", "H1 missing", "H2 missing", "Canonical missing", "Robots.txt blocked", "No sitemap", "Meta description absent", "Schema missing", "Thin content", "Title too short", "LCP > 4s", "No structured data", "Missing alt tags", "Broken internal links"],
  },
  {
    id: 3, name: "Thomas Leroy", seed: "ThomasLeroy", bg: "c0aede",
    role: "Head of Growth · 2 positions", domain: "marketboost.io",
    type: "warm", score: 67, issues: 5,
    reason: "Some SEO issues — not a top priority",
    websiteStatus: "Website Ok",
    issueList: ["Meta description absent", "Schema.org absent", "Title too long", "Image alt tags missing", "LCP > 3s"],
  },
  {
    id: 4, name: "Jean Dupont", seed: "JeanDupont", bg: "d1d4f9",
    role: "Dir. Marketing · 2 positions", domain: "techflow.fr",
    type: "cold", score: 84, issues: 1,
    reason: "Good SEO — low opportunity",
    websiteStatus: "Website Ok",
    issueList: ["Minor: image compression"],
  },
];

const heroGradient = { hot: "linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)", warm: "linear-gradient(135deg,#78350f 0%,#92400e 100%)", cold: "linear-gradient(135deg,#14532d 0%,#166534 100%)" };
const seoBadgeLabel = { hot: "SEO CRITICAL", warm: "SEO WEAK", cold: "SEO OK" };
const statColors = {
  all:  { bg: "rgba(99,102,241,0.10)", color: "#4338ca" },
  hot:  { bg: "rgba(239,68,68,0.10)",  color: "#b91c1c" },
  warm: { bg: "rgba(245,158,11,0.10)", color: "#92400e" },
  cold: { bg: "rgba(16,185,129,0.10)", color: "#065f46" },
};
const kvValColor = { hot: "#dc2626", warm: "#d97706", cold: "#16a34a" };

export function SeoMockDemo() {
  const [selected, setSelected] = useState<Lead | null>(null);

  const hot  = LEADS.filter(l => l.type === "hot").length;
  const warm = LEADS.filter(l => l.type === "warm").length;
  const cold = LEADS.filter(l => l.type === "cold").length;

  return (
    <div className="feat-mock feat-mock--seo" aria-label="SEO demo mockup">
      <div className="feat-mock__bar">
        <span className="feat-mock__dot feat-mock__dot--red"></span>
        <span className="feat-mock__dot feat-mock__dot--yellow"></span>
        <span className="feat-mock__dot feat-mock__dot--green"></span>
        <span className="feat-mock__bar-title">SEO · seoprospector</span>
      </div>

      <div className="smd-shell">

        {/* ── Leads list ── */}
        <div className={`smd-list${selected ? " smd-list--dimmed" : ""}`}>
          {/* Stat bar */}
          <div className="smd-statbar">
            {(["all","hot","warm","cold"] as const).map(k => (
              <div key={k} className="smd-stat-item" style={{ background: statColors[k].bg }}>
                <span className="smd-stat-num" style={{ color: statColors[k].color }}>
                  {k === "all" ? LEADS.length : k === "hot" ? hot : k === "warm" ? warm : cold}
                </span>
                <span className="smd-stat-label" style={{ color: statColors[k].color }}>{k.toUpperCase()}</span>
              </div>
            ))}
          </div>

          {/* Lead cards */}
          <div className="smd-lead-list">
            {LEADS.map(lead => (
              <div
                key={lead.id}
                className={`smd-lead-card smd-lead-card--${lead.type}${selected?.id === lead.id ? " smd-lead-card--selected" : ""}`}
                onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
              >
                <span className="smd-avatar">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.seed}&backgroundColor=${lead.bg}`} alt="" />
                </span>
                <div className="smd-lead-meta">
                  <span className="smd-lead-name">{lead.name}</span>
                  <span className="smd-lead-sub">{lead.role}</span>
                </div>
                <span className={`smd-badge-mini smd-badge-mini--${lead.type}`}>{lead.type.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Drawer ── */}
        <div className={`smd-drawer${selected ? " smd-drawer--open" : ""}`}>
          {selected && (
            <>
              <div className="smd-drawer-handle" aria-hidden="true" />
              {/* Drawer header */}
              <div className="smd-drawer-header">
                <span className="smd-drawer-name">{selected.name}</span>
                <span className={`smd-badge-mini smd-badge-mini--${selected.type}`}>{selected.type.toUpperCase()}</span>
                <button className="smd-drawer-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
              </div>

              <div className="smd-drawer-body">
                {/* Hero */}
                <div className="smd-hero" style={{ background: heroGradient[selected.type] }}>
                  <div className="smd-hero-main">
                    <div className="smd-hero-score-row">
                      <span className="smd-hero-score">{selected.score}</span>
                      <span className="smd-hero-unit">/100</span>
                    </div>
                    <div className="smd-hero-badges">
                      <span className="smd-hero-badge">{seoBadgeLabel[selected.type]}</span>
                      <span className={`smd-hero-badge smd-hero-badge--${selected.type}`}>{selected.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="smd-hero-meta">{selected.issues} SEO issue{selected.issues > 1 ? "s" : ""} detected</div>
                  <div className="smd-hero-reason">{selected.reason}</div>
                </div>

                {/* Override + Rescan */}
                <div className="smd-actions">
                  <button className="smd-btn-soft">Override</button>
                  <button className="smd-btn-soft">Rescan</button>
                </div>

                {/* SEO Snapshot */}
                <div className="smd-section">
                  <div className="smd-section-title">
                    <span className="smd-live-dot"></span>SEO snapshot
                  </div>
                  <div className="smd-kv-grid">
                    <div className="smd-kv-row">
                      <span className="smd-kv-key">Status</span>
                      <span className="smd-kv-val" style={{ color: kvValColor[selected.type] }}>
                        {selected.type === "hot" ? "Critical SEO issues detected" : selected.type === "warm" ? "Weak SEO detected" : "Good SEO"}
                      </span>
                    </div>
                    <div className="smd-kv-row">
                      <span className="smd-kv-key">Score</span>
                      <span className="smd-kv-val" style={{ color: kvValColor[selected.type] }}>{selected.score}/100</span>
                    </div>
                    <div className="smd-kv-row">
                      <span className="smd-kv-key">Detected issues</span>
                      <span className="smd-kv-val" style={{ color: selected.type !== "cold" ? kvValColor[selected.type] : "#16a34a" }}>{selected.issues}</span>
                    </div>
                    <div className="smd-kv-row">
                      <span className="smd-kv-key">Website status</span>
                      <span className="smd-kv-val">{selected.websiteStatus}</span>
                    </div>
                  </div>
                  <div className="smd-drawer-hint">
                    <span>Open SEO to view the full detailed audit.</span>
                    <button className="smd-hint-btn">SEO</button>
                  </div>
                </div>

                {/* Opportunities */}
                <div className="smd-section smd-section--last">
                  <div className="smd-section-title">Opportunities</div>
                  <div className="smd-opp-row">
                    <span className="smd-opp-logo">
                      <img src={`https://www.google.com/s2/favicons?domain=${selected.domain}&sz=32`} alt="" />
                    </span>
                    <span className="smd-opp-name">{selected.domain}</span>
                    <span className="smd-opp-badge">PRIMARY</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!selected && (
            <div className="smd-drawer-empty">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                <path d="M4.5 17c0-2.2 2.1-4 4.7-4s4.8 1.8 4.8 4"/>
                <circle cx="17" cy="10" r="3"/>
                <path d="M14.5 17c0-1.7 1.1-3 2.5-3s2.5 1.3 2.5 3"/>
              </svg>
              <span>Click a lead to view SEO details</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
