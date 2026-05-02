"use client";

import { useState } from "react";

type SeoLead = {
  id: number;
  name: string;
  seed: string;
  bg: string;
  domain: string;
  score: number;
  status: "critical" | "weak" | "ok";
  issuesCount: number;
  reason: string;
  category: string;
  metrics: { label: string; value: string; color?: string }[];
  issues: {
    critical: string[];
    warning: string[];
    info: string[];
  };
};

const LEADS: SeoLead[] = [
  {
    id: 1, name: "Marc Lambert", seed: "MarcLambert", bg: "b6e3f4",
    domain: "brightloop.io", score: 58, status: "critical", issuesCount: 10,
    reason: "Decision-maker identified and SEO is critical",
    category: "ECOMMERCE",
    metrics: [
      { label: "Technical score", value: "58/100", color: "#dc2626" },
      { label: "Website status", value: "Website Ok" },
      { label: "Detection source", value: "Html" },
      { label: "Analysed on", value: "14/04/2026" },
    ],
    issues: {
      critical: ["H1 Tag Missing", "LCP: 32.8s — Very Slow (Target <2.5s)"],
      warning: ["Robots.txt Not Found", "Canonical Tag Missing", "Sitemap.xml Not Found", "Very Thin Content — ~10 Words", "Mobile Performance: 59/100 — Slow"],
      info: ["Title Too Long — 81 chars (Max 65)", "Meta Description Too Long — 242 chars", "No H2 — Flat Content Structure"],
    },
  },
  {
    id: 2, name: "Sophie Martin", seed: "SophieMartin", bg: "ffd5dc",
    domain: "acmedigital.com", score: 34, status: "critical", issuesCount: 14,
    reason: "Decision-maker identified and SEO is critical",
    category: "AGENCY",
    metrics: [
      { label: "Technical score", value: "34/100", color: "#dc2626" },
      { label: "Website status", value: "Website Ok" },
      { label: "Detection source", value: "Html" },
      { label: "Analysed on", value: "14/04/2026" },
    ],
    issues: {
      critical: ["noindex Detected", "H1 Tag Missing", "H2 Tag Missing", "Robots.txt Blocked"],
      warning: ["Canonical Tag Missing", "Sitemap.xml Not Found", "Meta Description Missing", "Schema Markup Missing", "Insufficient Content"],
      info: ["Title Too Short — 18 chars", "No Favicon", "Images Missing Alt Tags", "Analytics Not Detected", "No HTTPS Redirect"],
    },
  },
  {
    id: 3, name: "Thomas Leroy", seed: "ThomasLeroy", bg: "c0aede",
    domain: "marketboost.io", score: 67, status: "weak", issuesCount: 5,
    reason: "Some SEO issues — moderate opportunity",
    category: "SAAS",
    metrics: [
      { label: "Technical score", value: "67/100", color: "#d97706" },
      { label: "Website status", value: "Website Ok" },
      { label: "Detection source", value: "Html" },
      { label: "Analysed on", value: "14/04/2026" },
    ],
    issues: {
      critical: [],
      warning: ["Meta Description Missing", "Schema Markup Missing", "Title Too Long — 72 chars", "Images Missing Alt Tags", "LCP: 3.2s — Slow"],
      info: [],
    },
  },
  {
    id: 4, name: "Jean Dupont", seed: "JeanDupont", bg: "d1d4f9",
    domain: "techflow.fr", score: 84, status: "ok", issuesCount: 1,
    reason: "Good SEO — low opportunity",
    category: "B2B",
    metrics: [
      { label: "Technical score", value: "84/100", color: "#16a34a" },
      { label: "Website status", value: "Website Ok" },
      { label: "Detection source", value: "Html" },
      { label: "Analysed on", value: "14/04/2026" },
    ],
    issues: {
      critical: [],
      warning: [],
      info: ["Image Compression Not Optimized"],
    },
  },
];

const heroGrad = {
  critical: "linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)",
  weak:     "linear-gradient(135deg,#78350f 0%,#92400e 100%)",
  ok:       "linear-gradient(135deg,#14532d 0%,#166534 100%)",
};
const scoreBubbleColor = { critical: "#ef4444", weak: "#f59e0b", ok: "#10b981" };
const seoBadgeLabel = { critical: "SEO CRITICAL", weak: "SEO WEAK", ok: "SEO OK" };
const statColors = {
  all:      { bg: "rgba(99,102,241,0.10)", color: "#4338ca" },
  critical: { bg: "rgba(239,68,68,0.10)",  color: "#b91c1c" },
  weak:     { bg: "rgba(245,158,11,0.10)", color: "#92400e" },
  ok:       { bg: "rgba(16,185,129,0.10)", color: "#065f46" },
};

export function SeoAuditMockDemo() {
  const [selected, setSelected] = useState<SeoLead | null>(null);

  const critical = LEADS.filter(l => l.status === "critical").length;
  const weak     = LEADS.filter(l => l.status === "weak").length;
  const ok       = LEADS.filter(l => l.status === "ok").length;

  return (
    <div className="feat-mock feat-mock--seo" aria-label="SEO audit demo">
      <div className="feat-mock__bar">
        <span className="feat-mock__dot feat-mock__dot--red"></span>
        <span className="feat-mock__dot feat-mock__dot--yellow"></span>
        <span className="feat-mock__dot feat-mock__dot--green"></span>
        <span className="feat-mock__bar-title">SEO · seoprospector</span>
      </div>

      <div className="smd-shell">
        {/* ── SEO list ── */}
        <div className={`smd-list${selected ? " smd-list--dimmed" : ""}`}>

          {/* Stat bar */}
          <div className="smd-statbar">
            {(["all","critical","weak","ok"] as const).map(k => (
              <div key={k} className="smd-stat-item" style={{ background: statColors[k].bg }}>
                <span className="smd-stat-num" style={{ color: statColors[k].color }}>
                  {k === "all" ? LEADS.length : k === "critical" ? critical : k === "weak" ? weak : ok}
                </span>
                <span className="smd-stat-label" style={{ color: statColors[k].color }}>
                  {k.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Section title */}
          <div className="saud-list-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <path d="M4 18.5h16"/><path d="M7 16v-3.5M12 16V8.5M17 16v-5"/><path d="M6 9.5l4-3 4 2 4-3"/>
            </svg>
            SEO audits
          </div>

          {/* SEO audit cards */}
          <div className="smd-lead-list">
            {LEADS.map(lead => (
              <div
                key={lead.id}
                className={`saud-card saud-card--${lead.status}${selected?.id === lead.id ? " saud-card--selected" : ""}`}
                onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
              >
                <span className="smd-avatar">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.seed}&backgroundColor=${lead.bg}`} alt="" />
                </span>
                <div className="smd-lead-meta">
                  <span className="smd-lead-name">{lead.name}</span>
                  <span className="saud-domain">{lead.domain}</span>
                  <span className={`saud-status-badge saud-status-badge--${lead.status}`}>{seoBadgeLabel[lead.status]}</span>
                </div>
                <div className="saud-score-bubble" style={{ background: scoreBubbleColor[lead.status] }}>
                  {lead.score}
                </div>
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
              <div className="saud-drawer-header">
                <span className="smd-drawer-name">{selected.name}</span>
                <span className="saud-drawer-domain">{selected.domain}</span>
                <button className="smd-drawer-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
              </div>

              <div className="smd-drawer-body">
                {/* Hero */}
                <div className="smd-hero" style={{ background: heroGrad[selected.status] }}>
                  <div className="smd-hero-main">
                    <div className="smd-hero-score-row">
                      <span className="smd-hero-score">{selected.score}</span>
                      <span className="smd-hero-unit">/100</span>
                    </div>
                    <div className="smd-hero-badges">
                      <span className="smd-hero-badge">{seoBadgeLabel[selected.status]}</span>
                      <span className="smd-hero-badge">{selected.category}</span>
                    </div>
                  </div>
                  <div className="smd-hero-meta">{selected.issuesCount} SEO issue{selected.issuesCount > 1 ? "s" : ""} detected</div>
                  <div className="smd-hero-reason">{selected.reason}</div>
                </div>

                {/* Key metrics */}
                <div className="smd-section">
                  <div className="smd-section-title">
                    <span className="smd-live-dot"></span>Key metrics
                  </div>
                  <div className="smd-kv-grid">
                    {selected.metrics.map((m, i) => (
                      <div key={i} className="smd-kv-row">
                        <span className="smd-kv-key">{m.label}</span>
                        <span className="smd-kv-val" style={m.color ? { color: m.color, fontWeight: 700 } : {}}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detected issues */}
                {selected.issuesCount > 0 && (
                  <div className="smd-section">
                    <div className="smd-section-title" style={{ justifyContent: "space-between" }}>
                      <span style={{ display:"flex", alignItems:"center" }}>
                        <span className="smd-live-dot" style={{ background:"#ef4444" }}></span>Detected issues
                      </span>
                      <span className="smd-section-badge smd-section-badge--bad">{selected.issuesCount}</span>
                    </div>

                    {selected.issues.critical.length > 0 && (
                      <div className="saud-issue-group">
                        <div className="saud-issue-group-label">
                          <span className="saud-issue-dot" style={{ background:"#ef4444" }}></span>
                          <span className="saud-issue-group-text" style={{ color:"#dc2626" }}>CRITICAL ({selected.issues.critical.length})</span>
                        </div>
                        {selected.issues.critical.map((issue, i) => (
                          <div key={i} className="saud-issue-row">
                            <span className="saud-issue-bullet" style={{ background:"#ef4444" }}></span>
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}

                    {selected.issues.warning.length > 0 && (
                      <div className="saud-issue-group">
                        <div className="saud-issue-group-label">
                          <span className="saud-issue-dot" style={{ background:"#f59e0b" }}></span>
                          <span className="saud-issue-group-text" style={{ color:"#d97706" }}>WARNING ({selected.issues.warning.length})</span>
                        </div>
                        {selected.issues.warning.map((issue, i) => (
                          <div key={i} className="saud-issue-row">
                            <span className="saud-issue-bullet" style={{ background:"#f59e0b" }}></span>
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}

                    {selected.issues.info.length > 0 && (
                      <div className="saud-issue-group">
                        <div className="saud-issue-group-label">
                          <span className="saud-issue-dot" style={{ background:"#3b82f6" }}></span>
                          <span className="saud-issue-group-text" style={{ color:"#2563eb" }}>INFO ({selected.issues.info.length})</span>
                        </div>
                        {selected.issues.info.map((issue, i) => (
                          <div key={i} className="saud-issue-row">
                            <span className="saud-issue-bullet" style={{ background:"#3b82f6" }}></span>
                            {issue}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer actions */}
                <div className="saud-footer-actions">
                  <button className="saud-footer-btn saud-footer-btn--primary">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export CSV
                  </button>
                  <button className="saud-footer-btn saud-footer-btn--ghost">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                    View on site
                  </button>
                </div>
              </div>
            </>
          )}

          {!selected && (
            <div className="smd-drawer-empty">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 18.5h16"/><path d="M7 16v-3.5M12 16V8.5M17 16v-5"/><path d="M6 9.5l4-3 4 2 4-3"/>
              </svg>
              <span>Click a lead to view SEO audit</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
