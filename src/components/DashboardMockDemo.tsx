const QUOTA = [
  { label: "Messages / month", used: 10,  total: 400,  color: "#10b981", pct: 2.5  },
  { label: "SEO exports",      used: 204, total: 1200, color: "#3b82f6", pct: 17   },
  { label: "Scans / month",    used: 847, total: 3000, color: "#3b82f6", pct: 28.2 },
];

const FEATURES = [
  { label: "CSV export",   on: true  },
  { label: "Send now",     on: true  },
  { label: "AI scanner",   on: true  },
  { label: "Agency seats", on: false },
];

export function DashboardMockDemo() {
  return (
    <div className="feat-mock feat-mock--dash" aria-label="Dashboard demo">
      <div className="feat-mock__bar">
        <span className="feat-mock__dot feat-mock__dot--red"></span>
        <span className="feat-mock__dot feat-mock__dot--yellow"></span>
        <span className="feat-mock__dot feat-mock__dot--green"></span>
        <span className="feat-mock__bar-title">Dashboard · seoprospector</span>
      </div>

      <div className="dash-shell">

        {/* ── Summary stats ── */}
        <div className="dash-summary-stats">
          <div className="dash-stat">
            <span className="dash-stat-num dash-stat-num--blue">48</span>
            <span className="dash-stat-label">Captured</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num dash-stat-num--amber">18</span>
            <span className="dash-stat-label">Deciders</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-num dash-stat-num--green">25%</span>
            <span className="dash-stat-label">HOT rate</span>
          </div>
        </div>

        {/* ── Month progress ── */}
        <div className="dash-progress-card">
          <div className="dash-progress-meta">
            <span className="dash-progress-label">Month progress</span>
            <span className="dash-progress-val">2 153 / 3 000 scans left</span>
          </div>
          <div className="dash-metric-bar">
            <span style={{ width: "28.2%", background: "linear-gradient(90deg,#3a86ff,#1b63f0)" }}></span>
          </div>
        </div>

        {/* ── Quota Usage ── */}
        <div className="dash-q-card">
          <div className="dash-q-header">
            <span className="dash-q-title">
              <span className="dash-q-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
                  <circle cx="18" cy="6" r="4" fill="currentColor" stroke="none" opacity="0.3"/>
                  <path d="M18 4v4l2 2" stroke="currentColor"/>
                </svg>
              </span>
              Quota Usage
            </span>
            <span className="dash-q-plan-badge">PRO</span>
          </div>
          <div className="dash-q-body">
            {QUOTA.map((q, i) => (
              <div key={i} className="dash-q-item">
                <div className="dash-q-item-top">
                  <span className="dash-q-item-label">{q.label}</span>
                  <span className="dash-q-item-nums">{q.used.toLocaleString("en")} / {q.total.toLocaleString("en")}</span>
                </div>
                <div className="dash-q-item-bar">
                  <span style={{ width: `${q.pct}%`, background: `linear-gradient(90deg,${q.color},${q.color}cc)` }}></span>
                </div>
                <div className="dash-q-item-bottom">
                  <span className="dash-q-item-left" style={{ color: q.color }}>
                    {(q.total - q.used).toLocaleString("en")} left
                  </span>
                </div>
              </div>
            ))}

            {/* Features */}
            <div className="dash-q-features">
              <p className="dash-q-feat-title">FEATURES</p>
              <div className="dash-q-feat-grid">
                {FEATURES.map((f, i) => (
                  <div key={i} className={`dash-q-feat-item${f.on ? " dash-q-feat-item--on" : ""}`}>
                    <span className="dash-q-feat-check">
                      {f.on
                        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      }
                    </span>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Next reset */}
            <div className="dash-q-reset">
              <span className="dash-q-reset-label">Next reset</span>
              <span className="dash-q-reset-val">01 May 2026</span>
            </div>
          </div>
        </div>

        {/* ── Open App ── */}
        <div className="dash-hub">
          <p className="dash-hub-label">Open app</p>
          <div className="dash-hub-grid">
            <button type="button" className="dash-hub-btn dash-hub-btn--primary">
              <span className="dash-hub-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </span>
              <span className="dash-hub-btn-label">Dashboard</span>
            </button>
            <button type="button" className="dash-hub-btn dash-hub-btn--leads">
              <span className="dash-hub-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </span>
              <span className="dash-hub-btn-label">Leads</span>
            </button>
            <button type="button" className="dash-hub-btn dash-hub-btn--billing">
              <span className="dash-hub-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
              </span>
              <span className="dash-hub-btn-label">Billing</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
