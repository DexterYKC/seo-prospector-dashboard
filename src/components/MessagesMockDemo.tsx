"use client";

import { useState } from "react";

type Lead = {
  id: number; name: string; company: string; seed: string; bg: string;
  msg: string; msgAlt: string;
};

const LEADS: Lead[] = [
  { id: 1, name: "Marc Lambert", company: "Brightloop", seed: "MarcLambert", bg: "b6e3f4",
    msg: "Hi Marc, I noticed brightloop.io has some critical SEO gaps — missing H1 tag and a very slow page load time (32.8s). These are quick wins that could significantly boost your search visibility. Would it make sense to connect this week?",
    msgAlt: "Marc — brightloop.io is leaving visibility on the table. No H1, LCP at 32s, thin content. These are fixable in days, not months. I work with ecommerce brands on exactly this. Worth 20 minutes?" },
  { id: 2, name: "Sophie Martin", company: "Acmedigital", seed: "SophieMartin", bg: "ffd5dc",
    msg: "Hi Sophie, I came across acmedigital.com and spotted some critical SEO issues — no canonical tag, missing H1, and a blocked robots.txt. Given your role as CEO, I think there's a real opportunity here to fix these and improve organic reach. Worth a quick chat?",
    msgAlt: "Sophie, acmedigital.com has a blocked robots.txt and no canonical tags — Google may not be indexing your pages correctly. For an agency CEO, that's a credibility gap worth fixing fast. Happy to share a full audit." },
  { id: 3, name: "Thomas Leroy", company: "Marketboost", seed: "ThomasLeroy", bg: "c0aede",
    msg: "Hi Thomas, marketboost.io has solid fundamentals but a few SEO gaps worth addressing — meta description is missing and schema markup isn't in place. Happy to share a detailed breakdown if useful.",
    msgAlt: "Thomas — marketboost.io scores 67/100. Strong base, but missing meta descriptions and schema markup. Small fixes, measurable lift. If you're running growth for clients, this is worth a look. Want the breakdown?" },
  { id: 4, name: "Jean Dupont", company: "Techflow", seed: "JeanDupont", bg: "d1d4f9",
    msg: "Hi Jean, techflow.fr is well-optimized — great work on the technical side. If you're ever looking to push SEO performance further or explore new growth channels, I'd love to connect.",
    msgAlt: "Jean — techflow.fr is technically solid (84/100). Most competitors aren't. If you're thinking about scaling content or international SEO, that's where the next gains are. Open to a quick call?" },
  { id: 5, name: "Paul G.", company: "Nova Labs", seed: "PaulG", bg: "c0aede",
    msg: "Hi Paul, I noticed novalabs.io is missing some key SEO elements that could be holding back your visibility. Given what you're building at Nova Labs, fixing these could make a real difference. Open to a quick call?",
    msgAlt: "Paul — Nova Labs has a discoverability problem. The product looks strong but the site isn't indexed correctly. In a crowded AI space, SEO is the moat most teams ignore. Happy to show you what I found." },
];

const TONES = ["Professional", "Friendly", "Direct", "Consultative"];

const avatarUrl = (seed: string, bg: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bg}`;

export function MessagesMockDemo() {
  const [open,       setOpen]       = useState(false);
  const [selected,   setSelected]   = useState<Lead>(LEADS[0]);
  const [tone,       setTone]       = useState("Professional");
  const [generating, setGenerating] = useState(false);
  const [useAlt,     setUseAlt]     = useState<Record<number, boolean>>({});

  const pick = (lead: Lead) => { setSelected(lead); setOpen(false); };

  const currentMsg = useAlt[selected.id] ? selected.msgAlt : selected.msg;

  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    setTimeout(() => {
      setUseAlt(prev => ({ ...prev, [selected.id]: !prev[selected.id] }));
      setGenerating(false);
    }, 1400);
  };

  return (
    <div className="feat-mock feat-mock--msg" aria-label="Messages demo">
      <div className="feat-mock__bar">
        <span className="feat-mock__dot feat-mock__dot--red"></span>
        <span className="feat-mock__dot feat-mock__dot--yellow"></span>
        <span className="feat-mock__dot feat-mock__dot--green"></span>
        <span className="feat-mock__bar-title">Messages · seoprospector</span>
      </div>

      <div className="msg-shell">

        {/* ── Lead Picker ── */}
        <div className="msg-picker">
          <div
            className={`msg-picker-trigger${open ? " is-open" : ""}`}
            onClick={() => setOpen(v => !v)}
          >
            <span className="msg-picker-avatar">
              <img src={avatarUrl(selected.seed, selected.bg)} alt="" />
            </span>
            <div className="msg-picker-info">
              <div className="msg-picker-name">{selected.name}</div>
              <div className="msg-picker-sub">{selected.company}</div>
            </div>
            <svg className={`msg-picker-chevron${open ? " is-open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>

          {/* Dropdown */}
          {open && (
            <div className="msg-picker-dropdown">
              {LEADS.map(lead => (
                <div
                  key={lead.id}
                  className={`msg-picker-item${selected.id === lead.id ? " is-selected" : ""}`}
                  onClick={() => pick(lead)}
                >
                  <span className="msg-picker-item-avatar">
                    <img src={avatarUrl(lead.seed, lead.bg)} alt="" />
                  </span>
                  <div className="msg-picker-item-info">
                    <span className="msg-picker-item-name">{lead.name}</span>
                    <span className="msg-picker-item-sub">{lead.company}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Opportunity row ── */}
        <div className="msg-opp-row">
          <span className="msg-opp-label">Opportunity</span>
          <select className="msg-opp-select">
            <option>{selected.company}</option>
          </select>
        </div>

        {/* ── Compose area ── */}
        <div className="msg-compose">
          {/* Tone + hint */}
          <div className="msg-compose-head">
            <div className="msg-tone-wrap">
              <label className="msg-ctx-label">Tone</label>
              <div className="msg-tone-pills">
                {TONES.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`msg-tone-pill${tone === t ? " active" : ""}`}
                    onClick={() => setTone(t)}
                  >{t}</button>
                ))}
              </div>
            </div>
            <span className="msg-edit-hint">Edit before sending</span>
          </div>

          {/* Context input */}
          <div className="msg-ctx-wrap">
            <label className="msg-ctx-label">Context <span className="msg-ctx-optional">(optional)</span></label>
            <textarea className="msg-ctx-area" rows={2} placeholder="e.g. focus on SEO issues, keep it under 300 chars…" readOnly />
          </div>

          {/* Message textarea */}
          <textarea
            className={`msg-textarea${generating ? " msg-textarea--generating" : ""}`}
            value={generating ? "" : currentMsg}
            readOnly
            placeholder={generating ? "Generating…" : undefined}
          />

          {/* Buttons */}
          <div className="msg-btn-row">
            <button type="button" className="msg-btn msg-btn--copy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </button>
            <button type="button" className={`msg-btn msg-btn--ai${generating ? " msg-btn--generating" : ""}`} onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <span className="msg-ai-dots"><span></span><span></span><span></span></span>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" aria-hidden="true"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd"/></svg>
              )}
              {generating ? "Generating…" : "Generate with AI"}
            </button>
            <button type="button" className="msg-btn msg-btn--send">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/></svg>
              Send
            </button>
          </div>

          <div className="msg-send-hint">Send opens LinkedIn profile and sends with current template.</div>
        </div>

      </div>
    </div>
  );
}
