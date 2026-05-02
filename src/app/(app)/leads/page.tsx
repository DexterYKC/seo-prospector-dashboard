"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, fetchDashboard } from "@/lib/api";
import type { LeadRecord } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { AppLayout } from "@/components/AppLayout";
import { LeadDrawer } from "@/components/LeadDrawer";
import { useToast } from "@/components/Toast";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

type Filter = "ALL" | "HOT" | "WARM" | "COLD";

const PAGE_SIZE = 20;

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
  const raw = String(lead.leadType || lead.decision?.leadType || "").toUpperCase().trim();
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

function getOpportunity(lead: LeadRecord) {
  const opps = Array.isArray(lead.opportunities) ? lead.opportunities : [];
  // Show the hottest opportunity (HOT > WARM > COLD)
  const hot  = opps.find((o) => String(o.leadType || "").toUpperCase().includes("HOT"));
  if (hot) return hot;
  const warm = opps.find((o) => String(o.leadType || "").toUpperCase().includes("WARM"));
  if (warm) return warm;
  return opps.find((o) => String(o.opportunityStatus || "").toUpperCase() === "PRIMARY") || opps[0] || null;
}

function LeadAvatar({ avatarUrl, name, cls }: { avatarUrl?: string | null; name: string; cls: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = name.charAt(0).toUpperCase();
  if (avatarUrl && !imgFailed) {
    return (
      <div className={`leadTableAvatar ${cls}`} style={{ padding: 0, overflow: "hidden" }}>
        <img
          src={avatarUrl}
          alt={name}
          className="leadTableAvatarImg"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }
  return <div className={`leadTableAvatar ${cls}`}>{initial}</div>;
}

function getSignalLabel(lead: LeadRecord, lang: string): string {
  const raw = String(lead.decision?.final || lead.ui?.actionLabel || "").toUpperCase();
  if (raw.includes("CONTACT_NOW") || raw.includes("CONTACT NOW") || raw.includes("CONTACTER"))
    return lang === "fr" ? "Contacter maintenant" : "Contact now";
  if (raw.includes("CONTACT_SOFT") || raw.includes("DECISION") || raw.includes("TROUVER") || raw.includes("FIND"))
    return lang === "fr" ? "Trouver le décideur" : "Find decision maker";
  if (raw.includes("NURTURE") || raw.includes("NOURRIR"))
    return lang === "fr" ? "Nourrir la relation" : "Nurture";
  return lead.ui?.actionLabel || lead.decision?.final || "—";
}

function safeDate(iso: string | null | undefined, locale?: string) {
  if (!iso) return "—";
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t).toLocaleDateString(locale) : "—";
}

function exportToCsv(leads: LeadRecord[]) {
  const headers = ["Name", "Company", "Website", "Score", "Confidence", "Signal", "LinkedIn URL", "Captured"];
  const rows = leads.map((l) => {
    const opp = getOpportunity(l);
    return [
      getLeadName(l),
      opp?.company || l.company || "",
      opp?.website  || l.website  || "",
      getLeadType(l),
      l.ui?.confidence || l.decision?.confidence || "",
      l.ui?.actionLabel || l.decision?.final || "",
      l.profileUrl || "",
      l.updatedAt  || l.createdAt || "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const csv  = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" | null }) {
  const isDesc = active && dir === "desc";
  return (
    <svg width="16" height="16" viewBox="0 0 10 10" fill="currentColor"
      style={{ marginLeft: 6, flexShrink: 0, verticalAlign: "middle", display: "inline-block", opacity: active ? 1 : 0.25, color: active ? "var(--brand)" : "inherit", transition: "opacity 0.15s, color 0.15s", transform: isDesc ? "rotate(180deg)" : "none" }}>
      <path d="M5 1.5L9.5 8H0.5L5 1.5Z" />
    </svg>
  );
}

export default function LeadsPage() {
  const router              = useRouter();
  const { token, setToken } = useSession();
  const { data: userData }  = useUserData();
  const { toast }           = useToast();
  const { lang }            = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const plan        = String(userData?.user?.plan || "FREE").toUpperCase();
  const trialEndsAt = userData?.user?.trialEndsAt;
  const trialActive = trialEndsAt ? Date.parse(trialEndsAt) > Date.now() : false;
  const isFreeLocked = plan === "FREE" && !trialActive;

  const [leads,        setLeads]        = useState<LeadRecord[]>([]);
  const [busy,         setBusy]         = useState(false);
  const [error,        setError]        = useState("");
  const [filter,       setFilter]       = useState<Filter>("ALL");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  type SortKey = "prospect" | "score" | "updated";
  type SortDir = "asc" | "desc";
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const [tableOverflows, setTableOverflows] = useState(false);

  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const check = () => setTableOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [leads, filter, search]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const out = await fetchDashboard(token);
      setLeads(Array.isArray(out.leads) ? out.leads : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null); router.replace("/login"); return;
      }
      setError(err instanceof ApiError ? `${err.code}: ${err.message}` : "LOAD_FAILED");
    } finally {
      setBusy(false);
    }
  }, [token, setToken, router]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter, search]);

  // Auto-refresh: when tab becomes visible again (user switches back from extension)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  // Polling every 20s while page is open
  useEffect(() => {
    const id = setInterval(() => { if (!busy) void load(); }, 20_000);
    return () => clearInterval(id);
  }, [load, busy]);

  const scoreOrder: Record<string, number> = { HOT: 0, WARM: 1, COLD: 2 };

  const filtered = useMemo(() => {
    let list = leads;
    if (filter !== "ALL") list = list.filter((l) => getLeadType(l) === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((l) => {
        const opp = getOpportunity(l);
        return (
          getLeadName(l).toLowerCase().includes(q) ||
          String(opp?.company || l.company || "").toLowerCase().includes(q) ||
          String(opp?.website  || l.website  || "").toLowerCase().includes(q)
        );
      });
    }
    if (sortKey) {
      list = [...list].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "prospect") {
          cmp = getLeadName(a).localeCompare(getLeadName(b));
        } else if (sortKey === "score") {
          cmp = (scoreOrder[getLeadType(a)] ?? 99) - (scoreOrder[getLeadType(b)] ?? 99);
        } else if (sortKey === "updated") {
          const ta = Date.parse(a.updatedAt || a.createdAt || "0");
          const tb = Date.parse(b.updatedAt || b.createdAt || "0");
          cmp = tb - ta; // newest first by default
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [leads, filter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    ALL:  leads.length,
    HOT:  leads.filter((l) => getLeadType(l) === "HOT").length,
    WARM: leads.filter((l) => getLeadType(l) === "WARM").length,
    COLD: leads.filter((l) => getLeadType(l) === "COLD").length,
  }), [leads]);

  // Bulk select helpers
  const pageIds      = paginated.map((l) => l.id || "").filter(Boolean);
  const allPageSel   = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSel  = pageIds.some((id) => selectedIds.has(id));

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSel) pageIds.forEach((id) => next.delete(id));
      else            pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else              next.add(id);
      return next;
    });
  }

  function handleExport() {
    if (filtered.length === 0) return;
    if (isFreeLocked) { toast(T("Upgrade to export leads", "Passez à un plan payant pour exporter"), "error"); return; }
    exportToCsv(filtered);
    toast(`${filtered.length} ${T("leads exported to CSV", "leads exportés en CSV")}`, "success");
  }

  function handleBulkExport() {
    if (isFreeLocked) { toast(T("Upgrade to export leads", "Passez à un plan payant pour exporter"), "error"); return; }
    const sel = leads.filter((l) => l.id && selectedIds.has(l.id));
    exportToCsv(sel);
    toast(`${sel.length} ${T("leads exported to CSV", "leads exportés en CSV")}`, "success");
    setSelectedIds(new Set());
  }

  async function handleBulkDelete() {
    const sel = leads.filter((l) => l.id && selectedIds.has(l.id));
    if (sel.length === 0) return;
    const confirmed = window.confirm(
      T(`Delete ${sel.length} lead(s)? This cannot be undone.`, `Supprimer ${sel.length} lead(s) ? Cette action est irréversible.`)
    );
    if (!confirmed) return;
    const profileUrls = sel.map((l) => l.profileUrl).filter(Boolean) as string[];
    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileUrls }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!data.ok) { toast(data.error || T("Delete failed", "Échec de la suppression"), "error"); return; }
      setLeads((prev) => prev.filter((l) => !profileUrls.includes(l.profileUrl || "")));
      setSelectedIds(new Set());
      toast(`${sel.length} ${T("lead(s) deleted", "lead(s) supprimé(s)")}`, "success");
    } catch {
      toast(T("Delete failed", "Échec de la suppression"), "error");
    }
  }

  return (
    <AppLayout className="leadsPage">
      <div className="pageHeader">
        <div className="pageTitleGroup">
          <div className="pageTitleIconBox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>
          </div>
          <div>
            <h1 className="pageTitle">Leads</h1>
            <p className="pageSubtitle">{T("Capture and qualify your LinkedIn prospects", "Capturez et qualifiez vos prospects LinkedIn")}</p>
          </div>
        </div>
        <div className="row">
          <input
            className="tableSearch"
            placeholder={T("Search…", "Rechercher…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {leads.length > 0 && !isFreeLocked && (
            <button className="btn btnExportCsv" onClick={handleExport}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          )}
          <button className="btnRefresh" onClick={() => void load()} disabled={busy} title={T("Refresh", "Actualiser")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s ease", transform: busy ? "rotate(360deg)" : "none" }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="pageContent">
        {error && <div className="errorBox">{error}</div>}

        <div className={`leadsContentWrap${tableOverflows ? " leadsOverflows" : ""}`}>
        <div className="leadStatBar" style={{ padding: 0 }}>
          {([
            { key: "ALL"  as Filter, label: T("All", "Tous"),     color: "var(--brand)", bg: "rgba(59,130,246,0.08)",  count: counts.ALL  },
            { key: "HOT"  as Filter, label: "Hot",                color: "#ef4444",      bg: "rgba(239,68,68,0.08)",   count: counts.HOT  },
            { key: "WARM" as Filter, label: "Warm",               color: "#f59e0b",      bg: "rgba(245,158,11,0.08)",  count: counts.WARM },
            { key: "COLD" as Filter, label: "Cold",               color: "#10b981",      bg: "rgba(16,185,129,0.08)", count: counts.COLD },
          ]).map(({ key, label, color, bg, count }, i, arr) => {
            const active = filter === key;
            return (
              <button
                key={key}
                className="leadStatItem"
                onClick={() => setFilter(key)}
                style={{
                  background: active ? color : bg,
                  borderRight: i < arr.length - 1 ? "1px solid var(--line)" : "none",
                  cursor: "pointer", border: "none", minWidth: 80,
                  transition: "background 0.18s, transform 0.18s ease, box-shadow 0.18s ease",
                }}
              >
                <span className="leadStatNum" style={{ color: active ? "#fff" : color, fontSize: 20 }}>{count}</span>
                <span className="leadStatLabel" style={{ color: active ? "rgba(255,255,255,0.85)" : "var(--muted)" }}>{label}</span>
              </button>
            );
          })}
        </div>

        <article className="card leadsCard">

          <div className="cardBodyFlush">
            {busy && leads.length === 0 ? (
              <div className="emptyState">{T("Loading leads…", "Chargement des leads…")}</div>
            ) : filtered.length === 0 ? (
              <div className="emptyState">
                {leads.length === 0
                  ? T("No leads yet. Run the extension while browsing LinkedIn to capture prospects.", "Aucun lead pour l'instant. Utilisez l'extension en naviguant sur LinkedIn pour capturer des prospects.")
                  : T("No leads match this filter.", "Aucun lead ne correspond à ce filtre.")}
              </div>
            ) : (
              <>
                <div className="tableWrap" ref={tableWrapRef}>
                  <table className="dataTable">
                    <thead>
                      <tr>
                        <th style={{ width: 36, paddingRight: 4 }}>
                          <input
                            type="checkbox"
                            checked={allPageSel}
                            ref={(el) => { if (el) el.indeterminate = somePageSel && !allPageSel; }}
                            onChange={toggleAll}
                          />
                        </th>
                        <th onClick={() => handleSort("prospect")} className="thSortable">
                          {T("Prospect", "Prospect")}
                          <SortIcon active={sortKey === "prospect"} dir={sortKey === "prospect" ? sortDir : null} />
                        </th>
                        <th>{T("Company", "Entreprise")}</th>
                        <th onClick={() => handleSort("score")} className="thSortable">
                          {T("Score", "Score")}
                          <SortIcon active={sortKey === "score"} dir={sortKey === "score" ? sortDir : null} />
                        </th>
                        <th>{T("Confidence", "Confiance")}</th>
                        <th onClick={() => handleSort("updated")} className="thSortable">
                          {T("Updated", "Mis à jour")}
                          <SortIcon active={sortKey === "updated"} dir={sortKey === "updated" ? sortDir : null} />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((lead, i) => {
                        const lt   = getLeadType(lead);
                        const cls  = lt.toLowerCase();
                        const opp  = getOpportunity(lead);
                        const conf = String(lead.ui?.confidence || lead.decision?.confidence || "—");
                        const sig  = getSignalLabel(lead, lang);
                        const lid  = lead.id || String(i);
                        const isSel = selectedIds.has(lid);
                        return (
                          <tr
                            key={lid}
                            style={{ cursor: "pointer", background: isSel ? "rgba(59,130,246,0.04)" : undefined }}
                          >
                            <td style={{ width: 36, paddingRight: 4 }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => toggleOne(lid)}
                              />
                            </td>
                            <td onClick={() => setSelectedLead(lead)}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <LeadAvatar
                                  avatarUrl={lead.avatarUrl}
                                  name={getLeadName(lead)}
                                  cls={cls}
                                />
                                <div>
                                  <div className="prospectName">{getLeadName(lead)}</div>
                                </div>
                              </div>
                            </td>
                            <td onClick={() => setSelectedLead(lead)}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{opp?.company || lead.company || "—"}</span>
                                {(lead.opportunities?.length ?? 0) > 1 && (
                                  <span className="oppCountBubble">{lead.opportunities!.length}</span>
                                )}
                              </div>
                              <div className="prospectUrl">{opp?.website || lead.website || "—"}</div>
                            </td>
                            <td onClick={() => setSelectedLead(lead)}>
                              <span className={`lbadge ${cls}`}>
                                {lt === "HOT" && <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-4.4 0-8-3.6-8-8 0-3 1.7-5.7 4.3-7.1C8.1 9.5 8 11 8 11s1.5-1.5 2-4c1.5 2 1.5 4 1.5 4s1-1 1-3c2 2 2.5 5 2.5 5s.5-1 .5-2.5C17.5 13 20 16 20 19c0 2.2-.9 4.2-2.3 5.6C16.3 22.5 14.2 23 12 23z"/></svg>}
                                {lt === "WARM" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>}
                                {lt === "COLD" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/></svg>}
                                {lt}
                              </span>
                            </td>
                            <td onClick={() => setSelectedLead(lead)}>
                              <span className={conf.toUpperCase() === "HIGH" ? "confHigh" : conf.toUpperCase() === "MEDIUM" ? "confMedium" : "confLow"}>
                                {conf}
                              </span>
                            </td>
                            <td onClick={() => setSelectedLead(lead)} className="muted small">{safeDate(lead.updatedAt || lead.createdAt, locale)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <span className="paginationInfo">
                      {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                    <div className="row">
                      <button className="btn sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← {T("Prev", "Préc.")}</button>
                      <span className="paginationPages">{page} / {totalPages}</span>
                      <button className="btn sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{T("Next", "Suiv.")} →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </article>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="bulkBar">
          <span className="bulkCount">{selectedIds.size} {T("selected", "sélectionnés")}</span>
          {!isFreeLocked && <button className="btn sm" onClick={handleBulkExport}>Export CSV</button>}
          <button className="btn sm" style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }} onClick={handleBulkDelete}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {T("Delete", "Supprimer")}
          </button>
          <button className="bulkClear" onClick={() => setSelectedIds(new Set())} title={T("Clear selection", "Effacer la sélection")}>✕</button>
        </div>
      )}

      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} locked={isFreeLocked} />
    </AppLayout>
  );
}
