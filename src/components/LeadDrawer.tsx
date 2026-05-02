"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadRecord } from "@/lib/api";
import { useLang } from "@/contexts/LangContext";

function getLeadType(lead: LeadRecord): "HOT" | "WARM" | "COLD" {
  // Scan all opportunities — show the hottest type (HOT > WARM > COLD)
  const opps = Array.isArray(lead.opportunities) ? lead.opportunities : [];
  for (const opp of opps) {
    if (String(opp.leadType || "").toUpperCase().includes("HOT")) return "HOT";
  }
  for (const opp of opps) {
    if (String(opp.leadType || "").toUpperCase().includes("WARM")) return "WARM";
  }
  // Fall back to lead-level decision
  const raw = String(lead.leadType || lead.decision?.leadType || "").toUpperCase();
  if (raw.includes("HOT"))  return "HOT";
  if (raw.includes("WARM")) return "WARM";
  if (raw.includes("COLD")) return "COLD";
  const action = String(lead.ui?.actionLabel || lead.decision?.final || "").toUpperCase();
  if (action.includes("CONTACT_NOW") || action.includes("CONTACT NOW")) return "HOT";
  if (action.includes("CONTACT_SOFT") || action.includes("DECISION"))   return "WARM";
  return "COLD";
}

function getLeadName(lead: LeadRecord) {
  const n = String(lead.name || "").trim();
  if (n) return n;
  return `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown";
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] || "?").slice(0, 2).toUpperCase();
}

// Maps keyword patterns in the reason string to colored chips
const REASON_CHIPS: { pattern: RegExp; label: (m: RegExpMatchArray) => string; color: string; bg: string }[] = [
  { pattern: /decision[- ]maker identified/i,          label: () => "Decision-maker ✓",       color: "#16a34a", bg: "rgba(22,163,74,0.10)"   },
  { pattern: /no decision[- ]maker|decision[- ]maker not/i, label: () => "No decision-maker", color: "#6b7280", bg: "rgba(107,114,128,0.10)" },
  { pattern: /seo is critical|seo critical/i,          label: () => "SEO critical",            color: "#dc2626", bg: "rgba(220,38,38,0.10)"   },
  { pattern: /seo (is )?weak|seo moderate/i,           label: () => "SEO weak",                color: "#d97706", bg: "rgba(217,119,6,0.10)"   },
  { pattern: /seo (looks? )?healthy|seo (is )?good/i,  label: () => "SEO healthy",             color: "#16a34a", bg: "rgba(22,163,74,0.10)"   },
  { pattern: /no valid website|no website/i,           label: () => "No website",              color: "#6b7280", bg: "rgba(107,114,128,0.10)" },
  { pattern: /company has no valid website/i,          label: () => "No website",              color: "#6b7280", bg: "rgba(107,114,128,0.10)" },
];

function parseReasonChips(reason: string): React.ReactNode[] {
  const chips: React.ReactNode[] = [];
  let remaining = reason;

  for (const { pattern, label, color, bg } of REASON_CHIPS) {
    const m = remaining.match(pattern);
    if (m) {
      chips.push(
        <span key={pattern.source} style={{
          display: "inline-flex", alignItems: "center",
          fontSize: 11, fontWeight: 700, padding: "2px 8px",
          borderRadius: 20, color, background: bg,
          border: `1px solid ${color}28`,
        }}>
          {label(m)}
        </span>
      );
      remaining = remaining.replace(m[0], "").replace(/\s+and\s+/i, " ").trim();
    }
  }

  // Any leftover text that didn't match a chip pattern
  const leftover = remaining.replace(/^[,\s.]+|[,\s.]+$/g, "").trim();
  if (leftover) {
    chips.push(
      <span key="rest" style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>
        {leftover}
      </span>
    );
  }

  return chips.length > 0 ? chips : [
    <span key="raw" style={{ fontSize: 11, color: "var(--muted)" }}>{reason}</span>
  ];
}

function getDomain(url: string): string | null {
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname.replace(/^www\./, "");
  } catch { return null; }
}

function CompanyLogo({ website, name }: { website?: string | null; name: string }) {
  const [step, setStep] = useState(0); // 0=google, 1=clearbit, 2=initials
  const domain = website ? getDomain(website) : null;
  const initials = (name.charAt(0) || "?").toUpperCase();

  const srcs = domain ? [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://logo.clearbit.com/${domain}`,
  ] : [];

  if (domain && step < srcs.length) {
    return (
      <div className="oppLogo">
        <img
          key={srcs[step]}
          src={srcs[step]}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 6 }}
          onError={() => setStep((s) => s + 1)}
        />
      </div>
    );
  }
  return <div className="oppLogo oppLogoFallback">{initials}</div>;
}

type Props = { lead: LeadRecord | null; onClose: () => void; locked?: boolean; onUpgrade?: () => void };

export function LeadDrawer({ lead, onClose, locked = false, onUpgrade }: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const [closing, setClosing] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 220);
  }

  if (!lead) return null;
  // Reset when lead changes
  const avatarKey = lead.avatarUrl || lead.profileUrl || "";

  const lt       = getLeadType(lead);
  const name     = getLeadName(lead);
  const initials = getInitials(name);
  const opp      = (lead.opportunities || []).find(
    (o) => String(o.opportunityStatus || "").toUpperCase() === "PRIMARY"
  ) || lead.opportunities?.[0];

  // Find the hottest opportunity to read its signal (HOT > WARM > COLD)
  const opps = Array.isArray(lead.opportunities) ? lead.opportunities : [];
  const hottestOpp = (() => {
    const hot  = opps.find((o) => String(o.leadType || "").toUpperCase().includes("HOT"));
    if (hot) return hot;
    const warm = opps.find((o) => String(o.leadType || "").toUpperCase().includes("WARM"));
    if (warm) return warm;
    return opps[0] ?? null;
  })();

  const company    = hottestOpp?.company || opp?.company || lead.company || "—";
  const website    = hottestOpp?.website || opp?.website || lead.website || "";
  const confidence = hottestOpp?.ui?.confidence || lead.ui?.confidence || lead.decision?.confidence || "—";
  const reason     = hottestOpp?.ui?.reason || lead.ui?.reason || lead.decision?.reason || "";
  const rawSignal  = String(hottestOpp?.ui?.actionLabel || hottestOpp?.decision?.final || lead.decision?.final || lead.ui?.actionLabel || "").toUpperCase();
  const actionLabel = (() => {
    const isFr = lang === "fr";
    if (rawSignal.includes("CONTACT_NOW") || rawSignal.includes("CONTACT NOW") || rawSignal.includes("CONTACTER"))
      return isFr ? "Contacter maintenant" : "Contact now";
    if (rawSignal.includes("CONTACT_SOFT") || rawSignal.includes("DECISION") || rawSignal.includes("TROUVER") || rawSignal.includes("FIND"))
      return isFr ? "Trouver le décideur" : "Find decision maker";
    if (rawSignal.includes("NURTURE") || rawSignal.includes("NOURRIR"))
      return isFr ? "Nourrir la relation" : "Nurture";
    if (rawSignal.includes("IGNORE") || rawSignal.includes("SKIP") || rawSignal.includes("PASS"))
      return isFr ? "Ignorer" : "Skip";
    return isFr ? "Contacter" : "Contact";
  })();

  const toneColor = lt === "HOT" ? "#ef4444" : lt === "WARM" ? "#f59e0b" : "#10b981";

  return (
    <>
      <div className={`drawerOverlay${closing ? " closing" : ""}`} onClick={handleClose} />
      <aside className={`drawer${closing ? " closing" : ""}`}>
        <div className="drawerHeader">
          {lead.avatarUrl && !imgFailed ? (
            <div className="drawerAvatar" style={{ padding: 0, overflow: "hidden", background: "none" }}>
              <img
                key={avatarKey}
                src={lead.avatarUrl}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
                onError={() => setImgFailed(true)}
              />
            </div>
          ) : (
            <div className="drawerAvatar" style={{ background: `linear-gradient(135deg, ${toneColor}cc, ${toneColor})` }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="drawerName">{name}</div>
            <div className="drawerCompany">{company}</div>
          </div>
          <button className="drawerClose" onClick={handleClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
            </svg>
          </button>
        </div>

        <div className="drawerBody">
          <div className="drawerScoreCard" style={{ color: toneColor }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span className={`lbadge ${lt.toLowerCase()}`}>
                {lt === "HOT" && <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-4.4 0-8-3.6-8-8 0-3 1.7-5.7 4.3-7.1C8.1 9.5 8 11 8 11s1.5-1.5 2-4c1.5 2 1.5 4 1.5 4s1-1 1-3c2 2 2.5 5 2.5 5s.5-1 .5-2.5C17.5 13 20 16 20 19c0 2.2-.9 4.2-2.3 5.6C16.3 22.5 14.2 23 12 23z"/></svg>}
                {lt === "WARM" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>}
                {lt === "COLD" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/></svg>}
                {lt}
              </span>
              <span className={confidence.toUpperCase() === "HIGH" ? "confHigh" : confidence.toUpperCase() === "MEDIUM" ? "confMedium" : "confLow"}>
                {confidence}
              </span>
            </div>
            <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 700, marginBottom: reason ? 8 : 0 }}>{actionLabel}</div>
            {reason && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
                {parseReasonChips(reason)}
              </div>
            )}
          </div>

          <div className="drawerSection">
            <div className="drawerSectionTitle">Contact</div>
            {lead.profileUrl && (
              <div className="kv">
                <span className="label">LinkedIn</span>
                <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--brand)", fontWeight: 700, fontSize: 13 }}>
                  View profile ↗
                </a>
              </div>
            )}
            {website && (
              <div className="kv">
                <span className="label">Website</span>
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--brand)", fontWeight: 700, fontSize: 13, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {website}
                </a>
              </div>
            )}
            <div className="kv">
              <span className="label">Company</span>
              <span className="value">{company}</span>
            </div>
            {(lead.updatedAt || lead.createdAt) && (
              <div className="kv">
                <span className="label">Captured</span>
                <span className="value">{new Date(lead.updatedAt || lead.createdAt || "").toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {(lead.opportunities?.length ?? 0) > 0 && (
            <div className="drawerSection">
              <div className="drawerSectionTitle">Opportunities ({lead.opportunities!.length})</div>
              {lead.opportunities!.map((o, i) => {
                const oppName = o.company || `Opportunity ${i + 1}`;
                return (
                  <div key={o.id || i} className="drawerOppRow">
                    {locked
                      ? <div className="oppLogo oppLogoFallback">{(oppName.charAt(0) || "?").toUpperCase()}</div>
                      : <CompanyLogo website={o.website} name={oppName} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{oppName}</div>
                      {o.website && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{o.website}</div>}
                      {o.ui?.reason && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>{o.ui.reason}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {locked ? (
          <div className="drawerActions" style={{ flexDirection: "column", gap: 8 }}>
            {lead.profileUrl && (
              <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer"
                className="btn" style={{ justifyContent: "center" }}>
                LinkedIn ↗
              </a>
            )}
            <a href="/account" className="btnUpgradePro" style={{ justifyContent: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              {lang === "fr" ? "Passer à Pro pour l'analyse SEO" : "Upgrade to Pro for SEO analysis"}
            </a>
          </div>
        ) : (
          <div className="drawerActions">
            {lead.profileUrl && (
              <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer"
                className="btn" style={{ flex: 1, justifyContent: "center" }}>
                LinkedIn ↗
              </a>
            )}
            <button
              className="btn primary"
              style={{ flex: 1, justifyContent: "center", gap: 7 }}
              onClick={() => { router.push("/seo"); handleClose(); }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Open SEO
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
