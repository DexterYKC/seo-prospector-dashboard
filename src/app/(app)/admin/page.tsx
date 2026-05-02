"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  fetchAdminStats,
  fetchAdminUsers,
  updateAdminUser,
  resetAdminUserData,
  deleteAdminUser,
  fetchAdminBlogPosts,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
  fetchAdminBlogPost,
  fetchAdminModerators,
  createAdminModerator,
  deleteAdminModerator,
  fetchAdminTickets,
  fetchAdminTicket,
  replyAdminTicket,
  updateAdminTicketStatus,
  fetchAdminSupportAgents,
  createAdminSupportAgent,
  deleteAdminSupportAgent,
  fetchAdminUserDetail,
  extendAdminUserTrial,
  extendAdminUserScans,
  exportAdminUsersCSV,
  fetchAdminActivity,
  fetchAdminWaitlist,
  deleteAdminWaitlistEntry,
} from "@/lib/api";
import type { AdminUser, AdminStats, AdminActivityDay, BlogPost, Moderator, SupportTicket, SupportMessage, SupportAgent, AdminUserDetailResponse } from "@/lib/api";

type ChatModerationFlag = {
  id: string;
  message_id: string;
  team_id: string;
  sender_id: string;
  content: string;
  flag_reason: string;
  flag_category: string;
  reviewed: boolean;
  created_at: string;
};
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/components/Toast";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

const PLANS = ["FREE", "STARTER", "PRO", "AGENCY"];
const STATUSES = ["ACTIVE", "TRIALING", "EXPIRED", "CANCELED", "PAST_DUE"];

const PLAN_COLORS: Record<string, string> = {
  FREE:    "var(--muted)",
  STARTER: "#3b82f6",
  PRO:     "#8b5cf6",
  AGENCY:  "#059669",
};

function planBadge(plan: string) {
  const color = PLAN_COLORS[plan] ?? "var(--muted)";
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3,
      background: `${color}22`, color, border: `1px solid ${color}44`,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>
      {plan}
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { token, setToken } = useSession();
  const { data: myData } = useUserData();
  const { toast } = useToast();
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const [stats,    setStats]    = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivityDay[]>([]);
  const [users,    setUsers]    = useState<AdminUser[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [planFilter,    setPlanFilter]    = useState("");
  const [trialingSoon,  setTrialingSoon]  = useState(false);
  const [exporting,     setExporting]     = useState(false);
  const [extendingTrial, setExtendingTrial] = useState(false);
  const [extendingScans, setExtendingScans] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan,  setEditPlan]  = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  // User detail panel
  const [selectedUser,  setSelectedUser]  = useState<AdminUser | null>(null);
  const [userDetail,    setUserDetail]    = useState<AdminUserDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function openUserPanel(u: AdminUser) {
    setSelectedUser(u);
    setUserDetail(null);
    setEditingId(null);
    if (!token) return;
    setDetailLoading(true);
    try {
      const d = await fetchAdminUserDetail(token, u.id);
      setUserDetail(d);
    } catch { /* non-critical */ }
    finally { setDetailLoading(false); }
  }

  function closeUserPanel() {
    setSelectedUser(null);
    setUserDetail(null);
    setEditingId(null);
  }

  // Expanded agency owners: Set of owner IDs
  const [expandedOwners, setExpandedOwners] = useState<Set<string>>(new Set());
  // Members cache: ownerId -> AdminUser[]
  const [membersCache, setMembersCache] = useState<Record<string, AdminUser[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<Set<string>>(new Set());

  // Admin tabs
  const [activeTab, setActiveTab] = useState<"users" | "blog" | "moderators" | "support" | "agents" | "moderation" | "waitlist">("users");
  const [waitlistEntries, setWaitlistEntries] = useState<{ id: string; email: string; name: string | null; plan: string; created_at: string }[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Notify modal
  const [notifyModal, setNotifyModal] = useState<{ userId: string; email: string } | null>(null);
  const [notifyForm,  setNotifyForm]  = useState({ title: "", message: "", type: "info", category: "admin" });
  const [notifying,   setNotifying]   = useState(false);

  async function sendNotification() {
    if (!token || !notifyModal || !notifyForm.title) return;
    setNotifying(true);
    try {
      await fetch("/api/admin/notify", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ userId: notifyModal.userId, ...notifyForm }),
      });
      toast(T("Notification sent", "Notification envoyée"), "success");
      setNotifyModal(null);
      setNotifyForm({ title: "", message: "", type: "info", category: "admin" });
    } catch { toast("Failed to send", "error"); }
    finally { setNotifying(false); }
  }

  // Chat moderation state
  const [flags,           setFlags]           = useState<ChatModerationFlag[]>([]);
  const [flagsLoading,    setFlagsLoading]    = useState(false);
  const [flagsUnreviewed, setFlagsUnreviewed] = useState(false);
  const [reviewingFlag,   setReviewingFlag]   = useState<string | null>(null);
  const [userMap,         setUserMap]         = useState<Record<string, { email: string; name: string }>>({});

  // Moderators state
  const [moderators,     setModerators]     = useState<Moderator[]>([]);
  const [modLoading,     setModLoading]     = useState(false);
  const [modForm,        setModForm]        = useState({ email: "", password: "", name: "" });
  const [modCreating,    setModCreating]    = useState(false);
  const [modDeleting,    setModDeleting]    = useState<string | null>(null);
  const [modError,       setModError]       = useState("");

  // Support Agents state
  const [agents,       setAgents]       = useState<SupportAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentForm,    setAgentForm]    = useState({ name: "", email: "", password: "" });
  const [agentCreating, setAgentCreating] = useState(false);
  const [agentDeleting, setAgentDeleting] = useState<string | null>(null);
  const [agentError,   setAgentError]   = useState("");

  // Support state
  const [suppTickets,     setSuppTickets]     = useState<(SupportTicket & { user?: { email: string; name?: string } })[]>([]);
  const [suppLoading,     setSuppLoading]     = useState(false);
  const [suppFilter,      setSuppFilter]      = useState("");
  const [suppViewing,     setSuppViewing]     = useState<string | null>(null);
  const [suppTicket,      setSuppTicket]      = useState<SupportTicket | null>(null);
  const [suppMessages,    setSuppMessages]    = useState<SupportMessage[]>([]);
  const [suppReply,       setSuppReply]       = useState("");
  const [suppReplying,    setSuppReplying]    = useState(false);
  const [suppUpdating,    setSuppUpdating]    = useState(false);
  const [suppError,       setSuppError]       = useState("");

  // Blog state
  const [blogPosts,    setBlogPosts]    = useState<BlogPost[]>([]);
  const [blogLoading,  setBlogLoading]  = useState(false);
  const [blogEditing,  setBlogEditing]  = useState<Partial<BlogPost> | null>(null);
  const [blogSaving,   setBlogSaving]   = useState(false);
  const [blogDeleting, setBlogDeleting] = useState<string | null>(null);

  const LIMIT = 50;
  const isAdmin = myData?.user?.isAdmin;

  const loadStats = useCallback(async () => {
    if (!token) return;
    try {
      const [s, a] = await Promise.all([
        fetchAdminStats(token),
        fetchAdminActivity(token),
      ]);
      setStats(s);
      if (a.ok) setActivity(a.days);
    } catch {
      // stats are optional
    }
  }, [token]);

  const loadUsers = useCallback(async (p = 1, q = search, plan = planFilter, soon = trialingSoon) => {
    if (!token) return;
    setLoading(true);
    try {
      const out = await fetchAdminUsers(token, { page: p, limit: LIMIT, search: q || undefined, plan: plan || undefined, trialingSoon: soon || undefined });
      setUsers(out.users);
      setTotal(out.total);
      setPage(p);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null); router.replace("/login"); return;
      }
      toast(err instanceof ApiError ? err.message : "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [token, search, planFilter, trialingSoon, setToken, router, toast]);

  async function onExportCSV() {
    if (!token) return;
    setExporting(true);
    try {
      const csv = await exportAdminUsersCSV(token, { search: search || undefined, plan: planFilter || undefined, trialingSoon: trialingSoon || undefined });
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `users-${new Date().toISOString().slice(0,10)}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast("Export failed", "error"); }
    finally { setExporting(false); }
  }

  async function onExtendScans(amount: number) {
    if (!token || !selectedUser) return;
    setExtendingScans(true);
    try {
      const res = await extendAdminUserScans(token, selectedUser.id, amount);
      toast(`+${amount} scans added (total bonus: ${res.extraScans})`, "success");
      const d = await fetchAdminUserDetail(token, selectedUser.id);
      setUserDetail(d);
    } catch { toast("Failed to extend scans", "error"); }
    finally { setExtendingScans(false); }
  }

  async function onExtendTrial(days: number) {
    if (!token || !selectedUser) return;
    setExtendingTrial(true);
    try {
      const res = await extendAdminUserTrial(token, selectedUser.id, days);
      toast(`Trial extended to ${new Date(res.trialEndsAt).toLocaleDateString(locale)}`, "success");
      // Refresh detail
      const d = await fetchAdminUserDetail(token, selectedUser.id);
      setUserDetail(d);
    } catch { toast("Failed to extend trial", "error"); }
    finally { setExtendingTrial(false); }
  }

  useEffect(() => {
    void loadStats();
    void loadUsers(1);
  }, [loadStats, loadUsers]);

  async function loadBlogPosts() {
    if (!token) return;
    setBlogLoading(true);
    try {
      const out = await fetchAdminBlogPosts(token);
      setBlogPosts(out.posts || []);
    } catch { toast("Failed to load blog posts", "error"); }
    finally { setBlogLoading(false); }
  }

  useEffect(() => {
    if (activeTab === "blog" && token) void loadBlogPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  async function loadModerators() {
    if (!token) return;
    setModLoading(true);
    try {
      const out = await fetchAdminModerators(token);
      setModerators(out.moderators || []);
    } catch { setModError("Failed to load moderators"); }
    finally { setModLoading(false); }
  }

  useEffect(() => {
    if (activeTab === "moderators" && token) void loadModerators();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  async function loadAgents() {
    if (!token) return;
    setAgentsLoading(true); setAgentError("");
    try {
      const out = await fetchAdminSupportAgents(token);
      setAgents(out.agents || []);
    } catch { setAgentError("Failed to load agents"); }
    finally { setAgentsLoading(false); }
  }

  async function onCreateAgent() {
    if (!token || !agentForm.name || !agentForm.email || agentForm.password.length < 8) return;
    setAgentCreating(true); setAgentError("");
    try {
      await createAdminSupportAgent(token, agentForm);
      setAgentForm({ name: "", email: "", password: "" });
      await loadAgents();
    } catch { setAgentError("Failed to create agent"); }
    finally { setAgentCreating(false); }
  }

  async function onDeleteAgent(id: string) {
    if (!token || !confirm(T("Delete this support agent?", "Supprimer cet agent support ?"))) return;
    setAgentDeleting(id);
    try {
      await deleteAdminSupportAgent(token, id);
      await loadAgents();
    } catch { setAgentError("Failed to delete agent"); }
    finally { setAgentDeleting(null); }
  }

  useEffect(() => {
    if (activeTab === "agents" && token) void loadAgents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  async function loadFlags() {
    if (!token) return;
    setFlagsLoading(true);
    try {
      const qs = flagsUnreviewed ? "?unreviewed=1" : "";
      const [flagsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/chat-moderation${qs}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetchAdminUsers(token, { limit: 500 }),
      ]);
      const data = await flagsRes.json();
      setFlags(Array.isArray(data.flags) ? data.flags : []);
      const map: Record<string, { email: string; name: string }> = {};
      for (const u of usersRes.users ?? []) {
        map[String(u.id)] = { email: u.email, name: u.fullName ?? u.email };
      }
      setUserMap(map);
    } catch { /* ignore */ }
    finally { setFlagsLoading(false); }
  }

  async function onMarkReviewed(id: string) {
    if (!token) return;
    setReviewingFlag(id);
    try {
      await fetch(`/api/admin/chat-moderation/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlags(prev => prev.map(f => f.id === id ? { ...f, reviewed: true } : f));
    } catch { /* ignore */ }
    finally { setReviewingFlag(null); }
  }

  function onDownloadLog(teamId: string) {
    const a = document.createElement("a");
    a.href = `/api/admin/chat-logs/${teamId}`;
    a.download = `chat-log-${teamId}.csv`;
    // Pass auth header via query param workaround: use a blob fetch
    fetch(`/api/admin/chat-logs/${teamId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        a.href = URL.createObjectURL(blob);
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }

  useEffect(() => {
    if (activeTab === "moderation" && token) void loadFlags();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token, flagsUnreviewed]);

  async function loadSuppTickets(status?: string) {
    if (!token) return;
    setSuppLoading(true);
    try {
      const out = await fetchAdminTickets(token, status || undefined);
      setSuppTickets(out.tickets || []);
    } catch { setSuppError("Failed to load tickets"); }
    finally { setSuppLoading(false); }
  }

  async function openSuppTicket(id: string) {
    if (!token) return;
    setSuppError("");
    try {
      const out = await fetchAdminTicket(token, id);
      setSuppTicket(out.ticket);
      setSuppMessages(out.messages || []);
      setSuppViewing(id);
    } catch { setSuppError("Failed to load ticket"); }
  }

  async function onSuppReply() {
    if (!token || !suppViewing || !suppReply.trim()) return;
    setSuppReplying(true);
    try {
      await replyAdminTicket(token, suppViewing, suppReply.trim());
      setSuppReply("");
      await openSuppTicket(suppViewing);
    } catch { setSuppError("Failed to send reply"); }
    finally { setSuppReplying(false); }
  }

  async function onSuppStatus(status: string) {
    if (!token || !suppViewing) return;
    setSuppUpdating(true);
    try {
      await updateAdminTicketStatus(token, suppViewing, status as import("@/lib/api").TicketStatus);
      setSuppTicket(t => t ? { ...t, status: status as import("@/lib/api").TicketStatus } : t);
      if (status === "closed" && suppTicket) {
        fetch("/api/admin/notify", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: suppTicket.user_id,
            title: T("Your support ticket has been closed", "Votre ticket support a été clôturé"),
            message: suppTicket.subject,
            type: "info",
            category: "ticket",
          }),
        }).catch(() => {});
      }
      await loadSuppTickets(suppFilter);
    } catch { setSuppError("Failed to update status"); }
    finally { setSuppUpdating(false); }
  }

  useEffect(() => {
    if (activeTab === "support" && token) void loadSuppTickets(suppFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab !== "waitlist" || !token) return;
    setWaitlistLoading(true);
    fetchAdminWaitlist(token)
      .then(r => { if (r.ok) setWaitlistEntries(r.entries); })
      .catch(() => {})
      .finally(() => setWaitlistLoading(false));
  }, [activeTab, token]);

  // Lock body scroll when user drawer is open
  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedUser]);

  async function onCreateModerator() {
    if (!token || !modForm.email || !modForm.password || !modForm.name) return;
    setModCreating(true);
    setModError("");
    try {
      await createAdminModerator(token, modForm);
      setModForm({ email: "", password: "", name: "" });
      await loadModerators();
    } catch { setModError("Failed to create moderator"); }
    finally { setModCreating(false); }
  }

  async function onDeleteModerator(id: string) {
    if (!token || !confirm(T("Delete this moderator?", "Supprimer ce modérateur ?"))) return;
    setModDeleting(id);
    try {
      await deleteAdminModerator(token, id);
      setModerators(m => m.filter(x => x.id !== id));
    } catch { setModError("Failed to delete moderator"); }
    finally { setModDeleting(null); }
  }

  async function saveBlogPost() {
    if (!token || !blogEditing) return;
    setBlogSaving(true);
    try {
      if (blogEditing.id) {
        await updateAdminBlogPost(token, blogEditing.id, blogEditing);
      } else {
        await createAdminBlogPost(token, blogEditing);
      }
      setBlogEditing(null);
      void loadBlogPosts();
    } catch { toast("Failed to save post", "error"); }
    finally { setBlogSaving(false); }
  }

  async function deleteBlogPost(id: string) {
    if (!token || !confirm("Delete this post?")) return;
    setBlogDeleting(id);
    try {
      await deleteAdminBlogPost(token, id);
      void loadBlogPosts();
    } catch { toast("Failed to delete post", "error"); }
    finally { setBlogDeleting(null); }
  }

  async function editBlogPost(id: string) {
    if (!token) return;
    try {
      const out = await fetchAdminBlogPost(token, id);
      setBlogEditing(out.post);
    } catch { toast("Failed to load post", "error"); }
  }

  async function toggleMembers(owner: AdminUser) {
    const ownerId = owner.id;
    if (expandedOwners.has(ownerId)) {
      setExpandedOwners(prev => { const n = new Set(prev); n.delete(ownerId); return n; });
      return;
    }
    // Always refetch on expand (no cache — data may have changed)
    setExpandedOwners(prev => new Set(prev).add(ownerId));
    setLoadingMembers(prev => new Set(prev).add(ownerId));
    try {
      const out = await fetchAdminUsers(token!, { ownerId, limit: 100 });
      setMembersCache(prev => ({ ...prev, [ownerId]: out.users }));
    } catch {
      toast("Failed to load members", "error");
    } finally {
      setLoadingMembers(prev => { const n = new Set(prev); n.delete(ownerId); return n; });
    }
  }

  function startEdit(u: AdminUser) {
    setEditingId(u.id);
    setEditPlan(u.plan);
    setEditStatus(u.status);
  }

  async function onSaveEdit(userId: string) {
    if (!token) return;
    setSaving(true);
    try {
      await updateAdminUser(token, userId, { plan: editPlan, status: editStatus });
      toast("User updated", "success");
      setEditingId(null);
      void loadUsers(page);
      void loadStats();
      // Refresh panel detail
      if (selectedUser?.id === userId) {
        const d = await fetchAdminUserDetail(token, userId);
        setUserDetail(d);
        setSelectedUser(prev => prev ? { ...prev, plan: editPlan, status: editStatus } : prev);
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function onReset(u: AdminUser) {
    if (!token || !confirm(`Reset ALL leads and usage for ${u.email}? This cannot be undone.`)) return;
    setResetting(u.id);
    try {
      await resetAdminUserData(token, u.id);
      toast(`Data reset for ${u.email}`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Reset failed", "error");
    } finally {
      setResetting(null);
    }
  }

  async function onDelete(u: AdminUser) {
    if (!token || !confirm(`DELETE user ${u.email} and ALL their data permanently? This CANNOT be undone.`)) return;
    setDeleting(u.id);
    try {
      await deleteAdminUser(token, u.id);
      toast(`Deleted ${u.email}`, "success");
      closeUserPanel();
      void loadUsers(page);
      void loadStats();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    void loadUsers(1, search, planFilter);
  }

  if (!isAdmin && myData) {
    return (
      <AppLayout>
        <div className="pageContent">
          <article className="card extensionBanner">
            <div className="extensionBannerBody">
              <div className="extensionBannerEmoji">🔒</div>
              <div>
                <div className="extensionBannerTitle">Admin access required</div>
                <div className="extensionBannerSub">This page is restricted to administrators.</div>
              </div>
            </div>
          </article>
        </div>
      </AppLayout>
    );
  }

  const totalPages = Math.ceil(total / LIMIT);

  function engagementDot(u: AdminUser) {
    const daysSince = u.lastActiveDate
      ? Math.floor((Date.now() - Date.parse(u.lastActiveDate)) / 86400000)
      : null;
    const joinedDaysAgo = u.createdAt ? Math.floor((Date.now() - Date.parse(u.createdAt)) / 86400000) : 999;
    let color = "#6b7280"; // gray = never active
    let title = "No activity recorded";
    if (daysSince === null && joinedDaysAgo <= 1) { color = "#3b82f6"; title = "Just joined"; }
    else if (daysSince !== null && daysSince <= 3)  { color = "#10b981"; title = `Active ${daysSince <= 0 ? "today" : `${daysSince}d ago`}`; }
    else if (daysSince !== null && daysSince <= 7)  { color = "#f59e0b"; title = `Active ${daysSince}d ago`; }
    else if (daysSince !== null && daysSince <= 30) { color = "#f97316"; title = `Active ${daysSince}d ago`; }
    else if (daysSince !== null)                    { color = "#ef4444"; title = `Inactive — last active ${daysSince}d ago`; }
    return <span title={title} style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 1 }} />;
  }

  function renderUserRow(u: AdminUser, isNested = false) {
    const rowKey = isNested ? `nested-${u.id}` : u.id;
    const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString(locale) : "—";
    const isOwner = u.teamRole === "OWNER";
    const isMember = u.teamRole === "MEMBER";
    const isExpanded = expandedOwners.has(u.id);
    const membersLoading = loadingMembers.has(u.id);
    const isSelected = selectedUser?.id === u.id;

    return (
      <tr
        key={rowKey}
        style={{
          ...(isNested ? { background: "rgba(5,150,105,0.04)" } : {}),
          cursor: "pointer",
          ...(isSelected ? { background: "rgba(99,102,241,0.06)" } : {}),
        }}
        onClick={() => void openUserPanel(u)}
      >
        <td>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            {isNested && (
              <span style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.4, marginTop: 1, flexShrink: 0 }}>↳</span>
            )}
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: u.avatarUrl ? "transparent" : "linear-gradient(135deg,#6366f1,#4f46e5)",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: "#fff", marginTop: 1,
            }}>
              {u.avatarUrl
                ? <img src={u.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (u.fullName || u.email).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {engagementDot(u)}
                <span style={{ fontWeight: 600, fontSize: 13 }}>{u.fullName || u.email}</span>
              </div>
              {u.fullName && <div className="prospectUrl">{u.email}</div>}
              <div style={{ display: "flex", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
                {u.isAdmin && (
                  <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(239,68,68,0.1)", color: "#dc2626", padding: "1px 5px", borderRadius: 3 }}>ADMIN</span>
                )}
                {isOwner && (
                  <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(5,150,105,0.1)", color: "#059669", padding: "1px 5px", borderRadius: 3 }}>
                    AGENCY OWNER · {u.memberCount} member{u.memberCount !== 1 ? "s" : ""}
                  </span>
                )}
                {isMember && (
                  <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(5,150,105,0.1)", color: "#059669", padding: "1px 5px", borderRadius: 3 }}>
                    TEAM MEMBER{u.ownerEmail ? ` · ${u.ownerEmail}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td>{planBadge(u.plan)}</td>
        <td>
          <span className={`badge ${u.status === "ACTIVE" ? "good" : u.status === "TRIALING" ? "info" : "warn"}`} style={{ fontSize: 10 }}>
            {u.status}
          </span>
        </td>
        <td>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{joined}</span>
        </td>
        <td>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            {isOwner && (
              <button
                className="btn sm ghost"
                style={{ color: "#059669", borderColor: "rgba(5,150,105,0.25)" }}
                onClick={(e) => { e.stopPropagation(); void toggleMembers(u); }}
                disabled={membersLoading}
              >
                {membersLoading ? "…" : isExpanded ? "▲ Hide" : `▼ Members`}
              </button>
            )}
            <button
              className="btn sm ghost"
              style={{ color: "#6366f1", borderColor: "rgba(99,102,241,0.25)" }}
              onClick={(e) => {
                e.stopPropagation();
                setNotifyModal({ userId: u.id, email: u.email });
                setNotifyForm({ title: "", message: "", type: "info", category: "admin" });
              }}
              title="Send notification"
            >
              🔔
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // IDs of members whose owner is currently expanded (shown nested — skip top-level)
  const hiddenMemberIds = new Set<string>();
  for (const u of users) {
    if (u.teamRole === "OWNER" && expandedOwners.has(u.id)) {
      for (const m of (membersCache[u.id] || [])) hiddenMemberIds.add(m.id);
    }
  }

  // Build flat list with member rows inserted after their owner
  const tableRows: React.ReactNode[] = [];
  for (const u of users) {
    if (u.teamRole === "MEMBER") continue; // only shown nested under their owner
    tableRows.push(renderUserRow(u));
    if (u.teamRole === "OWNER" && expandedOwners.has(u.id)) {
      const members = membersCache[u.id];
      if (loadingMembers.has(u.id)) {
        tableRows.push(
          <tr key={`${u.id}-loading`}>
            <td colSpan={5} style={{ padding: "8px 16px 8px 32px", color: "var(--muted)", fontSize: 12 }}>
              Loading members…
            </td>
          </tr>
        );
      } else if (members && members.length > 0) {
        for (const m of members) tableRows.push(renderUserRow(m, true));
      } else if (members) {
        tableRows.push(
          <tr key={`${u.id}-empty`}>
            <td colSpan={5} style={{ padding: "8px 16px 8px 32px", color: "var(--muted)", fontSize: 12 }}>
              No active members.
            </td>
          </tr>
        );
      }
    }
  }

  return (
    <AppLayout>
      {/* Notify modal */}
      {notifyModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div className="card" style={{ width: "100%", maxWidth: 440, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{T("Send notification", "Envoyer une notification")}</h3>
              <button className="btn ghost sm" onClick={() => setNotifyModal(null)}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface-soft)", borderRadius: 6, padding: "6px 10px" }}>
              {T("To", "À")} : <strong>{notifyModal.email}</strong>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>{T("Type", "Type")}</label>
              <div style={{ display: "flex", gap: 6 }}>
                {(["info", "warning", "danger", "success"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setNotifyForm(f => ({ ...f, type: t }))}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, border: "1px solid",
                      cursor: "pointer",
                      background: notifyForm.type === t ? (t === "danger" ? "#fef2f2" : t === "warning" ? "#fffbeb" : t === "success" ? "#f0fdf4" : "#eff6ff") : "transparent",
                      color: t === "danger" ? "#dc2626" : t === "warning" ? "#d97706" : t === "success" ? "#16a34a" : "#3b82f6",
                      borderColor: t === "danger" ? "#fca5a5" : t === "warning" ? "#fcd34d" : t === "success" ? "#86efac" : "#93c5fd",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>{T("Title *", "Titre *")}</label>
              <input
                className="inputField"
                value={notifyForm.title}
                onChange={e => setNotifyForm(f => ({ ...f, title: e.target.value }))}
                placeholder={T("Notification title", "Titre de la notification")}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>{T("Message (optional)", "Message (optionnel)")}</label>
              <textarea
                className="inputField"
                rows={3}
                style={{ resize: "none" }}
                value={notifyForm.message}
                onChange={e => setNotifyForm(f => ({ ...f, message: e.target.value }))}
                placeholder={T("Additional details…", "Détails supplémentaires…")}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn ghost" onClick={() => setNotifyModal(null)}>{T("Cancel", "Annuler")}</button>
              <button
                className="btn primary"
                onClick={() => void sendNotification()}
                disabled={notifying || !notifyForm.title}
              >
                {notifying ? "…" : T("Send", "Envoyer")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pageHeader">
        <div className="pageTitleGroup">
          <div className="pageTitleIconBox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h1 className="pageTitle">Admin</h1>
            <p className="pageSubtitle">{total} users total</p>
          </div>
        </div>
        <button className="btnRefresh" onClick={() => { void loadStats(); void loadUsers(page); }} disabled={loading} title="Refresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s ease", transform: loading ? "rotate(360deg)" : "none" }}>
            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
        </button>
      </div>

      <div className="pageContent">

        {/* Stats */}
        {stats && (() => {
          const agencyCount = stats.byPlan.AGENCY ?? 0;
          const totalU = stats.totalUsers || 1;
          const cards = [
            {
              label: "Total users", value: stats.totalUsers,
              color: "#3b82f6", bubble: "rgba(59,130,246,0.13)",
              pill: stats.totalUsers === 1 ? "1 registered" : `${stats.totalUsers} registered`,
              pct: 100,
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
                </svg>
              ),
            },
            {
              label: "New today", value: stats.newToday,
              color: "#10b981", bubble: "rgba(16,185,129,0.13)",
              pill: stats.newToday > 0 ? `+${stats.newToday} today` : "None today",
              pct: Math.min(Math.round((stats.newToday / totalU) * 100 * 5), 100),
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              ),
            },
            {
              label: "Active subs", value: stats.activeSubs,
              color: "#8b5cf6", bubble: "rgba(139,92,246,0.13)",
              pill: stats.activeSubs > 0 ? `${Math.round((stats.activeSubs / totalU) * 100)}% of users` : "No active subs",
              pct: Math.round((stats.activeSubs / totalU) * 100),
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              ),
            },
            {
              label: "Total leads", value: stats.totalLeads,
              color: "#f59e0b", bubble: "rgba(245,158,11,0.13)",
              pill: stats.totalLeads > 0 ? `${stats.totalLeads} captured` : "No leads yet",
              pct: Math.min(Math.round((stats.totalLeads / Math.max(stats.totalUsers * 10, 1)) * 100), 100),
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              ),
            },
            {
              label: "Agency users", value: agencyCount,
              color: "#f97316", bubble: "rgba(249,115,22,0.13)",
              pill: agencyCount > 0 ? `${Math.round((agencyCount / totalU) * 100)}% of users` : "No agency users",
              pct: Math.round((agencyCount / totalU) * 100),
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                  <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
                </svg>
              ),
            },
          ];
          return (
            <div className="kpiGrid" style={{ gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}>
              {cards.map(({ label, value, color, bubble, pill, pct, icon }) => (
                <article key={label} className="card kpiCard" style={{ "--kpi-bubble-color": bubble } as React.CSSProperties}>
                  <div className="kpiHead">
                    <span className="kpiLabel">{label}</span>
                    <div className="kpiIconBox" style={{ background: `${bubble}`, color }}>
                      {icon}
                    </div>
                  </div>
                  <span className="kpiValue" style={{ color }}>{value ?? "—"}</span>
                  <span className="kpiPill" style={{ background: bubble, color }}>{pill}</span>
                  <div className={`kpiBar${!value ? " kpiBar--empty" : ""}`}>
                    <div className="kpiBarFill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </article>
              ))}
            </div>
          );
        })()}

        {/* Platform activity chart */}
        {activity.length > 0 && (() => {
          const W = 700, H = 200, pL = 32, pR = 16, pT = 14, pB = 28;
          const cW = W - pL - pR, cH = H - pT - pB;
          const N = activity.length;
          const maxScans = Math.max(...activity.map(d => d.scans), 1);
          const maxMsgs  = Math.max(...activity.map(d => d.messages), 1);
          const niceMax  = Math.max(Math.ceil(Math.max(maxScans, maxMsgs) * 1.3), 2);
          const toX = (i: number) => pL + (i / Math.max(N - 1, 1)) * cW;
          const toY = (v: number) => pT + (1 - v / niceMax) * cH;
          const yTicks = [0, Math.round(niceMax / 2), niceMax];

          function makePath(vals: number[]) {
            const pts = vals.map((v, i) => [toX(i), toY(v)] as [number, number]);
            let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
            for (let i = 0; i < pts.length - 1; i++) {
              const cpx = ((pts[i][0] + pts[i + 1][0]) / 2).toFixed(1);
              d += ` C ${cpx} ${pts[i][1].toFixed(1)}, ${cpx} ${pts[i + 1][1].toFixed(1)}, ${pts[i + 1][0].toFixed(1)} ${pts[i + 1][1].toFixed(1)}`;
            }
            return d;
          }
          function makeArea(vals: number[], color: string, id: string) {
            const line = makePath(vals);
            const area = line + ` L ${toX(N - 1).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(0).toFixed(1)} Z`;
            return { line, area, id, color };
          }

          const scansArea = makeArea(activity.map(d => d.scans),    "#3b82f6", "adminScans");
          const msgsArea  = makeArea(activity.map(d => d.messages),  "#8b5cf6", "adminMsgs");
          const totalScans = activity.reduce((s, d) => s + d.scans, 0);
          const totalMsgs  = activity.reduce((s, d) => s + d.messages, 0);
          const totalSignups = activity.reduce((s, d) => s + d.signups, 0);
          const xLabelIdxs = [0, Math.floor(N / 4), Math.floor(N / 2), Math.floor(3 * N / 4), N - 1];

          return (
            <article className="card">
              <div className="cardHeader">
                <span className="cardTitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.1)", color: "#3b82f6", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </span>
                  Platform activity — last 30 days
                </span>
                <div style={{ display: "flex", gap: 14 }}>
                  {[
                    { label: "Scans", value: totalScans, color: "#3b82f6" },
                    { label: "Messages", value: totalMsgs, color: "#8b5cf6" },
                    { label: "Signups", value: totalSignups, color: "#10b981" },
                  ].map(({ label, value, color }) => (
                    <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      {label} <strong style={{ color }}>{value}</strong>
                    </span>
                  ))}
                </div>
              </div>
              <div className="cardBody" style={{ paddingTop: 4, paddingBottom: 8 }}>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
                  <defs>
                    {[scansArea, msgsArea].map(({ id, color }) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                      </linearGradient>
                    ))}
                  </defs>

                  {/* Grid lines */}
                  {yTicks.map(tick => (
                    <g key={tick}>
                      <line x1={pL} y1={toY(tick)} x2={W - pR} y2={toY(tick)} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />
                      <text x={pL - 4} y={toY(tick) + 4} textAnchor="end" fontSize="9" fill="var(--muted)">{tick}</text>
                    </g>
                  ))}

                  {/* Areas */}
                  {[scansArea, msgsArea].map(({ area, id }) => (
                    <path key={id + "area"} d={area} fill={`url(#${id})`} />
                  ))}

                  {/* Lines */}
                  {[scansArea, msgsArea].map(({ line, color, id }) => (
                    <path key={id + "line"} d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ))}

                  {/* Signup dots */}
                  {activity.map((d, i) => d.signups > 0 && (
                    <circle key={i} cx={toX(i)} cy={toY(0) + 10} r="3.5" fill="#10b981" opacity="0.85"><title>{`+${d.signups}`}</title></circle>
                  ))}

                  {/* X labels */}
                  {xLabelIdxs.map(i => (
                    <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--muted)">
                      {activity[i]?.day?.slice(5) ?? ""}
                    </text>
                  ))}
                </svg>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, textAlign: "right" }}>
                  🟢 dots = new signups that day
                </div>
              </div>
            </article>
          );
        })()}

        {/* Plan breakdown */}
        {stats && (() => {
          // Use effective plans from loaded users when all users fit in one page;
          // fall back to stats.byPlan (raw DB plans) for large datasets.
          const byPlan: Record<string, number> = users.length >= total && total > 0
            ? users.reduce((acc, u) => { acc[u.plan] = (acc[u.plan] ?? 0) + 1; return acc; }, {} as Record<string, number>)
            : stats.byPlan;
          return (
            <article className="card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Plan breakdown</span>
                {PLANS.map(p => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {planBadge(p)}
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{byPlan[p] ?? 0}</span>
                  </div>
                ))}
              </div>
            </article>
          );
        })()}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
          {(["users", "waitlist", "blog", "moderators", "support", "agents", "moderation"] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px", fontSize: 13, fontWeight: 600,
                border: "none", background: "none", cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                color: activeTab === tab ? "var(--accent)" : "var(--muted)",
                textTransform: "capitalize",
              }}
            >
              {tab === "users" ? "Users" : tab === "waitlist" ? "Waitlist" : tab === "blog" ? "Blog" : tab === "moderators" ? T("Moderators", "Modérateurs") : tab === "support" ? "Support" : tab === "agents" ? T("Support Agents", "Agents Support") : T("Chat Safety", "Sécurité Chat")}
            </button>
          ))}
        </div>

        {activeTab === "waitlist" && (
          <div>
            {/* Stats */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {[
                { label: "Total", value: waitlistEntries.length, color: "var(--accent)" },
                { label: "Starter", value: waitlistEntries.filter(e => e.plan === "STARTER").length, color: "#3b82f6" },
                { label: "Pro", value: waitlistEntries.filter(e => e.plan === "PRO").length, color: "#8b5cf6" },
                { label: "Agency", value: waitlistEntries.filter(e => e.plan === "AGENCY").length, color: "#059669" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 20px", minWidth: 100 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                </div>
              ))}
              <button
                type="button"
                style={{ marginLeft: "auto", padding: "0 16px", fontSize: 12, fontWeight: 700, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--muted)" }}
                onClick={() => {
                  const csv = ["email,name,plan,date", ...waitlistEntries.map(e => `${e.email},${e.name ?? ""},${e.plan},${e.created_at.slice(0, 10)}`)].join("\n");
                  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "waitlist.csv"; a.click();
                }}
              >Export CSV</button>
            </div>

            {waitlistLoading ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>Loading…</p>
            ) : waitlistEntries.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>No waitlist entries yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    {["Email", "Name", "Plan", "Date", ""].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waitlistEntries.map(entry => (
                    <tr key={entry.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text)" }}>{entry.email}</td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{entry.name ?? "—"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                          padding: "2px 8px", borderRadius: 4,
                          background: entry.plan === "PRO" ? "rgba(139,92,246,0.12)" : entry.plan === "AGENCY" ? "rgba(5,150,105,0.12)" : "rgba(59,130,246,0.12)",
                          color: entry.plan === "PRO" ? "#7c3aed" : entry.plan === "AGENCY" ? "#059669" : "#2563eb",
                        }}>{entry.plan}</span>
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 12 }}>{new Date(entry.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <button
                          type="button"
                          style={{ fontSize: 11, color: "#ef4444", background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, padding: "3px 10px", cursor: "pointer" }}
                          onClick={async () => {
                            if (!token) return;
                            await deleteAdminWaitlistEntry(token, entry.id);
                            setWaitlistEntries(p => p.filter(e => e.id !== entry.id));
                          }}
                        >Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "blog" && (
          <>
            {/* Blog editor modal */}
            {blogEditing && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
                <div className="card" style={{ width: "100%", maxWidth: 740, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{blogEditing.id ? "Edit post" : "New post"}</h2>
                    <button className="btn ghost sm" onClick={() => setBlogEditing(null)}>✕</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Title *</label>
                      <input className="inputField" value={blogEditing.title || ""} onChange={e => setBlogEditing(p => ({ ...p, title: e.target.value }))} placeholder="Post title" />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Slug</label>
                      <input className="inputField" value={blogEditing.slug || ""} onChange={e => setBlogEditing(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated from title" />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Author name</label>
                      <input className="inputField" value={blogEditing.author_name || ""} onChange={e => setBlogEditing(p => ({ ...p, author_name: e.target.value }))} placeholder="Your name" />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Cover image URL</label>
                      <input className="inputField" value={blogEditing.cover_image || ""} onChange={e => setBlogEditing(p => ({ ...p, cover_image: e.target.value }))} placeholder="https://..." />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Tags (comma-separated)</label>
                      <input className="inputField" value={(blogEditing.tags || []).join(", ")} onChange={e => setBlogEditing(p => ({ ...p, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} placeholder="LinkedIn, SEO, Outreach" />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Excerpt</label>
                      <textarea className="inputField" rows={2} value={blogEditing.excerpt || ""} onChange={e => setBlogEditing(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short description shown in the blog listing" style={{ resize: "vertical" }} />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Content (HTML)</label>
                      <textarea className="inputField" rows={14} value={blogEditing.content || ""} onChange={e => setBlogEditing(p => ({ ...p, content: e.target.value }))} placeholder="<p>Write your article here…</p>" style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12 }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={!!blogEditing.published} onChange={e => setBlogEditing(p => ({ ...p, published: e.target.checked }))} />
                      Publish immediately
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn ghost" onClick={() => setBlogEditing(null)}>Cancel</button>
                      <button className="btn primary" onClick={() => void saveBlogPost()} disabled={blogSaving || !blogEditing.title}>
                        {blogSaving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blog list */}
            <article className="card">
              <div className="cardHeader">
                <span className="cardTitle">Blog posts</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="badge info">{blogPosts.length}</span>
                  <button className="btn primary sm" onClick={() => setBlogEditing({ tags: [], published: false })}>+ New post</button>
                </div>
              </div>
              <div className="cardBodyFlush">
                {blogLoading && <div className="emptyState">Loading…</div>}
                {!blogLoading && blogPosts.length === 0 && <div className="emptyState">No blog posts yet.</div>}
                {!blogLoading && blogPosts.length > 0 && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th style={{ textAlign: "left",  padding: "8px 16px", fontWeight: 600, color: "var(--muted)" }}>Title</th>
                        <th style={{ textAlign: "left",  padding: "8px 16px", fontWeight: 600, color: "var(--muted)" }}>Status</th>
                        <th style={{ textAlign: "left",  padding: "8px 16px", fontWeight: 600, color: "var(--muted)" }}>Date</th>
                        <th style={{ textAlign: "right", padding: "8px 16px", fontWeight: 600, color: "var(--muted)" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogPosts.map(post => (
                        <tr key={post.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ fontWeight: 600 }}>{post.title}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>/blog/{post.slug}</div>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3,
                              background: post.published ? "#05966922" : "#94a3b822",
                              color: post.published ? "#059669" : "#94a3b8",
                              border: `1px solid ${post.published ? "#05966944" : "#94a3b844"}`,
                              textTransform: "uppercase", letterSpacing: "0.05em",
                            }}>
                              {post.published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 16px", color: "var(--muted)", fontSize: 12 }}>
                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                              {post.published && (
                                <button
                                  className="btn ghost sm"
                                  style={{ fontSize: 11, color: "#6366f1" }}
                                  title="Notify all users"
                                  onClick={() => {
                                    setNotifyModal({ userId: "all", email: T("All users", "Tous les utilisateurs") });
                                    setNotifyForm({
                                      title: T("New article published", "Nouvel article publié"),
                                      message: post.title,
                                      type: "info",
                                      category: "blog",
                                    });
                                  }}
                                >
                                  🔔
                                </button>
                              )}
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="btn ghost sm" style={{ fontSize: 11 }}>View</a>
                              <button className="btn ghost sm" onClick={() => void editBlogPost(post.id)}>Edit</button>
                              <button className="btn danger sm" onClick={() => void deleteBlogPost(post.id)} disabled={blogDeleting === post.id}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </article>
          </>
        )}

        {activeTab === "moderators" && (
          <div>
            {modError && <div style={{ color: "red", marginBottom: 12, fontSize: 13 }}>{modError}</div>}

            {/* Create moderator form */}
            <article className="card" style={{ padding: "16px 20px", marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{T("Create a moderator", "Créer un modérateur")}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input className="inputField" placeholder={T("Name", "Nom")} value={modForm.name} onChange={e => setModForm(f => ({ ...f, name: e.target.value }))} />
                <input className="inputField" placeholder="Email" type="email" value={modForm.email} onChange={e => setModForm(f => ({ ...f, email: e.target.value }))} />
                <input className="inputField" placeholder={T("Password (min 8 chars)", "Mot de passe (min 8 car.)")} type="password" value={modForm.password} onChange={e => setModForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <button
                className="btn sm primary"
                onClick={() => void onCreateModerator()}
                disabled={modCreating || !modForm.email || !modForm.password || !modForm.name || modForm.password.length < 8}
              >
                {modCreating ? T("Creating…", "Création…") : T("Create account", "Créer le compte")}
              </button>
            </article>

            {/* Moderators list */}
            {modLoading ? <p style={{ color: "var(--muted)", fontSize: 13 }}>{T("Loading…", "Chargement…")}</p> : (
              <article className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {[T("Name", "Nom"), "Email", T("Created", "Créé le"), ""].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {moderators.length === 0 && (
                      <tr><td colSpan={4} style={{ color: "var(--muted)", fontSize: 13, padding: "16px" }}>{T("No moderators.", "Aucun modérateur.")}</td></tr>
                    )}
                    {moderators.map(m => (
                      <tr key={m.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>{m.name}</td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 13 }}>{m.email}</td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>{new Date(m.created_at).toLocaleDateString(locale)}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            className="btn sm ghost"
                            style={{ color: "#dc2626" }}
                            onClick={() => void onDeleteModerator(m.id)}
                            disabled={modDeleting === m.id}
                          >
                            {modDeleting === m.id ? "…" : T("Delete", "Supprimer")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            )}
          </div>
        )}

        {activeTab === "support" && (
          <div>
            {suppError && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{suppError}</div>}

            {/* Ticket thread modal */}
            {suppViewing && suppTicket && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div className="card" style={{ width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{suppTicket.subject}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        #{suppTicket.id.slice(0, 8)} · {suppTicket.status}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        className="inputField"
                        style={{ fontSize: 12, padding: "4px 8px" }}
                        value={suppTicket.status}
                        onChange={e => void onSuppStatus(e.target.value)}
                        disabled={suppUpdating}
                      >
                        <option value="open">{T("Open", "Ouvert")}</option>
                        <option value="in_progress">{T("In progress", "En cours")}</option>
                        <option value="closed">{T("Closed", "Fermé")}</option>
                      </select>
                      <button className="btn ghost sm" onClick={() => { setSuppViewing(null); setSuppTicket(null); setSuppMessages([]); setSuppReply(""); }}>✕</button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                    {suppMessages.map(m => (
                      <div key={m.id} style={{
                        alignSelf: m.sender_type === "admin" ? "flex-end" : "flex-start",
                        background: m.sender_type === "admin" ? "var(--accent)" : "var(--surface2)",
                        color: m.sender_type === "admin" ? "#fff" : "var(--text)",
                        borderRadius: 10, padding: "10px 14px", maxWidth: "80%", fontSize: 13,
                      }}>
                        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                          {m.sender_type === "admin" ? "Support" : (m.sender_name || T("User", "Utilisateur"))} · {new Date(m.created_at).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                        {m.content}
                      </div>
                    ))}
                  </div>
                  {suppTicket.status !== "closed" && (
                    <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                      <textarea
                        className="inputField"
                        rows={2}
                        style={{ flex: 1, resize: "none", fontSize: 13 }}
                        placeholder={T("Reply…", "Réponse…")}
                        value={suppReply}
                        onChange={e => setSuppReply(e.target.value)}
                      />
                      <button className="btn primary sm" onClick={() => void onSuppReply()} disabled={suppReplying || !suppReply.trim()}>
                        {suppReplying ? "…" : T("Send", "Envoyer")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Filter + list */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
              <select
                className="inputField"
                style={{ width: 160 }}
                value={suppFilter}
                onChange={e => { setSuppFilter(e.target.value); void loadSuppTickets(e.target.value); }}
              >
                <option value="">{T("All tickets", "Tous les tickets")}</option>
                <option value="open">{T("Open", "Ouverts")}</option>
                <option value="in_progress">{T("In progress", "En cours")}</option>
                <option value="closed">{T("Closed", "Fermés")}</option>
              </select>
              <button className="btn ghost sm" onClick={() => void loadSuppTickets(suppFilter)}>{T("Refresh", "Rafraîchir")}</button>
            </div>

            <article className="card" style={{ padding: 0, overflow: "hidden" }}>
              {suppLoading && <div className="emptyState">{T("Loading…", "Chargement…")}</div>}
              {!suppLoading && suppTickets.length === 0 && <div className="emptyState">{T("No tickets.", "Aucun ticket.")}</div>}
              {!suppLoading && suppTickets.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {[T("Subject", "Sujet"), T("User", "Utilisateur"), T("Status", "Statut"), T("Created", "Créé le"), ""].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 16px", fontWeight: 600, color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {suppTickets.map(t => (
                      <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 16px", fontWeight: 600 }}>{t.subject}</td>
                        <td style={{ padding: "10px 16px", color: "var(--muted)" }}>{(t as SupportTicket & { user?: { email: string } }).user?.email || t.user_id}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.05em",
                            background: t.status === "open" ? "#3b82f622" : t.status === "in_progress" ? "#f59e0b22" : "#64748b22",
                            color: t.status === "open" ? "#3b82f6" : t.status === "in_progress" ? "#d97706" : "#64748b",
                            border: `1px solid ${t.status === "open" ? "#3b82f644" : t.status === "in_progress" ? "#f59e0b44" : "#64748b44"}`,
                          }}>
                            {t.status === "open" ? T("Open", "Ouvert") : t.status === "in_progress" ? T("In progress", "En cours") : T("Closed", "Fermé")}
                          </span>
                        </td>
                        <td style={{ padding: "10px 16px", color: "var(--muted)", fontSize: 12 }}>{new Date(t.created_at).toLocaleDateString(locale)}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <button className="btn ghost sm" onClick={() => void openSuppTicket(t.id)}>{T("Open", "Ouvrir")}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </article>
          </div>
        )}

        {activeTab === "agents" && (
          <div>
            {agentError && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>{agentError}</div>}

            <article className="card" style={{ padding: "16px 20px", marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{T("Create a support agent", "Créer un agent support")}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                <input className="inputField" placeholder={T("Name", "Nom")} value={agentForm.name} onChange={e => setAgentForm(f => ({ ...f, name: e.target.value }))} />
                <input className="inputField" placeholder="Email" type="email" value={agentForm.email} onChange={e => setAgentForm(f => ({ ...f, email: e.target.value }))} />
                <input className="inputField" placeholder={T("Password (min 8 chars)", "Mot de passe (min 8 car.)")} type="password" value={agentForm.password} onChange={e => setAgentForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <button
                className="btn sm primary"
                onClick={() => void onCreateAgent()}
                disabled={agentCreating || !agentForm.email || !agentForm.name || agentForm.password.length < 8}
              >
                {agentCreating ? T("Creating…", "Création…") : T("Create account", "Créer le compte")}
              </button>
            </article>

            {agentsLoading ? <p style={{ color: "var(--muted)", fontSize: 13 }}>{T("Loading…", "Chargement…")}</p> : (
              <article className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {[T("Name", "Nom"), "Email", T("Created", "Créé le"), ""].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agents.length === 0 && (
                      <tr><td colSpan={4} style={{ color: "var(--muted)", fontSize: 13, padding: 16 }}>{T("No support agents.", "Aucun agent support.")}</td></tr>
                    )}
                    {agents.map(a => (
                      <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>{a.name}</td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 13 }}>{a.email}</td>
                        <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>{new Date(a.created_at).toLocaleDateString(locale)}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            className="btn sm ghost"
                            style={{ color: "#dc2626" }}
                            onClick={() => void onDeleteAgent(a.id)}
                            disabled={agentDeleting === a.id}
                          >
                            {agentDeleting === a.id ? "…" : T("Delete", "Supprimer")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            )}
          </div>
        )}

        {activeTab === "moderation" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={flagsUnreviewed}
                  onChange={e => setFlagsUnreviewed(e.target.checked)}
                />
                {T("Unreviewed only", "Non traités uniquement")}
              </label>
              <button className="btn sm ghost" onClick={() => void loadFlags()} disabled={flagsLoading}>
                {flagsLoading ? T("Loading…", "Chargement…") : T("Refresh", "Actualiser")}
              </button>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>
                {flags.length} {T("flag(s)", "signalement(s)")} —{" "}
                {flags.filter(f => !f.reviewed).length} {T("unreviewed", "non traités")}
              </span>
            </div>

            {flags.length === 0 && !flagsLoading && (
              <div className="emptyState">
                {T("No flagged messages.", "Aucun message signalé.")}
              </div>
            )}

            {flags.length > 0 && (
              <article className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {[T("Date", "Date"), T("Category", "Catégorie"), T("Reason", "Raison"), T("Content", "Contenu"), T("Sender", "Expéditeur"), T("Team Owner", "Propriétaire"), ""].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flags.map(f => (
                      <tr key={f.id} style={{ borderBottom: "1px solid var(--border)", opacity: f.reviewed ? 0.45 : 1 }}>
                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap", color: "var(--muted)", fontSize: 12 }}>
                          {new Date(f.created_at).toLocaleDateString()}{" "}
                          {new Date(f.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3,
                            textTransform: "uppercase", letterSpacing: "0.05em",
                            background: f.flag_category === "violence" ? "#fef2f2" : f.flag_category === "scam" ? "#fffbeb" : f.flag_category === "fraud" ? "#fff7ed" : "#f5f3ff",
                            color: f.flag_category === "violence" ? "#dc2626" : f.flag_category === "scam" ? "#d97706" : f.flag_category === "fraud" ? "#ea580c" : "#7c3aed",
                          }}>
                            {f.flag_category}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: 12 }}>{f.flag_reason}</td>
                        <td style={{ padding: "10px 14px", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.content}>
                          {f.content}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: 12 }}>
                            {userMap[f.sender_id]?.email ?? <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>{f.sender_id.slice(0, 8)}…</span>}
                          </div>
                          {userMap[f.sender_id]?.name && userMap[f.sender_id].name !== userMap[f.sender_id].email && (
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{userMap[f.sender_id].name}</div>
                          )}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: 12 }}>
                                {userMap[f.team_id]?.email ?? <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>{f.team_id.slice(0, 8)}…</span>}
                              </div>
                              {userMap[f.team_id]?.name && userMap[f.team_id].name !== userMap[f.team_id].email && (
                                <div style={{ fontSize: 11, color: "var(--muted)" }}>{userMap[f.team_id].name}</div>
                              )}
                            </div>
                            <button
                              className="btn sm ghost"
                              style={{ fontSize: 11 }}
                              onClick={() => onDownloadLog(f.team_id)}
                              title={T("Download full conversation log", "Télécharger le log de conversation")}
                            >
                              ↓ Log
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {userMap[f.sender_id] && (
                              <button
                                className="btn sm ghost"
                                style={{ fontSize: 11, color: "#dc2626", borderColor: "rgba(220,38,38,0.3)" }}
                                onClick={() => {
                                  setNotifyModal({ userId: f.sender_id, email: userMap[f.sender_id]?.email ?? f.sender_id });
                                  setNotifyForm({
                                    title: T("Content warning", "Avertissement de contenu"),
                                    message: T(
                                      `Your message was flagged: "${f.content.slice(0, 80)}${f.content.length > 80 ? "…" : ""}"`,
                                      `Votre message a été signalé : "${f.content.slice(0, 80)}${f.content.length > 80 ? "…" : ""}"`
                                    ),
                                    type: "danger",
                                    category: "flag",
                                  });
                                }}
                              >
                                ⚠ {T("Warn user", "Avertir")}
                              </button>
                            )}
                            {!f.reviewed && (
                              <button
                                className="btn sm ghost"
                                onClick={() => void onMarkReviewed(f.id)}
                                disabled={reviewingFlag === f.id}
                                style={{ fontSize: 11 }}
                              >
                                {reviewingFlag === f.id ? "…" : T("Mark reviewed", "Marquer traité")}
                              </button>
                            )}
                            {f.reviewed && (
                              <span style={{ fontSize: 11, color: "var(--muted)" }}>✓ {T("Reviewed", "Traité")}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            )}
          </div>
        )}

        {activeTab === "users" && <>
        {/* Search & filter */}
        <form onSubmit={onSearch} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="inputField"
            placeholder="Search email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180 }}
          />
          <select
            className="inputField"
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); void loadUsers(1, search, e.target.value); }}
            style={{ width: 130 }}
          >
            <option value="">All plans</option>
            {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button
            type="button"
            className={`btn${trialingSoon ? " primary" : " ghost"}`}
            style={trialingSoon ? { background: "#d97706", borderColor: "#d97706" } : { color: "#d97706", borderColor: "rgba(217,119,6,0.4)" }}
            onClick={() => {
              const next = !trialingSoon;
              setTrialingSoon(next);
              void loadUsers(1, search, planFilter, next);
            }}
            title="Show users whose trial ends within 7 days"
          >
            ⏳ Trials ending soon
          </button>
          <button className="btn primary" type="submit" disabled={loading}>Search</button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => void onExportCSV()}
            disabled={exporting}
            title="Export current filter as CSV"
            style={{ color: "#10b981", borderColor: "rgba(16,185,129,0.4)" }}
          >
            {exporting ? "…" : "↓ CSV"}
          </button>
        </form>

        {/* Users table */}
        <article className="card">
          <div className="cardHeader">
            <span className="cardTitle">Users</span>
            <span className="badge info">{total}</span>
          </div>
          <div className="cardBodyFlush">
            {users.length === 0 && !loading && (
              <div className="emptyState">No users found.</div>
            )}
            {loading && users.length === 0 && (
              <div className="emptyState">Loading…</div>
            )}
            {users.length > 0 && (
              <div className="tableWrap">
                <table className="dataTable">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </article>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
            <button className="btn ghost sm" onClick={() => void loadUsers(page - 1)} disabled={page <= 1 || loading}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Page {page} / {totalPages}</span>
            <button className="btn ghost sm" onClick={() => void loadUsers(page + 1)} disabled={page >= totalPages || loading}>Next →</button>
          </div>
        )}
        </> }

      </div>

      {/* User detail panel */}
      {selectedUser && (
        <>
          <div className="drawerOverlay" onClick={closeUserPanel} />
          <aside className="drawer">
            <div className="drawerHeader">
              <div className="drawerAvatar" style={{
                background: selectedUser.avatarUrl ? "transparent" : "linear-gradient(135deg, #6366f1cc, #6366f1)",
                overflow: "hidden", padding: 0,
              }}>
                {selectedUser.avatarUrl
                  ? <img src={selectedUser.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : (selectedUser.fullName || selectedUser.email).slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="drawerName">{selectedUser.fullName || selectedUser.email}</div>
                {selectedUser.fullName && <div className="drawerCompany">{selectedUser.email}</div>}
              </div>
              <button className="btn ghost sm" onClick={closeUserPanel} style={{ flexShrink: 0 }}>✕</button>
            </div>

            <div className="drawerBody">
              {/* Account section */}
              <div className="drawerSection">
                <div className="drawerSectionTitle">{T("Account", "Compte")}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{T("Plan", "Plan")}</span>
                    {editingId === selectedUser.id ? (
                      <select className="inputField" value={editPlan} onChange={e => setEditPlan(e.target.value)} style={{ fontSize: 12, padding: "3px 6px", height: "auto", width: 120 }}>
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ) : planBadge(userDetail?.user.plan ?? selectedUser.plan)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{T("Status", "Statut")}</span>
                    {editingId === selectedUser.id ? (
                      <select className="inputField" value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ fontSize: 12, padding: "3px 6px", height: "auto", width: 120 }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`badge ${(userDetail?.user.status ?? selectedUser.status) === "ACTIVE" ? "good" : (userDetail?.user.status ?? selectedUser.status) === "TRIALING" ? "info" : "warn"}`} style={{ fontSize: 10 }}>
                        {userDetail?.user.status ?? selectedUser.status}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{T("Joined", "Inscrit le")}</span>
                    <span style={{ fontSize: 12 }}>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString(locale) : "—"}</span>
                  </div>
                  {(userDetail?.user.subEndsAt) && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{T("Sub. ends", "Fin abonnement")}</span>
                      <span style={{ fontSize: 12 }}>{new Date(userDetail.user.subEndsAt).toLocaleDateString(locale)}</span>
                    </div>
                  )}
                  {(userDetail?.user.trialEndsAt) && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{T("Trial ends", "Fin d'essai")}</span>
                      <span style={{ fontSize: 12 }}>{new Date(userDetail.user.trialEndsAt).toLocaleDateString(locale)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quotas section */}
              <div className="drawerSection">
                <div className="drawerSectionTitle">{T("Quota this month", "Quota ce mois")}</div>
                {detailLoading && <div style={{ fontSize: 12, color: "var(--muted)" }}>{T("Loading…", "Chargement…")}</div>}
                {userDetail && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {([
                      { key: "profiles_scanned",   label: T("Profiles scanned", "Profils scannés") },
                      { key: "messages_generated", label: T("Messages generated", "Messages générés") },
                      { key: "seo_exports",        label: T("SEO exports", "Exports SEO") },
                    ] as const).map(({ key, label }) => {
                      const used  = userDetail.usage[key];
                      const limit = userDetail.limits[key];
                      const pct   = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                      return (
                        <div key={key}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>{label}</span>
                            <span style={{ fontSize: 11, fontWeight: 600 }}>{used} / {limit}</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 2, background: "var(--line)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981", borderRadius: 2 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Leads section */}
              {userDetail && (
                <div className="drawerSection">
                  <div className="drawerSectionTitle">Leads</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Total leads</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: userDetail.leads.total > 0 ? "#3b82f6" : "var(--muted)" }}>
                        {userDetail.leads.total}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Last lead</span>
                      <span style={{ fontSize: 12 }}>
                        {userDetail.leads.lastLeadAt
                          ? new Date(userDetail.leads.lastLeadAt).toLocaleDateString(locale) + " " + new Date(userDetail.leads.lastLeadAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* All-time activity section */}
              {userDetail?.allTime && (
                <div className="drawerSection">
                  <div className="drawerSectionTitle">All-time activity</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {([
                      { label: "Scans total",    value: userDetail.allTime.profiles_scanned,   color: "#3b82f6" },
                      { label: "Messages total", value: userDetail.allTime.messages_generated, color: "#8b5cf6" },
                      { label: "SEO exports",    value: userDetail.allTime.seo_exports,        color: "#10b981" },
                    ]).map(({ label, value, color }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: value > 0 ? color : "var(--muted)" }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>Last activity</span>
                      <span style={{ fontSize: 12 }}>
                        {userDetail.allTime.lastActivityDate
                          ? new Date(userDetail.allTime.lastActivityDate).toLocaleDateString(locale)
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent 14 days mini-chart */}
              {userDetail?.recentDays && userDetail.recentDays.length > 0 && (() => {
                const days = [...userDetail.recentDays].reverse();
                const maxScans = Math.max(...days.map(d => d.profiles_scanned), 1);
                return (
                  <div className="drawerSection">
                    <div className="drawerSectionTitle">Last 14 days (scans)</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48, marginTop: 8 }}>
                      {days.map((d) => {
                        const h = Math.max(3, Math.round((d.profiles_scanned / maxScans) * 44));
                        const hasMsg = d.messages_generated > 0;
                        return (
                          <div
                            key={d.day}
                            title={`${d.day}\nScans: ${d.profiles_scanned}\nMessages: ${d.messages_generated}\nSEO: ${d.seo_exports}`}
                            style={{
                              flex: 1, height: h, borderRadius: 3,
                              background: hasMsg ? "#8b5cf6" : "#3b82f6",
                              opacity: d.profiles_scanned === 0 ? 0.15 : 0.85,
                              cursor: "default", transition: "opacity 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={e => (e.currentTarget.style.opacity = d.profiles_scanned === 0 ? "0.15" : "0.85")}
                          />
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>{days[0]?.day?.slice(5) ?? ""}</span>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>{days[days.length - 1]?.day?.slice(5) ?? "today"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: "#3b82f6", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: "#3b82f6", display: "inline-block" }} />
                        Scans only
                      </span>
                      <span style={{ fontSize: 10, color: "#8b5cf6", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: "#8b5cf6", display: "inline-block" }} />
                        + Messages
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Extend trial section */}
              <div className="drawerSection">
                <div className="drawerSectionTitle">Extend trial</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[7, 14, 30].map(days => (
                    <button
                      key={days}
                      className="btn ghost"
                      style={{ flex: 1, justifyContent: "center", color: "#d97706", borderColor: "rgba(217,119,6,0.35)", fontSize: 12 }}
                      onClick={() => void onExtendTrial(days)}
                      disabled={extendingTrial}
                    >
                      {extendingTrial ? "…" : `+${days}d`}
                    </button>
                  ))}
                </div>
                {userDetail?.user.trialEndsAt && (
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
                    Current trial end: <strong>{new Date(userDetail.user.trialEndsAt).toLocaleDateString(locale)}</strong>
                  </div>
                )}
              </div>

              {/* Extend scans section */}
              <div className="drawerSection">
                <div className="drawerSectionTitle">Extend scans</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[100, 500, 1000, 3000].map(amount => (
                    <button
                      key={amount}
                      className="btn ghost"
                      style={{ flex: 1, justifyContent: "center", color: "#2563eb", borderColor: "rgba(37,99,235,0.35)", fontSize: 12 }}
                      onClick={() => void onExtendScans(amount)}
                      disabled={extendingScans}
                    >
                      {extendingScans ? "…" : `+${amount}`}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                  Added on top of plan quota. Resets monthly with the user&apos;s quota.
                </div>
              </div>

              {/* Actions section */}
              <div className="drawerSection">
                <div className="drawerSectionTitle">{T("Actions", "Actions")}</div>
                {editingId === selectedUser.id ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn primary" onClick={() => void onSaveEdit(selectedUser.id)} disabled={saving} style={{ flex: 1 }}>
                      {saving ? "…" : T("Save", "Enregistrer")}
                    </button>
                    <button className="btn ghost" onClick={() => setEditingId(null)} style={{ flex: 1 }}>
                      {T("Cancel", "Annuler")}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn ghost" onClick={() => startEdit(selectedUser)} style={{ width: "100%", justifyContent: "center" }}>
                      ✏ {T("Edit plan / status", "Modifier plan / statut")}
                    </button>
                    <button
                      className="btn ghost"
                      style={{ width: "100%", justifyContent: "center", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
                      onClick={() => void onReset(selectedUser)}
                      disabled={resetting === selectedUser.id}
                    >
                      {resetting === selectedUser.id ? "…" : `↺ ${T("Reset data", "Réinitialiser les données")}`}
                    </button>
                    <button
                      className="btn ghost"
                      style={{ width: "100%", justifyContent: "center", color: "#ef4444", borderColor: "rgba(239,68,68,0.5)", fontWeight: 700 }}
                      onClick={() => void onDelete(selectedUser)}
                      disabled={deleting === selectedUser.id}
                    >
                      {deleting === selectedUser.id ? "…" : `🗑 ${T("Delete user permanently", "Supprimer définitivement")}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </AppLayout>
  );
}
