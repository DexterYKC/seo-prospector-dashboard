"use client";

const STEPS = [
  {
    num: "1",
    label: "Install the extension",
    desc: "Add seoprospector to Chrome from the Web Store",
  },
  {
    num: "2",
    label: "Browse LinkedIn profiles",
    desc: "The extension captures each profile visit automatically",
  },
  {
    num: "3",
    label: "Leads appear here",
    desc: "Scored, ranked, and ready to convert into clients",
  },
];

export function ExtensionBanner() {
  return (
    <article className="card extensionBanner">
      <div className="extensionBannerBody">
        <div className="extensionBannerEmoji">🚀</div>
        <div style={{ flex: 1 }}>
          <div className="extensionBannerTitle">
            Get started — capture your first lead in minutes
          </div>
          <div className="extensionBannerSub">
            Your dashboard is empty. Install the Chrome extension to start capturing LinkedIn prospects automatically.
          </div>

          <div className="extensionSteps">
            {STEPS.map((s) => (
              <div key={s.num} className="extensionStep">
                <div className="extensionStepNum">{s.num}</div>
                <div>
                  <div className="extensionStepLabel">{s.label}</div>
                  <div className="extensionStepDesc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn primary"
            >
              Install Chrome Extension →
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              Open LinkedIn
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
