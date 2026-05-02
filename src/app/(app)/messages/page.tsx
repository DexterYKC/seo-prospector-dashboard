"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, fetchDashboard, fetchMessageLogs } from "@/lib/api";
import type { LeadRecord, MessageLog } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";
import { AppLayout } from "@/components/AppLayout";
import { MessageDrawer } from "@/components/MessageDrawer";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

function getLeadName(lead: LeadRecord) {
  const n = String(lead.name || "").trim();
  if (n) return n;
  return `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown";
}

function getLeadCompany(lead: LeadRecord) {
  const opp = lead.opportunities?.[0];
  return String(opp?.company || lead.company || "");
}

function LeadAvatar({ avatarUrl, name, cls }: { avatarUrl?: string | null; name: string; cls: string }) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const initial = name.charAt(0).toUpperCase();
  if (avatarUrl && !imgFailed) {
    return (
      <div className={`leadTableAvatar ${cls}`} style={{ padding: 0, overflow: "hidden", flexShrink: 0 }}>
        <img src={avatarUrl} alt={name} className="leadTableAvatarImg" onError={() => setImgFailed(true)} />
      </div>
    );
  }
  return <div className={`leadTableAvatar ${cls}`} style={{ flexShrink: 0 }}>{initial}</div>;
}

function fmtRelative(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function fmtDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

type TrackRow = {
  lead: LeadRecord;
  log: MessageLog | null;
};

export default function MessagesPage() {
  const router = useRouter();
  const { token, setToken } = useSession();
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);

  const [leads,       setLeads]       = useState<LeadRecord[]>([]);
  const [logs,        setLogs]        = useState<MessageLog[]>([]);
  const [plan,        setPlan]        = useState<string>("");
  const [trialActive, setTrialActive] = useState(false);
  const [busy,        setBusy]        = useState(false);
  const [error,       setError]       = useState("");
  const [drawerLead,   setDrawerLead]   = useState<LeadRecord | null>(null);
  const [drawerLog,    setDrawerLog]    = useState<MessageLog | null>(null);
  const tableWrapRef                      = useRef<HTMLDivElement>(null);
  const [tableOverflows, setTableOverflows] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const [dashOut, logsOut] = await Promise.all([
        fetchDashboard(token),
        fetchMessageLogs(token).catch(() => ({ ok: false, logs: [] as MessageLog[] })),
      ]);
      setLeads(Array.isArray(dashOut.leads) ? dashOut.leads : []);
      setLogs(logsOut.logs || []);
      setPlan(String(dashOut.user?.plan || "FREE").toUpperCase());
      const trialEndsAt = dashOut.user?.trialEndsAt;
      setTrialActive(Boolean(trialEndsAt && new Date(trialEndsAt).getTime() > Date.now()));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null); router.replace("/login"); return;
      }
      setError(err instanceof ApiError ? err.message : "LOAD_FAILED");
    } finally {
      setBusy(false);
    }
  }, [token, setToken, router]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const check = () => setTableOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [leads, logs]);

  const logsByUrl = useMemo(() => {
    const map = new Map<string, MessageLog>();
    for (const log of logs) {
      if (log.profile_url) map.set(log.profile_url, log);
    }
    return map;
  }, [logs]);

  // Build rows: leads that have logs first, then the rest
  const rows = useMemo((): TrackRow[] => {
    const withLog: TrackRow[] = [];
    const withoutLog: TrackRow[] = [];
    for (const lead of leads) {
      const log = lead.profileUrl ? logsByUrl.get(lead.profileUrl) ?? null : null;
      if (log) withLog.push({ lead, log });
      else withoutLog.push({ lead, log: null });
    }
    return [...withLog, ...withoutLog];
  }, [leads, logsByUrl]);

  const isFreeLocked = !busy && plan === "FREE" && !trialActive;

  // Summary stats
  const totalGens  = logs.reduce((s, l) => s + (l.generation_count || 0), 0);
  const totalSent  = logs.filter(l => l.sent_at).length;
  const totalEdit  = logs.filter(l => l.was_manually_edited).length;

  return (
    <AppLayout className="messagesPage">
      <div className="pageHeader">
        <div className="pageTitleGroup">
          <div className="pageTitleIconBox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </div>
          <div>
            <h1 className="pageTitle">Tracking</h1>
            <p className="pageSubtitle">{T("Generation & send tracking per lead", "Suivi des générations et envois par lead")}</p>
          </div>
        </div>
        <div className="row">
          <button className="btnRefresh" onClick={() => void load()} disabled={busy} title={T("Refresh", "Actualiser")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s ease", transform: busy ? "rotate(360deg)" : "none" }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="pageContent">
        <div className="msgContentWrap">
        {error && <div className="errorBox">{error}</div>}

        {/* Free locked state */}
        {isFreeLocked && (
          <article className="card msgFreeLock">
            <div className="msgFreeLockIcon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div className="msgFreeLockTitle">
              {T("AI Message Generation", "Génération de messages IA")}
            </div>
            <div className="msgFreeLockSub">
              {T(
                "Generate hyper-personalised LinkedIn outreach messages for each prospect based on their SEO profile — and track every generation and send directly here.",
                "Générez des messages de prospection LinkedIn ultra-personnalisés pour chaque prospect basés sur leur profil SEO — et suivez chaque génération et envoi directement ici."
              )}
            </div>
            <div className="msgFreeLockFeatures">
              <div className="msgFreeLockFeature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {T("AI-generated personalised messages per lead", "Messages personnalisés générés par IA par lead")}
              </div>
              <div className="msgFreeLockFeature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {T("Multiple tone variants (professional, friendly…)", "Plusieurs variantes de ton (professionnel, amical…)")}
              </div>
              <div className="msgFreeLockFeature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {T("Send tracking from the extension", "Suivi des envois depuis l'extension")}
              </div>
              <div className="msgFreeLockFeature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {T("Manual edit detection", "Détection des modifications manuelles")}
              </div>
            </div>
            <a href="/account" className="btnUpgradePro" style={{ alignSelf: "flex-start", marginTop: 8, fontSize: 14, padding: "10px 20px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              {T("Upgrade to unlock messages", "Passer à la version Pro pour débloquer")}
            </a>
          </article>
        )}

        {/* KPI strip */}
        {!isFreeLocked && leads.length > 0 && (
          <div className="kpiGrid">
            <article className="card kpiCard" style={{ '--kpi-bubble-color': 'rgba(124,58,237,0.13)' } as React.CSSProperties}>
              <div className="kpiHead">
                <span className="kpiLabel">{T("Total generations", "Générations totales")}</span>
                <div className="kpiIconBox" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
              </div>
              <span className="kpiValue" style={{ color: "#7c3aed" }}>{totalGens}</span>
              <span className="kpiPill" style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                {totalGens === 0 ? T("No messages yet", "Aucun message") : `${totalGens} ${T("generated", "générés")}`}
              </span>
            </article>

            <article className="card kpiCard" style={{ '--kpi-bubble-color': 'rgba(37,99,235,0.13)' } as React.CSSProperties}>
              <div className="kpiHead">
                <span className="kpiLabel">{T("Sent from extension", "Envoyés depuis l'extension")}</span>
                <div className="kpiIconBox" style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
              <span className="kpiValue" style={{ color: "#2563eb" }}>{totalSent}</span>
              <span className="kpiPill" style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>
                {totalSent === 0 ? T("None sent yet", "Aucun envoyé") : `${totalSent} ${T("sent", "envoyés")}`}
              </span>
            </article>

            <article className="card kpiCard" style={{ '--kpi-bubble-color': 'rgba(217,119,6,0.13)' } as React.CSSProperties}>
              <div className="kpiHead">
                <span className="kpiLabel">{T("Manually edited", "Modifiés manuellement")}</span>
                <div className="kpiIconBox" style={{ background: "rgba(217,119,6,0.1)", color: "#d97706" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
              </div>
              <span className="kpiValue" style={{ color: "#d97706" }}>{totalEdit}</span>
              <span className="kpiPill" style={{ background: "rgba(217,119,6,0.1)", color: "#d97706" }}>
                {totalEdit === 0 ? T("No edits", "Aucune modification") : `${totalEdit} ${T("edited", "modifiés")}`}
              </span>
            </article>

            <article className="card kpiCard" style={{ '--kpi-bubble-color': 'rgba(5,150,105,0.13)' } as React.CSSProperties}>
              <div className="kpiHead">
                <span className="kpiLabel">{T("Leads with activity", "Leads avec activité")}</span>
                <div className="kpiIconBox" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
              </div>
              <span className="kpiValue" style={{ color: "#059669" }}>{logs.length}</span>
              <span className="kpiPill" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>
                {logs.length === 0 ? T("No activity", "Aucune activité") : `${logs.length} / ${leads.length} ${T("leads", "leads")}`}
              </span>
            </article>
          </div>
        )}

        {!isFreeLocked && (leads.length === 0 && !busy ? (
          <article className="card extensionBanner">
            <div className="extensionBannerBody">
              <div className="extensionBannerEmoji">
                <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h8M8 14h5"/></svg>
              </div>
              <div>
                <div className="extensionBannerTitle">{T("No leads yet", "Aucun lead pour l'instant")}</div>
                <div className="extensionBannerSub">
                  {T("Capture LinkedIn profiles with the extension — then generate messages from the extension to track them here.", "Capturez des profils LinkedIn avec l'extension — puis générez des messages depuis l'extension pour les suivre ici.")}
                </div>
              </div>
            </div>
          </article>
        ) : (
          <article className={`card leadsCard msgLeadsCard${tableOverflows ? " leadsOverflows" : ""}`}>
            <div className="cardHeader">
              <span className="cardTitle">{T("Lead activity", "Activité par lead")}</span>
              <span className="badge info">{leads.length}</span>
            </div>
            <div className="cardBodyFlush">
            <div className="tableWrap" ref={tableWrapRef}>
              <table className="dataTable">
                <thead>
                  <tr>
                    <th>{T("Lead", "Lead")}</th>
                    <th style={{ textAlign: "center" }}>{T("Generations", "Générations")}</th>
                    <th style={{ textAlign: "center" }}>{T("Edited", "Modifié")}</th>
                    <th style={{ textAlign: "center" }}>{T("Sent", "Envoyé")}</th>
                    <th>{T("Last activity", "Dernière activité")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ lead, log }) => {
                    const name    = getLeadName(lead);
                    const company = getLeadCompany(lead);
                    const lt      = String(lead.leadType || lead.decision?.leadType || "COLD").toUpperCase();
                    const cls     = lt.includes("HOT") ? "hot" : lt.includes("WARM") ? "warm" : "cold";
                    const url     = lead.profileUrl || lead.id || "";
                    const genCount = log?.generation_count ?? 0;
                    const lastActivity = log?.updated_at ?? null;

                    const isActive = drawerLead?.profileUrl === url;

                    return (
                      <tr
                        key={url}
                        onClick={() => { setDrawerLead(lead); setDrawerLog(log); }}
                        style={{ cursor: "pointer", background: isActive ? "rgba(59,130,246,0.05)" : undefined, transition: "background 0.12s" }}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <LeadAvatar avatarUrl={lead.avatarUrl} name={name} cls={cls} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                {name}
                                {lead.profileUrl && (
                                  <a href={lead.profileUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                     style={{ color: "var(--muted)", display: "inline-flex", lineHeight: 1 }}
                                     title="LinkedIn">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                  </a>
                                )}
                              </div>
                              {company && <div style={{ fontSize: 11, color: "var(--muted)" }}>{company}</div>}
                            </div>
                            <span className={`lbadge ${cls}`} style={{ marginLeft: 4, flexShrink: 0 }}>{cls}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {genCount > 0
                            ? <span className="msgPickGenBadge" style={{ fontSize: 12, padding: "3px 10px" }}>{genCount}</span>
                            : <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {log?.was_manually_edited
                            ? <span className="msgTrackBadge edited">{T("Yes", "Oui")}</span>
                            : <span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {log?.sent_at
                            ? <span className="msgTrackBadge sent">{T("Sent", "Envoyé")}</span>
                            : <span className="msgTrackBadge pending">{T("Not sent", "Non envoyé")}</span>}
                        </td>
                        <td>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>
                            {lastActivity
                              ? <><span style={{ fontWeight: 600, color: "var(--text)" }}>{fmtDate(lastActivity)}</span><span style={{ marginLeft: 6 }}>· {fmtRelative(lastActivity)}</span></>
                              : "—"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </div>
          </article>
        ))}
        </div>
      </div>

      <MessageDrawer
        lead={drawerLead}
        log={drawerLog}
        token={token ?? ""}
        onClose={() => { setDrawerLead(null); setDrawerLog(null); }}
        onLogUpdated={() => void load()}
      />
    </AppLayout>
  );
}
