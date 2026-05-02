"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUserData } from "@/contexts/UserContext";
import { useSession } from "@/contexts/SessionContext";
import { LangSwitch } from "@/components/LangSwitch";
import { useLang } from "@/contexts/LangContext";
import { useTheme } from "@/contexts/ThemeContext";
import { tr } from "@/lib/i18n";

// ---- SVG Icons (sidebar nav) ----
const IcoDashboard = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IcoLeads = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
  </svg>
);
const IcoSeo = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M4 18.5h16"/>
    <path d="M7 16v-3.5M12 16V8.5M17 16v-5"/>
    <path d="M6 9.5l4-3 4 2 4-3"/>
  </svg>
);
const IcoMessages = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IcoSettings = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IcoTeam = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IcoSupport = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
  </svg>
);
const IcoAdmin = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IcoChat = () => (
  <svg className="navIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

// ---- SVG Icons (top bar) ----
const IcoSearch = () => (
  <svg className="topBarSearchIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6z"/>
    <path d="M9 17v1a3 3 0 0 0 6 0v-1"/>
  </svg>
);

const NAV_BASE = [
  { to: "/dashboard", Icon: IcoDashboard, label: "Dashboard", agency: false, admin: false },
  { to: "/leads",     Icon: IcoLeads,     label: "Leads",     agency: false, admin: false },
  { to: "/seo",       Icon: IcoSeo,       label: "SEO",       agency: false, admin: false },
  { to: "/messages",  Icon: IcoMessages,  label: "Messages",  agency: false, admin: false },
  { to: "/agency",    Icon: IcoTeam,      label: "Team",      agency: true,  admin: false },
  { to: "/team/chat", Icon: IcoChat,      label: "Chat",      agency: true,  admin: false },
  { to: "/support",   Icon: IcoSupport,   label: "Support",   agency: false, admin: false },
  { to: "/admin",     Icon: IcoAdmin,     label: "Admin",     agency: false, admin: true  },
];

function getInitials(name: string, email: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return (email.split("@")[0] || "US").slice(0, 2).toUpperCase();
}



export function AppLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data } = useUserData();
  const { token } = useSession();
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);
  const { dark, toggle } = useTheme();

  const user        = data?.user;
  const fullName    = String(user?.fullName || "").trim();
  const email       = String(user?.email    || "").trim();
  const avatarUrl   = user?.avatarUrl || null;
  const displayName = fullName || (email ? email.split("@")[0] : "User");
  const initials    = getInitials(displayName, email);
  const plan        = String(user?.plan || "FREE").toUpperCase();
  const trialEndsAt = user?.trialEndsAt;
  const trialEndMs = trialEndsAt ? Date.parse(trialEndsAt) : null;
  const trialExpired = plan === "FREE" && !!trialEndMs && trialEndMs <= Date.now() && Date.now() - trialEndMs <= 30 * 24 * 60 * 60 * 1000;
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(() =>
    typeof sessionStorage !== "undefined" && sessionStorage.getItem("trialBannerDismissed") === "1"
  );
  const [trialBannerHiding, setTrialBannerHiding] = useState(false);

  function dismissTrialBanner() {
    setTrialBannerHiding(true);
    setTimeout(() => {
      sessionStorage.setItem("trialBannerDismissed", "1");
      setTrialBannerDismissed(true);
    }, 400);
  }
  const isOnTrial   = !!trialEndMs && trialEndMs > Date.now();
  const isAgency    = plan === "AGENCY";
  const isAdmin     = user?.isAdmin === true;
  const NAV         = NAV_BASE.filter((item) => (!item.agency || isAgency) && (!item.admin || isAdmin));

  const PAGE_LABELS: Record<string, [string, string]> = {
    "/dashboard": ["Dashboard Overview", "Vue d'ensemble"],
    "/leads":     ["Leads", "Leads"],
    "/seo":       ["SEO", "SEO"],
    "/messages":  ["Messages", "Messages"],
    "/settings":  ["Settings", "Paramètres"],
    "/support":   ["Support", "Support"],
    "/admin":     ["Admin", "Admin"],
    "/agency":    ["Team", "Équipe"],
    "/account":   ["Account", "Compte"],
    "/team/chat": ["Chat", "Chat"],
  };
  const pageKey = Object.keys(PAGE_LABELS).find(k => pathname === k || pathname.startsWith(k + "/")) ?? "/dashboard";
  const [pageEn, pageFr] = PAGE_LABELS[pageKey];
  const pageLabel = T(pageEn, pageFr);

  const [chatUnread, setChatUnread] = useState(0);
  useEffect(() => {
    if (!isAgency || !token) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/team/chat/unread", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        setChatUnread(Number(d.count) || 0);
      } catch { /* ignore */ }
    };
    void fetchUnread();
    const id = setInterval(() => void fetchUnread(), 30_000);
    return () => clearInterval(id);
  }, [isAgency, token]);

  // ── Notifications ──────────────────────────────────────────────────────────
  type AppNotif = {
    id: string; user_id: string; type: string; category: string;
    title: string; message?: string; read: boolean; created_at: string;
    action_url?: string | null;
  };
  const [notifs,   setNotifs]   = useState<AppNotif[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
      const d   = await res.json();
      if (d.ok) setNotifs(d.notifications ?? []);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    void fetchNotifs();
    const id = setInterval(() => void fetchNotifs(), 60_000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  // Click-outside closes dropdown
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  const unreadCount = notifs.filter(n => !n.read).length;

  async function openBell() {
    setBellOpen(o => !o);
    if (!bellOpen && unreadCount > 0 && token) {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    }
  }

  function notifDot(type: string) {
    if (type === "danger")  return "#ef4444";
    if (type === "warning") return "#f59e0b";
    if (type === "success") return "#22c55e";
    return "#3b82f6";
  }

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="appShell">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebarOverlay" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
        <div className="sidebarHead">
          <div className="sidebarLogo">
            <div className="sidebarLogoIcon">
              <Image src="/favicon.svg" alt="seoprospector" width={34} height={34} />
            </div>
            <div>
              <div className="sidebarLogoText">seoprospector</div>
              <div className="sidebarLogoSub" style={{ color: "#3b82f6" }}>linkedin</div>
            </div>
          </div>
        </div>

        <nav className="sidebarNav">
          {(() => {
            const NAV_LABELS: Record<string, string> = {
              Dashboard: T("Dashboard", "Tableau de bord"),
              Leads: "Leads",
              SEO: "SEO",
              Messages: T("Tracking", "Tracking"),
              Team: T("Team", "Équipe"),
              Chat: T("Chat", "Chat"),
              Settings: T("Settings", "Paramètres"),
              Support: "Support",
              Admin: "Admin",
            };
            return NAV.map(({ to, Icon, label }) => {
              const isActive = pathname === to || pathname.startsWith(to + "/");
              const badge = label === "Chat" && chatUnread > 0 ? chatUnread : null;
              return (
                <React.Fragment key={to}>
                  {to === "/support" && <div style={{ height: 12 }} />}
                  <Link
                    href={to}
                    className={`navItem${isActive ? " active" : ""}`}
                  >
                    <Icon />
                    {NAV_LABELS[label] ?? label}
                    {badge !== null && (
                      <span className="navBadge">{badge > 99 ? "99+" : badge}</span>
                    )}
                  </Link>
                </React.Fragment>
              );
            });
          })()}
        </nav>

        {/* Team members — visible only on AGENCY */}
        {isAgency && (() => {
          const seatUsers = (Array.isArray(data?.seatUsers) ? data!.seatUsers! : [])
            .filter(u => u.userId !== user?.id);
          if (seatUsers.length === 0) return null;
          return (
            <div className="sidebarTeam">
              <div className="sidebarTeamLabel">{T("Team", "Équipe")}</div>
              {seatUsers.map((u, i) => {
                const name = String(u.fullName || u.email || `Member ${i + 1}`);
                const ini  = name.trim().slice(0, 2).toUpperCase();
                const emailStr = String(u.email || "");
                return (
                  <div
                    key={u.userId || i}
                    className="sidebarTeamMember"
                    onClick={() => router.push(`/agency/member/${u.userId || ""}`)}
                    title={`${name} — ${emailStr}`}
                  >
                    <div className="sidebarTeamAvatar">{ini}</div>
                    <div className="sidebarTeamInfo">
                      <div className="sidebarTeamName">{name.split(" ")[0]}</div>
                      <div className="sidebarTeamEmail">{emailStr}</div>
                    </div>
                  </div>
                );
              })}
              <div
                className="sidebarTeamManage"
                onClick={() => router.push("/agency")}
              >
                {T("Manage team →", "Gérer l'équipe →")}
              </div>
            </div>
          );
        })()}

        <div className="sidebarBottom">
          <div
            className="sidebarUser"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/account")}
            title="Account settings"
          >
            <div className="userAvatar">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : initials}
            </div>
            <div className="userInfo">
              <div className="userName">{displayName}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <div className="userPlanBadge" style={{ marginTop: 0 }}>{plan}</div>
                {isOnTrial && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                    color: "#d97706", background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.35)",
                    borderRadius: 4, padding: "1px 5px", lineHeight: 1.5,
                    textTransform: "uppercase", flexShrink: 0,
                  }}>Trial</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="appMain">
        {/* Top bar */}
        <div className="topBar">
          {/* Mobile burger */}
          <button className="appBurger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
            <span className="appBurgerBar" />
            <span className="appBurgerBar" />
            <span className="appBurgerBar" />
          </button>

          {/* Breadcrumb — left */}
          <nav className="topBarBreadcrumb">
            <span className="topBarBreadcrumbHome">{T("Home", "Accueil")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35, flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span className="topBarBreadcrumbPage">{pageLabel}</span>
          </nav>

          <div className="topBarRight">
            <div ref={bellRef} style={{ position: "relative" }}>
              <button
                className="topBarBtn"
                title="Notifications"
                onClick={() => void openBell()}
                style={{ position: "relative" }}
              >
                <IcoBell />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: 4, right: 4,
                    minWidth: 15, height: 15, borderRadius: 8,
                    background: "#ef4444", color: "#fff",
                    fontSize: 9, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 3px", border: "1.5px solid #fff", lineHeight: 1,
                    pointerEvents: "none",
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  width: 340, background: "var(--surface)", borderRadius: 14,
                  border: "1px solid var(--line)", boxShadow: "var(--shadow-md)",
                  zIndex: 200, overflow: "hidden",
                }}>
                  {/* Header */}
                  <div style={{ padding: "14px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{T("Notifications", "Notifications")}</span>
                    {unreadCount > 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#fff",
                        background: "#ef4444", borderRadius: 20,
                        padding: "2px 7px", lineHeight: 1.5,
                      }}>{unreadCount}</span>
                    )}
                  </div>

                  {/* Items */}
                  <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {notifs.length === 0 && (
                      <div style={{ padding: "32px 18px", textAlign: "center" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)", marginBottom: 8 }}>
                          <path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6z"/>
                          <path d="M9 17v1a3 3 0 0 0 6 0v-1"/>
                        </svg>
                        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{T("All caught up!", "Tout est à jour !")}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, opacity: 0.7 }}>{T("No notifications yet", "Aucune notification")}</div>
                      </div>
                    )}
                    {notifs.map((n, i) => {
                      const dot = notifDot(n.type);
                      return (
                        <div key={n.id}
                          onClick={() => { if (n.action_url) { setBellOpen(false); router.push(n.action_url); } }}
                          style={{
                            padding: "12px 18px",
                            borderTop: i === 0 ? "1px solid var(--line)" : "1px solid var(--line)",
                            background: n.read ? "transparent" : `color-mix(in srgb, ${dot} 6%, transparent)`,
                            display: "flex", gap: 12, alignItems: "flex-start",
                            cursor: n.action_url ? "pointer" : "default",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (n.action_url) (e.currentTarget as HTMLDivElement).style.background = "var(--bg)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.read ? "transparent" : `color-mix(in srgb, ${dot} 6%, transparent)`; }}
                        >
                          {/* Icon pill */}
                          <div style={{
                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                            background: `color-mix(in srgb, ${dot} 12%, transparent)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13, lineHeight: 1.4, color: "var(--text)" }}>
                              {n.title}
                            </div>
                            {n.message && (
                              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>
                                {n.message}
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                                {new Date(n.created_at).toLocaleDateString()} · {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {n.action_url && (
                                <span style={{ fontSize: 11, color: "var(--brand)", fontWeight: 600 }}>
                                  {T("View →", "Voir →")}
                                </span>
                              )}
                            </div>
                          </div>

                          {!n.read && (
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0, marginTop: 5 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              className="topBarBtn"
              onClick={toggle}
              title={dark ? T("Light mode", "Mode clair") : T("Dark mode", "Mode sombre")}
            >
              {dark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <div
              className="topBarAvatar"
              onClick={() => router.push("/account")}
              title={displayName}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                : initials}
            </div>
          </div>
        </div>
        <main className={className}>{children}</main>
        {trialExpired && !trialBannerDismissed && (
          <div style={{
            position: "fixed", bottom: 0, left: 232, right: 0, zIndex: 49,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            padding: "9px 24px", background: "#fffbeb",
            borderTop: "1px solid rgba(245,158,11,0.25)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            opacity: trialBannerHiding ? 0 : 1,
            transform: trialBannerHiding ? "translateY(100%)" : "translateY(0)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#92400e" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontWeight: 600 }}>
                {lang === "fr"
                  ? "Votre essai gratuit est terminé — vos données sont conservées, passez à Pro pour accéder à vos audits complets."
                  : "Your free trial has ended — your data is safe, upgrade to Pro to access your full audits."}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <a href="/account" className="btnUpgradeAmber">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                {lang === "fr" ? "Passer à Pro" : "Upgrade to Pro"}
              </a>
              <button
                onClick={dismissTrialBanner}
                aria-label="Dismiss"
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(217,119,6,0.12)", border: "none", cursor: "pointer",
                  color: "#b45309", flexShrink: 0, transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(217,119,6,0.22)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(217,119,6,0.12)")}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
