"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WaitlistButton } from "@/components/WaitlistModal";

function WaitlistBillingBtn({ plan }: { plan: "STARTER" | "PRO" | "AGENCY" }) {
  const cls = plan === "PRO" ? "billingUpgradeBtn billingUpgradeBtn--pro"
    : plan === "AGENCY" ? "billingUpgradeBtn billingUpgradeBtn--agency"
    : "billingUpgradeBtn";
  return <WaitlistButton plan={plan} trigger="Join waitlist" className={cls} />;
}
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, changePassword, getBillingCheckoutLink, logoutUser, updateMe } from "@/lib/api";
import { resolveUsageTone } from "@/lib/usageTone";
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/components/Toast";
import { useLang } from "@/contexts/LangContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnimations } from "@/contexts/AnimationsContext";
import { tr } from "@/lib/i18n";

const FALLBACK_PRICES: Record<string, number> = { FREE: 0, STARTER: 29, PRO: 59, AGENCY: 149 };
const PLAN_DETAILS: Record<string, { scans: number; messages: number; seo: number; users: number; extra?: string }> = {
  FREE:    { scans: 40,    messages: 0,    seo: 5,    users: 1 },
  STARTER: { scans: 500,   messages: 100,  seo: 50,   users: 1 },
  PRO:     { scans: 3000,  messages: 400,  seo: 1200, users: 1 },
  AGENCY:  { scans: 18000, messages: 2000, seo: 6000, users: 5, extra: "+$19/seat" },
};

type Tab = "profile" | "billing" | "extension" | "security" | "appearance";

function safeNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeDate(iso: string | null | undefined) {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t) : null;
}

function getInitials(name: string, email: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return (email.split("@")[0] || "US").slice(0, 2).toUpperCase();
}

function resizeImageToDataUrl(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AccountPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { token, setToken } = useSession();
  const { data, loading, refresh } = useUserData();
  const { toast }              = useToast();
  const { lang, setLang }      = useLang();
  const { dark, setDark }      = useTheme();
  const { enabled: animEnabled, setEnabled: setAnimEnabled } = useAnimations();
  const T = (en: string, fr: string) => tr(lang, en, fr);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const initialTab = (searchParams.get("tab") as Tab) || "profile";
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t) setTab(t);
  }, [searchParams]);

  const [fullNameInput, setFullNameInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [saving,        setSaving]        = useState(false);
  const [tokenCopied,   setTokenCopied]   = useState(false);
  const [upgrading,     setUpgrading]     = useState<string | null>(null);
  const [upgradeError,  setUpgradeError]  = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarZoomed,   setAvatarZoomed]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security tab
  const [currentPwd,  setCurrentPwd]  = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [savingPwd,   setSavingPwd]   = useState(false);

  const user      = data?.user      || {};
  const limits    = data?.limits    || {};
  const usage     = data?.usage     || {};
  const remaining = data?.remaining || {};
  const features  = data?.features  || {};
  const team      = data?.team      || {};
  const seatUsers = Array.isArray(data?.seatUsers) ? data!.seatUsers! : [];

  const plan      = String(user.plan   || "FREE").toUpperCase();
  const status    = String(user.status || "—").toUpperCase();
  const fullName  = String(user.fullName || "").trim();
  const email     = String(user.email   || "").trim();
  const avatarUrl = user.avatarUrl || null;
  const initials  = getInitials(fullName, email);

  const scanUsed  = safeNum(usage.profiles_scanned);
  const scanLimit = safeNum(limits.profiles_scanned);
  const scanLeft  = safeNum(remaining.profiles_scanned) || Math.max(0, scanLimit - scanUsed);
  const msgUsed   = safeNum(usage.messages_generated);
  const msgLimit  = safeNum(limits.messages_generated);
  const msgLeft   = safeNum(remaining.messages_generated) || Math.max(0, msgLimit - msgUsed);
  const seoUsed   = safeNum(usage.seo_exports);
  const seoLimit  = safeNum(limits.seo_exports);
  const seoLeft   = safeNum(remaining.seo_exports) || Math.max(0, seoLimit - seoUsed);

  const trialDays = (() => {
    if (!user.trialEndsAt) return null;
    const diff = Date.parse(user.trialEndsAt) - Date.now();
    return Number.isFinite(diff) && diff > 0 ? Math.ceil(diff / 86400000) : null;
  })();

  const totalSeats  = safeNum(team.seatsUsed) + safeNum(team.seatsRemaining);
  const maskedToken = token ? `${token.slice(0, 24)}${"•".repeat(16)}` : "—";

  useEffect(() => {
    setFullNameInput(String(user.fullName || ""));
    setLinkedinInput(String(user.linkedinProfileUrl || ""));
  }, [user.fullName, user.linkedinProfileUrl]);

  function switchTab(t: Tab) {
    setTab(t);
    router.replace(`/account?tab=${t}`, { scroll: false });
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await updateMe(token, {
        fullName: fullNameInput.trim() || undefined,
        linkedinProfileUrl: linkedinInput.trim() || undefined,
      });
      await refresh();
      toast(T("Profile saved", "Profil enregistré"), "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : T("Save failed", "Échec"), "error");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 400);
      await updateMe(token, { avatarUrl: dataUrl });
      await refresh();
      toast(T("Photo updated", "Photo mise à jour"), "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : T("Upload failed", "Échec"), "error");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    if (!avatarZoomed) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") setAvatarZoomed(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [avatarZoomed]);

  async function onRemoveAvatar() {
    if (!token) return;
    setAvatarUploading(true);
    try {
      await updateMe(token, { avatarUrl: "" });
      await refresh();
      toast(T("Photo removed", "Photo supprimée"), "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : T("Failed", "Échec"), "error");
    } finally {
      setAvatarUploading(false);
    }
  }

  function copyToken() {
    if (!token) return;
    void navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
    toast(T("Token copied", "Token copié"), "info");
  }

  async function onSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (newPwd !== confirmPwd) {
      toast(T("Passwords don't match", "Les mots de passe ne correspondent pas"), "error");
      return;
    }
    if (newPwd.length < 8) {
      toast(T("Password must be at least 8 characters", "Le mot de passe doit comporter au moins 8 caractères"), "error");
      return;
    }
    setSavingPwd(true);
    try {
      await changePassword(token, { currentPassword: currentPwd, newPassword: newPwd });
      toast(T("Password updated", "Mot de passe mis à jour"), "success");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : T("Update failed", "Échec de la mise à jour"), "error");
    } finally {
      setSavingPwd(false);
    }
  }

  async function onUpgrade(toPlan: string) {
    if (!token) return;
    setUpgrading(toPlan);
    setUpgradeError("");
    try {
      const out = await getBillingCheckoutLink(token, toPlan);
      if (out.url) window.open(out.url, "_blank");
    } catch (err) {
      setUpgradeError(err instanceof ApiError ? err.message : "BILLING_ERROR");
    } finally {
      setUpgrading(null);
    }
  }

  async function onLogout() {
    try { if (token) await logoutUser(token); } catch { /* ignore */ }
    setToken(null);
    router.replace("/login");
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "profile",
      label: T("Profile", "Profil"),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    },
    {
      key: "security",
      label: T("Security", "Sécurité"),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    },
    {
      key: "billing",
      label: T("Billing", "Facturation"),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    },
    {
      key: "extension",
      label: T("Extension", "Extension"),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    },
    {
      key: "appearance",
      label: T("Appearance", "Apparence"),
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    },
  ];

  return (
    <AppLayout>
      <div className="pageHeader">
        <div className="pageTitleGroup">
          <div className="pageTitleIconBox">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
          <div>
            <h1 className="pageTitle">{T("Account", "Compte")}</h1>
            <p className="pageSubtitle">{T("Profile, security, billing & extension in one place", "Profil, sécurité, facturation et extension au même endroit")}</p>
          </div>
        </div>
        <div className="row">
          <button className="btnRefresh" onClick={refresh} disabled={loading} title={T("Refresh", "Actualiser")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s ease", transform: loading ? "rotate(360deg)" : "none" }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="pageContent accountPage">

        {/* Tabs */}
        <div className="accountTabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`accountTab${tab === t.key ? " active" : ""}`}
              onClick={() => switchTab(t.key)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: PROFILE ── */}
        {tab === "profile" && (
          <div className="profilePageGrid">

            {/* Left: Profile card + Quota */}
            <div className="profileSideCol">
              <article className="card profileSideCard">
                {/* Top: avatar left + identity right */}
                <div className="profileSideTop">
                  <div className="profileAvatarSection">
                    <div
                      className="profileAvatarCircle"
                      style={{ position: "relative", cursor: avatarUrl ? "zoom-in" : "default" }}
                      onClick={() => { if (avatarUrl) setAvatarZoomed(true); }}
                    >
                      {avatarUrl
                        ? <img src={avatarUrl} alt={fullName || email} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        : initials}
                      {avatarUrl && (
                        <button
                          type="button"
                          className="profileAvatarRemoveBtn"
                          onClick={(e) => { e.stopPropagation(); onRemoveAvatar(); }}
                          disabled={avatarUploading}
                          aria-label="Remove photo"
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={onAvatarFileChange}
                    />
                    <button
                      className="profileAvatarUploadBtn"
                      type="button"
                      disabled={avatarUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarUploading
                        ? <span style={{ fontSize: 10 }}>{T("Uploading…", "Envoi…")}</span>
                        : <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            {T("Change photo", "Changer")}
                          </>}
                    </button>
                  </div>
                  <div className="profileSideIdentity">
                    <div className="profileSideName">{fullName || email.split("@")[0] || "User"}</div>
                    <div className="profileSideEmail">{email || "—"}</div>
                    <div className="profileSideBadges">
                      <span className="badge info">{plan}</span>
                      <span className={`badge ${status === "ACTIVE" ? "good" : "warn"}`}>{status}</span>
                      {trialDays && <span className="badge warn">{T("Trial:", "Essai :")} {trialDays}d {T("left", "restant")}</span>}
                      {user.role && <span className="badge dark">{String(user.role).toUpperCase()}</span>}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                {linkedinInput && (
                  <div className="profileSideContact">
                    <div className="profileContactRow">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      <span className="truncate">{linkedinInput.replace(/^https?:\/\//, "")}</span>
                    </div>
                  </div>
                )}

                {/* Agency seats */}
                {plan === "AGENCY" && (
                  <div className="profileSideSeats">
                    <div className="profileSideSeatsLabel">{T("Team seats", "Sièges équipe")}</div>
                    <div className="profileSideSeatsCount">
                      {safeNum(team.seatsUsed)}
                      <span>/{team.seatsRemaining == null ? "∞" : totalSeats}</span>
                    </div>
                    {seatUsers.length > 0 && (
                      <div className="seatPillRow" style={{ marginTop: 10 }}>
                        {seatUsers.map((u, i) => {
                          const name = String(u.fullName || u.email || `User ${i + 1}`);
                          return (
                            <div key={u.userId || i} className="seatPill">
                              <div className="seatPillAvatar">{name.slice(0, 2).toUpperCase()}</div>
                              {name.split(" ")[0]}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </article>

              {/* Quota usage — below profile card */}
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
                  <span className="badge info" style={{ fontSize: 10 }}>{plan}</span>
                </div>
                <div className="cardBody" style={{ paddingTop: 8 }}>
                  {[
                    { label: T("Messages / month", "Messages / mois"), used: msgUsed,  limit: msgLimit,  left: msgLeft,  tone: resolveUsageTone(msgUsed,  msgLimit) },
                    { label: T("SEO exports",       "Exports SEO"),     used: seoUsed,  limit: seoLimit,  left: seoLeft,  tone: resolveUsageTone(seoUsed,  seoLimit) },
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
                  <div className="quotaFeatures">
                    <p className="quotaFeaturesTitle">{T("Features", "Fonctionnalités")}</p>
                    <div className="quotaFeaturesGrid">
                      {[
                        { key: "exportCsv",    label: T("CSV export enabled",  "Export CSV activé") },
                        { key: "sendNow",      label: T("Send now enabled",    "Envoi direct activé") },
                        { key: "icpAssistant", label: T("AI scanner enabled",  "Scan IA activé") },
                      ].map(({ key, label }) => {
                        const on = !!features[key as keyof typeof features];
                        return (
                          <div key={key} className={`quotaFeatureItem${on ? " quotaFeatureItem--on" : ""}`}>
                            <span className="quotaFeatureCheck">
                              {on ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              ) : (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              )}
                            </span>
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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

            {/* Right: Personal info + activity */}
            <div className="profileMainCol">

              {/* Personal Information */}
              <article className="card">
                <div className="cardHeader">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="profileCardHeaderIcon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <span className="cardTitle">{T("Personal Information", "Informations personnelles")}</span>
                  </div>
                </div>
                <div className="cardBody">
                  <form className="profileFormGrid" onSubmit={(e) => void onSaveProfile(e)}>
                    <div className="field">
                      <label>{T("Full name", "Nom complet")}</label>
                      <input className="inputField" type="text" placeholder={T("Your full name", "Votre nom complet")} value={fullNameInput} onChange={e => setFullNameInput(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Email <span className="muted" style={{ fontWeight: 400, textTransform: "none" }}>({T("read-only", "lecture seule")})</span></label>
                      <input className="inputField" type="email" value={email} disabled style={{ opacity: 0.55, cursor: "not-allowed" }} />
                    </div>
                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                      <label>{T("LinkedIn Profile URL", "URL du profil LinkedIn")}</label>
                      <input className="inputField" type="url" placeholder="https://linkedin.com/in/your-profile" value={linkedinInput} onChange={e => setLinkedinInput(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>
                        {T("Location", "Localisation")}
                        <span className="muted" style={{ fontWeight: 400, fontSize: 10, textTransform: "none", marginLeft: 6 }}>({T("coming soon", "bientôt")})</span>
                      </label>
                      <input className="inputField" type="text" placeholder={T("City, Country", "Ville, Pays")} disabled style={{ opacity: 0.4, cursor: "not-allowed" }} />
                    </div>
                    <div className="field">
                      <label>
                        {T("Timezone", "Fuseau horaire")}
                        <span className="muted" style={{ fontWeight: 400, fontSize: 10, textTransform: "none", marginLeft: 6 }}>({T("coming soon", "bientôt")})</span>
                      </label>
                      <input className="inputField" type="text" placeholder="UTC+0" disabled style={{ opacity: 0.4, cursor: "not-allowed" }} />
                    </div>
                    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                      <button className="btnSaveProfile" type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            {T("Saving…", "Enregistrement…")}
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            {T("Save changes", "Enregistrer")}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </article>

              {/* Account Activity */}
              <article className="card" style={{ marginTop: 16 }}>
                <div className="cardHeader">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="profileCardHeaderIcon profileCardHeaderIcon--green">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <span className="cardTitle">{T("Account Activity", "Activité du compte")}</span>
                  </div>
                  <span className="muted small">{T("Login history", "Historique de connexion")}</span>
                </div>
                <div className="cardBody">
                  <div className="profileActivityList">
                    <div className="profileActivityItem">
                      <div className="profileActivityIcon profileActivityIcon--active">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      </div>
                      <div className="profileActivityInfo">
                        <div className="profileActivityTitle">{T("Current session", "Session en cours")}</div>
                        <div className="profileActivitySub">{T("Web browser · Active now", "Navigateur web · Actif maintenant")}</div>
                      </div>
                      <span className="badge good" style={{ fontSize: 10, flexShrink: 0 }}>{T("Active", "Actif")}</span>
                    </div>
                    <div className="profileActivityEmpty">
                      {T("Full login history will be available soon.", "L'historique complet des connexions sera disponible prochainement.")}
                    </div>
                  </div>
                </div>
              </article>

              {/* Danger zone */}
              <div className="dangerZoneRow" style={{ marginTop: 16 }}>
                <div className="dangerZoneLeft">
                  <div className="dangerZoneIcon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </div>
                  <div>
                    <div className="dangerZoneTitle">{T("Sign out", "Se déconnecter")}</div>
                    <div className="dangerZoneSub">{T("You will be redirected to the login page.", "Vous serez redirigé vers la page de connexion.")}</div>
                  </div>
                </div>
                <button className="btn danger" onClick={() => void onLogout()}>{T("Logout", "Déconnexion")}</button>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB: BILLING ── */}
        {tab === "billing" && (() => {
          const PLAN_RANK: Record<string, number> = { FREE: 0, STARTER: 1, PRO: 2, AGENCY: 3 };
          const currentRank = PLAN_RANK[plan] ?? 0;
          const BILLING_PLANS: {
            key: string; price: number; badge: string; note: string;
            features: { text: string; disabled?: boolean; seat?: boolean }[];
          }[] = [
            {
              key: "FREE", price: 0,
              badge: "Free",
              note: T("Validate lead quality before committing.", "Validez la qualité des leads avant de vous engager."),
              features: [
                { text: T("1 user", "1 utilisateur") },
                { text: T("40 scans / month", "40 scans / mois") },
                { text: T("5 SEO audits / month", "5 audits SEO / mois") },
                { text: T("5 messages / month", "5 messages / mois") },
                { text: T("CSV export", "Export CSV"), disabled: true },
                { text: T("AI scanner", "Scan IA"), disabled: true },
              ],
            },
            {
              key: "STARTER", price: 29,
              badge: "Starter",
              note: T("For solo prospectors ready to scale outbound.", "Pour les prospecteurs solo prêts à scaler."),
              features: [
                { text: T("1 user", "1 utilisateur") },
                { text: T("500 scans / month", "500 scans / mois") },
                { text: T("50 SEO audits / month", "50 audits SEO / mois") },
                { text: T("100 messages / month", "100 messages / mois") },
                { text: T("CSV export", "Export CSV") },
                { text: T("AI scanner", "Scan IA"), disabled: true },
              ],
            },
            {
              key: "PRO", price: 59,
              badge: T("Most popular", "Plus populaire"),
              note: T("Full pipeline automation for serious closers.", "Automatisation complète du pipeline pour les pros."),
              features: [
                { text: T("1 user", "1 utilisateur") },
                { text: T("3 000 scans / month", "3 000 scans / mois") },
                { text: T("1 200 SEO audits / month", "1 200 audits SEO / mois") },
                { text: T("400 messages / month", "400 messages / mois") },
                { text: T("CSV export", "Export CSV") },
                { text: T("AI scanner", "Scan IA") },
              ],
            },
            {
              key: "AGENCY", price: 149,
              badge: "Agency",
              note: T("For teams managing multiple clients at scale.", "Pour les agences gérant plusieurs clients à grande échelle."),
              features: [
                { text: T("5 users included (max 15)", "5 utilisateurs inclus (max 15)") },
                { text: T("18 000 scans / month (shared pool)", "18 000 scans / mois (pool partagé)") },
                { text: T("6 000 SEO audits / month", "6 000 audits SEO / mois") },
                { text: T("2 000 messages / month", "2 000 messages / mois") },
                { text: T("CSV + AI scanner + full audit", "CSV + scan IA + audit complet") },
                { text: "+$19 / seat · +2 000 scans/seat", seat: true },
              ],
            },
          ];

          return (
            <>
              {upgradeError && <div className="errorBox" style={{ marginBottom: 16 }}>{upgradeError}</div>}
              <div className="billingHeader">
                <h2 className="billingTitle">{T("Plans for every need", "Un plan pour chaque besoin")}</h2>
                <p className="billingTitleSub">{T("Scale at your own pace — upgrade or cancel anytime.", "Évoluez à votre rythme — mettez à niveau ou annulez à tout moment.")}</p>
              </div>
              <div className="billingPricing">
                {BILLING_PLANS.map(({ key, price, badge, note, features }) => {
                  const isCurrent = key === plan;
                  const isUpgrade = (PLAN_RANK[key] ?? 0) > currentRank;
                  return (
                    <article key={key} className={`billingPriceCard billingPriceCard--${key.toLowerCase()}${isCurrent ? " billingPriceCard--current" : ""}`}>
                      <span className={`billingPriceBadge${key === "PRO" ? " billingPriceBadge--pro" : key === "AGENCY" ? " billingPriceBadge--agency" : ""}`}>
                        {badge}
                      </span>
                      <p className="billingPricePlan">{key}</p>
                      <p className="billingPriceAmount">${price}<span>/mo</span></p>
                      <p className="billingPriceNote">{note}</p>
                      <ul className="billingPriceFeatures">
                        {features.map((f, i) => (
                          <li key={i} className={`billingPriceFeature${f.disabled ? " billingPriceFeature--no" : ""}${f.seat ? " billingPriceFeature--seat" : ""}`}>
                            {f.text}
                          </li>
                        ))}
                      </ul>
                      <div style={{ marginTop: "auto", paddingTop: 20 }}>
                        {isCurrent ? (
                          <div className="billingCurrentTag">✓ {T("Current plan", "Plan actuel")}</div>
                        ) : isUpgrade ? (
                          <WaitlistBillingBtn plan={key as "STARTER" | "PRO" | "AGENCY"} />
                        ) : (
                          <div className="billingCurrentTag billingCurrentTag--muted">{T("Not available", "Non disponible")}</div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="billingSubtitle">{T("Billed monthly · no hidden fees", "Facturation mensuelle · sans frais cachés")}</p>
            </>
          );
        })()}

        {/* ── TAB: EXTENSION ── */}
        {tab === "extension" && (
          <article className="card extensionCard">
            <div className="extensionCardHero">
              <div className="extensionCardHeroLeft">
                <div className="extensionCardIcon">🧩</div>
                <div>
                  <div className="extensionCardHeroTitle">{T("Extension connection", "Connexion à l'extension")}</div>
                  <div className="extensionCardHeroSub">{T("Chrome extension · Synced with your account", "Extension Chrome · Synchronisée avec votre compte")}</div>
                </div>
              </div>
              <span className="badge good">{T("Active", "Actif")}</span>
            </div>

            <div className="extensionCardBody">
              <div className="extensionSteps">
                <div className="extensionStep">
                  <div className="extensionStepNum">1</div>
                  <div>
                    <div className="extensionStepLabel">{T("Install the extension", "Installer l'extension")}</div>
                    <div className="extensionStepDesc">{T("Download seoprospector from the Chrome Web Store and pin it to your toolbar.", "Téléchargez seoprospector depuis le Chrome Web Store et épinglez-le à votre barre d'outils.")}</div>
                  </div>
                </div>
                <div className="extensionStep">
                  <div className="extensionStepNum">2</div>
                  <div>
                    <div className="extensionStepLabel">{T("Copy your session token", "Copiez votre token de session")}</div>
                    <div className="extensionStepDesc">{T("Use the key below to authenticate. It links the extension directly to your account.", "Utilisez la clé ci-dessous pour vous authentifier. Elle relie l'extension directement à votre compte.")}</div>
                  </div>
                </div>
                <div className="extensionStep">
                  <div className="extensionStepNum">3</div>
                  <div>
                    <div className="extensionStepLabel">{T("Paste in extension settings", "Collez dans les paramètres de l'extension")}</div>
                    <div className="extensionStepDesc">{T("Open the extension popup, go to Settings, and paste your token to activate.", "Ouvrez le popup de l'extension, allez dans Paramètres et collez votre token pour activer.")}</div>
                  </div>
                </div>
              </div>

              <div className="extensionTokenBlock">
                <div className="extensionTokenLabelRow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  {T("Session token", "Token de session")}
                </div>
                <div className="extensionTokenRow">
                  <input className="extensionTokenInput" type="text" value={maskedToken} readOnly />
                  <button className={`extensionCopyBtn${tokenCopied ? " copied" : ""}`} onClick={copyToken}>
                    {tokenCopied ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {T("Copied!", "Copié !")}
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        {T("Copy", "Copier")}
                      </>
                    )}
                  </button>
                </div>
                <div className="extensionTokenWarn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {T("Keep this token private — it grants full access to your account. Tokens expire automatically; log out and back in to refresh.", "Gardez ce token privé — il donne un accès complet à votre compte. Les tokens expirent automatiquement ; déconnectez-vous et reconnectez-vous pour le renouveler.")}
                </div>
              </div>
            </div>
          </article>
        )}

        {/* ── TAB: SECURITY ── */}
        {tab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Change Password */}
            <article className="card">
              <div className="cardHeader">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="profileCardHeaderIcon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <span className="cardTitle">{T("Change Password", "Changer le mot de passe")}</span>
                </div>
              </div>
              <div className="cardBody">
                <form className="securityPasswordForm" onSubmit={(e) => void onSavePassword(e)}>
                  <div className="field">
                    <label>{T("Current password", "Mot de passe actuel")}</label>
                    <input className="inputField" type="password" placeholder="••••••••" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} autoComplete="current-password" />
                  </div>
                  <div className="securityPasswordRow">
                    <div className="field">
                      <label>{T("New password", "Nouveau mot de passe")}</label>
                      <input className="inputField" type="password" placeholder="••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)} autoComplete="new-password" />
                    </div>
                    <div className="field">
                      <label>{T("Confirm new password", "Confirmer le nouveau mot de passe")}</label>
                      <input
                        className={`inputField${confirmPwd && confirmPwd !== newPwd ? " inputField--error" : ""}`}
                        type="password"
                        placeholder="••••••••"
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        autoComplete="new-password"
                      />
                      {confirmPwd && confirmPwd !== newPwd && (
                        <div className="fieldError">{T("Passwords don't match", "Les mots de passe ne correspondent pas")}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                    <div className="securityPwdHint">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {T("Minimum 8 characters", "Minimum 8 caractères")}
                    </div>
                    <button className="btnSaveProfile" type="submit" disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd || newPwd !== confirmPwd}>
                      {savingPwd ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.7s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          {T("Updating…", "Mise à jour…")}
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          {T("Update password", "Mettre à jour")}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </article>

            {/* 2FA */}
            <article className="card">
              <div className="cardHeader">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="profileCardHeaderIcon profileCardHeaderIcon--green">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <span className="cardTitle">{T("Two-Factor Authentication", "Double authentification")}</span>
                </div>
                <span className="badge warn" style={{ fontSize: 10 }}>{T("Coming soon", "Bientôt")}</span>
              </div>
              <div className="cardBody">
                <div className="securityTfaRow">
                  <div className="securityTfaIconWrap">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  </div>
                  <div className="securityTfaInfo">
                    <div className="securityTfaTitle">{T("Authenticator app", "Application d'authentification")}</div>
                    <div className="securityTfaSub">{T("Use Google Authenticator, Authy, or any TOTP app to generate one-time codes when signing in.", "Utilisez Google Authenticator, Authy ou toute application TOTP pour générer des codes à usage unique lors de la connexion.")}</div>
                  </div>
                  <button className="btn sm" disabled style={{ flexShrink: 0, opacity: 0.45, cursor: "not-allowed" }}>
                    {T("Enable", "Activer")}
                  </button>
                </div>
              </div>
            </article>

          </div>
        )}

        {/* ── TAB: APPEARANCE ── */}
        {tab === "appearance" && (
          <article className="card">
            <div className="cardHeader"><span className="cardTitle">{T("Appearance", "Apparence")}</span></div>
            <div className="cardBody">
              <div className="appearanceSection">

                {/* Language */}
                <div className="appearanceRow">
                  <div className="appearanceRowInfo">
                    <div className="appearanceRowLabel">{T("Language", "Langue")}</div>
                    <div className="appearanceRowSub">{T("Interface language for the dashboard.", "Langue de l'interface du tableau de bord.")}</div>
                  </div>
                  <div className="langSelector">
                    <button className={`langPill${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>
                      <span>🇬🇧</span> EN
                    </button>
                    <button className={`langPill${lang === "fr" ? " active" : ""}`} onClick={() => setLang("fr")}>
                      <span>🇫🇷</span> FR
                    </button>
                  </div>
                </div>

                {/* Theme */}
                <div className="appearanceRow">
                  <div className="appearanceRowInfo">
                    <div className="appearanceRowLabel">{T("Theme", "Thème")}</div>
                    <div className="appearanceRowSub">{T("Choose between light and dark interface.", "Choisissez entre l'interface claire et sombre.")}</div>
                  </div>
                  <div className="themeSelector">
                    <button className={`themePill${!dark ? " active" : ""}`} onClick={() => setDark(false)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      {T("Light", "Clair")}
                    </button>
                    <button className={`themePill${dark ? " active" : ""}`} onClick={() => setDark(true)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                      {T("Dark", "Sombre")}
                    </button>
                  </div>
                </div>

                {/* Animations */}
                <div className="appearanceRow">
                  <div className="appearanceRowInfo">
                    <div className="appearanceRowLabel">{T("Animations", "Animations")}</div>
                    <div className="appearanceRowSub">{T("Disable all transitions and animations for better performance.", "Désactiver toutes les transitions et animations pour de meilleures performances.")}</div>
                  </div>
                  <label className="toggleSwitch">
                    <input type="checkbox" checked={animEnabled} onChange={e => setAnimEnabled(e.target.checked)} />
                    <span className="toggleTrack" />
                  </label>
                </div>

              </div>
            </div>
          </article>
        )}

      </div>

      {avatarZoomed && avatarUrl && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
            animation: "wlFadeIn 0.2s ease",
          }}
          onClick={() => setAvatarZoomed(false)}
          onKeyDown={(e) => { if (e.key === "Escape") setAvatarZoomed(false); }}
          tabIndex={-1}
        >
          <img
            src={avatarUrl}
            alt={fullName || email}
            style={{
              width: 280, height: 280,
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              border: "3px solid rgba(255,255,255,0.15)",
              animation: "wlSlideIn 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setAvatarZoomed(false)}
            style={{
              position: "fixed", top: 20, right: 24,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%", width: 36, height: 36,
              color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="Close"
          >×</button>
        </div>,
        document.body
      )}
    </AppLayout>
  );
}
