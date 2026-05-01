"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

function decodeInviteToken(token: string): { email?: string; exp?: number } | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot < 1) return null;
    const payload = token.slice(0, dot);
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function InvitePage() {
  const params       = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const token        = params.token ?? "";
  const emailParam   = searchParams.get("email") ?? "";

  const [email,   setEmail]   = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const data = decodeInviteToken(token);
    if (!data) { setExpired(true); return; }
    if (data.exp && data.exp < Date.now()) { setExpired(true); return; }
    // Prefer query param email (URL-decoded), fall back to token payload
    setEmail(emailParam || data.email || "");
  }, [token, emailParam]);

  const registerHref = `/register?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  if (expired) {
    return (
      <section className="authShell">
        <div className="authCard">
          <div className="authLogo">
            <div className="authLogoIcon">SEO</div>
            <div className="authLogoText">seoprospector</div>
          </div>
          <h1 className="authTitle">Invite expired</h1>
          <p className="authSubtitle">
            This invite link is no longer valid. Ask your team admin to send a new one.
          </p>
          <p className="muted small" style={{ marginTop: 16 }}>
            Already have an account? <Link href="/login" style={{ color: "var(--brand)" }}>Sign in</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="authShell">
      <div className="authCard">
        <div className="authLogo">
          <div className="authLogoIcon">SEO</div>
          <div className="authLogoText">seoprospector</div>
        </div>

        <div style={{ textAlign: "center", margin: "8px 0 20px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 24,
          }}>
            ✉
          </div>
          <h1 className="authTitle" style={{ marginBottom: 8 }}>You&apos;ve been invited</h1>
          <p className="authSubtitle">
            You&apos;ve been invited to join a team on{" "}
            <strong style={{ color: "var(--brand)" }}>seoprospector</strong>.
          </p>
          {email && (
            <p className="muted small" style={{ marginTop: 8 }}>
              Invitation sent to <strong>{email}</strong>
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href={registerHref} className="btn primary" style={{ textAlign: "center" }}>
            Create account &amp; join team
          </Link>
          <p className="muted small" style={{ textAlign: "center", marginTop: 4 }}>
            Already registered?{" "}
            <Link href="/login" style={{ color: "var(--brand)" }}>Sign in instead</Link>
            {" "}— then ask your admin to re-invite.
          </p>
        </div>

        <div style={{
          marginTop: 24, padding: "12px 16px", borderRadius: 4,
          background: "var(--surface-soft, #f5f8ff)",
          border: "1px solid var(--line, #dbe4fa)",
          fontSize: 12, color: "var(--muted)",
          lineHeight: 1.6,
        }}>
          By accepting you&apos;ll join the agency workspace and share the team&apos;s monthly scan quota.
          Your account will be created with the email address above.
        </div>
      </div>
    </section>
  );
}
