"use client";

import { useSession } from "@/contexts/SessionContext";

export function NavAuthButtons() {
  const { token } = useSession();

  if (token) {
    return (
      <div className="nav-actions">
        <a href="/dashboard" className="btn btn-primary nav-auth">Dashboard</a>
      </div>
    );
  }

  return (
    <div className="nav-actions">
      <a href="/login" className="btn btn-ghost nav-auth" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        Sign in
      </a>
    </div>
  );
}
