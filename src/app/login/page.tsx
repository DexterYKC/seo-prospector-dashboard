"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, loginUser, moderatorLogin, supportAgentLogin } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";
import { AuthBrandPanel } from "@/components/AuthBrandPanel";

const MOD_TOKEN_KEY   = "mod_token";
const AGENT_TOKEN_KEY = "agent_token";

export default function LoginPage() {
  const router = useRouter();
  const { token, setToken } = useSession();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [busy,        setBusy]        = useState(false);
  const [error,       setError]       = useState("");
  const [verified,    setVerified]    = useState(false);

  useEffect(() => {
    setVerified(new URLSearchParams(window.location.search).get("verified") === "true");
  }, []);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length >= 8,
    [email, password]
  );

  useEffect(() => {
    if (token) {
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
    }
  }, [token, router]);

  if (token) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError("");
    try {
      const out = await loginUser({ email: email.trim(), password });
      setToken(out.token ?? null);
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/") ? next : "/dashboard");
      return;
    } catch (err) {
      if (err instanceof ApiError && (err.code === "INVALID_CREDENTIALS" || err.code === "USER_NOT_FOUND")) {
        try {
          const mod = await moderatorLogin(email.trim(), password);
          if (mod.token) {
            localStorage.setItem(MOD_TOKEN_KEY, mod.token);
            if (mod.moderator) localStorage.setItem("mod_info", JSON.stringify(mod.moderator));
            router.replace("/moderator");
            return;
          }
        } catch {}
        try {
          const ag = await supportAgentLogin(email.trim(), password);
          if (ag.token) {
            localStorage.setItem(AGENT_TOKEN_KEY, ag.token);
            if (ag.agent) localStorage.setItem("agent_info", JSON.stringify(ag.agent));
            router.replace("/support-agent");
            return;
          }
        } catch {}
      }
      setError("Email ou mot de passe incorrect.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="authShell">
      <div className="authFormSide">
        <div className="authCard">
          <div className="authLogo">
            <div className="authLogoIcon">
              <Image src="/favicon.svg" alt="Seoprospector" width={44} height={44} />
            </div>
            <div>
              <div className="authLogoText">seoprospector</div>
              <div className="authLogoSub">linkedin</div>
            </div>
          </div>

          {verified && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#15803d", display: "flex", gap: 8, alignItems: "center" }}>
              <span>✓</span> Email confirmed — you can now sign in.
            </div>
          )}
          <h1 className="authTitle">Welcome back</h1>
          <p className="authSubtitle">Sign in to your account to continue.</p>

          <form onSubmit={(e) => void onSubmit(e)} className="formStack">
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--brand)", fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <div className="pwWrap">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className="pwToggle" onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <div className="errorBox">{error}</div>}

            <button type="submit" className="btn primary authSubmitBtn" disabled={!canSubmit || busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="muted small" style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>
            No account?{" "}
            <Link href="/register" style={{ color: "var(--brand)", fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>

      <AuthBrandPanel variant="leads" dot={0} />
    </section>
  );
}
