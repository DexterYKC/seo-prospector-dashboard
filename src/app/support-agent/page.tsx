"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAgentTickets, fetchAgentTicket, replyAgentTicket, updateAgentTicketStatus,
  fetchAgentUsers, updateAgentUser, resetAgentUserPassword,
  fetchAgentModerators,
  type SupportTicket, type SupportMessage, type AgentUser, type TicketStatus,
} from "@/lib/api";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";
import { LangSwitchDark } from "@/components/LangSwitch";

const AGENT_TOKEN_KEY = "agent_token";
const AGENT_INFO_KEY  = "agent_info";

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  open:        { bg: "#3b82f622", color: "#3b82f6" },
  in_progress: { bg: "#f59e0b22", color: "#d97706" },
  closed:      { bg: "#64748b22", color: "#64748b" },
};
const PLANS = ["FREE", "STARTER", "PRO", "AGENCY"];

function fmt(iso: string, locale = "en-US") {
  return new Date(iso).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SupportAgentPage() {
  const router = useRouter();
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const STATUS_LABEL: Record<string, string> = {
    open:        T("Open",        "Ouvert"),
    in_progress: T("In progress", "En cours"),
    closed:      T("Closed",      "Fermé"),
  };

  const [agentToken, setAgentToken] = useState<string | null>(null);
  const [agentInfo,  setAgentInfo]  = useState<{ name: string; email: string } | null>(null);
  const [activeTab,  setActiveTab]  = useState<"tickets" | "users" | "moderators">("tickets");

  // ── Tickets ──────────────────────────────────────────────────────────────
  const [tickets,    setTickets]    = useState<(SupportTicket & { user?: { email: string; name?: string } })[]>([]);
  const [tickLoading, setTickLoading] = useState(false);
  const [tickError,  setTickError]  = useState("");
  const [viewing,    setViewing]    = useState<string | null>(null);
  const [viewTicket, setViewTicket] = useState<(SupportTicket & { user?: { email: string; name?: string } }) | null>(null);
  const [viewMsgs,   setViewMsgs]   = useState<SupportMessage[]>([]);
  const [reply,      setReply]      = useState("");
  const [replying,   setReplying]   = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ── Users ─────────────────────────────────────────────────────────────────
  const [users,       setUsers]       = useState<AgentUser[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearch,  setUserSearch]  = useState("");
  const [userPlan,    setUserPlan]    = useState("");
  const [userError,   setUserError]   = useState("");
  const [editingUser, setEditingUser] = useState<AgentUser | null>(null);
  const [editPlan,    setEditPlan]    = useState("");
  const [editStatus,  setEditStatus]  = useState("");
  const [editEmail,   setEditEmail]   = useState("");
  const [editPwd,     setEditPwd]     = useState("");
  const [editSaving,  setEditSaving]  = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<{ userId: string; email: string } | null>(null);
  const [notifyTitle,  setNotifyTitle]  = useState("");
  const [notifyMsg,    setNotifyMsg]    = useState("");
  const [notifyType,   setNotifyType]   = useState("info");
  const [notifying,    setNotifying]    = useState(false);

  async function agentSendNotif() {
    if (!agentToken || !notifyTarget || !notifyTitle) return;
    setNotifying(true);
    try {
      await fetch("/api/admin/notify", {
        method: "POST",
        headers: { Authorization: `Bearer ${agentToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ userId: notifyTarget.userId, title: notifyTitle, message: notifyMsg || null, type: notifyType, category: "admin" }),
      });
      setNotifyTarget(null); setNotifyTitle(""); setNotifyMsg(""); setNotifyType("info");
    } catch { /* ignore */ }
    finally { setNotifying(false); }
  }

  // ── Moderators ────────────────────────────────────────────────────────────
  const [mods,       setMods]       = useState<{ id: string; name: string; email: string; created_at: string }[]>([]);
  const [modLoading, setModLoading] = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(AGENT_TOKEN_KEY);
    if (!token) { router.replace("/login"); return; }
    setAgentToken(token);
    try { setAgentInfo(JSON.parse(localStorage.getItem(AGENT_INFO_KEY) || "{}")); } catch {}
  }, [router]);

  function logout() {
    localStorage.removeItem(AGENT_TOKEN_KEY);
    localStorage.removeItem(AGENT_INFO_KEY);
    router.replace("/login");
  }

  // ── Load tickets ──────────────────────────────────────────────────────────
  const loadTickets = useCallback(async () => {
    if (!agentToken) return;
    setTickLoading(true); setTickError("");
    try {
      const out = await fetchAgentTickets(agentToken);
      setTickets(out.tickets || []);
    } catch { setTickError(T("Failed to load tickets.", "Impossible de charger les tickets.")); }
    finally { setTickLoading(false); }
  }, [agentToken]);

  useEffect(() => {
    if (agentToken && activeTab === "tickets") void loadTickets();
  }, [agentToken, activeTab, loadTickets]);

  async function openTicket(id: string) {
    if (!agentToken) return;
    setTickError("");
    try {
      const out = await fetchAgentTicket(agentToken, id);
      setViewTicket(out.ticket);
      setViewMsgs(out.messages || []);
      setViewing(id);
    } catch { setTickError(T("Failed to load this ticket.", "Impossible de charger ce ticket.")); }
  }

  async function onReply() {
    if (!agentToken || !viewing || !reply.trim()) return;
    setReplying(true);
    try {
      await replyAgentTicket(agentToken, viewing, reply.trim());
      setReply("");
      await openTicket(viewing);
    } catch { setTickError(T("Failed to send.", "Impossible d'envoyer.")); }
    finally { setReplying(false); }
  }

  async function onChangeStatus(status: string) {
    if (!agentToken || !viewing) return;
    setUpdatingStatus(true);
    try {
      await updateAgentTicketStatus(agentToken, viewing, status as TicketStatus);
      setViewTicket(t => t ? { ...t, status: status as TicketStatus } : t);
      if (status === "closed" && viewTicket) {
        fetch("/api/admin/notify", {
          method: "POST",
          headers: { Authorization: `Bearer ${agentToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: viewTicket.user_id,
            title: T("Your support ticket has been closed", "Votre ticket support a été clôturé"),
            message: viewTicket.subject,
            type: "info",
            category: "ticket",
          }),
        }).catch(() => {});
      }
      await loadTickets();
    } catch { setTickError(T("Failed to change status.", "Impossible de changer le statut.")); }
    finally { setUpdatingStatus(false); }
  }

  // ── Load users ────────────────────────────────────────────────────────────
  async function loadUsers(q = userSearch, plan = userPlan) {
    if (!agentToken) return;
    setUserLoading(true); setUserError("");
    try {
      const out = await fetchAgentUsers(agentToken, { q: q || undefined, plan: plan || undefined });
      setUsers(out.users || []);
    } catch { setUserError(T("Failed to load users.", "Impossible de charger les utilisateurs.")); }
    finally { setUserLoading(false); }
  }

  useEffect(() => {
    if (agentToken && activeTab === "users") void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentToken, activeTab]);

  async function onSaveUser() {
    if (!agentToken || !editingUser) return;
    setEditSaving(true);
    try {
      const updates: { plan?: string; status?: string; email?: string } = {};
      if (editPlan && editPlan !== editingUser.plan) updates.plan = editPlan;
      if (editStatus && editStatus !== editingUser.status) updates.status = editStatus;
      if (editEmail && editEmail !== editingUser.email) updates.email = editEmail;
      if (Object.keys(updates).length > 0) await updateAgentUser(agentToken, editingUser.id, updates);
      if (editPwd && editPwd.length >= 8) await resetAgentUserPassword(agentToken, editingUser.id, editPwd);
      setEditingUser(null);
      await loadUsers();
    } catch { setUserError(T("Failed to update user.", "Impossible de mettre à jour l'utilisateur.")); }
    finally { setEditSaving(false); }
  }

  // ── Load moderators ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!agentToken || activeTab !== "moderators") return;
    setModLoading(true);
    fetchAgentModerators(agentToken)
      .then(out => setMods(out.moderators || []))
      .catch(() => {})
      .finally(() => setModLoading(false));
  }, [agentToken, activeTab]);

  if (!agentToken) return null;

  return (
    <div className="modShell">
      {/* Header */}
      <header className="modHeader">
        <div className="modHeader__brand">
          <span className="modHeader__dot" style={{ background: "#22c55e" }} />
          <strong>{T("Support Space", "Espace Support")}</strong>
          {agentInfo?.name && <span className="modHeader__name">— {agentInfo.name}</span>}
        </div>
        <LangSwitchDark style={{ marginRight: 8 }} /><button className="modHeader__logout" onClick={logout}>{T("Logout", "Déconnexion")}</button>
      </header>

      <main className="modMain">
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e2e8f0", marginBottom: 24 }}>
          {(["tickets", "users", "moderators"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 18px", fontSize: 13, fontWeight: 600,
                border: "none", background: "none", cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #2563eb" : "2px solid transparent",
                color: activeTab === tab ? "#2563eb" : "#64748b",
              }}
            >
              {tab === "tickets" ? "Tickets" : tab === "users" ? T("Users", "Utilisateurs") : T("Moderators", "Modérateurs")}
            </button>
          ))}
        </div>

        {/* ── TICKETS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "tickets" && (
          <>
            {tickError && <div className="modError">{tickError}</div>}

            {/* Ticket thread modal */}
            {viewing && viewTicket && (
              <div className="modModal__overlay">
                <div className="modModal">
                  <div className="modModal__head">
                    <div>
                      <h3>{viewTicket.subject}</h3>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {viewTicket.user?.email || viewTicket.user_id}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        className="modField"
                        style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, cursor: "pointer" }}
                        value={viewTicket.status}
                        onChange={e => void onChangeStatus(e.target.value)}
                        disabled={updatingStatus}
                      >
                        <option value="open">{T("Open", "Ouvert")}</option>
                        <option value="in_progress">{T("In progress", "En cours")}</option>
                        <option value="closed">{T("Closed", "Fermé")}</option>
                      </select>
                      <button className="modModal__close" onClick={() => { setViewing(null); setViewTicket(null); setViewMsgs([]); setReply(""); }}>✕</button>
                    </div>
                  </div>

                  <div className="modModal__body" style={{ gap: 8 }}>
                    {viewMsgs.map(m => (
                      <div key={m.id} style={{
                        alignSelf: m.sender_type === "admin" ? "flex-end" : "flex-start",
                        background: m.sender_type === "admin" ? "#2563eb" : "#f1f5f9",
                        color: m.sender_type === "admin" ? "#fff" : "#0f172a",
                        borderRadius: 10, padding: "10px 14px", maxWidth: "80%", fontSize: 13,
                        display: "flex", flexDirection: "column", gap: 4,
                      }}>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>
                          {m.sender_type === "admin" ? (m.sender_name || "Support") : (m.sender_name || T("User", "Utilisateur"))} · {fmt(m.created_at, locale)}
                        </div>
                        <div>{m.content}</div>
                      </div>
                    ))}
                    {viewMsgs.length === 0 && <p className="modMuted">{T("No messages.", "Aucun message.")}</p>}
                  </div>

                  {viewTicket.status !== "closed" && (
                    <div className="modModal__foot" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
                      <textarea
                        className="modField"
                        style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
                        rows={3}
                        placeholder={T("Your reply…", "Votre réponse…")}
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="modBtn modBtn--primary" onClick={() => void onReply()} disabled={replying || !reply.trim()}>
                          {replying ? T("Sending…", "Envoi…") : T("Reply", "Répondre")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="modSection__head">
              <h2>{T("Support tickets", "Tickets support")}</h2>
              <button className="modBtn" onClick={() => void loadTickets()}>{T("Refresh", "Rafraîchir")}</button>
            </div>

            {tickLoading ? <p className="modMuted">{T("Loading…", "Chargement…")}</p> : (
              <table className="modTable">
                <thead>
                  <tr>
                    <th>{T("Subject", "Sujet")}</th>
                    <th>{T("User", "Utilisateur")}</th>
                    <th>{T("Status", "Statut")}</th>
                    <th>{T("Created", "Créé le")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: "20px 16px", color: "#64748b", fontSize: 13 }}>{T("No tickets.", "Aucun ticket.")}</td></tr>
                  )}
                  {tickets.map(t => {
                    const sc = STATUS_COLOR[t.status] ?? STATUS_COLOR.closed;
                    return (
                      <tr key={t.id}>
                        <td><span className="modTable__title">{t.subject}</span></td>
                        <td className="modMuted" style={{ fontSize: 13 }}>{t.user?.email || t.user_id}</td>
                        <td>
                          <span className="modBadge" style={{ background: sc.bg, color: sc.color }}>
                            {STATUS_LABEL[t.status] ?? t.status}
                          </span>
                        </td>
                        <td className="modTable__date">{fmt(t.created_at, locale)}</td>
                        <td>
                          <div className="modTable__actions">
                            <button className="modBtn modBtn--edit" onClick={() => void openTicket(t.id)}>{T("Open", "Ouvrir")}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ── USERS TAB ────────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <>
            {userError && <div className="modError">{userError}</div>}

            {/* Notify modal */}
            {notifyTarget && (
              <div className="modModal__overlay">
                <div className="modModal">
                  <div className="modModal__head">
                    <h3>{T("Send notification", "Envoyer une notification")}</h3>
                    <button className="modModal__close" onClick={() => setNotifyTarget(null)}>✕</button>
                  </div>
                  <div className="modModal__body">
                    <div style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", borderRadius: 6, padding: "6px 10px", marginBottom: 4 }}>
                      {T("To", "À")} : <strong>{notifyTarget.email}</strong>
                    </div>
                    <div className="modFieldRow" style={{ marginTop: 8 }}>
                      {(["info", "warning", "danger", "success"] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setNotifyType(t)}
                          style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, border: "1px solid",
                            cursor: "pointer",
                            background: notifyType === t ? (t === "danger" ? "#fef2f2" : t === "warning" ? "#fffbeb" : t === "success" ? "#f0fdf4" : "#eff6ff") : "transparent",
                            color: t === "danger" ? "#dc2626" : t === "warning" ? "#d97706" : t === "success" ? "#16a34a" : "#3b82f6",
                            borderColor: t === "danger" ? "#fca5a5" : t === "warning" ? "#fcd34d" : t === "success" ? "#86efac" : "#93c5fd",
                          }}
                        >{t}</button>
                      ))}
                    </div>
                    <div className="modField">
                      <label>{T("Title *", "Titre *")}</label>
                      <input value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} placeholder={T("Notification title", "Titre de la notification")} />
                    </div>
                    <div className="modField">
                      <label>{T("Message (optional)", "Message (optionnel)")}</label>
                      <textarea rows={3} style={{ resize: "none" }} value={notifyMsg} onChange={e => setNotifyMsg(e.target.value)} placeholder={T("Details…", "Détails…")} />
                    </div>
                  </div>
                  <div className="modModal__foot">
                    <button className="modBtn" onClick={() => setNotifyTarget(null)}>{T("Cancel", "Annuler")}</button>
                    <button className="modBtn modBtn--primary" onClick={() => void agentSendNotif()} disabled={notifying || !notifyTitle}>
                      {notifying ? "…" : T("Send", "Envoyer")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit user modal */}
            {editingUser && (
              <div className="modModal__overlay">
                <div className="modModal">
                  <div className="modModal__head">
                    <h3>{T("Edit user", "Modifier l'utilisateur")}</h3>
                    <button className="modModal__close" onClick={() => setEditingUser(null)}>✕</button>
                  </div>
                  <div className="modModal__body">
                    <div style={{ fontSize: 13, color: "#64748b", background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                      <strong>{editingUser.full_name || editingUser.name || "—"}</strong> · {editingUser.email}
                    </div>
                    <div className="modFieldRow">
                      <div className="modField">
                        <label>Plan</label>
                        <select value={editPlan} onChange={e => setEditPlan(e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 13, background: "#f8fafc" }}>
                          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="modField">
                        <label>{T("Status", "Statut")}</label>
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 13, background: "#f8fafc" }}>
                          {["ACTIVE", "TRIALING", "EXPIRED", "CANCELED", "PAST_DUE"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="modField">
                      <label>{T("Change email", "Changer l'email")}</label>
                      <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder={editingUser.email} />
                    </div>
                    <div className="modField">
                      <label>{T("New password (min 8 chars)", "Nouveau mot de passe (min 8 car.)")}</label>
                      <input type="password" value={editPwd} onChange={e => setEditPwd(e.target.value)} placeholder={T("Leave empty to keep unchanged", "Laisser vide pour ne pas changer")} />
                    </div>
                  </div>
                  <div className="modModal__foot">
                    <button className="modBtn" onClick={() => setEditingUser(null)}>{T("Cancel", "Annuler")}</button>
                    <button
                      className="modBtn modBtn--primary"
                      onClick={() => void onSaveUser()}
                      disabled={editSaving || (!!editPwd && editPwd.length < 8)}
                    >
                      {editSaving ? T("Saving…", "Sauvegarde…") : T("Save", "Sauvegarder")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="modSection__head">
              <h2>{T("Users", "Utilisateurs")}</h2>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input
                style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, background: "#fff" }}
                placeholder={T("Search by email or name…", "Rechercher par email ou nom…")}
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") void loadUsers(userSearch, userPlan); }}
              />
              <select
                style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, background: "#fff" }}
                value={userPlan}
                onChange={e => { setUserPlan(e.target.value); void loadUsers(userSearch, e.target.value); }}
              >
                <option value="">{T("All plans", "Tous les plans")}</option>
                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button className="modBtn" onClick={() => void loadUsers(userSearch, userPlan)}>{T("Search", "Chercher")}</button>
            </div>

            {userLoading ? <p className="modMuted">{T("Loading…", "Chargement…")}</p> : (
              <table className="modTable">
                <thead>
                  <tr>
                    <th>{T("Name / Email", "Nom / Email")}</th>
                    <th>Plan</th>
                    <th>{T("Status", "Statut")}</th>
                    <th>{T("Joined", "Inscrit le")}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: "20px 16px", color: "#64748b", fontSize: 13 }}>{T("No users.", "Aucun utilisateur.")}</td></tr>
                  )}
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="modTable__title">{u.full_name || u.name || "—"}</div>
                        <div className="modTable__slug">{u.email}</div>
                      </td>
                      <td><span className="modBadge modBadge--published" style={{ fontSize: 11 }}>{u.plan}</span></td>
                      <td><span style={{ fontSize: 12, color: "#64748b" }}>{u.status}</span></td>
                      <td className="modTable__date">{new Date(u.created_at).toLocaleDateString(locale)}</td>
                      <td>
                        <div className="modTable__actions">
                          <button
                            className="modBtn"
                            style={{ color: "#6366f1", borderColor: "rgba(99,102,241,0.3)" }}
                            onClick={() => { setNotifyTarget({ userId: u.id, email: u.email }); setNotifyTitle(""); setNotifyMsg(""); setNotifyType("info"); }}
                          >
                            🔔
                          </button>
                          <button
                            className="modBtn modBtn--edit"
                            onClick={() => {
                              setEditingUser(u);
                              setEditPlan(u.plan);
                              setEditStatus(u.status);
                              setEditEmail(u.email);
                              setEditPwd("");
                            }}
                          >
                            {T("Edit", "Modifier")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* ── MODERATORS TAB ───────────────────────────────────────────────── */}
        {activeTab === "moderators" && (
          <>
            <div className="modSection__head"><h2>{T("Blog moderators", "Modérateurs blog")}</h2></div>
            {modLoading ? <p className="modMuted">{T("Loading…", "Chargement…")}</p> : (
              <table className="modTable">
                <thead>
                  <tr>
                    <th>{T("Name", "Nom")}</th>
                    <th>Email</th>
                    <th>{T("Created", "Créé le")}</th>
                  </tr>
                </thead>
                <tbody>
                  {mods.length === 0 && (
                    <tr><td colSpan={3} style={{ padding: "20px 16px", color: "#64748b", fontSize: 13 }}>{T("No moderators.", "Aucun modérateur.")}</td></tr>
                  )}
                  {mods.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</td>
                      <td style={{ color: "#64748b", fontSize: 13 }}>{m.email}</td>
                      <td className="modTable__date">{new Date(m.created_at).toLocaleDateString(locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </main>
    </div>
  );
}
