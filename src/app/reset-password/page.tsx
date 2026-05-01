"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, resetPassword } from "@/lib/api";
import { AuthBrandPanel } from "@/components/AuthBrandPanel";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hashReady,   setHashReady]   = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const type  = params.get("type");
    const token = params.get("access_token");
    if (type === "recovery" && token) {
      setAccessToken(token);
    }
    setHashReady(true);
  }, []);

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [busy,     setBusy]     = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState("");

  const canSubmit = useMemo(
    () => !!accessToken && password.length >= 8 && password === confirm,
    [accessToken, password, confirm]
  );

  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!canSubmit || !accessToken || busy) return;
    setBusy(true);
    setError("");
    try {
      await resetPassword(accessToken, password);
      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "This reset link is invalid or expired."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!hashReady) return null;

  return (
    <section className="authShell">
      <div className="authFormSide">
        <div className="authCard">
          <div className="authLogo">
            <div className="authLogoIcon">
              <Image src="/favicon.svg" alt="seoprospector" width={36} height={36} />
            </div>
            <div className="authLogoText">seoprospector</div>
          </div>

          {!accessToken ? (
            <>
              <h1 className="authTitle">Invalid link</h1>
              <p className="authSubtitle">This reset link is missing or expired.</p>
              <p className="muted small" style={{ marginTop: 20, fontSize: 13 }}>
                <Link href="/forgot-password" style={{ color: "var(--brand)", fontWeight: 600 }}>Request a new link</Link>
              </p>
            </>
          ) : done ? (
            <>
              <h1 className="authTitle">Password updated</h1>
              <p className="authSubtitle">Your password has been reset. Redirecting to sign in…</p>
            </>
          ) : (
            <>
              <h1 className="authTitle">Set new password</h1>
              <p className="authSubtitle">Choose a strong password for your account.</p>

              <form onSubmit={(e) => void onSubmit(e)} className="formStack">
                <div className="field">
                  <label>New password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                  />
                </div>

                <div className="field">
                  <label>Confirm password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    style={mismatch ? { borderColor: "var(--danger, #ef4444)" } : {}}
                  />
                  {mismatch && (
                    <div style={{ fontSize: 12, color: "var(--danger, #ef4444)", marginTop: 2 }}>
                      Passwords don&apos;t match
                    </div>
                  )}
                </div>

                {error && <div className="errorBox">{error}</div>}

                <button type="submit" className="btn primary" disabled={!canSubmit || busy} style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15, fontWeight: 700 }}>
                  {busy ? "Updating…" : "Update password"}
                </button>
              </form>

              <p className="muted small" style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>
                <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>

      <AuthBrandPanel variant="reset" dot={2} />
    </section>
  );
}
