"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, registerUser } from "@/lib/api";
import { useSession } from "@/contexts/SessionContext";
import { AuthBrandPanel } from "@/components/AuthBrandPanel";

function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { token, setToken } = useSession();

  const inviteToken  = searchParams.get("invite") || "";
  const inviteEmail  = searchParams.get("email")  || "";

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState(inviteEmail);
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo,    setSentTo]    = useState("");

  const pwMismatch = confirm.length > 0 && confirm !== password;

  const canSubmit = useMemo(
    () => firstName.trim().length > 1 && lastName.trim().length > 1 && email.trim().length > 3 && password.length >= 8 && password === confirm,
    [firstName, lastName, email, password, confirm]
  );

  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  if (token) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError("");
    try {
      const out = await registerUser({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, ...(inviteToken ? { inviteToken } : {}) });
      if (out.emailSent) {
        setSentTo(email.trim());
        setEmailSent(true);
      } else if (out.token) {
        setToken(out.token);
        router.replace("/dashboard");
      }
    } catch (err) {
      setError(err instanceof ApiError ? `${err.code}: ${err.message}` : "REGISTER_FAILED");
    } finally {
      setBusy(false);
    }
  }

  if (emailSent) {
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

            <div className="authDoneContent">
              <svg className="authSuccessIcon" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="authSuccessCircle" cx="36" cy="36" r="32" stroke="#10b981" strokeWidth="3" fill="none" />
                <path className="authSuccessPath" d="M22 37l9 9 19-20" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <h1 className="authTitle" style={{ textAlign: "center" }}>Check your email</h1>
              <p className="authSubtitle" style={{ textAlign: "center" }}>
                We sent a confirmation link to <strong>{sentTo}</strong>. Click it to activate your account.
              </p>

              <div style={{ background: "var(--bg)", borderRadius: 10, padding: "16px 18px", margin: "20px 0", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--text)" }}>Didn&apos;t receive it?</strong><br />
                Check your spam folder. The link expires in <strong>24 hours</strong>.
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: "100%", marginBottom: 12 }}
                onClick={() => setEmailSent(false)}
              >
                Try with a different email
              </button>
              <Link href="/login" className="authLink" style={{ display: "block", textAlign: "center", fontSize: 13, color: "var(--muted)" }}>Back to login</Link>
            </div>
          </div>
        </div>
        <AuthBrandPanel variant="seo" dot={1} />
      </section>
    );
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

          <h1 className="authTitle">Create your account</h1>
          <p className="authSubtitle">
            {inviteToken ? "You've been invited to join an agency team." : "Start your free trial — no credit card required."}
          </p>

          <form onSubmit={(e) => void onSubmit(e)} className="formStack">
            <div className="fieldGrid">
              <div className="field">
                <label>First name</label>
                <input type="text" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
              </div>
              <div className="field">
                <label>Last name</label>
                <input type="text" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => !inviteToken && setEmail(e.target.value)}
                placeholder="you@company.com"
                readOnly={!!inviteToken}
                style={inviteToken ? { opacity: 0.65, cursor: "not-allowed" } : {}}
              />
              {inviteToken && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Email locked — set by your team admin.</div>}
            </div>

            <div className="field">
              <label>Password</label>
              <div className="pwWrap">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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

            <div className="field">
              <label>Confirm password</label>
              <div className="pwWrap">
                <input
                  type={showConf ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  style={pwMismatch ? { borderColor: "#ef4444" } : {}}
                />
                <button type="button" className="pwToggle" onClick={() => setShowConf(v => !v)} tabIndex={-1} aria-label={showConf ? "Hide password" : "Show password"}>
                  {showConf ? (
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
              {pwMismatch && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>Passwords don't match.</div>}
            </div>

            {error && <div className="errorBox">{error}</div>}

            <button type="submit" className="btn primary authSubmitBtn" disabled={!canSubmit || busy}>
              {busy ? "Creating account…" : "Create account"}
            </button>
            {!inviteToken && (
              <div className="authTrustRow">
                <span>✓ No credit card</span>
                <span>✓ 7-day free trial</span>
                <span>✓ Cancel anytime</span>
              </div>
            )}
          </form>

          <p className="muted small" style={{ marginTop: 20, textAlign: "center", fontSize: 13 }}>
            Already registered?{" "}
            <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <AuthBrandPanel variant="seo" dot={1} />
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
