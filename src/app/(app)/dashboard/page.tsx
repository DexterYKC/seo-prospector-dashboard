"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, fetchDashboard } from "@/lib/api";
import type { DashboardResponse } from "@/lib/api";
import { resolveUsageTone } from "@/lib/usageTone";
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { AppLayout } from "@/components/AppLayout";
import { SkeletonCard } from "@/components/Skeleton";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

function safeNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeDate(iso: string | null | undefined) {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t) : null;
}



export default function DashboardPage() {
  const router = useRouter();
  const { token, setToken } = useSession();
  const { refresh: refreshUser } = useUserData();
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const [data,  setData]  = useState<DashboardResponse | null>(null);
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");
  const [chartTip, setChartTip] = useState<{ x: number; y: number; day: string; entries: { label: string; value: number; color: string }[]; focused: string | null } | null>(null);
  const [showLastCaptureTip, setShowLastCaptureTip] = useState(false);
  const [extInstalled, setExtInstalled] = useState(false);

  useEffect(() => {
    setExtInstalled(document.documentElement.hasAttribute("data-seoprospector-ext"));
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const out = await fetchDashboard(token);
      setData(out);
      refreshUser();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null); router.replace("/login"); return;
      }
      setError(err instanceof ApiError ? `${err.code}: ${err.message}` : "LOAD_FAILED");
    } finally {
      setBusy(false);
    }
  }, [token, setToken, router, refreshUser]);

  useEffect(() => { void load(); }, [load]);

  const user      = data?.user      || {};
  const limits    = data?.limits    || {};
  const usage     = data?.usage     || {};
  const remaining = data?.remaining || {};
  const features  = data?.features  || {};

  const msgUsed  = safeNum(usage.messages_generated);
  const msgLimit = safeNum(limits.messages_generated);
  const msgLeft  = safeNum(remaining.messages_generated) || Math.max(0, msgLimit - msgUsed);

  const seoUsed  = safeNum(usage.seo_exports);
  const seoLimit = safeNum(limits.seo_exports);
  const seoLeft  = safeNum(remaining.seo_exports) || Math.max(0, seoLimit - seoUsed);

  const scanUsed  = safeNum(usage.profiles_scanned);
  const scanLimit = safeNum(limits.profiles_scanned);
  const scanLeft  = safeNum(remaining.profiles_scanned) || Math.max(0, scanLimit - scanUsed);

  const dash      = data?.dashboard || {};
  const stats     = dash.leadStats  || {};
  const total     = safeNum(dash.leadsCount ?? stats.TOTAL);
  const hot       = safeNum(stats.HOT);
  const warm      = safeNum(stats.WARM);
  const cold      = safeNum(stats.COLD);
  const leadHistory = Array.isArray(dash.leadHistory) && dash.leadHistory.length === 30 ? dash.leadHistory : null;
  const actionable = safeNum(dash.actionable);
  const deciders   = safeNum(dash.deciders);
  const ignored    = safeNum(dash.ignored);
  const convPct    = safeNum(dash.conversionPct);

  const leads = useMemo(() => (Array.isArray(data?.leads) ? data!.leads! : []), [data]);

  const lastLeadByType = useMemo(() => {
    const result: Record<string, { name: string; avatarUrl?: string | null }> = {};
    for (const lead of leads) {
      const lt = String(lead?.leadType || lead?.decision?.leadType || "").toUpperCase();
      const type = lt.includes("HOT") ? "HOT" : lt.includes("WARM") ? "WARM" : lt.includes("COLD") ? "COLD" : null;
      if (!type) continue;
      const name = String(lead.name || "").trim() || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown";
      if (!result[type]) result[type] = { name, avatarUrl: lead.avatarUrl };
    }
    return result;
  }, [leads]);

  const avgConf = useMemo(() => {
    if (!leads.length) return 0;
    const tokens: Record<string, number> = { HIGH: 95, MEDIUM: 70, LOW: 45 };
    const sum = leads.reduce((acc, l) => {
      const raw = String(l?.ui?.confidence || l?.decision?.confidence || "MEDIUM").toUpperCase();
      const n = Number(raw);
      return acc + (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : (tokens[raw] ?? 60));
    }, 0);
    return Math.round(sum / leads.length);
  }, [leads]);

  const plan        = String(user.plan || "FREE").toUpperCase();
  const trialEndMs  = user.trialEndsAt ? Date.parse(user.trialEndsAt as string) : null;
  const isTrial     = (plan === "FREE" && String(user.subscriptionStatus || "").toUpperCase() === "TRIALING") || (!!trialEndMs && trialEndMs > Date.now());
  const trialDaysLeft = trialEndMs && trialEndMs > Date.now() ? Math.ceil((trialEndMs - Date.now()) / 86400000) : null;
  const showSeoQuota = plan !== "FREE" || isTrial;
  const fullName  = String(user.fullName || "").trim();
  const email     = String(user.email   || "").trim();
  const firstName = (fullName || (email ? email.split("@")[0] : "User")).split(/\s+/)[0] || "User";
  const today     = new Date().toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });

  const lastCapture = safeDate(dash.lastCaptureAt);
  const daysAgo     = lastCapture ? Math.round((Date.now() - lastCapture.getTime()) / 86400000) : null;

  const healthScore = useMemo(() => {
    if (!total) return 0;
    const hotRate  = hot  / total;
    const confNorm = avgConf / 100;
    const convNorm = Math.min(convPct / 100, 1);
    return Math.round((hotRate * 0.4 + confNorm * 0.4 + convNorm * 0.2) * 100);
  }, [total, hot, avgConf, convPct]);

  const healthTone = healthScore >= 70 ? "#10b981" : healthScore >= 40 ? "#f59e0b" : "#ef4444";
  const hotPct  = total > 0 ? Math.round((hot  / total) * 100) : 0;
  const warmPct = total > 0 ? Math.round((warm / total) * 100) : 0;
  const coldPct = total > 0 ? Math.round((cold / total) * 100) : 0;

  if (busy && !data) {
    return (
      <AppLayout>
        <div className="pageHeader">
          <div className="pageTitleGroup">
            <div>
              <h1 className="pageTitle">Dashboard</h1>
            </div>
          </div>
        </div>
        <div className="pageContent">
          <div className="kpiGrid">
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
          </div>
          <div className="biGrid">
            <SkeletonCard rows={5} />
            <SkeletonCard rows={4} />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pageHeader">
        <div className="pageTitleGroup">
          <div>
            <h1 className="pageTitle">{T("Hello", "Bonjour")}, {firstName}!</h1>
            <p className="pageSubtitle">{today} · {T("Here's your prospecting overview", "Voici votre aperçu de prospection")}</p>
          </div>
        </div>
        <div className="row" style={{ marginTop: 4 }}>
          <button className="btnRefresh" onClick={() => void load()} disabled={busy} title={T("Refresh", "Actualiser")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s ease", transform: busy ? "rotate(360deg)" : "none" }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="pageContent">
        {error && <div className="errorBox">{error}</div>}

        {!busy && total === 0 && (
          <article className="card">
            <div className="cardHeader">
              <span className="cardTitle">{T("Getting started", "Premiers pas")}</span>
              <span className="badge info">3 {T("steps", "étapes")}</span>
            </div>
            <div className="cardBody">
              <div className="quickStartList">
                <div className="quickStartItem">
                  <div className="quickStartCheck done">✓</div>
                  <div className="quickStartBody">
                    <div className="quickStartTitle">{T("Create your account", "Créer votre compte")}</div>
                    <div className="quickStartSub">{T("You're in!", "C'est parti !")}</div>
                  </div>
                </div>
                <div className="quickStartItem">
                  <div className={`quickStartCheck ${extInstalled ? "done" : "pending"}`}>{extInstalled ? "✓" : "2"}</div>
                  <div className="quickStartBody">
                    <div className="quickStartTitle">{T("Install the Chrome extension", "Installer l'extension Chrome")}</div>
                    <div className="quickStartSub">
                      {extInstalled
                        ? T("Extension detected and active!", "Extension détectée et active !")
                        : T("Capture LinkedIn profiles automatically while browsing.", "Capturez des profils LinkedIn automatiquement en naviguant.")}
                    </div>
                  </div>
                  {!extInstalled && (
                    <a href="https://chromewebstore.google.com/detail/your-extension-id" target="_blank" rel="noreferrer" className="btn sm primary" style={{ marginLeft: "auto", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      {T("Add to Chrome", "Ajouter à Chrome")}
                    </a>
                  )}
                </div>
                <div className="quickStartItem">
                  <div className="quickStartCheck pending">3</div>
                  <div className="quickStartBody">
                    <div className="quickStartTitle">{T("Capture your first lead", "Capturer votre premier lead")}</div>
                    <div className="quickStartSub">{T("Visit any LinkedIn profile with the extension active — it captures automatically.", "Visitez un profil LinkedIn avec l'extension active — la capture est automatique.")}</div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* ── KPI row ── */}
        <div className="kpiGrid">

          <article className="card kpiCard" style={{ '--kpi-bubble-color': 'rgba(59,130,246,0.13)' } as React.CSSProperties}>
            <div className="kpiHead">
              <span className="kpiLabel">{T("Total leads", "Leads totaux")}</span>
              <div className="kpiIconBox" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
                </svg>
              </div>
            </div>
            <span className="kpiValue">{total || "—"}</span>
            <span className="kpiPill" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
              {total > 0 ? `${total} ${T("captured", "capturés")}` : T("Start capturing", "Commencer à capturer")}
            </span>
            <div className={`kpiBar${total === 0 ? " kpiBar--empty" : ""}`}><div className="kpiBarFill" style={{ width: `${Math.min(total / 50 * 100, 100)}%`, background: "#3b82f6" }} /></div>
          </article>

          <article className="card kpiCard" style={{ '--kpi-bubble-color': 'rgba(16,185,129,0.13)' } as React.CSSProperties}>
            <div className="kpiHead">
              <span className="kpiLabel">{T("Pipeline health", "Santé pipeline")}</span>
              <div className="kpiIconBox" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
            </div>
            <span className="kpiValue">
              {total > 0 ? healthScore : "—"}
              {total > 0 && <span className="kpiUnit">/100</span>}
            </span>
            <span className="kpiPill" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
              {total === 0 ? T("No data yet", "Pas de données") : healthScore >= 70 ? T("Strong", "Solide") : healthScore >= 40 ? T("Average", "Moyen") : T("Weak", "Faible")}
            </span>
            <div className={`kpiBar${total === 0 ? " kpiBar--empty" : ""}`}><div className="kpiBarFill" style={{ width: `${total > 0 ? healthScore : 0}%`, background: healthScore >= 70 ? "#10b981" : healthScore >= 40 ? "#f59e0b" : "#ef4444" }} /></div>
          </article>

          <article className="card kpiCard" style={{ '--kpi-bubble-color': 'rgba(139,92,246,0.13)' } as React.CSSProperties}>
            <div className="kpiHead">
              <span className="kpiLabel">{T("Avg. confidence", "Confiance moy.")}</span>
              <div className="kpiIconBox" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
            </div>
            <span className="kpiValue">
              {leads.length > 0 ? avgConf : "—"}
              {leads.length > 0 && <span className="kpiUnit">%</span>}
            </span>
            <span className="kpiPill" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
              {leads.length > 0 ? `${leads.length} ${T("leads scored", "leads scorés")}` : T("No leads yet", "Aucun lead")}
            </span>
            <div className={`kpiBar${leads.length === 0 ? " kpiBar--empty" : ""}`}><div className="kpiBarFill" style={{ width: `${leads.length > 0 ? avgConf : 0}%`, background: "#8b5cf6" }} /></div>
          </article>

          {(() => { return (
          <article className="card kpiCard" style={{ '--kpi-bubble-color': 'rgba(245,158,11,0.13)' } as React.CSSProperties}>
            <div className="kpiHead">
              <span className="kpiLabel">{T("Decision-makers", "Décideurs")}</span>
              <div className="kpiIconBox" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
                </svg>
              </div>
            </div>
            <span className="kpiValue">{deciders || "—"}</span>
            <span className="kpiPill" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
              {total > 0 ? `${Math.round((deciders / total) * 100)}% ${T("of pipeline", "du pipeline")}` : T("No data yet", "Pas de données")}
            </span>
            <div className={`kpiBar${total === 0 ? " kpiBar--empty" : ""}`}><div className="kpiBarFill" style={{ width: `${total > 0 ? Math.round((deciders / total) * 100) : 0}%`, background: "#f59e0b" }} /></div>
          </article>
          ); })()}
        </div>

        {/* ── Main content ── */}
        <div className="biGrid">

          {/* Pipeline card */}
          <article className="card card--nobar">
            <div className="cardHeader">
              <span className="cardTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.1)", color: "#6366f1", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </span>
                {T("Lead pipeline", "Pipeline de leads")}
              </span>
              {lastCapture && daysAgo !== null && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: daysAgo >= 7 ? 600 : 500,
                    color: daysAgo >= 7 ? "#ef4444" : daysAgo >= 4 ? "#f59e0b" : "var(--muted)",
                  }}>
                    {daysAgo === 0
                      ? T("Updated today", "Mis à jour aujourd'hui")
                      : daysAgo >= 7
                      ? T(`${daysAgo}d ago — scan LinkedIn to refresh →`, `${daysAgo}j — scannez LinkedIn pour actualiser →`)
                      : T(`Updated ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`, `Mis à jour il y a ${daysAgo} jour${daysAgo === 1 ? "" : "s"}`)}
                  </span>
                  <span style={{ position: "relative", display: "inline-flex" }}>
                    <span className="chartHelpIcon" onMouseEnter={() => setShowLastCaptureTip(true)} onMouseLeave={() => setShowLastCaptureTip(false)}>?</span>
                    {showLastCaptureTip && (
                      <div style={{
                        position: "absolute", right: 0, top: "calc(100% + 6px)",
                        background: "var(--surface-soft)", border: "1px solid var(--line)",
                        borderRadius: 8, boxShadow: "0 2px 10px rgba(17,24,39,0.07)",
                        padding: "7px 12px", fontSize: 12, fontWeight: 500,
                        color: "var(--muted)", whiteSpace: "nowrap", zIndex: 50,
                      }}>
                        {T("Date of your last captured LinkedIn lead", "Date de votre dernier lead LinkedIn capturé")}
                      </div>
                    )}
                  </span>
                </span>
              )}
            </div>
            <div style={{ paddingTop: 12, paddingBottom: 16, paddingLeft: 40, paddingRight: 40 }}>
              {total > 0 ? (() => {
                const DAYS = 30;
                const xLabels = Array.from({ length: DAYS }, (_, i) => {
                  if (i === DAYS - 1) return lang === "fr" ? "Auj." : "Today";
                  if (leadHistory) {
                    if ((DAYS - 1 - i) % 5 !== 0) return "";
                    const d = new Date(leadHistory[i].date);
                    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
                  }
                  if ((DAYS - 1 - i) % 5 !== 0) return "";
                  const d = new Date();
                  d.setUTCDate(d.getUTCDate() - (DAYS - 1 - i));
                  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
                });

                function syntheticSeries(final: number, seed: number): number[] {
                  if (final === 0) return Array(DAYS).fill(0);
                  const rng = (i: number) => Math.abs(Math.sin(seed * 47.3 + i * 13.7));
                  return Array.from({ length: DAYS }, (_, i) => {
                    if (i === DAYS - 1) return final;
                    const progress = i / (DAYS - 1);
                    const wave = rng(i) * 0.2;
                    return Math.max(0, parseFloat((final * (progress + wave) * 0.95).toFixed(1)));
                  });
                }

                const hotData  = leadHistory ? leadHistory.map(p => p.hot)  : syntheticSeries(hot,  0);
                const warmData = leadHistory ? leadHistory.map(p => p.warm) : syntheticSeries(warm, 1);
                const coldData = leadHistory ? leadHistory.map(p => p.cold) : syntheticSeries(cold, 2);

                // Stacked tops: cold bottom, warm middle, hot top
                const zeros   = Array(DAYS).fill(0) as number[];
                const coldTop = coldData;
                const warmTop = coldData.map((v, i) => v + warmData[i]);
                const hotTop  = warmTop.map((v, i) => v + hotData[i]);

                // For legend + tooltip (unstacked)
                const series = [
                  { label: T("Hot","Chaud"),  color: "#ef4444", data: hotData,  value: hot  },
                  { label: T("Warm","Tiède"), color: "#f59e0b", data: warmData, value: warm },
                  { label: T("Cold","Froid"), color: "#6366f1", data: coldData, value: cold },
                ].filter(s => s.value > 0);


                // Trim leading zeros — start chart from 1 day before first data point
                const firstDataIdx = hotTop.findIndex(v => v > 0);
                const startIdx = firstDataIdx > 0 ? Math.max(0, firstDataIdx - 1) : 0;
                const trim = <T,>(arr: T[]) => arr.slice(startIdx);
                const tHotTop  = trim(hotTop);
                const tWarmTop = trim(warmTop);
                const tColdTop = trim(coldTop);
                const tZeros   = trim(zeros);
                const tXLabels = trim(xLabels);
                const VDAYS    = tHotTop.length;

                // Rebuild stackedLayers with trimmed data
                const stackedLayers = [
                  { label: T("Cold","Froid"), color: "#6366f1", top: tColdTop, bot: tZeros,   value: cold },
                  { label: T("Warm","Tiède"), color: "#f59e0b", top: tWarmTop, bot: tColdTop, value: warm },
                  { label: T("Hot","Chaud"),  color: "#ef4444", top: tHotTop,  bot: tWarmTop, value: hot  },
                ].filter(s => s.value > 0);

                const W = 700, H = 280;
                const pL = 28, pR = 16, pT = 14, pB = 30;
                const cW = W - pL - pR;
                const cH = H - pT - pB;
                const toX = (i: number) => pL + (i / Math.max(VDAYS - 1, 1)) * cW;

                const dataMax = Math.max(...tHotTop, 1);
                const niceMax = Math.max(Math.ceil(dataMax * 1.3), dataMax + 2);
                const yTicks = [0, Math.round(niceMax / 2), niceMax];
                const toY = (v: number) => pT + (1 - v / niceMax) * cH;

                function makeLine(data: number[]) {
                  const pts = data.map((v, i) => [toX(i), toY(v)] as [number, number]);
                  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const cpx = ((pts[i][0] + pts[i+1][0]) / 2).toFixed(1);
                    d += ` C ${cpx} ${pts[i][1].toFixed(1)}, ${cpx} ${pts[i+1][1].toFixed(1)}, ${pts[i+1][0].toFixed(1)} ${pts[i+1][1].toFixed(1)}`;
                  }
                  return { d, last: pts[pts.length - 1] };
                }

                function makeStackedArea(topData: number[], botData: number[]) {
                  const tp = topData.map((v, i) => [toX(i), toY(v)] as [number, number]);
                  const bp = botData.map((v, i) => [toX(i), toY(v)] as [number, number]);
                  let d = `M ${tp[0][0].toFixed(1)} ${tp[0][1].toFixed(1)}`;
                  for (let i = 0; i < tp.length - 1; i++) {
                    const cpx = ((tp[i][0] + tp[i+1][0]) / 2).toFixed(1);
                    d += ` C ${cpx} ${tp[i][1].toFixed(1)}, ${cpx} ${tp[i+1][1].toFixed(1)}, ${tp[i+1][0].toFixed(1)} ${tp[i+1][1].toFixed(1)}`;
                  }
                  d += ` L ${bp[bp.length-1][0].toFixed(1)} ${bp[bp.length-1][1].toFixed(1)}`;
                  for (let i = bp.length - 2; i >= 0; i--) {
                    const cpx = ((bp[i+1][0] + bp[i][0]) / 2).toFixed(1);
                    d += ` C ${cpx} ${bp[i+1][1].toFixed(1)}, ${cpx} ${bp[i][1].toFixed(1)}, ${bp[i][0].toFixed(1)} ${bp[i][1].toFixed(1)}`;
                  }
                  return d + ' Z';
                }

                return (
                  <>
                    {/* Legend — dot style */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                      {series.map(s => (
                        <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                          {s.label}
                        </span>
                      ))}
                    </div>

                    <div style={{ position: "relative" }}>
                      <svg
                        viewBox={`0 0 ${W} ${H}`}
                        style={{ width: "100%", height: "auto", display: "block", aspectRatio: `${W} / ${H}`, cursor: "crosshair" }}
                        preserveAspectRatio="none"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const relX = e.clientX - rect.left;
                          const relY = e.clientY - rect.top;
                          const vbX  = (relX / rect.width) * W;
                          const idx  = Math.max(0, Math.min(VDAYS - 1, Math.round((vbX - pL) / (cW / Math.max(VDAYS - 1, 1)))));
                          const realIdx = startIdx + idx;
                          const dayLabel = leadHistory
                            ? (() => { const d = new Date(leadHistory[realIdx].date); return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`; })()
                            : (tXLabels[idx] || `J-${VDAYS - 1 - idx}`);
                          const vbY = (relY / rect.height) * H;
                          const linePositions = stackedLayers.map(s => ({
                            label: s.label, color: s.color,
                            value: Math.round(s.top[idx] - (s.bot[idx] ?? 0)),
                            yPx: toY(s.top[idx]),
                          }));
                          const THRESHOLD = 18;
                          const closest = linePositions.reduce<typeof linePositions[0] | null>((best, s) => {
                            const dist = Math.abs(vbY - s.yPx);
                            if (dist > THRESHOLD) return best;
                            if (!best) return s;
                            return dist < Math.abs(vbY - best.yPx) ? s : best;
                          }, null);
                          setChartTip({
                            x: relX, y: relY, day: dayLabel,
                            entries: series.map(s => ({ label: s.label, value: Math.round(s.data[realIdx] ?? 0), color: s.color })),
                            focused: closest?.label ?? null,
                          });
                        }}
                        onMouseLeave={() => setChartTip(null)}
                      >
                        {/* Y grid + left-side labels */}
                        {yTicks.map((v, i) => {
                          const y = toY(v);
                          return (
                            <g key={i}>
                              <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#e4e8ef" strokeWidth="1" />
                              <text x={pL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#b0b8c9" fontFamily="var(--mono)" fontWeight="600">{v}</text>
                            </g>
                          );
                        })}

                        {/* X labels */}
                        {tXLabels.map((lbl, i) =>
                          lbl ? <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize={10} fill="#94a3b8" fontWeight="700" fontFamily="var(--font)">{lbl}</text> : null
                        )}

                        <defs>
                          {stackedLayers.map(s => (
                            <linearGradient key={s.label} id={`grad-${s.label}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%"   stopColor={s.color} stopOpacity="0.22" />
                              <stop offset="100%" stopColor={s.color} stopOpacity="0.03" />
                            </linearGradient>
                          ))}
                        </defs>
                        {/* Stacked areas */}
                        {stackedLayers.map(s => (
                          <path key={`area-${s.label}`} d={makeStackedArea(s.top, s.bot)} fill={`url(#grad-${s.label})`} />
                        ))}
                        {/* Lines + dots on top of each stack */}
                        {stackedLayers.map(s => {
                          const { d, last } = makeLine(s.top);
                          return (
                            <g key={`line-${s.label}`}>
                              <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx={last[0]} cy={last[1]} r={9}   fill={s.color} fillOpacity="0.15" />
                              <circle cx={last[0]} cy={last[1]} r={4.5} fill={s.color} stroke="#fff" strokeWidth="2.5" />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Tooltip */}
                      {chartTip && (
                        <div style={{
                          position: "absolute",
                          left: Math.min(chartTip.x + 14, 9999),
                          top: chartTip.y > 160 ? chartTip.y - 80 : chartTip.y + 10,
                          background: "var(--surface)",
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          boxShadow: "var(--shadow-md)",
                          padding: "8px 12px",
                          fontSize: 12,
                          pointerEvents: "none",
                          zIndex: 100,
                          minWidth: 110,
                        }}>
                          <div style={{ fontWeight: 700, color: "var(--muted)", marginBottom: 6, fontSize: 11 }}>{chartTip.day}</div>
                          {(chartTip.focused
                            ? chartTip.entries.filter(e => e.label === chartTip.focused)
                            : chartTip.entries
                          ).map(e => {
                            const typeKey = e.label.toUpperCase().includes("HOT") ? "HOT" : e.label.toUpperCase().includes("WARM") ? "WARM" : "COLD";
                            const lastLead = lastLeadByType[typeKey];
                            return (
                              <div key={e.label} style={{ marginBottom: 4 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                                  <span style={{ color: "var(--text)", fontWeight: 600 }}>{e.label}</span>
                                  <span style={{ marginLeft: "auto", fontWeight: 700, color: e.color, fontFamily: "var(--mono)" }}>{e.value}</span>
                                </div>
                                {lastLead && chartTip.focused && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, paddingTop: 5, borderTop: "1px solid var(--line)" }}>
                                    {lastLead.avatarUrl ? (
                                      <img src={lastLead.avatarUrl} alt={lastLead.name} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                                    ) : (
                                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: e.color, opacity: 0.2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: e.color, flexShrink: 0 }}>
                                        {lastLead.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{lastLead.name}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {(convPct > 0 || hot > 0) && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                        {convPct > 0 ? (
                          <span style={{
                            background: "rgba(16,185,129,0.12)", color: "#10b981",
                            fontSize: 11, fontWeight: 700,
                            padding: "4px 10px", borderRadius: 20,
                            border: "1px solid rgba(16,185,129,0.25)",
                          }}>
                            {convPct}% {T("conversion", "conversion")}
                          </span>
                        ) : <span />}
                        {hot > 0 && (
                          <a href="/leads" style={{
                            display: "flex", alignItems: "center", gap: 6,
                            fontSize: 12, fontWeight: 700, color: "#c0392b",
                            textDecoration: "none", opacity: 0.9,
                          }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 0 2px rgba(239,68,68,0.2)", flexShrink: 0 }} />
                            {hot} {T("hot lead", "lead chaud")}{hot > 1 ? "s" : ""} {T("to contact", "à contacter")} →
                          </a>
                        )}
                      </div>
                    )}
                  </>
                );
              })() : (
                <div className="emptyState" style={{ padding: "32px 24px" }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{T("Your pipeline is empty", "Votre pipeline est vide")}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{T("Install the extension and browse LinkedIn.", "Installez l'extension et naviguez sur LinkedIn.")}</div>
                </div>
              )}
            </div>
          </article>

          {/* Quota card */}
          <article className="card card--nobar">
            <div className="cardHeader">
              <span className="cardTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: "rgba(16,185,129,0.1)", color: "#10b981", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><circle cx="18" cy="6" r="4" fill="currentColor" stroke="none" opacity="0.3"/><path d="M18 4v4l2 2" stroke="currentColor"/>
                  </svg>
                </span>
                {T("Quota usage", "Utilisation du quota")}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span className="badge info" style={{ fontSize: 10 }}>{plan}</span>
                {isTrial && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                    color: "#d97706", background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.35)",
                    borderRadius: 4, padding: "2px 6px", lineHeight: 1.5,
                    textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>
                    {trialDaysLeft ? `Trial · ${trialDaysLeft}d` : "Trial"}
                  </span>
                )}
              </div>
            </div>
            <div className="cardBody" style={{ paddingTop: 8 }}>
              {[
                { label: T("Messages / month", "Messages / mois"), used: msgUsed,  limit: msgLimit,  left: msgLeft,  tone: resolveUsageTone(msgUsed,  msgLimit) },
                ...(showSeoQuota ? [{ label: T("SEO exports", "Exports SEO"), used: seoUsed, limit: seoLimit, left: seoLeft, tone: resolveUsageTone(seoUsed, seoLimit) }] : []),
                { label: T("Scans / month",     "Scans / mois"),    used: scanUsed, limit: scanLimit, left: scanLeft, tone: resolveUsageTone(scanUsed, scanLimit) },
              ].map(({ label, used, limit, left, tone }) => {
                const fillColor = tone === "good" ? "#10b981" : tone === "warn" ? "#f59e0b" : "#ef4444";
                const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                return (
                  <div key={String(label)} className="quotaItem3">
                    <div className="quotaItem3Top">
                      <span className="quotaItem3Label">{label}</span>
                      <span className="quotaItem3Nums">{used.toLocaleString()} / {limit.toLocaleString()}</span>
                    </div>
                    <div className="quotaItem3Bar">
                      <div style={{ width: `${pct}%`, background: fillColor, height: "100%", borderRadius: 999, transition: "width 0.4s ease" }} />
                    </div>
                    <div className="quotaItem3Bottom">
                      <span style={{ color: fillColor, fontSize: 11, fontWeight: 700 }}>{left.toLocaleString()} {T("left", "restant")}</span>
                    </div>
                  </div>
                );
              })}
              {/* Feature indicators */}
              <div className="quotaFeatures">
                <p className="quotaFeaturesTitle">{T("Features", "Fonctionnalités")}</p>
                <div className="quotaFeaturesGrid">
                  {[
                    { key: "exportCsv",     label: T("CSV export enabled",  "Export CSV activé") },
                    { key: "sendNow",       label: T("Send now enabled",    "Envoi direct activé") },
                    { key: "icpAssistant",  label: T("AI scanner enabled",  "Scan IA activé") },
                  ].map(({ key, label }) => {
                    const on = !!features[key];
                    return (
                      <div key={key} className={`quotaFeatureItem${on ? " quotaFeatureItem--on" : ""}`}>
                        <span className="quotaFeatureCheck">
                          {on ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          )}
                        </span>
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next reset */}
              {(() => {
                const periodEndDate = safeDate(user.periodEnd ?? null);
                const resetDate = periodEndDate ?? (() => {
                  const now = new Date();
                  const signupDate = safeDate(user.createdAt ?? null);
                  const day = signupDate ? signupDate.getDate() : now.getDate();
                  return new Date(now.getFullYear(), now.getMonth() + 1, day);
                })();
                const formatted = resetDate.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
                return (
                  <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{T("Next reset", "Prochain reset")}</span>
                    <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 700 }}>{formatted}</span>
                  </div>
                );
              })()}
            </div>
          </article>
        </div>
      </div>
    </AppLayout>
  );
}
