type Variant = "leads" | "seo" | "scan" | "reset";

const DEFAULTS: Record<Variant, { tagline: string; sub: string }> = {
  leads: {
    tagline: "Find & convert your ideal prospects",
    sub: "Automate LinkedIn outreach and SEO lead generation — all in one platform.",
  },
  seo: {
    tagline: "Audit any domain in seconds",
    sub: "SEO scores, keyword gaps, and backlink data — then turn insights into qualified leads.",
  },
  scan: {
    tagline: "Scan LinkedIn at scale",
    sub: "Discover, qualify, and enrich profiles automatically. Never miss a high-value prospect.",
  },
  reset: {
    tagline: "Your account is secured",
    sub: "Enterprise-grade encryption protects your data, leads, and team workspace at all times.",
  },
};

function LeadsStage() {
  return (
    <>
      <div className="authChip authChip--tl">
        <span className="authChipDot" style={{ background: "#10b981" }} />
        +47 leads today
      </div>
      <div className="authChip authChip--tr">
        <span className="authChipDot" style={{ background: "#3b82f6" }} />
        94% match rate
      </div>

      <div className="authLeadCardMini">
        <div className="authLeadMiniAvatar">JM</div>
        <div className="authLeadMiniInfo">
          <div className="authLeadMiniName">James Morris</div>
          <div className="authLeadMiniBadge authLeadBadge--warm">WARM</div>
        </div>
      </div>

      <div className="authMockWindow">
        <div className="authMockTitleBar">
          <span className="authMockDot" style={{ background: "#ef4444" }} />
          <span className="authMockDot" style={{ background: "#f59e0b" }} />
          <span className="authMockDot" style={{ background: "#10b981" }} />
          <span className="authMockUrl">app.example.com/leads</span>
        </div>
        <div className="authMockBody">
          <div className="authMockHeader">
            <div>
              <div className="authMockTitle">LinkedIn Leads</div>
              <div className="authMockSub">847 prospects found</div>
            </div>
            <div className="authMockLive">
              <span className="authMockLiveDot" />
              LIVE
            </div>
          </div>

          <div className="authMockLeadRow">
            <div className="authMockAvatar" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>SC</div>
            <div className="authMockRowInfo">
              <div className="authMockRowName">Sarah Chen</div>
              <div className="authMockRowTitle">Head of Marketing · TechFlow</div>
            </div>
            <div className="authMockRowRight">
              <div className="authMockScore" style={{ color: "#6ee7b7" }}>87</div>
              <div className="authLeadBadge authLeadBadge--hot">HOT</div>
            </div>
          </div>

          <div className="authMockLeadRow">
            <div className="authMockAvatar" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>MR</div>
            <div className="authMockRowInfo">
              <div className="authMockRowName">Marcus Roy</div>
              <div className="authMockRowTitle">VP Sales · DevStack</div>
            </div>
            <div className="authMockRowRight">
              <div className="authMockScore" style={{ color: "#fcd34d" }}>74</div>
              <div className="authLeadBadge authLeadBadge--warm">WARM</div>
            </div>
          </div>

          <div className="authMockLeadRow" style={{ borderBottom: "none" }}>
            <div className="authMockAvatar" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>AL</div>
            <div className="authMockRowInfo">
              <div className="authMockRowName">Anna Liu</div>
              <div className="authMockRowTitle">CMO · GrowthHQ</div>
            </div>
            <div className="authMockRowRight">
              <div className="authMockScore" style={{ color: "#6ee7b7" }}>92</div>
              <div className="authLeadBadge authLeadBadge--hot">HOT</div>
            </div>
          </div>

          <div className="authMockFooter">
            <span>Showing 3 of 847 leads</span>
            <span style={{ color: "#3b82f6", fontWeight: 600 }}>View all →</span>
          </div>
        </div>
      </div>
    </>
  );
}

function SeoStage() {
  return (
    <>
      <div className="authChip authChip--tl">
        <span className="authChipDot" style={{ background: "#10b981" }} />
        Score: 87/100
      </div>
      <div className="authChip authChip--tr">
        <span className="authChipDot" style={{ background: "#f59e0b" }} />
        3 issues found
      </div>

      <div className="authLeadCardMini">
        <div className="authLeadMiniAvatar" style={{ background: "linear-gradient(135deg, #ef4444, #f97316)" }}>SX</div>
        <div className="authLeadMiniInfo">
          <div className="authLeadMiniName">startupx.co</div>
          <div className="authLeadMiniBadge authLeadBadge--hot">POOR</div>
        </div>
      </div>

      <div className="authMockWindow">
        <div className="authMockTitleBar">
          <span className="authMockDot" style={{ background: "#ef4444" }} />
          <span className="authMockDot" style={{ background: "#f59e0b" }} />
          <span className="authMockDot" style={{ background: "#10b981" }} />
          <span className="authMockUrl">app.example.com/seo-audit</span>
        </div>
        <div className="authMockBody">
          <div className="authMockGaugeRow">
            {/* circumference r=22 → 2π×22≈138.2 ; 87% → dashoffset=138.2×0.13≈18 */}
            <svg className="authMockGauge" viewBox="0 0 56 56">
              <circle className="authMockGaugeBg" cx="28" cy="28" r="22" />
              <circle
                className="authMockGaugeFill"
                cx="28" cy="28" r="22"
                stroke="#10b981"
                strokeDasharray="138.2"
                strokeDashoffset="18"
                transform="rotate(-90 28 28)"
              />
              <text x="28" y="29" className="authMockGaugeVal">87</text>
            </svg>
            <div>
              <div className="authMockTitle">techflow.io</div>
              <div className="authMockSub">Domain SEO Audit</div>
              <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
                <span className="authMockTag authMockTag--green">A Grade</span>
                <span className="authMockTag authMockTag--amber">3 issues</span>
              </div>
            </div>
          </div>

          <div className="authMockMetricRow">
            <span className="authMockMetricLabel">Page Speed</span>
            <div className="authMockMetricBar"><div className="authMockMetricFill" style={{ width: "94%", background: "#10b981" }} /></div>
            <span className="authMockMetricVal">94</span>
          </div>
          <div className="authMockMetricRow">
            <span className="authMockMetricLabel">Backlinks</span>
            <div className="authMockMetricBar"><div className="authMockMetricFill" style={{ width: "78%", background: "#3b82f6" }} /></div>
            <span className="authMockMetricVal">78</span>
          </div>
          <div className="authMockMetricRow">
            <span className="authMockMetricLabel">Keywords</span>
            <div className="authMockMetricBar"><div className="authMockMetricFill" style={{ width: "96%", background: "#8b5cf6" }} /></div>
            <span className="authMockMetricVal">96</span>
          </div>

          <div className="authMockFooter">
            <span>14k keywords tracked</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>+2 opps →</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ScanStage() {
  return (
    <>
      <div className="authChip authChip--tl">
        <span className="authChipDot authChipDot--pulse" style={{ background: "#3b82f6" }} />
        Scanning…
      </div>
      <div className="authChip authChip--tr">
        <span className="authChipDot" style={{ background: "#10b981" }} />
        847 / 1,200
      </div>

      <div className="authLeadCardMini">
        <div className="authLeadMiniAvatar" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>EC</div>
        <div className="authLeadMiniInfo">
          <div className="authLeadMiniName">Emma Clarke</div>
          <div className="authLeadMiniBadge" style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.35)" }}>MATCH</div>
        </div>
      </div>

      <div className="authMockWindow">
        <div className="authMockTitleBar">
          <span className="authMockDot" style={{ background: "#ef4444" }} />
          <span className="authMockDot" style={{ background: "#f59e0b" }} />
          <span className="authMockDot" style={{ background: "#10b981" }} />
          <span className="authMockUrl">app.example.com/scan</span>
        </div>
        <div className="authMockBody">
          <div className="authMockHeader">
            <div>
              <div className="authMockTitle">LinkedIn Scanner</div>
              <div className="authMockSub">Analyzing profiles…</div>
            </div>
            <div className="authMockLive">
              <span className="authMockLiveDot" />
              LIVE
            </div>
          </div>
          <div className="authMockProgress">
            <div className="authMockProgressFill" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.28)", marginBottom: 10, marginTop: 3 }}>
            <span>847 scanned</span>
            <span>1,200 total</span>
          </div>

          <div className="authMockScanRow">
            <div className="authMockAvatar" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>EC</div>
            <div className="authMockRowInfo">
              <div className="authMockRowName">Emma Clarke</div>
              <div className="authMockRowTitle">VP Sales · CloudBase</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="authMockScanRow">
            <div className="authMockAvatar" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>MR</div>
            <div className="authMockRowInfo">
              <div className="authMockRowName">Marcus Roy</div>
              <div className="authMockRowTitle">CTO · DevStack</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="authMockScanRow" style={{ borderBottom: "none" }}>
            <div className="authMockAvatar" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>AL</div>
            <div className="authMockRowInfo">
              <div className="authMockRowName">Anna Liu</div>
              <div className="authMockRowTitle">CMO · GrowthHQ</div>
            </div>
            <div className="authScanSpinner" />
          </div>

          <div className="authMockScanFooter">
            <div className="authMockScanStat">
              <div className="authMockScanStatVal" style={{ color: "#6ee7b7" }}>412</div>
              <div className="authMockScanStatLabel">Matched</div>
            </div>
            <div className="authMockScanStat">
              <div className="authMockScanStatVal" style={{ color: "#fcd34d" }}>283</div>
              <div className="authMockScanStatLabel">Filtered</div>
            </div>
            <div className="authMockScanStat">
              <div className="authMockScanStatVal" style={{ color: "rgba(255,255,255,0.45)" }}>353</div>
              <div className="authMockScanStatLabel">Queued</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ResetStage() {
  return (
    <>
      <div className="authChip authChip--tl">
        <span className="authChipDot" style={{ background: "#10b981" }} />
        256-bit AES
      </div>
      <div className="authChip authChip--tr">
        <span className="authChipDot" style={{ background: "#6366f1" }} />
        SOC 2 ready
      </div>

      <div className="authLeadCardMini">
        <div className="authLeadMiniAvatar" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="authLeadMiniInfo">
          <div className="authLeadMiniName">Access secured</div>
          <div className="authLeadMiniBadge" style={{ background: "rgba(16,185,129,0.25)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.35)" }}>OK</div>
        </div>
      </div>

      <div className="authMockWindow">
        <div className="authMockTitleBar">
          <span className="authMockDot" style={{ background: "#ef4444" }} />
          <span className="authMockDot" style={{ background: "#f59e0b" }} />
          <span className="authMockDot" style={{ background: "#10b981" }} />
          <span className="authMockUrl">app.example.com — secured</span>
        </div>
        <div className="authMockBody">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 14px" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #1e2a5e, #2d3a8a)", border: "1px solid rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="authMockTitle" style={{ textAlign: "center", marginBottom: 3 }}>Account Protected</div>
            <div className="authMockSub" style={{ textAlign: "center" }}>Enterprise-grade encryption</div>
          </div>

          <div className="authMockSecRow">
            <div className="authMockSecIcon" style={{ background: "rgba(16,185,129,0.14)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="authMockSecLabel">Data encrypted at rest &amp; in transit</span>
          </div>
          <div className="authMockSecRow">
            <div className="authMockSecIcon" style={{ background: "rgba(99,102,241,0.14)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="authMockSecLabel">Multi-factor authentication ready</span>
          </div>
          <div className="authMockSecRow">
            <div className="authMockSecIcon" style={{ background: "rgba(245,158,11,0.14)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="authMockSecLabel">Session tokens auto-expire</span>
          </div>

          <div className="authMockFooter">
            <span>Last login: just now</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>✓ Verified</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function AuthBrandPanel({
  tagline,
  sub,
  dot = 0,
  variant = "leads",
}: {
  tagline?: string;
  sub?: string;
  dot?: number;
  variant?: Variant;
}) {
  const d = DEFAULTS[variant];
  return (
    <div className="authBrandSide">
      <div className="authBrandOrb authBrandOrb--1" />
      <div className="authBrandOrb authBrandOrb--2" />

      <div className="authBrandStage">
        {variant === "leads" && <LeadsStage />}
        {variant === "seo"   && <SeoStage />}
        {variant === "scan"  && <ScanStage />}
        {variant === "reset" && <ResetStage />}
      </div>

      <div className="authBrandTagline">
        <h2>{tagline ?? d.tagline}</h2>
        <p>{sub ?? d.sub}</p>
      </div>

      <div className="authBrandDots">
        {[0, 1, 2].map(i => (
          <span key={i} className={`authBrandDot${i === dot ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
