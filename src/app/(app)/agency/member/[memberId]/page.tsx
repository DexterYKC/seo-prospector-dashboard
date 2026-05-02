"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ApiError, fetchMemberDashboard } from "@/lib/api";
import type { LeadRecord, DashboardResponse } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { AppLayout } from "@/components/AppLayout";

type SeoStatus = "critical" | "moderate" | "good";

function getSeoStatus(leadType: string): SeoStatus {
  const t = (leadType || "").toUpperCase();
  if (t.includes("HOT") || t.includes("SEO CRITICAL")) return "critical";
  if (t.includes("WARM") || t.includes("SEO MODERATE")) return "moderate";
  return "good";
}

function getLeadType(lead: LeadRecord): "HOT" | "WARM" | "COLD" {
  const raw = String(lead.leadType || lead.decision?.leadType || "").toUpperCase();
  if (raw.includes("HOT"))  return "HOT";
  if (raw.includes("WARM")) return "WARM";
  return "COLD";
}

function getLeadName(lead: LeadRecord) {
  const n = String(lead.name || "").trim();
  if (n) return n;
  return `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown";
}

export default function MemberDashboardPage() {
  const router   = useRouter();
  const params   = useParams();
  const memberId = String(params?.memberId || "");

  const { token, setToken } = useSession();
  const { data: myData }    = useUserData();

  const [data,  setData]  = useState<DashboardResponse | null>(null);
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState("");

  // Only AGENCY users can access this page
  const myPlan     = String(myData?.user?.plan || "").toUpperCase();
  const isAgency   = myPlan === "AGENCY";

  const load = useCallback(async () => {
    if (!token || !memberId) return;
    setBusy(true);
    setError("");
    try {
      const out = await fetchMemberDashboard(token, memberId);
      setData(out);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null); router.replace("/login"); return;
      }
      if (err instanceof ApiError && err.status === 403) {
        setError("You don't have permission to view this member's data.");
        return;
      }
      setError(err instanceof ApiError ? err.message : "LOAD_FAILED");
    } finally {
      setBusy(false);
    }
  }, [token, memberId, setToken, router]);

  useEffect(() => { void load(); }, [load]);

  const member   = data?.user;
  const leads    = Array.isArray(data?.leads) ? data!.leads! : [];
  const hotLeads = leads.filter((l) => getLeadType(l) === "HOT");
  const warmLeads = leads.filter((l) => getLeadType(l) === "WARM");

  const seoEntries = useMemo(() => leads.filter((l) => {
    const lt = String(l.leadType || l.decision?.leadType || "").toUpperCase();
    return getSeoStatus(lt) !== "good";
  }), [leads]);

  const memberName = String(member?.fullName || member?.email?.split("@")[0] || "Member");

  if (!isAgency && !busy) {
    return (
      <AppLayout>
        <div className="pageContent">
          <article className="card extensionBanner">
            <div className="extensionBannerBody">
              <div className="extensionBannerEmoji">🔒</div>
              <div>
                <div className="extensionBannerTitle">Agency plan required</div>
                <a href="/account" className="btn primary" style={{ marginTop: 16, display: "inline-flex" }}>View plans →</a>
              </div>
            </div>
          </article>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pageHeader">
        <div className="pageTitleGroup">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="btn ghost sm"
              onClick={() => router.back()}
              style={{ fontSize: 12 }}
            >
              ← Back
            </button>
            <div>
              <h1 className="pageTitle">{memberName}</h1>
              <p className="pageSubtitle">{member?.email || "—"} · {leads.length} leads</p>
            </div>
          </div>
        </div>
        <div className="row">
          {leads.length > 0 && (
            <div className="row" style={{ gap: 6 }}>
              <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#c0392b", fontSize: 12, fontWeight: 700 }}>{hotLeads.length} HOT</span>
              <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(245,158,11,0.1)", color: "#b45309", fontSize: 12, fontWeight: 700 }}>{warmLeads.length} WARM</span>
            </div>
          )}
          <button className="btn ghost" onClick={() => void load()} disabled={busy}>
            {busy ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="pageContent">
        {error && <div className="errorBox">{error}</div>}
        {busy && !data && <div className="emptyState">Loading…</div>}

        {!busy && !error && data && (
          <>
            {/* Leads */}
            <article className="card">
              <div className="cardHeader">
                <span className="cardTitle">Leads</span>
                <span className="badge info">{leads.length}</span>
              </div>
              <div className="cardBodyFlush">
                {leads.length === 0 ? (
                  <div className="emptyState">No leads captured yet.</div>
                ) : (
                  <div className="tableWrap">
                    <table className="dataTable">
                      <thead>
                        <tr>
                          <th>Prospect</th>
                          <th>Company</th>
                          <th>Score</th>
                          <th>Signal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead, i) => {
                          const lt  = getLeadType(lead);
                          const cls = lt.toLowerCase();
                          const opp = lead.opportunities?.[0];
                          return (
                            <tr key={lead.id || i}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div className={`leadTableAvatar ${cls}`}>
                                    {getLeadName(lead).charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="prospectName">{getLeadName(lead)}</div>
                                    {lead.profileUrl && (
                                      <a href={lead.profileUrl} target="_blank" rel="noopener noreferrer" className="prospectUrl truncate" style={{ maxWidth: 180, display: "block" }}>
                                        LinkedIn ↗
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{opp?.company || lead.company || "—"}</div>
                                <div className="prospectUrl">{opp?.website || lead.website || "—"}</div>
                              </td>
                              <td><span className={`lbadge ${cls}`}>{lt}</span></td>
                              <td><span className="small muted">{lead.ui?.actionLabel || lead.decision?.final || "—"}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </article>

            {/* SEO issues */}
            {seoEntries.length > 0 && (
              <article className="card">
                <div className="cardHeader">
                  <span className="cardTitle">SEO opportunities</span>
                  <span className="badge bad">{seoEntries.length}</span>
                </div>
                <div className="cardBodyFlush">
                  {seoEntries.map((lead, i) => {
                    const lt     = String(lead.leadType || lead.decision?.leadType || "").toUpperCase();
                    const status = getSeoStatus(lt);
                    const opp    = lead.opportunities?.[0];
                    return (
                      <div key={lead.id || i} className="seoAuditItem">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className={`seoScoreRing ${status}`}>
                            {status === "critical" ? "!" : "~"}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="seoAuditName">{opp?.company || lead.company || "—"}</div>
                            <div className="seoAuditUrl truncate">{opp?.website || lead.website || "—"}</div>
                          </div>
                          <span className={`seobadge ${status}`}>{status === "critical" ? "Critical" : "Moderate"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
