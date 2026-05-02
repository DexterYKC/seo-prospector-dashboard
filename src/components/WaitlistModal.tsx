"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { joinWaitlist } from "@/lib/api";

const PLAN_LABELS: Record<string, string> = {
  STARTER: "Starter — $29/mo",
  PRO:     "Pro — $59/mo",
  AGENCY:  "Agency — $149/mo",
};

type Props = {
  plan: "STARTER" | "PRO" | "AGENCY";
  trigger?: string;
  className?: string;
};

export function WaitlistButton({ plan, trigger, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={className ?? "btn btn-secondary price-cta"}
        onClick={() => setOpen(true)}
      >
        {trigger ?? "Join waitlist"}
      </button>
      {open && <WaitlistModal plan={plan} onClose={() => setOpen(false)} />}
    </>
  );
}

function WaitlistModal({ plan, onClose }: { plan: "STARTER" | "PRO" | "AGENCY"; onClose: () => void }) {
  const [email,   setEmail]   = useState("");
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");
  const [mounted,  setMounted]  = useState(false);
  const [closing,  setClosing]  = useState(false);
  const ref = useRef<Element | null>(null);

  function smoothClose() {
    setClosing(true);
    setTimeout(onClose, 320);
  }

  useEffect(() => {
    ref.current = document.body;
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(smoothClose, 4000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await joinWaitlist({ email: email.trim(), name: name.trim() || undefined, plan });
      if (res.ok) {
        setDone(true);
      } else if (res.error === "ALREADY_ON_WAITLIST") {
        setError("This email is already on the waitlist for this plan.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <div className={`wl-overlay${closing ? " wl-overlay--closing" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) smoothClose(); }}>
      <div className={`wl-modal${closing ? " wl-modal--closing" : ""}`} role="dialog" aria-modal="true">
        <button className="wl-close" onClick={smoothClose} aria-label="Close">×</button>

        {done ? (
          <div className="wl-success">
            <div className="wl-success__check">✓</div>
            <h2>You&apos;re on the list.</h2>
            <p>We&apos;ll email you at <strong>{email}</strong> when {PLAN_LABELS[plan]} is available — with early access pricing.</p>
            <p className="wl-success__note">In the meantime, our Free plan is available now.</p>
            <a href="/register" className="btn btn-primary" style={{ marginTop: 8 }}>Start free trial</a>
          </div>
        ) : (
          <>
            <div className="wl-modal__header">
              <span className="wl-modal__plan-badge">{PLAN_LABELS[plan]}</span>
              <h2>Join the waitlist</h2>
              <p>Be first in line when this plan launches. You&apos;ll get early access and a locked-in price.</p>
            </div>

            <form onSubmit={handleSubmit} className="wl-form">
              <div className="wl-field">
                <label htmlFor="wl-name">Your name <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="wl-name"
                  type="text"
                  placeholder="Sophie Martin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="wl-field">
                <label htmlFor="wl-email">Email address</label>
                <input
                  id="wl-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {error && <p className="wl-error">{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Joining…" : "Join waitlist"}
              </button>
              <p className="wl-hint">No credit card. No commitment. We&apos;ll notify you by email.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );

  if (!mounted || !ref.current) return null;
  return createPortal(content, ref.current);
}
