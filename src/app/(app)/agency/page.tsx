"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, inviteTeamMember, removeTeamMember, addSeat } from "@/lib/api";
import type { SeatUser } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";
import { useUserData } from "@/contexts/UserContext";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/components/Toast";
import { useLang } from "@/contexts/LangContext";
import { tr } from "@/lib/i18n";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length >= 1) return parts[0].slice(0, 2).toUpperCase();
  return "??";
}

function MemberAvatar({ name }: { name: string }) {
  return (
    <div className="agencyMemberAvatar">
      {getInitials(name)}
    </div>
  );
}

export default function AgencyPage() {
  const router = useRouter();
  const { token, setToken } = useSession();
  const { data, loading, refresh } = useUserData();
  const { toast } = useToast();
  const { lang } = useLang();
  const T = (en: string, fr: string) => tr(lang, en, fr);

  const [inviteEmail, setInviteEmail]     = useState("");
  const [inviting,    setInviting]        = useState(false);
  const [inviteLink,  setInviteLink]      = useState<string | null>(null);
  const [removingId,  setRemovingId]      = useState<string | null>(null);
  const [addingSeat,  setAddingSeat]      = useState(false);

  const user      = data?.user      || {};
  const team      = data?.team      || {};
  const seatUsers = Array.isArray(data?.seatUsers) ? data!.seatUsers! : [];

  const plan    = String(user.plan     || "FREE").toUpperCase();
  const isOwner = user.teamRole === "OWNER" || user.teamRole == null && plan === "AGENCY";

  // Backend sends owner first; exclude current user (already shown at bottom of sidebar)
  const displayUsers = seatUsers.filter(u => u.userId !== user.id);

  // Redirect non-agency users
  if (!loading && plan !== "AGENCY") {
    return (
      <AppLayout>
        <div className="pageHeader">
          <div className="pageTitleGroup">
            <div className="pageTitleIconBox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div>
              <h1 className="pageTitle">{T("Team", "Équipe")}</h1>
              <p className="pageSubtitle">{T("Agency plan required", "Plan Agency requis")}</p>
            </div>
          </div>
        </div>
        <div className="pageContent">
          <article className="card extensionBanner">
            <div className="extensionBannerBody">
              <div className="extensionBannerEmoji">👥</div>
              <div>
                <div className="extensionBannerTitle">{T("Agency plan required", "Plan Agency requis")}</div>
                <div className="extensionBannerSub">
                  {T("Upgrade to the Agency plan to invite team members, share leads, and manage seats.", "Passez au plan Agency pour inviter des membres, partager des leads et gérer des sièges.")}
                </div>
                <a href="/account" className="btn primary" style={{ marginTop: 16, display: "inline-flex" }}>
                  {T("View plans →", "Voir les plans →")}
                </a>
              </div>
            </div>
          </article>
        </div>
      </AppLayout>
    );
  }

  const seatsUsed     = Number(team.seatsUsed    || 0);
  const includedSeats = Number(team.includedUsers || 5);  // seats included in base plan
  const maxSeats      = Number(team.seatsLimit    || 15); // hard cap
  const seatsRemaining = Math.max(0, maxSeats - seatsUsed);
  const seatPct        = Math.min(100, Math.round((seatsUsed / maxSeats) * 100));
  const atMaxSeats     = seatsUsed >= maxSeats;
  const canInvite      = !atMaxSeats;
  const extraSeats     = Math.max(0, seatsUsed - includedSeats);

  async function onInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteLink(null);
    try {
      const out = await inviteTeamMember(token, inviteEmail.trim());
      if (out.type === "invite_link" && out.inviteUrl) {
        setInviteLink(out.inviteUrl);
        toast(`${inviteEmail.trim()} has no account yet — share the link below`, "info");
      } else {
        toast(`${inviteEmail.trim()} added to your team`, "success");
        setInviteEmail("");
      }
      await refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null); router.replace("/login"); return;
      }
      toast(err instanceof ApiError ? err.message : "Invite failed", "error");
    } finally {
      setInviting(false);
    }
  }

  async function onRemove(u: SeatUser) {
    if (!token || !u.userId) return;
    setRemovingId(u.userId);
    try {
      await removeTeamMember(token, u.userId);
      toast(`${u.fullName || u.email || "Member"} removed`, "success");
      await refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Remove failed", "error");
    } finally {
      setRemovingId(null);
    }
  }

  async function onAddSeat() {
    if (!token) return;
    setAddingSeat(true);
    try {
      const out = await addSeat(token);
      if (out.url) window.open(out.url, "_blank");
      else toast("Seat added", "success");
      await refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to add seat", "error");
    } finally {
      setAddingSeat(false);
    }
  }

  return (
    <AppLayout>
      <div className="pageHeader">
        <div className="pageTitleGroup">
          <h1 className="pageTitle">{T("Team", "Équipe")}</h1>
          <p className="pageSubtitle">
            {seatsUsed} / {maxSeats} {T("seats used", "sièges utilisés")}
          </p>
        </div>
        <div className="row">
          <button className="btnRefresh" onClick={refresh} disabled={loading} title={T("Refresh", "Actualiser")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.5s ease", transform: loading ? "rotate(360deg)" : "none" }}>
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
          {isOwner && (
            <button
              className="btn primary"
              onClick={() => void onAddSeat()}
              disabled={addingSeat || atMaxSeats}
              title={atMaxSeats ? T("Maximum 15 seats reached", "Limite de 15 sièges atteinte") : undefined}
            >
              {atMaxSeats
                ? T("Seat limit reached", "Limite atteinte")
                : addingSeat ? T("Redirecting…", "Redirection…") : `+ ${T("Add seat", "Ajouter un siège")} — $19/mo`}
            </button>
          )}
        </div>
      </div>

      <div className="pageContent">

        {/* Stats KPI row */}
        <div className="agencyStatsGrid">
          <article className="card agencyStatKpi kpi-green">
            <span className="agencyStatKpiLabel">{T("Team members", "Membres")}</span>
            <span className="agencyStatKpiValue">{displayUsers.length}</span>
            <span className="agencyStatKpiSub">{seatsUsed} / {maxSeats} {T("seats active", "sièges actifs")}</span>
          </article>
          <article className="card agencyStatKpi">
            <span className="agencyStatKpiLabel">{T("Seats used", "Sièges utilisés")}</span>
            <span className="agencyStatKpiValue">{seatsUsed}</span>
            <span className="agencyStatKpiSub">{includedSeats} {T("included · max", "inclus · max")} {maxSeats}</span>
          </article>
          <article className="card agencyStatKpi kpi-orange">
            <span className="agencyStatKpiLabel">{T("Extra seats", "Sièges extra")}</span>
            <span className="agencyStatKpiValue">{extraSeats}</span>
            <span className="agencyStatKpiSub">{extraSeats > 0 ? `$${extraSeats * 19}/mo` : T("No extra cost", "Aucun surcoût")}</span>
          </article>
        </div>

        {/* Seats overview */}
        <article className="card" style={{ padding: "18px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{T("Seat usage", "Utilisation des sièges")}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {includedSeats} {T("seats included · extra at", "sièges inclus · extra à")} <strong>$19/seat/mo</strong>
                {" · "}+2 000 {T("scans/extra seat", "scans/siège extra")}
                {" · "}{T("max", "max")} {maxSeats} {T("seats", "sièges")}
              </div>
            </div>
            <span className={`badge ${seatPct >= 100 ? "bad" : seatPct >= 80 ? "warn" : "good"}`}>
              {seatsUsed} / {maxSeats} used
            </span>
          </div>

          <div className="meter" style={{ height: 8 }}>
            <span
              className={`tone-${seatPct >= 100 ? "bad" : seatPct >= 80 ? "warn" : "good"}`}
              style={{ width: `${seatPct}%` }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 8, fontFamily: "var(--mono)" }}>
            <span>{seatsUsed} {T("of", "sur")} {maxSeats} {T("max seats", "sièges max")}</span>
            {extraSeats > 0 && (
              <span style={{ color: "var(--warn, #b45309)", fontWeight: 700 }}>
                +{extraSeats} {T("extra", "extra")} · ${extraSeats * 19}/mo · +{extraSeats * 2000} {T("scans", "scans")}
              </span>
            )}
            {atMaxSeats
              ? <span style={{ color: "var(--danger, #ef4444)", fontWeight: 700 }}>{T("Max seats reached", "Limite atteinte")}</span>
              : <span>{seatsRemaining} {T("seat", "siège")}{seatsRemaining > 1 ? "s" : ""} {T("remaining", "restant(s)")}</span>
            }
          </div>
        </article>

        {/* Members list */}
        <article className="card">
          <div className="cardHeader">
            <span className="cardTitle">{T("Team members", "Membres de l'équipe")}</span>
            <span className="badge info">{displayUsers.length}</span>
          </div>
          <div className="cardBodyFlush">
            {displayUsers.length === 0 ? (
              <div className="emptyState">{T("No team members yet. Invite someone below.", "Aucun membre pour l'instant. Invitez quelqu'un ci-dessous.")}</div>
            ) : (
              displayUsers.map((u, i) => {
                const name = String(u.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || `Member ${i + 1}`);
                const isRemoving = removingId === u.userId;
                const isThisOwner = u.teamRole === "OWNER";
                return (
                  <div key={u.userId || i} className="agencyMemberRow">
                    <MemberAvatar name={name} />
                    <div className="agencyMemberInfo">
                      <div className="agencyMemberName">{name}</div>
                      <div className="agencyMemberEmail">{u.email || "—"}</div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                      {isThisOwner
                        ? <span className="badge good" style={{ fontSize: 10 }}>{T("Owner", "Propriétaire")}</span>
                        : <span className="badge info" style={{ fontSize: 10 }}>{T("Member", "Membre")}</span>
                      }
                      {isOwner && !isThisOwner && u.userId && (
                        <button
                          className="btn sm ghost"
                          style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}
                          onClick={() => void onRemove(u)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? T("Removing…", "Suppression…") : T("Remove", "Retirer")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        {/* Invite form */}
        <article className="card">
          <div className="cardHeader">
            <span className="cardTitle">{T("Invite a member", "Inviter un membre")}</span>
            {!canInvite && (
              <span className="badge bad">{T("Seat limit reached", "Limite de sièges atteinte")}</span>
            )}
          </div>
          <div className="cardBody">
            {canInvite ? (
              <form className="agencyInviteForm" onSubmit={(e) => void onInvite(e)}>
                <input
                  className="inputField"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button className="btn primary" type="submit" disabled={inviting || !inviteEmail.trim()}>
                  {inviting ? T("Sending…", "Envoi…") : T("Send invite", "Envoyer l'invitation")}
                </button>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p className="muted small">
                {T(
                  `Maximum ${maxSeats} seats reached. Contact us to upgrade to an Enterprise plan.`,
                  `Limite de ${maxSeats} sièges atteinte. Contactez-nous pour un plan Enterprise.`
                )}
              </p>
              </div>
            )}
            {inviteLink ? (
              <div className="infoBox" style={{ marginTop: 12, fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {T("This email has no account yet. Share this sign-up link:", "Cet email n'a pas encore de compte. Partagez ce lien d'inscription :")}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="inputField"
                    readOnly
                    value={inviteLink}
                    style={{ fontFamily: "var(--mono)", fontSize: 11, flex: 1 }}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className="btn sm"
                    onClick={() => { void navigator.clipboard.writeText(inviteLink); toast(T("Link copied", "Lien copié"), "success"); }}
                  >
                    Copy
                  </button>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  {T("Link valid for 7 days. Once they register, they join your team automatically.", "Lien valide 7 jours. Une fois inscrits, ils rejoignent votre équipe automatiquement.")}
                </div>
              </div>
            ) : (
              <div className="infoBox" style={{ marginTop: 12, fontSize: 12 }}>
                {T("If the member already has an account they are added directly. Otherwise you will get a sign-up link to share with them.", "Si le membre a déjà un compte, il est ajouté directement. Sinon, vous recevrez un lien d'inscription à partager.")}
              </div>
            )}
          </div>
        </article>

      </div>
    </AppLayout>
  );
}
