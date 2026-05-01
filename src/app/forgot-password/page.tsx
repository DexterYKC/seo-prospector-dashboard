"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ApiError, forgotPassword } from "@/lib/api";
import { AuthBrandPanel } from "@/components/AuthBrandPanel";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [busy,  setBusy]      = useState(false);
  const [done,  setDone]      = useState(false);
  const [error, setError]     = useState("");

  const canSubmit = email.trim().length > 3 && email.includes("@");

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
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

          {done ? (
            <div className="authDoneContent">
              <svg className="authSuccessIcon" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="authSuccessCircle" cx="36" cy="36" r="32" stroke="#10b981" strokeWidth="3" fill="none" />
                <path className="authSuccessPath" d="M22 37l9 9 19-20" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h1 className="authTitle" style={{ textAlign: "center" }}>Check your email</h1>
              <p className="authSubtitle" style={{ textAlign: "center" }}>
                If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox and spam folder.
              </p>
              <p className="muted small" style={{ marginTop: 24, textAlign: "center", fontSize: 13 }}>
                <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Back to sign in</Link>
              </p>
            </div>
          ) : (
            <>
              <h1 className="authTitle">Forgot your password?</h1>
              <p className="authSubtitle">Enter your email and we&apos;ll send you a reset link.</p>

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

                {error && <div className="errorBox">{error}</div>}

                <button type="submit" className="btn primary authSubmitBtn" disabled={!canSubmit || busy}>
                  {busy ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className="muted small" style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>
                <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>

      <AuthBrandPanel variant="scan" dot={2} />
    </section>
  );
}
