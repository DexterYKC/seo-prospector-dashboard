import type { Metadata } from "next";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export const metadata: Metadata = {
  title: "Changelog | seoprospector",
  description: "What's new in seoprospector — latest releases, improvements, and bug fixes.",
};

const entries = [
  {
    version: "v1.2.0",
    date: "March 2026",
    title: "SEO audit depth & PageSpeed insights",
    tags: ["new", "improve"],
    items: [
      { type: "new",     text: "Best practices score — PageSpeed best-practices metric now displayed alongside performance and SEO scores" },
      { type: "new",     text: "Passed checks — each audit now lists what the site does well (HTTPS, viewport, server-side rendering, favicon…)" },
      { type: "new",     text: "Analysis date — audit panel shows when the PageSpeed data was last collected" },
      { type: "improve", text: "Passed checks are displayed in the language selected by the user (EN / FR)" },
    ],
  },
  {
    version: "v1.0.2",
    date: "December 2025",
    title: "Agency mode & seat management",
    tags: ["new", "improve"],
    items: [
      { type: "new",     text: "Agency plan — shared dashboard, seat management and per-seat pricing at $19/extra user" },
      { type: "new",     text: "Agency onboarding — guided setup flow for new agency owners" },
      { type: "new",     text: "Member dashboard — agency owners can view per-seat KPIs and lead lists" },
      { type: "new",     text: "Team invite — email invite with signed link valid 7 days, auto-join on register" },
      { type: "improve", text: "Sidebar — real-time seat count and add-user shortcut" },
    ],
  },
  {
    version: "v1.0.1",
    date: "November 2025",
    title: "V2 Dashboard & design system",
    tags: ["new", "improve", "fix"],
    items: [
      { type: "new",     text: "Redesigned dashboard — KPI cards, Quality Score indicator (STRONG / STEADY / EARLY) and lead breakdown" },
      { type: "new",     text: "Design system — Manrope + JetBrains Mono, CSS variables, dark sidebar" },
      { type: "new",     text: "Messages page — AI message generation with tone selector and Send Now" },
      { type: "new",     text: "SEO page — per-lead audit view with opportunity selector and CSV export" },
      { type: "improve", text: "Lead list — search, filter by type (HOT / WARM / COLD), badge counters" },
    ],
  },
  {
    version: "v1.0.0",
    date: "October 2025",
    title: "Initial release",
    tags: ["new"],
    items: [
      { type: "new", text: "Chrome Side Panel extension (Manifest V3) — passive LinkedIn profile capture" },
      { type: "new", text: "SEO scoring engine — CRITICAL / WEAK / OK / NO WEBSITE / SITE_UNREACHABLE statuses" },
      { type: "new", text: "Lead classification — HOT / WARM / COLD based on role confidence and SEO urgency" },
      { type: "new", text: "Assistant Scan v1 — AI-generated LinkedIn search queries (PRO)" },
      { type: "new", text: "Bilingual panel — EN / FR with dark mode toggle" },
      { type: "new", text: "CSV export — leads list and individual SEO audits" },
      { type: "new", text: "Web dashboard — leads, SEO audits, messages, account and agency pages" },
    ],
  },
];

const TAG_LABELS: Record<string, string> = {
  new:     "New",
  fix:     "Fix",
  improve: "Improved",
  infra:   "Infra",
};

export default function ChangelogPage() {
  return (
    <div className="detail-page">
      <MarketingNav />

      <main className="detail-main">

          <section className="detail-hero" style={{ textAlign: "center", padding: "120px 24px 100px" }}>
            <p className="detail-kicker">Changelog</p>
            <h1 style={{ margin: "0 auto" }}>What&apos;s new</h1>
            <p className="detail-lead" style={{ maxWidth: 520, margin: "0 auto" }}>
              Every feature added, every score improved, every fix shipped — nothing left out.
            </p>
          </section>

        <div className="changelog-section">
        <div className="container">
          <div className="changelog-wrap">
            {entries.map((entry) => (
              <article key={entry.version} className="changelog-entry">

                <div className="changelog-meta">
                  <div className="changelog-version">{entry.version}</div>
                  <div className="changelog-date">{entry.date}</div>
                </div>

                <div className="changelog-body">
                  <h2>{entry.title}</h2>

                  <div className="changelog-tags">
                    {entry.tags.map((tag) => (
                      <span key={tag} className={`cl-tag cl-tag--${tag}`}>
                        {TAG_LABELS[tag] ?? tag}
                      </span>
                    ))}
                  </div>

                  <ul>
                    {entry.items.map((item, i) => (
                      <li key={i}>
                        <strong className={`cl-tag cl-tag--${item.type}`} style={{ marginRight: 8 }}>
                          {TAG_LABELS[item.type]}
                        </strong>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>

              </article>
            ))}
          </div>
        </div>
        </div>

      </main>

      <MarketingFooter />
    </div>
  );
}
